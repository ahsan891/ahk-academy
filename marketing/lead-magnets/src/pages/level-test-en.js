'use strict';
const L = require('../layout');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const data = (() => { const s = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../site/assets/js/level-test.js'), 'utf8'), { module: { exports: s } }); return s.AHK_LEVEL_TEST; })();

const I18N = {
  question: 'Question', next: 'Next', finish: 'See my result', options: 'Options', skillG: 'Grammar', skillV: 'Vocabulary', skillU: 'Usage',
  shareText: 'My English level: ', shareCta: 'find yours in 8 minutes:', waText: 'Hello AHK Akademi, my level test result is ', waText2: '. Could I get information about a free trial lesson?',
  'lv_Pre-A1': 'Beginner (Pre-A1)', lv_A1: 'A1 — Beginner', lv_A2: 'A2 — Elementary', lv_B1: 'B1 — Intermediate', lv_B2: 'B2 — Upper-intermediate', lv_C1: 'C1 — Advanced',
  'head_Pre-A1': 'You are starting from zero, which also means no bad habits.', head_A1: 'The basics are in place. Time to start joining simple sentences.', head_A2: 'You can get by in daily life. B1, the "independence level", is close.', head_B1: 'You are an independent user. B2 opens doors to work and study abroad.', head_B2: 'Fluent and confident. C1 makes you sound almost native.', head_C1: 'Advanced. The question is no longer "correct" but "impressive".',
  'desc_Pre-A1': 'You recognise basic words and the verb "to be", but building sentences is still hard. First goal: A1 within 2–3 months.', desc_A1: 'You can introduce yourself and understand simple questions. Next big step: past tense and everyday dialogues.', desc_A2: 'You use the past tense and comparisons. For B1 you need conditionals, present perfect and a wider vocabulary.', desc_B1: 'You can handle travel and work situations. For B2: passive structures, reported speech, phrasal verbs and fluency.', desc_B2: 'You understand complex texts and join discussions. For C1: inversion, advanced linkers, nuanced word choice and naturalness.', desc_C1: 'You used nuanced structures and advanced vocabulary correctly. Next: C2 subtleties, academic/professional style and presentation skills.',
  'plan_Pre-A1': ['15 minutes a day: "to be", "have got" and the 100 most common words.', 'Memorise 5 sentences about yourself aloud (I am…, I live in…, I work as…).', 'One speaking lesson a week to get used to talking from day one.'],
  plan_A1: ['Past simple + the 50 most common irregular verbs.', '10 minutes of reading aloud daily to build a pronunciation reflex.', 'One speaking session a week: restaurant, directions, shopping.'],
  plan_A2: ['Present perfect vs past simple — the most confused topic for Turkish speakers.', '20 minutes a day shadowing short scenes from series.', 'Two speaking lessons a week: explain an idea for one minute.'],
  plan_B1: ['One phrasal verb + one collocation a day, used in a sentence.', 'Record a 5-minute monologue twice a week; listen and correct.', 'If IELTS/TOEFL is your goal, start now: B1 to band 6.0–6.5 typically takes 4–6 months.'],
  plan_B2: ['One long article a week (The Economist, BBC Future) + 10 new words used actively.', 'Replace "very + adjective" with strong adjectives (exhausted, furious, fascinating).', 'Aiming for IELTS 7.0+? Two Writing Task 2 essays a week.'],
  plan_C1: ['Prepare a 3-minute presentation, record it and vary your phrasing.', 'Idioms and tone: switch between formal and informal deliberately.', 'IELTS 7.5–8.0 or Cambridge C1 Advanced can be a clear target.']
};
const FAQ = [
  ['How does the English level test work?', 'The test has 25 questions arranged by CEFR level: five each for A1, A2, B1, B2 and C1, covering grammar, vocabulary and usage. The system looks at the highest level you answer consistently and estimates your level. No time limit; it takes about 8 minutes.'],
  ['Is the result an official certificate?', 'No. This is a free placement estimate, not a substitute for IELTS, TOEFL or Cambridge exams. Its purpose is to show where to start and what to focus on.'],
  ['Do I need to sign up to see my result?', 'No. Your level and personal plan appear immediately. Only if you want the detailed PDF report and 7-day plan by e-mail or WhatsApp do you leave your details.'],
  ['Does it test speaking and listening?', 'This short test measures reading, grammar and vocabulary. For speaking and listening the most accurate measure is a 20-minute conversation with a teacher, which we do in the free trial lesson.']
];

module.exports = {
  path: 'en/english-level-test/',
  lang: 'en',
  title: 'Free English Level Test (8 Minutes, CEFR A1–C1) | AHK Akademi',
  ogTitle: 'Free English level test — your CEFR level in 8 minutes',
  description: 'Free online English placement test: 25 questions, instant CEFR result (A1, A2, B1, B2, C1) and a personal study plan. No sign-up required. By AHK Akademi.',
  alternates: [{ lang: 'tr', path: 'ingilizce-seviye-testi/' }, { lang: 'en', path: 'en/english-level-test/' }, { lang: 'x-default', path: 'ingilizce-seviye-testi/' }],
  scripts: ['level-test.js'],
  jsonld: [
    L.breadcrumbLd([['Free tools', ''], ['English level test', 'en/english-level-test/']]),
    { '@type': 'Quiz', name: 'English Level Test (CEFR A1–C1)', description: 'A free 25-question test estimating your CEFR level from grammar, vocabulary and usage questions.', inLanguage: 'en', educationalAlignment: { '@type': 'AlignmentObject', alignmentType: 'educationalLevel', educationalFramework: 'CEFR', targetName: 'A1, A2, B1, B2, C1' }, provider: { '@id': L.ORG_ID }, isAccessibleForFree: true },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => {
    const q0 = data.Q[0];
    return `<script>window.AHK_I18N={levelTest:${JSON.stringify(I18N)}};</script>
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <div class="crumbs"><a href="${root}">Free tools</a><span>›</span>English level test</div>
    <span class="eyebrow"><i class="star"></i> FREE · NO SIGN-UP</span>
    <h1>What is your English level, <mark>really</mark>?</h1>
    <p class="lead">25 questions, about 8 minutes. At the end: your CEFR level (A1–C1), your strengths and weaknesses, and a concrete plan for the next level — instantly on screen.</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="#test">Start the test <span class="arrow">→</span></a><a class="btn btn-ghost" href="${root}ingilizce-seviye-testi/" hreflang="tr" lang="tr">Türkçe sürüm</a></div>
    <ul class="hero-facts"><li><i class="star"></i>CEFR-aligned</li><li><i class="star"></i>Instant result</li><li><i class="star"></i>Personal plan</li></ul>
  </div>
  <div class="hero-art"><div class="orb gold float" style="width:90px;height:90px;right:4%;top:-20px"></div><div class="hero-card float d1"><span class="hand">Your level:</span><div class="big">B1<span style="font-size:.4em">+</span></div><p style="margin:6px 0 0;color:rgba(255,255,255,.85)">Intermediate — close to B2</p><div class="hero-demo" aria-hidden="true"><div class="bar"><i style="--w:88%"></i></div><div class="bar"><i style="--w:64%"></i></div><div class="bar"><i style="--w:52%"></i></div></div></div></div>
</div></div></section>

<section class="section" id="test"><div class="container narrow"><div class="tool">
  <div id="intro"><span class="pill gold">Before you start</span><h2 style="margin-top:10px">3 rules, 8 minutes</h2>
    <ol class="steps"><li><span><strong>No dictionary, guessing is fine.</strong> If you don't know, pick the most logical option; that is exactly what the test measures.</span></li><li><span><strong>Questions get harder.</strong> Struggling near the end is normal; C1 questions are hard for everyone.</span></li><li><span><strong>Result is instant.</strong> No sign-up; the PDF report is optional at the end.</span></li></ol>
    <div class="q-nav" style="margin-top:26px"><span class="muted">25 questions · A1 to C1 · keys A/B/C/D work</span><button type="button" class="btn btn-gold btn-lg" id="start">Start the test <span class="arrow">→</span></button></div></div>
  <div id="quiz" hidden>
    <div class="tool-top"><span class="q-level">Question 1</span><span class="q-counter">1 / ${data.Q.length}</span></div>
    <div class="progress" role="progressbar" aria-label="Progress"><i></i></div>
    <div class="q-card"><p class="q-text">${q0.q.replace('___', '<span class="blank">___</span>')}</p><div class="options">${q0.o.map((o, i) => `<button type="button" class="opt" data-i="${i}"><span class="key">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div></div>
    <div class="q-nav"><button type="button" class="btn btn-outline q-back" disabled>← Back</button><button type="button" class="btn btn-navy q-next" disabled>Next</button></div>
  </div>
  <div class="result" id="result" aria-live="polite">
    <div class="result-hero">
      <div class="ring pop"><svg viewBox="0 0 180 180" aria-hidden="true"><circle class="track" cx="90" cy="90" r="80"></circle><circle class="fill" cx="90" cy="90" r="80"></circle></svg><div class="center"><b class="r-level">B1</b><small><span class="r-pct">0%</span> correct</small></div></div>
      <div><span class="pill gold rise">Estimated CEFR level</span><h2 class="r-title rise d1" style="margin-top:10px"></h2><p class="r-head rise d2" style="font-weight:600;font-size:1.1rem"></p><p class="r-desc rise d2"></p>
        <div class="level-scale rise d3" aria-hidden="true"><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span></div>${L.resultActions(root, 'en')}</div>
    </div>
    <div class="grid grid-2" style="margin-top:22px">
      <div class="card"><h3>Skill breakdown</h3><p class="muted"><b class="r-score">0 / 25</b> correct in total. Area to work on most: <b class="r-weak">vocabulary</b>.</p><div class="skills"></div></div>
      <div class="card plan"><h3>Next level: <span class="r-next">B2</span></h3><p class="muted">Roughly <b class="r-hours">180</b> guided hours (approximation derived from Cambridge guided learning hours). Priorities for the first 30 days:</p><ul></ul></div>
    </div>
    ${L.leadForm({ root, lang: 'en', magnet: 'english-level-test-en', title: 'Get the detailed PDF report and your 7-day plan', desc: 'Your result stays on screen. If you want the level-specific study plan, word list and a free trial lesson link, we can send them by e-mail or WhatsApp.', unlock: `<b>Unlocked:</b> <a href="${root}assets/pdf/ahk-ielts-speaking-kaliplari.pdf" download>IELTS Speaking phrases (PDF)</a> · Your level-specific plan will arrive within 24 hours.` })}
  </div>
</div></div></section>

<section class="section alt" id="faq"><div class="container narrow"><div class="section-head"><div class="kicker"><i class="star"></i>FAQ</div><h2>About the English level test</h2></div>${L.faqHtml(FAQ)}</div></section>
${L.ctaBand(root, 'en')}`;
  }
};
