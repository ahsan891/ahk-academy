'use strict';
const L = require('../layout');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const data = (() => { const s = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../site/assets/js/alphabet.js'), 'utf8'), { module: { exports: s } }); return s.AHK_ALPHABET; })();

const FAQ = [
  ['Arap alfabesinde kaç harf var?', 'Standart Arap alfabesinde 28 harf vardır ve sağdan sola yazılır. "Lam-elif" (لا) bir harf değil, iki harfin bitişik yazımıdır; hemze (ء) ise elif üzerinde ya da tek başına görülen bir işarettir.'],
  ['Harfler neden kelimenin başında, ortasında ve sonunda farklı görünüyor?', 'Arapça el yazısı mantığıyla yazılır: harfler birbirine bağlanır ve bağlandıkları yere göre şekil değiştirir. Çoğu harfin 4 şekli vardır (tek başına, başta, ortada, sonda). Altı harf (ا د ذ ر ز و) kendinden sonraki harfe bağlanmaz; bu yüzden yalnızca 2 şekilleri vardır.'],
  ['Türkçede olmayan sesler hangileri?', 'ث (peltek s), ح (boğazdan sert h), خ (hırıltılı h), ذ (peltek z), ص ض ط ظ (kalın s, d, t, z), ع (ayn) ve غ (gayn), ق (kalın k). Türkçe konuşanlar için en zorları ع ve ح; birkaç haftalık kulak ve ağız alışkanlığıyla oturur.'],
  ['Harfleri öğrendikten sonra Kur\'an okuyabilir miyim?', 'Harflerden sonra harekeleri (fetha, kesra, damme, sükûn, şedde), uzatma (med) harflerini ve tenvini öğrenmen gerekir. Çoğu öğrenci 3–6 haftada hecelemeye, 2–3 ayda akıcı okumaya geçer; anlama için ayrıca kelime ve gramer çalışması gerekir.'],
  ['Kaç günde alfabeyi öğrenirim?', 'Günde 10–15 dakika kart çalışmasıyla bir haftada 28 harfi tanımak gerçekçidir. Birleşik yazımı ve okumayı oturtmak için 2–3 hafta daha gerekir. Bu sayfadaki kart ve tanıma testi tam olarak bunun için tasarlandı.'],
  ['Hangi Arapçayı öğrenmeliyim: Kur\'an Arapçası mı, Modern Standart mı, lehçe mi?', 'Hedefe göre değişir. Kur\'an\'ı anlamak için klasik (fasih) Arapça; haber, üniversite ve resmî yazışma için Modern Standart Arapça; Körfez\'de iş ya da Suriyeli komşularla konuşmak için lehçe. <a href="../arapca-hedef-bulucu/">Arapça Hedef Bulucu</a> 6 soruda sana uygun yolu gösterir.']
];

module.exports = {
  path: 'arapca-alfabe/',
  lang: 'tr',
  preloadArabic: true,
  title: 'Arapça Alfabe Öğren: 28 Harf, Yazılışları ve Sesleri (Ücretsiz)',
  ogTitle: 'Arapça Alfabe Eğitmeni — 28 harf, 4 şekil, Türkçe ses ipuçları',
  description: 'Arap alfabesini interaktif öğren: 28 harfin başta, ortada, sonda yazılışı, Türkçe okunuşu, örnek kelimeler, kart çalışması ve tanıma testi. Ücretsiz, kayıt gerektirmez.',
  scripts: ['alphabet.js'],
  jsonld: [
    L.breadcrumbLd([['Ücretsiz Araçlar', ''], ['Arapça Alfabe Eğitmeni', 'arapca-alfabe/']]),
    { '@type': 'LearningResource', name: 'Arapça Alfabe Eğitmeni', description: '28 Arap harfinin dört yazılış şekli, Türkçe adları, sesleri ve örnek kelimeleriyle interaktif alfabe çalışması ve tanıma testi.', learningResourceType: 'Interactive resource', educationalLevel: 'Beginner', inLanguage: ['tr', 'ar'], teaches: 'Arabic alphabet (28 letters, positional forms)', isAccessibleForFree: true, provider: { '@id': L.ORG_ID } },
    { '@type': 'Quiz', name: 'Arapça Harf Tanıma Testi', description: '10 soruluk harf tanıma testi: harfin adını ve kelime içindeki şeklini tanı.', numberOfQuestions: 10, inLanguage: 'tr', isAccessibleForFree: true, provider: { '@id': L.ORG_ID } },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => {
    const tiles = data.L.map((x, i) => `<button type="button" class="letter-tile" aria-pressed="${i === 0}" aria-label="${x.tr}"><span class="g" lang="ar">${x.ar}</span><span class="n">${x.tr}</span></button>`).join('');
    const x0 = data.L[0], f0 = data.forms(x0);
    const tableRows = data.L.map(x => { const f = data.forms(x); return `<tr><td lang="ar" class="ar" style="font-size:1.5rem">${x.ar}</td><td>${x.tr}</td><td lang="ar" class="ar">${x.name}</td><td>${x.lat}</td><td lang="ar" class="ar" style="font-size:1.3rem">${f.initial}</td><td lang="ar" class="ar" style="font-size:1.3rem">${f.medial}</td><td lang="ar" class="ar" style="font-size:1.3rem">${f.final}</td><td><span lang="ar" class="ar">${x.ex}</span> ${x.exlat} — ${x.extr}</td></tr>`; }).join('');
    return `
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <div class="crumbs"><a href="${root}">Ücretsiz Araçlar</a><span>›</span>Arapça Alfabe</div>
    <span class="eyebrow"><i class="star"></i> ÜCRETSİZ · İNTERAKTİF</span>
    <h1>Arap alfabesini <mark>bir haftada</mark> tanı</h1>
    <p class="lead">28 harf, 4 yazılış şekli, Türkçe ses ipuçları ve her harf için bir örnek kelime. Kartlarla çalış, 10 soruluk testle kendini dene — Kur'an, Modern Standart Arapça ya da lehçe: hepsi bu harflerle başlar.</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="#harfler">Harflere başla <span class="arrow">→</span></a><a class="btn btn-ghost" href="#test">Tanıma testi</a></div>
    <ul class="hero-facts"><li><i class="star"></i>28 harf</li><li><i class="star"></i>Başta · ortada · sonda</li><li><i class="star"></i>Türkçe okunuş</li></ul>
  </div>
  <div class="hero-art">
    <div class="orb gold float" style="width:70px;height:70px;left:0;top:-10px"></div>
    <div class="hero-card float d1" style="text-align:center"><div lang="ar" dir="rtl" style="font-family:var(--font-ar);font-size:clamp(3.2rem,9vw,5.4rem);color:#fff;line-height:1.25">ع ب ك</div><div class="hand" style="margin-top:6px">Ayn · Be · Kef</div><p style="margin:8px 0 0;color:rgba(255,255,255,.8);font-size:.95rem">Aynı harf, üç yer: <span lang="ar" dir="rtl" style="font-family:var(--font-ar);font-size:1.5rem;color:var(--gold)">بـ ـبـ ـب</span></p></div>
  </div>
</div></div></section>

<section class="section" id="harfler"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>28 HARF</div><h2>Bir harfe dokun, dört şeklini gör</h2><p class="muted">Harfler sağdan sola yazılır ve bağlandıkları yere göre şekil değiştirir. Renkli kutuda: harfin adı, sesi, başta–ortada–sonda yazılışı ve örnek kelime.</p></div>
  <div class="letter-grid" id="letter-grid" role="group" aria-label="Arap harfleri">${tiles}</div>
  <div class="letter-detail" id="letter-detail">
    <div><div class="big" lang="ar">${x0.ar}</div><p class="pos" style="text-align:center;color:rgba(255,255,255,.7);font-weight:700;margin:6px 0 0">1 / 28</p>
      <div class="share-row" style="justify-content:center"><button type="button" class="btn btn-ghost btn-sm prev">← Önceki</button><button type="button" class="btn btn-ghost btn-sm next">Sonraki →</button></div></div>
    <div>
      <h3>${x0.tr} <span lang="ar" class="ar" style="font-weight:400">${x0.name}</span></h3>
      <p style="margin:0 0 6px;color:rgba(255,255,255,.75);font-weight:700">Transliterasyon: <span class="lat" style="color:var(--gold)">${x0.lat}</span></p>
      <p class="hint">${x0.sound}</p>
      <div class="forms" dir="rtl" aria-label="Yazılış şekilleri"><div><span class="f f-iso" lang="ar">${f0.isolated}</span><small>Tek başına</small></div><div><span class="f f-ini" lang="ar">${f0.initial}</span><small>Başta</small></div><div><span class="f f-med" lang="ar">${f0.medial}</span><small>Ortada</small></div><div><span class="f f-fin" lang="ar">${f0.final}</span><small>Sonda</small></div></div>
      <p class="nc-note" style="font-size:.85rem;color:var(--gold);margin:8px 0 0"${x0.nc ? '' : ' hidden'}>Bu harf kendinden sonraki harfe bağlanmaz; bu yüzden başta ve ortada da aynı görünür.</p>
      <div class="example"><span class="ar ex-ar" lang="ar">${x0.ex}</span><span><b class="ex-lat">${x0.exlat}</b> — <span class="ex-tr">${x0.extr}</span></span></div>
    </div>
  </div>
</div></section>

<section class="section alt" id="calis"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>ÇALIŞ VE TEST ET</div><h2>Kartlarla ezberle, testle pekiştir</h2></div>
  <div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="true" aria-controls="p-cards" id="t-cards">Kartlar</button><button class="tab" role="tab" aria-selected="false" aria-controls="p-quiz" id="t-quiz">Tanıma testi</button></div>
  <div class="panel show" id="p-cards" role="tabpanel" aria-labelledby="t-cards">
    <p class="muted" style="text-align:center">Karta dokun: ön yüz harf, arka yüz adı ve örnek kelime.</p>
    <button type="button" class="flip" id="flip" aria-label="Kartı çevir"><div class="flip-inner"><div class="flip-face flip-front"><span class="g" lang="ar">${x0.ar}</span></div><div class="flip-face flip-back"><div><b>${x0.tr}</b><p style="margin:4px 0 0;color:var(--gold)" class="lat">${x0.lat}</p><p class="ex" style="margin:8px 0 0;font-size:.95rem">${x0.ex} · ${x0.exlat} · ${x0.extr}</p></div></div></div></button>
    <div class="share-row" style="justify-content:center;margin-top:16px"><button type="button" class="btn btn-outline" id="flip-prev">← Önceki</button><span class="pill" id="flip-count" style="align-self:center">1 / 28</span><button type="button" class="btn btn-outline" id="flip-next">Sonraki →</button><button type="button" class="btn btn-navy" id="flip-shuffle">Karıştır</button></div>
  </div>
  <div class="panel" id="p-quiz" role="tabpanel" aria-labelledby="t-quiz">
    <div class="tool" id="test">
      <div id="aintro"><h3>10 soruluk harf tanıma testi</h3><p class="muted">Rastgele 10 harf: adını ve kelime ortasındaki şeklini tanı. Yanlışta doğru cevap hemen görünür.</p><button type="button" class="btn btn-gold btn-lg" id="astart">Teste başla <span class="arrow">→</span></button></div>
      <div id="aquiz" hidden><div class="tool-top"><span class="q-level">Harf tanıma</span><span class="q-counter">1 / 10</span></div><div class="progress"><i></i></div><div class="q-card"></div></div>
      <div class="result" id="aresult" aria-live="polite">
        <div class="result-hero"><div class="ring pop"><svg viewBox="0 0 180 180" aria-hidden="true"><circle class="track" cx="90" cy="90" r="80"></circle><circle class="fill" cx="90" cy="90" r="80"></circle></svg><div class="center"><b class="r-pct" style="font-size:2.4rem">0%</b><small><span class="r-score">0 / 10</span> doğru</small></div></div>
          <div><span class="pill gold rise">Sonucun</span><h2 class="r-title rise d1" style="margin-top:10px"></h2><p class="r-desc rise d2"></p>${L.resultActions(root)}</div></div>
        ${L.leadForm({ root, magnet: 'arapca-alfabe', languageDefault: 'arabic', title: 'Yazdırılabilir alfabe tablosu (PDF) + 7 günlük harf planı', desc: 'Tüm harfler, dört şekil, Türkçe okunuş ve örnek kelimelerle tek sayfalık tablo. İstersen ücretsiz deneme dersi bağlantısıyla birlikte e-posta/WhatsApp\'a gönderelim.', goals: [['quran', 'Kur\'an\'ı anlayarak okumak'], ['msa', 'Modern Standart Arapça'], ['gulf', 'Körfez lehçesi (iş)'], ['levant', 'Levanten lehçesi (günlük)'], ['general', 'Henüz karar vermedim']], unlock: `<b>Açıldı:</b> <a href="${root}assets/pdf/ahk-arapca-alfabe-tablosu.pdf" download>Arapça alfabe tablosunu (PDF) indir</a> · <a href="${root}arapca-hedef-bulucu/">Hangi Arapça sana göre? Hedef bulucuyu dene</a>` })}
      </div>
    </div>
  </div>
</div></section>

<section class="section"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>TAM TABLO</div><h2>Arap alfabesi tablosu: 28 harf, yazılışlar ve örnekler</h2></div>
  <div class="table-wrap"><table class="t"><thead><tr><th>Harf</th><th>Türkçe adı</th><th>Arapça adı</th><th>Ses</th><th>Başta</th><th>Ortada</th><th>Sonda</th><th>Örnek</th></tr></thead><tbody>${tableRows}</tbody></table></div>
  <p class="muted" style="font-size:.85rem;margin-top:10px">ا د ذ ر ز و harfleri kendinden sonrakine bağlanmaz; "başta" ve "ortada" sütunlarında bağımsız/sondaki şekilleri görünür. Transliterasyonda ḥ ḫ ṣ ḍ ṭ ẓ işaretleri kalın/boğaz seslerini gösterir.</p>
</div></section>

<section class="section alt" id="sss"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>SIK SORULANLAR</div><h2>Arap alfabesi hakkında</h2></div>
  ${L.faqHtml(FAQ)}
</div></section>

<section class="section"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>DİĞER ÜCRETSİZ ARAÇLAR</div><h2>Harflerden sonra ne var?</h2></div>
  ${L.magnetCards(root, 'arapca-alfabe/')}
</div></section>
${L.ctaBand(root, 'tr', 'AHK Akademi\'de Arapça birebir online: Kur\'an Arapçası, Modern Standart Arapça, Körfez ve Levanten lehçeleri. İlk ders ücretsiz deneme.')}`;
  }
};
