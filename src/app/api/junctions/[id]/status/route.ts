import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Junction } from "@/models/Junction";
import { ControllerCommand } from "@/models/ControllerCommand";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await connectDB();

    const junction = await Junction.findOne({
      junctionId: id,
    });

    if (!junction) {
      return NextResponse.json(
        { message: "Junction not found" },
        { status: 404 },
      );
    }

    const pendingCommand = await ControllerCommand.findOne({
      junction_id: id,
      status: "PENDING",
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        junctionId: junction.junctionId,
        mode: junction.mode,
        phase: junction.phase,

        queues: junction.queues,

        desiredSignals: junction.desiredSignals,

        actualSignals: junction.actualSignals,

        controllerStatus: junction.controllerStatus,

        pendingCommand: pendingCommand
          ? {
              command_id: pendingCommand.command_id,
              status: pendingCommand.status,
              desiredSignals: pendingCommand.desiredSignals,
              createdAt: pendingCommand.createdAt,
            }
          : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("STATUS API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to get junction status",
      },
      { status: 500 },
    );
  }
}
