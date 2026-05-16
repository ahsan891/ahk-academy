import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai-service";

interface AnalysisResult {
  summary: string;
  vocabularyUsed: string[];
  grammarNotes: string;
  pronunciationNotes: string;
  participationScore: number;
  strengths: string[];
  areasToImprove: string[];
  homework_suggestion: string;
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
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Fetch session with transcript and participants
    const speakingSession = await db.speakingSession.findUnique({
      where: { id: sessionId },
      include: {
        transcript: true,
        participants: {
          where: { attended: true },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!speakingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (!speakingSession.transcript) {
      return NextResponse.json(
        { error: "No transcript available for this session" },
        { status: 400 }
      );
    }

    if (speakingSession.participants.length === 0) {
      return NextResponse.json(
        { error: "No attended participants found for this session" },
        { status: 400 }
      );
    }

    const transcriptContent = speakingSession.transcript.content;
    const analyses = [];

    // Analyze each attended student
    for (const participant of speakingSession.participants) {
      const student = participant.student;

      // Get student's speaking profile for level info
      const speakingProfile = await db.studentSpeakingProfile.findUnique({
        where: { userId: student.id },
      });

      const level = speakingProfile?.level || "intermediate";

      const systemPrompt = `You are an expert English language teacher and speaking coach. You analyze student speaking performance from session transcripts. Be specific, constructive, and encouraging.`;

      const prompt = `Analyze this student's speaking performance in a group speaking session.

Session topic: ${speakingSession.topic}
${speakingSession.topicDetails ? `Topic details: ${speakingSession.topicDetails}` : ""}
Student: ${student.name}
Level: ${level}
Session duration: ${speakingSession.duration} minutes

Transcript:
${transcriptContent}

Focus on ${student.name}'s contributions in the transcript. Analyze their:
1. Overall participation and engagement
2. Vocabulary usage and range
3. Grammar accuracy and complexity
4. Pronunciation patterns (inferred from text)
5. Strengths to build on
6. Areas needing improvement
7. A homework suggestion addressing their weaknesses

Return your analysis as valid JSON with this exact format:
{
  "summary": "2-3 sentence overall assessment",
  "vocabularyUsed": ["word1", "word2", "word3"],
  "grammarNotes": "Key grammar observations and errors noticed",
  "pronunciationNotes": "Pronunciation patterns inferred from transcript",
  "participationScore": 7,
  "strengths": ["strength1", "strength2"],
  "areasToImprove": ["area1", "area2"],
  "homework_suggestion": "Specific homework recommendation"
}`;

      const aiResponse = await AIService.generate(prompt, systemPrompt);

      let parsed: AnalysisResult;
      try {
        const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        // If parsing fails, create a basic analysis
        parsed = {
          summary: aiResponse.text.slice(0, 500),
          vocabularyUsed: [],
          grammarNotes: "Analysis parsing error - see summary",
          pronunciationNotes: "",
          participationScore: 5,
          strengths: [],
          areasToImprove: [],
          homework_suggestion: "",
        };
      }

      // Create or update SessionAnalysis
      const existingAnalysis = await db.sessionAnalysis.findFirst({
        where: {
          sessionId: speakingSession.id,
          studentId: student.id,
        },
      });

      const analysisData = {
        transcriptId: speakingSession.transcript.id,
        sessionId: speakingSession.id,
        studentId: student.id,
        summary: parsed.summary,
        vocabularyUsed: JSON.stringify(parsed.vocabularyUsed),
        grammarNotes: parsed.grammarNotes,
        pronunciationNotes: parsed.pronunciationNotes,
        participationScore: parsed.participationScore,
        strengths: JSON.stringify(parsed.strengths),
        areasToImprove: JSON.stringify(parsed.areasToImprove),
        homework: parsed.homework_suggestion,
      };

      let analysis;
      if (existingAnalysis) {
        analysis = await db.sessionAnalysis.update({
          where: { id: existingAnalysis.id },
          data: analysisData,
        });
      } else {
        analysis = await db.sessionAnalysis.create({
          data: analysisData,
        });
      }

      analyses.push({
        studentId: student.id,
        studentName: student.name,
        analysis,
        model: aiResponse.model,
      });
    }

    // Mark transcript as analyzed
    await db.sessionTranscript.update({
      where: { id: speakingSession.transcript.id },
      data: { analyzedAt: new Date() },
    });

    return NextResponse.json({
      sessionId: speakingSession.id,
      topic: speakingSession.topic,
      analyzedStudents: analyses.length,
      analyses,
    });
  } catch (error) {
    console.error("[Analysis Generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
