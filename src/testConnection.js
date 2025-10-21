require("dotenv").config();
const { sequelize, User } = require("./models"); // đường dẫn đúng theo project của bạn

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối đến database thành công!");

    // Kiểm tra bảng User
    await sequelize.sync({ alter: true });
    console.log("✅ Model đã sync thành công!");

    // Tạo 1 user test
    const user = await User.create({
      username: "test_user",
      email: "test@example.com",
      password: "123456",
    });

    console.log("✅ User tạo thành công:", user.toJSON());
  } catch (error) {
    console.error("❌ Lỗi khi kết nối hoặc thao tác:", error);
  } finally {
    await sequelize.close();
  }
}

testDB();
