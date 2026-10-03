// AHK Akademi whiteboard server: static app + teacher auth + board storage + live collaboration (WebSocket).
// No database needed: boards are JSON files in DATA_DIR (mount a Railway volume there so they survive deploys).
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const BOARDS_DIR = path.join(DATA_DIR, 'boards');
const FILES_DIR = path.join(DATA_DIR, 'files');
const PORT = Number(process.env.PORT || 3000);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // per image / PDF page (as data URL)
const SESSION_DAYS = 30;

fs.mkdirSync(BOARDS_DIR, { recursive: true });
fs.mkdirSync(FILES_DIR, { recursive: true });

/* ---------------- Teachers & sessions ----------------
   TEACHERS="ahsan:StrongPass1:admin,brishna:StrongPass2"  (name:password[:admin])
   SESSION_SECRET=<long random string>                        (keeps logins valid across restarts) */
function loadTeachers() {
  const raw = process.env.TEACHERS || '';
  const map = new Map();
  for (const entry of raw.split(',').map(s => s.trim()).filter(Boolean)) {
    const [name, password, role] = entry.split(':');
    if (name && password) map.set(name.toLowerCase(), { name, password, admin: role === 'admin' });
  }
  return map;
}
const TEACHERS = loadTeachers();
if (!TEACHERS.size) console.warn('[whiteboard] No TEACHERS configured: nobody can log in. Set TEACHERS="name:password:admin".');
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) console.warn('[whiteboard] SESSION_SECRET not set: logins reset when the server restarts.');

function sign(value) { return crypto.createHmac('sha256', SECRET).update(value).digest('base64url'); }
function makeSession(name) {
  const payload = Buffer.from(JSON.stringify({ n: name, e: Date.now() + SESSION_DAYS * 864e5 })).toString('base64url');
  return payload + '.' + sign(payload);
}
function readSession(req) {
  const cookie = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('wb_session='));
  if (!cookie) return null;
  const [payload, mac] = cookie.slice('wb_session='.length).split('.');
  if (!payload || !mac) return null;
  const expected = sign(payload);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const { n, e } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() > e) return null;
    return TEACHERS.get(String(n).toLowerCase()) || null;
  } catch { return null; }
}
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest(), hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/* ---------------- Board storage ---------------- */
const ID_RE = /^[A-Za-z0-9_-]{8,40}$/;
const boards = new Map(); // id -> board (loaded on demand)
const saveTimers = new Map();

function newId(len = 14) { return crypto.randomBytes(len).toString('base64url').slice(0, len); }
function boardPath(id) { return path.join(BOARDS_DIR, id + '.json'); }
function filesDir(id) { return path.join(FILES_DIR, id); }

