import { Junction } from "@/models/Junction";
import { SensorEvent } from "@/models/SensorEvent";
import { runAutomaticControl } from "./automaticService";
import { handleEmergency } from "./emergencyService";
import { createAuditLog } from "./auditService";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type SensorEventInput = {
  event_id: string;
  vehicle_id: string;
  junction_id: string;
  direction: Direction;
  event_type: "VEHICLE_ARRIVED" | "VEHICLE_CLEARED";
  vehicle_type: "FORKLIFT" | "TRUCK" | "EMPLOYEE_VEHICLE" | "EMERGENCY";
  timestamp: string;
};

export async function processSensorEvent(body: SensorEventInput) {
  const junction = await Junction.findOne({
    junctionId: body.junction_id,
  });

  if (!junction) {
    throw new Error("JUNCTION_NOT_FOUND");
  }

  // event_id provides idempotency for
  // duplicate sensor events.

  const existingEvent = await SensorEvent.findOne({
    event_id: body.event_id,
  });

  if (existingEvent) {
    throw new Error("DUPLICATE_EVENT");
  }

  // A vehicle must have an arrival
  // event before it can be cleared.

  if (body.event_type === "VEHICLE_CLEARED") {
    const arrivalEvent = await SensorEvent.findOne({
      vehicle_id: body.vehicle_id,
      junction_id: body.junction_id,
      event_type: "VEHICLE_ARRIVED",
    });

    if (!arrivalEvent) {
      throw new Error("VEHICLE_NOT_FOUND");
    }

    const alreadyCleared = await SensorEvent.findOne({
      vehicle_id: body.vehicle_id,
      junction_id: body.junction_id,
      event_type: "VEHICLE_CLEARED",
    });

    if (alreadyCleared) {
      throw new Error("VEHICLE_ALREADY_CLEARED");
    }
  }

  const change = body.event_type === "VEHICLE_ARRIVED" ? 1 : -1;

  const currentQueue = junction.queues[body.direction];

  // Queue values must never become
  // negative.

  if (change === -1 && currentQueue <= 0) {
    throw new Error("QUEUE_ALREADY_ZERO");
  }

  const event = await SensorEvent.create({
    event_id: body.event_id,
    vehicle_id: body.vehicle_id,
    junction_id: body.junction_id,
    direction: body.direction,
    event_type: body.event_type,
    vehicle_type: body.vehicle_type,
    timestamp: body.timestamp,
  });

  junction.queues[body.direction] += change;

  await junction.save();

  await createAuditLog(
    body.junction_id,
    "SENSOR_EVENT",
    `${body.event_type} from ${body.direction}`,
    {
      event_id: body.event_id,
      vehicle_id: body.vehicle_id,
      direction: body.direction,
      vehicle_type: body.vehicle_type,
      timestamp: body.timestamp,
    },
  );

  let updatedJunction;

  // Emergency vehicles trigger
  // emergency preemption.

  if (
    body.event_type === "VEHICLE_ARRIVED" &&
    body.vehicle_type === "EMERGENCY"
  ) {
    updatedJunction = await handleEmergency(body.junction_id, body.direction);
  } else {
    // Normal sensor events trigger
    // automatic scheduling.

    updatedJunction = await runAutomaticControl(body.junction_id);
  }

  return {
    event,
    junction: updatedJunction,
  };
}
