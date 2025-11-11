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


      file_public_id: {
        // Dùng để lưu đường dẫn (ví dụ: 'vrm_models/user_1_123.vrm')
        // Rất quan trọng để có thể XÓA file
        type: DataTypes.TEXT,
        allowNull: true, 
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