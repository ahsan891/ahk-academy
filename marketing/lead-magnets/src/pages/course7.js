'use strict';
const L = require('../layout');

const DAYS = [
  ['Türkçe düşünme tuzağı', '"I am agree", "I have 25 years", "open the light"… birebir çeviriden gelen 7 hata ve 10 saniyelik düzeltmeleri. Görev: kendi cümlelerinden 3 tanesini düzelt.'],
  ['Kendini 60 saniyede tanıt', 'İsim, şehir, iş, hobi, hedef — doğal sırayla, "I am working as" tuzağına düşmeden. Görev: sesli kayıt al, bize gönder.'],
  ['Present perfect\'i gerçekten kullan', '"Since / for / just / already / yet" ile deneyim anlatma. Görev: bugün yaptığın 5 şeyi present perfect ile yaz.'],
  ['Düşünme kalıpları', 'Cevap ararken sessiz kalma: "Let me think…", "That\'s a good question", "Off the top of my head…". Görev: 3 kalıbı bir soruya cevapta kullan.'],
  ['"Very" yerine güçlü sıfat', 'very tired → exhausted, very good → excellent, very big → enormous. Görev: 10 "very" cümlesini güçlendir.'],
  ['Phrasal verb günü', 'Günlük hayatın 8 phrasal verb\'ü: get up, give up, look for, run out of, put off, pick up, turn down, come across. Görev: hikâye yaz.'],
  ['Mini konuşma sınavı', '2 dakikalık konuşma görevi + öğretmenden kişisel geri bildirim. Görev: kaydı gönder, seviyene göre sonraki adımı al.']
];
const FAQ = [
  ['7 günlük kurs tam olarak ne?', 'Yedi gün boyunca her sabah e-posta veya WhatsApp\'tan kısa bir ders (okuma 3–4 dakika) ve 10 dakikalık bir görev gelir. Konu: Türkçe düşünerek yapılan hatalar ve konuşma özgüveni. Yedinci gün bir konuşma görevi ve kişisel geri bildirim var. Tamamen ücretsiz.'],
  ['Hangi seviye için uygun?', 'A2–B2 arası için tasarlandı: temel cümle kurabilen ama konuşurken takılan, "Türkçe düşünen" herkes. Seviyenden emin değilsen önce <a href="../ingilizce-seviye-testi/">seviye testini</a> çöz.'],
  ['WhatsApp mı, e-posta mı?', 'İkisi de olur; Türkiye\'de çoğu öğrenci WhatsApp\'ı tercih ediyor çünkü ses kaydı göndermek kolay. İstersen ikisini de bırakabilirsin.'],
  ['Kayıt olunca ne oluyor, spam gelir mi?', 'Yalnızca 7 günlük dersler ve 7. gün geri bildirimi gelir. Kampanya ve duyuru mesajlarını ancak ayrı "ticari ileti" kutusunu işaretlersen gönderiyoruz; her mesajda vazgeçme seçeneği var. Ayrıntılar <a href="../gizlilik/">Aydınlatma Metni</a>\'nde.'],
  ['7 gün sonra ne olacak?', 'Konuşma görevinin geri bildirimiyle birlikte seviyene uygun bir sonraki adımı öneririz: kendi başına devam planı ya da ücretsiz deneme dersi. Karar senin.']
];

