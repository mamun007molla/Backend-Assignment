import { Junction } from "@/models/Junction";

type Phase = "NORTH_SOUTH" | "EAST_WEST";
type Signal = "RED" | "YELLOW" | "GREEN";

const PHASE_DIRECTIONS = {
  NORTH_SOUTH: ["NORTH", "SOUTH"],
  EAST_WEST: ["EAST", "WEST"],
} as const;

export async function transitionToPhase(
  junction: InstanceType<typeof Junction>,
  nextPhase: Phase,
) {
  const currentPhase = junction.phase as Phase;

  // Already in requested phase
  if (currentPhase === nextPhase) {
    return junction;
  }

  const currentDirections = PHASE_DIRECTIONS[currentPhase];
  const nextDirections = PHASE_DIRECTIONS[nextPhase];

  // 1. Current GREEN → YELLOW
  for (const direction of currentDirections) {
    junction.desiredSignals[direction] = "YELLOW";
  }

  await junction.save();

  // 2. All directions → RED
  for (const direction of ["NORTH", "SOUTH", "EAST", "WEST"] as const) {
    junction.desiredSignals[direction] = "RED";
  }

  junction.phase = nextPhase;

  await junction.save();

  // 3. New phase → GREEN
  for (const direction of nextDirections) {
    junction.desiredSignals[direction] = "GREEN";
  }

  await junction.save();

  return junction;
}
