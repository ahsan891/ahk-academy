import { ChatWidget } from "@/components/chat-widget";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Homework Helper - AHK Academy",
  description: "Get help with your English homework",
};

export default function HomeworkHelperPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-purple-50 via-white to-purple-100">
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
          bot="homework"
          name="Homework Helper"
          description="Get hints and guidance for your homework"
          avatar="✏️"
          color="purple"
          welcomeMessage="Hi there! ✏️ I'm your homework helper. I won't give you the answers directly, but I'll guide you step by step so you truly understand. Share your homework question and let's work through it together!"
        />
      </main>
    </div>
  );
}
