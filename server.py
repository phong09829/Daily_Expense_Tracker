#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ExpenseFlow Pro - Local HTTP & Database Server
Chạy máy chủ cục bộ và kết nối trực tiếp với SQLite Database (database/expenseflow.db).
Sử dụng 100% thư viện chuẩn của Python (Không cần cài đặt thêm pip).
"""

import os
import sys
import json
import sqlite3
import hashlib
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Đảm bảo hiển thị Unicode tiếng Việt trên mọi phiên bản Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database", "expenseflow.db")
PORT = 8000

# Khởi tạo database nếu chưa có
try:
    from database.db_manager import init_db, hash_pin, save_or_update_user, get_user_by_email, list_all_users, get_connection
    init_db()
except Exception as e:
    print(f"Lỗi nạp database manager: {e}")

class ExpenseFlowHandler(SimpleHTTPRequestHandler):
    """Xử lý các yêu cầu Web tĩnh và REST API kết nối SQLite Database"""

    def end_headers(self):
        # Hỗ trợ CORS cho phép kết nối linh hoạt
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status_code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                raw_data = self.rfile.read(content_length).decode("utf-8")
                return json.loads(raw_data)
        except Exception:
            pass
        return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # 1. API: Kiểm tra trạng thái Database
        if path == "/api/status":
            self.send_json({
                "status": "online",
                "database": "expenseflow.db",
                "database_path": DB_PATH,
                "message": "Cơ sở dữ liệu đang hoạt động hoàn hảo!"
            })
            return

        # 2. API: Xem danh sách tài khoản & mã PIN trong Database
        if path == "/api/users":
            try:
                users = list_all_users()
                self.send_json({"status": "success", "users": users})
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, 500)
            return

        # 3. API: Lấy danh sách giao dịch của tài khoản
        if path == "/api/transactions":
            email = (query.get("email", [""])[0]).strip().lower()
            if not email:
                self.send_json({"status": "error", "message": "Thiếu email"}, 400)
                return
            conn = get_connection()
            try:
                cur = conn.cursor()
                cur.execute("SELECT * FROM transactions WHERE user_email = ? ORDER BY date DESC, created_at DESC", (email,))
                rows = [dict(r) for r in cur.fetchall()]
                self.send_json({"status": "success", "transactions": rows})
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, 500)
            finally:
                conn.close()
            return

        # Mặc định: Phục vụ các file tĩnh trong thư mục (index.html, app.js, style.css, ...)
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        # 1. API: Kiểm tra tài khoản đã có mã PIN trong Database chưa
        if path == "/api/auth/check":
            email = (body.get("email") or "").strip().lower()
            user = get_user_by_email(email) if email else None
            self.send_json({
                "status": "success",
                "email": email,
                "exists": user is not None,
                "has_pin": user is not None and bool(user.get("pin_code"))
            })
            return

        # 2. API: Đăng nhập / Xác thực Mã PIN
        if path == "/api/auth/verify-pin":
            email = (body.get("email") or "").strip().lower()
            pin = str(body.get("pin") or "").strip()
            user = get_user_by_email(email)
            if not user:
                self.send_json({"status": "error", "message": "Tài khoản chưa tồn tại"}, 404)
                return
            
            is_valid = (user["pin_code"] == pin) or (user["pin_hash"] == hash_pin(pin))
            if is_valid:
                # Cập nhật thời gian đăng nhập
                conn = get_connection()
                try:
                    conn.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = ?", (email,))
                    conn.commit()
                finally:
                    conn.close()
                self.send_json({"status": "success", "message": "Xác thực PIN thành công!", "email": email})
            else:
                self.send_json({"status": "error", "message": "Mã PIN không chính xác!"}, 401)
            return

        # 3. API: Thiết lập Mã PIN mới (lưu vào Database)
        if path == "/api/auth/set-pin":
            email = (body.get("email") or "").strip().lower()
            pin = str(body.get("pin") or "").strip()
            if not email or len(pin) != 6 or not pin.isdigit():
                self.send_json({"status": "error", "message": "Email hoặc Mã PIN 6 số không hợp lệ"}, 400)
                return
            try:
                res = save_or_update_user(email, pin, notes="Tạo từ Web App")
                self.send_json({"status": "success", "message": "Đã lưu tài khoản và mã PIN vào Database!", "data": res})
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, 500)
            return

        # 4. API: Đổi Mã PIN
        if path == "/api/auth/change-pin":
            email = (body.get("email") or "").strip().lower()
            old_pin = str(body.get("oldPin") or "").strip()
            new_pin = str(body.get("newPin") or "").strip()

            user = get_user_by_email(email)
            if not user or ((user["pin_code"] != old_pin) and (user["pin_hash"] != hash_pin(old_pin))):
                self.send_json({"status": "error", "message": "Mã PIN hiện tại không đúng!"}, 400)
                return

            if len(new_pin) != 6 or not new_pin.isdigit():
                self.send_json({"status": "error", "message": "Mã PIN mới phải gồm đúng 6 chữ số!"}, 400)
                return

            try:
                save_or_update_user(email, new_pin)
                self.send_json({"status": "success", "message": "Đã cập nhật Mã PIN trong Database thành công!"})
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, 500)
            return

        # 5. API: Đồng bộ toàn bộ danh sách giao dịch vào Database
        if path == "/api/transactions/sync":
            email = (body.get("email") or "").strip().lower()
            txs = body.get("transactions") or []
            if not email:
                self.send_json({"status": "error", "message": "Thiếu email"}, 400)
                return
            conn = get_connection()
            try:
                # Lưu hoặc cập nhật giao dịch
                for t in txs:
                    conn.execute("""
                        INSERT INTO transactions (id, user_email, type, amount, category, date, note)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            type = excluded.type,
                            amount = excluded.amount,
                            category = excluded.category,
                            date = excluded.date,
                            note = excluded.note,
                            updated_at = CURRENT_TIMESTAMP
                    """, (t.get("id"), email, t.get("type"), int(t.get("amount", 0)), t.get("category", ""), t.get("date", ""), t.get("note", "")))
                conn.commit()
                self.send_json({"status": "success", "synced": len(txs)})
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, 500)
            finally:
                conn.close()
            return

        self.send_json({"status": "error", "message": "Not Found"}, 404)

def run_server():
    os.chdir(BASE_DIR)
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, ExpenseFlowHandler)
    print("\n" + "=" * 65)
    print("  🚀 EXPENSEFLOW PRO - LOCAL DATABASE SERVER ĐANG CHẠY")
    print("=" * 65)
    print(f"📂 Thư mục: {BASE_DIR}")
    print(f"🗄️  Cơ sở dữ liệu SQLite: {DB_PATH}")
    print(f"🌐 Truy cập ứng dụng: http://localhost:{PORT}")
    print("=" * 65)
    print("Ấn Ctrl + C để dừng máy chủ.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng máy chủ.")

if __name__ == "__main__":
    run_server()
