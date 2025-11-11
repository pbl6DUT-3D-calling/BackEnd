const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const basename = path.basename(__filename);
const db = {};
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: "postgres" });

fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.endsWith(".js"))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// TẮT auto-sync khi đã dùng migrations
// Nếu muốn bật lại, uncomment đoạn code dưới
/*
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
  (async () => {
    try {
      // { alter: true }
      // Tự động so sánh model và DB
      // Nó sẽ thêm cột mới, sửa kiểu dữ liệu, nhưng KHÔNG XÓA CỘT.
      // An toàn cho development, không làm mất dữ liệu.
      await sequelize.sync({ alter: true });
      console.log("Database synced successfully (alter: true).");

      // Dùng { force: true } nếu bạn muốn XÓA SẠCH và tạo lại
      // CẢNH BÁO: Mất toàn bộ dữ liệu.
      // await sequelize.sync({ force: true });
      // console.log("Database forced sync (ALL DATA LOST).");

    } catch (error) {
      console.error("Lỗi khi đồng bộ hóa database:", error);
    }
  })();
}
*/

module.exports = db;
