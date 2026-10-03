#!/usr/bin/env node
/* Tiny dependency-free static server for Railway / any Node host.
   - serves this folder, clean URLs (/ingilizce-seviye-testi → /ingilizce-seviye-testi/ → index.html)
   - correct MIME types, gzip/brotli (pre-compressed on the fly, cached in memory), cache headers
   - real 404 page, security headers, HEAD support
   Start: node server.js   (PORT env is respected, default 8080) */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json', '.map': 'application/json'
};
const COMPRESSIBLE = /\.(html|css|js|json|xml|txt|svg)$/;
const cache = new Map(); // key: file+encoding → {body, mtime}

function send(req, res, status, file, extraHeaders) {
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  let stat; try { stat = fs.statSync(file); } catch (e) { return notFound(req, res); }
  const headers = Object.assign({
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https:",
    'Cache-Control': /\/assets\//.test(file) ? 'public, max-age=31536000, immutable' : (ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=86400'),
    'Vary': 'Accept-Encoding',
    'Last-Modified': stat.mtime.toUTCString()
  }, extraHeaders || {});
  let body = fs.readFileSync(file);
  const ae = String(req.headers['accept-encoding'] || '');
  if (COMPRESSIBLE.test(ext) && body.length > 1024) {
    const enc = /\bbr\b/.test(ae) ? 'br' : (/\bgzip\b/.test(ae) ? 'gzip' : null);
    if (enc) {
      const key = file + ':' + enc;
      const hit = cache.get(key);
      if (hit && hit.mtime === stat.mtimeMs) body = hit.body;
      else { body = enc === 'br' ? zlib.brotliCompressSync(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } }) : zlib.gzipSync(body, { level: 8 }); cache.set(key, { body, mtime: stat.mtimeMs }); }
      headers['Content-Encoding'] = enc;
    }
  }
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}
function notFound(req, res) {
  const f = path.join(ROOT, '404.html');
  if (fs.existsSync(f)) return send(req, res, 404, f, { 'Cache-Control': 'no-cache' });
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('404 Not Found');
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { return notFound(req, res); }
  if (urlPath.includes('\0') || urlPath.split('/').includes('..')) return notFound(req, res);
  if (/\/(server\.js|package\.json|package-lock\.json|railway\.json|set-domain\.js|site\.config\.json|\.[^/]+)$/.test(urlPath) && !/\.well-known/.test(urlPath)) return notFound(req, res);
  if (urlPath === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
  let file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT)) return notFound(req, res);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!urlPath.endsWith('/')) { res.writeHead(301, { Location: urlPath + '/' + (new URL(req.url, 'http://x').search || '') }); return res.end(); }
    file = path.join(file, 'index.html');
  } else if (!path.extname(file) && fs.existsSync(file + '.html')) {
    file = file + '.html';
  }
  if (!fs.existsSync(file)) return notFound(req, res);
  send(req, res, 200, file);
});
server.listen(PORT, () => console.log('AHK lead-magnet site listening on port ' + PORT));
