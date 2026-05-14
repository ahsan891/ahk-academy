import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "AI Chatbots - AHK Academy",
  description: "Free AI-powered chatbots for learning English",
};

const chatbots = [
  {
    name: "English Tutor",
    description: "Practice English conversation, grammar, and vocabulary 24/7. Get instant feedback and improve your skills.",
    avatar: "📚",
    href: "/chat/english-tutor",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Academy Assistant",
    description: "Learn about our courses, pricing, schedule, and get help with enrollment. Talk to us anytime.",
    avatar: "🎓",
    href: "/chat/sales",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    name: "Homework Helper",
    description: "Stuck on homework? Get hints, explanations, and step-by-step guidance without the direct answers.",
    avatar: "✏️",
    href: "/chat/homework",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
];

export default function ChatHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-gray-900">AHK Academy</span>
          </Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">Sign In</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">AI Chatbots</h1>
          <p className="mt-3 text-lg text-gray-500">Free AI-powered tools to help you learn English</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {chatbots.map((bot) => (
            <Link key={bot.href} href={bot.href}>
              <Card className="group h-full cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl ${bot.bgColor}`}>
                    {bot.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {bot.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{bot.description}</p>
                  <span className={`mt-4 inline-block rounded-full bg-gradient-to-r ${bot.color} px-4 py-1.5 text-xs font-medium text-white`}>
                    Chat Now
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-400">
          Powered by AHK Academy AI • Free to use • No sign-up required
        </div>
      </main>
    </div>
  );
}
