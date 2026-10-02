# r15-before-after

Make ONE student-win Reel from the details given (name, before score, after score, goal, quote). Use ONLY real details provided by the user; if nothing is provided, produce a clearly generic placeholder (name "Öğrencimiz", realistic scores) and say so in `meta.topic`.

Rules:
- `before` < `after`; both in the same unit (IELTS 0–9 with 0.5 steps, TOEFL 0–120, YDS 0–100…). `decimals` = 1 for IELTS, 0 otherwise.
- `quote` is first person, Turkish, ≤ 110 chars, emotional but specific (what changed).
- Never invent surnames, cities or exam dates.
