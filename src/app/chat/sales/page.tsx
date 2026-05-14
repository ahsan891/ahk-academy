import { ChatWidget } from "@/components/chat-widget";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Enroll at AHK Academy",
  description: "Learn about our English courses and enroll today",
};

export default function SalesChatPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-green-50 via-white to-green-100">
      <header className="w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-gray-900">AHK Academy</span>
          </Link>
          <Link href="/chat" className="text-sm text-gray-500 hover:text-gray-700">All Chatbots</Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <ChatWidget
          bot="sales"
          name="AHK Academy Assistant"
          description="Learn about our courses and get enrolled"
          avatar="🎓"
          color="green"
          welcomeMessage="Welcome to AHK Academy! 🎓 I'm here to help you learn about our English courses and guide you through enrollment. Whether you're a beginner or looking to advance your skills, we have the perfect program for you. What would you like to know?"
        />
      </main>
    </div>
  );
}