async function loadBoard(id) {
  if (!ID_RE.test(id)) return null;
  if (boards.has(id)) return boards.get(id);
  try {
    const b = JSON.parse(await fsp.readFile(boardPath(id), 'utf8'));
    b.elements = new Map((b.elements || []).map(el => [el.id, el]));
    boards.set(id, b);
    return b;
  } catch { return null; }
}
function serializeBoard(b) { return JSON.stringify({ ...b, elements: [...b.elements.values()] }); }
function scheduleSave(b) {
  clearTimeout(saveTimers.get(b.id));
  saveTimers.set(b.id, setTimeout(() => {
    saveTimers.delete(b.id);
    const tmp = boardPath(b.id) + '.tmp';
    fsp.writeFile(tmp, serializeBoard(b)).then(() => fsp.rename(tmp, boardPath(b.id))).catch(err => console.error('save failed', b.id, err));
  }, 800));
}
async function listBoards() {
  const out = [];
  for (const f of await fsp.readdir(BOARDS_DIR)) {
    if (!f.endsWith('.json')) continue;
    const b = await loadBoard(f.slice(0, -5));
    if (b) out.push({ id: b.id, title: b.title, owner: b.owner, createdAt: b.createdAt, updatedAt: b.updatedAt, locked: !!b.locked, elementCount: [...b.elements.values()].filter(e => !e.isDeleted).length });
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}
// Same rule Excalidraw uses to reconcile: higher version wins; on a tie the lower versionNonce wins.
function mergeElement(b, el) {
  if (!el || typeof el.id !== 'string' || typeof el.version !== 'number') return false;
  const cur = b.elements.get(el.id);
  if (!cur || el.version > cur.version || (el.version === cur.version && el.versionNonce < cur.versionNonce)) {
    b.elements.set(el.id, el);
    return true;
  }
  return false;
}

/* ---------------- HTTP helpers ---------------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json' };
const SECURITY_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'SAMEORIGIN' };

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}
function json(res, status, data, headers = {}) { send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }); }
function readBody(req, limit = 1e6) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
async function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath).replace(/^\/+/, '');
  let file = path.join(DIST, rel);
  if (!file.startsWith(DIST)) return send(res, 403, 'Forbidden');
  let stat = await fsp.stat(file).catch(() => null);
  if (!stat || stat.isDirectory()) { file = path.join(DIST, 'index.html'); stat = await fsp.stat(file).catch(() => null); } // SPA fallback
  if (!stat) return send(res, 404, 'Not found');
  const ext = path.extname(file);
  const immutable = rel.startsWith('assets/') || rel.startsWith('fonts/');
  const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' };
  const compressible = /\.(html|js|mjs|css|json|svg|txt|map)$/.test(ext);
  if (compressible && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    res.writeHead(200, { ...SECURITY_HEADERS, ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
    fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
  } else {
    res.writeHead(200, { ...SECURITY_HEADERS, ...headers, 'Content-Length': stat.size });
    fs.createReadStream(file).pipe(res);
  }
}

/* ---------------- API ---------------- */
const loginAttempts = new Map(); // ip -> {count, until}
async function handleApi(req, res, url) {
  const teacher = readSession(req);
  const parts = url.pathname.split('/').filter(Boolean); // ['api', ...]

  if (url.pathname === '/api/login' && req.method === 'POST') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    const a = loginAttempts.get(ip);
    if (a && a.until > Date.now()) return json(res, 429, { error: 'Çok fazla deneme. 1 dakika sonra tekrar dene.' });
    const { name = '', password = '' } = await readBody(req).catch(() => ({}));
    const t = TEACHERS.get(String(name).trim().toLowerCase());
    if (!t || !safeEqual(password, t.password)) {
      const n = (a?.count || 0) + 1;
      loginAttempts.set(ip, { count: n, until: n >= 5 ? Date.now() + 60e3 : 0 });
      return json(res, 401, { error: 'Kullanıcı adı veya şifre yanlış.' });
    }
    loginAttempts.delete(ip);
    const secure = (req.headers['x-forwarded-proto'] || '').includes('https') ? '; Secure' : '';
    return json(res, 200, { name: t.name, admin: t.admin }, { 'Set-Cookie': `wb_session=${makeSession(t.name)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}` });
  }
  if (url.pathname === '/api/logout' && req.method === 'POST') {
    return json(res, 200, { ok: true }, { 'Set-Cookie': 'wb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
  }
  if (url.pathname === '/api/me') return json(res, 200, teacher ? { name: teacher.name, admin: teacher.admin } : null);

  if (parts[1] === 'boards' && parts.length === 2) {
    if (!teacher) return json(res, 401, { error: 'Giriş yapmalısın.' });
    if (req.method === 'GET') {
      const all = await listBoards();
      return json(res, 200, teacher.admin ? all : all.filter(b => b.owner.toLowerCase() === teacher.name.toLowerCase()));
    }
    if (req.method === 'POST') {
      const { title } = await readBody(req).catch(() => ({}));
      const now = Date.now();
      const b = { id: newId(), title: String(title || 'Yeni ders').slice(0, 120), owner: teacher.name, createdAt: now, updatedAt: now, locked: false, elements: new Map(), fileIds: [] };
      boards.set(b.id, b);
      await fsp.writeFile(boardPath(b.id), serializeBoard(b));
      return json(res, 201, { id: b.id, title: b.title });
    }
  }

  if (parts[1] === 'boards' && parts[2]) {
    const b = await loadBoard(parts[2]);
    if (!b) return json(res, 404, { error: 'Tahta bulunamadı.' });
    const canManage = teacher && (teacher.admin || b.owner.toLowerCase() === teacher.name.toLowerCase());

    if (parts.length === 3 && req.method === 'GET') { // anyone with the link
      return json(res, 200, { id: b.id, title: b.title, owner: b.owner, locked: !!b.locked, elements: [...b.elements.values()], fileIds: b.fileIds || [], canManage: !!canManage, isTeacher: !!teacher });
    }
    if (parts.length === 3 && req.method === 'PATCH') {
      if (!canManage) return json(res, 403, { error: 'Bu tahtayı yalnızca sahibi değiştirebilir.' });
      const body = await readBody(req).catch(() => ({}));
      if (typeof body.title === 'string') b.title = body.title.slice(0, 120);
      if (typeof body.locked === 'boolean') { b.locked = body.locked; broadcast(b.id, { type: 'locked', locked: b.locked }); }
      b.updatedAt = Date.now(); scheduleSave(b);
      return json(res, 200, { ok: true });
    }
    if (parts.length === 3 && req.method === 'DELETE') {
      if (!canManage) return json(res, 403, { error: 'Bu tahtayı yalnızca sahibi silebilir.' });
      broadcast(b.id, { type: 'deleted' });
      boards.delete(b.id); clearTimeout(saveTimers.get(b.id));
      await fsp.rm(boardPath(b.id), { force: true });
      await fsp.rm(filesDir(b.id), { recursive: true, force: true });
      return json(res, 200, { ok: true });
    }
    if (parts[3] === 'files' && parts[4] && req.method === 'GET') { // one image (Excalidraw BinaryFileData)
      const fid = parts[4];
      if (!ID_RE.test(fid) && !/^[a-f0-9]{20,64}$/.test(fid)) return json(res, 400, { error: 'bad id' });
      const data = await fsp.readFile(path.join(filesDir(b.id), fid + '.json')).catch(() => null);
      if (!data) return json(res, 404, { error: 'not found' });
      return send(res, 200, data, { 'Content-Type': 'application/json', 'Cache-Control': 'private, max-age=31536000, immutable' });
    }
    if (parts[3] === 'files' && parts.length === 4 && req.method === 'POST') {
      if (b.locked && !canManage) return json(res, 403, { error: 'Tahta kilitli.' });
      const file = await readBody(req, MAX_FILE_BYTES * 1.4).catch(() => null);
      if (!file || typeof file.id !== 'string' || !/^data:(image\/(png|jpeg|webp|gif|svg\+xml)|application\/pdf);base64,/.test(file.dataURL || '')) return json(res, 400, { error: 'Geçersiz dosya.' });
      if (!ID_RE.test(file.id) && !/^[a-f0-9]{20,64}$/.test(file.id)) return json(res, 400, { error: 'bad id' });
      await fsp.mkdir(filesDir(b.id), { recursive: true });
      await fsp.writeFile(path.join(filesDir(b.id), file.id + '.json'), JSON.stringify({ id: file.id, mimeType: file.mimeType, dataURL: file.dataURL, created: file.created || Date.now() }));
      if (!b.fileIds.includes(file.id)) { b.fileIds.push(file.id); scheduleSave(b); }
      broadcast(b.id, { type: 'file', id: file.id });
      return json(res, 201, { ok: true });
    }
  }
  return json(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/healthz') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    return await serveStatic(req, res, url.pathname);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) json(res, 500, { error: 'Sunucu hatası' });
  }
});

/* ---------------- Live collaboration ----------------
   Client → server: hello, elements, pointer, follow, ping
   Server → client: init, elements, pointer, presence, follow, locked, file, deleted */
const rooms = new Map(); // boardId -> Set<ws>
function broadcast(boardId, msg, except) {
  const set = rooms.get(boardId); if (!set) return;
  const data = JSON.stringify(msg);
  for (const ws of set) if (ws !== except && ws.readyState === 1) ws.send(data);
}
function presence(boardId) {
  const set = rooms.get(boardId); if (!set) return;
  broadcast(boardId, { type: 'presence', users: [...set].map(ws => ({ id: ws.clientId, name: ws.userName, color: ws.color, teacher: ws.isTeacher })) });
}
const COLORS = ['#1F5FAE', '#E8590C', '#2F9E44', '#C2255C', '#7048E8', '#0C8599', '#F08C00', '#9C36B5'];

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8 * 1024 * 1024 });
wss.on('connection', async (ws, req) => {
  const url = new URL(req.url, 'http://x');
  const b = await loadBoard(url.searchParams.get('board') || '');
  if (!b) { ws.close(4404, 'board not found'); return; }
  const teacher = readSession(req);
  ws.boardId = b.id;
  ws.clientId = newId(8);
  ws.isTeacher = !!teacher;
  ws.canManage = !!teacher && (teacher.admin || b.owner.toLowerCase() === teacher.name.toLowerCase());
  ws.userName = teacher ? teacher.name : (url.searchParams.get('name') || 'Öğrenci').slice(0, 40);
  if (!rooms.has(b.id)) rooms.set(b.id, new Set());
  const room = rooms.get(b.id);
  ws.color = COLORS[room.size % COLORS.length];
  room.add(ws);
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.send(JSON.stringify({ type: 'init', clientId: ws.clientId, color: ws.color, name: ws.userName, isTeacher: ws.isTeacher, canManage: ws.canManage, locked: !!b.locked, title: b.title, elements: [...b.elements.values()], fileIds: b.fileIds || [] }));
  presence(b.id);

  ws.on('message', raw => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    if (msg.type === 'elements' && Array.isArray(msg.elements)) {
      if (b.locked && !ws.canManage) return; // view-only for students while locked
      const changed = msg.elements.filter(el => mergeElement(b, el));
      if (changed.length) {
        b.updatedAt = Date.now(); scheduleSave(b);
        broadcast(b.id, { type: 'elements', elements: changed }, ws);
      }
    } else if (msg.type === 'pointer') {
      broadcast(b.id, { type: 'pointer', id: ws.clientId, name: ws.userName, color: ws.color, pointer: msg.pointer, button: msg.button, tool: msg.tool, selected: msg.selected }, ws);
    } else if (msg.type === 'follow' && ws.canManage) {
      broadcast(b.id, { type: 'follow', scrollX: msg.scrollX, scrollY: msg.scrollY, zoom: msg.zoom, width: msg.width, height: msg.height }, ws);
    }
  });
  ws.on('close', () => {
    room.delete(ws);
    if (!room.size) rooms.delete(b.id);
    broadcast(b.id, { type: 'pointer-leave', id: ws.clientId });
    presence(b.id);
  });
});
setInterval(() => { for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; ws.ping(); } }, 30000);

server.listen(PORT, () => console.log(`[whiteboard] listening on :${PORT} (data: ${DATA_DIR}, teachers: ${TEACHERS.size})`));
