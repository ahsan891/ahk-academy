'use strict';
const L = require('../layout');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const data = (() => { const s = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../site/assets/js/ielts.js'), 'utf8'), { module: { exports: s } }); return s.AHK_IELTS; })();

const FAQ = [
  ['IELTS overall band puanı nasıl hesaplanır?', 'Dört bölümün (Listening, Reading, Writing, Speaking) band puanlarının ortalaması alınır ve en yakın yarım banda yuvarlanır: ortalama .25 ile bitiyorsa bir üst yarım banda (6.25 → 6.5), .75 ile bitiyorsa bir üst tam banda (6.75 → 7.0) yuvarlanır. .25 ve .75\'in altı aşağı yuvarlanır (6.125 → 6.0).'],
  ['Listening\'de kaç doğru kaç puan?', 'Listening 40 sorudur. Yaygın olarak yayımlanan tabloya göre 30–31 doğru 7.0, 32–34 doğru 7.5, 35–36 doğru 8.0, 39–40 doğru 9.0\'dır. Her sınav versiyonunda eşikler küçük farklar gösterebilir.'],
  ['Academic Reading ile General Training Reading puanlaması neden farklı?', 'General Training metinleri daha kolay olduğu için aynı banda ulaşmak için daha fazla doğru gerekir. Örneğin band 7.0 için Academic\'te yaklaşık 30 doğru yeterken General Training\'de yaklaşık 34 doğru gerekir.'],
  ['Writing ve Speaking puanımı nereden bileceğim?', 'Bu iki bölüm doğru sayısıyla değil, dört kriterli (Task Achievement/Response, Coherence, Lexical Resource, Grammar; Speaking için Fluency, Lexical Resource, Grammar, Pronunciation) değerlendirmeyle puanlanır. Gerçekçi bir tahmin için bir öğretmenin örnek yazı/konuşmanı değerlendirmesi gerekir; hesaplayıcıda tahminini girebilirsin.'],
  ['Hangi band hangi CEFR seviyesine denk?', 'Yaklaşık olarak: 4.0–5.0 B1, 5.5–6.5 B2, 7.0–8.0 C1, 8.5–9.0 C2. Çoğu lisansüstü program 6.5 (her bölüm en az 6.0), bazıları 7.0 ister; Türkiye\'de İngilizce eğitim veren üniversitelerin hazırlık muafiyeti genellikle 6.0–6.5 bandındadır. Şartları her zaman kurumun kendi sayfasından kontrol et.'],
  ['Bu hesaplayıcı resmî mi?', 'Hayır. Tablolar IDP/British Council tarafından yayımlanan yaklaşık dönüşüm değerleridir; resmî puanın yalnızca sınav sonuç belgende görünür. Hesaplayıcı, deneme sınavlarındaki ilerlemeni takip etmen için tasarlandı.']
];

module.exports = {
  path: 'ielts-puan-hesaplama/',
  lang: 'tr',
  title: 'IELTS Puan Hesaplama: Doğru Sayısından Band Puanı (Ücretsiz)',
  ogTitle: 'IELTS Puan Hesaplama — doğru sayından band puanına',
  description: 'IELTS band hesaplayıcı: Listening ve Reading doğru sayını gir, Writing ve Speaking tahminini ekle, overall puanını resmî yuvarlama kuralıyla gör. Ücretsiz.',
  scripts: ['ielts.js'],
  jsonld: [
    L.breadcrumbLd([['Ücretsiz Araçlar', ''], ['IELTS Puan Hesaplama', 'ielts-puan-hesaplama/']]),
    { '@type': 'WebApplication', name: 'IELTS Puan Hesaplama', applicationCategory: 'EducationalApplication', operatingSystem: 'Web', browserRequirements: 'Requires JavaScript', offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' }, inLanguage: 'tr', provider: { '@id': L.ORG_ID }, description: 'Listening/Reading doğru sayısını band puanına çeviren ve overall IELTS puanını hesaplayan ücretsiz araç.' },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => {
    const row = (t) => t.map(([min, b]) => `<tr><td>${b.toFixed(1)}</td><td>${min}${min < 40 ? '–' + (t[t.indexOf(t.find(x => x[1] === b)) - 1] ? t[t.indexOf(t.find(x => x[1] === b)) - 1][0] - 1 : 40) : ''}</td></tr>`).join('');
    const bandOpts = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map(b => `<option value="${b}"${b === 6 ? ' selected' : ''}>${b.toFixed(1)}</option>`).join('');
    const targetOpts = [5.5, 6, 6.5, 7, 7.5, 8].map(b => `<option value="${b}"${b === 6.5 ? ' selected' : ''}>${b.toFixed(1)}</option>`).join('');
    return `
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <div class="crumbs"><a href="${root}">Ücretsiz Araçlar</a><span>›</span>IELTS Puan Hesaplama</div>
    <span class="eyebrow"><i class="star"></i> ÜCRETSİZ ARAÇ</span>
    <h1>IELTS puanını <mark>saniyeler içinde</mark> hesapla</h1>
    <p class="lead">Deneme sınavındaki doğru sayını gir; Listening ve Reading band puanın, resmî yuvarlama kuralıyla overall puanın ve hedef puana ne kadar kaldığı anında görünsün.</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="#hesapla">Hesapla <span class="arrow">→</span></a><a class="btn btn-ghost" href="#tablo">Dönüşüm tabloları</a></div>
  </div>
  <div class="hero-art"><div class="orb gold float" style="width:80px;height:80px;right:0;top:-24px"></div><div class="hero-card float d1" style="text-align:center"><span class="hand">Overall band</span><div class="big">6.5</div><p style="margin:6px 0 0;color:rgba(255,255,255,.85)">L 7.0 · R 6.5 · W 6.0 · S 6.5</p></div></div>
</div></div></section>

<section class="section" id="hesapla"><div class="container"><div class="tool"><div class="calc">
  <div>
    <h2 style="font-size:1.4rem">Puanlarını gir</h2>
    <div class="seg" style="margin-bottom:18px" role="group" aria-label="Sınav türü"><button type="button" data-mode="ac" aria-pressed="true">Academic</button><button type="button" data-mode="gt" aria-pressed="false">General Training</button></div>
    <div class="range"><label for="l-raw">Listening doğru sayısı (0–40) — <output id="l-out">30 doğru</output> → band <b id="l-band">7.0</b></label><input type="range" id="l-raw" min="0" max="40" value="30"></div>
    <div class="range" style="margin-top:14px"><label for="r-raw"><span id="r-label">Reading (Academic) doğru sayısı</span> — <output id="r-out">27 doğru</output> → band <b id="r-band">6.5</b></label><input type="range" id="r-raw" min="0" max="40" value="27"></div>
    <div class="grid grid-2" style="margin-top:14px">
      <div class="field"><label for="w-band">Writing tahminin</label><select id="w-band">${bandOpts}</select></div>
      <div class="field"><label for="s-band">Speaking tahminin</label><select id="s-band">${bandOpts.replace('value="6" selected', 'value="6"').replace('value="6.5"', 'value="6.5" selected')}</select></div>
    </div>
    <div class="field" style="margin-top:14px"><label for="target">Hedef overall band</label><select id="target">${targetOpts}</select></div>
    <input type="hidden" name="result" value="">
  </div>
  <div class="result-hero" style="grid-template-columns:1fr;align-content:start">
    <div><span class="pill gold">Tahmini overall band</span><div class="big-num pop" id="overall" style="margin:8px 0">6.5</div>
      <p style="color:rgba(255,255,255,.8);margin:0">Dört bölümün ortalaması: <b id="mean">6.5</b> → en yakın yarım banda yuvarlandı. Writing <b id="w-out">6.0</b> · Speaking <b id="s-out">6.5</b></p>
      <p id="gap" class="notice" style="margin-top:16px;color:var(--navy)"></p>
      <div class="share-row"><a class="btn btn-gold" href="${L.cfg.mainSite}" data-trial>IELTS deneme dersi al <span class="arrow">→</span></a><a class="btn btn-wa" href="#" data-wa="Merhaba AHK Akademi, IELTS hazırlık dersleri hakkında bilgi almak istiyorum." hidden>WhatsApp'tan sor</a></div>
    </div>
  </div>
</div>
${L.leadForm({ root, magnet: 'ielts-puan-hesaplama', title: 'IELTS Speaking kalıpları (PDF) + 8 haftalık hazırlık planı', desc: 'Band 6.5–7.5 için Speaking Part 1–3 kalıpları, Writing Task 2 şablonu ve haftalık çalışma planı. E-posta veya WhatsApp\'a gönderelim.', goals: [['ielts', 'IELTS Academic'], ['ielts-gt', 'IELTS General Training'], ['toefl', 'TOEFL'], ['abroad', 'Yurt dışı başvurusu'], ['general', 'Genel ilerleme']], unlock: `<b>Açıldı:</b> <a href="${root}assets/pdf/ahk-ielts-speaking-kaliplari.pdf" download>IELTS Speaking kalıplarını (PDF) indir</a> · <a href="${root}ingilizce-seviye-testi/">Seviye testiyle CEFR seviyeni doğrula</a> · 8 haftalık plan 24 saat içinde gelecek.` })}
</div></div></section>

<section class="section alt" id="tablo"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>DÖNÜŞÜM TABLOLARI</div><h2>Doğru sayısı → band puanı</h2><p class="muted">IDP ve British Council'ın yayımladığı yaklaşık değerler. Her sınav versiyonunda eşikler ±1 doğru oynayabilir.</p></div>
  <div class="grid grid-3">
    <div><h3>Listening</h3><div class="table-wrap"><table class="t"><thead><tr><th>Band</th><th>Doğru</th></tr></thead><tbody>${row(data.LISTENING)}</tbody></table></div></div>
    <div><h3>Reading — Academic</h3><div class="table-wrap"><table class="t"><thead><tr><th>Band</th><th>Doğru</th></tr></thead><tbody>${row(data.READING_AC)}</tbody></table></div></div>
    <div><h3>Reading — General Training</h3><div class="table-wrap"><table class="t"><thead><tr><th>Band</th><th>Doğru</th></tr></thead><tbody>${row(data.READING_GT)}</tbody></table></div></div>
  </div>
  <div class="card" style="margin-top:22px"><h3>Overall band yuvarlama kuralı (resmî)</h3><p class="muted">Ortalama .25 ile bitiyorsa ↑ yarım band, .75 ile bitiyorsa ↑ tam band; aksi hâlde ↓ aşağı. Örnek: 6.5 + 6.5 + 5.0 + 7.0 = 25 → 6.25 → <b>6.5</b>. 6.5 + 6.5 + 5.5 + 6.0 = 24.5 → 6.125 → <b>6.0</b>.</p></div>
</div></section>

<section class="section" id="sss"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>SIK SORULANLAR</div><h2>IELTS puanlama hakkında</h2></div>
  ${L.faqHtml(FAQ)}
</div></section>

<section class="section alt"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>DİĞER ÜCRETSİZ ARAÇLAR</div><h2>Hazırlığını güçlendir</h2></div>
  ${L.magnetCards(root, 'ielts-puan-hesaplama/')}
</div></section>
${L.ctaBand(root, 'tr', 'AHK Akademi IELTS hazırlık: Speaking ve Writing için birebir geri bildirim, haftalık deneme ve hedef band planı. İlk ders ücretsiz deneme.')}`;
  }
};
