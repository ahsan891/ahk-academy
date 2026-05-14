"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, CheckCircle, XCircle, Clock, Save } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  date: string | null;
}

interface AttendanceRecord {
  studentId: string;
  status: string;
}

export default function TeacherAttendancePage() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/teacher/classes").then((r) => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetch(`/api/lessons?classId=${selectedClass}`).then((r) => r.json()).then(setLessons);
    // Get enrolled students
    fetch(`/api/teacher/students?classId=${selectedClass}`).then((r) => r.json()).then(setStudents);
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedLesson) return;
    // Load existing attendance
    fetch(`/api/attendance?lessonId=${selectedLesson}`)
      .then((r) => r.json())
      .then((records: AttendanceRecord[]) => {
        const map: Record<string, string> = {};
        records.forEach((r) => { map[r.studentId] = r.status; });
        setAttendance(map);
      });
  }, [selectedLesson]);

  function toggleStatus(studentId: string) {
    const current = attendance[studentId] || "PRESENT";
    const next = current === "PRESENT" ? "ABSENT" : current === "ABSENT" ? "LATE" : "PRESENT";
    setAttendance({ ...attendance, [studentId]: next });
  }

  async function saveAttendance() {
    setSaving(true);
    const records = students.map((s) => ({
      studentId: s.id,
      lessonId: selectedLesson,
      status: attendance[s.id] || "PRESENT",
    }));

    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Take Attendance</h1>
        <p className="text-gray-500">Mark students present, absent, or late</p>
      </div>

      {/* Class & Lesson Selection */}
      <div className="mb-6 flex gap-4">
        <select
          className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          value={selectedClass}
          onChange={(e) => { setSelectedClass(e.target.value); setSelectedLesson(""); }}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(e.target.value)}
          disabled={!selectedClass}
        >
          <option value="">Select Lesson</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      </div>

      {selectedLesson && students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck size={20} />
                Attendance ({students.length} students)
              </CardTitle>
              <Button onClick={saveAttendance} disabled={saving}>
                <Save size={16} className="mr-2" />
                {saving ? "Saving..." : saved ? "Saved!" : "Save Attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student) => {
                const status = attendance[student.id] || "PRESENT";
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleStatus(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === "PRESENT" && <CheckCircle size={20} className="text-green-500" />}
                      {status === "ABSENT" && <XCircle size={20} className="text-red-500" />}
                      {status === "LATE" && <Clock size={20} className="text-yellow-500" />}
                      <Badge
                        variant={status === "PRESENT" ? "success" : status === "ABSENT" ? "danger" : "warning"}
                        className="min-w-[70px] justify-center"
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-gray-400">Click on a student to toggle: Present → Absent → Late → Present</p>
          </CardContent>
        </Card>
      )}

      {selectedLesson && students.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No students enrolled in this class
          </CardContent>
        </Card>
      )}
    </div>
  );
}
