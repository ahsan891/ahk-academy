import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { rating, feedback } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const participant = await db.sessionParticipant.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: id,
        studentId: session.user.id,
      },
    },
  });

  if (!participant) {
    return NextResponse.json(
      { error: "You are not a participant in this session" },
      { status: 403 }
    );
  }

  const updated = await db.sessionParticipant.update({
    where: {
      sessionId_studentId: {
        sessionId: id,
        studentId: session.user.id,
      },
    },
    data: {
      rating,
      feedback: feedback || null,
    },
  });

  return NextResponse.json(updated);
}
