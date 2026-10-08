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

export async function handleManualCommand(
  junctionId: string,
  command: string,
  direction?: Direction,
) {
  const normalizedCommand = command.trim().toUpperCase().replace(/\s+/g, "_");

  const junction = await Junction.findOne({
    junctionId,
  });

  if (!junction) {
    throw new Error("JUNCTION_NOT_FOUND");
  }

  // =========================
  // RETURN TO AUTOMATIC
  // =========================

  if (normalizedCommand === "RETURN_TO_AUTOMATIC") {
    // Controller must be online before
    // returning to automatic mode.

    if (junction.controllerStatus !== "ONLINE") {
      throw new Error("CONTROLLER_OFFLINE");
    }

    // Physical controller state must
    // match the desired state before
    // recovery is allowed.

    const signalsMatch =
      junction.actualSignals.NORTH === junction.desiredSignals.NORTH &&
      junction.actualSignals.SOUTH === junction.desiredSignals.SOUTH &&
      junction.actualSignals.EAST === junction.desiredSignals.EAST &&
      junction.actualSignals.WEST === junction.desiredSignals.WEST;

    if (!signalsMatch) {
      throw new Error("CONTROLLER_STATE_NOT_RECONCILED");
    }

    junction.mode = "AUTOMATIC";

    await junction.save();

    await createAuditLog(
      junctionId,
      "MODE_CHANGE",
      "Junction returned to automatic mode after controller recovery",
      {
        mode: "AUTOMATIC",
        controllerStatus: junction.controllerStatus,
      },
    );

    return junction;
  }

  // =========================
  // MANUAL GREEN REQUEST
  // =========================

  if (normalizedCommand === "MANUAL_GREEN_REQUEST") {
    if (!direction) {
      throw new Error("DIRECTION_REQUIRED");
    }

    // Manual control is blocked during
    // failure or emergency mode.

    if (junction.mode === "FAILURE" || junction.mode === "EMERGENCY") {
      throw new Error("MANUAL_COMMAND_NOT_ALLOWED_IN_CURRENT_MODE");
    }

    const phase = getPhaseForDirection(direction);

    // All signal changes must go through
    // the safe transition logic.

    const updatedJunction = await transitionToPhase(junction, phase);

    updatedJunction.mode = "MANUAL";

    await updatedJunction.save();

    await createAuditLog(
      junctionId,
      "MANUAL_COMMAND",
      `Manual green requested for ${direction}`,
      {
        command: normalizedCommand,
        direction,
        phase,
      },
    );

    return updatedJunction;
  }

  throw new Error("INVALID_COMMAND");
}
