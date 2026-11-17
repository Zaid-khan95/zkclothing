/* ===== Fashion Boutique Collection Management System =====
   Zaid Khan | B.Tech CSE | Lovely Professional University
   Plain JavaScript. All data is saved in localStorage (key below). */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = 'fbcms_v2';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATS = ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'];
const SEASONS = ['Summer', 'Winter', 'Spring', 'Autumn'];
const ICON = { Summer: '☀', Winter: '❄', Spring: '✿', Autumn: '🍂' };
const COLORS = { Black: '#1a1a1a', White: '#efe9dd', Burgundy: '#6d1a2c', Beige: '#d8c3a5', Navy: '#1f2a44', Olive: '#6b705c', Rose: '#d4a5a5', Camel: '#b5835a', Red: '#b3262e', Grey: '#8a8a8a' };

/* ---------- Small helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '₹' + Number(n).toLocaleString('en-IN');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const total = p => p.variants.reduce((a, v) => a + v.stock, 0);
const thr = () => state.settings.threshold;
const status = n => n <= 0 ? ['Out of Stock', 'out'] : n <= thr() ? ['Low Stock', 'low'] : ['In Stock', 'ok'];
const badge = n => { const [t, c] = status(n); return `<span class="badge ${c}">${t}</span>`; };
const sel = (id, label, arr, val) => `<select id="${id}"><option value="">${label}</option>${arr.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
const opts = (arr, val) => arr.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('');
const sw = c => `<span class="sw" style="background:${COLORS[c] || '#999'}"></span>${esc(c)}`;
const find = id => state.products.find(p => p.id === id);

/* Draws a simple garment picture (SVG) so every product has an image even without upload */
function art(color, cat) {
  const shapes = { Dresses: 'M80 40L120 40L130 90L160 230L40 230L70 90Z', Tops: 'M60 50L90 40L110 40L140 50L170 90L145 105L140 90L140 220L60 220L60 90L55 105L30 90Z', Bottoms: 'M65 40L135 40L150 230L108 230L100 110L92 230L50 230Z', Outerwear: 'M55 45L90 38L110 38L145 45L175 110L150 125L145 100L145 225L55 225L55 100L50 125L25 110Z', Accessories: 'M55 100L145 100L155 210L45 210Z M75 100Q100 20 125 100' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3ebdd"/><stop offset="1" stop-color="#d9c9ae"/></linearGradient></defs><rect width="200" height="260" fill="url(#g)"/><path d="${shapes[cat] || shapes.Dresses}" fill="${COLORS[color] || '#6d1a2c'}" stroke="rgba(0,0,0,.25)" stroke-width="2"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
/* Real fashion photos (Unsplash, free licence). If a photo cannot load (offline), the drawn picture is used instead. */
const U = id => `https://unsplash.com/photos/${id}/download?force=true&w=600`;
const D = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;
document.addEventListener('error', e => { const i = e.target, p = i.tagName === 'IMG' && find(i.dataset.pid); if (p && !i.dataset.done) { i.dataset.done = 1; i.src = art(p.variants[0]?.color, p.cat); } }, true);
const imgOf = p => p.img || art(p.variants[0]?.color, p.cat);

/* ---------- Data: sample data + localStorage ---------- */
function seed() {
  // vars format "Size:Color:Stock,..."
  const mk = (name, cat, season, price, desc, vars, img) => ({ id: uid() + name.length, name, cat, season, price, desc, img, variants: vars.split(',').map(v => { const [size, color, stock] = v.split(':'); return { size, color, stock: +stock }; }) });
  const products = [
    mk('Silk Wrap Dress', 'Dresses', 'Summer', 6499, 'Flowing silk wrap dress with a tie waist.', 'S:Red:6,M:Red:9,L:Red:4', U('IuVz1J2dajY')),
    mk('Ivory Summer Dress', 'Dresses', 'Summer', 4299, 'Breathable cotton dress in soft ivory.', 'S:White:12,M:White:8,L:White:0', D('photo-1617551307578-7f5160d6615e')),
    mk('Classic Wool Overcoat', 'Outerwear', 'Winter', 12999, 'Tailored black wool coat with a clean line.', 'M:Black:3,L:Black:2,XL:Black:5', U('THXce_MY8r0')),
    mk('Cashmere Knit Sweater', 'Tops', 'Winter', 7999, 'Soft cashmere knit for cold evenings.', 'S:Camel:7,M:Camel:2,L:Camel:6', D('photo-1520508358701-63027028d924')),
    mk('Floral Midi Dress', 'Dresses', 'Spring', 5499, 'Floral midi dress with a high slit.', 'XS:Rose:5,S:Rose:8,M:Rose:10', U('KcERAQcCGmw')),
    mk('Beige Trench Coat', 'Outerwear', 'Spring', 8999, 'Lightweight belted trench for spring.', 'S:Beige:4,M:Beige:6,L:Beige:1', U('XqwOmPzdIbI')),
    mk('Velvet Evening Gown', 'Dresses', 'Autumn', 15999, 'Deep black velvet gown for formal events.', 'S:Black:3,M:Black:0,L:Black:0', U('eWwYAgaF24I')),
    mk('Azure Wool Coat', 'Outerwear', 'Autumn', 10499, 'Statement blue coat in soft wool.', 'M:Navy:10,L:Navy:9,XXL:Navy:5', U('7uoMmzPd2JA')),
    mk('Emerald Printed Dress', 'Dresses', 'Autumn', 6999, 'Green botanical-print dress.', 'S:Olive:7,M:Olive:7,L:Olive:11', U('5o44iIegdqs')),
    mk('Faux-Fur Winter Coat', 'Outerwear', 'Winter', 13999, 'Warm statement coat for snowy days.', 'M:Grey:4,L:Grey:3', U('G0_PcSqq4C8'))
  ];
  const col = (name, season, desc, ids) => ({ id: uid() + season, name, season, desc, banner: '', products: ids.map(i => products[i].id) });
  return {
    products, log: [],
    collections: [col('Riviera Summer', 'Summer', 'Light fabrics for sunny days.', [0, 1]), col('Alpine Winter', 'Winter', 'Warm, refined layers.', [2, 3, 9]), col('Garden Spring', 'Spring', 'Soft pastels and florals.', [4, 5]), col('Heritage Autumn', 'Autumn', 'Rich tones and tailoring.', [6, 7, 8])],
    customers: [{ id: uid() + 'a', name: 'Aanya Sharma', phone: '9876543210', email: 'aanya@example.com', interests: [products[0].id, products[6].id], note: 'Wants a gown for a wedding.', date: new Date().toLocaleDateString() }, { id: uid() + 'b', name: 'Rohan Mehta', phone: '9812345678', email: '', interests: [products[2].id], note: 'Asked about XL availability.', date: new Date().toLocaleDateString() }],
    sales: [['Jun', 42], ['Jul', 55], ['Aug', 48], ['Sep', 63], ['Oct', 78], ['Nov', 71]],
    settings: { name: 'Maison Zaid', logo: '', theme: 'light', alerts: true, email: false, threshold: 5 }
  };
}
let state;
try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
if (!state || !state.products) state = seed();
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
save();

/* ---------- UI helpers: toast, modal, router ---------- */
function logAct(m) { state.log = [{ m, t: new Date().toLocaleString() }, ...(state.log || [])].slice(0, 8); save(); }
function toast(msg, err) {
  if (!err) logAct(msg); // every success message is also kept in the dashboard activity feed
  const d = document.createElement('div'); d.textContent = msg; if (err) d.className = 'err';
  $('#toast').append(d); setTimeout(() => d.remove(), 3000);
  return true; // lets validation code write: return toast(...) && false
}
/* Opens the popup. onSave(form) returns false to keep it open (validation failed). */
function modal(title, html, onSave) {
  $('#mtitle').textContent = title;
  $('#mform').innerHTML = html + '<div class="acts"><button type="button" class="btn ghost" id="mcancel">Cancel</button><button class="btn">Save</button></div>';
  $('#modal').classList.remove('hidden');
  $('#mcancel').onclick = closeModal;
  $('#mform').onsubmit = e => { e.preventDefault(); if (onSave($('#mform')) !== false) closeModal(); };
}
const closeModal = () => $('#modal').classList.add('hidden');
$('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };

/* Shrinks an uploaded image so it fits in localStorage */
function readImg(file, cb) {
  const fr = new FileReader();
  fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 520 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .8)); }; im.src = fr.result; };
  fr.readAsDataURL(file);
}

