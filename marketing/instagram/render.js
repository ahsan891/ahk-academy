#!/usr/bin/env node
/*
  AHK Akademi — template renderer
  ---------------------------------
  node render.js <templateId|all> [--data file.json] [--out dir] [--fps 30] [--frames 0,1.5,3] [--no-preview]

  Reels  → out/<id>/reel.mp4 (H.264, 30fps, 1080×1920) + preview.png
  Posts  → out/<id>/slide-01.png … (1080×1350) + preview.png
  Animation is driven frame-by-frame through window.__setTime(t), so output is identical every run.
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');

const ROOT = __dirname;
const TEMPLATES = JSON.parse(fs.readFileSync(path.join(ROOT, 'templates.json'), 'utf8'));

function loadPlaywright() {
  try { return require('playwright'); } catch (e) { /* fall through */ }
  const globalRoot = execSync('npm root -g').toString().trim();
  return require(path.join(globalRoot, 'playwright'));
}

// ---------- tiny static server (templates fetch sample.json, so file:// is not enough) ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
function startServer() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, url);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

function parseArgs(argv) {
  const a = { ids: [], fps: 30, preview: true, frames: null, data: null, out: null, previewDir: path.join(ROOT, 'previews') };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--data') a.data = argv[++i];
    else if (v === '--out') a.out = argv[++i];
    else if (v === '--fps') a.fps = +argv[++i];
    else if (v === '--frames') a.frames = argv[++i].split(',').map(Number);
    else if (v === '--no-preview') a.preview = false;
    else if (v === '--preview-dir') a.previewDir = argv[++i];
    else if (v === 'all') a.ids = TEMPLATES.map(t => t.id);
    else if (v === 'reels') a.ids = TEMPLATES.filter(t => t.format === 'reel').map(t => t.id);
    else if (v === 'posts') a.ids = TEMPLATES.filter(t => t.format !== 'reel').map(t => t.id);
    else if (!v.startsWith('--')) a.ids.push(v);
  }
  return a;
}

function ffmpegScale(src, dst, width) {
  execSync(`ffmpeg -y -loglevel error -i "${src}" -vf scale=${width}:-1 "${dst}"`);
}

async function openTemplate(browser, port, id, data) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error(`  [page error] ${e.message}`));
  if (data) await page.addInitScript(d => { window.TEMPLATE_DATA = d; }, data);
  await page.goto(`http://127.0.0.1:${port}/templates/${id}/template.html?render=1`);
  await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 30000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(`template ${id} failed: ${err}`);
  const meta = await page.evaluate(() => window.__meta);
  await page.setViewportSize({ width: 1080, height: meta.format === 'reel' ? 1920 : 1350 });
  return { page, meta };
}

async function renderReel(page, meta, outDir, fps, log) {
  const total = Math.round(meta.duration * fps);
  const mp4 = path.join(outDir, 'reel.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1', '-crf', '18', '-preset', 'medium',
    '-r', String(fps), '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exited ' + c))));
  // raw CDP screenshots are ~30% faster than page.screenshot() for thousands of frames
  const cdp = await page.context().newCDPSession(page);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.__setTime(t), i / fps);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 94, fromSurface: true });
    const buf = Buffer.from(data, 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 2) === 0) log(`  frame ${i}/${total}`);
  }
  ff.stdin.end();
  await done;
  log(`  ✔ ${path.relative(ROOT, mp4)}  (${total} frames, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  return mp4;
}

async function renderPost(page, meta, outDir, log) {
  const files = [];
  for (let i = 0; i < meta.slides; i++) {
    await page.evaluate(k => window.__setSlide(k), i);
    const f = path.join(outDir, meta.slides > 1 ? `slide-${String(i + 1).padStart(2, '0')}.png` : 'post.png');
    await page.screenshot({ type: 'png', path: f });
    files.push(f);
  }
  log(`  ✔ ${files.map(f => path.relative(ROOT, f)).join(', ')}`);
  return files;
}

async function renderOne(browser, port, id, opts) {
  const log = opts.log || console.log;
  const outDir = opts.outDir || path.join(ROOT, 'out', id);
  fs.mkdirSync(outDir, { recursive: true });
  const { page, meta } = await openTemplate(browser, port, id, opts.data);
  log(`▶ ${id} (${meta.format}, ${meta.format === 'reel' ? meta.duration + 's' : meta.slides + ' slide(s)'})`);
  const result = { id, meta, outDir, files: [] };
  try {
    if (opts.frames) {
      for (const t of opts.frames) {
        if (meta.format === 'reel') await page.evaluate(t => window.__setTime(t), t); else await page.evaluate(k => window.__setSlide(k), Math.floor(t));
        const f = path.join(outDir, `frame-${String(t).replace('.', '_')}.png`);
        await page.screenshot({ type: 'png', path: f });
        result.files.push(f);
      }
      log(`  ✔ ${result.files.length} frame(s) → ${path.relative(ROOT, outDir)}`);
    } else if (meta.format === 'reel') {
      result.files.push(await renderReel(page, meta, outDir, opts.fps || 30, log));
    } else {
      result.files.push(...await renderPost(page, meta, outDir, log));
    }
    if (opts.preview !== false) {
      const full = path.join(outDir, 'preview.png');
      if (meta.format === 'reel') await page.evaluate(t => window.__setTime(t), meta.preview); else await page.evaluate(() => window.__setSlide(0));
      await page.screenshot({ type: 'png', path: full });
      fs.mkdirSync(opts.previewDir, { recursive: true });
      const small = path.join(opts.previewDir, path.resolve(opts.previewDir) === path.resolve(outDir) ? 'preview-540.png' : `${id}.png`);
      ffmpegScale(full, small, 540);
      result.preview = small;
    }
  } finally {
    await page.close();
  }
  return result;
}

async function withBrowser(fn) {
  const { chromium } = loadPlaywright();
  const { srv, port } = await startServer();
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
  try { return await fn(browser, port); } finally { await browser.close(); srv.close(); }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.ids.length) { console.log('usage: node render.js <templateId|all|reels|posts> [--data file.json] [--out dir] [--fps 30] [--frames 0,1,2]'); process.exit(1); }
  for (const id of args.ids) if (!TEMPLATES.find(t => t.id === id)) { console.error(`unknown template: ${id}`); process.exit(1); }
  const data = args.data ? JSON.parse(fs.readFileSync(args.data, 'utf8')) : null;
  await withBrowser(async (browser, port) => {
    for (const id of args.ids) {
      await renderOne(browser, port, id, { data, outDir: args.out, fps: args.fps, frames: args.frames, preview: args.preview, previewDir: args.previewDir });
    }
  });
}

module.exports = { renderOne, withBrowser, TEMPLATES };
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
