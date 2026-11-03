# 👻 Phantom Shield

<p align="center">
  <strong>Lướt web như một bóng ma. Kiểm soát trải nghiệm duyệt web của bạn.</strong>
  <br>
  Một tiện ích mở rộng Chrome giúp hạn chế các hành vi gây phiền nhiễu từ website và khôi phục quyền kiểm soát trình duyệt.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Google%20Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome">
  <img src="https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge" alt="Manifest V3">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Chrome-111%2B-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome 111+">
</p>

---

## 📖 Giới thiệu

**Phantom Shield** là tiện ích mở rộng dành cho Google Chrome, được xây dựng nhằm hạn chế một số hành vi can thiệp vào trải nghiệm duyệt web của người dùng.

Một số website sử dụng JavaScript để chặn thao tác chuột phải, can thiệp vào clipboard, hiển thị popup gây phiền nhiễu hoặc phát hiện trạng thái cửa sổ trình duyệt.

Phantom Shield cung cấp các mô-đun bảo vệ riêng biệt, giúp người dùng chủ động kiểm soát những hành vi này thông qua một giao diện điều khiển đơn giản.

> **Triết lý:** Trình duyệt thuộc quyền kiểm soát của người dùng, không phải của những đoạn mã gây phiền nhiễu trên website.

## 👨‍💻 Creator & Main Developer

<p align="center">
  <a href="https://github.com/minhhau361">
    <img src="https://img.shields.io/badge/GitHub-@minhhau361-181717?style=for-the-badge&logo=github" alt="GitHub Profile">
  </a>
  <br>
  <strong>@minhhau361</strong>
  <br>
  Main Developer · Project Creator
</p>

