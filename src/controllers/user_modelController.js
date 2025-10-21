const UserModelService  = require("../service/user_model_service");
const cloudinary = require("../config/cloudinary");


const { UserModel } = require("../models");
exports.getUserModelsByUserId = async (req, res) => {
    console.log("REQ USER:", req.user);
  // 1. DÙNG TRY...CATCH
  try {
    // 2. Lấy user_id từ req.user (giờ đã an toàn vì có verifyToken)
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(400).json({ error: "Không tìm thấy user ID" });
    }

    // 3. Truy vấn database
    const userModels = await UserModel.findAll({
      where: { user_id: userId },
    });

    res.json(userModels);

  } catch (error) {
    // 4. Báo lỗi chi tiết (cho bạn) và lỗi chung (cho client)
    console.error("LỖI THỰC SỰ LÀ:", error); // <-- Bạn sẽ thấy lỗi thật ở đây
    res.status(500).json({ error: "Đã xảy ra lỗi khi lấy dữ liệu" });
  }

};
exports.uploadModelFile = async (req, res) => {
  try {
    // 1. Multer đã xử lý file và lưu vào req.file
    if (!req.file) {
      return res.status(400).json({ error: "Không có file nào được tải lên." });
    }
    
    // 2. Upload file lên Cloudinary từ bộ nhớ (buffer)
    // Dùng 'upload_stream' để upload buffer
    const uploadResponse = await new Promise((resolve, reject) => {
      
      const stream = cloudinary.uploader.upload_stream(
        {
          // Vì là file .vrm (không phải ảnh/video), ta dùng "raw"
          resource_type: "raw", 
          folder: "vrm_models", // Tên thư mục trên Cloudinary
          public_id: `${req.user.user_id}_${Date.now()}` // Tên file duy nhất
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      // Ghi buffer file vào stream để bắt đầu upload
      stream.end(req.file.buffer);
    });

    // 3. Lấy URL an toàn (https) và public_id từ Cloudinary
    const fileUrl = uploadResponse.secure_url;
    const publicId = uploadResponse.public_id;

    // 4. Lưu đường dẫn này vào CSDL (Postgres)
    const newModel = await UserModel.create({
      user_id: req.user.user_id, // Lấy từ 'verifyToken'
      file_url: fileUrl,
      file_public_id: publicId, // Cần lưu lại public_id để XÓA file
      // ... các trường khác của bạn
    });

    res.status(201).json({
      message: "Tải file lên thành công!",
      model: newModel,
    });

  } catch (error) {
    console.error("LỖI KHI UPLOAD:", error);
    res.status(500).json({ error: "Lỗi server khi đang tải file." });
  }
};
