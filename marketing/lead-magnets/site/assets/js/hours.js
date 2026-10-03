/* İngilizce Kaç Ayda Öğrenilir? — Cambridge guided learning hours (cumulative) × weekly hours. */
(function (root) {
  // Cumulative guided learning hours to REACH a level from zero. A2–C2: Cambridge English (support article 202838506).
  // A1 is a widely used estimate (not an official Cambridge figure). We use the midpoint of each published range.
  var GLH = { 'A0': 0, 'A1': 95, 'A2': 190, 'B1': 375, 'B2': 550, 'C1': 750, 'C2': 1100 };
  var ORDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  var LABEL = { 'A0': 'Sıfır', 'A1': 'A1', 'A2': 'A2', 'B1': 'B1', 'B2': 'B2', 'C1': 'C1', 'C2': 'C2' };
  function estimate(from, to, weeklyHours, intensity) {
    var hours = Math.max(0, GLH[to] - GLH[from]);
    // intensity: 1 = guided lessons only, .8 = lessons + daily self-study (self-study counts ~80 % per hour), 1.25 = irregular/self-study only
    var effective = hours * intensity;
    var weeks = weeklyHours > 0 ? effective / weeklyHours : Infinity;
    return { hours: hours, weeks: weeks, months: weeks / 4.345 };
  }
  root.AHK_HOURS = { GLH: GLH, ORDER: ORDER, estimate: estimate };
  if (typeof document === 'undefined') return;

  var from = 'A0', to = 'B2', weekly = document.getElementById('weekly'), intensity = 1;
  var el = function (id) { return document.getElementById(id); };
  function setSeg(group, val) { document.querySelectorAll('[data-group="' + group + '"] button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === String(val))); }); }
  function update() {
    if (ORDER.indexOf(to) <= ORDER.indexOf(from)) { to = ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(from) + 1)]; setSeg('to', to); }
    var r = estimate(from, to, +weekly.value, intensity);
    el('weekly-out').textContent = weekly.value + ' saat';
    AHK.countUp(el('months'), Math.max(1, Math.round(r.months)), { duration: 600 });
    el('hours').textContent = r.hours.toLocaleString('tr-TR');
    el('weeks').textContent = Math.max(1, Math.round(r.weeks));
    var d = new Date(); d.setMonth(d.getMonth() + Math.max(1, Math.round(r.months)));
    el('date').textContent = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    el('from-lbl').textContent = LABEL[from]; el('to-lbl').textContent = LABEL[to];
    var faster = estimate(from, to, Math.min(20, +weekly.value + 3), intensity);
    el('faster').textContent = Math.max(1, Math.round(faster.months));
    el('faster-weekly').textContent = Math.min(20, +weekly.value + 3);
    var tip = el('tip');
    tip.textContent = +weekly.value <= 2 ? 'Haftada 2 saatle ilerleme yavaş ama mümkün. Düzen, süreden önemlidir: aynı gün, aynı saat.'
      : +weekly.value <= 5 ? 'Haftada 3–5 saat çalışan öğrenciler için en verimli kombinasyon: 1–2 canlı ders + günde 20 dakika tekrar.'
      : +weekly.value <= 10 ? 'Yoğun tempo. Haftada 2 canlı ders + günlük dinleme/konuşma pratiğiyle tahmini süreyi yakalaman gerçekçi.'
      : 'Sınav veya yurt dışı tarihi yaklaşan biri gibi çalışıyorsun. Bu tempoda yorulmamak için haftada 1 dinlenme günü şart.';
    var hidden = document.querySelector('input[name=result]'); if (hidden) hidden.value = from + '→' + to + ' @' + weekly.value + 'h/wk ≈ ' + Math.round(r.months) + ' ay';
  }
  document.querySelectorAll('[data-group] button').forEach(function (b) {
    b.addEventListener('click', function () {
      var g = b.closest('[data-group]').getAttribute('data-group'), v = b.getAttribute('data-v');
      if (g === 'from') from = v; else if (g === 'to') to = v; else intensity = +v;
      setSeg(g, v); update();
    });
  });
  weekly.addEventListener('input', update);
  setSeg('from', from); setSeg('to', to); setSeg('int', intensity); update();
})(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module.exports : this));
