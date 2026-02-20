const Inquiry = require('../models/Inquiry');
const City = require('../models/City');
const {
    sendInquiryEmailNotification,
    sendInquiryWhatsAppNotification
} = require('../services/notificationService');

const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.getAll();
        res.json({
            message: 'Inquiries retrieved successfully',
            inquiries
        });
    } catch (error) {
        console.error('Get all inquiries error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve inquiries',
            message: error.message 
        });
    }
};

const getInquiryById = async (req, res) => {
    try {
        const { id } = req.params;
        const inquiry = await Inquiry.getById(id);
        
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        
        res.json({
            message: 'Inquiry retrieved successfully',
            inquiry
        });
    } catch (error) {
        console.error('Get inquiry by ID error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve inquiry',
            message: error.message 
        });
    }
};

const createInquiry = async (req, res) => {
    try {
        const { name, email, mobile, message, cityId, subject } = req.body;
        
        // Validation
        if (!name || !email || !mobile || !message) {
            return res.status(400).json({ 
                error: 'Name, email, mobile, and message are required' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // Validate mobile format (10 digits)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ 
                error: 'Mobile number must be 10 digits' 
            });
        }
        
        // Check if city exists
        if (cityId) {
            const city = await City.getById(cityId);
            if (!city) {
                return res.status(400).json({ 
                    error: 'Invalid city ID' 
                });
            }
        }
        
        const inquiryId = await Inquiry.create({
            name,
            email,
            mobile,
            message,
            cityId
        });
        
        const newInquiry = await Inquiry.getById(inquiryId);

        // Send admin notifications after successful DB save (non-blocking to client success).
        const notificationPayload = {
            name,
            email,
            mobile,
            subject: subject || 'General Inquiry',
            message,
            cityId,
            createdAt: newInquiry?.createdAt || new Date().toISOString()
        };

        Promise.allSettled([
            sendInquiryEmailNotification(notificationPayload),
            sendInquiryWhatsAppNotification(notificationPayload)
        ]).then((results) => {
            const emailResult = results[0]?.status === 'fulfilled' ? results[0].value : { success: false, error: results[0]?.reason?.message };
            const whatsappResult = results[1]?.status === 'fulfilled' ? results[1].value : { success: false, error: results[1]?.reason?.message };
            console.log('Inquiry notification results:', { emailResult, whatsappResult });
        }).catch((err) => {
            console.error('Inquiry notification dispatch error:', err);
        });
        
        res.status(201).json({
            message: 'Inquiry created successfully',
            inquiry: newInquiry
        });
    } catch (error) {
        console.error('Create inquiry error:', error);
        res.status(500).json({ 
            error: 'Failed to create inquiry',
            message: error.message 
        });
    }
};

const updateInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobile, message, cityId, status, assignedTo } = req.body;
        
        // Check if inquiry exists
        const existingInquiry = await Inquiry.getById(id);
        if (!existingInquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        
        // Validate email if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    error: 'Invalid email format' 
                });
            }
        }
        
        // Validate mobile if provided
        if (mobile) {
            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(mobile)) {
                return res.status(400).json({ 
                    error: 'Mobile number must be 10 digits' 
                });
            }
        }
        
        // Check if city exists if provided
        if (cityId) {
            const city = await City.getById(cityId);
            if (!city) {
                return res.status(400).json({ 
                    error: 'Invalid city ID' 
                });
            }
        }
        
        const updated = await Inquiry.update(id, {
            name,
            email,
            mobile,
            message,
            cityId,
            status,
            assignedTo
        });
        
        if (!updated) {
            return res.status(400).json({ error: 'Failed to update inquiry' });
        }
        
        const updatedInquiry = await Inquiry.getById(id);
        
        res.json({
            message: 'Inquiry updated successfully',
            inquiry: updatedInquiry
        });
    } catch (error) {
        console.error('Update inquiry error:', error);
        res.status(500).json({ 
            error: 'Failed to update inquiry',
            message: error.message 
        });
    }
};

const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        const updated = await Inquiry.updateStatus(id, status);
        
        if (!updated) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        
        const updatedInquiry = await Inquiry.getById(id);
        
        res.json({
            message: 'Inquiry status updated successfully',
            inquiry: updatedInquiry
        });
    } catch (error) {
        console.error('Update inquiry status error:', error);
        res.status(500).json({ 
            error: 'Failed to update inquiry status',
            message: error.message 
        });
    }
};

const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await Inquiry.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        
        res.json({
            message: 'Inquiry deleted successfully'
        });
    } catch (error) {
        console.error('Delete inquiry error:', error);
        res.status(500).json({ 
            error: 'Failed to delete inquiry',
            message: error.message 
        });
    }
};

const getInquiriesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const inquiries = await Inquiry.getByStatus(status);
        
        res.json({
            message: `Inquiries with status ${status} retrieved successfully`,
            inquiries
        });
    } catch (error) {
        console.error('Get inquiries by status error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve inquiries',
            message: error.message 
        });
    }
};

module.exports = {
    getAllInquiries,
    getInquiryById,
    createInquiry,
    updateInquiry,
    updateInquiryStatus,
    deleteInquiry,
    getInquiriesByStatus
};
