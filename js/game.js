// بازی دکور «خونه‌ی ما» با گربه: اسباب بچین، بکش، گربه رو نوازش کن. همه‌چیز با canvas کشیده میشه.
const W = 720, H = 560, FLOOR = 372, KEY = 'ou-room';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const THEMES = [
  { n: 'آبی شب', wall: ['#151a4a', '#262c6b'], floor: ['#2f2a5c', '#1b1a45'] },
  { n: 'یاسی', wall: ['#3a2f6b', '#5a4a8f'], floor: ['#4a3a78', '#2b2250'] },
  { n: 'صورتی', wall: ['#5a2f56', '#8a4a7c'], floor: ['#6a3c5e', '#3a2040'] },
];
const CATS = [{ n: 'نارنجی', c: '#e8a35c', d: '#c77f3a' }, { n: 'خاکستری', c: '#a9a6b8', d: '#7f7c93' }, { n: 'شیری', c: '#f1e2c8', d: '#d2bd98' }];
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); };
const ell = (g, x, y, rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };

/* کاتالوگ اسباب؛ هر کدوم از نقطه‌ی پایین‌وسط کشیده میشه (0,0) */
const ITEMS = {
  rug: { n: 'فرش', w: 220, h: 50, back: 1, draw: g => { ell(g, 0, -24, 110, 26, '#b9a6e8'); ell(g, 0, -24, 84, 18, '#e8b4c8'); ell(g, 0, -24, 52, 10, '#b9a6e8'); } },
  sofa: { n: 'کاناپه', w: 196, h: 90, draw: g => { g.fillStyle = '#c78aa5'; rr(g, -85, -86, 170, 58, 18); g.fill(); g.fillStyle = '#d79bb5'; rr(g, -98, -62, 28, 56, 10); g.fill(); rr(g, 70, -62, 28, 56, 10); g.fill();
    g.fillStyle = '#e8b4c8'; rr(g, -75, -48, 150, 38, 12); g.fill(); g.fillStyle = '#b9a6e8'; rr(g, -60, -70, 36, 30, 9); g.fill(); g.fillStyle = '#e9d3a2'; rr(g, 22, -70, 36, 30, 9); g.fill(); } },
  shelf: { n: 'کتابخونه', w: 112, h: 152, draw: g => { g.fillStyle = '#6b4f7a'; rr(g, -56, -152, 112, 152, 6); g.fill();
    [[-144, 40], [-98, 40], [-52, 44]].forEach(([y, h], r) => { g.fillStyle = '#2a1f3d'; g.fillRect(-48, y, 96, h);
      ['#e8b4c8', '#e9d3a2', '#b9a6e8', '#8fc9a8', '#e8b4c8', '#e9d3a2'].forEach((c, i) => { g.fillStyle = c; const bh = h - 8 - (i * 7 + r * 3) % 10; g.fillRect(-44 + i * 15, y + h - bh, 11, bh); }); }); } },
  table: { n: 'میز', w: 124, h: 86, draw: g => { g.fillStyle = '#e9d3a2'; rr(g, -62, -66, 124, 14, 6); g.fill(); g.fillStyle = '#c9b27c'; g.fillRect(-52, -52, 8, 52); g.fillRect(44, -52, 8, 52);
    g.fillStyle = '#fff'; rr(g, -8, -84, 16, 18, 3); g.fill(); g.fillStyle = '#e8b4c8'; g.fillRect(-8, -80, 16, 5); } },
  plant: { n: 'گلدون', w: 60, h: 110, draw: (g, t) => { g.fillStyle = '#e8b4c8'; g.beginPath(); g.moveTo(-20, -44); g.lineTo(20, -44); g.lineTo(14, 0); g.lineTo(-14, 0); g.fill();
    [-1, 0, 1].forEach(i => { g.save(); g.translate(0, -44); g.rotate(i * .5 + Math.sin(t * 1.2 + i) * .04); ell(g, 0, -30, 10, 32, '#8fc9a8'); g.restore(); }); } },
  lamp: { n: 'آباژور', w: 70, h: 130, draw: g => { g.fillStyle = '#e9d3a2'; g.fillRect(-3, -100, 6, 100); ell(g, 0, -4, 18, 5, '#e9d3a2');
    g.beginPath(); g.moveTo(-22, -92); g.lineTo(22, -92); g.lineTo(14, -126); g.lineTo(-14, -126); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; const r = g.createRadialGradient(0, -100, 4, 0, -100, 130);
    r.addColorStop(0, 'rgba(233,211,162,.45)'); r.addColorStop(1, 'rgba(233,211,162,0)'); g.fillStyle = r; g.fillRect(-140, -240, 280, 280); g.restore(); } },
  catbed: { n: 'تخت گربه', w: 110, h: 46, draw: g => { ell(g, 0, -16, 54, 20, '#e8b4c8'); ell(g, 0, -20, 42, 12, '#b9a6e8'); } },
  frame: { n: 'قاب عکس', w: 76, h: 88, wall: 1, draw: g => { g.fillStyle = '#e9d3a2'; rr(g, -38, -88, 76, 88, 5); g.fill(); g.fillStyle = '#1c2058'; rr(g, -31, -81, 62, 74, 3); g.fill();
    g.fillStyle = '#e8b4c8'; g.beginPath(); g.moveTo(0, -30); g.bezierCurveTo(-34, -58, -12, -72, 0, -54); g.bezierCurveTo(12, -72, 34, -58, 0, -30); g.fill(); } },
};
const DEFAULT = { items: [{ k: 'rug', x: 360, y: 530 }, { k: 'sofa', x: 190, y: 470 }, { k: 'lamp', x: 70, y: 455 }, { k: 'plant', x: 650, y: 470 }, { k: 'catbed', x: 520, y: 500 }, { k: 'frame', x: 150, y: 220 }], theme: 0, cat: 0 };

