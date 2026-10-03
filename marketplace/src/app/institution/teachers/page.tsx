import Link from "next/link";
import { ShieldCheck, Star, MapPin, Monitor, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole, coverRatings, checkLabel, CITIES } from "@/lib/cover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export const metadata = { title: "Verified teachers - AHK Cover Network" };

export default async function VerifiedTeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; mode?: string; q?: string }>;
}) {
  await requireRole("HEAD_TEACHER");
  const { city, mode, q } = await searchParams;

  const teachers = await db.tutorProfile.findMany({
    where: {
      verifiedAt: { not: null },
      openToCover: true,
      ...(mode === "ONLINE" ? { teachesOnline: true } : {}),
      ...(mode === "IN_PERSON" ? { teachesInPerson: true } : {}),
      ...(city ? { city } : {}),
      ...(q
        ? {
            OR: [
              { specialties: { contains: q } },
              { certifications: { contains: q } },
              { levels: { contains: q } },
              { user: { name: { contains: q } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true } },
      verificationChecks: { where: { status: "APPROVED" }, select: { type: true } },
    },
    orderBy: { verifiedAt: "desc" },
    take: 60,
  });
  const ratings = await coverRatings(teachers.map((t) => t.userId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verified teachers</h1>
        <p className="mt-1 text-gray-500">
          Every teacher here passed our identity, degree, criminal record, reference and demo lesson checks.
        </p>
      </div>

      <form className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4">
        <Input name="q" defaultValue={q} placeholder="IELTS, CELTA, Kids…" />
        <Select name="city" defaultValue={city ?? ""}>
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select name="mode" defaultValue={mode ?? ""}>
          <option value="">Online or face to face</option>
          <option value="IN_PERSON">Face to face</option>
          <option value="ONLINE">Online</option>
        </Select>
        <Button type="submit">Search</Button>
      </form>

      {teachers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-gray-500">
            No verified teachers match yet. Post a request and we&apos;ll find someone for you.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teachers.map((t) => {
            const rating = ratings.get(t.userId);
            return (
              <Card key={t.id}>
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/tutors/${t.user.id}`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                        {t.user.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {t.yearsExperience} yrs experience{t.levels && ` · ${t.levels}`}
                      </p>
                    </div>
                    <Badge variant="success">
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    {t.teachesInPerson && t.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {[t.district, t.city].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {t.teachesOnline && (
                      <span className="flex items-center gap-1">
                        <Monitor className="h-4 w-4" />
                        Online
                      </span>
                    )}
                    {rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {rating.avg.toFixed(1)} ({rating.count})
                      </span>
                    )}
                    {t.ageGroups && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {t.ageGroups}
                      </span>
                    )}
                  </div>
                  {t.specialties && <p className="text-sm text-gray-700">{t.specialties}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {t.verificationChecks.map((c) => (
                      <Badge key={c.type} variant="outline">✓ {checkLabel(c.type)}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
