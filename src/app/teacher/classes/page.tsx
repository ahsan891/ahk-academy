"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Plus, Calendar } from "lucide-react";
import Link from "next/link";

interface TeacherClass {
  id: string;
  name: string;
  schedule: string | null;
  maxStudents: number;
  course: { title: string };
  _count: { enrollments: number; lessons: number };
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((d) => { setClasses(d); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-500">Manage your classes and students</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookOpen size={48} className="text-gray-300" />
            <p className="mt-4 text-gray-500">No classes assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                <Badge variant="info" className="mt-1">{cls.course.title}</Badge>
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-2"><Users size={14} /> {cls._count.enrollments} / {cls.maxStudents} students</p>
                  <p className="flex items-center gap-2"><BookOpen size={14} /> {cls._count.lessons} lessons</p>
                  {cls.schedule && <p className="flex items-center gap-2"><Calendar size={14} /> {cls.schedule}</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/teacher/attendance?classId=${cls.id}`}>
                    <Button size="sm" variant="outline">Take Attendance</Button>
                  </Link>
                  <Link href={`/teacher/lessons?classId=${cls.id}`}>
                    <Button size="sm" variant="outline">Lessons</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
