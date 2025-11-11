
// router.get("/", async (req, res) => {
//   const users = await User.findAll();
//   res.json(users);
// });

// router.post("/", async (req, res) => {
//   const user = await User.create(req.body);
//   res.json(user);
// });

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Lấy thông tin user hiện tại
router.get("/me", verifyToken, userController.getCurrentUser);

// Lấy danh sách tất cả users (admin only)
router.get("/", verifyToken, isAdmin, userController.getAllUsers);

// Cập nhật thông tin user
router.put("/:user_id", verifyToken, userController.updateUser);

// Đổi mật khẩu
router.put("/:user_id/password", verifyToken, userController.changePassword);

// Xóa user (admin only)
router.delete("/:user_id", verifyToken, isAdmin, userController.deleteUser);

module.exports = router;

