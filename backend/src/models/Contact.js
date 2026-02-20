const { pool } = require('../config/db');

class Contact {
    static async getAll() {
        const [rows] = await pool.execute(`
            SELECT 
                id,
                type,
                contact_value as contactValue,
                label,
                is_primary as isPrimary,
                is_active as isActive,
                order_priority as orderPriority,
                created_at as createdAt,
                updated_at as updatedAt
            FROM contacts
            WHERE is_active = 1
            ORDER BY order_priority ASC, created_at DESC
        `);
        return rows;
    }

    static async getByType(type) {
        const [rows] = await pool.execute(`
            SELECT 
                id,
                type,
                contact_value as contactValue,
                label,
                is_primary as isPrimary,
                is_active as isActive,
                order_priority as orderPriority,
                created_at as createdAt,
                updated_at as updatedAt
            FROM contacts
            WHERE type = ? AND is_active = 1
            ORDER BY is_primary DESC, order_priority ASC, created_at DESC
        `, [type]);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute(`
            SELECT 
                id,
                type,
                contact_value as contactValue,
                label,
                is_primary as isPrimary,
                is_active as isActive,
                order_priority as orderPriority,
                created_at as createdAt,
                updated_at as updatedAt
            FROM contacts
            WHERE id = ? AND is_active = 1
        `, [id]);
        return rows[0];
    }

    static async create(contactData) {
        const { type, contactValue, label, isPrimary = false, orderPriority = 0 } = contactData;
        
        // If setting as primary, remove primary status from other contacts of same type
        if (isPrimary) {
            await pool.execute(
                'UPDATE contacts SET is_primary = FALSE WHERE type = ?',
                [type]
            );
        }
        
        const [result] = await pool.execute(
            'INSERT INTO contacts (type, contact_value, label, is_primary, order_priority) VALUES (?, ?, ?, ?, ?)',
            [type, contactValue, label, isPrimary, orderPriority]
        );
        
        return result.insertId;
    }

    static async update(id, updateData) {
        const { type, contactValue, label, isPrimary, orderPriority, isActive } = updateData;
        
        // If setting as primary, remove primary status from other contacts of same type
        if (isPrimary) {
            await pool.execute(
                'UPDATE contacts SET is_primary = FALSE WHERE type = ? AND id != ?',
                [type, id]
            );
        }
        
        const [result] = await pool.execute(`
            UPDATE contacts 
            SET type = ?, contact_value = ?, label = ?, is_primary = ?, 
                order_priority = ?, is_active = ?
            WHERE id = ?
        `, [type, contactValue, label, isPrimary, orderPriority, isActive, id]);
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM contacts WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    static async setAsPrimary(id) {
        // Get the contact to find its type
        const contact = await this.getById(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        
        // Remove primary status from other contacts of same type
        await pool.execute(
            'UPDATE contacts SET is_primary = FALSE WHERE type = ?',
            [contact.type]
        );
        
        // Set this contact as primary
        const [result] = await pool.execute(
            'UPDATE contacts SET is_primary = TRUE WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }
}

module.exports = Contact;