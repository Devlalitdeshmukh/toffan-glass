const { pool } = require('../config/db');

const parseSpecifications = (specifications) => {
    if (!specifications) return {};
    if (typeof specifications === 'object') return specifications;

    try {
        return JSON.parse(specifications);
    } catch (error) {
        // Keep API stable even if older rows contain invalid JSON payloads
        return {};
    }
};

class Product {
    static async create(productData) {
        const { name, category, description, price, stock, imageUrl, specifications } = productData;
        
        const [result] = await pool.execute(
            'INSERT INTO products (name, category, description, price, stock, specifications) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, description, price, stock, JSON.stringify(specifications)]
        );
        
        const productId = result.insertId;
        
        // Add image if provided
        if (imageUrl) {
            await pool.execute(
                'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, TRUE)',
                [productId, imageUrl]
            );
        }
        
        return productId;
    }
    
    static async addImage(productId, imageUrl) {
        const [result] = await pool.execute(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, FALSE)',
            [productId, imageUrl]
        );
        return result.insertId;
    }

    static async getImageUrls(productId) {
        const [rows] = await pool.execute(
            'SELECT image_url FROM product_images WHERE product_id = ?',
            [productId]
        );
        return rows.map((row) => row.image_url);
    }

    static async deleteImagesByUrls(productId, imageUrls = []) {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) return 0;

        const placeholders = imageUrls.map(() => '?').join(',');
        const [result] = await pool.execute(
            `DELETE FROM product_images WHERE product_id = ? AND image_url IN (${placeholders})`,
            [productId, ...imageUrls]
        );
        return result.affectedRows || 0;
    }
    
    static async getAll() {
        const [rows] = await pool.execute(
            `SELECT 
                p.id, 
                p.name, 
                p.category, 
                p.description, 
                p.price, 
                p.stock, 
                p.specifications, 
                p.created_at as createdAt,
                GROUP_CONCAT(pi.image_url) as image_urls
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            GROUP BY p.id
            ORDER BY p.created_at DESC`
        );
        
        return rows.map(product => ({
            ...product,
            images: product.image_urls ? product.image_urls.split(',') : [],
            specifications: parseSpecifications(product.specifications)
        }));
    }
    
    static async getById(id) {
        const [rows] = await pool.execute(
            `SELECT 
                p.id, 
                p.name, 
                p.category, 
                p.description, 
                p.price, 
                p.stock, 
                p.specifications, 
                p.created_at as createdAt,
                GROUP_CONCAT(pi.image_url) as image_urls
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = ?
            GROUP BY p.id`,
            [id]
        );
        
        if (rows.length === 0) return null;
        
        const product = rows[0];
        return {
            ...product,
            images: product.image_urls ? product.image_urls.split(',') : [],
            specifications: parseSpecifications(product.specifications)
        };
    }
    
    static async getByCategory(category) {
        const [rows] = await pool.execute(
            `SELECT 
                p.id, 
                p.name, 
                p.category, 
                p.description, 
                p.price, 
                p.stock, 
                p.specifications, 
                p.created_at as createdAt,
                GROUP_CONCAT(pi.image_url) as image_urls
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.category = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC`,
            [category]
        );
        
        return rows.map(product => ({
            ...product,
            images: product.image_urls ? product.image_urls.split(',') : [],
            specifications: parseSpecifications(product.specifications)
        }));
    }
    
    static async update(id, updateData) {
        const { name, category, description, price, stock, specifications } = updateData;
        
        const [result] = await pool.execute(
            'UPDATE products SET name = ?, category = ?, description = ?, price = ?, stock = ?, specifications = ? WHERE id = ?',
            [name, category, description, price, stock, JSON.stringify(specifications), id]
        );
        
        return result.affectedRows > 0;
    }
    
    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    
    static async search(query) {
        const [rows] = await pool.execute(
            `SELECT 
                p.id, 
                p.name, 
                p.category, 
                p.description, 
                p.price, 
                p.stock, 
                p.specifications, 
                p.created_at as createdAt,
                GROUP_CONCAT(pi.image_url) as image_urls
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.name LIKE ? OR p.description LIKE ?
            GROUP BY p.id
            ORDER BY p.created_at DESC`,
            [`%${query}%`, `%${query}%`]
        );
        
        return rows.map(product => ({
            ...product,
            images: product.image_urls ? product.image_urls.split(',') : [],
            specifications: parseSpecifications(product.specifications)
        }));
    }
}

module.exports = Product;
