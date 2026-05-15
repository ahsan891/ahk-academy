"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  topics: { id: string; title: string }[];
}

interface Student {
  id: string;
  name: string;
}

interface AssignGrammarTopicProps {
  students: Student[];
  categories: Category[];
}

export function AssignGrammarTopic({
  students,
  categories,
}: AssignGrammarTopicProps) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredTopics =
    categories.find((c) => c.id === selectedCategory)?.topics || [];

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent || !selectedTopic) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/grammar/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent,
          topicId: selectedTopic,
          dueDate: dueDate || null,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Topic assigned successfully!" });
        setSelectedStudent("");
        setSelectedCategory("");
        setSelectedTopic("");
        setDueDate("");
        // Refresh page to show new assignment
        window.location.reload();
      } else {
        const data = await res.json();
        setMessage({
          type: "error",
          text: data.error || "Failed to assign topic",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send size={20} />
          Assign Grammar Topic
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssign} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Student Dropdown */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Student
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">Select student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Category
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedTopic("");
              }}
              required
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Dropdown (filtered by category) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Topic
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedCategory}
              required
            >
              <option value="">
                {selectedCategory ? "Select topic..." : "Select category first"}
              </option>
              {filteredTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Due Date (optional)
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Assign
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Feedback Message */}
        {message && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {message.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
