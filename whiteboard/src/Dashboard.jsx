import { useEffect, useState } from 'react';

function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  return new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, password }) });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) onLogin(data); else setError(data.error || 'Giriş yapılamadı.');
  }
  return (
    <div className="center-screen">
      <form className="card narrow" onSubmit={submit}>
        <img src="/logo.webp" alt="AHK Akademi" className="logo" />
        <h1>Öğretmen girişi</h1>
        <p className="muted">Öğrenciler giriş yapmaz; tahta bağlantısıyla doğrudan katılır.</p>
        <label htmlFor="login-name">Kullanıcı adı</label>
        <input id="login-name" autoComplete="username" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <label htmlFor="login-password">Şifre</label>
        <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-gold" type="submit" disabled={busy || !name || !password}>{busy ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
      </form>
    </div>
  );
}

export function Dashboard({ me, onLogout }) {
  const [boards, setBoards] = useState(null);
  const [title, setTitle] = useState('');
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const r = await fetch('/api/boards');
    if (r.status === 401) return onLogout();
    setBoards(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    const r = await fetch('/api/boards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim() || 'Yeni ders' }) });
    if (!r.ok) { setError('Tahta oluşturulamadı.'); return; }
    const b = await r.json();
    location.href = '/b/' + b.id;
  }
  async function rename(b) {
    const t = window.prompt('Tahtanın yeni adı:', b.title);
    if (!t || t === b.title) return;
    await fetch('/api/boards/' + b.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: t }) });
    load();
  }
  async function remove(b) {
    if (!window.confirm(`"${b.title}" silinsin mi? Bu geri alınamaz.`)) return;
    await fetch('/api/boards/' + b.id, { method: 'DELETE' });
    load();
  }
  function copy(b) {
    const url = location.origin + '/b/' + b.id;
    navigator.clipboard?.writeText(url).then(() => { setCopied(b.id); setTimeout(() => setCopied(''), 1800); }, () => window.prompt('Bağlantıyı kopyala:', url));
  }
  async function logout() { await fetch('/api/logout', { method: 'POST' }); onLogout(); }

  return (
    <div className="dash">
      <header className="dash-head">
        <img src="/logo.webp" alt="AHK Akademi" className="logo-sm" />
        <span className="dash-who">{me.name}{me.admin ? ' · yönetici' : ''}</span>
        <button className="btn btn-ghost" onClick={logout}>Çıkış</button>
      </header>
      <main className="dash-main">
        <h1>Tahtalarım</h1>
        <form className="new-board" onSubmit={create}>
          <label htmlFor="new-title" className="sr-only">Tahta adı</label>
          <input id="new-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn. Elif · IELTS Speaking · 3 Ekim" maxLength={120} />
          <button className="btn btn-gold" type="submit">+ Yeni tahta</button>
        </form>
        {error && <p className="error">{error}</p>}
        {boards === null ? <p className="muted">Yükleniyor…</p> : boards.length === 0 ? (
          <div className="empty">
            <h2>Henüz tahta yok</h2>
            <p className="muted">Her ders ya da öğrenci için bir tahta oluştur, bağlantısını derste paylaş. Öğrenciler giriş yapmadan katılır ve tahta otomatik kaydedilir.</p>
          </div>
        ) : (
          <ul className="board-list">
            {boards.map(b => (
              <li key={b.id} className="board-row">
                <a className="board-link" href={'/b/' + b.id}>
                  <strong>{b.title}</strong>
                  <span className="muted">{timeAgo(b.updatedAt)} · {b.elementCount} öğe{me.admin ? ` · ${b.owner}` : ''}{b.locked ? ' · 🔒' : ''}</span>
                </a>
                <div className="row-actions">
                  <button className="btn btn-sm" onClick={() => copy(b)}>{copied === b.id ? 'Kopyalandı ✓' : 'Bağlantı'}</button>
                  <button className="btn btn-sm" onClick={() => rename(b)}>Adını değiştir</button>
                  <button className="btn btn-sm danger" onClick={() => remove(b)}>Sil</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
