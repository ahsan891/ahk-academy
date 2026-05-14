"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ClipboardList, Plus, Eye, Star } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  _count: { submissions: number };
}

interface Submission {
  id: string;
  content: string | null;
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
  student: { id: string; name: string; email: string };
}

export default function TeacherAssignmentsPage() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grading, setGrading] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [formData, setFormData] = useState({ title: "", description: "", dueDate: "" });

  useEffect(() => {
    fetch("/api/teacher/classes").then((r) => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetch(`/api/assignments?classId=${selectedClass}`).then((r) => r.json()).then(setAssignments);
  }, [selectedClass]);

  async function loadSubmissions(assignmentId: string) {
    setSelectedAssignment(assignmentId);
    const res = await fetch(`/api/submissions?assignmentId=${assignmentId}`);
    const data = await res.json();
    setSubmissions(data);
    const map: Record<string, { grade: string; feedback: string }> = {};
    data.forEach((s: Submission) => {
      map[s.id] = { grade: s.grade?.toString() || "", feedback: s.feedback || "" };
    });
    setGrading(map);
  }

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClass, ...formData }),
    });
    setFormData({ title: "", description: "", dueDate: "" });
    setShowCreate(false);
    fetch(`/api/assignments?classId=${selectedClass}`).then((r) => r.json()).then(setAssignments);
  }

  async function saveGrade(submissionId: string) {
    const g = grading[submissionId];
    await fetch("/api/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: submissionId, grade: parseFloat(g.grade), feedback: g.feedback }),
    });
    loadSubmissions(selectedAssignment!);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500">Create assignments and grade submissions</p>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          value={selectedClass}
          onChange={(e) => { setSelectedClass(e.target.value); setSelectedAssignment(null); }}
        >
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedClass && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus size={16} className="mr-2" /> New Assignment
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Create Assignment</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createAssignment} className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <Input placeholder="Due Date" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="sm:col-span-2" />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assignments List */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Assignments</h2>
          {assignments.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-gray-500">No assignments yet</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <Card
                  key={a.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${selectedAssignment === a.id ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => loadSubmissions(a.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        {a.description && <p className="text-sm text-gray-500">{a.description}</p>}
                      </div>
                      <div className="text-right">
                        <Badge variant="info">{a._count.submissions} submissions</Badge>
                        {a.dueDate && <p className="mt-1 text-xs text-gray-400">Due: {formatDate(a.dueDate)}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Submissions & Grading */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Submissions</h2>
          {!selectedAssignment ? (
            <Card><CardContent className="py-8 text-center text-gray-500">Select an assignment to view submissions</CardContent></Card>
          ) : submissions.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-gray-500">No submissions yet</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{sub.student.name}</p>
                        <p className="text-xs text-gray-500">Submitted: {formatDate(sub.submittedAt)}</p>
                      </div>
                      {sub.grade !== null && (
                        <Badge variant={sub.grade >= 70 ? "success" : sub.grade >= 50 ? "warning" : "danger"}>
                          {sub.grade}%
                        </Badge>
                      )}
                    </div>
                    {sub.content && (
                      <div className="mb-3 rounded bg-gray-50 p-3 text-sm text-gray-700">{sub.content}</div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Grade (0-100)"
                        type="number"
                        min="0"
                        max="100"
                        value={grading[sub.id]?.grade || ""}
                        onChange={(e) => setGrading({ ...grading, [sub.id]: { ...grading[sub.id], grade: e.target.value } })}
                        className="w-28"
                      />
                      <Input
                        placeholder="Feedback"
                        value={grading[sub.id]?.feedback || ""}
                        onChange={(e) => setGrading({ ...grading, [sub.id]: { ...grading[sub.id], feedback: e.target.value } })}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => saveGrade(sub.id)}>
                        <Star size={14} className="mr-1" /> Grade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
