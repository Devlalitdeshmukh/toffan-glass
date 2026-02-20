const bcrypt = require('bcryptjs');
const { db } = require('../config/sqliteDb');

class User {
    static create(userData) {
        return new Promise((resolve, reject) => {
            const { name, email, password, role = 'CUSTOMER', city, mobile } = userData;
            
            // Hash password
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                db.run(
                    'INSERT INTO users (name, email, password, role, city, mobile) VALUES (?, ?, ?, ?, ?, ?)',
                    [name, email, hashedPassword, role, city, mobile],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.lastID);
                        }
                    }
                );
            });
        });
    }
    
    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id, name, email, password, role, city, mobile, created_at FROM users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }
    
    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id, name, email, role, city, mobile, created_at FROM users WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }
    
    static comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    
    static getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT id, name, email, role, city, mobile, created_at FROM users ORDER BY created_at DESC',
                [],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
    
    static update(id, updateData) {
        return new Promise((resolve, reject) => {
            const { name, email, role, city, mobile } = updateData;
            db.run(
                'UPDATE users SET name = ?, email = ?, role = ?, city = ?, mobile = ? WHERE id = ?',
                [name, email, role, city, mobile, id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }
    
    static delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
}

module.exports = User;