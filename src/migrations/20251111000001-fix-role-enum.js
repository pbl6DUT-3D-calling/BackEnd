'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Bước 1: Thêm cột tạm để lưu giá trị cũ
    await queryInterface.addColumn('users', 'role_temp', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    // Bước 2: Copy dữ liệu từ cột role sang role_temp
    await queryInterface.sequelize.query(
      `UPDATE users SET role_temp = role::text`
    );

    // Bước 3: Xóa cột role cũ
    await queryInterface.removeColumn('users', 'role');

    // Bước 4: Xóa ENUM type cũ nếu tồn tại
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS user_role CASCADE`
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS enum_users_role CASCADE`
    );

    // Bước 5: Tạo ENUM type mới
    await queryInterface.sequelize.query(
      `CREATE TYPE enum_users_role AS ENUM ('user', 'admin')`
    );

    // Bước 6: Thêm lại cột role với type mới
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    });

    // Bước 7: Copy dữ liệu từ role_temp về role
    await queryInterface.sequelize.query(
      `UPDATE users SET role = COALESCE(role_temp::enum_users_role, 'user')`
    );

    // Bước 8: Xóa cột tạm
    await queryInterface.removeColumn('users', 'role_temp');

    console.log('✅ Migration completed: Fixed role ENUM type');
  },

  async down(queryInterface, Sequelize) {
    // Rollback: chuyển về VARCHAR
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'user',
    });

    // Xóa ENUM type
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS enum_users_role CASCADE`
    );
  }
};
