['copy', 'paste', 'cut', 'contextmenu'].forEach(eventType => {
  document.addEventListener(eventType, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

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

// MÃ CŨ: popup.js phiên bản 5.1.0 nằm trong file Phantom-Shield.zip gốc
