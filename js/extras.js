// منوی ✦ : سوپرایز امروز، شبیه‌ساز آسمون، نامه‌ها، آرزوها. UI خودش رو می‌سازه.
import { CONFIG, MEMORIES } from '../data/memories.js';
import { LETTERS } from '../data/letters.js';
import { SURPRISES } from '../data/surprises.js';
import { renderGame } from './game.js';

const $ = s => document.querySelector(s);
const el = (t, p = {}, ...k) => { const e = Object.assign(document.createElement(t), p); e.append(...k); return e; };
const fmt = new Intl.DateTimeFormat('fa-IR-u-ca-gregory', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Tehran' });
const fa = n => n.toLocaleString('fa-IR');
const tehran = d => new Date(d).toLocaleString('sv-SE', { timeZone: 'Asia/Tehran' }).replace(' ', 'T').slice(0, 16);

document.head.append(el('style', { textContent: `
#btnMenu{left:9.8rem}
#xPanel{position:fixed;inset:0;z-index:20;background:#0b1030;display:flex;flex-direction:column;padding-top:var(--sat)}
#xPanel[hidden]{display:none}
#xPanel header{display:flex;gap:.4rem;padding:.7rem;flex-wrap:wrap;align-items:center}
#xPanel button,#xPanel input{background:#ffffff0f;border:1px solid #e8b4c855;border-radius:999px;padding:.45rem 1rem}
#xPanel header button[aria-pressed=true]{background:var(--rose);color:var(--night);font-weight:800}
#xClose{margin-inline-start:auto;font-size:1.4rem;line-height:1}
#xBody{flex:1;overflow:auto;padding:0 1rem calc(var(--sab) + 2rem);line-height:2}
#xBody canvas{width:100%;max-width:30rem;display:block;margin:.8rem auto}
.xrow{display:flex;gap:.4rem;flex-wrap:wrap;margin:.5rem 0}
.xcard{background:#ffffff0a;border:1px solid #e8b4c833;border-radius:1rem;padding:1rem;margin:.6rem 0}
.xcard h3{margin:0;font-weight:500;color:var(--rose)}
.xcard p{margin:.4rem 0 0;font-weight:300}
.xlist{list-style:none;padding:0}.xlist li{display:flex;justify-content:space-between;gap:.5rem;padding:.3rem 0}
.xbig{font-size:1.25rem;color:var(--gold);font-weight:300;line-height:2.2}
` }));

const panel = el('section', { id: 'xPanel', hidden: true }); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'منو');
const head = el('header'), body = el('div', { id: 'xBody' });
panel.append(head, body); document.body.append(panel);
const btn = el('button', { id: 'btnMenu', textContent: '✦' }); btn.setAttribute('aria-label', 'منو'); $('#hud').append(btn);

/* ---- Today: سوپرایز روزانه (بر اساس تاریخ تهران) ---- */
function renderToday(b) {
  const day = Math.floor((Date.now() + 12600000) / 864e5);
  b.append(el('p', { className: 'xbig', textContent: SURPRISES[day % SURPRISES.length] }),
    el('small', { textContent: 'هر روز یه سوپرایز جدید ✦' }));
}

