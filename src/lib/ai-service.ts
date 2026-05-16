/**
 * AI Cascade Service
 * Tries providers in order: Gemini Flash (free) → Groq Llama 3.3 (free) → Claude Haiku (paid)
 * Falls through to next provider on failure or missing API key.
 */

interface AIResponse {
  text: string;
  model: string;
}

export class AIService {
  static async generate(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    // Try Gemini first (free tier)
    try {
      return await this.callGemini(prompt, systemPrompt);
    } catch (e) {
      console.log("[AI Cascade] Gemini failed, trying Groq...", (e as Error).message);
    }

    // Try Groq second (free tier)
    try {
      return await this.callGroq(prompt, systemPrompt);
    } catch (e) {
      console.log("[AI Cascade] Groq failed, trying Claude...", (e as Error).message);
    }

    // Claude Haiku as last resort (paid)
    return await this.callClaude(prompt, systemPrompt);
  }

  private static async callGemini(prompt: string, system?: string): Promise<AIResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    const contents = [];
    if (system) {
      contents.push({ role: "user", parts: [{ text: system }] });
      contents.push({ role: "model", parts: [{ text: "Understood. I will follow these instructions." }] });
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Gemini API error: ${res.status} - ${error}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Gemini returned empty response");

    return { text, model: "gemini-2.0-flash" };
  }

  private static async callGroq(prompt: string, system?: string): Promise<AIResponse> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not set");

    const messages: { role: string; content: string }[] = [];
    if (system) {
      messages.push({ role: "system", content: system });
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Groq API error: ${res.status} - ${error}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) throw new Error("Groq returned empty response");

    return { text, model: "llama-3.3-70b-versatile" };
  }

  private static async callClaude(prompt: string, system?: string): Promise<AIResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set - all AI providers failed");

    const body: Record<string, unknown> = {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    };

    if (system) {
      body.system = system;
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Claude API error: ${res.status} - ${error}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text;

    if (!text) throw new Error("Claude returned empty response");

    return { text, model: "claude-haiku-4-5-20251001" };
  }
}