const PAGES = { dashboard: ['Dashboard', pgDash], products: ['Product Management', pgProducts], collections: ['Collections', pgCollections], variants: ['Product Variants', pgVariants], inventory: ['Inventory', pgInventory], customers: ['Customer Interest', pgCustomers], settings: ['Settings', pgSettings] };
function show() { // draw the page named in the URL hash
  let p = location.hash.slice(1); if (!PAGES[p]) p = 'dashboard';
  $('#title').textContent = PAGES[p][0];
  $$('nav a').forEach(a => a.classList.toggle('on', a.dataset.p === p));
  $('#view').onclick = null; // clear the previous page's click handler
  PAGES[p][1](); applySettings();
}
window.addEventListener('hashchange', () => { $('#sidebar').classList.remove('open'); window.scrollTo(0, 0); show(); });
$('#menu').onclick = () => $('#sidebar').classList.toggle('open');

function applySettings() {
  const s = state.settings;
  document.body.dataset.theme = s.theme; $('#bname').textContent = s.name;
  $('#logo').innerHTML = s.logo ? `<img src="${s.logo}" alt="logo">` : esc(s.name.charAt(0).toUpperCase());
  document.title = s.name + ' | Collection Management';
  const n = state.products.reduce((a, p) => a + p.variants.filter(v => v.stock <= thr()).length, 0);
  $('#alerts').textContent = s.alerts && n ? n : '';
}

