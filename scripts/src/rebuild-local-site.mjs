/**
 * rebuild-local-site.mjs
 * Fresh rebuild of local-site from original attached_assets HTML files.
 *
 * The attached_assets HTML uses protocol-less URLs like:
 *   store77.net/upload/...
 *   maxcdn.bootstrapcdn.com/font-awesome/...
 *   fonts.googleapis.com/css
 *
 * And root-relative paths like:
 *   href="/tv/product-slug/"   <- product links
 *   src="/bitrix/..."          <- usually inside scripts
 *
 * Strategy:
 *  1. Read original HTML from attached_assets
 *  2. Extract all asset URLs (protocol-less + full URLs)
 *  3. Download all missing assets into local-site/assets/<domain>/
 *  4. Rewrite all asset references to local relative paths
 *  5. Rewrite BX.setCSSList / BX.setJSList to local paths
 *  6. Rewrite product links to ./card.html
 *  7. Remove tracking scripts
 *  8. Write clean HTML to local-site/
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const OUT_DIR = path.resolve('./local-site');
const ASSETS_DIR = path.join(OUT_DIR, 'assets');

const ASSET_EXTS = new Set([
  '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.otf', '.mp4', '.mp3', '.json', '.map',
]);

// Domains to download locally
const MIRROR_DOMAINS = ['store77.net', 'maxcdn.bootstrapcdn.com', 'fonts.gstatic.com'];

// Tracking/analytics script patterns to remove
const TRACKING_RE = [
  /mc\.yandex\.(com|ru)/,
  /top-fwz1\.mail\.ru/,
  /cdn-ru\.bitrix24\.ru.*crm/,
  /cdn\.bitrix24\.ru.*crm/,
  /cloud\.roistat\.com/,
  /cdn\.retailrocket\.ru/,
  /bitrix\.info\/ba\.js/,
  /get\.aplaut\.io/,
  /smartcaptcha\.yandexcloud/,
  /yastatic\.net/,
  /get4click\.ru/,
  /artfut\.com/,
  /v\.retailrocket/,
];

// Already downloaded map: normalizedUrl -> local absolute path
const downloaded = new Map();

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function getExt(urlPath) {
  const q = urlPath.indexOf('?');
  const clean = q === -1 ? urlPath : urlPath.slice(0, q);
  const dot = clean.lastIndexOf('.');
  if (dot === -1) return '';
  return clean.slice(dot).toLowerCase();
}

function isAsset(urlPath) {
  return ASSET_EXTS.has(getExt(urlPath));
}

/**
 * Normalize a URL (potentially protocol-less like "store77.net/path") to full https URL.
 * Returns null if not a mirrorable URL.
 */
function normalizeToFull(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:') || rawUrl.startsWith('javascript:') || rawUrl.startsWith('#')) return null;

  let full = rawUrl.trim();
  // Protocol-less: store77.net/... or maxcdn.bootstrapcdn.com/...
  if (!full.startsWith('http')) {
    // Check if starts with a known mirror domain
    const matchedDomain = MIRROR_DOMAINS.find(d => full.startsWith(d + '/') || full === d);
    if (matchedDomain) {
      full = 'https://' + full;
    } else if (full.startsWith('fonts.googleapis.com')) {
      return 'stub://fonts.googleapis.com/css'; // special stub
    } else {
      return null;
    }
  }

  try {
    const u = new URL(full);
    if (!MIRROR_DOMAINS.includes(u.hostname)) return null;
    return u.href;
  } catch {
    return null;
  }
}

function localPathForUrl(fullUrl) {
  if (fullUrl.startsWith('stub://')) return null;
  try {
    const u = new URL(fullUrl);
    return path.join(ASSETS_DIR, u.hostname, u.pathname);
  } catch { return null; }
}

function relPathFromHtml(htmlFile, fullUrl) {
  const local = localPathForUrl(fullUrl);
  if (!local) return null;
  return path.relative(path.dirname(htmlFile), local).replace(/\\/g, '/');
}

