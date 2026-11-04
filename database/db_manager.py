#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ExpenseFlow Pro - Trình Quản trị Cơ sở Dữ liệu (Database Manager)
Lưu trữ và quản lý tài khoản Gmail cùng Mã PIN 6 số đăng nhập.
Sử dụng SQLite tích hợp sẵn trong Python (Không cần cài đặt thêm thư viện).
"""

import os
import sys
import json
import sqlite3
import hashlib
from datetime import datetime

# Đảm bảo hiển thị Unicode tiếng Việt trên mọi phiên bản Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Đường dẫn file database SQLite trong thư mục hiện tại
DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "expenseflow.db")
SCHEMA_PATH = os.path.join(DB_DIR, "schema.sql")
JSON_BACKUP_PATH = os.path.join(DB_DIR, "accounts_backup.json")

def hash_pin(pin: str) -> str:
    """Băm mã PIN bằng SHA-256 tương thích với thuật toán trên Web App"""
    salted = f"EXPENSEFLOW_SALT_PIN_{pin}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()

def get_connection():
    """Tạo kết nối tới SQLite database và bật foreign keys"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Khởi tạo database từ file schema.sql nếu chưa tồn tại"""
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema_sql = f.read()
    else:
        schema_sql = """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            pin_code TEXT NOT NULL,
            pin_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        );
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            user_email TEXT NOT NULL,
            type TEXT CHECK(type IN ('expense', 'income')) NOT NULL,
            amount INTEGER NOT NULL CHECK(amount > 0),
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE ON UPDATE CASCADE
        );
        """

    conn = get_connection()
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()

def clean_email(email: str) -> str:
    return email.strip().lower()

def save_or_update_user(email: str, pin: str, notes: str = "") -> dict:
    """Thêm mới hoặc cập nhật Mã PIN cho tài khoản Gmail"""
    email = clean_email(email)
    pin = str(pin).strip()
    if len(pin) != 6 or not pin.isdigit():
        raise ValueError("Mã PIN phải gồm đúng 6 chữ số (0-9)!")

    hashed = hash_pin(pin)
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE users 
                SET pin_code = ?, pin_hash = ?, notes = COALESCE(NULLIF(?, ''), notes), updated_at = ?
                WHERE email = ?
            """, (pin, hashed, notes, now, email))
            action = "updated"
        else:
            cursor.execute("""
                INSERT INTO users (email, pin_code, pin_hash, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (email, pin, hashed, notes, now, now))
            action = "created"

        conn.commit()
        sync_to_json()
        return {"status": "success", "action": action, "email": email, "pin": pin}
    finally:
        conn.close()

def get_user_by_email(email: str):
    """Tìm tài khoản theo địa chỉ Gmail"""
    email = clean_email(email)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def list_all_users():
    """Lấy danh sách tất cả tài khoản Gmail và Mã PIN đang lưu"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.email, u.pin_code, u.notes, u.created_at, u.updated_at,
                   COUNT(t.id) as total_transactions
            FROM users u
            LEFT JOIN transactions t ON u.email = t.user_email
            GROUP BY u.id
            ORDER BY u.id ASC
        """)
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def delete_user(email: str) -> bool:
    """Xóa tài khoản Gmail và toàn bộ giao dịch tương ứng"""
    email = clean_email(email)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE email = ?", (email,))
        conn.commit()
        sync_to_json()
        return cursor.rowcount > 0
    finally:
        conn.close()

