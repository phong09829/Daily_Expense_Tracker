/**
 * ==============================================================================
 * ExpenseFlow Pro - Google Sheets Online Database Engine
 * Hệ thống Cơ sở dữ liệu Cloud Miễn phí 100% kết nối với Web App GitHub Pages.
 * 
 * BẤT KỲ AI TẠO TÀI KHOẢN HOẶC ĐỔI MÃ PIN TRÊN WEB, DỮ LIỆU SẼ TỰ ĐỘNG
 * GHI VÀO GOOGLE SHEET NÀY CỦA BẠN TRONG THỜI GIAN THỰC!
 * ==============================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH (Chỉ mất 1 phút):
 * 1. Truy cập https://sheets.google.com và tạo một "Bảng tính mới" (Google Sheet).
 *    Đặt tên bảng tính là: "ExpenseFlow Database".
 * 2. Trên thanh menu của Google Sheet, bấm: "Tiện ích mở rộng" (Extensions) -> "Apps Script".
 * 3. Xóa hết code mặc định, dán toàn bộ nội dung file này vào và bấm biểu tượng "Lưu" (Ctrl + S).
 * 4. Bấm nút màu xanh "Triển khai" (Deploy) ở góc trên bên phải -> Chọn "Tùy chọn triển khai mới" (New deployment).
 * 5. Bấm vào biểu tượng bánh răng chọn loại: "Ứng dụng web" (Web app).
 *    - Mô tả: ExpenseFlow Database API
 *    - Thực thi dưới dạng: Tôi (Tài khoản Google của bạn)
 *    - Ai có quyền truy cập: Bất kỳ ai (Anyone)  <--- BẮT BUỘC CHỌN ĐỂ WEB GỬI ĐƯỢC DỮ LIỆU
 * 6. Bấm "Triển khai" (Authorize access nếu được hỏi) và SAO CHÉP "URL ứng dụng web" (kết thúc bằng /exec).
 * 7. Dán URL đó vào file `app.js` (hoặc dán vào công cụ quản trị).
 * ==============================================================================
 */

// Tên các trang tính trong file Google Sheet
var USERS_SHEET_NAME = "Danh_Sach_Tai_Khoan";
var TRANSACTIONS_SHEET_NAME = "Giao_Dich";

/**
 * Khởi tạo cấu trúc các cột nếu trang tính mới tạo
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tạo Sheet Tài khoản
  var userSheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!userSheet) {
    userSheet = ss.insertSheet(USERS_SHEET_NAME);
    userSheet.appendRow(["ID", "Địa chỉ Gmail", "Mã PIN 6 số", "Mã băm SHA-256", "Thời gian tạo", "Đăng nhập cuối", "Ghi chú"]);
    userSheet.getRange("A1:G1").setBackground("#4f46e5").setFontColor("#ffffff").setFontWeight("bold");
    userSheet.setFrozenRows(1);
  }

  // 2. Tạo Sheet Giao dịch
  var txSheet = ss.getSheetByName(TRANSACTIONS_SHEET_NAME);
  if (!txSheet) {
    txSheet = ss.insertSheet(TRANSACTIONS_SHEET_NAME);
    txSheet.appendRow(["Mã GD", "Gmail người dùng", "Loại", "Số tiền (VND)", "Danh mục", "Ngày", "Ghi chú", "Thời gian lưu"]);
    txSheet.getRange("A1:H1").setBackground("#10b981").setFontColor("#ffffff").setFontWeight("bold");
    txSheet.setFrozenRows(1);
  }
}

/**
 * Xử lý yêu cầu POST gửi dữ liệu tài khoản và giao dịch từ Web App
 */
function doPost(e) {
  try {
    setupSheets();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var userSheet = ss.getSheetByName(USERS_SHEET_NAME);
    
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var action = data.action || "save_user";
    var email = (data.email || "").trim().toLowerCase();
    var pin = String(data.pin || "").trim();
    var pinHash = data.pinHash || "";
    var now = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

    // 1. LƯU HOẶC CẬP NHẬT TÀI KHOẢN VÀ MÃ PIN
    if (action === "save_user" || action === "register" || action === "change_pin") {
      if (!email || !pin) {
        return createJsonResponse({ status: "error", message: "Thiếu email hoặc mã PIN" });
      }

      var rows = userSheet.getDataRange().getValues();
      var foundIndex = -1;

      // Tìm xem email này đã có trong bảng chưa
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][1]).trim().toLowerCase() === email) {
          foundIndex = i + 1; // Số thứ tự dòng trong Sheet (bắt đầu từ 1)
          break;
        }
      }

      if (foundIndex > 0) {
        // Đã có -> Cập nhật mã PIN mới và thời gian cập nhật
        userSheet.getRange(foundIndex, 3).setValue("'" + pin); // Lưu dạng chuỗi để không mất số 0 ở đầu
        if (pinHash) userSheet.getRange(foundIndex, 4).setValue(pinHash);
        userSheet.getRange(foundIndex, 6).setValue(now);
        userSheet.getRange(foundIndex, 7).setValue("Cập nhật từ Web App");
      } else {
        // Chưa có -> Thêm dòng mới vào cuối bảng
        var newId = rows.length; // Số thứ tự
        userSheet.appendRow([newId, email, "'" + pin, pinHash, now, now, "Tạo từ Web App"]);
      }

      return createJsonResponse({
        status: "success",
        message: "Đã lưu tài khoản " + email + " và Mã PIN vào Google Sheet thành công!",
        email: email,
        timestamp: now
      });
    }

    // 2. LƯU GIAO DỊCH THU CHI
    if (action === "sync_transactions") {
      var txSheet = ss.getSheetByName(TRANSACTIONS_SHEET_NAME);
      var transactions = data.transactions || [];
      
      for (var j = 0; j < transactions.length; j++) {
        var t = transactions[j];
        txSheet.appendRow([
          t.id || ("tx-" + new Date().getTime()),
          email,
          t.type || "expense",
          t.amount || 0,
          t.category || "",
          t.date || "",
          t.note || "",
          now
        ]);
      }

      return createJsonResponse({
        status: "success",
        message: "Đã đồng bộ " + transactions.length + " giao dịch vào Google Sheet!"
      });
    }

    return createJsonResponse({ status: "error", message: "Hành động không hỗ trợ: " + action });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Xử lý yêu cầu GET để xem trạng thái hoặc tải danh sách tài khoản về máy tính
 */
function doGet(e) {
  try {
    setupSheets();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var userSheet = ss.getSheetByName(USERS_SHEET_NAME);

    // Hỗ trợ lưu nhanh qua GET request (siêu ổn định, chống chặn CORS)
    if (e.parameter && e.parameter.email && e.parameter.pin) {
      return doPost(e);
    }

    var rows = userSheet.getDataRange().getValues();

    var users = [];
    for (var i = 1; i < rows.length; i++) {
      users.push({
        id: rows[i][0],
        email: rows[i][1],
        pin_code: String(rows[i][2]).replace(/^'/, ""),
        pin_hash: rows[i][3],
        created_at: rows[i][4],
        last_login: rows[i][5],
        notes: rows[i][6]
      });
    }

    return createJsonResponse({
      status: "online",
      database: "Google Sheets Cloud Database",
      total_users: users.length,
      users: users,
      timestamp: Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss")
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
