import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { attendance } = body;

    if (!attendance || typeof attendance !== "object") {
      return NextResponse.json(
        { error: "Attendance data is required" },
        { status: 400 }
      );
    }

    // Update attendance for each participant
    for (const [studentId, attended] of Object.entries(attendance)) {
      await db.sessionParticipant.updateMany({
        where: { sessionId: id, studentId },
        data: { attended: attended as boolean },
      });
    }

    return NextResponse.json({ message: "Attendance saved" });
  } catch (error) {
    console.error("Failed to save attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}
