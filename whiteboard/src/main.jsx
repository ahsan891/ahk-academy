import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@excalidraw/excalidraw/index.css';
import './styles.css';
import Board from './Board.jsx';
import { Dashboard, Login } from './Dashboard.jsx';

function App() {
  const [me, setMe] = useState(undefined); // undefined = loading, null = not logged in
  useEffect(() => { fetch('/api/me').then(r => r.json()).then(setMe).catch(() => setMe(null)); }, []);
  const m = location.pathname.match(/^\/b\/([A-Za-z0-9_-]{8,40})\/?$/);
  if (me === undefined) return <div className="center-screen"><p className="muted">Yükleniyor…</p></div>;
  if (m) return <Board boardId={m[1]} me={me} />;
  if (!me) return <Login onLogin={setMe} />;
  return <Dashboard me={me} onLogout={() => setMe(null)} />;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
