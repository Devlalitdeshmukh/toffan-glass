const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
    try {
        const { name, email, password, city, mobile } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Name, email, and password are required' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters long' 
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email already exists' 
            });
        }
        
        // Create user
        const userId = await User.create({
            name,
            email,
            password,
            role: 'CUSTOMER',
            city,
            mobile
        });
        
        // Generate token
        const token = generateToken(userId);
        
        // Get user data without password
        const user = await User.findById(userId);
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                mobile: user.mobile
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed',
            message: error.message 
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }
        
        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }
        
        // Check password
        const isPasswordValid = await User.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }
        
        // Generate token
        const token = generateToken(user.id);
        
        // Return user data without password
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            mobile: user.mobile
        };
        
        res.json({
            message: 'Login successful',
            token,
            user: userData
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed',
            message: error.message 
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                mobile: user.mobile
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            error: 'Failed to get profile',
            message: error.message 
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, city, mobile } = req.body;
        const userId = req.user.id;
        
        const updated = await User.update(userId, {
            name,
            email,
            city,
            mobile
        });
        
        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = await User.findById(userId);
        
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                mobile: user.mobile
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            error: 'Failed to update profile',
            message: error.message 
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};