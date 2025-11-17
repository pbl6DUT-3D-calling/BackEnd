'use strict';

const TABLE_NAME = 'models3d';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Bước 1: Thêm cột file_size (cột này an toàn, không bị lỗi)
    await queryInterface.addColumn(TABLE_NAME, 'file_size', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });

    // Bước 2: Thêm cột upload_date, NHƯNG TẠM THỜI cho phép NULL
    await queryInterface.addColumn(TABLE_NAME, 'upload_date', {
      type: Sequelize.DATE,
      allowNull: true, // <-- Tạm thời cho phép NULL
    });

    // Bước 3: Cập nhật tất cả các hàng cũ, gán cho chúng ngày giờ hiện tại
    await queryInterface.sequelize.query(
      `UPDATE "${TABLE_NAME}" SET "upload_date" = NOW() WHERE "upload_date" IS NULL`
    );

    // Bước 4: Bây giờ, khi tất cả các hàng đã có dữ liệu,
    // ta mới áp đặt luật NOT NULL (allowNull: false)
    await queryInterface.changeColumn(TABLE_NAME, 'upload_date', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW, // Thêm default cho các hàng MỚI sau này
    });
  },

  async down(queryInterface, Sequelize) {
    // Hàm 'down' để hoàn tác
    await Promise.all([
      queryInterface.removeColumn(TABLE_NAME, 'file_size'),
      queryInterface.removeColumn(TABLE_NAME, 'upload_date'),
    ]);
  },
};