// صورت فلکی قلب، شمارنده‌ی روز مهم بعدی، ثبت PWA
import { NEXT_DAY, HEART } from '../data/more.js';
const $ = s => document.querySelector(s);
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '#cAudio{width:100%;margin-top:.8rem}#countdown{position:absolute;top:calc(var(--sat) + 2.7rem);inset-inline:0;text-align:center;font-size:.8rem;color:var(--rose);pointer-events:none}' }));
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

const cd = Object.assign(document.createElement('div'), { id: 'countdown' }); $('#hud').append(cd);
const upd = () => { if (!NEXT_DAY) return; const ms = new Date(NEXT_DAY.date) - Date.now();
  cd.textContent = ms > 0 ? `${NEXT_DAY.title}: ${Math.ceil(ms / 864e5).toLocaleString('fa-IR')} روز مونده` : ms > -864e5 ? `🎉 امروز ${NEXT_DAY.title}!` : ''; };
upd(); setInterval(upd, 6e4);

const O = window.__ou;
if (O && HEART) {                                                   // صورت فلکی: ستاره‌ها + خط‌های صورتی، ملایم می‌تپه
  const { THREE, scene, glow, sprite } = O, size = HEART.size || 4, yaw = HEART.yaw ?? 1.35, pit = HEART.pitch ?? .3;
  const pts = HEART.points || Array.from({ length: 28 }, (_, i) => { const t = i / 28 * Math.PI * 2;
    return [16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)]; });
  const d = new THREE.Vector3(-Math.sin(yaw) * Math.cos(pit), Math.sin(pit), -Math.cos(yaw) * Math.cos(pit));
  const right = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(right, d);
  const P = pts.map(([x, y]) => d.clone().multiplyScalar(260).addScaledVector(right, x * size).addScaledVector(up, y * size));
  const grp = new THREE.Group(), tex = glow('#e8b4c8');
  P.forEach(p => { const s = sprite(tex, 16); s.position.copy(p); grp.add(s); });
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(HEART.closed === false ? P : [...P, P[0]]),
    new THREE.LineBasicMaterial({ color: 0xe8b4c8, transparent: true, opacity: .35, blending: THREE.AdditiveBlending }));
  grp.add(line); scene.add(grp);
  const loop = t => { grp.children.forEach((c, i) => c.isSprite && c.scale.setScalar(14 + 3 * Math.sin(t / 700 + i))); line.material.opacity = .3 + .15 * Math.sin(t / 1200); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}

/* ---- متن‌های سینمایی موقع ورود + اسمشن: تکون دادن گوشی = بارش شهاب ---- */
import { INTRO } from '../data/extra.js';
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '#intro{position:fixed;inset:0;z-index:5;display:grid;place-content:center;text-align:center;padding:2rem;font-size:1.3rem;font-weight:300;color:var(--gold);text-shadow:0 0 20px #000;opacity:0;transition:opacity 1s;pointer-events:none}#intro.on{opacity:1}' }));
const ov = Object.assign(document.createElement('div'), { id: 'intro' }), gate = $('#gate'); document.body.append(ov);
new MutationObserver((_, o) => {
  if (!gate.classList.contains('out')) return; o.disconnect();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  INTRO.forEach((t, i) => setTimeout(() => { ov.textContent = t; ov.classList.add('on'); setTimeout(() => ov.classList.remove('on'), 1900); }, 900 + i * 2300));
}).observe(gate, { attributes: true, attributeFilter: ['class'] });
let lastShake = 0;
addEventListener('devicemotion', e => {
  const a = e.accelerationIncludingGravity; if (!a || !O?.shoot) return;
  if (Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0) > 40 && Date.now() - lastShake > 4000) {
    lastShake = Date.now(); for (let i = 0; i < 5; i++) setTimeout(O.shoot, i * 200);
    const t = $('#toast'); t.textContent = 'یه آرزو کن ✦'; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2600);
  }
});

