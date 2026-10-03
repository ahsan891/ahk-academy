#!/usr/bin/env node
/* Generates the three cheat-sheet PDFs (A4) with Playwright. Usage: node src/pdf.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'site/assets/pdf');
fs.mkdirSync(OUT, { recursive: true });
const alphabet = (() => { const s = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'site/assets/js/alphabet.js'), 'utf8'), { module: { exports: s } }); return s.AHK_ALPHABET; })();

const CSS = `
@font-face{font-family:'Unbounded';font-weight:900;src:url(../site/assets/fonts/Unbounded-900-tr.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:400;src:url(../site/assets/fonts/Inter-400-tr.woff2) format('woff2')}
@font-face{font-family:'Inter';font-weight:800;src:url(../site/assets/fonts/Inter-800-tr.woff2) format('woff2')}
@font-face{font-family:'Noto Naskh Arabic';font-weight:400;src:url(../site/assets/fonts/NotoNaskhArabic-400-arabic.woff2) format('woff2')}
@font-face{font-family:'Noto Naskh Arabic';font-weight:700;src:url(../site/assets/fonts/NotoNaskhArabic-700-arabic.woff2) format('woff2')}
*{box-sizing:border-box;margin:0}
@page{size:A4;margin:14mm 14mm 16mm}
body{font-family:'Inter',sans-serif;color:#0E1F3E;font-size:10.5pt;line-height:1.4}
.head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #F5A61F;padding-bottom:8px;margin-bottom:14px}
.brand{display:flex;align-items:center;gap:10px}.brand img{width:30px}.brand .t{font-family:'Unbounded';font-weight:900;font-size:16px;line-height:1}.brand .r{height:3px;background:#F5A61F;margin:3px 0;border-radius:2px}.brand .s{font-size:7px;letter-spacing:.3em;font-weight:800}
.head .url{font-size:9pt;color:#4B587A;font-weight:800}
h1{font-family:'Unbounded';font-weight:900;font-size:20pt;line-height:1.15;margin-bottom:4px}
.lead{color:#4B587A;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:9.5pt}
th,td{border-bottom:1px solid #DCE3F0;padding:5px 6px;text-align:left;vertical-align:top}
th{background:#E7EEF9;font-weight:800;font-size:8.5pt}
tr{page-break-inside:avoid}
.wrong{color:#D4423E;text-decoration:line-through}.right{color:#1E9E63;font-weight:800}
.ar{font-family:'Noto Naskh Arabic';direction:rtl;font-size:16pt;line-height:1.2}
.ar.big{font-size:20pt}
.box{background:#FFF1D6;border-left:4px solid #F5A61F;padding:8px 10px;margin:10px 0;border-radius:0 8px 8px 0}
.two{columns:2;column-gap:18px}
h2{font-family:'Unbounded';font-size:12pt;margin:12px 0 6px;color:#1F5FAE;break-after:avoid}
ul{padding-left:14px}li{margin-bottom:3px;break-inside:avoid}
.foot{position:fixed;bottom:0;left:0;right:0;font-size:8pt;color:#4B587A;display:flex;justify-content:space-between}
`;
const head = (title) => `<div class="head"><div class="brand"><img src="../site/assets/img/star-mark.png"><div><div class="t">AHK</div><div class="r"></div><div class="s">AKADEMI</div></div></div><div class="url">ahkademy.com · @ahkacademy · ${title}</div></div>`;
const foot = `<div class="foot"><span>© AHK Akademi — ücretsiz kopya kâğıdı, kaynak göstererek paylaşabilirsin.</span><span>ahkademy.com</span></div>`;
const doc = (title, body) => `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body>${head(title)}${body}${foot}</body></html>`;

// 1) Türkçe düşünme hataları — 25 cümle
const MISTAKES = [
  ['I am agree with you.', 'I agree with you.', '"agree" bir fiil; "am" gerekmez.'],
  ['I have 25 years.', 'I am 25 (years old).', 'Yaş "sahip olunan" değil "olunan" bir şeydir.'],
  ['Open the light, please.', 'Turn on the light, please.', 'Işık/cihazlar açılmaz, "turn on/off" yapılır.'],
  ['I will explain you.', 'I will explain it to you.', '"explain" doğrudan kişi nesnesi almaz: explain sth to sb.'],
  ['I am boring.', 'I am bored.', '-ing = sıkıcı olan, -ed = sıkılan. "boring" dersen "sıkıcıyım" olur.'],
  ['She said me that…', 'She told me that… / She said that…', '"say" kişi nesnesi almaz; "tell" alır.'],
  ['I am going to home.', 'I am going home.', '"home" zarf gibi kullanılır; "to" yok.'],
  ['Can you borrow me your pen?', 'Can you lend me your pen?', 'borrow = ödünç almak, lend = ödünç vermek.'],
  ['I have been to İstanbul last year.', 'I went to İstanbul last year.', 'Belirli geçmiş zaman (last year) → past simple.'],
  ['He is married with a teacher.', 'He is married to a teacher.', '"married to" kalıbı.'],
  ['I didn\'t went.', 'I didn\'t go.', '"did" zaten geçmişi taşır; fiil yalın kalır.'],
  ['We discussed about the plan.', 'We discussed the plan.', '"discuss" edat almaz.'],
  ['I am thinking to buy a car.', 'I am thinking of buying a car.', 'think of/about + -ing.'],
  ['She is very good in English.', 'She is very good at English.', '"good at" kalıbı.'],
  ['I have a good news.', 'I have (some) good news.', '"news" sayılamaz; "a" almaz.'],
  ['Every people know it.', 'Everyone knows it. / All people know it.', '"people" çoğul; "every" tekil isim ister.'],
  ['I want that you come.', 'I want you to come.', 'want + nesne + to-fiil.'],
  ['He has 3 childs.', 'He has 3 children.', 'Düzensiz çoğul.'],
  ['I\'m waiting you since an hour.', 'I\'ve been waiting for you for an hour.', 'for = süre, since = başlangıç noktası; wait for sb.'],
  ['Please, close your phone.', 'Please turn off / switch off your phone.', 'Telefon "kapatılmaz", switch off yapılır.'],
  ['I am here since 2019.', 'I have been here since 2019.', 'Geçmişten şimdiye uzanan durum → present perfect.'],
  ['Let\'s make a party!', 'Let\'s have / throw a party!', 'party → have/throw; "make" değil.'],
  ['I will tell you later, ok? — Ok, I\'m waiting.', 'OK, I\'ll be waiting. / Sure.', 'Türkçe "bekliyorum" kalıbı; İngilizcede gelecek niyet.'],
  ['My English is not enough.', 'My English isn\'t good enough.', '"enough" tek başına "yeterli" sıfatı olmaz; good enough.'],
  ['I\'m fluent speaker but I do mistakes.', 'I\'m a fluent speaker but I make mistakes.', 'make a mistake; "a" + sayılabilir meslek/sıfat.']
];
const mistakesHtml = doc('Türkçe Düşünme Hataları', `<h1>Türkçe Düşünme Hataları — 25 cümle</h1><p class="lead">Birebir çeviriden doğan en sık 25 hata, doğrusu ve 10 saniyelik kuralı. Konuşmadan önce 2 dakika göz at.</p>
<table><thead><tr><th>#</th><th>Böyle söyleme</th><th>Böyle söyle</th><th>Kural</th></tr></thead><tbody>${MISTAKES.map((m, i) => `<tr><td>${i + 1}</td><td class="wrong">${m[0]}</td><td class="right">${m[1]}</td><td>${m[2]}</td></tr>`).join('')}</tbody></table>
<div class="box"><b>Altın kural:</b> Cümleyi Türkçe kurup çevirme; İngilizce kalıbı olduğu gibi al. Her kalıbı 3 kez sesli söyle, bir kez kendi cümlende kullan.</div>
<p style="font-size:9pt;color:#4B587A">Daha fazlası: ahkademy.com → "7 Günlük İngilizce Konuşma Kursu" (ücretsiz) ve Instagram @ahkacademy.</p>`);

// 2) IELTS Speaking kalıpları
const S = {
  'Düşünme zamanı kazan (Part 1–3)': ['Let me think about that for a second…', 'That\'s an interesting question.', 'Off the top of my head, I\'d say…', 'I\'ve never really thought about it, but…', 'Well, it depends on…'],
  'Fikir belirt': ['In my opinion / From my point of view…', 'I\'m inclined to think that…', 'As far as I\'m concerned…', 'I\'d argue that…', 'Personally, I believe…'],
  'Karşılaştır ve dengele': ['On the one hand… on the other hand…', 'Whereas / while…', 'Compared with…, … is far more…', 'There are pros and cons to both.', 'It\'s not as simple as it seems.'],
  'Spekülasyon ve gelecek (Part 3)': ['It\'s likely that…', 'I imagine that in the future…', 'There\'s a good chance that…', 'If this trend continues, …', 'It\'s hard to predict, but…'],
  'Örnek ver ve uzat': ['For instance / To give you an example…', 'A case in point is…', 'What I mean by that is…', 'In other words…', 'The reason I say this is…'],
  'Güçlü sıfatlar ("very" yerine)': ['very tired → exhausted', 'very good → excellent / superb', 'very interesting → fascinating', 'very big → enormous / huge', 'very important → crucial / vital', 'very happy → delighted / thrilled']
};
const PART2 = ['0–5 sn: Konuyu oku, "who / what / when / why" noktalarını belirle.', '5–60 sn: 4 anahtar kelime not al (isimler, bir rakam, bir his, bir sonuç).', 'Giriş (10 sn): "I\'d like to talk about…"', 'Gövde (80 sn): Geçmiş → ayrıntı → duygu (past simple + present perfect + bir "which was…" cümlesi).', 'Kapanış (10 sn): "So that\'s why … is so memorable to me."', 'Tuzaklar: tek zamanla konuşmak, "very" bağımlılığı, 1 dakikadan önce bitirmek.'];
const ieltsHtml = doc('IELTS Speaking Kalıpları', `<h1>IELTS Speaking Kalıpları — Part 1, 2, 3</h1><p class="lead">Band 6.5–7.5 için akıcılık ve kelime çeşitliliği (Fluency & Coherence, Lexical Resource) kalıpları. Hepsini değil, her gruptan 2 tanesini otomatik hâle getir.</p>
<div class="two">${Object.keys(S).map(k => `<h2>${k}</h2><ul>${S[k].map(x => `<li>${x}</li>`).join('')}</ul>`).join('')}</div>
<h2>Part 2 — 2 dakikalık plan</h2><ol style="padding-left:16px">${PART2.map(x => `<li>${x}</li>`).join('')}</ol>
<div class="box"><b>Puanlama hatırlatması:</b> Speaking dört kritere göre puanlanır: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation. Kalıplar ilk ikisini doğrudan etkiler; telaffuz için her kalıbı sesli kaydet ve dinle.</div>
<p style="font-size:9pt;color:#4B587A">IELTS puanını hesapla: ahkademy.com → "IELTS Puan Hesaplama" (ücretsiz).</p>`);

// 3) Arapça alfabe tablosu
const rows = alphabet.L.map((x, i) => { const f = alphabet.forms(x); return `<tr><td>${i + 1}</td><td class="ar big"><b>${x.ar}</b></td><td><b>${x.tr}</b><br><span class="ar" style="font-size:12pt">${x.name}</span></td><td>${x.lat}</td><td class="ar">${f.initial}</td><td class="ar">${f.medial}</td><td class="ar">${f.final}</td><td><span class="ar" style="font-size:14pt">${x.ex}</span><br>${x.exlat} — ${x.extr}</td><td style="font-size:8.5pt">${x.sound}</td></tr>`; }).join('');
const alphabetHtml = doc('Arapça Alfabe Tablosu', `<h1>Arapça Alfabe Tablosu — 28 harf</h1><p class="lead">Sağdan sola okunur. Çoğu harfin dört şekli vardır; ا د ذ ر ز و kendinden sonraki harfe bağlanmaz (başta/ortada şekli bağımsız şekliyle aynıdır).</p>
<table><thead><tr><th>#</th><th>Harf</th><th>Adı</th><th>Ses</th><th>Başta</th><th>Ortada</th><th>Sonda</th><th>Örnek</th><th>Türkçe ipucu</th></tr></thead><tbody>${rows}</tbody></table>
<div class="box"><b>Sıradaki adım:</b> harekeler — fetha (َ a/e), kesra (ِ i), damme (ُ u), sükûn (ْ sessiz), şedde (ّ çift); uzatma harfleri ا و ي. Günde 10 dakika: 7 harf + önceki günün tekrarı → 1 haftada 28 harf.</div>
<p style="font-size:9pt;color:#4B587A">İnteraktif sürüm ve tanıma testi: ahkademy.com → "Arapça Alfabe Eğitmeni" (ücretsiz).</p>`);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const tmp = path.join(ROOT, 'src/.pdf-tmp.html');
  for (const [name, h] of [['ahk-turkce-dusunme-hatalari', mistakesHtml], ['ahk-ielts-speaking-kaliplari', ieltsHtml], ['ahk-arapca-alfabe-tablosu', alphabetHtml]]) {
    fs.writeFileSync(tmp, h);
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: path.join(OUT, name + '.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log('pdf:', name);
  }
  fs.unlinkSync(tmp);
  await browser.close();
})();
