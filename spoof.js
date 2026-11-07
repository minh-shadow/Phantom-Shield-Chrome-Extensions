(function () {
  'use strict';

  // NOTE (security trade-off): guard marker là chuỗi cố định nên trang có thể
  // dùng nó để phát hiện extension. Giữ lại vì cần cho idempotency khi
  // extension được inject lại (onInstalled / reload), và để chia sẻ trạng
  // thái bắt tay giữa các instance (xem shared.boot bên dưới).
  var GUARD = Symbol.for('phantom.shield.spoof.v2');
  var shared = null;
  try {
    shared = window[GUARD];
    if (!shared || typeof shared !== 'object') {
      shared = {};
      try {
        Object.defineProperty(window, GUARD, { value: shared, enumerable: false });
      } catch (e) { window[GUARD] = shared; }
    }
  } catch (e) { shared = window[GUARD]; }
  if (!shared || typeof shared !== 'object') shared = {};
  if (shared.active === true) {
    // Instance mới được inject lại (extension reload/update): ghi nhận grace
    // window mới để instance cũ bắt tay lại được, rồi thoát nhẹ nhàng.
    // Không return ngay vì có thể phải gắn lại listener nếu bị document.open()
    // xoá; mọi instance dùng chung trạng thái qua `shared` nên an toàn.
  }

  var EV_HELLO = '__ps_hello_v3';
  var NARROW_PX = 700;

  // === Bắt tay an toàn ===
  // Giai đoạn 1 (trang đang load, readyState === 'loading'): content.js của
  // extension luôn chạy TRƯỚC mọi script của trang (document_start). Key đầu
  // tiên thắng và kênh bị khóa vĩnh viễn -> trang không thể chiếm quyền.
  // Giai đoạn 2 (inject muộn sau khi trang đã chạy): chỉ cho phép bắt tay
  // LẠI (thay key cũ) trong grace window GRACE_MS sau mỗi lần spoof.js được
  // nạp, đủ cho content.js mới gửi hello. Sau đó khóa cứng để timer của trang
  // spam hello giả không thể chiếm kênh.
  var GRACE_MS = 3000;
  var bootTime = Date.now();
  var state = (typeof shared.boot === 'object' && shared.boot !== null)
    ? shared.boot
    : (shared.boot = { cfgName: null, listeners: {}, lastBoot: 0 });

  // Instance mới được nạp -> reset grace window cho TẤT CẢ instance (kể cả
  // instance cũ còn sống) để content.js mới có thể bắt tay lại. Đây cũng là
  // cách chữa "zombie state": instance cũ sau reload extension sẽ chấp nhận
  // key mới và hoạt động trở lại.
  if (state.lastBoot !== bootTime) {
    state.lastBoot = bootTime;
  }

  function inLoadingPhase() {
    try { return document.readyState === 'loading'; } catch (e) { return false; }
  }
  function graceExpired() {
    return Date.now() - state.lastBoot > GRACE_MS;
  }

  function listen(name, fn) {
    try {
      window.removeEventListener(name, fn);
      window.addEventListener(name, fn);
      state.listeners[name] = fn;
    } catch (e) {}
  }
  function unlisten(name) {
    try {
      var fn = state.listeners[name];
      if (fn) window.removeEventListener(name, fn);
    } catch (e) {}
    delete state.listeners[name];
  }

  function onCfg(e) {
    try {
      var c = JSON.parse(e.detail);
      state.fullscreen = !!c.fullscreen;
      state.visibility = !!c.visibility;
    } catch (err) {}
  }

  function isTrustedKey(k) {
    return typeof k === 'string' && /^[a-z0-9]{20,64}$/.test(k);
  }

  function onHello(e) {
    var k = e && e.detail;
    if (!isTrustedKey(k)) return;

    if (state.cfgName) {
      // Đã có kênh: chỉ chấp nhận key mới khi còn trong grace window.
      // Trong giai đoạn loading, kênh đầu tiên đã khóa thì không đổi nữa
      // (extension luôn chạy trước trang nên key hiện tại là của extension).
      if (inLoadingPhase() || graceExpired()) return;
      // Bắt tay lại: thay key cũ bằng key mới (extension reload/update).
      unlisten(state.cfgName);
    }

    state.cfgName = '__ps_' + k;
    listen(state.cfgName, onCfg);
    try { window.removeEventListener(EV_HELLO, onHello); } catch (err) {}
    delete state.listeners[EV_HELLO];
  }

  // Nếu kênh cấu hình hiện tại nằm ở instance cũ (không phải mình), giữ
  // nguyên và KHÔNG gắn listener hello - tránh nhiều instance cạnh tranh.
  if (!state.cfgName) {
    listen(EV_HELLO, onHello);
  } else if (state.listeners[state.cfgName] && state.listeners[state.cfgName] !== onCfg) {
    // Instance khác đang giữ kênh: mình chỉ ghi nhận boot mới (đã làm ở trên)
    // để instance đó mở lại grace window; không gắn hello listener tại đây.
    // Instance cũ sẽ tự nhận key mới trong onHello của nó trong grace window.
  } else {
    // Kênh tồn tại nhưng listener đã mất (document.open() xoá listener):
    // gắn lại listener cấu hình với key hiện tại.
    listen(state.cfgName, onCfg);
    // Trong grace window, cũng gắn lại hello để nhận key mới nếu extension
    // vừa được nạp lại.
    listen(EV_HELLO, onHello);
  }

  try {
    new MutationObserver(function () {
      // document.open() xóa listener: gắn lại cả hello lẫn cấu hình
      if (state.cfgName) {
        listen(state.cfgName, onCfg);
      } else {
        listen(EV_HELLO, onHello);
      }
    }).observe(document, { childList: true });
  } catch (e) {}

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

  if (shared.active === true) {
    // Getter/hasFocus đã được hook bởi instance trước (cùng realm, hook đè lên
    // nhau là vô hại nhưng lặp không cần thiết) -> chỉ đảm bảo kênh bắt tay là
    // việc của phần trên, rồi thoát.
    return;
  }
  shared.active = true;

  var visActive = function () { return state.visibility !== false; };
  var fsActive = function () { return state.fullscreen !== false; };

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
          return (state.visibility !== false) ? true : origHasFocus.call(this);
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
      if (state.fullscreen === false) return false;
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
    return state.fullscreen !== false && isTop && realSize.innerWidth() >= NARROW_PX;
  }

  hookGetter(window, 'innerWidth', sizeActive, function () { return window.screen.width; });
  hookGetter(window, 'innerHeight', sizeActive, function () { return window.screen.height; });
  hookGetter(window, 'outerWidth', sizeActive, function () { return window.screen.width; });
  hookGetter(window, 'outerHeight', sizeActive, function () { return window.screen.height; });

})();
