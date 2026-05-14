"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft, BookOpen, Calendar, CreditCard, ClipboardList,
  CheckCircle, XCircle, Clock, Plus,
} from "lucide-react";
import Link from "next/link";

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  enrollments: {
    id: string;
    status: string;
    class: { id: string; name: string; course: { title: string }; teacher: { name: string }; schedule: string | null };
  }[];
  payments: { id: string; amount: number; paidAmount: number; status: string; description: string | null; dueDate: string | null; createdAt: string }[];
  attendances: { id: string; status: string; lesson: { title: string; date: string | null } }[];
  submissions: { id: string; grade: number | null; feedback: string | null; submittedAt: string; assignment: { title: string } }[];
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((r) => r.json())
      .then((d) => { setStudent(d); setLoading(false); });
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!student) return <p className="text-red-500">Student not found</p>;

  const totalPaid = student.payments.reduce((s, p) => s + p.paidAmount, 0);
  const totalOwed = student.payments.reduce((s, p) => s + (p.amount - p.paidAmount), 0);
  const presentCount = student.attendances.filter((a) => a.status === "PRESENT").length;
  const totalLessons = student.attendances.length;
  const attendanceRate = totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) : 100;
  const avgGrade = student.submissions.filter((s) => s.grade !== null);
  const avgGradeVal = avgGrade.length > 0 ? Math.round(avgGrade.reduce((s, sub) => s + (sub.grade || 0), 0) / avgGrade.length) : 0;

  return (
    <div>
      <Link href="/admin/students" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Students
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
          {student.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-500">{student.email} {student.phone && `• ${student.phone}`}</p>
          <p className="text-xs text-gray-400">Joined {formatDate(student.createdAt)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Attendance" value={`${attendanceRate}%`} icon={<Calendar size={24} />} description={`${presentCount}/${totalLessons} lessons`} />
        <StatsCard title="Total Paid" value={formatCurrency(totalPaid)} icon={<CreditCard size={24} />} />
        <StatsCard title="Balance Due" value={formatCurrency(totalOwed)} icon={<CreditCard size={24} />} />
        <StatsCard title="Avg Grade" value={avgGrade.length > 0 ? `${avgGradeVal}%` : "N/A"} icon={<ClipboardList size={24} />} description={`${avgGrade.length} graded`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Classes */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen size={20} /> Enrolled Classes</CardTitle></CardHeader>
          <CardContent>
            {student.enrollments.length === 0 ? (
              <p className="text-sm text-gray-500">Not enrolled in any classes</p>
            ) : (
              <div className="space-y-3">
                {student.enrollments.map((e) => (
                  <div key={e.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{e.class.name}</p>
                        <p className="text-sm text-gray-500">{e.class.course.title} • {e.class.teacher.name}</p>
                      </div>
                      <Badge variant={e.status === "ACTIVE" ? "success" : "default"}>{e.status}</Badge>
                    </div>
                    {e.class.schedule && <p className="mt-1 text-xs text-gray-400">{e.class.schedule}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard size={20} /> Payment History</CardTitle></CardHeader>
          <CardContent>
            {student.payments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {student.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{p.description || "Payment"}</p>
                      {p.dueDate && <p className="text-xs text-gray-400">Due: {formatDate(p.dueDate)}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(p.paidAmount)} / {formatCurrency(p.amount)}</p>
                      <Badge variant={p.status === "PAID" ? "success" : p.status === "PARTIAL" ? "warning" : "danger"}>{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar size={20} /> Attendance Record</CardTitle></CardHeader>
          <CardContent>
            {student.attendances.length === 0 ? (
              <p className="text-sm text-gray-500">No attendance records</p>
            ) : (
              <div className="space-y-2">
                {student.attendances.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div className="flex items-center gap-2">
                      {a.status === "PRESENT" ? <CheckCircle size={16} className="text-green-500" /> : a.status === "LATE" ? <Clock size={16} className="text-yellow-500" /> : <XCircle size={16} className="text-red-500" />}
                      <span className="text-sm">{a.lesson.title}</span>
                    </div>
                    <Badge variant={a.status === "PRESENT" ? "success" : a.status === "LATE" ? "warning" : "danger"}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList size={20} /> Homework Submissions</CardTitle></CardHeader>
          <CardContent>
            {student.submissions.length === 0 ? (
              <p className="text-sm text-gray-500">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {student.submissions.map((s) => (
                  <div key={s.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{s.assignment.title}</p>
                      {s.grade !== null ? (
                        <Badge variant={s.grade >= 70 ? "success" : s.grade >= 50 ? "warning" : "danger"}>{s.grade}%</Badge>
                      ) : (
                        <Badge variant="default">Pending</Badge>
                      )}
                    </div>
                    {s.feedback && <p className="mt-1 text-xs text-gray-500">{s.feedback}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
