const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8001/auth/google/callback", // Đảm bảo port đúng
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      // Bắt đầu khối try...catch tổng thể
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, {
            message: "Tài khoản Google không có email liên kết.",
          });
        }

        let user;
        // === Bắt đầu Try...Catch riêng cho việc tìm User ===
        try {
          user = await User.findOne({ where: { email } });
        } catch (dbError) {
          console.error("LỖI KHI TÌM USER TRONG DATABASE:", dbError);
          // Ném lỗi này ra để catch tổng thể xử lý
          throw new Error("Lỗi truy vấn cơ sở dữ liệu khi tìm người dùng."); 
        }
        // === Kết thúc Try...Catch tìm User ===

        if (!user) {
          // Người dùng mới, tạo tài khoản
          // === Bắt đầu Try...Catch riêng cho việc tạo User ===
          try {
            user = await User.create({
              google_id: profile.id,
              username: profile.displayName, // Hoặc tạo username duy nhất nếu cần
              full_name: profile.displayName, // Thêm full_name
              email,
              password: null, // Google login không có password
              avatar_url: profile.photos?.[0]?.value || null,
              role: 'user', // Gán role mặc định
            });
          } catch (createError) {
             console.error("LỖI KHI TẠO USER MỚI:", createError);
             throw new Error("Lỗi truy vấn cơ sở dữ liệu khi tạo người dùng.");
          }
           // === Kết thúc Try...Catch tạo User ===

        } else if (!user.google_id) {
          // Người dùng cũ, link tài khoản Google
          // === Bắt đầu Try...Catch riêng cho việc cập nhật User ===
           try {
            user.google_id = profile.id;
            // (Tùy chọn) Cập nhật tên và avatar nếu chưa có
            if (!user.full_name) user.full_name = profile.displayName;
            if (!user.avatar_url) user.avatar_url = profile.photos?.[0]?.value || null;
            await user.save();
           } catch (updateError) {
              console.error("LỖI KHI CẬP NHẬT (LINK) USER:", updateError);
              throw new Error("Lỗi truy vấn cơ sở dữ liệu khi cập nhật người dùng.");
           }
          // === Kết thúc Try...Catch cập nhật User ===
        }
        // Trường hợp user đã tồn tại và đã link google_id thì không cần làm gì thêm

        // Tạo JWT Token
        const token = jwt.sign(
          { user_id: user.user_id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        // Thành công, trả về token và thông tin user
        return done(null, { token, user });

      // Bắt lỗi tổng thể (bao gồm cả lỗi ném ra từ các catch nhỏ)
      } catch (error) {
        console.error("LỖI TRONG GOOGLE STRATEGY:", error.message);
        // Báo lỗi cho Passport biết
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
