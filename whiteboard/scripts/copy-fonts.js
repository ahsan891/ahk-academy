// Self-host Excalidraw's fonts (otherwise they load from a public CDN).
import fs from 'node:fs';
fs.cpSync('node_modules/@excalidraw/excalidraw/dist/prod/fonts', 'public/fonts', { recursive: true });
console.log('Copied Excalidraw fonts to public/fonts');