async function downloadAsset(fullUrl) {
  if (downloaded.has(fullUrl)) return downloaded.get(fullUrl);
  if (fullUrl.startsWith('stub://')) return null;

  const local = localPathForUrl(fullUrl);
  if (!local) return null;

  if (fs.existsSync(local) && fs.statSync(local).size > 50) {
    downloaded.set(fullUrl, local);
    return local;
  }

  ensureDir(path.dirname(local));

  const u = new URL(fullUrl);
  const client = fullUrl.startsWith('https') ? https : http;

  return new Promise((resolve) => {
    const req = client.get({
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://store77.net/',
        'Accept': '*/*',
      },
      timeout: 25000,
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location;
        if (loc) {
          downloadAsset(loc.startsWith('http') ? loc : 'https://' + u.hostname + loc).then(resolve);
        } else resolve(null);
        return;
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        // Detect bot protection (HTML returned for asset)
        const isHtml = buf.slice(0, 15).toString().trim().startsWith('<');
        if (buf.length < 50 || (isHtml && !u.pathname.endsWith('.html'))) {
          resolve(null);
          return;
        }
        fs.writeFileSync(local, buf);
        process.stdout.write('.');
        downloaded.set(fullUrl, local);
        resolve(local);
      });
      res.on('error', () => resolve(null));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

// Pre-scan all assets in the local-site/assets dir
function preloadDownloaded() {
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) scan(full);
      else if (stat.size > 50) {
        // Derive the URL from the path
        const rel = path.relative(ASSETS_DIR, full).replace(/\\/g, '/');
        const urlFull = 'https://' + rel;
        downloaded.set(urlFull, full);
      }
    }
  }
  scan(ASSETS_DIR);
  console.log('  Pre-loaded ' + downloaded.size + ' cached assets');
}

// Extract all raw URL values from HTML attributes
function extractUrls(html) {
  const urls = new Set();
  const attrRe = /(?:src|href|data-src|data-lazy-src|data-original)\s*=\s*["']([^"']+)["']/gi;
  const urlInCssRe = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
  const srcsetRe = /srcset\s*=\s*["']([^"']+)["']/gi;

  let m;
  while ((m = attrRe.exec(html)) !== null) urls.add(m[1]);
  while ((m = urlInCssRe.exec(html)) !== null) urls.add(m[1]);
  while ((m = srcsetRe.exec(html)) !== null) {
    m[1].split(',').forEach(p => {
      const url = p.trim().split(/\s+/)[0];
      if (url) urls.add(url);
    });
  }
  return [...urls];
}

async function downloadBatch(urls, concurrency = 8) {
  const toFetch = urls
    .map(u => normalizeToFull(u))
    .filter(u => u && !u.startsWith('stub://') && isAsset(new URL(u).pathname))
    .filter((u, i, a) => a.indexOf(u) === i); // deduplicate

  for (let i = 0; i < toFetch.length; i += concurrency) {
    await Promise.all(toFetch.slice(i, i + concurrency).map(u => downloadAsset(u)));
  }
  return toFetch.length;
}

