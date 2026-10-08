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

    if (!body.command) {
      return NextResponse.json(
        {
          message: "Command is required",
        },
        { status: 400 },
      );
    }

    await connectDB();

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
      if (error.message === "JUNCTION_NOT_FOUND") {
        return NextResponse.json(
          {
            message: "Junction not found",
          },
          { status: 404 },
        );
      }

      if (error.message === "DIRECTION_REQUIRED") {
        return NextResponse.json(
          {
            message: "Direction is required",
          },
          { status: 400 },
        );
      }

      if (error.message === "INVALID_COMMAND") {
        return NextResponse.json(
          {
            message: "Invalid command",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to execute command",
      },
      { status: 500 },
    );
  }
}
