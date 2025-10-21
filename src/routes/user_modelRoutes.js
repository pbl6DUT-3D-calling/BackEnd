const express = require("express");
const router = express.Router();
const userModelController = require("../controllers/user_modelController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", verifyToken, userModelController.getUserModelsByUserId);
router.post("/upload", verifyToken, upload.single("modelFile"), userModelController.uploadModelFile);
module.exports = router;