// Rewrite all asset references in HTML to local relative paths
function rewriteAssetUrls(html, htmlOutputPath) {
  // Rewrite src/href/data-* attributes
  html = html.replace(
    /((?:src|href|data-src|data-lazy-src|data-original)\s*=\s*["'])([^"']+)(["'])/gi,
    (full, pre, val, post) => {
      if (val.startsWith('data:') || val.startsWith('blob:') || val.startsWith('javascript:') || val.startsWith('#')) return full;
      if (val.startsWith('tel:') || val.startsWith('mailto:')) return full;
      // Skip external links that we don't mirror (social networks, etc.)
      if (val.startsWith('https://') || val.startsWith('http://')) {
        const fullUrl = normalizeToFull(val);
        if (!fullUrl) return full; // not a mirror domain
        if (!downloaded.has(fullUrl)) return full;
        const rel = relPathFromHtml(htmlOutputPath, fullUrl);
        return rel ? pre + rel + post : full;
      }
      // Protocol-less: store77.net/... or maxcdn.bootstrapcdn.com/...
      const fullUrl = normalizeToFull(val);
      if (!fullUrl || fullUrl.startsWith('stub://')) return full;
      if (!downloaded.has(fullUrl)) return full;
      const rel = relPathFromHtml(htmlOutputPath, fullUrl);
      return rel ? pre + rel + post : full;
    }
  );

  // Rewrite srcset
  html = html.replace(/(srcset\s*=\s*["'])([^"']+)(["'])/gi, (full, pre, val, post) => {
    const parts = val.split(',').map(part => {
      const tokens = part.trim().split(/\s+/);
      const rawUrl = tokens[0];
      const rest = tokens.slice(1).join(' ');
      const fullUrl = normalizeToFull(rawUrl);
      if (!fullUrl || !downloaded.has(fullUrl)) return part.trim();
      const rel = relPathFromHtml(htmlOutputPath, fullUrl);
      return rel ? (rel + (rest ? ' ' + rest : '')) : part.trim();
    });
    return pre + parts.join(', ') + post;
  });

  return html;
}

// Rewrite BX.setCSSList/setJSList dynamic asset loading
function rewriteBxDynamicAssets(html) {
  // Paths in BX calls look like: "\/bitrix\/templates\/v11\/..."
  const bxRe = /BX\.(setCSSList|setJSList)\(\[([^\]]+)\]\)/g;
  return html.replace(bxRe, (full, fn, inner) => {
    const fixed = inner.replace(/"((?:\\\/)[^"]+)"/g, (m, escapedPath) => {
      const unescaped = escapedPath.replace(/\\\//g, '/');
      const localPath = 'assets/store77.net' + unescaped;
      // Check if this file exists locally
      const absPath = path.join(OUT_DIR, localPath);
      if (fs.existsSync(absPath)) {
        return '"' + localPath + '"';
      }
      return m; // leave as-is if not downloaded
    });
    return 'BX.' + fn + '([' + fixed + '])';
  });
}

// Rewrite product links in catalogue to ./card.html
function rewriteProductLinks(html) {
  // Navigation/service paths to keep as-is
  const keepPrefixes = [
    'bitrix', 'upload', 'local', 'personal', 'favorites', 'policy',
    'ajax', 'search', 'cart', 'order', 'auth', 'login', 'register',
    'compare', 'wishlist', 'account', 'profile', 'checkout',
  ];
  const keepExact = ['/', '/personal/cart/', '/favorites'];

  // Match href="/some/path/" in anchor tags
  const re = /(href\s*=\s*["'])(\/[^"'?#]*)([?#][^"']*)?(['"])/g;
  return html.replace(re, (full, pre, urlPath, query, post) => {
    if (keepExact.includes(urlPath)) return full;
    // Skip extensions
    if (/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico|pdf|php)(\?|$)/i.test(urlPath)) return full;
    const firstSeg = urlPath.replace(/^\//, '').split('/')[0];
    if (!firstSeg) return full;
    if (keepPrefixes.some(p => firstSeg === p || firstSeg.startsWith(p + '_'))) return full;
    // This looks like a page link (product or category)
    return pre + './card.html' + (query || '') + post;
  });
}

// Remove tracking scripts
function cleanTracking(html) {
  // Remove <script src="...tracking...">...</script>
  html = html.replace(/<script[^>]+src\s*=\s*["'][^"']*["'][^>]*>[\s\S]*?<\/script>/gi, (m) => {
    if (TRACKING_RE.some(re => re.test(m))) return '<!-- tracking removed -->';
    return m;
  });
  html = html.replace(/<script[^>]+src\s*=\s*["'][^"']*["'][^>]*/gi, (m) => {
    if (TRACKING_RE.some(re => re.test(m))) return '<!-- tracking removed ';
    return m;
  });
  // Remove pixel tracking images
  html = html.replace(/<img[^>]*(?:mc\.yandex|top-fwz1\.mail|roistat)[^>]*>/gi, '');
  // Remove body[unresolved] antiflash trick
  html = html.replace(/body\s*\[unresolved\]\s*\{[^}]*\}/g, '/* unresolved */');
  return html;
}

// Also inject explicit <link> tags for BX CSS to avoid flash of unstyled content
function injectBxCssLinks(html, htmlOutputPath) {
  // Find BX.setCSSList calls and extract paths
  const bxRe = /BX\.setCSSList\(\[([^\]]+)\]\)/g;
  const cssLinks = [];
  let m;
  while ((m = bxRe.exec(html)) !== null) {
    const inner = m[1];
    const pathRe = /"assets\/store77\.net([^"]+)"/g;
    let pm;
    while ((pm = pathRe.exec(inner)) !== null) {
      if (pm[1].endsWith('.css')) {
        const localPath = 'assets/store77.net' + pm[1];
        cssLinks.push(localPath);
      }
    }
  }

  if (cssLinks.length === 0) return html;

  // Inject these as <link> tags in <head>
  const linkTags = cssLinks
    .map(p => `<link href="${p}" type="text/css" rel="stylesheet" />`)
    .join('\n');

  // Insert before </head>
  html = html.replace('</head>', linkTags + '\n</head>');
  return html;
}

