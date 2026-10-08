import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { handleManualCommand } from "@/services/manualService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await request.json();

    // =========================
    // VALIDATION
    // =========================

    if (!body.command) {
      return NextResponse.json(
        {
          message: "Command is required",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // =========================
    // HANDLE COMMAND
    // =========================

    const junction = await handleManualCommand(
      id,
      body.command,
      body.direction,
    );

    return NextResponse.json(
      {
        message: "Command executed successfully",
        junction,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("COMMAND ERROR:", error);

    if (error instanceof Error) {
      // =========================
      // JUNCTION NOT FOUND
      // =========================

      if (error.message === "JUNCTION_NOT_FOUND") {
        return NextResponse.json(
          {
            message: "Junction not found",
          },
          { status: 404 },
        );
      }

      // =========================
      // DIRECTION REQUIRED
      // =========================

      if (error.message === "DIRECTION_REQUIRED") {
        return NextResponse.json(
          {
            message: "Direction is required",
          },
          { status: 400 },
        );
      }

      // =========================
      // INVALID COMMAND
      // =========================

      if (error.message === "INVALID_COMMAND") {
        return NextResponse.json(
          {
            message: "Invalid command",
          },
          { status: 400 },
        );
      }

      // =========================
      // CONTROLLER OFFLINE
      // =========================

      if (error.message === "CONTROLLER_OFFLINE") {
        return NextResponse.json(
          {
            message: "Controller is offline. Recovery cannot proceed.",
          },
          { status: 409 },
        );
      }

      // =========================
      // CONTROLLER STATE NOT RECONCILED
      // =========================

      if (error.message === "CONTROLLER_STATE_NOT_RECONCILED") {
        return NextResponse.json(
          {
            message:
              "Controller state has not been reconciled with desired state.",
          },
          { status: 409 },
        );
      }

      // =========================
      // MANUAL COMMAND NOT ALLOWED
      // =========================

      if (error.message === "MANUAL_COMMAND_NOT_ALLOWED_IN_CURRENT_MODE") {
        return NextResponse.json(
          {
            message:
              "Manual command is not allowed while the junction is in FAILURE or EMERGENCY mode.",
          },
          { status: 409 },
        );
      }
    }

    // =========================
    // GENERIC ERROR
    // =========================

    return NextResponse.json(
      {
        message: "Failed to execute command",
      },
      { status: 500 },
    );
  }
}
