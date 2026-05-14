import { db } from "@/lib/db";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TutorCard } from "@/components/tutor-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SPECIALTIES, ACCENTS } from "@/lib/utils";
import { Search } from "lucide-react";

export const metadata = { title: "Find Tutors - AHK Marketplace" };

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    specialty?: string;
    accent?: string;
    minPrice?: string;
    maxPrice?: string;
    instant?: string;
  }>;
}) {
  const params = await searchParams;

  // Build Prisma where clause from filters
  const where: Record<string, unknown> = { isApproved: true };

  if (params.specialty) {
    where.specialties = { contains: params.specialty };
  }
  if (params.accent) {
    where.accent = params.accent;
  }
  if (params.instant === "true") {
    where.isAvailableInstantly = true;
  }
  if (params.minPrice || params.maxPrice) {
    const hourlyRate: Record<string, number> = {};
    if (params.minPrice) hourlyRate.gte = parseFloat(params.minPrice);
    if (params.maxPrice) hourlyRate.lte = parseFloat(params.maxPrice);
    where.hourlyRate = hourlyRate;
  }

  const tutors = await db.tutorProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: [{ averageRating: "desc" }, { totalLessons: "desc" }],
  });

  // Filter by name search on app side (Prisma SQLite doesn't support insensitive mode well)
  const filtered = params.query
    ? tutors.filter((t) =>
        t.user.name.toLowerCase().includes(params.query!.toLowerCase())
      )
    : tutors;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">Find Your Tutor</h1>
        <p className="mt-1 text-gray-500">Browse our expert English tutors</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Filters sidebar */}
          <form method="GET" className="space-y-4 rounded-xl border bg-white p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  name="query"
                  placeholder="Search by name..."
                  defaultValue={params.query || ""}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Specialty
              </label>
              <Select name="specialty" defaultValue={params.specialty || ""}>
                <option value="">All Specialties</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Accent
              </label>
              <Select name="accent" defaultValue={params.accent || ""}>
                <option value="">All Accents</option>
                {ACCENTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Min $/hr
                </label>
                <Input
                  name="minPrice"
                  type="number"
                  placeholder="0"
                  defaultValue={params.minPrice || ""}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Max $/hr
                </label>
                <Input
                  name="maxPrice"
                  type="number"
                  placeholder="100"
                  defaultValue={params.maxPrice || ""}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="instant"
                value="true"
                defaultChecked={params.instant === "true"}
                className="rounded border-gray-300"
              />
              Instant lessons only
            </label>

            <Button type="submit" className="w-full">
              Apply Filters
            </Button>
          </form>

          {/* Results */}
          <div>
            <p className="mb-4 text-sm text-gray-500">
              {filtered.length} tutor{filtered.length !== 1 ? "s" : ""} found
            </p>
            {filtered.length === 0 ? (
              <div className="rounded-xl border bg-white p-12 text-center">
                <p className="text-gray-500">
                  No tutors found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
