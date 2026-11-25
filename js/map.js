// نقشه‌ی خاطرات + مترو دیدارها. UI خودش رو می‌سازه؛ نیازی به تغییر main.js نیست.
import { MEMORIES } from '../data/memories.js';
import { COORDS } from '../data/places.js';

const $ = s => document.querySelector(s);
const fmt = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long', timeZone: 'Asia/Tehran' });
const items = [...MEMORIES].sort((a, b) => new Date(a.date) - new Date(b.date));

document.head.append(Object.assign(document.createElement('style'), { textContent: `
#btnMap{left:6.8rem}
#mapPanel{position:fixed;inset:0;z-index:20;background:#0b1030;display:flex;flex-direction:column;padding-top:var(--sat)}
#mapPanel[hidden]{display:none}
#mapPanel header{display:flex;gap:.5rem;padding:.7rem;align-items:center}
#mapPanel header button{background:#ffffff0f;border:1px solid #e8b4c855;border-radius:999px;padding:.45rem 1.1rem}
#mapPanel header button[aria-pressed=true]{background:var(--rose);color:var(--night);font-weight:800}
#mapPanel #mapClose{margin-inline-start:auto;font-size:1.4rem;line-height:1;padding:.3rem .8rem}
#leaflet{flex:1;background:#0b1030}
#metro{flex:1;overflow:auto;margin:0;padding:1.2rem 1.6rem calc(var(--sab) + 2rem);list-style:none;direction:ltr}
#metro li{position:relative;padding:0 0 2.2rem 2.2rem;border-left:6px solid var(--rose);margin-left:.6rem}
#metro li:last-child{border-left-color:transparent}
#metro li::before{content:"";position:absolute;left:-14px;top:.1rem;width:22px;height:22px;border-radius:50%;
  background:var(--night);border:5px solid var(--gold)}
#metro button{background:none;border:0;text-align:left;padding:0;display:block}
#metro b{display:block;font-weight:500;color:var(--rose)}
#metro small{display:block;color:var(--gold);direction:rtl;text-align:left;margin-top:.2rem}
.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#1c2058;color:#f4f1ff}
.leaflet-popup-content{font-family:Vazirmatn,sans-serif;margin:.8rem 1rem}
` }));

const panel = document.createElement('section');
panel.id = 'mapPanel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'نقشه');
panel.innerHTML = `<header><button data-tab="map" aria-pressed="true">نقشه</button>
  <button data-tab="metro" aria-pressed="false">مترو</button><button id="mapClose" aria-label="بستن">×</button></header>
  <div id="leaflet"></div><ol id="metro" hidden></ol>`;
document.body.append(panel);
const btn = Object.assign(document.createElement('button'), { id: 'btnMap', textContent: '⌖' });
btn.setAttribute('aria-label', 'نقشه'); $('#hud').append(btn);

/* مترو: هر دیدار یه ایستگاهه، به ترتیب تاریخ */
$('#metro').append(...items.map(m => {
  const li = document.createElement('li'), b = document.createElement('button');
  b.innerHTML = '<b></b><small></small>'; b.querySelector('b').textContent = m.title;
  b.querySelector('small').textContent = `${fmt.format(new Date(m.date))} — ${m.place}`;
  b.onclick = () => { show('map'); focus(m.id); }; li.append(b); return li;
}));

let map, markers = {};
const load = (tag, attrs) => new Promise(r => { const e = Object.assign(document.createElement(tag), attrs); e.onload = r; document.head.append(e); });
async function initMap() {
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.';
  await Promise.all([load('link', { rel: 'stylesheet', href: base + 'min.css' }), load('script', { src: base + 'min.js' })]);
  const L = window.L; map = L.map('leaflet', { zoomControl: false }).setView([35.6892, 51.389], 11);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 }).addTo(map);
  const pts = [];
  for (const m of items) {
    const c = COORDS[m.id]; if (!c) continue; pts.push(c);
    const pop = document.createElement('div'); pop.innerHTML = '<b></b><br><small></small>';
    pop.querySelector('b').textContent = m.title; pop.querySelector('small').textContent = `${fmt.format(new Date(m.date))} — ${m.place}`;
    markers[m.id] = L.circleMarker(c, { radius: 9, color: '#e8b4c8', fillColor: '#e9d3a2', fillOpacity: .9, weight: 3 }).bindPopup(pop).addTo(map);
  }
  if (pts.length > 1) L.polyline(pts, { color: '#e8b4c8', weight: 2, dashArray: '6 8' }).addTo(map);
  if (pts.length) map.fitBounds(pts, { padding: [50, 50], maxZoom: 14 });
}
function focus(id) { const k = markers[id]; if (k) { map.flyTo(k.getLatLng(), 15); k.openPopup(); } }
function show(tab) {
  panel.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === tab));
  $('#leaflet').hidden = tab !== 'map'; $('#metro').hidden = tab !== 'metro';
  if (tab === 'map' && map) setTimeout(() => map.invalidateSize(), 50);
}
panel.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => show(b.dataset.tab));
btn.onclick = async () => { panel.hidden = false; if (!map) await initMap(); show('map'); };
const close = () => { panel.hidden = true; };
$('#mapClose').onclick = close; addEventListener('keydown', e => e.key === 'Escape' && !panel.hidden && close());
