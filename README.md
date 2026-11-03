# 📱 ExpenseFlow Pro - PWA Quản lý Chi tiêu Cá nhân

<div align="center">

[![Truy cập App Ngay](https://img.shields.io/badge/🚀_TRUY_CẬP_APP_TRỰC_TIẾP-Nhấn_Vào_Đây-4f46e5?style=for-the-badge&logo=google-chrome&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-10b981?style=for-the-badge&logo=pwa&logoColor=white)](https://phong09829.github.io/Daily_Expense_Tracker/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

### 🔗 Link truy cập chính thức: [https://phong09829.github.io/Daily_Expense_Tracker/](https://phong09829.github.io/Daily_Expense_Tracker/)

</div>

---

> **ExpenseFlow Pro** là ứng dụng Web App (PWA) hiện đại giúp bạn theo dõi thu chi cá nhân hằng ngày một cách nhanh chóng, bảo mật và trực quan. Ứng dụng hỗ trợ cài đặt trực tiếp về màn hình chính điện thoại/máy tính với 1 chạm, hoạt động mượt mà toàn màn hình như một Native App thực thụ.

---

## 🛠️ HƯỚNG DẪN BẬT LINK APP VÀ GẮN VÀO MỤC "ABOUT" TRÊN GITHUB

### 1. Khắc phục lỗi dấu ❌ (Failed) trên GitHub Actions:
> **Nguyên nhân:** Khi tạo repo mới, GitHub mặc định **chưa kích hoạt GitHub Pages**, dẫn đến GitHub Actions không có quyền deploy và báo lỗi đỏ ❌.

**Cách bật chỉ mất 15 giây:**
1. Mở trang cài đặt Pages: 👉 **[https://github.com/phong09829/Daily_Expense_Tracker/settings/pages](https://github.com/phong09829/Daily_Expense_Tracker/settings/pages)**
2. Tại mục **Build and deployment**:
   - **Source:** Chọn **`Deploy from a branch`**
   - **Branch:** Chọn **`gh-pages`** (hoặc `main`) ➜ Thư mục chọn **`/(root)`**
   - Bấm nút **Save** màu xanh.
3. Chờ khoảng 30-60 giây, GitHub sẽ cấp link xanh: **Your site is live at `https://phong09829.github.io/Daily_Expense_Tracker/`**!

---

### 2. Cách hiển thị Link App ở mục "About" (Góc phải GitHub):
Để link app xuất hiện ngay góc phải trang chủ repository cho bạn và mọi người bấm vào tiện lợi:
1. Quay lại trang chủ repository: 👉 **[https://github.com/phong09829/Daily_Expense_Tracker](https://github.com/phong09829/Daily_Expense_Tracker)**
2. Nhìn sang cột bên phải, tại mục **About**, bấm vào biểu tượng bánh răng ⚙️ (**Edit repository details**).
3. Tại ô **Description**, điền: `📱 ExpenseFlow Pro - Web App PWA Quản lý Chi tiêu Cá nhân`
4. Tại ô **Website**:
   - Tích chọn vào ô: ☑️ **Use your GitHub Pages website**
   *(Hoặc dán trực tiếp đường link: `https://phong09829.github.io/Daily_Expense_Tracker/`)*
5. Bấm **Save changes**. Link ứng dụng sẽ luôn hiển thị cố định ở đầu trang GitHub của bạn!

---

## ✨ Tính năng nổi bật của ExpenseFlow Pro

- ⚡ **Truy cập & Dùng ngay lập tức (Chế độ Ngoại tuyến / Local Storage):**
  - Không bắt buộc đăng nhập hay cấu hình phức tạp. Mở link là dùng được ngay!
  - Dữ liệu lưu an toàn trong bộ nhớ trình duyệt của riêng bạn.
  - Sẵn sàng bộ dữ liệu mẫu sinh động khi vừa mở app để trải nghiệm đầy đủ các tính năng.
- ☁️ **Đồng bộ Đám mây đa thiết bị (Google Firebase Cloud):**
  - Hỗ trợ đăng nhập một chạm bằng tài khoản **Google (Gmail)**.
  - Cô lập dữ liệu tuyệt đối giữa các người dùng (`users/{uid}/expenses/{id}`).
  - Đồng bộ thời gian thực (Real-time Sync) giữa máy tính và điện thoại.
  - Tích hợp cửa sổ cài đặt Firebase API Key ngay trên giao diện web.
- 📲 **Cài đặt như Native App (Progressive Web App - PWA):**
  - Mở toàn màn hình không thanh URL trình duyệt (Standalone Mode).
  - Hoạt động nhanh tức thì ngay cả khi mạng chập chờn nhờ Service Worker (`sw.js`).
  - Hỗ trợ đầy đủ **Android**, **iOS (iPhone/iPad qua Safari)** và **Máy tính (Windows/macOS Chrome & Edge)**.
- 📊 **Thống kê & Báo cáo Thông minh:**
  - 3 Thẻ KPIs: Tổng Thu nhập, Tổng Chi tiêu, Số Dư trong kỳ.
  - Biểu đồ tròn Doughnut Chart phân tích % chi tiêu theo danh mục.
  - Bộ lọc linh hoạt: Theo tháng, theo loại (Thu/Chi), theo danh mục, tìm kiếm theo từ khóa.
- 📑 **Xuất dữ liệu Excel / CSV chuẩn Tiếng Việt:**
  - Hỗ trợ xuất toàn bộ giao dịch ra file CSV chuẩn UTF-8, mở trên Excel hiển thị Tiếng Việt 100% không bị lỗi font.

---

## 📲 Hướng dẫn Cài đặt App về Màn hình chính

### 1. Trên điện thoại Android (Chrome):
- Mở link web: `https://phong09829.github.io/Daily_Expense_Tracker/`
- Bấm nút **"Cài đặt ngay"** trên banner đầu trang, hoặc chạm vào menu 3 chấm dọc `⋮` ở góc trên bên phải ➜ Chọn **"Thêm vào màn hình chính"** (hoặc **"Cài đặt ứng dụng"**).

### 2. Trên iPhone / iPad (iOS Safari):
- Mở link web bằng trình duyệt **Safari**.
- Bấm vào biểu tượng nút **Chia sẻ** (icon ô vuông có mũi tên trỏ lên `⎋`) ở thanh điều hướng dưới cùng.
- Cuộn xuống chọn **"Thêm vào MH chính"** (**Add to Home Screen** `⊞`).
- Bấm **Thêm** ở góc trên bên phải. Biểu tượng ứng dụng ExpenseFlow sẽ xuất hiện trên màn hình chính như một app tải từ App Store!

### 3. Trên Máy tính (Chrome / Edge):
- Bấm vào biểu tượng cài đặt (máy tính có mũi tên tải xuống) ở thanh địa chỉ URL trình duyệt, hoặc bấm nút **"Tải App"** trên thanh header của trang web.

---

## 📂 Cấu trúc mã nguồn

```text
Daily_Expense_Tracker/
├── index.html                 # Giao diện chính Responsive + PWA Meta Tags + Bottom Nav
├── style.css                  # CSS tối ưu cảm ứng, safe-area tai thỏ iPhone, animation
├── app.js                     # Logic Dual-mode (Local + Firebase), Chart.js & PWA
├── manifest.json              # Khai báo cấu hình PWA (Icon, Tên app, Display Standalone)
├── sw.js                      # Service Worker quản lý offline cache
├── vercel.json                # Cấu hình xuất bản Vercel
├── firebase.json              # Cấu hình xuất bản Firebase Hosting
├── icons/                     # Bộ biểu tượng ứng dụng PWA
│   ├── icon-192.png           # Icon 192x192 cho Mobile
│   ├── icon-512.png           # Icon 512x512 cho Splash Screen
│   └── favicon.png            # Favicon trình duyệt
└── README.md                  # Hướng dẫn chi tiết
```

---

## 🔐 (Tùy chọn) Kết nối Google Firebase riêng của bạn

Nếu bạn muốn kích hoạt tính năng đồng bộ đám mây bằng tài khoản Google riêng:
1. Bấm vào biểu tượng bánh răng **⚙️ (Cài đặt)** ở góc trên thanh Header của App.
2. Điền thông tin `apiKey`, `projectId`, `authDomain` từ Firebase Console của bạn.
3. Bấm **Lưu & Kết nối**. Trình duyệt sẽ tự động kết nối Firebase và cho phép bạn Đăng nhập Google!
