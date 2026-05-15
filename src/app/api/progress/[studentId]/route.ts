import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId } = await params;

  // Students can only view their own progress
  if (session.user.role === "STUDENT" && session.user.id !== studentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify student exists
  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, email: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Get all session participations
  const participations = await db.sessionParticipant.findMany({
    where: {
      studentId,
      attended: true,
    },
    include: {
      session: {
        select: { id: true, topic: true, date: true, status: true },
      },
    },
    orderBy: {
      session: { date: "desc" },
    },
  });

  const totalSessionsAttended = participations.length;

  // Get all analyses for the student
  const analyses = await db.sessionAnalysis.findMany({
    where: { studentId },
    include: {
      session: {
        select: { id: true, topic: true, date: true },
      },
    },
    orderBy: {
      session: { date: "desc" },
    },
  });

  // Calculate average participation score
  const scoresWithValues = analyses.filter((a) => a.participationScore !== null);
  const averageParticipationScore =
    scoresWithValues.length > 0
      ? Math.round(
          (scoresWithValues.reduce(
            (sum, a) => sum + (a.participationScore || 0),
            0
          ) /
            scoresWithValues.length) *
            10
        ) / 10
      : 0;

  // Vocabulary growth - count unique words across all analyses
  const allVocabulary = new Set<string>();
  for (const analysis of analyses) {
    if (analysis.vocabularyUsed) {
      try {
        const words: string[] = JSON.parse(analysis.vocabularyUsed);
        words.forEach((word) => allVocabulary.add(word.toLowerCase()));
      } catch {
        // If not valid JSON, split by commas or spaces
        analysis.vocabularyUsed
          .split(/[,\s]+/)
          .filter(Boolean)
          .forEach((word) => allVocabulary.add(word.toLowerCase()));
      }
    }
  }

  // Grammar improvement timeline
  const grammarTimeline = analyses
    .filter((a) => a.grammarNotes)
    .map((a) => ({
      sessionId: a.session.id,
      topic: a.session.topic,
      date: a.session.date,
      grammarNotes: a.grammarNotes,
    }))
    .reverse(); // Chronological order

  // Recent analyses (last 10)
  const recentAnalyses = analyses.slice(0, 10).map((a) => ({
    id: a.id,
    sessionId: a.session.id,
    topic: a.session.topic,
    date: a.session.date,
    summary: a.summary,
    participationScore: a.participationScore,
    strengths: a.strengths,
    areasToImprove: a.areasToImprove,
    homework: a.homework,
    vocabularyUsed: a.vocabularyUsed,
    grammarNotes: a.grammarNotes,
    pronunciationNotes: a.pronunciationNotes,
  }));

  // Session history with ratings
  const sessionHistory = participations.map((p) => ({
    sessionId: p.session.id,
    topic: p.session.topic,
    date: p.session.date,
    status: p.session.status,
    attended: p.attended,
    rating: p.rating,
    feedback: p.feedback,
  }));

  // Speaking profile
  const speakingProfile = await db.studentSpeakingProfile.findUnique({
    where: { userId: studentId },
  });

  return NextResponse.json({
    student,
    totalSessionsAttended,
    averageParticipationScore,
    vocabularyGrowth: {
      uniqueWordsCount: allVocabulary.size,
      words: Array.from(allVocabulary).sort(),
    },
    grammarTimeline,
    recentAnalyses,
    sessionHistory,
    speakingProfile,
  });
}
