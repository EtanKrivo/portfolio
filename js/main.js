// Small helpers for the portfolio: mobile menu, slideshows, 360 "shots".

document.body.id = 'top';

// ---- mobile menu ---------------------------------------------------------
document.querySelectorAll('.nav-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var sb = btn.closest('.sidebar');
    var open = sb.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
});

// ---- slideshows ----------------------------------------------------------
document.querySelectorAll('.slideshow').forEach(function (ss) {
  var track = ss.querySelector('.ss-track');
  var n = track.children.length;
  var count = ss.querySelector('.ss-count');
  var i = 0;
  function go(k) {
    i = (k + n) % n;
    track.style.transform = 'translateX(' + (-100 * i) + '%)';
    if (count) count.textContent = (i + 1) + ' / ' + n;
  }
  var prev = ss.querySelector('.ss-prev');
  var next = ss.querySelector('.ss-next');
  if (prev) prev.addEventListener('click', function () { go(i - 1); });
  if (next) next.addEventListener('click', function () { go(i + 1); });
  // swipe on touch screens
  var x0 = null;
  ss.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  ss.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
});

// ---- 360 shots: scrub through a frame sequence with the pointer ----------
document.querySelectorAll('.shots').forEach(function (el) {
  var path = el.dataset.path;
  var n = parseInt(el.dataset.count, 10);
  var img = el.querySelector('img');
  var frames = [];
  var loaded = false;
  function pad(k) { return ('00' + k).slice(-3); }
  function preload() {
    if (loaded) return;
    loaded = true;
    for (var k = 0; k < n; k++) {
      var im = new Image();
      im.src = path + '/' + pad(k) + '.jpg';
      frames.push(im);
    }
  }
  function show(clientX) {
    var r = el.getBoundingClientRect();
    var t = Math.min(0.9999, Math.max(0, (clientX - r.left) / r.width));
    img.src = path + '/' + pad(Math.floor(t * n)) + '.jpg';
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, obs) {
      if (es[0].isIntersecting) { preload(); obs.disconnect(); }
    }, { rootMargin: '300px' }).observe(el);
  }
  el.addEventListener('pointerenter', preload);
  el.addEventListener('pointermove', function (e) { el.classList.add('touched'); show(e.clientX); });
  el.addEventListener('touchmove', function (e) { el.classList.add('touched'); show(e.touches[0].clientX); }, { passive: true });
});

// ---- before / after reveal: moving across wipes the top image away -------
document.querySelectorAll('.reveal').forEach(function (el) {
  function set(clientX) {
    var r = el.getBoundingClientRect();
    var t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    el.style.setProperty('--p', (t * 100).toFixed(2) + '%');
    el.classList.add('touched');
  }
  el.addEventListener('pointermove', function (e) { set(e.clientX); });
  el.addEventListener('touchmove', function (e) { set(e.touches[0].clientX); }, { passive: true });
});

// ---- click-to-zoom images ------------------------------------------------
(function () {
  var figs = document.querySelectorAll('.img.zoomable');
  if (!figs.length) return;
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.innerHTML = '<img alt=""><button class="lightbox-close" aria-label="Close">&times;</button>' +
    '<span class="lightbox-hint">click to zoom &middot; move to pan &middot; esc to close</span>';
  document.body.appendChild(box);
  var img = box.querySelector('img');
  var zoomed = false;

  function aim(x, y) {
    // keep the origin relative to the un-scaled image
    var w = img.offsetWidth, h = img.offsetHeight;
    var left = (box.clientWidth - w) / 2, top = (box.clientHeight - h) / 2;
    var ox = Math.min(1, Math.max(0, (x - left) / w));
    var oy = Math.min(1, Math.max(0, (y - top) / h));
    img.style.transformOrigin = (ox * 100) + '% ' + (oy * 100) + '%';
  }
  function zoom(on, x, y) {
    zoomed = on;
    box.classList.toggle('zoomed', on);
    if (on) {
      var s = Math.min(4, Math.max(2.2, img.naturalWidth / img.offsetWidth));
      aim(x, y);
      img.style.transform = 'scale(' + s + ')';
    } else {
      img.style.transform = '';
    }
  }
  function open(src) {
    img.src = src;
    zoom(false);
    box.hidden = false;
    document.documentElement.style.overflow = 'hidden';
  }
  function close() {
    box.hidden = true;
    zoom(false);
    document.documentElement.style.overflow = '';
  }
  figs.forEach(function (f) {
    f.addEventListener('click', function () { open(f.dataset.full); });
    f.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(f.dataset.full); }
    });
  });
  box.addEventListener('click', function (e) {
    if (e.target.closest('.lightbox-close')) return close();
    zoom(!zoomed, e.clientX, e.clientY);
  });
  box.addEventListener('pointermove', function (e) { if (zoomed) aim(e.clientX, e.clientY); });
  box.addEventListener('touchmove', function (e) {
    if (zoomed) { e.preventDefault(); aim(e.touches[0].clientX, e.touches[0].clientY); }
  }, { passive: false });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
})();

// ---- image beside text: size the image so it is exactly as tall as the text
(function () {
  var rows = document.querySelectorAll('.row.match-h');
  if (!rows.length) return;
  function fit(row) {
    var cells = row.children;
    if (cells.length !== 2 || getComputedStyle(row).display !== 'flex') {
      for (var c = 0; c < cells.length; c++) {
        ['width', 'margin-left', 'margin-top'].forEach(function (p) { cells[c].style.removeProperty(p); });
      }
      row.querySelectorAll('img').forEach(function (i) { i.style.removeProperty('height'); i.style.removeProperty('object-fit'); });
      return;
    }
    var imgCell = cells[0].querySelector('.img') ? cells[0] : cells[1];
    var txtCell = imgCell === cells[0] ? cells[1] : cells[0];
    var img = imgCell.querySelector('img');
    var ar = img.naturalWidth ? img.naturalWidth / img.naturalHeight
                              : img.getAttribute('width') / img.getAttribute('height');
    // two equal columns, centred; find the overall width at which the image is
    // exactly as tall as the text (image grows and text shrinks as the pair widens)
    img.style.removeProperty('height'); img.style.removeProperty('object-fit');
    imgCell.style.marginTop = txtCell.style.marginTop = '0px';
    var full = row.clientWidth;
    function diff(T) {
      var g = T * 0.05, w = (T - g) / 2;
      cells[0].style.marginLeft = (full - T) / 2 + 'px';
      cells[1].style.marginLeft = g + 'px';
      imgCell.style.width = txtCell.style.width = w + 'px';
      return w / ar - txtCell.getBoundingClientRect().height;
    }
    var lo = full * 0.3, hi = full;
    if (diff(lo) < 0 && diff(hi) >= 0) {
      for (var k = 0; k < 20; k++) { var m = (lo + hi) / 2; if (diff(m) < 0) lo = m; else hi = m; }
    }
    diff(hi);   // (narrow screens never get tall enough: use the full width and crop)
    // text height moves in whole lines, so trim the photo (top/bottom, at most about a line)
    // to land exactly on the text height
    img.style.height = txtCell.getBoundingClientRect().height + 'px';
    img.style.objectFit = 'cover';
  }
  function all() { rows.forEach(fit); }
  all();
  window.addEventListener('load', all);
  window.addEventListener('resize', all);
  if (document.fonts) document.fonts.ready.then(all);
})();
