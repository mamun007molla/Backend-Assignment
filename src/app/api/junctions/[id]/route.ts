import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Junction } from "@/models/Junction";

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
        {
          message: "Junction not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        junction,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET JUNCTION ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch junction",
      },
      { status: 500 },
    );
  }
}
