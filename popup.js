const keys = ['master', 'mouseleave', 'clipboard', 'contextmenu', 'fullscreen', 'visibility'];
const DEFAULTS = {
  master: true,
  mouseleave: true,
  clipboard: true,
  contextmenu: true,
  fullscreen: true,
  visibility: true
};
const featureRows = document.querySelectorAll('.feature-row');
const masterToggle = document.getElementById('master');
const featureToggles = Array.from(document.querySelectorAll('.feature-row input[type="checkbox"]'));

let isUpdatingUI = false;

function updateUI(config) {
  isUpdatingUI = true;

  keys.forEach(k => {
    const el = document.getElementById(k);
    if (el) el.checked = !!config[k];
  });

  featureRows.forEach(row => {
    if (!config.master) row.classList.add('disabled');
    else row.classList.remove('disabled');
  });

  setTimeout(() => { isUpdatingUI = false; }, 50);
}

function refreshFromStorage() {
  chrome.storage.local.get(DEFAULTS, updateUI);
}

refreshFromStorage();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') refreshFromStorage();
});

masterToggle.addEventListener('change', (e) => {
  if (isUpdatingUI) return;

  const isChecked = e.target.checked;
  const updateData = { master: isChecked };

  featureToggles.forEach(t => {
    t.checked = isChecked;
    updateData[t.id] = isChecked;
  });

  chrome.storage.local.set(updateData, refreshFromStorage);
});

featureToggles.forEach(t => {
  t.addEventListener('change', (e) => {
    if (isUpdatingUI) return;

    const isChecked = e.target.checked;

    chrome.storage.local.set({ [t.id]: isChecked }, () => {
      chrome.storage.local.get(DEFAULTS, (config) => {

        const anyOn = featureToggles.some(x => !!config[x.id]);
        if (config.master !== anyOn) {
          config.master = anyOn;
          chrome.storage.local.set({ master: anyOn });
        }
        updateUI(config);
      });
    });
  });
});


const keyEls = Array.from(document.querySelectorAll('.key[data-cmd]'));
const hintEl = document.getElementById('shortcut-hint');

function prettyShortcut(s) {
  return s.split('+').join(' + ');
}

function refreshShortcuts() {
  chrome.commands.getAll((commands) => {
    if (chrome.runtime.lastError) return;
    const byName = {};
    (commands || []).forEach((c) => { byName[c.name] = c.shortcut || ''; });
    let missing = 0;
    keyEls.forEach((el) => {
      const assigned = byName[el.dataset.cmd];
      if (assigned) {
        el.textContent = prettyShortcut(assigned);
        el.classList.remove('unbound');
      } else {
        el.textContent = el.dataset.default;
        el.classList.add('unbound');
        missing++;
      }
    });
    hintEl.textContent = missing
      ? 'Phím mờ chỉ hoạt động trong trang web. Gán phím ở nút bên dưới để dùng được cả khi đang ở thanh địa chỉ, DevTools, trang chrome:// hoặc chọn "Global" để dùng ngoài trình duyệt.'
      : 'Đã gán đủ phím. Chọn "Global" ở trang gán phím nếu muốn dùng cả khi ngoài trình duyệt.';
  });
}

refreshShortcuts();

document.getElementById('open-shortcuts').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  window.close();
});
