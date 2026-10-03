'use strict';
const L = require('../layout');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const data = (() => { const s = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../site/assets/js/level-test.js'), 'utf8'), { module: { exports: s } }); return s.AHK_LEVEL_TEST; })();

const FAQ = [
  ['İngilizce seviye testi nasıl çalışıyor?', 'Test, Avrupa Dil Portfolyosu (CEFR) seviyelerine göre düzenlenmiş 25 sorudan oluşur: her seviyeden (A1, A2, B1, B2, C1) 5 soru. Dil bilgisi, kelime ve kullanım sorularını cevaplarsın; sistem hangi seviyeye kadar istikrarlı doğru yaptığına bakarak seviyeni tahmin eder. Süre sınırı yok, ortalama 8 dakika sürer.'],
  ['Sonuç resmî bir belge yerine geçer mi?', 'Hayır. Bu test ücretsiz bir ön değerlendirmedir; IELTS, TOEFL, YDS veya Cambridge gibi resmî sınavların yerine geçmez. Amacı, hangi seviyeden başlaman ve neye odaklanman gerektiğini hızlıca göstermektir.'],
  ['A1, A2, B1, B2, C1 ne anlama geliyor?', 'CEFR seviyeleri: A1 başlangıç (kendini tanıtma), A2 temel (günlük konuşmalar), B1 orta (seyahat, iş yerinde derdini anlatma), B2 üst orta (akıcı tartışma, çoğu üniversite ve iş ilanının istediği seviye), C1 ileri (nüanslı ve doğal kullanım), C2 ustalık.'],
  ['Konuşma ve dinleme ölçülüyor mu?', 'Bu kısa test okuma, dil bilgisi ve kelime bilgisini ölçer. Konuşma ve dinleme için en doğru sonuç bir öğretmenle 20 dakikalık görüşmedir; ücretsiz deneme dersinde bunu yapıyoruz.'],
  ['Sonucumu görmek için kayıt olmam gerekiyor mu?', 'Hayır. Seviyen ve kişisel planın testin sonunda hemen görünür. Yalnızca detaylı PDF raporu ve 7 günlük çalışma planını e-posta/WhatsApp ile almak istersen bilgilerini bırakırsın.'],
  ['B2 seviyesine ulaşmak ne kadar sürer?', 'Cambridge\'in rehber ders saati tablosuna göre sıfırdan B2 için toplam yaklaşık 500–600 saat gerekir. Haftada 5 saat çalışan biri için bu yaklaşık 2 yıl; haftada 10 saatle 1 yıl demektir. <a href="../ingilizce-kac-ayda-ogrenilir/">Kaç ayda hesaplayıcısı</a> ile kendi takvimini çıkarabilirsin.']
];

module.exports = {
  path: 'ingilizce-seviye-testi/',
  lang: 'tr',
  title: 'İngilizce Seviye Testi (Ücretsiz, 8 Dakika) | A1–C1 Sonuç',
  ogTitle: 'İngilizce Seviye Testi — 8 dakikada A1–C1 sonucun',
  description: 'Ücretsiz online İngilizce seviye tespit testi: 25 soru, anında CEFR (A1, A2, B1, B2, C1) sonucu ve sana özel çalışma planı. Kayıt gerektirmez.',
  alternates: [{ lang: 'tr', path: 'ingilizce-seviye-testi/' }, { lang: 'en', path: 'en/english-level-test/' }, { lang: 'x-default', path: 'ingilizce-seviye-testi/' }],
  scripts: ['level-test.js'],
  jsonld: [
    L.breadcrumbLd([['Ücretsiz Araçlar', ''], ['İngilizce Seviye Testi', 'ingilizce-seviye-testi/']]),
    { '@type': 'Quiz', name: 'İngilizce Seviye Testi (CEFR A1–C1)', description: 'Dil bilgisi, kelime ve kullanım sorularıyla CEFR seviyeni tahmin eden 25 soruluk ücretsiz test.', inLanguage: 'en', educationalLevel: 'A1–C1 (CEFR)', typicalAgeRange: '16-', educationalAlignment: { '@type': 'AlignmentObject', alignmentType: 'educationalLevel', educationalFramework: 'CEFR', targetName: 'A1, A2, B1, B2, C1' }, about: { '@type': 'Thing', name: 'English as a foreign language' }, provider: { '@id': L.ORG_ID }, isAccessibleForFree: true,
      hasPart: data.Q.slice(0, 3).map(q => ({ '@type': 'Question', name: q.q, eduQuestionType: 'Multiple choice', suggestedAnswer: q.o.map(o => ({ '@type': 'Answer', text: o })), acceptedAnswer: { '@type': 'Answer', text: q.o[q.a] } })) },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => {
    const q0 = data.Q[0];
    return `
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <div class="crumbs"><a href="${root}">Ücretsiz Araçlar</a><span>›</span>İngilizce Seviye Testi</div>
    <span class="eyebrow"><i class="star"></i> ÜCRETSİZ · KAYIT YOK</span>
    <h1>İngilizce seviyen <mark>gerçekten</mark> ne?</h1>
    <p class="lead">25 soru, yaklaşık 8 dakika. Sonunda CEFR seviyen (A1–C1), güçlü ve zayıf yönlerin ve bir sonraki seviye için somut bir plan — anında ekranda.</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="#test">Teste başla <span class="arrow">→</span></a><a class="btn btn-ghost" href="#sss">Nasıl çalışır?</a></div>
    <ul class="hero-facts"><li><i class="star"></i>CEFR uyumlu</li><li><i class="star"></i>Anında sonuç</li><li><i class="star"></i>Kişisel plan</li></ul>
  </div>
  <div class="hero-art">
    <div class="orb gold float" style="width:90px;height:90px;right:4%;top:-20px"></div>
    <div class="orb blue float d2" style="width:46px;height:46px;left:6%;bottom:-6px"></div>
    <div class="hero-card float d1"><span class="hand">Seviyen:</span><div class="big">B1<span style="font-size:.4em">+</span></div><p style="margin:6px 0 0;color:rgba(255,255,255,.85)">Orta — B2'ye çok yakın</p>
      <div class="hero-demo" aria-hidden="true"><div class="bar"><i style="--w:88%"></i></div><div class="bar"><i style="--w:64%"></i></div><div class="bar"><i style="--w:52%"></i></div></div></div>
  </div>
</div></div></section>

<section class="section" id="test"><div class="container narrow">
  <div class="tool">
    <div id="intro">
      <span class="pill gold">Başlamadan önce</span>
      <h2 style="margin-top:10px">3 kural, 8 dakika</h2>
      <ol class="steps"><li><span><strong>Sözlük yok, tahmin var.</strong> Bilmiyorsan en mantıklı seçeneği işaretle; test tam da bunu ölçer.</span></li><li><span><strong>Sorular kolaydan zora gider.</strong> Sonlara doğru zorlanman normal, C1 soruları herkes için zordur.</span></li><li><span><strong>Sonuç anında ekranda.</strong> Kayıt gerekmez; PDF rapor istersen sonunda isteğe bağlı.</span></li></ol>
      <div class="q-nav" style="margin-top:26px"><span class="muted">25 soru · A1'den C1'e · klavyede A/B/C/D tuşları çalışır</span><button type="button" class="btn btn-gold btn-lg" id="start">Teste başla <span class="arrow">→</span></button></div>
    </div>
    <div id="quiz" hidden>
      <div class="tool-top"><span class="q-level">Soru 1</span><span class="q-counter">1 / ${data.Q.length}</span></div>
      <div class="progress" role="progressbar" aria-label="İlerleme" aria-valuemin="0" aria-valuemax="${data.Q.length}"><i></i></div>
      <div class="q-card"><p class="q-text">${q0.q.replace('___', '<span class="blank">___</span>')}</p><div class="options">${q0.o.map((o, i) => `<button type="button" class="opt" data-i="${i}"><span class="key">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div></div>
      <div class="q-nav"><button type="button" class="btn btn-outline q-back" disabled>← Geri</button><button type="button" class="btn btn-navy q-next" disabled>Sonraki</button></div>
    </div>
    <div class="result" id="result" aria-live="polite">
      <div class="result-hero">
        <div class="ring pop"><svg viewBox="0 0 180 180" aria-hidden="true"><circle class="track" cx="90" cy="90" r="80"></circle><circle class="fill" cx="90" cy="90" r="80"></circle></svg><div class="center"><b class="r-level">B1</b><small><span class="r-pct">0%</span> doğru</small></div></div>
        <div>
          <span class="pill gold rise">Tahmini CEFR seviyen</span>
          <h2 class="r-title rise d1" style="margin-top:10px">B1 — Orta</h2>
          <p class="r-head rise d2" style="font-weight:600;font-size:1.1rem"></p>
          <p class="r-desc rise d2"></p>
          <div class="level-scale rise d3" aria-hidden="true"><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span></div>
          ${L.resultActions(root)}
        </div>
      </div>
      <div class="grid grid-2" style="margin-top:22px">
        <div class="card"><h3>Beceri dağılımın</h3><p class="muted">Toplam <b class="r-score">0 / 25</b> doğru. En çok geliştirmen gereken alan: <b class="r-weak">kelime</b>.</p><div class="skills"></div></div>
        <div class="card plan"><h3>Sıradaki seviye: <span class="r-next">B2</span></h3><p class="muted">Tahmini <b class="r-hours">180</b> saat rehberli çalışma (Cambridge rehber saat tablosundan türetilmiş yaklaşık değer). İlk 30 gün için öncelikler:</p><ul></ul></div>
      </div>
      ${L.leadForm({ root, magnet: 'ingilizce-seviye-testi', title: 'Detaylı PDF raporunu ve 7 günlük planını al', desc: 'Sonucun yukarıda ve seninle kalıyor. İstersen seviyene özel çalışma planını, kelime listesini ve ücretsiz deneme dersi bağlantısını e-posta veya WhatsApp\'la gönderelim.', unlock: `<b>Açıldı:</b> <a href="${root}assets/pdf/ahk-turkce-dusunme-hatalari.pdf" download>“Türkçe Düşünme Hataları” kopya kâğıdını (PDF) indir</a> · <a href="${root}7-gunluk-ingilizce-konusma/">7 günlük konuşma kursuna katıl</a> · Seviyene özel plan en geç 24 saat içinde e-posta/WhatsApp ile gelecek.` })}
    </div>
  </div>
</div></section>

<section class="section alt"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>SEVİYELER</div><h2>CEFR seviyeleri ne anlama geliyor?</h2><p class="muted">Avrupa Konseyi'nin ortak dil çerçevesi; IELTS, TOEFL, Cambridge ve çoğu iş ilanı bu ölçeği kullanır.</p></div>
  <div class="table-wrap"><table class="t"><thead><tr><th>Seviye</th><th>Ne yapabilirsin?</th><th>Yaklaşık IELTS</th><th>Sıfırdan toplam saat*</th></tr></thead><tbody>
    <tr><td><b>A1</b></td><td>Kendini tanıtır, basit soruları anlarsın.</td><td>–</td><td>≈ 90–100</td></tr>
    <tr><td><b>A2</b></td><td>Alışveriş, yol tarifi, geçmişten bahsetme.</td><td>3.5–4.0</td><td>≈ 180–200</td></tr>
    <tr><td><b>B1</b></td><td>Seyahatte ve işte derdini anlatırsın, fikir belirtirsin.</td><td>4.0–5.0</td><td>≈ 350–400</td></tr>
    <tr><td><b>B2</b></td><td>Akıcı tartışma, uzun metin, çoğu üniversite/iş şartı.</td><td>5.5–6.5</td><td>≈ 500–600</td></tr>
    <tr><td><b>C1</b></td><td>Nüanslı, doğal, profesyonel/akademik kullanım.</td><td>7.0–8.0</td><td>≈ 700–800</td></tr>
  </tbody></table></div>
  <p class="muted" style="font-size:.85rem;margin-top:10px">* Cambridge English rehberli öğrenme saati tablosu (A1 satırı yaygın bir tahmindir, resmî Cambridge değeri değildir). IELTS eşleştirmesi yaklaşık ve yönlendirme amaçlıdır.</p>
</div></section>

<section class="section" id="sss"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>SIK SORULANLAR</div><h2>İngilizce seviye testi hakkında</h2></div>
  ${L.faqHtml(FAQ)}
</div></section>

<section class="section alt"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>DİĞER ÜCRETSİZ ARAÇLAR</div><h2>Bir sonraki adımın hazır</h2></div>
  ${L.magnetCards(root, 'ingilizce-seviye-testi/')}
</div></section>
${L.ctaBand(root)}`;
  }
};
