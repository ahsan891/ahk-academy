import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AIService } from "@/lib/ai-service";
import { getMemoryForPrompt, processLesson } from "@/lib/student-memory";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Students cannot trigger analysis" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const speakingSession = await db.speakingSession.findUnique({
    where: { id },
    include: {
      transcript: true,
      participants: {
        where: { attended: true },
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!speakingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (!speakingSession.transcript) {
    return NextResponse.json(
      { error: "No transcript found. Upload a transcript before analyzing." },
      { status: 400 }
    );
  }

  if (speakingSession.participants.length === 0) {
    return NextResponse.json(
      { error: "No attended participants found. Mark attendance before analyzing." },
      { status: 400 }
    );
  }

  // Delete existing analyses for this session to allow re-analysis
  await db.sessionAnalysis.deleteMany({
    where: { sessionId: id },
  });

  const transcriptContent = speakingSession.transcript.content;
  const analyses = [];
  const insights = [];

  for (const participant of speakingSession.participants) {
    const studentName = participant.student.name || "Student";

    // Fetch student's speaking profile for level context
    const profile = await db.studentSpeakingProfile.findUnique({
      where: { userId: participant.studentId },
    });

    // Get AI memory for context
    const studentMemory = await getMemoryForPrompt(participant.studentId);

    const prompt = `Analyze this student's performance in an English speaking session.

Student: ${studentName}
Level: ${profile?.level || "intermediate"}
Session Topic: "${speakingSession.topic}"

STUDENT HISTORY:
${studentMemory}

Transcript:
${transcriptContent}

Analyze ONLY ${studentName}'s contributions. Return a JSON object with these exact keys:
{
  "summary": "2-3 sentence summary of the student's performance",
  "vocabularyUsed": ["word1", "word2", ...],
  "grammarNotes": "grammar strengths and errors observed",
  "pronunciationNotes": "pronunciation observations",
  "participationScore": <number 0-10>,
  "strengths": ["strength1", "strength2"],
  "areasToImprove": ["area1", "area2"],
  "homework_suggestion": "specific homework based on weaknesses"
}

Return ONLY valid JSON, no other text.`;

    try {
      const aiResponse = await AIService.generate(prompt,
        "You are an expert ESL teacher analyzing student speaking performance. Be specific and constructive. Always return valid JSON."
      );

      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (parsed) {
        const analysis = await db.sessionAnalysis.create({
          data: {
            transcriptId: speakingSession.transcript.id,
            sessionId: id,
            studentId: participant.studentId,
            summary: parsed.summary || `${studentName} participated in the session.`,
            vocabularyUsed: JSON.stringify(parsed.vocabularyUsed || []),
            grammarNotes: parsed.grammarNotes || null,
            pronunciationNotes: parsed.pronunciationNotes || null,
            participationScore: Number(parsed.participationScore) || 5,
            strengths: JSON.stringify(parsed.strengths || []),
            areasToImprove: JSON.stringify(parsed.areasToImprove || []),
            homework: parsed.homework_suggestion || null,
          },
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        analyses.push(analysis);

        const score = Number(parsed.participationScore) || 5;
        const insight = await db.teacherInsight.create({
          data: {
            teacherId: speakingSession.createdById,
            studentId: participant.studentId,
            sessionId: id,
            type: "session_analysis",
            content: `${studentName} scored ${score}/10 in "${speakingSession.topic}". ${score < 4 ? "Needs additional support." : score < 7 ? "Making progress." : "Performing well."}`,
            priority: score < 4 ? "high" : score < 7 ? "medium" : "low",
            isRead: false,
          },
        });

        insights.push(insight);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    } catch (error) {
      console.error(`AI analysis failed for ${studentName}:`, error);

      // Fallback: create a basic analysis record so the flow isn't broken
      const analysis = await db.sessionAnalysis.create({
        data: {
          transcriptId: speakingSession.transcript.id,
          sessionId: id,
          studentId: participant.studentId,
          summary: `${studentName} participated in the "${speakingSession.topic}" session. AI analysis unavailable — please review transcript manually.`,
          vocabularyUsed: "[]",
          grammarNotes: null,
          pronunciationNotes: null,
          participationScore: 5,
          strengths: "[]",
          areasToImprove: "[]",
          homework: null,
        },
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      analyses.push(analysis);
    }
  }

  // Auto-update student memory for each analyzed participant
  for (const participant of speakingSession.participants) {
    const analysis = analyses.find((a: { studentId: string }) => a.studentId === participant.studentId);
    if (analysis) {
      try {
        await processLesson({
          studentId: participant.studentId,
          lessonDate: speakingSession.date || new Date(),
          lessonTopic: speakingSession.topic,
          transcript: transcriptContent?.slice(0, 10000),
          analysisData: analysis.summary || undefined,
          homeworkGiven: analysis.homework || undefined,
        });
      } catch (err) {
        console.error(`Memory update failed for ${participant.student.name}:`, err);
      }
    }
  }

  // Mark transcript as analyzed
  await db.sessionTranscript.update({
    where: { id: speakingSession.transcript.id },
    data: { analyzedAt: new Date() },
  });

  return NextResponse.json({
    analyses,
    insights,
    message: `Analysis complete for ${analyses.length} participants`,
  });
}
