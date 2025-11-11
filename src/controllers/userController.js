const { User } = require("../models");
const bcrypt = require("bcryptjs");

const userController = {
  // Lấy thông tin user hiện tại
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.user_id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật thông tin user
  updateUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { username, fullname, email, avatar_url } = req.body;

      // Kiểm tra quyền: chỉ cho phép edit chính mình hoặc admin
      if (req.user.user_id !== parseInt(user_id) && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Kiểm tra email trùng (nếu có thay đổi email)
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Cập nhật thông tin
      await user.update({
        username: username || user.username,
        fullname: fullname !== undefined ? fullname : user.fullname,
        email: email || user.email,
        avatar_url: avatar_url !== undefined ? avatar_url : user.avatar_url,
      });

      // Trả về user đã cập nhật (không bao gồm password)
      const updatedUser = await User.findByPk(user_id, {
        attributes: { exclude: ["password"] },
      });

      res.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { old_password, new_password } = req.body;

      // Kiểm tra quyền: chỉ cho phép đổi mật khẩu chính mình
      if (req.user.user_id !== parseInt(user_id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Kiểm tra nếu user đăng nhập bằng Google (không có password)
      if (!user.password) {
        return res.status(400).json({
          message: "Cannot change password for Google authenticated users",
        });
      }

      // Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(old_password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      // Mã hóa và cập nhật mật khẩu mới
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await user.update({ password: hashedPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Xóa user (chỉ admin)
  deleteUser: async (req, res) => {
    try {
      const { user_id } = req.params;

      // Kiểm tra quyền admin
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await user.destroy();
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy danh sách users (chỉ admin)
  getAllUsers: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = userController;