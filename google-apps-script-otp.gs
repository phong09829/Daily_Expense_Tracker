/**
 * Google Apps Script - ExpenseFlow Pro OTP Email Dispatcher
 * 
 * Hướng dẫn triển khai (Chỉ mất 1 phút):
 * 1. Truy cập https://script.google.com và tạo "Dự án mới" (New project)
 * 2. Dán toàn bộ nội dung file này vào editor và bấm Lưu (Save)
 * 3. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 * 4. Chọn loại: "Ứng dụng web" (Web app)
 *    - Thực thi dưới dạng: Tôi (Tài khoản Google của bạn)
 *    - Ai có quyền truy cập: Bất kỳ ai (Anyone)
 * 5. Bấm Triển khai và Cấp quyền truy cập (Authorize access)
 * 6. Sao chép "URL ứng dụng web" (kết thúc bằng /exec) và dán vào ExpenseFlow Pro
 */

function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (ex) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var email = (data.email || data.to_email || "").trim();
    var otp = (data.otp || data.otp_code || "").trim();
    var appName = data.appName || "ExpenseFlow Pro";

    if (!email || !otp) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Thiếu địa chỉ email hoặc mã OTP"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var subject = "[" + appName + "] Mã OTP xác thực đăng nhập: " + otp;
    
    var htmlBody = "" +
      "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 24px; text-align: center;\">" +
        "<div style=\"display: inline-block; width: 48px; height: 48px; background-color: #eef2ff; border-radius: 12px; line-height: 48px; font-size: 24px; margin-bottom: 16px;\">🛡️</div>" +
        "<h2 style=\"color: #1e293b; margin: 0 0 8px 0; font-size: 20px; font-weight: 800;\">ExpenseFlow Pro</h2>" +
        "<p style=\"color: #64748b; font-size: 13px; margin: 0 0 24px 0;\">Xác thực đăng nhập tài khoản cá nhân</p>" +
        "<div style=\"background-color: #ffffff; border: 2px dashed #6366f1; border-radius: 14px; padding: 20px; margin-bottom: 24px;\">" +
          "<span style=\"font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;\">Mã xác thực OTP của bạn là:</span>" +
          "<div style=\"font-size: 38px; font-weight: 800; color: #4f46e5; letter-spacing: 8px; margin-top: 10px; font-family: 'JetBrains Mono', Courier, monospace;\">" + otp + "</div>" +
        "</div>" +
        "<p style=\"color: #475569; font-size: 12px; margin: 0 0 8px 0; font-weight: 600;\">⏰ Mã có hiệu lực trong 5 phút.</p>" +
        "<p style=\"color: #94a3b8; font-size: 11px; margin: 0 0 16px 0;\">Vui lòng không chia sẻ mã này cho bất kỳ ai để bảo vệ sổ chi tiêu riêng tư của bạn.</p>" +
        "<div style=\"border-top: 1px solid #e2e8f0; padding-top: 16px;\">" +
          "<p style=\"color: #94a3b8; font-size: 10px; margin: 0;\">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>" +
        "</div>" +
      "</div>";

    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã gửi mã OTP thành công về hộp thư Gmail!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "ExpenseFlow Pro OTP Dispatcher",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

