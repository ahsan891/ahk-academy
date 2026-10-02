#!/usr/bin/env node
// Layout audit: for every template (or the ids given) samples the timeline every 0.5s (reels) or every slide
// (posts) and reports visible content that leaves the safe area, overlaps the brand chrome, or is clipped.
//   node audit.js [id ...]
const { withBrowser, TEMPLATES } = require('./render');

const SAFE = { reel: { top: 225, bottom: 1545 }, post: { top: 40, bottom: 1310 } };

async function auditOne(browser, port, t) {
  const page = await browser.newPage({ viewport: { width: 1080, height: t.format === 'reel' ? 1920 : 1350 } });
  await page.goto(`http://127.0.0.1:${port}/templates/${t.id}/template.html?render=1`);
  await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 30000 });
  const meta = await page.evaluate(() => window.__meta);
  const samples = meta.format === 'reel' ? Array.from({ length: Math.floor(meta.duration * 2) }, (_, i) => i / 2) : Array.from({ length: meta.slides }, (_, i) => i);
  const problems = [];
  for (const s of samples) {
    if (meta.format === 'reel') await page.evaluate(t => window.__setTime(t), s); else await page.evaluate(k => window.__setSlide(k), s);
    const r = await page.evaluate((safe) => {
      const vis = el => { let e = el; while (e && e !== document.body) { const cs = getComputedStyle(e); if (+cs.opacity < 0.08 || cs.visibility === 'hidden' || cs.display === 'none') return false; e = e.parentElement; } return true; };
      const out = [];
      const chrome = [...document.querySelectorAll('.chrome-top, .chrome-bottom')].map(c => c.getBoundingClientRect());
      const els = [...document.querySelectorAll('.content *, .hookwrap *, .pair *, .outro *, .intro *, .p *')].filter(e => e.children.length === 0 && e.textContent.trim() && vis(e));
      for (const e of els) {
        const b = e.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        const txt = e.textContent.trim().slice(0, 30);
        if (b.top < safe.top - 2) out.push(`above safe (top ${Math.round(b.top)}): "${txt}"`);
        if (b.bottom > safe.bottom + 2) out.push(`below safe (bottom ${Math.round(b.bottom)}): "${txt}"`);
        if (b.right > 1080 - 60) out.push(`too far right (${Math.round(b.right)}): "${txt}"`);
        for (const c of chrome) if (b.bottom > c.top + 4 && b.top < c.bottom - 4 && b.right > c.left && b.left < c.right && !e.closest('.chrome-top, .chrome-bottom')) out.push(`overlaps chrome (y ${Math.round(b.top)}–${Math.round(b.bottom)}): "${txt}"`);
        const p = e.parentElement;
        const fs = parseFloat(getComputedStyle(e).fontSize);
        // a real clip hides at least most of a line; font ascent/descent alone can exceed the line box by a few px
        if (e.scrollWidth > e.clientWidth + 3 && getComputedStyle(e).overflow === 'hidden') out.push(`clipped horizontally: "${txt}"`);
        if (e.scrollHeight > e.clientHeight + fs * 0.6 && getComputedStyle(e).overflow === 'hidden') out.push(`clipped vertically: "${txt}"`);
        if (p && getComputedStyle(p).overflow === 'hidden' && (p.scrollHeight > p.clientHeight + fs * 0.6)) out.push(`parent clips: "${txt}"`);
        if (fs < (document.body.classList.contains('reel') ? 30 : 24) && !e.closest('.chrome-top, .chrome-bottom, .slide-counter, .swipe-hint')) out.push(`small text ${Math.round(fs)}px: "${txt}"`);
      }
      return [...new Set(out)];
    }, SAFE[meta.format === 'reel' ? 'reel' : 'post']);
    r.forEach(x => problems.push(`${meta.format === 'reel' ? 't=' + s.toFixed(1) + 's' : 'slide ' + (s + 1)}: ${x}`));
  }
  await page.close();
  return problems;
}

(async () => {
  const ids = process.argv.slice(2);
  const list = ids.length ? TEMPLATES.filter(t => ids.includes(t.id)) : TEMPLATES;
  let total = 0;
  await withBrowser(async (browser, port) => {
    for (const t of list) {
      const probs = await auditOne(browser, port, t);
      // collapse repeated messages across times
      const seen = new Map();
      for (const p of probs) { const k = p.replace(/^[^:]+: /, ''); if (!seen.has(k)) seen.set(k, p.split(':')[0]); }
      if (seen.size) { console.log(`✖ ${t.id}`); for (const [k, first] of seen) console.log(`    ${first}: ${k}`); total += seen.size; }
      else console.log(`✔ ${t.id}`);
    }
  });
  console.log(total ? `\n${total} issue(s)` : '\nNo layout issues');
})().catch(e => { console.error(e); process.exit(1); });
