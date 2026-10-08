import { Junction } from "@/models/Junction";
import { SensorEvent } from "@/models/SensorEvent";
import { runAutomaticControl } from "./automaticService";
import { handleEmergency } from "./emergencyService";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type SensorEventInput = {
  event_id: string;
  junction_id: string;
  direction: Direction;
  event_type: "VEHICLE_ARRIVED" | "VEHICLE_CLEARED";
  vehicle_type: "FORKLIFT" | "TRUCK" | "EMPLOYEE_VEHICLE" | "EMERGENCY";
  timestamp: string;
};

export async function processSensorEvent(body: SensorEventInput) {
  // --------------------------------
  // 1. Check junction
  // --------------------------------

  const junction = await Junction.findOne({
    junctionId: body.junction_id,
  });

  if (!junction) {
    throw new Error("JUNCTION_NOT_FOUND");
  }

  // --------------------------------
  // 2. Duplicate check
  // --------------------------------

  const existingEvent = await SensorEvent.findOne({
    event_id: body.event_id,
  });

  if (existingEvent) {
    throw new Error("DUPLICATE_EVENT");
  }

  // --------------------------------
  // 3. Calculate queue change
  // --------------------------------

  const change = body.event_type === "VEHICLE_ARRIVED" ? 1 : -1;

  // --------------------------------
  // 4. Prevent negative queue
  // --------------------------------

  const currentQueue = junction.queues[body.direction];

  if (change === -1 && currentQueue <= 0) {
    throw new Error("QUEUE_ALREADY_ZERO");
  }

  // --------------------------------
  // 5. Save sensor event
  // --------------------------------

  const event = await SensorEvent.create({
    event_id: body.event_id,
    junction_id: body.junction_id,
    direction: body.direction,
    event_type: body.event_type,
    vehicle_type: body.vehicle_type,
    timestamp: body.timestamp,
  });

  // --------------------------------
  // 6. Update queue
  // --------------------------------

  junction.queues[body.direction] += change;

  await junction.save();

  // --------------------------------
  // 7. Emergency handling
  // --------------------------------

  let updatedJunction;

  if (
    body.event_type === "VEHICLE_ARRIVED" &&
    body.vehicle_type === "EMERGENCY"
  ) {
    updatedJunction = await handleEmergency(body.junction_id, body.direction);
  } else {
    // --------------------------------
    // 8. Normal automatic scheduling
    // --------------------------------

    updatedJunction = await runAutomaticControl(body.junction_id);
  }

  return {
    event,
    junction: updatedJunction,
  };
}
