/* ============================================================
   AHK Akademi — template runtime
   - loads content (window.TEMPLATE_DATA → ?data= → sample.json)
   - deterministic timeline: every CSS animation + JS effect is
     driven from one clock, so the renderer can step frame by frame
   - text auto-fit, rich text, brand chrome, seeded randomness
   ============================================================ */
(function () {
  'use strict';

  const qs = new URLSearchParams(location.search);
  const RENDER = qs.get('render') === '1';

  // ---------- tiny helpers ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // **bold**  ==highlight==  ~~strike~~  newline → <br>
  function rich(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/==(.+?)==/g, '<mark>$1</mark>')
      .replace(/~~(.+?)~~/g, '<span class="strike">$1</span>')
      .replace(/\n/g, '<br>');
  }

  // h('div.card.navy', {style:'...'}, ['text', el, ...])
  function h_(spec, attrs, children) { return h(spec, attrs, children); }
  function h(spec, attrs, children) {
    if (Array.isArray(attrs) || typeof attrs === 'string' || attrs instanceof Node) { children = attrs; attrs = {}; }
    const parts = spec.split(/(?=[.#])/);
    const el = document.createElement(parts[0] || 'div');
    parts.slice(1).forEach(p => p[0] === '.' ? el.classList.add(...p.slice(1).split(/\s+/).filter(Boolean)) : (el.id = p.slice(1)));
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }
    const kids = children == null ? [] : (Array.isArray(children) ? children : [children]);
    kids.forEach(c => { if (c == null || c === false) return; el.append(c instanceof Node ? c : document.createTextNode(String(c))); });
    return el;
  }

  // Deterministic PRNG (so confetti etc. is identical on every render)
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ---------- timeline helpers (all pure functions of t) ----------
  const ease = {
    linear: x => x,
    out: x => 1 - Math.pow(1 - x, 3),
    in: x => x * x * x,
    inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    back: x => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2),
  };
  // progress 0..1 of a segment starting at `start` lasting `dur`
  const seg = (t, start, dur, fn) => (fn || ease.out)(clamp((t - start) / (dur || 1e-6), 0, 1));
  const between = (t, a, b) => t >= a && t < b;

  function typewriter(el, text, t, start, cps) {
    const n = Math.floor(Math.max(0, t - start) * (cps || 22));
    const shown = text.slice(0, n);
    if (el.dataset.tw !== shown) { el.dataset.tw = shown; el.textContent = shown; }
    return n >= text.length;
  }
  function countNumber(t, start, dur, from, to, decimals) {
    const p = seg(t, start, dur, ease.out);
    const v = from + (to - from) * p;
    return v.toFixed(decimals || 0);
  }
  function countdown(t, start, n) { // returns n..1 then 0
    if (t < start) return n;
    return Math.max(0, Math.ceil(n - (t - start)));
  }

  // ---------- data-anim ----------
  const DUR = {
    'in-up': .55, 'in-down': .55, 'in-left': .55, 'in-right': .55, 'in-fade': .45, 'in-pop': .55,
    'in-zoom': .5, 'in-slam': .45, 'in-flip': .6, 'in-wipe': .6, 'in-grow': .6, 'in-spin': .6,
    'out-fade': .35, 'out-up': .4, 'out-down': .4, 'out-left': .4, 'out-pop': .35, 'out-zoom': .4,
    pulse: 1.2, float: 2.4, shake: .5, wiggle: 1.6, blink: 1, spin: 1, 'spin-slow': 12, drain: 3, flash: .25,
    bounce: .9, 'rise-x': .5, confetti: 2.6, 'star-burst': .7, 'star-wipe-in': .7, twinkle: 1.6, hold: 1,
    'ring-drain': 3, dim: .3, 'to-gold': .3, hl: .35, 'hl-dark': .35,
  };
  // fill mode: in-* needs a backwards fill (hidden before start); out-* and other "to"-only
  // keyframes only need forwards; loops/shakes must not override the element's state before they start
  const FILL = (name) => {
    if (name.startsWith('out-') || ['confetti', 'dim', 'to-gold', 'hl', 'hl-dark'].includes(name)) return 'forwards';
    if (['shake', 'wiggle', 'pulse', 'float', 'bounce', 'flash', 'blink', 'twinkle', 'spin', 'spin-slow'].includes(name)) return 'none';
    return 'both';
  };
  const LOOPS = new Set(['pulse', 'float', 'wiggle', 'blink', 'spin', 'spin-slow', 'twinkle', 'bounce']);
  const EASING = (name) => {
    if (name === 'drain' || name === 'spin' || name === 'spin-slow' || name === 'in-grow' || name === 'confetti') return 'linear';
    if (name.startsWith('out-')) return 'cubic-bezier(.5,0,.75,0)';
    if (name === 'in-pop' || name === 'in-slam' || name === 'in-spin') return 'cubic-bezier(.2,.8,.3,1)';
    if (name.startsWith('in-')) return 'cubic-bezier(.16,1,.3,1)';
    if (name === 'star-burst') return 'cubic-bezier(.4,0,.2,1)';
    return 'ease-in-out';
  };
  function applyAnim(root) {
    $$('[data-anim]', root).forEach(el => {
      const parts = el.dataset.anim.trim().split(/\s+/).filter(Boolean);
      const list = parts.map(p => {
        const m = p.match(/^([a-z-]+)(?:@([\d.]+))?(?:[:/]([\d.]+))?(?:[:/]([\d.]+|inf|infinite))?$/);
        if (!m) { console.warn('bad data-anim token', p); return null; }
        const name = m[1], delay = +(m[2] || 0), dur = +(m[3] || DUR[name] || .5);
        let count = m[4] ? (m[4].startsWith('inf') ? 'infinite' : +m[4]) : (LOOPS.has(name) ? 'infinite' : 1);
        return `${name} ${dur}s ${EASING(name)} ${delay}s ${count} normal ${FILL(name)}`;
      }).filter(Boolean);
      el.style.animation = list.join(', ');
    });
  }

  // ---------- language-aware uppercase ----------
  // Turkish needs i→İ and ı→I; English needs i→I. Pages are lang="en" so CSS text-transform would
  // break Turkish, therefore we uppercase in JS. Heuristic: Turkish letters or common Turkish words → 'tr'.
  const TR_WORDS = /(^|[^a-z])(ve|bu|bunu|hep|için|ile|mi|mı|mu|mü|günün|kelimesi|saniyelik|haftalık|günlük|boşluğu|doldur|hızlı|çeviri|öğrenci|başarısı|yorumu|plan|ders|hata|hatası|doğru|yanlış|kaydet|yorumla|örnek|cevap|türkçesi|gerçek|anlamı|kelime|çevirirsek|ne|görür|söylüyor|diyor|böyle|hangisi)(?=$|[^a-z])/i;
  function langOf(s) { return /[çğıİöşüÇĞÖŞÜ]/.test(s) || TR_WORDS.test(s) ? 'tr' : 'en'; }
  function upper(s, lang) { return String(s).toLocaleUpperCase(lang || langOf(s)); }
  function upperAll(root) {
    $$('.label, .chrome-tag, .spaced, .lbl, [data-upper]', root).forEach(el => {
      const lang = el.getAttribute('lang') || el.closest('[lang]')?.getAttribute('lang');
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n; while ((n = walker.nextNode())) { if (n.nodeValue.trim()) n.nodeValue = upper(n.nodeValue, lang && lang !== 'en' ? lang : (lang === 'en' ? 'en' : undefined)); }
    });
  }

  // ---------- auto-fit text ----------
  function fitAll(root) {
    $$('[data-fit]', root).forEach(el => {
      const min = +el.dataset.fit || 20;
      const cs = getComputedStyle(el);
      let size = parseFloat(cs.fontSize);
      // height is only checked against an explicit max-height (font ascent/descent would otherwise trip the check)
      const maxH = parseFloat(cs.maxHeight);
      const over = () => (isFinite(maxH) && el.scrollHeight > maxH + 2) || el.scrollWidth > el.clientWidth + 2;
      let guard = 60;
      while (over() && size > min && guard-- > 0) { size = Math.max(min, size - 2); el.style.fontSize = size + 'px'; }
    });
  }

  // ---------- auto-scale a content column that is taller than its box ----------
  // Phases of a reel stack vertically (hidden ones still take space). If the whole stack is taller than
  // the safe area, scale the column down (and widen it so text reflows) rather than overflow into the chrome.
  // .tail children of .content are anchored to the bottom of the safe area; the rest centres above them.
  function layoutTails(root) {
    $$('.content', root).forEach(c => {
      const tails = [...c.children].filter(k => k.classList.contains('tail'));
      if (!tails.length) return;
      let h = 0, when = Infinity;
      tails.forEach(t => {
        Object.assign(t.style, { position: 'absolute', left: '0', right: '0', bottom: '0', margin: '0' });
        h = Math.max(h, t.offsetHeight);
        $$('[data-anim]', t).forEach(el => el.dataset.anim.split(/\s+/).forEach(tok => { const m = tok.match(/^in-[a-z-]+@([\d.]+)/); if (m) when = Math.min(when, +m[1]); }));
      });
      c.style.paddingBottom = (h + 24) + 'px';
      // wrap the in-flow children so they can sit lower while the tail is hidden, then settle up as it appears
      const flow = h_('div.flow');
      [...c.children].filter(k => !k.classList.contains('tail')).forEach(k => flow.append(k));
      c.prepend(flow);
      if (isFinite(when) && META.format === 'reel') {
        const shift = Math.round((h + 24) / 2);
        if (!$('#tail-settle-kf')) document.head.append(h_('style#tail-settle-kf', `@keyframes tail-settle { from { transform: translateY(var(--tail-shift)); } to { transform: none; } }`));
        flow.style.setProperty('--tail-shift', shift + 'px');
        flow.style.animation = `tail-settle .7s cubic-bezier(.16,1,.3,1) ${Math.max(0, when - 0.4).toFixed(2)}s 1 normal both`;
      }
    });
  }
  function autoScale(root) {
    $$('.content', root).forEach(c => {
      const have = c.clientHeight, w0 = c.clientWidth;
      const pad = parseFloat(getComputedStyle(c).paddingBottom) || 0;
      const flow = () => Math.max(0, ...[...c.children].filter(k => !k.classList.contains('tail') && getComputedStyle(k).position !== 'absolute').map(k => k.offsetTop + k.offsetHeight));
      if (!have || flow() + pad <= have + 2) return;
      let s = 1;
      for (let i = 0; i < 4; i++) {
        const need = flow() + pad;
        if (need <= have / s + 2) break;
        s = Math.max(0.6, +((have / need) * s * 0.985).toFixed(3));
        c.style.width = Math.round(w0 / s) + 'px';
        c.style.right = 'auto';
        c.style.transformOrigin = '0 0';
        c.style.transform = `scale(${s})`;
        c.style.height = Math.round(have / s) + 'px';
        c.style.bottom = 'auto';
        fitAll(c);
      }
      c.dataset.autoscale = s;
    });
  }

  // ---------- brand chrome ----------
  function wordmark(dark) {
    return h('div.wordmark', [
      h('div.mark'),
      h('div.text', [h('div.ahk', 'AHK'), h('div.rule'), h('div.akademi', 'AKADEMI')]),
    ]);
  }
  function chrome(opts) {
    opts = opts || {};
    const stage = opts.stage || $('.stage');
    const dark = opts.dark !== undefined ? opts.dark : stage.classList.contains('on-dark');
    if (dark) stage.classList.add('on-dark');
    const top = h('div.chrome-top', [wordmark(dark)]);
    if (opts.tag) top.append(h('div.chrome-tag', opts.tag));
    const bottom = h('div.chrome-bottom', [h('span.handle', '@ahkacademy'), h('span.site', 'ahkademy.com')]);
    if (opts.anim) { top.dataset.anim = opts.anim; bottom.dataset.anim = opts.anim; }
    stage.append(top, bottom);
    return { top, bottom };
  }

  // Gold star confetti (deterministic)
  function confetti(container, opts) {
    opts = opts || {};
    const r = rng(opts.seed || 7);
    const n = opts.count || 28, start = opts.start || 0, colors = opts.colors || ['#F5A61F', '#FFFFFF', '#5B8FD8', '#E9A222'];
    for (let i = 0; i < n; i++) {
      const size = 18 + r() * 34;
      const el = h('div.star', { style: {
        position: 'absolute', left: (r() * 100) + '%', top: '-60px', width: size + 'px', height: size + 'px',
        background: colors[Math.floor(r() * colors.length)], opacity: 0,
      } });
      el.dataset.anim = `confetti@${(start + r() * 1.2).toFixed(2)}:${(2 + r() * 1.5).toFixed(2)}`;
      container.append(el);
    }
  }

  // ---------- clock ----------
  let META = { format: 'reel', duration: 10, slides: 1, preview: 1.5 };
  let onTimeFn = null, currentData = null;
  function setTime(t) {
    for (const a of document.getAnimations()) {
      try { a.pause(); a.currentTime = t * 1000; } catch (e) { /* ignore */ }
    }
    if (onTimeFn) onTimeFn(t, currentData);
    window.__t = t;
  }
  function setSlide(i) {
    $$('.slide').forEach((s, k) => s.classList.toggle('active', k === i));
    window.__slide = i;
  }

  // ---------- data loading ----------
  async function loadData() {
    if (window.TEMPLATE_DATA) return window.TEMPLATE_DATA;
    if (qs.get('data')) return JSON.parse(qs.get('data'));
    if (qs.get('data64')) return JSON.parse(decodeURIComponent(escape(atob(qs.get('data64')))));
    const res = await fetch('sample.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('sample.json not found (open via the local server, not file://)');
    return res.json();
  }

  // ---------- main entry ----------
  async function template(def) {
    META = Object.assign(META, { format: def.format || 'reel', duration: def.duration || 10, preview: def.preview != null ? def.preview : 1.5 });
    document.body.classList.add(META.format === 'reel' ? 'reel' : 'post');
    try {
      const data = await loadData();
      currentData = data;
      const stage = $('.stage');
      def.build(data, stage);
      META.slides = $$('.slide').length || 1;
      // make sure the brand fonts are really loaded before measuring text
      await Promise.all([
        document.fonts.load('900 40px Unbounded'), document.fonts.load('700 40px Unbounded'), document.fonts.load('500 40px Unbounded'),
        document.fonts.load('400 40px Inter'), document.fonts.load('700 40px Inter'), document.fonts.load('800 40px Inter'),
        document.fonts.load('700 40px Caveat'),
      ]);
      await document.fonts.ready;
      if (META.slides > 1) $$('.slide').forEach(s => s.classList.add('active'));
      upperAll(stage);
      fitAll(stage);
      if (def.afterFit) def.afterFit(data, stage);
      layoutTails(stage);
      autoScale(stage);
      applyAnim(stage);
      onTimeFn = def.onTime || null;
      if (META.format === 'reel') setTime(0); else setSlide(+(qs.get('slide') || 0));
      window.__meta = META;
      window.__setTime = setTime;
      window.__setSlide = setSlide;
      window.__ready = true;
      if (!RENDER) live();
    } catch (err) {
      console.error(err);
      document.body.innerHTML = `<pre style="color:#fff;padding:40px;font:28px monospace;white-space:pre-wrap">${esc(err.stack || err)}</pre>`;
      window.__error = String(err);
    }
  }

  // live preview loop (browser / gallery)
  function live() {
    if (META.format === 'reel') {
      if (qs.get('t')) { setTime(+qs.get('t')); return; }
      const t0 = performance.now();
      const tick = () => { setTime(((performance.now() - t0) / 1000) % META.duration); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    } else if (META.slides > 1 && !qs.has('slide')) {
      let i = 0;
      setInterval(() => { i = (i + 1) % META.slides; setSlide(i); }, 2600);
    }
  }

  window.AHK = { template, chrome, upper, langOf, confetti, h, $, $$, rich, esc, rng, ease, seg, between, typewriter, countNumber, countdown, clamp, fitAll, applyAnim };
})();
