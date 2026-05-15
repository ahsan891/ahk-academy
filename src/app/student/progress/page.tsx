import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EditPreferencesForm } from "@/components/speaking/edit-preferences-form";
import Link from "next/link";
import {
  Mic2,
  TrendingUp,
  BookOpen,
  Star,
  BarChart3,
  MessageSquare,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function formatLevelLabel(level: string) {
  return level
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatTrackLabel(track: string) {
  switch (track) {
    case "speaking_only":
      return "Speaking Only";
    case "full_student":
      return "Full Student";
    default:
      return track;
  }
}

export default async function StudentProgressPage() {
  const session = await auth();
  if (!session) return null;

  const studentId = session.user.id;

  // Fetch all data in parallel
  const [
    allParticipations,
    analyses,
    speakingProfile,
    ratingsGiven,
  ] = await Promise.all([
    db.sessionParticipant.findMany({
      where: { studentId },
      include: {
        session: {
          select: { id: true, topic: true, date: true, status: true },
        },
      },
      orderBy: { session: { date: "desc" } },
    }),
    db.sessionAnalysis.findMany({
      where: { studentId },
      include: {
        session: {
          select: { id: true, topic: true, date: true },
        },
      },
      orderBy: { session: { date: "desc" } },
    }),
    db.studentSpeakingProfile.findUnique({
      where: { userId: studentId },
    }),
    db.sessionParticipant.findMany({
      where: { studentId, rating: { not: null } },
    }),
  ]);

  // --- Compute stats ---
  const totalSessions = allParticipations.length;

  // Average participation score
  const scoresWithValues = analyses.filter(
    (a) => a.participationScore !== null
  );
  const avgParticipation =
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

  // Vocabulary - collect all unique words
  const allVocabBySession: { date: Date; words: string[] }[] = [];
  const allUniqueVocab = new Set<string>();
  for (const analysis of analyses) {
    if (analysis.vocabularyUsed) {
      let words: string[] = [];
      try {
        words = JSON.parse(analysis.vocabularyUsed);
      } catch {
        words = analysis.vocabularyUsed
          .split(/[,\s]+/)
          .filter(Boolean);
      }
      allVocabBySession.push({
        date: analysis.session.date,
        words,
      });
      words.forEach((w) => allUniqueVocab.add(w.toLowerCase()));
    }
  }

  // Current level
  const currentLevel = speakingProfile?.level || "intermediate";

  // Average session rating given
  const avgRatingGiven =
    ratingsGiven.length > 0
      ? (
          ratingsGiven.reduce((sum, p) => sum + (p.rating || 0), 0) /
          ratingsGiven.length
        ).toFixed(1)
      : "N/A";

  // Participation score trend (chronological)
  const participationTrend = [...analyses]
    .filter((a) => a.participationScore !== null)
    .sort(
      (a, b) =>
        new Date(a.session.date).getTime() -
        new Date(b.session.date).getTime()
    )
    .map((a) => ({
      date: a.session.date,
      topic: a.session.topic,
      score: a.participationScore!,
    }));

  // Grammar timeline (chronological)
  const grammarTimeline = [...analyses]
    .filter((a) => a.grammarNotes)
    .sort(
      (a, b) =>
        new Date(a.session.date).getTime() -
        new Date(b.session.date).getTime()
    )
    .map((a) => ({
      sessionId: a.session.id,
      topic: a.session.topic,
      date: a.session.date,
      grammarNotes: a.grammarNotes!,
    }));

  // Recent analyses (latest 10)
  const recentAnalyses = analyses.slice(0, 10);

  // Vocabulary by session (reverse chronological for display)
  const vocabBySession = [...allVocabBySession].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Max participation score for bar chart normalization
  const maxScore = 100;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
        <p className="mt-1 text-gray-500">
          Track your speaking journey, vocabulary growth, and improvement over
          time.
        </p>
      </div>

      {/* Top Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sessions"
          value={totalSessions}
          icon={<Mic2 size={24} />}
        />
        <StatsCard
          title="Avg. Participation"
          value={avgParticipation > 0 ? `${avgParticipation}` : "N/A"}
          icon={<TrendingUp size={24} />}
          description={
            avgParticipation > 0 ? `out of 100` : "No scores yet"
          }
        />
        <StatsCard
          title="Vocabulary Words"
          value={allUniqueVocab.size}
          icon={<BookOpen size={24} />}
          description="Unique words learned"
        />
        <StatsCard
          title="Current Level"
          value={formatLevelLabel(currentLevel)}
          icon={<Star size={24} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left - Main content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Participation Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Participation Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participationTrend.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No participation scores yet. Complete speaking sessions to see
                  your trend.
                </p>
              ) : (
                <div className="space-y-3">
                  {participationTrend.map((entry, i) => {
                    const barWidth = Math.min(
                      (entry.score / maxScore) * 100,
                      100
                    );
                    const barColor =
                      entry.score >= 80
                        ? "bg-green-500"
                        : entry.score >= 60
                          ? "bg-yellow-500"
                          : entry.score >= 40
                            ? "bg-orange-500"
                            : "bg-red-500";

                    return (
                      <div key={i} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-xs text-gray-500 truncate max-w-[200px]"
                            title={entry.topic}
                          >
                            {formatDate(entry.date)} - {entry.topic}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {entry.score}
                          </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vocabulary Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                Vocabulary Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allUniqueVocab.size === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No vocabulary recorded yet. Complete sessions with transcripts
                  to build your word bank.
                </p>
              ) : (
                <div className="space-y-6">
                  {/* All unique words */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      All Vocabulary ({allUniqueVocab.size} words)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(allUniqueVocab)
                        .sort()
                        .map((word, i) => (
                          <Badge key={i} variant="info">
                            {word}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* Grouped by session date */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      By Session
                    </h4>
                    <div className="space-y-4">
                      {vocabBySession.map((entry, i) => (
                        <div key={i}>
                          <p className="text-xs text-gray-500 mb-2">
                            {formatDate(entry.date)}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.words.map((word, j) => (
                              <Badge key={j} variant="default">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grammar Improvement Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                Grammar Improvement Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grammarTimeline.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No grammar notes yet. AI analysis will track your grammar
                  improvement here.
                </p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

                  <div className="space-y-6">
                    {grammarTimeline.map((entry, i) => (
                      <div key={i} className="relative pl-10">
                        {/* Timeline dot */}
                        <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-blue-500 bg-white" />

                        <div className="rounded-lg border p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Link
                              href={`/student/speaking/${entry.sessionId}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              {entry.topic}
                            </Link>
                            <span className="text-xs text-gray-400">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {entry.grammarNotes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Session Analyses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Recent Session Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No session analyses yet. After completing sessions, AI-powered
                  analysis will appear here.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => {
                    let strengths: string[] = [];
                    if (analysis.strengths) {
                      try {
                        strengths = JSON.parse(analysis.strengths);
                      } catch {
                        strengths = analysis.strengths
                          .split("\n")
                          .filter(Boolean);
                      }
                    }

                    let improvements: string[] = [];
                    if (analysis.areasToImprove) {
                      try {
                        improvements = JSON.parse(analysis.areasToImprove);
                      } catch {
                        improvements = analysis.areasToImprove
                          .split("\n")
                          .filter(Boolean);
                      }
                    }

                    return (
                      <div
                        key={analysis.id}
                        className="rounded-lg border p-4 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/student/speaking/${analysis.session.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600"
                            >
                              {analysis.session.topic}
                            </Link>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatDate(analysis.session.date)}
                            </p>
                          </div>
                          {analysis.participationScore !== null && (
                            <div className="text-right">
                              <span
                                className={`text-lg font-bold ${
                                  (analysis.participationScore || 0) >= 80
                                    ? "text-green-600"
                                    : (analysis.participationScore || 0) >= 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {analysis.participationScore}
                              </span>
                              <span className="text-xs text-gray-400">
                                /100
                              </span>
                            </div>
                          )}
                        </div>

                        {analysis.summary && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {analysis.summary}
                          </p>
                        )}

                        {/* Strengths & improvements inline */}
                        <div className="mt-3 flex flex-wrap gap-3">
                          {strengths.slice(0, 2).map((s, j) => (
                            <span
                              key={j}
                              className="inline-flex items-center gap-1 text-xs text-green-700"
                            >
                              <CheckCircle2 size={12} />
                              <span className="truncate max-w-[200px]">
                                {s}
                              </span>
                            </span>
                          ))}
                          {improvements.slice(0, 2).map((item, j) => (
                            <span
                              key={j}
                              className="inline-flex items-center gap-1 text-xs text-amber-700"
                            >
                              <AlertCircle size={12} />
                              <span className="truncate max-w-[200px]">
                                {item}
                              </span>
                            </span>
                          ))}
                        </div>

                        {analysis.homework && (
                          <div className="mt-3 rounded bg-purple-50 px-3 py-2">
                            <p className="text-xs font-medium text-purple-700">
                              Homework
                            </p>
                            <p className="text-xs text-purple-600 line-clamp-2 mt-0.5">
                              {analysis.homework}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Speaking Profile */}
        <div className="space-y-6">
          {/* Speaking Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Speaking Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Track</p>
                  <p className="mt-0.5 text-gray-900">
                    {speakingProfile
                      ? formatTrackLabel(speakingProfile.track)
                      : "Speaking Only"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Level</p>
                  <Badge variant="info">
                    {formatLevelLabel(speakingProfile?.level || "intermediate")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Preferred Topics
                  </p>
                  {speakingProfile?.preferredTopics ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {speakingProfile.preferredTopics
                        .split(",")
                        .map((topic, i) => (
                          <Badge key={i} variant="default">
                            {topic.trim()}
                          </Badge>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm text-gray-400">Not set</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Availability
                  </p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {speakingProfile?.availability || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Avg. Session Rating Given
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star
                      size={16}
                      className={
                        avgRatingGiven !== "N/A"
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                    <span className="font-medium text-gray-900">
                      {avgRatingGiven}
                    </span>
                    {avgRatingGiven !== "N/A" && (
                      <span className="text-sm text-gray-400">/5</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Sessions
                  </p>
                  <p className="mt-0.5 text-gray-900">
                    {speakingProfile?.totalSessions ?? totalSessions}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <EditPreferencesForm
                  profile={{
                    track: speakingProfile?.track || "speaking_only",
                    level: speakingProfile?.level || "intermediate",
                    preferredTopics: speakingProfile?.preferredTopics || null,
                    availability: speakingProfile?.availability || null,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Summary at a Glance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Sessions Completed
                  </span>
                  <span className="font-medium">
                    {allParticipations.filter(
                      (p) => p.session.status === "completed"
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Sessions Upcoming
                  </span>
                  <span className="font-medium">
                    {allParticipations.filter(
                      (p) =>
                        p.session.status !== "completed" &&
                        p.session.status !== "cancelled" &&
                        new Date(p.session.date) > new Date()
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Analyses Received
                  </span>
                  <span className="font-medium">{analyses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Ratings Given
                  </span>
                  <span className="font-medium">{ratingsGiven.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Grammar Notes
                  </span>
                  <span className="font-medium">
                    {grammarTimeline.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
