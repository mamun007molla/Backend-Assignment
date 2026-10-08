import { Junction } from "@/models/Junction";
import { transitionToPhase } from "./signalService";

type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

function getPhaseForDirection(direction: Direction) {
  if (direction === "NORTH" || direction === "SOUTH") {
    return "NORTH_SOUTH" as const;
  }

  return "EAST_WEST" as const;
}

export async function handleManualCommand(
  junctionId: string,
  command: string,
  direction?: Direction,
) {
  console.log("========== MANUAL SERVICE ==========");
  console.log("JUNCTION:", junctionId);
  console.log("COMMAND RECEIVED:", command);
  console.log("DIRECTION:", direction);

  const normalizedCommand = command.trim().toUpperCase().replace(/\s+/g, "_");

  console.log("NORMALIZED COMMAND:", normalizedCommand);

  const junction = await Junction.findOne({
    junctionId,
  });

  if (!junction) {
    console.log("JUNCTION NOT FOUND");
    throw new Error("JUNCTION_NOT_FOUND");
  }

  console.log("CURRENT MODE:", junction.mode);
  console.log("CURRENT PHASE:", junction.phase);

  // =========================
  // RETURN TO AUTOMATIC
  // =========================

  if (normalizedCommand === "RETURN_TO_AUTOMATIC") {
    console.log(">>> RETURNING TO AUTOMATIC");

    junction.mode = "AUTOMATIC";

    await junction.save();

    console.log("NEW MODE:", junction.mode);

    return junction;
  }

  // =========================
  // MANUAL GREEN REQUEST
  // =========================

  if (normalizedCommand === "MANUAL_GREEN_REQUEST") {
    if (!direction) {
      throw new Error("DIRECTION_REQUIRED");
    }

    console.log(">>> MANUAL GREEN REQUEST");

    const phase = getPhaseForDirection(direction);

    console.log("TARGET PHASE:", phase);

    const updatedJunction = await transitionToPhase(junction, phase);

    updatedJunction.mode = "MANUAL";

    await updatedJunction.save();

    console.log("FINAL MODE:", updatedJunction.mode);

    console.log("FINAL PHASE:", updatedJunction.phase);

    return updatedJunction;
  }

  console.log(">>> INVALID COMMAND");

  throw new Error("INVALID_COMMAND");
}
