import { IJunction } from "@/models/Junction";
import { createControllerCommand } from "./controllerService";

type Phase = "NORTH_SOUTH" | "EAST_WEST";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

const PHASE_DIRECTIONS: Record<Phase, Direction[]> = {
  NORTH_SOUTH: ["NORTH", "SOUTH"],
  EAST_WEST: ["EAST", "WEST"],
};

const ALL_DIRECTIONS: Direction[] = ["NORTH", "SOUTH", "EAST", "WEST"];

export async function transitionToPhase(junction: IJunction, nextPhase: Phase) {
  const currentPhase = junction.phase as Phase;

  // Even when the phase does not change,
  // send the desired state to the controller.

  if (currentPhase === nextPhase) {
    await createControllerCommand(junction.junctionId);

    return junction;
  }

  const currentDirections = PHASE_DIRECTIONS[currentPhase];

  const nextDirections = PHASE_DIRECTIONS[nextPhase];

  // Safety transition:
  // GREEN → YELLOW

  for (const direction of currentDirections) {
    junction.desiredSignals[direction] = "YELLOW";
  }

  await junction.save();

  // Safety transition:
  // YELLOW → ALL_RED

  for (const direction of ALL_DIRECTIONS) {
    junction.desiredSignals[direction] = "RED";
  }

  await junction.save();

  // Update the logical phase only
  // after all signals are RED.

  junction.phase = nextPhase;

  await junction.save();

  // Activate the new phase.

  for (const direction of nextDirections) {
    junction.desiredSignals[direction] = "GREEN";
  }

  await junction.save();

  // Send the final desired state
  // to the physical controller.

  await createControllerCommand(junction.junctionId);

  return junction;
}
