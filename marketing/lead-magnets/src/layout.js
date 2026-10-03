/* Shared layout + components for the static build (no dependencies). */
'use strict';
const cfg = require('./config.json');

const fs = require('fs');
const path = require('path');
let _css = null;
function inlineCss(root) { if (_css === null) _css = fs.readFileSync(path.join(__dirname, '../site/assets/css/main.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n+/g, '\n'); return _css.replace(/url\(\.\.\//g, 'url(' + root + 'assets/'); }
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = esc;

/** Relative prefix from a page path like "a/b/" back to the site root. */
function relRoot(pagePath) {
  const depth = pagePath.split('/').filter(Boolean).length;
  return depth ? '../'.repeat(depth) : '';
}

const ORG_ID = cfg.baseUrl.replace(/\/$/, '') + '/#organization';
const SITE_ID = cfg.baseUrl.replace(/\/$/, '') + '/#website';

function organization(root) {
  return {
    '@type': 'Organization', '@id': ORG_ID, name: 'AHK Akademi', alternateName: 'AHK Academy', url: cfg.mainSite,
    logo: { '@type': 'ImageObject', url: cfg.baseUrl + 'assets/img/star-mark.png', width: 400, height: 462 },
    sameAs: [cfg.instagram], description: 'Türkçe konuşanlar için online İngilizce ve Arapça akademisi: IELTS/TOEFL hazırlık, konuşma pratiği, iş İngilizcesi, Kur\'an Arapçası, Modern Standart Arapça ve lehçeler.'
  };
}

function navHtml(root, lang) {
  const items = lang === 'en'
    ? [['english-level-test/', 'English level test', 'en/'], ['arapca-alfabe/', 'Arabic alphabet'], ['ielts-puan-hesaplama/', 'IELTS calculator'], ['7-gunluk-ingilizce-konusma/', '7-day course']]
    : [['ingilizce-seviye-testi/', 'İngilizce Seviye Testi'], ['arapca-alfabe/', 'Arapça Alfabe'], ['arapca-hedef-bulucu/', 'Arapça Hedef Bulucu'], ['ielts-puan-hesaplama/', 'IELTS Hesaplama'], ['ingilizce-kac-ayda-ogrenilir/', 'Kaç Ayda?'], ['kopya-kagitlari/', 'PDF\'ler']];
  const link = (i) => `<a href="${root}${i[2] ? i[2] + i[0] : i[0]}">${i[1]}</a>`;
  return `<header class="site-header"><div class="container nav">
  <a class="brand" href="${root}" aria-label="AHK Akademi — ana sayfa"><img src="${root}assets/img/ahk-akademi-horizontal.webp" alt="AHK Akademi" width="150" height="36" fetchpriority="high"></a>
  <nav aria-label="${lang === 'en' ? 'Main' : 'Ana menü'}"><ul class="nav-links">${items.map(i => `<li>${link(i)}</li>`).join('')}</ul></nav>
  <div class="nav-cta"><a class="btn btn-gold btn-sm" href="${cfg.mainSite}" data-trial>${lang === 'en' ? 'Free trial lesson' : 'Ücretsiz deneme dersi'}</a>
  <button class="nav-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menü"><span></span></button></div>
</div><div class="mobile-menu" id="mobile-menu">${items.map(link).join('')}</div></header>`;
}

function footerHtml(root, lang) {
  const tr = lang !== 'en';
  return `<footer class="footer"><div class="container"><div class="footer-grid">
  <div><a class="wordmark" href="${cfg.mainSite}"><img src="${root}assets/img/star-mark-outlined.webp" alt="" width="40" height="38"><span class="wm"><b>AHK</b><i></i><small>AKADEMI</small></span></a>
    <p style="margin-top:14px;max-width:38ch">${tr ? 'Türkçe konuşanlar için online İngilizce ve Arapça akademisi. Öğrencilerin başarısına odaklı.' : 'Online English and Arabic academy for Turkish speakers. Focused on student success.'}</p>
    <p><a href="${cfg.instagram}" rel="me noopener" target="_blank">Instagram @ahkacademy</a><br><a href="${cfg.mainSite}">ahkademy.com</a></p></div>
  <div><h3>${tr ? 'İngilizce araçları' : 'English tools'}</h3><ul>
    <li><a href="${root}ingilizce-seviye-testi/">İngilizce Seviye Testi</a></li>
    <li><a href="${root}ielts-puan-hesaplama/">IELTS Puan Hesaplama</a></li>
    <li><a href="${root}ingilizce-kac-ayda-ogrenilir/">İngilizce Kaç Ayda Öğrenilir?</a></li>
    <li><a href="${root}7-gunluk-ingilizce-konusma/">7 Günlük Konuşma Kursu</a></li>
    <li><a href="${root}en/english-level-test/">English level test (EN)</a></li></ul></div>
  <div><h3>${tr ? 'Arapça araçları' : 'Arabic tools'}</h3><ul>
    <li><a href="${root}arapca-alfabe/">Arapça Alfabe Eğitmeni</a></li>
    <li><a href="${root}arapca-hedef-bulucu/">Arapça Hedef Bulucu</a></li>
    <li><a href="${root}kopya-kagitlari/">Ücretsiz PDF Kopya Kâğıtları</a></li>
    <li><a href="${root}gizlilik/">${tr ? 'Gizlilik ve KVKK' : 'Privacy (KVKK)'}</a></li></ul></div>
</div><div class="legal"><span>© ${new Date().getFullYear()} AHK Akademi</span><span>${tr ? 'Bu araçlar ücretsizdir ve resmî bir sertifika yerine geçmez.' : 'These tools are free and are not official certificates.'}</span></div></div></footer>`;
}

/** Lead capture form with KVKK + marketing consents. */
function leadForm({ root, magnet, lang = 'tr', title, desc, unlock, goals, languageDefault = 'english' }) {
  const tr = lang !== 'en';
  const goalOpts = (goals || (tr
    ? [['speaking', 'Konuşma pratiği / özgüven'], ['ielts', 'IELTS / TOEFL'], ['business', 'İş İngilizcesi'], ['abroad', 'Yurt dışında eğitim / iş'], ['general', 'Genel ilerleme']]
    : [['speaking', 'Speaking confidence'], ['ielts', 'IELTS / TOEFL'], ['business', 'Business English'], ['abroad', 'Study / work abroad'], ['general', 'General progress']]))
    .map(g => `<option value="${g[0]}">${g[1]}</option>`).join('');
  return `<div class="lead-box" id="lead"><span class="tag">${tr ? 'Ücretsiz ekstra' : 'Free extra'}</span>
  <h3>${title}</h3><p class="muted">${desc}</p>
  <form class="lead-form" data-magnet="${magnet}" novalidate>
    <input type="hidden" name="result" value="">
    <div class="form-grid">
      <div class="field"><label for="${magnet}-name">${tr ? 'Adın' : 'Your name'}</label><input id="${magnet}-name" name="name" type="text" autocomplete="given-name" required><span class="err">${tr ? 'Lütfen adını yaz.' : 'Please enter your name.'}</span></div>
      <div class="field"><label for="${magnet}-language">${tr ? 'İlgilendiğin dil' : 'Language'}</label><select id="${magnet}-language" name="language"><option value="english"${languageDefault === 'english' ? ' selected' : ''}>${tr ? 'İngilizce' : 'English'}</option><option value="arabic"${languageDefault === 'arabic' ? ' selected' : ''}>${tr ? 'Arapça' : 'Arabic'}</option><option value="both">${tr ? 'İkisi de' : 'Both'}</option></select></div>
      <div class="field"><label for="${magnet}-email">${tr ? 'E-posta' : 'E-mail'}</label><input id="${magnet}-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="ornek@eposta.com"><span class="err">${tr ? 'Geçerli bir e-posta yaz (veya WhatsApp numaranı).' : 'Enter a valid e-mail (or your WhatsApp number).'}</span></div>
      <div class="field"><label for="${magnet}-phone">${tr ? 'WhatsApp numaran' : 'WhatsApp number'}</label><input id="${magnet}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx"><span class="err">${tr ? 'Geçerli bir numara yaz (veya e-postanı).' : 'Enter a valid number (or your e-mail).'}</span></div>
      <div class="field full"><label for="${magnet}-goal">${tr ? 'Hedefin' : 'Your goal'}</label><select id="${magnet}-goal" name="goal">${goalOpts}</select></div>
      <label class="check full"><input type="checkbox" name="kvkk" required><span>${tr ? `<a href="${root}gizlilik/" target="_blank" rel="noopener">Aydınlatma Metni</a>'ni okudum; adımın, e-postamın ve/veya telefon numaramın <strong>istediğim sonucu/kaynağı bana iletmek ve dersler hakkında benimle iletişime geçmek</strong> amacıyla AHK Akademi tarafından işlenmesine açık rıza veriyorum. (Zorunlu)` : `I have read the <a href="${root}gizlilik/" target="_blank" rel="noopener">Privacy Notice (KVKK)</a> and give explicit consent to AHK Akademi processing my name, e-mail and/or phone number <strong>to deliver the resource I requested and contact me about lessons</strong>. (Required)`}</span></label>
      <label class="check full"><input type="checkbox" name="marketing"><span>${tr ? 'Kampanya, yeni ücretsiz kaynak ve ders duyurularını e-posta / SMS / WhatsApp ile almak istiyorum (ticari elektronik ileti onayı, isteğe bağlı; istediğin zaman vazgeçebilirsin).' : 'I would like to receive news about free resources and lessons by e-mail / SMS / WhatsApp (optional marketing consent; you can opt out any time).'}</span></label>
      <div class="full"><button type="submit" class="btn btn-gold btn-lg" style="width:100%">${tr ? 'Ekstra kaynakları aç' : 'Unlock the extras'} <span class="arrow">→</span></button></div>
    </div>
    <div class="form-msg" role="alert" aria-live="polite"></div>
  </form>
  <div class="unlock" aria-live="polite">${unlock}</div>
</div>`;
}

function faqHtml(items) {
  return `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}</summary><div class="a">${a}</div></details>`).join('')}</div>`;
}
function faqLd(items) {
  return { '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q.replace(/<[^>]+>/g, ''), acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) };
}
function breadcrumbLd(items) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: cfg.baseUrl + it[1] })) };
}

