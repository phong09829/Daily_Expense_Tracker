-- ==============================================================================
-- ExpenseFlow Pro - Database Schema (SQLite)
-- Lưu trữ tài khoản Gmail, Mã PIN đăng nhập và dữ liệu thu chi cá nhân
-- ==============================================================================

-- Bật hỗ trợ khóa ngoại (Foreign Keys)
PRAGMA foreign_keys = ON;

-- 1. BẢNG TÀI KHOẢN GMAIL & MÃ PIN ĐĂNG NHẬP
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,                  -- Địa chỉ Gmail người dùng (chữ thường, chuẩn hóa)
    pin_code TEXT NOT NULL,                      -- Mã PIN 6 số đăng nhập (VD: 123456)
    pin_hash TEXT NOT NULL,                      -- Mã băm bảo mật SHA-256 của mã PIN
    role TEXT DEFAULT 'user',                    -- 'user' hoặc 'admin'
    notes TEXT,                                  -- Ghi chú thêm cho tài khoản
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Thời điểm tạo tài khoản
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Thời điểm cập nhật mã PIN gần nhất
    last_login DATETIME                          -- Thời điểm đăng nhập gần nhất
);

-- 2. BẢNG GIAO DỊCH THU NHẬP VÀ CHI TIÊU
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,                         -- Mã định danh giao dịch (tx-...)
    user_email TEXT NOT NULL,                    -- Gmail chủ sở hữu giao dịch
    type TEXT CHECK(type IN ('expense', 'income')) NOT NULL, -- 'expense' (chi tiêu) hoặc 'income' (thu nhập)
    amount INTEGER NOT NULL CHECK(amount > 0),   -- Số tiền giao dịch (VND)
    category TEXT NOT NULL,                      -- Danh mục (Ăn uống, Lương, Mua sắm, v.v.)
    date TEXT NOT NULL,                          -- Ngày giao dịch định dạng YYYY-MM-DD
    note TEXT,                                   -- Ghi chú chi tiết
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. CHỈ MỤC TỐI ƯU TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_email ON transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
