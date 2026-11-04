#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ExpenseFlow Pro - Cloud Vault Synchronizer (Tự động 100%)
Kéo toàn bộ tài khoản Gmail và Mã PIN do bất kỳ ai tạo trên Web về lưu trực tiếp
vào database/expenseflow.db và database/accounts_backup.json trên máy tính của bạn.
"""

import os
import sys
import json
import re
import time
import urllib.request
import urllib.error

# Đảm bảo in tiếng Việt trên console Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(DIR)
from db_manager import init_db, save_or_update_user, sync_to_json, list_all_users

VAULT_TOPIC = "expenseflow_phong09829_vault"
VAULT_URL = f"https://ntfy.sh/{VAULT_TOPIC}/json?poll=1"

def parse_account_message(msg: str):
    """
    Phân tích chuỗi tin nhắn tài khoản:
    Ví dụ: 'Email: abc@gmail.com | PIN: 123456 | Luc: 13:45'
    hoặc dạng JSON: '{"email":"abc@gmail.com", "pin":"123456"}'
    """
    msg = msg.strip()
    # 1. Thử đọc dạng JSON
    try:
        data = json.loads(msg)
        if isinstance(data, dict) and data.get("email") and data.get("pin"):
            return str(data["email"]).strip(), str(data["pin"]).strip(), data.get("time", "")
    except Exception:
        pass

    # 2. Đọc dạng Text
    email_match = re.search(r"Email:\s*([^\s|]+@[^\s|]+)", msg, re.IGNORECASE)
    pin_match = re.search(r"PIN:\s*(\d{6})", msg, re.IGNORECASE)

    if email_match and pin_match:
        return email_match.group(1).strip(), pin_match.group(1).strip(), ""

    return None, None, None

def pull_from_vault():
    """Tải tất cả tài khoản từ Cloud Vault về máy tính"""
    init_db()
    print("\n" + "=" * 65)
    print("  ☁️ EXPENSEFLOW PRO - TỰ ĐỘNG ĐỒNG BỘ TÀI KHOẢN TỪ CLOUD VAULT")
    print("=" * 65)
    print(f"🔗 Cloud Vault: https://ntfy.sh/{VAULT_TOPIC}")
    print(f"📁 Database đích: {os.path.join(DIR, 'expenseflow.db')}")
    print(f"📄 File sao lưu: {os.path.join(DIR, 'accounts_backup.json')}")
    print("-" * 65)
    print("📡 Đang kết nối và quét toàn bộ tài khoản mới...")

    try:
        req = urllib.request.Request(VAULT_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as res:
            content = res.read().decode("utf-8")

        lines = content.strip().split("\n")
        synced_count = 0

        for line in lines:
            if not line.strip():
                continue
            try:
                item = json.loads(line)
                if item.get("event") == "message":
                    msg = item.get("message", "")
                    email, pin, created_time = parse_account_message(msg)
                    if email and pin and len(pin) == 6:
                        save_or_update_user(email, pin, notes="Tự động đồng bộ từ Cloud Vault")
                        synced_count += 1
                        print(f"  + Đã lưu tài khoản: {email:<28} | Mã PIN: {pin}")
            except Exception as ex:
                continue

        sync_to_json()
        print("-" * 65)
        if synced_count > 0:
            print(f"🎉 ĐÃ ĐỒNG BỘ THÀNH CÔNG {synced_count} TÀI KHOẢN VÀO DATABASE CỦA BẠN!")
        else:
            print("ℹ️ Chưa có tài khoản mới nào trong Vault. Khi có người tạo trên Web, chạy lại lệnh này sẽ thấy ngay!")
        print("=" * 65)

    except urllib.error.URLError as e:
        print(f"❌ Lỗi kết nối mạng: {e}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

def watch_vault_live():
    """Chế độ lắng nghe liên tục trong thời gian thực"""
    init_db()
    print("\n" + "=" * 65)
    print("  ⚡ EXPENSEFLOW PRO - CHẾ ĐỘ LẮNG NGHE THỜI GIAN THỰC (LIVE)")
    print("=" * 65)
    print(f"Đang chờ người tạo tài khoản trên web... (Bấm Ctrl+C để dừng)")
    print("-" * 65)

    listen_url = f"https://ntfy.sh/{VAULT_TOPIC}/raw"
    try:
        req = urllib.request.Request(listen_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=300) as response:
            for raw_line in response:
                line = raw_line.decode("utf-8").strip()
                if not line:
                    continue
                email, pin, _ = parse_account_message(line)
                if email and pin and len(pin) == 6:
                    save_or_update_user(email, pin, notes="Lưu trực tiếp thời gian thực")
                    sync_to_json()
                    now = time.strftime("%H:%M:%S")
                    print(f"[{now}] 🔔 CÓ TÀI KHOẢN MỚI: {email} | Mã PIN: {pin} -> Đã lưu vào Database!")
    except KeyboardInterrupt:
        print("\nĐã dừng chế độ lắng nghe.")
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--live":
        watch_vault_live()
    else:
        pull_from_vault()
