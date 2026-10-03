'use strict';
const L = require('../layout');

const FAQ = [
  ['Bu araçlar gerçekten ücretsiz mi, kayıt gerekiyor mu?', 'Evet, hepsi ücretsiz ve sonuçları görmek için kayıt gerekmez. Yalnızca PDF rapor, kopya kâğıdı veya 7 günlük kurs gibi ekstra kaynakları e-posta/WhatsApp\'tan almak istersen bilgilerini bırakırsın.'],
  ['AHK Akademi kimdir?', 'Türkçe konuşanlar için online İngilizce ve Arapça akademisi. İngilizce tarafında IELTS/TOEFL hazırlık, konuşma özgüveni, iş İngilizcesi ve yurt dışı eğitim/iş hedefleri; Arapça tarafında Kur\'an Arapçası, Modern Standart Arapça ile Körfez ve Levanten lehçeleri. Dersler birebir ve online yapılır; ilk ders ücretsiz deneme.'],
  ['Hangi araçla başlamalıyım?', 'İngilizce için önce seviye testi (8 dakika), sonra "kaç ayda" hesaplayıcısı. IELTS hedefin varsa puan hesaplayıcı. Arapça için harfleri bilmiyorsan alfabe eğitmeni, biliyorsan hedef bulucu.'],
  ['Sonuçlar resmî sertifika yerine geçer mi?', 'Hayır. Araçlar ön değerlendirme ve planlama içindir; IELTS, TOEFL, YDS veya Cambridge sınavlarının yerine geçmez.']
];

