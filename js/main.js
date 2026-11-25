import * as THREE from 'three';
import { CONFIG, MEMORIES } from '../data/memories.js';
import { SONG, VOICES, FUTURE } from '../data/more.js';
const ALL = FUTURE ? [...MEMORIES, FUTURE] : MEMORIES;

const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < 700;
const PALETTE = ['#f4f1ff', '#e8b4c8', '#b9a6e8', '#e9d3a2'].map(c => new THREE.Color(c));
const BAND = new THREE.Vector3(.3, .9, -.2).normalize(); // Milky Way plane (same in nebula shader)

/* ---------- renderer / camera ---------- */
const renderer = new THREE.WebGLRenderer({ canvas: $('#sky'), antialias: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, 1, .1, 3000);
camera.rotation.order = 'YXZ';
const view = { yaw: 0, pitch: 0, fov: 70, vy: 0, vp: 0 };
const uTime = { value: 0 };

/* ---------- nebula + milky way (fbm in GLSL on an inverted sphere) ---------- */
scene.add(new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { uTime, uBand: { value: BAND } },
  vertexShader: `varying vec3 vD; void main(){ vD=(modelMatrix*vec4(position,1.)).xyz-cameraPosition;
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
  fragmentShader: `varying vec3 vD; uniform float uTime; uniform vec3 uBand;
    float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
      return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+7.1;a*=.5;}return s;}
    void main(){ vec3 d=normalize(vD); float t=uTime*.006;
      float c=fbm(d*2.2+vec3(t,0.,-t)), c2=fbm(d*4.6-vec3(0.,t,0.)+3.);
      vec3 col=mix(vec3(.035,.045,.14),vec3(.5,.26,.5),smoothstep(.45,.85,c))*(.35+.65*c2);
      col+=vec3(.9,.72,.5)*pow(max(c2-.62,0.),2.)*.7;
      float b=exp(-pow(dot(d,uBand)*4.,2.)); col+=vec3(.75,.7,.95)*b*(.1+.25*c2);
      gl_FragColor=vec4(col*.75,1.);}`
})));

/* ---------- starfield: custom point shader, twinkling per star ---------- */
const N = mobile ? 16000 : 40000;
const P = new Float32Array(N * 3), C = new Float32Array(N * 3), S = new Float32Array(N), PH = new Float32Array(N);
const v = new THREE.Vector3();
for (let i = 0; i < N; i++) {
  v.randomDirection();
  if (i < N * .45) v.addScaledVector(BAND, -v.dot(BAND) * .88).normalize(); // squash into the Milky Way band
  v.multiplyScalar(500 + Math.random() * 700).toArray(P, i * 3);
  const c = PALETTE[Math.random() < .6 ? 0 : 1 + (Math.random() * 3 | 0)];
  c.toArray(C, i * 3);
  S[i] = Math.random() ** 4 * 5 + 1.2; PH[i] = Math.random();
}
const sg = new THREE.BufferGeometry();
sg.setAttribute('position', new THREE.BufferAttribute(P, 3));
sg.setAttribute('aColor', new THREE.BufferAttribute(C, 3));
sg.setAttribute('aSize', new THREE.BufferAttribute(S, 1));
sg.setAttribute('aPhase', new THREE.BufferAttribute(PH, 1));
scene.add(new THREE.Points(sg, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime, uPR: { value: renderer.getPixelRatio() } },
  vertexShader: `attribute vec3 aColor; attribute float aSize,aPhase; uniform float uTime,uPR; varying vec3 vC; varying float vT;
    void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv;
      vT=.7+.3*sin(uTime*1.4+aPhase*6.283); vC=aColor; gl_PointSize=aSize*uPR*vT*(520./-mv.z)*.9;}`,
  fragmentShader: `varying vec3 vC; varying float vT; void main(){ float d=length(gl_PointCoord-.5);
    float a=smoothstep(.5,0.,d); gl_FragColor=vec4(vC*1.2,a*a*vT);}`
})));

/* ---------- glow sprite texture ---------- */
function glow(color) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, '#fff'); r.addColorStop(.12, color); r.addColorStop(.35, color + '55'); r.addColorStop(1, color + '00');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
const sprite = (tex, size) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(size); return s; };

/* ---------- moon ---------- */
const moon = new THREE.Mesh(new THREE.SphereGeometry(26, 32, 16), new THREE.MeshBasicMaterial({ color: 0xf4f1ff }));
moon.position.set(-260, 170, -520); scene.add(moon);
const halo = sprite(glow('#b9a6e8'), 230); halo.position.copy(moon.position); scene.add(halo);

/* ---------- memory stars + pink constellation line ---------- */
const stars = ALL.map((m, i) => {
  const a = (i - (ALL.length - 1) / 2) * .5, e = Math.sin(i * 1.7) * .18 + .12;
  const locked = m.unlock && Date.now() < new Date(m.unlock);
  const s = sprite(glow(locked ? '#6d6a8f' : i % 2 ? '#e8b4c8' : '#e9d3a2'), locked ? 28 : 40);
  s.position.set(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)).multiplyScalar(190);
  s.userData = { m, base: locked ? 28 : 40, ph: i * 2 }; scene.add(s); return s;
});
let line;
if (stars.length > 1) {
  const pts = new THREE.CatmullRomCurve3(stars.map(s => s.position)).getPoints(120);
  line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0xe8b4c8, transparent: true, opacity: .55, blending: THREE.AdditiveBlending }));
  line.geometry.setDrawRange(0, 0); scene.add(line);
}

/* ---------- shooting stars ---------- */
const meteors = Array.from({ length: 4 }, () => {
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineBasicMaterial({ color: 0xf4f1ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
  l.userData = { life: 0, vel: new THREE.Vector3() }; l.frustumCulled = false; scene.add(l); return l;
});
function shoot() {
  const m = meteors.find(x => x.userData.life <= 0); if (!m) return;
  const f = camera.getWorldDirection(new THREE.Vector3()).add(new THREE.Vector3().randomDirection().multiplyScalar(.7)).normalize();
  const t = new THREE.Vector3().randomDirection(); t.addScaledVector(f, -t.dot(f)).normalize().multiplyScalar(520);
  m.position.copy(f.multiplyScalar(480)); m.userData.vel.copy(t); m.userData.life = 1.1;
}

/* ---------- camera: drag, inertia, wheel, gyro tilt, fly-to ---------- */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const ease = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
let fly = null, drag = null, entering = false, tilt = { x: 0, y: 0, tx: 0, ty: 0 };
function flyTo(dir, fov, dur = 1.8) {
  const yaw = Math.atan2(-dir.x, -dir.z), pitch = Math.asin(dir.y / dir.length());
  const dy = ((yaw - view.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  fly = { t: 0, dur: reduce ? .01 : dur, f: { ...view }, to: { yaw: view.yaw + dy, pitch, fov } };
}
const cv = $('#sky'), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
cv.addEventListener('pointerdown', e => { if (entering) return; cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, moved: 0 }; fly = null; });
cv.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y, k = .0032 * view.fov / 70;
  drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
  view.vy = dx * k; view.vp = dy * k; view.yaw += view.vy; view.pitch = clamp(view.pitch + view.vp, -1.4, 1.4);
});
cv.addEventListener('pointerup', e => { if (drag && drag.moved < 8) tap(e); drag = null; });
cv.addEventListener('wheel', e => { view.fov = clamp(view.fov + e.deltaY * .03, 35, 90); }, { passive: true });
function tap(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects([...stars, moon])[0]; if (!hit) return;
  if (hit.object === moon) return moonEgg();
  openCard(hit.object.userData.m, hit.object);
}

/* gyro: small parallax tilt (iOS needs a permission tap) */
$('#btnGyro').onclick = async () => {
  try { if (DeviceOrientationEvent.requestPermission && await DeviceOrientationEvent.requestPermission() !== 'granted') return; } catch { return; }
  addEventListener('deviceorientation', e => { tilt.tx = clamp((e.gamma || 0) / 40, -1, 1); tilt.ty = clamp(((e.beta || 45) - 45) / 40, -1, 1); });
};

/* ---------- memory card ---------- */
const fmt = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Tehran' });
function openCard(m, star) {
  flyTo(star.position, 48, 1.6);
  $('#cTitle').textContent = m.title;
  $('#cMeta').textContent = `${fmt.format(new Date(m.date))} — ${m.place}`;
  const lk = m.unlock && Date.now() < new Date(m.unlock);
  $('#cText').textContent = lk ? `این ستاره ${fmt.format(new Date(m.unlock))} روشن میشه ✦` : m.text;
  $('#cReply').textContent = lk || !m.reply ? '' : 'زهرا:\n' + m.reply; $('#cReply').hidden = lk || !m.reply;
  const au = $('#cAudio'); au.pause(); au.hidden = lk || !VOICES[m.id]; if (!au.hidden) au.src = VOICES[m.id];
  $('#cPhoto').style.backgroundImage = m.photo ? `url(${m.photo})` : '';
  const c = $('#card'); c.hidden = false; c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; $('#cClose').focus(); window.__ou?.onOpen?.(m.id);
}
function closeCard() { $('#card').hidden = true; $('#cAudio').pause(); window.__ou?.onClose?.(); flyTo(new THREE.Vector3(-Math.sin(view.yaw), 0, -Math.cos(view.yaw)), 70, 1.2); }
$('#cClose').onclick = closeCard; addEventListener('keydown', e => e.key === 'Escape' && !$('#card').hidden && closeCard());
$('#chips').append(...ALL.map((m, i) => Object.assign(document.createElement('button'), { textContent: m.title, onclick: () => openCard(m, stars[i]) })));

/* ---------- easter egg: tap the moon 3 times ---------- */
let moonTaps = 0;
function moonEgg() {
  if (++moonTaps < 3) return; moonTaps = 0;
  for (let i = 0; i < 4; i++) setTimeout(shoot, i * 220);
  const t = $('#toast'); t.textContent = 'ماه منی ☾'; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2600);
}

/* ---------- generative ambient sound (Web Audio) ---------- */
let ac, master;
function startAudio() {
  ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; master.connect(lp).connect(ac.destination);
  [146.83, 220, 277.18, 329.63, 369.99].forEach((f, i) => {            // slow Dmaj9 pad
    const o = ac.createOscillator(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain();
    o.frequency.value = f; o.detune.value = i * 3 - 6; g.gain.value = .05; l.frequency.value = .05 + i * .02; lg.gain.value = .03;
    l.connect(lg).connect(g.gain); o.connect(g).connect(master); o.start(); l.start();
  });
  setInterval(() => { if (master.gain.value < .1) return;              // random pentatonic sparkles
    const f = [587.33, 659.25, 739.99, 880, 987.77][Math.random() * 5 | 0], o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .05);
    g.gain.exponentialRampToValueAtTime(.0001, t + 2.5); o.connect(g).connect(master); o.start(t); o.stop(t + 2.6); }, 2200);
}
let song;
$('#btnSound').onclick = e => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on);
  if (SONG) { song = song || Object.assign(new Audio(SONG), { loop: true, volume: .6 }); on ? song.play().catch(() => {}) : song.pause(); return; }
  if (!ac) startAudio(); ac.resume(); master.gain.linearRampToValueAtTime(on ? .9 : 0, ac.currentTime + 1.5);
};

/* ---------- gate + cinematic entrance ---------- */
$('#gateQ').textContent = 'برای ورود به دنیامون لمس کن ✦';
$('#gateForm').onsubmit = e => { e.preventDefault(); $('#gate').classList.add('out'); startEntrance(); };
let enter0 = 0, started = false;
function startEntrance() {
  started = true; entering = !reduce; enter0 = performance.now(); if (reduce) camera.position.z = 0;
  setTimeout(() => { $('#hud').hidden = false; }, reduce ? 0 : 5500);
}
camera.position.z = 900; // start far away, outside the star shell

/* ---------- together counter ---------- */
const since = new Date(CONFIG.togetherSince);
setInterval(() => {   // ساعت‌شمار: سال و ماه و روز و ساعت:دقیقه:ثانیه از اولین دیدار
  const f = n => n.toLocaleString('fa-IR'), now = new Date(); let y = now.getFullYear() - since.getFullYear(), mo = now.getMonth() - since.getMonth(), d = now.getDate() - since.getDate();
  let h = now.getHours() - since.getHours(), mi = now.getMinutes() - since.getMinutes(), sc = now.getSeconds() - since.getSeconds();
  if (sc < 0) { sc += 60; mi--; } if (mi < 0) { mi += 60; h--; } if (h < 0) { h += 24; d--; }
  if (d < 0) { d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); mo--; } if (mo < 0) { mo += 12; y--; }
  $('#together').textContent = `از اولین دیدارمون: ${[y && f(y) + ' سال', mo && f(mo) + ' ماه', f(d) + ' روز'].filter(Boolean).join(' و ')} و ${[h, mi, sc].map(x => f(x).padStart(2, '۰')).join(':')}`;
}, 1000);

/* ---------- main loop ---------- */
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
window.__ou = { THREE, scene, camera, glow, sprite, shoot, flyTo };   // برای sky-extras.js
let last = performance.now(), nextMeteor = 4, lineN = 0;
renderer.setAnimationLoop(now => {
  const dt = Math.min((now - last) / 1000, .05); last = now; if (!reduce) uTime.value += dt;
  if (enter0) {                                                         // fly in from far away
    const t = clamp((now - enter0) / (reduce ? 1 : 6000), 0, 1);
    camera.position.z = 900 * (1 - ease(t)); view.fov = 110 - 40 * ease(t); if (t >= 1) { entering = false; enter0 = 0; }
  }
  if (fly) {
    fly.t += dt / fly.dur; const k = ease(clamp(fly.t, 0, 1));
    for (const p of ['yaw', 'pitch', 'fov']) view[p] = fly.f[p] + (fly.to[p] - fly.f[p]) * k;
    if (fly.t >= 1) fly = null;
  } else if (!drag && !entering) {
    view.yaw += view.vy; view.pitch = clamp(view.pitch + view.vp, -1.4, 1.4); view.vy *= .93; view.vp *= .93;
    if (!reduce && $('#card').hidden) view.yaw += dt * .012;            // slow idle drift
  }
  tilt.x += (tilt.tx - tilt.x) * .08; tilt.y += (tilt.ty - tilt.y) * .08;
  camera.rotation.set(view.pitch + tilt.y * .1, view.yaw - tilt.x * .1, 0);
  if (camera.fov !== view.fov) { camera.fov = view.fov; camera.updateProjectionMatrix(); }
  if (line && started && !entering) { lineN += dt * 22; line.geometry.setDrawRange(0, Math.min(121, lineN | 0)); } // pink line draws itself
  stars.forEach(s => s.scale.setScalar(s.userData.base * (1 + .12 * Math.sin(uTime.value * 1.6 + s.userData.ph))));
  if (!reduce && !entering && started && (nextMeteor -= dt) < 0) { shoot(); nextMeteor = 5 + Math.random() * 6; }
  for (const m of meteors) { const u = m.userData; if (u.life <= 0) continue;
    u.life -= dt; m.position.addScaledVector(u.vel, dt); m.material.opacity = clamp(u.life, 0, 1);
    const a = m.geometry.attributes.position; a.setXYZ(1, -u.vel.x * .22, -u.vel.y * .22, -u.vel.z * .22); a.needsUpdate = true; }
  renderer.render(scene, camera);
});