/* ---------- DASHBOARD ---------- */
const bars = (data, max) => `<div class="bars">${data.map(([l, v]) => `<div class="bc"><i style="height:${max ? v / max * 100 : 0}%"><em>${v}</em></i><span>${l}</span></div>`).join('')}</div>`;
function pgDash() {
  const P = state.products, stock = P.reduce((a, p) => a + total(p), 0), out = P.filter(p => total(p) === 0).length;
  const low = P.filter(p => total(p) > 0 && total(p) <= thr()).length;
  const byCat = CATS.map(c => [c.slice(0, 7), P.filter(p => p.cat === c).reduce((a, p) => a + total(p), 0)]);
  const maxC = Math.max(...byCat.map(x => x[1]), 1), maxS = Math.max(...state.sales.map(x => x[1]), 1);
  const value = P.reduce((a, p) => a + p.price * total(p), 0), want = {};
  state.customers.forEach(c => c.interests.forEach(i => want[i] = (want[i] || 0) + 1));
  const top = Object.entries(want).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([i, n]) => [find(i), n]).filter(x => x[0]);
  $('#view').innerHTML = `
  <div class="hero"><div><h2>Welcome back, Zaid</h2><p>${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Stock value ${money(value)}</p></div><a class="btn" href="#products">Manage products</a></div>
  <div class="grid stats">
    <div class="card stat"><b>${P.length}</b><span>Total products</span></div>
    <div class="card stat"><b>${state.collections.length}</b><span>Collections</span></div>
    <div class="card stat"><b>${stock}</b><span>Available stock</span></div>
    <div class="card stat"><b>${out}</b><span>Out-of-stock products</span></div>
    <div class="card stat"><b>${low}</b><span>Low-stock products</span></div>
  </div>
  <div class="grid g2">
    <div class="card"><h3>Sales overview (₹ thousands)</h3>${bars(state.sales, maxS)}</div>
    <div class="card"><h3>Inventory by category (units)</h3>${bars(byCat, maxC)}</div>
  </div>
  <div class="grid g2">
    <div class="card"><h3>Recently added products</h3><div class="tw"><table>${P.slice(-5).reverse().map(p => `<tr><td><img class="thumb" src="${imgOf(p)}" data-pid="${p.id}" alt="">${esc(p.name)}</td><td>${money(p.price)}</td><td>${badge(total(p))}</td></tr>`).join('')}</table></div></div>
    <div class="card"><h3>Seasonal collection overview</h3>${SEASONS.map(s => { const ps = P.filter(p => p.season === s), st = ps.reduce((a, p) => a + total(p), 0); return `<div style="margin:12px 0"><div class="row"><span>${ICON[s]} ${s} <span class="tag">${state.collections.filter(c => c.season === s).length} collection(s)</span></span><span>${ps.length} products · ${st} units</span></div><div class="prog"><div style="width:${stock ? st / stock * 100 : 0}%"></div></div></div>`; }).join('')}</div>
  </div>
  <div class="grid g2">
    <div class="card"><h3>Recent activity</h3>${(state.log || []).map(l => `<div class="row"><span>${esc(l.m)}</span><small>${l.t}</small></div>`).join('') || '<p class="empty">No activity yet.</p>'}</div>
    <div class="card"><h3>Most requested by customers</h3>${top.map(([p, n]) => `<div class="row"><span><img class="thumb" src="${imgOf(p)}" data-pid="${p.id}" alt="">${esc(p.name)}</span><span class="tag">${n} customer(s)</span></div>`).join('') || '<p class="empty">No customer interest yet.</p>'}</div>
  </div>`;
}

