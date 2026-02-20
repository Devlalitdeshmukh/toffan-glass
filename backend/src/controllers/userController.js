const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({
            message: 'Users retrieved successfully',
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve users',
            message: error.message 
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            message: 'User retrieved successfully',
            user
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve user',
            message: error.message 
        });
    }
};

const createUser = async (req, res) => {
    try {
        console.log('Create user request received:', req.body);
        const { name, email, password, role, city, mobile } = req.body;
        
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Name, email, and password are required' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters' 
            });
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
        
        console.log('Checking if user already exists...');
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email already exists' 
            });
        }
        
        console.log('Creating new user...');
        const newUser = await User.create({ name, email, password, role, city, mobile });
        
        if (!newUser) {
            return res.status(500).json({ error: 'Failed to create user' });
        }
        
        console.log('User created successfully:', newUser);
        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ 
            error: 'Failed to create user',
            message: error.message 
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, city, mobile } = req.body;
        
        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Validate email if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    error: 'Invalid email format' 
                });
            }
            
            // Check if email is already taken by another user
            const userWithEmail = await User.findByEmail(email);
            if (userWithEmail && userWithEmail.id !== parseInt(id)) {
                return res.status(400).json({ 
                    error: 'Email already exists' 
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
        
        const updated = await User.update(id, { name, email, role, city, mobile });
        
        if (!updated) {
            return res.status(400).json({ error: 'Failed to update user' });
        }
        
        const updatedUser = await User.findById(id);
        
        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            error: 'Failed to update user',
            message: error.message 
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent deleting the current user
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        const deleted = await User.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            error: 'Failed to delete user',
            message: error.message 
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};