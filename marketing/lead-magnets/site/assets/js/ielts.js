/* IELTS Puan Hesaplama — raw score → band tables (IDP/British Council published approximations) + official overall rounding. */
(function (root) {
  // [minCorrect, band] descending. Source: IDP "band score calculation" pages; thresholds vary slightly between test versions.
  var LISTENING = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];
  var READING_AC = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];
  var READING_GT = [[40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6], [27, 5.5], [23, 5], [19, 4.5], [15, 4], [12, 3.5], [9, 3], [6, 2.5]];
  function band(table, raw) { for (var i = 0; i < table.length; i++) if (raw >= table[i][0]) return table[i][1]; return raw > 0 ? 2 : 0; }
  // Official rule: mean of four, rounded to nearest .5; .25 → next half band, .75 → next whole band.
  function overall(l, r, w, s) {
    var m = (l + r + w + s) / 4, base = Math.floor(m), frac = m - base;
    if (frac < .25) return base; if (frac < .75) return base + .5; return base + 1;
  }
  root.AHK_IELTS = { LISTENING: LISTENING, READING_AC: READING_AC, READING_GT: READING_GT, band: band, overall: overall };
  if (typeof document === 'undefined') return;

  var el = function (id) { return document.getElementById(id); };
  var mode = 'ac';
  var lRaw = el('l-raw'), rRaw = el('r-raw'), wB = el('w-band'), sB = el('s-band'), target = el('target');
  function fmt(b) { return b.toFixed(1).replace('.0', '.0'); }
  function update() {
    var l = band(LISTENING, +lRaw.value), r = band(mode === 'ac' ? READING_AC : READING_GT, +rRaw.value), w = +wB.value, s = +sB.value;
    var o = overall(l, r, w, s);
    el('l-out').textContent = lRaw.value + ' doğru'; el('r-out').textContent = rRaw.value + ' doğru';
    el('l-band').textContent = fmt(l); el('r-band').textContent = fmt(r); el('w-out').textContent = fmt(w); el('s-out').textContent = fmt(s);
    var big = el('overall'); if (big.textContent !== fmt(o)) { big.textContent = fmt(o); big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); }
    var mean = (l + r + w + s) / 4; el('mean').textContent = mean.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
    var t = +target.value, gap = el('gap');
    if (o >= t) { gap.innerHTML = '🎯 Hedefini tutturuyorsun. Şimdi tutarlılık zamanı: her bölümde aynı sonucu 3 deneme üst üste alabiliyor musun?'; }
    else {
      // what minimal improvement reaches target? try raising the weakest component(s)
      var comps = [{ k: 'Listening', v: l }, { k: 'Reading', v: r }, { k: 'Writing', v: w }, { k: 'Speaking', v: s }].sort(function (a, b) { return a.v - b.v; });
      var need = (t - .25) * 4 - (l + r + w + s); // minimal sum needed (mean >= t-0.25 rounds up to t)
      need = Math.ceil(need * 2) / 2;
      gap.innerHTML = 'Hedef <b>' + fmt(t) + '</b> için ortalamanı <b>' + Math.max(.5, need).toFixed(1) + ' band</b> (toplamda) yükseltmen gerekiyor. En zayıf alanın <b>' + comps[0].k + ' (' + fmt(comps[0].v) + ')</b> — en hızlı kazanç genellikle orada. ' + (comps[0].k === 'Writing' ? 'Writing için: Task 2 yapı + bağlaçlar + kelime çeşitliliği.' : comps[0].k === 'Speaking' ? 'Speaking için: Part 2 planı + "düşünme kalıpları" + uzatma teknikleri.' : comps[0].k === 'Reading' ? 'Reading için: paragraf başlığı eşleştirme ve zaman yönetimi (20 dk/pasaj).' : 'Listening için: soruyu önceden okuma, yazım hataları ve çoğul/tekil tuzakları.');
    }
    var hidden = document.querySelector('input[name=result]'); if (hidden) hidden.value = 'IELTS est. L' + fmt(l) + ' R' + fmt(r) + ' W' + fmt(w) + ' S' + fmt(s) + ' = ' + fmt(o) + ' (target ' + fmt(t) + ')';
  }
  ['input', 'change'].forEach(function (ev) { [lRaw, rRaw, wB, sB, target].forEach(function (x) { x.addEventListener(ev, update); }); });
  document.querySelectorAll('.seg button').forEach(function (b) { b.addEventListener('click', function () { document.querySelectorAll('.seg button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); mode = b.getAttribute('data-mode'); el('r-label').textContent = mode === 'ac' ? 'Reading (Academic) doğru sayısı' : 'Reading (General Training) doğru sayısı'; update(); }); });
  update();
})(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module.exports : this));
