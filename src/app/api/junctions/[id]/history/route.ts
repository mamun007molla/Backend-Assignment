import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Junction } from "@/models/Junction";
import { AuditLog } from "@/models/AuditLog";

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

    const history = await AuditLog.find({
      junction_id: id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(
      {
        junctionId: id,
        count: history.length,
        history,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("HISTORY API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to get junction history",
      },
      { status: 500 },
    );
  }
}
