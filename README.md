# 📱 ExpenseFlow Pro - Web App PWA Quản lý Chi tiêu Cá nhân

<div align="center">

[![Truy cập App Ngay](https://img.shields.io/badge/🚀_TRUY_CẬP_APP_TRỰC_TIẾP-Nhấn_Vào_Đây-4f46e5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![Auth](https://img.shields.io/badge/Bảo_mật-OTP_Gmail-ea4335?style=for-the-badge&logo=gmail&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-10b981?style=for-the-badge&logo=pwa&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)

### 🔗 Link truy cập chính thức: [https://phong09829.github.io/Daily_Expense_Tracker/](https://phong09829.github.io/Daily_Expense_Tracker/)

</div>

---

> **ExpenseFlow Pro** là ứng dụng Web App (PWA) hiện đại giúp bạn quản lý thu chi cá nhân hằng ngày một cách an toàn và bảo mật tuyệt đối. Ứng dụng xác thực độc quyền bằng **Mã OTP 6 số gửi về hộp thư Gmail**, đảm bảo mỗi cá nhân sở hữu một sổ thu chi riêng tư và độc lập hoàn toàn.

---

## 🛡️ Cơ chế Bảo mật OTP & Đăng nhập

1. **Bước 1:** Nhập địa chỉ Gmail của bạn và nhấn **"Gửi mã OTP về Gmail"**.
2. **Bước 2:** Hệ thống tạo mã xác thực 6 chữ số có hiệu lực trong 5 phút.
3. **Bước 3:** Nhập đúng mã OTP vào 6 ô xác thực để đăng nhập ngay vào sổ chi tiêu cá nhân.

---

## ⚡ Hướng dẫn kích hoạt Gửi Mail tự động qua Google Apps Script (100% Miễn phí & Không quảng cáo)

Dự án đã tích hợp sẵn file backend [`google-apps-script-otp.gs`](./google-apps-script-otp.gs). Bạn có thể kết nối cổng gửi email từ chính tài khoản Gmail của bạn chỉ trong 1 phút:

1. Mở trình duyệt và truy cập [https://script.google.com/](https://script.google.com/) ➜ Nhấn **Dự án mới (New project)**.
2. Sao chép toàn bộ code trong file [`google-apps-script-otp.gs`](./google-apps-script-otp.gs) và dán vào trình soạn thảo ➜ Nhấn biểu tượng **Lưu (Save)**.
3. Nhấn nút **Triển khai (Deploy)** ở góc trên bên phải ➜ Chọn **Tùy chọn triển khai mới (New deployment)**.
4. Chọn loại: **Ứng dụng web (Web app)**:
   - **Thực thi dưới dạng (Execute as):** `Tôi (Tài khoản Google của bạn)`.
   - **Ai có quyền truy cập (Who has access):** `Bất kỳ ai (Anyone)`.
5. Nhấn **Triển khai** ➜ Cấp quyền cho script gửi email khi được hỏi.
6. Sao chép **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/.../exec`).
7. Tại trang web ExpenseFlow, bấm vào nút **"⚙️ Cài đặt Cổng gửi Mail"** ở chân trang và dán URL vào ➜ Bấm **Lưu cấu hình**.
   *(Hoặc mở trực tiếp link: `https://phong09829.github.io/Daily_Expense_Tracker/?script=URL_CỦA_BẠN`)*.
   
🎉 **Xong!** Từ lúc này, mỗi khi bạn nhấn gửi mã OTP, hệ thống sẽ tự động gửi thư chứa mã xác nhận trực tiếp vào hộp thư Gmail của bạn. Người ngoài không có quyền truy cập vào Gmail của bạn sẽ không bao giờ có mã để đăng nhập!

---

## ✨ Điểm nổi bật & Tính năng chính

- ✉️ **Bảo mật tuyệt đối qua OTP Gmail:**
  - Không có mật khẩu phức tạp để quên hay bị lộ.
  - Không có đăng nhập khách phụ hay đăng nhập nhanh.
  - Mỗi tài khoản Gmail có dữ liệu riêng biệt được cô lập hoàn toàn.

- 📲 **Cài đặt như Native App (Chuẩn PWA Standalone):**
  - Cài đặt trực tiếp về màn hình chính trên **Android**, **iPhone / iPad (iOS Safari)** và **Máy tính (Chrome / Edge)**.
  - Mở toàn màn hình không có thanh địa chỉ URL, mượt mà như app tải từ App Store / Google Play.
  - Tải nhanh tức thì nhờ Service Worker (`sw.js`).

- 📊 **Thống kê & Biểu đồ trực quan (Chart.js):**
  - 3 Thẻ Dashboard: **Tổng Thu nhập**, **Tổng Chi tiêu**, **Số Dư trong kỳ**.
  - Biểu đồ tròn Doughnut Chart phân tích cơ cấu % phân bổ theo từng danh mục chi tiêu.
  - Bộ lọc linh hoạt: Theo tháng/kỳ báo cáo, theo loại (Thu/Chi), theo danh mục, tìm kiếm theo từ khóa ghi chú.

- 📑 **Xuất dữ liệu Excel / CSV chuẩn Tiếng Việt:**
  - Hỗ trợ tải dữ liệu giao dịch về máy tính định dạng CSV chuẩn UTF-8 (mở đọc Tiếng Việt có dấu 100% trên Excel).

---

## 📲 Hướng dẫn Cài đặt App về Màn hình chính Điện thoại

### 1. Trên Android (Google Chrome):
- Mở link: [https://phong09829.github.io/Daily_Expense_Tracker/](https://phong09829.github.io/Daily_Expense_Tracker/)
- Bấm nút **"Cài đặt ngay"** trên banner đầu trang hoặc bấm menu 3 chấm dọc `⋮` ở góc trên bên phải ➜ Chọn **"Cài đặt ứng dụng"** (hoặc **"Thêm vào màn hình chính"**).

### 2. Trên iPhone / iPad (iOS Safari):
- Mở link bằng trình duyệt **Safari**.
- Bấm vào biểu tượng nút **Chia sẻ** (icon ô vuông có mũi tên trỏ lên `⎋`) ở thanh điều hướng dưới cùng.
- Cuộn xuống chọn **"Thêm vào MH chính"** (**Add to Home Screen** `⊞`).
- Bấm **Thêm** ở góc trên bên phải. Ứng dụng sẽ hiển thị trên màn hình chính như một App độc lập!
