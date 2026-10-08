import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ControllerCommand } from "@/models/ControllerCommand";
import { Junction } from "@/models/Junction";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("CONTROLLER EVENT BODY:", body);

    if (!body.command_id) {
      return NextResponse.json(
        {
          message: "command_id is required",
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
        message: "Invalid controller status",
        receivedStatus: body.status,
        allowedStatuses: ["ACKNOWLEDGED", "FAILED"],
      },
      { status: 400 },
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