/* ---------- PRODUCTS: search, filters, cards/table ---------- */
let F = { q: '', cat: '', season: '', size: '', color: '', sort: '', view: 'grid' };
function pgProducts() {
  $('#view').innerHTML = `
  <div class="bar"><input id="fq" placeholder="Search products by name…" value="${esc(F.q)}">${sel('fcat', 'All categories', CATS, F.cat)}${sel('fseason', 'All seasons', SEASONS, F.season)}${sel('fsize', 'All sizes', SIZES, F.size)}${sel('fcolor', 'All colors', Object.keys(COLORS), F.color)}
    <select id="fsort"><option value="">Sort by…</option><option value="pa">Price: low to high</option><option value="pd">Price: high to low</option><option value="sa">Stock: low to high</option><option value="sd">Stock: high to low</option></select></div>
  <div class="bar"><button class="btn" id="addP">＋ Add product</button><button class="btn ghost" id="vw">⇄ Cards / Table</button><button class="btn ghost" id="csv">⬇ Export CSV</button><button class="btn ghost" id="prt">🖨 Print report</button><span id="cnt"></span></div>
  <div id="plist"></div>`;
  $('#fsort').value = F.sort;
  ['fq', 'fcat', 'fseason', 'fsize', 'fcolor', 'fsort'].forEach(id => $('#' + id).oninput = e => { F[id.slice(1)] = e.target.value; list(); });
  $('#addP').onclick = () => productForm();
  $('#vw').onclick = () => { F.view = F.view === 'grid' ? 'table' : 'grid'; list(); };
  $('#csv').onclick = exportCSV; $('#prt').onclick = printReport;
  $('#plist').onclick = e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 'edit') productForm(b.dataset.id);
    else if (confirm('Delete this product? This cannot be undone.')) { // confirmation before delete
      state.products = state.products.filter(p => p.id !== b.dataset.id);
      state.collections.forEach(c => c.products = c.products.filter(i => i !== b.dataset.id));
      state.customers.forEach(c => c.interests = c.interests.filter(i => i !== b.dataset.id));
      save(); show(); toast('Product deleted');
    }
  };
  list();
}
function list() {
  const q = F.q.toLowerCase();
  let a = state.products.filter(p => (!q || p.name.toLowerCase().includes(q)) && (!F.cat || p.cat === F.cat) && (!F.season || p.season === F.season) && (!F.size || p.variants.some(v => v.size === F.size)) && (!F.color || p.variants.some(v => v.color === F.color)));
  const key = { pa: p => p.price, pd: p => -p.price, sa: p => total(p), sd: p => -total(p) }[F.sort];
  if (key) a.sort((x, y) => key(x) - key(y));
  $('#cnt').textContent = a.length + ' product(s)';
  const acts = p => `<button class="btn sm ghost" data-act="edit" data-id="${p.id}">Edit</button> <button class="btn sm danger" data-act="del" data-id="${p.id}">Delete</button>`;
  if (!a.length) { $('#plist').innerHTML = '<div class="card empty">No products match. Clear a filter or add a new product.</div>'; return; }
  $('#plist').innerHTML = F.view === 'grid'
    ? `<div class="grid pgrid">${a.map(p => `<div class="card prod"><img src="${imgOf(p)}" data-pid="${p.id}" alt="${esc(p.name)}"><div class="in"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="row"><span class="tag">${p.cat}</span><span class="tag">${ICON[p.season]} ${p.season}</span></div><div class="row"><b>${money(p.price)}</b>${badge(total(p))}</div><div class="row"><small>${total(p)} units · ${p.variants.length} variants</small><span>${acts(p)}</span></div></div></div>`).join('')}</div>`
    : `<div class="card tw"><table><tr><th>Product</th><th>Category</th><th>Season</th><th>Sizes</th><th>Colors</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>${a.map(p => `<tr><td><img class="thumb" src="${imgOf(p)}" data-pid="${p.id}" alt="">${esc(p.name)}</td><td>${p.cat}</td><td>${p.season}</td><td>${[...new Set(p.variants.map(v => v.size))].join(', ')}</td><td>${[...new Set(p.variants.map(v => v.color))].map(sw).join('<br>')}</td><td>${money(p.price)}</td><td>${total(p)}</td><td>${badge(total(p))}</td><td>${acts(p)}</td></tr>`).join('')}</table></div>`;
}

