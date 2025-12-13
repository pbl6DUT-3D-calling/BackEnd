
// Tải các biến môi trường từ file .env
require('dotenv').config(); 

module.exports = {
  "development": {
    "username": process.env.DB_DEV_USERNAME, // Đọc từ .env
    "password": process.env.DB_DEV_PASSWORD, // Đọc từ .env
    "database": process.env.DB_DEV_DATABASE, // Đọc từ .env
    "host": process.env.DB_DEV_HOST,       // Đọc từ .env
    "logging": false,
    
    "dialect": "postgres",
    dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Quan trọng để tránh lỗi self-signed cert của Azure
    }
  }
  },
  "test": {
      },
  "production": {
    }
};