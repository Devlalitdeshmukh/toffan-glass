const { pool } = require('../config/db');

class City {
    static async getAll() {
        const [rows] = await pool.execute(
            'SELECT id, name, state, country, created_at as createdAt FROM cities ORDER BY name'
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute(
            'SELECT id, name, state, country, created_at as createdAt FROM cities WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(cityData) {
        const { name, state, country = 'India' } = cityData;
        
        const [result] = await pool.execute(
            'INSERT INTO cities (name, state, country) VALUES (?, ?, ?)',
            [name, state, country]
        );
        
        return result.insertId;
    }

    static async update(id, cityData) {
        const { name, state, country } = cityData;
        
        const [result] = await pool.execute(
            'UPDATE cities SET name = ?, state = ?, country = ? WHERE id = ?',
            [name, state, country, id]
        );
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM cities WHERE id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }
}

module.exports = City;