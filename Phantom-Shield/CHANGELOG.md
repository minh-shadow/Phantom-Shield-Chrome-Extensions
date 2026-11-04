# Phantom Shield — Change Log

Bản hiện tại: **5.3.0** — so sánh với **5.2.1**.
Code 5.2.1 nằm riêng trong `old/v5.2.1/`.

---

## Tóm tắt

| Hạng mục | 5.2.1 | 5.3.0 |
|---|---|---|
| Iframe `data:` / `blob:` | Không được bảo vệ | Được bảo vệ |
| Iframe tạo bằng `document.open()/write()` | Mất chặn event | Tự gắn lại listener, vẫn chặn |
| Phím tắt ở thanh địa chỉ, DevTools, `chrome://`, Web Store, PDF, New Tab | Không hoạt động | Hoạt động qua Commands API |
| Phím tắt ngoài trình duyệt | Không hoạt động | Hoạt động nếu đặt scope "Global" |
| Alt+Z | Xử lý trong `content.js` | Xử lý trong `background.js` |
| Phản hồi bật/tắt ở trang bị hạn chế | Không có | Badge trên icon |
| Bấm trùng một phím liên tiếp | Có thể kích hoạt kép | Chống trùng trong 400 ms |
| Phím tắt trong popup | Nhãn tĩnh | Hiện phím thực tế đang gán |
| Chrome tối thiểu | 111 | 119 |

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
