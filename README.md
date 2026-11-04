<div align="center">

# 👻 Phantom Shield

### Trình duyệt của bạn. Quyền của bạn.

**Một tiện ích Chrome nhỏ, mã nguồn mở, không thu thập dữ liệu, giúp bạn lấy lại những quyền cơ bản mà nhiều website đã âm thầm tước đi: chuột phải, sao chép, chọn chữ, và rời trang mà không bị làm phiền.**

<p align="center">
  <img src="https://img.shields.io/badge/Phantom_Shield-Browse_Freely-181717?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Phantom Shield">
  <img src="https://img.shields.io/badge/Version-5.3.1-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Platform-Chrome_119+-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome">
  <img src="https://img.shields.io/badge/Telemetry-None-success?style=for-the-badge" alt="No telemetry">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-ff69b4?style=for-the-badge" alt="PRs welcome">
</p>

<p align="center">
  <a href="https://phantomshield.oneapp.dev/"><b>🌐 Website</b></a>
  &nbsp;·&nbsp;
  <a href="https://phantomshield.oneapp.dev/test.html"><b>🧪 Tự kiểm thử ngay</b></a>
  &nbsp;·&nbsp;
  <a href="#-cài-đặt-trong-1-phút"><b>📥 Cài đặt</b></a>
  &nbsp;·&nbsp;
  <a href="#-cùng-xây-dựng-phantom-shield"><b>🤝 Cùng đóng góp</b></a>
</p>

<p align="center">
  <!-- TODO: UPLOAD ẢNH GIAO DIỆN TIỆN ÍCH PHANTOM SHIELD -->
  <img src="./docs/images/preview.png" alt="Phantom Shield Extension Preview" width="850">
</p>

<p align="center">
  <i>Phantom Shield – Browse Freely. Stay in Control.</i>
</p>

<!-- GỢI Ý: thêm một ảnh GIF 10 giây "trước / sau" (docs/images/demo.gif) ngay dưới ảnh preview.
     README có GIF demo thường nhận nhiều sao hơn rõ rệt. -->

</div>

> 🇬🇧 **TL;DR (English):** Phantom Shield is a lightweight, open-source, zero-telemetry Chrome extension (Manifest V3) that restores browser behaviors websites often override: right-click, copy/paste, text selection, exit-intent popups, and over-eager focus/fullscreen tracking. Every module toggles independently, the code is a few plain JS files you can read in an afternoon, and a public test page shows exactly what is and isn't blocked.

---

## 📑 Mục lục

