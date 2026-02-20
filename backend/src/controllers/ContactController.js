const Contact = require('../models/Contact');

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.getAll();
    
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
};

const getContactsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const contacts = await Contact.getByType(type);
    
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts by type',
      error: error.message
    });
  }
};

const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.getById(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: error.message
    });
  }
};

const createContact = async (req, res) => {
  try {
    const { type, contactValue, label, isPrimary, orderPriority } = req.body;
    
    // Validate required fields
    if (!type || !contactValue) {
      return res.status(400).json({
        success: false,
        message: 'Type and contact value are required'
      });
    }
    
    const newContactId = await Contact.create({
      type,
      contactValue,
      label: label || '',
      isPrimary: Boolean(isPrimary),
      orderPriority: orderPriority || 0
    });
    
    const newContact = await Contact.getById(newContactId);
    
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: newContact
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contact',
      error: error.message
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, contactValue, label, isPrimary, orderPriority, isActive } = req.body;
    
    // Validate required fields
    if (!type || !contactValue) {
      return res.status(400).json({
        success: false,
        message: 'Type and contact value are required'
      });
    }
    
    const updated = await Contact.update(id, {
      type,
      contactValue,
      label,
      isPrimary: Boolean(isPrimary),
      orderPriority,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    const updatedContact = await Contact.getById(id);
    
    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact',
      error: error.message
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Contact.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
      error: error.message
    });
  }
};

const setContactAsPrimary = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await Contact.setAsPrimary(id);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact set as primary successfully'
    });
  } catch (error) {
    console.error('Error setting contact as primary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set contact as primary',
      error: error.message
    });
  }
};

module.exports = {
  getAllContacts,
  getContactsByType,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  setContactAsPrimary
};