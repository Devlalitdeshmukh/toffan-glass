const { pool } = require('../config/db');

class Inquiry {
    static async getAll() {
        const [rows] = await pool.execute(`
            SELECT 
                i.id,
                i.name,
                i.email,
                i.mobile,
                i.message,
                i.status,
                i.created_at as createdAt,
                i.updated_at as updatedAt,
                c.name as cityName,
                u.name as assignedToName
            FROM inquiries i
            LEFT JOIN cities c ON i.city_id = c.id
            LEFT JOIN users u ON i.assigned_to = u.id
            ORDER BY i.created_at DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute(`
            SELECT 
                i.id,
                i.name,
                i.email,
                i.mobile,
                i.message,
                i.status,
                i.created_at as createdAt,
                i.updated_at as updatedAt,
                c.name as cityName,
                c.id as cityId,
                u.name as assignedToName,
                u.id as assignedToId
            FROM inquiries i
            LEFT JOIN cities c ON i.city_id = c.id
            LEFT JOIN users u ON i.assigned_to = u.id
            WHERE i.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(inquiryData) {
        const { name, email, mobile, message, cityId } = inquiryData;
        
        const [result] = await pool.execute(
            'INSERT INTO inquiries (name, email, mobile, message, city_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, mobile, message, cityId]
        );
        
        return result.insertId;
    }

    static async update(id, inquiryData) {
        const { name, email, mobile, message, cityId, status, assignedTo } = inquiryData;
        
        const [result] = await pool.execute(`
            UPDATE inquiries 
            SET name = ?, email = ?, mobile = ?, message = ?, city_id = ?, status = ?, assigned_to = ?
            WHERE id = ?
        `, [name, email, mobile, message, cityId, status, assignedTo, id]);
        
        return result.affectedRows > 0;
    }

    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE inquiries SET status = ? WHERE id = ?',
            [status, id]
        );
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM inquiries WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    static async getByStatus(status) {
        const [rows] = await pool.execute(`
            SELECT 
                i.id,
                i.name,
                i.email,
                i.mobile,
                i.message,
                i.status,
                i.created_at as createdAt,
                c.name as cityName
            FROM inquiries i
            LEFT JOIN cities c ON i.city_id = c.id
            WHERE i.status = ?
            ORDER BY i.created_at DESC
        `, [status]);
        return rows;
    }
}

module.exports = Inquiry;