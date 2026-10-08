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

  // Automatic mode ছাড়া automatic scheduler চলবে না
  if (junction.mode !== "AUTOMATIC") {
    return junction;
  }

  const nextPhase = selectNextPhase(junction);

  // Already correct phase
  if (nextPhase === junction.phase) {
    return junction;
  }

  const updatedJunction = await transitionToPhase(junction, nextPhase);

  return updatedJunction;
}
