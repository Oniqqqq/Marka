/**
 * finalize-local-site.mjs
 * Final pass: rewrite BX dynamic asset paths, fix product links, check CSS images
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const OUT_DIR = path.resolve('./local-site');
const ASSETS_STORE77 = path.join(OUT_DIR, 'assets/store77.net');

// Fix BX.setCSSList / BX.setJSList paths
// Paths inside BX calls look like: "\/bitrix\/templates\/..."
// We replace with: "assets/store77.net/bitrix/templates/..."
function rewriteBxPaths(html) {
  // Match BX.setCSSList([...]) and BX.setJSList([...]) blocks
  const bxRe = /BX\.(setCSSList|setJSList)\(\[([^\]]+)\]\)/g;
  return html.replace(bxRe, (full, fn, inner) => {
    // Each path looks like "\/some\/path" with escaped slashes
    // Replace each quoted path
    const fixed = inner.replace(/"((?:\\\/)[^"]+)"/g, (m, escapedPath) => {
      // unescape: \/foo\/bar -> /foo/bar
      const unescaped = escapedPath.replace(/\\\//g, '/');
      return '"assets/store77.net' + unescaped + '"';
    });
    return 'BX.' + fn + '([' + fixed + '])';
  });
}

// Fix absolute root-relative paths /bitrix/... and /local/... in href/src
function rewriteRootRelativePaths(html) {
  const cssJsRe = /(href|src)\s*=\s*"(\/(?:bitrix|local)\/[^"]+\.(?:css|js))"/g;
  return html.replace(cssJsRe, (full, attr, p) => {
    const localPath = 'assets/store77.net' + p;
    if (fs.existsSync(path.join(OUT_DIR, localPath))) {
      return attr + '="' + localPath + '"';
    }
    return full;
  });
}

// Fix product card links in catalogue
function rewriteProductLinks(html) {
  const servicePathPrefixes = [
    'bitrix', 'upload', 'local', 'personal', 'favorites', 'policy',
    'assets', 'javascript', 'tel', 'mailto',
  ];

  // Match <a ... href="/something"> patterns - only relative root paths
  const anchorHrefRe = /(href\s*=\s*")(\/[^"?#]*)(")/g;
  return html.replace(anchorHrefRe, (full, pre, urlPath, post) => {
    if (urlPath === '/') return full;
    // Check extension - skip asset files
    if (/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)(\?|$)/i.test(urlPath)) return full;
    const firstSegment = urlPath.replace(/^\//, '').split('/')[0];
    if (servicePathPrefixes.some(p => firstSegment.startsWith(p))) return full;
    // This is a page link - replace with card.html
    return pre + './card.html' + post;
  });
}

// Download image referenced in CSS file from store77
function fetchStoreAsset(urlPath) {
  return new Promise((resolve) => {
    const localPath = path.join(ASSETS_STORE77, urlPath);
    if (fs.existsSync(localPath)) return resolve(localPath);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    const req = https.get({
      hostname: 'store77.net',
      path: urlPath,
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0', 'Referer': 'https://store77.net/' },
      timeout: 15000,
    }, res => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (buf.length > 50 && !buf.slice(0, 15).toString().includes('<html>')) {
            fs.writeFileSync(localPath, buf);
            process.stdout.write('.');
            resolve(localPath);
          } else resolve(null);
        });
        res.on('error', () => resolve(null));
      } else resolve(null);
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function processCssFile(cssFilePath) {
  if (!fs.existsSync(cssFilePath)) return;
  let content = fs.readFileSync(cssFilePath, 'utf8');
  // Detect bot protection page
  if (content.trim().startsWith('<') || content.length < 50) {
    fs.writeFileSync(cssFilePath, '/* stub - server returned non-CSS */\n', 'utf8');
    return;
  }

  // Find url(/...) references
  const urlRe = /url\(["']?(\/[^"')?\s]+)["']?\)/g;
  const toFetch = new Set();
  let m;
  while ((m = urlRe.exec(content)) !== null) {
    const p = m[1].split('?')[0];
    if (/\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp)$/i.test(p)) {
      toFetch.add(p);
    }
  }

  for (const imgPath of toFetch) {
    await fetchStoreAsset(imgPath);
  }

  // Rewrite url() references to relative paths
  let rewritten = content.replace(urlRe, (full, imgPath) => {
    const cleanPath = imgPath.split('?')[0];
    const localImg = path.join(ASSETS_STORE77, cleanPath);
    if (fs.existsSync(localImg)) {
      const rel = path.relative(path.dirname(cssFilePath), localImg).replace(/\\/g, '/');
      return 'url("' + rel + '")';
    }
    return full;
  });

  if (rewritten !== content) {
    fs.writeFileSync(cssFilePath, rewritten, 'utf8');
  }
}

