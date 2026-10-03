#!/usr/bin/env node
/* End-to-end verification with Playwright against a running server (default http://127.0.0.1:8099).
   - desktop + mobile screenshots into previews/
   - no horizontal scroll, no console errors, JSON-LD parses, unique title/description/canonical
   - quiz flows end to end, form validation + KVKK consent, RTL rendering
   Usage: BASE=http://127.0.0.1:8099 node src/verify.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8099';
const ROOT = path.join(__dirname, '..');
const PREV = path.join(ROOT, 'previews');
fs.mkdirSync(PREV, { recursive: true });
const PAGES = ['/', '/ingilizce-seviye-testi/', '/en/english-level-test/', '/arapca-alfabe/', '/arapca-hedef-bulucu/', '/ielts-puan-hesaplama/', '/ingilizce-kac-ayda-ogrenilir/', '/7-gunluk-ingilizce-konusma/', '/kopya-kagitlari/', '/gizlilik/', '/404.html'];
const slug = (p) => p === '/' ? 'index' : p.replace(/^\/|\/$/g, '').replace(/\//g, '-').replace('.html', '');
const problems = [];
const note = (p, msg) => { problems.push(p + ': ' + msg); console.log('  !! ' + msg); };

(async () => {
  const browser = await chromium.launch();
  const seen = { title: {}, desc: {}, canon: {} };

  for (const p of PAGES) {
    console.log('==', p);
    for (const [kind, ctxOpts] of [['desktop', { viewport: { width: 1366, height: 900 } }], ['mobile', { ...devices['iPhone 12'], viewport: { width: 375, height: 812 } }]]) {
      const ctx = await browser.newContext(ctxOpts);
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));
      const resp = await page.goto(BASE + p, { waitUntil: 'networkidle' });
      if (p !== '/404.html' && resp.status() !== 200) note(p, 'status ' + resp.status());
      await page.evaluate(() => document.fonts.ready);
      // scroll through so reveal animations fire, then back up
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(400);
      const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      if (sw[0] > sw[1] + 1) note(p, kind + ' horizontal scroll ' + sw.join('>'));
      if (errors.length) note(p, kind + ' console errors: ' + errors.join(' | '));
      await page.screenshot({ path: path.join(PREV, slug(p) + '-' + kind + '.png'), fullPage: kind === 'mobile' ? false : false });
      if (kind === 'desktop') {
        const meta = await page.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name=description]')?.content, canon: document.querySelector('link[rel=canonical]')?.href, ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent), h1: document.querySelectorAll('h1').length, lang: document.documentElement.lang, hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => l.hreflang + '=' + l.href), og: document.querySelector('meta[property="og:image"]')?.content }));
        if (!meta.title || meta.title.length > 70) note(p, 'title missing/long: ' + meta.title);
        if (!meta.desc || meta.desc.length > 165) note(p, 'description missing/long (' + (meta.desc || '').length + ')');
        if (meta.h1 !== 1) note(p, 'h1 count ' + meta.h1);
        for (const k of ['title', 'desc', 'canon']) { if (seen[k][meta[k]]) note(p, 'duplicate ' + k + ' with ' + seen[k][meta[k]]); seen[k][meta[k]] = p; }
        try { const g = JSON.parse(meta.ld[0]); const types = g['@graph'].map(x => x['@type']); console.log('   JSON-LD types:', types.join(', ')); if (!g['@graph'].find(x => x['@type'] === 'Organization')) note(p, 'no Organization'); } catch (e) { note(p, 'JSON-LD parse error ' + e.message); }
        if (meta.hreflang.length) console.log('   hreflang:', meta.hreflang.join(' ; '));
        // OG image exists
        const ogPath = path.join(ROOT, 'site', new URL(meta.og).pathname);
        if (!fs.existsSync(ogPath)) note(p, 'og image missing ' + ogPath);
      }
      // ---------- interactive flows (mobile context = the harder one) ----------
      if (kind === 'mobile') {
        if (p === '/ingilizce-seviye-testi/' || p === '/en/english-level-test/') {
          await page.click('#start');
          await page.waitForSelector('#quiz:not([hidden])');
          for (let i = 0; i < 25; i++) {
            await page.waitForSelector('#quiz .opt');
            // answer correctly for first 15, wrong afterwards → expect B1-ish
            const Q = await page.evaluate(() => window.AHK_LEVEL_TEST.Q);
            const correct = Q[i].a;
            const pick = i < 15 ? correct : (correct + 1) % 4;
            await page.click('#quiz .opt[data-i="' + pick + '"]');
            await page.waitForTimeout(420);
          }
          await page.waitForSelector('#result.show');
          await page.waitForTimeout(1800);
          const level = await page.textContent('#result .r-level');
          console.log('   level test result:', level.trim());
          if (!/^B1\+?$/.test(level.trim())) note(p, 'unexpected level ' + level);
          await page.screenshot({ path: path.join(PREV, slug(p) + '-result-mobile.png') });
          // form validation
          await page.click('#lead button[type=submit]');
          await page.waitForTimeout(300);
          const invalid = await page.evaluate(() => document.querySelectorAll('#lead .invalid').length);
          if (!invalid) note(p, 'form validation did not flag empty submit');
          await page.fill('#lead [name=name]', 'Test Kullanıcı');
          await page.fill('#lead [name=email]', 'test@example.com');
          await page.click('#lead button[type=submit]');
          await page.waitForTimeout(300);
          const kvkkFlag = await page.evaluate(() => document.querySelector('#lead .check.invalid') !== null);
          if (!kvkkFlag) note(p, 'KVKK consent not enforced');
          await page.check('#lead [name=kvkk]');
          await page.click('#lead button[type=submit]');
          await page.waitForSelector('#lead .unlock.show', { timeout: 4000 });
          const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('ahk_leads') || '[]'));
          if (!stored.length || !stored[0].consents.kvkk) note(p, 'lead not stored offline with consent');
          console.log('   lead stored offline:', JSON.stringify(stored[0]).slice(0, 160) + '…');
          await page.screenshot({ path: path.join(PREV, slug(p) + '-unlock-mobile.png') });
        }
        if (p === '/arapca-alfabe/') {
          const dir = await page.evaluate(() => { const el = document.querySelector('.letter-detail .big'); const cs = getComputedStyle(el); return { dir: cs.direction, font: cs.fontFamily, text: el.textContent }; });
          console.log('   RTL check:', JSON.stringify(dir));
          if (dir.dir !== 'rtl' || !/Noto Naskh Arabic/.test(dir.font)) note(p, 'RTL/font problem ' + JSON.stringify(dir));
          const loaded = await page.evaluate(() => document.fonts.check('16px "Noto Naskh Arabic"'));
          if (!loaded) note(p, 'Arabic font not loaded');
          await page.click('.letter-tile:nth-child(18)'); // Ayn
          await page.waitForTimeout(500);
          const name = await page.textContent('#letter-detail h3');
          if (!/Ayn/.test(name)) note(p, 'letter detail did not update: ' + name);
          await page.click('#t-quiz'); await page.click('#astart');
          for (let i = 0; i < 10; i++) { await page.waitForSelector('#aquiz .opt'); const first = await page.$('#aquiz .opt'); await first.click(); await page.waitForTimeout(1250); }
          await page.waitForSelector('#aresult.show'); await page.waitForTimeout(1500);
          console.log('   alphabet quiz result:', (await page.textContent('#aresult .r-score')).trim());
          await page.screenshot({ path: path.join(PREV, slug(p) + '-result-mobile.png') });
        }
        if (p === '/arapca-hedef-bulucu/') {
          await page.click('#start');
          for (let i = 0; i < 6; i++) { await page.waitForSelector('#quiz .opt'); await page.click('#quiz .opt[data-i="1"]'); await page.waitForTimeout(420); }
          await page.waitForSelector('#result.show'); await page.waitForTimeout(1200);
          const t = await page.textContent('#result .r-title'); console.log('   goal result:', t.trim());
          if (!/Körfez/.test(t)) note(p, 'expected Gulf path, got ' + t);
          await page.screenshot({ path: path.join(PREV, slug(p) + '-result-mobile.png') });
        }
        if (p === '/ielts-puan-hesaplama/') {
          await page.fill('#l-raw', '35'); await page.$eval('#l-raw', e => { e.value = 35; e.dispatchEvent(new Event('input')); });
          await page.$eval('#r-raw', e => { e.value = 33; e.dispatchEvent(new Event('input')); });
          await page.selectOption('#w-band', '6'); await page.selectOption('#s-band', '7');
          await page.waitForTimeout(300);
          const o = await page.textContent('#overall'); console.log('   IELTS overall for L35 R33 W6 S7:', o.trim());
          if (o.trim() !== '7.0') note(p, 'IELTS overall wrong: ' + o); // (8+7.5+6+7)/4 = 7.125 → 7.0
          await page.screenshot({ path: path.join(PREV, slug(p) + '-result-mobile.png') });
        }
        if (p === '/ingilizce-kac-ayda-ogrenilir/') {
          await page.$eval('#weekly', e => { e.value = 10; e.dispatchEvent(new Event('input')); });
          await page.waitForTimeout(900);
          const m = await page.textContent('#months'); console.log('   months 0→B2 @10h:', m.trim());
          if (Math.abs(+m - 13) > 1) note(p, 'months estimate off: ' + m); // 550h/10 = 55 weeks ≈ 12.7 months
        }
      }
      await ctx.close();
    }
  }
  // sitemap completeness
  const sm = fs.readFileSync(path.join(ROOT, 'site/sitemap.xml'), 'utf8');
  for (const p of PAGES) { if (p === '/404.html') continue; const u = new RegExp('<loc>[^<]*' + p.replace(/\//g, '\\/') + '</loc>'); if (!u.test(sm)) note(p, 'missing from sitemap'); }
  // clean URL redirect + 404 + compression
  const http = require('http');
  const get = (u, h) => new Promise((res) => http.get(BASE + u, { headers: h || {} }, r => { let b = []; r.on('data', d => b.push(d)); r.on('end', () => res({ status: r.statusCode, headers: r.headers, len: Buffer.concat(b).length })); }));
  const r1 = await get('/ingilizce-seviye-testi'); if (r1.status !== 301) note('server', 'clean URL redirect status ' + r1.status);
  const r2 = await get('/yok-boyle-sayfa/'); if (r2.status !== 404) note('server', '404 status ' + r2.status);
  const r3 = await get('/', { 'accept-encoding': 'br, gzip' }); if (r3.headers['content-encoding'] !== 'br') note('server', 'no brotli'); if (!r3.headers['content-security-policy']) note('server', 'no CSP');
  console.log('   server: redirect', r1.status, '| 404', r2.status, '| encoding', r3.headers['content-encoding'], r3.len, 'bytes');
  await browser.close();
  console.log('\n' + (problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'ALL CHECKS PASSED'));
  process.exit(problems.length ? 1 : 0);
})();
