# AHK Akademi — Instagram template system

30 ready-made Instagram templates (18 Reels + 12 feed posts/carousels) in the official AHK Akademi brand (navy · gold · white, star mark), plus a one-command workflow that lets a cheap AI write the words and a renderer turn them into an MP4 or PNG you can upload.

```
marketing/instagram/
├── README.md            ← you are here
├── generate.js          ← the daily one-command workflow (AI writes → validate → render)
├── render.js            ← renders a template + JSON into MP4 (reels) or PNG (posts)
├── serve.js             ← opens the gallery of all 30 templates in your browser
├── check.js             ← checks that every template's sample matches its schema
├── calendar.json        ← 30-day posting rotation
├── gallery.html         ← preview of all 30 templates side by side
├── templates.json       ← index of the 30 templates
├── templates/<id>/      ← one folder per template:
│     template.html      ←   the design (HTML/CSS/JS, reads JSON content)
│     schema.json        ←   what the JSON must look like (max lengths etc.)
│     sample.json        ←   example content (also used by --dry-run)
│     prompt.md          ←   the instructions given to the AI for this template
├── prompts/_common.md   ← brand voice + caption/hashtag/audio rules for the AI
├── assets/              ← fonts (Unbounded, Inter, Caveat), logos, base.css, base.js
├── previews/            ← one small PNG per template (for quick review, committed)
└── out/                 ← rendered videos/images (not committed)
```

## One-time setup (5 minutes)

1. Install **Node.js** (18 or newer) from nodejs.org.
2. Install **ffmpeg** (macOS: `brew install ffmpeg`; Windows: download from ffmpeg.org and add it to PATH).
3. Install **Playwright** and its Chromium browser (this is the "invisible browser" that draws the templates):
   ```
   npm install -g playwright
   npx playwright install chromium
   ```
4. Get **one** free/cheap AI key and put it in your environment (no key is ever written into this folder):
   - Google Gemini → `GEMINI_API_KEY` (recommended, generous free tier)
   - or Groq → `GROQ_API_KEY`
   - or Anthropic → `ANTHROPIC_API_KEY` (uses `claude-haiku-4-5-20251001`)

   macOS/Linux: `export GEMINI_API_KEY=...` (put it in `~/.zshrc` to keep it).
   Windows PowerShell: `$env:GEMINI_API_KEY="..."`.

Test that everything works **without** any key:
```
cd marketing/instagram
node generate.js --template r01-turkish-mistake --dry-run
```
You should get `out/<date>_r01-turkish-mistake/reel.mp4` plus `caption.txt`.

## Daily workflow (one command)

```
node generate.js --today
```
That's it. The script:
1. looks at `calendar.json` to see which template is scheduled today,
2. asks the AI to write today's content (topic chosen by the AI, or the hint in the calendar),
3. checks the answer against the template's rules and asks the AI to fix it if needed (up to 3 tries),
4. renders the Reel (`reel.mp4`, 1080×1920, 30 fps, H.264) or the post (`post.png` / `slide-01.png …`),
5. writes `caption.txt` (caption + hashtags + suggested audio mood).

Open `out/<date>_<template>/`, upload the MP4 or PNG(s) to Instagram, paste the caption, add a trending audio in the suggested mood. Done.

Useful variations:
```
node generate.js --template r06-idiom-literal                 # a specific template, AI picks the topic
node generate.js --template r02-quiz-3sec --topic "since vs for"
node generate.js --day 12                                     # a specific calendar day
node generate.js --today --provider groq                      # force a provider
node generate.js --today --no-render                          # only the JSON + caption
node generate.js --today --dry-run                            # no AI: uses the built-in sample
```

If you don't like the AI's text: open `out/.../data.json`, edit the words, then re-render just that file:
```
node render.js r06-idiom-literal --data out/2026-10-05_r06-idiom-literal/data.json --out out/fixed
```

For student testimonials (`r15-before-after`, `p04-testimonial`) always pass the real details, e.g.
`--topic "Elif, 24, IELTS 5.5 → 7.5 in 3 months, goal: master's in Canada, quote: ..."`. The AI is told never to invent names or scores.

## Looking at all templates

```
node serve.js
```
then open http://127.0.0.1:8787/gallery.html — reels play in a loop, carousels auto-advance. Small still previews are also in `previews/`.

## Rendering everything (e.g. after a design change)

```
node render.js all            # all 30 (reels take ~1–2 min each)
node render.js reels          # only reels
node render.js posts          # only posts/carousels
node render.js r01-turkish-mistake --frames 0,2.5,5,8   # quick PNG stills at given seconds
```

## How it works (for whoever maintains it)

- **Templates** are plain HTML/CSS/JS, no build step. Each calls `AHK.template({...})` from `assets/base.js`, which loads content from `window.TEMPLATE_DATA` (injected by the renderer) or `?data=` in the URL, falling back to `sample.json`.
- **Animation is deterministic.** Elements declare `data-anim="in-up@0.3 out-fade@9.4"` (name@delay[:duration[:count]]); `base.js` turns these into CSS animations and drives *all* of them from one clock via `window.__setTime(t)`. The renderer steps `t` frame by frame (30 fps), screenshots each frame and pipes them into ffmpeg, so the MP4 is identical every run. JS-driven effects (countdowns, typewriters, counters, slot machine) are pure functions of `t` in `onTime(t)`.
- **Text never overflows:** schemas cap every field's length, and `data-fit="minPx"` shrinks text to fit its box as a second safety net. Rich text: `**bold**`, `==highlight==`, `~~strike~~`.
- **Safe zones:** reels keep content between y≈260 and y≈1500 and leave the right 130 px free for Instagram's buttons; the brand chrome sits inside the safe zone.
- **Loops:** every reel's last 0.6 s fades back to the hook state so the end flows into the start when Instagram loops it.
- **Validation** (`lib/validate.js`) is a tiny JSON-Schema checker (types, required, lengths, patterns, enums, `$ref` to the shared `meta` schema). `node check.js` validates all samples.
- **LLM providers** (`lib/llm.js`): Gemini (JSON mode) → Groq (JSON mode) → Anthropic Haiku, chosen by which key exists. Prompts = `prompts/_common.md` + the template's `prompt.md` + its schema + its sample as the example.
- **Fonts** are vendored in `assets/fonts/` (Google Fonts, OFL licence) so renders are identical offline. `node fetch-fonts.js` re-downloads them.
- Emoji are drawn by the operating system's emoji font (Noto Color Emoji on Linux, Apple Color Emoji on macOS, Segoe UI Emoji on Windows) — make sure one is installed on the machine that renders.
- Reels are silent; add the trending audio in Instagram (the suggested mood is in `caption.txt`).

## Adding a new template

Copy any `templates/<id>/` folder, change the design in `template.html`, update `schema.json` (keep `maxLength`s tight), `sample.json` and `prompt.md`, add a line to `templates.json`, run `node check.js` and `node render.js <id>`.
