'use strict';
const L = require('../layout');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const data = (() => { const s = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../site/assets/js/goal.js'), 'utf8'), { module: { exports: s } }); return s.AHK_GOAL; })();

const FAQ = [
  ['Kur\'an Arapçası ile Modern Standart Arapça arasındaki fark ne?', 'İkisi de "fasih" Arapçadır ve aynı alfabeyi, aynı gramer temelini paylaşır. Kur\'an Arapçası klasik kelime hazinesi ve üslubuna, Modern Standart Arapça (MSA) ise günümüz haber, kitap ve resmî yazışma diline odaklanır. Birini öğrenen diğerine büyük avantajla geçer.'],
  ['Lehçe öğrenmeden Arapça konuşabilir miyim?', 'MSA ile anlaşılırsın ama kimse günlük hayatta MSA konuşmaz; biraz "kitap gibi" duyulursun. Hedefin günlük konuşmaysa en az bir lehçe (iş için Körfez, Türkiye\'deki Arap toplulukları için Levanten) şart. Hedefin metin anlamaksa lehçe gerekmez.'],
  ['Türkiye\'de hangi Arapça lehçesi daha işe yarar?', 'Türkiye\'de yaşayan Arapça konuşanların büyük bölümü Suriye kökenli olduğu için Levanten (Şâmî) lehçe günlük hayatta en çok karşına çıkandır. Dubai, Suudi Arabistan ve Katar ile iş yapıyorsan Körfez lehçesi daha değerli.'],
  ['Arapça kaç ayda öğrenilir?', 'Hedefe bağlı. Alfabeyi 1 haftada, temel günlük kalıpları 2–3 ayda, Kur\'an\'daki sık kelimeleri tanımayı 3–4 ayda öğrenebilirsin. Akıcı konuşma ya da metin analizi için düzenli çalışmayla 12–18 ay gerçekçi bir süredir. Türkçedeki Arapça kökenli binlerce kelime (kitap, kalem, saat, cevap…) Türkçe konuşanlara ciddi bir avantaj sağlar.'],
  ['Sonucu görmek için kayıt olmam gerekiyor mu?', 'Hayır. Hedef yolun ve ilk ay planın anında ekranda görünür. Yalnızca ayrıntılı yol haritasını ve kelime listesini e-posta/WhatsApp\'tan almak istersen bilgilerini bırakırsın.']
];

module.exports = {
  path: 'arapca-hedef-bulucu/',
  lang: 'tr',
  preloadArabic: true,
  title: 'Hangi Arapçayı Öğrenmeliyim? Arapça Hedef Bulucu (6 Soru)',
  ogTitle: 'Arapça Hedef Bulucu — Kur\'an, MSA, Körfez ya da Levanten?',
  description: 'Kur\'an Arapçası, Modern Standart Arapça, Körfez veya Levanten lehçesi? 6 soruluk ücretsiz test hedefine göre doğru Arapça yolunu ve ilk ay planını gösterir.',
  scripts: ['goal.js'],
  jsonld: [
    L.breadcrumbLd([['Ücretsiz Araçlar', ''], ['Arapça Hedef Bulucu', 'arapca-hedef-bulucu/']]),
    { '@type': 'Quiz', name: 'Arapça Hedef Bulucu', description: 'Hedef, zaman ve motivasyona göre dört Arapça öğrenme yolundan (Kur\'an, MSA, Körfez, Levanten) birini öneren 6 soruluk test.', inLanguage: 'tr', isAccessibleForFree: true, provider: { '@id': L.ORG_ID }, hasPart: data.Q.slice(0, 2).map(q => ({ '@type': 'Question', name: q.q, eduQuestionType: 'Multiple choice', suggestedAnswer: q.o.map(o => ({ '@type': 'Answer', text: o.t })) })) },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => {
    const paths = Object.values(data.PATHS);
    const q0 = data.Q[0];
    return `
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <div class="crumbs"><a href="${root}">Ücretsiz Araçlar</a><span>›</span>Arapça Hedef Bulucu</div>
    <span class="eyebrow"><i class="star"></i> 6 SORU · 2 DAKİKA</span>
    <h1>Hangi Arapça <mark>sana göre</mark>?</h1>
    <p class="lead">"Arapça öğrenmek istiyorum" dört farklı yol demek: Kur'an Arapçası, Modern Standart Arapça, Körfez lehçesi ya da Levanten lehçe. Yanlış yoldan başlayanlar aylar kaybeder. 6 soruda doğru yolu ve ilk ay planını gör.</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="#test">Yolumu bul <span class="arrow">→</span></a><a class="btn btn-ghost" href="#yollar">4 yolu karşılaştır</a></div>
  </div>
  <div class="hero-art"><div class="hero-card float d1"><div class="grid" style="gap:10px">${paths.map(p => `<div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.07);border-radius:14px;padding:10px 14px"><span style="font-size:1.5rem">${p.emoji}</span><div><b>${p.title.replace(' Yolu', '')}</b><div lang="ar" class="ar" style="color:var(--gold);font-size:1.1rem;text-align:right">${p.ar}</div></div></div>`).join('')}</div></div></div>
</div></div></section>

<section class="section" id="test"><div class="container narrow"><div class="tool">
  <div id="intro"><span class="pill gold">Nasıl çalışır?</span><h2 style="margin-top:10px">Hedef + zaman + motivasyon = yol</h2><p class="muted">Cevaplarına göre dört yoldan puan toplanır; en yüksek puanlı yol ve "ikinci en uygun" seçenek gösterilir. Doğru-yanlış yok.</p>
    <div class="q-nav"><span class="muted">6 soru · sonuç anında</span><button type="button" class="btn btn-gold btn-lg" id="start">Başla <span class="arrow">→</span></button></div></div>
  <div id="quiz" hidden>
    <div class="tool-top"><span class="q-level">Hedef bulucu</span><span class="q-counter">1 / ${data.Q.length}</span></div>
    <div class="progress"><i></i></div>
    <div class="q-card"><p class="q-text">${q0.q}</p><div class="options">${q0.o.map((o, i) => `<button type="button" class="opt" data-i="${i}"><span class="key">${'ABCD'[i]}</span><span>${o.t}</span></button>`).join('')}</div></div>
    <div class="q-nav"><button type="button" class="btn btn-outline q-back" disabled>← Geri</button><span class="muted">Bir seçenek seç, otomatik ilerler</span></div>
  </div>
  <div class="result" id="result" aria-live="polite">
    <div class="result-hero" style="grid-template-columns:1fr">
      <div><span class="pill gold rise"><span class="r-emoji">📖</span> Senin yolun</span>
        <h2 class="r-title rise d1" style="margin-top:10px"></h2>
        <p class="r-ar rise d1" lang="ar" dir="rtl" style="font-family:var(--font-ar);font-size:1.8rem;color:var(--gold);text-align:left;margin:0 0 10px"></p>
        <p class="r-head rise d2" style="font-weight:600;font-size:1.1rem"></p><p class="r-desc rise d2"></p>
        <div class="stats rise d3"><div class="stat"><small>BAŞLANGIÇ NOKTAN</small><b class="r-level"></b></div><div class="stat"><small>HAFTALIK SÜRE</small><b class="r-hours"></b></div><div class="stat"><small>LEHÇE</small><b class="r-dialect" style="font-size:1rem"></b></div></div>
        ${L.resultActions(root)}
      </div>
    </div>
    <div class="grid grid-2" style="margin-top:22px">
      <div class="card plan"><h3>İlk 4 ay</h3><ul></ul><p class="notice" style="margin-top:12px">İlk somut hedefin: <b class="r-first"></b></p></div>
      <div class="card"><h3>Puan dağılımın</h3><p class="muted">İkinci en uygun yol: <b class="r-second"></b>. İki yol birbirine yakınsa deneme dersinde birlikte karar veririz.</p><div class="skills"></div></div>
    </div>
    ${L.leadForm({ root, magnet: 'arapca-hedef-bulucu', languageDefault: 'arabic', title: 'Yoluna özel yol haritası + kelime listesi (PDF)', desc: 'Seçilen yol için 12 haftalık yol haritası, ilk 100 kelime ve ücretsiz deneme dersi bağlantısını e-posta/WhatsApp\'a gönderelim.', goals: [['quran', 'Kur\'an Arapçası'], ['msa', 'Modern Standart Arapça'], ['gulf', 'Körfez lehçesi (iş)'], ['levant', 'Levanten lehçesi (günlük)'], ['general', 'Emin değilim']], unlock: `<b>Açıldı:</b> <a href="${root}assets/pdf/ahk-arapca-alfabe-tablosu.pdf" download>Arapça alfabe tablosunu (PDF) indir</a> · <a href="${root}arapca-alfabe/">Alfabe eğitmeniyle bugün başla</a> · Yol haritan 24 saat içinde e-posta/WhatsApp ile gelecek.` })}
  </div>
</div></div></section>

<section class="section alt" id="yollar"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>4 YOL</div><h2>Dört Arapça yolu, tek bakışta</h2></div>
  <div class="grid grid-2">${paths.map((p, i) => `<div class="card" data-reveal="${i % 2}"><div class="icon">${p.emoji}</div><h3>${p.title}</h3><p lang="ar" dir="rtl" class="ar" style="text-align:left;color:var(--blue);font-size:1.2rem">${p.ar}</p><p>${p.desc}</p><p><b>Lehçe:</b> ${p.dialect}</p></div>`).join('')}</div>
</div></section>

<section class="section" id="sss"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>SIK SORULANLAR</div><h2>Arapça öğrenmeye başlarken</h2></div>
  ${L.faqHtml(FAQ)}
</div></section>

<section class="section alt"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>DİĞER ÜCRETSİZ ARAÇLAR</div><h2>Devam et</h2></div>
  ${L.magnetCards(root, 'arapca-hedef-bulucu/')}
</div></section>
${L.ctaBand(root, 'tr', 'AHK Akademi\'de Arapça birebir online: Kur\'an Arapçası, Modern Standart Arapça, Körfez ve Levanten lehçeleri. İlk ders ücretsiz deneme.')}`;
  }
};