/* ---- Sky: آسمون تهران توی تاریخ و ساعت دلخواه ---- */
const LAT = 35.69, LON = 51.39, D = Math.PI / 180;
const STARS = [['شباهنگ',6.752,-16.716,-1.46],['سهیل',6.399,-52.696,-.74],['سماک رامح',14.261,19.182,-.05],['نسر واقع',18.616,38.784,.03],
['عیوق',5.278,45.998,.08],['رجل',5.242,-8.202,.13],['شعرای شامی',7.655,5.225,.34],['ابط‌الجوزا',5.919,7.407,.5],['نسر طایر',19.846,8.868,.77],
['دبران',4.599,16.509,.85],['قلب‌العقرب',16.49,-26.432,1.06],['سماک اعزل',13.42,-11.161,1.04],['پولوکس',7.755,28.026,1.14],['فم‌الحوت',22.961,-29.622,1.16],
['ذنب‌الدجاجه',20.69,45.28,1.25],['قلب‌الاسد',10.14,11.967,1.35],['ستاره‌ی قطبی',2.53,89.264,1.98],['Dubhe',11.062,61.751,1.79],['Merak',11.031,56.382,2.37],
['Phecda',11.897,53.695,2.44],['Megrez',12.257,57.033,3.31],['Alioth',12.9,55.96,1.77],['Mizar',13.399,54.925,2.27],['Alkaid',13.792,49.313,1.86],
['Alnitak',5.679,-1.943,1.74],['Alnilam',5.603,-1.202,1.69],['Mintaka',5.533,-.299,2.23],['Schedar',.675,56.537,2.24],['Caph',.153,59.15,2.28],
['Gamma Cas',.945,60.717,2.47],['Ruchbah',1.43,60.235,2.68],['Segin',1.907,63.67,3.35]];
function drawSky(cv, date, info) {
  const g = cv.getContext('2d'), W = cv.width, c = W / 2, R = c - 26;
  const jd = date / 864e5 + 2440587.5, lst = (((280.46061837 + 360.98564736629 * (jd - 2451545) + LON) % 360) + 360) % 360;
  const pos = (ra, dec) => {                                       // RA/Dec → alt/az → دایره‌ی آسمون
    const ha = (lst - ra * 15) * D, de = dec * D, la = LAT * D;
    const alt = Math.asin(Math.sin(de) * Math.sin(la) + Math.cos(de) * Math.cos(la) * Math.cos(ha));
    const az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(la) - Math.tan(de) * Math.cos(la)) + Math.PI;
    const r = (Math.PI / 2 - alt) / (Math.PI / 2) * R; return { alt, x: c - r * Math.sin(az), y: c - r * Math.cos(az) };
  };
  g.clearRect(0, 0, W, W);
  const gr = g.createRadialGradient(c, c, 0, c, c, R); gr.addColorStop(0, '#1a1f4d'); gr.addColorStop(1, '#0b1030');
  g.fillStyle = gr; g.beginPath(); g.arc(c, c, R, 0, 7); g.fill(); g.strokeStyle = '#e8b4c855'; g.stroke();
  let s = 7; const rnd = () => (s = s * 16807 % 2147483647) / 2147483647;   // ستاره‌های کم‌نور (تزئینی، ثابت)
  for (let i = 0; i < 600; i++) { const p = pos(rnd() * 24, Math.asin(rnd() * 2 - 1) / D); g.globalAlpha = .2 + rnd() * .5;
    if (p.alt > 0) { g.fillStyle = '#f4f1ff'; g.fillRect(p.x, p.y, 1.4, 1.4); } }
  g.globalAlpha = 1; g.font = '15px Vazirmatn,sans-serif'; g.direction = 'ltr'; g.textAlign = 'left';
  for (const [n, ra, dec, m] of STARS) { const p = pos(ra, dec); if (p.alt < 0) continue;
    g.fillStyle = m < .5 ? '#e9d3a2' : '#f4f1ff'; g.beginPath(); g.arc(p.x, p.y, Math.max(1.3, 3.6 - m * .8), 0, 7); g.fill();
    if (m < 1.5) { g.fillStyle = '#b9a6e8'; g.fillText(n, p.x + 6, p.y - 6); } }
  g.fillStyle = '#e9d3a2'; g.textAlign = 'center'; g.fillText('شمال', c, 20); g.fillText('جنوب', c, W - 6); g.textAlign = 'left'; g.fillText('شرق', 4, c + 5); g.textAlign = 'right'; g.fillText('غرب', W - 4, c + 5); g.textAlign = 'left';
  const age = (((jd - 2451550.1) % 29.530588) + 29.530588) % 29.530588;
  info.textContent = `آسمون تهران — ماه حدود ${fa(Math.round((1 - Math.cos(2 * Math.PI * age / 29.530588)) / 2 * 100))}٪ روشن بود`;
}
function renderSky(b) {
  const inp = el('input', { type: 'datetime-local', value: tehran(CONFIG.togetherSince) });
  const cv = el('canvas', { width: 700, height: 700 }), info = el('p');
  const draw = () => { const d = new Date(inp.value + ':00+03:30'); if (!isNaN(d)) drawSky(cv, d, info); };
  inp.oninput = draw;
  b.append(inp, el('div', { className: 'xrow' }, ...MEMORIES.map(m => el('button', { textContent: m.title, onclick: () => { inp.value = tehran(m.date); draw(); } }))), cv, info); draw();
}

/* ---- Letters: نامه‌های قفل‌شده ---- */
function renderLetters(b) {
  for (const L of LETTERS) {
    const open = !L.unlock || Date.now() >= new Date(L.unlock);
    b.append(el('div', { className: 'xcard' }, el('h3', { textContent: (open ? '✉ ' : '🔒 ') + L.title }),
      el('p', { textContent: open ? L.text : `این نامه ${fmt.format(new Date(L.unlock))} باز میشه` })));
  }
}

/* ---- Wishes: آرزوها (روی همین دستگاه ذخیره میشن) ---- */
function renderWishes(b) {
  const key = 'ou-wishes'; let list = []; try { list = JSON.parse(localStorage.getItem(key)) || []; } catch {}
  const save = () => { try { localStorage.setItem(key, JSON.stringify(list)); } catch {} };
  const ul = el('ul', { className: 'xlist' }), inp = el('input', { placeholder: 'یه آرزو بنویس…', maxLength: 140 });
  const paint = () => ul.replaceChildren(...list.map((w, i) => el('li', {},
    el('label', {}, el('input', { type: 'checkbox', checked: w.done, onchange: e => { w.done = e.target.checked; save(); } }), ' ' + w.t),
    el('button', { textContent: '×', title: 'حذف', onclick: () => { list.splice(i, 1); save(); paint(); } }))));
  const add = () => { const t = inp.value.trim(); if (!t) return; list.unshift({ t, done: false }); inp.value = ''; save(); paint(); };
  inp.onkeydown = e => e.key === 'Enter' && add();
  b.append(el('div', { className: 'xrow' }, inp, el('button', { textContent: '+', onclick: add })), ul,
    el('small', { textContent: 'آرزوها فقط روی همین گوشی ذخیره میشن.' })); paint();
}

const TABS = { 'امروز': renderToday, 'آسمون': renderSky, 'نامه‌ها': renderLetters, 'آرزوها': renderWishes, 'بازی': renderGame };
function show(name) {
  head.querySelectorAll('[data-t]').forEach(x => x.setAttribute('aria-pressed', x.dataset.t === name));
  body.replaceChildren(); TABS[name](body);
}
head.append(...Object.keys(TABS).map(n => Object.assign(el('button', { textContent: n }), { onclick: () => show(n) }, { dataset: {} })));
head.querySelectorAll('button').forEach((x, i) => x.dataset.t = Object.keys(TABS)[i]);
head.append(el('button', { id: 'xClose', textContent: '×', title: 'بستن', onclick: () => { panel.hidden = true; } }));
btn.onclick = () => { panel.hidden = false; show('امروز'); };
addEventListener('keydown', e => e.key === 'Escape' && !panel.hidden && (panel.hidden = true));