[Vấn đề](#-vấn-đề-bạn-có-thể-đang-gặp) · [Trước & sau](#-trước--sau) · [Vì sao chọn](#-vì-sao-chọn-phantom-shield) · [Cá nhân](#-lợi-ích-cho-cá-nhân) · [Tổ chức](#-lợi-ích-cho-tổ-chức) · [Phù hợp?](#-ai-nên-và-không-nên-dùng) · [Tính năng](#-tính-năng) · [Kiểm thử](#-website--trang-kiểm-thử) · [Cài đặt](#-cài-đặt-trong-1-phút) · [Sử dụng](#-hướng-dẫn-sử-dụng) · [Riêng tư](#-quyền-riêng-tư--minh-bạch) · [Cách hoạt động](#️-cách-hoạt-động) · [Giới hạn](#-giới-hạn-đã-biết) · [Trách nhiệm](#-sử-dụng-có-trách-nhiệm) · [FAQ](#-câu-hỏi-thường-gặp) · [Đóng góp](#-cùng-xây-dựng-phantom-shield)

---

## 😤 Vấn đề bạn có thể đang gặp

- Bấm chuột phải để lưu ảnh hoặc dịch một đoạn văn thì **không có gì xảy ra**.
- Bôi đen đoạn chữ để copy thì **bị khóa**.
- Vừa đưa chuột lên thanh tab, một popup **“Khoan đã, đừng đi!”** bật ra.
- Chuyển sang tab khác để tra cứu, quay lại thì **video đã dừng, bài đọc bị khóa**.

Tất cả đều là JavaScript của website quyết định thay bạn. **Phantom Shield** đứng giữa và trả quyết định về cho người dùng, qua các mô-đun độc lập mà bạn bật/tắt bằng một cú bấm.

> **Triết lý:** *Your browser belongs to you.* Trình duyệt là của bạn, không phải của trang web bạn đang ghé thăm.

---

## 🔄 Trước & sau

| Tình huống | Không có Phantom Shield | Có Phantom Shield |
|---|---|---|
| Chuột phải trên trang khóa menu | Không phản hồi | Menu gốc của trình duyệt hiện ra |
| Bôi đen và copy văn bản | Bị chặn / không chọn được | Chọn và sao chép bình thường |
| Chuột chạm mép trên (định đóng tab) | Popup “ở lại thêm chút” | Trang không nhận ra, không popup |
| Chuyển tab để tra cứu | Trang phản ứng, khóa hoặc tạm dừng | Trang không bị báo là bạn vừa rời đi |
| Muốn trở về hành vi bình thường | Phải gỡ extension | Nhấn `Alt + Z`, mọi thứ tắt ngay |

---

## 💡 Vì sao chọn Phantom Shield?

Đã có những extension “bật chuột phải” hay “cho phép copy”. Vậy Phantom Shield khác ở đâu?

| Tiêu chí | Phantom Shield | Extension đơn chức năng (thường gặp)* |
|---|---|---|
| Phạm vi | 7 mô-đun trong một, kiểm soát từng cái | Mỗi cái một việc, phải cài nhiều |
| Iframe | Phủ `about:blank`, `srcdoc`, `sandbox`, `blob:`, `data:`, `document.write`, iframe lồng | Thường chỉ trang chính |
| Trang web “chống lại” | Từ 5.3.1, trang không tắt hay giả được cấu hình extension qua sự kiện DOM | Thường không xử lý |
| Kiểm chứng | Có trang kiểm thử công khai, bạn tự thấy chặn gì, lọt gì | Thường chỉ có lời mô tả |
| Dữ liệu | Không tài khoản, không telemetry, không gọi mạng ra ngoài | Tùy extension, nên tự kiểm tra |
| Đọc hiểu mã | Vài file JS thuần, không bundler, không làm rối | Tùy extension |
| Nói thẳng giới hạn | Có mục [Giới hạn đã biết](#-giới-hạn-đã-biết) | Hiếm |

<sub>* Mang tính tham khảo. Mỗi extension khác nhau, hãy tự đối chiếu với thứ bạn đang dùng.</sub>

Ngoài ra:

- 🛡️ **Quyền nằm ở bạn:** không có chế độ tự động nào làm việc sau lưng bạn.
- ⚡ **Nhẹ:** không framework, không thư viện bên thứ ba.
- 🔍 **Dễ tin:** đừng tin lời, hãy đọc `manifest.json` và vài file `.js` trong repo.

---

## 👤 Lợi ích cho cá nhân

**Học tập & nghiên cứu**
- Copy đoạn trích để ghi chú, trích dẫn nguồn, hoặc đưa vào công cụ dịch và đọc hộ.
- Bôi đen, kéo thả văn bản trên trang cố tình khóa việc chọn chữ.

**Làm việc hằng ngày**
- Chuột phải trở lại: lưu ảnh, mở liên kết ở tab mới, “Dịch sang tiếng Việt”, tìm kiếm bằng văn bản đang chọn.
- Hết popup “ở lại thêm chút nữa” mỗi lần di chuột lên thanh tab.
- Làm nhiều việc cùng lúc: chuyển tab tra cứu mà bài đọc hay video không tự khóa hoặc tự dừng.

**Tự chủ với màn hình**
- Các trang hay ép toàn màn hình hoặc phản ứng với việc đổi kích thước cửa sổ sẽ bớt quấy rầy bạn.
- Một phím `Alt + Z` để về “duyệt web bình thường” khi cần.

---

## 🏢 Lợi ích cho tổ chức

| Đối tượng | Giá trị | Lưu ý trung thực |
|---|---|---|
| **Doanh nghiệp, văn phòng** | Giảm ma sát với ứng dụng web nội bộ hoặc cổng thông tin khóa copy/chuột phải: sao chép số liệu, mã đơn, đoạn văn vào báo cáo nhanh hơn. | Triển khai theo chính sách nội bộ. |
| **Nhóm QA, UX, sản phẩm** | Kiểm tra website của chính mình: trang phản ứng ra sao với `mouseleave`, `visibilitychange`, `fullscreenchange`, `blur/focus`. Bật/tắt từng nhóm sự kiện để tái hiện lỗi. | Dùng trên môi trường test của bạn. |
| **Giáo dục, thư viện, nghiên cứu** | Thu thập tài liệu tham khảo, trích dẫn hợp lệ từ trang khóa chọn văn bản. | Tôn trọng bản quyền và quy chế học thuật. |
| **Hỗ trợ tiếp cận** | Người dùng trình đọc màn hình, công cụ phóng chữ, dịch tự động cần chọn và sao chép được văn bản. | Không thay thế việc website tự cải thiện khả năng tiếp cận. |
| **IT, bộ phận tuân thủ** | Dễ rà soát: không thu thập dữ liệu, không kết nối mạng, quyền khai báo rõ, cấu hình cục bộ, mã ngắn. | Vẫn nên review mã theo quy trình của tổ chức. |

---

## 🎯 Ai nên (và không nên) dùng?

**✅ Phù hợp nếu bạn:**
- hay gặp trang khóa chuột phải, copy, bôi đen;
- bị làm phiền bởi popup khi rời trang hoặc trang phản ứng quá mức khi bạn đổi tab;
- muốn một công cụ nhỏ, đọc hiểu được, không thu thập gì về bạn;
- làm QA/UX và cần tái hiện hành vi của trang theo từng nhóm sự kiện.

**⛔ Không phù hợp / hãy tắt extension khi:**
- đang làm **bài thi, kiểm tra hoặc đánh giá có giám sát**;
- dùng ngân hàng, thanh toán, họp có xác thực hoặc dịch vụ cần tính toàn vẹn;
- đang ở nơi chính sách cấm điều chỉnh hành vi trình duyệt.

Hai mô-đun nhạy cảm nhất là **Fullscreen Spoofing** và **Focus Spoofing**. Một số trang nhận ra thuộc tính bị điều chỉnh, vì vậy bạn nên chỉ bật khi thực sự cần và tắt ở những trang trên.

---

## ✨ Tính năng

| # | Mô-đun | Bạn nhận được |
|:-:|---|---|
| 01 | **Exit-Intent Protection** | Chặn popup và sự kiện khi chuột rời trang (`mouseleave`, `mouseout`, `pointerleave`, `pointerout`) và khi chuột chạm mép trên cửa sổ. |
| 02 | **Clipboard Protection** | Chặn trang can thiệp Copy / Cut / Paste, chặn `selectstart` và `dragstart` do trang hủy, ghi đè CSS `user-select: none`, giữ phím Ctrl+C/V/X/A hoạt động. |
| 03 | **Right-Click Restore** | Khôi phục menu chuột phải gốc, kể cả khi trang chặn `contextmenu`, Ctrl+U, F12 hoặc Ctrl+Shift+I/J/C. |
| 04 | **Fullscreen Spoofing** | Điều chỉnh thông tin fullscreen mà trang nhận được. |
| 05 | **Focus Spoofing** | Điều chỉnh thông tin focus và visibility (`visibilitychange`, `blur`, `focus`, `focusin`, `focusout`, `freeze`, `resume`). |
| 06 | **Global Hotkey** | `Alt + Z` bật/tắt toàn bộ, hoạt động cả ở thanh địa chỉ, DevTools và nhiều trang hạn chế nhờ Commands API. |
| 07 | **Control Panel** | Popup quản lý từng mô-đun, hiển thị phím tắt đang được gán thật. |

### ⌨️ Phím tắt

| Chức năng | Phím mặc định | Ghi chú |
|---|:-:|---|
| Bật/tắt toàn bộ | `Alt + Z` | Tự gán |
| Cửa sổ nhỏ: Google Search | `Alt + X` | Tự gán |
| Cửa sổ nhỏ: ChatGPT | `Alt + C` | Tự gán |
| Cửa sổ nhỏ: DeepSeek | `Alt + V` | Tự gán |
| Cửa sổ nhỏ: Claude | `Alt + B` | Gán tay tại `chrome://extensions/shortcuts` |
| Đóng các cửa sổ nhỏ | `Alt + D` | Gán tay (trên Windows `Alt + D` mặc định là chọn thanh địa chỉ) |

### 🆕 Có gì mới ở 5.3.1

- 🔐 **Vá lỗ hổng:** trang không còn gỡ được lớp chặn hay giả cấu hình qua sự kiện DOM (khóa ngẫu nhiên mỗi lần tải trang).
- 🧱 **Thêm lớp chặn:** `selectstart`, `dragstart`, phím bị trang hủy, CSS `user-select`, exit-intent theo `mousemove`, `freeze`/`resume`.
- 🧹 **Sửa lỗi:** popup không còn tự chặn copy/paste/chuột phải của chính nó.
- 🧪 **Kiểm thử** (Chromium 153): từ 2 lọt / 9 chưa có lớp xuống 0 lọt.

Chi tiết: [CHANGELOG.md](./CHANGELOG.md).

---

## 🌐 Website & trang kiểm thử

### 🏠 Website chính thức

<p align="center">
  <a href="https://phantomshield.oneapp.dev/">
    <!-- TODO: UPLOAD ẢNH CHỤP TRANG CHỦ WEBSITE TẠI ĐÂY -->
    <img src="./docs/images/website-home.png" alt="Phantom Shield Official Website" width="900">
  </a>
  <br>
  <strong><a href="https://phantomshield.oneapp.dev/">Truy cập website →</a></strong>
</p>

### 🧪 Trang kiểm thử tính năng

<p align="center">
  <a href="https://phantomshield.oneapp.dev/test.html">
    <!-- TODO: UPLOAD ẢNH CHỤP TRANG TEST TẠI ĐÂY -->
    <img src="./docs/images/website-test.png" alt="Phantom Shield Feature Testing Page" width="900">
  </a>
  <br>
  <strong><a href="https://phantomshield.oneapp.dev/test.html">Mở trang kiểm thử →</a></strong>
</p>

Bật extension, mở trang kiểm thử, và xem từng nhóm sự kiện **ĐÃ CHẶN**, **LỌT** hay **CHƯA CÓ LỚP**. Tìm được chỗ lọt? [Mở một Issue](https://github.com/minhhau361/phantom-shield/issues): đó là đóng góp quý nhất.

---

## 📥 Cài đặt trong 1 phút

**Yêu cầu:** Google Chrome **119** trở lên · Windows, macOS hoặc Linux.

### Bước 1 – Tải mã nguồn

```bash
git clone https://github.com/minhhau361/phantom-shield.git
```

Hoặc chọn `Code → Download ZIP` rồi giải nén.

<p align="center">
  <!-- TODO: UPLOAD ẢNH MINH HỌA TẢI SOURCE CODE ZIP -->
  <img src="./docs/images/install-01.png" alt="Step 1 - Download Source Code" width="850">
</p>

### Bước 2 – Mở trang Extensions

```text
chrome://extensions/
```

<p align="center">
  <!-- TODO: UPLOAD ẢNH TRANG CHROME EXTENSIONS -->
  <img src="./docs/images/install-02.png" alt="Step 2 - Chrome Extensions" width="850">
</p>

### Bước 3 – Bật Developer Mode

Bật **Developer mode** ở góc trên bên phải.

<p align="center">
  <!-- TODO: UPLOAD ẢNH BẬT DEVELOPER MODE -->
  <img src="./docs/images/install-03.png" alt="Step 3 - Enable Developer Mode" width="850">
</p>

### Bước 4 – Load unpacked

Nhấn **Load unpacked** và chọn thư mục chứa `manifest.json`.

<p align="center">
  <!-- TODO: UPLOAD ẢNH LOAD UNPACKED VÀ CHỌN THƯ MỤC -->
  <img src="./docs/images/install-04.png" alt="Step 4 - Load Unpacked" width="850">
</p>

### Bước 5 – Bắt đầu sử dụng

Ghim Phantom Shield lên thanh công cụ để truy cập nhanh.

<p align="center">
  <!-- TODO: UPLOAD ẢNH PHANTOM SHIELD SAU KHI CÀI ĐẶT THÀNH CÔNG -->
  <img src="./docs/images/install-05.png" alt="Step 5 - Installation Complete" width="850">
</p>

<details>
<summary><strong>📌 Mẹo cài đặt & xử lý sự cố</strong></summary>

- Chọn đúng thư mục chứa `manifest.json`, không chọn thư mục cha.
- Không thấy tiện ích? Kiểm tra lỗi tại `chrome://extensions/`.
- Sau khi cập nhật mã nguồn, nhấn **Reload** trên thẻ tiện ích rồi **F5** các tab đang mở.
- Nâng cấp từ bản cũ: cần Chrome 119+, gán lại phím tắt tại `chrome://extensions/shortcuts` nếu cần.

</details>

---

## 🎮 Hướng dẫn sử dụng

1. Nhấn biểu tượng Phantom Shield trên thanh công cụ.
2. Bật hoặc tắt từng mô-đun theo nhu cầu.
3. Nhấn `Alt + Z` để bật/tắt tất cả. Biểu tượng hiện huy hiệu `OFF` khi mọi thứ đang tắt.
4. Tải lại trang nếu mô-đun yêu cầu khởi tạo lại môi trường JavaScript.

| Mô-đun | Áp dụng |
|---|---|
| Exit-Intent, Clipboard, Right-Click | Ngay lập tức |
| Fullscreen Spoofing, Focus Spoofing | Có thể cần tải lại trang |

---

## 🔒 Quyền riêng tư & minh bạch

- ✅ Không yêu cầu tài khoản.
- ✅ Không telemetry, không phân tích sử dụng.
- ✅ Không kết nối mạng ra ngoài.
- ✅ Cấu hình lưu bằng `chrome.storage.local`, chỉ trên máy bạn.

| Quyền khai báo | Dùng để |
|---|---|
| `storage` | Lưu trạng thái bật/tắt từng mô-đun. |
| `scripting` | Nạp lại lớp bảo vệ vào các tab đang mở khi cài đặt hoặc cập nhật. |
| `<all_urls>` (host) | Lớp chặn phải chạy sớm (`document_start`) trên mọi trang bạn muốn bảo vệ. |

> Đừng tin lời, hãy kiểm tra: mở `manifest.json` và các file `.js` ngay trong repo trước khi cài.

---

## ⚙️ Cách hoạt động

1. **Event Capture:** lắng nghe ở pha capture và dùng `stopImmediatePropagation()` để listener của trang không nhận được sự kiện được bảo vệ.
2. **Main World Injection:** content script mặc định chạy ở Isolated World, nên Phantom Shield nạp thêm một script ở Main World và dùng `Object.defineProperty()` để điều chỉnh thuộc tính mà trang đọc.
3. **Kênh cấu hình có khóa (5.3.1):** hai môi trường trao đổi cấu hình bằng sự kiện có tên chứa khóa ngẫu nhiên, trang không giả mạo hay đọc được.
4. **Nhiều ngữ cảnh iframe:** `about:blank`, `srcdoc`, `sandbox`, `blob:`, `data:`, iframe lồng, và khung tạo bằng `document.open()/write()`.
5. **Shadow DOM:** thông báo (toast) cô lập giao diện khỏi CSS của trang.

**Công nghệ:** JavaScript · HTML5 · CSS3 · Chrome Extension API · Manifest V3 · Chrome Storage API · Shadow DOM.

---

## ⚠️ Giới hạn đã biết

| Tình huống | Ghi chú |
|---|---|
| Google Meet, ngân hàng, dịch vụ nhạy cảm | Có thể nhận ra thuộc tính bị điều chỉnh. Nên tắt extension ở các trang này. |
| Thuộc tính inline (`onclick="…"`) | Một số handler inline có thể không bị ảnh hưởng. |
| `pagehide`, `pageshow`, `beforeunload` | Cố ý **không chặn** để không làm hỏng khôi phục trang, cảnh báo “chưa lưu” và việc gửi dữ liệu khi rời trang. |
| Phím do hệ điều hành/Chrome dành riêng | Luôn được ưu tiên, không thể ghi đè. |
| Vài mili-giây đầu mỗi trang | Mọi tính năng mặc định bật trước khi nhận cấu hình. |
| Fullscreen & Focus | Có thể cần tải lại trang. |

---

## 🧭 Sử dụng có trách nhiệm

Phantom Shield được tạo ra để **trả lại sự thoải mái và quyền tự chủ cho người duyệt web**, không phải để qua mặt các biện pháp bảo vệ hợp pháp. Vui lòng **không** dùng để:

- vượt qua cơ chế bảo mật hay kiểm soát truy cập;
- qua mặt giám sát trong **kỳ thi, bài kiểm tra hoặc đánh giá có giám sát**, hoặc vi phạm quy chế học thuật;
- vi phạm điều khoản dịch vụ, chính sách tổ chức hoặc pháp luật.

Với dịch vụ cần tính toàn vẹn (thi cử, ngân hàng, họp có xác thực), hãy **tắt extension** (`Alt + Z`). Người dùng tự chịu trách nhiệm về cách sử dụng của mình.

---

## ❓ Câu hỏi thường gặp

<details>
<summary><b>Phantom Shield có thu thập dữ liệu của tôi không?</b></summary>

Không. Không tài khoản, không telemetry, không gọi mạng ra ngoài. Cấu hình chỉ nằm trong `chrome.storage.local` trên máy bạn.
</details>

<details>
<summary><b>Vì sao extension cần quyền trên mọi trang web?</b></summary>

Lớp chặn phải được nạp sớm trong từng trang để đi trước script của website. Bạn có thể kiểm tra trực tiếp trong `manifest.json`.
</details>

<details>
<summary><b>Một trang bị lỗi hiển thị sau khi bật. Làm sao?</b></summary>

Nhấn `Alt + Z` để tắt, hoặc tắt riêng mô-đun gây lỗi (thường là Fullscreen/Focus). Sau đó mở Issue kèm địa chỉ trang và phiên bản Chrome.
</details>

<details>
<summary><b>Có dùng được trên Edge, Brave, Opera?</b></summary>

Trình duyệt nhân Chromium hỗ trợ Manifest V3 thường cài được theo cách tương tự, nhưng dự án hiện chỉ kiểm thử trên Chrome.
</details>

<details>
<summary><b>Gỡ bỏ thế nào?</b></summary>

Vào `chrome://extensions/` và nhấn **Remove**. Không còn dữ liệu ở nơi nào khác.
</details>

---

## 🤝 Cùng xây dựng Phantom Shield

Dự án nhỏ, mã ngắn, dễ vào việc. Bạn không cần là chuyên gia để đóng góp: **một báo cáo “trang X bị hỏng” cũng có giá trị.**

### 🙋 Việc đang cần người giúp (help wanted)

| Việc | Độ khó | Ghi chú |
|---|:-:|---|
| Danh sách cho phép / loại trừ theo từng trang (giao diện trong popup) | ⭐⭐ | Trong `content.js` đã có `CLIPBOARD_ALLOW_HOSTS` và `FULLSCREEN_SKIP_HOSTS` nhưng chưa có giao diện. |
| Công tắc riêng, mặc định tắt, cho `pagehide` / `pageshow` / `beforeunload` | ⭐⭐ | Cần cân nhắc tác dụng phụ, xem mục Giới hạn. |
| Danh sách tương thích cộng đồng: trang nào bật ổn, trang nào cần tắt mô-đun nào | ⭐ | Chỉ cần mở Issue theo mẫu. |
| Bản tiếng Anh cho popup và README | ⭐ | Giúp dự án chạm tới nhiều người hơn. |
| Kiểm thử tự động bằng Playwright + GitHub Actions | ⭐⭐⭐ | Xem mẹo bên dưới. |
| Ảnh GIF demo “trước / sau” | ⭐ | Tăng sức hút cho trang chủ dự án. |
| Thử nghiệm trên Edge / Brave và báo cáo kết quả | ⭐ | Chỉ cần dùng thử và ghi lại. |

### 🗂️ Cấu trúc mã nguồn

```text
manifest.json      Khai báo, quyền, phím tắt (commands)
background.js      Service worker: phím tắt, badge, cửa sổ nhỏ
content.js         Isolated world: chặn sự kiện, cấu hình, toast
spoof.js           Main world: điều chỉnh thuộc tính trang đọc
popup.html / .js   Bảng điều khiển
CHANGELOG.md       Lịch sử thay đổi
old/               Các bản cũ để đối chiếu
```

### 🧪 Chạy kiểm thử

1. Nạp extension bằng **Load unpacked**.
2. Mở [trang kiểm thử](https://phantomshield.oneapp.dev/test.html) và đọc báo cáo.
3. Nếu viết kiểm thử tự động: dùng **Chromium đầy đủ** (không phải headless shell) và phục vụ trang qua **`http://localhost`**. Extension không nạp vào trang `file://` nếu chưa cho phép, và headless shell không hỗ trợ extension.

### 🔀 Quy trình Pull Request

1. Fork repository và tạo branch (`feature/ten-tinh-nang`).
2. Chỉnh sửa, chạy lại trang kiểm thử, ghi kết quả trước/sau vào mô tả PR.
3. Cập nhật `CHANGELOG.md`.
4. Mở Pull Request.

```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

**Báo lỗi** qua Issues, kèm: mô tả, các bước tái hiện, phiên bản Chrome, địa chỉ trang bị ảnh hưởng, ảnh chụp nếu có.

---

## 👨‍💻 Tác giả

<p align="center">
  <a href="https://github.com/minhhau361">
    <img src="https://github.com/minhhau361.png" width="110" alt="minhhau361">
  </a>
  <br>
  <strong><a href="https://github.com/minhhau361">@minhhau361</a></strong>
  <br>
  Project Creator · Main Developer
</p>

**[@minhhau361](https://github.com/minhhau361)** là người sáng lập và chịu trách nhiệm phát triển cốt lõi: ý tưởng và định hướng, kiến trúc Chrome Extension, các mô-đun bảo vệ và xử lý sự kiện, cơ chế tương tác với môi trường JavaScript của website, thiết kế giao diện, tối ưu hiệu năng và bảo trì.

---

## 📜 Giấy phép

Phát hành theo **MIT License**. Xem file [`LICENSE`](./LICENSE).

---

## ⭐ Ủng hộ dự án

Phantom Shield miễn phí và không có quảng cáo. Cách tốt nhất để giúp dự án lớn lên:

- ⭐ **Star** repository để nhiều người tìm thấy.
- 🐛 **Báo lỗi**: mỗi chỗ lọt bạn tìm ra là một lớp bảo vệ tốt hơn.
- 💡 **Đề xuất** tính năng mới.
- 🔀 **Gửi Pull Request**, kể cả sửa một dòng chữ.
- 📣 **Chia sẻ** cho người hay bị các trang web “cứng đầu” làm phiền.

<p align="center">
  <a href="https://github.com/minhhau361/phantom-shield/stargazers">
    <img src="https://img.shields.io/github/stars/minhhau361/phantom-shield?style=social" alt="GitHub Stars">
  </a>
</p>

---

<p align="center">
  <strong>👻 Phantom Shield</strong>
  <br>
  <i>Browse Freely. Stay in Control.</i>
  <br><br>
  Created & Developed with dedication by
  <br>
  <a href="https://github.com/minhhau361"><strong>@minhhau361</strong></a>
  <br><br>
  <a href="https://phantomshield.oneapp.dev/">Official Website</a>
  ·
  <a href="https://phantomshield.oneapp.dev/test.html">Testing Page</a>
  ·
  <a href="https://github.com/minhhau361/phantom-shield">GitHub Repository</a>
</p>