function drawCat(g, c, t, col) {
  const walk = c.mode === 'walk', sleep = c.mode === 'sleep', b = Math.sin(t * 2) * 1.2;
  g.save(); g.translate(c.x, c.y); g.scale(c.dir, 1);
  ell(g, 0, 0, 30, 6, 'rgba(0,0,0,.25)');
  g.strokeStyle = col.c; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(-26, -24);
  g.quadraticCurveTo(-52, -30 - Math.sin(t * 3) * 10, -44, -62 + Math.sin(t * 3) * 6); g.stroke();
  g.fillStyle = col.d; [[-18, 0], [-6, Math.PI], [12, Math.PI], [24, 0]].forEach(([x, p]) => { const l = walk ? Math.sin(t * 10 + p) * 5 : 0; rr(g, x - 4 + l, -14, 9, 14, 4); g.fill(); });
  ell(g, 0, -26 + b * .4, 32, 20 + b * .5, col.c);
  g.strokeStyle = col.d; g.lineWidth = 4; [-14, -3, 8].forEach(x => { g.beginPath(); g.moveTo(x, -45); g.lineTo(x + 3, -36); g.stroke(); });
  ell(g, 30, -46 + b * .4, 17, 15, col.c); g.fillStyle = col.c;
  g.beginPath(); g.moveTo(18, -56); g.lineTo(21, -76); g.lineTo(33, -61); g.fill(); g.beginPath(); g.moveTo(47, -56); g.lineTo(44, -76); g.lineTo(34, -61); g.fill();
  const blink = sleep || (t % 4) < .12; g.strokeStyle = '#1c1a2e'; g.lineWidth = 2;
  [24, 38].forEach(x => { if (blink) { g.beginPath(); g.arc(x, -48, 3, .1, Math.PI - .1); g.stroke(); } else { ell(g, x, -48, 2.4, 3.4, '#1c1a2e'); ell(g, x + .8, -49.2, .8, .8, '#fff'); } });
  ell(g, 44, -43, 2.5, 2, '#e8909c'); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1;
  [[-46, -4], [-38, 4]].forEach(([a, d]) => { g.beginPath(); g.moveTo(40, a + 4); g.lineTo(58, a + d); g.stroke(); });
  g.restore();
  g.textAlign = 'center';
  if (sleep) { g.font = 'bold 18px sans-serif'; g.fillStyle = '#f4f1ff'; g.globalAlpha = .8; g.fillText('z Z', c.x + 34, c.y - 78 - (t * 12) % 14); g.globalAlpha = 1; }
  if (c.say > 0) { g.font = 'bold 20px Vazirmatn,sans-serif'; g.fillStyle = '#fff'; g.fillText('میو~', c.x, c.y - 94); }
}