**[@minhhau361](https://github.com/minhhau361)** là người đóng góp chính và chịu trách nhiệm phát triển cốt lõi của Phantom Shield.

Các đóng góp chính:

- Xây dựng ý tưởng và định hướng phát triển dự án.
- Phát triển kiến trúc tiện ích Chrome.
- Triển khai các mô-đun bảo vệ và xử lý sự kiện.
- Xây dựng cơ chế tương tác với môi trường JavaScript của website.
- Thiết kế giao diện và trải nghiệm người dùng.
- Tối ưu, bảo trì và cải thiện các chức năng của dự án.

---

## ✨ Tính năng nổi bật

Phantom Shield được giới thiệu với 7 mô-đun chức năng chính:

| # | Tính năng | Mô tả |
|---|---|---|
| 01 | **Exit-Intent Protection** | Hạn chế các popup và sự kiện gây phiền nhiễu khi người dùng có ý định rời khỏi trang. |
| 02 | **Clipboard Protection** | Ngăn một số script website can thiệp vào thao tác sao chép, cắt và dán. |
| 03 | **Right-Click Restore** | Khôi phục menu chuột phải mặc định khi website chặn bằng JavaScript. |
| 04 | **Fullscreen Spoofing** | Điều chỉnh thông tin fullscreen mà website nhận được theo cơ chế của tiện ích. |
| 05 | **Focus Spoofing** | Điều chỉnh thông tin trạng thái hiển thị và focus mà website nhận được. |
| 06 | **Global Hotkey** | Sử dụng `Alt + Z` để bật hoặc tắt nhanh các mô-đun. |
| 07 | **Control Panel** | Giao diện popup tối giản để quản lý các chức năng riêng biệt. |

### ⚡ Điều khiển nhanh

- `Alt + Z` — Bật hoặc tắt nhanh các mô-đun theo thiết kế của tiện ích.
- Sử dụng popup để điều chỉnh từng chức năng.
- Một số mô-đun có thể cần tải lại trang để áp dụng đầy đủ.

---

## ⚙️ Cơ chế kỹ thuật

Phantom Shield sử dụng một số kỹ thuật JavaScript và Chrome Extension API để triển khai các chức năng.

### 1. Event Capture

Sử dụng cơ chế bắt sự kiện ở giai đoạn Capture Phase kết hợp với:

```javascript
event.stopImmediatePropagation();
```

Mục đích là hạn chế các listener khác trên trang tiếp tục xử lý một số sự kiện được bảo vệ.

Thiết kế này không chủ động gọi `preventDefault()` trong luồng xử lý được mô tả, nhằm tránh vô hiệu hóa hành vi mặc định của trình duyệt.

### 2. Main World Injection

Content Script của Chrome chạy trong môi trường cô lập (Isolated World), vì vậy không thể trực tiếp thay đổi các biến toàn cục của website.

Phantom Shield sử dụng phương pháp chèn script vào môi trường Main World để tương tác với các thuộc tính JavaScript của trang, bao gồm cơ chế:

```javascript
Object.defineProperty();
```

### 3. Shadow DOM

Thông báo Toast sử dụng Shadow DOM với chế độ đóng (Closed Shadow Root) nhằm cô lập cấu trúc và CSS của thành phần giao diện khỏi website.

### 4. UI State Synchronization

Sử dụng biến trạng thái `isUpdatingUI` để hạn chế các sự kiện thay đổi ngoài ý muốn trong quá trình đồng bộ cài đặt từ Chrome Storage với giao diện.

---

## 🧰 Công nghệ sử dụng

| Công nghệ | Vai trò |
|---|---|
| JavaScript | Xử lý logic và các mô-đun chức năng |
| HTML5 | Xây dựng cấu trúc giao diện |
| CSS3 | Thiết kế và tạo kiểu |
| Chrome Extension API | Tương tác với trình duyệt Chrome |
| Manifest V3 | Kiến trúc tiện ích mở rộng |
| Chrome Storage API | Lưu trữ cấu hình |
| Shadow DOM | Cô lập thành phần giao diện |

---

## 📥 Cài đặt

Hiện tại, bạn có thể cài đặt tiện ích từ mã nguồn bằng chế độ Developer Mode của Chrome.

### Yêu cầu

- Google Chrome phiên bản 111 trở lên.
- Mã nguồn dự án Phantom Shield.
- Trình duyệt hỗ trợ Chrome Extensions Manifest V3.

### Các bước cài đặt

**Bước 1.** Tải mã nguồn dự án về máy.

```bash
git clone https://github.com/minhhau361/phantom-shield.git
```

> Nếu repository có tên hoặc đường dẫn khác, hãy thay URL trên bằng URL GitHub thực tế.

**Bước 2.** Mở trang quản lý tiện ích:

```text
chrome://extensions/
```

**Bước 3.** Bật **Developer mode** ở góc trên bên phải.

**Bước 4.** Chọn **Load unpacked**.

**Bước 5.** Chọn thư mục chứa mã nguồn tiện ích.

**Bước 6.** Sau khi cài đặt thành công, ghim Phantom Shield lên thanh công cụ Chrome để sử dụng thuận tiện hơn.

---

## 🎮 Hướng dẫn sử dụng

1. Nhấn biểu tượng Phantom Shield trên thanh công cụ Chrome.
2. Mở bảng điều khiển tiện ích.
3. Bật hoặc tắt các mô-đun theo nhu cầu.
4. Sử dụng `Alt + Z` để chuyển đổi trạng thái nhanh.
5. Tải lại trang nếu sử dụng các mô-đun yêu cầu khởi tạo lại môi trường trang.

### Thời điểm áp dụng

| Nhóm chức năng | Cách áp dụng |
|---|---|
| Exit-Intent Protection | Có hiệu lực ngay sau khi được kích hoạt |
| Clipboard Protection | Có hiệu lực ngay sau khi được kích hoạt |
| Right-Click Restore | Có hiệu lực ngay sau khi được kích hoạt |
| Fullscreen Spoofing | Có thể cần tải lại trang |
| Focus Spoofing | Có thể cần tải lại trang |

---

## 🔒 Quyền riêng tư

Phantom Shield hướng tới trải nghiệm sử dụng tối giản và hạn chế việc thu thập dữ liệu.

Theo mô tả trên trang giới thiệu dự án:

- Không yêu cầu người dùng tạo tài khoản.
- Không sử dụng hệ thống telemetry.
- Không thực hiện kết nối mạng bên ngoài theo thiết kế được công bố.
- Cấu hình được lưu bằng `chrome.storage.local`.

**Lưu ý:** Đây là thông tin quyền riêng tư theo mô tả dự án. Người dùng nên kiểm tra mã nguồn thực tế và các quyền trong `manifest.json` trước khi sử dụng.

---

## ⚠️ Giới hạn và lưu ý

Một số website có cơ chế bảo vệ hoặc kiểm tra môi trường JavaScript riêng, vì vậy Phantom Shield có thể không hoạt động hoàn toàn giống nhau trên mọi trang.

| Trường hợp | Giới hạn |
|---|---|
| Google Meet và ứng dụng ngân hàng | Có thể phát hiện các thuộc tính JavaScript bị ghi đè. |
| Inline HTML Event Handler | Các handler như `onclick` có thể không bị chặn trong một số trường hợp. |
| Iframe | Phím tắt `Alt + Z` có thể không hoạt động trong một số iframe cô lập. |
| Fullscreen và Focus | Có thể cần tải lại trang để áp dụng thay đổi. |

**Khuyến nghị:** Nếu website gặp lỗi tương thích, hãy tắt mô-đun liên quan hoặc tạm thời vô hiệu hóa tiện ích trên trang đó.

Không nên sử dụng tiện ích để vượt qua cơ chế bảo mật, kiểm soát truy cập hoặc các biện pháp bảo vệ hợp pháp của website.

---

## 🛠️ Đóng góp cho dự án

Phantom Shield luôn hoan nghênh các ý tưởng cải tiến, báo lỗi và đóng góp từ cộng đồng.

Bạn có thể tham gia bằng cách:

1. Fork repository.
2. Tạo một nhánh mới cho thay đổi của mình.
3. Thực hiện chỉnh sửa và kiểm thử.
4. Gửi Pull Request để đề xuất đóng góp.

Ví dụ:

```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

Nếu phát hiện lỗi hoặc có đề xuất mới, hãy tạo một **GitHub Issue** kèm mô tả và các bước tái hiện lỗi.

---

## 📜 License

Theo thông tin được công bố trên trang giới thiệu, dự án sử dụng giấy phép **MIT License**.

Vui lòng kiểm tra file `LICENSE` trong repository để xác nhận điều khoản cấp phép chính thức.

---

## 🌟 Support

Nếu bạn thấy Phantom Shield hữu ích:

- ⭐ Star repository để ủng hộ dự án.
- 🐛 Báo cáo lỗi thông qua Issues.
- 💡 Đề xuất tính năng mới.
- 🔀 Đóng góp mã nguồn thông qua Pull Requests.

<p align="center">
  <strong>Phantom Shield</strong>
  <br>
  <i>Browse freely. Stay in control.</i>
  <br><br>
  Developed with dedication by <a href="https://github.com/minhhau361">@minhhau361</a>
</p>
