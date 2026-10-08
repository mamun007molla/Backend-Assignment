import { IJunction } from "@/models/Junction";

type Phase = "NORTH_SOUTH" | "EAST_WEST";

export function selectNextPhase(junction: IJunction): Phase {
  const northSouthQueue = junction.queues.NORTH + junction.queues.SOUTH;

  const eastWestQueue = junction.queues.EAST + junction.queues.WEST;

  if (northSouthQueue === 0 && eastWestQueue === 0) {
    return junction.phase as Phase;
  }

  if (northSouthQueue > eastWestQueue) {
    return "NORTH_SOUTH";
  }

  if (eastWestQueue > northSouthQueue) {
    return "EAST_WEST";
  }

  // Equal queues → keep current phase
  return junction.phase as Phase;
}
