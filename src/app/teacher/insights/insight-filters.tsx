"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Filter } from "lucide-react";

interface InsightFiltersProps {
  currentFilter: string;
  currentStudent: string;
  students: { id: string; name: string }[];
}

export function InsightFilters({
  currentFilter,
  currentStudent,
  students,
}: InsightFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(filter: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }
    router.push(`/teacher/insights?${params.toString()}`);
  }

  function setStudent(studentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!studentId) {
      params.delete("student");
    } else {
      params.set("student", studentId);
    }
    router.push(`/teacher/insights?${params.toString()}`);
  }

  async function markAllRead() {
    await fetch("/api/teacher/insights/mark-read", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <Filter size={16} className="text-gray-400" />
        <span className="text-sm text-gray-500 mr-1">Filter:</span>
        <Button
          size="sm"
          variant={currentFilter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={currentFilter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
        >
          <EyeOff size={14} className="mr-1" />
          Unread
        </Button>
      </div>

      {students.length > 0 && (
        <select
          className="flex h-8 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={currentStudent}
          onChange={(e) => setStudent(e.target.value)}
        >
          <option value="">All Students</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      <Button size="sm" variant="ghost" onClick={markAllRead}>
        <Eye size={14} className="mr-1" />
        Mark All Read
      </Button>
    </div>
  );
}
