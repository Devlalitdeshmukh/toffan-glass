const { pool } = require("../config/db");

class Service {
  static async getAll() {
    const [rows] = await pool.execute(`
            SELECT 
                s.id,
                s.title,
                s.short_description as shortDescription,
                s.description,
                s.status,
                s.icon,
                s.created_at as createdAt,
                s.updated_at as updatedAt
            FROM services s
            ORDER BY s.created_at DESC
        `);

    // Get images for each service (could be optimized with a JOIN, but this is consistent with Site model)
    for (let service of rows) {
      const [images] = await pool.execute(
        "SELECT id, image_url as imageUrl, caption, is_primary as isPrimary, sort_order as sortOrder FROM service_images WHERE service_id = ? ORDER BY sort_order ASC, is_primary DESC",
        [service.id],
      );
      service.images = images;
    }

    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      `
            SELECT 
                s.id,
                s.title,
                s.short_description as shortDescription,
                s.description,
                s.status,
                s.icon,
                s.created_at as createdAt,
                s.updated_at as updatedAt
            FROM services s
            WHERE s.id = ?
        `,
      [id],
    );

    if (rows.length === 0) return null;

    const service = rows[0];
    const [images] = await pool.execute(
      "SELECT id, image_url as imageUrl, caption, is_primary as isPrimary, sort_order as sortOrder FROM service_images WHERE service_id = ? ORDER BY sort_order ASC, is_primary DESC",
      [id],
    );
    service.images = images;

    return service;
  }

  static async create(serviceData) {
    const { title, shortDescription, description, status, icon } = serviceData;

    const [result] = await pool.execute(
      "INSERT INTO services (title, short_description, description, status, icon) VALUES (?, ?, ?, ?, ?)",
      [title, shortDescription, description, status || "ACTIVE", icon],
    );

    return result.insertId;
  }

  static async update(id, serviceData) {
    const { title, shortDescription, description, status, icon } = serviceData;

    const [result] = await pool.execute(
      `
            UPDATE services 
            SET title = ?, short_description = ?, description = ?, status = ?, icon = ?
            WHERE id = ?
        `,
      [title, shortDescription, description, status, icon, id],
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    // Images will be deleted automatically due to ON DELETE CASCADE
    const [result] = await pool.execute("DELETE FROM services WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async addImage(
    serviceId,
    imageUrl,
    caption = "",
    isPrimary = false,
    sortOrder = 0,
  ) {
    const [result] = await pool.execute(
      "INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)",
      [serviceId, imageUrl, caption, isPrimary ? 1 : 0, sortOrder],
    );
    return result.insertId;
  }

  static async deleteImage(imageId) {
    const [result] = await pool.execute(
      "DELETE FROM service_images WHERE id = ?",
      [imageId],
    );
    return result.affectedRows > 0;
  }
  
  static async getAllPaginated(offset = 0, limit = 10, sortBy = 's.created_at', sortDirection = 'DESC', search = '') {
    // Validate and sanitize sort field to prevent SQL injection
    const allowedSortFields = ['s.id', 's.title', 's.status', 's.created_at', 's.updated_at'];
    const sanitizedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 's.created_at';
    
    // Validate sort direction
    const sanitizedSortDir = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Sanitize search parameter
    const sanitizedSearch = search ? search.replace(/[<>%"'\\]/g, '') : '';
    
    let query = `SELECT 
        s.id,
        s.title,
        s.short_description as shortDescription,
        s.description,
        s.status,
        s.icon,
        s.created_at as createdAt,
        s.updated_at as updatedAt
      FROM services s`;
    
    const params = [];
    
    // Add search condition if provided
    if (sanitizedSearch) {
      query += ` WHERE s.title LIKE ? OR s.short_description LIKE ?`;
      params.push(`%${sanitizedSearch}%`, `%${sanitizedSearch}%`);
    }
    
    // Add ORDER BY clause with sanitized values
    query += ` ORDER BY ${sanitizedSortBy} ${sanitizedSortDir}`;
    
    // Convert limit and offset to integers and append directly (safer for LIMIT/OFFSET)
    const intLimit = parseInt(limit, 10) || 10;
    const intOffset = parseInt(offset, 10) || 0;
    query += ` LIMIT ${intLimit} OFFSET ${intOffset}`;
    
    const [rows] = await pool.execute(query, params);
    
    // Get images for each service
    for (let service of rows) {
      const [images] = await pool.execute(
        "SELECT id, image_url as imageUrl, caption, is_primary as isPrimary, sort_order as sortOrder FROM service_images WHERE service_id = ? ORDER BY sort_order ASC, is_primary DESC",
        [service.id],
      );
      service.images = images;
    }
    
    return rows;
  }
  
  static async getCount(search = '') {
    // Sanitize search parameter
    const sanitizedSearch = search ? search.replace(/[<>%"'\\]/g, '') : '';
    
    let query = 'SELECT COUNT(*) as count FROM services s';
    const params = [];
    
    if (sanitizedSearch) {
      query += ' WHERE s.title LIKE ? OR s.short_description LIKE ?';
      params.push(`%${sanitizedSearch}%`, `%${sanitizedSearch}%`);
    }
    
    const [result] = await pool.execute(query, params);
    return result[0].count;
  }
}

module.exports = Service;
