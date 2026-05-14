import { db } from "@/lib/db";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import {
  formatCurrency,
  formatDate,
  formatTime,
  getInitials,
  DAYS,
} from "@/lib/utils";
import {
  Globe,
  Clock,
  Award,
  BookOpen,
  Star,
  GraduationCap,
  Zap,
  MapPin,
  Calendar,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: { name: true },
  });
  return {
    title: user
      ? `${user.name} - Tutor Profile | AHK Marketplace`
      : "Tutor Not Found",
  };
}

export default async function TutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      tutorProfile: {
        include: {
          availability: {
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
        },
      },
      reviewsReceived: {
        where: { isPublic: true },
        include: {
          student: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user || !user.tutorProfile) {
    notFound();
  }

  const profile = user.tutorProfile;
  const reviews = user.reviewsReceived;
  const specialties = profile.specialties
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) || [];
  const certifications = profile.certifications
    ?.split(",")
    .map((c) => c.trim())
    .filter(Boolean) || [];

  // Group availability by day
  const availabilityByDay: Record<number, typeof profile.availability> = {};
  for (const slot of profile.availability) {
    if (!availabilityByDay[slot.dayOfWeek]) {
      availabilityByDay[slot.dayOfWeek] = [];
    }
    availabilityByDay[slot.dayOfWeek].push(slot);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Profile Header */}
        <Card>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600 sm:h-28 sm:w-28">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  {profile.isAvailableInstantly && (
                    <Badge variant="success" className="gap-1">
                      <Zap className="h-3 w-3" />
                      Available Now
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {profile.averageRating > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-900">
                        {profile.averageRating.toFixed(1)}
                      </span>
                      ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                    </span>
                  )}
                  {profile.totalLessons > 0 && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      {profile.totalLessons} lessons
                    </span>
                  )}
                  {profile.country && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {profile.country}
                    </span>
                  )}
                  {profile.accent && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      {profile.accent} accent
                    </span>
                  )}
                  {profile.yearsExperience > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {profile.yearsExperience} year
                      {profile.yearsExperience !== 1 ? "s" : ""} experience
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(profile.hourlyRate)}
                  </span>
                  <span className="text-sm text-gray-400">/hour</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <Link href={`/book/${user.id}`}>
                  <Button size="lg" className="w-full gap-2 sm:w-auto">
                    <Calendar className="h-4 w-4" />
                    Book a Lesson
                  </Button>
                </Link>
                <Link href={`/messages?to=${user.id}`}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 sm:w-auto"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Message
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Intro Video */}
            {profile.introVideoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Introduction Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                    <video
                      src={profile.introVideoUrl}
                      controls
                      className="h-full w-full object-cover"
                      poster=""
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education & Certifications */}
            {(profile.education || certifications.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.education && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Education
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {profile.education}
                      </p>
                    </div>
                  )}
                  {certifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Certifications
                      </h4>
                      <ul className="mt-1 space-y-1">
                        {certifications.map((cert) => (
                          <li
                            key={cert}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <Award className="h-3.5 w-3.5 text-indigo-500" />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews
                  {reviews.length > 0 && (
                    <span className="text-sm font-normal text-gray-400">
                      ({reviews.length})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {review.student.avatar ? (
                              <img
                                src={review.student.avatar}
                                alt={review.student.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              getInitials(review.student.name)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {review.student.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <StarRating
                                rating={review.rating}
                                size={14}
                              />
                              <span className="text-xs text-gray-400">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-gray-600">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Availability */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.availability.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No availability set yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {DAYS.map((day, index) => {
                      const slots = availabilityByDay[index];
                      if (!slots || slots.length === 0) return null;
                      return (
                        <div key={day}>
                          <p className="text-sm font-medium text-gray-900">
                            {day}
                          </p>
                          <div className="mt-1 space-y-1">
                            {slots.map((slot) => (
                              <p
                                key={slot.id}
                                className="text-xs text-gray-500"
                              >
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Rate</dt>
                    <dd className="font-medium text-gray-900">
                      {formatCurrency(profile.hourlyRate)}/hr
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Languages</dt>
                    <dd className="font-medium text-gray-900">
                      {profile.teachingLanguages}
                    </dd>
                  </div>
                  {profile.accent && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Accent</dt>
                      <dd className="font-medium text-gray-900">
                        {profile.accent}
                      </dd>
                    </div>
                  )}
                  {profile.country && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Country</dt>
                      <dd className="font-medium text-gray-900">
                        {profile.country}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="font-medium text-gray-900">
                      {profile.yearsExperience} year
                      {profile.yearsExperience !== 1 ? "s" : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Lessons</dt>
                    <dd className="font-medium text-gray-900">
                      {profile.totalLessons}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Book CTA */}
            <Link href={`/book/${user.id}`} className="block">
              <Button size="lg" className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                Book a Lesson
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
