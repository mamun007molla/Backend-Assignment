import { randomUUID } from "crypto";
import { ControllerCommand } from "@/models/ControllerCommand";
import { Junction } from "@/models/Junction";

export async function createControllerCommand(junctionId: string) {
  const junction = await Junction.findOne({
    junctionId,
  });

  if (!junction) {
    throw new Error("JUNCTION_NOT_FOUND");
  }

  const command = await ControllerCommand.create({
    command_id: randomUUID(),

    junction_id: junctionId,

    desiredSignals: {
      NORTH: junction.desiredSignals.NORTH,
      SOUTH: junction.desiredSignals.SOUTH,
      EAST: junction.desiredSignals.EAST,
      WEST: junction.desiredSignals.WEST,
    },

    status: "PENDING",
  });

  console.log("CONTROLLER COMMAND CREATED:", command.command_id);

  return command;
}
