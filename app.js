/* Cuteness Overload — single-page store
   No build step, no dependencies. Bag + wishlist persist in localStorage. */
(function () {
  'use strict';

  /* ---------- Product data ---------- */
  const PRODUCT = {
    id: 'CO-ONESIE-01',
    name: 'Cosy Bear Fleece Onesie, 0–2yrs',
    price: 45,
    colours: [
      { key: 'dusty-pink', name: 'Dusty Pink', hex: '#e8c4c4', ink: '#c99a9a', lining: '#fbeeee' },
      { key: 'milk',       name: 'Milk',       hex: '#f3ede4', ink: '#d9cfc0', lining: '#f7e6e6' },
      { key: 'dark-navy',  name: 'Dark Navy',  hex: '#2c3550', ink: '#1c2338', lining: '#dfe4f0' }
    ]
  };

  const MATCHING = [
    { name: 'Cable-Knit Romper with Bear Ears', price: 38, kind: 'romper', colours: ['#f3ede4', '#e8c4c4'] },
    { name: 'Organic Cotton Cord Dungaree Set', price: 42, kind: 'dungarees', colours: ['#c9b39a', '#2c3550'] },
    { name: 'Breton Stripe Top & Joggers Set', price: 34, kind: 'set', colours: ['#2c3550', '#e8c4c4'] },
    { name: 'Teddy Fleece Bear Hat', price: 16, kind: 'hat', colours: ['#e8c4c4', '#f3ede4', '#2c3550'] }
  ];

  const ALSO_LIKE = [
    { name: 'Cosy Bear Fleece Onesie, Milk', price: 45, kind: 'onesie', colours: ['#f3ede4'], tag: 'New' },
    { name: 'Cosy Bear Fleece Onesie, Dark Navy', price: 45, kind: 'onesie', colours: ['#2c3550'], tag: 'New' },
    { name: 'Meadow Print Sleepsuit', price: 24, kind: 'onesie', colours: ['#fbeeee', '#dfe4f0'] },
    { name: 'Teddy Fleece Booties', price: 14, kind: 'booties', colours: ['#e8c4c4', '#f3ede4'] },
    { name: 'Cellular Cot Blanket', price: 32, kind: 'blanket', colours: ['#f3ede4', '#e8c4c4', '#c9d6c3'] },
    { name: 'Pointelle Cardigan', price: 30, kind: 'cardigan', colours: ['#f3ede4', '#c9d6c3'] },
    { name: 'Bear Comforter', price: 18, kind: 'bear', colours: ['#d9b48f'] },
    { name: 'Ribbed Cotton Leggings', price: 16, kind: 'leggings', colours: ['#e8c4c4', '#2c3550', '#c9b39a'] },
    { name: 'Quilted Pram Suit', price: 58, kind: 'onesie', colours: ['#c9d6c3', '#f3ede4'] },
    { name: 'Knitted Bonnet', price: 15, kind: 'hat', colours: ['#f3ede4', '#e8c4c4'] },
    { name: 'Muslin Squares, Set of 3', price: 20, kind: 'blanket', colours: ['#fbeeee', '#f3ede4', '#dfe4f0'] },
    { name: 'Velour Sleepsuit', price: 26, kind: 'onesie', colours: ['#c9b39a', '#e8c4c4'] }
  ];

  /* ---------- SVG art ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const BG = '#f7f4f1';
  let seq = 0;
  const uid = () => 'p' + (++seq); // unique pattern ids: all SVGs share one document

  function svgWrap(inner, bg) {
    return `<svg xmlns="${NS}" viewBox="0 0 400 500" role="img" aria-hidden="true">
      <rect width="400" height="500" fill="${bg || BG}"/>${inner}</svg>`;
  }
  function darker(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))));
    const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }
  function fleeceTexture(id, base) {
    return `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="${base}"/>
      <circle cx="4" cy="4" r="2.2" fill="${darker(base, 0.06)}"/>
      <circle cx="11" cy="10" r="2.2" fill="${darker(base, 0.04)}"/>
    </pattern>`;
  }
  function floral(id, lining) {
    return `<pattern id="${id}" width="26" height="26" patternUnits="userSpaceOnUse">
      <rect width="26" height="26" fill="${lining}"/>
      <circle cx="8" cy="8" r="3" fill="#e2a3a3"/><circle cx="8" cy="8" r="1.2" fill="#f6dd8f"/>
      <circle cx="20" cy="19" r="2.2" fill="#a9c1a0"/>
    </pattern>`;
  }

  /* Front-facing hooded onesie */
  function onesieFront(c, opts) {
    const o = Object.assign({ zip: true, star: true, ears: true, fl: null }, opts || {});
    const s = darker(c.hex, 0.18);
    const fl = o.fl || uid();
    return `
      ${o.fl ? '' : `<defs>${fleeceTexture(fl, c.hex)}</defs>`}
      <!-- ears -->
      ${o.ears ? `<circle cx="150" cy="92" r="24" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
      <circle cx="250" cy="92" r="24" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
      <circle cx="150" cy="92" r="11" fill="${c.lining}"/><circle cx="250" cy="92" r="11" fill="${c.lining}"/>` : ''}
      <!-- hood -->
      <path d="M130 140 Q130 80 200 78 Q270 80 270 140 L270 175 L130 175 Z" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
      <ellipse cx="200" cy="150" rx="44" ry="38" fill="#fbe9dd" stroke="${s}" stroke-width="1"/>
      <!-- body + arms + legs -->
      <path d="M140 178 L260 178 Q290 180 300 205 L340 280 Q345 300 325 306 L300 292 L300 350 L305 420 Q306 445 285 448 L262 448 Q244 446 244 425 L238 350 L200 340 L162 350 L156 425 Q156 446 138 448 L115 448 Q94 445 95 420 L100 350 L100 292 L75 306 Q55 300 60 280 L100 205 Q110 180 140 178 Z"
            fill="url(#${fl})" stroke="${s}" stroke-width="2" stroke-linejoin="round"/>
      <!-- feet -->
      <path d="M115 448 L138 448 Q150 466 135 472 L112 470 Q100 464 115 448 Z" fill="${darker(c.hex, 0.1)}" stroke="${s}" stroke-width="1.5"/>
      <path d="M262 448 L285 448 Q300 464 288 470 L265 472 Q250 466 262 448 Z" fill="${darker(c.hex, 0.1)}" stroke="${s}" stroke-width="1.5"/>
      <!-- cuffs -->
      <rect x="292" y="278" width="40" height="18" rx="6" transform="rotate(30 312 287)" fill="${darker(c.hex, 0.1)}" stroke="${s}" stroke-width="1.5"/>
      <rect x="68" y="278" width="40" height="18" rx="6" transform="rotate(-30 88 287)" fill="${darker(c.hex, 0.1)}" stroke="${s}" stroke-width="1.5"/>
      ${o.zip ? `<line x1="200" y1="182" x2="200" y2="340" stroke="${s}" stroke-width="3" stroke-dasharray="4 3"/>
      <rect x="194" y="186" width="12" height="16" rx="3" fill="${s}"/>` : ''}
      ${o.star ? `<polygon points="238,214 241,222 249,222 243,227 245,235 238,230 231,235 233,227 227,222 235,222" fill="#f6dd8f" stroke="${s}" stroke-width="1"/>` : ''}`;
  }

  /* Back view: no zip, hood with ears, small label */
  function onesieBack(c) {
    const fl = uid();
    return `<defs>${fleeceTexture(fl, c.hex)}</defs>` + onesieFront(c, { zip: false, star: false, fl }).replace(
      /<ellipse[^>]*\/>/,
      `<path d="M150 150 Q200 128 250 150 L250 178 L150 178 Z" fill="url(#${fl})"/>`
    ) + `<rect x="188" y="196" width="24" height="12" fill="${c.lining}" stroke="${darker(c.hex, .3)}" stroke-width="1"/>`;
  }

  /* Detail: hood with ears close up, lining and zip pull */
  function onesieDetail(c) {
    const s = darker(c.hex, 0.18);
    const fl = uid(), fo = uid();
    return `
      <defs>${fleeceTexture(fl, c.hex)}${floral(fo, c.lining)}</defs>
      <circle cx="95" cy="150" r="56" fill="url(#${fl})" stroke="${s}" stroke-width="3"/>
      <circle cx="305" cy="150" r="56" fill="url(#${fl})" stroke="${s}" stroke-width="3"/>
      <circle cx="95" cy="150" r="26" fill="url(#${fo})"/><circle cx="305" cy="150" r="26" fill="url(#${fo})"/>
      <path d="M60 260 Q60 120 200 110 Q340 120 340 260 L340 500 L60 500 Z" fill="url(#${fl})" stroke="${s}" stroke-width="3"/>
      <path d="M110 275 Q110 175 200 170 Q290 175 290 275 L290 500 L110 500 Z" fill="url(#${fo})" stroke="${s}" stroke-width="2"/>
      <line x1="200" y1="300" x2="200" y2="500" stroke="${s}" stroke-width="5" stroke-dasharray="7 5"/>
      <rect x="188" y="305" width="24" height="34" rx="6" fill="${s}"/>
      <rect x="196" y="335" width="8" height="26" rx="3" fill="${s}"/>
      <polygon points="262,380 268,396 285,396 272,406 276,422 262,412 248,422 252,406 239,396 256,396" fill="#f6dd8f" stroke="${s}" stroke-width="2"/>`;
  }

  /* Flat-lay: onesie unzipped showing lining, on linen */
  function onesieFlat(c) {
    const s = darker(c.hex, 0.18);
    const fl = uid(), fo = uid();
    return `
      <defs>${fleeceTexture(fl, c.hex)}${floral(fo, c.lining)}</defs>
      <rect width="400" height="500" fill="#efe9e2"/>
      <g transform="rotate(-8 200 260)">
        ${onesieFront(c, { zip: false, star: true, fl })}
        <path d="M170 182 L200 182 L200 340 L162 350 Z" fill="url(#${fo})" stroke="${s}" stroke-width="1.5"/>
        <path d="M230 182 L200 182 L200 340 L238 350 Z" fill="url(#${fo})" stroke="${s}" stroke-width="1.5"/>
      </g>`;
  }

  function galleryImages(c) {
    return [
      { label: 'Front view', svg: svgWrap(onesieFront(c)) },
      { label: 'Back view', svg: svgWrap(onesieBack(c)) },
      { label: 'Hood and zip detail', svg: svgWrap(onesieDetail(c)) },
      { label: 'Flat lay showing lining', svg: svgWrap(onesieFlat(c), '#efe9e2') }
    ];
  }

  /* Small illustrations for shelf cards */
  function cardArt(kind, hex) {
    const c = { hex: hex, lining: '#fbeeee' };
    const s = darker(hex, 0.18);
    const fl = uid();
    let inner = '';
    switch (kind) {
      case 'onesie': inner = onesieFront(c); break;
      case 'romper':
        inner = `<defs>${fleeceTexture(fl, hex)}</defs>
          <circle cx="150" cy="120" r="20" fill="url(#${fl})" stroke="${s}" stroke-width="2"/><circle cx="250" cy="120" r="20" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
          <path d="M130 160 Q130 105 200 102 Q270 105 270 160 L270 190 L130 190 Z" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
          <ellipse cx="200" cy="168" rx="40" ry="34" fill="#fbe9dd" stroke="${s}"/>
          <path d="M140 192 L260 192 Q290 195 300 220 L335 290 Q340 305 322 310 L300 296 L300 380 L250 380 L240 340 L200 340 L160 340 L150 380 L100 380 L100 296 L78 310 Q60 305 65 290 L100 220 Q110 195 140 192 Z" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
          <line x1="140" y1="230" x2="260" y2="230" stroke="${s}" stroke-width="1.5"/><line x1="140" y1="260" x2="260" y2="260" stroke="${s}" stroke-width="1.5"/><line x1="140" y1="290" x2="260" y2="290" stroke="${s}" stroke-width="1.5"/>`;
        break;
      case 'dungarees':
        inner = `<rect x="170" y="110" width="60" height="34" rx="6" fill="${hex}" stroke="${s}" stroke-width="2"/>
          <rect x="150" y="140" width="22" height="120" fill="${hex}" stroke="${s}" stroke-width="2"/><rect x="228" y="140" width="22" height="120" fill="${hex}" stroke="${s}" stroke-width="2"/>
          <path d="M120 200 L280 200 L285 400 L215 400 L200 300 L185 400 L115 400 Z" fill="${hex}" stroke="${s}" stroke-width="2"/>
          <rect x="175" y="215" width="50" height="40" rx="4" fill="none" stroke="${s}" stroke-width="2"/>
          <circle cx="160" cy="205" r="6" fill="#f6dd8f" stroke="${s}"/><circle cx="240" cy="205" r="6" fill="#f6dd8f" stroke="${s}"/>`;
        break;
      case 'set':
        inner = `<path d="M110 130 L160 110 Q200 130 240 110 L290 130 L310 190 L270 200 L270 270 L130 270 L130 200 L90 190 Z" fill="#fff" stroke="${s}" stroke-width="2"/>
          ${[150, 175, 200, 225, 250].map(y => `<line x1="130" y1="${y}" x2="270" y2="${y}" stroke="${hex}" stroke-width="9"/>`).join('')}
          <path d="M135 300 L265 300 L275 430 L215 430 L200 350 L185 430 L125 430 Z" fill="${hex}" stroke="${s}" stroke-width="2"/>`;
        break;
      case 'hat':
        inner = `<defs>${fleeceTexture(fl, hex)}</defs>
          <circle cx="130" cy="185" r="34" fill="url(#${fl})" stroke="${s}" stroke-width="2"/><circle cx="270" cy="185" r="34" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
          <circle cx="130" cy="185" r="14" fill="${c.lining}"/><circle cx="270" cy="185" r="14" fill="${c.lining}"/>
          <path d="M100 300 Q100 190 200 185 Q300 190 300 300 L300 330 L100 330 Z" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
          <rect x="95" y="320" width="210" height="28" rx="6" fill="${darker(hex, .1)}" stroke="${s}" stroke-width="2"/>`;
        break;
      case 'booties':
        inner = `<defs>${fleeceTexture(fl, hex)}</defs>
          <path d="M100 210 L170 210 L170 290 Q210 300 210 330 L100 330 Z" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
          <path d="M230 210 L300 210 L300 330 L190 330 Q190 300 230 290 Z" fill="url(#${fl})" stroke="${s}" stroke-width="2"/>
          <rect x="96" y="196" width="80" height="22" rx="6" fill="${darker(hex, .1)}" stroke="${s}" stroke-width="1.5"/>
          <rect x="226" y="196" width="80" height="22" rx="6" fill="${darker(hex, .1)}" stroke="${s}" stroke-width="1.5"/>`;
        break;
      case 'blanket':
        inner = `<rect x="80" y="120" width="240" height="260" rx="8" fill="${hex}" stroke="${s}" stroke-width="2"/>
          ${[150, 180, 210, 240, 270, 300, 330, 360].map(y => `<line x1="90" y1="${y}" x2="310" y2="${y}" stroke="${darker(hex, .08)}" stroke-width="2"/>`).join('')}
          ${[110, 140, 170, 200, 230, 260, 290].map(x => `<line x1="${x}" y1="130" x2="${x}" y2="370" stroke="${darker(hex, .08)}" stroke-width="2"/>`).join('')}`;
        break;
      case 'cardigan':
        inner = `<path d="M110 150 L160 125 L200 150 L240 125 L290 150 L320 220 L280 232 L280 330 L120 330 L120 232 L80 220 Z" fill="${hex}" stroke="${s}" stroke-width="2"/>
          <line x1="200" y1="150" x2="200" y2="330" stroke="${s}" stroke-width="2"/>
          ${[190, 230, 270, 305].map(y => `<circle cx="200" cy="${y}" r="5" fill="#fff" stroke="${s}"/>`).join('')}
          ${[175, 200, 225, 250, 275, 300].map(y => `<line x1="128" y1="${y}" x2="192" y2="${y}" stroke="${darker(hex, .1)}" stroke-width="1.5" stroke-dasharray="3 5"/><line x1="208" y1="${y}" x2="272" y2="${y}" stroke="${darker(hex, .1)}" stroke-width="1.5" stroke-dasharray="3 5"/>`).join('')}`;
        break;
      case 'bear':
        inner = `<circle cx="140" cy="150" r="30" fill="${hex}" stroke="${s}" stroke-width="2"/><circle cx="260" cy="150" r="30" fill="${hex}" stroke="${s}" stroke-width="2"/>
          <circle cx="200" cy="200" r="80" fill="${hex}" stroke="${s}" stroke-width="2"/>
          <ellipse cx="200" cy="225" rx="30" ry="22" fill="${darker(hex, -0.3)}" stroke="${s}"/>
          <circle cx="172" cy="185" r="6" fill="${s}"/><circle cx="228" cy="185" r="6" fill="${s}"/><ellipse cx="200" cy="218" rx="9" ry="6" fill="${s}"/>
          <path d="M120 280 Q200 250 280 280 L300 360 Q200 400 100 360 Z" fill="${hex}" stroke="${s}" stroke-width="2"/>`;
        break;
      case 'leggings':
        inner = `<path d="M130 120 L270 120 L280 240 L275 400 L225 400 L205 240 L195 240 L175 400 L125 400 L120 240 Z" fill="${hex}" stroke="${s}" stroke-width="2"/>
          <rect x="126" y="112" width="148" height="20" rx="6" fill="${darker(hex, .1)}" stroke="${s}" stroke-width="1.5"/>
          ${[150, 170, 190, 210, 230, 250].map(x => `<line x1="${x}" y1="135" x2="${x}" y2="235" stroke="${darker(hex, .08)}" stroke-width="1.5"/>`).join('')}`;
        break;
      default: inner = onesieFront(c);
    }
    return svgWrap(inner);
  }

  /* ---------- State ---------- */
  const $ = (sel) => document.querySelector(sel);
  const money = (n) => '£' + n.toFixed(2);
  const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch (e) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } };

  let colour = PRODUCT.colours[0];
  let images = galleryImages(colour);
  let imgIndex = 0;
  let bag = load('co_bag', []);
  let wishlist = load('co_wishlist', []);

  /* ---------- Gallery ---------- */
  const mainImage = $('#mainImage');
  const thumbs = $('#thumbs');

  function renderGallery() {
    mainImage.innerHTML = images[imgIndex].svg;
    mainImage.setAttribute('aria-label', images[imgIndex].label + ' — ' + colour.name);
    thumbs.innerHTML = images.map((im, i) =>
      `<button type="button" class="thumb" role="tab" aria-selected="${i === imgIndex}" aria-label="${im.label}" data-i="${i}">${im.svg}</button>`
    ).join('');
  }
  thumbs.addEventListener('click', (e) => {
    const b = e.target.closest('.thumb');
    if (!b) return;
    imgIndex = +b.dataset.i;
    renderGallery();
  });
  document.querySelectorAll('.gallery__arrow').forEach(a => a.addEventListener('click', () => {
    imgIndex = (imgIndex + +a.dataset.dir + images.length) % images.length;
    renderGallery();
  }));
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input,select,textarea')) return;
    if (e.key === 'ArrowLeft') { imgIndex = (imgIndex - 1 + images.length) % images.length; renderGallery(); }
    if (e.key === 'ArrowRight') { imgIndex = (imgIndex + 1) % images.length; renderGallery(); }
  });

  /* ---------- Swatches ---------- */
  const swatches = $('#swatches');
  function renderSwatches() {
    swatches.innerHTML = PRODUCT.colours.map(c =>
      `<button type="button" class="swatch" role="radio" aria-checked="${c.key === colour.key}" aria-label="${c.name}" title="${c.name}" data-key="${c.key}"><span style="background:${c.hex}"></span></button>`
    ).join('');
    $('#colourName').textContent = colour.name;
    updateSaveBtn();
  }
  swatches.addEventListener('click', (e) => {
    const b = e.target.closest('.swatch');
    if (!b) return;
    colour = PRODUCT.colours.find(c => c.key === b.dataset.key);
    images = galleryImages(colour);
    renderSwatches();
    renderGallery();
    history.replaceState(null, '', '?swatch=' + encodeURIComponent(colour.name));
  });
  // Honour ?swatch=... in the URL, mirroring the reference store
  const params = new URLSearchParams(location.search);
  if (params.get('swatch')) {
    const found = PRODUCT.colours.find(c => c.name.toLowerCase() === params.get('swatch').toLowerCase());
    if (found) { colour = found; images = galleryImages(colour); }
  }

  /* ---------- Quantity ---------- */
  const qty = $('#qty');
  document.querySelectorAll('.qty button').forEach(b => b.addEventListener('click', () => {
    qty.value = Math.min(10, Math.max(1, (+qty.value || 1) + +b.dataset.step));
  }));
  qty.addEventListener('change', () => { qty.value = Math.min(10, Math.max(1, +qty.value || 1)); });

  /* ---------- Bag ---------- */
  const drawer = $('#drawer'), backdrop = $('#drawerBackdrop');
  function openDrawer() {
    renderDrawer();
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true; document.body.style.overflow = '';
  }
  function renderBagCount() {
    const n = bag.reduce((s, l) => s + l.qty, 0);
    const el = $('#bagCount'); el.textContent = n; el.hidden = n === 0;
  }
  function renderDrawer() {
    const items = $('#drawerItems');
    if (!bag.length) {
      items.innerHTML = '<p class="drawer__empty">Your bag is empty.</p>';
    } else {
      items.innerHTML = bag.map((l, i) => {
        const c = PRODUCT.colours.find(x => x.key === l.colour);
        return `<div class="line">
          <div class="line__img">${svgWrap(onesieFront(c))}</div>
          <div>
            <p class="line__name">${l.name}</p>
            <p class="line__meta">${c.name} · ${l.size} · Qty ${l.qty}</p>
            <button type="button" class="line__remove" data-i="${i}">Remove</button>
          </div>
          <div class="line__price">${money(l.price * l.qty)}</div>
        </div>`;
      }).join('');
    }
    $('#drawerTotal').textContent = money(bag.reduce((s, l) => s + l.price * l.qty, 0));
    renderBagCount();
  }
  $('#drawerItems').addEventListener('click', (e) => {
    const b = e.target.closest('.line__remove');
    if (!b) return;
    bag.splice(+b.dataset.i, 1); save('co_bag', bag); renderDrawer();
  });
  $('#addToBag').addEventListener('click', () => {
    const size = $('#size').value;
    const err = $('#formError');
    if (!size) { err.hidden = false; $('#size').focus(); return; }
    err.hidden = true;
    const n = Math.min(10, Math.max(1, +qty.value || 1));
    const existing = bag.find(l => l.id === PRODUCT.id && l.colour === colour.key && l.size === size);
    if (existing) existing.qty = Math.min(10, existing.qty + n);
    else bag.push({ id: PRODUCT.id, name: PRODUCT.name, price: PRODUCT.price, colour: colour.key, size, qty: n });
    save('co_bag', bag);
    openDrawer();
    toast('Added to your bag');
  });
  $('#bagBtn').addEventListener('click', openDrawer);
  $('#closeDrawer').addEventListener('click', closeDrawer);
  $('#closeDrawer2').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
  $('#checkoutBtn').addEventListener('click', () => {
    if (!bag.length) { toast('Your bag is empty'); return; }
    toast('Checkout is not connected yet — this is a demo store');
  });

  /* ---------- Wishlist ---------- */
  function wishKey() { return PRODUCT.id + ':' + colour.key; }
  function updateSaveBtn() {
    const on = wishlist.includes(wishKey());
    $('#saveBtn').setAttribute('aria-pressed', on);
    const el = $('#wishlistCount'); el.textContent = wishlist.length; el.hidden = wishlist.length === 0;
  }
  $('#saveBtn').addEventListener('click', () => {
    const k = wishKey();
    if (wishlist.includes(k)) { wishlist = wishlist.filter(x => x !== k); toast('Removed from saved items'); }
    else { wishlist.push(k); toast('Saved for later'); }
    save('co_wishlist', wishlist); updateSaveBtn();
  });
  $('#wishlistBtn').addEventListener('click', () => {
    toast(wishlist.length ? `You have ${wishlist.length} saved item${wishlist.length > 1 ? 's' : ''}` : 'No saved items yet');
  });

  /* ---------- Shelves ---------- */
  function card(p) {
    return `<a class="card" href="#top">
      <div class="card__img">${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}${cardArt(p.kind, p.colours[0])}</div>
      <p class="card__name">${p.name}</p>
      <p class="card__price">${money(p.price)}</p>
      <div class="card__colours">${p.colours.map(h => `<span style="background:${h}"></span>`).join('')}</div>
    </a>`;
  }
  $('#matching').innerHTML = MATCHING.map(card).join('');
  $('#alsoLike').innerHTML = ALSO_LIKE.map(card).join('');

  /* ---------- Newsletter, misc ---------- */
  $('#newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.hidden = true;
    $('#newsletterThanks').hidden = false;
  });
  $('#year').textContent = new Date().getFullYear();

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-visible'), 2200);
  }

  /* ---------- Init ---------- */
  renderSwatches();
  renderGallery();
  renderBagCount();
  updateSaveBtn();
})();
