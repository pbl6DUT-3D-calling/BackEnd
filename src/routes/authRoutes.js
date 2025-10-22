const router = require("express").Router();
const passport = require("passport");
const AuthService = require("../service/authService");
// === CÁC ROUTE ĐĂNG NHẬP GOOGLE ===

// Bước 1: Người dùng nhấn nút, gọi API này
// Nó sẽ chuyển hướng người dùng sang trang đăng nhập của Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"], // Xin quyền email và profile
    session: false, // Không dùng session
  })
);

// Bước 2: Google xác thực xong, sẽ gọi về URL này
// Đây chính là 'callbackURL' trong file passport.js của bạn
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login-failed", // URL React khi thất bại
    session: false,
  }),
  (req, res) => {
    // --- ĐĂNG NHẬP THÀNH CÔNG ---
    // File passport.js của bạn đã chạy xong và trả về { token, user }
    // req.user bây giờ chính là { token, user }
    const token = req.user.token;

    // Gửi token về cho React bằng cách chuyển hướng URL
    // React sẽ phải bắt token này từ URL
    res.redirect(`http://localhost:3000/login-success?token=${token}`);
    
    // (Lưu ý: đổi http://localhost:3000 thành port React của bạn)
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // 2. Gọi service để xử lý logic
    const data = await AuthService.login(email, password);
    // 3. Trả về { accessToken, user }
    res.json(data);
  } catch (error) {
    // Báo lỗi (VD: Sai pass, email không tồn tại)
    res.status(401).json({ error: error.message });
  }
});


router.post("/register", async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;
        const data = await AuthService.register(fullName, username, email, password);
        // 3. Trả về { message, userId }
        res.status(201).json(data);
    } catch (error) {
        // Báo lỗi (VD: Email đã tồn tại)
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;