function getAllCssFiles(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) result.push(...getAllCssFiles(full));
    else if (item.endsWith('.css')) result.push(full);
  }
  return result;
}

async function main() {
  console.log('=== Final pass ===\n');

  // 1. Process all downloaded CSS files for embedded image URLs
  console.log('Processing CSS files for embedded images...');
  const cssDirs = [
    path.join(ASSETS_STORE77, 'bitrix'),
    path.join(ASSETS_STORE77, 'local'),
  ];
  const cssFiles = cssDirs.flatMap(d => getAllCssFiles(d));
  console.log('  Found ' + cssFiles.length + ' CSS files');
  for (const cssFile of cssFiles) {
    await processCssFile(cssFile);
  }
  console.log('\n  CSS processing done');

  // 2. Rewrite HTML files
  for (const [filename, isCatalogue] of [['catalogue.html', true], ['card.html', false]]) {
    console.log('\nProcessing ' + filename + '...');
    const filePath = path.join(OUT_DIR, filename);
    let html = fs.readFileSync(filePath, 'utf8');

    html = rewriteBxPaths(html);
    html = rewriteRootRelativePaths(html);
    if (isCatalogue) {
      html = rewriteProductLinks(html);
    }

    fs.writeFileSync(filePath, html, 'utf8');
    console.log('  ✓ Done');
  }

  // 3. Verify results
  console.log('\n=== Verification ===');
  for (const filename of ['catalogue.html', 'card.html']) {
    const html = fs.readFileSync(path.join(OUT_DIR, filename), 'utf8');

    if (filename === 'catalogue.html') {
      const cardLinks = (html.match(/href="\.\/card\.html"/g) || []).length;
      console.log(filename + ': ' + cardLinks + ' product links -> ./card.html');
    }

    const localCss = (html.match(/href="assets\/[^"]+\.css"/g) || []).length;
    const localJs = (html.match(/src="assets\/[^"]+\.js"/g) || []).length;
    const localImgs = (html.match(/src="assets\/[^"]+\.(png|jpg|jpeg|gif|svg|webp)"/g) || []).length;
    console.log(filename + ': CSS=' + localCss + ' JS=' + localJs + ' Images=' + localImgs);

    const extPattern = /(?:src|href)=["']https?:\/\/(?!(?:vk\.com|t\.me|ok\.ru|youtube\.com|instagram\.com|apps\.apple\.com|play\.google\.com|wa\.me|whatsapp\.com))[^"']+\.(?:css|js|woff2?|ttf|png|jpg|jpeg|gif|svg|webp)["']/gi;
    const extRefs = html.match(extPattern) || [];
    if (extRefs.length > 0) {
      console.log('  WARNING: ' + extRefs.length + ' external asset refs remain:');
      extRefs.slice(0, 5).forEach(r => console.log('    ' + r.slice(0, 100)));
    } else {
      console.log('  OK: no external asset refs');
    }
  }

  // Count total
  const allFiles = getAllCssFiles(OUT_DIR).concat(
    fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html')).map(f => path.join(OUT_DIR, f))
  );
  const totalCount = [];
  function countAll(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) countAll(full);
      else totalCount.push(full);
    }
  }
  countAll(OUT_DIR);
  const totalSize = totalCount.reduce((s, f) => s + fs.statSync(f).size, 0);
  console.log('\nTotal files: ' + totalCount.length + ', Size: ' + Math.round(totalSize / 1024) + ' KB');
  console.log('\n✅ local-site is ready!');
  console.log('Run: npx serve local-site');
  console.log('Or open: local-site/catalogue.html');
}

main().catch(console.error);
