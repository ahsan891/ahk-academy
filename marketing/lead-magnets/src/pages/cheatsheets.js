'use strict';
const L = require('../layout');

const SHEETS = [
  { file: 'ahk-turkce-dusunme-hatalari.pdf', title: 'Türkçe Düşünme Hataları — 25 cümle', d: 'Birebir çeviriden doğan 25 hata, doğrusu ve 10 saniyelik kuralı. Konuşma öncesi 2 dakikalık tekrar için.', tag: 'İngilizce · A2–B2', lang: 'english' },
  { file: 'ahk-ielts-speaking-kaliplari.pdf', title: 'IELTS Speaking Kalıpları — Part 1, 2, 3', d: 'Düşünme kalıpları, fikir belirtme, karşılaştırma, spekülasyon ve Part 2 planı; band 6.5–7.5 için.', tag: 'IELTS', lang: 'english' },
  { file: 'ahk-arapca-alfabe-tablosu.pdf', title: 'Arapça Alfabe Tablosu — 28 harf', d: 'Her harfin dört şekli, Türkçe adı, sesi ve örnek kelime. Yazdır, buzdolabına as.', tag: 'Arapça · Başlangıç', lang: 'arabic' }
];
const FAQ = [
  ['PDF\'ler gerçekten ücretsiz mi?', 'Evet. Adını ve e-posta/WhatsApp bilgini bırakınca üçü de aynı anda açılır; ödeme ya da üyelik yok. Bilgilerin yalnızca dosyaları göndermek ve dersler hakkında iletişim kurmak için kullanılır (<a href="../gizlilik/">Aydınlatma Metni</a>).'],
  ['Telefonda açılıyor mu?', 'Evet, A4 boyutunda standart PDF; telefon, tablet ve bilgisayarda açılır, yazdırılabilir. WhatsApp gruplarında paylaşmak serbest — kaynak göstermen yeterli.'],
  ['Yeni kopya kâğıdı gelecek mi?', 'Planlananlar: "Business English e-posta kalıpları", "Arapça harekeler ve okuma kuralları", "Phrasal verb\'ler 50". İsteğe bağlı duyuru kutusunu işaretlersen yenileri ilk sen alırsın.']
];

module.exports = {
  path: 'kopya-kagitlari/',
  lang: 'tr',
  title: 'Ücretsiz İngilizce ve Arapça PDF Kopya Kâğıtları | AHK Akademi',
  ogTitle: 'Ücretsiz PDF kopya kâğıtları: İngilizce hatalar, IELTS Speaking, Arapça alfabe',
  description: 'Ücretsiz PDF kopya kâğıtları: Türkçe düşünme hataları (25 cümle), IELTS Speaking kalıpları ve Arapça alfabe tablosu. Yazdır, telefonda sakla, paylaş.',
  scripts: [],
  jsonld: [
    L.breadcrumbLd([['Ücretsiz Araçlar', ''], ['Kopya Kâğıtları (PDF)', 'kopya-kagitlari/']]),
    { '@type': 'ItemList', name: 'Ücretsiz PDF kopya kâğıtları', itemListElement: SHEETS.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'DigitalDocument', name: s.title, description: s.d, encodingFormat: 'application/pdf', url: L.cfg.baseUrl + 'assets/pdf/' + s.file, isAccessibleForFree: true, provider: { '@id': L.ORG_ID } } })) },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => `
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <div class="crumbs"><a href="${root}">Ücretsiz Araçlar</a><span>›</span>Kopya Kâğıtları</div>
    <span class="eyebrow"><i class="star"></i> 3 PDF · ÜCRETSİZ</span>
    <h1>Cebinde taşıyacağın <mark>3 kopya kâğıdı</mark></h1>
    <p class="lead">Ders öncesi 2 dakikalık tekrar için tasarlandı: en sık yapılan Türkçe düşünme hataları, IELTS Speaking kalıpları ve tek sayfalık Arapça alfabe tablosu. Tek formla üçü de açılır.</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="#indir">PDF'leri aç <span class="arrow">→</span></a></div>
  </div>
  <div class="hero-art"><div class="hero-card float d1"><span class="hand">Örnek · hata #3</span><p style="font-family:var(--font-display);font-size:1.15rem;margin:6px 0 8px;color:#fff"><s style="opacity:.6">I have 25 years.</s></p><p style="font-family:var(--font-display);font-size:1.15rem;margin:0;color:var(--gold)">I am 25 (years old).</p><p style="margin:10px 0 0;color:rgba(255,255,255,.8);font-size:.95rem">Yaş "sahip olunan" bir şey değil, "olunan" bir şeydir.</p></div></div>
</div></div></section>

<section class="section"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>İÇERİK</div><h2>İçeride ne var?</h2></div>
  <div class="grid grid-3">${SHEETS.map((s, i) => `<div class="card" data-reveal="${i}"><div class="icon">PDF</div><span class="pill gold">${s.tag}</span><h3 style="margin-top:10px">${s.title}</h3><p>${s.d}</p></div>`).join('')}</div>
</div></section>

<section class="section alt" id="indir"><div class="container narrow">
  ${L.leadForm({ root, magnet: 'kopya-kagitlari', title: 'Üç PDF\'i birden aç', desc: 'Adını ve e-posta/WhatsApp bilgini bırak; bağlantılar hemen açılır, kopyası da sana gelir.', unlock: `<b>Açıldı — indir:</b><ul style="margin:8px 0 0;padding-left:1.2em">${SHEETS.map(s => `<li><a href="${root}assets/pdf/${s.file}" download>${s.title}</a></li>`).join('')}</ul>` })}
</div></section>

<section class="section" id="sss"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>SIK SORULANLAR</div><h2>PDF'ler hakkında</h2></div>
  ${L.faqHtml(FAQ)}
</div></section>

<section class="section alt"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>İNTERAKTİF ARAÇLAR</div><h2>PDF'den fazlası</h2></div>
  ${L.magnetCards(root, 'kopya-kagitlari/')}
</div></section>
${L.ctaBand(root)}`
};
