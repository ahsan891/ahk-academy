"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatDate } from "@/lib/utils";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

interface AttendanceRecord {
  id: string;
  status: string;
  createdAt: string;
  lesson: { title: string; date: string | null; order: number };
}

export default function StudentAttendancePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/attendance?studentId=${session.user.id}`)
      .then((r) => r.json())
      .then((d) => { setRecords(d); setLoading(false); });
  }, [session?.user?.id]);

  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const total = records.length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 100;

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500">Track your attendance across all lessons</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Attendance Rate" value={`${rate}%`} icon={<Calendar size={24} />} />
        <StatsCard title="Present" value={present} icon={<CheckCircle size={24} />} />
        <StatsCard title="Absent" value={absent} icon={<XCircle size={24} />} />
        <StatsCard title="Late" value={late} icon={<Clock size={24} />} />
      </div>

      {records.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">No attendance records yet</CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Attendance History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    {r.status === "PRESENT" && <CheckCircle size={18} className="text-green-500" />}
                    {r.status === "ABSENT" && <XCircle size={18} className="text-red-500" />}
                    {r.status === "LATE" && <Clock size={18} className="text-yellow-500" />}
                    <div>
                      <p className="font-medium text-sm">{r.lesson.title}</p>
                      {r.lesson.date && <p className="text-xs text-gray-400">{formatDate(r.lesson.date)}</p>}
                    </div>
                  </div>
                  <Badge variant={r.status === "PRESENT" ? "success" : r.status === "LATE" ? "warning" : "danger"}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
