const { pool } = require('../config/db');

const toTinyIntBoolean = (value, defaultValue = 1) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'number') return value ? 1 : 0;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') return 1;
        if (normalized === 'false' || normalized === '0') return 0;
    }
    return defaultValue;
};

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
        const normalizedIsActive = toTinyIntBoolean(isActive, 1);
        
        const [result] = await pool.execute(
            'INSERT INTO content_pages (page_name, title, content, meta_description, is_active) VALUES (?, ?, ?, ?, ?)',
            [pageName, title, content, metaDescription, normalizedIsActive]
        );
        
        return result.insertId;
    }

    static async update(pageName, updateData) {
        const { title, content, metaDescription, isActive } = updateData;
        const normalizedIsActive = toTinyIntBoolean(isActive, 1);
        
        const [result] = await pool.execute(`
            UPDATE content_pages 
            SET title = ?, content = ?, meta_description = ?, is_active = ?
            WHERE page_name = ?
        `, [title, content, metaDescription, normalizedIsActive, pageName]);
        
        return result.affectedRows > 0;
    }
    
    static async addImageToPage(pageId, imageUrl, caption = '') {
        const [result] = await pool.execute(
            'INSERT INTO content_page_images (content_page_id, image_url, caption) VALUES (?, ?, ?)',
            [pageId, imageUrl, caption]
        );
        return result.insertId;
    }

    static async getImagesByPageId(pageId) {
        const [rows] = await pool.execute(
            'SELECT id, image_url as imageUrl FROM content_page_images WHERE content_page_id = ?',
            [pageId]
        );
        return rows;
    }

    static async deleteImagesByUrls(pageId, imageUrls = []) {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) return 0;
        const placeholders = imageUrls.map(() => '?').join(',');
        const [result] = await pool.execute(
            `DELETE FROM content_page_images WHERE content_page_id = ? AND image_url IN (${placeholders})`,
            [pageId, ...imageUrls]
        );
        return result.affectedRows || 0;
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
