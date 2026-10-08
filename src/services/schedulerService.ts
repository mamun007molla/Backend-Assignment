import { IJunction } from "@/models/Junction";

type Phase = "NORTH_SOUTH" | "EAST_WEST";

export function selectNextPhase(junction: IJunction): Phase {
  const northSouthQueue = junction.queues.NORTH + junction.queues.SOUTH;

  const eastWestQueue = junction.queues.EAST + junction.queues.WEST;

  // No traffic → keep current phase
  if (northSouthQueue === 0 && eastWestQueue === 0) {
    return junction.phase as Phase;
  }

  // More traffic on North/South
  if (northSouthQueue > eastWestQueue) {
    return "NORTH_SOUTH";
  }

  // More traffic on East/West
  if (eastWestQueue > northSouthQueue) {
    return "EAST_WEST";
  }

  // Equal traffic → keep current phase
  return junction.phase as Phase;
}
