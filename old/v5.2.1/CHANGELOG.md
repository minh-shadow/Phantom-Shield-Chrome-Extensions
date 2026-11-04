# Phantom Shield — Change Log

Bản hiện tại: **5.2.1** — so sánh với **5.1.0**.

---

## Tóm tắt

| Hạng mục | 5.1.0 | 5.2.1 |
|---|---|---|
| Bật/tắt (Alt+Z, popup) | Phần fullscreen/visibility phải F5 mới có tác dụng | Có hiệu lực ngay |
| Thời điểm nạp spoof | Nạp trễ, chờ storage rồi mới chèn `<script>` | Manifest nạp đồng bộ ở `document_start` (MAIN world) |
| Sau khi reload extension | Tab cũ hỏng, phải F5 từng tab | Tự nạp lại vào tab đang mở |
| Chặn event | Chặn toàn bộ | Chặn toàn bộ (giữ nguyên mức mạnh), thêm vài event mới |
| `addEventListener` | Bị ghi đè, listener bị mất vĩnh viễn | Không ghi đè |
| Cửa sổ Alt+X/C/V/B/D | Bấm nhanh có thể tạo 2 cửa sổ / mất ID | Hàng đợi nối tiếp, không còn race |
| Popup | Lần đầu hiển thị lệch trạng thái | Đúng trạng thái, tự đồng bộ |

---

## 5.2.1 (so với 5.1.0)

### Giữ nguyên mức chặn mạnh
- Chặn **toàn bộ** các sự kiện sau, trên mọi phần tử và mọi frame, không lọc:
  - `mouseout`, `mouseleave`
  - `resize`
  - `blur`, `focus`
  - `contextmenu`
  - `copy`, `paste`, `cut`
  - `visibilitychange`
- Cửa sổ AI (ChatGPT/Claude/DeepSeek) cũng bị chặn copy/paste/chuột phải như các trang khác. Muốn miễn trừ trang nào, thêm tên miền vào `CLIPBOARD_ALLOW_HOSTS` ở đầu `content.js` (mặc định để trống).

### Sửa lỗi
- **Phải F5 sau khi bật/tắt:** `spoof.js` không còn bị đóng cứng theo cấu hình lúc load trang. Mọi hook đọc trạng thái mỗi lần được gọi.
- **Lúc được lúc không:** hết race-condition do nạp trễ (storage bất đồng bộ + `<script src>` bất đồng bộ).
- **Mất listener vĩnh viễn:** bỏ phần ghi đè `addEventListener` và các `onvisibilitychange/onblur/onfocus`, nên tắt tính năng là trang trở lại bình thường.
- **Extension reload làm tab hỏng:** `background.js` tự nạp lại script vào tab đang mở; instance mới tự vô hiệu hóa instance cũ nên không còn trạng thái chặn "ma".
- **Tạo trùng cửa sổ / mất ID cửa sổ:** mọi thao tác cửa sổ chạy qua một hàng đợi nối tiếp; tự dọn `windowMap` khi bạn tự đóng cửa sổ.
- **Popup lệch trạng thái:** bản cũ đọc storage không kèm giá trị mặc định nên các nút chưa lưu hiển thị là tắt dù thực tế đang bật.
- **Nút Master không khớp nút con:** Master tự tắt khi tất cả nút con tắt, tự bật khi có nút con bật.
- **Vỡ layout trong cửa sổ popup 375×667 và iframe:** kích thước cửa sổ chỉ bị giả ở top frame và khi cửa sổ thật rộng từ 700px.
- **`fullscreenElement` luôn có giá trị:** nếu trang đang fullscreen thật thì trả phần tử thật.
- **Iframe `about:blank` / `srcdoc` không được bảo vệ:** đã thêm `match_about_blank`.

### Thêm mới
- Chặn thêm `pointerleave`, `pointerout`, `webkitvisibilitychange`.
- Popup tự cập nhật khi bấm Alt+Z ở trang web.
- Cơ chế "takeover" giữa các instance `content.js`.
- Danh sách `FULLSCREEN_SKIP_HOSTS` (YouTube, Netflix, Twitch, Vimeo và các trang AI): ở các trang này không giả fullscreen và không chặn `fullscreenchange` của video.
- Chỉ nối `spoof.js` với `content.js` bằng CustomEvent nội bộ (`__ps_cfg_v2`, `__ps_req_v2`, `__ps_takeover_v2`).
- `CHANGELOG.md` và `manifest.old.json` (manifest 5.1.0 để đối chiếu, Chrome bỏ qua).

### Thay đổi kỹ thuật
- `manifest.json`: version `5.2.1`; thêm `minimum_chrome_version: 111`; thêm quyền `scripting`; khai báo `spoof.js` (world `MAIN`) và `content.js` là content script riêng, cùng `run_at: document_start`, `all_frames`, `match_about_blank`.
- `spoof.js`: hook getter giữ lại getter gốc và đọc trạng thái trực tiếp; chỉ hook thuộc tính mà trình duyệt thật sự có; có cờ chống nạp 2 lần.
- `content.js`: không còn tự chèn `<script>`; toast dùng `textContent` thay vì `innerHTML`; lỗi gửi message được bắt bằng `.catch`.
- `background.js`: viết lại bằng `async/await`; thêm `onRemoved` và `onInstalled`.
- `popup.js`: luôn đọc storage kèm giá trị mặc định.
- Toàn bộ comment trong code (JS, CSS và HTML của `popup.html`) đã bị xóa; mỗi file `.js` chỉ còn một dòng ghi chú trỏ về bản 5.1.0 trong file zip gốc.

### Loại bỏ
- `web_accessible_resources` (không còn cần, và giảm nguy cơ trang dò ra extension).
- Truyền cấu hình qua query `?fs=...&vis=...` của `spoof.js`.
- Ghi đè `addEventListener` và các handler `onvisibilitychange/onblur/onfocus`.
- Ghi đè kích thước cửa sổ và `fullscreenElement` ở mọi frame, mọi lúc.

---

## Lưu ý khi nâng cấp từ 5.1.0
1. Cần Chrome từ bản **111** trở lên.
2. Nạp lại extension (hoặc xóa bản cũ rồi Load unpacked bản mới).
3. Các tab đang mở cần **F5 một lần** vì còn chứa mã 5.1.0. Từ 5.2.x trở đi không cần nữa.

## Lưu ý còn tồn tại
- Chặn toàn bộ `mouseout`/`pointerout`, `resize`, `blur`/`focus` sẽ làm hỏng một số trang dùng chúng cho hover, layout JS hoặc xử lý ô nhập liệu. Đây là đánh đổi của việc chặn mạnh.
- Trước khi nhận cấu hình (vài mili-giây đầu mỗi trang), mọi tính năng mặc định là bật.
- Một số kiểu phát hiện khác (ví dụ `focusin/focusout`) chưa được chặn.
- Chưa kiểm tra trên Chrome thật: mới kiểm tra cú pháp và chạy thử giả lập.
