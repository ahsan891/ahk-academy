import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AIService } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const teacherId = body.teacherId || session.user.id;
  const weekOf = body.weekOf ? new Date(body.weekOf) : new Date();

  // Set weekOf to beginning of the week (Monday)
  const weekStart = new Date(weekOf);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  // Verify teacher exists
  const teacher = await db.user.findUnique({
    where: { id: teacherId },
    select: { id: true, name: true, role: true },
  });

  if (!teacher || (teacher.role !== "TEACHER" && teacher.role !== "ADMIN")) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  // Fetch teacher's students
  const students = await db.studentProfile.findMany({
    where: {
      teacherId: teacherId,
      isActive: true,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  // Fetch recent analyses for those students (last 2 weeks)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const studentIds = students.map((s) => s.user.id);

  const recentAnalyses = await db.sessionAnalysis.findMany({
    where: {
      studentId: { in: studentIds },
      createdAt: { gte: twoWeeksAgo },
    },
    include: {
      student: { select: { name: true } },
      session: { select: { topic: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build summary for AI
  const studentSummaries = students.map((sp) => {
    const studentAnalyses = recentAnalyses.filter((a) => a.studentId === sp.user.id);
    const grammarNotes = studentAnalyses
      .map((a) => a.grammarNotes)
      .filter(Boolean)
      .join("; ");
    const areasToImprove = studentAnalyses
      .map((a) => a.areasToImprove)
      .filter(Boolean)
      .join("; ");
    const strengths = studentAnalyses
      .map((a) => a.strengths)
      .filter(Boolean)
      .join("; ");

    return {
      name: sp.user.name,
      level: sp.level,
      track: sp.trackType,
      sessionsAnalyzed: studentAnalyses.length,
      grammarNotes: grammarNotes || "No data",
      areasToImprove: areasToImprove || "No data",
      strengths: strengths || "No data",
    };
  });

  const prompt = `Generate weekly teaching resources for the week of ${weekStart.toLocaleDateString()}.

Teacher: ${teacher.name}
Number of students: ${students.length}

Student analyses from the past 2 weeks:
${JSON.stringify(studentSummaries, null, 2)}

Return a JSON object with this exact structure:
{
  "resources": [
    {
      "type": "lesson_plan" | "exercise" | "vocabulary_list" | "grammar_drill" | "conversation_prompt",
      "title": "resource title",
      "targetGrammarPoint": "specific grammar point or skill",
      "content": "detailed resource content (at least 3-4 sentences)"
    }
  ],
  "studentSpotlights": [
    {
      "studentName": "name",
      "note": "observation about this student",
      "recommendation": "specific recommendation for this student"
    }
  ]
}

Generate 3-5 resources and spotlights for students who need attention. Focus on common grammar issues and areas where students struggle most.`;

  try {
    const aiResponse = await AIService.generate(prompt, "You are an expert ESL teaching assistant. Generate practical, actionable teaching resources. Always respond with valid JSON only, no markdown formatting.");

    // Parse AI response
    let parsed: {
      resources: { type: string; title: string; targetGrammarPoint: string; content: string }[];
      studentSpotlights: { studentName: string; note: string; recommendation: string }[];
    };

    try {
      // Try to extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: aiResponse.text },
        { status: 500 }
      );
    }

    // Save resources to database
    const savedResources = [];
    for (const resource of parsed.resources || []) {
      const saved = await db.teacherResource.create({
        data: {
          teacherId: teacherId,
          weekOf: weekStart,
          resourceType: resource.type,
          title: resource.title,
          content: resource.content,
          targetGrammarPoint: resource.targetGrammarPoint || null,
          basedOnStudents: JSON.stringify(studentIds),
          modelUsed: aiResponse.model,
        },
      });
      savedResources.push(saved);
    }

    return NextResponse.json({
      success: true,
      weekOf: weekStart.toISOString(),
      resources: savedResources,
      studentSpotlights: parsed.studentSpotlights || [],
      modelUsed: aiResponse.model,
    });
  } catch (error) {
    console.error("[Teacher Resources] AI generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate resources" },
      { status: 500 }
    );
  }
}
