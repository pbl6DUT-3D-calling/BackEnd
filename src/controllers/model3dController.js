
const path = require("path");
const fs = require("fs"); 
const bucket = require("../config/firebase").bucket; 
const { Models3D } = require('../models'); 

exports.uploadModelFile = async (req, res) => {
  const filePath = req.file ? req.file.path : null;
  const originalName = req.file ? req.file.originalname : 'untitled';

  try {
    if (!filePath) {
      return res.status(400).json({ error: "Không có file nào được tải lên." });
    }

    const fileExtension = path.extname(originalName); 
    const uniqueFilename = `${req.user.user_id}_${Date.now()}${fileExtension}`;
    const destinationPath = `vrm_models/${uniqueFilename}`;
    await bucket.upload(filePath, {
      destination: destinationPath,
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    const fileRef = bucket.file(destinationPath);
    const expiresDate = new Date();
    expiresDate.setFullYear(expiresDate.getFullYear() + 100);

    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: expiresDate,
    });
    const modelName = req.body.name || originalName;
    const newModel = await Models3D.create({
      user_id: req.user.user_id,
      file_url: signedUrl, 
      file_public_id: destinationPath,
      name:  modelName, 
      description: req.body.description || null, 
    });


    res.status(201).json({
      message: "Tải file lên Firebase thành công!",
      model: newModel,
    });

  } catch (error) {
    console.error("LỖI KHI UPLOAD LÊN FIREBASE:", error);
    res.status(500).json({ error: "Lỗi server khi đang tải file." });
  } finally {

    if (filePath) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error("Lỗi khi xóa file tạm:", unlinkErr);
      }
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