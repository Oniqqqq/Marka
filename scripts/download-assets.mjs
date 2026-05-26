import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'local-site', 'assets');
const STUB_THRESHOLD = 500; // bytes — anything smaller is a stub

// Map URL host → local assets subdirectory prefix
const HOST_MAP = {
  'store77.net': 'store77.net',
  'www.store77.net': 'store77.net',
  'maxcdn.bootstrapcdn.com': 'maxcdn.bootstrapcdn.com',
  'fonts.googleapis.com': 'fonts.googleapis.com',
};

const PAGES_TO_VISIT = [
  'https://store77.net/igrushki/',
  'https://store77.net/ideas/konstruktor_lego_ideas_21345_kamera_polaroid_onestep_sx_70_/',
];

// CSS files to fetch directly by URL after WAF is bypassed
const DIRECT_CSS_URLS = [
  'https://store77.net/bitrix/templates/v11/components/store77/catalog.section/.default/style.css',
  'https://store77.net/bitrix/templates/v11/components/store77/catalog.element/.default/style.css',
  'https://store77.net/bitrix/templates/v11/components/store77/catalog/.default/style.css',
  'https://store77.net/bitrix/templates/v11/components/store77/catalog.filter/.default/style.css',
  'https://store77.net/bitrix/templates/v11/components/store77/system.pagenavigation/.default/style.css',
  'https://store77.net/bitrix/templates/v11/components/bitrix/breadcrumb/catalog_section/style.css',
  'https://store77.net/bitrix/templates/v11/components/bitrix/menu/footer/style.css',
  'https://store77.net/bitrix/templates/v11/components/bitrix/form.result.new/call_form/style.css',
  'https://store77.net/bitrix/templates/v11/components/bitrix/main.register/custom/style.css',
  'https://store77.net/bitrix/templates/v11/styles.css',
  'https://store77.net/bitrix/templates/v11/template_styles.css',
  'https://store77.net/bitrix/css/e-comexpert/tradein.css',
  'https://store77.net/bitrix/templates/v11/css/appBanner.css',
  'https://store77.net/bitrix/templates/v11/css/colors.css',
  'https://store77.net/bitrix/templates/v11/css/media.css',
  'https://store77.net/bitrix/templates/v11/css/custom.css',
  'https://store77.net/bitrix/templates/v11/css/callform.css',
  'https://store77.net/bitrix/templates/v11/css/mob_fix_menu_panel.css',
  'https://store77.net/local/components/store77/vanta.calculator/templates/.default/style.css',
];

function urlToLocalPath(url) {
  try {
    const u = new URL(url);
    const host = HOST_MAP[u.hostname];
    if (!host) return null;
    const relativePath = u.pathname; // e.g. /bitrix/templates/v11/css/main.css
    return path.join(ASSETS_DIR, host, relativePath);
  } catch {
    return null;
  }
}

function isStub(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.size < STUB_THRESHOLD;
  } catch {
    return false; // file doesn't exist — not a stub we want to replace
  }
}

function isRealCss(body) {
  if (!body || body.length < 100) return false;
  const text = body.toString('utf8', 0, 200);
  // WAF challenge pages start with <html>
  if (text.trimStart().startsWith('<')) return false;
  return true;
}

async function downloadAssets() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ru-RU',
  });

  const saved = [];
  const skipped = [];
  const failed = [];

  context.on('response', async (response) => {
    try {
      const url = response.url();
      const status = response.status();
      if (status !== 200) return;

      const ct = response.headers()['content-type'] || '';
      const isAsset =
        ct.includes('text/css') ||
        ct.includes('javascript') ||
        url.endsWith('.css') ||
        url.endsWith('.js');
      if (!isAsset) return;

      const localPath = urlToLocalPath(url);
      if (!localPath) return;

      if (!isStub(localPath)) {
        skipped.push(`SKIP (not stub): ${path.relative(ASSETS_DIR, localPath)}`);
        return;
      }

      const body = await response.body().catch(() => null);
      if (!body) return;

      if (!isRealCss(body)) {
        failed.push(`FAIL (WAF/empty): ${path.relative(ASSETS_DIR, localPath)}`);
        return;
      }

      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, body);
      saved.push(`SAVED (${body.length} bytes): ${path.relative(ASSETS_DIR, localPath)}`);
    } catch (err) {
      // ignore individual response errors
    }
  });

  for (const pageUrl of PAGES_TO_VISIT) {
    console.log(`\nVisiting: ${pageUrl}`);
    const page = await context.newPage();
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
      // Extra wait for lazy-loaded resources
      await page.waitForTimeout(2000);
    } catch (err) {
      console.error(`  Error loading page: ${err.message}`);
    }
    await page.close();
  }

  // Directly fetch remaining stub CSS files in the same session (WAF already solved)
  console.log('\nFetching direct CSS URLs...');
  const directPage = await context.newPage();
  for (const cssUrl of DIRECT_CSS_URLS) {
    const localPath = urlToLocalPath(cssUrl);
    if (!localPath) continue;
    if (!isStub(localPath)) {
      skipped.push(`SKIP (not stub): ${path.relative(ASSETS_DIR, localPath)}`);
      continue;
    }
    try {
      const response = await directPage.goto(cssUrl, { waitUntil: 'load', timeout: 15000 });
      if (!response || response.status() !== 200) {
        failed.push(`FAIL (status ${response?.status()}): ${path.relative(ASSETS_DIR, localPath)}`);
        continue;
      }
      const body = await response.body();
      if (!isRealCss(body)) {
        failed.push(`FAIL (WAF/HTML): ${path.relative(ASSETS_DIR, localPath)}`);
        continue;
      }
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, body);
      saved.push(`SAVED (${body.length} bytes): ${path.relative(ASSETS_DIR, localPath)}`);
    } catch (err) {
      failed.push(`FAIL (${err.message.split('\n')[0]}): ${path.relative(ASSETS_DIR, localPath)}`);
    }
  }
  await directPage.close();

  await browser.close();

  console.log('\n=== Results ===');
  for (const s of saved) console.log(s);
  for (const f of failed) console.log(f);
  console.log(`\nSaved: ${saved.length}, Failed WAF: ${failed.length}, Skipped (already real): ${skipped.length}`);
}

downloadAssets().catch(console.error);
