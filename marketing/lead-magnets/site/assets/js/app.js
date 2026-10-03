/* AHK Akademi — shared behaviour for all lead-magnet pages (no dependencies) */
(function () {
  'use strict';
  var CFG = window.AHK_CONFIG || {};
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Mobile nav ---------- */
  var toggle = $('.nav-toggle'), menu = $('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- WhatsApp + trial links ---------- */
  function waLink(text) {
    if (!CFG.whatsappNumber) return '';
    return 'https://wa.me/' + CFG.whatsappNumber + '?text=' + encodeURIComponent(text || 'Merhaba AHK Akademi, ücretsiz deneme dersi hakkında bilgi almak istiyorum.');
  }
  $$('[data-wa]').forEach(function (a) {
    var href = waLink(a.getAttribute('data-wa'));
    if (href) { a.href = href; a.removeAttribute('hidden'); } else { a.setAttribute('hidden', ''); }
  });
  $$('[data-trial]').forEach(function (a) { if (CFG.trialUrl) a.href = CFG.trialUrl; });

  /* ---------- Helpers exposed to page scripts ---------- */
  function countUp(el, to, opts) {
    opts = opts || {};
    var dur = reduced ? 0 : (opts.duration || 1200), start = null, from = 0, dec = opts.decimals || 0, suffix = opts.suffix || '';
    if (!dur) { el.textContent = to.toFixed(dec) + suffix; return; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur); p = 1 - Math.pow(1 - p, 3);
      el.textContent = (from + (to - from) * p).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function ring(el, pct) {
    var fill = el.querySelector('.fill'); if (!fill) return;
    var c = 502; // 2πr with r=80
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.strokeDashoffset = String(c - c * Math.max(0, Math.min(1, pct))); }); });
  }
  function confetti() {
    if (reduced) return;
    var cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight;
    var colors = ['#F5A61F', '#FFC14F', '#1F5FAE', '#5B8FD8', '#FFFFFF'];
    var parts = []; for (var i = 0; i < 140; i++) parts.push({ x: W / 2 + (Math.random() - .5) * 200, y: H * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 6, c: colors[i % colors.length], r: Math.random() * 6.28, vr: (Math.random() - .5) * .3, a: 1 });
    var t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, W, H);
      var alive = false;
      parts.forEach(function (p) {
        p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= .99;
        if (t - t0 > 1400) p.a -= .03;
        if (p.a <= 0 || p.y > H + 20) return; alive = true;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.a); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); ctx.restore();
      });
      if (alive && t - t0 < 3500) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }
  function toast(msg) {
    var t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function scrollTo(el) { if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }
  function share(title, text, url) {
    if (navigator.share) { navigator.share({ title: title, text: text, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(function () { toast('Bağlantı kopyalandı'); });
  }

  /* ---------- Lead form ---------- */
  function initLeadForm(form) {
    var msg = $('.form-msg', form), unlock = $('.unlock', form.parentNode) || $('.unlock');
    var resultInput = $('[name=result]', form);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = true;
      $$('.field', form).forEach(function (f) { f.classList.remove('invalid'); });
      var name = $('[name=name]', form), email = $('[name=email]', form), phone = $('[name=phone]', form), kvkk = $('[name=kvkk]', form);
      if (name && name.value.trim().length < 2) { name.closest('.field').classList.add('invalid'); ok = false; }
      var emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      var phoneDigits = phone ? phone.value.replace(/\D/g, '') : '';
      var phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 15;
      if (email && phone) {
        // at least one channel required
        if (!emailOk && !phoneOk) { email.closest('.field').classList.add('invalid'); phone.closest('.field').classList.add('invalid'); ok = false; }
        else { if (email.value.trim() && !emailOk) { email.closest('.field').classList.add('invalid'); ok = false; } if (phone.value.trim() && !phoneOk) { phone.closest('.field').classList.add('invalid'); ok = false; } }
      }
      var kv = kvkk ? kvkk.closest('.check') : null;
      if (kvkk && !kvkk.checked) { if (kv) kv.classList.add('invalid'); ok = false; } else if (kv) kv.classList.remove('invalid');
      if (!ok) { form.classList.add('shake'); setTimeout(function () { form.classList.remove('shake'); }, 500); msg.className = 'form-msg err'; msg.textContent = 'Lütfen işaretli alanları kontrol et (e-posta veya WhatsApp numarasından en az biri ve KVKK onayı gerekli).'; var first = $('.invalid', form); if (first) (first.querySelector('input') || first).focus(); return; }

      var payload = {
        source: 'lead-magnet', page: location.pathname, magnet: form.getAttribute('data-magnet') || '',
        name: name ? name.value.trim() : '', email: email ? email.value.trim() : '', phone: phoneDigits ? ('+' + phoneDigits.replace(/^0+/, '').replace(/^(5\d{9})$/, '90$1')) : '',
        language: ($('[name=language]', form) || {}).value || '', goal: ($('[name=goal]', form) || {}).value || '',
        result: resultInput ? resultInput.value : '',
        consents: { kvkk: !!(kvkk && kvkk.checked), marketing: !!($('[name=marketing]', form) && $('[name=marketing]', form).checked), consentText: $('[name=kvkk]', form) ? $('[name=kvkk]', form).closest('.check').textContent.trim().slice(0, 300) : '', at: new Date().toISOString(), userAgent: navigator.userAgent },
        url: location.href, referrer: document.referrer
      };
      var btn = $('button[type=submit]', form); btn.disabled = true; var old = btn.textContent; btn.textContent = 'Gönderiliyor…';
      var done = function (okSend, offline) {
        btn.disabled = false; btn.textContent = old;
        if (okSend) {
          msg.className = 'form-msg ok';
          msg.textContent = offline ? 'Kaydın alındı (çevrimdışı demo modu: form henüz bir sunucuya bağlanmadı, bilgiler yalnızca bu tarayıcıda saklandı).' : 'Teşekkürler! Kaydın alındı. Ekstra kaynakların aşağıda açıldı.';
          if (unlock) { unlock.classList.add('show'); }
          form.dispatchEvent(new CustomEvent('ahk:lead', { detail: payload }));
          confetti();
          try { localStorage.setItem('ahk_lead_done', '1'); } catch (e) {}
        } else { msg.className = 'form-msg err'; msg.textContent = 'Gönderim başarısız oldu. Lütfen tekrar dene veya bize WhatsApp’tan yaz.'; }
      };
      if (!CFG.leadEndpoint) {
        try { var arr = JSON.parse(localStorage.getItem('ahk_leads') || '[]'); arr.push(payload); localStorage.setItem('ahk_leads', JSON.stringify(arr)); } catch (e) {}
        setTimeout(function () { done(true, true); }, 500);
        return;
      }
      var headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      Object.keys(CFG.leadHeaders || {}).forEach(function (k) { headers[k] = CFG.leadHeaders[k]; });
      fetch(CFG.leadEndpoint, { method: 'POST', headers: headers, body: JSON.stringify(payload) })
        .then(function (r) { done(r.ok, false); })
        .catch(function () { done(false, false); });
    });
  }
  $$('form.lead-form').forEach(initLeadForm);

  /* ---------- Optional analytics (only when configured) ---------- */
  if (CFG.ga4Id) {
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CFG.ga4Id; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', CFG.ga4Id, { anonymize_ip: true });
  }

  window.AHK = { countUp: countUp, ring: ring, confetti: confetti, toast: toast, scrollTo: scrollTo, share: share, waLink: waLink, reduced: reduced, cfg: CFG,
    track: function (name, params) { if (window.gtag) gtag('event', name, params || {}); } };
})();
