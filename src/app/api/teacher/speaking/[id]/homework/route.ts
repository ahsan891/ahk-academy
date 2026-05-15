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
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Get the analysis for this student in this session
    const analysis = await db.sessionAnalysis.findFirst({
      where: { sessionId: id, studentId },
      include: {
        session: {
          select: {
            topic: true,
            topicDetails: true,
            sourceLesson: {
              select: { title: true, topics: true, content: true },
            },
          },
        },
        student: { select: { name: true } },
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis found for this student. Run AI analysis first." },
        { status: 400 }
      );
    }

    // In production, this would call the AI cascade to generate personalized homework
    // For now, generate structured homework text
    const lessonTopics = analysis.session.sourceLesson?.topics || analysis.session.topic;
    const homeworkContent = [
      `Homework for ${analysis.student.name} - Speaking Session: "${analysis.session.topic}"`,
      "",
      `1. VOCABULARY PRACTICE: Review and write sentences using key vocabulary from the session topic "${lessonTopics}". Write at least 5 original sentences.`,
      "",
      `2. GRAMMAR FOCUS: ${analysis.grammarNotes || "Practice the grammar structures discussed during the session. Write a short paragraph (100 words) using the target structures."}`,
      "",
      `3. SPEAKING REFLECTION: Record a 2-minute voice message summarizing what you learned from this session and how you plan to use it in daily conversation.`,
      "",
      `4. PREPARATION: Read about the next topic and prepare 3 discussion questions you would like to explore.`,
      "",
      analysis.areasToImprove
        ? `5. IMPROVEMENT FOCUS: ${analysis.areasToImprove}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Update the analysis with homework
    await db.sessionAnalysis.update({
      where: { id: analysis.id },
      data: { homework: homeworkContent },
    });

    // Create a teacher insight about the homework
    await db.teacherInsight.create({
      data: {
        teacherId: session.user.id,
        studentId,
        sessionId: id,
        type: "recommendation",
        content: `Personalized homework generated for "${analysis.session.topic}" speaking session.`,
        priority: "low",
      },
    });

    return NextResponse.json({ message: "Homework generated", homework: homeworkContent });
  } catch (error) {
    console.error("Failed to generate homework:", error);
    return NextResponse.json(
      { error: "Failed to generate homework" },
      { status: 500 }
    );
  }
}
