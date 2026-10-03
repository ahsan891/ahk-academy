'use strict';
const L = require('../layout');

const FAQ = [
  ['İngilizce kaç ayda öğrenilir?', 'Hedef seviyeye ve haftalık çalışma süresine bağlı. Cambridge\'in rehberli öğrenme saati tablosuna göre sıfırdan B1 için yaklaşık 350–400 saat, B2 için 500–600 saat, C1 için 700–800 saat gerekir. Haftada 5 saatle B2 yaklaşık 2 yıl, haftada 10 saatle yaklaşık 1 yıl sürer. Hesaplayıcı bu tabloyu senin tempona uyarlar.'],
  ['Günde 1 saat İngilizce çalışırsam ne olur?', 'Günde 1 saat, haftada 7 saat demektir: sıfırdan B1 yaklaşık 12–13 ay, B1\'den B2 yaklaşık 5–6 ay. Düzenlilik süreden daha önemli; her gün 30 dakika, haftada bir 4 saatten daha etkilidir.'],
  ['Rehberli öğrenme saati (guided learning hours) ne demek?', 'Bir öğretmen eşliğinde ya da yapılandırılmış bir programda geçirilen ders saati. Cambridge English\'in verdiği sayılar sıfırdan o seviyeye ulaşmak için gereken toplam saattir; seviyeden seviyeye geçiş için aradaki fark alınır. Kendi başına yapılan çalışma da sayılır ama genellikle rehberli saate göre daha az verimlidir.'],
  ['Türkçe konuşanlar için İngilizce zor mu?', 'ABD Dışişleri Bakanlığı\'nın dil enstitüsü (FSI) Türkçeyi İngilizce konuşanlar için "zor" (Kategori IV) saydığı gibi, tersine Türkçe konuşanlar için de İngilizce yapısal olarak uzaktır: kelime dizilişi, artikeller, zamanlar. Buna karşılık İngilizce öğrenme kaynaklarının bolluğu ve Türkçedeki binlerce ödünç kelime bu farkı kapatır.'],
  ['Hesaplayıcı sonucu kesin mi?', 'Hayır; bu bir tahmindir. Yaş, önceki dil deneyimi, ders dışı maruz kalma (dizi, oyun, iş) ve motivasyon sonucu ciddi şekilde değiştirir. Gerçek seviyeni <a href="../ingilizce-seviye-testi/">seviye testiyle</a> ölçüp başlangıç noktanı doğru seçersen tahmin daha isabetli olur.']
];

