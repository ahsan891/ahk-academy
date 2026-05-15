"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Trash2, Edit2, X, Check, Search } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string;
  preparationTips: string | null;
  isSystemGenerated: boolean;
  createdBy: { id: string; name: string } | null;
  createdAt: string;
}

const CATEGORIES = [
  "Grammar",
  "Conversation",
  "Debate",
  "Business",
  "Culture",
  "Current Events",
  "Interview",
  "Travel",
];

const LEVELS = ["beginner", "elementary", "intermediate", "upper_intermediate", "advanced"];

function getCategoryVariant(category: string | null) {
  switch (category) {
    case "Grammar":
      return "info" as const;
    case "Debate":
      return "danger" as const;
    case "Business":
      return "warning" as const;
    case "Culture":
    case "Travel":
      return "success" as const;
    default:
      return "default" as const;
  }
}

function getLevelVariant(level: string) {
  switch (level) {
    case "beginner":
    case "elementary":
      return "success" as const;
    case "intermediate":
      return "info" as const;
    case "upper_intermediate":
    case "advanced":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function formatLevel(level: string) {
  return level
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "intermediate",
    preparationTips: "",
  });

  useEffect(() => {
    fetchTopics();
  }, [filterCategory, filterLevel]);

  async function fetchTopics() {
    const params = new URLSearchParams();
    if (filterCategory !== "all") params.set("category", filterCategory);
    if (filterLevel !== "all") params.set("level", filterLevel);
    const res = await fetch(`/api/topics?${params}`);
    const data = await res.json();
    setTopics(data);
    setLoading(false);
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      category: "",
      level: "intermediate",
      preparationTips: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(topic: Topic) {
    setFormData({
      title: topic.title,
      description: topic.description || "",
      category: topic.category || "",
      level: topic.level,
      preparationTips: topic.preparationTips || "",
    });
    setEditingId(topic.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      // Update
      const res = await fetch(`/api/topics/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        resetForm();
        fetchTopics();
      }
    } else {
      // Create
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        resetForm();
        fetchTopics();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    const res = await fetch(`/api/topics/${id}`, { method: "DELETE" });
    if (res.ok) fetchTopics();
  }

  const filtered = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Topic Bank</h1>
          <p className="mt-1 text-gray-500">
            {topics.length} topics available for speaking sessions
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="mr-2" />
          Add Topic
        </Button>
      </div>

      {/* Add/Edit Topic Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingId ? "Edit Topic" : "Add New Topic"}</span>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <Input
                    placeholder="e.g., Debating Climate Change Solutions"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the topic, key discussion points..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {formatLevel(l)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Preparation Tips
                  </label>
                  <textarea
                    placeholder="Tips for students to prepare before the session..."
                    value={formData.preparationTips}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preparationTips: e.target.value,
                      })
                    }
                    rows={2}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Check size={16} className="mr-1" />
                  {editingId ? "Update Topic" : "Add Topic"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {formatLevel(l)}
            </option>
          ))}
        </select>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <p className="text-gray-500">Loading topics...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookOpen size={48} className="text-gray-300" />
            <p className="mt-4 text-gray-500">No topics found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowForm(true)}
            >
              Add Your First Topic
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((topic) => (
            <Card
              key={topic.id}
              className="transition-shadow hover:shadow-md flex flex-col"
            >
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {topic.category && (
                      <Badge variant={getCategoryVariant(topic.category)}>
                        {topic.category}
                      </Badge>
                    )}
                    <Badge variant={getLevelVariant(topic.level)}>
                      {formatLevel(topic.level)}
                    </Badge>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => startEdit(topic)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {topic.title}
                </h3>
                {topic.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-3 flex-1">
                    {topic.description}
                  </p>
                )}
                {topic.preparationTips && (
                  <div className="mt-auto rounded-md bg-blue-50 px-3 py-2">
                    <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-0.5">
                      Prep Tips
                    </p>
                    <p className="text-xs text-blue-800 line-clamp-2">
                      {topic.preparationTips}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
