import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'local-site', 'assets');

// Image magic bytes to detect real image files
function isRealImage(buf, ext) {
  if (!buf || buf.length < 8) return false;
  const b = buf;
  // JPEG: FF D8 FF
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return true;
  // GIF: 47 49 46
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return true;
  // SVG / XML: starts with < but is not HTML
  if (ext === '.svg') {
    const text = b.toString('utf8', 0, 200).trimStart();
    if (text.startsWith('<svg') || text.startsWith('<?xml') || text.startsWith('<!DOCTYPE svg')) return true;
    // SVG from server might have comments first
    if (text.includes('<svg') && !text.trimStart().startsWith('<html')) return true;
    return false;
  }
  // WebP: RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return true;
  return false;
}

function isWafStub(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length === 0) return true;
    const start = buf.toString('utf8', 0, 5).toLowerCase();
    return start.startsWith('<html');
  } catch {
    return true; // doesn't exist — treat as stub
  }
}

function urlToLocalPath(localAssetPath) {
  // localAssetPath is like "assets/store77.net/upload/..."
  return path.join(path.dirname(ASSETS_DIR), localAssetPath);
}

function assetPathToUrl(localAssetPath) {
  // strip "assets/" prefix → URL path on store77.net
  const rel = localAssetPath.replace(/^assets\/store77\.net\//, '');
  return `https://store77.net/${rel}`;
}

// Read all image paths to download
const imageList = fs.readFileSync('/tmp/images_to_download.txt', 'utf8')
  .trim().split('\n')
  .filter(Boolean);

const toDownload = imageList.filter(p => isWafStub(urlToLocalPath(p)));
const alreadyGood = imageList.length - toDownload.length;

console.log(`Total images: ${imageList.length}`);
console.log(`Already real: ${alreadyGood}`);
console.log(`Need to download: ${toDownload.length}`);

if (toDownload.length === 0) {
  console.log('Nothing to do!');
  process.exit(0);
}

const saved = [];
const failed = [];

async function downloadImages() {
  console.log('\nLaunching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ru-RU',
  });

  // First: solve WAF by loading the main catalogue page
  console.log('Solving WAF challenge by loading main page...');
  const warmupPage = await context.newPage();

  // Intercept image responses during page load to capture as many as possible
  const capturedUrls = new Set();
  context.on('response', async (response) => {
    try {
      const url = response.url();
      if (response.status() !== 200) return;
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('image') && !url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) return;

      // Find matching local path
      const match = toDownload.find(p => {
        const targetUrl = assetPathToUrl(p);
        return url === targetUrl || url.replace(/\?.*$/, '') === targetUrl;
      });
      if (!match) return;
      if (capturedUrls.has(match)) return;

      const body = await response.body().catch(() => null);
      if (!body) return;

      const ext = path.extname(match).toLowerCase();
      if (!isRealImage(body, ext)) return;

      const localPath = urlToLocalPath(match);
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, body);
      capturedUrls.add(match);
      process.stdout.write(`✓ ${path.basename(match)}\n`);
    } catch {}
  });

  try {
    await warmupPage.goto('https://store77.net/igrushki/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await warmupPage.waitForTimeout(3000);
  } catch (e) {
    console.log('  Warmup page error (continuing):', e.message.split('\n')[0]);
  }
  await warmupPage.close();

  // Second: load card page to capture more images
  console.log('\nLoading card page for more images...');
  const cardPage = await context.newPage();
  try {
    await cardPage.goto('https://store77.net/ideas/konstruktor_lego_ideas_21345_kamera_polaroid_onestep_sx_70_/',
      { waitUntil: 'domcontentloaded', timeout: 25000 });
    await cardPage.waitForTimeout(3000);
  } catch (e) {
    console.log('  Card page error (continuing):', e.message.split('\n')[0]);
  }
  await cardPage.close();

  // Third: directly fetch any remaining images
  const remaining = toDownload.filter(p => !capturedUrls.has(p));
  console.log(`\nDirect-fetching ${remaining.length} remaining images...`);

  const directPage = await context.newPage();
  for (const assetPath of remaining) {
    const imgUrl = assetPathToUrl(assetPath);
    const ext = path.extname(assetPath).toLowerCase();
    const localPath = urlToLocalPath(assetPath);

    try {
      const response = await directPage.goto(imgUrl, { waitUntil: 'load', timeout: 15000 });
      if (!response || response.status() !== 200) {
        failed.push(`FAIL(${response?.status()}): ${path.basename(assetPath)}`);
        continue;
      }
      const body = await response.body();
      if (!isRealImage(body, ext)) {
        failed.push(`FAIL(WAF): ${path.basename(assetPath)}`);
        continue;
      }
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, body);
      saved.push(assetPath);
      process.stdout.write(`✓ ${path.basename(assetPath)}\n`);
    } catch (e) {
      failed.push(`FAIL(${e.message.split('\n')[0].slice(0, 60)}): ${path.basename(assetPath)}`);
    }
  }
  await directPage.close();
  await browser.close();

  const totalSaved = capturedUrls.size + saved.length;
  console.log(`\n=== Summary ===`);
  console.log(`Downloaded: ${totalSaved}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('\nFailed files:');
    failed.forEach(f => console.log(' ', f));
  }
}

downloadImages().catch(console.error);
