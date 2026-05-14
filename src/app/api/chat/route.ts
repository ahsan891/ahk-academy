import { NextRequest, NextResponse } from "next/server";
import { BOT_CONFIG, type ChatBot } from "@/lib/chat";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, bot } = body as {
    messages: { role: string; content: string }[];
    bot: ChatBot;
  };

  const config = BOT_CONFIG[bot];
  if (!config) {
    return NextResponse.json({ error: "Invalid bot" }, { status: 400 });
  }

  // Try Ollama first (local, free), then Groq, then Anthropic
  const providers = [
    { name: "ollama", fn: () => callOllama(config.systemPrompt, messages) },
    { name: "groq", fn: () => callGroq(config.systemPrompt, messages) },
    { name: "anthropic", fn: () => callAnthropic(config.systemPrompt, messages) },
  ];

  for (const provider of providers) {
    try {
      const response = await provider.fn();
      if (response) {
        return NextResponse.json({ message: response, provider: provider.name });
      }
    } catch {
      // Try next provider
    }
  }

  return NextResponse.json({
    message: "I'm sorry, I'm currently unavailable. Please try again later or contact us at ahsan@ahkacademy.com.",
    provider: "fallback",
  });
}

async function callOllama(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string | null> {
  try {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.message?.content || null;
  } catch {
    return null;
  }
}

async function callGroq(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

async function callAnthropic(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.content?.[0]?.text || null;
}
