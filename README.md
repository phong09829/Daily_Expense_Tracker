# 📱 ExpenseFlow Pro - Web App PWA Quản lý Chi tiêu Cá nhân

<div align="center">

[![Truy cập App Ngay](https://img.shields.io/badge/🚀_TRUY_CẬP_APP_TRỰC_TIẾP-Nhấn_Vào_Đây-4f46e5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![Auth](https://img.shields.io/badge/Bảo_mật-Mã_PIN_6_Số_Gmail-ea4335?style=for-the-badge&logo=gmail&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-10b981?style=for-the-badge&logo=pwa&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)

### 🔗 Link truy cập chính thức: [https://phong09829.github.io/Daily_Expense_Tracker/](https://phong09829.github.io/Daily_Expense_Tracker/)

</div>

---

> **ExpenseFlow Pro** là ứng dụng Web App (PWA) hiện đại giúp bạn theo dõi thu chi cá nhân hằng ngày một cách an toàn và tiện lợi. Ứng dụng áp dụng cơ chế xác thực bảo mật bằng **Mã PIN Bảo mật 6 số cá nhân hóa theo từng Gmail** (Mã hóa chuẩn SHA-256), đảm bảo mỗi cá nhân sở hữu một sổ thu chi riêng tư, độc lập 100% và không phụ thuộc vào bất kỳ máy chủ email trung gian nào.

---

## 🛡️ Cơ chế Bảo mật & Đăng nhập bằng Mã PIN 6 số

1. **Bước 1: Nhập địa chỉ Gmail**
   - Nhập Gmail của bạn và nhấn **"Tiếp tục"**. Form đăng nhập được thiết kế tinh gọn tối đa, chỉ gồm Gmail và Mã PIN.
2. **Bước 2: Xác thực / Tạo Mã PIN 6 số**
   - **Lần đầu đăng nhập:** Bạn tự đặt Mã PIN bí mật 6 số cho tài khoản Gmail của mình.
   - **Các lần đăng nhập sau:** Nhập đúng Mã PIN 6 số đã tạo để mở khóa sổ chi tiêu.
3. **Bước 3: Bảo mật tuyệt đối & Cô lập dữ liệu**
   - Mã PIN được băm mật mã bằng thuật toán **SHA-256** ngay trên thiết bị, không lưu dưới dạng văn bản thường.
   - Bất kỳ ai không có Mã PIN 6 số đều **hoàn toàn không thể đăng nhập** vào tài khoản Gmail của bạn.
   - Dữ liệu thu chi của từng tài khoản Gmail được lưu trữ tách biệt hoàn toàn.

---

## ✨ Điểm nổi bật & Tính năng chính

- 🔒 **Đăng nhập Tinh gọn & Riêng tư:**
  - Chỉ gồm 2 bước: Nhập Gmail ➜ Nhập Mã PIN 6 số.
  - Không có đăng nhập khách phụ hay đăng nhập nhanh không an toàn.
  - Không lo lỗi chậm thư hoặc nghẽn mạng từ máy chủ gửi email.

- 📲 **Cài đặt như Native App (Chuẩn PWA Standalone):**
  - Cài đặt trực tiếp về màn hình chính trên **Android**, **iPhone / iPad (iOS Safari)** và **Máy tính (Chrome / Edge)**.
  - Trải nghiệm mở ứng dụng toàn màn hình, mượt mà và trực quan.
  - Hoạt động nhanh tức thì nhờ Service Worker (`sw.js`).

- 📊 **Thống kê & Biểu đồ trực quan (Chart.js):**
  - 3 Thẻ Dashboard: **Tổng Thu nhập**, **Tổng Chi tiêu**, **Số Dư trong kỳ**.
  - Biểu đồ tròn Doughnut Chart phân tích cơ cấu % phân bổ theo từng danh mục chi tiêu.
  - Bộ lọc thông minh: Theo tháng/kỳ báo cáo, theo loại (Thu/Chi), theo danh mục, tìm kiếm theo từ khóa ghi chú.

- 📑 **Xuất dữ liệu Excel / CSV chuẩn Tiếng Việt:**
  - Xuất toàn bộ dữ liệu giao dịch ra file CSV chuẩn UTF-8 có BOM (mở trực tiếp bằng Microsoft Excel hiển thị Tiếng Việt chuẩn 100% không bị lỗi font).

- 🗄️ **Cơ sở dữ liệu SQLite trong thư mục dự án (`database/`):**
  - Lưu trữ trực tiếp danh sách Gmail và Mã PIN 6 số vào file `database/expenseflow.db`.
  - Có file sao lưu trực quan `database/accounts_backup.json` (mở xem trực tiếp bằng Notepad).
  - Có công cụ quản trị CLI `python database/db_manager.py` và máy chủ cục bộ `python server.py`.

---

## 🗄️ Quản lý Cơ sở Dữ liệu Tài khoản & Mã PIN

Dự án tích hợp sẵn cơ sở dữ liệu SQLite trong thư mục `database/`:

1. **Xem tài khoản & Mã PIN nhanh bằng Notepad:**
   - Mở file `database/accounts_backup.json` để xem toàn bộ danh sách tài khoản, mã PIN và ngày tạo.

2. **Quản lý bằng công cụ dòng lệnh (CLI):**
   ```bash
   python database/db_manager.py
   ```
   Cho phép xem danh sách, thêm tài khoản mới, đổi mã PIN, xóa tài khoản bằng menu tiếng Việt trực quan.

3. **Chạy ứng dụng Web kết nối Database SQLite trực tiếp:**
   ```bash
   python server.py
   ```
   Mở trình duyệt tại `http://localhost:8000` để sử dụng ứng dụng với dữ liệu lưu trực tiếp vào file database trên máy tính.

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
