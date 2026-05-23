/**
 * build-local-site.mjs
 * Downloads all assets from store77.net referenced in catalogue.html and card.html,
 * rewrites all paths to relative local paths, and outputs a self-contained local-site/
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const OUT_DIR = path.resolve('./local-site');
const ASSETS_DIR = path.join(OUT_DIR, 'assets');

// Only download URLs with these extensions
const ASSET_EXTENSIONS = new Set([
  '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.otf', '.mp4', '.mp3', '.json'
]);

// Domains that need to be mirrored locally for visual correctness
const MIRROR_DOMAINS = [
  'store77.net',
  'maxcdn.bootstrapcdn.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

const downloaded = new Map(); // url -> local absolute path
const failed = new Set();

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function getExtension(urlStr) {
  try {
    const u = new URL(urlStr);
    const p = u.pathname;
    const dot = p.lastIndexOf('.');
    if (dot === -1) return '';
    return p.slice(dot).toLowerCase().split('?')[0];
  } catch { return ''; }
}

function isAssetUrl(urlStr) {
  const ext = getExtension(urlStr);
  return ASSET_EXTENSIONS.has(ext);
}

function normalizeUrl(raw) {
  if (!raw) return null;
  raw = raw.trim();
  if (!raw || raw.startsWith('data:') || raw.startsWith('blob:') || raw.startsWith('javascript:') || raw.startsWith('#') || raw === '') return null;
  try {
    if (raw.startsWith('//')) raw = 'https:' + raw;
    if (!raw.startsWith('http')) raw = 'https://' + raw;
    const u = new URL(raw);
    return u.protocol + '//' + u.host + u.pathname;
  } catch {
    return null;
  }
}

function urlToLocalPath(urlStr) {
  try {
    const u = new URL(urlStr);
    const localFilePath = path.join(ASSETS_DIR, u.hostname, u.pathname);
    return localFilePath;
  } catch {
    return null;
  }
}

function urlToRelPath(urlStr, fromFile) {
  const localAbs = urlToLocalPath(urlStr);
  if (!localAbs) return null;
  return path.relative(path.dirname(fromFile), localAbs).replace(/\\/g, '/');
}

function shouldMirror(urlStr) {
  try {
    const u = new URL(urlStr);
    const host = u.hostname;
    return MIRROR_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  } catch { return false; }
}

async function fetchUrl(urlStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.get({
      hostname: u.hostname,
      path: u.pathname + (u.search || ''),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Referer': 'https://store77.net/',
      },
      timeout: 30000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = u.protocol + '//' + u.hostname + loc;
        fetchUrl(loc).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), contentType: res.headers['content-type'] || '' }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function downloadAsset(urlStr) {
  if (downloaded.has(urlStr)) return downloaded.get(urlStr);
  if (failed.has(urlStr)) return null;

  const localPath = urlToLocalPath(urlStr);
  if (!localPath) { failed.add(urlStr); return null; }

  if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
    downloaded.set(urlStr, localPath);
    return localPath;
  }

  console.log(`  ↓ ${urlStr}`);
  try {
    const res = await fetchUrl(urlStr);
    if (res.status !== 200) {
      console.log(`    ✗ HTTP ${res.status}`);
      failed.add(urlStr);
      return null;
    }
    ensureDir(path.dirname(localPath));
    fs.writeFileSync(localPath, res.body);
    downloaded.set(urlStr, localPath);

    // Parse CSS for sub-assets
    if (urlStr.endsWith('.css') || res.contentType.includes('css')) {
      await processCssAssets(localPath, urlStr);
    }
    return localPath;
  } catch (e) {
    console.log(`    ✗ ${e.message.slice(0, 80)}`);
    failed.add(urlStr);
    return null;
  }
}

function extractCssUrls(css) {
  const urls = [];
  const re = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    if (!m[1].startsWith('data:')) urls.push(m[1]);
  }
  const importRe = /@import\s+['"]([^'"]+)['"]/g;
  while ((m = importRe.exec(css)) !== null) urls.push(m[1]);
  return urls;
}

async function processCssAssets(localCssPath, sourceUrl) {
  const content = fs.readFileSync(localCssPath, 'utf8');
  const refs = extractCssUrls(content);
  let rewritten = content;

  for (const ref of refs) {
    let absUrl;
    try {
      if (ref.startsWith('http')) absUrl = ref;
      else if (ref.startsWith('//')) absUrl = 'https:' + ref;
      else absUrl = new URL(ref, sourceUrl).href;
    } catch { continue; }

    const norm = normalizeUrl(absUrl);
    if (!norm || !shouldMirror(norm) || !isAssetUrl(norm)) continue;

    const localAsset = await downloadAsset(norm);
    if (localAsset) {
      const rel = path.relative(path.dirname(localCssPath), localAsset).replace(/\\/g, '/');
      // Replace all occurrences of this ref in CSS
      rewritten = rewritten.split(ref).join(rel);
    }
  }

  if (rewritten !== content) {
    fs.writeFileSync(localCssPath, rewritten, 'utf8');
  }
}

function extractHtmlUrls(html) {
  const urls = new Set();

  const patterns = [
    /(?:src|href|data-src|data-lazy-src|data-original)\s*=\s*"([^"]+)"/gi,
    /(?:src|href|data-src|data-lazy-src|data-original)\s*=\s*'([^']+)'/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      urls.add(m[1]);
    }
  }

  // srcset
  const srcsetRe = /srcset\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = srcsetRe.exec(html)) !== null) {
    m[1].split(',').forEach(part => {
      const u = part.trim().split(/\s+/)[0];
      if (u) urls.add(u);
    });
  }

  // url() in inline styles
  const urlRe = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
  while ((m = urlRe.exec(html)) !== null) {
    if (!m[1].startsWith('data:')) urls.add(m[1]);
  }

  // content= img paths
  const contentRe = /content\s*=\s*['"]([^'"]*\.(?:png|jpg|svg|gif|webp)[^'"]*)['"]/gi;
  while ((m = contentRe.exec(html)) !== null) urls.add(m[1]);

  return [...urls];
}

function rewriteHtmlUrls(html, outputPath) {
  let result = html;

  // Rewrite src/href/data-src attributes
  const attrPatterns = [
    { re: /((?:src|href|data-src|data-lazy-src|data-original)\s*=\s*")([^"]+)(")/g },
    { re: /((?:src|href|data-src|data-lazy-src|data-original)\s*=\s*')([^']+)(')/g },
  ];

  for (const { re } of attrPatterns) {
    result = result.replace(re, (full, pre, val, post) => {
      if (val.startsWith('data:') || val.startsWith('blob:') || val.startsWith('javascript:') || val.startsWith('#')) return full;
      const abs = normalizeUrl(val);
      if (!abs || !shouldMirror(abs) || !downloaded.has(abs)) return full;
      const rel = urlToRelPath(abs, outputPath);
      return rel ? pre + rel + post : full;
    });
  }

  // Rewrite srcset
  result = result.replace(/(srcset\s*=\s*")([^"]+)(")/g, (full, pre, val, post) => {
    const parts = val.split(',').map(part => {
      const tokens = part.trim().split(/\s+/);
      const url = tokens[0];
      const rest = tokens.slice(1).join(' ');
      const abs = normalizeUrl(url);
      if (!abs || !shouldMirror(abs) || !downloaded.has(abs)) return part.trim();
      const rel = urlToRelPath(abs, outputPath);
      return rel ? (rel + (rest ? ' ' + rest : '')) : part.trim();
    });
    return pre + parts.join(', ') + post;
  });

  // Rewrite url() in inline styles
  result = result.replace(/url\(\s*(['"]?)([^'")\s]+)\1\s*\)/g, (full, quote, val) => {
    if (val.startsWith('data:')) return full;
    const abs = normalizeUrl(val);
    if (!abs || !shouldMirror(abs) || !downloaded.has(abs)) return full;
    const rel = urlToRelPath(abs, outputPath);
    return rel ? `url(${quote}${rel}${quote})` : full;
  });

  return result;
}

function rewriteProductLinksInCatalogue(html) {
  // In catalogue: any <a> linking to a product detail page -> ./card.html
  // Product pages are under store77.net/<category>/<product-slug>/
  // We identify them by patterns in the href
  return html.replace(/(<a\s[^>]*?)href\s*=\s*"([^"]*)"([^>]*>)/gi, (full, pre, href, post) => {
    const norm = normalizeUrl(href);
    if (!norm) return full;
    try {
      const u = new URL(norm);
      if (u.hostname !== 'store77.net') return full;
      // Skip pure navigation links (root, category, service pages)
      const parts = u.pathname.replace(/^\/|\/$/g, '').split('/');
      // Product pages have at least 2 path segments: category/product-slug/
      // But we want to capture product detail links specifically
      // Heuristic: if href was originally a store77 link used inside a .catalog-item or .item-title context
      // We'll replace all store77.net hrefs that aren't CSS/JS/image assets
      if (!isAssetUrl(norm)) {
        return pre + 'href="./card.html"' + post;
      }
    } catch {}
    return full;
  });
}

function cleanTrackingScripts(html) {
  // Remove external tracking/analytics scripts that serve no visual purpose
  const trackingPatterns = [
    /mc\.yandex\.(?:com|ru)/,
    /top-fwz1\.mail\.ru/,
    /cdn-ru\.bitrix24\.ru.*?crm/,
    /cdn\.bitrix24\.ru.*?crm/,
    /cloud\.roistat\.com/,
    /cdn\.retailrocket\.ru/,
    /bitrix\.info\/ba\.js/,
    /get\.aplaut\.io/,
    /smartcaptcha\.yandexcloud/,
    /yastatic\.net/,
  ];

  // Remove script tags with these sources
  html = html.replace(/<script[^>]+src\s*=\s*["'][^"']+["'][^>]*><\/script>/gi, (match) => {
    if (trackingPatterns.some(re => re.test(match))) return '<!-- tracking removed -->';
    return match;
  });

  // Remove pixel images
  html = html.replace(/<img[^>]*(?:mc\.yandex|top-fwz1\.mail)[^>]*>/gi, '');

  // Remove body[unresolved] style that hides content
  html = html.replace(/body\s*\[unresolved\]\s*\{[^}]*\}/g, '');

  return html;
}

async function downloadBatch(urls, concurrency = 6) {
  for (let i = 0; i < urls.length; i += concurrency) {
    await Promise.all(urls.slice(i, i + concurrency).map(u => downloadAsset(u)));
  }
}

async function processHtmlFile(inputPath, outputPath, isCatalogue) {
  console.log(`\n📄 Processing: ${path.basename(inputPath)}`);
  const html = fs.readFileSync(inputPath, 'utf8');

  const rawUrls = extractHtmlUrls(html);
  console.log(`   Found ${rawUrls.length} URL references`);

  // Filter to only downloadable asset URLs
  const toDownload = [];
  for (const raw of rawUrls) {
    if (!raw || raw.startsWith('data:') || raw.startsWith('blob:') || raw.startsWith('javascript:') || raw.startsWith('#')) continue;
    const abs = normalizeUrl(raw);
    if (!abs || !shouldMirror(abs) || !isAssetUrl(abs)) continue;
    if (!toDownload.includes(abs)) toDownload.push(abs);
  }

  console.log(`   Downloading ${toDownload.length} assets...`);
  await downloadBatch(toDownload);

  console.log(`   Rewriting URLs...`);
  let result = rewriteHtmlUrls(html, outputPath);

  if (isCatalogue) {
    result = rewriteProductLinksInCatalogue(result);
  }

  result = cleanTrackingScripts(result);

  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, result, 'utf8');
  console.log(`   ✓ Written: ${outputPath}`);
}

async function setupFontAwesome() {
  console.log('\n📦 Font Awesome 4.7.0...');
  const cssUrl = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
  await downloadAsset(cssUrl);
  // Fonts are extracted from CSS automatically via processCssAssets
}

function createGoogleFontsStub() {
  // Store77 loads Open Sans from its own server, so we just need a stub
  const stubDir = path.join(ASSETS_DIR, 'fonts.googleapis.com');
  ensureDir(stubDir);
  const stubFile = path.join(stubDir, 'css');
  fs.writeFileSync(stubFile, '/* Google Fonts stub */\n', 'utf8');
  downloaded.set('https://fonts.googleapis.com/css', stubFile);
}

