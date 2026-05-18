"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Link2,
  Mic2,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  FileText,
  Brain,
  Star,
  Search,
  X,
  Check,
  Upload,
} from "lucide-react";
import Link from "next/link";

interface Participant {
  id: string;
  studentId: string;
  attended: boolean;
  rating: number | null;
  feedback: string | null;
  student: {
    id: string;
    name: string;
    email: string;
    speakingProfile?: {
      track: string;
      level: string;
      totalSessions: number;
    } | null;
  };
}

interface Analysis {
  id: string;
  studentId: string;
  student: { id: string; name: string };
  summary: string | null;
  vocabularyUsed: string | null;
  grammarNotes: string | null;
  pronunciationNotes: string | null;
  participationScore: number | null;
  strengths: string | null;
  areasToImprove: string | null;
  homework: string | null;
}

interface SessionDetail {
  id: string;
  topic: string;
  topicDetails: string | null;
  date: string;
  duration: number;
  status: string;
  meetingLink: string | null;
  maxStudents: number;
  sourceType: string;
  createdBy: { id: string; name: string };
  participants: Participant[];
  transcript: {
    id: string;
    content: string;
    fileUrl: string | null;
    analyzedAt: string | null;
    uploadedBy: { id: string; name: string };
  } | null;
  analyses: Analysis[];
}

