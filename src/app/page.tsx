import Link from "next/link";
import { GraduationCap, Users, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AHK Academy</span>
          </div>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Learn English with
          <span className="text-blue-600"> AHK Academy</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Join thousands of students learning English with expert teachers,
          interactive lessons, and AI-powered tutoring. Your journey to fluency starts here.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Interactive Lessons</h3>
            <p className="mt-2 text-sm text-gray-500">
              Engaging video lessons and materials designed by expert educators.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Expert Teachers</h3>
            <p className="mt-2 text-sm text-gray-500">
              Learn from qualified English teachers with personalized attention.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Track Progress</h3>
            <p className="mt-2 text-sm text-gray-500">
              Monitor your attendance, grades, and learning progress in real time.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <GraduationCap className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">AI Tutoring</h3>
            <p className="mt-2 text-sm text-gray-500">
              Practice English anytime with our AI-powered tutor and get instant feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          &copy; 2026 AHK Academy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
