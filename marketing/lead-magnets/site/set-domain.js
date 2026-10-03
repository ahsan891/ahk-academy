#!/usr/bin/env node
/* Rewrites every absolute site URL (canonical, og:url, og:image, hreflang, JSON-LD, sitemap, robots)
   from the current base (site.config.json) to a new one. Run inside the site folder:
     node set-domain.js https://ahkademy.com/
     node set-domain.js https://araclar.ahkademy.com/
     node set-domain.js https://ahkademy.com/ucretsiz/
   Relative asset/link paths are untouched, so the site keeps working on any host. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const cfgFile = path.join(ROOT, 'site.config.json');
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
let next = process.argv[2];
if (!next) { console.error('Usage: node set-domain.js https://your-domain.com/[optional-path/]\nCurrent base: ' + cfg.baseUrl); process.exit(1); }
if (!/^https?:\/\//.test(next)) next = 'https://' + next;
next = next.replace(/\/?$/, '/');
const old = cfg.baseUrl;
if (old === next) { console.log('Base URL is already ' + next); process.exit(0); }
let files = 0, replacements = 0;
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const f = path.join(dir, name);
    if (fs.statSync(f).isDirectory()) { if (name !== 'node_modules' && name !== 'assets') walk(f); continue; }
    if (!/\.(html|xml|txt|json)$/.test(name) || name === 'site.config.json' || name === 'package.json' || name === 'railway.json') continue;
    const src = fs.readFileSync(f, 'utf8');
    const n = src.split(old).length - 1;
    if (n) { fs.writeFileSync(f, src.split(old).join(next)); files++; replacements += n; }
  }
})(ROOT);
cfg.baseUrl = next; cfg.domainChangedAt = new Date().toISOString();
fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2) + '\n');
console.log(`Rewrote ${replacements} URLs in ${files} files: ${old} → ${next}`);