/* ---- راهنمای اول + پایان: وقتی همه‌ی خاطره‌ها دیده شدن ---- */
import { MEMORIES } from '../data/memories.js';
import { FINALE } from '../data/extra.js';
document.head.append(Object.assign(document.createElement('style'), { textContent:
  '#cText,#cReply,#finale p{white-space:pre-line}#cReply{margin:1rem 0 0;padding-top:1rem;border-top:1px solid #e8b4c833;color:var(--lilac);font-weight:300;line-height:2}'
  + '#hint{position:fixed;inset-inline:0;bottom:4.6rem;text-align:center;color:var(--gold);opacity:0;transition:opacity 1s;pointer-events:none;z-index:4}#hint.on{opacity:1}'
  + '#finale{position:fixed;z-index:25;inset-inline:.75rem;bottom:calc(var(--sab) + .75rem);max-width:30rem;margin-inline:auto;padding:1.4rem;border-radius:1.4rem;background:linear-gradient(160deg,#1c2058f2,#0b1030f8);border:1px solid #e8b4c855;line-height:2.1;animation:rise .8s}'
  + '#finale button{position:absolute;top:.4rem;inset-inline-start:.7rem;background:none;border:0;font-size:1.8rem;color:inherit}' }));
const LS = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const hint = Object.assign(document.createElement('div'), { id: 'hint' }); document.body.append(hint);
const say = (t, ms) => { hint.textContent = t; hint.classList.add('on'); setTimeout(() => hint.classList.remove('on'), ms); };
new MutationObserver((_, o) => {
  if (!gate.classList.contains('out')) return; o.disconnect();
  if (!LS.get('ou-seen')) { setTimeout(() => say('آسمون رو با انگشت بچرخون ✦', 3500), 6800); setTimeout(() => !LS.get('ou-seen') && say('یه ستاره‌ی صورتی رو لمس کن', 6000), 10800); }
  if (location.hash === '#finale') setTimeout(() => finale(), 7000);   // برای تست پایان
}).observe(gate, { attributes: true, attributeFilter: ['class'] });
function finale() {
  const { THREE, glow } = O; for (let i = 0; i < 40; i++) setTimeout(O.shoot, i * 220);
  const c = document.createElement('canvas'); c.width = 640; c.height = 180; const g = c.getContext('2d');
  g.font = 'bold 120px Vazirmatn,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(FINALE.names, 320, 95);   // اسم‌ها → نقطه‌ها
  const px = g.getImageData(0, 0, 640, 180).data, A = [], yaw = -.9, pit = .25;
  const d = new THREE.Vector3(-Math.sin(yaw) * Math.cos(pit), Math.sin(pit), -Math.cos(yaw) * Math.cos(pit));
  const r = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize(), u = new THREE.Vector3().crossVectors(r, d);
  for (let y = 0; y < 180; y += 5) for (let x = 0; x < 640; x += 5) if (px[(y * 640 + x) * 4 + 3] > 128)
    A.push(...d.clone().multiplyScalar(250).addScaledVector(r, (x - 320) * .5).addScaledVector(u, (90 - y) * .5).toArray());
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(A), 3));
  const mat = new THREE.PointsMaterial({ map: glow('#e9d3a2'), size: 4, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  O.scene.add(new THREE.Points(geo, mat)); O.flyTo(d, 58, 3.5);
  let a = 0; const iv = setInterval(() => { a = Math.min(1, a + .02); mat.opacity = a; if (a === 1) clearInterval(iv); }, 50);
  setTimeout(() => { const f = Object.assign(document.createElement('article'), { id: 'finale' }); f.innerHTML = '<button aria-label="بستن">×</button><p></p>';
    f.querySelector('p').textContent = FINALE.text; f.querySelector('button').onclick = () => f.remove(); document.body.append(f); }, 9000);
}
if (O) {
  const seen = new Set(JSON.parse(LS.get('ou-opened') || '[]'));
  O.onOpen = id => { seen.add(id); LS.set('ou-opened', JSON.stringify([...seen])); LS.set('ou-seen', '1'); hint.classList.remove('on'); };
  O.onClose = () => { if (!LS.get('ou-finale') && MEMORIES.every(m => seen.has(m.id))) { LS.set('ou-finale', '1'); setTimeout(finale, 900); } };
}
