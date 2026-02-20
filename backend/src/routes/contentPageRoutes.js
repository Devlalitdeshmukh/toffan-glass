const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllContentPages,
  getContentPageByPageName,
  createContentPage,
  updateContentPage,
  deleteContentPage
} = require('../controllers/ContentPageController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/content-page-images/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all content pages
router.get('/', authenticateToken, authorizeRole('ADMIN', 'STAFF'), getAllContentPages);

// Get content page by page name
router.get('/:pageName', getContentPageByPageName);

// Create content page
router.post('/', authenticateToken, authorizeRole('ADMIN', 'STAFF'), upload.array('images', 10), createContentPage);

// Update content page
router.put('/:pageName', authenticateToken, authorizeRole('ADMIN', 'STAFF'), upload.array('images', 10), updateContentPage);

// Delete content page
router.delete('/:pageName', authenticateToken, authorizeRole('ADMIN'), deleteContentPage);

module.exports = router;