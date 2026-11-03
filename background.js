chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'open-window') {
    chrome.storage.session.get({ windowMap: {} }, (data) => {
      let map = data.windowMap;
      let existingId = map[request.appId];

      // 1. THU NHỎ TẤT CẢ CÁC CỬA SỔ KHÁC (Độc quyền)
      for (let key in map) {
        if (key !== request.appId && map[key]) {
          chrome.windows.update(map[key], { state: 'minimized' }, () => {
            // Bỏ qua lỗi nếu người dùng đã tự tay đóng cửa sổ đó
            if (chrome.runtime.lastError) {
              delete map[key];
              chrome.storage.session.set({ windowMap: map });
            }
          });
        }
      }

      // 2. XỬ LÝ CỬA SỔ HIỆN TẠI
      if (existingId) {
        chrome.windows.get(existingId, { populate: true }, (win) => {
          if (chrome.runtime.lastError || !win) {
            // Nếu cửa sổ đã bị đóng hẳn -> Tạo mới
            createNewWindow(request.appId, request.url);
          } else {
            if (win.focused && win.state !== 'minimized') {
              // Đang hiển thị -> Bấm phím lần nữa để Thu nhỏ (Ẩn đi)
              chrome.windows.update(existingId, { state: 'minimized' });
            } else {
              // Đang ẩn -> Gọi lên (Không nháy Taskbar)
              chrome.windows.update(existingId, { 
                focused: true, 
                state: 'normal', 
                drawAttention: false 
              });
            }
          }
        });
      } else {
        createNewWindow(request.appId, request.url);
      }
    });
  } 
  else if (request.action === 'close-windows') {
    chrome.storage.session.get({ windowMap: {} }, (data) => {
      let map = data.windowMap;
      for (let key in map) {
        chrome.windows.remove(map[key], () => { if (chrome.runtime.lastError) {} });
      }
      chrome.storage.session.set({ windowMap: {} }); 
    });
  }
});

function createNewWindow(appId, url) {
  // Kích thước chuẩn iPhone SE
  const width = 375;
  const height = 667;

  chrome.windows.create({ 
    url: url, 
    type: 'popup', 
    width: width,
    height: height,
    focused: true
  }, (win) => {
    if (chrome.runtime.lastError) {
      console.error('[Phantom Shield] Lỗi mở cửa sổ:', chrome.runtime.lastError);
    } else {
      chrome.storage.session.get({ windowMap: {} }, (data) => {
        let map = data.windowMap;
        map[appId] = win.id;
        chrome.storage.session.set({ windowMap: map });
      });
    }
  });
}