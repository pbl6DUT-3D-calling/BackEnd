const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Import model User
const {Op} = require("sequelize");
const crypto = require("crypto");
const transporter = require("../config/mail");
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
        fullName: user.fullname, // Gửi full_name
        role: user.role,
        email: user.email,
        avatar: user.avatar_url,
        joinedAt: user.created_at,
        bio: user.bio,
      },
    };
  }


  static async forgotPassword(email) {
    // 1. Tìm user bằng email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Vẫn trả về thông báo thành công để bảo mật
      // (Không cho hacker biết email nào có tồn tại)
      console.log(`Yêu cầu reset cho email không tồn tại: ${email}`);
      return { message: "Nếu email tồn tại, link reset sẽ được gửi." };
    }

    // 2. Tạo token reset ngẫu nhiên
    const token = crypto.randomBytes(32).toString("hex");
    // Token hết hạn sau 1 giờ
    const expires = new Date(Date.now() + 3600000); // 1 giờ

    // 3. Lưu token và thời gian hết hạn vào CSDL
    user.password_reset_token = token;
    user.password_reset_expires = expires;
    await user.save();

    // 4. Tạo link (trỏ về Frontend)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // 5. Tạo nội dung email
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333;">Yêu cầu Đặt lại Mật khẩu</h2>
        <p>Xin chào ${user.fullname || user.username},</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn. Link này sẽ hết hạn sau 1 giờ.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 20px; margin: 15px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Đặt lại Mật khẩu
        </a>
        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email.</p>
        <p style="color: #777; font-size: 0.9em;">Cảm ơn bạn,</p>
        <p style="color: #777; font-size: 0.9em;">Team VTuber Studio</p>
      </div>
    `;

    // 6. Gửi email
    try {
      await transporter.sendMail({
        from: `VTuber Studio <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Link Đặt lại Mật khẩu cho VTuber Studio",
        html: emailTemplate,
      });
      return { message: "Link đặt lại mật khẩu đã được gửi tới email của bạn." };
    } catch (emailError) {
      console.error("LỖI GỬI EMAIL:", emailError);
      throw new Error("Lỗi khi gửi email. Vui lòng thử lại sau.");
    }
  }

  /**
   * @desc Xác thực token và đặt mật khẩu mới
   */
  static async resetPassword(token, newPassword) {
    // 1. Tìm user bằng token VÀ token chưa hết hạn
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: { [Op.gt]: new Date() }, // 'gt' = greater than (lớn hơn)
      },
    });

    if (!user) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn.");
    }

    // 2. Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Cập nhật mật khẩu mới
    user.password = hashedPassword;
    // 4. Xóa token (rất quan trọng!)
    user.password_reset_token = null;
    user.password_reset_expires = null;
    
    await user.save();

    return { message: "Mật khẩu đã được cập nhật thành công." };
  }


}


module.exports = AuthService;