/* İngilizce Seviye Testi — questions + logic. Also read at build time to pre-render. */
(function (root) {
  var LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
  // skill: g = grammar (dil bilgisi), v = vocabulary (kelime), u = usage (kullanım / bağlaçlar / kalıplar)
  var Q = [
    // ----- A1 -----
    { l: 'A1', s: 'g', q: 'I ___ a student.', o: ['am', 'is', 'are', 'be'], a: 0 },
    { l: 'A1', s: 'g', q: 'She ___ from İstanbul.', o: ['am', 'is', 'are', 'be'], a: 1 },
    { l: 'A1', s: 'g', q: '___ you like coffee?', o: ['Does', 'Is', 'Do', 'Are'], a: 2 },
    { l: 'A1', s: 'g', q: 'There are three ___ on the table.', o: ['book', 'books', 'a book', 'bookes'], a: 1 },
    { l: 'A1', s: 'g', q: 'My brother ___ in a bank.', o: ['work', 'working', 'is work', 'works'], a: 3 },
    // ----- A2 -----
    { l: 'A2', s: 'g', q: 'I ___ to London last year.', o: ['go', 'went', 'gone', 'was go'], a: 1 },
    { l: 'A2', s: 'g', q: 'She is ___ than her sister.', o: ['tall', 'more tall', 'taller', 'tallest'], a: 2 },
    { l: 'A2', s: 'g', q: 'We ___ dinner when the phone rang.', o: ['were having', 'had', 'have', 'are having'], a: 0 },
    { l: 'A2', s: 'v', q: 'Can you ___ me a favour?', o: ['make', 'do', 'give', 'take'], a: 1 },
    { l: 'A2', s: 'g', q: "I don't have ___ money.", o: ['many', 'a lot', 'few', 'much'], a: 3 },
    // ----- B1 -----
    { l: 'B1', s: 'g', q: 'If it rains tomorrow, we ___ at home.', o: ['stay', 'will stay', 'would stay', 'stayed'], a: 1 },
    { l: 'B1', s: 'g', q: "I've lived here ___ 2019.", o: ['for', 'from', 'since', 'during'], a: 2 },
    { l: 'B1', s: 'g', q: 'The report ___ by the manager yesterday.', o: ['wrote', 'is written', 'has written', 'was written'], a: 3 },
    { l: 'B1', s: 'g', q: 'She asked me where ___.', o: ['did I live', 'I lived', 'do I live', 'am I living'], a: 1 },
    { l: 'B1', s: 'v', q: "He's very ___; he always arrives on time.", o: ['relieved', 'reluctant', 'reliable', 'relative'], a: 2 },
    // ----- B2 -----
    { l: 'B2', s: 'g', q: 'I wish I ___ more time to travel.', o: ['have', 'had', 'would have', 'having'], a: 1 },
    { l: 'B2', s: 'g', q: 'By the time we arrived, the film ___.', o: ['already started', 'has already started', 'had already started', 'was already starting'], a: 2 },
    { l: 'B2', s: 'g', q: "He must ___ the keys at the office — they aren't here.", o: ['leave', 'had left', 'to leave', 'have left'], a: 3 },
    { l: 'B2', s: 'v', q: 'The meeting was ___ because the manager was ill.', o: ['called off', 'put up', 'taken in', 'turned over'], a: 0 },
    { l: 'B2', s: 'u', q: '___ the heavy traffic, we arrived on time.', o: ['Although', 'Despite', 'However', 'Even'], a: 1 },
    // ----- C1 -----
    { l: 'C1', s: 'g', q: 'Not until she left ___ how much he loved her.', o: ['he realised', 'he had realised', 'did he realise', 'realised he'], a: 2 },
    { l: 'C1', s: 'u', q: 'The proposal was rejected ___ grounds that it was too expensive.', o: ['in the', 'on the', 'at the', 'by the'], a: 1 },
    { l: 'C1', s: 'v', q: 'Her argument was so ___ that even her critics were persuaded.', o: ['cognate', 'conceited', 'concise', 'cogent'], a: 3 },
    { l: 'C1', s: 'g', q: '___ you change your mind, just let me know.', o: ['Would', 'Had', 'Should', 'If'], a: 2 },
    { l: 'C1', s: 'u', q: "It's high time we ___ a decision.", o: ['make', 'will make', 'made', 'making'], a: 2 }
  ];

  var RESULTS = {
    'Pre-A1': { title: 'Başlangıç (Pre-A1)', emoji: '🌱', head: 'Sıfırdan başlıyorsun; bu bir avantaj, çünkü yanlış alışkanlık da yok.', desc: 'Temel kelimeleri ve "to be" fiilini tanıyorsun ama cümle kurmak henüz zor. İlk hedefin: 2–3 ay içinde A1.', plan: ['Her gün 15 dakika: "to be", "have got" ve 100 temel kelime.', 'Kendini tanıtan 5 cümleyi sesli ezberle (I am…, I live in…, I work as…).', 'Haftada 1 konuşma dersi — ilk günden konuşmaya alışmak için.'], next: 'A1', hours: 100 },
    'A1': { title: 'A1 — Başlangıç', emoji: '🚀', head: 'Temeller yerinde. Şimdi basit cümleleri birleştirme zamanı.', desc: 'Kendini tanıtabiliyor, basit soruları anlıyorsun. Sıradaki büyük adım: geçmiş zaman ve günlük diyaloglar.', plan: ['Past simple + düzensiz fiiller (en sık 50 tanesi).', 'Günlük 10 dakika sesli okuma: telaffuz refleksi oluşur.', 'Her hafta 1 konuşma seansı: restoran, yol tarifi, alışveriş.'], next: 'A2', hours: 100 },
    'A2': { title: 'A2 — Temel', emoji: '⚡', head: 'Günlük hayatta idare ediyorsun. B1, "özgürlük seviyesi" ve çok yakın.', desc: 'Geçmiş zamanı ve karşılaştırmayı kullanabiliyorsun. B1 için gereken: koşul cümleleri, present perfect ve daha geniş kelime hazinesi.', plan: ['Present perfect vs past simple — Türklerin en çok karıştırdığı konu.', 'Günde 20 dakika: dizilerden kısa sahneleri gölgeleme (shadowing).', 'Haftada 2 konuşma dersi: düşüncelerini 1 dakika anlatma pratiği.'], next: 'B1', hours: 150 },
    'B1': { title: 'B1 — Orta', emoji: '🔥', head: 'Bağımsız kullanıcısın. B2 ile iş ve yurt dışı kapıları açılır.', desc: 'Seyahatte ve işte derdini anlatıyorsun. B2 için gereken: edilgen yapılar, dolaylı anlatım, phrasal verb\'ler ve akıcılık.', plan: ['Her gün 1 phrasal verb + 1 collocation, cümle içinde.', 'Haftada 2 kez 5 dakikalık "monolog" kaydı: kendini dinle, düzelt.', 'IELTS/TOEFL hedefin varsa şimdi başla: B1\'den 6.0–6.5 banda tipik yol 4–6 ay.'], next: 'B2', hours: 180 },
    'B2': { title: 'B2 — Üst Orta', emoji: '🏆', head: 'Akıcı ve kendinden eminsin. C1 seni "neredeyse ana dil gibi" yapar.', desc: 'Karmaşık metinleri anlıyor, tartışmaya katılıyorsun. C1 için gereken: inversion, ileri bağlaçlar, nüanslı kelime seçimi ve doğallık.', plan: ['Haftada 1 uzun makale (The Economist, BBC Future) + 10 yeni kelimeyi aktif kullan.', 'Konuşmada "very + sıfat" yerine güçlü sıfatlar (exhausted, furious, fascinating).', 'Hedef IELTS 7.0+ ise Writing Task 2 için haftada 2 deneme yazısı.'], next: 'C1', hours: 200 },
    'C1': { title: 'C1 — İleri', emoji: '👑', head: 'İleri seviyedesin. Artık mesele "doğru" değil, "etkileyici" konuşmak.', desc: 'Nüanslı yapıları ve ileri kelime hazinesini doğru kullandın. Bir sonraki adım: C2 incelikleri, akademik/profesyonel stil ve sunum becerisi.', plan: ['Bir konuda 3 dakikalık sunum hazırla, kaydet ve kalıpları çeşitlendir.', 'Deyimler ve ton: formal / informal geçişlerini bilinçli kullan.', 'IELTS 7.5–8.0 veya Cambridge C1 Advanced sınavı net bir hedef olabilir.'], next: 'C2', hours: 250 }
  };

  function score(answers) {
    var byLevel = {}, bySkill = { g: [0, 0], v: [0, 0], u: [0, 0] }, correct = 0;
    LEVELS.forEach(function (l) { byLevel[l] = [0, 0]; });
    Q.forEach(function (q, i) {
      var ok = answers[i] === q.a; byLevel[q.l][1]++; bySkill[q.s][1]++;
      if (ok) { byLevel[q.l][0]++; bySkill[q.s][0]++; correct++; }
    });
    // Level = consecutive bands "passed" from A1. A band passes with >=3/5, or with 2/5 when the next band has >=3/5.
    var level = 'Pre-A1', idx = -1;
    for (var i = 0; i < LEVELS.length; i++) {
      var c = byLevel[LEVELS[i]][0], nextC = i + 1 < LEVELS.length ? byLevel[LEVELS[i + 1]][0] : 0;
      if (c >= 3 || (c === 2 && nextC >= 3)) { level = LEVELS[i]; idx = i; } else break;
    }
    var plus = idx >= 0 && idx + 1 < LEVELS.length && byLevel[LEVELS[idx + 1]][0] === 2;
    return { level: level, idx: idx, plus: plus, correct: correct, total: Q.length, pct: correct / Q.length, byLevel: byLevel, bySkill: bySkill, info: RESULTS[level] };
  }

  root.AHK_LEVEL_TEST = { Q: Q, LEVELS: LEVELS, RESULTS: RESULTS, score: score };
  if (typeof document === 'undefined') return;

  /* ---------------- UI ---------------- */
  var i18n = (root.AHK_I18N && root.AHK_I18N.levelTest) || {};
  var T = function (k, fb) { return i18n[k] || fb; };
  var stage = document.getElementById('quiz'); if (!stage) return;
  var card = stage.querySelector('.q-card'), prog = stage.querySelector('.progress i'), counter = stage.querySelector('.q-counter'), lvlTag = stage.querySelector('.q-level');
  var btnNext = stage.querySelector('.q-next'), btnBack = stage.querySelector('.q-back'), start = document.getElementById('start'), intro = document.getElementById('intro');
  var answers = [], cur = 0, lock = false;
  var SKILL_NAMES = { g: T('skillG', 'Dil bilgisi'), v: T('skillV', 'Kelime'), u: T('skillU', 'Kullanım') };

  function render(dir) {
    var q = Q[cur];
    counter.textContent = (cur + 1) + ' / ' + Q.length;
    lvlTag.textContent = T('question', 'Soru') + ' ' + (cur + 1);
    prog.style.width = ((cur) / Q.length * 100) + '%';
    var html = '<p class="q-text">' + q.q.replace('___', '<span class="blank" aria-label="boşluk">___</span>') + '</p><div class="options" role="radiogroup" aria-label="' + T('options', 'Seçenekler') + '">';
    q.o.forEach(function (o, i) {
      html += '<button type="button" class="opt" role="radio" aria-checked="' + (answers[cur] === i) + '" data-i="' + i + '"><span class="key">' + 'ABCD'[i] + '</span><span>' + o + '</span></button>';
    });
    html += '</div>';
    card.className = 'q-card ' + (dir ? 'q-enter' : '');
    card.innerHTML = html;
    btnBack.disabled = cur === 0;
    btnNext.textContent = cur === Q.length - 1 ? T('finish', 'Sonucu gör') : T('next', 'Sonraki');
    btnNext.disabled = answers[cur] === undefined;
    card.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () {
        answers[cur] = +b.getAttribute('data-i');
        card.querySelectorAll('.opt').forEach(function (x) { x.setAttribute('aria-checked', 'false'); });
        b.setAttribute('aria-checked', 'true'); btnNext.disabled = false;
        // auto-advance for speed (keeps the Back button available)
        setTimeout(next, 260);
      });
    });
  }
  function next() {
    if (lock || answers[cur] === undefined) return;
    if (cur === Q.length - 1) { finish(); return; }
    lock = true; card.classList.add('q-leave');
    setTimeout(function () { cur++; lock = false; render(true); }, AHK.reduced ? 0 : 220);
  }
  function back() { if (cur === 0) return; cur--; render(true); }
  btnNext.addEventListener('click', next); btnBack.addEventListener('click', back);
  document.addEventListener('keydown', function (e) {
    if (stage.hidden) return; var k = e.key.toUpperCase(); var i = 'ABCD'.indexOf(k); if (i >= 0 && i < 4 && !e.ctrlKey && !e.metaKey) { var b = card.querySelector('.opt[data-i="' + i + '"]'); if (b) b.click(); }
  });
  if (start) start.addEventListener('click', function () {
    intro.hidden = true; stage.hidden = false; render(true); AHK.scrollTo(stage); AHK.track('level_test_start');
  });

  function finish() {
    var r = score(answers);
    prog.style.width = '100%';
    stage.hidden = true;
    var res = document.getElementById('result'); res.classList.add('show');
    var info = r.info, levelLabel = r.level + (r.plus ? '+' : '');
    res.querySelector('.r-level').textContent = levelLabel;
    res.querySelector('.r-title').textContent = info.emoji + ' ' + (T('lv_' + r.level, info.title));
    res.querySelector('.r-head').textContent = T('head_' + r.level, info.head);
    res.querySelector('.r-desc').textContent = T('desc_' + r.level, info.desc);
    res.querySelector('.r-score').textContent = r.correct + ' / ' + r.total;
    var scale = res.querySelector('.level-scale');
    scale.querySelectorAll('span').forEach(function (s, i) { s.className = i < r.idx ? 'past' : (i === r.idx ? 'on' : ''); });
    var skills = res.querySelector('.skills'); skills.innerHTML = '';
    var weakest = null;
    Object.keys(r.bySkill).forEach(function (k) {
      var v = r.bySkill[k], p = v[1] ? v[0] / v[1] : 0;
      if (!weakest || p < weakest.p) weakest = { k: k, p: p };
      skills.innerHTML += '<div class="skill"><span>' + SKILL_NAMES[k] + '</span><span>' + v[0] + '/' + v[1] + '</span><div class="bar"><i data-w="' + Math.round(p * 100) + '"></i></div></div>';
    });
    var plan = res.querySelector('.plan ul'); plan.innerHTML = '';
    (i18n['plan_' + r.level] || info.plan).forEach(function (p) { plan.innerHTML += '<li>' + p + '</li>'; });
    res.querySelector('.r-weak').textContent = SKILL_NAMES[weakest.k].toLowerCase();
    res.querySelector('.r-next').textContent = info.next;
    res.querySelector('.r-hours').textContent = info.hours;
    var hidden = res.querySelector('input[name=result]'); if (hidden) hidden.value = 'English ' + levelLabel + ' (' + r.correct + '/' + r.total + ')';
    AHK.scrollTo(res);
    setTimeout(function () {
      AHK.ring(res.querySelector('.ring'), r.pct);
      skills.querySelectorAll('.bar i').forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
      AHK.countUp(res.querySelector('.r-pct'), Math.round(r.pct * 100), { suffix: '%' });
      if (r.idx >= 1) AHK.confetti();
    }, 300);
    var shareBtn = res.querySelector('.share'); if (shareBtn) shareBtn.addEventListener('click', function () { AHK.share(document.title, T('shareText', 'İngilizce seviyem: ') + levelLabel + ' — ' + T('shareCta', 'sen de 8 dakikada öğren:'), location.href.split('#')[0]); });
    var waBtn = res.querySelector('[data-wa-result]'); if (waBtn) { var href = AHK.waLink(T('waText', 'Merhaba AHK Akademi, seviye testinde ') + levelLabel + T('waText2', ' çıktı. Ücretsiz deneme dersi hakkında bilgi alabilir miyim?')); if (href) { waBtn.href = href; waBtn.hidden = false; } }
    var retry = res.querySelector('.retry'); if (retry) retry.addEventListener('click', function () { answers = []; cur = 0; res.classList.remove('show'); stage.hidden = false; render(true); AHK.scrollTo(stage); });
    AHK.track('level_test_result', { level: levelLabel });
  }
})(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module.exports : this));
