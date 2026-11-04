const FEATURES = ['mouseleave', 'clipboard', 'contextmenu', 'fullscreen', 'visibility'];
const DEFAULTS = {
  master: true,
  mouseleave: true,
  clipboard: true,
  contextmenu: true,
  fullscreen: true,
  visibility: true
};

const APPS = {
  google: 'https://www.google.com/search?igu=1',
  chatgpt: 'https://chatgpt.com',
  deepseek: 'https://chat.deepseek.com',
  claude: 'https://claude.ai'
};

const COMMAND_MAP = {
  'toggle-all': { type: 'toggle' },
  'open-google': { type: 'open', appId: 'google' },
  'open-chatgpt': { type: 'open', appId: 'chatgpt' },
  'open-deepseek': { type: 'open', appId: 'deepseek' },
  'open-claude': { type: 'open', appId: 'claude' },
  'close-windows': { type: 'close' }
};

let queue = Promise.resolve();
function enqueue(task) {
  queue = queue.then(task).catch((err) => console.error('[Phantom Shield]', err));
  return queue;
}

const lastFire = {};
function gate(key) {
  const now = Date.now();
  if (lastFire[key] && now - lastFire[key] < 400) return false;
  lastFire[key] = now;
  return true;
}

async function getMap() {
  const data = await chrome.storage.session.get({ windowMap: {} });
  return data.windowMap || {};
}
async function setMap(map) {
  await chrome.storage.session.set({ windowMap: map });
}

let flashUntil = 0;

async function setBadge(text, color) {
  try {
    await chrome.action.setBadgeText({ text: text });
    await chrome.action.setBadgeBackgroundColor({ color: color });
  } catch (e) {}
}

async function refreshBadge() {
  if (Date.now() < flashUntil) return;
  let r = DEFAULTS;
  try { r = await chrome.storage.local.get(DEFAULTS); } catch (e) { return; }
  const on = FEATURES.some((k) => r[k]);
  await setBadge(on ? '' : 'OFF', '#d93025');
}

async function flashBadge(on) {
  await setBadge(on ? 'ON' : 'OFF', on ? '#1a73e8' : '#d93025');
  setTimeout(refreshBadge, 2300);
}

async function notifyTab(tabId, on) {
  let id = tabId;
  if (id == null) {
    try {
      const found = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      id = found && found[0] ? found[0].id : null;
    } catch (e) {}
  }
  if (id == null) return;
  try {
    await chrome.tabs.sendMessage(id, { action: 'toast', on: on }, { frameId: 0 });
  } catch (e) {}
}

async function toggleAll(tabId) {
  const r = await chrome.storage.local.get(DEFAULTS);
  const next = !FEATURES.some((k) => r[k]);
  const data = { master: next };
  FEATURES.forEach((k) => { data[k] = next; });
  flashUntil = Date.now() + 2200;
  await chrome.storage.local.set(data);
  await flashBadge(next);
  await notifyTab(tabId, next);
}

async function handleOpen(appId, url) {
  const map = await getMap();

  for (const key of Object.keys(map)) {
    if (key === appId || !map[key]) continue;
    try {
      await chrome.windows.update(map[key], { state: 'minimized' });
    } catch (e) {
      delete map[key];
    }
  }

  const existingId = map[appId];
  let win = null;
  if (existingId) {
    try { win = await chrome.windows.get(existingId); } catch (e) { win = null; }
  }

  if (!win) {
    delete map[appId];
    try {
      const created = await chrome.windows.create({
        url: url,
        type: 'popup',
        width: 375,
        height: 667,
        focused: true
      });
      if (created && created.id != null) map[appId] = created.id;
    } catch (e) {
      console.error('[Phantom Shield] Lỗi mở cửa sổ:', e);
    }
  } else if (win.focused && win.state !== 'minimized') {
    try { await chrome.windows.update(existingId, { state: 'minimized' }); } catch (e) {}
  } else {
    try {
      await chrome.windows.update(existingId, { focused: true, state: 'normal', drawAttention: false });
    } catch (e) {}
  }

  await setMap(map);
}

async function handleCloseAll() {
  const map = await getMap();
  for (const key of Object.keys(map)) {
    try { await chrome.windows.remove(map[key]); } catch (e) {}
  }
  await setMap({});
}

function perform(spec, tabId) {
  if (!spec) return;
  if (spec.type === 'toggle') {
    if (!gate('toggle')) return;
    enqueue(() => toggleAll(tabId));
  } else if (spec.type === 'open') {
    if (!gate('open:' + spec.appId)) return;
    enqueue(() => handleOpen(spec.appId, APPS[spec.appId]));
  } else if (spec.type === 'close') {
    if (!gate('close')) return;
    enqueue(handleCloseAll);
  }
}

function handleCommand(command, tab) {
  perform(COMMAND_MAP[command], tab ? tab.id : undefined);
}

chrome.commands.onCommand.addListener(handleCommand);

chrome.runtime.onMessage.addListener((request, sender) => {
  if (!request) return;
  const tabId = sender && sender.tab ? sender.tab.id : undefined;
  if (request.action === 'toggle-all') {
    perform({ type: 'toggle' }, tabId);
  } else if (request.action === 'open-window' && APPS[request.appId]) {
    perform({ type: 'open', appId: request.appId }, tabId);
  } else if (request.action === 'close-windows') {
    perform({ type: 'close' }, tabId);
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') refreshBadge();
});

chrome.windows.onRemoved.addListener((windowId) => {
  enqueue(async () => {
    const map = await getMap();
    let changed = false;
    for (const key of Object.keys(map)) {
      if (map[key] === windowId) { delete map[key]; changed = true; }
    }
    if (changed) await setMap(map);
  });
});

function isOlderThan52(v) {
  if (!v) return true;
  const p = v.split('.').map(Number);
  return p[0] < 5 || (p[0] === 5 && (p[1] || 0) < 2);
}

chrome.runtime.onInstalled.addListener(async (details) => {
  refreshBadge();
  if (details.reason !== 'install' && details.reason !== 'update') return;

  if (details.reason === 'update' && isOlderThan52(details.previousVersion)) return;

  let tabs = [];
  try { tabs = await chrome.tabs.query({}); } catch (e) { return; }

  for (const tab of tabs) {
    if (!tab.id || !tab.url || !/^(https?|file):/i.test(tab.url)) continue;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true }, files: ['spoof.js'], world: 'MAIN'
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true }, files: ['content.js']
      });
    } catch (e) {}
  }
});

refreshBadge();
