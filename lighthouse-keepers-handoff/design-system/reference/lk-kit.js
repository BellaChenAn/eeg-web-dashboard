/* Lighthouse Keepers pixel-art kit: palette reader, sprite drawing and the harbour scene renderer. */
(function () {
  'use strict';

  var THEMES = [
    { id: 'harbour-night', name: 'Harbour Night', mood: 'Deep navy water and a muted-amber lamp. The classic: the beam is the only warm thing on screen.' },
    { id: 'sea-glass', name: 'Sea Glass', mood: 'Soft teal and sage like frosted beach glass, with a terracotta stripe. The calmest of the set.' },
    { id: 'slate-lantern', name: 'Slate & Lantern', mood: 'Almost-grey blue slate and one golden lantern. Least visual noise: the beam does all the talking.' },
    { id: 'deep-fjord', name: 'Deep Fjord', mood: 'All blue: spruce-dark water and a cool moonlight beam. Warm sand-coloured routes for the Pilot.' },
    { id: 'dusk-harbour', name: 'Dusk Harbour', mood: 'Dusty periwinkle-blue with a peach-coral lamp. Gentle and storybook-like.' },
    { id: 'foggy-dawn', name: 'Foggy Dawn', mood: 'A light palette: pale sky, slate fog that darkens as it thickens. Suits bright rooms and daytime play.' },
    { id: 'storm-ink', name: 'Storm Ink', mood: 'High-contrast option: inky night, white tower, bright beam. For low-vision players or glare.' }
  ];

  var KEYS = ['sky-deep', 'sky', 'sea-deep', 'sea', 'sea-light', 'crest', 'fog', 'fog-thick', 'beam', 'beam-core', 'lamp',
    'rock', 'rock-light', 'land', 'grass', 'tower', 'stripe', 'roof', 'hull', 'hull-dark', 'sail', 'star', 'frost', 'outline',
    'ink', 'ink-muted', 'surface', 'surface-raised', 'border', 'accent', 'on-accent', 'success', 'route',
    'skin-1', 'skin-2', 'skin-3', 'skin-4'];

  /* ---------- colour helpers ---------- */
  function parse(c) {
    c = (c || '').trim();
    if (c.charAt(0) === '#') {
      var h = c.slice(1);
      if (h.length === 3 || h.length === 4) h = h.split('').map(function (x) { return x + x; }).join('');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    var m = c.match(/rgba?\(([^)]+)\)/);
    if (m) { var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2]]; }
    return [255, 0, 255];
  }
  function hex(rgb) {
    return '#' + rgb.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  }
  function mixRGB(A, B, t) { return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; }
  function mix(a, b, t) { return hex(mixRGB(parse(a), parse(b), t)); }

  /* ---------- palettes ---------- */
  var jsonPal = null;
  function currentTheme() { return document.documentElement.getAttribute('data-theme') || THEMES[0].id; }
  function readVars(themeId) {
    var el = document.createElement('div');
    el.setAttribute('data-theme', themeId);
    el.style.display = 'none';
    (document.body || document.documentElement).appendChild(el);
    var cs = getComputedStyle(el), out = {};
    KEYS.forEach(function (k) { out[k] = cs.getPropertyValue('--' + k).trim(); });
    el.remove();
    return out;
  }
  function pal(themeId) {
    themeId = themeId || currentTheme();
    var p = readVars(themeId);
    if (!p.sea && jsonPal) p = jsonPal[themeId] || jsonPal[THEMES[0].id];
    return p;
  }
  function buildJson(tokens) {
    var themes = tokens.color.themes.map(function (t) { return t.id; }), out = {};
    themes.forEach(function (id) { out[id] = {}; });
    tokens.color.tokens.forEach(function (t) {
      themes.forEach(function (id) {
        var v = typeof t.value === 'string' ? t.value : (t.value[id] || t.value[themes[0]]);
        out[id][t.name] = v;
      });
    });
    return out;
  }
  /* call cb once colours are readable (CSS vars, else tokens.json) */
  function ready(cb) {
    function go() { if (document.fonts && document.fonts.ready) document.fonts.ready.then(cb); else cb(); }
    if (pal().sea) return go();
    fetch('../../tokens.json').then(function (r) { return r.json(); }).then(function (j) { jsonPal = buildJson(j); go(); })
      .catch(function () { go(); });
  }
  function onTheme(cb) {
    var t = null;
    function fire() { clearTimeout(t); t = setTimeout(cb, 30); }
    new MutationObserver(fire).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
    if (document.head) new MutationObserver(fire).observe(document.head, { childList: true, subtree: true, characterData: true });
  }

  /* ---------- noise + dithering ---------- */
  var BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function bay(x, y) { return (BAYER[y & 3][x & 3] + 0.5) / 16; }
  function hash(x, y, s) {
    var h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    h = h ^ (h >>> 16);
    return ((h >>> 0) % 10000) / 10000;
  }
  function vnoise(x, y, sc, s) {
    var fx = x / sc, fy = y / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
    var a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
    return (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
  }
  function fbm(x, y, s) { return vnoise(x * 0.6, y, 22, s) * 0.65 + vnoise(x, y, 9, s + 5) * 0.35; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- sprites ---------- */
  var MAP = { o: 'outline', w: 'tower', r: 'stripe', k: 'roof', l: 'lamp', b: 'beam-core', y: 'beam', h: 'hull', H: 'hull-dark',
    s: 'sail', g: 'grass', d: 'land', c: 'rock', C: 'rock-light', f: 'frost', e: 'skin-2', i: 'outline', m: 'hull-dark',
    a: 'sea-light', t: 'crest', u: 'success', q: 'route', n: 'accent', S: 'star' };

  var SPRITES = {
    row: [
      '....e....',
      '...ere...',
      'ohhhhhhho',
      '.oHHHHHo.',
      '..ooooo..'],
    sail: [
      '.....o.....',
      '.....os....',
      '.....oss...',
      '.....osss..',
      '.....ossss.',
      '..e..osssss',
      '.ere.o.....',
      'ohhhhhhhhho',
      '.oHHHHHHHo.',
      '..ooooooo..'],
    fish: [
      '....o.......',
      '....o.......',
      '...owwwo....',
      '...owlwo.e..',
      'ohhhhhhhhhho',
      'ohhhhhhhhhho',
      '.oHHHHHHHHo.',
      '..oooooooo..'],
    storm: [
      '.........o..................',
      '.........o..................',
      '........ooo........oo.......',
      '.......owwwo......orro......',
      '.......owlwo......orro......',
      '..oooooooooooooooooooooooo..',
      '..owlwwlwwlwwlwwlwwlwwlwwo..',
      '..owwwwwwwwwwwwwwwwwwwwwwo..',
      'ohhhhhhhhhhhhhhhhhhhhhhhhhho',
      'ohhhhhhhhhhhhhhhhhhhhhhhhhho',
      '.oHHHHHHHHHHHHHHHHHHHHHHHHo.',
      '..oHHHHHHHHHHHHHHHHHHHHHHo..',
      '...oooooooooooooooooooooo...'],
    rock: [
      '...oo...',
      '..oCco..',
      '.oCCcco.',
      'oCCcccco'],
    flag: [
      'o.......',
      'orrrrr..',
      'orrrrrr.',
      'orrrrr..',
      'o.......',
      'o.......',
      'o.......',
      'oo......'],
    pot: [
      '.y...r.',
      'yly.rlr',
      '.yg.gr.',
      '..ggg..',
      'ohhhhho',
      '.ohhho.',
      '..ooo..'],
    gull: [
      'ss.....ss',
      '.ss...ss.',
      '...sos...',
      '....s....'],
    crab: [
      'r.r...r.r',
      '.r.....r.',
      '..rrrrr..',
      '.rroroor.',
      'r.r...r.r'],
    lantern: [
      '...o...',
      '..ooo..',
      '.olllo.',
      'olbbblo',
      '.olllo.',
      '..ooo..'],
    bunting: [
      'ooooooooooooooooo',
      '.rrr.sss.lll.rrr.',
      '..r...s...l...r..'],
    star: [
      '...y...',
      '...y...',
      '.yyyyy.',
      '..yby..',
      '.y...y.']
  };

  var HATS = {
    souwester: [
      '....oooo....',
      '...oHHHHo...',
      '..oHHHHHHo..',
      '.ooHHHHHHoo.',
      'oHHHHHHHHHHo'],
    beanie: [
      '.....oo.....',
      '....oHHo....',
      '..ooHHHHoo..',
      '.oHHHHHHHHo.',
      '.osHsHsHsHo.'],
    captain: [
      '............',
      '...oooooo...',
      '..osssssso..',
      '..oHHHHHHo..',
      '.oooooooooo.']
  };
  var BODY = [
    '.oeeeeeeeeo.',
    '.oeieeeeieo.',
    '.oeeeeeeeeo.',
    '.oeeemmeeeo.',
    '..oeeeeeeo..',
    '..oCCCCCCo..',
    '.oCCCCCCCCo.',
    'oCCoCCCCoCCo',
    'oeoCCCCCCoeo',
    '.ooCCCCCCoo.',
    '...oPPoPPo..',
    '...oPPoPPo..',
    '..oBBBoBBBo.',
    '..ooooooooo.'];

  function drawSprite(ctx, rows, x, y, p, opt) {
    opt = opt || {};
    var map = Object.assign({}, MAP, opt.map || {});
    var dimTo = opt.dimTo ? parse(p[opt.dimTo]) : null;
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      for (var i = 0; i < row.length; i++) {
        var ch = row.charAt(i);
        if (ch === '.' || ch === ' ') continue;
        var key = map[ch]; if (!key) continue;
        var col = p[key] || '#ff00ff';
        if (dimTo && opt.dim) col = hex(mixRGB(parse(col), dimTo, opt.dim));
        ctx.fillStyle = col;
        var xx = opt.flip ? x + (row.length - 1 - i) : x + i;
        ctx.fillRect(xx, y + j, 1, 1);
      }
    }
  }
  function spriteSize(rows) { return { w: Math.max.apply(null, rows.map(function (r) { return r.length; })), h: rows.length }; }

  function avatar(ctx, x, y, p, o) {
    o = o || {};
    var map = { H: o.hat || 'lamp', C: o.coat || 'stripe', e: o.skin || 'skin-2', P: 'roof', B: 'hull-dark', s: 'sail' };
    drawSprite(ctx, HATS[o.style || 'souwester'], x, y, p, { map: map });
    drawSprite(ctx, BODY, x, y + 5, p, { map: map });
  }

  /* ---------- lighthouse ---------- */
  var LH = { classic: { h: 34, lampY: 39 }, stubby: { h: 22, lampY: 28 }, stone: { h: 30, lampY: 35 } };

  function px(ctx, c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(x, y, w || 1, h || 1); }

  function lighthouse(ctx, p, bx, by, style, lit, frost) {
    style = style || 'classic';
    var g = LH[style], Ht = g.h, shade = function (c) { return mix(c, p.outline, 0.28); };
    var hw0 = style === 'stubby' ? 7 : style === 'stone' ? 5 : 6, hw1 = style === 'stubby' ? 6 : 4;
    if (style === 'stone') {
      // keeper's cottage
      var cx = bx + 6, cw = 13, ch = 8;
      px(ctx, p.outline, cx - 1, by - ch - 1, cw + 2, ch + 1);
      px(ctx, p.tower, cx, by - ch, cw, ch);
      px(ctx, shade(p.tower), cx + cw - 3, by - ch, 3, ch);
      for (var r = 0; r < 5; r++) px(ctx, r === 0 ? p.outline : p.stripe, cx - 1 + r, by - ch - 2 - r, cw + 2 - r * 2, 1);
      px(ctx, p.outline, cx + 2, by - 6, 4, 4);
      px(ctx, lit > 0.15 ? p.lamp : mix(p.lamp, p.outline, 0.4), cx + 3, by - 5, 2, 2);
      px(ctx, p.roof, cx + 8, by - 5, 3, 5);
    }
    for (var j = 0; j < Ht; j++) {
      var hw = Math.round(hw0 - (hw0 - hw1) * j / Ht), y = by - 1 - j, x0 = bx - hw, w = hw * 2;
      var base;
      if (style === 'classic') base = (Math.floor(j / 6) % 2 === 1) ? p.stripe : p.tower;
      else if (style === 'stubby') base = (j >= 7 && j <= 13) ? p.stripe : p.tower;
      else base = p['rock-light'];
      px(ctx, base, x0, y, w, 1);
      px(ctx, shade(base), x0 + Math.ceil(w * 0.62), y, w - Math.ceil(w * 0.62), 1);
      if (style === 'stone') {
        for (var i = 1; i < w - 1; i++) if (hash(i + j * 3, j, 4) > 0.8 || (j % 4 === 0 && i % 3 === (j / 4 % 2))) px(ctx, p.rock, x0 + i, y);
      }
      px(ctx, p.outline, x0 - 1, y); px(ctx, p.outline, x0 + w, y);
    }
    // door + window
    px(ctx, p.roof, bx - 1, by - 5, 2, 5);
    px(ctx, p.outline, bx - 1, by - Math.round(Ht * 0.6), 2, 3);
    if (style !== 'stone') px(ctx, mix(p.lamp, p.outline, 0.15), bx - 1, by - Math.round(Ht * 0.6) + 1, 1, 1);
    // gallery
    var gy = by - Ht - 1, gw = style === 'stubby' ? 16 : 14;
    px(ctx, p.outline, bx - gw / 2, gy, gw, 1);
    px(ctx, p.roof, bx - gw / 2 + 1, gy - 1, gw - 2, 1);
    for (var k = 0; k < gw; k += 2) px(ctx, p.roof, bx - gw / 2 + k, gy - 2, 1, 1);
    // lantern room
    var lw = style === 'stubby' ? 10 : 8, lh = style === 'stubby' ? 6 : 5, ly = gy - 2 - lh, lx = bx - lw / 2;
    var glass = lit > 0.55 ? p['beam-core'] : lit > 0.2 ? p.beam : mix(p.lamp, p.outline, 0.25);
    px(ctx, p.outline, lx - 1, ly, lw + 2, lh);
    px(ctx, glass, lx, ly, lw, lh);
    px(ctx, mix(glass, p.outline, 0.25), lx + lw / 2 - 1, ly, 1, lh);
    px(ctx, p.lamp, lx + lw / 2 - 1, ly + Math.floor(lh / 2) - 1, 2, 2);
    if (lit > 0.55) px(ctx, p['beam-core'], lx + lw / 2 - 1, ly + Math.floor(lh / 2) - 1, 2, 2);
    if (frost) {
      for (var fy = 0; fy < lh; fy++) for (var fx = 0; fx < lw; fx++) {
        if (fy === 0 || fx === 0 || fx === lw - 1 || ((fx + fy) % 3 === 0 && hash(fx, fy, 9) > 0.35)) px(ctx, p.frost, lx + fx, ly + fy);
      }
    }
    // roof
    if (style === 'stubby') {
      [12, 10, 8, 4].forEach(function (w, i) { px(ctx, p.roof, bx - w / 2, ly - 1 - i, w, 1); });
      px(ctx, p.outline, bx - 7, ly - 1, 1, 1); px(ctx, p.outline, bx + 6, ly - 1, 1, 1);
      px(ctx, p.outline, bx, ly - 6, 1, 2);
    } else {
      [12, 8, 4].forEach(function (w, i) { px(ctx, i === 0 ? p.outline : p.roof, bx - w / 2, ly - 1 - i, w, 1); });
      px(ctx, p.roof, bx - 5, ly - 1, 10, 1);
      px(ctx, p.outline, bx, ly - 5, 1, 2);
    }
    return { lx: bx, ly: ly + Math.floor(lh / 2) };
  }

  function island(ctx, p, bx, by) {
    for (var r = 0; r < 8; r++) {
      var hw = Math.round(15 + r * 1.4), y = by + r;
      if (r < 2) { px(ctx, r === 0 ? mix(p.grass, p.beam, 0.2) : p.grass, bx - hw, y, hw * 2, 1); }
      else {
        px(ctx, p.land, bx - hw, y, hw * 2, 1);
        for (var x = -hw; x < hw; x++) if (hash(x, r, 2) > 0.72) px(ctx, (x < 0) ? p['rock-light'] : p.rock, bx + x, y);
      }
      px(ctx, p.outline, bx - hw - 1, y); px(ctx, p.outline, bx + hw, y);
    }
    for (var f = -27; f < 27; f++) if ((f & 3) !== 3) px(ctx, p.crest, bx + f, by + 8);
    // dock
    var dx = bx + 22, dy = by + 3;
    px(ctx, p.hull, dx, dy, 22, 1); px(ctx, p['hull-dark'], dx, dy + 1, 22, 1);
    for (var k = 0; k < 22; k += 5) px(ctx, p['hull-dark'], dx + k, dy + 2, 1, 4);
    return { x: dx + 21, y: dy + 2 };
  }

  /* ---------- scene ---------- */
  var BOATS = {
    tide: [{ t: 'sail', x: 0.56, y: 0.56 }, { t: 'fish', x: 0.82, y: 0.8 }, { t: 'row', x: 0.38, y: 0.86 }, { t: 'row', x: 0.92, y: 0.47 }, { t: 'sail', x: 0.7, y: 0.42 }],
    storm: [{ t: 'storm', x: 0.7, y: 0.5 }, { t: 'row', x: 0.42, y: 0.84 }],
    dawn: [{ t: 'sail', x: 0.33, y: 0.78, docked: true }, { t: 'fish', x: 0.46, y: 0.8, docked: true }, { t: 'row', x: 0.58, y: 0.84 }, { t: 'row', x: 0.27, y: 0.86 }],
    none: []
  };
  var ROCKS = [{ x: 0.62, y: 0.66 }, { x: 0.76, y: 0.6 }, { x: 0.5, y: 0.74 }, { x: 0.88, y: 0.66 }];

  function harbour(canvas, o) {
    o = Object.assign({ w: 240, h: 135, attention: 0.6, steady: false, flare: false, fog: 'bands', fogDensity: 0.72, phase: 'tide',
      lighthouse: 'classic', frost: false, route: true, theme: null, seed: 7 }, o || {});
    var p = o.palette || pal(o.theme);
    var W = o.w, H = o.h;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    var C = {}; KEYS.forEach(function (k) { C[k] = parse(p[k]); });
    var sy = H / 135, horizon = Math.round(H * 0.36);
    var bx = Math.round(W * 0.15), by = Math.round(H * 0.62);
    var g = LH[o.lighthouse] || LH.classic;
    var lampX = bx, lampY = by - g.lampY;
    var phase = o.phase;
    var att = o.flare ? 1 : (phase === 'lighting' ? Math.min(o.attention, 0.15) : (phase === 'dawn' ? 0.25 : o.attention));
    var a0 = Math.atan2(H * 0.68 - lampY, W * 0.8 - lampX);
    var half = 0.035 + 0.3 * att, len = W * (0.32 + 0.78 * att);
    var dens = o.fogDensity * ({ lighting: 1.0, calm: 0.55, tide: 1, storm: 1.3, dawn: 0.22 }[phase] || 1);

    function lit(x, y) {
      var dx = x - lampX, dy = y - lampY, dist = Math.sqrt(dx * dx + dy * dy), L = 0;
      var ang = Math.atan2(dy, dx) - a0;
      while (ang > Math.PI) ang -= 2 * Math.PI; while (ang < -Math.PI) ang += 2 * Math.PI;
      if (dist > 1 && Math.abs(ang) < half && dist < len) {
        var edge = 1 - Math.abs(ang) / half, fall = 1 - dist / len;
        L = Math.min(1, Math.pow(edge, 0.45) * (0.3 + 0.7 * Math.pow(fall, 0.6))) * clamp((att - 0.08) / 0.17, 0, 1);
        if (o.steady) L = Math.min(1, L * 1.25);
      }
      var gr = (4 + 10 * att) * sy, gl = Math.max(0, 1 - dist / gr);
      L = Math.max(L, gl);
      return { L: L, dist: dist, gl: gl };
    }

    var skyTop = C['sky-deep'], skyBot = C.sky;
    if (phase === 'dawn') { skyTop = mixRGB(C.sky, C['sky-deep'], 0.4); skyBot = mixRGB(C.sky, C.lamp, 0.5); }
    if (phase === 'storm') { skyTop = mixRGB(C['sky-deep'], C.outline, 0.5); skyBot = C['sky-deep']; }
    var seaTop = phase === 'dawn' ? mixRGB(C.sea, C.lamp, 0.18) : C.sea;
    var sunX = W * 0.72, sunR = 10 * sy;

    var img = ctx.createImageData(W, H), d = img.data;
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var b = bay(x, y), c;
        if (y < horizon) {
          var t = y / horizon;
          c = t > b ? skyBot : skyTop;
          if (t * 2 - 1 > b && phase === 'dawn') c = mixRGB(skyBot, C.beam, 0.25);
          if (phase !== 'storm' && hash(x, y, 3) > (phase === 'calm' || phase === 'dawn' ? 0.982 : 0.99) && y < horizon - 5) c = C.star;
          if (phase === 'dawn') { var sd = Math.hypot(x - sunX, (y - horizon) * 1.1); if (sd < sunR) c = sd < sunR - 2 ? C.beam : C['beam-core']; }
        } else {
          var row = y - horizon, ts = row / (H - horizon);
          c = ts > b ? C['sea-deep'] : seaTop;
          if (row % 5 === 2 && ((x + row * 3) % 7) < 3 && hash(Math.floor((x + row * 3) / 7), row, 11) > 0.62) c = row < 10 ? C.crest : C['sea-light'];
          if (phase === 'dawn' && Math.abs(x - sunX) < sunR * (1 - row / (H - horizon)) && row % 3 !== 0 && hash(x >> 1, row, 6) > 0.4) c = C.beam;
        }
        var Lr = lit(x, y), L = Lr.L;
        // fog
        var n = fbm(x / sy, y / sy, o.seed);
        var depth = y < horizon ? 0.12 : 0.12 * (1 - (y - horizon) / (H - horizon));
        var fogA = clamp(dens * (n * 1.5 - 0.3) + depth * dens, 0, 1);
        var fv = clamp(fogA * (1 - 1.35 * L), 0, 1) * (o.flare ? 0.35 : 1);
        if (o.fog === 'bands') {
          var bandF = function (yy) {
            var nb = vnoise(x / sy * 0.3, yy / sy, 5, o.seed + 1) * 0.6 + vnoise(x / sy * 0.15, yy / sy, 12, o.seed + 2) * 0.4;
            return clamp(dens * (nb * 1.6 - 0.35) + depth * dens, 0, 1) * clamp(1 - 1.35 * lit(x, yy).L, 0, 1) * (o.flare ? 0.35 : 1);
          };
          var fb = bandF(y), fbUp = bandF(y - 1);
          if (fb > 0.55) c = C['fog-thick']; else if (fb > 0.28) c = C.fog;
          if (fb > 0.28 && fbUp <= 0.28) c = C['fog-thick'];
        } else if (o.fog === 'clouds') {
          var n2 = vnoise(x / sy, y * 1.6 / sy, 7, o.seed + 3) * 0.5 + n * 0.5;
          var m = fv * (0.55 + n2);
          var above = fogA * (1 - 1.35 * lit(x, y - 1).L) * (0.55 + vnoise(x / sy, (y - 1) * 1.6 / sy, 7, o.seed + 3) * 0.5 + fbm(x / sy, (y - 1) / sy, o.seed) * 0.5);
          if (m > 0.62) c = C['fog-thick']; else if (m > 0.4) c = C.fog;
          if (m > 0.4 && above <= 0.4) c = C['fog-thick'];
        } else {
          var lv = fv * 2;
          if (lv > b) c = C.fog;
          if (lv - 1 > b) c = C['fog-thick'];
        }
        // beam light
        if (o.flare) c = mixRGB(c, C.beam, 0.32);
        if (L > 0.02) {
          if (Lr.gl > 0.55) c = C['beam-core'];
          else {
            if (L * 1.1 > b) c = mixRGB(c, C.beam, 0.38);
            if (L * 1.1 - 0.55 > b * 0.6) c = mixRGB(c, C.beam, 0.7);
            if (o.steady && L > 0.82 && b < 0.2) c = C['beam-core'];
          }
        }
        // storm rain
        if (phase === 'storm' && ((x + y * 2) % 11 === 0) && hash(Math.floor((x + y * 2) / 11), Math.floor(y / 5), 13) > 0.55) c = mixRGB(c, C.crest, 0.6);
        var k = (y * W + x) * 4; d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // island, lighthouse, dock
    var dock = island(ctx, p, bx, by);
    lighthouse(ctx, p, bx, by, o.lighthouse, o.flare ? 1 : att, o.frost);

    // hidden rocks: only a steady beam (or flare) reveals them
    ROCKS.forEach(function (r) {
      var rx = Math.round(r.x * W), ry = Math.round(r.y * H), Lv = lit(rx + 4, ry + 2).L;
      if (o.flare || (o.steady && Lv > 0.25)) {
        for (var f = -2; f < 10; f++) if ((f & 1) === 0) px(ctx, p.crest, rx + f, ry + 4);
        drawSprite(ctx, SPRITES.rock, rx, ry, p);
      }
    });

    // boats
    var list = BOATS[phase === 'lighting' || phase === 'calm' ? 'none' : phase] || BOATS.tide;
    var first = null;
    list.forEach(function (bt, i) {
      var spr = SPRITES[bt.t], sz = spriteSize(spr), x = Math.round(bt.x * W - sz.w / 2), y = Math.round(bt.y * H - sz.h);
      if (bt.docked) { x = dock.x - 30 + i * 13; y = dock.y - sz.h + 3; }
      var Lv = lit(x + sz.w / 2, y + sz.h / 2).L, inLight = Lv > 0.22 || o.flare || phase === 'dawn' || bt.docked;
      drawSprite(ctx, spr, x, y, p, inLight ? { flip: bt.x > 0.5 && !bt.docked } : { dim: 0.6, dimTo: 'fog', flip: bt.x > 0.5 });
      if (!inLight) { px(ctx, p.lamp, x + Math.floor(sz.w / 2), y - 2, 1, 1); px(ctx, mix(p.lamp, p.fog, 0.5), x + Math.floor(sz.w / 2), y - 1, 1, 1); }
      for (var f = 0; f < sz.w; f += 3) px(ctx, p.crest, x + f, y + sz.h);
      if (inLight && !first && !bt.docked && bt.t !== 'storm') first = { x: x + sz.w / 2, y: y + sz.h - 1 };
      if (bt.t === 'storm') first = { x: x, y: y + sz.h - 1, storm: true };
    });

    // Pilot's route (dashed)
    if (o.route && first) {
      var pts = [[first.x, first.y], [(first.x + dock.x) / 2 + 6, Math.max(first.y, dock.y) + 8], [dock.x + 3, dock.y + 1]];
      var step = 0;
      for (var s = 0; s < pts.length - 1; s++) {
        var A = pts[s], B = pts[s + 1], n2 = Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1]));
        for (var u = 0; u < n2; u++, step++) {
          if (step % 5 < 3) px(ctx, p.route, Math.round(A[0] + (B[0] - A[0]) * u / n2), Math.round(A[1] + (B[1] - A[1]) * u / n2));
        }
      }
      px(ctx, p.route, dock.x + 2, dock.y - 1, 3, 3); px(ctx, p.outline, dock.x + 3, dock.y, 1, 1);
    }

    // steady glints
    if (o.steady && !o.flare) {
      [0.35, 0.55, 0.75].forEach(function (f, i) {
        var gx = Math.round(lampX + Math.cos(a0 + (i - 1) * half * 0.5) * len * f), gy = Math.round(lampY + Math.sin(a0 + (i - 1) * half * 0.5) * len * f);
        px(ctx, p['beam-core'], gx, gy - 1); px(ctx, p['beam-core'], gx - 1, gy, 3, 1); px(ctx, p['beam-core'], gx, gy + 1);
      });
    }
    if (phase === 'dawn') { drawSprite(ctx, SPRITES.gull, Math.round(W * 0.48), Math.round(H * 0.16), p); drawSprite(ctx, SPRITES.gull, Math.round(W * 0.56), Math.round(H * 0.22), p); }
    return { lamp: { x: lampX, y: lampY }, dock: dock };
  }

  /* draw a canvas at an integer scale that fits a box width */
  function fit(canvas, maxW) {
    var s = Math.max(1, Math.floor(maxW / canvas.width));
    canvas.style.width = canvas.width * s + 'px';
    canvas.style.height = canvas.height * s + 'px';
    return s;
  }

  /* a canvas holding one sprite (or a custom draw fn) at an integer scale */
  function spriteCanvas(w, h, scale, drawFn, bgKey) {
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h; cv.className = 'lk-pixel-canvas';
    cv.style.width = w * scale + 'px'; cv.style.height = h * scale + 'px';
    var ctx = cv.getContext('2d'), p = pal();
    if (bgKey) { ctx.fillStyle = p[bgKey]; ctx.fillRect(0, 0, w, h); }
    drawFn(ctx, p);
    return cv;
  }

  window.LK = {
    spriteCanvas: spriteCanvas,
    THEMES: THEMES, KEYS: KEYS, pal: pal, ready: ready, onTheme: onTheme, currentTheme: currentTheme,
    mix: mix, parse: parse, hex: hex, drawSprite: drawSprite, spriteSize: spriteSize, SPRITES: SPRITES, HATS: HATS,
    avatar: avatar, lighthouse: lighthouse, island: island, harbour: harbour, fit: fit, px: px
  };
})();
