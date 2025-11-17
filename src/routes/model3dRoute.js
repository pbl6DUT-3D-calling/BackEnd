const express = require("express");
const router = express.Router();
const model3dController = require("../controllers/model3dController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const multiUpload = upload.fields([
  { name: 'modelFile', maxCount: 1 },    // Tên file 3D
  { name: 'thumbnailFile', maxCount: 1 } // Tên file thumbnail
]);

router.post("/upload", verifyToken, multiUpload, model3dController.uploadModelFile);
router.get("/", verifyToken, model3dController.getMyModels);
router.delete("/:id", verifyToken, model3dController.deleteModelFile);
module.exports = router;