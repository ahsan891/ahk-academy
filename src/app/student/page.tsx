import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookOpen, ClipboardList, Calendar, CreditCard } from "lucide-react";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session) return null;

  const studentId = session.user.id;

  const [enrollments, payments, attendanceStats, pendingAssignments] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      include: { class: { include: { course: true, teacher: true } } },
    }),
    db.payment.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.attendance.groupBy({
      by: ["status"],
      where: { studentId },
      _count: true,
    }),
    db.assignment.findMany({
      where: {
        classId: {
          in: (
            await db.enrollment.findMany({
              where: { studentId, status: "ACTIVE" },
              select: { classId: true },
            })
          ).map((e) => e.classId),
        },
        submissions: { none: { studentId } },
      },
      include: { class: { include: { course: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  const totalPresent = attendanceStats.find((a) => a.status === "PRESENT")?._count || 0;
  const totalAbsent = attendanceStats.find((a) => a.status === "ABSENT")?._count || 0;
  const totalLate = attendanceStats.find((a) => a.status === "LATE")?._count || 0;
  const totalClasses = totalPresent + totalAbsent + totalLate;
  const attendanceRate = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 100;

  const totalDue = payments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session.user.name.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-gray-500">Here&apos;s your learning overview.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Classes"
          value={enrollments.length}
          icon={<BookOpen size={24} />}
        />
        <StatsCard
          title="Pending Homework"
          value={pendingAssignments.length}
          icon={<ClipboardList size={24} />}
        />
        <StatsCard
          title="Attendance"
          value={`${attendanceRate}%`}
          icon={<Calendar size={24} />}
          description={`${totalPresent} present, ${totalAbsent} absent`}
        />
        <StatsCard
          title="Balance Due"
          value={formatCurrency(totalDue)}
          icon={<CreditCard size={24} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={20} />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-sm text-gray-500">You&apos;re not enrolled in any classes yet.</p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{enrollment.class.name}</p>
                        <p className="text-sm text-gray-500">{enrollment.class.course.title}</p>
                      </div>
                      <Badge variant="info">{enrollment.class.teacher.name}</Badge>
                    </div>
                    {enrollment.class.schedule && (
                      <p className="mt-1 text-xs text-gray-400">{enrollment.class.schedule}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Homework */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList size={20} />
              Pending Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingAssignments.length === 0 ? (
              <p className="text-sm text-gray-500">All caught up! No pending homework.</p>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border p-3">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-sm text-gray-500">{assignment.class.course.title}</p>
                    {assignment.dueDate && (
                      <p className="mt-1 text-xs text-red-500">
                        Due: {formatDate(assignment.dueDate)}
                      </p>
                    )}
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
