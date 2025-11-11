const express = require("express");
const router = express.Router();
const model3dController = require("../controllers/model3dController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/upload", verifyToken, upload.single("modelFile"), model3dController.uploadModelFile);
router.get("/", verifyToken, model3dController.getMyModels);
router.delete("/:id", verifyToken, model3dController.deleteModelFile);
module.exports = router;