module.exports = {
  path: '',
  og: 'index',
  lang: 'tr',
  title: 'Ücretsiz İngilizce ve Arapça Araçları | AHK Akademi',
  ogTitle: 'Ücretsiz İngilizce ve Arapça araçları — AHK Akademi',
  description: 'Ücretsiz İngilizce seviye testi, Arapça alfabe eğitmeni, hedef bulucu, IELTS puan ve süre hesaplayıcı, 7 günlük konuşma kursu ve PDF\'ler. Kayıt gerekmez.',
  webPageType: 'CollectionPage',
  scripts: [],
  jsonld: [
    L.breadcrumbLd([['Ücretsiz Araçlar', '']]),
    { '@type': 'ItemList', name: 'Ücretsiz İngilizce ve Arapça araçları', itemListElement: [
      ['İngilizce Seviye Testi', 'ingilizce-seviye-testi/'], ['Arapça Alfabe Eğitmeni', 'arapca-alfabe/'], ['Arapça Hedef Bulucu', 'arapca-hedef-bulucu/'], ['IELTS Puan Hesaplama', 'ielts-puan-hesaplama/'], ['İngilizce Kaç Ayda Öğrenilir?', 'ingilizce-kac-ayda-ogrenilir/'], ['7 Günlük İngilizce Konuşma Kursu', '7-gunluk-ingilizce-konusma/'], ['Kopya Kâğıtları (PDF)', 'kopya-kagitlari/']
    ].map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], url: L.cfg.baseUrl + x[1] })) },
    // Course list (3 free mini-courses/resources) — carousel markup so the hub can qualify for Course list rich results as the catalogue grows.
    { '@type': 'ItemList', itemListElement: [
      { '@type': 'ListItem', position: 1, item: { '@type': 'Course', name: '7 Günlük İngilizce Konuşma Kursu', description: 'Türkçe düşünme hatalarını hedefleyen 7 günlük ücretsiz e-posta/WhatsApp mini kursu.', url: L.cfg.baseUrl + '7-gunluk-ingilizce-konusma/', provider: { '@id': L.ORG_ID }, offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY', category: 'Free' }, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT10M' } } },
      { '@type': 'ListItem', position: 2, item: { '@type': 'Course', name: 'Arapça Alfabe Eğitmeni', description: '28 harfi dört yazılış şekliyle öğreten interaktif ücretsiz başlangıç kursu.', url: L.cfg.baseUrl + 'arapca-alfabe/', provider: { '@id': L.ORG_ID }, offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY', category: 'Free' }, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT2H' } } },
      { '@type': 'ListItem', position: 3, item: { '@type': 'Course', name: 'IELTS Speaking Kalıpları (PDF mini kurs)', description: 'Band 6.5–7.5 için Speaking Part 1–3 kalıpları ve Part 2 planı.', url: L.cfg.baseUrl + 'ielts-puan-hesaplama/', provider: { '@id': L.ORG_ID }, offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY', category: 'Free' }, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT1H' } } }
    ] },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => `
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <span class="eyebrow"><i class="star"></i> AHK AKADEMİ · ÜCRETSİZ ARAÇLAR</span>
    <h1>İngilizce ve Arapçada <mark>nerede olduğunu</mark> 8 dakikada öğren</h1>
    <p class="lead">Seviye testi, alfabe eğitmeni, hedef bulucu, IELTS ve süre hesaplayıcıları, 7 günlük mini kurs ve PDF kopya kâğıtları. Hepsi ücretsiz, hepsi anında sonuç veriyor — kayıt olmadan.</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="${root}ingilizce-seviye-testi/">İngilizce seviye testi <span class="arrow">→</span></a><a class="btn btn-ghost btn-lg" href="${root}arapca-alfabe/">Arapça alfabe</a></div>
    <ul class="hero-facts"><li><i class="star"></i>7 ücretsiz araç</li><li><i class="star"></i>Kayıt gerekmez</li><li><i class="star"></i>Türkçe konuşanlar için</li></ul>
  </div>
  <div class="hero-art">
    <div class="orb gold float" style="width:80px;height:80px;right:2%;top:-30px"></div>
    <div class="orb blue float d2" style="width:40px;height:40px;left:8%;bottom:-10px"></div>
    <div class="hero-card float d1"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:center">
      <div style="background:rgba(255,255,255,.07);border-radius:16px;padding:16px 8px"><div class="big" style="font-size:2.6rem">B1<span style="font-size:.45em">+</span></div><small style="color:rgba(255,255,255,.75)">İngilizce seviyen</small></div>
      <div style="background:rgba(255,255,255,.07);border-radius:16px;padding:16px 8px"><div lang="ar" dir="rtl" style="font-family:var(--font-ar);font-size:2.6rem;color:var(--gold);line-height:1.1">ع</div><small style="color:rgba(255,255,255,.75)">Ayn — en zor harf</small></div>
      <div style="background:rgba(255,255,255,.07);border-radius:16px;padding:16px 8px"><div class="big" style="font-size:2.6rem">6.5</div><small style="color:rgba(255,255,255,.75)">IELTS tahmini</small></div>
      <div style="background:rgba(255,255,255,.07);border-radius:16px;padding:16px 8px"><div class="big" style="font-size:2.6rem">11<span style="font-size:.4em"> ay</span></div><small style="color:rgba(255,255,255,.75)">B2'ye kalan</small></div>
    </div></div>
  </div>
</div></div></section>

<section class="section"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>ARAÇLAR</div><h2>Hangisiyle başlayalım?</h2><p class="muted">Her araç 2–8 dakika sürer ve sonucunu anında gösterir. Ekstra kaynaklar (PDF, plan, kurs) isteğe bağlıdır.</p></div>
  ${L.magnetCards(root, null)}
</div></section>

<section class="section alt"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>NEDEN ÜCRETSİZ?</div><h2>Çünkü doğru başlangıç noktası her şeyi değiştirir</h2></div>
  <div class="grid grid-3">
    <div class="card" data-reveal="0"><div class="icon">1</div><h3>Önce ölç</h3><p>Yanlış seviyeden başlayan öğrenci ya sıkılır ya boğulur. 8 dakikalık test, ilk derste hangi noktadan başlayacağımızı söyler.</p></div>
    <div class="card" data-reveal="1"><div class="icon">2</div><h3>Sonra planla</h3><p>"Kaç ayda" hesaplayıcısı ve hedef bulucu, hayal değil takvim verir. Sayılar Cambridge'in rehber saat tablosundan gelir.</p></div>
    <div class="card" data-reveal="2"><div class="icon">3</div><h3>Sonra konuş</h3><p>Deneme dersinde sonucunu birlikte yorumlarız. Devam edip etmemek tamamen sana kalmış — baskı yok.</p></div>
  </div>
</div></section>

<section class="section" id="sss"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>SIK SORULANLAR</div><h2>Araçlar hakkında</h2></div>
  ${L.faqHtml(FAQ)}
</div></section>
${L.ctaBand(root)}`
};
