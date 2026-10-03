# AHK Akademi — Lead Magnet Site (ücretsiz araçlar)

A small, fast, SEO-first static site with seven free tools ("lead magnets") that bring Turkish-speaking English and Arabic learners to AHK Akademi, show them a useful result immediately, and invite them to leave their e-mail / WhatsApp number for extras (PDFs, plans, a 7-day course) and a free trial lesson.

```
marketing/lead-magnets/
├── README.md              ← you are here (owner guide)
├── RESEARCH.md            ← keyword, competitor, format and legal research with sources
├── REVIEW-CHECKLIST.md    ← what to click and what to read before going live
├── previews/              ← screenshots of every page (desktop + mobile + results)
├── site/                  ← THE SITE. Copy this folder as the root of its own repo / upload it anywhere
│   ├── index.html, <slug>/index.html, 404.html, sitemap.xml, robots.txt, favicon.svg
│   ├── assets/css, js, fonts, img, og (share images), pdf (cheat sheets)
│   ├── assets/js/config.js   ← the ONE file to edit: form endpoint, WhatsApp number, links
│   ├── server.js, package.json, railway.json  ← Railway / Node hosting (no build step)
│   ├── set-domain.js, site.config.json        ← change the domain in all URLs
└── src/                   ← generator (Node, no dependencies): build.js, layout.js, pages/, og.js, pdf.js, verify.js
```

## 1. The seven lead magnets

| Page (Turkish URL) | What the visitor gets, free, without signing up | Gated extra (needs the form) | Target search phrases |
|---|---|---|---|
| `/ingilizce-seviye-testi/` (+ `/en/english-level-test/`) | 25-question CEFR test (A1–C1), animated ring result, level scale, skill bars, a 3-step plan | PDF cheat sheet + 7-day plan + trial link | ingilizce seviye testi, ingilizce seviye tespit sınavı, ücretsiz online ingilizce seviye testi |
| `/arapca-alfabe/` | 28-letter trainer: four forms, Turkish names/sounds, example words, flashcards, 10-question recognition test, full table | Printable alphabet PDF | arapça alfabe, arap alfabesi, arapça harfler, arapça harflerin yazılışı |
| `/arapca-hedef-bulucu/` | 6-question quiz → Kur'an / MSA / Körfez / Levanten path with a 4-month plan | Path roadmap + word list (you send it) | kuran arapçası, arapça öğrenme, hangi arapça, körfez arapçası |
| `/ielts-puan-hesaplama/` | Raw score → band calculator with official rounding and target-gap advice | IELTS Speaking phrases PDF + 8-week plan | ielts puan hesaplama, ielts band hesaplama, ielts listening kaç doğru |
| `/ingilizce-kac-ayda-ogrenilir/` | Months-to-B1/B2/C1 calculator from Cambridge guided-learning hours and the visitor's weekly hours | 12-week plan (you send it) + PDF | ingilizce kaç ayda öğrenilir, b2 kaç saat, ingilizce ne kadar sürer |
| `/7-gunluk-ingilizce-konusma/` | The 7-day programme description | The course itself (7 daily messages you send by WhatsApp/e-mail) | ingilizce konuşma pratiği, türkçe düşünerek ingilizce, ingilizce konuşamıyorum |
| `/kopya-kagitlari/` | Description of 3 PDF cheat sheets | The 3 PDFs | ingilizce kalıplar pdf, arapça alfabe pdf |

Plus `/` (hub), `/gizlilik/` (KVKK notice, **draft for your lawyer**) and a branded 404.

Results are never gated: visitors see their level/plan first; the form only unlocks extras. Forms ask for name, e-mail **or** WhatsApp number, language, goal, a required KVKK consent box and an optional marketing (ticari ileti) box.

## 2. Run it locally (2 minutes)

Install Node 20+ from nodejs.org, then:

```
cd marketing/lead-magnets/site
node server.js            # → http://localhost:8080
```

That is the exact server Railway will run. Nothing to install.

## 3. Deploy on Railway (recommended)

