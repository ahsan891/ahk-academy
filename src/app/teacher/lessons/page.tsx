"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { FileText, Plus, BookOpen, Sparkles } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  topics: string | null;
  videoUrl: string | null;
  order: number;
  date: string | null;
  _count: { attendances: number };
}

export default function TeacherLessonsPage() {
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("classId");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState(classIdParam || "");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", topics: "", date: "" });
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teacher/classes").then((r) => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetch(`/api/lessons?classId=${selectedClass}`).then((r) => r.json()).then(setLessons);
  }, [selectedClass]);

  async function createLesson(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClass, ...formData }),
    });
    setFormData({ title: "", content: "", topics: "", date: "" });
    setShowCreate(false);
    fetch(`/api/lessons?classId=${selectedClass}`).then((r) => r.json()).then(setLessons);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
        <p className="text-gray-500">Create and manage lessons for your classes</p>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedClass && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus size={16} className="mr-2" /> New Lesson
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Create Lesson</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createLesson} className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Lesson Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <Input placeholder="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              <Input placeholder="Topics covered" value={formData.topics} onChange={(e) => setFormData({ ...formData, topics: e.target.value })} />
              <Input placeholder="Content / Notes" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Create Lesson</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {lessons.length === 0 && selectedClass ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No lessons yet. Create your first lesson!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
                    {lesson.order}
                  </div>
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    {lesson.topics && <p className="text-sm text-gray-500">Topics: {lesson.topics}</p>}
                    {lesson.content && <p className="text-xs text-gray-400 mt-0.5">{lesson.content}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={generating === lesson.id}
                    onClick={async () => {
                      setGenerating(lesson.id);
                      await fetch("/api/ai/generate-homework", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lessonId: lesson.id, classId: selectedClass }),
                      });
                      setGenerating(null);
                      alert("Homework generated and assigned!");
                    }}
                  >
                    <Sparkles size={14} className="mr-1" />
                    {generating === lesson.id ? "Generating..." : "AI Homework"}
                  </Button>
                  <div className="text-right">
                    {lesson.date && <p className="text-xs text-gray-400">{formatDate(lesson.date)}</p>}
                    <Badge variant="info" className="mt-1">{lesson._count.attendances} attended</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