interface Student {
  id: string;
  name: string;
  email: string;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "scheduled":
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

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcriptContent, setTranscriptContent] = useState("");
  const [showTranscriptForm, setShowTranscriptForm] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [addStudentSearch, setAddStudentSearch] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [id]);

  async function fetchSession() {
    const res = await fetch(`/api/speaking-sessions/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSession(data);
    }
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    const res = await fetch(`/api/speaking-sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchSession();
  }

  async function toggleAttendance(studentId: string, attended: boolean) {
    await fetch(`/api/speaking-sessions/${id}/attendance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendance: [{ studentId, attended }],
      }),
    });
    fetchSession();
  }

  async function removeParticipant(studentId: string) {
    if (!confirm("Remove this student from the session?")) return;
    await fetch(`/api/speaking-sessions/${id}/participants`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    fetchSession();
  }

  async function addParticipants(studentIds: string[]) {
    await fetch(`/api/speaking-sessions/${id}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds }),
    });
    setShowAddStudent(false);
    setAddStudentSearch("");
    fetchSession();
  }

  async function uploadTranscript() {
    if (!transcriptContent.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/speaking-sessions/${id}/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: transcriptContent }),
    });
    if (res.ok) {
      setShowTranscriptForm(false);
      setTranscriptContent("");
      fetchSession();
    }
    setSaving(false);
  }

  async function analyzeTranscript() {
    setAnalyzing(true);
    const res = await fetch(`/api/speaking-sessions/${id}/analyze`, {
      method: "POST",
    });
    if (res.ok) {
      fetchSession();
    } else {
      const data = await res.json();
      alert(data.error || "Analysis failed");
    }
    setAnalyzing(false);
  }

  async function openAddStudentPanel() {
    setShowAddStudent(true);
    if (allStudents.length === 0) {
      const res = await fetch("/api/students");
      const data = await res.json();
      setAllStudents(data);
    }
  }

  if (loading)
    return <p className="text-gray-500">Loading session details...</p>;
  if (!session) return <p className="text-red-500">Session not found</p>;

  const participantIds = new Set(session.participants.map((p) => p.studentId));
  const availableStudents = allStudents.filter(
    (s) =>
      !participantIds.has(s.id) &&
      (s.name.toLowerCase().includes(addStudentSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(addStudentSearch.toLowerCase()))
  );

  return (
    <div>
      <Link
        href="/admin/speaking"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back to Speaking Sessions
      </Link>

      {/* Session Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {session.topic}
              </h1>
              <Badge variant={getStatusVariant(session.status)}>
                {session.status === "in_progress"
                  ? "In Progress"
                  : session.status.charAt(0).toUpperCase() +
                    session.status.slice(1)}
              </Badge>
            </div>
            {session.topicDetails && (
              <p className="text-gray-600 mb-3 max-w-2xl">
                {session.topicDetails}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(session.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {session.duration} min
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {session.participants.length}/{session.maxStudents} students
              </span>
              <Badge variant="default">
                {session.sourceType === "teacher" ? "Teacher" : "System"}
              </Badge>
              {session.meetingLink && (
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Link2 size={14} />
                  Meeting Link
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Update Status:
          </span>
          {session.status === "scheduled" && (
            <>
              <Button size="sm" onClick={() => updateStatus("confirmed")}>
                <CheckCircle size={14} className="mr-1" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatus("cancelled")}
              >
                <XCircle size={14} className="mr-1" />
                Cancel
              </Button>
            </>
          )}
          {session.status === "confirmed" && (
            <>
              <Button size="sm" onClick={() => updateStatus("in_progress")}>
                <Mic2 size={14} className="mr-1" />
                Start Session
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatus("cancelled")}
              >
                <XCircle size={14} className="mr-1" />
                Cancel
              </Button>
            </>
          )}
          {session.status === "in_progress" && (
            <Button size="sm" onClick={() => updateStatus("completed")}>
              <CheckCircle size={14} className="mr-1" />
              Complete Session
            </Button>
          )}
          {(session.status === "cancelled" ||
            session.status === "completed") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus("scheduled")}
            >
              Reschedule
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users size={20} />
                Participants ({session.participants.length}/
                {session.maxStudents})
              </span>
              {session.participants.length < session.maxStudents && (
                <Button size="sm" variant="outline" onClick={openAddStudentPanel}>
                  <Plus size={14} className="mr-1" />
                  Add Student
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Student Panel */}
            {showAddStudent && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-blue-900">
                    Add Students
                  </h4>
                  <button
                    onClick={() => setShowAddStudent(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="relative mb-3">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="Search students..."
                    value={addStudentSearch}
                    onChange={(e) => setAddStudentSearch(e.target.value)}
                    className="pl-9 bg-white"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availableStudents.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2 text-center">
                      No students available
                    </p>
                  ) : (
                    availableStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => addParticipants([student.id])}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left bg-white hover:bg-gray-50 border border-gray-200"
                      >
                        <Plus size={14} className="text-blue-600" />
                        <span className="font-medium">{student.name}</span>
                        <span className="text-gray-500 text-xs">
                          {student.email}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {session.participants.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No participants yet. Add students to this session.
              </p>
            ) : (
              <div className="space-y-3">
                {session.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                        {p.student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.student.name}</p>
                        <div className="flex items-center gap-2">
                          {p.student.speakingProfile && (
                            <>
                              <Badge variant="default" className="text-[10px]">
                                {p.student.speakingProfile.level}
                              </Badge>
                              <Badge variant="default" className="text-[10px]">
                                {p.student.speakingProfile.track === "full"
                                  ? "Full"
                                  : "Speaking"}
                              </Badge>
                            </>
                          )}
                          {p.rating && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                              <Star size={10} />
                              {p.rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleAttendance(p.studentId, !p.attended)
                        }
                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                          p.attended
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {p.attended ? (
                          <Check size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {p.attended ? "Present" : "Absent"}
                      </button>
                      <button
                        onClick={() => removeParticipant(p.studentId)}
                        className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session.transcript ? (
              <div>
                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">
                      Uploaded by {session.transcript.uploadedBy.name}
                    </p>
                    {session.transcript.analyzedAt && (
                      <Badge variant="success">Analyzed</Badge>
                    )}
                  </div>
                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {session.transcript.content.length > 2000
                      ? session.transcript.content.slice(0, 2000) + "..."
                      : session.transcript.content}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={analyzeTranscript}
                    disabled={analyzing}
                    size="sm"
                  >
                    <Brain size={14} className="mr-1" />
                    {analyzing
                      ? "Analyzing..."
                      : session.transcript.analyzedAt
                        ? "Re-analyze"
                        : "Analyze Transcript"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTranscriptContent(session.transcript!.content);
                      setShowTranscriptForm(true);
                    }}
                  >
                    Update Transcript
                  </Button>
                </div>

                {showTranscriptForm && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={transcriptContent}
                      onChange={(e) => setTranscriptContent(e.target.value)}
                      rows={8}
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Paste the transcript content here..."
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={uploadTranscript}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowTranscriptForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  No transcript uploaded yet. Paste the Teams meeting transcript
                  or .vtt file content below.
                </p>
                <textarea
                  value={transcriptContent}
                  onChange={(e) => setTranscriptContent(e.target.value)}
                  rows={8}
                  className="mb-3 flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste the meeting transcript here (from Teams .vtt export or copy-paste)..."
                />
                <Button
                  onClick={uploadTranscript}
                  disabled={saving || !transcriptContent.trim()}
                  size="sm"
                >
                  <Upload size={14} className="mr-1" />
                  {saving ? "Uploading..." : "Upload Transcript"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {session.analyses.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain size={22} />
            Analysis Results
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {session.analyses.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: Analysis }) {
  let vocabulary: string[] = [];
  try {
    vocabulary = JSON.parse(analysis.vocabularyUsed || "[]");
  } catch {
    vocabulary = [];
  }

  const score = analysis.participationScore || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {analysis.student.name.charAt(0)}
            </div>
            {analysis.student.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Score:</span>
            <span
              className={`text-lg font-bold ${
                score >= 8
                  ? "text-green-600"
                  : score >= 6
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {score}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Participation Score Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Participation</span>
            <span className="font-medium">{score}/10</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all ${
                score >= 8
                  ? "bg-green-500"
                  : score >= 6
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min((score / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Summary */}
        {analysis.summary && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Summary
            </h4>
            <p className="text-sm text-gray-700">{analysis.summary}</p>
          </div>
        )}

        {/* Vocabulary */}
        {vocabulary.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Vocabulary Used
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {vocabulary.map((word, i) => (
                <Badge key={i} variant="info">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Grammar Notes */}
        {analysis.grammarNotes && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Grammar Notes
            </h4>
            <p className="text-sm text-gray-700">{analysis.grammarNotes}</p>
          </div>
        )}

        {/* Strengths & Areas to Improve */}
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.strengths && (
            <div className="rounded-lg bg-green-50 p-3">
              <h4 className="text-xs font-semibold text-green-700 mb-1">
                Strengths
              </h4>
              <p className="text-xs text-green-800">{analysis.strengths}</p>
            </div>
          )}
          {analysis.areasToImprove && (
            <div className="rounded-lg bg-orange-50 p-3">
              <h4 className="text-xs font-semibold text-orange-700 mb-1">
                Areas to Improve
              </h4>
              <p className="text-xs text-orange-800">
                {analysis.areasToImprove}
              </p>
            </div>
          )}
        </div>

        {/* Homework */}
        {analysis.homework && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <h4 className="text-xs font-semibold text-blue-700 mb-1">
              Homework
            </h4>
            <p className="text-xs text-blue-800 whitespace-pre-line">
              {analysis.homework}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