1. Create an empty GitHub repo (in the account you deploy from). Copy **the contents of `site/`** into it (so `package.json`, `server.js` and `index.html` sit at the repo root). Commit and push.
2. Railway → New Project → Deploy from GitHub repo → pick that repo. Railway detects `package.json` and runs `npm start` (`node server.js`); `railway.json` sets the health check (`/healthz`). No build step, no environment variables are required.
3. Settings → Networking → Generate domain (for a first look), then **Custom domain** → add e.g. `araclar.ahkademy.com` (subdomain, easiest) or `ahkademy.com` (if the whole domain should point here). Add the CNAME Railway shows at your DNS provider.
4. Tell the site its public address (this rewrites canonical URLs, Open Graph URLs, hreflang, sitemap and robots in one go):
   ```
   node set-domain.js https://araclar.ahkademy.com/
   ```
   Commit and push again. (To put the site under a path on the main domain, e.g. `https://ahkademy.com/ucretsiz/`, the main site's server must proxy that path to Railway; then run `node set-domain.js https://ahkademy.com/ucretsiz/`. All asset links are relative, so pages work in a sub-folder too, except `404.html`, which uses root-relative links.)
5. Open the Railway URL and go through `REVIEW-CHECKLIST.md`.

Any other host works as well: the `site/` folder is plain HTML — upload it to Netlify, Vercel (static), cPanel/FTP, GitHub Pages or an S3 bucket. On hosts without `server.js`, make sure `/slug/` serves `slug/index.html` (all do) and point the host's "custom 404" to `404.html`.

## 4. Connect the forms (`site/assets/js/config.js`)

Open `assets/js/config.js` and fill in:

```js
leadEndpoint: "https://…",      // where the form posts (see options below). Empty = demo mode.
whatsappNumber: "90xxxxxxxxxx", // your WhatsApp Business number; shows the green buttons
trialUrl: "https://ahkademy.com/…", // where "Ücretsiz deneme dersi" goes (page, Calendly, wa.me link)
```

In demo mode (empty `leadEndpoint`) submissions are stored only in the visitor's browser (`localStorage["ahk_leads"]`) and the extras still unlock, so nothing breaks before you connect a backend — but you will not receive the leads.

The form sends one JSON object (POST, `Content-Type: application/json`):

```json
{ "source":"lead-magnet", "magnet":"ingilizce-seviye-testi", "page":"/ingilizce-seviye-testi/",
  "name":"Ayşe", "email":"ayse@example.com", "phone":"+905xxxxxxxxx",
  "language":"english", "goal":"ielts", "result":"English B1+ (15/25)",
  "consents":{ "kvkk":true, "marketing":false, "consentText":"…", "at":"2026-10-03T10:00:00Z", "userAgent":"…" },
  "url":"…", "referrer":"…" }
```

Options, easiest first:

**A. Form service (no code).** Formspree, Basin, Getform, Web3Forms or a Google Sheets Apps Script web app all accept JSON POSTs. Paste their endpoint into `leadEndpoint`. They e-mail you each lead and keep a list; connect them to your e-mail tool (Mailchimp/Brevo) with their built-in integrations. Keep the `consents` fields — they are your KVKK/İYS proof.

**B. Your own platform (this repository).** The Next.js app already has WhatsApp conversations with a `LEAD` type (`src/app/api/whatsapp/…`, `WhatsappConversation` model in `prisma/schema.prisma`). Add a public route `src/app/api/leads/route.ts` that:
1. accepts the JSON above (validate `name`, at least one of `email`/`phone`, and `consents.kvkk === true`; reject otherwise with 400),
2. stores it (new `Lead` model, or `WhatsappConversation` with `conversationType: "LEAD"` + the payload in `context`),
3. optionally sends the welcome WhatsApp via `WhatsAppService.sendTemplate` (needs a pre-approved template) or an e-mail with the requested PDF link,
4. returns `{ ok: true }` with CORS headers `Access-Control-Allow-Origin: https://araclar.ahkademy.com` (and handles `OPTIONS`), because the static site lives on a different origin.
Then set `leadEndpoint: "https://ahkademy.com/api/leads"`. If you protect the route with a key, put it in `leadHeaders` — note that anything in `config.js` is public, so use a key that only allows creating leads.

**C. Automation tools.** Zapier/Make "Webhooks → Catch hook" URL as `leadEndpoint`, then push to Google Sheets, Brevo, WhatsApp Business API, etc.

Sending the 7-day course: the site only collects the sign-up. Set up a 7-step automation in your e-mail tool (Brevo/Mailchimp) or send manually from WhatsApp Business using the day texts on the page; the PDFs are at `assets/pdf/`.

## 5. Google Search Console + sitemap (15 minutes)

1. search.google.com/search-console → Add property → "URL prefix" → `https://araclar.ahkademy.com/` (or the domain). Verify with the HTML tag method: Railway can't add files on the fly, so paste the `<meta name="google-site-verification">` tag into `src/layout.js` (head section) and rebuild, or verify the whole domain via DNS TXT record (recommended; covers all subdomains).
2. Sitemaps → enter `sitemap.xml` → Submit. It lists all 10 pages with `lastmod` and hreflang.
3. URL Inspection → request indexing for the three most important pages (seviye testi, arapça alfabe, IELTS).
4. After 4–8 weeks: Performance report → Queries. This replaces the search-volume numbers we could not measure (see `RESEARCH.md`); add FAQ answers for the questions people actually type.
5. Optional: Bing Webmaster Tools (imports from GSC) and Yandex Webmaster (Yandex has ~11–17 % of Turkish search).
6. Test rich results: search.google.com/test/rich-results on each page. Note: Google no longer shows FAQ rich snippets for sites like ours and has no Turkish "Quiz" carousel; the markup is still valid and future-proof.

## 6. Updating content

Edit the source, not the built HTML:
- Questions/answers: `site/assets/js/level-test.js` (`Q`, `RESULTS`), `alphabet.js` (`L`), `goal.js` (`Q`, `PATHS`), `ielts.js` (tables), `hours.js` (`GLH`).
- Page copy, titles, descriptions, FAQs: `src/pages/*.js`. Shared header/footer/form/consent text: `src/layout.js`.
- Then rebuild: `node src/build.js` (writes `site/`), regenerate share images `node src/og.js` and PDFs `node src/pdf.js` (both need `npm i -g playwright` + Chromium), and verify: `cd site && node server.js` in one terminal, `BASE=http://127.0.0.1:8080 node src/verify.js` in another (screenshots land in `previews/`).
- Add a page: create `src/pages/<name>.js` (copy an existing one), add its name to the list in `src/build.js`, add a card in `magnetCards` in `src/layout.js` and an OG card in `src/og.js`.

## 7. Promotion plan (Instagram → these pages)

The pages are built to be "the link in bio" and the answer to every "nasıl öğrenirim?" comment.

1. **Link in bio** → the hub `/`. Change the bio text to the strongest hook: "İngilizce seviyeni 8 dakikada öğren (ücretsiz test) ↓".
2. **Pin three posts** that already exist in `marketing/instagram/posts-40/`: 11 *seviye quiz* → level test; 01 *Türkçe düşünme hataları* → PDF cheat sheet / 7-day course; 04/05/17/28/40 *IELTS* series → IELTS calculator. Add the page URL as the last caption line and in the first comment.
3. **Reels → tool, same topic.** Each reel template (`marketing/instagram/templates`) ends with a CTA; use these pairings: quiz/mistake reels → `/ingilizce-seviye-testi/`; IELTS reels → `/ielts-puan-hesaplama/`; "kaç ayda?" myth reels → `/ingilizce-kac-ayda-ogrenilir/`; any Arabic content → `/arapca-alfabe/` first (lowest-friction), then `/arapca-hedef-bulucu/`.
4. **Stories with link stickers** 2–3× a week: "Seviyeni bil → sticker", "Harfleri 1 haftada → sticker", a poll ("Kur'an Arapçası mı, konuşma mı?") followed by the hedef bulucu link.
5. **Result sharing loop.** Every result screen has a "Paylaş" button (native share / copy link) and "Sonucu WhatsApp'tan gönder". Ask students to post their level badge in stories and tag @ahkacademy; repost.
6. **WhatsApp groups and DMs.** The PDFs are made for forwarding; send the alphabet table to anyone asking about Arabic, the "Türkçe düşünme hataları" sheet to anyone asking about speaking. Each PDF carries ahkademy.com and the tool's name.
7. **Monthly:** check Search Console queries, add one FAQ answer per page for new questions, and post one carousel per tool ("5 soruda seviyeni tahmin et — tam testi bio'da").

## 8. What is still yours to decide / verify

- **Legal:** `/gizlilik/` is a draft with `[brackets]`; a lawyer must confirm it (KVKK aydınlatma, açık rıza wording, İYS for the marketing box, cookie section if you add analytics).
- **Endpoint + sending:** choose option A/B/C above; set up the 7-day course sending and the "plan within 24 hours" promises on result screens (or soften that text in `src/pages/*.js`).
- **Domain:** subdomain vs. path (section 3) — then `set-domain.js`.
- **Content accuracy:** go through `REVIEW-CHECKLIST.md` — questions, Arabic letters, Turkish copy, IELTS tables.
- **Analytics:** `ga4Id` in `config.js` loads GA4 only when set; if you set it, update the cookie section of the privacy notice and consider a consent banner.

## 9. Verification results (2026-10-03, local build)

- Playwright (`src/verify.js`, Chromium, desktop 1366 px + iPhone 12 / 375 px): all 11 pages load with **no console errors, no failed requests, no horizontal scroll**; unique `<title>`, description and canonical per page; JSON-LD parses on every page; hreflang pairs on the two level-test pages; sitemap lists every indexable page; server redirects `/slug` → `/slug/` (301), serves a branded 404 and Brotli-compressed HTML with security headers. Flows tested end to end: level test (25 answers → B1 result, ring/scale/bars, PDF unlock), form validation (empty → errors; KVKK unticked → blocked; valid → stored with consent record), alphabet trainer (tile → detail, RTL + Noto Naskh Arabic confirmed via computed styles and `document.fonts`), recognition quiz, goal finder (all-B → Körfez path), IELTS (L35 R33 W6.0 S7.0 → 7.0), hours (0→B2 @10 h/week → 13 months).
- Lighthouse 12 (mobile, simulated slow 4G, `npx lighthouse`): every page **Performance 97–100, Accessibility 100, Best Practices 100, SEO 100**; LCP 1.7–2.6 s, CLS 0.00–0.01, TBT ≤ 80 ms; total page weight 143–255 KiB (fonts subset to Latin + Turkish, CSS inlined, no third-party scripts).
- JSON-LD: required properties checked for Organization, WebSite, WebPage, BreadcrumbList, FAQPage, Quiz, Course/CourseInstance, WebApplication, ItemList. Re-check with Google's Rich Results Test after deploy (the schema.org vocabulary file could not be downloaded in the build environment).
