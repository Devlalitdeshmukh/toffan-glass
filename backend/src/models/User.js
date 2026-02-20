const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

class User {
    static async create(userData) {
        const { name, email, password, role = 'CUSTOMER', city, mobile } = userData;
        
        console.log('Creating user with data:', { name, email, role, city, mobile });
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Password hashed successfully');
        
        // Get role_id from role name
        console.log('Getting role_id for role:', role);
        const [roleRows] = await pool.execute(
            'SELECT id FROM roles WHERE name = ?',
            [role]
        );
        
        if (roleRows.length === 0) {
            throw new Error('Invalid role');
        }
        
        const roleId = roleRows[0].id;
        console.log('Role ID:', roleId);
        
        // Get city_id from city name
        let cityId = null;
        if (city) {
            console.log('Getting city_id for city:', city);
            const [cityRows] = await pool.execute(
                'SELECT id FROM cities WHERE name = ?',
                [city]
            );
            
            if (cityRows.length > 0) {
                cityId = cityRows[0].id;
                console.log('City ID:', cityId);
            }
        }
        
        console.log('Inserting user into database');
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
        
        console.log('User data retrieved:', userRows[0]);
        return userRows[0];
    }
    
    static async findByEmail(email) {
        const [rows] = await pool.execute(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.password, 
                r.name as role,
                c.name as city,
                u.mobile, 
                u.created_at 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN cities c ON u.city_id = c.id
            WHERE u.email = ?
        `, [email]);
        return rows[0];
    }
    
    static async findById(id) {
        const [rows] = await pool.execute(`
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
        `, [id]);
        return rows[0];
    }
    
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
    
    static async getAll() {
        const [rows] = await pool.execute(`
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
            ORDER BY u.created_at DESC
        `);
        return rows;
    }
    
    static async update(id, updateData) {
        const { name, email, role, city, mobile } = updateData;
        
        // Get role_id from role name
        let roleId = null;
        if (role) {
            const [roleRows] = await pool.execute(
                'SELECT id FROM roles WHERE name = ?',
                [role]
            );
            
            if (roleRows.length > 0) {
                roleId = roleRows[0].id;
            }
        }
        
        // Get city_id from city name
        let cityId = null;
        if (city) {
            const [cityRows] = await pool.execute(
                'SELECT id FROM cities WHERE name = ?',
                [city]
            );
            
            if (cityRows.length > 0) {
                cityId = cityRows[0].id;
            }
        }
        
        const [result] = await pool.execute(
            'UPDATE users SET name = ?, email = ?, role_id = ?, city_id = ?, mobile = ? WHERE id = ?',
            [name, email, roleId, cityId, mobile, id]
        );
        return result.affectedRows > 0;
    }
    
    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = User;