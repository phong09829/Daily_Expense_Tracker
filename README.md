# 📱 ExpenseFlow Pro - Web App PWA Quản lý Chi tiêu Cá nhân

<div align="center">

[![Truy cập App Ngay](https://img.shields.io/badge/🚀_TRUY_CẬP_APP_TRỰC_TIẾP-Nhấn_Vào_Đây-4f46e5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![Auth](https://img.shields.io/badge/Auth-Gmail_OTP-ea4335?style=for-the-badge&logo=gmail&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-10b981?style=for-the-badge&logo=pwa&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)

### 🔗 Link truy cập chính thức: [https://phong09829.github.io/Daily_Expense_Tracker/](https://phong09829.github.io/Daily_Expense_Tracker/)

</div>

---

> **ExpenseFlow Pro** là ứng dụng Web App (PWA) hiện đại giúp bạn quản lý thu chi cá nhân hằng ngày một cách nhanh chóng, riêng tư và bảo mật tuyệt đối. Ứng dụng xác thực độc quyền bằng **Mã OTP gửi trực tiếp vào hộp thư Gmail** của bạn, không có mật khẩu hay đăng nhập tắt.

---

## ✉️ HƯỚNG DẪN KÍCH HOẠT GỬI MÃ OTP VỀ GMAIL (EMAILJS MIỄN PHÍ)

Để trình duyệt web có thể gửi email thực sự vào hòm thư Gmail của bạn (hoặc bất kỳ ai), ứng dụng sử dụng dịch vụ **EmailJS** hoàn toàn miễn phí. Bạn chỉ cần làm theo 3 bước sau (chỉ mất 1–2 phút):

### Bước 1: Tạo tài khoản EmailJS miễn phí
1. Truy cập [https://www.emailjs.com/](https://www.emailjs.com/) và bấm **Sign Up Free** (chọn Đăng nhập nhanh bằng tài khoản Google).
2. Sau khi vào màn hình chính, vào mục **Account** ➜ Sao chép **Public Key** của bạn.

### Bước 2: Kết nối tài khoản Gmail của bạn
1. Ở menu bên trái, vào **Email Services** ➜ Bấm **Add New Service**.
2. Chọn **Gmail** ➜ Bấm **Connect Account** để cấp quyền gửi mail từ Gmail của bạn ➜ Bấm **Create Service**.
3. Sao chép mã **Service ID** (ví dụ: `service_xxxxxxx`).

### Bước 3: Tạo mẫu Email gửi mã OTP
1. Ở menu bên trái, vào **Email Templates** ➜ Bấm **Create New Template**.
2. Đặt nội dung mẫu email như sau:
   - **Subject:** `[ExpenseFlow] Mã xác thực OTP của bạn là: {{otp_code}}`
   - **Content:**
     ```text
     Chào bạn,

     Mã OTP đăng nhập vào ứng dụng ExpenseFlow của bạn là: {{otp_code}}
     Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã cho bất kỳ ai.
     ```
   - Tại mục **Settings** của Template, đảm bảo ô **To Email** là: `{{to_email}}`.
3. Bấm **Save** ở góc trên bên phải ➜ Sao chép mã **Template ID** (ví dụ: `template_xxxxxxx`).

### Bước 4: Nhập vào ứng dụng ExpenseFlow
1. Mở trang web: [https://phong09829.github.io/Daily_Expense_Tracker/](https://phong09829.github.io/Daily_Expense_Tracker/)
2. Bấm vào nút **"Cài đặt cổng gửi Email (EmailJS)"** trong cửa sổ đăng nhập.
3. Điền 3 thông số:
   - **Public Key**
   - **Service ID**
   - **Template ID**
4. Bấm **Lưu cấu hình**.

🎉 **XONG!** Từ lúc này, mỗi khi bạn nhập bất kỳ Gmail nào và bấm **"Gửi mã OTP về Gmail"**, hệ thống sẽ thực sự gửi email chứa mã 6 số vào hộp thư Gmail của bạn!

---

## ✨ Điểm nổi bật & Tính năng chính

- ✉️ **Bảo mật tuyệt đối qua OTP Gmail:**
  - Không hiển thị mã OTP trên màn hình (đảm bảo riêng tư).
  - Không có tính năng đăng nhập nhanh hay tạo mã tức thì.
  - Mã xác thực gửi bí mật về hòm thư Gmail, mở Gmail ra xem và nhập vào để đăng nhập.
- 🛡️ **Cô lập dữ liệu theo từng Gmail (Multi-User Isolation):**
  - Mỗi tài khoản Gmail sở hữu cơ sở dữ liệu thu chi độc lập hoàn toàn.
  - Người dùng này không thể nhìn thấy dữ liệu của người dùng khác.
  - Tự động duy trì phiên đăng nhập sau khi xác thực thành công.
- 📲 **Cài đặt như Native App (PWA Standalone):**
  - Cài đặt trực tiếp về màn hình chính trên **Android**, **iPhone/iPad (iOS Safari)** và **Máy tính (Chrome/Edge)**.
  - Hoạt động toàn màn hình không có thanh URL trình duyệt, mượt mà như app tải từ App Store.
  - Khởi động tức thì và hoạt động ngay cả khi mất mạng nhờ Service Worker (`sw.js`).
- 📊 **Thống kê & Biểu đồ trực quan (Chart.js):**
  - 3 Thẻ KPIs: Tổng Thu nhập, Tổng Chi tiêu, Số Dư trong kỳ.
  - Biểu đồ tròn Doughnut Chart phân tích % phân bổ theo từng danh mục chi tiêu.
  - Bộ lọc linh hoạt: Theo tháng, theo loại (Thu/Chi), theo danh mục, tìm kiếm theo từ khóa.
- 📑 **Xuất dữ liệu Excel / CSV chuẩn Tiếng Việt:**
  - Hỗ trợ tải dữ liệu giao dịch về máy tính định dạng CSV chuẩn UTF-8 (hiển thị Tiếng Việt 100% trên Excel).

---

## 📲 Hướng dẫn Cài đặt App về Màn hình chính Điện thoại

### 1. Trên Android (Google Chrome):
- Mở link: `https://phong09829.github.io/Daily_Expense_Tracker/`
- Bấm nút **"Cài đặt ngay"** trên banner đầu trang, hoặc chạm vào menu 3 chấm dọc `⋮` ở góc trên bên phải ➜ Chọn **"Thêm vào màn hình chính"** (hoặc **"Cài đặt ứng dụng"**).

### 2. Trên iPhone / iPad (iOS Safari):
- Mở link bằng trình duyệt **Safari**.
- Bấm vào biểu tượng nút **Chia sẻ** (icon ô vuông có mũi tên trỏ lên `⎋`) ở thanh điều hướng dưới cùng.
- Cuộn xuống chọn **"Thêm vào MH chính"** (**Add to Home Screen** `⊞`).
- Bấm **Thêm** ở góc trên bên phải.
