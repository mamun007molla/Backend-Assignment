import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ControllerCommand } from "@/models/ControllerCommand";
import { Junction } from "@/models/Junction";
import { createAuditLog } from "@/services/auditService";
import { createControllerCommand } from "@/services/controllerService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // =========================
    // VALIDATION
    // =========================

    if (!body.command_id && !body.junction_id) {
      return NextResponse.json(
        {
          message: "command_id or junction_id is required",
        },
        { status: 400 },
      );
    }

    if (!body.status) {
      return NextResponse.json(
        {
          message: "status is required",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const status = String(body.status).trim().toUpperCase();

    // =========================
    // CONTROLLER RECONNECTED
    // =========================

    if (status === "RECONNECTED") {
      if (!body.junction_id) {
        return NextResponse.json(
          {
            message: "junction_id is required for controller reconnect",
          },
          { status: 400 },
        );
      }

      const junction = await Junction.findOne({
        junctionId: body.junction_id,
      });

      if (!junction) {
        return NextResponse.json(
          {
            message: "Junction not found",
          },
          { status: 404 },
        );
      }

      if (!body.actualSignals) {
        return NextResponse.json(
          {
            message: "actualSignals are required when controller reconnects",
          },
          { status: 400 },
        );
      }

      const actualSignals = {
        NORTH: body.actualSignals.NORTH,
        SOUTH: body.actualSignals.SOUTH,
        EAST: body.actualSignals.EAST,
        WEST: body.actualSignals.WEST,
      };

      if (
        !actualSignals.NORTH ||
        !actualSignals.SOUTH ||
        !actualSignals.EAST ||
        !actualSignals.WEST
      ) {
        return NextResponse.json(
          {
            message: "All actual signal states are required",
          },
          { status: 400 },
        );
      }

      junction.actualSignals = actualSignals;
      junction.controllerStatus = "ONLINE";

      await junction.save();

      const signalsMatch =
        junction.actualSignals.NORTH === junction.desiredSignals.NORTH &&
        junction.actualSignals.SOUTH === junction.desiredSignals.SOUTH &&
        junction.actualSignals.EAST === junction.desiredSignals.EAST &&
        junction.actualSignals.WEST === junction.desiredSignals.WEST;

      // If physical state does not match desired state,
      // create a new command to reconcile the controller.
      let reconciliationCommand = null;

      if (!signalsMatch) {
        reconciliationCommand = await createControllerCommand(
          junction.junctionId,
        );
      }

      await createAuditLog(
        junction.junctionId,
        "CONTROLLER_RECONNECTED",
        signalsMatch
          ? "Controller reconnected and physical state matches desired state"
          : "Controller reconnected and a reconciliation command was created",
        {
          actualSignals: junction.actualSignals,
          desiredSignals: junction.desiredSignals,
          reconciled: signalsMatch,
          reconciliationCommandId: reconciliationCommand?.command_id ?? null,
        },
      );

      return NextResponse.json(
        {
          message: "Controller reconnect processed",
          reconciled: signalsMatch,
          reconciliationCommand,
          junction,
        },
        { status: 200 },
      );
    }

    // =========================
    // COMMAND EVENT
    // =========================

    if (!body.command_id) {
      return NextResponse.json(
        {
          message: "command_id is required for command events",
        },
        { status: 400 },
      );
    }

    const command = await ControllerCommand.findOne({
      command_id: body.command_id,
    });

    if (!command) {
      return NextResponse.json(
        {
          message: "Controller command not found",
          command_id: body.command_id,
        },
        { status: 404 },
      );
    }

    // =========================
    // VALID STATUS
    // =========================

    if (status !== "ACKNOWLEDGED" && status !== "FAILED") {
      return NextResponse.json(
        {
          message: "Invalid controller status",
          receivedStatus: body.status,
          allowedStatuses: ["ACKNOWLEDGED", "FAILED", "RECONNECTED"],
        },
        { status: 400 },
      );
    }

    // Prevent duplicate status events.
    if (command.status === status) {
      return NextResponse.json(
        {
          message: `Command already has status ${status}`,
          command,
        },
        { status: 409 },
      );
    }

    // A completed command cannot change
    // to another terminal state.
    if (command.status === "ACKNOWLEDGED" || command.status === "FAILED") {
      return NextResponse.json(
        {
          message: `Command has already been completed with status ${command.status}`,
          currentStatus: command.status,
          command_id: command.command_id,
        },
        { status: 409 },
      );
    }

    // =========================
    // ACKNOWLEDGED
    // =========================

    if (status === "ACKNOWLEDGED") {
      const junction = await Junction.findOne({
        junctionId: command.junction_id,
      });

      if (!junction) {
        return NextResponse.json(
          {
            message: "Junction not found",
          },
          { status: 404 },
        );
      }

      // Controller reports its actual
      // physical signal state.
      if (body.actualSignals) {
        junction.actualSignals = {
          NORTH: body.actualSignals.NORTH,
          SOUTH: body.actualSignals.SOUTH,
          EAST: body.actualSignals.EAST,
          WEST: body.actualSignals.WEST,
        };
      } else {
        junction.actualSignals = {
          NORTH: command.desiredSignals.NORTH,
          SOUTH: command.desiredSignals.SOUTH,
          EAST: command.desiredSignals.EAST,
          WEST: command.desiredSignals.WEST,
        };
      }

      junction.controllerStatus = "ONLINE";

      await junction.save();

      command.status = "ACKNOWLEDGED";
      command.acknowledgedAt = new Date();

      await command.save();

      await createAuditLog(
        command.junction_id,
        "CONTROLLER_ACKNOWLEDGED",
        `Controller acknowledged command ${command.command_id}`,
        {
          command_id: command.command_id,
          actualSignals: junction.actualSignals,
        },
      );

      return NextResponse.json(
        {
          message: "Controller ACK processed",
          command,
          junction,
        },
        { status: 200 },
      );
    }

    // =========================
    // FAILED
    // =========================

    if (status === "FAILED") {
      command.status = "FAILED";

      command.errorMessage = body.errorMessage || "Controller command failed";

      await command.save();

      await createAuditLog(
        command.junction_id,
        "CONTROLLER_FAILED",
        `Controller command ${command.command_id} failed`,
        {
          command_id: command.command_id,
          errorMessage: command.errorMessage,
        },
      );

      const junction = await Junction.findOneAndUpdate(
        {
          junctionId: command.junction_id,
        },
        {
          $set: {
            controllerStatus: "OFFLINE",
            mode: "FAILURE",
          },
        },
        {
          new: true,
        },
      );

      return NextResponse.json(
        {
          message: "Controller failure processed",
          command,
          junction,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to process controller event",
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("CONTROLLER EVENT ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to process controller event",
      },
      { status: 500 },
    );
  }
}
