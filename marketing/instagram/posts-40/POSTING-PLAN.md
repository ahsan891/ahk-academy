# AHK Akademi — 40 feed posts: posting plan

40 posts (20 carousels + 20 singles), 1080×1350, rendered from `src/posts.json` with `node render.js`.
Files: `out/NN-slug/slideK.png` + `caption.txt` (caption, hashtags, alt text); flat bundle `out/ahk-40-posts.zip`.
Grid preview in posting order: `previews/contact-sheet.png` (newest first, 3 columns, like the profile).

## Posting order (8 weeks × 5 posts)

The order alternates cover colours so every row of 3 on the profile grid has at least one gold / blue / off-white cover
next to the navy ones, and series parts are spaced 2–4 weeks apart. Post in this exact order (it is also in
`src/posting-order.json`, which the contact sheet uses).

| Week | Mon (lunch) | Tue (evening) | Thu (evening) | Fri (evening) | Sun (evening) |
|---|---|---|---|---|---|
| 1 | 01 Türkçe düşünme hataları (C) | 02 False friends (C) | 11 Seviye quiz (C) | 23 Konuşmak mı anlamak mı? (poll) | 25 Hata yapmadan… (poster) |
| 2 | 04 IELTS Speaking Band 6→8 (C) | 22 "I didn't went" | 12 "Very" yerine 16 kelime (C) | 06 GET phrasal verbs (C) | 08 Telaffuz tuzakları (C) |
| 3 | 26 Akıcılık testi (meme) | 13 Kolay gelsin (C) | 05 IELTS Writing bağlaçlar (C) | 09 in/on/at (C) | 29 3 saniye quiz |
| 4 | 20 7 evre (C, humour) | 30 borrow vs lend | 07 Business e-posta (C) | 16 Efsane/Gerçek (C) | 14 Deyimler (C) |
| 5 | 18 a/an/the (C) | 10 Present Perfect (C) | 28 IELTS Task 1 trends | 32 since vs for | 17 IELTS düşünme cümleleri (C) |
| 6 | 24 Günün kelimesi: resilience | 39 Tell me about yourself | 15 Günde 20 dakika sistem (C) | 38 British vs American (myth) | 27 -ed okunuşu |
| 7 | 34 Hangi öğrenci tipisin? | 19 make vs do (C) | 21 Karıştırılan ikililer (C) | 31 E-posta kapanışları | 35 "I think" yerine 10 kalıp |
| 8 | 36 Sessiz harfler | 37 Toplantı cümleleri | 33 Break a leg! | 40 IELTS Part 2 planı | 03 Aksanın bir hata değil (poster) |

(C) = carousel. Grid rows of three in this order: 01·02·11 / 23·25·04 / 22·12·06 / 08·26·13 / 05·09·29 / 20·30·07 /
16·14·18 / 10·28·32 / 17·24·39 / 15·38·27 / 34·19·21 / 31·35·36 / 37·33·40 / 03.
Note: Instagram fills the grid newest-first, so these triplets stay together only if the number of posts already on the
profile before post 01 is a multiple of 3. If it is not, start with one or two singles (e.g. 25, 23) to re-align.

## Days and times (Turkish audience)

General guidance for an 18–30 Turkish audience; verify against your own Instagram Insights after 2–3 weeks and shift
to the hours your followers are actually online.

- Weekday lunch 12:30–13:30 (TRT) and evenings 20:00–22:30 are the two reliable windows. Evening is stronger for
  carousels (people have time to swipe and save).
- Tuesday–Thursday evenings: best for the "save this" cheat sheets and IELTS carousels.
- Friday evening / Sunday evening: quizzes, polls, memes and motivation posters (highest comment + share rate, lowest
  attention span).
- Avoid Saturday afternoon and the hours right after a big football match; avoid 06:00–09:00 entirely.
- Exam seasons: IELTS/TOEFL and YDS dates cluster in spring and autumn; move the IELTS posts (04, 05, 17, 28, 35, 40)
  to the 2–3 weeks before a popular test date when possible.
- Reels still reach more non-followers; share each carousel cover to Stories on posting day with a "Kaydır →" sticker
  and re-share the recap slide 3–4 days later for the second wave of saves.

## Series (reference them in captions and re-share as "Bölüm 1 / 2 / 3")

| Series | Posts | Hook thread |
|---|---|---|
| Türkçe Düşünme (Turkish-thinking mistakes) | 01 → 22 | "Türkçe düşünüyorsun" |
| IELTS Speaking | 04 → 17 → 35 → 40 | Band-raising language, thinking phrases, "I think" alternatives, Part 2 plan |
| IELTS Writing | 05 → 28 | Task 2 linkers, Task 1 trend verbs |
| Telaffuz Tuzakları (pronunciation) | 08 → 36 → 27 | mispronounced words, silent letters, -ed endings |
| Business English | 07 → 31 → 37 → 39 | email phrases, sign-offs, meetings, interview |
| Gramer (grammar made simple) | 09, 10, 18, 32 | in/on/at, Present Perfect, articles, since/for |
| Karıştırılanlar (confusables) | 19, 21, 30 | make/do, 7 pairs, borrow/lend |
| Deyimler & phrasal verbs | 06, 14, 33 | GET, idioms, break a leg |
| Quiz Günü | 11, 29 (+ quiz slides inside 09, 19) | comment-bait quizzes |
| Anket (polls / which one are you) | 23, 34 | A/B and 1–4 comments |
| Mizah (relatable) | 20, 26 | stages, "fine thank you" loop |
| Motivasyon & sistem | 03, 15, 16, 25, 38 | posters, study system, myths |
| Kelime (vocabulary) | 02, 12, 13, 24 | false friends, "very" upgrades, kolay gelsin, word of the day |

Follow-ups promised in captions (write these next): Türkçe Düşünme Bölüm 3, False Friends Bölüm 2, Phrasal Verbs
Bölüm 2 (TAKE), Kolay Gelsin Bölüm 2 (from reader comments). Business English Bölüm 2 and 3 are posts 31 and 37.

## Caption mechanics used in every post

- Hook in line 1 (identical to the cover headline so the feed and the caption say the same thing).
- Value in the body (the full list, so the caption alone is screenshot-worthy and searchable).
- One CTA: comment (number / A-B / score), save, or "send to the friend who…".
- 10–12 hashtags mixing Turkish and English; `#ahkakademi` on every post. Replace with your tested set if you have one.
- Alt text (in `caption.txt` under `ALT TEXT:`) → paste into Advanced settings → Alt text.

## Re-rendering

```
cd marketing/instagram/posts-40
node render.js            # all 40 posts + previews + contact sheet + zip (runs the layout check)
node render.js 07 31      # only those posts
node render.js --check    # layout check only
node render.js --sheet    # rebuild previews/contact-sheet.png in posting order
```
Edit copy in `src/posts.json`; the layouts live in `src/slides.js`, the design tokens in `src/style.css`.
