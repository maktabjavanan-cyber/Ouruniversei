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
