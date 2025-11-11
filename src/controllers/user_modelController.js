const UserModelService = require("../service/user_model_service");
const cloudinary = require("../config/cloudinary");
const { UserModel } = require("../models");
const fs = require("fs"); // <--- THÊM VÀO: Cần để xóa file tạm
const bucket = require("../config/firebase").bucket; // <--- THÊM VÀO: Lấy bucket từ config firebase
// Hàm này không thay đổi
exports.getUserModelsByUserId = async (req, res) => {
  console.log("REQ USER:", req.user);
  try {
    const userId = req.user.user_id;
    if (!userId) {
      return res.status(400).json({ error: "Không tìm thấy user ID" });
    }
    const userModels = await UserModel.findAll({
      where: { user_id: userId },
    });
    res.json(userModels);
  } catch (error) {
    console.error("LỖI THỰC SỰ LÀ:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi lấy dữ liệu" });
  }
};

// ========= HÀM NÀY THAY ĐỔI HOÀN TOÀN =========
// exports.uploadModelFile = async (req, res) => {
//   // Lấy đường dẫn file tạm do multer lưu
//   const filePath = req.file ? req.file.path : null; 

//   try {
//     // 1. Kiểm tra file (giờ ta kiểm tra filePath)
//     if (!filePath) {
//       return res.status(400).json({ error: "Không có file nào được tải lên." });
//     }

//     // 2. Upload file lên Cloudinary TỪ ĐƯỜNG DẪN (file path)
//     // Dùng 'cloudinary.uploader.upload' (thay vì upload_stream)
//     // Cloudinary sẽ tự động nhận diện file lớn và dùng chunked upload
//     const uploadResponse = await cloudinary.uploader.upload(filePath, {
//       resource_type: "raw", // Giữ nguyên vì là file .vrm
//       folder: "vrm_models",
//       public_id: `${req.user.user_id}_${Date.now()}`,
//     });

//     // 3. Lấy URL và public_id (giữ nguyên)
//     const fileUrl = uploadResponse.secure_url;
//     const publicId = uploadResponse.public_id;

//     // 4. Lưu vào CSDL (giữ nguyên)
//     const newModel = await UserModel.create({
//       user_id: req.user.user_id,
//       file_url: fileUrl,
//       file_public_id: publicId,
//     });

//     res.status(201).json({
//       message: "Tải file lên thành công!",
//       model: newModel,
//     });

//   } catch (error) {
//     console.error("LỖI KHI UPLOAD:", error);
//     res.status(500).json({ error: "Lỗi server khi đang tải file." });
//   } finally {
//     // 5. RẤT QUAN TRỌNG: Xóa file tạm sau khi upload
//     // Dù upload thành công hay thất bại, ta đều phải xóa file tạm
//     if (filePath) {
//       try {
//         fs.unlinkSync(filePath); // Xóa file đồng bộ
//       } catch (unlinkErr) {
//         console.error("Lỗi khi xóa file tạm:", unlinkErr);
//       }
//     }
//   }
// };


exports.uploadModelFile = async (req, res) => {
  // Lấy đường dẫn file tạm do multer lưu
  const filePath = req.file ? req.file.path : null;

  try {
    // 1. Kiểm tra file (giữ nguyên)
    if (!filePath) {
      return res.status(400).json({ error: "Không có file nào được tải lên." });
    }

    // 2. Chuẩn bị đường dẫn trên Firebase
    // Lấy đuôi file gốc (ví dụ: '.vrm')
    const fileExtension = path.extname(req.file.originalname);
    // Tạo tên file duy nhất (giống logic cũ của bạn)
    const uniqueFilename = `${req.user.user_id}_${Date.now()}${fileExtension}`;
    // Đây là "Public ID" mới của bạn - đường dẫn đầy đủ trên Storage
    const destinationPath = `vrm_models/${uniqueFilename}`;

    // 3. Upload file lên Firebase Storage
    await bucket.upload(filePath, {
      destination: destinationPath,
      metadata: {
        // Firebase sẽ tự phát hiện kiểu 'raw'/'binary'
        // Bạn có thể thêm content-type nếu muốn
        contentType: req.file.mimetype,
      },
    });

    // 4. Lấy URL có thể truy cập (Signed URL)
    const fileRef = bucket.file(destinationPath);

    // Tạo một ngày hết hạn (ví dụ: 100 năm) để URL gần như vĩnh viễn
    const expiresDate = new Date();
    expiresDate.setFullYear(expiresDate.getFullYear() + 100);

    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: expiresDate,
    });
    
    // 5. Lưu vào CSDL
    const newModel = await UserModel.create({
      user_id: req.user.user_id,
      file_url: signedUrl,          // <-- Dùng Signed URL
      file_public_id: destinationPath, // <-- Dùng đường dẫn file làm ID
    });

    res.status(201).json({
      message: "Tải file lên Firebase thành công!",
      model: newModel,
    });

  } catch (error) {
    console.error("LỖI KHI UPLOAD LÊN FIREBASE:", error);
    res.status(500).json({ error: "Lỗi server khi đang tải file." });
  } finally {
    // 6. RẤT QUAN TRỌNG: Xóa file tạm (giữ nguyên)
    if (filePath) {
      try {
        fs.unlinkSync(filePath); // Xóa file đồng bộ
      } catch (unlinkErr) {
        console.error("Lỗi khi xóa file tạm:", unlinkErr);
      }
    }
  }
};