import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // ===== Core Stats =====
  const totalStudents = await db.user.count({
    where: { role: "STUDENT" },
  });

  const totalTeachers = await db.user.count({
    where: { role: "TEACHER" },
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const sessionsThisMonth = await db.speakingSession.count({
    where: { date: { gte: monthStart } },
  });

  // Revenue this month
  const revenueThisMonth = await db.paymentTransaction.findMany({
    where: {
      createdAt: { gte: monthStart },
      status: "CONFIRMED",
    },
    select: { amount: true, method: true },
  });

  const totalRevenue = revenueThisMonth.reduce((sum, t) => sum + t.amount, 0);

  // ===== Revenue Breakdown by Method =====
  const revenueByMethod: Record<string, { count: number; total: number }> = {};
  for (const tx of revenueThisMonth) {
    const method = tx.method || "OTHER";
    if (!revenueByMethod[method]) {
      revenueByMethod[method] = { count: 0, total: 0 };
    }
    revenueByMethod[method].count++;
    revenueByMethod[method].total += tx.amount;
  }

  // ===== Student Growth =====
  const activeStudents = await db.studentProfile.count({
    where: { isActive: true },
  });

  const inactiveStudents = await db.studentProfile.count({
    where: { isActive: false },
  });

  // ===== Session Completion Rate =====
  const allSessionsThisMonth = await db.speakingSession.findMany({
    where: { date: { gte: monthStart } },
    select: { status: true },
  });

  const completedSessions = allSessionsThisMonth.filter((s) => s.status === "completed").length;
  const completionRate = allSessionsThisMonth.length > 0
    ? Math.round((completedSessions / allSessionsThisMonth.length) * 100)
    : 0;

  // ===== Country Distribution =====
  const studentsWithCountry = await db.user.findMany({
    where: {
      role: "STUDENT",
      country: { not: null },
    },
    select: { country: true },
  });

  const countryDistribution: Record<string, number> = {};
  for (const s of studentsWithCountry) {
    const country = s.country || "Unknown";
    countryDistribution[country] = (countryDistribution[country] || 0) + 1;
  }

  const sortedCountries = Object.entries(countryDistribution)
    .sort((a, b) => b[1] - a[1]);

  // ===== Level Distribution =====
  const studentProfiles = await db.studentProfile.findMany({
    where: { isActive: true },
    select: { level: true },
  });

  const levelDistribution: Record<string, number> = {};
  for (const sp of studentProfiles) {
    levelDistribution[sp.level] = (levelDistribution[sp.level] || 0) + 1;
  }

  const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const sortedLevels = levelOrder
    .filter((l) => levelDistribution[l])
    .map((l) => ({ level: l, count: levelDistribution[l] }));

  // ===== Top Performing Students =====
  const studentAnalyses = await db.sessionAnalysis.findMany({
    where: {
      participationScore: { not: null },
    },
    select: {
      studentId: true,
      participationScore: true,
      student: { select: { name: true } },
    },
  });

  // Group by student and calculate averages
  const studentScores: Record<string, { name: string; totalScore: number; count: number }> = {};
  for (const a of studentAnalyses) {
    if (!studentScores[a.studentId]) {
      studentScores[a.studentId] = { name: a.student.name, totalScore: 0, count: 0 };
    }
    studentScores[a.studentId].totalScore += a.participationScore || 0;
    studentScores[a.studentId].count++;
  }

  const topStudents = Object.entries(studentScores)
    .map(([id, data]) => ({
      id,
      name: data.name,
      avgScore: (data.totalScore / data.count).toFixed(1),
      sessionsAnalyzed: data.count,
    }))
    .sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore))
    .slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={totalStudents}
          description={`${activeStudents} active`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }
        />
        <StatsCard
          title="Total Teachers"
          value={totalTeachers}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }
        />
        <StatsCard
          title="Sessions This Month"
          value={sessionsThisMonth}
          description={`${completionRate}% completion rate`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          }
        />
        <StatsCard
          title="Revenue This Month"
          value={`$${totalRevenue.toFixed(0)}`}
          description={`${revenueThisMonth.length} transactions`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          }
        />
      </div>

      {/* Revenue Breakdown & Student Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Method */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(revenueByMethod).length === 0 ? (
              <p className="text-sm text-gray-500">No transactions this month.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(revenueByMethod).map(([method, data]) => (
                  <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{method}</p>
                      <p className="text-xs text-gray-500">{data.count} transactions</p>
                    </div>
                    <p className="font-bold text-sm">${data.total.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Student Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Students</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{activeStudents}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inactive Students</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-400 h-2 rounded-full"
                      style={{ width: `${totalStudents > 0 ? (inactiveStudents / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{inactiveStudents}</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Registered</span>
                  <span className="font-bold">{totalStudents}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Completion & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Country</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedCountries.length === 0 ? (
              <p className="text-sm text-gray-500">No country data available.</p>
            ) : (
              <div className="space-y-2">
                {sortedCountries.slice(0, 10).map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / (sortedCountries[0]?.[1] || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Level</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedLevels.length === 0 ? (
              <p className="text-sm text-gray-500">No level data available.</p>
            ) : (
              <div className="space-y-2">
                {sortedLevels.map(({ level, count }) => (
                  <div key={level} className="flex items-center justify-between">
                    <Badge variant="outline" className="w-10 justify-center">{level}</Badge>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${(count / Math.max(...sortedLevels.map((l) => l.count), 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Students */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Students</CardTitle>
        </CardHeader>
        <CardContent>
          {topStudents.length === 0 ? (
            <p className="text-sm text-gray-500">No analysis data available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-gray-700">#</th>
                    <th className="pb-3 font-medium text-gray-700">Student</th>
                    <th className="pb-3 font-medium text-gray-700">Avg Score</th>
                    <th className="pb-3 font-medium text-gray-700">Sessions Analyzed</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, index) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="py-3 text-gray-500">{index + 1}</td>
                      <td className="py-3 font-medium">{student.name}</td>
                      <td className="py-3">
                        <Badge className={
                          parseFloat(student.avgScore) >= 8
                            ? "bg-green-100 text-green-700"
                            : parseFloat(student.avgScore) >= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }>
                          {student.avgScore}/10
                        </Badge>
                      </td>
                      <td className="py-3">{student.sessionsAnalyzed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
