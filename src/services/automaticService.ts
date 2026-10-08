import { Junction } from "@/models/Junction";
import { selectNextPhase } from "./schedulerService";
import { transitionToPhase } from "./signalService";

export async function runAutomaticControl(junctionId: string) {
  const junction = await Junction.findOne({
    junctionId,
  });

  if (!junction) {
    throw new Error("JUNCTION_NOT_FOUND");
  }

  // Automatic scheduling only runs
  // when the junction is in automatic mode.

  if (junction.mode !== "AUTOMATIC") {
    return junction;
  }

  const nextPhase = await selectNextPhase(junction);

  // No transition is needed when
  // the current phase is already optimal.

  if (nextPhase === junction.phase) {
    return junction;
  }

  return await transitionToPhase(junction, nextPhase);
}
