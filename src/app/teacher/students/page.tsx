"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export default function TeacherStudentsPage() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch("/api/teacher/classes").then((r) => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetch(`/api/teacher/students?classId=${selectedClass}`).then((r) => r.json()).then(setStudents);
  }, [selectedClass]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-500">View students in your classes</p>
      </div>

      <select
        className="mb-6 flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        <option value="">Select Class</option>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {students.length === 0 && selectedClass ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No students in this class</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Mail size={12} /> {s.email}</span>
                    {s.phone && <span className="flex items-center gap-1"><Phone size={12} /> {s.phone}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
