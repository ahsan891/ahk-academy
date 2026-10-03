import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Excalidraw, MainMenu, WelcomeScreen, reconcileElements, CaptureUpdateAction, exportToBlob } from '@excalidraw/excalidraw';
import { connectRoom, throttle } from './collab.js';
import { filesToPages, insertPages } from './pdf.js';

const NAME_KEY = 'ahk_wb_name';
function storedName() { try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; } }

export default function Board({ boardId, me }) {
  const [name, setName] = useState(me ? me.name : storedName());
  const [askName, setAskName] = useState(!me && !storedName());
  if (askName) return <NamePrompt onDone={n => { try { localStorage.setItem(NAME_KEY, n); } catch {} setName(n); setAskName(false); }} />;
  return <LiveBoard boardId={boardId} name={name} me={me} />;
}

function NamePrompt({ onDone }) {
  const [v, setV] = useState('');
  return (
    <div className="center-screen">
      <form className="card narrow" onSubmit={e => { e.preventDefault(); if (v.trim()) onDone(v.trim()); }}>
        <img src="/logo.webp" alt="AHK Akademi" className="logo" />
        <h1>Derse katıl</h1>
        <p className="muted">Öğretmenin ve diğer öğrenciler seni bu isimle görecek.</p>
        <label htmlFor="student-name">Adın</label>
        <input id="student-name" autoFocus value={v} onChange={e => setV(e.target.value)} maxLength={40} placeholder="Örn. Elif" />
        <button className="btn btn-gold" type="submit" disabled={!v.trim()}>Tahtaya gir</button>
      </form>
    </div>
  );
}

