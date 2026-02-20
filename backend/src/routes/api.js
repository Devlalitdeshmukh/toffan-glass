const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Import controllers
const userController = require('../controllers/userController');
const inquiryController = require('../controllers/inquiryController');
const siteController = require('../controllers/siteController');
const paymentController = require('../controllers/paymentController');
const cityController = require('../controllers/cityController');
const serviceController = require('../controllers/serviceController');
const serviceRoutes = require('./serviceRoutes');

const router = express.Router();

const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/payment-receipts/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const paymentUpload = multer({
  storage: receiptStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// User routes (Admin and Staff only) - Moved to top to avoid conflicts
router.post('/users', authenticateToken, authorizeRole('ADMIN'), userController.createUser);
router.get('/users', authenticateToken, authorizeRole('ADMIN', 'STAFF'), userController.getAllUsers);
router.get('/users/:id', authenticateToken, authorizeRole('ADMIN', 'STAFF'), userController.getUserById);
router.put('/users/:id', authenticateToken, authorizeRole('ADMIN'), userController.updateUser);
router.delete('/users/:id', authenticateToken, authorizeRole('ADMIN'), userController.deleteUser);

// City routes (Public for dropdowns, Admin for CRUD)
router.get('/cities', cityController.getAllCities);
router.post('/cities', authenticateToken, authorizeRole('ADMIN'), cityController.createCity);
router.put('/cities/:id', authenticateToken, authorizeRole('ADMIN'), cityController.updateCity);
router.delete('/cities/:id', authenticateToken, authorizeRole('ADMIN'), cityController.deleteCity);

// Inquiry routes
router.get('/inquiries', authenticateToken, authorizeRole('ADMIN', 'STAFF'), inquiryController.getAllInquiries);
router.get('/inquiries/:id', authenticateToken, authorizeRole('ADMIN', 'STAFF'), inquiryController.getInquiryById);
router.post('/inquiries', inquiryController.createInquiry);
router.put('/inquiries/:id', authenticateToken, authorizeRole('ADMIN', 'STAFF'), inquiryController.updateInquiry);
router.put('/inquiries/:id/status', authenticateToken, authorizeRole('ADMIN', 'STAFF'), inquiryController.updateInquiryStatus);
router.delete('/inquiries/:id', authenticateToken, authorizeRole('ADMIN'), inquiryController.deleteInquiry);
router.get('/inquiries/status/:status', authenticateToken, authorizeRole('ADMIN', 'STAFF'), inquiryController.getInquiriesByStatus);

// Legacy alias route kept for backward compatibility.
// Canonical site routes are served from /api/sites via routes/siteRoutes.js.
router.get('/sites-with-images', siteController.getSitesWithImages);

// Payment routes
router.get('/payments', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getAllPayments);
router.get('/payments/site/:siteId', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getPaymentsBySiteId);
router.get('/payments/customers', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getPaymentCustomers);
router.get('/payments/customer/:customerId/sites', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getCustomerSites);
router.get('/payments/customer/:customerId/products', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getCustomerProducts);
router.get('/payments/customer/:customerId', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getCustomerPayments);
router.get('/payments/:id', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getPaymentById);
router.post('/payments', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentUpload.single('paymentReceipt'), paymentController.createPayment);
router.put('/payments/:id', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentUpload.single('paymentReceipt'), paymentController.updatePayment);
router.put('/payments/:id/status', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.updatePaymentStatus);
router.delete('/payments/:id', authenticateToken, authorizeRole('ADMIN'), paymentController.deletePayment);
router.get('/payments/status/:status', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getPaymentsByStatus);
router.get('/payments-stats', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.getPaymentStats);
router.get('/payments/:id/bill', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.generateBill);
router.get('/payments/:id/bill/pdf', authenticateToken, authorizeRole('ADMIN', 'STAFF'), paymentController.downloadBillPdf);

module.exports = router;
