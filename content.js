(function () {
  'use strict';

  // Hàm kiểm tra xem extension còn hoạt động (context hợp lệ) hay đã bị reload
  function isContextValid() {
    return !!(chrome.runtime && chrome.runtime.id);
  }

  let config = {
    mouseleave: true, clipboard: true, contextmenu: true, fullscreen: true, visibility: true
  };

  let blockedEvents = new Set();
  const ALL_EVENTS = [
    'mouseleave', 'mouseout', 'copy', 'paste', 'cut',
    'resize', 'fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange',
    'contextmenu', 'visibilitychange', 'blur', 'focus'
  ];

  function updateBlockedEvents() {
    blockedEvents.clear();
    if (config.mouseleave) { blockedEvents.add('mouseleave'); blockedEvents.add('mouseout'); }
    if (config.clipboard) { blockedEvents.add('copy'); blockedEvents.add('paste'); blockedEvents.add('cut'); }
    if (config.fullscreen) { 
      blockedEvents.add('resize'); blockedEvents.add('fullscreenchange'); 
      blockedEvents.add('webkitfullscreenchange'); blockedEvents.add('mozfullscreenchange'); 
      blockedEvents.add('MSFullscreenChange'); 
    }
    if (config.contextmenu) { blockedEvents.add('contextmenu'); }
    if (config.visibility) { blockedEvents.add('visibilitychange'); blockedEvents.add('blur'); blockedEvents.add('focus'); }
  }

  if (isContextValid()) {
    chrome.storage.local.get(config, function (r) {
      if (chrome.runtime.lastError) return;
      config = r;
      updateBlockedEvents();
      if (config.fullscreen || config.visibility) {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(`spoof.js?fs=${config.fullscreen}&vis=${config.visibility}`);
        (document.head || document.documentElement).appendChild(script);
        script.onload = () => script.remove();
      }
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area === 'local') {
        for (let key in changes) { 
          if (key !== 'master') config[key] = changes[key].newValue; 
        }
        updateBlockedEvents();
      }
    });
  }

  function blockHandler(e) {
    if (blockedEvents.has(e.type)) {
      e.stopImmediatePropagation();
      e.stopPropagation();
    }
  }
  ALL_EVENTS.forEach(function (type) {
    window.addEventListener(type, blockHandler, true);
    document.addEventListener(type, blockHandler, true);
  });

  function showToast(isEnabled) {
    const existingToast = document.getElementById('mlb-3d-toast');
    if (existingToast) existingToast.remove();

    const container = document.createElement('div');
    container.id = 'mlb-3d-toast';
    const shadow = container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
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

    const box = document.createElement('div');
    box.className = `toast-box ${isEnabled ? 'on' : 'off'}`;
    box.innerHTML = isEnabled ? '⚡ ĐÃ BẬT TẤT CẢ' : '💤 ĐÃ TẮT TẤT CẢ';

    shadow.appendChild(style);
    shadow.appendChild(box);
    document.documentElement.appendChild(container);

    requestAnimationFrame(() => box.classList.add('show'));
    setTimeout(() => {
      box.classList.remove('show');
      setTimeout(() => container.remove(), 600);
    }, 2500);
  }

  window.addEventListener('keydown', function (e) {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.repeat) { if (/^Key[ZXCVBD]$/.test(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); } return; }
    
    // Nếu extension đã bị reload, bỏ qua không làm gì cả để tránh lỗi
    if (!isContextValid()) return;

    const code = e.code || ('Key' + (e.key || '').toUpperCase());

    if (code === 'KeyZ') {
      e.preventDefault(); e.stopImmediatePropagation();
      chrome.storage.local.get({ mouseleave: true, clipboard: true, contextmenu: true, fullscreen: true, visibility: true }, function (r) {
        if (chrome.runtime.lastError) return;
        const isCurrentlyOn = r.mouseleave || r.clipboard || r.contextmenu || r.fullscreen || r.visibility;
        const newState = !isCurrentlyOn;
        chrome.storage.local.set({ 
          master: newState, mouseleave: newState, clipboard: newState, 
          contextmenu: newState, fullscreen: newState, visibility: newState
        }, () => {
          if (chrome.runtime.lastError) return;
          showToast(newState); 
        });
      });
      return;
    }

    const premiumKeys = {
      'KeyX': { appId: 'google', url: 'https://www.google.com/search?igu=1' },
      'KeyC': { appId: 'chatgpt', url: 'https://chatgpt.com' },
      'KeyV': { appId: 'deepseek', url: 'https://chat.deepseek.com' },
      'KeyB': { appId: 'claude', url: 'https://claude.ai' }
    };

    if (premiumKeys[code]) {
      e.preventDefault(); e.stopImmediatePropagation();
      const app = premiumKeys[code];
      try {
        chrome.runtime.sendMessage({ action: 'open-window', appId: app.appId, url: app.url });
      } catch (err) {
        console.log("Extension vừa được reload, vui lòng F5 trang web.");
      }
      return;
    }

    if (code === 'KeyD') {
      e.preventDefault(); e.stopImmediatePropagation();
      try {
        chrome.runtime.sendMessage({ action: 'close-windows' });
      } catch (err) {
        console.log("Extension vừa được reload, vui lòng F5 trang web.");
      }
      return;
    }
  }, true);

})();