const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactsByType,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  setContactAsPrimary
} = require('../controllers/ContactController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes - anyone can view contact information
router.get('/', getAllContacts);
router.get('/type/:type', getContactsByType);
router.get('/:id', getContactById);

// Protected routes - only admin/staff can manage contacts
router.post('/', authenticateToken, authorizeRole('ADMIN', 'STAFF'), createContact);
router.put('/:id', authenticateToken, authorizeRole('ADMIN', 'STAFF'), updateContact);
router.delete('/:id', authenticateToken, authorizeRole('ADMIN'), deleteContact);
router.put('/:id/set-primary', authenticateToken, authorizeRole('ADMIN', 'STAFF'), setContactAsPrimary);

module.exports = router;