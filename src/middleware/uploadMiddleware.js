// const multer = require('multer');

// // Cấu hình Multer để lưu file vào bộ nhớ
// const storage = multer.memoryStorage();

// // Giới hạn kích thước file (ví dụ: 100MB cho file .vrm)
// const limits = {
//   fileSize: 100 * 1024 * 1024, // 100 MB
// };

// // Khởi tạo middleware
// const upload = multer({
//   storage: storage,
//   limits: limits,
//   fileFilter: (req, file, cb) => {
//     // (Tùy chọn) Bạn có thể lọc loại file ở đây
//     // Ví dụ: chỉ chấp nhận file .vrm
//     // if (!file.originalname.endsWith('.vrm')) {
//     //   return cb(new Error('Chỉ chấp nhận file .vrm'), false);
//     // }
//     cb(null, true);
//   }
// });

// module.exports = upload;

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Định nghĩa thư mục để lưu file tạm
// 'path.join(__dirname, '..', 'uploads')' sẽ tạo thư mục 'uploads' ở thư mục gốc (ví dụ: /src -> /uploads)
const uploadDir = path.join(__dirname, '..', 'uploads');

// Tự động tạo thư mục 'uploads' nếu nó chưa tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Đã tạo thư mục: ${uploadDir}`);
}

// Cấu hình Multer để lưu file tạm vào thư mục 'uploads' trên ổ đĩa
// 'dest' là cách viết tắt của diskStorage
const upload = multer({ 
  dest: uploadDir,
  // Bỏ giới hạn ở đây, hoặc giữ 100MB (tùy bạn)
  limits: {
    fileSize: 100 * 1024 * 1024 // Vẫn nên giữ để server không nhận file quá lớn
  }
});

module.exports = upload;