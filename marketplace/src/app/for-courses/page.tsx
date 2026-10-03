import Link from "next/link";
import { ShieldCheck, Zap, Star, ClipboardList, Bell, UserCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Cover teachers for language courses - AHK Cover Network",
  description:
    "Find vetted substitute and backup English teachers in Turkey, face to face or online. Every teacher is ID, degree, criminal record and demo lesson checked.",
};

const CHECKS = [
  "Identity (kimlik / passport)",
  "University degree",
  "Criminal record (adli sicil, e-Devlet verified)",
  "Professional reference call",
  "Demo lesson reviewed by AHK",
  "Work permit for foreign teachers",
];

const STEPS = [
  { icon: ClipboardList, title: "Post what you need", text: "Date, level, face to face or online, and the pay per session." },
  { icon: Bell, title: "Matching teachers are notified", text: "Only verified teachers who cover your city or teach online." },
  { icon: UserCheck, title: "Confirm one applicant", text: "See their checks and ratings, confirm, and get their contact details." },
];

export default function ForCoursesPage() {
  return (
    <>
      <Navbar />
      <section className="bg-gradient-to-b from-indigo-50 to-white px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            A teacher called in sick? Find a vetted cover teacher today.
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            AHK Cover Network gives head teachers a pool of checked English teachers for substitute lessons, backup
            slots and new groups, face to face or online.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register?role=HEAD_TEACHER">
              <Button size="lg">I run a course</Button>
            </Link>
            <Link href="/register?role=TUTOR">
              <Button size="lg" variant="outline">I&apos;m a teacher</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-xl border bg-white p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-indigo-600">Step {i + 1}</p>
              <h2 className="mt-1 font-semibold text-gray-900">{s.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              What we check
            </h2>
            <ul className="mt-6 space-y-3">
              {CHECKS.map((c) => (
                <li key={c} className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="flex gap-3">
              <Zap className="h-6 w-6 shrink-0 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Fast</h3>
                <p className="text-sm text-gray-600">Teachers get notified the moment you post.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Star className="h-6 w-6 shrink-0 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Rated both ways</h3>
                <p className="text-sm text-gray-600">
                  After every job, courses rate teachers and teachers rate courses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
