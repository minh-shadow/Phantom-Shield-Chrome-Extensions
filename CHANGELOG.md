# Phantom Shield — Change Log

Bản hiện tại: **5.3.1** — so sánh với **5.3.0**.
Lịch sử bản 5.3.0 (so với 5.2.1) nằm ở cuối file. Code 5.2.1 nằm trong `old/v5.2.1/`.

---

## Tóm tắt 5.3.0 → 5.3.1

| Hạng mục | 5.3.0 | 5.3.1 |
|---|---|---|
| Trang gỡ lớp chặn bằng sự kiện `__ps_takeover_v2` | Gỡ được | Không gỡ được |
| Trang giả cấu hình bằng sự kiện `__ps_cfg_v2` | Giả được | Không giả được |
| Trang đọc cấu hình extension bằng `__ps_req_v2` | Đọc được | Không đọc được |
| `selectstart` / `dragstart` bị trang `preventDefault` | Lọt | Chặn |
| `keydown` Ctrl+C/V/X/A, Ctrl+U, F12, Ctrl+Shift+I/J/C bị trang hủy | Lọt | Chặn |
| CSS `user-select: none` do trang áp | Giữ nguyên | Ghi đè thành `text` |
| Exit-intent bằng `mousemove` chạm mép trên (`clientY <= 0`) | Lọt | Chặn |
| `freeze` / `resume` | Lọt | Chặn (theo công tắc Visibility) |
| `pagehide` / `pageshow` / `beforeunload` | Lọt | Vẫn lọt, **cố ý** (xem bên dưới) |
| Popup chặn copy/paste/chuột phải của chính nó | Có (lỗi) | Đã bỏ |
| Kết quả trang test bổ sung | 175 chặn · **2 lọt** · **9 chưa có lớp** · 1 bỏ qua | 182 chặn · **0 lọt** · **4 chưa có lớp** · 1 bỏ qua |
| `manifest.json` version | 5.3.0 | 5.3.1 (không đổi quyền, không đổi `commands`) |

---

## 5.3.1 (so với 5.3.0)

### Sửa lỗi bảo mật
- **Trang gỡ được lớp chặn (`__ps_takeover_v2`):** `content.js` từng gửi và nghe một sự kiện DOM tên cố định để bản cũ tự gỡ khi nạp lại. Trang web gửi cùng sự kiện là tắt được toàn bộ lớp chặn. Đã **bỏ cơ chế này**. Việc thay bản cũ nay dùng một tham chiếu nằm trong isolated world (`window.__psDispose`), trang không nhìn thấy và không gọi được.
- **Trang giả cấu hình (`__ps_cfg_v2`):** `spoof.js` từng tin mọi sự kiện cùng tên, nên trang có thể tắt spoof visibility/fullscreen. Nay kênh cấu hình hoạt động như sau:
  1. `content.js` sinh khóa ngẫu nhiên 96 bit (`crypto.getRandomValues`) cho mỗi lần tải trang.
  2. Gửi khóa một lần qua sự kiện `__ps_hello_v3` ngay lúc `document_start`.
  3. `spoof.js` nhận khóa **đầu tiên** rồi bỏ qua mọi hello sau; từ đó chỉ nghe sự kiện `__ps_<khóa>`.
  4. Mọi cấu hình đi qua tên sự kiện chứa khóa, trang không đoán được nên không giả được.
- **Trang đọc cấu hình (`__ps_req_v2`):** đã bỏ sự kiện yêu cầu cấu hình; `content.js` chủ động đẩy cấu hình.

### Thêm lớp chặn
Tất cả gắn ở pha capture trên `window` và tôn trọng công tắc tương ứng trong popup.

| Sự kiện | Công tắc | Cách xử lý |
|---|---|---|
| `selectstart` | Clipboard | Chặn, trừ khi đích là ô nhập (`input`, `textarea`, `select`, vùng `contenteditable`). |
| `dragstart` | Clipboard | Chặn, trừ phần tử `[draggable="true"]`, liên kết `a[href]` và ảnh `img` để kéo thả thật vẫn hoạt động. |
| `keydown` Ctrl/Cmd + C, V, X, A | Clipboard | Chặn trang hủy phím, trừ khi đang ở ô nhập. |
| `keydown` Ctrl/Cmd + U, F12, Ctrl/Cmd + Shift + I/J/C | Right-Click | Chặn trang hủy phím. |
| `mousemove` khi `clientY <= 0` | Exit-Intent | Chặn khi không đang giữ nút chuột (không phá thao tác kéo). |
| `freeze`, `resume` | Focus | Chặn cùng nhóm với `visibilitychange`. |
| CSS `user-select: none` | Clipboard | Ghi đè bằng stylesheet `!important` (`adoptedStyleSheets`, dự phòng `<style>`), bỏ qua `input`, `textarea`, `select`, `button`, `[contenteditable]`. |

