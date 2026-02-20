const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  updateSiteStatus,
  deleteSite,
  getSitesByStatus,
  getSitesWithImages,
} = require("../controllers/siteController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the directory exists
    const fs = require("fs");
    const dir = "uploads/site-images/";
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
router.get("/", getAllSites);
router.get("/status/:status", getSitesByStatus);
router.get("/with-images", getSitesWithImages);
router.get("/:id", getSiteById);

// Protected routes (Admin and Staff only)
router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN", "STAFF"),
  upload.array("images", 10),
  createSite,
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN", "STAFF"),
  upload.array("images", 10),
  updateSite,
);
router.put(
  "/:id/status",
  authenticateToken,
  authorizeRole("ADMIN", "STAFF"),
  updateSiteStatus,
);
router.delete("/:id", authenticateToken, authorizeRole("ADMIN"), deleteSite);

module.exports = router;
