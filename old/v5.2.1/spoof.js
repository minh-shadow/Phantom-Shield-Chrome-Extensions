(function () {
  'use strict';

  var GUARD = Symbol.for('phantom.shield.spoof.v2');
  if (window[GUARD]) return;
  try { Object.defineProperty(window, GUARD, { value: true, enumerable: false }); }
  catch (e) { window[GUARD] = true; }

  var EV_CFG = '__ps_cfg_v2';
  var EV_REQ = '__ps_req_v2';
  var NARROW_PX = 700;

  var state = { fullscreen: true, visibility: true };

  window.addEventListener(EV_CFG, function (e) {
    try {
      var c = JSON.parse(e.detail);
      state.fullscreen = !!c.fullscreen;
      state.visibility = !!c.visibility;
    } catch (err) {}
  });

  function findDesc(obj, prop) {
    var cur = obj;
    while (cur) {
      var d = Object.getOwnPropertyDescriptor(cur, prop);
      if (d) return d;
      cur = Object.getPrototypeOf(cur);
    }
    return null;
  }

  function hookGetter(target, prop, isActive, fake) {
    try {
      var orig = findDesc(target, prop);
      if (!orig) return;
      if (orig.configurable === false) return;
      var origGet = orig.get;
      Object.defineProperty(target, prop, {
        configurable: true,
        enumerable: orig.enumerable,
        get: function () {
          if (isActive()) return fake.call(this);
          return origGet ? origGet.call(this) : orig.value;
        },
        set: orig.set
      });
    } catch (e) {}
  }

  var visActive = function () { return state.visibility; };
  var fsActive = function () { return state.fullscreen; };

  hookGetter(Document.prototype, 'hidden', visActive, function () { return false; });
  hookGetter(Document.prototype, 'visibilityState', visActive, function () { return 'visible'; });
  hookGetter(Document.prototype, 'webkitHidden', visActive, function () { return false; });
  hookGetter(Document.prototype, 'webkitVisibilityState', visActive, function () { return 'visible'; });

  try {
    var hfDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hasFocus');
    var origHasFocus = hfDesc && hfDesc.value;
    if (typeof origHasFocus === 'function' && hfDesc.configurable !== false) {
      Object.defineProperty(Document.prototype, 'hasFocus', {
        configurable: true,
        enumerable: hfDesc.enumerable,
        writable: hfDesc.writable,
        value: function hasFocus() {
          return state.visibility ? true : origHasFocus.call(this);
        }
      });
    }
  } catch (e) {}

  var fakeFsEl = function () { return document.documentElement; };

  ['fullscreenElement', 'webkitFullscreenElement', 'webkitCurrentFullScreenElement',
   'mozFullScreenElement', 'msFullscreenElement'].forEach(function (p) {

    var d = findDesc(Document.prototype, p);
    var realGet = d && d.get;
    hookGetter(Document.prototype, p, function () {
      if (!state.fullscreen) return false;
      try { if (realGet && realGet.call(document)) return false; } catch (e) {}
      return true;
    }, fakeFsEl);
  });

  ['fullscreenEnabled', 'webkitFullscreenEnabled', 'mozFullScreenEnabled', 'msFullscreenEnabled']
    .forEach(function (p) {
      hookGetter(Document.prototype, p, fsActive, function () { return true; });
    });

  var sizeProps = ['innerWidth', 'innerHeight', 'outerWidth', 'outerHeight'];
  var realSize = {};
  sizeProps.forEach(function (p) {
    var d = findDesc(window, p);
    realSize[p] = function () {
      if (!d) return 0;
      return d.get ? d.get.call(window) : d.value;
    };
  });

  var isTop = (function () { try { return window === window.top; } catch (e) { return false; } })();

  function sizeActive() {
    return state.fullscreen && isTop && realSize.innerWidth() >= NARROW_PX;
  }

  hookGetter(window, 'innerWidth', sizeActive, function () { return window.screen.width; });
  hookGetter(window, 'innerHeight', sizeActive, function () { return window.screen.height; });
  hookGetter(window, 'outerWidth', sizeActive, function () { return window.screen.width; });
  hookGetter(window, 'outerHeight', sizeActive, function () { return window.screen.height; });

  try { window.dispatchEvent(new CustomEvent(EV_REQ)); } catch (e) {}
})();

// MÃ CŨ: spoof.js phiên bản 5.1.0 nằm trong file Phantom-Shield.zip gốc
