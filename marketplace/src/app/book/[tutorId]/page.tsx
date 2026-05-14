import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, DAYS, formatTime, getInitials } from "@/lib/utils";
import { Star, Clock, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "./booking-form";

interface BookPageProps {
  params: Promise<{ tutorId: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { tutorId } = await params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  const tutorProfile = await db.tutorProfile.findUnique({
    where: { userId: tutorId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      availability: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!tutorProfile) notFound();

  const studentProfile = await db.studentMarketProfile.findUnique({
    where: { userId: session.user.id },
  });

  const creditsBalance = studentProfile?.creditsBalance ?? 0;

  // Group availability by day
  const availabilityByDay: Record<number, { startTime: string; endTime: string }[]> = {};
  for (const slot of tutorProfile.availability) {
    if (!availabilityByDay[slot.dayOfWeek]) {
      availabilityByDay[slot.dayOfWeek] = [];
    }
    availabilityByDay[slot.dayOfWeek].push({
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Tutor Info Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {tutorProfile.user.avatar ? (
                <img
                  src={tutorProfile.user.avatar}
                  alt={tutorProfile.user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                getInitials(tutorProfile.user.name)
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Book a Lesson with {tutorProfile.user.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {tutorProfile.averageRating.toFixed(1)} rating
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {tutorProfile.totalLessons} lessons
                </span>
                {tutorProfile.country && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {tutorProfile.country}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(tutorProfile.hourlyRate)}
                </span>
                <span className="text-sm text-gray-400"> /hour</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tutor Availability</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(availabilityByDay).length === 0 ? (
            <p className="text-sm text-gray-500">
              This tutor has not set any availability yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(availabilityByDay).map(([day, slots]) => (
                <div key={day} className="rounded-lg border p-3">
                  <p className="font-medium text-gray-900">{DAYS[Number(day)]}</p>
                  <div className="mt-1 space-y-1">
                    {slots.map((slot, i) => (
                      <p key={i} className="text-sm text-gray-500">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Form */}
      <BookingForm
        tutorId={tutorProfile.user.id}
        tutorName={tutorProfile.user.name}
        hourlyRate={tutorProfile.hourlyRate}
        creditsBalance={creditsBalance}
        availability={tutorProfile.availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        }))}
      />
    </div>
  );
}
