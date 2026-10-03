// WebSocket connection to the board room, with automatic reconnect.
export function connectRoom({ boardId, name, onMessage, onStatus }) {
  let ws = null, closed = false, retry = 0, timer = null;
  const queue = [];

  function open() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}/ws?board=${encodeURIComponent(boardId)}&name=${encodeURIComponent(name || '')}`);
    onStatus('connecting');
    ws.onopen = () => {
      retry = 0; onStatus('online');
      while (queue.length) ws.send(queue.shift());
    };
    ws.onmessage = ev => { try { onMessage(JSON.parse(ev.data)); } catch (e) { console.error(e); } };
    ws.onclose = ev => {
      if (closed) return;
      if (ev.code === 4404) { onStatus('notfound'); return; }
      onStatus('offline');
      timer = setTimeout(open, Math.min(10000, 500 * 2 ** retry++));
    };
  }
  open();

  return {
    send(msg) {
      const data = JSON.stringify(msg);
      if (ws && ws.readyState === 1) ws.send(data);
      else if (msg.type === 'elements') queue.push(data); // never lose drawing while reconnecting
    },
    close() { closed = true; clearTimeout(timer); ws && ws.close(); },
  };
}

export function throttle(fn, ms) {
  let last = 0, t = null, pending = null;
  return (...args) => {
    pending = args;
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...pending); pending = null; }
    else if (!t) t = setTimeout(() => { t = null; last = Date.now(); if (pending) fn(...pending); pending = null; }, ms - (now - last));
  };
}
