import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMemory, processLesson, buildInitialMemory } from "@/lib/student-memory";

// GET: Read a student's AI memory
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Students can only view own memory
  if (session.user.role === "STUDENT" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memory = await getMemory(id);
  if (!memory) {
    return NextResponse.json({ error: "No memory found. Run POST to initialize." }, { status: 404 });
  }

  return NextResponse.json(memory);
}

// POST: Process a new lesson or build initial memory
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Only teachers/admins can update memory" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, lessonDate, lessonTopic, transcript, analysisData, homeworkGiven, teacherNotes } = body;

  try {
    if (action === "initialize") {
      // Build memory from all existing data (WhatsApp, attendance, homework)
      await buildInitialMemory(id);
      const memory = await getMemory(id);
      return NextResponse.json({ message: "Memory initialized", memory });
    }

    // Default: process a new lesson
    if (!lessonTopic) {
      return NextResponse.json({ error: "lessonTopic is required" }, { status: 400 });
    }

    await processLesson({
      studentId: id,
      lessonDate: lessonDate ? new Date(lessonDate) : new Date(),
      lessonTopic,
      transcript,
      analysisData,
      homeworkGiven,
      teacherNotes,
    });

    const memory = await getMemory(id);
    return NextResponse.json({ message: "Memory updated", memory });
  } catch (error) {
    console.error("Memory update failed:", error);
    return NextResponse.json({ error: "Failed to update memory" }, { status: 500 });
  }
}
