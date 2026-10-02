// Cheap-LLM providers. Keys are read ONLY from environment variables.
//   GEMINI_API_KEY    → Google Gemini (default model gemini-2.5-flash, override with GEMINI_MODEL)
//   GROQ_API_KEY      → Groq (default model llama-3.3-70b-versatile, override with GROQ_MODEL)
//   ANTHROPIC_API_KEY → Anthropic (claude-haiku-4-5-20251001, override with ANTHROPIC_MODEL)
// Order of preference: gemini → groq → anthropic (or force one with --provider).

const PROVIDERS = {
  gemini: {
    available: () => !!process.env.GEMINI_API_KEY,
    async complete(system, user) {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: { temperature: 0.9, responseMimeType: 'application/json', maxOutputTokens: 4096 },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
      return json.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    },
  },
  groq: {
    available: () => !!process.env.GROQ_API_KEY,
    async complete(system, user) {
      const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model, temperature: 0.9, max_tokens: 4096, response_format: { type: 'json_object' },
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`Groq ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
      return json.choices?.[0]?.message?.content || '';
    },
  },
  anthropic: {
    available: () => !!process.env.ANTHROPIC_API_KEY,
    async complete(system, user) {
      const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 4096, temperature: 0.9, system,
          messages: [{ role: 'user', content: user }, { role: 'assistant', content: '{' }] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
      return '{' + (json.content?.map(c => c.text || '').join('') || '');
    },
  },
};

function pickProvider(forced) {
  if (forced) {
    if (!PROVIDERS[forced]) throw new Error(`unknown provider ${forced}`);
    if (!PROVIDERS[forced].available()) throw new Error(`${forced} selected but its API key is not set`);
    return forced;
  }
  for (const name of ['gemini', 'groq', 'anthropic']) if (PROVIDERS[name].available()) return name;
  return null;
}

// Pull the first JSON object out of a model reply (handles ```json fences and chatter)
function extractJSON(text) {
  let s = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a === -1 || b === -1) throw new Error('no JSON object in reply');
  return JSON.parse(s.slice(a, b + 1));
}

module.exports = { PROVIDERS, pickProvider, extractJSON };