/** Cards linking to the other magnets (internal links). */
function magnetCards(root, exclude, lang = 'tr') {
  const all = [
    { p: 'ingilizce-seviye-testi/', i: 'A→C', t: 'İngilizce Seviye Testi', d: '25 soru, 8 dakika: CEFR A1–C1 seviyeni ve kişisel planını gör.' },
    { p: 'arapca-alfabe/', i: 'ع', t: 'Arapça Alfabe Eğitmeni', d: '28 harf, 4 yazılış şekli, Türkçe ses ipuçları ve tanıma testi.', ar: true },
    { p: 'arapca-hedef-bulucu/', i: '🧭', t: 'Arapça Hedef Bulucu', d: 'Kur\'an, MSA, Körfez ya da Levanten: 6 soruda sana uygun yol.' },
    { p: 'ielts-puan-hesaplama/', i: '7.5', t: 'IELTS Puan Hesaplama', d: 'Doğru sayından band puanına, hedef puana ne kadar var?' },
    { p: 'ingilizce-kac-ayda-ogrenilir/', i: '⏱', t: 'İngilizce Kaç Ayda Öğrenilir?', d: 'Haftalık saatine göre B1, B2, C1 için gerçekçi takvim.' },
    { p: '7-gunluk-ingilizce-konusma/', i: '7', t: '7 Günlük Konuşma Kursu', d: 'WhatsApp veya e-postayla günde 1 görev: Türkçe düşünmeyi bırak.' },
    { p: 'kopya-kagitlari/', i: 'PDF', t: 'Kopya Kâğıtları (PDF)', d: 'Türkçe düşünme hataları, IELTS Speaking kalıpları, Arapça alfabe tablosu.' }
  ].filter(m => m.p !== exclude);
  return `<div class="grid grid-3">${all.map((m, k) => `<a class="card${m.ar ? ' ar-card' : ''}" href="${root}${m.p}" data-reveal="${k % 3}"><div class="icon"${m.ar ? ' lang="ar"' : ''}>${m.i}</div><h3>${m.t}</h3><p>${m.d}</p><span class="more">${lang === 'en' ? 'Open' : 'Aç'} →</span></a>`).join('')}</div>`;
}

