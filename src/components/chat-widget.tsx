"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatBot } from "@/lib/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  bot: ChatBot;
  name: string;
  description: string;
  avatar: string;
  color: string;
  welcomeMessage?: string;
}

export function ChatWidget({ bot, name, description, avatar, color, welcomeMessage }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>(
    welcomeMessage ? [{ role: "assistant", content: welcomeMessage }] : []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot,
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  const colorClasses: Record<string, { bg: string; header: string; userBubble: string }> = {
    blue: { bg: "bg-blue-50", header: "bg-blue-600", userBubble: "bg-blue-600 text-white" },
    green: { bg: "bg-green-50", header: "bg-green-600", userBubble: "bg-green-600 text-white" },
    purple: { bg: "bg-purple-50", header: "bg-purple-600", userBubble: "bg-purple-600 text-white" },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex h-[600px] w-full max-w-2xl flex-col rounded-2xl border shadow-xl overflow-hidden">
      {/* Header */}
      <div className={cn("flex items-center gap-3 px-6 py-4 text-white", colors.header)}>
        <span className="text-3xl">{avatar}</span>
        <div>
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>

      {/* Messages */}
      <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", colors.bg)}>
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? colors.userBubble
                  : "bg-white text-gray-800 shadow-sm border"
              )}
            >
              {msg.role === "assistant" && (
                <span className="mr-1.5">{avatar}</span>
              )}
              <span className="whitespace-pre-wrap">{msg.content}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm border">
              <Loader2 size={18} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t bg-white px-4 py-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          className="h-10 w-10 rounded-full"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
