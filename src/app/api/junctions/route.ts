import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Junction } from "@/models/Junction";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await connectDB();

    const junction = await Junction.create({
      junctionId: body.junctionId,
      mode: "AUTOMATIC",
      phase: "NORTH_SOUTH",

      queues: {
        NORTH: 0,
        SOUTH: 0,
        EAST: 0,
        WEST: 0,
      },

      desiredSignals: {
        NORTH: "GREEN",
        SOUTH: "GREEN",
        EAST: "RED",
        WEST: "RED",
      },

      actualSignals: {
        NORTH: "RED",
        SOUTH: "RED",
        EAST: "RED",
        WEST: "RED",
      },

      controllerStatus: "ONLINE",
    });

    return NextResponse.json(
      {
        message: "Junction created successfully",
        junction,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to create junction",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const junctions = await Junction.find();

    return NextResponse.json(
      {
        junctions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET JUNCTIONS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch junctions",
      },
      { status: 500 },
    );
  }
}