/* Add / Edit product form (includes variant rows: size, color, stock) */
const vrow = v => `<div class="vrow"><select name="vs">${opts(SIZES, v.size)}</select><input name="vc" list="clist" placeholder="Color" value="${esc(v.color)}"><input name="vq" type="number" min="0" placeholder="Stock" value="${v.stock}"><button type="button" class="btn sm danger rm">✕</button></div>`;
function productForm(id) {
  const p = id ? find(id) : { name: '', desc: '', cat: CATS[0], season: SEASONS[0], price: '', img: '', variants: [{ size: 'M', color: 'Black', stock: 10 }] };
  let img = p.img;
  modal(id ? 'Edit product' : 'Add new product', `
    <label>Product name *</label><input name="name" value="${esc(p.name)}" placeholder="e.g. Silk Wrap Dress">
    <label>Description</label><textarea name="desc" rows="2">${esc(p.desc)}</textarea>
    <div class="f2"><div><label>Category</label><select name="cat">${opts(CATS, p.cat)}</select></div><div><label>Season</label><select name="season">${opts(SEASONS, p.season)}</select></div></div>
    <label>Price (₹) *</label><input name="price" type="number" min="1" value="${p.price}">
    <label>Product image (optional)</label><input type="file" id="pimg" accept="image/*"><img class="preview" id="prev" src="${imgOf(p)}" data-pid="${p.id}" alt="">
    <label>Variants (size, color, stock) *</label><datalist id="clist">${Object.keys(COLORS).map(c => `<option>${c}`).join('')}</datalist>
    <div id="vrows">${p.variants.map(vrow).join('')}</div><button type="button" class="btn sm ghost" id="addv">＋ Add variant</button>`,
    f => {
      const fd = new FormData(f), name = fd.get('name').trim(), price = +fd.get('price');
      const vs = fd.getAll('vs').map((s, i) => ({ size: s, color: fd.getAll('vc')[i].trim(), stock: parseInt(fd.getAll('vq')[i], 10) }));
      if (name.length < 2) return toast('Enter a product name (min 2 letters)', 1) && false;
      if (!(price > 0)) return toast('Enter a price greater than 0', 1) && false;
      if (!vs.length || vs.some(v => !v.color || isNaN(v.stock) || v.stock < 0)) return toast('Each variant needs a color and a stock of 0 or more', 1) && false;
      const d = { name, desc: fd.get('desc').trim(), cat: fd.get('cat'), season: fd.get('season'), price, img, variants: vs };
      if (id) Object.assign(p, d); else state.products.push({ id: uid(), ...d });
      save(); show(); toast(id ? 'Product updated' : 'Product added');
    });
  $('#pimg').onchange = e => e.target.files[0] && readImg(e.target.files[0], d => { img = d; $('#prev').src = d; });
  $('#addv').onclick = () => $('#vrows').insertAdjacentHTML('beforeend', vrow({ size: 'M', color: '', stock: 0 }));
  $('#mform').addEventListener('click', e => { if (e.target.classList.contains('rm')) e.target.parentNode.remove(); });
}

/* ---------- CSV export + print ---------- */
function exportCSV() {
  const rows = [['Product', 'Category', 'Season', 'Size', 'Color', 'Stock', 'Price', 'Status']];
  state.products.forEach(p => p.variants.forEach(v => rows.push([p.name, p.cat, p.season, v.size, v.color, v.stock, p.price, status(v.stock)[0]])));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'inventory.csv'; a.click();
  toast('Inventory exported to CSV');
}
function printReport() {
  $('#report').innerHTML = `<h2>${esc(state.settings.name)} - Inventory Report</h2><p>${new Date().toLocaleString()}</p><br><table><tr><th>Product</th><th>Category</th><th>Season</th><th>Price</th><th>Stock</th><th>Status</th></tr>${state.products.map(p => `<tr><td>${esc(p.name)}</td><td>${p.cat}</td><td>${p.season}</td><td>${money(p.price)}</td><td>${total(p)}</td><td>${status(total(p))[0]}</td></tr>`).join('')}</table>`;
  window.print();
}

