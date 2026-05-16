import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");

  // Determine which teacher's logs to fetch
  let targetTeacherId: string;
  if (session.user.role === "ADMIN" && teacherId) {
    targetTeacherId = teacherId;
  } else if (session.user.role === "TEACHER") {
    targetTeacherId = session.user.id;
  } else if (session.user.role === "ADMIN") {
    // Admin without specific teacherId gets all
    const logs = await db.grammarLessonLog.findMany({
      orderBy: { taughtAt: "desc" },
      take: 50,
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
    });
    return NextResponse.json(logs);
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await db.grammarLessonLog.findMany({
    where: { teacherId: targetTeacherId },
    orderBy: { taughtAt: "desc" },
    take: 50,
    include: {
      teacher: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only teachers can log lessons" }, { status: 403 });
  }

  const body = await req.json();
  const { title, grammarFocus, description, taughtAt, studentsTargeted } = body;

  if (!title || !grammarFocus || !taughtAt) {
    return NextResponse.json(
      { error: "title, grammarFocus, and taughtAt are required" },
      { status: 400 }
    );
  }

  const log = await db.grammarLessonLog.create({
    data: {
      teacherId: session.user.id,
      title,
      grammarFocus,
      description: description || null,
      taughtAt: new Date(taughtAt),
      studentsTargeted: studentsTargeted ? JSON.stringify(studentsTargeted) : null,
    },
    include: {
      teacher: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json(log, { status: 201 });
}