### Sửa lỗi khác
- `popup.js`: bỏ đoạn chặn `copy`, `paste`, `cut`, `contextmenu` ngay trong cửa sổ popup.

### Cố ý không thay đổi
- **`pagehide` / `pageshow` / `beforeunload`:** chặn sẽ làm hỏng khôi phục trang (bfcache), mất cảnh báo “chưa lưu” và việc gửi dữ liệu khi rời trang. Có thể thêm thành công tắc riêng, mặc định tắt, ở bản sau.
- **Dấu vết nhận diện extension** (Symbol `phantom.shield.spoof.v2`, `Function.prototype.toString`, đồng bộ chéo các tín hiệu fullscreen): không xử lý, vì nhóm này chỉ có tác dụng giúp trang không nhận ra extension.

### Thay đổi kỹ thuật theo file
| File | Thay đổi |
|---|---|
| `manifest.json` | `version` 5.3.0 → 5.3.1. |
| `spoof.js` | Bỏ `__ps_cfg_v2`, `__ps_req_v2`; thêm nhận khóa qua `__ps_hello_v3` (chỉ nhận lần đầu, kiểm tra định dạng); `MutationObserver` gắn lại listener đúng loại sau `document.open()`. |
| `content.js` | Bỏ `__ps_takeover_v2`; thêm sinh khóa, `window.__psDispose`; thêm 6 loại sự kiện (`WINDOW_ONLY_EVENTS`); thêm `isGuardedKey`, `isEditable`, `inDraggable`; thêm `applySelectCss()` gọi khi đổi cấu hình và khi `document.open()`; trả lại CSS khi extension bị gỡ lớp bảo vệ. |
| `popup.js` | Xóa khối chặn sự kiện ở đầu file. |
| `background.js`, `popup.html` | Không đổi. |

### Tác dụng phụ cần biết
- Trang web có **phím tắt riêng** dùng Ctrl+A/C/V/X/U ở vùng không phải ô nhập (ví dụ canvas, trình soạn thảo tự dựng) có thể mất phím đó khi bật Clipboard / Right-Click. Tắt mô-đun tương ứng nếu gặp.
- Trang cần thao tác ở **mép trên cùng** (thanh công cụ tự ẩn) có thể phản ứng kém khi bật Exit-Intent.
- `user-select: text` áp rộng có thể làm văn bản trên nút, thanh điều hướng dễ bị bôi đen hơn bình thường.

### Kiểm thử
Chromium 153 + trang `psx-addon-preview.html` phục vụ qua `http://localhost`:

| | Chặn | Lọt | Chưa có lớp | Bỏ qua |
|---|:-:|:-:|:-:|:-:|
| 5.3.0 | 175 | 2 | 9 | 1 |
| 5.3.1 | 182 | 0 | 4 | 1 |

- 4 mục còn “chưa có lớp” là: Symbol, `toString`, đồng bộ fullscreen (không xử lý, có chủ đích) và `pagehide`/`pageshow`/`beforeunload` (không chặn, có chủ đích).
- Mục “bỏ qua” là phép đo kích thước cửa sổ, chỉ chạy khi cửa sổ nhỏ hơn màn hình rõ rệt.
- **Chưa kiểm thử:** thao tác thủ công trong popup, các website thật, phím tắt cấp hệ điều hành, và các trình duyệt ngoài Chromium.

### Nâng cấp từ 5.3.0
1. Nhấn **Reload** extension tại `chrome://extensions/`.
2. **F5 mọi tab đang mở.** Bắt buộc: tab nào chưa tải lại vẫn dùng mã 5.3.0 (còn lỗ hổng), và khóa mới của `content.js` sẽ không khớp với `spoof.js` cũ nên đổi công tắc sẽ không tác động tới Fullscreen/Focus cho đến khi tải lại.
3. Không cần gán lại phím tắt.

---

## 5.3.0 (so với 5.2.1)

