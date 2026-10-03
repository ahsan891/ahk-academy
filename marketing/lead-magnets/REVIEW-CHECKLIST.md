# Manual review checklist (owner) — AHK Akademi lead-magnet site

Work through every row before connecting a domain. Open the site locally (`cd site && node server.js` → http://localhost:8080) or on Railway. Test each page on a phone (or Chrome DevTools, iPhone 12 / 375 px) **and** on desktop.

Legend: **[Content]** = words you must personally verify; **[Flow]** = behaviour to click through; **[Legal]** = needs lawyer sign-off.

## 0. Global (check once, applies to all pages)

| # | Check | How |
|---|---|---|
| G1 | Header: logo, menu links, "Ücretsiz deneme dersi" button go where you want (`assets/js/config.js` → `trialUrl`, `mainSite`). | Click each. |
| G2 | Mobile menu (☰) opens/closes; every link works. | Phone width. |
| G3 | Footer: wordmark, links, Instagram link, "Gizlilik ve KVKK" link. | Click each. |
| G4 | WhatsApp buttons appear **only** after `whatsappNumber` is set in `config.js`; test that the pre-filled Turkish message opens in WhatsApp. | Set number, reload, tap. |
| G5 | No Turkish spelling/character problems anywhere (ç ğ ı İ ö ş ü). Particular care: words in ALL CAPS (eyebrow labels) — there is no CSS `text-transform`, so what you see is what was typed. | Read every page. |
| G6 | Tone: "sen" form, warm, direct — matches your Instagram voice. | Read every page. |
| G7 | Animations are smooth and not annoying; with "Reduce motion" enabled in phone settings they stop. | iOS: Settings → Accessibility → Motion. |
| G8 | Tab through a page with the keyboard: focus is visible (gold outline), quiz answers work with A/B/C/D keys. | Desktop. |
| G9 | Share preview: paste a page link into WhatsApp — title, description and brand image (`assets/og/*.jpg`) appear. | After deploy. |

## 1. `/` — Hub ("Ücretsiz Araçlar")

- [Content] Hero headline and the 4 example tiles (B1+, ع, 6.5, 11 ay) — these are illustrative examples, make sure that is acceptable to you.
- [Content] "Neden ücretsiz?" three cards, FAQ (4 questions) — especially the "AHK Akademi kimdir?" answer: confirm the description of your services (IELTS/TOEFL, iş İngilizcesi, Kur'an Arapçası, MSA, Körfez/Levanten).
- [Flow] All 7 tool cards open the right page.

## 2. `/ingilizce-seviye-testi/` — İngilizce Seviye Testi (flagship)

- [Content] **All 25 questions and answer keys** in `site/assets/js/level-test.js` (`Q` array; `a` = index of the correct option, 0 = A). Confirm each is correct and feels like the right level (5 × A1, A2, B1, B2, C1).
- [Content] Result texts per level (`RESULTS`: title, head, desc, 3-item plan, next level, hours). Hours are approximations derived from Cambridge guided-learning hours; edit if you disagree.
- [Content] CEFR table, FAQ (6 questions), intro "3 kural".
- [Flow] Start → answer 25 → result ring animates, level badge, level scale highlights, skill bars fill, plan appears, confetti (unless reduced motion).
- [Flow] "Tekrar çöz" resets; "Paylaş" copies/shares the link; "Geri" works; A/B/C/D keys work.
- [Flow] Form: submit empty → errors; e-mail **or** WhatsApp number required (not both); KVKK box required (red if unticked); marketing box optional; success → "Açıldı" box with PDF link and 7-day course link; PDF downloads.
- [Flow] Deliberately get everything wrong → result should be "Başlangıç (Pre-A1)"; everything right → C1.

## 3. `/en/english-level-test/` — English version

- [Content] English copy, result texts (`I18N` in `src/pages/level-test-en.js`), FAQ.
- [Flow] Same as above; the "Türkçe sürüm" button goes to the Turkish test. `hreflang` tags link both versions.

## 4. `/arapca-alfabe/` — Arapça Alfabe Eğitmeni

- [Content] **Every letter** in `site/assets/js/alphabet.js`: Arabic glyph, Turkish name (Elif, Be, Te, Se, Cim, Ha, Hı, Dal, Zel, Ra, Ze, Sin, Şın, Sad, Dad, Tı, Zı, Ayn, Gayn, Fe, Kaf, Kef, Lam, Mim, Nun, He, Vav, Ye), Arabic name with harakat, transliteration, Turkish sound hint, example word + transliteration + meaning. Six non-connecting letters (ا د ذ ر ز و) are flagged `nc: true`.
- [Content] The positional forms are produced by the browser (letter + tatweel), so they cannot be mistyped — but confirm they *look* right in the detail panel and the big table (başta / ortada / sonda).
- [Content] FAQ (6), hero copy, "Sıradaki adım" (harekeler) notes.
- [Flow] Tap any tile → detail panel updates (letter, name, sound, 4 forms, example); Önceki/Sonraki cycle; on phone the panel scrolls into view.
- [Flow] Kartlar tab: card flips on tap, Önceki/Sonraki/Karıştır work, counter updates.
- [Flow] Tanıma testi tab: 10 questions (two types: "Bu harfin adı ne?" and "kelime ortasında … şeklinde yazılan harf"); wrong answer shows the right one; result ring + text; form unlocks the alphabet PDF.
- [RTL] Arabic text is right-to-left, in the Noto Naskh Arabic font (not a fallback), with correct joining — check on iPhone Safari and Android Chrome specifically.
- [Content] Open `assets/pdf/ahk-arapca-alfabe-tablosu.pdf` and check all 28 rows.

## 5. `/arapca-hedef-bulucu/` — Arapça Hedef Bulucu

- [Content] 6 questions and their options/weights, 4 path descriptions, 4-month plans, "first goal", dialect lines (`site/assets/js/goal.js`). Especially the claims about where each dialect is spoken and about Arabic-speaking communities in Turkey.
- [Content] FAQ (5), "4 yol" comparison cards, Arabic path names (العربية القرآنية, العربية الفصحى الحديثة, اللهجة الخليجية, اللهجة الشامية).
- [Flow] Answer all "A" → Kur'an path; all "B" → Körfez; all "C" → Levanten; all "D" → MSA. Result shows path, Arabic name, start point, weekly hours, dialect, plan, score bars, second-best path. Form pre-selects the goal.

## 6. `/ielts-puan-hesaplama/` — IELTS Puan Hesaplama

- [Content] Conversion tables (`LISTENING`, `READING_AC`, `READING_GT` in `site/assets/js/ielts.js`) against the current IDP/British Council tables; the overall rounding rule and the two worked examples; FAQ (6) incl. the CEFR/band mapping and the Turkish university 6.0–6.5 claim.
- [Flow] Sliders update bands live; Academic/General switch changes Reading; overall band pops; target gap text changes; e.g. L35 R33(AC) W6.0 S7.0 → 7.0.
- [Flow] Form unlocks IELTS Speaking PDF; open and check the PDF content (phrases, Part 2 plan).

## 7. `/ingilizce-kac-ayda-ogrenilir/` — süre hesaplayıcı

- [Content] GLH table (Cambridge figures; A1 row is an estimate), the three intensity multipliers (1 / 1.4 / 0.85 — these are judgement calls, say so or change), tips, FAQ (5) incl. the FSI claim.
- [Flow] Level buttons, slider, intensity; months count-up; finish date in Turkish; "faster" line; target cannot be ≤ current level.

## 8. `/7-gunluk-ingilizce-konusma/` — 7-day course

- [Content] The 7 day titles/descriptions — **you will have to actually write and send these 7 lessons** (by WhatsApp/e-mail, manually or via an automation). Day 7 promises personal feedback on a 2-minute recording: make sure you can deliver it.
- [Content] FAQ (5): the "no spam" promise must match your real practice.
- [Flow] Form → success → "İlk ders yarın sabah geliyor" message. Nothing is sent automatically until you connect the endpoint and your e-mail/WhatsApp tool.

## 9. `/kopya-kagitlari/` — PDFs

- [Content] Open all three PDFs: `ahk-turkce-dusunme-hatalari.pdf` (25 sentences + rules), `ahk-ielts-speaking-kaliplari.pdf`, `ahk-arapca-alfabe-tablosu.pdf`. Check every English sentence and rule; "planned next" sheets in the FAQ are promises — edit if you will not make them.
- [Flow] One form unlocks three download links.

## 10. `/gizlilik/` — KVKK Aydınlatma Metni  **[Legal]**

- Fill every `[bracketed]` field: legal name, address, e-mail, phone, processors (e-mail/CRM/WhatsApp tools and countries), retention periods, VERBİS status.
- Have a lawyer confirm: legal bases, cross-border transfer (if your form tool is abroad), İYS registration for marketing consent, cookie section (update if you add Google Analytics and add a cookie banner).
- The consent sentence shown in forms (`src/layout.js` → `leadForm`) must match section 8 of the notice.

## 11. `/404.html`

- [Flow] Open a non-existent URL → branded 404, links back to hub.

## 12. Technical (after deploy)

- `https://your-domain/sitemap.xml` lists all 10 pages; `robots.txt` points to it.
- `site.config.json` → `baseUrl` is your real domain (run `node set-domain.js https://your-domain/` otherwise); view-source → `<link rel="canonical">` and `og:url` match.
- Google Rich Results Test on the level test, alphabet and 7-day pages: no errors (warnings about optional fields are fine).
- PageSpeed Insights (mobile) ≥ 90 performance.
- Submit the sitemap in Google Search Console (see README).
