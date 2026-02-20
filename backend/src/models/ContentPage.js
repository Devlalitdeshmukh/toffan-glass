const { pool } = require('../config/db');

class ContentPage {
    static async getAll() {
        const [rows] = await pool.execute(`
            SELECT 
                cp.id,
                cp.page_name as pageName,
                cp.title,
                cp.content,
                cp.meta_description as metaDescription,
                cp.is_active as isActive,
                cp.created_at as createdAt,
                cp.updated_at as updatedAt,
                GROUP_CONCAT(cpi.image_url) as image_urls
            FROM content_pages cp
            LEFT JOIN content_page_images cpi ON cp.id = cpi.content_page_id
            GROUP BY cp.id
            ORDER BY cp.created_at DESC
        `);
        
        return rows.map(row => ({
            ...row,
            images: row.image_urls ? row.image_urls.split(',') : []
        }));
    }

    static async getByPageName(pageName) {
        const [rows] = await pool.execute(`
            SELECT 
                cp.id,
                cp.page_name as pageName,
                cp.title,
                cp.content,
                cp.meta_description as metaDescription,
                cp.is_active as isActive,
                cp.created_at as createdAt,
                cp.updated_at as updatedAt,
                GROUP_CONCAT(cpi.image_url) as image_urls
            FROM content_pages cp
            LEFT JOIN content_page_images cpi ON cp.id = cpi.content_page_id
            WHERE cp.page_name = ?
            GROUP BY cp.id
        `, [pageName]);
        
        if (rows.length === 0) return null;
        
        const contentPage = rows[0];
        return {
            ...contentPage,
            images: contentPage.image_urls ? contentPage.image_urls.split(',') : []
        };
    }

    static async create(contentData) {
        const { pageName, title, content, metaDescription, isActive = true } = contentData;
        
        const [result] = await pool.execute(
            'INSERT INTO content_pages (page_name, title, content, meta_description, is_active) VALUES (?, ?, ?, ?, ?)',
            [pageName, title, content, metaDescription, isActive]
        );
        
        return result.insertId;
    }

    static async update(pageName, updateData) {
        const { title, content, metaDescription, isActive } = updateData;
        
        const [result] = await pool.execute(`
            UPDATE content_pages 
            SET title = ?, content = ?, meta_description = ?, is_active = ?
            WHERE page_name = ?
        `, [title, content, metaDescription, isActive, pageName]);
        
        return result.affectedRows > 0;
    }
    
    static async addImageToPage(pageId, imageUrl, caption = '') {
        const [result] = await pool.execute(
            'INSERT INTO content_page_images (content_page_id, image_url, caption) VALUES (?, ?, ?)',
            [pageId, imageUrl, caption]
        );
        return result.insertId;
    }
    
    static async removeImageFromPage(imageId) {
        const [result] = await pool.execute(
            'DELETE FROM content_page_images WHERE id = ?',
            [imageId]
        );
        return result.affectedRows > 0;
    }
    
    static async delete(pageName) {
        const [result] = await pool.execute(
            'DELETE FROM content_pages WHERE page_name = ?',
            [pageName]
        );
        
        return result.affectedRows > 0;
    }
}

module.exports = ContentPage;