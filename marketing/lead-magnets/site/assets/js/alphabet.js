/* Arapça Alfabe Eğitmeni — 28 letters, positional forms, Turkish names, examples. Also read at build time. */
(function (root) {
  // Positional forms are produced with the tatweel (ـ U+0640) so the browser's shaping engine renders
  // the real contextual glyph: initial = L+ـ, medial = ـ+L+ـ, final = ـ+L. Non-connecting letters
  // (ا د ذ ر ز و) only join from the right: no distinct initial/medial form (nc:true).
  var L = [
    { ar: 'ا', tr: 'Elif', name: 'أَلِف', lat: 'ā / ʾ', sound: 'Uzun "a" taşır; kelime başında hemze ile "a/e/i" sesi.', ex: 'أَب', exlat: 'ab', extr: 'baba', nc: true },
    { ar: 'ب', tr: 'Be', name: 'بَاء', lat: 'b', sound: 'Türkçedeki "b" ile aynı.', ex: 'بَاب', exlat: 'bāb', extr: 'kapı' },
    { ar: 'ت', tr: 'Te', name: 'تَاء', lat: 't', sound: 'Türkçedeki "t" ile aynı.', ex: 'تُفَّاح', exlat: 'tuffāḥ', extr: 'elma' },
    { ar: 'ث', tr: 'Se (peltek)', name: 'ثَاء', lat: 'th / ṯ', sound: 'Dil ucu dişler arasında; İngilizce "think"teki "th".', ex: 'ثَلاثَة', exlat: 'thalātha', extr: 'üç' },
    { ar: 'ج', tr: 'Cim', name: 'جِيم', lat: 'j / c', sound: 'Türkçedeki "c" sesi.', ex: 'جَمَل', exlat: 'jamal', extr: 'deve' },
    { ar: 'ح', tr: 'Ha', name: 'حَاء', lat: 'ḥ', sound: 'Boğazdan, nefesli ve sert "h"; Türkçede yok.', ex: 'حُبّ', exlat: 'ḥubb', extr: 'sevgi' },
    { ar: 'خ', tr: 'Hı', name: 'خَاء', lat: 'kh / ḫ', sound: 'Gırtlaktan hırıltılı "h" (Almanca "Bach").', ex: 'خُبْز', exlat: 'khubz', extr: 'ekmek' },
    { ar: 'د', tr: 'Dal', name: 'دَال', lat: 'd', sound: 'Türkçedeki "d" ile aynı.', ex: 'دَار', exlat: 'dār', extr: 'ev', nc: true },
    { ar: 'ذ', tr: 'Zel (peltek)', name: 'ذَال', lat: 'dh / ḏ', sound: 'Dil ucu dişler arasında; İngilizce "this"teki "th".', ex: 'ذَهَب', exlat: 'dhahab', extr: 'altın', nc: true },
    { ar: 'ر', tr: 'Ra', name: 'رَاء', lat: 'r', sound: 'Titrek "r"; Türkçedekinden biraz daha güçlü.', ex: 'رَجُل', exlat: 'rajul', extr: 'adam', nc: true },
    { ar: 'ز', tr: 'Ze', name: 'زَاي', lat: 'z', sound: 'Türkçedeki "z" ile aynı.', ex: 'زَيْت', exlat: 'zayt', extr: 'yağ', nc: true },
    { ar: 'س', tr: 'Sin', name: 'سِين', lat: 's', sound: 'Türkçedeki "s" ile aynı.', ex: 'سَلام', exlat: 'salām', extr: 'barış, selam' },
    { ar: 'ش', tr: 'Şın', name: 'شِين', lat: 'sh / ş', sound: 'Türkçedeki "ş" ile aynı.', ex: 'شَمْس', exlat: 'shams', extr: 'güneş' },
    { ar: 'ص', tr: 'Sad', name: 'صَاد', lat: 'ṣ', sound: 'Kalın, dolgun "s"; dilin arkası yükselir.', ex: 'صَبَاح', exlat: 'ṣabāḥ', extr: 'sabah' },
    { ar: 'ض', tr: 'Dad', name: 'ضَاد', lat: 'ḍ', sound: 'Kalın "d"; Arapçaya özgü, "Dad dili" denmesinin sebebi.', ex: 'ضَوْء', exlat: 'ḍawʾ', extr: 'ışık' },
    { ar: 'ط', tr: 'Tı', name: 'طَاء', lat: 'ṭ', sound: 'Kalın "t"; dil damağa yapışır.', ex: 'طَالِب', exlat: 'ṭālib', extr: 'öğrenci' },
    { ar: 'ظ', tr: 'Zı', name: 'ظَاء', lat: 'ẓ', sound: 'Kalın, peltek "z".', ex: 'ظُهْر', exlat: 'ẓuhr', extr: 'öğle' },
    { ar: 'ع', tr: 'Ayn', name: 'عَيْن', lat: 'ʿ', sound: 'Boğazın derininden sıkıştırılmış ses; en zor harf, sabırla.', ex: 'عَيْن', exlat: 'ʿayn', extr: 'göz' },
    { ar: 'غ', tr: 'Gayn', name: 'غَيْن', lat: 'gh / ğ', sound: 'Gargara gibi yumuşak "g"; Fransızca "r"ye yakın.', ex: 'غَرْب', exlat: 'gharb', extr: 'batı' },
    { ar: 'ف', tr: 'Fe', name: 'فَاء', lat: 'f', sound: 'Türkçedeki "f" ile aynı.', ex: 'فِيل', exlat: 'fīl', extr: 'fil' },
    { ar: 'ق', tr: 'Kaf', name: 'قَاف', lat: 'q', sound: 'Küçük dilden kalın "k"; "kalp"teki k\'ye yakın ama daha geriden.', ex: 'قَلْب', exlat: 'qalb', extr: 'kalp' },
    { ar: 'ك', tr: 'Kef', name: 'كَاف', lat: 'k', sound: 'Türkçedeki ince "k" (kedi).', ex: 'كِتَاب', exlat: 'kitāb', extr: 'kitap' },
    { ar: 'ل', tr: 'Lam', name: 'لَام', lat: 'l', sound: 'Türkçedeki "l" ile aynı.', ex: 'لَيْل', exlat: 'layl', extr: 'gece' },
    { ar: 'م', tr: 'Mim', name: 'مِيم', lat: 'm', sound: 'Türkçedeki "m" ile aynı.', ex: 'مَاء', exlat: 'māʾ', extr: 'su' },
    { ar: 'ن', tr: 'Nun', name: 'نُون', lat: 'n', sound: 'Türkçedeki "n" ile aynı.', ex: 'نُور', exlat: 'nūr', extr: 'ışık, nur' },
    { ar: 'ه', tr: 'He', name: 'هَاء', lat: 'h', sound: 'Yumuşak, nefesli "h" (hava).', ex: 'هِلَال', exlat: 'hilāl', extr: 'hilal' },
    { ar: 'و', tr: 'Vav', name: 'وَاو', lat: 'w / ū', sound: 'İngilizce "w"; uzun "u" sesini de taşır.', ex: 'وَرْد', exlat: 'ward', extr: 'gül', nc: true },
    { ar: 'ي', tr: 'Ye', name: 'يَاء', lat: 'y / ī', sound: 'Türkçedeki "y"; uzun "i" sesini de taşır.', ex: 'يَد', exlat: 'yad', extr: 'el' }
  ];
  var TATWEEL = 'ـ';
  function forms(x) {
    return { isolated: x.ar, initial: x.nc ? x.ar : x.ar + TATWEEL, medial: x.nc ? TATWEEL + x.ar : TATWEEL + x.ar + TATWEEL, final: TATWEEL + x.ar };
  }
  root.AHK_ALPHABET = { L: L, forms: forms };
  if (typeof document === 'undefined') return;

  /* ---------------- UI ---------------- */
  var grid = document.getElementById('letter-grid'), detail = document.getElementById('letter-detail');
  var current = 0;
  function showLetter(i, focus) {
    current = i; var x = L[i], f = forms(x);
    grid.querySelectorAll('.letter-tile').forEach(function (t, j) { t.classList.toggle('active', j === i); t.setAttribute('aria-pressed', String(j === i)); });
    detail.querySelector('.big').textContent = x.ar;
    detail.querySelector('h3').innerHTML = x.tr + ' <span lang="ar" class="ar" style="font-weight:400">' + x.name + '</span>';
    detail.querySelector('.lat').textContent = x.lat;
    detail.querySelector('.hint').textContent = x.sound;
    detail.querySelector('.f-iso').textContent = f.isolated; detail.querySelector('.f-ini').textContent = f.initial; detail.querySelector('.f-med').textContent = f.medial; detail.querySelector('.f-fin').textContent = f.final;
    detail.querySelector('.nc-note').hidden = !x.nc;
    detail.querySelector('.ex-ar').textContent = x.ex; detail.querySelector('.ex-lat').textContent = x.exlat; detail.querySelector('.ex-tr').textContent = x.extr;
    detail.querySelector('.pos').textContent = (i + 1) + ' / 28';
    detail.classList.remove('pop'); void detail.offsetWidth; detail.classList.add('pop');
    if (focus) AHK.scrollTo(detail);
  }
  if (grid) {
    grid.querySelectorAll('.letter-tile').forEach(function (t, i) { t.addEventListener('click', function () { showLetter(i, window.innerWidth < 760); }); });
    detail.querySelector('.prev').addEventListener('click', function () { showLetter((current + 27) % 28); });
    detail.querySelector('.next').addEventListener('click', function () { showLetter((current + 1) % 28); });
    showLetter(0);
  }

  /* ---------------- Tabs ---------------- */
  document.querySelectorAll('.tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.tabs .tab').forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('show'); });
      tab.setAttribute('aria-selected', 'true'); document.getElementById(tab.getAttribute('aria-controls')).classList.add('show');
    });
  });

  /* ---------------- Flashcards ---------------- */
  var flip = document.getElementById('flip'), fi = 0, order = L.map(function (_, i) { return i; });
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function renderFlip() {
    var x = L[order[fi]];
    flip.classList.remove('flipped');
    flip.querySelector('.g').textContent = x.ar;
    flip.querySelector('.flip-back b').textContent = x.tr;
    flip.querySelector('.flip-back .lat').textContent = x.lat;
    flip.querySelector('.flip-back .ex').textContent = x.ex + ' · ' + x.exlat + ' · ' + x.extr;
    document.getElementById('flip-count').textContent = (fi + 1) + ' / 28';
  }
  if (flip) {
    flip.addEventListener('click', function () { flip.classList.toggle('flipped'); });
    document.getElementById('flip-next').addEventListener('click', function () { fi = (fi + 1) % 28; renderFlip(); });
    document.getElementById('flip-prev').addEventListener('click', function () { fi = (fi + 27) % 28; renderFlip(); });
    document.getElementById('flip-shuffle').addEventListener('click', function () { shuffle(order); fi = 0; renderFlip(); AHK.toast('Kartlar karıştırıldı'); });
    renderFlip();
  }

  /* ---------------- Recognition quiz (10 questions) ---------------- */
  var quiz = document.getElementById('aquiz'); if (!quiz) return;
  var qs = [], qi = 0, correct = 0, result = document.getElementById('aresult');
  function buildQuiz() {
    qs = shuffle(L.map(function (_, i) { return i; })).slice(0, 10).map(function (i) {
      var opts = [i]; while (opts.length < 4) { var r = Math.floor(Math.random() * 28); if (opts.indexOf(r) < 0) opts.push(r); }
      var mode = Math.random() < .5 ? 'name' : 'form'; // name: show letter → pick Turkish name; form: show medial form → pick letter name
      return { i: i, opts: shuffle(opts), mode: mode };
    });
    qi = 0; correct = 0;
  }
  function renderQ() {
    var q = qs[qi], x = L[q.i], f = forms(x);
    quiz.querySelector('.progress i').style.width = (qi / qs.length * 100) + '%';
    quiz.querySelector('.q-counter').textContent = (qi + 1) + ' / ' + qs.length;
    var prompt = q.mode === 'name' ? 'Bu harfin adı ne?' : 'Kelime ortasında <span lang="ar" class="ar">' + f.medial + '</span> şeklinde yazılan harf hangisi?';
    var html = '<p class="q-text">' + prompt + '</p>' + (q.mode === 'name' ? '<p class="big" style="font-family:var(--font-ar);font-size:5rem;text-align:center;direction:rtl;margin:0 0 16px;line-height:1.1">' + x.ar + '</p>' : '') + '<div class="options">';
    q.opts.forEach(function (oi) { var y = L[oi]; html += '<button type="button" class="opt" data-i="' + oi + '"><span class="key" lang="ar" style="font-family:var(--font-ar);font-size:1.1rem">' + y.ar + '</span><span>' + y.tr + '</span></button>'; });
    quiz.querySelector('.q-card').innerHTML = html + '</div>';
    quiz.querySelector('.q-card').className = 'q-card q-enter';
    quiz.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () {
        if (quiz.dataset.lock) return; quiz.dataset.lock = '1';
        var ok = +b.getAttribute('data-i') === q.i; if (ok) correct++;
        b.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) { var c = quiz.querySelector('.opt[data-i="' + q.i + '"]'); if (c) c.classList.add('correct'); b.classList.add('shake'); }
        setTimeout(function () { delete quiz.dataset.lock; qi++; if (qi < qs.length) renderQ(); else finishQ(); }, ok ? 500 : 1100);
      });
    });
  }
  function finishQ() {
    quiz.hidden = true; result.classList.add('show');
    var pct = correct / qs.length;
    var level = pct >= .9 ? 'Harfleri tanıyorsun!' : pct >= .6 ? 'İyi yoldasın' : 'Yeni başlıyorsun';
    var tip = pct >= .9 ? 'Sırada harekeler (fetha, kesra, damme) ve harfleri birleştirerek kelime okuma var. Bu noktada Kur\'an okumak ya da MSA metinleri sökmek birkaç hafta alır.' : pct >= .6 ? 'Benzer harfleri (ب ت ث · ج ح خ · د ذ · ر ز · س ش · ص ض · ط ظ · ع غ) grup grup çalış: nokta sayısı ve yeri farkı yaratır.' : 'Günde 10 dakika kart çalışması yeterli: önce 7 harf, ertesi gün tekrar + 7 yeni. Bir haftada 28 harf.';
    result.querySelector('.r-score').textContent = correct + ' / ' + qs.length;
    result.querySelector('.r-title').textContent = level; result.querySelector('.r-desc').textContent = tip;
    var hidden = result.querySelector('input[name=result]'); if (hidden) hidden.value = 'Arabic alphabet quiz ' + correct + '/' + qs.length;
    AHK.scrollTo(result);
    setTimeout(function () { AHK.ring(result.querySelector('.ring'), pct); AHK.countUp(result.querySelector('.r-pct'), Math.round(pct * 100), { suffix: '%' }); if (pct >= .6) AHK.confetti(); }, 300);
    var waBtn = result.querySelector('[data-wa-result]'); if (waBtn) { var href = AHK.waLink('Merhaba AHK Akademi, Arapça alfabe testinde ' + correct + '/10 yaptım. Arapça dersleri hakkında bilgi alabilir miyim?'); if (href) { waBtn.href = href; waBtn.hidden = false; } }
    AHK.track('alphabet_quiz_result', { score: correct });
  }
  document.getElementById('astart').addEventListener('click', function () {
    buildQuiz(); document.getElementById('aintro').hidden = true; quiz.hidden = false; result.classList.remove('show'); renderQ(); AHK.scrollTo(quiz); AHK.track('alphabet_quiz_start');
  });
  var retry = result.querySelector('.retry'); if (retry) retry.addEventListener('click', function () { buildQuiz(); result.classList.remove('show'); quiz.hidden = false; renderQ(); AHK.scrollTo(quiz); });
})(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module.exports : this));
