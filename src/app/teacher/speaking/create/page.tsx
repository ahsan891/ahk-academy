"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic2, ArrowLeft, Check, BookOpen, Users } from "lucide-react";
import Link from "next/link";

interface TeacherClass {
  id: string;
  name: string;
  course: { title: string };
  _count: { enrollments: number; lessons: number };
}

interface Lesson {
  id: string;
  title: string;
  topics: string | null;
  content: string | null;
  date: string | null;
  order: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function CreateSpeakingSessionPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    topic: "",
    topicDetails: "",
    date: "",
    time: "",
    duration: 90,
    meetingLink: "",
    maxStudents: 5,
  });

  // Load teacher's classes
  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((d) => {
        setClasses(d);
        setLoading(false);
      });
  }, []);

  // Load lessons when class is selected
  useEffect(() => {
    if (!selectedClass) {
      setLessons([]);
      return;
    }
    fetch(`/api/lessons?classId=${selectedClass}`)
      .then((r) => r.json())
      .then(setLessons);

    // Load students for this class
    fetch(`/api/teacher/students?classId=${selectedClass}`)
      .then((r) => r.json())
      .then((d) => {
        setStudents(d);
        // Auto-select all students
        setSelectedStudents(d.map((s: Student) => s.id));
      });
  }, [selectedClass]);

  // Auto-fill topic when lesson is selected
  useEffect(() => {
    if (!selectedLesson) return;
    const lesson = lessons.find((l) => l.id === selectedLesson);
    if (lesson) {
      setFormData((prev) => ({
        ...prev,
        topic: lesson.topics || lesson.title,
        topicDetails: lesson.content || "",
      }));
    }
  }, [selectedLesson, lessons]);

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.topic || !formData.date || !formData.time) {
      setError("Please fill in topic, date, and time.");
      return;
    }
    if (selectedStudents.length === 0) {
      setError("Please select at least one student.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const res = await fetch("/api/teacher/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: formData.topic,
          topicDetails: formData.topicDetails,
          date: dateTime.toISOString(),
          duration: formData.duration,
          meetingLink: formData.meetingLink,
          maxStudents: formData.maxStudents,
          sourceLessonId: selectedLesson || null,
          studentIds: selectedStudents,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create session");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      router.push(`/teacher/speaking/${data.id}`);
    } catch {
      setError("Failed to create session. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">
          Create Speaking Session
        </h1>
        <p className="mt-1 text-gray-500">
          Create a speaking session based on your lesson topics
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Lesson Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select Class & Lesson */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} />
                  Source Lesson (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Select Class
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedLesson("");
                    }}
                  >
                    <option value="">-- Select a class --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.course.title})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClass && lessons.length > 0 && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Select Lesson (auto-fills topic)
                    </label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedLesson}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                    >
                      <option value="">-- Select a lesson --</option>
                      {lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          #{l.order} - {l.title}
                          {l.topics ? ` (${l.topics})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedClass && lessons.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No lessons found for this class. You can still create a
                    session with a custom topic.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic2 size={20} />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Topic *
                  </label>
                  <Input
                    placeholder="e.g., Past Tense Usage in Daily Conversation"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Topic Details / Preparation Tips
                  </label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what students should focus on, preparation tips, or key points from the lesson..."
                    value={formData.topicDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, topicDetails: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Time *
                    </label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min={15}
                      max={180}
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 90,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Max Students
                    </label>
                    <Input
                      type="number"
                      min={2}
                      max={10}
                      value={formData.maxStudents}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStudents: parseInt(e.target.value) || 5,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Meeting Link (Teams, Zoom, etc.)
                  </label>
                  <Input
                    placeholder="https://teams.microsoft.com/..."
                    value={formData.meetingLink}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingLink: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Student Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Select Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedClass ? (
                  <p className="text-sm text-gray-400">
                    Select a class first to see students.
                  </p>
                ) : students.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No enrolled students in this class.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">
                        {selectedStudents.length} / {students.length} selected
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (selectedStudents.length === students.length) {
                            setSelectedStudents([]);
                          } else {
                            setSelectedStudents(students.map((s) => s.id));
                          }
                        }}
                      >
                        {selectedStudents.length === students.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                    {students.map((student) => {
                      const isSelected = selectedStudents.includes(student.id);
                      return (
                        <button
                          key={student.id}
                          type="button"
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                            isSelected
                              ? "border-blue-300 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => toggleStudent(student.id)}
                        >
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded border ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && <Check size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {student.email}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <Card>
              <CardContent className="p-6">
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Speaking Session"}
                </Button>
                <p className="mt-2 text-center text-xs text-gray-400">
                  Students will be notified about the session
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
