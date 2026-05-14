"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Users, GraduationCap } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  schedule: string | null;
  maxStudents: number;
  meetingLink: string | null;
  course: { id: string; title: string };
  teacher: { id: string; name: string };
  _count: { enrollments: number };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    courseTitle: "",
    teacherId: "",
    schedule: "",
    maxStudents: "30",
    meetingLink: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  async function fetchClasses() {
    const res = await fetch("/api/classes");
    setClasses(await res.json());
    setLoading(false);
  }

  async function fetchTeachers() {
    const res = await fetch("/api/teachers");
    setTeachers(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // First create the course, then the class
    const courseRes = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formData.courseTitle }),
    });
    const course = await courseRes.json();

    await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        courseId: course.id,
        teacherId: formData.teacherId,
        schedule: formData.schedule,
        maxStudents: parseInt(formData.maxStudents),
        meetingLink: formData.meetingLink,
      }),
    });

    setFormData({ name: "", courseTitle: "", teacherId: "", schedule: "", maxStudents: "30", meetingLink: "" });
    setShowForm(false);
    fetchClasses();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500">{classes.length} active classes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="mr-2" />
          Create Class
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Class</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Class Name (e.g., English A1 Morning)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Course Title (e.g., English Beginner)"
                value={formData.courseTitle}
                onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                required
              />
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Schedule (e.g., Mon/Wed 10:00 AM)"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              />
              <Input
                placeholder="Max Students"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
              />
              <Input
                placeholder="Meeting Link (optional)"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Create Class</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookOpen size={48} className="text-gray-300" />
            <p className="mt-4 text-gray-500">No classes yet. Create your first class!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                  <Badge variant="info">{cls.course.title}</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <GraduationCap size={14} />
                    {cls.teacher.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users size={14} />
                    {cls._count.enrollments} / {cls.maxStudents} students
                  </p>
                  {cls.schedule && (
                    <p className="text-xs text-gray-400">{cls.schedule}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
