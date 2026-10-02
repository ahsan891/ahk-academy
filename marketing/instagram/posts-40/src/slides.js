/* AHK Akademi posts-40 — slide engine.
   Renders one slide of one post from posts.json into #stage.
   URL: index.html?post=01&slide=1   (slide is 1-based)
   Exposes window.__ready / window.__error / window.__meta for the renderer + layout check. */
(function () {
  'use strict';
  const qs = new URLSearchParams(location.search);
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // inline markup: **bold** ==gold/blue== ~~strike~~ __highlight__ //serif-italic// ^^ok^^ !!bad!! \n
  function rich(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/==(.+?)==/g, '<mark>$1</mark>')
      .replace(/~~(.+?)~~/g, '<span class="strike">$1</span>')
      .replace(/%%(.+?)%%/g, '<u class="hl">$1</u>')
      .replace(/\/\/(.+?)\/\//g, '<span class="serif">$1</span>')
      .replace(/\^\^(.+?)\^\^/g, '<span class="ok">$1</span>')
      .replace(/!!(.+?)!!/g, '<span class="bad">$1</span>')
      .replace(/:([a-z0-9_+-]+):/g, (m, k) => EMOJI[k] ? `<span class="emoji">${EMOJI[k]}</span>` : m)
      .replace(/\n/g, '<br>');
  }
  const EMOJI = { save: '🔖', share: '↗', fire: '🔥', point: '👇', eyes: '👀', brain: '🧠', check: '✅', x: '❌', star: '⭐', think: '🤔', cry: '😭', cool: '😎', melt: '🫠', sweat: '😅', skull: '💀', clap: '👏', pen: '✍️', ear: '👂', mouth: '🗣️', book: '📚', rocket: '🚀', heart: '❤️', wave: '👋', tea: '🫖', uk: '🇬🇧', us: '🇺🇸', tr: '🇹🇷', clock: '⏰', bulb: '💡', mic: '🎤', note: '📝', bell: '🔔', zap: '⚡', sun: '☀️', moon: '🌙', coffee: '☕', tv: '📺', headphones: '🎧', mail: '📧', briefcase: '💼', trophy: '🏆', muscle: '💪', sparkles: '✨', shush: '🤫', grin: '😁', wink: '😉', shrug: '🤷', warning: '⚠️', timer: '⏱️', phone: '📱', ghost: '👻', neutral: '😐', smile: '🙂', party: '🥳', face_mask: '😷', rain: '🌧️', cat: '🐈', dog: '🐕', leg: '🦵', theatre: '🎭', pizza: '🍕', cake: '🍰', pasta: '🍝', shirt: '👕', factory: '🏭', school: '🏫', news: '📰', chef: '👨‍🍳', suit: '🤵', home: '🏠', hand: '🤝', hourglass: '⏳' };

  function h(spec, attrs, children) {
    if (Array.isArray(attrs) || typeof attrs === 'string' || attrs instanceof Node) { children = attrs; attrs = {}; }
    const parts = spec.split(/(?=[.#])/);
    if (!parts[0] || /^[.#]/.test(parts[0])) parts.unshift('div');
    const el = document.createElement(parts[0]);
    parts.slice(1).forEach(p => p[0] === '.' ? el.classList.add(...p.slice(1).split(/\s+/).filter(Boolean)) : (el.id = p.slice(1)));
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }
    const kids = children == null ? [] : (Array.isArray(children) ? children : [children]);
    kids.forEach(c => { if (c == null || c === false) return; el.append(c instanceof Node ? c : document.createTextNode(String(c))); });
    return el;
  }
  const R = (spec, s, attrs) => { const el = h(spec, attrs || {}); if (/\.why\b|\.kicker\b/.test(spec)) el.append(h('span', { html: rich(s) })); else el.innerHTML = rich(s); return el; };
  const svgEl = (html, attrs) => { const w = document.createElement('div'); w.innerHTML = html; const s = w.firstElementChild; for (const [k, v] of Object.entries(attrs || {})) s.setAttribute(k, v); return s; };

  const STAR = 'M50 0 L59 36 L93 25 L68 50 L93 75 L59 64 L50 100 L41 64 L7 75 L32 50 L7 25 L41 36 Z';
  const star = (size, color, extra) => svgEl(`<svg class="deco" viewBox="0 0 100 100" width="${size}" height="${size}" style="${extra || ''}"><path d="${STAR}" fill="${color}"/></svg>`);

  // ---------- chrome ----------
  function wordmark() {
    return h('.wordmark', [h('.mark'), h('.text', [h('.ahk', { text: 'AHK' }), h('.rule'), h('.akademi', { text: 'AKADEMI' })])]);
  }
  function chrome(post, i, n, slide) {
    const right = slide.tag ? h('.counter', [h('.pill', { text: slide.tag })])
      : n > 1 ? h('.counter', [h('span', { text: String(i + 1).padStart(2, '0') }), h('span.dim', { text: '/' }), h('span.dim', { text: String(n).padStart(2, '0') })])
      : h('.counter', [h('.pill', { text: post.tag || 'AHK' })]);
    const top = h('.chrome-top', [wordmark(), right]);
    const mid = n > 1 && i < n - 1 ? h('.swipe', [h('span', { text: 'KAYDIR' }), h('i')]) : h('span', { text: post.id === '00' ? '' : '' });
    const bottom = h('.chrome-bottom', [h('span', { text: '@ahkacademy' }), mid, h('span', { text: 'ahkademy.com' })]);
    return [top, bottom];
  }

  const isDark = theme => theme === 'navy' || theme === 'blue';

  // ---------- slide renderers ----------
  const T = {};

  // Big editorial cover: kicker · title · sub · swipe pill; optional ghost word / giant number / serif lead
  T.cover = s => {
    const c = h('.content', { class: 'content ' + (s.align || 'bottom') });
    if (s.kicker) c.append(R('.kicker.pill' + (s.kickerStyle ? '.' + s.kickerStyle : ''), s.kicker));
    if (s.lead) c.append(R(s.leadStyle === 'ipa' ? '.ipa' : '.lead', s.lead, s.leadStyle === 'ipa' ? { style: { fontSize: '48px', color: 'var(--gold)', opacity: 1 } } : {}));
    if (s.number) c.append(h('.idx.solid', { text: s.number, style: { fontSize: (s.numberSize || 300) + 'px', lineHeight: '.85' } }));
    c.append(R('.title.' + (s.size || 'lg'), s.title));
    if (s.sub) c.append(R('.sub', s.sub));
    if (s.hand) c.append(R('.hand', s.hand));
    if (s.pill) c.append(h('.cta-row', [R('.cta' + (isDark(s.theme) ? '' : '.navy'), s.pill)]));
    const deco = [];
    if (s.ghost) deco.push(h('.ghost-text', { text: s.ghost, style: { fontSize: (s.ghostSize || 260) + 'px', right: '-14px', top: s.ghostTop || '150px', whiteSpace: 'nowrap' } }));
    if (s.star !== false && !s.ghost) deco.push(star(s.starSize || 420, isDark(s.theme) ? 'rgba(245,166,31,.14)' : (s.theme === 'gold' ? 'rgba(255,255,255,.28)' : 'rgba(245,166,31,.22)'), `position:absolute;right:-110px;top:${s.starTop || '150px'};`));
    if (s.dots !== false && isDark(s.theme)) deco.push(h('.deco.dots'));
    if (s.grid) deco.push(h('.deco.grid'));
    return [...deco, c];
  };

  // Cover with a giant struck-through English sentence (“you've been saying this wrong”)
  T.coverStrike = s => {
    const c = h('.content.bottom');
    if (s.kicker) c.append(R('.kicker.pill', s.kicker));
    c.append(h('.card.wrong', { style: { padding: '34px 44px', alignSelf: 'flex-start' } }, [R('.title.md.strike', s.wrong, { style: { color: '#4B587A', textDecorationThickness: '6px' } })]));
    c.append(R('.title.' + (s.size || 'lg'), s.title));
    if (s.sub) c.append(R('.sub', s.sub));
    if (s.pill) c.append(h('.cta-row', [R('.cta', s.pill)]));
    return [h('.deco.dots'), star(360, 'rgba(245,166,31,.14)', 'position:absolute;right:-90px;top:160px;'), c];
  };

  // Two-tone cover: navy top with title, gold bottom with an English sample / promise
  T.coverSplit = s => {
    const top = h('.top.t-navy.dark', { style: { position: 'absolute', left: 0, right: 0, top: 0, height: '62%' } });
    const bottom = h('.bottom.t-gold', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', color: 'var(--navy)' } });
    const tc = h('.content.bottom', { style: { position: 'absolute', top: '196px', bottom: '60px', gap: '28px' } });
    if (s.kicker) tc.append(R('.kicker.pill', s.kicker));
    tc.append(R('.title.' + (s.size || 'lg'), s.title));
    if (s.sub) tc.append(R('.sub', s.sub));
    top.append(h('.deco.dots'), tc);
    const bc = h('.content', { style: { position: 'absolute', top: '56px', bottom: '130px', gap: '20px' } });
    if (s.lead) bc.append(R('.lead', s.lead, { style: { fontSize: '56px' } }));
    if (s.bottomText) bc.append(R('.sub', s.bottomText, { style: { fontWeight: 600 } }));
    if (s.pill) bc.append(h('.cta-row', [R('.cta.navy', s.pill)]));
    bottom.append(star(300, 'rgba(255,255,255,.35)', 'position:absolute;right:-70px;bottom:40px;'), bc);
    const band = h('.deco.band', { style: { top: 'calc(62% - 9px)', background: 'var(--white)', height: '12px' } });
    const css = h('style', { text: '.chrome-bottom{color:var(--navy)} .chrome-top{color:#fff} .wordmark .mark{background-image:url(../../assets/star-mark-outlined.png)!important} .wordmark .ahk{color:#fff!important} .wordmark .akademi{color:#A9C6F2!important}' });
    return [top, bottom, band, css];
  };

  // Poster: a single huge statement, centred
  T.poster = s => {
    const c = h('.content', { style: { gap: '40px', alignItems: s.align === 'left' ? 'flex-start' : 'center', textAlign: s.align === 'left' ? 'left' : 'center' } });
    if (s.kicker) c.append(R('.kicker' + (s.kickerPill ? '.pill' : ''), s.kicker, { style: { alignSelf: s.align === 'left' ? 'flex-start' : 'center' } }));
    c.append(R('.title.' + (s.size || 'xl'), s.title, { style: s.serifTitle ? { fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400, letterSpacing: '-.01em' } : {} }));
    if (s.sub) c.append(R('.sub.lg', s.sub));
    if (s.hand) c.append(R('.hand', s.hand));
    if (s.pill) c.append(h('.cta-row', [R('.cta' + (isDark(s.theme) ? '' : '.navy'), s.pill)]));
    const deco = [star(760, isDark(s.theme) ? 'rgba(245,166,31,.10)' : 'rgba(245,166,31,.16)', 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);')];
    if (isDark(s.theme)) deco.push(h('.deco.dots'));
    return [...deco, c];
  };

  // One mistake per slide: index · Turkish thinking · wrong → right · why
  T.mistake = s => {
    const c = h('.content', { style: { gap: '34px' } });
    const head = h('.row', { style: { display: 'flex', alignItems: 'flex-end', gap: '30px' } }, [h('.idx', { text: String(s.n).padStart(2, '0'), style: { fontSize: '190px' } }), R('.title.md', s.heading, { style: { paddingBottom: '18px' } })]);
    c.append(head);
    if (s.tr) c.append(R('.hand', 'Türkçesi: ' + s.tr, { style: { fontSize: '50px' } }));
    const pair = h('.pair', [h('.row.x', [h('.mark', { text: '✗' }), R('.txt', s.wrong)]), h('.row.ok', [h('.mark', { text: '✓' }), R('.txt', s.right)])]);
    pair.querySelectorAll('.txt').forEach(t => t.style.fontSize = '54px');
    c.append(pair);
    if (s.why) c.append(R('.why', s.why, { style: { fontSize: '38px' } }));
    if (s.extra) c.append(R('.sub', s.extra, { style: { fontSize: '32px', opacity: .8 } }));
    return [h('.deco.dots'), c];
  };

  // Vocabulary / false friend card
  T.word = s => {
    const c = h('.content.top', { style: { gap: '26px' } });
    if (s.kicker) c.append(R('.kicker', s.kicker));
    c.append(R('.title.' + (s.size || 'lg'), s.word));
    const meta = h('.row', { style: { display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' } });
    if (s.ipa) meta.append(R('.ipa', s.ipa));
    if (s.pos) meta.append(R('.tag', s.pos));
    if (s.cefr) meta.append(R('.tag.fill', s.cefr));
    if (meta.children.length) c.append(meta);
    if (s.looks) {
      c.append(h('.card.wrong', [h('.label-sm', { text: s.looksLabel || 'BENZİYOR AMA DEĞİL' }), R('.sub', s.looks, { style: { fontSize: '36px', fontWeight: 600 } })]));
      c.append(h('.card.right', [h('.label-sm', { text: s.actualLabel || 'ASLINDA' }), R('.sub', s.actual, { style: { fontSize: '40px', fontWeight: 800 } })]));
    } else if (s.meaning) {
      c.append(h('.card' + (isDark(s.theme) ? '.glass' : '.soft'), [h('.label-sm', { text: s.meaningLabel || 'ANLAMI' }), R('.sub', s.meaning, { style: { fontSize: '40px', fontWeight: 700 } })]));
    }
    if (s.example) c.append(h('.card' + (isDark(s.theme) ? '.deep' : '.flat'), [h('.label-sm', { text: 'ÖRNEK' }), R('.lead', s.example, { style: { fontSize: '46px' } }), s.exampleTr ? R('.sub', s.exampleTr, { style: { fontSize: '30px', opacity: .75, marginTop: '10px' } }) : null]));
    if (s.note) c.append(R('.why', s.note));
    const deco = [star(520, isDark(s.theme) ? 'rgba(245,166,31,.08)' : 'rgba(245,166,31,.14)', 'position:absolute;right:-160px;bottom:-120px;')];
    return [...deco, c];
  };

  // Two columns compare (Band 6 vs Band 8 · Türkçe düşünce vs native)
  T.compare = s => {
    const c = h('.content.top', { style: { gap: '26px' } });
    if (s.kicker) c.append(R('.kicker', s.kicker));
    if (s.heading) c.append(R('.title.sm', s.heading));
    const left = h('.card' + (s.leftStyle || '.flat'), { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' } }, [h('.label-sm', { text: s.leftLabel }), R('.sub', s.left, { style: { fontSize: s.fs || '40px', fontWeight: 600 } })]);
    const right = h('.card' + (s.rightStyle || '.navy'), { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' } }, [h('.label-sm', { text: s.rightLabel, style: { color: 'var(--gold)', opacity: 1 } }), R('.sub', s.right, { style: { fontSize: s.fs || '40px', fontWeight: 700 } })]);
    const wrap = h('div', { style: { display: 'flex', flexDirection: s.stack ? 'column' : 'row', gap: '22px', alignItems: 'stretch' } }, [left, s.stack ? arrowDown() : null, right]);
    c.append(wrap);
    if (s.why) c.append(R('.why', s.why));
    if (s.hand) c.append(R('.hand', s.hand));
    return [isDark(s.theme) ? h('.deco.dots') : h('.deco.rule-lines'), c];
  };
  const arrowDown = () => svgEl(`<svg width="60" height="54" viewBox="0 0 60 54" style="align-self:center"><path d="M30 2v40M12 26l18 20 18-20" fill="none" stroke="#F5A61F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`);

  // Turkish phrase → natural English options
  T.phrase = s => {
    const c = h('.content.top', { style: { gap: '28px' } });
    if (s.kicker) c.append(R('.kicker', s.kicker));
    c.append(h('.card.gold', { style: { padding: '34px 44px', alignSelf: 'flex-start', maxWidth: '936px' } }, [h('.label-sm', { text: s.trLabel || 'TÜRKÇEDE', style: { opacity: .8 } }), R('.title.md', s.tr)]));
    if (s.literal) c.append(h('.row', { style: { display: 'flex', gap: '20px', alignItems: 'center' } }, [h('.tag', { text: 'BİREBİR ÇEVİRİ' }), R('.sub', s.literal, { style: { textDecoration: 'line-through', textDecorationColor: 'var(--red)', textDecorationThickness: '4px', opacity: .7, fontSize: '34px' } })]));
    const list = h('.list');
    s.options.forEach(o => list.append(h('.li', [R('.k', o.en), o.when ? R('.v', o.when) : null])));
    c.append(list);
    if (s.note) c.append(R('.why', s.note));
    return [h('.deco.dots'), c];
  };

  // Cheat-sheet section: heading + rows of (phrase · meaning)
  T.section = s => {
    const c = h('.content.top', { style: { gap: '26px' } });
    const head = h('div', { style: { display: 'flex', alignItems: 'center', gap: '24px' } }, [s.n ? h('.num-badge', { text: s.n }) : null, R('.title.' + (s.size || 'sm'), s.heading)]);
    c.append(head);
    if (s.sub) c.append(R('.sub', s.sub, { style: { fontSize: '32px', opacity: .8 } }));
    const list = h('.list', { style: { gap: s.gap || '16px' } });
    s.rows.forEach(r => list.append(h('.li', { style: s.rowStyle || {} }, [r.n ? h('.n', { text: r.n }) : null, R('.k', r.k, { style: s.kStyle || {} }), r.v ? R('.v', r.v, { style: s.vStyle || {} }) : null])));
    c.append(list);
    if (s.example) c.append(h('.card' + (isDark(s.theme) ? '.deep' : '.flat'), { style: { padding: '26px 36px' } }, [R('.lead', s.example, { style: { fontSize: '40px' } })]));
    if (s.note) c.append(R('.why', s.note));
    return [c];
  };

  // Table cheat sheet (3 columns etc.)
  T.table = s => {
    const c = h('.content.top', { style: { gap: '26px' } });
    if (s.kicker) c.append(R('.kicker' + (s.kickerPill ? '.pill' : ''), s.kicker));
    if (s.heading) c.append(R('.title.' + (s.size || 'sm'), s.heading));
    if (s.sub) c.append(R('.sub', s.sub, { style: { fontSize: '32px', opacity: .8 } }));
    const t = h('table.table' + (s.dense ? '.dense' : '') + (s.goldHead ? '.gold' : ''));
    if (s.head) t.append(h('thead', [h('tr', s.head.map(x => h('th', { text: x })))]));
    const tb = h('tbody');
    s.rows.forEach((r, i) => tb.append(h('tr' + (i % 2 ? '.alt' : ''), r.map((x, j) => R('td' + (j === 0 ? '.hd' : '') + (s.accentCol === j ? '.ac' : ''), x)))));
    t.append(tb);
    c.append(t);
    if (s.note) c.append(R('.why', s.note));
    if (s.hand) c.append(R('.hand', s.hand));
    return [c];
  };

  // Quiz question
  T.quiz = s => {
    const c = h('.content', { style: { gap: '36px' } });
    c.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '22px' } }, [h('.num-badge', { text: s.n }), R('.kicker', s.kicker || 'HANGİSİ DOĞRU?')]));
    c.append(R('.quiz-q', s.q));
    const opts = h('.opts');
    s.options.forEach((o, i) => opts.append(h('.opt' + (s.reveal && s.answer === i ? '.correct' : ''), [h('.key', { text: String.fromCharCode(65 + i) }), R('span', o)])));
    c.append(opts);
    if (s.hint) c.append(R('.hand', s.hint));
    return [h('.deco.dots'), star(380, 'rgba(245,166,31,.12)', 'position:absolute;right:-110px;bottom:-60px;'), c];
  };

  // Quiz answers (last slide)
  T.answers = s => {
    const c = h('.content.top', { style: { gap: '24px' } });
    c.append(R('.title.' + (s.size || (s.items.length > 4 ? 'sm' : 'md')), s.heading || 'Cevaplar'));
    const list = h('.list', { style: { gap: s.items.length > 4 ? '10px' : '14px' } });
    s.items.forEach(a => list.append(h('.li', { style: { padding: s.items.length > 4 ? '12px 26px' : '18px 28px', alignItems: 'flex-start' } }, [h('.num-badge', { text: a.n, style: { width: '60px', height: '60px', fontSize: '28px', marginTop: '4px' } }), h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [R('.k', a.a), a.why ? R('.v', a.why, { style: { marginLeft: 0, textAlign: 'left', fontSize: '29px', maxWidth: '100%' } }) : null])])));
    c.append(list);
    if (s.score) c.append(R('.hand', s.score));
    if (s.cta) c.append(h('.cta-row', s.cta.map((x, i) => R('.cta' + (i ? '.ghost' : ''), x))));
    return [c];
  };

  // This-or-that poll
  T.poll = s => {
    const c = h('.content', { style: { gap: '34px' } });
    if (s.kicker) c.append(R('.kicker.pill', s.kicker));
    c.append(R('.title.' + (s.size || 'md'), s.title));
    const side = (cls, o) => h('.side.' + cls, [h('div', [h('.em', { text: o.emoji }), h('.big', { html: rich(o.label), style: { marginTop: '14px' } })]), R('.desc', o.desc)]);
    c.append(h('.poll', [side('a', s.a), side('b', s.b)]));
    c.append(h('.vs', { text: 'VS' }));
    if (s.sub) c.append(R('.sub', s.sub, { style: { marginTop: '60px' } }));
    return [h('.deco.dots'), c];
  };

  // Myth vs fact
  T.myth = s => {
    const c = h('.content', { style: { gap: '26px' } });
    if (s.n) c.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '22px' } }, [h('.num-badge', { text: s.n }), R('.kicker', s.kicker || 'EFSANE Mİ, GERÇEK Mİ?')]));
    c.append(h('.card.wrong', { style: { padding: '36px 44px' } }, [h('.label-sm', { text: 'EFSANE', style: { color: 'var(--red)', opacity: 1 } }), R('.title.sm', s.myth, { style: { textDecoration: 'line-through', textDecorationColor: 'var(--red)', textDecorationThickness: '5px', color: 'var(--ink-2)' } })]));
    c.append(h('.card.navy.right', { style: { padding: '36px 44px' } }, [h('.label-sm', { text: 'GERÇEK', style: { color: '#4FD69A', opacity: 1 } }), R('.title.sm', s.fact)]));
    if (s.why) c.append(R('.why', s.why));
    return [h('.deco.rule-lines'), c];
  };

  // Meme: expectation/reality panels or chat
  T.meme = s => {
    const c = h('.content', { style: { gap: '28px' } });
    if (s.kicker) c.append(R('.kicker.pill', s.kicker));
    if (s.title) c.append(R('.title.' + (s.size || 'md'), s.title));
    if (s.chat) {
      const ch = h('.chat');
      s.chat.forEach(m => ch.append(h('.bubble.' + (m.me ? 'me' : 'them'), [m.who ? h('.who', { text: m.who }) : null, R('div', m.text)])));
      c.append(ch);
    }
    if (s.panels) {
      s.panels.forEach(p => c.append(h('.card' + (p.dark ? '.navy' : ''), { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [h('.label-sm', { text: p.label }), h('div', { style: { display: 'flex', gap: '22px', alignItems: 'flex-start' } }, [p.emoji ? h('.emoji', { text: p.emoji, style: { fontSize: '60px', lineHeight: 1.1 } }) : null, R('.title.xs', p.text)])])));
    }
    if (s.caption) c.append(R('.why', s.caption));
    if (s.hand) c.append(R('.hand', s.hand));
    return [isDark(s.theme) ? h('.deco.dots') : h('.deco.grid'), c];
  };

  // Relatable "stage" slide for humour carousels
  T.stage = s => {
    const c = h('.content', { style: { gap: '30px' } });
    c.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '24px' } }, [h('.idx', { text: String(s.n).padStart(2, '0'), style: { fontSize: '120px' } }), s.kicker ? R('.kicker', s.kicker) : null]));
    c.append(h('.emoji', { text: s.emoji, style: { fontSize: '140px', lineHeight: 1 } }));
    c.append(R('.title.' + (s.size || 'md'), s.title));
    if (s.text) c.append(R('.sub', s.text));
    if (s.hand) c.append(R('.hand', s.hand));
    return [h('.deco.dots'), c];
  };

  // Recap + CTA (last slide of carousels)
  T.recap = s => {
    const c = h('.content.top', { style: { gap: '26px' } });
    c.append(R('.kicker.pill', s.kicker || 'ÖZET'));
    c.append(R('.title.' + (s.size || 'md'), s.title || 'Kaydet, sonra tekrar bak'));
    if (s.items) {
      const list = h('.list', { style: { gap: '12px' } });
      s.items.forEach((it, i) => list.append(h('.li', { style: { padding: '20px 30px' } }, [h('.n', { text: String(i + 1).padStart(2, '0') }), R('.k', typeof it === 'string' ? it : it.k, { style: { fontSize: s.itemSize || '36px' } }), it.v ? R('.v', it.v) : null])));
      c.append(list);
    }
    if (s.text) c.append(R('.sub', s.text, { style: { fontSize: '34px' } }));
    c.append(h('.cta-row', { style: { marginTop: '8px' } }, (s.cta || [':save: Kaydet', ':share: Arkadaşına gönder', '+ Takip et']).map((x, i) => R('.cta' + (i === 0 ? '' : '.ghost'), x))));
    if (s.foot) c.append(R('.sub', s.foot, { style: { fontSize: '30px', opacity: .78 } }));
    return [h('.deco.dots'), star(520, 'rgba(245,166,31,.10)', 'position:absolute;right:-170px;bottom:-140px;'), c];
  };

  // Numbered steps
  T.steps = s => {
    const c = h('.content.top', { style: { gap: '26px' } });
    if (s.kicker) c.append(R('.kicker' + (s.kickerPill ? '.pill' : ''), s.kicker));
    if (s.heading) c.append(R('.title.' + (s.size || 'sm'), s.heading));
    if (s.sub) c.append(R('.sub', s.sub, { style: { fontSize: '32px', opacity: .8 } }));
    const st = h('.steps', { style: { gap: s.gap || '22px' } });
    s.items.forEach((it, i) => st.append(h('.step', [h('.n', { text: it.n || String(i + 1) }), h('.body', [R('.h', it.h), it.p ? R('.p', it.p) : null])])));
    c.append(st);
    if (s.note) c.append(R('.why', s.note));
    if (s.hand) c.append(R('.hand', s.hand));
    return [c];
  };

  // Grid of 4 (which one are you)
  T.grid = s => {
    const c = h('.content', { style: { gap: '28px' } });
    if (s.kicker) c.append(R('.kicker.pill', s.kicker));
    c.append(R('.title.' + (s.size || 'md'), s.title));
    const g = h('.grid2');
    s.cells.forEach(cell => g.append(h('.cell', [h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } }, [cell.n ? h('.num-badge', { text: cell.n, style: { width: '58px', height: '58px', fontSize: '28px' } }) : null, h('.em', { text: cell.emoji })]), R('.big', cell.title), R('.sm', cell.text)])));
    c.append(g);
    if (s.sub) c.append(R('.sub', s.sub, { style: { fontSize: '34px' } }));
    return [h('.deco.dots'), c];
  };

  // Ticket list (plan / phrases with stub)
  T.tickets = s => {
    const c = h('.content.top', { style: { gap: '22px' } });
    if (s.kicker) c.append(R('.kicker' + (s.kickerPill ? '.pill' : ''), s.kicker));
    if (s.heading) c.append(R('.title.' + (s.size || 'sm'), s.heading));
    if (s.sub) c.append(R('.sub', s.sub, { style: { fontSize: '32px', opacity: .8 } }));
    s.items.forEach(it => c.append(h('.ticket', [h('.stub', { text: it.stub }), h('.main', [R('.h', it.h), it.p ? R('.p', it.p) : null])])));
    if (s.note) c.append(R('.why', s.note));
    return [c];
  };

  // Formality ladder
  T.ladder = s => {
    const c = h('.content.top', { style: { gap: '24px' } });
    if (s.kicker) c.append(R('.kicker.pill', s.kicker));
    c.append(R('.title.' + (s.size || 'sm'), s.title));
    const wrap = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
    const n = s.items.length;
    s.items.forEach((it, i) => {
      const t = i / (n - 1);
      const bg = t < .34 ? 'var(--navy)' : t < .67 ? 'var(--blue)' : 'var(--gold)';
      const col = t < .67 ? 'var(--white)' : 'var(--navy)';
      wrap.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '22px', background: bg, color: col, borderRadius: '22px', padding: '18px 30px', marginLeft: (i * 14) + 'px' } }, [R('.k', it.k, { style: { fontFamily: 'var(--body)', fontWeight: 800, fontSize: '38px', flex: 1 } }), R('span', it.v, { style: { fontSize: '28px', fontWeight: 700, letterSpacing: '.1em', opacity: .85 } })]));
    });
    c.append(h('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '28px', letterSpacing: '.16em', opacity: .75 } }, [h('span', { text: s.topLabel || 'EN RESMİ' }), h('span', { text: s.bottomLabel || 'EN SAMİMİ' })]));
    c.append(wrap);
    if (s.note) c.append(R('.why', s.note));
    return [c];
  };

  // Custom SVG diagram slides
  T.diagram = s => {
    const c = h('.content.top', { style: { gap: '26px' } });
    if (s.kicker) c.append(R('.kicker.pill', s.kicker));
    if (s.title) c.append(R('.title.' + (s.size || 'md'), s.title));
    if (s.sub) c.append(R('.sub', s.sub));
    c.append(DIAGRAMS[s.name](s));
    if (s.after) c.append(R('.why', s.after));
    if (s.hand) c.append(R('.hand', s.hand));
    return [isDark(s.theme) ? h('.deco.dots') : null, c];
  };

  const DIAGRAMS = {
    // since (point) vs for (duration) timeline
    timeline: s => svgEl(`<svg viewBox="0 0 936 470" width="936" height="470" font-family="Inter" font-weight="700">
      <defs><marker id="ah" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#F5A61F"/></marker></defs>
      <line x1="40" y1="250" x2="896" y2="250" stroke="rgba(255,255,255,.35)" stroke-width="6" stroke-linecap="round"/>
      <line x1="40" y1="250" x2="896" y2="250" stroke="#F5A61F" stroke-width="6" stroke-dasharray="2 0" marker-end="url(#ah)" opacity="0"/>
      <circle cx="200" cy="250" r="26" fill="#F5A61F"/>
      <circle cx="820" cy="250" r="26" fill="#fff"/>
      <text x="200" y="330" fill="#F5A61F" font-size="34" text-anchor="middle">2021</text>
      <text x="820" y="330" fill="#fff" font-size="34" text-anchor="middle">${esc(s.now || 'ŞİMDİ')}</text>
      <path d="M200 150 Q510 20 820 150" fill="none" stroke="#F5A61F" stroke-width="8" stroke-linecap="round"/>
      <text x="510" y="62" fill="#F5A61F" font-size="44" font-family="Unbounded" font-weight="900" text-anchor="middle">for 5 years</text>
      <text x="510" y="430" fill="#fff" font-size="44" font-family="Unbounded" font-weight="900" text-anchor="middle">since 2021</text>
      <path d="M200 290 L200 380 L470 380" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
      <text x="200" y="215" fill="#fff" font-size="30" text-anchor="middle" opacity=".8">başlangıç noktası</text>
      <text x="510" y="300" fill="#fff" font-size="30" text-anchor="middle" opacity=".8">süre</text>
    </svg>`),
    // borrow vs lend arrows
    arrows: s => svgEl(`<svg viewBox="0 0 936 500" width="936" height="500" font-family="Inter" font-weight="800">
      <defs><marker id="ag" markerWidth="12" markerHeight="12" refX="8" refY="6" orient="auto"><path d="M0 0L12 6L0 12z" fill="#F5A61F"/></marker><marker id="ab" markerWidth="12" markerHeight="12" refX="8" refY="6" orient="auto"><path d="M0 0L12 6L0 12z" fill="#1F5FAE"/></marker></defs>
      <rect x="20" y="150" width="260" height="220" rx="36" fill="#0E1F3E"/>
      <text x="150" y="235" fill="#fff" font-size="38" text-anchor="middle">BEN</text>
      <text x="150" y="300" fill="#F5A61F" font-size="58" text-anchor="middle" font-family="Noto Color Emoji">🙋</text>
      <rect x="656" y="150" width="260" height="220" rx="36" fill="#1F5FAE"/>
      <text x="786" y="235" fill="#fff" font-size="38" text-anchor="middle">ARKADAŞIM</text>
      <text x="786" y="300" fill="#fff" font-size="58" text-anchor="middle" font-family="Noto Color Emoji">🧑</text>
      <path d="M640 200 L300 200" stroke="#F5A61F" stroke-width="12" stroke-linecap="round" marker-end="url(#ag)"/>
      <text x="468" y="112" fill="#0E1F3E" font-size="48" font-family="Unbounded" font-weight="900" text-anchor="middle">borrow</text>
      <text x="468" y="160" fill="#0E1F3E" font-size="28" text-anchor="middle" font-weight="600" opacity=".75">ödünç ALMAK → bana doğru</text>
      <path d="M300 330 L640 330" stroke="#1F5FAE" stroke-width="12" stroke-linecap="round" marker-end="url(#ab)"/>
      <text x="468" y="425" fill="#0E1F3E" font-size="48" font-family="Unbounded" font-weight="900" text-anchor="middle">lend</text>
      <text x="468" y="470" fill="#0E1F3E" font-size="28" text-anchor="middle" font-weight="600" opacity=".75">ödünç VERMEK → benden uzağa</text>
    </svg>`),
    // -ed endings three buckets
    ed: s => {
      const g = h('.grid3');
      s.buckets.forEach(b => g.append(h('.cell', { style: { background: 'var(--white)', color: 'var(--ink)', gap: '14px' } }, [h('.big', { text: b.sound, style: { fontSize: '64px', color: 'var(--blue)' } }), R('.sm', b.rule, { style: { fontWeight: 700, opacity: 1 } }), h('.hr'), ...b.words.map(w => { const [word, ipa] = w.split(' /'); return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } }, [R('.sm', word, { style: { fontSize: '34px', fontWeight: 700, opacity: 1 } }), ipa ? R('.sm', '/' + ipa, { style: { fontSize: '28px' } }) : null]); })])));
      return g;
    },
    // silent letters: word with ghosted letters
    silent: s => {
      const g = h('.grid2', { style: { gap: '18px' } });
      s.words.forEach(w => {
        const html = w.word.split('').map((ch, i) => w.silent.includes(i) ? `<span style="color:var(--gold);opacity:.6;text-decoration:line-through;text-decoration-color:var(--red);text-decoration-thickness:5px">${esc(ch)}</span>` : esc(ch)).join('');
        g.append(h('.cell', { style: { gap: '6px', padding: '22px 30px' } }, [h('.big', { html, style: { fontSize: '50px', letterSpacing: '.02em' } }), h('.sm', { text: w.ipa, style: { fontSize: '30px' } })]));
      });
      return g;
    },
    // trend arrows for IELTS Task 1
    trends: s => {
      const g = h('.grid2', { style: { gap: '18px' } });
      const icons = {
        up: '<path d="M10 70 L40 40 L60 55 L95 15" fill="none" stroke="#1FA46A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 15 H95 V40" fill="none" stroke="#1FA46A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>',
        down: '<path d="M10 15 L40 45 L60 30 L95 70" fill="none" stroke="#E0433F" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 70 H95 V45" fill="none" stroke="#E0433F" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>',
        flat: '<path d="M10 45 H95" fill="none" stroke="#1F5FAE" stroke-width="9" stroke-linecap="round"/>',
        wave: '<path d="M8 45 C25 5, 40 85, 55 45 S85 5, 98 45" fill="none" stroke="#F5A61F" stroke-width="9" stroke-linecap="round"/>',
        peak: '<path d="M10 70 L50 15 L95 70" fill="none" stroke="#1F5FAE" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="15" r="9" fill="#F5A61F"/>',
        low: '<path d="M10 15 L50 70 L95 15" fill="none" stroke="#1F5FAE" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="70" r="9" fill="#F5A61F"/>'
      };
      s.items.forEach(it => g.append(h('.cell', { style: { flexDirection: 'row', alignItems: 'center', gap: '22px', padding: '22px 28px' } }, [svgEl(`<svg viewBox="0 0 105 85" width="96" height="78">${icons[it.icon]}</svg>`), h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [R('.big', it.k, { style: { fontSize: '32px' } }), R('.sm', it.v, { style: { fontSize: '28px' } })])])));
      return g;
    }
  };

  // ---------- auto-fit: shrink scalable text until the content frame fits ----------
  function fit(stageEl) {
    const frames = [...stageEl.querySelectorAll('.content')];
    for (const f of frames) {
      let guard = 0;
      const over = () => { const kids = [...f.children]; if (!kids.length) return 0; const fr = f.getBoundingClientRect(); let top = Infinity, bottom = -Infinity; kids.forEach(k => { const r = k.getBoundingClientRect(); if (r.height === 0) return; top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom); }); return Math.max(bottom - top - fr.height, f.scrollHeight - f.clientHeight); };
      while (guard++ < 40 && over() > 1) {
        const targets = [...f.querySelectorAll('.title, .sub, .lead, .list .li .k, .list .li .v, .pair .row .txt, .why, .step .h, .step .p, .cell .big, .cell .sm, .table td, .table th, .quiz-q, .opt, .bubble, .hand, .ticket .h, .ticket .p, .idx, .ipa, .card .label-sm, .kicker, .cta')];
        targets.forEach(t => { const fs = parseFloat(getComputedStyle(t).fontSize); if (fs > 28.5) t.style.fontSize = Math.max(28, fs * 0.965) + 'px'; });
        // tighten gaps too
        [...f.querySelectorAll('.list, .steps, .pair, .opts, .chat, .content')].concat([f]).forEach(g => { const gap = parseFloat(getComputedStyle(g).gap); if (gap > 8) g.style.gap = (gap * 0.9) + 'px'; });
        [...f.querySelectorAll('.li, .row, .opt, .cell, .card, .step, .ticket .main, .table td')].forEach(e => { const pt = parseFloat(getComputedStyle(e).paddingTop); if (pt > 10) { e.style.paddingTop = (pt * 0.92) + 'px'; e.style.paddingBottom = (pt * 0.92) + 'px'; } });
      }
    }
  }

  // ---------- boot ----------
  async function boot() {
    const res = await fetch('posts.json?v=' + Date.now());
    const posts = await res.json();
    const pid = qs.get('post') || posts[0].id;
    const post = posts.find(p => p.id === pid);
    if (!post) throw new Error('unknown post ' + pid);
    const k = Math.max(1, parseInt(qs.get('slide') || '1', 10));
    const slide = post.slides[k - 1];
    if (!slide) throw new Error('no slide ' + k);
    const theme = slide.theme || post.theme || 'navy';
    const stage = document.getElementById('stage');
    stage.className = 'stage t-' + theme + (isDark(theme) ? ' dark' : '');
    document.documentElement.lang = slide.lang || 'tr';
    const parts = T[slide.type](Object.assign({ theme }, slide));
    parts.forEach(p => p && stage.append(p));
    chrome(post, k - 1, post.slides.length, slide).forEach(x => stage.append(x));
    await document.fonts.ready;
    // emoji glyphs are inline: give them the emoji font
    fit(stage);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    window.__meta = { id: post.id, slug: post.slug, slides: post.slides.length, slide: k, theme };
    window.__ready = true;
  }
  boot().catch(e => { window.__error = String(e && e.stack || e); console.error(e); });
})();
