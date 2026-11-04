(function () {
  'use strict';

  function isContextValid() {
    try { return !!(chrome.runtime && chrome.runtime.id); } catch (e) { return false; }
  }
  if (!isContextValid()) return;

  var EV_HELLO = '__ps_hello_v3';

  // Khóa ngẫu nhiên dùng làm tên sự kiện cấu hình gửi sang spoof.js (MAIN world).
  // Trang không biết khóa nên không giả được cấu hình và không đọc được cấu hình.
  function makeKey() {
    var a = new Uint8Array(12);
    try { crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < a.length; i++) a[i] = Math.random() * 256; }
    var out = '';
    for (var j = 0; j < a.length; j++) out += ('0' + a[j].toString(16)).slice(-2);
    return out;
  }
  var KEY = makeKey();
  var EV_CFG = '__ps_' + KEY;

  var DEFAULTS = { mouseleave: true, clipboard: true, contextmenu: true, fullscreen: true, visibility: true };

  var CLIPBOARD_ALLOW_HOSTS = [];

  var FULLSCREEN_SKIP_HOSTS = ['youtube.com', 'youtu.be', 'netflix.com', 'twitch.tv', 'vimeo.com',
                               'chatgpt.com', 'chat.openai.com', 'chat.deepseek.com', 'claude.ai'];

  function hostMatches(list) {
    var h = location.hostname || '';
    return list.some(function (d) { return h === d || h.endsWith('.' + d); });
  }
  var clipboardAllowed = hostMatches(CLIPBOARD_ALLOW_HOSTS);
  var fullscreenSkipped = hostMatches(FULLSCREEN_SKIP_HOSTS);

  var disposers = [];
  var regs = [];
  var dead = false;
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    regs.push({ target: target, type: type, fn: fn, opts: opts });
  }
  function rebind() {
    if (dead) return;
    regs.forEach(function (r) { try { r.target.addEventListener(r.type, r.fn, r.opts); } catch (e) {} });
  }
  function dispose() {
    if (dead) return;
    dead = true;
    regs.splice(0).forEach(function (r) { try { r.target.removeEventListener(r.type, r.fn, r.opts); } catch (e) {} });
    disposers.splice(0).forEach(function (f) { try { f(); } catch (e) {} });
  }

  // Bản cũ (nạp lại bằng executeScript) nằm trong isolated world nên trang không thấy, không tác động được.
  try {
    if (typeof window.__psDispose === 'function') window.__psDispose();
    window.__psDispose = dispose;
  } catch (e) {}
  try { window.dispatchEvent(new CustomEvent(EV_HELLO, { detail: KEY })); } catch (e) {}

  var SELECT_CSS = '*:not(input):not(textarea):not(select):not(button):not([contenteditable]),' +
                   '*::before,*::after{-webkit-user-select:text !important;user-select:text !important}';
  var selectSheet = null, selectStyleEl = null;

  var config = Object.assign({}, DEFAULTS);

  function pushToSpoof() {
    try { applySelectCss(); } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent(EV_CFG, {
        detail: JSON.stringify({
          fullscreen: !!config.fullscreen && !fullscreenSkipped,
          visibility: !!config.visibility
        })
      }));
    } catch (e) {}
  }

  try {
    chrome.storage.local.get(DEFAULTS, function (r) {
      if (dead || chrome.runtime.lastError || !r) return;
      for (var k in DEFAULTS) config[k] = (r[k] !== undefined) ? !!r[k] : DEFAULTS[k];
      pushToSpoof();
    });

    var onChanged = function (changes, area) {
      if (dead || area !== 'local') return;
      for (var k in DEFAULTS) {
        if (changes[k]) config[k] = (changes[k].newValue !== undefined) ? !!changes[k].newValue : DEFAULTS[k];
      }
      pushToSpoof();
    };
    chrome.storage.onChanged.addListener(onChanged);
    disposers.push(function () { try { chrome.storage.onChanged.removeListener(onChanged); } catch (e) {} });
  } catch (e) {}

  pushToSpoof();

  var ALL_EVENTS = [
    'mouseleave', 'mouseout', 'pointerleave', 'pointerout',
    'copy', 'paste', 'cut',
    'resize', 'fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange',
    'contextmenu',
    'visibilitychange', 'webkitvisibilitychange', 'blur', 'focus',
    'focusin', 'focusout'
  ];
  // Chỉ gắn ở window (capture) để nhẹ hơn
  var WINDOW_ONLY_EVENTS = ['selectstart', 'dragstart', 'keydown', 'mousemove', 'freeze', 'resume'];
  var MOUSE_EVENTS = { mouseleave: 1, mouseout: 1, pointerleave: 1, pointerout: 1 };
  var CLIP_EVENTS = { copy: 1, paste: 1, cut: 1 };
  var FS_EVENTS = { fullscreenchange: 1, webkitfullscreenchange: 1, mozfullscreenchange: 1, MSFullscreenChange: 1 };
  var VIS_EVENTS = { visibilitychange: 1, webkitvisibilitychange: 1 };
  var FOCUSIN_EVENTS = { focusin: 1, focusout: 1 };

  function isVideoTarget(t) {
    try { return !!t && (t.tagName === 'VIDEO' || (t.querySelector && t.querySelector('video'))); }
    catch (e) { return false; }
  }

  function isEditable(t) {
    try {
      if (!t || t.nodeType !== 1) return false;
      var n = t.nodeName;
      return n === 'INPUT' || n === 'TEXTAREA' || n === 'SELECT' || !!t.isContentEditable;
    } catch (err) { return false; }
  }
  function inDraggable(t) {
    try { return !!(t && t.nodeType === 1 && t.closest && t.closest('[draggable="true"],a[href],img')); }
    catch (err) { return false; }
  }

  // Phím mà trang hay preventDefault để chặn sao chép / xem nguồn / mở DevTools
  function isGuardedKey(e) {
    if (e.altKey) return false;
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    if (e.key === 'F12') return config.contextmenu;
    if (!mod) return false;
    if (!e.shiftKey && (k === 'u')) return config.contextmenu;
    if (e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) return config.contextmenu;
    if (!e.shiftKey && (k === 'c' || k === 'v' || k === 'x' || k === 'a')) {
      return config.clipboard && !isEditable(e.target);
    }
    return false;
  }

  function shouldBlock(e) {
    var t = e.type;

    if (t === 'selectstart') return config.clipboard && !clipboardAllowed && !isEditable(e.target);
    if (t === 'dragstart') return config.clipboard && !clipboardAllowed && !inDraggable(e.target);
    if (t === 'keydown') return !clipboardAllowed && isGuardedKey(e);
    if (t === 'mousemove') return config.mouseleave && e.clientY <= 0 && !e.buttons;
    if (t === 'freeze' || t === 'resume') return config.visibility;

    if (MOUSE_EVENTS[t]) return config.mouseleave;
    if (CLIP_EVENTS[t]) return config.clipboard && !clipboardAllowed;
    if (t === 'contextmenu') return config.contextmenu && !clipboardAllowed;

    if (t === 'resize') return config.fullscreen;
    if (FS_EVENTS[t]) return config.fullscreen && !fullscreenSkipped && !isVideoTarget(e.target);

    if (VIS_EVENTS[t]) return config.visibility;
    if (t === 'blur' || t === 'focus') return config.visibility;
    if (FOCUSIN_EVENTS[t]) {
      if (!config.visibility) return false;
      if (e.target === window || e.target === document) return true;
      try { return !document.hasFocus(); } catch (err) { return false; }
    }
    return false;
  }

  function blockHandler(e) {
    if (shouldBlock(e)) {
      e.stopImmediatePropagation();
      e.stopPropagation();
    }
  }
  ALL_EVENTS.forEach(function (type) {
    on(window, type, blockHandler, true);
    on(document, type, blockHandler, true);
  });
  WINDOW_ONLY_EVENTS.forEach(function (type) {
    on(window, type, blockHandler, true);
  });

  // CSS user-select: none do trang áp lên văn bản -> ghi đè khi bật "clipboard"
  function applySelectCss() {
    if (dead) return;
    var want = !!config.clipboard && !clipboardAllowed;
    try {
      if (typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document) {
        if (want) {
          if (!selectSheet) { selectSheet = new CSSStyleSheet(); selectSheet.replaceSync(SELECT_CSS); }
          if (document.adoptedStyleSheets.indexOf(selectSheet) === -1) {
            document.adoptedStyleSheets = document.adoptedStyleSheets.concat([selectSheet]);
          }
        } else if (selectSheet) {
          document.adoptedStyleSheets = document.adoptedStyleSheets.filter(function (x) { return x !== selectSheet; });
        }
        return;
      }
    } catch (err) {}
    try {
      if (want) {
        if (!selectStyleEl || !selectStyleEl.isConnected) {
          selectStyleEl = document.createElement('style');
          selectStyleEl.textContent = SELECT_CSS;
          (document.head || document.documentElement).appendChild(selectStyleEl);
        }
      } else if (selectStyleEl) { selectStyleEl.remove(); selectStyleEl = null; }
    } catch (err2) {}
  }
  disposers.push(function () { config.clipboard = false; applySelectCss(); });

  function showToast(isEnabled) {
    var existingToast = document.getElementById('mlb-3d-toast');
    if (existingToast) existingToast.remove();

    var container = document.createElement('div');
    container.id = 'mlb-3d-toast';
    var shadow = container.attachShadow({ mode: 'open' });

    var style = document.createElement('style');
    style.textContent = `
      .toast-box {
        position: fixed; top: 30px; left: 50%;
        transform: translateX(-50%) translateY(-150px) scale(0.5);
        display: flex; align-items: center; gap: 10px;
        padding: 14px 24px; border-radius: 30px;
        font-family: 'Segoe UI', sans-serif; font-size: 16px; font-weight: 800;
        letter-spacing: 1px; color: #fff; z-index: 2147483647; opacity: 0; pointer-events: none;
        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      .toast-box.on { background: linear-gradient(145deg, #00f2fe, #4facfe); box-shadow: 0 15px 35px rgba(0, 242, 254, 0.4); }
      .toast-box.off { background: linear-gradient(145deg, #434343, #000000); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6); }
      .toast-box.show { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
    `;

    var box = document.createElement('div');
    box.className = 'toast-box ' + (isEnabled ? 'on' : 'off');
    box.textContent = isEnabled ? '⚡ ĐÃ BẬT TẤT CẢ' : '💤 ĐÃ TẮT TẤT CẢ';

    shadow.appendChild(style);
    shadow.appendChild(box);
    (document.documentElement || document).appendChild(container);

    requestAnimationFrame(function () { box.classList.add('show'); });
    setTimeout(function () {
      box.classList.remove('show');
      setTimeout(function () { container.remove(); }, 600);
    }, 2500);
  }

  try {
    var reopenObserver = new MutationObserver(function () {
      if (dead) return;
      rebind();
      applySelectCss();
      pushToSpoof();
    });
    reopenObserver.observe(document, { childList: true });
    disposers.push(function () { try { reopenObserver.disconnect(); } catch (e) {} });
  } catch (e) {}

  var RELOAD_MSG = 'Extension vừa được reload, vui lòng F5 trang web.';

  function send(msg) {
    try {
      var p = chrome.runtime.sendMessage(msg);
      if (p && typeof p.catch === 'function') p.catch(function () { console.log(RELOAD_MSG); });
    } catch (err) {
      console.log(RELOAD_MSG);
    }
  }

  function isTopFrame() {
    try { return window === window.top; } catch (err) { return false; }
  }

  var onRuntimeMessage = function (msg) {
    if (dead || !msg || msg.action !== 'toast') return;
    if (isTopFrame()) showToast(!!msg.on);
  };
  try {
    chrome.runtime.onMessage.addListener(onRuntimeMessage);
    disposers.push(function () { try { chrome.runtime.onMessage.removeListener(onRuntimeMessage); } catch (e) {} });
  } catch (e) {}

  var HOTKEYS = {
    KeyZ: { action: 'toggle-all' },
    KeyX: { action: 'open-window', appId: 'google' },
    KeyC: { action: 'open-window', appId: 'chatgpt' },
    KeyV: { action: 'open-window', appId: 'deepseek' },
    KeyB: { action: 'open-window', appId: 'claude' },
    KeyD: { action: 'close-windows' }
  };

  on(window, 'keydown', function (e) {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    var code = e.code || ('Key' + (e.key || '').toUpperCase());
    var hotkey = HOTKEYS[code];
    if (!hotkey) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.repeat) return;
    if (!isContextValid()) { console.log(RELOAD_MSG); return; }

    send(hotkey);
  }, true);

})();
