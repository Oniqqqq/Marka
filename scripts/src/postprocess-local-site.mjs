/**
 * postprocess-local-site.mjs
 * Final cleanup pass on catalogue.html and card.html:
 * - Remove tracking/analytics scripts
 * - Rewrite bitrix24 live chat asset paths
 * - Fix any remaining external CSS/JS paths for visual assets
 * - Remove body[unresolved] hide trick
 */

import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('./local-site');

function processFile(filePath, isCatalogue) {
  console.log(`\nPost-processing: ${path.basename(filePath)}`);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Remove tracking/analytics scripts entirely
  const trackingScriptPatterns = [
    // get4click
    /\s*<script[^>]+get4click[^>]*>[\s\S]*?<\/script>/gi,
    /\s*<script[^>]+get4click[^>]*\/>/gi,
    // artfut
    /\s*<script[^>]+artfut\.com[^>]*>[\s\S]*?<\/script>/gi,
    // yandex captcha
    /\s*<script[^>]+captcha-api\.yandex[^>]*>[\s\S]*?<\/script>/gi,
    // mc.yandex scripts
    /\s*<script[^>]+mc\.yandex[^>]*>[\s\S]*?<\/script>/gi,
    // top-fwz1.mail.ru
    /\s*<script[^>]+top-fwz1\.mail[^>]*>[\s\S]*?<\/script>/gi,
    // retailrocket
    /\s*<script[^>]+retailrocket[^>]*>[\s\S]*?<\/script>/gi,
    // roistat
    /\s*<script[^>]+roistat[^>]*>[\s\S]*?<\/script>/gi,
    // aplaut
    /\s*<script[^>]+aplaut[^>]*>[\s\S]*?<\/script>/gi,
    // bitrix24 CRM tag
    /\s*<script[^>]+cdn-ru\.bitrix24\.ru[^>]*>[\s\S]*?<\/script>/gi,
    /\s*<script[^>]+cdn\.bitrix24\.ru\/[^/]+\/crm[^>]*>[\s\S]*?<\/script>/gi,
    // bitrix.info
    /\s*<script[^>]+bitrix\.info[^>]*>[\s\S]*?<\/script>/gi,
    // topmailru
    /\s*<script[^>]*id="topmailru-code"[^>]*>[\s\S]*?<\/script>/gi,
    /\s*<script[^>]*id="tmr-code"[^>]*>[\s\S]*?<\/script>/gi,
    // metrika tag
    /\s*<script[^>]+metrika\/tag[^>]*>[\s\S]*?<\/script>/gi,
    // mc.yandex.com metrika-tags
    /\s*<script[^>]+metrika-tags[^>]*>[\s\S]*?<\/script>/gi,
    // SmartBanner script
    /\s*<script[^>]+smart.?banner[^>]*>[\s\S]*?<\/script>/gi,
    // rrApi
    /\s*<script[^>]*id="rrApi-jssdk"[^>]*>[\s\S]*?<\/script>/gi,
  ];

  for (const re of trackingScriptPatterns) {
    html = html.replace(re, '\n<!-- tracking removed -->');
  }

  // 2. Remove tracking noscript / pixel images
  html = html.replace(/<noscript>\s*<div>\s*<img[^>]*(?:yandex|mail\.ru|counter)[^>]*>\s*<\/div>\s*<\/noscript>/gi, '');
  html = html.replace(/<img[^>]*mc\.yandex[^>]*>/gi, '');
  html = html.replace(/<img[^>]*top-fwz1\.mail[^>]*>/gi, '');
  html = html.replace(/<div[^>]*><img[^>]*mc\.yandex[^>]*><\/div>/gi, '');

  // 3. Rewrite bitrix24 live chat asset paths to local
  // CSS
  html = html.replace(
    /href\s*=\s*["']https?:\/\/store77\.bitrix24\.ru\/bitrix\/js\/imopenlines\/widget\/styles\.min\.css[^"']*["']/gi,
    'href="assets/store77.bitrix24.ru/bitrix/js/imopenlines/widget/styles.min.css"'
  );
  // JS
  html = html.replace(
    /src\s*=\s*["']https?:\/\/store77\.bitrix24\.ru\/bitrix\/js\/imopenlines\/widget\/script\.min\.js[^"']*["']/gi,
    'src="assets/store77.bitrix24.ru/bitrix/js/imopenlines/widget/script.min.js"'
  );

  // 4. Fix body[unresolved] opacity trick that hides page
  html = html.replace(/body\s*\[unresolved\]\s*\{[^}]*\}/g, 'body[unresolved] { /* removed */ }');

  // 5. Remove Yandex SmartCaptcha overlay (not needed locally)
  html = html.replace(/<style[^>]*>[\s\S]*?SmartCaptcha[\s\S]*?<\/style>/gi, '<!-- smartcaptcha styles removed -->');

  // 6. For catalogue: ensure all store77 product page hrefs are ./card.html
  // (in addition to what was done in main script)
  if (isCatalogue) {
    // Any remaining store77.net links that are not CSS/JS/images
    html = html.replace(
      /href\s*=\s*"https?:\/\/store77\.net\/(?!upload\/|bitrix\/)[^"]*"/gi,
      'href="./card.html"'
    );
    // Bare domain links (no protocol)
    html = html.replace(
      /href\s*=\s*"store77\.net\/(?!upload\/|bitrix\/)[^"]*"/gi,
      'href="./card.html"'
    );
  }

  // 7. Remove Google Fonts import from opensans CSS (already handled via local stub)
  // Keep as-is since we wrote a proper stub

  // 8. Fix remaining external link references that are inline in <script> JSON blocks
  // (store77 canonical links etc - these are metadata, not visual)

  // 9. Remove Bitrix Live Chat init script that depends on external server
  // (keep styles but remove the JS that tries to connect to bitrix24.ru)
  html = html.replace(
    /window\.addEventListener\('onBitrixLiveChatSourceLoaded'[\s\S]*?BXLiveChat[\s\S]*?\}\);\s*/g,
    '/* live chat init removed */'
  );

  // 10. Add a helpful <base> tag comment for context
  // Don't add <base> - it would break relative paths

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  ✓ Done`);
}

// Also fix font-awesome CSS to use correct relative paths from html perspective
// The CSS is at: assets/maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css
// The fonts are at: assets/maxcdn.bootstrapcdn.com/font-awesome/4.7.0/fonts/
// From HTML root the CSS reference will resolve fonts as: assets/maxcdn.bootstrapcdn.com/font-awesome/4.7.0/fonts/
// The CSS already has ../fonts/ which is correct relative to the CSS file location
// No change needed.

processFile(path.join(OUT_DIR, 'catalogue.html'), true);
processFile(path.join(OUT_DIR, 'card.html'), false);

// Final check: count remaining external refs
function countExternalRefs(file, label) {
  const html = fs.readFileSync(file, 'utf8');
  const matches = html.match(/(?:src|href)\s*=\s*["']https?:\/\/(?!(?:vk\.com|t\.me|ok\.ru|youtube\.com|instagram\.com|apps\.apple\.com|play\.google\.com|wa\.me|whatsapp\.com))[^"']+\.(?:css|js|woff|woff2|ttf|eot|png|jpg|jpeg|gif|svg|webp)["']/gi) || [];
  console.log(`\n${label}: ${matches.length} external asset refs remaining`);
  if (matches.length > 0) {
    matches.slice(0, 10).forEach(m => console.log('  ' + m.slice(0, 120)));
  }
}

countExternalRefs(path.join(OUT_DIR, 'catalogue.html'), 'catalogue.html');
countExternalRefs(path.join(OUT_DIR, 'card.html'), 'card.html');

// Summary
const totalSize = fs.readdirSync(path.join(OUT_DIR, 'assets'), { recursive: true })
  .filter(f => !fs.statSync(path.join(OUT_DIR, 'assets', f)).isDirectory())
  .length;
console.log(`\nTotal asset files: ${totalSize}`);
console.log('\n✓ Post-processing complete.');
console.log('Run: npx serve local-site');
