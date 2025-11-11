'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Kiểm tra xem bảng users đã tồn tại chưa
    const tableExists = await queryInterface.showAllTables();
    
    if (!tableExists.includes('users')) {
      // Tạo bảng users nếu chưa tồn tại
      await queryInterface.createTable('users', {
        user_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        username: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: true,
        },
        fullname: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        role: {
          type: Sequelize.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',
        },
        google_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        avatar_url: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        password_reset_token: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        password_reset_expires: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });
    } else {
      // Nếu bảng đã tồn tại, thêm các cột mới (nếu chưa có)
      const tableDescription = await queryInterface.describeTable('users');
      
      // Thêm cột fullname nếu chưa có
      if (!tableDescription.fullname) {
        await queryInterface.addColumn('users', 'fullname', {
          type: Sequelize.STRING(255),
          allowNull: true,
        });
      }
      
      // Thêm cột role nếu chưa có
      if (!tableDescription.role) {
        await queryInterface.addColumn('users', 'role', {
          type: Sequelize.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',
        });
      }
      
      // Thêm cột google_id nếu chưa có
      if (!tableDescription.google_id) {
        await queryInterface.addColumn('users', 'google_id', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
      
      // Thêm cột avatar_url nếu chưa có
      if (!tableDescription.avatar_url) {
        await queryInterface.addColumn('users', 'avatar_url', {
          type: Sequelize.STRING(255),
          allowNull: true,
        });
      }
      
      // Thêm cột password_reset_token nếu chưa có
      if (!tableDescription.password_reset_token) {
        await queryInterface.addColumn('users', 'password_reset_token', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
      
      // Thêm cột password_reset_expires nếu chưa có
      if (!tableDescription.password_reset_expires) {
        await queryInterface.addColumn('users', 'password_reset_expires', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Rollback: xóa các cột đã thêm
    await queryInterface.removeColumn('users', 'fullname');
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.removeColumn('users', 'google_id');
    await queryInterface.removeColumn('users', 'avatar_url');
    await queryInterface.removeColumn('users', 'password_reset_token');
    await queryInterface.removeColumn('users', 'password_reset_expires');
  }
};
