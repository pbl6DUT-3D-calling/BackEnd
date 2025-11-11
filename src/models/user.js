const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      // SỬA 1: Đổi "id" thành "user_id"
      // Các file middleware và passport của bạn đều dùng "user_id" trong JWT
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true, // <-- Thêm: Email nên là duy nhất
      },
      fullname: { // Thêm trường full_name
        type: DataTypes.STRING(255),
        allowNull: true, // Có thể cho phép null nếu bạn muốn
      },
      // SỬA 2: Đổi "allowNull: false" thành "allowNull: true"
      // Bắt buộc phải cho phép NULL, vì file passport.js của bạn
      // sẽ gán password: null khi đăng nhập bằng Google
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // THÊM 1: Trường "role" để phân quyền
      role: {
        type: DataTypes.ENUM('user', 'admin'), // Dùng ENUM là tốt nhất
        allowNull: false,
        defaultValue: 'user', // Mặc định mọi tài khoản mới là 'user'
      },
      // THÊM 2: Trường "google_id" để file passport.js hoạt động
      google_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // THÊM 3: Trường "avatar_url" để file passport.js hoạt động
      avatar_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      password_reset_token: {
        type: DataTypes.STRING,
        allowNull: true, // Sẽ là NULL hầu hết thời gian
      },
      password_reset_expires: {
        type: DataTypes.DATE,
        allowNull: true, // Sẽ là NULL hầu hết thời gian
      },
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Room, { foreignKey: "created_by" });
    User.hasMany(models.RoomUser, { foreignKey: "user_id" });
    User.hasMany(models.UserModel, { foreignKey: "user_id" });
    User.hasMany(models.Models3D, { foreignKey: "user_id" });
  };

  return User;
};