import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { processSensorEvent } from "@/services/sensorEventService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (
      !body.event_id ||
      !body.vehicle_id ||
      !body.junction_id ||
      !body.direction ||
      !body.event_type ||
      !body.vehicle_type ||
      !body.timestamp
    ) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const result = await processSensorEvent(body);

    return NextResponse.json(
      {
        message: "Sensor event processed successfully",
        event: result.event,
        junction: result.junction,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("SENSOR EVENT ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "DUPLICATE_EVENT") {
        return NextResponse.json(
          {
            message: "Duplicate sensor event",
          },
          { status: 409 },
        );
      }

      if (error.message === "JUNCTION_NOT_FOUND") {
        return NextResponse.json(
          {
            message: "Junction not found",
          },
          { status: 404 },
        );
      }

      if (error.message === "QUEUE_ALREADY_ZERO") {
        return NextResponse.json(
          {
            message: "Queue cannot become negative",
          },
          { status: 409 },
        );
      }
      if (error.message === "VEHICLE_NOT_FOUND") {
        return NextResponse.json(
          {
            message: "Vehicle arrival event not found",
          },
          { status: 409 },
        );
      }

      if (error.message === "VEHICLE_ALREADY_CLEARED") {
        return NextResponse.json(
          {
            message: "Vehicle has already been cleared",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to process sensor event",
      },
      { status: 500 },
    );
  }
}
