"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ClipboardList, Send, CheckCircle } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  class: { name: string; course: { title: string } };
  submissions: { id: string; content: string | null; grade: number | null; feedback: string | null; submittedAt: string }[];
}

export default function StudentHomeworkPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/assignments?studentId=${session.user.id}`)
      .then((r) => r.json())
      .then((d) => { setAssignments(d); setLoading(false); });
  }, [session?.user?.id]);

  async function submitHomework(assignmentId: string) {
    if (!session?.user?.id) return;
    setSubmitting(assignmentId);
    await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        studentId: session.user.id,
        content: answers[assignmentId] || "",
      }),
    });
    // Refresh
    const res = await fetch(`/api/assignments?studentId=${session.user.id}`);
    setAssignments(await res.json());
    setSubmitting(null);
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const pending = assignments.filter((a) => a.submissions.length === 0);
  const submitted = assignments.filter((a) => a.submissions.length > 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Homework</h1>
        <p className="text-gray-500">{pending.length} pending, {submitted.length} submitted</p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Pending Homework</h2>
          <div className="space-y-4">
            {pending.map((a) => (
              <Card key={a.id} className="border-l-4 border-l-yellow-400">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      <p className="text-sm text-gray-500">{a.class.course.title} — {a.class.name}</p>
                      {a.description && <p className="mt-1 text-sm text-gray-600">{a.description}</p>}
                    </div>
                    {a.dueDate && (
                      <Badge variant="warning">Due: {formatDate(a.dueDate)}</Badge>
                    )}
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Type your answer here..."
                    value={answers[a.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [a.id]: e.target.value })}
                  />
                  <Button
                    className="mt-2"
                    onClick={() => submitHomework(a.id)}
                    disabled={submitting === a.id}
                  >
                    <Send size={16} className="mr-2" />
                    {submitting === a.id ? "Submitting..." : "Submit"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Submitted */}
      {submitted.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Submitted</h2>
          <div className="space-y-3">
            {submitted.map((a) => {
              const sub = a.submissions[0];
              return (
                <Card key={a.id} className="border-l-4 border-l-green-400">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-500" />
                          {a.title}
                        </h3>
                        <p className="text-sm text-gray-500">{a.class.course.title}</p>
                        {sub.content && (
                          <div className="mt-2 rounded bg-gray-50 p-3 text-sm text-gray-700">{sub.content}</div>
                        )}
                      </div>
                      <div className="text-right">
                        {sub.grade !== null ? (
                          <Badge variant={sub.grade >= 70 ? "success" : sub.grade >= 50 ? "warning" : "danger"}>
                            Grade: {sub.grade}%
                          </Badge>
                        ) : (
                          <Badge variant="default">Awaiting Grade</Badge>
                        )}
                        <p className="mt-1 text-xs text-gray-400">Submitted: {formatDate(sub.submittedAt)}</p>
                      </div>
                    </div>
                    {sub.feedback && (
                      <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                        <strong>Feedback:</strong> {sub.feedback}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <ClipboardList size={48} className="text-gray-300" />
            <p className="mt-4 text-gray-500">No homework assigned yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