module.exports = {
  path: 'ingilizce-kac-ayda-ogrenilir/',
  lang: 'tr',
  title: 'İngilizce Kaç Ayda Öğrenilir? B1, B2, C1 Süre Hesaplayıcı',
  ogTitle: 'İngilizce kaç ayda öğrenilir? Haftalık saatine göre hesapla',
  description: 'Haftada kaç saat çalışıyorsun? Cambridge rehberli öğrenme saati tablosuna göre B1, B2 veya C1 seviyesine kaç ayda ulaşacağını ve bitiş tarihini hesapla.',
  scripts: ['hours.js'],
  jsonld: [
    L.breadcrumbLd([['Ücretsiz Araçlar', ''], ['İngilizce Kaç Ayda Öğrenilir?', 'ingilizce-kac-ayda-ogrenilir/']]),
    { '@type': 'WebApplication', name: 'İngilizce Kaç Ayda Öğrenilir? Hesaplayıcı', applicationCategory: 'EducationalApplication', operatingSystem: 'Web', browserRequirements: 'Requires JavaScript', offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' }, inLanguage: 'tr', provider: { '@id': L.ORG_ID }, description: 'Mevcut seviye, hedef seviye ve haftalık çalışma saatine göre CEFR seviyesine ulaşma süresini hesaplayan araç.' },
    L.faqLd(FAQ)
  ],
  body: ({ root }) => `
<section class="hero"><div class="hero-wm"></div><div class="container"><div class="hero-grid">
  <div>
    <div class="crumbs"><a href="${root}">Ücretsiz Araçlar</a><span>›</span>İngilizce Kaç Ayda Öğrenilir?</div>
    <span class="eyebrow"><i class="star"></i> ÜCRETSİZ HESAPLAYICI</span>
    <h1>İngilizce <mark>kaç ayda</mark> öğrenilir?</h1>
    <p class="lead">"Altı ayda İngilizce" vaatlerine inanma; sayılara bak. Cambridge'in rehberli öğrenme saati tablosunu haftalık tempona uyarla: B1, B2 ya da C1'e hangi ay ulaşırsın, takvimde hangi tarihe denk gelir?</p>
    <div class="hero-actions"><a class="btn btn-gold btn-lg" href="#hesapla">Hesapla <span class="arrow">→</span></a><a class="btn btn-ghost" href="#tablo">Saat tablosu</a></div>
  </div>
  <div class="hero-art"><div class="orb blue float" style="width:60px;height:60px;left:4%;top:-10px"></div><div class="hero-card float d1" style="text-align:center"><span class="hand">Sıfırdan B2</span><div class="big">11<span style="font-size:.35em"> ay</span></div><p style="margin:6px 0 0;color:rgba(255,255,255,.85)">haftada 12 saat ile</p></div></div>
</div></div></section>

<section class="section" id="hesapla"><div class="container"><div class="tool"><div class="calc">
  <div>
    <h2 style="font-size:1.4rem">Senin temponla</h2>
    <p style="font-weight:700;margin-bottom:6px">Şu anki seviyen</p>
    <div class="seg" data-group="from" role="group" aria-label="Şu anki seviye"><button type="button" data-v="A0">Sıfır</button><button type="button" data-v="A1">A1</button><button type="button" data-v="A2">A2</button><button type="button" data-v="B1">B1</button><button type="button" data-v="B2">B2</button></div>
    <p class="muted" style="font-size:.85rem;margin:6px 0 16px">Emin değil misin? <a href="${root}ingilizce-seviye-testi/">8 dakikalık seviye testi</a></p>
    <p style="font-weight:700;margin-bottom:6px">Hedef seviyen</p>
    <div class="seg" data-group="to" role="group" aria-label="Hedef seviye"><button type="button" data-v="A2">A2</button><button type="button" data-v="B1">B1</button><button type="button" data-v="B2">B2</button><button type="button" data-v="C1">C1</button><button type="button" data-v="C2">C2</button></div>
    <div class="range" style="margin-top:18px"><label for="weekly">Haftada kaç saat? — <output id="weekly-out">5 saat</output></label><input type="range" id="weekly" min="1" max="20" value="5"></div>
    <p style="font-weight:700;margin:16px 0 6px">Nasıl çalışıyorsun?</p>
    <div class="seg" data-group="int" role="group" aria-label="Çalışma şekli"><button type="button" data-v="1">Ders + günlük pratik</button><button type="button" data-v="1.4">Sadece kendi başıma</button><button type="button" data-v="0.85">Yoğun program</button></div>
    <p class="muted" style="font-size:.82rem;margin-top:8px">"Sadece kendi başıma" seçeneği saatleri 1,4 ile, "yoğun program" (ders + ödev + konuşma kulübü) 0,85 ile çarpar — bunlar deneyime dayalı katsayılardır, Cambridge verisi değildir.</p>
    <input type="hidden" name="result" value="">
  </div>
  <div class="result-hero" style="grid-template-columns:1fr;align-content:start">
    <div><span class="pill gold"><span id="from-lbl">Sıfır</span> → <span id="to-lbl">B2</span></span>
      <div style="display:flex;align-items:baseline;gap:10px;margin:8px 0"><span class="big-num" id="months">22</span><span style="font-family:var(--font-display);font-size:1.3rem">ay</span></div>
      <div class="stats"><div class="stat"><small>TOPLAM SAAT</small><b id="hours">550</b></div><div class="stat"><small>HAFTA</small><b id="weeks">110</b></div><div class="stat"><small>TAHMİNİ BİTİŞ</small><b id="date" style="font-size:1rem">—</b></div></div>
      <p id="tip" style="margin:16px 0 0;color:rgba(255,255,255,.85)"></p>
      <p class="notice" style="margin-top:14px;color:var(--navy)">Haftada <b id="faster-weekly">8</b> saate çıkarsan: yaklaşık <b id="faster">14</b> ay.</p>
      <div class="share-row"><a class="btn btn-gold" href="${L.cfg.mainSite}" data-trial>Planı bir öğretmenle yap <span class="arrow">→</span></a><a class="btn btn-wa" href="#" data-wa="Merhaba AHK Akademi, İngilizce dersleri ve çalışma planı hakkında bilgi almak istiyorum." hidden>WhatsApp'tan sor</a></div>
    </div>
  </div>
</div>
${L.leadForm({ root, magnet: 'ingilizce-kac-ayda', title: 'Kişisel haftalık çalışma planı (PDF)', desc: 'Seviyen, hedefin ve haftalık saatine göre hazırlanmış 12 haftalık plan + "Türkçe Düşünme Hataları" kopya kâğıdı. E-posta veya WhatsApp\'a gönderelim.', unlock: `<b>Açıldı:</b> <a href="${root}assets/pdf/ahk-turkce-dusunme-hatalari.pdf" download>“Türkçe Düşünme Hataları” PDF'ini indir</a> · <a href="${root}7-gunluk-ingilizce-konusma/">7 günlük konuşma kursuna katıl</a> · 12 haftalık planın 24 saat içinde gelecek.` })}
</div></div></section>

<section class="section alt" id="tablo"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>KAYNAK</div><h2>Cambridge rehberli öğrenme saati tablosu</h2><p class="muted">Sıfırdan ilgili seviyeye ulaşmak için gereken toplam saat (kümülatif). Hesaplayıcı her aralığın orta değerini kullanır.</p></div>
  <div class="table-wrap"><table class="t"><thead><tr><th>Seviye</th><th>Cambridge sınavı</th><th>Toplam saat</th><th>Haftada 5 saat</th><th>Haftada 10 saat</th></tr></thead><tbody>
    <tr><td>A1</td><td>—</td><td>≈ 90–100*</td><td>≈ 4–5 ay</td><td>≈ 2–3 ay</td></tr>
    <tr><td>A2</td><td>A2 Key</td><td>180–200</td><td>≈ 9 ay</td><td>≈ 4–5 ay</td></tr>
    <tr><td>B1</td><td>B1 Preliminary</td><td>350–400</td><td>≈ 1,5 yıl</td><td>≈ 9 ay</td></tr>
    <tr><td>B2</td><td>B2 First</td><td>500–600</td><td>≈ 2–2,5 yıl</td><td>≈ 1 yıl</td></tr>
    <tr><td>C1</td><td>C1 Advanced</td><td>700–800</td><td>≈ 3 yıl</td><td>≈ 1,5 yıl</td></tr>
    <tr><td>C2</td><td>C2 Proficiency</td><td>1.000–1.200</td><td>≈ 4,5 yıl</td><td>≈ 2–2,5 yıl</td></tr>
  </tbody></table></div>
  <p class="muted" style="font-size:.85rem;margin-top:10px">Kaynak: Cambridge English, "Guided learning hours". * A1 satırı yaygın bir tahmindir; Cambridge'in resmî tablosu A2'den başlar.</p>
</div></section>

<section class="section" id="sss"><div class="container narrow">
  <div class="section-head"><div class="kicker"><i class="star"></i>SIK SORULANLAR</div><h2>Süre ve tempo hakkında</h2></div>
  ${L.faqHtml(FAQ)}
</div></section>

<section class="section alt"><div class="container">
  <div class="section-head"><div class="kicker"><i class="star"></i>DİĞER ÜCRETSİZ ARAÇLAR</div><h2>Takvimi plana çevir</h2></div>
  ${L.magnetCards(root, 'ingilizce-kac-ayda-ogrenilir/')}
</div></section>
${L.ctaBand(root)}`
};