def sync_to_json():
    """Tự động xuất bản sao lưu ra file JSON để người dùng dễ đọc trực tiếp bằng Notepad"""
    users = list_all_users()
    data = {
        "_chu_thich": "File sao lưu tự động danh sách tài khoản Gmail và Mã PIN đăng nhập",
        "thoi_gian_cap_nhat": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "tong_so_tai_khoan": len(users),
        "danh_sach_tai_khoan": users
    }
    with open(JSON_BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def interactive_cli():
    """Giao diện dòng lệnh (CLI) trực quan bằng tiếng Việt"""
    init_db()
    while True:
        print("\n" + "=" * 60)
        print("  📊 EXPENSEFLOW PRO - QUẢN LÝ DATABASE TÀI KHOẢN & MÃ PIN")
        print("=" * 60)
        print(f"📁 Vị trí Database: {DB_PATH}")
        print("1. 📋 Xem danh sách tất cả Gmail & Mã PIN")
        print("2. ➕ Thêm mới tài khoản Gmail & Mã PIN")
        print("3. 🔑 Đổi Mã PIN cho Gmail có sẵn")
        print("4. 🗑️  Xóa tài khoản")
        print("5. 🔄 Xuất file JSON (dễ xem bằng Notepad)")
        print("6. ☁️  Tự động đồng bộ tài khoản từ Cloud Vault (ntfy.sh)")
        print("0. 🚪 Thoát")
        print("-" * 60)

        choice = input("👉 Chọn chức năng (0-6): ").strip()

        if choice == "1":
            users = list_all_users()
            print("\n" + "-" * 60)
            print(f"{'ID':<4} | {'GMAIL':<28} | {'MÃ PIN':<8} | {'SỐ GD':<6} | {'NGÀY TẠO'}")
            print("-" * 60)
            if not users:
                print("Chưa có tài khoản nào trong database!")
            for u in users:
                print(f"{u['id']:<4} | {u['email']:<28} | {u['pin_code']:<8} | {u['total_transactions']:<6} | {u['created_at']}")
            print("-" * 60)

        elif choice == "2":
            email = input("Nhập địa chỉ Gmail: ").strip()
            pin = input("Nhập Mã PIN 6 số: ").strip()
            notes = input("Ghi chú (tùy chọn): ").strip()
            try:
                res = save_or_update_user(email, pin, notes)
                print(f"✅ Đã lưu tài khoản '{res['email']}' với Mã PIN '{res['pin']}' vào Database thành công!")
            except Exception as e:
                print(f"❌ Lỗi: {e}")

        elif choice == "3":
            email = input("Nhập địa chỉ Gmail cần đổi PIN: ").strip()
            user = get_user_by_email(email)
            if not user:
                print(f"❌ Không tìm thấy tài khoản Gmail '{email}' trong database!")
                continue
            print(f"Mã PIN hiện tại của {email} là: {user['pin_code']}")
            new_pin = input("Nhập Mã PIN 6 số mới: ").strip()
            try:
                save_or_update_user(email, new_pin)
                print(f"✅ Đã đổi Mã PIN cho '{email}' thành '{new_pin}' thành công!")
            except Exception as e:
                print(f"❌ Lỗi: {e}")

        elif choice == "4":
            email = input("Nhập địa chỉ Gmail muốn xóa: ").strip()
            confirm = input(f"Bạn có chắc muốn xóa '{email}' và toàn bộ dữ liệu? (y/N): ").strip().lower()
            if confirm == "y":
                if delete_user(email):
                    print(f"✅ Đã xóa tài khoản '{email}' thành công!")
                else:
                    print(f"❌ Không tìm thấy tài khoản '{email}' để xóa.")

        elif choice == "5":
            sync_to_json()
            print(f"✅ Đã xuất dữ liệu ra file: {JSON_BACKUP_PATH}")

        elif choice == "6":
            try:
                from sync_vault import pull_from_vault
                pull_from_vault()
            except Exception as e:
                print(f"❌ Lỗi đồng bộ Cloud Vault: {e}")

        elif choice == "0":
            print("Tạm biệt!")
            sys.exit(0)
        else:
            print("Lựa chọn không hợp lệ, vui lòng chọn lại!")

if __name__ == "__main__":
    init_db()
    # Nếu chạy trực tiếp thì mở giao diện tương tác
    if len(sys.argv) > 1 and sys.argv[1] == "--init":
        print("Database initialized successfully.")
    else:
        interactive_cli()
