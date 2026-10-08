import { Junction } from "@/models/Junction";
import { transitionToPhase } from "./signalService";
import { createAuditLog } from "./auditService";

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

  // Emergency mode prevents normal
  // automatic/manual control from
  // overriding the emergency state.

  junction.mode = "EMERGENCY";

  await junction.save();

  const emergencyPhase = getPhaseForDirection(direction);

  // Emergency requests must use the
  // same safe phase transition logic.

  const updatedJunction = await transitionToPhase(junction, emergencyPhase);

  await createAuditLog(
    junctionId,
    "EMERGENCY",
    `Emergency vehicle detected from ${direction}`,
    {
      direction,
      phase: emergencyPhase,
    },
  );

  return updatedJunction;
}
