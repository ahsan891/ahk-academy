import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, GraduationCap, CreditCard, BookOpen, TrendingUp, Clock } from "lucide-react";

export default async function AdminDashboard() {
  const [studentCount, teacherCount, classCount, payments, recentStudents, recentPayments] =
    await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "TEACHER" } }),
      db.class.count({ where: { isActive: true } }),
      db.payment.aggregate({
        _sum: { paidAmount: true, amount: true },
      }),
      db.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { student: true },
      }),
    ]);

  const totalRevenue = payments._sum.paidAmount || 0;
  const totalDue = (payments._sum.amount || 0) - totalRevenue;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome back, Ahsan. Here&apos;s your academy overview.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={studentCount}
          icon={<Users size={24} />}
          description="Enrolled students"
        />
        <StatsCard
          title="Teachers"
          value={teacherCount}
          icon={<GraduationCap size={24} />}
          description="Active teachers"
        />
        <StatsCard
          title="Active Classes"
          value={classCount}
          icon={<BookOpen size={24} />}
          description="Running classes"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<CreditCard size={24} />}
          description={`${formatCurrency(totalDue)} pending`}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Recent Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-gray-500">No students yet. Add your first student!</p>
            ) : (
              <div className="space-y-3">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(student.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={20} />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{payment.student.name}</p>
                      <p className="text-xs text-gray-500">{payment.description || "Payment"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(payment.paidAmount)}</p>
                      <Badge
                        variant={
                          payment.status === "PAID"
                            ? "success"
                            : payment.status === "PARTIAL"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
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
