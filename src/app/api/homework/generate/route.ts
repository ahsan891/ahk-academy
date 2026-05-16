import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai-service";

interface HomeworkResult {
  title: string;
  sections: {
    type: string;
    title: string;
    instructions: string;
    exercises: string[];
  }[];
  estimatedMinutes: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      !["ADMIN", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, studentId } = body;

    if (!sessionId || !studentId) {
      return NextResponse.json(
        { error: "sessionId and studentId are required" },
        { status: 400 }
      );
    }

    // Fetch analysis for this student + session
    const analysis = await db.sessionAnalysis.findFirst({
      where: {
        sessionId,
        studentId,
      },
      include: {
        session: { select: { topic: true, topicDetails: true } },
        student: { select: { id: true, name: true } },
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis found for this student and session. Generate analysis first." },
        { status: 404 }
      );
    }

    // Get student's speaking profile for level
    const speakingProfile = await db.studentSpeakingProfile.findUnique({
      where: { userId: studentId },
    });

    const level = speakingProfile?.level || "intermediate";

    // Parse stored JSON fields
    let areasToImprove: string[] = [];
    let strengths: string[] = [];
    try {
      areasToImprove = analysis.areasToImprove ? JSON.parse(analysis.areasToImprove) : [];
      strengths = analysis.strengths ? JSON.parse(analysis.strengths) : [];
    } catch {
      areasToImprove = analysis.areasToImprove ? [analysis.areasToImprove] : [];
      strengths = analysis.strengths ? [analysis.strengths] : [];
    }

    const systemPrompt = `You are an expert English language teacher creating personalized homework assignments. Create engaging, practical exercises that target the student's specific weaknesses while building on their strengths.`;

    const prompt = `Create personalized homework for a student based on their speaking session analysis.

Student: ${analysis.student.name}
Level: ${level}
Session topic: ${analysis.session.topic}
${analysis.session.topicDetails ? `Topic details: ${analysis.session.topicDetails}` : ""}

Analysis summary: ${analysis.summary || "N/A"}
Grammar issues: ${analysis.grammarNotes || "None noted"}
Pronunciation issues: ${analysis.pronunciationNotes || "None noted"}
Weaknesses: ${areasToImprove.join(", ") || "None specified"}
Strengths: ${strengths.join(", ") || "None specified"}
Homework suggestion from analysis: ${analysis.homework || "N/A"}

Create homework that:
1. Directly addresses the grammar and vocabulary weaknesses
2. Includes speaking/writing practice related to the session topic
3. Is appropriate for ${level} level
4. Can be completed in 20-40 minutes
5. Has clear instructions and examples

Return your response as valid JSON with this exact format:
{
  "title": "Homework title",
  "sections": [
    {
      "type": "grammar|vocabulary|writing|speaking|reading",
      "title": "Section title",
      "instructions": "Clear instructions for this section",
      "exercises": ["Exercise 1 description", "Exercise 2 description"]
    }
  ],
  "estimatedMinutes": 30
}`;

    const aiResponse = await AIService.generate(prompt, systemPrompt);

    let parsed: HomeworkResult;
    try {
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI homework response. Please try again." },
        { status: 500 }
      );
    }

    // Create Homework record
    const homework = await db.homework.create({
      data: {
        studentId,
        sessionId,
        analysisId: analysis.id,
        title: parsed.title,
        content: JSON.stringify(parsed.sections),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
        status: "PENDING",
      },
    });

    return NextResponse.json({
      homework: {
        id: homework.id,
        title: homework.title,
        sections: parsed.sections,
        estimatedMinutes: parsed.estimatedMinutes,
        dueDate: homework.dueDate,
        studentName: analysis.student.name,
      },
      model: aiResponse.model,
    });
  } catch (error) {
    console.error("[Homework Generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate homework" },
      { status: 500 }
    );
  }
}
