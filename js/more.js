// تب‌های کوپن، کارهامون و کپسول زمان. وضعیت‌ها توی localStorage همین دستگاه ذخیره میشن.
import { COUPONS, TODO_SEED } from '../data/more.js';
const el = (t, p = {}, ...k) => { const e = Object.assign(document.createElement(t), p); e.append(...k); return e; };
const store = (k, d) => ({ get() { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } });
document.head.append(el('style', { textContent: '#xPanel textarea{width:100%;background:#ffffff0f;color:inherit;border:1px solid #e8b4c855;border-radius:1rem;padding:.8rem;font:inherit}' }));
const share = t => { const text = `کوپن «${t}» رو مصرف کردم 💌`; navigator.share ? navigator.share({ text }).catch(() => {}) : navigator.clipboard?.writeText(text); };

export function renderCoupons(b) {
  const st = store('ou-coupons', {}), used = st.get();
  for (const c of COUPONS) {
    const act = el('p'), paint = () => act.replaceChildren(used[c.title]
      ? el('small', { textContent: 'مصرف شد: ' + new Date(used[c.title]).toLocaleDateString('fa-IR') })
      : el('button', { textContent: 'مصرفش کن', onclick: () => { if (!confirm('مصرف بشه؟')) return; used[c.title] = Date.now(); st.set(used); paint(); share(c.title); } }));
    paint(); b.append(el('div', { className: 'xcard' }, el('h3', { textContent: '🎟 ' + c.title }), el('p', { textContent: c.text }), act));
  }
}

export function renderTodo(b) {
  const st = store('ou-todo', null); let list = st.get() || TODO_SEED.map(t => ({ t, done: false }));
  const ul = el('ul', { className: 'xlist' }), cnt = el('small'), inp = el('input', { placeholder: 'یه کار تازه…', maxLength: 120 });
  const paint = () => { cnt.textContent = `${list.filter(x => x.done).length.toLocaleString('fa-IR')} از ${list.length.toLocaleString('fa-IR')} تا انجام شده`;
    ul.replaceChildren(...list.map((w, i) => el('li', {}, el('label', {}, el('input', { type: 'checkbox', checked: w.done, onchange: e => { w.done = e.target.checked; st.set(list); paint(); } }), ' ' + w.t),
      el('button', { textContent: '×', title: 'حذف', onclick: () => { list.splice(i, 1); st.set(list); paint(); } })))); };
  const add = () => { const t = inp.value.trim(); if (!t) return; list.push({ t, done: false }); inp.value = ''; st.set(list); paint(); };
  inp.onkeydown = e => e.key === 'Enter' && add();
  b.append(el('div', { className: 'xrow' }, inp, el('button', { textContent: '+', onclick: add })), cnt, ul); paint();
}

export function renderCapsule(b) {
  const st = store('ou-capsule', null); let c = st.get(), out = el('div');
  const paint = () => { out.replaceChildren();
    if (c && Date.now() < c.at) out.append(el('div', { className: 'xcard' }, el('h3', { textContent: '🔒 کپسول بسته‌ست' }),
      el('p', { textContent: new Date(c.at).toLocaleDateString('fa-IR-u-ca-gregory', { dateStyle: 'long' }) + ' باز میشه' })));
    else if (c) out.append(el('div', { className: 'xcard' }, el('h3', { textContent: '💌 کپسول باز شد' }), el('p', { textContent: c.text }),
      el('button', { textContent: 'یه کپسول تازه', onclick: () => { c = null; st.set(null); paint(); } })));
    else { const ta = el('textarea', { rows: 6, placeholder: 'برای آینده‌مون بنویس…' }), dt = el('input', { type: 'date' });
      dt.value = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);
      out.append(ta, el('div', { className: 'xrow' }, dt, el('button', { textContent: 'ببندش 🔒', onclick: () => {
        if (!ta.value.trim()) return; c = { text: ta.value.trim(), at: new Date(dt.value + 'T00:00:00+03:30').getTime() }; st.set(c); paint(); } }))); } };
  paint(); b.append(out, el('small', { textContent: 'کپسول فقط روی همین گوشی ذخیره میشه.' }));
}
