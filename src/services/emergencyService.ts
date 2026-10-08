import { Junction } from "@/models/Junction";
import { transitionToPhase } from "./signalService";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

function getPhaseForDirection(direction: Direction) {
  if (direction === "NORTH" || direction === "SOUTH") {
    return "NORTH_SOUTH" as const;
  }

  return "EAST_WEST" as const;
}

export async function handleEmergency(
  junctionId: string,
  direction: Direction,
) {
  const junction = await Junction.findOne({
    junctionId,
  });

  if (!junction) {
    throw new Error("JUNCTION_NOT_FOUND");
  }

  // Enter emergency mode
  junction.mode = "EMERGENCY";

  await junction.save();

  const emergencyPhase = getPhaseForDirection(direction);

  // Safe transition
  const updatedJunction = await transitionToPhase(junction, emergencyPhase);

  return updatedJunction;
}
