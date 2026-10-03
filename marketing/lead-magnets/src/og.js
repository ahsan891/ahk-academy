#!/usr/bin/env node
/* Generates 1200×630 Open Graph images in brand style with Playwright (Chromium). Usage: node src/og.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'site/assets/og');
fs.mkdirSync(OUT, { recursive: true });

const CARDS = [
  { file: 'index', kicker: 'ÜCRETSİZ ARAÇLAR', title: 'İngilizce ve Arapçada nerede olduğunu 8 dakikada öğren', sub: 'Seviye testi · Alfabe eğitmeni · IELTS hesaplama · 7 günlük kurs', big: '7', bigLabel: 'ücretsiz araç' },
  { file: 'ingilizce-seviye-testi', kicker: 'İNGİLİZCE SEVİYE TESTİ', title: 'İngilizce seviyen gerçekten ne?', sub: '25 soru · 8 dakika · CEFR A1–C1 · anında kişisel plan', big: 'B1+', bigLabel: 'örnek sonuç' },
  { file: 'en-english-level-test', kicker: 'FREE ENGLISH LEVEL TEST', title: 'What is your English level, really?', sub: '25 questions · 8 minutes · CEFR A1–C1 · instant plan', big: 'B2', bigLabel: 'sample result' },
  { file: 'arapca-alfabe', kicker: 'ARAPÇA ALFABE EĞİTMENİ', title: 'Arap alfabesini bir haftada tanı', sub: '28 harf · başta, ortada, sonda · Türkçe ses ipuçları · tanıma testi', big: 'ع', bigLabel: 'Ayn', ar: true },
  { file: 'arapca-hedef-bulucu', kicker: 'ARAPÇA HEDEF BULUCU', title: 'Hangi Arapça sana göre?', sub: 'Kur\'an · Modern Standart · Körfez · Levanten — 6 soruda doğru yol', big: 'ق', bigLabel: 'Kaf', ar: true },
  { file: 'ielts-puan-hesaplama', kicker: 'IELTS PUAN HESAPLAMA', title: 'Doğru sayından band puanına, saniyeler içinde', sub: 'Listening · Reading · overall band · hedefe kalan mesafe', big: '6.5', bigLabel: 'overall band' },
  { file: 'ingilizce-kac-ayda-ogrenilir', kicker: 'HESAPLAYICI', title: 'İngilizce kaç ayda öğrenilir?', sub: 'Cambridge rehber saat tablosu × senin haftalık tempon', big: '11', bigLabel: 'ay → B2' },
  { file: '7-gunluk-ingilizce-konusma', kicker: 'ÜCRETSİZ MİNİ KURS', title: '7 günde Türkçe düşünmeyi bırak', sub: 'Her gün WhatsApp / e-posta ile 10 dakikalık görev + geri bildirim', big: '7', bigLabel: 'gün' },
  { file: 'kopya-kagitlari', kicker: 'PDF KOPYA KÂĞITLARI', title: 'Cebinde taşıyacağın 3 kopya kâğıdı', sub: 'Türkçe düşünme hataları · IELTS Speaking kalıpları · Arapça alfabe', big: 'PDF', bigLabel: '3 dosya' },
  { file: 'gizlilik', kicker: 'KVKK', title: 'Gizlilik ve Aydınlatma Metni', sub: 'Kişisel verilerin korunması · açık rıza · ticari ileti onayı', big: '§', bigLabel: '6698' }
];

const html = (c) => `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
@font-face{font-family:'Unbounded';font-weight:900;src:url(../site/assets/fonts/Unbounded-900-tr.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:600;src:url(../site/assets/fonts/Inter-600-tr.woff2) format('woff2')}
@font-face{font-family:'Noto Naskh Arabic';font-weight:700;src:url(../site/assets/fonts/NotoNaskhArabic-700-arabic.woff2) format('woff2')}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:'Inter',sans-serif;color:#fff;background:radial-gradient(130% 90% at 80% -10%,#1F3B6E 0%,#0E1F3E 45%,#081429 100%);position:relative}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.13) 2px,transparent 2px);background-size:30px 30px;-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.9),rgba(0,0,0,0) 75%)}
.wm{position:absolute;right:-80px;top:-90px;width:520px;height:520px;background:url(../site/assets/img/star-mark-outlined.png) center/contain no-repeat;opacity:.08}
.brand{position:absolute;left:64px;top:52px;display:flex;align-items:center;gap:14px}
.brand img{width:44px}
.brand .t{font-family:'Unbounded';font-weight:900;font-size:26px;letter-spacing:.02em;line-height:1}
.brand .r{height:4px;background:#F5A61F;border-radius:2px;margin:4px 0}
.brand .s{font-size:11px;letter-spacing:.32em;font-weight:600}
.kicker{position:absolute;left:64px;top:150px;background:#F5A61F;color:#0E1F3E;font-weight:800;font-size:18px;letter-spacing:.08em;padding:8px 18px;border-radius:999px}
h1{position:absolute;left:64px;top:210px;width:760px;font-family:'Unbounded';font-weight:900;font-size:54px;line-height:1.1;letter-spacing:-.01em}
.sub{position:absolute;left:64px;top:440px;width:760px;font-size:24px;color:rgba(255,255,255,.82);line-height:1.4}
.url{position:absolute;left:64px;bottom:44px;font-size:22px;font-weight:600;color:#F5A61F}
.card{position:absolute;right:64px;top:170px;width:290px;height:290px;border-radius:40px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);display:grid;place-items:center;text-align:center;box-shadow:0 30px 70px rgba(8,20,41,.4)}
.card b{display:block;font-family:'Unbounded';font-weight:900;font-size:110px;color:#F5A61F;line-height:1}
.card b.ar{font-family:'Noto Naskh Arabic';font-size:150px;line-height:1.1}
.card b.sm{font-size:64px}
.card small{display:block;font-size:20px;color:rgba(255,255,255,.8);margin-top:8px}
</style></head><body><div class="dots"></div><div class="wm"></div>
<div class="brand"><img src="../site/assets/img/star-mark-outlined.png"><div><div class="t">AHK</div><div class="r"></div><div class="s">AKADEMI</div></div></div>
<span class="kicker">${c.kicker}</span><h1>${c.title}</h1><p class="sub">${c.sub}</p><div class="url">ahkademy.com · @ahkacademy</div>
<div class="card"><div><b class="${c.ar ? 'ar' : (c.big.length > 3 ? 'sm' : '')}"${c.ar ? ' lang="ar"' : ''}>${c.big}</b><small>${c.bigLabel}</small></div></div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const tmp = path.join(ROOT, 'src/.og-tmp.html');
  for (const c of CARDS) {
    fs.writeFileSync(tmp, html(c));
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, c.file + '.png'), type: 'png' });
    console.log('og:', c.file);
  }
  fs.unlinkSync(tmp);
  await browser.close();
})();
