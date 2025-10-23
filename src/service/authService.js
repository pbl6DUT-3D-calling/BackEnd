const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Import model User
const {Op} = require("sequelize");
require('dotenv').config();

class AuthService {

  /**
   * Xử lý đăng nhập bằng Email/Password
   */
  static async login(email, password) {
    // 1. Tìm user bằng email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Email không tồn tại");
    }

    // 2. Kiểm tra user này có password không (có thể họ đăng nhập bằng Google)
    if (!user.password) {
        throw new Error("Tài khoản này được đăng ký qua Google. Vui lòng đăng nhập bằng Google.");
    }

    // 3. So sánh mật khẩu
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Mật khẩu không chính xác");
    }

    // 4. Tạo và trả về token
    return this.generateTokenResponse(user);
  }

  /**
   * Xử lý đăng ký bằng Email/Password
   */
  static async register(fullName, username, email, password) {
    // 1. Kiểm tra email hoặc username đã tồn tại chưa
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }]
      }
    });

    if (existingUser) {
      throw new Error("Email hoặc username đã tồn tại");
    }

    // 2. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo user mới
    const user = await User.create({
      full_name: fullName, // Giả sử model User có trường full_name
      username: username,
      email: email,
      password: hashedPassword,
      role: 'user', // Mặc định là 'user' như trong model
      // avatar_url sẽ dùng default value (nếu bạn set trong model)
    });

    // 4. Trả về thông báo (không tự động đăng nhập)
    return { message: "Đăng ký tài khoản thành công", userId: user.user_id };
  }

  /**
   * Hàm tiện ích: Tạo Token và chuẩn hóa dữ liệu User trả về
   */
  static async generateTokenResponse(user) {
    // Tạo Access Token (JWT)
    const accessToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE } // Ví dụ: "7d"
    );

    // Đây là object mà frontend (authService.js) mong đợi
    return {
      accessToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        fullName: user.full_name, // Gửi full_name
        role: user.role,
        email: user.email,
        avatar: user.avatar_url,
        joinedAt: user.created_at,
        bio: user.bio,
      },
    };
  }
}


module.exports = AuthService;