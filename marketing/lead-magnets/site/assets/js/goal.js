/* Arapça Hedef Bulucu — 6 questions → one of 4 learning paths. Also read at build time. */
(function (root) {
  var PATHS = {
    quran: { key: 'quran', title: 'Kur\'an Arapçası Yolu', ar: 'العربية القرآنية', emoji: '📖', head: 'Hedefin okuduğunu anlamak: Kur\'an kelimeleriyle başlayan, sarf-nahiv destekli bir yol.',
      desc: 'Kur\'an\'da çok tekrar eden kelimeler ve temel cümle yapısı (isim cümlesi, fiil cümlesi, harf-i cerler) ilk hedefin. Konuşma pratiği ikinci planda; amaç metni anlamak ve doğru okumak.',
      plan: ['1. hafta: 28 harf + harekeler + med (uzatma) kuralları.', '2–4. hafta: Fâtiha ve kısa surelerdeki kelimeler; "sıfat, muzâf, harf-i cer" tanıma.', '2. ay: Günde 10 kelime — sık geçen 300 kelime, ayetlerle örnekli.', '3. ay+: Sarf (fiil kalıpları) ve nahiv temel konuları; her hafta bir sure üzerinde uygulama.'],
      first: 'Fâtiha suresindeki 25 kelimenin kökünü ve cümle görevini çıkarmak.', dialect: 'Lehçe gerekmez; fasih (klasik) Arapça.' },
    msa: { key: 'msa', title: 'Modern Standart Arapça (MSA) Yolu', ar: 'العربية الفصحى الحديثة', emoji: '🎓', head: 'Hedefin haber, akademi ve resmî yazışma: tüm Arap dünyasında geçerli ortak dil.',
      desc: 'MSA; gazete, TV haberleri, kitaplar, üniversite ve resmî belgelerin dili. Konuşmada tek başına doğal durmaz ama her lehçenin temelidir ve YDS/YÖKDİL gibi sınavların dilidir.',
      plan: ['1. ay: Alfabe, harekeler, 200 temel kelime, isim cümlesi ve iyelik.', '2. ay: Fiil çekimi (mazi–muzari), sayılar, zaman ifadeleri, soru kalıpları.', '3–4. ay: Haber başlıkları ve kısa metinler; günde 15 dakika Al Jazeera "Learning Arabic" tarzı sadeleştirilmiş içerik.', '5. ay+: Yazma ve konuşma: haftada 1 ders + 1 kısa kompozisyon.'],
      first: 'Kendini 5 cümlede tanıtmak (ad, şehir, meslek, hobi, neden Arapça).', dialect: 'Lehçe daha sonra eklenir; önce fasih temel.' },
    gulf: { key: 'gulf', title: 'Körfez Lehçesi (İş & Ticaret) Yolu', ar: 'اللهجة الخليجية', emoji: '💼', head: 'Hedefin Dubai, Suudi Arabistan, Katar: müşteri, tedarikçi ve iş görüşmelerinde konuşmak.',
      desc: 'Körfez (Halici) lehçesi BAE, Suudi Arabistan, Katar, Kuveyt, Bahreyn ve Umman\'da konuşulur. İş hayatında MSA ile karışık, nazik ve kalıp ağırlıklı bir dil kullanılır; "selamlaşma, pazarlık, randevu" kalıpları ilk sırada.',
      plan: ['1. ay: Alfabe + selamlaşma, hal hatır sorma, nezaket kalıpları (أهلاً وسهلاً، كيف الحال؟، إن شاء الله).', '2. ay: Sayılar, fiyat, tarih, randevu, telefon görüşmesi; 150 iş kelimesi.', '3. ay: Toplantı ve e-posta: MSA ile Körfez kalıplarını ayırt etmek.', '4. ay+: Haftada 2 konuşma dersi: müşteri senaryoları, fuar ve pazarlık rol oyunları.'],
      first: 'Bir müşteriyle telefonda tanışıp randevu almak (10 kalıp).', dialect: 'Körfez (Halici) — BAE/Suudi/Katar.' },
    levant: { key: 'levant', title: 'Levanten (Şam) Lehçesi Yolu', ar: 'اللهجة الشامية', emoji: '🗺️', head: 'Hedefin günlük hayat: komşular, çarşı, iş yeri ve kültürel köprü.',
      desc: 'Levanten (Şâmî) lehçe Suriye, Lübnan, Ürdün ve Filistin\'de konuşulur; Türkiye\'deki Arapça konuşan toplulukların büyük kısmı bu lehçeyi kullanır. Yumuşak telaffuzu ve dizilerle yaygın kullanımı sayesinde en "kulak aşinası" lehçelerden biridir.',
      plan: ['1. ay: Alfabe + 100 günlük kelime, selamlaşma, teşekkür, özür, yön sorma.', '2. ay: Sayılar, alışveriş, yemek, aile; kısa diyalogları gölgeleme (shadowing).', '3. ay: Geçmiş–gelecek anlatma, istek ve rica kalıpları; haftada 1 kısa dizi sahnesi.', '4. ay+: Haftada 2 konuşma dersi; gerçek durumlar (pazar, hastane, iş yeri).'],
      first: 'Çarşıda fiyat sorup pazarlık yapmak (15 kalıp).', dialect: 'Levanten (Şâmî) — Suriye/Lübnan/Ürdün/Filistin.' }
  };
  var Q = [
    { q: 'Arapçayı en çok ne için istiyorsun?', o: [
      { t: 'Kur\'an\'ı ve dua/ hadis metinlerini anlayarak okumak', w: { quran: 3 } },
      { t: 'İş, ticaret veya Körfez ülkelerinde çalışmak', w: { gulf: 3, msa: 1 } },
      { t: 'Türkiye\'de ya da Levant bölgesinde günlük hayatta konuşmak', w: { levant: 3 } },
      { t: 'Üniversite, haber takibi, YDS/YÖKDİL gibi sınavlar', w: { msa: 3 } }
    ] },
    { q: 'Kimlerle konuşacaksın ya da hangi metinleri okuyacaksın?', o: [
      { t: 'Ağırlıklı olarak metin: Kur\'an, klasik kaynaklar', w: { quran: 2, msa: 1 } },
      { t: 'Dubai, Suudi Arabistan, Katar\'daki iş ortakları', w: { gulf: 2 } },
      { t: 'Suriyeli, Lübnanlı, Ürdünlü, Filistinli komşular, arkadaşlar, müşteriler', w: { levant: 2 } },
      { t: 'Haberler, kitaplar, resmî yazışmalar, akademik metinler', w: { msa: 2 } }
    ] },
    { q: 'Şu anki durumun?', o: [
      { t: 'Harfleri hiç bilmiyorum', w: { } , level: 'Sıfır' },
      { t: 'Harfleri okuyabiliyorum (Kur\'an okuyorum) ama anlamıyorum', w: { quran: 1 }, level: 'Okuma var, anlama yok' },
      { t: 'Birkaç kalıp ve kelime biliyorum', w: { }, level: 'Başlangıç' },
      { t: 'Basit cümleler kurabiliyorum', w: { }, level: 'Temel' }
    ] },
    { q: 'Haftada kaç saat ayırabilirsin?', o: [
      { t: '1–2 saat', w: { }, hours: 1.5 }, { t: '3–4 saat', w: { }, hours: 3.5 }, { t: '5–7 saat', w: { }, hours: 6 }, { t: '8 saat ve üzeri', w: { }, hours: 9 }
    ] },
    { q: 'Seni ne daha çok motive eder?', o: [
      { t: 'Bir ayeti kaynağından anladığım an', w: { quran: 1 } },
      { t: 'Bir müşteriyle onun dilinde anlaşmak', w: { gulf: 1, levant: 1 } },
      { t: 'Dizi ve şarkıları çevirisiz anlamak', w: { levant: 1 } },
      { t: 'Haberi veya makaleyi orijinalinden okumak', w: { msa: 1 } }
    ] },
    { q: 'Konuşma mı, anlama mı daha önemli?', o: [
      { t: 'Anlama (okuma, dinleme)', w: { quran: 1, msa: 1 } },
      { t: 'Konuşma (günlük iletişim)', w: { gulf: 1, levant: 1 } },
      { t: 'İkisi de — dengeli', w: { msa: 1 } }
    ] }
  ];
  function score(ans) {
    var s = { quran: 0, msa: 0, gulf: 0, levant: 0 }, meta = {};
    ans.forEach(function (ai, qi) { var o = Q[qi].o[ai]; if (!o) return; Object.keys(o.w).forEach(function (k) { s[k] += o.w[k]; }); if (o.level) meta.level = o.level; if (o.hours) meta.hours = o.hours; });
    var best = Object.keys(s).sort(function (a, b) { return s[b] - s[a]; })[0];
    var second = Object.keys(s).sort(function (a, b) { return s[b] - s[a]; })[1];
    return { path: PATHS[best], second: PATHS[second], scores: s, level: meta.level || 'Başlangıç', hours: meta.hours || 3.5 };
  }
  root.AHK_GOAL = { Q: Q, PATHS: PATHS, score: score };
  if (typeof document === 'undefined') return;

  var stage = document.getElementById('quiz'); if (!stage) return;
  var card = stage.querySelector('.q-card'), prog = stage.querySelector('.progress i'), counter = stage.querySelector('.q-counter');
  var btnBack = stage.querySelector('.q-back'), intro = document.getElementById('intro'), start = document.getElementById('start');
  var ans = [], cur = 0;
  function render() {
    var q = Q[cur]; counter.textContent = (cur + 1) + ' / ' + Q.length; prog.style.width = (cur / Q.length * 100) + '%';
    var html = '<p class="q-text">' + q.q + '</p><div class="options" role="radiogroup">';
    q.o.forEach(function (o, i) { html += '<button type="button" class="opt" role="radio" aria-checked="' + (ans[cur] === i) + '" data-i="' + i + '"><span class="key">' + 'ABCD'[i] + '</span><span>' + o.t + '</span></button>'; });
    card.className = 'q-card q-enter'; card.innerHTML = html + '</div>'; btnBack.disabled = cur === 0;
    card.querySelectorAll('.opt').forEach(function (b) { b.addEventListener('click', function () { ans[cur] = +b.getAttribute('data-i'); b.setAttribute('aria-checked', 'true'); setTimeout(function () { if (cur < Q.length - 1) { cur++; render(); } else finish(); }, 260); }); });
  }
  btnBack.addEventListener('click', function () { if (cur > 0) { cur--; render(); } });
  start.addEventListener('click', function () { intro.hidden = true; stage.hidden = false; render(); AHK.scrollTo(stage); AHK.track('goal_finder_start'); });
  function finish() {
    var r = score(ans), p = r.path; prog.style.width = '100%'; stage.hidden = true;
    var res = document.getElementById('result'); res.classList.add('show');
    res.querySelector('.r-emoji').textContent = p.emoji; res.querySelector('.r-title').textContent = p.title; res.querySelector('.r-ar').textContent = p.ar;
    res.querySelector('.r-head').textContent = p.head; res.querySelector('.r-desc').textContent = p.desc;
    res.querySelector('.r-level').textContent = r.level; res.querySelector('.r-hours').textContent = r.hours + ' saat/hafta'; res.querySelector('.r-dialect').textContent = p.dialect;
    res.querySelector('.r-first').textContent = p.first; res.querySelector('.r-second').textContent = r.second.title;
    var ul = res.querySelector('.plan ul'); ul.innerHTML = ''; p.plan.forEach(function (x) { ul.innerHTML += '<li>' + x + '</li>'; });
    var bars = res.querySelector('.skills'); bars.innerHTML = ''; var max = Math.max.apply(null, Object.keys(r.scores).map(function (k) { return r.scores[k]; })) || 1;
    Object.keys(PATHS).forEach(function (k) { bars.innerHTML += '<div class="skill"><span>' + PATHS[k].title.replace(' Yolu', '') + '</span><span>' + r.scores[k] + '</span><div class="bar"><i data-w="' + Math.round(r.scores[k] / max * 100) + '"></i></div></div>'; });
    var hidden = res.querySelector('input[name=result]'); if (hidden) hidden.value = 'Arabic path: ' + p.key + ' / ' + r.level + ' / ' + r.hours + 'h';
    var goalSel = res.querySelector('select[name=goal]'); if (goalSel) goalSel.value = p.key;
    AHK.scrollTo(res);
    setTimeout(function () { bars.querySelectorAll('.bar i').forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; }); AHK.confetti(); }, 350);
    var waBtn = res.querySelector('[data-wa-result]'); if (waBtn) { var href = AHK.waLink('Merhaba AHK Akademi, hedef bulucuda "' + p.title + '" çıktı. Arapça dersleri hakkında bilgi alabilir miyim?'); if (href) { waBtn.href = href; waBtn.hidden = false; } }
    var retry = res.querySelector('.retry'); if (retry) retry.addEventListener('click', function () { ans = []; cur = 0; res.classList.remove('show'); stage.hidden = false; render(); AHK.scrollTo(stage); });
    AHK.track('goal_finder_result', { path: p.key });
  }
})(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module.exports : this));
