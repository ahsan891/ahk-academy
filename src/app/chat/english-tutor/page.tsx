import { ChatWidget } from "@/components/chat-widget";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "English Tutor - AHK Academy",
  description: "Practice English with our AI tutor 24/7",
};

export default function EnglishTutorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
          bot="english-tutor"
          name="English Tutor"
          description="Practice English 24/7 — grammar, vocabulary, conversation"
          avatar="📚"
          color="blue"
          welcomeMessage="Hello! 👋 I'm your English tutor at AHK Academy. I'm here to help you practice and improve your English skills. What would you like to work on today? We can practice conversation, grammar, vocabulary, or anything else you'd like!"
        />
      </main>
    </div>
  );
}
