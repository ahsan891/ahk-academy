import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock AI analysis generator (will be replaced with real AI later)
function generateMockAnalysis(studentName: string, topic: string) {
  const participationScore = Math.round((Math.random() * 40 + 60) * 10) / 10; // 60-100

  const vocabularyBank = [
    "eloquent", "articulate", "persuasive", "coherent", "fluent",
    "comprehensive", "elaborate", "concise", "analytical", "critical",
    "innovative", "collaborative", "empathetic", "assertive", "diplomatic",
    "nuanced", "insightful", "pragmatic", "versatile", "proficient",
  ];

  const shuffled = vocabularyBank.sort(() => 0.5 - Math.random());
  const vocabularyUsed = JSON.stringify(shuffled.slice(0, Math.floor(Math.random() * 8) + 3));

  const strengths = [
    "Good use of topic-specific vocabulary",
    "Active participation in group discussions",
    "Clear pronunciation of key terms",
    "Effective use of transitional phrases",
    "Confident speaking pace",
    "Good eye contact and engagement",
  ];

  const improvements = [
    "Work on reducing filler words (um, uh)",
    "Practice more complex sentence structures",
    "Expand vocabulary related to academic topics",
    "Focus on intonation patterns for questions",
    "Improve fluency when expressing complex ideas",
    "Practice paraphrasing to avoid repetition",
  ];

  const selectedStrengths = strengths
    .sort(() => 0.5 - Math.random())
    .slice(0, 2)
    .join("; ");

  const selectedImprovements = improvements
    .sort(() => 0.5 - Math.random())
    .slice(0, 2)
    .join("; ");

  return {
    summary: `${studentName} participated in a speaking session on "${topic}". Overall performance was ${participationScore >= 80 ? "strong" : "satisfactory"} with notable contributions to the group discussion.`,
    vocabularyUsed,
    grammarNotes: `${studentName} demonstrated ${participationScore >= 80 ? "good" : "developing"} command of grammar. Occasional errors in verb tense consistency and article usage were noted. Subject-verb agreement was generally accurate.`,
    pronunciationNotes: `Pronunciation was ${participationScore >= 85 ? "clear and natural" : "mostly clear with some areas for improvement"}. Stress patterns on multi-syllable words could be refined.`,
    participationScore,
    strengths: selectedStrengths,
    areasToImprove: selectedImprovements,
    homework: `1. Write a 200-word essay on "${topic}" incorporating at least 5 new vocabulary words from today's session.\n2. Record a 2-minute voice memo summarizing your key takeaways.\n3. Practice pronunciation of words discussed during the session.`,
  };
}

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

  // Generate analysis for each attended participant
  const analyses = [];
  const insights = [];

  for (const participant of speakingSession.participants) {
    const mockData = generateMockAnalysis(
      participant.student.name || "Student",
      speakingSession.topic
    );

    const analysis = await db.sessionAnalysis.create({
      data: {
        transcriptId: speakingSession.transcript.id,
        sessionId: id,
        studentId: participant.studentId,
        summary: mockData.summary,
        vocabularyUsed: mockData.vocabularyUsed,
        grammarNotes: mockData.grammarNotes,
        pronunciationNotes: mockData.pronunciationNotes,
        participationScore: mockData.participationScore,
        strengths: mockData.strengths,
        areasToImprove: mockData.areasToImprove,
        homework: mockData.homework,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    analyses.push(analysis);

    // Create teacher insight for each student
    const insight = await db.teacherInsight.create({
      data: {
        teacherId: speakingSession.createdById,
        studentId: participant.studentId,
        sessionId: id,
        type: "session_analysis",
        content: `${participant.student.name || "Student"} scored ${mockData.participationScore}/100 in the "${speakingSession.topic}" session. ${mockData.participationScore < 70 ? "Needs additional support." : "Performing well."}`,
        priority: mockData.participationScore < 70 ? "high" : mockData.participationScore < 85 ? "medium" : "low",
        isRead: false,
      },
    });

    insights.push(insight);
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
