import { IJunction } from "@/models/Junction";
import { createControllerCommand } from "./controllerService";

type Phase = "NORTH_SOUTH" | "EAST_WEST";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

const PHASE_DIRECTIONS: Record<Phase, Direction[]> = {
  NORTH_SOUTH: ["NORTH", "SOUTH"],
  EAST_WEST: ["EAST", "WEST"],
};

export async function transitionToPhase(junction: IJunction, nextPhase: Phase) {
  const currentPhase = junction.phase as Phase;

  // Same phase হলেও controller-কে desired state পাঠাতে হবে
  if (currentPhase === nextPhase) {
    await createControllerCommand(junction.junctionId);

    return junction;
  }

  const currentDirections = PHASE_DIRECTIONS[currentPhase];

  const nextDirections = PHASE_DIRECTIONS[nextPhase];

  // 1. GREEN → YELLOW
  for (const direction of currentDirections) {
    junction.desiredSignals[direction] = "YELLOW";
  }

  await junction.save();

  // 2. ALL RED
  const allDirections: Direction[] = ["NORTH", "SOUTH", "EAST", "WEST"];

  for (const direction of allDirections) {
    junction.desiredSignals[direction] = "RED";
  }

  await junction.save();

  // 3. Update phase
  junction.phase = nextPhase;

  await junction.save();

  // 4. New phase → GREEN
  for (const direction of nextDirections) {
    junction.desiredSignals[direction] = "GREEN";
  }

  await junction.save();

  // 5. Send command to controller
  await createControllerCommand(junction.junctionId);

  return junction;
}