// Process CSS files: fix url() references to use local relative paths
function rewriteCssFileUrls(cssAbsPath) {
  if (!fs.existsSync(cssAbsPath)) return;
  let content = fs.readFileSync(cssAbsPath, 'utf8');
  if (content.length < 20 || content.trim().startsWith('<')) {
    fs.writeFileSync(cssAbsPath, '/* stub - non-CSS response */\n', 'utf8');
    return;
  }

  const urlRe = /url\(\s*["']?(\/[^"')\s]+)["']?\s*\)/g;
  const absUrlRe = /url\(\s*["']?(https?:\/\/[^"')\s]+)["']?\s*\)/g;
  let changed = false;

  // Root-relative /path
  let rewritten = content.replace(urlRe, (full, imgPath) => {
    const cleanPath = imgPath.split('?')[0];
    const localImg = path.join(ASSETS_DIR, 'store77.net', cleanPath);
    if (fs.existsSync(localImg)) {
      const rel = path.relative(path.dirname(cssAbsPath), localImg).replace(/\\/g, '/');
      changed = true;
      return 'url("' + rel + '")';
    }
    return full;
  });

  // Absolute https://store77.net/...
  rewritten = rewritten.replace(absUrlRe, (full, imgUrl) => {
    try {
      const u = new URL(imgUrl);
      if (u.hostname !== 'store77.net') return full;
      const localImg = path.join(ASSETS_DIR, 'store77.net', u.pathname);
      if (fs.existsSync(localImg)) {
        const rel = path.relative(path.dirname(cssAbsPath), localImg).replace(/\\/g, '/');
        changed = true;
        return 'url("' + rel + '")';
      }
    } catch {}
    return full;
  });

  if (changed) fs.writeFileSync(cssAbsPath, rewritten, 'utf8');
}

