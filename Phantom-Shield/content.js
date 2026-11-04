(function () {
  'use strict';

  function isContextValid() {
    try { return !!(chrome.runtime && chrome.runtime.id); } catch (e) { return false; }
  }
  if (!isContextValid()) return;

  var EV_TAKEOVER = '__ps_takeover_v2';
  var EV_CFG = '__ps_cfg_v2';
  var EV_REQ = '__ps_req_v2';
  var INSTANCE_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);

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

  on(window, EV_TAKEOVER, function (e) { if (e.detail !== INSTANCE_ID) dispose(); });
  try { window.dispatchEvent(new CustomEvent(EV_TAKEOVER, { detail: INSTANCE_ID })); } catch (e) {}

  var config = Object.assign({}, DEFAULTS);

  function pushToSpoof() {
    try {
      window.dispatchEvent(new CustomEvent(EV_CFG, {
        detail: JSON.stringify({
          fullscreen: !!config.fullscreen && !fullscreenSkipped,
          visibility: !!config.visibility
        })
      }));
    } catch (e) {}
  }

  on(window, EV_REQ, function () { pushToSpoof(); });

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
  var MOUSE_EVENTS = { mouseleave: 1, mouseout: 1, pointerleave: 1, pointerout: 1 };
  var CLIP_EVENTS = { copy: 1, paste: 1, cut: 1 };
  var FS_EVENTS = { fullscreenchange: 1, webkitfullscreenchange: 1, mozfullscreenchange: 1, MSFullscreenChange: 1 };
  var VIS_EVENTS = { visibilitychange: 1, webkitvisibilitychange: 1 };
  var FOCUSIN_EVENTS = { focusin: 1, focusout: 1 };

  function isVideoTarget(t) {
    try { return !!t && (t.tagName === 'VIDEO' || (t.querySelector && t.querySelector('video'))); }
    catch (e) { return false; }
  }

  function shouldBlock(e) {
    var t = e.type;

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
