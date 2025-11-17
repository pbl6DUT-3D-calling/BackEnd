
const path = require("path");
const fs = require("fs"); 
const bucket = require("../config/firebase").bucket; 
const { Models3D } = require('../models'); 

exports.uploadModelFile = async (req, res) => {
  // 1. Lấy file từ req.files (thay vì req.file)
  // Middleware 'upload.fields' sẽ cung cấp 'req.files'
  const modelFile = req.files?.modelFile?.[0];       // Lấy file model
  const thumbnailFile = req.files?.thumbnailFile?.[0]; // Lấy file thumbnail

  // Lấy đường dẫn file tạm
  const modelFilePath = modelFile?.path;
  const thumbnailFilePath = thumbnailFile?.path;

  // Lấy thông tin file model (giống như code cũ của bạn)
  const originalModelName = modelFile ? modelFile.originalname : 'untitled';
  const fileSizeInBytes = modelFile ? modelFile.size : 0;

  try {
    // 2. Kiểm tra file model (bắt buộc)
    if (!modelFilePath) {
      return res.status(400).json({ error: "Không có file model nào được tải lên." });
    }

    // 3. Xử lý Upload file 3D (logic giống hệt code cũ)
    const modelFileExtension = path.extname(originalModelName); 
    const modelUniqueFilename = `${req.user.user_id}_${Date.now()}${modelFileExtension}`;
    const modelDestinationPath = `vrm_models/${modelUniqueFilename}`;
    
    await bucket.upload(modelFilePath, {
      destination: modelDestinationPath,
      metadata: { contentType: modelFile.mimetype },
    });

    // Lấy URL file 3D
    const modelFileRef = bucket.file(modelDestinationPath);
    const expiresDate = new Date();
    expiresDate.setFullYear(expiresDate.getFullYear() + 100);
    const [modelSignedUrl] = await modelFileRef.getSignedUrl({
      action: 'read',
      expires: expiresDate,
    });

    // ----- 4. Xử lý Upload file Thumbnail (PHẦN MỚI) -----
    // Khai báo biến để lưu kết quả của thumbnail
    let thumbnailSignedUrl = null;
    let thumbnailDestinationPath = null;

    if (thumbnailFilePath) {
      // Nếu có file thumbnail, chúng ta mới upload nó
      const thumbFileExtension = path.extname(thumbnailFile.originalname);
      const thumbUniqueFilename = `${req.user.user_id}_thumb_${Date.now()}${thumbFileExtension}`;
      thumbnailDestinationPath = `thumbnails/${thumbUniqueFilename}`; // Lưu vào folder riêng

      await bucket.upload(thumbnailFilePath, {
        destination: thumbnailDestinationPath,
        metadata: { contentType: thumbnailFile.mimetype },
      });

      // Lấy URL file thumbnail
      const thumbFileRef = bucket.file(thumbnailDestinationPath);
      const [thumbUrl] = await thumbFileRef.getSignedUrl({
        action: 'read',
        expires: expiresDate, // Dùng chung ngày hết hạn
      });
      thumbnailSignedUrl = thumbUrl;
    }

    // ----- 5. Lưu vào CSDL (ĐÃ CẬP NHẬT) -----
    const modelName = req.body.name || originalModelName;
    
    const newModel = await Models3D.create({
      user_id: req.user.user_id,
      file_url: modelSignedUrl, 
      file_public_id: modelDestinationPath,
      name:  modelName, 
      description: req.body.description || null, 
      file_size: fileSizeInBytes,
      // 'upload_date' sẽ được tự động điền bởi Sequelize/DB
      
      // Thêm 2 trường thumbnail mới
      thumbnail_url: thumbnailSignedUrl,
      thumbnail_public_id: thumbnailDestinationPath,
    });

    res.status(201).json({
      message: "Tải file và thumbnail lên Firebase thành công!",
      model: newModel,
    });

  } catch (error) {
    console.error("LỖI KHI UPLOAD LÊN FIREBASE:", error);
    res.status(500).json({ error: "Lỗi server khi đang tải file." });
  } finally {
    // ----- 6. Xóa cả 2 file tạm (NẾU CÓ) -----
    if (modelFilePath) {
      try { fs.unlinkSync(modelFilePath); } catch (e) { console.error("Lỗi xóa file tạm (model):", e.message); }
    }
    if (thumbnailFilePath) {
      try { fs.unlinkSync(thumbnailFilePath); } catch (e) { console.error("Lỗi xóa file tạm (thumb):", e.message); }
    }
  }
};