module.exports = {
  path: '7-gunluk-ingilizce-konusma/',
  lang: 'tr',
  title: '7 Günlük Ücretsiz İngilizce Konuşma Kursu (WhatsApp / E-posta)',
  ogTitle: '7 günde Türkçe düşünmeyi bırak — ücretsiz mini kurs',
  description: 'Ücretsiz 7 günlük İngilizce konuşma mini kursu: her gün WhatsApp veya e-postayla 10 dakikalık görev, Türkçe düşünme hataları ve 7. gün kişisel geri bildirim.',
  scripts: [],
  jsonld: [
    L.breadcrumbLd([['Ücretsiz Araçlar', ''], ['7 Günlük İngilizce Konuşma Kursu', '7-gunluk-ingilizce-konusma/']]),
    { '@type': 'Course', name: '7 Günlük İngilizce Konuşma Kursu', description: 'Türkçe düşünme hatalarını ve konuşma özgüvenini hedefleyen 7 günlük ücretsiz mini kurs; her gün e-posta/WhatsApp ile bir ders ve görev.', provider: { '@id': L.ORG_ID }, inLanguage: 'tr', teaches: 'English speaking confidence; common Turkish-to-English transfer errors', educationalLevel: 'A2–B2 (CEFR)', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY', category: 'Free' }, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT10M', courseSchedule: { '@type': 'Schedule', repeatFrequency: 'Daily', repeatCount: 7 } }, syllabusSections: DAYS.map((d, i) => ({ '@type': 'Syllabus', name: 'Gün ' + (i + 1) + ': ' + d[0], description: d[1] })) },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => `
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <div class="crumbs"><a href="${root}">Ücretsiz Araçlar</a><span>›</span>7 Günlük Konuşma Kursu</div>
    <span class="eyebrow"><i class="star"></i> ÜCRETSİZ MİNİ KURS</span>
    <h1>7 günde <mark>Türkçe düşünmeyi</mark> bırak</h1>
    <p class="lead">Her sabah WhatsApp'a ya da e-postana 10 dakikalık bir görev gelir: en sık yapılan çeviri hataları, düşünme kalıpları, güçlü sıfatlar, phrasal verb'ler. Yedinci gün 2 dakikalık konuşma kaydı ve öğretmenden kişisel geri bildirim.</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="#kayit">Ücretsiz katıl <span class="arrow">→</span></a><a class="btn btn-ghost" href="#program">7 günün programı</a></div>
    <ul class="hero-facts"><li><i class="star"></i>Günde 10 dakika</li><li><i class="star"></i>WhatsApp veya e-posta</li><li><i class="star"></i>7. gün geri bildirim</li></ul>
  </div>
  <div class="hero-art"><div class="hero-card float d1"><span class="hand">Gün 1</span><p style="font-family:var(--font-display);font-weight:700;font-size:1.3rem;margin:6px 0 10px;color:#fff">"I am agree with you."</p><p style="margin:0;color:rgba(255,255,255,.85)">Türkçe: "katılıyorum" → fiil. İngilizce: <b style="color:var(--gold)">I agree</b> with you. "Am" yok.</p></div></div>
</div></div></section>

<section class="section" id="program"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>PROGRAM</div><h2>7 gün, 7 görev</h2><p class="muted">Her ders 3–4 dakikada okunur, görev 10 dakika sürer. Hepsi Instagram'da en çok paylaşılan AHK içeriklerinden damıtıldı.</p></div>
  <div class="grid grid-2">${DAYS.map((d, i) => `<div class="card" data-reveal="${i % 2}"><div class="icon">${i + 1}</div><h3>Gün ${i + 1}: ${d[0]}</h3><p>${d[1]}</p></div>`).join('')}</div>
</div></section>

<section class="section alt" id="kayit"><div class="container narrow">
  ${L.leadForm({ root, magnet: '7-gunluk-kurs', title: '7 günlük kursa ücretsiz katıl', desc: 'Dersleri nereye gönderelim? E-posta veya WhatsApp numarandan en az birini bırak. İlk ders 24 saat içinde gelir.', unlock: `<b>Kaydın alındı.</b> İlk ders yarın sabah geliyor. Beklerken: <a href="${root}assets/pdf/ahk-turkce-dusunme-hatalari.pdf" download>“Türkçe Düşünme Hataları” kopya kâğıdını (PDF) indir</a> · <a href="${root}ingilizce-seviye-testi/">Seviyeni ölç</a>` })}
</div></section>

<section class="section" id="sss"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>SIK SORULANLAR</div><h2>Kurs hakkında</h2></div>
  ${L.faqHtml(FAQ)}
</div></section>

<section class="section alt"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>DİĞER ÜCRETSİZ ARAÇLAR</div><h2>Bugün başlamak için</h2></div>
  ${L.magnetCards(root, '7-gunluk-ingilizce-konusma/')}
</div></section>
${L.ctaBand(root)}`
};
