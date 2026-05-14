import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Calendar, BookOpen, Clock, Search, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TutorCard } from "@/components/tutor-card";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [studentProfile, upcomingBookings, completedBookingsCount, recommendedTutors] =
    await Promise.all([
      db.studentMarketProfile.findUnique({
        where: { userId },
      }),
      db.mktBooking.findMany({
        where: {
          studentId: userId,
          status: "confirmed",
          scheduledAt: { gt: new Date() },
        },
        include: {
          tutor: { select: { name: true, avatar: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      db.mktBooking.count({
        where: {
          studentId: userId,
          status: "completed",
        },
      }),
      db.tutorProfile.findMany({
        where: { isApproved: true },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { averageRating: "desc" },
        take: 4,
      }),
    ]);

  const creditsBalance = studentProfile?.creditsBalance ?? 0;
  const totalMinutes = studentProfile?.totalMinutesLearned ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here&apos;s an overview of your learning journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Credits Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(creditsBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingBookings.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedBookingsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Learning Minutes</p>
                <p className="text-2xl font-bold text-gray-900">{totalMinutes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/tutors">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Find a Tutor
          </Button>
        </Link>
        <Link href="/wallet">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Buy Credits
          </Button>
        </Link>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Lessons</CardTitle>
            <Link href="/bookings">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No upcoming lessons</p>
              <Link href="/tutors">
                <Button size="sm" className="mt-3">Book a Lesson</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {booking.tutor.name?.[0] || "T"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.tutor.name}</p>
                      <p className="text-sm text-gray-500">
                        {booking.scheduledAt
                          ? `${formatDate(booking.scheduledAt)} at ${formatTime(
                              new Date(booking.scheduledAt).toTimeString().slice(0, 5)
                            )}`
                          : "Time TBD"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">{booking.durationMinutes} min</Badge>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(booking.priceCharged)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Tutors */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recommended Tutors</h2>
          <Link href="/tutors">
            <Button variant="ghost" size="sm">See All</Button>
          </Link>
        </div>
        {recommendedTutors.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-gray-500">No tutors available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendedTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
