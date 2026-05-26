import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  // Rewrite absolute store77.net paths to local assets
  // e.g. /upload/... → /assets/store77.net/upload/...
  // e.g. /bitrix/... → /assets/store77.net/bitrix/...
  if (urlPath.startsWith('/upload/') || urlPath.startsWith('/bitrix/') || urlPath.startsWith('/local/')) {
    urlPath = '/assets/store77.net' + urlPath;
  }

  const filePath = path.join(ROOT, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  let resolved = filePath;

  // If no extension, try .html
  if (!path.extname(resolved) && !fs.existsSync(resolved)) {
    if (fs.existsSync(resolved + '.html')) resolved += '.html';
    else if (fs.existsSync(path.join(resolved, 'index.html'))) resolved = path.join(resolved, 'index.html');
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    // Try index.html in dir
    const idx = path.join(resolved, 'index.html');
    if (fs.existsSync(idx)) {
      resolved = idx;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1><p><a href="/">Home</a> | <a href="/catalogue.html">Catalogue</a> | <a href="/card.html">Card</a></p>');
      return;
    }
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(resolved);
    res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': data.length });
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Store77 local site running at http://localhost:${PORT}`);
  console.log(`  Catalogue: http://localhost:${PORT}/catalogue.html`);
  console.log(`  Card:      http://localhost:${PORT}/card.html`);
});
