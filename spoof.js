(function () {
  'use strict';

  const params = new URLSearchParams(new URL(document.currentScript.src).search);
  const fakeFullscreen = params.get('fs') === 'true';
  const fakeVisibility = params.get('vis') === 'true';

  // ==========================================
  // 1. ÉP BUỘC TOÀN MÀN HÌNH (Fullscreen Spoof)
  // ==========================================
  if (fakeFullscreen) {
    const fakeEl = document.documentElement || document.body || document.createElement('div');
    
    // Hàm ghi đè cực mạnh (ghi đè thẳng vào instance document và window)
    const forceProperty = (obj, prop, value) => {
      try {
        Object.defineProperty(obj, prop, { get: () => value, configurable: true });
      } catch (e) {}
    };

    // Ghi đè fullscreenElement lên document instance
    forceProperty(document, 'fullscreenElement', fakeEl);
    forceProperty(document, 'webkitFullscreenElement', fakeEl);
    forceProperty(document, 'mozFullScreenElement', fakeEl);
    forceProperty(document, 'msFullscreenElement', fakeEl);

    // Ghi đè fullscreenEnabled (Báo cho web biết tính năng này được bật)
    forceProperty(document, 'fullscreenEnabled', true);
    forceProperty(document, 'webkitFullscreenEnabled', true);
    forceProperty(document, 'mozFullScreenEnabled', true);
    forceProperty(document, 'msFullscreenEnabled', true);

    // Ghi đè kích thước cửa sổ (luôn bằng màn hình)
    const w = window.screen.width;
    const h = window.screen.height;
    forceProperty(window, 'innerWidth', w);
    forceProperty(window, 'innerHeight', h);
    forceProperty(window, 'outerWidth', w);
    forceProperty(window, 'outerHeight', h);

    // Ghi đè lên cả Prototype để phòng hờ trang web check qua Prototype
    try {
      Object.defineProperty(Document.prototype, 'fullscreenElement', { get: () => fakeEl, configurable: true });
      Object.defineProperty(Document.prototype, 'webkitFullscreenElement', { get: () => fakeEl, configurable: true });
      Object.defineProperty(Window.prototype, 'innerWidth', { get: () => w, configurable: true });
      Object.defineProperty(Window.prototype, 'innerHeight', { get: () => h, configurable: true });
    } catch (e) {}
  }

  // ==========================================
  // 2. CHẶN PAGE VISIBILITY & FOCUS (Code của bạn)
  // ==========================================
  if (fakeVisibility) {
    function normalizeEventHandler(handler) {
      return typeof handler === 'function' ? handler : null;
    }
    function getOwnDescriptor(obj, prop) {
      return Object.getOwnPropertyDescriptor(obj, prop);
    }
    function overrideGetter(proto, prop, value) {
      var original = getOwnDescriptor(proto, prop);
      if (!original || original.configurable === false) return;
      Object.defineProperty(proto, prop, {
        configurable: original.configurable,
        enumerable: original.enumerable,
        get: function () { return value; }
      });
    }
    function findDescriptor(obj, prop) {
      var current = obj;
      while (current) {
        var desc = Object.getOwnPropertyDescriptor(current, prop);
        if (desc) return desc;
        current = Object.getPrototypeOf(current);
      }
      return null;
    }
    function overrideDocumentEventHandler(prop) {
      var original = getOwnDescriptor(Document.prototype, prop);
      var handlers = new WeakMap();
      if (!original || original.configurable === false) return;
      Object.defineProperty(Document.prototype, prop, {
        configurable: original.configurable,
        enumerable: original.enumerable,
        get: function () { return handlers.has(this) ? handlers.get(this) : null; },
        set: function (handler) { handlers.set(this, normalizeEventHandler(handler)); }
      });
    }
    function overrideWindowEventHandler(prop) {
      var original = findDescriptor(window, prop);
      var stored = null;
      if (!original || original.configurable === false) return;
      Object.defineProperty(window, prop, {
        configurable: true,
        enumerable: original.enumerable,
        get: function () { return stored; },
        set: function (handler) { stored = normalizeEventHandler(handler); }
      });
    }

    /* Page Visibility API */
    overrideGetter(Document.prototype, 'hidden', false);
    overrideGetter(Document.prototype, 'visibilityState', 'visible');
    overrideGetter(Document.prototype, 'webkitHidden', false);
    overrideGetter(Document.prototype, 'webkitVisibilityState', 'visible');

    /* document.onvisibilitychange = fn */
    overrideDocumentEventHandler('onvisibilitychange');

    /* document.hasFocus() */
    var originalHasFocus = Document.prototype.hasFocus;
    var originalHasFocusDescriptor = getOwnDescriptor(Document.prototype, 'hasFocus');
    if (typeof originalHasFocus === 'function' && (!originalHasFocusDescriptor || originalHasFocusDescriptor.configurable !== false)) {
      Object.defineProperty(Document.prototype, 'hasFocus', {
        configurable: originalHasFocusDescriptor ? originalHasFocusDescriptor.configurable : true,
        enumerable: originalHasFocusDescriptor ? originalHasFocusDescriptor.enumerable : true,
        writable: originalHasFocusDescriptor ? originalHasFocusDescriptor.writable : true,
        value: function hasFocus() { return true; }
      });
    }

    /* EventTarget.prototype.addEventListener */
    var originalAddEvent = EventTarget.prototype.addEventListener;
    var originalAddEventDescriptor = getOwnDescriptor(EventTarget.prototype, 'addEventListener');

    function shouldBlockEventListener(target, type) {
      if (type === 'visibilitychange') return target === document || target === window;
      if (type === 'blur' || type === 'focus') return target === window;
      return false;
    }

    if (typeof originalAddEvent === 'function' && (!originalAddEventDescriptor || originalAddEventDescriptor.configurable !== false)) {
      Object.defineProperty(EventTarget.prototype, 'addEventListener', {
        configurable: originalAddEventDescriptor ? originalAddEventDescriptor.configurable : true,
        enumerable: originalAddEventDescriptor ? originalAddEventDescriptor.enumerable : true,
        writable: originalAddEventDescriptor ? originalAddEventDescriptor.writable : true,
        value: function addEventListener(type, listener, options) {
          if (shouldBlockEventListener(this, type)) return;
          return originalAddEvent.call(this, type, listener, options);
        }
      });
    }

    /* window.onvisibilitychange / window.onblur / window.onfocus */
    overrideWindowEventHandler('onvisibilitychange');
    overrideWindowEventHandler('onblur');
    overrideWindowEventHandler('onfocus');

    /* Safety net capture phase */
    if (originalAddEvent) {
      originalAddEvent.call(window, 'visibilitychange', function (event) { event.stopImmediatePropagation(); }, true);
      originalAddEvent.call(document, 'visibilitychange', function (event) { event.stopImmediatePropagation(); }, true);
      originalAddEvent.call(window, 'blur', function (event) { event.stopImmediatePropagation(); }, true);
      originalAddEvent.call(window, 'focus', function (event) { event.stopImmediatePropagation(); }, true);
    }
  }
})();