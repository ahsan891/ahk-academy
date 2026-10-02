#!/usr/bin/env node
/*
  AHK Akademi — posts-40 renderer
  --------------------------------
  node render.js                 render all 40 posts → out/NN-slug/slideK.png + caption.txt, previews/, contact sheet, zip
  node render.js 03 07           only those posts (no zip / contact sheet)
  node render.js --check         layout check only (no PNGs)
  node render.js --no-zip        skip the zip
  node render.js --sheet         rebuild previews/contact-sheet.png only

  Needs: Node 18+, playwright (global install is fine), Chromium already installed, ffmpeg + zip on PATH.
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, execFileSync } = require('child_process');

const ROOT = __dirname;                                   // posts-40/
const SERVE_ROOT = path.resolve(ROOT, '..');              // marketing/instagram/ (so ../../assets resolves)
const OUT = path.join(ROOT, 'out');
const PREV = path.join(ROOT, 'previews');
const POSTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'posts.json'), 'utf8'));

function loadPlaywright() {
  try { return require('playwright'); } catch (e) { /* fall through */ }
  const globalRoot = execSync('npm root -g').toString().trim();
  return require(path.join(globalRoot, 'playwright'));
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
function startServer() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(SERVE_ROOT, url);
      if (!file.startsWith(SERVE_ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

// ---------- layout check (runs inside the page) ----------
// Reports: text outside the 64px safe area, overlap with the brand chrome, text overlapping other text,
// text clipped by an overflow:hidden box, text spilling out of its card, text smaller than 28px, page taller than 1350.
function checkInPage() {
  const SAFE = 64, MIN_FONT = 28, W = 1080, H = 1350;
  const out = [];
  const vis = el => { let e = el; while (e && e !== document.body) { const cs = getComputedStyle(e); if (+cs.opacity < 0.08 || cs.visibility === 'hidden' || cs.display === 'none') return false; e = e.parentElement; } return true; };
  const isText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const leaves = [...document.querySelectorAll('#stage *')].filter(e => isText(e) && vis(e) && !e.closest('svg'));
  const rect = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
  const chromeEls = [...document.querySelectorAll('.chrome-top, .chrome-bottom')];
  const chromeRects = chromeEls.map(rect);
  const items = [];
  for (const e of leaves) {
    const b = rect(e);
    if (b.w === 0 || b.h === 0) continue;
    const txt = e.textContent.trim().replace(/\s+/g, ' ').slice(0, 36);
    const inChrome = !!e.closest('.chrome-top, .chrome-bottom');
    const fs = parseFloat(getComputedStyle(e).fontSize);
    const lines = getComputedStyle(e).display === 'inline' ? [...e.getClientRects()] : [e.getBoundingClientRect()];
    items.push({ e, b, txt, inChrome, lines });
    // text rendered with a wordmark is a logo, not copy
    if (!e.classList.contains('ghost-text') && (!inChrome || !e.closest('.wordmark'))) {
      if (b.l < SAFE - 1) out.push(`outside safe area (left ${Math.round(b.l)}): "${txt}"`);
      if (b.r > W - SAFE + 1) out.push(`outside safe area (right ${Math.round(b.r)}): "${txt}"`);
      if (b.t < SAFE - 1) out.push(`outside safe area (top ${Math.round(b.t)}): "${txt}"`);
      if (b.b > H - SAFE + 1 + 8) out.push(`outside safe area (bottom ${Math.round(b.b)}): "${txt}"`);
    }
    if (!e.closest('.wordmark') && fs < MIN_FONT - 0.5) out.push(`small text ${Math.round(fs)}px: "${txt}"`);
    if (!inChrome) for (const c of chromeRects) if (b.b > c.t + 6 && b.t < c.b - 6 && b.r > c.l && b.l < c.r) out.push(`overlaps brand chrome: "${txt}"`);
    // clipping
    let p = e;
    while (p && p !== document.body) {
      const cs = getComputedStyle(p);
      if (cs.overflow === 'hidden' || cs.overflowY === 'hidden') {
        const pr = rect(p);
        if (p.id !== 'stage' && (b.b > pr.b + 2 || b.r > pr.r + 2 || b.t < pr.t - 2 || b.l < pr.l - 2)) { out.push(`clipped by ${p.className || p.tagName}: "${txt}"`); break; }
      }
      p = p.parentElement;
    }
    // spilling out of a card / cell / row (boxes with a background or border)
    const box = e.closest('.card, .cell, .li, .row, .opt, .bubble, .ticket, .side, .step .n, .num-badge, .cta, .tag, .kicker.pill, .table');
    if (box && box !== e) {
      const br = rect(box);
      if (b.b > br.b + 2 || b.r > br.r + 2 || b.l < br.l - 2) out.push(`spills out of its box: "${txt}"`);
    }
  }
  // text/text overlap (ignore ancestor/descendant pairs and the ghost watermark)
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const A = items[i], B = items[j];
    if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    if (A.e.classList.contains('ghost-text') || B.e.classList.contains('ghost-text')) continue;
    const ra = A.lines, rb = B.lines;
    let hit = false;
    for (const a of ra) for (const b of rb) { const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left); const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ox > 6 && oy > Math.max(6, 0.3 * Math.min(a.height, b.height))) hit = true; }
    if (hit) out.push(`text overlaps text: "${A.txt}" × "${B.txt}"`);
  }
  if (document.documentElement.scrollHeight > H + 1) out.push(`page taller than ${H}px (${document.documentElement.scrollHeight})`);
  const frames = [...document.querySelectorAll('.content')];
  for (const f of frames) if (f.scrollHeight > f.clientHeight + 2) out.push(`content frame overflows by ${f.scrollHeight - f.clientHeight}px`);
  return [...new Set(out)];
}

