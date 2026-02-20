const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import database connection
const { pool } = require('./config/db');

// Import routes
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const contentPageRoutes = require('./routes/contentPageRoutes');
const productRoutes = require('./routes/productRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const siteRoutes = require('./routes/siteRoutes');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/content', contentPageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/sites', siteRoutes);

// Simple test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Toffan Glass Backend is running!' });
});

// Simple user creation route
app.post('/api/users', async (req, res) => {
    try {
        console.log('User creation request received:', req.body);
        const { name, email, password, role = 'CUSTOMER', city, mobile } = req.body;
        
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
        const [existingRows] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingRows.length > 0) {
            return res.status(400).json({ 
                error: 'User with this email already exists' 
            });
        }
        
        console.log('Getting role ID...');
        // Get role_id from role name
        const [roleRows] = await pool.execute(
            'SELECT id FROM roles WHERE name = ?',
            [role]
        );
        
        if (roleRows.length === 0) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        
        const roleId = roleRows[0].id;
        console.log('Role ID:', roleId);
        
        // Get city_id from city name
        let cityId = null;
        if (city) {
            console.log('Getting city ID for:', city);
            const [cityRows] = await pool.execute(
                'SELECT id FROM cities WHERE name = ?',
                [city]
            );
            
            if (cityRows.length > 0) {
                cityId = cityRows[0].id;
                console.log('City ID:', cityId);
            }
        }
        
        // Hash password
        console.log('Hashing password...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        console.log('Inserting user into database...');
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role_id, city_id, mobile) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, roleId, cityId, mobile]
        );
        
        console.log('User inserted with ID:', result.insertId);
        
        // Return the created user object
        const [userRows] = await pool.execute(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                r.name as role,
                c.name as city,
                u.mobile, 
                u.created_at 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN cities c ON u.city_id = c.id
            WHERE u.id = ?
        `, [result.insertId]);
        
        console.log('User created successfully:', userRows[0]);
        res.status(201).json({
            message: 'User created successfully',
            user: userRows[0]
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ 
            error: 'Failed to create user',
            message: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// List all registered routes before starting server
console.log('\n📋 Registered Routes:');
const routeStack = app._router?.stack || app.router?.stack || [];
routeStack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`   ${Object.keys(r.route.methods).join('|').toUpperCase()} ${r.route.path}`);
    }
});
if (routeStack.length === 0) {
    console.log('   (No routes found via router stack introspection)');
}
console.log('');

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Toffan Glass Backend Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:5000/api/health`);
});

module.exports = app;
