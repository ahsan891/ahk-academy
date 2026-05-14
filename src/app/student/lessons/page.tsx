"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatDate } from "@/lib/utils";
import { BookOpen, FileText, CheckCircle, Target } from "lucide-react";

interface LessonData {
  id: string;
  title: string;
  content: string | null;
  topics: string | null;
  order: number;
  date: string | null;
  attended: boolean;
}

export default function StudentLessonsPage() {
  const { data: session } = useSession();
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/student/lessons`)
      .then((r) => r.json())
      .then((d) => { setLessons(d); setLoading(false); });
  }, [session?.user?.id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const completed = lessons.filter((l) => l.attended).length;
  const total = 100; // 100 lessons package
  const progress = Math.round((completed / total) * 100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Lessons</h1>
        <p className="text-gray-500">Track your learning journey</p>
      </div>

      {/* Progress */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatsCard title="Lessons Completed" value={completed} icon={<CheckCircle size={24} />} description={`out of ${total} total`} />
        <StatsCard title="Topics Covered" value={lessons.filter((l) => l.topics).length} icon={<FileText size={24} />} />
        <StatsCard title="Course Progress" value={`${progress}%`} icon={<Target size={24} />} />
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Course Progress: {completed} / {total} lessons</p>
            <p className="text-sm text-gray-500">{progress}%</p>
          </div>
          <div className="h-4 w-full rounded-full bg-gray-200">
            <div className="h-4 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Lesson List */}
      {lessons.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No lessons yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className={lesson.attended ? "border-l-4 border-l-green-400" : "border-l-4 border-l-gray-200"}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${lesson.attended ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                    {lesson.order}
                  </div>
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    {lesson.topics && <p className="text-sm text-gray-500">Topics: {lesson.topics}</p>}
                    {lesson.content && <p className="text-xs text-gray-400 mt-0.5">{lesson.content}</p>}
                  </div>
                </div>
                <div className="text-right">
                  {lesson.date && <p className="text-xs text-gray-400">{formatDate(lesson.date)}</p>}
                  <Badge variant={lesson.attended ? "success" : "default"} className="mt-1">
                    {lesson.attended ? "Completed" : "Upcoming"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
