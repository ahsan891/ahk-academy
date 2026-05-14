import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default async function TutorEarningsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tutorProfile = await db.tutorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!tutorProfile) redirect("/tutor/dashboard");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [totalEarningsResult, thisMonthResult, lastMonthResult, completedBookings, transactions] =
    await Promise.all([
      db.mktBooking.aggregate({
        where: { tutorId: session.user.id, status: "completed" },
        _sum: { tutorEarnings: true },
      }),
      db.mktBooking.aggregate({
        where: {
          tutorId: session.user.id,
          status: "completed",
          scheduledAt: { gte: startOfMonth },
        },
        _sum: { tutorEarnings: true },
        _count: true,
      }),
      db.mktBooking.aggregate({
        where: {
          tutorId: session.user.id,
          status: "completed",
          scheduledAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { tutorEarnings: true },
      }),
      db.mktBooking.findMany({
        where: { tutorId: session.user.id, status: "completed" },
        include: {
          student: { select: { name: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 20,
      }),
      db.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

  const totalEarnings = totalEarningsResult._sum.tutorEarnings || 0;
  const thisMonthEarnings = thisMonthResult._sum.tutorEarnings || 0;
  const thisMonthLessons = thisMonthResult._count || 0;
  const lastMonthEarnings = lastMonthResult._sum.tutorEarnings || 0;

  const monthlyChange =
    lastMonthEarnings > 0
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
      : thisMonthEarnings > 0
      ? 100
      : 0;

  const TRANSACTION_STATUS: Record<string, { variant: "success" | "warning" | "error" | "default" | "outline"; label: string }> = {
    completed: { variant: "success", label: "Completed" },
    pending: { variant: "warning", label: "Pending" },
    failed: { variant: "error", label: "Failed" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-500 mt-1">Track your income and payment history.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(thisMonthEarnings)}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {monthlyChange >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      monthlyChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(monthlyChange).toFixed(1)}% vs last month
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lessons This Month</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{thisMonthLessons}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Avg {thisMonthLessons > 0 ? formatCurrency(thisMonthEarnings / thisMonthLessons) : "$0.00"} per lesson
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completed Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {completedBookings.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No completed lessons yet.
              </p>
            ) : (
              <div className="space-y-3">
                {completedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                        {booking.student.name?.[0] || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.scheduledAt
                            ? formatDate(booking.scheduledAt)
                            : "N/A"}{" "}
                          &middot; {booking.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-green-600">
                      +{formatCurrency(booking.tutorEarnings)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No transactions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const txStatus = TRANSACTION_STATUS[tx.status] || {
                    variant: "outline" as const,
                    label: tx.status,
                  };
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {tx.description || tx.type.replace(/_/g, " ")}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs text-gray-500">
                            {formatDate(tx.createdAt)}
                          </p>
                          <Badge variant={txStatus.variant}>{txStatus.label}</Badge>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          tx.type === "payout" || tx.type === "earning"
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        {tx.type === "payout" || tx.type === "earning" ? "+" : ""}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