async function main() {
  console.log('═══════════════════════════════════');
  console.log('  Building local-site from Store77  ');
  console.log('═══════════════════════════════════\n');

  ensureDir(OUT_DIR);
  ensureDir(ASSETS_DIR);

  createGoogleFontsStub();
  await setupFontAwesome();

  await processHtmlFile(
    path.resolve('./attached_assets/catalogue_1779558569268.html'),
    path.join(OUT_DIR, 'catalogue.html'),
    true
  );

  await processHtmlFile(
    path.resolve('./attached_assets/card_1779558569267.html'),
    path.join(OUT_DIR, 'card.html'),
    false
  );

  // index.html -> redirect to catalogue
  fs.writeFileSync(
    path.join(OUT_DIR, 'index.html'),
    `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./catalogue.html"><title>Store77</title></head><body><a href="./catalogue.html">Каталог</a></body></html>`,
    'utf8'
  );

  const total = downloaded.size;
  const failedCount = failed.size;
  console.log('\n═══════════════════════════════════');
  console.log(`  ✓ Done! Downloaded: ${total}, Failed: ${failedCount}`);
  console.log(`  Output: ${OUT_DIR}`);
  console.log('  Run: npx serve local-site');
  console.log('═══════════════════════════════════');
}

main().catch(console.error);
