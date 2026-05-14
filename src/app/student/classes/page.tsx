"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, GraduationCap, Users } from "lucide-react";

interface EnrolledClass {
  id: string;
  status: string;
  class: {
    name: string;
    schedule: string | null;
    meetingLink: string | null;
    course: { title: string; level: string };
    teacher: { name: string };
    _count: { enrollments: number; lessons: number };
  };
}

export default function StudentClassesPage() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/student/classes`)
      .then((r) => r.json())
      .then((d) => { setEnrollments(d); setLoading(false); });
  }, [session?.user?.id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-500">{enrollments.length} enrolled classes</p>
      </div>

      {enrollments.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-500"><BookOpen size={48} className="mx-auto mb-4 text-gray-300" />You are not enrolled in any classes yet</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((e) => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{e.class.name}</h3>
                    <Badge variant="info" className="mt-1">{e.class.course.title}</Badge>
                  </div>
                  <Badge variant={e.status === "ACTIVE" ? "success" : "default"}>{e.status}</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-2"><GraduationCap size={14} /> Teacher: {e.class.teacher.name}</p>
                  <p className="flex items-center gap-2"><Users size={14} /> {e.class._count.enrollments} classmates</p>
                  <p className="flex items-center gap-2"><BookOpen size={14} /> {e.class._count.lessons} lessons</p>
                  {e.class.schedule && <p className="flex items-center gap-2"><Calendar size={14} /> {e.class.schedule}</p>}
                </div>
                {e.class.meetingLink && (
                  <a
                    href={e.class.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Join Class
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
