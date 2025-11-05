const nodemailer = require("nodemailer");
require("dotenv").config(); // Đảm bảo file này đọc được file .env

// 1. Tạo "người vận chuyển" (transporter)
// Cấu hình này dùng Gmail. Bạn cần "Mật khẩu ứng dụng" từ Google.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // Đọc email và mật khẩu từ file .env
    user: process.env.EMAIL_USER, // Ví dụ: "my-email@gmail.com"
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng 16 ký tự
  },
});

// 2. (Tùy chọn) Kiểm tra cấu hình có đúng không
// Giúp bạn biết ngay khi khởi động server nếu mật khẩu .env bị sai
transporter.verify((error, success) => {
  if (error) {
    console.error("LỖI CẤU HÌNH NODEMAILER:", error.message);
  } else {
    console.log("Nodemailer đã sẵn sàng để gửi mail.");
  }
});

// 3. Export "người vận chuyển" để các service khác (như AuthService) có thể dùng
module.exports = transporter;