exports.deleteModelFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const modelRecord = await Models3D.findOne({
      where: {
        id: id,
        user_id: userId,
      },
    });

    if (!modelRecord) {
      return res.status(404).json({ 
        error: "Không tìm thấy file hoặc bạn không có quyền xóa file này." 
      });
    }

    const filePath = modelRecord.file_public_id;

    if (filePath) {
      const fileRef = bucket.file(filePath);
      
      try {
        await fileRef.delete();
      } catch (storageError) {
        console.warn(`Lỗi khi xóa file khỏi Storage (${filePath}), 
                      nhưng vẫn tiếp tục xóa khỏi DB:`, storageError.message);
      }
    }

    await modelRecord.destroy();
    res.status(200).json({ message: "Đã xóa file model thành công." });

  } catch (error) {
    console.error("LỖI KHI XÓA FILE:", error);
    res.status(500).json({ error: "Lỗi server khi đang xóa file." });
  }
};

exports.getMyModels = async (req, res) => {
  try {
    // 1. Lấy user_id từ middleware verifyToken
    const userId = req.user.user_id;

    // 2. Tìm tất cả các model trong DB thuộc về user_id này
    const userModels = await Models3D.findAll({
      where: {
        user_id: userId
      },
      order: [
        ['id', 'DESC'] // Tùy chọn: Sắp xếp theo ID mới nhất
      ]
    });

    // 3. Trả về danh sách (sẽ là mảng rỗng [] nếu không tìm thấy)
    res.status(200).json(userModels);

  } catch (error) {
    console.error("LỖI KHI LẤY MODELS CỦA USER:", error);
    res.status(500).json({ error: "Lỗi server khi đang lấy models." });
  }
};


exports.deleteModelFile = async (req, res) => {
  try {
    // 1. Lấy ID của model từ URL (ví dụ: /api/model3d/123)
    const { id } = req.params;
    // Lấy user ID từ token (đã được verifyToken)
    const userId = req.user.user_id;

    // 2. Tìm bản ghi model trong DB
    // Quan trọng: Phải tìm bằng cả 'id' VÀ 'user_id'
    // để đảm bảo user chỉ có thể xóa file của chính mình.
    const modelRecord = await Models3D.findOne({
      where: {
        id: id,
        user_id: userId,
      },
    });

    // 3. Xử lý nếu không tìm thấy file
    if (!modelRecord) {
      return res.status(404).json({ 
        error: "Không tìm thấy file hoặc bạn không có quyền xóa file này." 
      });
    }

    // 4. Lấy đường dẫn file (file_public_id)
    const filePath = modelRecord.file_public_id;

    // 5. Xóa file khỏi Firebase Storage
    if (filePath) {
      // Tạo tham chiếu (reference) đến file
      const fileRef = bucket.file(filePath);
      
      try {
        // Thực hiện xóa
        await fileRef.delete();
      } catch (storageError) {
        // Log lỗi storage nhưng vẫn tiếp tục để xóa DB
        console.warn(`Lỗi khi xóa file khỏi Storage (${filePath}), 
                      nhưng vẫn tiếp tục xóa khỏi DB:`, storageError.message);
      }
    }

    // 6. Xóa bản ghi khỏi Database
    await modelRecord.destroy();

    // 7. Trả về thành công
    res.status(200).json({ message: "Đã xóa file model thành công." });

  } catch (error) {
    console.error("LỖI KHI XÓA FILE:", error);
    res.status(500).json({ error: "Lỗi server khi đang xóa file." });
  }
};