/* ---------- COLLECTIONS ---------- */
function pgCollections() {
  $('#view').innerHTML = `<div class="bar"><button class="btn" id="addC">＋ Create collection</button></div>` + (state.collections.length ? `<div class="grid g2">${state.collections.map(c => {
    const ps = c.products.map(find).filter(Boolean);
    return `<div class="card prod"><div class="banner ${c.banner ? '' : c.season}" style="${c.banner ? `background-image:url(${c.banner})` : ''}"><span>${ICON[c.season]} ${esc(c.name)}</span></div><div class="in"><p>${esc(c.desc)}</p><div class="row"><span class="tag">${c.season}</span><small>${ps.length} products</small></div><div class="row">${ps.map(p => `<img class="thumb" title="${esc(p.name)}" src="${imgOf(p)}" data-pid="${p.id}" alt="${esc(p.name)}">`).join('') || '<small>No products yet</small>'}</div><div class="row"><span></span><span><button class="btn sm ghost" data-e="${c.id}">Edit / add products</button> <button class="btn sm danger" data-d="${c.id}">Delete</button></span></div></div></div>`;
  }).join('')}</div>` : '<div class="card empty">No collections yet. Create your first one.</div>');
  $('#addC').onclick = () => collForm();
  $('#view').onclick = e => {
    if (e.target.dataset.e) collForm(e.target.dataset.e);
    if (e.target.dataset.d && confirm('Delete this collection? Products will not be deleted.')) { state.collections = state.collections.filter(c => c.id !== e.target.dataset.d); save(); show(); toast('Collection deleted'); }
  };
}
function collForm(id) {
  const c = id ? state.collections.find(x => x.id === id) : { name: '', season: 'Summer', desc: '', banner: '', products: [] };
  let banner = c.banner;
  modal(id ? 'Edit collection' : 'Create collection', `
    <label>Collection name *</label><input name="name" value="${esc(c.name)}" placeholder="e.g. Riviera Summer">
    <label>Season</label><select name="season">${opts(SEASONS, c.season)}</select>
    <label>Description</label><textarea name="desc" rows="2">${esc(c.desc)}</textarea>
    <label>Banner image (optional)</label><input type="file" id="bimg" accept="image/*">
    <label>Add products to this collection</label><div class="checks">${state.products.map(p => `<label><input type="checkbox" name="pp" value="${p.id}" ${c.products.includes(p.id) ? 'checked' : ''}>${esc(p.name)}</label>`).join('')}</div>`,
    f => {
      const fd = new FormData(f), name = fd.get('name').trim();
      if (name.length < 2) return toast('Enter a collection name', 1) && false;
      const d = { name, season: fd.get('season'), desc: fd.get('desc').trim(), banner, products: fd.getAll('pp') };
      if (id) Object.assign(c, d); else state.collections.push({ id: uid(), ...d });
      save(); show(); toast(id ? 'Collection updated' : 'Collection created');
    });
  $('#bimg').onchange = e => e.target.files[0] && readImg(e.target.files[0], d => banner = d);
}