async function processHtml(inputPath, outputPath, isCatalogue) {
  console.log('\n  Reading: ' + path.basename(inputPath));
  const html = fs.readFileSync(inputPath, 'utf8');
  console.log('  Lines: ' + html.split('\n').length);

  // Extract and download assets
  const rawUrls = extractUrls(html);
  console.log('  Found ' + rawUrls.length + ' raw URL references');
  process.stdout.write('  Downloading assets: ');
  const count = await downloadBatch(rawUrls);
  console.log('\n  Fetched ' + count + ' unique asset URLs');

  // Rewrite HTML
  let result = rewriteAssetUrls(html, outputPath);
  result = rewriteBxDynamicAssets(result);
  result = cleanTracking(result);

  if (isCatalogue) {
    result = rewriteProductLinks(result);
    result = injectBxCssLinks(result, outputPath);
  } else {
    result = injectBxCssLinks(result, outputPath);
  }

  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, result, 'utf8');
  console.log('  Written: ' + outputPath + ' (' + result.split('\n').length + ' lines)');
}

function getAllFiles(dir, ext) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) result.push(...getAllFiles(full, ext));
    else if (!ext || item.endsWith(ext)) result.push(full);
  }
  return result;
}

async function main() {
  console.log('══════════════════════════════════════');
  console.log('  Rebuilding local-site from Store77  ');
  console.log('══════════════════════════════════════\n');

  ensureDir(OUT_DIR);
  ensureDir(ASSETS_DIR);

  // Pre-load already-downloaded assets
  console.log('Pre-loading cached assets...');
  preloadDownloaded();

  // Process both HTML files
  await processHtml(
    path.resolve('./attached_assets/catalogue_1779558569268.html'),
    path.join(OUT_DIR, 'catalogue.html'),
    true,
  );

  await processHtml(
    path.resolve('./attached_assets/card_1779558569267.html'),
    path.join(OUT_DIR, 'card.html'),
    false,
  );

  // index.html -> redirect
  fs.writeFileSync(
    path.join(OUT_DIR, 'index.html'),
    '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./catalogue.html"><title>Store77</title></head><body><a href="./catalogue.html">Каталог товаров</a></body></html>',
    'utf8',
  );

  // Rewrite CSS file url() references
  console.log('\nRewriting CSS url() references...');
  const cssFiles = getAllFiles(path.join(ASSETS_DIR, 'store77.net'), '.css');
  const maxCssFiles = getAllFiles(path.join(ASSETS_DIR, 'maxcdn.bootstrapcdn.com'), '.css');
  [...cssFiles, ...maxCssFiles].forEach(f => rewriteCssFileUrls(f));
  console.log('  Processed ' + (cssFiles.length + maxCssFiles.length) + ' CSS files');

  // Verify
  console.log('\n══ Verification ══');
  for (const filename of ['catalogue.html', 'card.html']) {
    const html = fs.readFileSync(path.join(OUT_DIR, filename), 'utf8');
    const lines = html.split('\n').length;
    const cardLinks = filename === 'catalogue.html' ? (html.match(/href="\.\/card\.html"/g) || []).length : 0;
    const extAssets = (html.match(/(?:src|href)=["']https?:\/\/(?!(?:vk\.com|t\.me|ok\.ru|youtube|instagram|apple\.com|play\.google|wa\.me|whatsapp|payments\.store77|store77\.net\/\?|paykeeper))[^"']+\.(?:css|js|woff2?|ttf|png|jpg|jpeg|gif|svg|webp)["']/gi) || []);
    console.log('\n' + filename + ':');
    console.log('  Lines: ' + lines);
    if (filename === 'catalogue.html') console.log('  Product links -> ./card.html: ' + cardLinks);
    if (extAssets.length) {
      console.log('  WARN: ' + extAssets.length + ' external asset refs remain:');
      extAssets.slice(0, 3).forEach(r => console.log('    ' + r.slice(0, 100)));
    } else {
      console.log('  OK: no external asset refs');
    }
  }

  const allFiles = getAllFiles(OUT_DIR);
  const totalSize = allFiles.reduce((s, f) => s + fs.statSync(f).size, 0);
  console.log('\nTotal files: ' + allFiles.length + ', Size: ' + Math.round(totalSize / 1024 / 1024 * 10) / 10 + ' MB');
  console.log('\n✅ Done! Run: npx serve local-site');
}

main().catch(console.error);