function ctaBand(root, lang = 'tr', text) {
  const tr = lang !== 'en';
  return `<section class="section"><div class="container"><div class="cta-band" data-reveal>
    <div><h2>${tr ? 'Seviyeni biliyorsun. Şimdi ilerleme zamanı.' : 'You know your level. Time to move.'}</h2><p>${text || (tr ? 'AHK Akademi\'de birebir online dersler: İngilizce (IELTS/TOEFL, konuşma, iş İngilizcesi) ve Arapça (Kur\'an, MSA, lehçeler). İlk ders ücretsiz deneme.' : 'One-to-one online lessons at AHK Akademi: English (IELTS/TOEFL, speaking, business) and Arabic (Qur\'anic, MSA, dialects). First lesson is a free trial.')}</p></div>
    <div style="display:grid;gap:10px"><a class="btn btn-gold btn-lg" href="${cfg.mainSite}" data-trial>${tr ? 'Ücretsiz deneme dersi' : 'Free trial lesson'} <span class="arrow">→</span></a><a class="btn btn-wa" href="#" data-wa="Merhaba AHK Akademi, ücretsiz deneme dersi hakkında bilgi almak istiyorum." hidden>WhatsApp'tan yaz</a></div>
  </div></div></section>`;
}

function resultActions(root, lang = 'tr') {
  const tr = lang !== 'en';
  return `<div class="share-row rise d3">
    <a class="btn btn-gold" href="${cfg.mainSite}" data-trial>${tr ? 'Ücretsiz deneme dersi al' : 'Book a free trial lesson'} <span class="arrow">→</span></a>
    <a class="btn btn-wa" href="#" data-wa-result hidden>${tr ? 'Sonucu WhatsApp\'tan gönder' : 'Send result on WhatsApp'}</a>
    <button type="button" class="btn btn-ghost share">${tr ? 'Paylaş' : 'Share'}</button>
    <button type="button" class="btn btn-ghost retry">${tr ? 'Tekrar çöz' : 'Try again'}</button>
  </div>`;
}