/* ---------- VARIANTS: stock per size + color ---------- */
let VP = '';
function pgVariants() {
  if (!find(VP)) VP = state.products[0]?.id;
  const p = find(VP);
  if (!p) { $('#view').innerHTML = '<div class="card empty">Add a product first to manage its variants.</div>'; return; }
  const colors = [...new Set(p.variants.map(v => v.color))];
  $('#view').innerHTML = `
  <div class="bar"><select id="vpick">${state.products.map(x => `<option value="${x.id}" ${x.id === VP ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
  <div class="grid g2"><div class="card tw"><h3>Stock matrix (color × size)</h3><table><tr><th></th>${SIZES.map(s => `<th>${s}</th>`).join('')}</tr>${colors.map(c => `<tr><td>${sw(c)}</td>${SIZES.map(s => { const v = p.variants.find(x => x.color === c && x.size === s); return `<td>${v ? v.stock : '–'}</td>`; }).join('')}</tr>`).join('')}</table></div>
  <div class="card"><h3>Add a variant</h3><form id="vf" novalidate><div class="f2"><div><label>Size</label><select name="s">${opts(SIZES)}</select></div><div><label>Color</label><input name="c" list="clist" placeholder="e.g. Navy"></div></div><datalist id="clist">${Object.keys(COLORS).map(c => `<option>${c}`).join('')}</datalist><label>Stock quantity</label><input name="q" type="number" min="0" value="5"><div class="acts"><button class="btn">＋ Add variant</button></div></form></div></div>
  <div class="card tw"><h3>${esc(p.name)} - variants</h3><table><tr><th>Size</th><th>Color</th><th>Stock</th><th>Status</th><th></th></tr>${p.variants.map((v, i) => `<tr data-i="${i}"><td>${v.size}</td><td>${sw(v.color)}</td><td><input type="number" min="0" value="${v.stock}"></td><td>${badge(v.stock)}</td><td><button class="btn sm" data-u>Update</button> <button class="btn sm danger" data-x>Delete</button></td></tr>`).join('')}</table></div>`;
  $('#vpick').onchange = e => { VP = e.target.value; show(); };
  $('#vf').onsubmit = e => {
    e.preventDefault(); const f = e.target, color = f.c.value.trim(), q = parseInt(f.q.value, 10);
    if (!color || isNaN(q) || q < 0) return toast('Enter a color and a stock of 0 or more', 1);
    const dup = p.variants.find(v => v.size === f.s.value && v.color.toLowerCase() === color.toLowerCase());
    if (dup) return toast('That size and color already exists. Update its stock below.', 1);
    p.variants.push({ size: f.s.value, color, stock: q }); save(); show(); toast('Variant added');
  };
  $('#view').onclick = e => stockClick(e, p);
}
/* Shared handler for "Update" / "Delete" buttons in variant rows */
function stockClick(e, p) {
  const tr = e.target.closest('tr[data-i]'); if (!tr) return;
  const v = p.variants[tr.dataset.i];
  if (e.target.hasAttribute('data-u')) {
    const n = parseInt($('input', tr).value, 10);
    if (isNaN(n) || n < 0) return toast('Stock must be 0 or more', 1);
    v.stock = n; save(); show(); toast('Stock updated');
  } else if (e.target.hasAttribute('data-x') && confirm('Delete this variant?')) {
    if (p.variants.length === 1) return toast('A product needs at least one variant', 1);
    p.variants.splice(tr.dataset.i, 1); save(); show(); toast('Variant deleted');
  }
}

/* ---------- INVENTORY ---------- */
let IF = '';
function pgInventory() {
  const rows = []; state.products.forEach(p => p.variants.forEach((v, i) => rows.push({ p, v, i })));
  const cnt = k => rows.filter(r => status(r.v.stock)[1] === k).length;
  const shown = rows.filter(r => !IF || status(r.v.stock)[1] === IF);
  $('#view').innerHTML = `
  <div class="grid stats"><div class="card stat"><b>${cnt('ok')}</b><span>In stock variants</span></div><div class="card stat"><b>${cnt('low')}</b><span>Low-stock alerts (≤ ${thr()})</span></div><div class="card stat"><b>${cnt('out')}</b><span>Out-of-stock variants</span></div></div>
  <div class="bar"><select id="ist"><option value="">All statuses</option><option value="ok" ${IF === 'ok' ? 'selected' : ''}>In stock</option><option value="low" ${IF === 'low' ? 'selected' : ''}>Low stock</option><option value="out" ${IF === 'out' ? 'selected' : ''}>Out of stock</option></select><button class="btn ghost" id="csv">⬇ Export CSV</button><button class="btn ghost" id="prt">🖨 Print report</button></div>
  <div class="card tw"><table><tr><th>Product</th><th>Size</th><th>Color</th><th>Stock</th><th>Status</th><th></th></tr>${shown.map(r => `<tr data-p="${r.p.id}" data-i="${r.i}"><td><img class="thumb" src="${imgOf(r.p)}" data-pid="${r.p.id}" alt="">${esc(r.p.name)}</td><td>${r.v.size}</td><td>${sw(r.v.color)}</td><td><input type="number" min="0" value="${r.v.stock}"></td><td>${badge(r.v.stock)}</td><td><button class="btn sm" data-u>Update stock</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty">Nothing in this status.</td></tr>'}</table></div>`;
  $('#ist').onchange = e => { IF = e.target.value; show(); };
  $('#csv').onclick = exportCSV; $('#prt').onclick = printReport;
  $('#view').onclick = e => { const tr = e.target.closest('tr[data-p]'); if (tr) stockClick(e, find(tr.dataset.p)); };
}

/* ---------- CUSTOMER INTEREST ---------- */
function pgCustomers() {
  $('#view').innerHTML = `<div class="bar"><button class="btn" id="addU">＋ Add customer interest</button></div>` + (state.customers.length ? `<div class="card tw"><table><tr><th>Customer</th><th>Contact</th><th>Interested products</th><th>Note</th><th>Date</th><th></th></tr>${state.customers.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.phone)}<br><small>${esc(c.email)}</small></td><td>${c.interests.map(find).filter(Boolean).map(p => `<span class="tag">${esc(p.name)}</span>`).join('') || '-'}</td><td>${esc(c.note)}</td><td>${c.date}</td><td><button class="btn sm ghost" data-e="${c.id}">Edit</button> <button class="btn sm danger" data-d="${c.id}">Delete</button></td></tr>`).join('')}</table></div>` : '<div class="card empty">No customer interests recorded yet.</div>');
  $('#addU').onclick = () => custForm();
  $('#view').onclick = e => {
    if (e.target.dataset.e) custForm(e.target.dataset.e);
    if (e.target.dataset.d && confirm('Delete this customer record?')) { state.customers = state.customers.filter(c => c.id !== e.target.dataset.d); save(); show(); toast('Customer deleted'); }
  };
}
function custForm(id) {
  const c = id ? state.customers.find(x => x.id === id) : { name: '', phone: '', email: '', interests: [], note: '' };
  modal(id ? 'Edit customer' : 'Add customer interest', `
    <label>Customer name *</label><input name="name" value="${esc(c.name)}">
    <div class="f2"><div><label>Phone (10 digits) *</label><input name="phone" value="${esc(c.phone)}"></div><div><label>Email</label><input name="email" value="${esc(c.email)}"></div></div>
    <label>Interested products</label><div class="checks">${state.products.map(p => `<label><input type="checkbox" name="pp" value="${p.id}" ${c.interests.includes(p.id) ? 'checked' : ''}>${esc(p.name)}</label>`).join('')}</div>
    <label>Note</label><textarea name="note" rows="2">${esc(c.note)}</textarea>`,
    f => {
      const fd = new FormData(f), name = fd.get('name').trim(), phone = fd.get('phone').trim(), email = fd.get('email').trim();
      if (name.length < 2) return toast('Enter the customer name', 1) && false;
      if (!/^\d{10}$/.test(phone)) return toast('Phone must be exactly 10 digits', 1) && false;
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return toast('Enter a valid email address', 1) && false;
      if (!fd.getAll('pp').length) return toast('Select at least one interested product', 1) && false;
      const d = { name, phone, email, interests: fd.getAll('pp'), note: fd.get('note').trim() };
      if (id) Object.assign(c, d); else state.customers.push({ id: uid(), date: new Date().toLocaleDateString(), ...d });
      save(); show(); toast(id ? 'Customer updated' : 'Customer interest saved');
    });
}

/* ---------- SETTINGS ---------- */
function pgSettings() {
  const s = state.settings; let logo = s.logo;
  $('#view').innerHTML = `<div class="card" style="max-width:640px"><form id="sf" novalidate>
    <h3>Boutique</h3><label>Boutique name *</label><input name="name" value="${esc(s.name)}">
    <label>Logo (optional image)</label><input type="file" id="limg" accept="image/*">
    <h3 style="margin-top:22px">Theme</h3><label>Appearance</label><select name="theme"><option value="light" ${s.theme === 'light' ? 'selected' : ''}>Light (cream)</option><option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Dark</option></select>
    <h3 style="margin-top:22px">Notifications</h3>
    <label style="display:flex;gap:8px;color:var(--ink)"><input type="checkbox" name="alerts" style="width:auto" ${s.alerts ? 'checked' : ''}>Show low-stock alerts</label>
    <label style="display:flex;gap:8px;color:var(--ink)"><input type="checkbox" name="email" style="width:auto" ${s.email ? 'checked' : ''}>Email me daily stock summary</label>
    <label>Low-stock threshold (units)</label><input name="threshold" type="number" min="1" value="${s.threshold}">
    <div class="acts"><button type="button" class="btn danger" id="reset">Reset demo data</button><button class="btn">Save settings</button></div></form></div>`;
  $('#limg').onchange = e => e.target.files[0] && readImg(e.target.files[0], d => logo = d);
  $('#sf').onsubmit = e => {
    e.preventDefault(); const f = e.target, n = parseInt(f.threshold.value, 10);
    if (f.name.value.trim().length < 2) return toast('Enter a boutique name', 1);
    if (isNaN(n) || n < 1) return toast('Threshold must be 1 or more', 1);
    Object.assign(s, { name: f.name.value.trim(), logo, theme: f.theme.value, alerts: f.alerts.checked, email: f.email.checked, threshold: n });
    save(); show(); toast('Settings saved');
  };
  $('#reset').onclick = () => { if (confirm('Reset everything to the sample data?')) { state = seed(); save(); show(); toast('Demo data restored'); } };
}

show(); // start the app
