import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";

export default async function TeacherAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  const teacherId = session.user.id;

  // Total students assigned to this teacher
  const totalStudents = await db.studentProfile.count({
    where: { teacherId, isActive: true },
  });

  // Sessions this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const sessionsThisMonth = await db.speakingSession.count({
    where: {
      createdById: teacherId,
      date: { gte: monthStart },
    },
  });

  // Average student participation score
  const analyses = await db.sessionAnalysis.findMany({
    where: {
      session: { createdById: teacherId },
      participationScore: { not: null },
    },
    select: { participationScore: true },
  });

  const avgScore = analyses.length > 0
    ? (analyses.reduce((sum, a) => sum + (a.participationScore || 0), 0) / analyses.length).toFixed(1)
    : "N/A";

  // Resources generated
  const resourcesGenerated = await db.teacherResource.count({
    where: { teacherId },
  });

  // Student progress data
  const students = await db.studentProfile.findMany({
    where: { teacherId, isActive: true },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  // Get student analytics
  const studentAnalytics = await Promise.all(
    students.map(async (sp) => {
      // Sessions attended
      const participations = await db.sessionParticipant.findMany({
        where: {
          studentId: sp.user.id,
          attended: true,
        },
      });

      // Recent analyses
      const studentAnalyses = await db.sessionAnalysis.findMany({
        where: { studentId: sp.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { participationScore: true, createdAt: true },
      });

      const avgParticipation = studentAnalyses.length > 0
        ? (studentAnalyses.reduce((sum, a) => sum + (a.participationScore || 0), 0) / studentAnalyses.length).toFixed(1)
        : "N/A";

      // Grammar progress
      const grammarProgress = await db.studentGrammarProgress.findMany({
        where: { studentId: sp.user.id },
      });
      const totalTopics = grammarProgress.length;
      const completedTopics = grammarProgress.filter((g) => g.status === "completed").length;
      const grammarScore = totalTopics > 0
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0;

      // Homework completion
      const homeworks = await db.homework.findMany({
        where: { studentId: sp.user.id },
      });
      const totalHW = homeworks.length;
      const completedHW = homeworks.filter((h) => h.status === "COMPLETED" || h.status === "GRADED").length;
      const hwCompletion = totalHW > 0
        ? Math.round((completedHW / totalHW) * 100)
        : 0;

      // Detect declining trend
      const recentScores = studentAnalyses.slice(0, 5).map((a) => a.participationScore || 0);
      const olderScores = studentAnalyses.slice(5).map((a) => a.participationScore || 0);
      const recentAvg = recentScores.length > 0
        ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
        : 0;
      const olderAvg = olderScores.length > 0
        ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length
        : 0;
      const isAtRisk = (olderAvg > 0 && recentAvg < olderAvg * 0.7) || participations.length === 0;

      return {
        id: sp.user.id,
        name: sp.user.name,
        level: sp.level,
        sessionsAttended: participations.length,
        avgParticipation,
        grammarScore,
        hwCompletion,
        isAtRisk,
      };
    })
  );

  // Students at risk
  const atRiskStudents = studentAnalytics.filter((s) => s.isAtRisk);

  // Recent analyses summary
  const recentAnalyses = await db.sessionAnalysis.findMany({
    where: {
      session: { createdById: teacherId },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      student: { select: { name: true } },
      session: { select: { topic: true, date: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Analytics</h1>
        <form action="/api/teacher-resources/generate" method="POST">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Generate Weekly Resources
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={totalStudents}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }
        />
        <StatsCard
          title="Sessions This Month"
          value={sessionsThisMonth}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          }
        />
        <StatsCard
          title="Avg Student Score"
          value={avgScore}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
          }
        />
        <StatsCard
          title="Resources Generated"
          value={resourcesGenerated}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          }
        />
      </div>

      {/* Student Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {studentAnalytics.length === 0 ? (
            <p className="text-sm text-gray-500">No students assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-gray-700">Name</th>
                    <th className="pb-3 font-medium text-gray-700">Level</th>
                    <th className="pb-3 font-medium text-gray-700">Sessions</th>
                    <th className="pb-3 font-medium text-gray-700">Participation</th>
                    <th className="pb-3 font-medium text-gray-700">Grammar</th>
                    <th className="pb-3 font-medium text-gray-700">Homework</th>
                    <th className="pb-3 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAnalytics.map((student) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{student.name}</td>
                      <td className="py-3">
                        <Badge variant="outline">{student.level}</Badge>
                      </td>
                      <td className="py-3">{student.sessionsAttended}</td>
                      <td className="py-3">{student.avgParticipation}</td>
                      <td className="py-3">{student.grammarScore}%</td>
                      <td className="py-3">{student.hwCompletion}%</td>
                      <td className="py-3">
                        {student.isAtRisk ? (
                          <Badge className="bg-red-100 text-red-700">At Risk</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">On Track</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students at Risk */}
      {atRiskStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Students at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      Level: {student.level} | Sessions: {student.sessionsAttended} | Homework: {student.hwCompletion}%
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-700">Needs Attention</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Session Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAnalyses.length === 0 ? (
            <p className="text-sm text-gray-500">No analyses yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{analysis.student.name}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Session: {analysis.session.topic} | Score: {analysis.participationScore ?? "N/A"}
                  </p>
                  {analysis.summary && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{analysis.summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
