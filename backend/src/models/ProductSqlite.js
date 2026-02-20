const { db } = require('../config/sqliteDb');

class Product {
    static create(productData) {
        return new Promise((resolve, reject) => {
            const { name, category, description, price, stock, imageUrl, specifications } = productData;
            
            db.run(
                'INSERT INTO products (name, category, description, price, stock, image_url, specifications) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, category, description, price, stock, imageUrl, JSON.stringify(specifications)],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }
    
    static getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT id, name, category, description, price, stock, image_url as imageUrl, specifications, created_at as createdAt FROM products ORDER BY created_at DESC',
                [],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const products = rows.map(product => ({
                            ...product,
                            specifications: JSON.parse(product.specifications)
                        }));
                        resolve(products);
                    }
                }
            );
        });
    }
    
    static getById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id, name, category, description, price, stock, image_url as imageUrl, specifications, created_at as createdAt FROM products WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (!row) {
                        resolve(null);
                    } else {
                        const product = {
                            ...row,
                            specifications: JSON.parse(row.specifications)
                        };
                        resolve(product);
                    }
                }
            );
        });
    }
    
    static getByCategory(category) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT id, name, category, description, price, stock, image_url as imageUrl, specifications, created_at as createdAt FROM products WHERE category = ? ORDER BY created_at DESC',
                [category],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const products = rows.map(product => ({
                            ...product,
                            specifications: JSON.parse(product.specifications)
                        }));
                        resolve(products);
                    }
                }
            );
        });
    }
    
    static update(id, updateData) {
        return new Promise((resolve, reject) => {
            const { name, category, description, price, stock, imageUrl, specifications } = updateData;
            
            db.run(
                'UPDATE products SET name = ?, category = ?, description = ?, price = ?, stock = ?, image_url = ?, specifications = ? WHERE id = ?',
                [name, category, description, price, stock, imageUrl, JSON.stringify(specifications), id],
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
            db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
    
    static search(query) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT id, name, category, description, price, stock, image_url as imageUrl, specifications, created_at as createdAt FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC',
                [`%${query}%`, `%${query}%`],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const products = rows.map(product => ({
                            ...product,
                            specifications: JSON.parse(product.specifications)
                        }));
                        resolve(products);
                    }
                }
            );
        });
    }
}

module.exports = Product;