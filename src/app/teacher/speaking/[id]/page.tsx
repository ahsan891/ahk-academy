import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic2,
  Calendar,
  Clock,
  Users,
  Link2,
  FileText,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { SessionActions } from "./session-actions";

function getStatusBadge(status: string) {
  switch (status) {
    case "scheduled":
      return <Badge variant="info">Scheduled</Badge>;
    case "in_progress":
      return <Badge variant="warning">In Progress</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { id } = await params;

  const speakingSession = await db.speakingSession.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      sourceLesson: {
        select: {
          id: true,
          title: true,
          topics: true,
          content: true,
          class: { select: { name: true, course: { select: { title: true } } } },
        },
      },
      participants: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
      transcript: {
        include: {
          uploadedBy: { select: { name: true } },
        },
      },
      analyses: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!speakingSession) {
    notFound();
  }

  const hasTranscript = !!speakingSession.transcript;
  const hasAnalyses = speakingSession.analyses.length > 0;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/teacher/speaking"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Speaking Sessions
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {speakingSession.topic}
              </h1>
              {getStatusBadge(speakingSession.status)}
            </div>
            {speakingSession.topicDetails && (
              <p className="mt-2 text-gray-600 max-w-2xl">
                {speakingSession.topicDetails}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Session Info & Participants */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic2 size={20} />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {formatDate(speakingSession.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {speakingSession.duration} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="font-medium">
                      {speakingSession.participants.length} /{" "}
                      {speakingSession.maxStudents}
                    </p>
                  </div>
                </div>
                {speakingSession.meetingLink && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Link2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Meeting Link</p>
                      <a
                        href={speakingSession.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {speakingSession.sourceLesson && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <BookOpen size={16} />
                    Source Lesson
                  </div>
                  <p className="mt-1 font-medium text-blue-900">
                    {speakingSession.sourceLesson.title}
                  </p>
                  <p className="text-sm text-blue-600">
                    {speakingSession.sourceLesson.class.name} -{" "}
                    {speakingSession.sourceLesson.class.course.title}
                  </p>
                  {speakingSession.sourceLesson.topics && (
                    <p className="mt-1 text-sm text-blue-600">
                      Topics: {speakingSession.sourceLesson.topics}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {speakingSession.participants.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No participants added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {speakingSession.participants.map((p) => {
                    const analysis = speakingSession.analyses.find(
                      (a) => a.studentId === p.studentId
                    );
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                            {p.student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {p.student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.student.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.attended ? (
                            <Badge variant="success">Attended</Badge>
                          ) : (
                            <Badge variant="default">Pending</Badge>
                          )}
                          {p.rating && (
                            <Badge variant="info">
                              Rating: {p.rating}/5
                            </Badge>
                          )}
                          {analysis && (
                            <Badge variant="success">Analyzed</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasTranscript ? (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <Badge variant="success">Uploaded</Badge>
                      <span className="ml-2 text-sm text-gray-500">
                        by {speakingSession.transcript!.uploadedBy.name}
                      </span>
                      {speakingSession.transcript!.analyzedAt && (
                        <span className="ml-2 text-sm text-green-600">
                          (Analyzed on{" "}
                          {formatDate(speakingSession.transcript!.analyzedAt)})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {speakingSession.transcript!.content.slice(0, 2000)}
                      {speakingSession.transcript!.content.length > 2000 &&
                        "..."}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No transcript uploaded yet. Upload a transcript to enable AI
                  analysis.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {hasAnalyses && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {speakingSession.analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                            {analysis.student.name.charAt(0).toUpperCase()}
                          </div>
                          <h4 className="font-medium text-gray-900">
                            {analysis.student.name}
                          </h4>
                        </div>
                        {analysis.participationScore != null && (
                          <Badge
                            variant={
                              analysis.participationScore >= 7
                                ? "success"
                                : analysis.participationScore >= 4
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            Participation: {analysis.participationScore}/10
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {analysis.summary && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Summary
                            </p>
                            <p className="text-sm text-gray-700">
                              {analysis.summary}
                            </p>
                          </div>
                        )}
                        {analysis.vocabularyUsed && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Vocabulary
                            </p>
                            <p className="text-sm text-gray-700">
                              {analysis.vocabularyUsed}
                            </p>
                          </div>
                        )}
                        {analysis.grammarNotes && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Grammar Notes
                            </p>
                            <p className="text-sm text-gray-700">
                              {analysis.grammarNotes}
                            </p>
                          </div>
                        )}
                        {analysis.strengths && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Strengths
                            </p>
                            <p className="text-sm text-green-700">
                              {analysis.strengths}
                            </p>
                          </div>
                        )}
                        {analysis.areasToImprove && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Areas to Improve
                            </p>
                            <p className="text-sm text-orange-700">
                              {analysis.areasToImprove}
                            </p>
                          </div>
                        )}
                        {analysis.pronunciationNotes && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Pronunciation
                            </p>
                            <p className="text-sm text-gray-700">
                              {analysis.pronunciationNotes}
                            </p>
                          </div>
                        )}
                        {analysis.homework && (
                          <div className="sm:col-span-2 rounded-lg bg-yellow-50 p-3">
                            <p className="text-xs font-medium text-yellow-800 uppercase mb-1">
                              Assigned Homework
                            </p>
                            <p className="text-sm text-yellow-900">
                              {analysis.homework}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Actions */}
        <div>
          <SessionActions
            sessionId={speakingSession.id}
            hasTranscript={hasTranscript}
            hasAnalyses={hasAnalyses}
            participants={speakingSession.participants.map((p) => ({
              studentId: p.studentId,
              studentName: p.student.name,
              attended: p.attended,
            }))}
            sessionStatus={speakingSession.status}
          />
        </div>
      </div>
    </div>
  );
}
