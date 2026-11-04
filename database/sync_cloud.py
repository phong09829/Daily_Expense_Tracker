#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ExpenseFlow Pro - Cloud Database Sync
Tải toàn bộ tài khoản và mã PIN từ Google Sheets Online Database về lưu trữ trực tiếp
vào file database SQLite (expenseflow.db) và file JSON (accounts_backup.json) trên máy tính của bạn.
"""

import os
import sys
import json
import urllib.request
import urllib.error

# Đảm bảo in tiếng Việt trên console Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(DIR, "cloud_config.json")

sys.path.append(DIR)
from db_manager import init_db, save_or_update_user, sync_to_json, list_all_users

def get_cloud_url():
    """Đọc URL Google Apps Script từ config nếu đã lưu"""
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                return cfg.get("cloud_api_url", "").strip()
        except Exception:
            pass
    return ""

def set_cloud_url(url: str):
    """Lưu URL Google Apps Script vào config"""
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump({"cloud_api_url": url.strip()}, f, ensure_ascii=False, indent=2)

def sync_from_cloud():
    init_db()
    cloud_url = get_cloud_url()

    print("\n" + "=" * 60)
    print("  ☁️ EXPENSEFLOW PRO - ĐỒNG BỘ CLOUD VỀ MÁY TÍNH CỦA BẠN")
    print("=" * 60)

    if not cloud_url:
        print("Chưa cấu hình URL Google Sheets Database!")
        print("Ví dụ: https://script.google.com/macros/s/AKfycbx.../exec")
        url_input = input("👉 Dán URL Google Apps Script của bạn vào đây: ").strip()
        if not url_input:
            print("Đã hủy.")
            return
        set_cloud_url(url_input)
        cloud_url = url_input

    print(f"\n📡 Đang tải danh sách tài khoản từ Google Sheets Online...")
    try:
        req = urllib.request.Request(
            cloud_url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode("utf-8"))

        if data.get("status") != "online" and "users" not in data:
            print(f"❌ Phản hồi không hợp lệ từ Cloud: {data}")
            return

        users = data.get("users", [])
        print(f"✅ Tìm thấy {len(users)} tài khoản trên Cloud!")

        count = 0
        for u in users:
            email = u.get("email")
            pin = u.get("pin_code")
            notes = u.get("notes") or "Đồng bộ từ Google Sheets Cloud"
            if email and pin and len(pin) == 6:
                save_or_update_user(email, pin, notes)
                count += 1
                print(f"  + Đã lưu: {email:<25} | PIN: {pin}")

        sync_to_json()
        print("\n" + "-" * 60)
        print(f"🎉 ĐỒNG BỘ THÀNH CÔNG {count} TÀI KHOẢN!")
        print(f"📁 Đã lưu vào: database/expenseflow.db")
        print(f"📄 Đã cập nhật file: database/accounts_backup.json")
        print("-" * 60)

    except urllib.error.URLError as e:
        print(f"❌ Lỗi kết nối mạng: {e}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    sync_from_cloud()
