import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, BookOpen, Sparkles } from "lucide-react";
import { TopicActions } from "./topic-actions";

function getLevelBadge(level: string) {
  switch (level) {
    case "beginner":
      return <Badge variant="success">Beginner</Badge>;
    case "intermediate":
      return <Badge variant="info">Intermediate</Badge>;
    case "advanced":
      return <Badge variant="warning">Advanced</Badge>;
    default:
      return <Badge>{level}</Badge>;
  }
}

export default async function TeacherTopicsPage() {
  const session = await auth();
  if (!session) return null;

  const teacherId = session.user.id;

  // Fetch teacher's topics and system topics
  const [myTopics, systemTopics, upcomingSessions] = await Promise.all([
    db.topic.findMany({
      where: { createdById: teacherId },
      orderBy: { createdAt: "desc" },
    }),
    db.topic.findMany({
      where: { isSystemGenerated: true },
      orderBy: { createdAt: "desc" },
    }),
    // Get upcoming sessions for topic assignment
    db.speakingSession.findMany({
      where: {
        createdById: teacherId,
        status: "scheduled",
        date: { gte: new Date() },
      },
      select: { id: true, topic: true, date: true, topicId: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Get teacher's lessons for "create from lesson"
  const teacherClasses = await db.class.findMany({
    where: { teacherId, isActive: true },
    select: { id: true, name: true },
  });
  const classIds = teacherClasses.map((c) => c.id);
  const recentLessons = await db.lesson.findMany({
    where: { classId: { in: classIds } },
    include: { class: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Topics</h1>
        <p className="mt-1 text-gray-500">
          Create and manage speaking session topics based on your lessons
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Topic Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                My Topics
                <Badge variant="info">{myTopics.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myTopics.length === 0 ? (
                <p className="text-sm text-gray-500">
                  You have not created any topics yet. Use the form on the right
                  to create one from a lesson.
                </p>
              ) : (
                <div className="space-y-3">
                  {myTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getLevelBadge(topic.level)}
                          {topic.category && (
                            <Badge variant="default">{topic.category}</Badge>
                          )}
                        </div>
                      </div>
                      {topic.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {topic.description}
                        </p>
                      )}
                      {topic.preparationTips && (
                        <div className="mt-2 rounded bg-yellow-50 p-2">
                          <p className="text-xs font-medium text-yellow-800">
                            Preparation Tips
                          </p>
                          <p className="text-xs text-yellow-700">
                            {topic.preparationTips}
                          </p>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        Created {formatDate(topic.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={20} />
                System Topics
                <Badge variant="default">{systemTopics.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemTopics.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No system topics available.
                </p>
              ) : (
                <div className="space-y-3">
                  {systemTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getLevelBadge(topic.level)}
                          {topic.category && (
                            <Badge variant="default">{topic.category}</Badge>
                          )}
                          <Badge variant="info">System</Badge>
                        </div>
                      </div>
                      {topic.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {topic.description}
                        </p>
                      )}
                      {topic.preparationTips && (
                        <div className="mt-2 rounded bg-yellow-50 p-2">
                          <p className="text-xs font-medium text-yellow-800">
                            Preparation Tips
                          </p>
                          <p className="text-xs text-yellow-700">
                            {topic.preparationTips}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Create Topic + Assign to Session */}
        <div>
          <TopicActions
            lessons={recentLessons.map((l) => ({
              id: l.id,
              title: l.title,
              topics: l.topics,
              className: l.class.name,
            }))}
            upcomingSessions={upcomingSessions.map((s) => ({
              id: s.id,
              topic: s.topic,
              date: s.date.toISOString(),
              topicId: s.topicId,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