/** Full HTML document. */
function page(p) {
  const root = relRoot(p.path);
  const url = cfg.baseUrl + p.path;
  const lang = p.lang || 'tr';
  const og = cfg.baseUrl + 'assets/og/' + (p.og || p.path.replace(/\/$/, '').replace(/\//g, '-') || 'index') + '.jpg';
  const alternates = (p.alternates || []).map(a => `<link rel="alternate" hreflang="${a.lang}" href="${cfg.baseUrl}${a.path}">`).join('\n  ');
  const ld = { '@context': 'https://schema.org', '@graph': [organization(root), { '@type': 'WebSite', '@id': SITE_ID, url: cfg.baseUrl, name: 'AHK Akademi — Ücretsiz Araçlar', inLanguage: 'tr', publisher: { '@id': ORG_ID } }, { '@type': p.webPageType || 'WebPage', '@id': url + '#webpage', url, name: p.title, description: p.description, inLanguage: lang, isPartOf: { '@id': SITE_ID }, about: { '@id': ORG_ID }, primaryImageOfPage: { '@type': 'ImageObject', url: og, width: 1200, height: 630 }, datePublished: cfg.datePublished, dateModified: cfg.buildDate }].concat(p.jsonld || []) };
  const scripts = ['config.js', 'app.js'].concat(p.scripts || []).map(s => `<script src="${root}assets/js/${s}" defer></script>`).join('\n  ');
  return `<!doctype html>
<html lang="${lang}" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${attr(p.description)}">
  <link rel="canonical" href="${url}">
  ${p.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
  ${alternates}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="AHK Akademi">
  <meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'tr_TR'}">
  <meta property="og:title" content="${attr(p.ogTitle || p.title)}">
  <meta property="og:description" content="${attr(p.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${og}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${attr(p.ogTitle || p.title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(p.ogTitle || p.title)}">
  <meta name="twitter:description" content="${attr(p.description)}">
  <meta name="twitter:image" content="${og}">
  <meta name="theme-color" content="#0E1F3E">
  <link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${root}assets/img/apple-touch-icon.png">
  <link rel="preload" href="${root}assets/fonts/Unbounded-900-tr.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${root}assets/fonts/Inter-400-tr.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${root}assets/fonts/Inter-600-tr.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${root}assets/fonts/Inter-800-tr.woff2" as="font" type="font/woff2" crossorigin>
  ${p.preloadArabic ? `<link rel="preload" href="${root}assets/fonts/NotoNaskhArabic-400-arabic.woff2" as="font" type="font/woff2" crossorigin>` : ''}
  <style>${inlineCss(root)}</style>
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip" href="#main">${lang === 'en' ? 'Skip to content' : 'İçeriğe atla'}</a>
${navHtml(root, lang)}
<main id="main">
${p.body({ root, url, lang, cfg })}
</main>
${footerHtml(root, lang)}
${scripts}
</body>
</html>`;
}

module.exports = { page, esc, relRoot, leadForm, faqHtml, faqLd, breadcrumbLd, magnetCards, ctaBand, resultActions, cfg, ORG_ID };
