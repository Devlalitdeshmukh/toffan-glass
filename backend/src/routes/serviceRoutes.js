const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteServiceImage,
} = require("../controllers/serviceController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the directory exists
    const fs = require("fs");
    const dir = "uploads/service-images/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

const router = express.Router();

// Public routes
router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Protected routes (Admin and Staff only)
router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  upload.array("images", 10),
  createService,
); // Allow up to 10 images
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  upload.array("images", 10),
  updateService,
); // Allow up to 10 images
router.delete("/:id", authenticateToken, authorizeRole("ADMIN"), deleteService);
router.delete(
  "/:id/images/:imageId",
  authenticateToken,
  authorizeRole("ADMIN"),
  deleteServiceImage,
);

module.exports = router;
