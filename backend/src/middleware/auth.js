const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.execute(
            `SELECT u.id, u.name, u.email, r.name as role, c.name as city FROM users u LEFT JOIN roles r ON u.role_id = r.id LEFT JOIN cities c ON u.city_id = c.id WHERE u.id = ?`,
            [decoded.userId]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                requiredRoles: roles,
                userRole: req.user.role
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};