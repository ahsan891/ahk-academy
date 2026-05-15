import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentIdFilter = searchParams.get("studentId");

    if (session.user.role === "STUDENT") {
      // Students see their own assignments
      const assignments = await db.grammarAssignment.findMany({
        where: { studentId: session.user.id },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              level: true,
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          teacher: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ assignments });
    }

    if (session.user.role === "TEACHER" || session.user.role === "ADMIN") {
      // Teachers see assignments they created, admins see all
      const where: Record<string, unknown> = {};

      if (session.user.role === "TEACHER") {
        where.teacherId = session.user.id;
      }

      if (studentIdFilter) {
        where.studentId = studentIdFilter;
      }

      const assignments = await db.grammarAssignment.findMany({
        where,
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              level: true,
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          student: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ assignments });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching grammar assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch grammar assignments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only teachers and admins can create grammar assignments" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { studentId, topicId, dueDate } = body;

    if (!studentId || !topicId) {
      return NextResponse.json(
        { error: "studentId and topicId are required" },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await db.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // Verify topic exists
    const topic = await db.grammarTopic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Grammar topic not found" },
        { status: 404 }
      );
    }

    const assignment = await db.grammarAssignment.upsert({
      where: {
        studentId_topicId: {
          studentId,
          topicId,
        },
      },
      create: {
        teacherId: session.user.id,
        studentId,
        topicId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      update: {
        teacherId: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted: false,
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
          },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating grammar assignment:", error);
    return NextResponse.json(
      { error: "Failed to create grammar assignment" },
      { status: 500 }
    );
  }
}
