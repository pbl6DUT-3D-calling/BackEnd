// Thay đổi 2 dòng đầu tiên
const { DataTypes } = require("sequelize");
// module.exports = (sequelize) => {

// Bằng 1 dòng chuẩn này:
module.exports = (sequelize) => {
  const Models3D = sequelize.define(
    "Models3D",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false, // <-- Bạn nên để 'false' nếu đây là trường bắt buộc
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_url: {
        type: DataTypes.TEXT, // <-- Có thể cần 'TEXT' nếu URL quá dài
        allowNull: false,
      },

      upload_date: {
        type: DataTypes.DATE,
        allowNull: false, // Bạn nên để false để đảm bảo luôn có ngày
        defaultValue: DataTypes.NOW, // Tự động lấy ngày giờ hiện tại
      },
      file_size: { // <-- THÊM TRƯỜNG NÀY
        type: DataTypes.BIGINT,
        allowNull: true,
      },


      file_public_id: {
        // Dùng để lưu đường dẫn (ví dụ: 'vrm_models/user_1_123.vrm')
        // Rất quan trọng để có thể XÓA file
        type: DataTypes.TEXT,
        allowNull: true, 
      },
      thumbnail_url: {
        type: DataTypes.TEXT,
        allowNull: true, // Cho phép null vì có thể model không có thumbnail
      },
      thumbnail_public_id: {
        type: DataTypes.TEXT,
        allowNull: true, // Dùng để xóa thumbnail khỏi Firebase
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "models3d",
      timestamps: false,
    }
  );

  Models3D.associate = function (models) {
    Models3D.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Models3D;
};