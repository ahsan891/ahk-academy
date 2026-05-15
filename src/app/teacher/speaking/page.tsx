import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Mic2, Calendar, Users, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

function getStatusBadge(status: string) {
  switch (status) {
    case "scheduled":
      return <Badge variant="info">Scheduled</Badge>;
    case "in_progress":
      return <Badge variant="warning">In Progress</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default async function TeacherSpeakingPage() {
  const session = await auth();
  if (!session) return null;

  const teacherId = session.user.id;

  // Get teacher's classes to find their students
  const teacherClasses = await db.class.findMany({
    where: { teacherId, isActive: true },
    select: { id: true },
  });
  const classIds = teacherClasses.map((c) => c.id);

  // Get teacher's student IDs (from enrollments in their classes)
  const enrollments = await db.enrollment.findMany({
    where: { classId: { in: classIds }, status: "ACTIVE" },
    select: { studentId: true },
  });
  const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

  // Get teacher's lesson IDs
  const teacherLessons = await db.lesson.findMany({
    where: { classId: { in: classIds } },
    select: { id: true },
  });
  const lessonIds = teacherLessons.map((l) => l.id);

  // Fetch sessions: created by teacher, sourced from teacher's lessons, or with teacher's students
  const sessions = await db.speakingSession.findMany({
    where: {
      OR: [
        { createdById: teacherId },
        { sourceType: "teacher", sourceLessonId: { in: lessonIds } },
        { participants: { some: { studentId: { in: studentIds } } } },
      ],
    },
    include: {
      createdBy: { select: { name: true } },
      sourceLesson: { select: { title: true, class: { select: { name: true } } } },
      participants: {
        include: { student: { select: { name: true } } },
      },
      transcript: { select: { id: true } },
      _count: { select: { participants: true, analyses: true } },
    },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const mySessions = sessions.filter((s) => s.createdById === teacherId);
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.date) > now && s.status === "scheduled"
  );
  const uniqueStudents = new Set(
    sessions.flatMap((s) => s.participants.map((p) => p.studentId))
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speaking Sessions</h1>
          <p className="mt-1 text-gray-500">
            Manage and track student speaking practice sessions
          </p>
        </div>
        <Link href="/teacher/speaking/create">
          <Button>
            <Plus size={16} className="mr-2" />
            Create Session from Lesson
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="My Sessions"
          value={mySessions.length}
          icon={<Mic2 size={24} />}
          description="Sessions you created"
        />
        <StatsCard
          title="Upcoming"
          value={upcomingSessions.length}
          icon={<Calendar size={24} />}
          description="Scheduled sessions"
        />
        <StatsCard
          title="Students in Sessions"
          value={uniqueStudents.size}
          icon={<Users size={24} />}
          description="Unique participants"
        />
      </div>

      {/* Session List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Mic2 size={48} className="text-gray-300" />
            <p className="mt-4 text-gray-500">No speaking sessions yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Create one from a lesson to get started
            </p>
            <Link href="/teacher/speaking/create" className="mt-4">
              <Button>
                <Plus size={16} className="mr-2" />
                Create Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic2 size={20} />
              All Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900 truncate">
                        {s.topic}
                      </h3>
                      {getStatusBadge(s.status)}
                      {s.transcript && (
                        <Badge variant="success">Transcript</Badge>
                      )}
                      {s._count.analyses > 0 && (
                        <Badge variant="info">
                          {s._count.analyses} analyses
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(s.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {s._count.participants} / {s.maxStudents} participants
                      </span>
                      {s.sourceLesson && (
                        <span className="text-blue-600">
                          From: {s.sourceLesson.title}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.participants.slice(0, 5).map((p) => (
                        <span
                          key={p.id}
                          className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {p.student.name}
                        </span>
                      ))}
                      {s.participants.length > 5 && (
                        <span className="text-xs text-gray-400">
                          +{s.participants.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/teacher/speaking/${s.id}`}>
                    <Button size="sm" variant="outline">
                      View
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
