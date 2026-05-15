"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Calendar, Link2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TopicActionsProps {
  lessons: {
    id: string;
    title: string;
    topics: string | null;
    className: string;
  }[];
  upcomingSessions: {
    id: string;
    topic: string;
    date: string;
    topicId: string | null;
  }[];
}

export function TopicActions({ lessons, upcomingSessions }: TopicActionsProps) {
  const router = useRouter();
  const [selectedLesson, setSelectedLesson] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "intermediate",
    preparationTips: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleLessonSelect(lessonId: string) {
    setSelectedLesson(lessonId);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setFormData((prev) => ({
        ...prev,
        title: lesson.topics || lesson.title,
        description: `Topic based on lesson "${lesson.title}" from ${lesson.className}`,
        category: "lesson-based",
      }));
    }
  }

  async function createTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/teacher/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create topic");
      } else {
        setSuccess("Topic created successfully!");
        setFormData({
          title: "",
          description: "",
          category: "",
          level: "intermediate",
          preparationTips: "",
        });
        setSelectedLesson("");
        router.refresh();
      }
    } catch {
      setError("Failed to create topic.");
    }
    setSubmitting(false);
  }

  async function assignTopicToSession(
    sessionId: string,
    topicTitle: string
  ) {
    setAssigning(sessionId);
    setError("");
    try {
      const res = await fetch(`/api/teacher/speaking/${sessionId}/assign-topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicTitle }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to assign topic");
      } else {
        setSuccess(`Topic assigned to session!`);
        router.refresh();
      }
    } catch {
      setError("Failed to assign topic.");
    }
    setAssigning(null);
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

      {/* Create Topic Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus size={18} />
            Create Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createTopic} className="space-y-3">
            {/* Optional: Create from lesson */}
            {lessons.length > 0 && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Create from Lesson (optional)
                </label>
                <select
                  className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedLesson}
                  onChange={(e) => handleLessonSelect(e.target.value)}
                >
                  <option value="">-- Select a lesson --</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.className})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Title *
              </label>
              <Input
                placeholder="e.g., Past Tense in Conversation"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Description
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What students should discuss..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Category
                </label>
                <select
                  className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  <option value="grammar">Grammar</option>
                  <option value="vocabulary">Vocabulary</option>
                  <option value="pronunciation">Pronunciation</option>
                  <option value="conversation">Conversation</option>
                  <option value="debate">Debate</option>
                  <option value="presentation">Presentation</option>
                  <option value="lesson-based">Lesson-Based</option>
                  <option value="current-events">Current Events</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Level
                </label>
                <select
                  className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Preparation Tips
              </label>
              <textarea
                className="flex min-h-[60px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How students should prepare for this topic..."
                value={formData.preparationTips}
                onChange={(e) =>
                  setFormData({ ...formData, preparationTips: e.target.value })
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating..." : "Create Topic"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Assign to Upcoming Session */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 size={18} />
              Assign to Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">
              Update the topic of an upcoming session.
            </p>
            {upcomingSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{s.topic}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(s.date)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={assigning === s.id}
                  onClick={() => {
                    const newTopic = prompt(
                      "Enter the new topic for this session:",
                      s.topic
                    );
                    if (newTopic && newTopic !== s.topic) {
                      assignTopicToSession(s.id, newTopic);
                    }
                  }}
                >
                  {assigning === s.id ? "..." : "Change Topic"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
