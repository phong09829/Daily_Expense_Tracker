# 🗄️ CƠ SỞ DỮ LIỆU EXPENSEFLOW PRO (DATABASE)

Thư mục này chứa toàn bộ hệ thống cơ sở dữ liệu SQLite và công cụ quản trị tài khoản Gmail cùng Mã PIN 6 số đăng nhập.

---

## 📁 Danh sách các file trong thư mục `database/`:

| Tên File | Chức năng |
| :--- | :--- |
| **`expenseflow.db`** | **File Database SQLite chính thức.** Lưu trữ bảng `users` (tài khoản Gmail, mã PIN 6 số, mã băm SHA-256) và bảng `transactions` (dữ liệu thu chi). |
| **`accounts_backup.json`** | **File sao lưu JSON trực quan.** Tự động cập nhật mỗi khi có tài khoản mới hoặc đổi PIN. Bạn có thể mở trực tiếp bằng **Notepad** để xem danh sách tài khoản và mã PIN. |
| **`schema.sql`** | Tập lệnh cấu trúc bảng SQL (DDL) chuẩn hóa cho SQLite / PostgreSQL / MySQL. |
| **`db_manager.py`** | Công cụ dòng lệnh (CLI) bằng Python tích hợp sẵn để xem, thêm, sửa, đổi PIN hoặc xóa tài khoản. |
| **`sync_cloud.py`** | Tự động kéo toàn bộ tài khoản do mọi người đăng ký từ Google Sheet Cloud về file `expenseflow.db` trên máy tính. |

---

## 🌐 TỰ ĐỘNG THU THẬP TÀI KHOẢN KHI BẤT KỲ AI ĐĂNG KÝ TRÊN WEB

Để trang web trên GitHub Pages tự động gửi tài khoản và mã PIN của bất kỳ ai về cho bạn:

1. Mở file **`google-sheets-database.gs`** ở thư mục gốc.
2. Tạo 1 file Google Sheet mới tại `https://sheets.google.com` đặt tên là **"ExpenseFlow Database"**.
3. Vào **Tiện ích mở rộng** (Extensions) ➜ **Apps Script**, dán code từ file `google-sheets-database.gs` vào và bấm **Lưu**.
4. Bấm **Triển khai** ➜ **Tùy chọn triển khai mới** ➜ Chọn **Ứng dụng web** (Web app):
   - Ai có quyền truy cập: **Bất kỳ ai (Anyone)**.
5. Sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).
6. Dán URL đó vào biến `GOOGLE_SHEET_API_URL` trong file `app.js`.

➡️ **Kết quả:** Bất kỳ ai mở web tạo tài khoản ở bất kỳ đâu trên thế giới, thông tin Gmail + Mã PIN 6 số sẽ **tự động nhảy thẳng vào Google Sheet của bạn ngay lập tức**!
Và bất cứ khi nào bạn muốn tải về máy tính, chỉ cần chạy:
```bash
python database/sync_cloud.py
```
Toàn bộ tài khoản sẽ được nạp thẳng vào file `database/expenseflow.db` và `accounts_backup.json`!

---

## 🚀 Hướng dẫn Quản lý & Xem Tài khoản / Mã PIN

### Cách 1: Xem nhanh bằng Notepad
- Mở trực tiếp file `database/accounts_backup.json` bằng **Notepad** trên máy tính.
- File hiển thị rõ ràng:
  - Địa chỉ Gmail
  - Mã PIN 6 số
  - Số lượng giao dịch thu chi
  - Ngày tạo tài khoản

### Cách 2: Sử dụng công cụ tương tác `db_manager.py`
Mở PowerShell hoặc Command Prompt tại thư mục dự án và chạy:
```bash
python database/db_manager.py
```
Menu tương tác bằng Tiếng Việt sẽ xuất hiện:
```text
============================================================
  📊 EXPENSEFLOW PRO - QUẢN LÝ DATABASE TÀI KHOẢN & MÃ PIN
============================================================
📁 Vị trí Database: .../database/expenseflow.db
1. 📋 Xem danh sách tất cả Gmail & Mã PIN
2. ➕ Thêm mới tài khoản Gmail & Mã PIN
3. 🔑 Đổi Mã PIN cho Gmail có sẵn
4. 🗑️  Xóa tài khoản
5. 🔄 Xuất file JSON (dễ xem bằng Notepad)
0. 🚪 Thoát
------------------------------------------------------------
👉 Chọn chức năng (0-5):
```

---

## 🌐 Chạy Ứng dụng Web cùng Database cục bộ

Tại thư mục gốc của dự án, bạn chạy:
```bash
python server.py
```
- Máy chủ sẽ khởi động tại: `http://localhost:8000`
- Toàn bộ thao tác tạo tài khoản, đăng nhập bằng mã PIN và thêm thu/chi trên trình duyệt sẽ được **lưu trữ trực tiếp và tức thì vào file `database/expenseflow.db`** trên máy tính của bạn!
