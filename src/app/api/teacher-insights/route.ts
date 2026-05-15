import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (session.user.role === "TEACHER" || session.user.role === "ADMIN") {
    const where: Record<string, unknown> = {
      teacherId: session.user.id,
    };

    if (studentId) {
      where.studentId = studentId;
    }

    const insights = await db.teacherInsight.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        teacher: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(insights);
  }

  if (session.user.role === "STUDENT") {
    const insights = await db.teacherInsight.findMany({
      where: { studentId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(insights);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { insightId } = body;

  if (!insightId) {
    return NextResponse.json(
      { error: "insightId is required" },
      { status: 400 }
    );
  }

  const insight = await db.teacherInsight.findUnique({
    where: { id: insightId },
  });

  if (!insight) {
    return NextResponse.json(
      { error: "Insight not found" },
      { status: 404 }
    );
  }

  // Only the teacher who owns the insight or an admin can mark it as read
  if (
    session.user.role !== "ADMIN" &&
    insight.teacherId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.teacherInsight.update({
    where: { id: insightId },
    data: { isRead: true },
  });

  return NextResponse.json(updated);
}
