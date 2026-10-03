#!/usr/bin/env node
/* Static site generator for marketing/lead-magnets/site — no dependencies.
   Usage: node src/build.js [--base https://example.com/path/]
   The base URL is stored in src/config.json and site/site.config.json. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const cfgPath = path.join(__dirname, 'config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const argBase = process.argv.indexOf('--base');
if (argBase > -1 && process.argv[argBase + 1]) {
  cfg.baseUrl = process.argv[argBase + 1].replace(/\/?$/, '/');
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
}
cfg.buildDate = new Date().toISOString().slice(0, 10);
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');

const L = require('./layout');
const pages = ['index', 'level-test', 'level-test-en', 'alphabet', 'goal', 'ielts', 'hours', 'course7', 'cheatsheets', 'privacy'].map(n => require('./pages/' + n));

const write = (rel, content) => { const f = path.join(SITE, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };

for (const p of pages) {
  write(path.join(p.path, 'index.html'), L.page(p));
}

// 404 page (noindex, root-relative assets so it renders from any URL depth)
const nf = { path: '404/', og: 'index', lang: 'tr', noindex: true, title: 'Sayfa bulunamadı | AHK Akademi', description: 'Aradığın sayfa taşınmış veya kaldırılmış olabilir. Ücretsiz araçlara buradan dönebilirsin.', scripts: [], jsonld: [],
  body: ({ root }) => `<section class="hero" style="min-height:60vh;display:grid;align-items:center"><div class="hero-wm"></div><div class="container" style="text-align:center"><span class="eyebrow"><i class="star"></i> 404</span><h1>Bu sayfa <mark>kayıp</mark> — seviyen değil</h1><p class="lead" style="margin:0 auto">Aradığın sayfa taşınmış ya da kaldırılmış olabilir. Ücretsiz araçlar bir tık uzağında.</p><div class="hero-actions" style="justify-content:center"><a class="btn btn-gold btn-lg" href="${root}">Ücretsiz araçlara dön</a><a class="btn btn-ghost btn-lg" href="${root}ingilizce-seviye-testi/">Seviye testi</a></div></div></section>` };
let nfHtml = L.page(nf);
// make 404 asset/link paths absolute from the site root so it works at any depth (server knows the base path)
nfHtml = nfHtml.replace(/(href|src)="\.\.\//g, '$1="/');
write('404.html', nfHtml);

// sitemap + robots
const now = cfg.buildDate;
const urls = pages.map(p => {
  const alt = (p.alternates || []).map(a => `\n    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${cfg.baseUrl}${a.path}"/>`).join('');
  return `  <url>\n    <loc>${cfg.baseUrl}${p.path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${p.path === '' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${p.path === '' ? '1.0' : p.path === 'gizlilik/' ? '0.3' : '0.8'}</priority>${alt}\n  </url>`;
}).join('\n');
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${cfg.baseUrl}sitemap.xml\n`);

// favicon (brand star, navy on gold)
write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0E1F3E"/><polygon points="32,6 37.8,26.6 58.8,20 43,32 58.8,44 37.8,37.4 32,58 26.2,37.4 5.2,44 21,32 5.2,20 26.2,26.6" fill="#F5A61F"/></svg>`);

// record the base url inside the site so set-domain.js can rewrite it later
write('site.config.json', JSON.stringify({ baseUrl: cfg.baseUrl, builtAt: new Date().toISOString() }, null, 2) + '\n');

console.log(`Built ${pages.length + 1} pages into site/ with base ${cfg.baseUrl}`);
