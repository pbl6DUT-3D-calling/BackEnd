const router = require("express").Router();
const userModelRouter = require("./user_modelRoutes");
const {
  verifyToken,
  isAdmin,
  optionalAuth,
} = require("../middleware/authMiddleware"); 


// Route công khai (ai cũng xem được)
router.get("/posts", (req, res) => {
  res.json({ message: "Đây là danh sách bài viết công khai" });
});

// Route cần đăng nhập (bất kể là user hay admin)

router.get("/me", verifyToken, (req, res) => {
  res.json({
    message: "Bạn đã đăng nhập thành công",
    user: req.user, 
  });
});
router.use("/user-models", userModelRouter);

// Route chỉ dành cho ADMIN
router.get("/admin/dashboard", verifyToken, isAdmin, (req, res) => {
  res.json({
    message: "Chào mừng Admin!",
    adminInfo: req.user,
  });
});

// 4. Route không bắt buộc (dùng optionalAuth)
router.get("/posts/:id", optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ 
        message: `Bài viết ${req.params.id}`, 
        user_status: "Đã đăng nhập" 
    });
  } else {
    res.json({ 
        message: `Bài viết ${req.params.id}`, 
        user_status: "Khách" 
    });
  }
});

module.exports = router;