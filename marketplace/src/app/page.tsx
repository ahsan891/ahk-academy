import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Search,
  CalendarCheck,
  BookOpen,
  Zap,
  Clock,
  Award,
  DollarSign,
  Users,
  Star,
  Globe,
} from "lucide-react";

export const metadata = {
  title: "AHK Marketplace - Find Your Perfect English Tutor",
  description:
    "Connect with expert English tutors for personalized 1-on-1 lessons. Flexible scheduling, instant lessons, and affordable pricing.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptMC00VjI0SDI0djJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <GraduationCap className="h-4 w-4" />
              Trusted by 10,000+ learners worldwide
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find Your Perfect
              <span className="block text-indigo-600">English Tutor</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
              Connect with expert tutors for personalized 1-on-1 English
              lessons. Learn at your own pace, on your own schedule, from
              anywhere in the world.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/tutors">
                <Button size="lg" className="gap-2 px-8 text-base">
                  <Search className="h-5 w-5" />
                  Find a Tutor
                </Button>
              </Link>
              <Link href="/tutor/apply">
                <Button variant="outline" size="lg" className="gap-2 px-8 text-base">
                  <Award className="h-5 w-5" />
                  Become a Tutor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-500">
              Start learning English in three simple steps
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: Search,
                title: "Browse Tutors",
                description:
                  "Explore our community of certified English tutors. Filter by specialty, accent, price, and availability to find your ideal match.",
              },
              {
                step: "2",
                icon: CalendarCheck,
                title: "Book a Lesson",
                description:
                  "Choose a time that works for you and book a lesson in seconds. Or jump into an instant lesson with an available tutor right now.",
              },
              {
                step: "3",
                icon: BookOpen,
                title: "Start Learning",
                description:
                  "Join your video lesson and start improving your English with personalized guidance, feedback, and practice.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-gray-100 bg-gray-50/50 p-8 text-center transition-all hover:border-indigo-100 hover:bg-indigo-50/30 hover:shadow-md"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white">
                  Step {item.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose AHK Marketplace
            </h2>
            <p className="mt-3 text-gray-500">
              Everything you need for an effective English learning experience
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: "Instant Lessons",
                description:
                  "Jump into a lesson right away with tutors who are available now. No scheduling needed.",
                color: "text-yellow-500",
                bg: "bg-yellow-50",
              },
              {
                icon: Clock,
                title: "Flexible Schedule",
                description:
                  "Book lessons at times that work for you. Available 24/7 with tutors across all time zones.",
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                icon: Award,
                title: "Expert Tutors",
                description:
                  "All tutors are vetted and certified. Many have years of professional teaching experience.",
                color: "text-green-500",
                bg: "bg-green-50",
              },
              {
                icon: DollarSign,
                title: "Affordable Pricing",
                description:
                  "Competitive rates starting from just $10/hour. Save more with credit packages.",
                color: "text-purple-500",
                bg: "bg-purple-50",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, value: "500+", label: "Expert Tutors" },
              { icon: BookOpen, value: "10,000+", label: "Lessons Completed" },
              { icon: Star, value: "4.9", label: "Average Rating" },
              { icon: Globe, value: "50+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-8 w-8 text-indigo-200" />
                <p className="mt-3 text-3xl font-extrabold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-indigo-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Start Your English Journey?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Join thousands of learners who are already improving their English
            with our expert tutors. Your first step starts here.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="px-8 text-base">
                Get Started Free
              </Button>
            </Link>
            <Link href="/tutors">
              <Button variant="outline" size="lg" className="px-8 text-base">
                Browse Tutors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