function LiveBoard({ boardId, name, me }) {
  const apiRef = useRef(null);
  const roomRef = useRef(null);
  const sentVersions = useRef(new Map());   // element id -> version we last sent/received
  const knownFiles = useRef(new Set());      // file ids already on the server
  const pendingFiles = useRef(new Set());
  const collaborators = useRef(new Map());
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('connecting');
  const [info, setInfo] = useState({ title: '', locked: false, canManage: false, isTeacher: !!me });
  const [users, setUsers] = useState([]);
  const [presenting, setPresenting] = useState(false);
  const [importing, setImporting] = useState('');
  const [copied, setCopied] = useState(false);
  const initRef = useRef(null);
  const fileInput = useRef(null);
  const presentingRef = useRef(false);
  presentingRef.current = presenting;

  const fetchFiles = useCallback(async ids => {
    const api = apiRef.current; if (!api) return;
    const have = api.getFiles();
    const missing = ids.filter(id => !have[id] && !pendingFiles.current.has(id));
    missing.forEach(id => pendingFiles.current.add(id));
    const got = await Promise.all(missing.map(id => fetch(`/api/boards/${boardId}/files/${id}`).then(r => (r.ok ? r.json() : null)).catch(() => null)));
    // a file can arrive a moment after the element that uses it; the server announces it with a 'file' message, so allow a refetch
    missing.forEach((id, i) => { if (!got[i]) pendingFiles.current.delete(id); });
    const files = got.filter(Boolean);
    files.forEach(f => knownFiles.current.add(f.id));
    if (files.length) api.addFiles(files);
  }, [boardId]);

  const uploads = useRef(new Map());        // file id -> in-flight upload promise
  const uploadFile = useCallback(f => {
    if (knownFiles.current.has(f.id)) return Promise.resolve(true);
    if (!uploads.current.has(f.id)) {
      uploads.current.set(f.id, (async () => {
        const r = await fetch(`/api/boards/${boardId}/files`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: f.id, mimeType: f.mimeType, dataURL: f.dataURL, created: f.created }) }).catch(() => null);
        uploads.current.delete(f.id);
        if (r && r.ok) { knownFiles.current.add(f.id); return true; }
        apiRef.current?.setToast({ message: 'Resim yüklenemedi (çok büyük olabilir).', closable: true, duration: 4000 });
        return false;
      })());
    }
    return uploads.current.get(f.id);
  }, [boardId]);

  const applyRemote = useCallback(remote => {
    const api = apiRef.current; if (!api) return;
    for (const el of remote) sentVersions.current.set(el.id, el.version);
    const merged = reconcileElements(api.getSceneElementsIncludingDeleted(), remote, api.getAppState());
    api.updateScene({ elements: merged, captureUpdate: CaptureUpdateAction.NEVER });
    const fileIds = remote.filter(e => e.type === 'image' && e.fileId).map(e => e.fileId);
    if (fileIds.length) fetchFiles(fileIds);
  }, [fetchFiles]);

  const updateCollaborators = useCallback(() => {
    apiRef.current?.updateScene({ collaborators: new Map(collaborators.current) });
  }, []);

  // connect once the editor is mounted
  useEffect(() => {
    if (!ready) return;
    const room = connectRoom({
      boardId, name,
      onStatus: setStatus,
      onMessage: msg => {
        const api = apiRef.current;
        if (msg.type === 'init') {
          setInfo({ title: msg.title, locked: msg.locked, canManage: msg.canManage, isTeacher: msg.isTeacher });
          room.canManage = msg.canManage;
          document.title = `${msg.title} · AHK Tahta`;
          msg.fileIds.forEach(id => knownFiles.current.add(id));
          applyRemote(msg.elements);
          if (!initRef.current) { initRef.current = true; if (msg.elements.some(e => !e.isDeleted)) setTimeout(() => api.scrollToContent(undefined, { fitToContent: true }), 50); }
          // re-send anything drawn while offline
          const local = api.getSceneElementsIncludingDeleted().filter(el => (msg.elements.find(r => r.id === el.id)?.version ?? -1) < el.version);
          if (local.length) room.send({ type: 'elements', elements: local });
        } else if (msg.type === 'elements') {
          applyRemote(msg.elements);
        } else if (msg.type === 'pointer') {
          collaborators.current.set(msg.id, { username: msg.name, pointer: msg.pointer, button: msg.button, selectedElementIds: msg.selected || {}, color: { background: msg.color, stroke: msg.color }, id: msg.id });
          updateCollaborators();
        } else if (msg.type === 'pointer-leave') {
          collaborators.current.delete(msg.id); updateCollaborators();
        } else if (msg.type === 'presence') {
          setUsers(msg.users);
          const ids = new Set(msg.users.map(u => u.id));
          for (const id of collaborators.current.keys()) if (!ids.has(id)) collaborators.current.delete(id);
          updateCollaborators();
        } else if (msg.type === 'locked') {
          setInfo(i => ({ ...i, locked: msg.locked }));
          if (!roomRef.current?.canManage) api.setToast({ message: msg.locked ? 'Öğretmen tahtayı kilitledi: şimdilik sadece izleyebilirsin.' : 'Tahta açıldı: çizebilirsin.', duration: 3500 });
        } else if (msg.type === 'file') {
          fetchFiles([msg.id]);
        } else if (msg.type === 'follow') {
          const st = api.getAppState();
          const zoom = msg.zoom;
          const cx = -msg.scrollX + msg.width / 2 / zoom, cy = -msg.scrollY + msg.height / 2 / zoom;
          api.updateScene({ appState: { zoom: { value: zoom }, scrollX: -cx + st.width / 2 / zoom, scrollY: -cy + st.height / 2 / zoom }, captureUpdate: CaptureUpdateAction.NEVER });
        } else if (msg.type === 'deleted') {
          setStatus('deleted');
        }
      },
    });
    roomRef.current = room;
    return () => room.close();
  }, [ready, boardId, name, applyRemote, fetchFiles, updateCollaborators]);

  const sendChanges = useMemo(() => throttle(elements => {
    const changed = elements.filter(el => (sentVersions.current.get(el.id) ?? -1) < el.version);
    if (!changed.length) return;
    changed.forEach(el => sentVersions.current.set(el.id, el.version));
    roomRef.current?.send({ type: 'elements', elements: changed });
  }, 60), []);

  const onChange = useCallback((elements, appState, files) => {
    if (!roomRef.current) return;
    sendChanges(elements);
    for (const id of Object.keys(files)) if (!knownFiles.current.has(id) && !uploads.current.has(id)) uploadFile(files[id]);
  }, [sendChanges, uploadFile]);

  const sendPointer = useMemo(() => throttle(p => roomRef.current?.send(p), 40), []);
  const onPointerUpdate = useCallback(({ pointer, button }) => {
    sendPointer({ type: 'pointer', pointer, button, selected: apiRef.current?.getAppState().selectedElementIds });
  }, [sendPointer]);

  const sendFollow = useMemo(() => throttle(() => {
    const st = apiRef.current?.getAppState(); if (!st) return;
    roomRef.current?.send({ type: 'follow', scrollX: st.scrollX, scrollY: st.scrollY, zoom: st.zoom.value, width: st.width, height: st.height });
  }, 120), []);
  const onScrollChange = useCallback(() => { if (presentingRef.current) sendFollow(); }, [sendFollow]);

  async function setLocked(locked) {
    await fetch(`/api/boards/${boardId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locked }) });
  }
  function copyLink() {
    const url = location.origin + '/b/' + boardId;
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }, () => window.prompt('Bağlantıyı kopyala:', url));
  }
  async function onPickFiles(e) {
    const list = [...e.target.files]; e.target.value = '';
    if (!list.length) return;
    try {
      setImporting('Hazırlanıyor…');
      const pages = await filesToPages(list, (i, n) => setImporting(`PDF sayfası ${i} / ${n}`));
      setImporting('Tahtaya ekleniyor…');
      const n = await insertPages(apiRef.current, pages, uploadFile);
      apiRef.current.setToast({ message: `${n} sayfa eklendi.`, duration: 2500 });
    } catch (err) {
      console.error(err);
      apiRef.current.setToast({ message: 'Dosya eklenemedi. PDF, PNG veya JPG dene.', closable: true });
    } finally { setImporting(''); }
  }
  async function exportPng() {
    const api = apiRef.current;
    const blob = await exportToBlob({ elements: api.getSceneElements(), appState: { ...api.getAppState(), exportBackground: true }, files: api.getFiles(), mimeType: 'image/png' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (info.title || 'tahta') + '.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  const viewOnly = info.locked && !info.canManage;
  if (status === 'notfound' || status === 'deleted') {
    return <div className="center-screen"><div className="card narrow"><img src="/logo.webp" alt="AHK Akademi" className="logo" /><h1>Tahta bulunamadı</h1><p className="muted">Bu bağlantı silinmiş ya da yanlış olabilir. Öğretmeninden yeni bağlantı iste.</p></div></div>;
  }

  return (
    <div className="board-wrap">
      <Excalidraw
        excalidrawAPI={api => { apiRef.current = api; if (!ready) setReady(true); }}
        onChange={onChange}
        onPointerUpdate={onPointerUpdate}
        onScrollChange={onScrollChange}
        isCollaborating
        viewModeEnabled={viewOnly}
        langCode="tr-TR"
        name={info.title || 'AHK Tahta'}
        UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false, export: { saveFileToDisk: true } }, tools: { image: true } }}
        renderTopRightUI={isMobile => isMobile ? null : (
          <div className="top-right">
            <div className="avatars" title={users.map(u => u.name).join(', ')}>
              {users.slice(0, 6).map(u => <span key={u.id} className="avatar" style={{ background: u.color }} title={u.name + (u.teacher ? ' (öğretmen)' : '')}>{(u.name || '?').slice(0, 1).toLocaleUpperCase('tr-TR')}</span>)}
              {users.length > 6 && <span className="avatar more">+{users.length - 6}</span>}
            </div>
            <button className="tb-btn primary" onClick={copyLink}>{copied ? 'Kopyalandı ✓' : 'Bağlantıyı paylaş'}</button>
          </div>
        )}
      >
        <MainMenu>
          <MainMenu.Item onSelect={copyLink}>Bağlantıyı paylaş</MainMenu.Item>
          <MainMenu.Item onSelect={() => fileInput.current?.click()}>PDF / resim ekle</MainMenu.Item>
          <MainMenu.Item onSelect={exportPng}>PNG olarak indir</MainMenu.Item>
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          <MainMenu.Separator />
          {me && <MainMenu.ItemLink href="/">Tüm tahtalarım</MainMenu.ItemLink>}
          <MainMenu.DefaultItems.Help />
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo><img src="/logo.webp" alt="AHK Akademi" style={{ height: 44 }} /></WelcomeScreen.Center.Logo>
            <WelcomeScreen.Center.Heading>{info.title || 'AHK Tahta'}: çizmeye başla, herkes anında görür.</WelcomeScreen.Center.Heading>
          </WelcomeScreen.Center>
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Hints.MenuHint />
        </WelcomeScreen>
      </Excalidraw>

      {info.canManage && (
        <div className="teacher-bar" role="toolbar" aria-label="Öğretmen araçları">
          <span className="tb-title">{info.title}</span>
          <span className="tb-people" title={users.map(u => u.name).join(', ')}>👥 {users.length}</span>
          <button className={`tb-btn ${info.locked ? 'on' : ''}`} onClick={() => setLocked(!info.locked)} title="Açıkken öğrenciler sadece izler">{info.locked ? '🔒 Öğrenciler izliyor' : '🔓 Herkes çizebilir'}</button>
          <button className={`tb-btn ${presenting ? 'on' : ''}`} onClick={() => { const v = !presenting; setPresenting(v); if (v) sendFollow(); }} title="Öğrencilerin ekranı senin baktığın yeri takip eder">{presenting ? '📡 Sunum açık' : '📡 Beni takip etsinler'}</button>
          <button className="tb-btn" onClick={() => fileInput.current?.click()}>📄 PDF / resim</button>
        </div>
      )}
      {status !== 'online' ? <div className="view-banner warn" role="status">Bağlantı koptu, yeniden bağlanıyor… Çizdiklerin kaybolmaz.</div>
        : viewOnly && <div className="view-banner">Öğretmen tahtayı kilitledi: izleme modundasın.</div>}
      {importing && <div className="importing" role="status">{importing}</div>}
      <input ref={fileInput} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" multiple hidden onChange={onPickFiles} />
    </div>
  );
}
