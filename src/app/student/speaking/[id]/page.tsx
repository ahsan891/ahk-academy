import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RateSessionForm } from "@/components/speaking/rate-session-form";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  Lightbulb,
  BookOpen,
  Star,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  FileText,
  Loader2,
} from "lucide-react";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "scheduled":
      return "info" as const;
    case "confirmed":
      return "info" as const;
    case "in_progress":
      return "warning" as const;
    case "completed":
      return "success" as const;
    case "cancelled":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { id } = await params;
  const studentId = session.user.id;
  const now = new Date();

  // Fetch the session with all related data
  const speakingSession = await db.speakingSession.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          student: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      },
      transcript: true,
      analyses: {
        where: { studentId },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      sourceLesson: {
        include: {
          class: {
            include: { course: true },
          },
        },
      },
    },
  });

  if (!speakingSession) {
    redirect("/student/speaking");
  }

  // Verify student is a participant
  const myParticipation = speakingSession.participants.find(
    (p) => p.studentId === studentId
  );
  if (!myParticipation) {
    redirect("/student/speaking");
  }

  const isUpcoming =
    new Date(speakingSession.date) > now &&
    speakingSession.status !== "completed" &&
    speakingSession.status !== "cancelled";
  const isCompleted = speakingSession.status === "completed";
  const hasRated = myParticipation.rating !== null;
  const myAnalysis = speakingSession.analyses[0] || null;
  const otherParticipants = speakingSession.participants.filter(
    (p) => p.studentId !== studentId
  );

  // Parse JSON fields from analysis
  let vocabularyWords: string[] = [];
  if (myAnalysis?.vocabularyUsed) {
    try {
      vocabularyWords = JSON.parse(myAnalysis.vocabularyUsed);
    } catch {
      vocabularyWords = myAnalysis.vocabularyUsed
        .split(",")
        .map((w: string) => w.trim())
        .filter(Boolean);
    }
  }

  let strengthsList: string[] = [];
  if (myAnalysis?.strengths) {
    try {
      strengthsList = JSON.parse(myAnalysis.strengths);
    } catch {
      strengthsList = myAnalysis.strengths
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }

  let improvementsList: string[] = [];
  if (myAnalysis?.areasToImprove) {
    try {
      improvementsList = JSON.parse(myAnalysis.areasToImprove);
    } catch {
      improvementsList = myAnalysis.areasToImprove
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/student/speaking"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to Speaking Sessions
      </Link>

      {/* Session Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {speakingSession.topic}
              </h1>
              <Badge variant={getStatusBadgeVariant(speakingSession.status)}>
                {formatStatusLabel(speakingSession.status)}
              </Badge>
            </div>
            {speakingSession.sourceLesson && (
              <p className="mt-1 text-sm text-gray-500">
                From lesson: {speakingSession.sourceLesson.title} (
                {speakingSession.sourceLesson.class.course.title})
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-gray-900">
                    {formatDate(speakingSession.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="mt-1 text-gray-900">
                    {formatTime(speakingSession.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="mt-1 text-gray-900">
                    {speakingSession.duration} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created by
                  </p>
                  <p className="mt-1 text-gray-900">
                    {speakingSession.createdBy.name}
                  </p>
                </div>
              </div>

              {/* Meeting link */}
              {speakingSession.meetingLink &&
                (isUpcoming || speakingSession.status === "in_progress") && (
                  <div className="mt-4 pt-4 border-t">
                    <a
                      href={speakingSession.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button>
                        <ExternalLink size={16} className="mr-2" />
                        Join Meeting
                      </Button>
                    </a>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Topic Details & Preparation (for upcoming sessions) */}
          {isUpcoming && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Lightbulb size={20} />
                  Preparation Material
                </CardTitle>
              </CardHeader>
              <CardContent>
                {speakingSession.topicDetails && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Topic Details
                    </h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {speakingSession.topicDetails}
                    </p>
                  </div>
                )}

                <div className="rounded-lg bg-white p-4 border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Preparation Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 text-blue-500 shrink-0"
                      />
                      Research the topic beforehand and prepare key vocabulary
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 text-blue-500 shrink-0"
                      />
                      Think of personal experiences related to the topic
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 text-blue-500 shrink-0"
                      />
                      Prepare 2-3 questions to ask other participants
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 text-blue-500 shrink-0"
                      />
                      Practice expressing your opinions clearly and concisely
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 text-blue-500 shrink-0"
                      />
                      Test your microphone and internet connection before
                      joining
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating Form (for completed sessions, not yet rated) */}
          {isCompleted && !hasRated && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star size={20} />
                  Rate This Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RateSessionForm sessionId={speakingSession.id} />
              </CardContent>
            </Card>
          )}

          {/* Already rated notice */}
          {isCompleted && hasRated && (
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Session Rated</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= (myParticipation.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {myParticipation.rating}/5
                      </span>
                    </div>
                    {myParticipation.feedback && (
                      <p className="mt-2 text-sm text-gray-600">
                        &ldquo;{myParticipation.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Analysis */}
          {isCompleted && myAnalysis && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myAnalysis.summary && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {myAnalysis.summary}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Participation Score */}
              {myAnalysis.participationScore !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Participation Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (myAnalysis.participationScore || 0) >= 8
                                ? "bg-green-500"
                                : (myAnalysis.participationScore || 0) >= 6
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(((myAnalysis.participationScore || 0) / 10) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {myAnalysis.participationScore}
                        <span className="text-sm font-normal text-gray-500">
                          /10
                        </span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vocabulary */}
              {vocabularyWords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen size={20} />
                      Vocabulary Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {vocabularyWords.map((word, i) => (
                        <Badge key={i} variant="info">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grammar Notes */}
              {myAnalysis.grammarNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare size={20} />
                      Grammar Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {myAnalysis.grammarNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pronunciation Notes */}
              {myAnalysis.pronunciationNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare size={20} />
                      Pronunciation Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {myAnalysis.pronunciationNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              {strengthsList.length > 0 && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 size={20} />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {strengthsList.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 text-green-500 shrink-0"
                          />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Areas to Improve */}
              {improvementsList.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                      <AlertCircle size={20} />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {improvementsList.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <AlertCircle
                            size={16}
                            className="mt-0.5 text-amber-500 shrink-0"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Homework */}
              {myAnalysis.homework && (
                <Card className="border-purple-200 bg-purple-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <BookOpen size={20} />
                      Personalized Homework
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {myAnalysis.homework}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Feedback being prepared message */}
          {isCompleted && !myAnalysis && (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <Loader2 className="mx-auto h-10 w-10 text-blue-400 animate-spin" />
                <p className="mt-4 text-lg font-medium text-gray-600">
                  Your feedback is being prepared
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  AI analysis of your speaking performance will appear here once
                  the session transcript has been processed. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Participants & sidebar info */}
        <div className="space-y-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Participants ({speakingSession.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Current student (you) */}
                <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                    {session.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-blue-600">You</p>
                  </div>
                  {myParticipation.attended && (
                    <Badge variant="success">Attended</Badge>
                  )}
                </div>

                {/* Other participants */}
                {otherParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                      {p.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {p.student.name}
                      </p>
                    </div>
                    {p.attended && <Badge variant="success">Attended</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Topic Details in sidebar (always visible) */}
          {speakingSession.topicDetails && !isUpcoming && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb size={20} />
                  Topic Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {speakingSession.topicDetails}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats for completed sessions */}
          {isCompleted && myAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myAnalysis.participationScore !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Participation
                      </span>
                      <span className="font-medium">
                        {myAnalysis.participationScore}/10
                      </span>
                    </div>
                  )}
                  {vocabularyWords.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Vocabulary Words
                      </span>
                      <span className="font-medium">
                        {vocabularyWords.length}
                      </span>
                    </div>
                  )}
                  {hasRated && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Your Rating</span>
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="font-medium">
                          {myParticipation.rating}/5
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
