// Bảo mật: Chặn copy/paste/chuột phải
['copy', 'paste', 'cut', 'contextmenu'].forEach(eventType => {
  document.addEventListener(eventType, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

const keys = ['master', 'mouseleave', 'clipboard', 'contextmenu', 'fullscreen', 'visibility'];
const featureRows = document.querySelectorAll('.feature-row');
const masterToggle = document.getElementById('master');
const featureToggles = Array.from(document.querySelectorAll('.feature-row input[type="checkbox"]'));

// CỜ CHẶN: Ngăn sự kiện change tự động kích hoạt khi code đang cập nhật UI
let isUpdatingUI = false; 

function updateUI(config) {
  isUpdatingUI = true; // Bật cờ lên

  keys.forEach(k => {
    const el = document.getElementById(k);
    if (el) el.checked = config[k];
  });
  
  featureRows.forEach(row => {
    if (!config.master) row.classList.add('disabled');
    else row.classList.remove('disabled');
  });

  // Tắt cờ sau một nhịp để DOM kịp render xong
  setTimeout(() => { isUpdatingUI = false; }, 50);
}

// Khởi tạo UI ban đầu
chrome.storage.local.get({
  master: true,
  mouseleave: true,
  clipboard: true,
  contextmenu: true,
  fullscreen: true,
  visibility: true
}, updateUI);

// Sự kiện khi NGƯỜI DÙNG bấm nút MASTER
masterToggle.addEventListener('change', (e) => {
  if (isUpdatingUI) return; // Nếu đang tự động cập nhật thì bỏ qua

  const isChecked = e.target.checked;
  const updateData = { master: isChecked };
  
  // Bật/tắt toàn bộ các nút con theo nút Master
  featureToggles.forEach(t => {
    t.checked = isChecked;
    updateData[t.id] = isChecked;
  });

  chrome.storage.local.set(updateData, () => {
    chrome.storage.local.get(keys, updateUI);
  });
});

// Sự kiện khi NGƯỜI DÙNG bấm từng nút CON
featureToggles.forEach(t => {
  t.addEventListener('change', (e) => {
    if (isUpdatingUI) return; // Nếu đang tự động cập nhật thì bỏ qua

    const isChecked = e.target.checked;
    
    chrome.storage.local.set({ [t.id]: isChecked }, () => {
      chrome.storage.local.get(keys, (config) => {
        // Nếu người dùng bật 1 nút con mà nút Master đang tắt -> Tự động bật Master
        if (isChecked && !config.master) {
           config.master = true;
           chrome.storage.local.set({ master: true });
        }
        updateUI(config);
      });
    });
  });
});