function captionText(post) {
  const tags = (post.hashtags || []).map(t => t.startsWith('#') ? t : '#' + t).join(' ');
  return `${post.caption.trim()}\n\n${tags}\n\n---\nALT TEXT:\n${post.alt.trim()}\n`;
}

async function renderPost(browser, port, post, opts) {
  const dir = path.join(OUT, `${post.id}-${post.slug}`);
  if (!opts.checkOnly) fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const problems = [];
  const files = [];
  try {
    for (let k = 1; k <= post.slides.length; k++) {
      await page.goto(`http://127.0.0.1:${port}/posts-40/src/index.html?post=${post.id}&slide=${k}`);
      await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 30000 });
      const err = await page.evaluate(() => window.__error);
      if (err) throw new Error(`${post.id} slide ${k}: ${err}`);
      const probs = await page.evaluate(checkInPage);
      probs.forEach(p => problems.push(`slide ${k}: ${p}`));
      if (!opts.checkOnly) {
        const file = path.join(dir, `slide${k}.png`);
        await page.screenshot({ type: 'png', path: file, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
        files.push(file);
        if (k === 1 && opts.previews !== false) {
          fs.mkdirSync(PREV, { recursive: true });
          execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-vf', 'scale=540:-1', path.join(PREV, `${post.id}-${post.slug}.png`)]);
        }
      }
    }
    if (!opts.checkOnly) fs.writeFileSync(path.join(dir, 'caption.txt'), captionText(post));
  } finally { await page.close(); }
  return { dir, files, problems };
}

async function contactSheet(browser, port) {
  // 3-column Instagram-grid style view of the 40 covers in posting order (newest first, like a profile grid)
  const orderFile = path.join(ROOT, 'src', 'posting-order.json');
  const order = fs.existsSync(orderFile) ? JSON.parse(fs.readFileSync(orderFile, 'utf8')) : POSTS.map(p => p.id);
  const ordered = order.map(id => POSTS.find(p => p.id === id)).filter(Boolean);
  const covers = ordered.slice().reverse().map(p => `${p.id}-${p.slug}.png`).filter(f => fs.existsSync(path.join(PREV, f)));
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;background:#fff;font-family:Inter,sans-serif;width:1140px}
    .grid{display:grid;grid-template-columns:repeat(3,372px);gap:12px;padding:12px}
    .grid img{width:372px;height:465px;object-fit:cover;display:block;border-radius:4px}
    .cell{position:relative}.cell span{position:absolute;left:8px;top:8px;background:rgba(0,0,0,.55);color:#fff;font:700 16px Inter;padding:4px 8px;border-radius:6px}
  </style></head><body><div class="grid">${covers.map(f => `<div class="cell"><img src="${f}"><span>${f.slice(0, 2)}</span></div>`).join('')}</div></body></html>`;
  const tmp = path.join(ROOT, 'previews', '_sheet.html');
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: 1140, height: 800 } });
  await page.goto(`http://127.0.0.1:${port}/posts-40/previews/_sheet.html`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(PREV, 'contact-sheet.png'), fullPage: true });
  await page.close();
  fs.unlinkSync(tmp);
}

function bundle(results) {
  const flat = path.join(OUT, '_flat');
  fs.rmSync(flat, { recursive: true, force: true });
  fs.mkdirSync(flat, { recursive: true });
  for (const r of results) {
    const base = path.basename(r.dir);
    r.files.forEach((f, i) => fs.copyFileSync(f, path.join(flat, `${base}-${i + 1}.png`)));
    fs.copyFileSync(path.join(r.dir, 'caption.txt'), path.join(flat, `${base}.txt`));
  }
  const zip = path.join(OUT, 'ahk-40-posts.zip');
  fs.rmSync(zip, { force: true });
  execFileSync('zip', ['-q', '-r', '-j', zip, flat]);
  fs.rmSync(flat, { recursive: true, force: true });
  return zip;
}

(async () => {
  const argv = process.argv.slice(2);
  const opts = { checkOnly: argv.includes('--check'), zip: !argv.includes('--no-zip'), sheetOnly: argv.includes('--sheet') };
  const ids = argv.filter(a => /^\d\d$/.test(a));
  const list = ids.length ? POSTS.filter(p => ids.includes(p.id)) : POSTS;
  const { chromium } = loadPlaywright();
  const { srv, port } = await startServer();
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
  let issues = 0;
  const results = [];
  try {
    if (opts.sheetOnly) { await contactSheet(browser, port); console.log('contact sheet rebuilt'); process.exit(0); }
    for (const post of list) {
      const r = await renderPost(browser, port, post, opts);
      results.push(r);
      if (r.problems.length) { issues += r.problems.length; console.log(`✖ ${post.id}-${post.slug}`); r.problems.forEach(p => console.log('    ' + p)); }
      else console.log(`✔ ${post.id}-${post.slug} (${post.slides.length} slide${post.slides.length > 1 ? 's' : ''})`);
    }
    if (!opts.checkOnly && !ids.length) {
      await contactSheet(browser, port);
      if (opts.zip) { const z = bundle(results); console.log(`zip → ${z} (${(fs.statSync(z).size / 1048576).toFixed(1)} MB)`); }
    }
  } finally { await browser.close(); srv.close(); }
  console.log(issues ? `\n${issues} layout issue(s)` : '\nNo layout issues');
  process.exit(issues ? 2 : 0);
})().catch(e => { console.error(e); process.exit(1); });
