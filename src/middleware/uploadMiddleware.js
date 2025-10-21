const multer = require('multer');

// Cấu hình Multer để lưu file vào bộ nhớ
const storage = multer.memoryStorage();

// Giới hạn kích thước file (ví dụ: 100MB cho file .vrm)
const limits = {
  fileSize: 100 * 1024 * 1024, // 100 MB
};

// Khởi tạo middleware
const upload = multer({
  storage: storage,
  limits: limits,
  fileFilter: (req, file, cb) => {
    // (Tùy chọn) Bạn có thể lọc loại file ở đây
    // Ví dụ: chỉ chấp nhận file .vrm
    // if (!file.originalname.endsWith('.vrm')) {
    //   return cb(new Error('Chỉ chấp nhận file .vrm'), false);
    // }
    cb(null, true);
  }
});

module.exports = upload;