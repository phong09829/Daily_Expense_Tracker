# 📱 ExpenseFlow Pro - Web App PWA Quản lý Chi tiêu Cá nhân

<div align="center">

[![Truy cập App Ngay](https://img.shields.io/badge/🚀_TRUY_CẬP_APP_TRỰC_TIẾP-Nhấn_Vào_Đây-4f46e5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![Auth](https://img.shields.io/badge/Đăng_nhập-Bằng_Gmail_Trực_tiếp-ea4335?style=for-the-badge&logo=gmail&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-10b981?style=for-the-badge&logo=pwa&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)

### 🔗 Link truy cập chính thức: [https://phong09829.github.io/Daily_Expense_Tracker/](https://phong09829.github.io/Daily_Expense_Tracker/)

</div>

---

> **ExpenseFlow Pro** là ứng dụng Web App (PWA) hiện đại giúp bạn quản lý thu chi cá nhân hằng ngày một cách nhanh chóng, riêng tư và tiện lợi nhất. Bất kỳ ai cũng có thể **nhập địa chỉ Gmail của mình để đăng nhập trực tiếp ngay lập tức** mà không cần mã OTP, không cần kích hoạt phức tạp. Dữ liệu thu chi của mỗi tài khoản Gmail được **cô lập riêng biệt 100%**.

---

## ✨ Điểm nổi bật & Tính năng chính

- 🚀 **Đăng nhập Gmail trực tiếp 1 bước:**
  - Nhập bất kỳ địa chỉ Gmail nào là có thể đăng nhập ngay lập tức.
  - Không cần mã OTP, không cần kích hoạt tài khoản phức tạp.
  - Tự động ghi nhớ phiên làm việc trên thiết bị của bạn.

- 🛡️ **Cô lập dữ liệu riêng tư theo từng Gmail (Multi-User Isolation):**
  - Mỗi tài khoản Gmail sở hữu cơ sở dữ liệu sổ thu chi độc lập hoàn toàn.
  - Đăng nhập bằng Gmail nào thì chỉ thấy và quản lý giao dịch của riêng Gmail đó.
  - Đảm bảo tính bảo mật và riêng tư cá nhân khi dùng chung thiết bị.

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
- Bấm nút **"Cài đặt ngay"** trên banner đầu trang hoặc thanh Menu ➜ Chọn **"Cài đặt ứng dụng"** (hoặc **"Thêm vào màn hình chính"**).

### 2. Trên iPhone / iPad (iOS Safari):
- Mở link bằng trình duyệt **Safari**.
- Bấm vào biểu tượng nút **Chia sẻ** (icon ô vuông có mũi tên trỏ lên `⎋`) ở thanh điều hướng dưới cùng.
- Cuộn xuống chọn **"Thêm vào MH chính"** (**Add to Home Screen** `⊞`).
- Bấm **Thêm** ở góc trên bên phải. Ứng dụng sẽ hiển thị trên màn hình chính như một App độc lập!

---

## 💻 Hướng dẫn Chạy Thử trên Máy tính (Local)

1. Clone repository về máy:
   ```bash
   git clone https://github.com/phong09829/Daily_Expense_Tracker.git
   cd Daily_Expense_Tracker
   ```
2. Mở file `index.html` trực tiếp bằng trình duyệt web hoặc chạy qua Live Server:
   ```bash
   npx serve .
   ```
3. Truy cập vào địa chỉ hiển thị trên terminal (thường là `http://localhost:3000` hoặc `http://localhost:5500`).
