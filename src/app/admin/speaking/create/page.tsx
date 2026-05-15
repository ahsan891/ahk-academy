"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Search, Check } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string;
}

export default function CreateSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    topicDetails: "",
    date: "",
    duration: "90",
    meetingLink: "",
    sourceType: "system",
    maxStudents: "5",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/topics").then((r) => r.json()),
    ]).then(([studentsData, topicsData]) => {
      setStudents(studentsData);
      setTopics(topicsData);
    });
  }, []);

  function handleTopicSelect(topicId: string) {
    setSelectedTopicId(topicId);
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      setFormData((prev) => ({
        ...prev,
        topic: topic.title,
        topicDetails: topic.description || "",
      }));
    }
  }

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : prev.length < parseInt(formData.maxStudents)
          ? [...prev, studentId]
          : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.topic || !formData.date) return;

    setLoading(true);
    try {
      const res = await fetch("/api/speaking-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: formData.topic,
          topicDetails: formData.topicDetails || null,
          date: formData.date,
          duration: parseInt(formData.duration),
          meetingLink: formData.meetingLink || null,
          sourceType: formData.sourceType,
          maxStudents: parseInt(formData.maxStudents),
          participantIds: selectedStudents,
          topicId: selectedTopicId || null,
        }),
      });

      if (res.ok) {
        router.push("/admin/speaking");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create session");
      }
    } catch {
      alert("Failed to create session");
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div>
      <Link
        href="/admin/speaking"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back to Speaking Sessions
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Speaking Session
        </h1>
        <p className="mt-1 text-gray-500">
          Schedule a new group speaking practice session
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Session Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Topic from Bank */}
                {topics.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Select from Topic Bank (optional)
                    </label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => handleTopicSelect(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Custom topic --</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}{" "}
                          {t.category ? `(${t.category})` : ""} -{" "}
                          {t.level}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Topic */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Topic *
                  </label>
                  <Input
                    placeholder="e.g., Debating Climate Change Solutions"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Topic Details */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Topic Details
                  </label>
                  <textarea
                    placeholder="Describe the topic, key discussion points, materials to prepare..."
                    value={formData.topicDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, topicDetails: e.target.value })
                    }
                    rows={4}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date & Duration */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Date & Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Meeting Link & Source Type */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Meeting Link
                    </label>
                    <Input
                      placeholder="https://teams.microsoft.com/..."
                      value={formData.meetingLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingLink: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Source Type
                    </label>
                    <select
                      value={formData.sourceType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sourceType: e.target.value,
                        })
                      }
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="system">System</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                </div>

                {/* Max Students */}
                <div className="w-48">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Max Students
                  </label>
                  <Input
                    type="number"
                    min="2"
                    max="20"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, maxStudents: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Create Session
                  </>
                )}
              </Button>
              <Link href="/admin/speaking">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>

          {/* Student Selector */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Select Students</span>
                  <Badge variant="info">
                    {selectedStudents.length}/{formData.maxStudents}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="Search students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Selected Students */}
                {selectedStudents.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedStudents.map((id) => {
                      const student = students.find((s) => s.id === id);
                      return student ? (
                        <Badge
                          key={id}
                          variant="info"
                          className="flex items-center gap-1 py-1 px-2 cursor-pointer"
                          onClick={() => toggleStudent(id)}
                        >
                          {student.name}
                          <X size={12} />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Student List */}
                <div className="max-h-96 space-y-1 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                      No students found
                    </p>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = selectedStudents.includes(student.id);
                      return (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => toggleStudent(student.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              isSelected
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {student.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
