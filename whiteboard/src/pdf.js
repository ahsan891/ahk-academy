// Turn a PDF (or image) the teacher picks into image elements stacked down the board.
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';

async function sha1(text) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function fileToDataURL(file) {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
}
function imageSize(dataURL) {
  return new Promise(resolve => { const img = new Image(); img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight }); img.onerror = () => resolve({ w: 800, h: 600 }); img.src = dataURL; });
}

export async function pdfToPages(file, onProgress) {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  const count = Math.min(doc.numPages, 40);
  for (let i = 1; i <= count; i++) {
    onProgress?.(i, count);
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    pages.push({ dataURL: canvas.toDataURL('image/jpeg', 0.85), w: canvas.width, h: canvas.height });
  }
  return { pages, total: doc.numPages };
}

// Adds pages below the existing drawing (or at the current view if the board is empty).
export async function insertPages(api, rawPages, uploadFile) {
  const elements = api.getSceneElementsIncludingDeleted().filter(e => !e.isDeleted);
  const appState = api.getAppState();
  let x, y;
  if (elements.length) {
    const maxY = Math.max(...elements.map(e => e.y + (e.height || 0)));
    const minX = Math.min(...elements.map(e => e.x));
    x = minX; y = maxY + 80;
  } else {
    x = -appState.scrollX + 40; y = -appState.scrollY + 40;
  }
  const files = [], skeletons = [];
  for (const p of rawPages) {
    const id = await sha1(p.dataURL);
    const width = 900, height = Math.round(900 * p.h / p.w);
    files.push({ id, dataURL: p.dataURL, mimeType: p.dataURL.slice(5, p.dataURL.indexOf(';')), created: Date.now() });
    skeletons.push({ type: 'image', fileId: id, x, y, width, height, locked: true });
    y += height + 40;
  }
  api.addFiles(files);
  for (const f of files) await uploadFile(f);
  const newEls = convertToExcalidrawElements(skeletons);
  api.updateScene({ elements: [...api.getSceneElementsIncludingDeleted(), ...newEls] });
  api.scrollToContent(newEls[0], { fitToViewport: true, animate: true });
  return newEls.length;
}

export async function filesToPages(fileList, onProgress) {
  const out = [];
  for (const file of fileList) {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const { pages, total } = await pdfToPages(file, onProgress);
      out.push(...pages);
      if (total > pages.length) alertLimit(total);
    } else if (file.type.startsWith('image/')) {
      const dataURL = await fileToDataURL(file);
      const { w, h } = await imageSize(dataURL);
      out.push({ dataURL, w, h });
    }
  }
  return out;
}
function alertLimit(total) { console.warn(`PDF has ${total} pages; only the first 40 were added.`); }
