/**
 * MARKA RATING — Product Widgets, Popup Dashboards & Laureate Badges
 * Isolated IIFE — no global pollution, no CDN dependencies.
 */
(function () {
  "use strict";

  /* -----------------------------------------------------------------------
     PRODUCT DATA
     ----------------------------------------------------------------------- */
  var MARKA_DATA = {
    "2700279": {
      rating: 9.0, stars: 4.5, count: 856,
      isLaureate: true,
      proof: ["Оценки по скану", "Проверено экспертом", "Номинация подтверждена"],
      proofTypes: ["green", "green", "gold"],
      scans: 1248, buys: 962,
      delta7: "+0.3", delta30: "+0.6", delta90: "+1.1"
    },
    "2891830": {
      rating: 8.7, stars: 4.5, count: 856,
      isLaureate: false,
      proof: ["Оценки по скану", "Реальные оценки", "Марка Рейтинг"],
      proofTypes: ["green", "green", "green"],
      scans: 1104, buys: 843,
      delta7: "+0.1", delta30: "+0.4", delta90: "+0.8"
    },
    "2719512": {
      rating: 8.8, stars: 4.5, count: 1034,
      isLaureate: false,
      proof: ["Оценки по скану", "Реальные оценки", "Марка Рейтинг"],
      proofTypes: ["green", "green", "green"],
      scans: 1398, buys: 1021,
      delta7: "+0.2", delta30: "+0.5", delta90: "+0.9"
    },
    "2719641": {
      rating: 9.1, stars: 4.5, count: 742,
      isLaureate: false,
      proof: ["Оценки по скану", "Реальные оценки", "Марка Рейтинг"],
      proofTypes: ["green", "green", "green"],
      scans: 986, buys: 731,
      delta7: "+0.4", delta30: "+0.7", delta90: "+1.2"
    },
    "2719539": {
      rating: 8.9, stars: 4.5, count: 1205,
      isLaureate: false,
      proof: ["Оценки по скану", "Реальные оценки", "Марка Рейтинг"],
      proofTypes: ["green", "green", "green"],
      scans: 1552, buys: 1187,
      delta7: "+0.2", delta30: "+0.6", delta90: "+1.0"
    }
  };

  /* Generate deterministic data for products not in the table */
  function getProductData(id) {
    if (MARKA_DATA[id]) return MARKA_DATA[id];
    var n = parseInt(id, 10) || 0;
    var h = (n * 2654435761) >>> 0;
    var rating = (8.3 + (h % 17) * 0.1);
    rating = Math.round(rating * 10) / 10;
    var count = 180 + (h % 820);
    var scans = count + 100 + (h % 300);
    var buys = Math.floor(count * 0.88);
    var d7val = (0.1 + (h % 5) * 0.1).toFixed(1);
    var d30val = (0.3 + ((h >> 3) % 5) * 0.1).toFixed(1);
    var d90val = (0.7 + ((h >> 6) % 5) * 0.1).toFixed(1);
    return {
      rating: rating,
      stars: 4.0 + (h % 2) * 0.5,
      count: count,
      isLaureate: false,
      proof: ["Оценки по скану", "Реальные оценки", "Марка Рейтинг"],
      proofTypes: ["green", "green", "green"],
      scans: scans,
      buys: buys,
      delta7: "+" + d7val,
      delta30: "+" + d30val,
      delta90: "+" + d90val
    };
  }

  /* -----------------------------------------------------------------------
     HELPERS
     ----------------------------------------------------------------------- */
  var LOGO_SRC = "assets/marka-rating-logo.jpg";
  var LAUREATE_SRC = "assets/marka-rating-laureate.jpg";

  var STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

  var _uidCounter = 0;

  function uid() {
    return "mw" + (++_uidCounter);
  }

  function fmtNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); /* non-breaking space */
  }

  function renderStars(starsVal, size) {
    size = size || 11;
    var full = Math.floor(starsVal);
    var half = (starsVal % 1) >= 0.25 && (starsVal % 1) < 0.75;
    var empty = 5 - full - (half ? 1 : 0);
    var u = uid();
    var html = "";

    for (var i = 0; i < full; i++) {
      html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 20 20" aria-hidden="true"><path fill="#FFB300" d="' + STAR_PATH + '"/></svg>';
    }
    if (half) {
      html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 20 20" aria-hidden="true">'
        + '<defs><clipPath id="hc' + u + '"><rect x="0" y="0" width="10" height="20"/></clipPath></defs>'
        + '<path fill="#e2e8f0" d="' + STAR_PATH + '"/>'
        + '<path fill="#FFB300" d="' + STAR_PATH + '" clip-path="url(#hc' + u + ')"/>'
        + '</svg>';
    }
    for (var j = 0; j < empty; j++) {
      html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 20 20" aria-hidden="true"><path fill="#e2e8f0" d="' + STAR_PATH + '"/></svg>';
    }
    return html;
  }

  function logoHtml(cls) {
    return '<div class="' + cls + '">'
      + '<img src="' + LOGO_SRC + '" alt="M" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';" />'
      + '<span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-weight:900;color:#fff;font-size:14px;">M</span>'
      + '</div>';
  }

  function badgeSvg(id) {
    var gf = 'lbf' + id, gb = 'lbb' + id, fi = 'lbs' + id;
    var shield = 'M5,1 H43 Q47,1 47,5 V34 C47,50 24,57 24,57 C24,57 1,50 1,34 V5 Q1,1 5,1 Z';
    var inner  = 'M7,3.5 H41 Q44.5,3.5 44.5,7 V34 C44.5,48.5 24,54.5 24,54.5 C24,54.5 3.5,48.5 3.5,34 V7 Q3.5,3.5 7,3.5 Z';
    return '<svg class="marka-laureate-badge__svg" viewBox="0 0 48 58" xmlns="http://www.w3.org/2000/svg" aria-label="Лауреат 2026">'
      + '<defs>'
      + '<linearGradient id="' + gf + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#2b1f06"/>'
      + '<stop offset="55%" stop-color="#0d0b04"/>'
      + '<stop offset="100%" stop-color="#1c1407"/>'
      + '</linearGradient>'
      + '<linearGradient id="' + gb + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#FFE577"/>'
      + '<stop offset="100%" stop-color="#B8820A"/>'
      + '</linearGradient>'
      + '<filter id="' + fi + '" x="-40%" y="-25%" width="180%" height="170%">'
      + '<feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="rgba(120,70,0,0.55)"/>'
      + '</filter>'
      + '</defs>'
      /* shield fill */
      + '<path d="' + shield + '" fill="url(#' + gf + ')" filter="url(#' + fi + ')"/>'
      /* gold outer border */
      + '<path d="' + shield + '" fill="none" stroke="url(#' + gb + ')" stroke-width="1.8"/>'
      /* inner glow line */
      + '<path d="' + inner + '" fill="none" stroke="rgba(255,220,80,0.22)" stroke-width="0.8"/>'
      /* top gloss band */
      + '<path d="M5,1 H43 Q47,1 47,5 V13 Q47,15 44,15 L4,15 Q1,15 1,13 V5 Q1,1 5,1 Z" fill="rgba(255,230,100,0.09)"/>'
      /* ✦ star */
      + '<text x="24" y="15.5" text-anchor="middle" font-size="8.5" fill="#FFD060" font-family="system-ui,Arial,sans-serif">✦</text>'
      /* ЛАУРЕАТ */
      + '<text x="24" y="25" text-anchor="middle" font-size="5.7" font-weight="800" fill="#FFE570" font-family="system-ui,Arial,sans-serif" letter-spacing="0.5">ЛАУРЕАТ</text>'
      /* 2026 */
      + '<text x="24" y="38" text-anchor="middle" font-size="13" font-weight="900" fill="#FFD060" font-family="system-ui,Arial,sans-serif" letter-spacing="-0.5">2026</text>'
      /* МАРКА · РЕЙТИНГ */
      + '<text x="24" y="46.5" text-anchor="middle" font-size="4.5" font-weight="700" fill="rgba(255,210,90,0.88)" font-family="system-ui,Arial,sans-serif" letter-spacing="0.15">МАРКА · РЕЙТИНГ</text>'
      /* bottom ✦ */
      + '<text x="24" y="53.5" text-anchor="middle" font-size="4.5" fill="rgba(255,200,80,0.6)" font-family="system-ui,Arial,sans-serif">✦</text>'
      + '</svg>';
  }

  function laureateImgHtml(cls) {
    /* cls kept for API compat; SVG needs no class — it fills its container */
    return badgeSvg(uid());
  }

  /* Sparkline SVG */
  function sparklineSvg() {
    var gradId = "sf-" + uid();
    return '<svg class="mpop__sparkline" width="68" height="44" viewBox="0 0 68 44" fill="none" aria-hidden="true">'
      + '<defs>'
      + '<linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#10b981" stop-opacity="0.18"/>'
      + '<stop offset="100%" stop-color="#10b981" stop-opacity="0"/>'
      + '</linearGradient>'
      + '</defs>'
      + '<path d="M4 38 L14 31 L24 25 L34 20 L44 14 L54 9 L64 5" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
      + '<path d="M4 38 L14 31 L24 25 L34 20 L44 14 L54 9 L64 5 L64 44 L4 44 Z" fill="url(#' + gradId + ')"/>'
      + '<circle cx="64" cy="5" r="2.5" fill="#10b981"/>'
      + '</svg>';
  }

  function sparklineSvgCard() {
    return '<svg width="80" height="40" viewBox="0 0 80 40" fill="none" aria-hidden="true" style="margin-left:auto;flex-shrink:0;">'
      + '<path d="M4 34 L16 28 L28 22 L40 17 L52 12 L64 7 L76 4" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" fill="none"/>'
      + '<circle cx="76" cy="4" r="2.5" fill="#10b981"/>'
      + '</svg>';
  }

  /* ── 3-D gradient icon generators (each call needs a unique id suffix) ── */

  function icoScan(id) {
    var g = 'isg' + id;
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'
      + '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0%" stop-color="#6ee7b7"/><stop offset="100%" stop-color="#047857"/>'
      + '</linearGradient></defs>'
      + '<rect x="3" y="3" width="6" height="6" rx="1.5" style="fill:url(#' + g + ');stroke:none"/>'
      + '<rect x="15" y="3" width="6" height="6" rx="1.5" style="fill:url(#' + g + ');stroke:none"/>'
      + '<rect x="3" y="15" width="6" height="6" rx="1.5" style="fill:url(#' + g + ');stroke:none"/>'
      + '<rect x="3.5" y="3.5" width="3.5" height="2" rx="1" style="fill:rgba(255,255,255,0.5);stroke:none"/>'
      + '<rect x="15.5" y="3.5" width="3.5" height="2" rx="1" style="fill:rgba(255,255,255,0.5);stroke:none"/>'
      + '<rect x="3.5" y="15.5" width="3.5" height="2" rx="1" style="fill:rgba(255,255,255,0.5);stroke:none"/>'
      + '<rect x="15" y="15" width="5" height="2" rx="1" style="fill:url(#' + g + ');stroke:none"/>'
      + '<rect x="15" y="19" width="5" height="2" rx="1" style="fill:url(#' + g + ');stroke:none"/>'
      + '<rect x="20" y="15" width="2" height="6" rx="1" style="fill:url(#' + g + ');stroke:none"/>'
      + '</svg>';
  }

  function icoCart(id) {
    var g = 'icg' + id;
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'
      + '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#1e40af"/>'
      + '</linearGradient></defs>'
      + '<path d="M5.5 4h14.3l-2.4 9.6a2 2 0 0 1-1.95 1.4H8.5a2 2 0 0 1-1.95-1.6z" style="fill:url(#' + g + ');stroke:none"/>'
      + '<path d="M5.5 4h14.3l-0.5 2.2H6z" style="fill:rgba(255,255,255,0.42);stroke:none"/>'
      + '<path d="M2 2h2.5l0.6 2.2" style="fill:none;stroke:#3b82f6;stroke-width:1.8;stroke-linecap:round"/>'
      + '<circle cx="9.5" cy="19" r="1.8" style="fill:url(#' + g + ');stroke:none"/>'
      + '<circle cx="17" cy="19" r="1.8" style="fill:url(#' + g + ');stroke:none"/>'
      + '</svg>';
  }

  function icoStar(id) {
    var g = 'iag' + id;
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'
      + '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#fcd34d"/><stop offset="100%" stop-color="#b45309"/>'
      + '</linearGradient></defs>'
      + '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" style="fill:url(#' + g + ');stroke:none"/>'
      + '<polygon points="12 2 13.6 5.2 15.09 8.26 8.91 8.26 10.4 5.2" style="fill:rgba(255,255,255,0.48);stroke:none"/>'
      + '</svg>';
  }

  function icoCheck(id) {
    var g = 'ichg' + id;
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'
      + '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#6ee7b7"/><stop offset="100%" stop-color="#047857"/>'
      + '</linearGradient></defs>'
      + '<circle cx="12" cy="12" r="10" style="fill:url(#' + g + ');stroke:none"/>'
      + '<ellipse cx="12" cy="7" rx="5.5" ry="3" style="fill:rgba(255,255,255,0.42);stroke:none"/>'
      + '<polyline points="7.5 12 10.5 15.5 16.5 8.5" style="fill:none;stroke:white;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round"/>'
      + '</svg>';
  }

  function icoAward(id) {
    var g = 'iawg' + id;
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'
      + '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#b45309"/>'
      + '</linearGradient></defs>'
      + '<circle cx="12" cy="9" r="7.5" style="fill:url(#' + g + ');stroke:none"/>'
      + '<ellipse cx="12" cy="5.5" rx="4.5" ry="2.2" style="fill:rgba(255,255,255,0.5);stroke:none"/>'
      + '<path d="M7.5 15.5 L7 22 L12 19 L17 22 L16.5 15.5" style="fill:url(#' + g + ');stroke:none"/>'
      + '<path d="M7.5 15.5 L8.5 17.5 L12 16.5 L15.5 17.5 L16.5 15.5 Z" style="fill:rgba(255,255,255,0.35);stroke:none"/>'
      + '</svg>';
  }

  function proofIcon(type, id) {
    if (type === "gold") return icoAward(id || uid());
    return icoCheck(id || uid());
  }

  /* -----------------------------------------------------------------------
     CATALOGUE MINI WIDGET
     ----------------------------------------------------------------------- */
  function buildMiniWidget(data, productId) {
    var trigId = "mpw-trigger-" + productId;
    var shortLabel = data.proof[0];

    return '<div class="marka-product-widget" data-mpw-id="' + productId + '">'
      + '<div class="marka-product-widget__trigger js-mpw-trigger" id="' + trigId + '" '
      + 'role="button" tabindex="0" aria-haspopup="true" aria-expanded="false" '
      + 'aria-label="Марка Рейтинг ' + data.rating + ' из 10">'
      + logoHtml("marka-product-widget__logo")
      + '<div class="marka-product-widget__score">'
      + '<span class="marka-product-widget__val">' + data.rating + '</span>'
      + '<span class="marka-product-widget__max">/10</span>'
      + '</div>'
      + '<div class="marka-product-widget__stars">' + renderStars(data.stars, 10) + '</div>'
      + '<div class="marka-product-widget__sep"></div>'
      + '<div class="marka-product-widget__count">' + fmtNum(data.count) + ' оценок</div>'
      + '<div class="marka-product-widget__proof">' + shortLabel + '</div>'
      + '</div>'
      + '</div>';
  }

  /* -----------------------------------------------------------------------
     FULL POPUP DASHBOARD — appended to body
     ----------------------------------------------------------------------- */
  function buildPopup(data, productId) {
    var id = "mpw-popup-" + productId;

    var proofPills = "";
    for (var i = 0; i < data.proof.length; i++) {
      var pType = data.proofTypes[i] === "gold" ? "mpop__proof-pill--gold" : "mpop__proof-pill--green";
      proofPills += '<span class="mpop__proof-pill ' + pType + '">'
        + proofIcon(data.proofTypes[i])
        + data.proof[i]
        + '</span>';
    }

    var laureateBlock = "";
    if (data.isLaureate) {
      laureateBlock = '<div class="mpop__laureate-img-wrap">' + laureateImgHtml("mpop__laureate-img") + '</div>';
    }

    return '<div class="marka-product-popup" id="' + id + '" role="dialog" aria-hidden="true">'
      /* Header */
      + '<div class="mpop__header">'
      + logoHtml("mpop__logo-wrap")
      + '<div>'
      + '<div class="mpop__title">Марка Рейтинг</div>'
      + '<div class="mpop__subtitle">Измеримый слой доверия</div>'
      + '</div>'
      + '</div>'

      /* Rating block */
      + '<div class="mpop__rating-block">'
      + '<div class="mpop__rating-left">'
      + '<div class="mpop__rating-val-row">'
      + '<span class="mpop__rating-num">' + data.rating + '</span>'
      + '<span class="mpop__rating-max-label">/10</span>'
      + '</div>'
      + '<div class="mpop__stars-row">' + renderStars(data.stars, 13) + '</div>'
      + '<div class="mpop__rating-count">' + fmtNum(data.count) + ' оценок</div>'
      + '</div>'
      + laureateBlock
      + '</div>'

      /* Proof signals */
      + '<div class="mpop__proof-row">' + proofPills + '</div>'

      + '<div class="mpop__divider"></div>'

      /* Dynamics */
      + '<div>'
      + '<div class="mpop__section-header"><span class="mpop__section-title">Динамика доверия</span></div>'
      + '<div class="mpop__dynamics-body">'
      + '<div class="mpop__dynamics-stats">'
      + '<div class="mpop__delta-item"><span class="mpop__delta-val">' + data.delta7 + '</span><span class="mpop__delta-period">7 дней</span></div>'
      + '<div class="mpop__delta-item"><span class="mpop__delta-val">' + data.delta30 + '</span><span class="mpop__delta-period">30 дней</span></div>'
      + '<div class="mpop__delta-item"><span class="mpop__delta-val">' + data.delta90 + '</span><span class="mpop__delta-period">90 дней</span></div>'
      + '</div>'
      + sparklineSvg()
      + '</div>'
      + '</div>'

      + '<div class="mpop__divider"></div>'

      /* Metrics */
      + '<div class="mpop__metrics">'
      + '<div class="mpop__metric-card">'
      + '<div class="mpop__metric-icon mpop__metric-icon--green">' + icoScan(uid()) + '</div>'
      + '<div class="mpop__metric-val">' + fmtNum(data.scans) + '</div>'
      + '<div class="mpop__metric-label">сканов</div>'
      + '</div>'
      + '<div class="mpop__metric-card">'
      + '<div class="mpop__metric-icon mpop__metric-icon--blue">' + icoCart(uid()) + '</div>'
      + '<div class="mpop__metric-val">' + fmtNum(data.buys) + '</div>'
      + '<div class="mpop__metric-label">покупки</div>'
      + '</div>'
      + '<div class="mpop__metric-card">'
      + '<div class="mpop__metric-icon mpop__metric-icon--amber">' + icoStar(uid()) + '</div>'
      + '<div class="mpop__metric-val">' + fmtNum(data.count) + '</div>'
      + '<div class="mpop__metric-label">оценок</div>'
      + '</div>'
      + '</div>'

      /* CTA row */
      + '<div class="mpop__cta-row">'
      + '<a href="/marka-rating/" target="_blank" rel="noopener noreferrer" class="mpop__cta">'
      + 'Открыть карточку рейтинга'
      + '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
      + '</a>'
      + '<a href="/marka-rating/" target="_blank" rel="noopener noreferrer" class="mpop__cta-secondary">Как считается рейтинг</a>'
      + '</div>'
      + '</div>';
  }

  /* -----------------------------------------------------------------------
     LAUREATE BADGE HTML — for catalogue and card
     ----------------------------------------------------------------------- */
  function buildLaureatesBadge(size) {
    var cls = size === "card" ? "marka-laureate-badge marka-laureate-badge--card" : "marka-laureate-badge marka-laureate-badge--catalogue";
    return '<div class="' + cls + '">' + badgeSvg(uid()) + '</div>';
  }

  /* -----------------------------------------------------------------------
     CARD.HTML FULL TRUST BLOCK
     ----------------------------------------------------------------------- */
  function buildCardTrustBlock(data) {
    var proofPills = "";
    for (var i = 0; i < data.proof.length; i++) {
      var pType = data.proofTypes[i] === "gold" ? "mctb__proof-pill--gold" : "mctb__proof-pill--green";
      proofPills += '<span class="mctb__proof-pill ' + pType + '">'
        + proofIcon(data.proofTypes[i])
        + data.proof[i]
        + '</span>';
    }

    return '<div class="marka-card-trust-block">'
      /* Header */
      + '<div class="mctb__header">'
      + logoHtml("mctb__logo-wrap")
      + '<div>'
      + '<div class="mctb__title">Марка Рейтинг</div>'
      + '<div class="mctb__subtitle">Измеримый уровень доверия к товару</div>'
      + '</div>'
      + '</div>'

      /* Body: rating col + right col */
      + '<div class="mctb__body">'

      + '<div class="mctb__rating-col">'
      + '<div class="mctb__rating-val-row">'
      + '<span class="mctb__rating-num">' + data.rating + '</span>'
      + '<span class="mctb__rating-max">/10</span>'
      + '</div>'
      + '<div class="mctb__stars-row">' + renderStars(data.stars, 16) + '</div>'
      + '<div class="mctb__count">' + fmtNum(data.count) + ' оценок</div>'
      + '</div>'

      + '<div class="mctb__right-col">'

      + '<div class="mctb__proof-grid">' + proofPills + '</div>'

      /* Dynamics */
      + '<div class="mctb__dynamics-row">'
      + '<span class="mctb__dyn-label">Динамика</span>'
      + '<div class="mctb__dyn-items">'
      + '<div class="mctb__dyn-item"><span class="mctb__dyn-val">' + data.delta7 + '</span><span class="mctb__dyn-per">7 дн.</span></div>'
      + '<div class="mctb__dyn-item"><span class="mctb__dyn-val">' + data.delta30 + '</span><span class="mctb__dyn-per">30 дн.</span></div>'
      + '<div class="mctb__dyn-item"><span class="mctb__dyn-val">' + data.delta90 + '</span><span class="mctb__dyn-per">90 дн.</span></div>'
      + '</div>'
      + sparklineSvgCard()
      + '</div>'

      /* Metrics */
      + '<div class="mctb__metrics">'
      + '<div class="mctb__metric"><div class="mctb__metric-icon mctb__metric-icon--green">' + icoScan(uid()) + '</div>'
      + '<div class="mctb__metric-val">' + fmtNum(data.scans) + '</div><div class="mctb__metric-label">сканов</div></div>'
      + '<div class="mctb__metric"><div class="mctb__metric-icon mctb__metric-icon--blue">' + icoCart(uid()) + '</div>'
      + '<div class="mctb__metric-val">' + fmtNum(data.buys) + '</div><div class="mctb__metric-label">покупки</div></div>'
      + '<div class="mctb__metric"><div class="mctb__metric-icon mctb__metric-icon--amber">' + icoStar(uid()) + '</div>'
      + '<div class="mctb__metric-val">' + fmtNum(data.count) + '</div><div class="mctb__metric-label">оценок</div></div>'
      + '</div>'

      + '</div>' /* end right col */
      + '</div>' /* end body */

      /* CTA row */
      + '<div class="mctb__cta-row">'
      + '<a href="/marka-rating/" target="_blank" rel="noopener noreferrer" class="mctb__cta">'
      + 'Открыть карточку Марка Рейтинг'
      + '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
      + '</a>'
      + (data.isLaureate
          ? '<div class="mctb__laureate-corner">' + laureateImgHtml("") + '</div>'
          : '')
      + '</div>'

      + '</div>';
  }

  /* -----------------------------------------------------------------------
     POPUP MANAGER — positioning, show/hide, events
     ----------------------------------------------------------------------- */
  var activePopupEl = null;
  var openTimer = null;
  var closeTimer = null;
  var SHOW_DELAY = 100;
  var HIDE_DELAY = 200;

  function positionPopup(triggerEl, popupEl) {
    var r = triggerEl.getBoundingClientRect();
    var pw = 336;
    var ph = popupEl.offsetHeight || 520;
    var margin = 8;

    var top = r.bottom + margin;
    var left = r.left;

    /* Prefer below; flip above if not enough space */
    if (top + ph > window.innerHeight - 16) {
      var aboveTop = r.top - ph - margin;
      if (aboveTop >= 10) {
        top = aboveTop;
      }
    }

    /* Horizontal clamping */
    if (left + pw > window.innerWidth - 12) {
      left = window.innerWidth - pw - 12;
    }
    if (left < 10) left = 10;

    popupEl.style.top = top + "px";
    popupEl.style.left = left + "px";
    popupEl.style.width = pw + "px";
  }

  function showPopup(triggerEl, popupEl) {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

    /* Close any other popup */
    if (activePopupEl && activePopupEl !== popupEl) {
      activePopupEl.classList.remove("mpop-visible");
      activePopupEl.setAttribute("aria-hidden", "true");
    }

    positionPopup(triggerEl, popupEl);
    popupEl.classList.add("mpop-visible");
    popupEl.setAttribute("aria-hidden", "false");
    triggerEl.setAttribute("aria-expanded", "true");
    activePopupEl = popupEl;
  }

  function hidePopup(triggerEl, popupEl) {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      popupEl.classList.remove("mpop-visible");
      popupEl.setAttribute("aria-hidden", "true");
      if (triggerEl) triggerEl.setAttribute("aria-expanded", "false");
      if (activePopupEl === popupEl) activePopupEl = null;
    }, HIDE_DELAY);
  }

  function closeAll() {
    if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    document.querySelectorAll(".marka-product-popup.mpop-visible").forEach(function (el) {
      el.classList.remove("mpop-visible");
      el.setAttribute("aria-hidden", "true");
    });
    document.querySelectorAll(".js-mpw-trigger[aria-expanded='true']").forEach(function (el) {
      el.setAttribute("aria-expanded", "false");
    });
    activePopupEl = null;
  }

  function wireupWidget(triggerEl, popupEl) {
    /* Desktop hover */
    triggerEl.addEventListener("mouseenter", function () {
      if (openTimer) clearTimeout(openTimer);
      openTimer = setTimeout(function () { showPopup(triggerEl, popupEl); }, SHOW_DELAY);
    });

    triggerEl.addEventListener("mouseleave", function () {
      if (openTimer) { clearTimeout(openTimer); openTimer = null; }
      hidePopup(triggerEl, popupEl);
    });

    popupEl.addEventListener("mouseenter", function () {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    });

    popupEl.addEventListener("mouseleave", function () {
      hidePopup(triggerEl, popupEl);
    });

    /* Click / tap toggle */
    triggerEl.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (popupEl.classList.contains("mpop-visible")) {
        closeAll();
      } else {
        showPopup(triggerEl, popupEl);
      }
    });

    /* Keyboard */
    triggerEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (popupEl.classList.contains("mpop-visible")) {
          closeAll();
        } else {
          showPopup(triggerEl, popupEl);
        }
      }
    });

    /* Reposition on scroll/resize */
    window.addEventListener("scroll", function () {
      if (popupEl.classList.contains("mpop-visible")) {
        positionPopup(triggerEl, popupEl);
      }
    }, { passive: true });
  }

  /* -----------------------------------------------------------------------
     CATALOGUE PAGE — inject widgets into each product card
     ----------------------------------------------------------------------- */
  function initCatalogue() {
    var wrappers = document.querySelectorAll(".blocks_product_fix_w");
    if (!wrappers.length) return;

    var popupsFragment = document.createDocumentFragment();

    wrappers.forEach(function (wrapper) {
      /* Find product ID from nearby price element */
      var priceEl = wrapper.querySelector("[id^='price_product_']");
      if (!priceEl) return;
      var productId = priceEl.id.replace("price_product_", "");
      var data = getProductData(productId);

      /* --- Inject mini widget after bp_text_info (h2) --- */
      var h2 = wrapper.querySelector(".bp_text_info");
      if (!h2) return;

      var widgetDiv = document.createElement("div");
      widgetDiv.innerHTML = buildMiniWidget(data, productId);
      var widget = widgetDiv.firstChild;
      h2.parentNode.insertBefore(widget, h2.nextSibling);

      /* --- Inject laureate badge on product image --- */
      if (data.isLaureate) {
        var imgWrap = wrapper.querySelector(".bp_product_img");
        if (imgWrap) {
          var badgeDiv = document.createElement("div");
          badgeDiv.innerHTML = buildLaureatesBadge("catalogue");
          imgWrap.appendChild(badgeDiv.firstChild);
        }
      }

      /* --- Build popup and add to fragment --- */
      var popDiv = document.createElement("div");
      popDiv.innerHTML = buildPopup(data, productId);
      var popup = popDiv.firstChild;
      popupsFragment.appendChild(popup);

      /* Wire up trigger to popup after DOM insertion */
      widget._markaPopup = popup;
    });

    /* Append all popups to body at once */
    document.body.appendChild(popupsFragment);

    /* Wire up all trigger/popup pairs */
    wrappers.forEach(function (wrapper) {
      var wgt = wrapper.querySelector(".marka-product-widget");
      if (!wgt) return;
      var productId = wgt.getAttribute("data-mpw-id");
      var triggerEl = wgt.querySelector(".js-mpw-trigger");
      var popupEl = document.getElementById("mpw-popup-" + productId);
      if (triggerEl && popupEl) {
        wireupWidget(triggerEl, popupEl);
      }
    });
  }

  /* -----------------------------------------------------------------------
     CARD.HTML — compact inline rating strip + popup + badge
     ----------------------------------------------------------------------- */
  function buildCardRatingWidget(data, productId) {
    var trigId = "mpr-trigger-" + productId;
    var ariaLabel = "Марка Рейтинг " + data.rating + " из 10, " + fmtNum(data.count)
      + " оценок покупателей. Нажмите для просмотра детальной статистики.";

    var signalGreen = '<span class="mpr__signal mpr__signal--green">'
      + icoCheck(uid()) + data.proof[0] + '</span>';

    var signalGold = data.isLaureate
      ? '<span class="mpr__signal mpr__signal--gold">'
        + '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:10px;height:10px;fill:#d97706;stroke:none">'
        + '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
        + '</svg>Лауреат 2026</span>'
      : '';

    return '<div class="marka-product-rating" data-mpw-id="' + productId + '">'
      + '<div class="marka-product-rating__trigger js-mpw-trigger" id="' + trigId + '"'
      + ' role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false"'
      + ' aria-label="' + ariaLabel + '">'

      /* Logo + brand */
      + '<div class="mpr__section mpr__section--brand">'
      + logoHtml("mpr__logo-wrap")
      + '<div class="mpr__brand-text">'
      + '<span class="mpr__brand-name">Марка Рейтинг</span>'
      + '<span class="mpr__brand-sub">Рейтинг товара</span>'
      + '</div>'
      + '</div>'

      + '<span class="mpr__sep" aria-hidden="true"></span>'

      /* Score + stars + count */
      + '<div class="mpr__section mpr__section--score">'
      + '<span class="mpr__score">' + data.rating + '</span>'
      + '<span class="mpr__score-max">/10</span>'
      + '<div class="mpr__stars">' + renderStars(data.stars, 13) + '</div>'
      + '<span class="mpr__count">' + fmtNum(data.count) + ' оценок покупателей</span>'
      + '</div>'

      + '<span class="mpr__sep" aria-hidden="true"></span>'

      /* Proof signals */
      + '<div class="mpr__section mpr__section--signals">'
      + '<div class="mpr__signals">' + signalGreen + signalGold + '</div>'
      + '</div>'

      /* Chevron */
      + '<svg class="mpr__chevron" viewBox="0 0 24 24" aria-hidden="true">'
      + '<polyline points="9 18 15 12 9 6"></polyline>'
      + '</svg>'

      + '</div>'
      + '</div>';
  }

  function initCard() {
    var productId = "2700279";
    var data = getProductData(productId);

    /* Compact inline strip — inject into sidebar's card_product_info
       (sits between title and price in the right-hand desktop sidebar) */
    if (!document.getElementById("mpr-trigger-" + productId)) {
      var infoArea = document.querySelector(".pages_card__sidebar .card_product_info")
        || document.querySelector(".card_product_info");
      if (infoArea) {
        var widgetDiv = document.createElement("div");
        widgetDiv.innerHTML = buildCardRatingWidget(data, productId);
        infoArea.appendChild(widgetDiv.firstChild);
      }
    }

    /* Build popup and append to body */
    var popupId = "mpw-popup-" + productId;
    if (!document.getElementById(popupId)) {
      var popDiv = document.createElement("div");
      popDiv.innerHTML = buildPopup(data, productId);
      document.body.appendChild(popDiv.firstChild);
    }

    /* Wire trigger → popup */
    var triggerEl = document.getElementById("mpr-trigger-" + productId);
    var popupEl = document.getElementById(popupId);
    if (triggerEl && popupEl) {
      wireupWidget(triggerEl, popupEl);
    }

    /* Laureate badge on main gallery */
    var galleryWrap = document.querySelector(".wrap_gallery_card_main");
    if (galleryWrap && !galleryWrap.querySelector(".marka-laureate-badge--card")) {
      var badgeDiv = document.createElement("div");
      badgeDiv.innerHTML = buildLaureatesBadge("card");
      galleryWrap.appendChild(badgeDiv.firstChild);
    }
  }

  /* -----------------------------------------------------------------------
     GLOBAL CLOSE HANDLERS
     ----------------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".marka-product-widget") && !e.target.closest(".marka-product-popup")) {
      closeAll();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.keyCode === 27) {
      closeAll();
    }
  });

  window.addEventListener("resize", function () {
    closeAll();
  });

  /* -----------------------------------------------------------------------
     INIT ON DOM READY
     ----------------------------------------------------------------------- */
  function init() {
    var isCatalogue = !!document.querySelector(".wrap_list_prod");
    var isCard = !!document.querySelector(".pages_card");

    if (isCatalogue) initCatalogue();
    if (isCard) initCard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
