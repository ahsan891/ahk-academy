import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BookOpen, Users, ClipboardList, UserCheck } from "lucide-react";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session) return null;

  const teacherId = session.user.id;

  const [classes, recentSubmissions] = await Promise.all([
    db.class.findMany({
      where: { teacherId, isActive: true },
      include: {
        course: true,
        _count: { select: { enrollments: true, lessons: true, assignments: true } },
      },
    }),
    db.submission.findMany({
      where: {
        assignment: { class: { teacherId } },
        grade: null,
      },
      include: {
        student: true,
        assignment: { include: { class: true } },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    }),
  ]);

  const totalStudents = classes.reduce((sum, c) => sum + c._count.enrollments, 0);
  const totalAssignments = classes.reduce((sum, c) => sum + c._count.assignments, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session.user.name.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-gray-500">Here&apos;s your teaching overview.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="My Classes" value={classes.length} icon={<BookOpen size={24} />} />
        <StatsCard title="Total Students" value={totalStudents} icon={<Users size={24} />} />
        <StatsCard title="Assignments" value={totalAssignments} icon={<ClipboardList size={24} />} />
        <StatsCard
          title="To Grade"
          value={recentSubmissions.length}
          icon={<UserCheck size={24} />}
          description="Ungraded submissions"
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
            {classes.length === 0 ? (
              <p className="text-sm text-gray-500">No classes assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div key={cls.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-sm text-gray-500">{cls.course.title}</p>
                      </div>
                      <Badge variant="info">{cls._count.enrollments} students</Badge>
                    </div>
                    {cls.schedule && (
                      <p className="mt-1 text-xs text-gray-400">{cls.schedule}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions to Grade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList size={20} />
              Submissions to Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-gray-500">No submissions waiting for grading.</p>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sub.student.name}</p>
                        <p className="text-sm text-gray-500">{sub.assignment.title}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(sub.submittedAt)}
                      </span>
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
