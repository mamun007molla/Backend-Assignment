import { IJunction } from "@/models/Junction";
import { SensorEvent } from "@/models/SensorEvent";

type Phase = "NORTH_SOUTH" | "EAST_WEST";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

type VehicleType = "EMERGENCY" | "TRUCK" | "FORKLIFT" | "EMPLOYEE_VEHICLE";

const VEHICLE_PRIORITY: Record<VehicleType, number> = {
  EMERGENCY: 100,
  TRUCK: 50,
  FORKLIFT: 30,
  EMPLOYEE_VEHICLE: 10,
};

function getPhaseForDirection(direction: Direction): Phase {
  if (direction === "NORTH" || direction === "SOUTH") {
    return "NORTH_SOUTH";
  }

  return "EAST_WEST";
}

function getWaitingBonus(timestamp: Date): number {
  const waitingSeconds = Math.max(0, (Date.now() - timestamp.getTime()) / 1000);

  // Every 10 seconds of waiting
  // adds 1 point.
  return Math.floor(waitingSeconds / 10);
}

export async function selectNextPhase(junction: IJunction): Promise<Phase> {
  const events = await SensorEvent.find({
    junction_id: junction.junctionId,
  }).sort({
    timestamp: 1,
  });

  const clearedVehicles = new Set<string>();

  for (const event of events) {
    if (event.event_type === "VEHICLE_CLEARED") {
      clearedVehicles.add(event.vehicle_id);
    }
  }

  // Only vehicles that have arrived
  // and have not been cleared are
  // considered active.

  const activeEvents = events.filter(
    (event) =>
      event.event_type === "VEHICLE_ARRIVED" &&
      !clearedVehicles.has(event.vehicle_id),
  );

  const phaseScores: Record<Phase, number> = {
    NORTH_SOUTH: 0,
    EAST_WEST: 0,
  };

  for (const event of activeEvents) {
    const phase = getPhaseForDirection(event.direction as Direction);

    const priority = VEHICLE_PRIORITY[event.vehicle_type as VehicleType] ?? 0;

    const waitingBonus = getWaitingBonus(event.timestamp);

    phaseScores[phase] += priority + waitingBonus;
  }

  // Queue size contributes to the
  // priority of each phase.

  phaseScores.NORTH_SOUTH +=
    (junction.queues.NORTH + junction.queues.SOUTH) * 10;

  phaseScores.EAST_WEST += (junction.queues.EAST + junction.queues.WEST) * 10;

  // Keep the current phase when
  // there is no traffic.

  if (phaseScores.NORTH_SOUTH === 0 && phaseScores.EAST_WEST === 0) {
    return junction.phase as Phase;
  }

  if (phaseScores.NORTH_SOUTH > phaseScores.EAST_WEST) {
    return "NORTH_SOUTH";
  }

  if (phaseScores.EAST_WEST > phaseScores.NORTH_SOUTH) {
    return "EAST_WEST";
  }

  // Keep the current phase when both
  // phases have the same score.

  return junction.phase as Phase;
}