export function renderGame(b) {
  let S; try { S = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (!S || !Array.isArray(S.items)) S = structuredClone(DEFAULT);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
  const cv = document.createElement('canvas'), dpr = Math.min(devicePixelRatio || 1, 2), g = cv.getContext('2d');
  cv.width = W * dpr; cv.height = H * dpr; g.scale(dpr, dpr);
  Object.assign(cv.style, { touchAction: 'none', maxWidth: '40rem', borderRadius: '1rem', border: '1px solid #e8b4c855' });
  cv.setAttribute('aria-label', 'خونه‌ی ما: اسباب رو بکش و جابه‌جا کن');
  const cat = { x: 360, y: 500, dir: 1, mode: 'idle', wait: 2, tx: 0, ty: 0, say: 0 }, hearts = [];
  let drag = null, t = 0;

  const el = (tag, p = {}) => Object.assign(document.createElement(tag), p);
  const clampItem = it => { const d = ITEMS[it.k]; it.x = Math.min(W - d.w / 2, Math.max(d.w / 2, it.x));
    it.y = d.wall ? Math.min(330, Math.max(d.h + 20, it.y)) : Math.min(H - 8, Math.max(FLOOR + 14, it.y)); };
  const order = () => [...S.items].sort((a, b) => (ITEMS[a.k].back ? -9999 : a.y) - (ITEMS[b.k].back ? -9999 : b.y));

  const row = el('div', { className: 'xrow' });
  for (const k in ITEMS) row.append(el('button', { textContent: '+ ' + ITEMS[k].n, onclick: () => {
    const it = { k, x: 120 + Math.random() * 480, y: ITEMS[k].wall ? 200 : 440 + Math.random() * 90 }; clampItem(it); S.items.push(it); save(); } }));
  const bTheme = el('button', { onclick: () => { S.theme = (S.theme + 1) % THEMES.length; save(); lab(); } });
  const bCat = el('button', { onclick: () => { S.cat = (S.cat + 1) % CATS.length; save(); lab(); } });
  const bClear = el('button', { textContent: 'خالی کردن خونه', onclick: () => { if (confirm('همه‌ی اسباب برداشته بشه؟')) { S.items = []; save(); } } });
  const lab = () => { bTheme.textContent = 'رنگ دیوار: ' + THEMES[S.theme].n; bCat.textContent = 'رنگ گربه: ' + CATS[S.cat].n; }; lab();
  row.append(bTheme, bCat, bClear);
  b.append(row, cv, el('small', { textContent: 'اسباب رو بکش و جابه‌جا کن؛ برای برداشتن، بندازش روی سطل. گربه رو لمس کن 🐈' }));

  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  cv.onpointerdown = e => {
    const [x, y] = pt(e); cv.setPointerCapture(e.pointerId);
    if (Math.abs(x - cat.x) < 48 && y > cat.y - 85 && y < cat.y + 10) {                // نوازش گربه
      cat.say = 1.4; if (cat.mode === 'sleep') cat.mode = 'idle';
      for (let i = 0; i < 5; i++) hearts.push({ x: cat.x + (Math.random() - .5) * 50, y: cat.y - 70, t: -i * .12 }); return; }
    const hit = order().reverse().find(it => { const d = ITEMS[it.k]; return Math.abs(x - it.x) < d.w / 2 && y < it.y + 6 && y > it.y - d.h; });
    if (hit) { S.items.splice(S.items.indexOf(hit), 1); S.items.push(hit); drag = { it: hit, dx: hit.x - x, dy: hit.y - y, over: false }; }
  };
  cv.onpointermove = e => { if (!drag) return; const [x, y] = pt(e); drag.it.x = x + drag.dx; drag.it.y = y + drag.dy; clampItem(drag.it); drag.over = x > W - 80 && y > H - 80; };
  cv.onpointerup = () => { if (!drag) return; if (drag.over) S.items.splice(S.items.indexOf(drag.it), 1); drag = null; save(); };

  function step(dt) {
    cat.say = Math.max(0, cat.say - dt); cat.wait -= dt;
    if (cat.mode === 'walk') { const dx = cat.tx - cat.x, dy = cat.ty - cat.y, d = Math.hypot(dx, dy);
      if (d < 4) { cat.mode = cat.sleepAfter ? 'sleep' : 'idle'; cat.wait = cat.sleepAfter ? 9 : 2 + Math.random() * 3; }
      else { cat.x += dx / d * 70 * dt; cat.y += dy / d * 70 * dt; if (Math.abs(dx) > 3) cat.dir = dx > 0 ? 1 : -1; } }
    else if (cat.wait <= 0 && !reduce) { const bed = S.items.find(i => i.k === 'catbed');
      cat.mode = 'walk'; cat.sleepAfter = !!bed && Math.random() < .5;
      cat.tx = cat.sleepAfter ? bed.x : 60 + Math.random() * (W - 120); cat.ty = cat.sleepAfter ? bed.y - 6 : FLOOR + 20 + Math.random() * (H - FLOOR - 40); }
    hearts.forEach(h => { h.t += dt; h.y -= 34 * dt; }); for (let i = hearts.length; i--;) if (hearts[i].t > 1.2) hearts.splice(i, 1);
  }

  function draw() {
    const th = THEMES[S.theme], col = CATS[S.cat];
    let gr = g.createLinearGradient(0, 0, 0, FLOOR); gr.addColorStop(0, th.wall[0]); gr.addColorStop(1, th.wall[1]); g.fillStyle = gr; g.fillRect(0, 0, W, FLOOR);
    gr = g.createLinearGradient(0, FLOOR, 0, H); gr.addColorStop(0, th.floor[0]); gr.addColorStop(1, th.floor[1]); g.fillStyle = gr; g.fillRect(0, FLOOR, W, H - FLOOR);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, FLOOR - 6, W, 8);
    g.fillStyle = '#e9d3a2'; rr(g, 288, 48, 154, 144, 6); g.fill();                    // پنجره‌ی شب
    gr = g.createLinearGradient(0, 56, 0, 184); gr.addColorStop(0, '#0b1030'); gr.addColorStop(1, '#1a1f4d'); g.fillStyle = gr; g.fillRect(296, 56, 138, 128);
    for (let i = 0; i < 16; i++) { g.globalAlpha = .35 + .65 * Math.abs(Math.sin(t * 1.3 + i)); g.fillStyle = '#f4f1ff'; g.fillRect(300 + (i * 53) % 128, 60 + (i * 37) % 70, 2, 2); }
    g.globalAlpha = 1; ell(g, 400, 92, 16, 16, '#f4f1ff'); ell(g, 407, 87, 14, 14, '#10153f');
    g.fillStyle = '#e9d3a2'; g.fillRect(363, 56, 4, 128); g.fillRect(296, 118, 138, 4);
    const list = order().map(it => ({ y: ITEMS[it.k].back ? -9999 : it.y, f: () => ITEMS[it.k].draw(g, t), it }));
    list.push({ y: cat.y + (cat.mode === 'sleep' ? -8 : 0), cat: 1 }); list.sort((a, b) => a.y - b.y);
    for (const o of list) { if (o.cat) { drawCat(g, cat, t, col); continue; }
      g.save(); g.translate(o.it.x, o.it.y); o.f(); g.restore();
      if (drag && drag.it === o.it) { const d = ITEMS[o.it.k]; g.strokeStyle = '#e9d3a2'; g.setLineDash([6, 5]); g.lineWidth = 2; g.strokeRect(o.it.x - d.w / 2, o.it.y - d.h, d.w, d.h + 6); g.setLineDash([]); } }
    g.textAlign = 'center'; g.font = '24px sans-serif';
    for (const h of hearts) if (h.t > 0) { g.globalAlpha = 1 - h.t / 1.2; g.fillStyle = '#e8b4c8'; g.fillText('♥', h.x, h.y); } g.globalAlpha = 1;
    if (drag) { g.fillStyle = drag.over ? '#e8b4c8cc' : '#ffffff22'; rr(g, W - 76, H - 76, 64, 64, 14); g.fill(); g.fillStyle = '#fff'; g.font = '30px sans-serif'; g.fillText('🗑', W - 44, H - 34); }
  }
  let last = performance.now();
  const loop = now => { if (!cv.isConnected) return; const dt = Math.min((now - last) / 1000, .05); last = now; if (!reduce) t += dt; step(dt); draw(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
