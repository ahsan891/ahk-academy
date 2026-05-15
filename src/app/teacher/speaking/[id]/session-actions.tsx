"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Brain,
  BookOpen,
  CheckCircle,
  UserCheck,
} from "lucide-react";

interface SessionActionsProps {
  sessionId: string;
  hasTranscript: boolean;
  hasAnalyses: boolean;
  participants: {
    studentId: string;
    studentName: string;
    attended: boolean;
  }[];
  sessionStatus: string;
}

export function SessionActions({
  sessionId,
  hasTranscript,
  hasAnalyses,
  participants,
  sessionStatus,
}: SessionActionsProps) {
  const router = useRouter();
  const [transcriptText, setTranscriptText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingHomework, setGeneratingHomework] = useState<string | null>(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>(
    Object.fromEntries(participants.map((p) => [p.studentId, p.attended]))
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function uploadTranscript() {
    if (!transcriptText.trim()) {
      setError("Please paste the transcript content.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const res = await fetch(`/api/teacher/speaking/${sessionId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: transcriptText }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to upload transcript");
      } else {
        setSuccess("Transcript uploaded successfully!");
        setTranscriptText("");
        router.refresh();
      }
    } catch {
      setError("Failed to upload transcript.");
    }
    setUploading(false);
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch(`/api/teacher/speaking/${sessionId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to run analysis");
      } else {
        setSuccess("AI analysis complete! Results are shown below.");
        router.refresh();
      }
    } catch {
      setError("Failed to run AI analysis.");
    }
    setAnalyzing(false);
  }

  async function generateHomework(studentId: string) {
    setGeneratingHomework(studentId);
    setError("");
    try {
      const res = await fetch(`/api/teacher/speaking/${sessionId}/homework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate homework");
      } else {
        setSuccess("Homework generated!");
        router.refresh();
      }
    } catch {
      setError("Failed to generate homework.");
    }
    setGeneratingHomework(null);
  }

  async function saveAttendance() {
    setMarkingAttendance(true);
    setError("");
    try {
      const res = await fetch(`/api/teacher/speaking/${sessionId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance: attendanceMap }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save attendance");
      } else {
        setSuccess("Attendance saved!");
        router.refresh();
      }
    } catch {
      setError("Failed to save attendance.");
    }
    setMarkingAttendance(false);
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Mark Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCheck size={18} />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {participants.map((p) => (
            <label
              key={p.studentId}
              className="flex items-center gap-3 rounded-lg border p-2 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={attendanceMap[p.studentId] || false}
                onChange={(e) =>
                  setAttendanceMap((prev) => ({
                    ...prev,
                    [p.studentId]: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{p.studentName}</span>
              {attendanceMap[p.studentId] && (
                <CheckCircle size={14} className="ml-auto text-green-600" />
              )}
            </label>
          ))}
          <Button
            size="sm"
            className="w-full mt-2"
            onClick={saveAttendance}
            disabled={markingAttendance}
          >
            {markingAttendance ? "Saving..." : "Save Attendance"}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Transcript */}
      {!hasTranscript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload size={18} />
              Upload Transcript
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">
              Paste the session transcript from Teams or another source.
            </p>
            <textarea
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste transcript here..."
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
            />
            <Button
              size="sm"
              className="w-full"
              onClick={uploadTranscript}
              disabled={uploading}
            >
              <Upload size={14} className="mr-2" />
              {uploading ? "Uploading..." : "Upload Transcript"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Run AI Analysis */}
      {hasTranscript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain size={18} />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnalyses ? (
              <div>
                <Badge variant="success">Analysis Complete</Badge>
                <p className="mt-2 text-xs text-gray-500">
                  AI analysis has been run for this session. View the results in
                  the analysis section.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={runAnalysis}
                  disabled={analyzing}
                >
                  {analyzing ? "Re-analyzing..." : "Re-run Analysis"}
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-3">
                  Run AI analysis on the transcript to get per-student insights
                  on vocabulary, grammar, participation, and more.
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={runAnalysis}
                  disabled={analyzing}
                >
                  <Brain size={14} className="mr-2" />
                  {analyzing ? "Analyzing..." : "Run AI Analysis"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generate Homework Per Student */}
      {hasAnalyses && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen size={18} />
              Generate Homework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">
              Generate personalized homework based on the AI analysis for each
              student.
            </p>
            {participants.map((p) => (
              <Button
                key={p.studentId}
                size="sm"
                variant="outline"
                className="w-full justify-between"
                onClick={() => generateHomework(p.studentId)}
                disabled={generatingHomework === p.studentId}
              >
                <span>{p.studentName}</span>
                <span className="text-xs text-gray-400">
                  {generatingHomework === p.studentId
                    ? "Generating..."
                    : "Generate"}
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
