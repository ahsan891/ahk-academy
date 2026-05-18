import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai-service";
import { getMemoryForPrompt } from "@/lib/student-memory";

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

    const studentName = analysis.student.name || "Student";
    const lessonTopics = analysis.session.sourceLesson?.topics || analysis.session.topic;

    // Parse stored arrays
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let vocabulary: string[] = [];
    try { strengths = JSON.parse(analysis.strengths || "[]"); } catch { strengths = []; }
    try { weaknesses = JSON.parse(analysis.areasToImprove || "[]"); } catch { weaknesses = []; }
    try { vocabulary = JSON.parse(analysis.vocabularyUsed || "[]"); } catch { vocabulary = []; }

    const studentMemory = await getMemoryForPrompt(studentId);

    const prompt = `Create personalized homework for an ESL student based on their speaking session analysis.

Student: ${studentName}
Session Topic: "${analysis.session.topic}"
${analysis.session.sourceLesson ? `Lesson: ${analysis.session.sourceLesson.title}` : ""}
Topics: ${lessonTopics}

STUDENT HISTORY:
${studentMemory}
Score: ${analysis.participationScore}/10
Strengths: ${strengths.join(", ") || "N/A"}
Areas to Improve: ${weaknesses.join(", ") || "N/A"}
Grammar Notes: ${analysis.grammarNotes || "N/A"}
Vocabulary Used: ${vocabulary.join(", ") || "N/A"}

Create homework that:
1. Addresses the student's specific weaknesses
2. Builds on their strengths
3. Reinforces vocabulary and grammar from the session
4. Takes 30-45 minutes to complete
5. Includes varied exercises (writing, vocabulary practice, grammar drills, speaking reflection)

Return a JSON object:
{
  "title": "Homework title",
  "content": "Full homework text with numbered sections and exercises",
  "focusAreas": ["area1", "area2"]
}

Return ONLY valid JSON.`;

    let homeworkContent: string;
    let homeworkTitle: string;

    try {
      const aiResponse = await AIService.generate(prompt,
        "You are an expert ESL teacher creating personalized homework. Be specific and practical. Always return valid JSON."
      );

      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (parsed) {
        homeworkTitle = parsed.title || `Speaking Homework: ${analysis.session.topic}`;
        homeworkContent = parsed.content || "Homework generation failed. Please assign manually.";
      } else {
        throw new Error("Failed to parse AI response");
      }
    } catch (error) {
      console.error("AI homework generation failed:", error);

      // Template fallback
      homeworkTitle = `Speaking Homework: ${analysis.session.topic}`;
      homeworkContent = [
        `Homework for ${studentName} - "${analysis.session.topic}"`,
        "",
        `1. VOCABULARY: Review and write sentences using these words from the session: ${vocabulary.slice(0, 5).join(", ") || "key vocabulary from the session"}. Write at least 5 original sentences.`,
        "",
        `2. GRAMMAR: ${analysis.grammarNotes || "Practice the grammar structures discussed. Write a short paragraph (100 words) using the target structures."}`,
        "",
        `3. SPEAKING REFLECTION: Record a 2-minute voice message summarizing what you learned and how you plan to use it.`,
        "",
        `4. PREPARATION: Read about the next topic and prepare 3 discussion questions.`,
        "",
        weaknesses.length > 0 ? `5. IMPROVEMENT FOCUS: Work on: ${weaknesses.join(", ")}` : "",
      ].filter(Boolean).join("\n");
    }

    // Update the analysis with homework
    await db.sessionAnalysis.update({
      where: { id: analysis.id },
      data: { homework: homeworkContent },
    });

    // Create Homework record so it shows on student's homework page
    const homework = await db.homework.create({
      data: {
        studentId,
        sessionId: id,
        analysisId: analysis.id,
        title: homeworkTitle,
        content: homeworkContent,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        status: "PENDING",
      },
    });

    // Create teacher insight
    await db.teacherInsight.create({
      data: {
        teacherId: session.user.id,
        studentId,
        sessionId: id,
        type: "recommendation",
        content: `Personalized homework generated for ${studentName} — "${analysis.session.topic}" session.`,
        priority: "low",
      },
    });

    return NextResponse.json({ message: "Homework generated", homework: homeworkContent, homeworkId: homework.id });
  } catch (error) {
    console.error("Failed to generate homework:", error);
    return NextResponse.json(
      { error: "Failed to generate homework" },
      { status: 500 }
    );
  }
}