### Sửa lỗi
- **Iframe `data:` / `blob:` không được nạp:** thêm `match_origin_as_fallback: true` cho cả `spoof.js` (MAIN) và `content.js`. Đã chạy thử trên Chrome 153: bản 5.2.1 để lọt `data:` và `blob:`, bản 5.3.0 chặn đủ cả hai.
- **Iframe `document.open()/write()` mất chặn:** trình duyệt xóa toàn bộ listener khi gọi `document.open()`. `content.js` và `spoof.js` nay dùng `MutationObserver` để gắn lại listener ngay sau đó.
- **Phím tắt Alt+X/C/V/B/D/Z không chạy ở thanh địa chỉ, DevTools, trang bị hạn chế:** thêm khối `commands` trong manifest. Phím Alt trong trang web vẫn chạy như cũ.

### Thêm mới
- 6 command: `toggle-all`, `open-google`, `open-chatgpt`, `open-deepseek`, `open-claude`, `close-windows`.
- Tự gán 4 phím: Alt+Z, Alt+X, Alt+C, Alt+V. Alt+B và Alt+D cần gán tay (Chrome chỉ cho đề xuất tối đa 4 phím).
- Badge trên icon: `OFF` khi tắt hết, nháy `ON`/`OFF` khi bấm Alt+Z.
- Popup hiện phím đang được gán, phím chưa gán hiển thị mờ, có nút mở `chrome://extensions/shortcuts`.
- Chặn thêm `focusin` / `focusout`, chỉ khi nhắm vào window/document hoặc cửa sổ đã mất focus thật.

### Thay đổi kỹ thuật
- `manifest.json`: version `5.3.0`; `minimum_chrome_version` `119`; thêm `commands`; thêm `match_origin_as_fallback` cho cả hai content script.
- `background.js`: thêm `chrome.commands.onCommand`; chuyển logic bật/tắt toàn bộ (Alt+Z) từ `content.js` sang đây; thêm chống kích hoạt kép 400 ms; thêm badge; popup tên `appId` được ánh xạ về URL ngay tại background thay vì tin URL từ trang.
- `content.js`: Alt+Z và các phím Alt gửi message về background; nhận message `toast` để hiện thông báo ở top frame; thêm `rebind()` và `MutationObserver`.
- `spoof.js`: thêm `MutationObserver` gắn lại listener cấu hình sau `document.open()`.
- `popup.html` / `popup.js`: thêm khu vực hiển thị phím tắt, gợi ý và nút gán phím.

---

## Gán phím tắt

| Chức năng | Phím | Trạng thái |
|---|---|---|
| Bật/Tắt toàn bộ | Alt+Z | Tự gán |
| Google Search | Alt+X | Tự gán |
| ChatGPT | Alt+C | Tự gán |
| DeepSeek | Alt+V | Tự gán |
| Claude AI | Alt+B | Cần gán tay |
| Đóng tất cả cửa sổ | Alt+D | Cần gán tay |

1. Mở popup, bấm **Gán phím tắt toàn trình duyệt** (hoặc vào `chrome://extensions/shortcuts`).
2. Gán Alt+B cho "Claude AI" và Alt+D cho "Đóng tất cả cửa sổ".
3. Muốn dùng cả khi ở ngoài trình duyệt: đổi ô "Trong Chrome" thành **Toàn cầu (Global)** cho từng lệnh.

---

## Lưu ý khi nâng cấp từ 5.2.1
1. Cần Chrome từ bản **119** trở lên.
2. Nạp lại extension; các tab đang mở được nạp lại tự động.
3. Vào `chrome://extensions/shortcuts` gán Alt+B và Alt+D.

## Lưu ý còn tồn tại
- Phím mà hệ điều hành hoặc Chrome dành riêng luôn được ưu tiên và không thể ghi đè.
- Trên Windows, Alt+D mặc định là "chọn thanh địa chỉ"; nếu tranh chấp, gán phím khác cho lệnh này.
- Điều hướng cấp cao nhất tới URL `data:` bị chính Chrome chặn; chỉ iframe `data:` được bảo vệ.
- Chặn toàn bộ `mouseout`/`pointerout`, `resize`, `blur`/`focus` vẫn có thể làm hỏng một số trang.
- Trước khi nhận cấu hình (vài mili-giây đầu mỗi trang), mọi tính năng mặc định là bật.
- Đã kiểm thử trên Chrome 153 thật (Playwright): iframe, phím trong trang, command, chống kích hoạt kép, badge, popup. Chưa kiểm thử được phím tắt cấp hệ điều hành (focus ở thanh địa chỉ, DevTools, Global).
