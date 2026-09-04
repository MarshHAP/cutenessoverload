/* Cuteness Overload theme — vanilla JS, no dependencies. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Money ---------- */
  function formatMoney(cents, format) {
    format = format || (window.theme && window.theme.moneyFormat) || '£{{amount}}';
    var value = '';
    var m = /\{\{\s*(\w+)\s*\}\}/.exec(format);
    var n = (parseInt(cents, 10) || 0) / 100;
    function withDelims(num, precision, thousands, decimal) {
      var parts = num.toFixed(precision).split('.');
      var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return parts[1] ? int + decimal + parts[1] : int;
    }
    switch (m ? m[1] : 'amount') {
      case 'amount_no_decimals': value = withDelims(n, 0, ',', '.'); break;
      case 'amount_with_comma_separator': value = withDelims(n, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = withDelims(n, 0, '.', ','); break;
      case 'amount_with_apostrophe_separator': value = withDelims(n, 2, "'", '.'); break;
      default: value = withDelims(n, 2, ',', '.');
    }
    return format.replace(/\{\{\s*\w+\s*\}\}/, value);
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#Toast'); if (!t) return;
    t.textContent = msg; t.classList.add('is-visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2200);
  }

  /* ---------- Storage ---------- */
  function load(k, fb) { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch (e) { return fb; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- Mobile nav ---------- */
  var menuToggle = $('[data-menu-toggle]'), nav = $('[data-nav]');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open);
    });
  }

  /* ---------- Cart drawer ---------- */
  var drawer = $('[data-cart-drawer]'), backdrop = $('[data-cart-backdrop]');
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true; document.body.style.overflow = '';
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function renderCart(cart) {
    var count = $('[data-cart-count]');
    if (count) { count.textContent = cart.item_count; count.hidden = cart.item_count === 0; }
    var sub = $('[data-cart-subtotal]'); if (sub) sub.textContent = formatMoney(cart.total_price);
    var checkout = $('[data-cart-checkout]'); if (checkout) checkout.disabled = cart.item_count === 0;
    var items = $('[data-cart-items]'); if (!items) return;
    if (!cart.items.length) { items.innerHTML = '<p class="drawer__empty">Your bag is empty.</p>'; return; }
    items.innerHTML = cart.items.map(function (it) {
      var img = it.image ? '<img src="' + it.image.replace(/(\.[a-z]+)(\?.*)?$/i, '_160x$1$2') + '" alt="" loading="lazy">' : '';
      var meta = (it.variant_title ? escapeHtml(it.variant_title) + ' · ' : '') + 'Qty ' + it.quantity;
      return '<div class="line"><div class="line__img">' + img + '</div><div>' +
        '<p class="line__name">' + escapeHtml(it.product_title) + '</p>' +
        '<p class="line__meta">' + meta + '</p>' +
        '<button type="button" class="line__remove" data-cart-remove="' + it.key + '">Remove</button></div>' +
        '<div class="line__price">' + formatMoney(it.final_line_price) + '</div></div>';
    }).join('');
  }
  function fetchCart() {
    return fetch(window.theme.cartUrl + '.js', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(renderCart);
  }
  $$('[data-cart-open]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); fetchCart(); openDrawer(); }); });
  $$('[data-cart-close]').forEach(function (b) { b.addEventListener('click', closeDrawer); });
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cart-remove]'); if (!b) return;
    fetch(window.theme.cartUrl + '/change.js', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: b.getAttribute('data-cart-remove'), quantity: 0 })
    }).then(function (r) { return r.json(); }).then(renderCart);
  });

  /* ---------- Wishlist (local only) ---------- */
  var wishlist = load('co_wishlist', []);
  function renderWishlistCount() {
    var el = $('[data-wishlist-count]'); if (!el) return;
    el.textContent = wishlist.length; el.hidden = wishlist.length === 0;
  }
  var wishBtn = $('[data-wishlist-button]');
  if (wishBtn) wishBtn.addEventListener('click', function () {
    toast(wishlist.length ? 'You have ' + wishlist.length + ' saved item' + (wishlist.length > 1 ? 's' : '') : 'No saved items yet');
  });
  renderWishlistCount();

  /* ---------- Product section ---------- */
  $$('[data-product-section]').forEach(function (section) {
    var product = JSON.parse($('[data-product-json]', section).textContent);
    var config = JSON.parse($('[data-product-config]', section).textContent);
    var form = $('[data-product-form]', section);
    var variantInput = $('[data-variant-id]', section);
    var addBtn = $('[data-add-to-cart]', section);
    var addText = $('[data-add-text]', section);
    var priceEl = $('[data-current-price]', section);
    var compareEl = $('[data-compare-price]', section);
    var errorEl = $('[data-form-error]', section);
    var qty = $('input[name="quantity"]', section);
    var optionCount = product.options.length;
    var selected = [];

    // initial selection from markup
    $$('[data-option-index]', section).forEach(function (field) {
      var idx = +field.getAttribute('data-option-index');
      var checked = $('.swatch[aria-checked="true"]', field);
      var sel = $('select', field);
      selected[idx] = checked ? checked.getAttribute('data-option-value') : (sel ? sel.value : '');
    });
    if (product.variants.length === 1 && optionCount === 1 && product.options[0] === 'Title') {
      selected = [product.variants[0].option1];
    }

    /* Gallery */
    var slides = $$('.gallery__slide', section), thumbs = $$('.thumb', section), current = 0;
    function showSlide(i) {
      if (!slides.length) return;
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, j) { s.hidden = j !== current; });
      thumbs.forEach(function (t, j) { t.setAttribute('aria-selected', j === current); });
    }
    thumbs.forEach(function (t, i) { t.addEventListener('click', function () { showSlide(i); }); });
    var prev = $('[data-gallery-prev]', section), next = $('[data-gallery-next]', section);
    if (prev) prev.addEventListener('click', function () { showSlide(current - 1); });
    if (next) next.addEventListener('click', function () { showSlide(current + 1); });
    document.addEventListener('keydown', function (e) {
      if (e.target.matches('input,select,textarea')) return;
      if (e.key === 'ArrowLeft') showSlide(current - 1);
      if (e.key === 'ArrowRight') showSlide(current + 1);
    });
    function showMedia(mediaId) {
      var i = slides.findIndex(function (s) { return s.getAttribute('data-media-id') === String(mediaId); });
      if (i >= 0) showSlide(i);
    }

    /* Variant resolution */
    function findVariant() {
      for (var i = 0; i < optionCount; i++) if (!selected[i]) return null;
      return product.variants.find(function (v) {
        return v.options.every(function (o, i) { return o === selected[i]; });
      }) || null;
    }
    function variantForPartial() {
      // Best available variant matching whatever has been chosen so far (for price + image)
      return product.variants.find(function (v) {
        return v.options.every(function (o, i) { return !selected[i] || o === selected[i]; });
      }) || null;
    }
    function updateUI() {
      var v = findVariant(), partial = v || variantForPartial();
      variantInput.value = v ? v.id : '';
      if (partial && priceEl) {
        priceEl.textContent = formatMoney(partial.price);
        if (compareEl) {
          if (partial.compare_at_price && partial.compare_at_price > partial.price) { compareEl.hidden = false; compareEl.textContent = formatMoney(partial.compare_at_price); }
          else compareEl.hidden = true;
        }
      }
      if (v) {
        addBtn.disabled = !v.available;
        addText.textContent = v.available ? 'Add to bag' : 'Sold out';
      } else {
        addBtn.disabled = false;
        addText.textContent = 'Add to bag';
      }
      if (partial && partial.featured_media) showMedia(partial.featured_media.id);
      var colourLabel = $('[data-selected-colour]', section);
      if (colourLabel && config.colourIndex >= 0) colourLabel.textContent = selected[config.colourIndex] || '';
      if (config.colourIndex >= 0 && selected[config.colourIndex]) {
        var url = new URL(location.href); url.searchParams.set('swatch', selected[config.colourIndex]); history.replaceState(null, '', url);
      }
      updateSaveBtn();
    }

    $$('.swatch', section).forEach(function (b) {
      b.addEventListener('click', function () {
        var field = b.closest('[data-option-index]'), idx = +field.getAttribute('data-option-index');
        $$('.swatch', field).forEach(function (s) { s.setAttribute('aria-checked', s === b); });
        selected[idx] = b.getAttribute('data-option-value');
        updateUI();
      });
    });
    $$('[data-option-select]', section).forEach(function (sel) {
      sel.addEventListener('change', function () {
        selected[+sel.closest('[data-option-index]').getAttribute('data-option-index')] = sel.value;
        if (errorEl) errorEl.hidden = true;
        updateUI();
      });
    });

    // Preselect colour from ?swatch=
    var swatchParam = new URLSearchParams(location.search).get('swatch');
    if (swatchParam && config.colourIndex >= 0) {
      var match = $$('.swatch', section).find(function (s) { return s.getAttribute('data-option-value').toLowerCase() === swatchParam.toLowerCase(); });
      if (match) match.click();
    }

    /* Quantity */
    $$('[data-qty-step]', section).forEach(function (b) {
      b.addEventListener('click', function () { qty.value = Math.min(10, Math.max(1, (+qty.value || 1) + +b.getAttribute('data-qty-step'))); });
    });

    /* Add to bag */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!variantInput.value) { if (errorEl) errorEl.hidden = false; var s = $('[data-option-select]', section); if (s) s.focus(); return; }
      addBtn.disabled = true;
      fetch(window.theme.cartUrl + '/add.js', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: +variantInput.value, quantity: +qty.value || 1 })
      }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'Could not add to bag'); }); })
        .then(function () { return fetchCart(); })
        .then(function () { openDrawer(); toast('Added to your bag'); })
        .catch(function (err) { toast(err.message); })
        .then(function () { addBtn.disabled = false; });
    });

    /* Wishlist toggle */
    var saveBtn = $('[data-wishlist-toggle]', section);
    function wishKey() { return product.id + ':' + (config.colourIndex >= 0 ? selected[config.colourIndex] || '' : ''); }
    function updateSaveBtn() { if (saveBtn) saveBtn.setAttribute('aria-pressed', wishlist.indexOf(wishKey()) >= 0); }
    if (saveBtn) saveBtn.addEventListener('click', function () {
      var k = wishKey(), i = wishlist.indexOf(k);
      if (i >= 0) { wishlist.splice(i, 1); toast('Removed from saved items'); } else { wishlist.push(k); toast('Saved for later'); }
      save('co_wishlist', wishlist); updateSaveBtn(); renderWishlistCount();
    });

    updateUI();
  });
})();
