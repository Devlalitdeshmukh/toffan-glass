const { pool } = require("../config/db");

class Site {
  static async ensureSiteProductsTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS site_products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_id INT NOT NULL,
        item_type ENUM('PRODUCT','SERVICE') DEFAULT 'PRODUCT',
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
        unit VARCHAR(50),
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        discount_type ENUM('PERCENT','AMOUNT') DEFAULT 'PERCENT',
        discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
        vat_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
        delivery_charge DECIMAL(12,2) NOT NULL DEFAULT 0,
        total DECIMAL(12,2) NOT NULL DEFAULT 0,
        sort_order INT NOT NULL DEFAULT 0,
        created_by INT NULL,
        updated_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_site_products_site (site_id),
        INDEX idx_site_products_name (item_name)
      )
    `);
  }

  static async getAll() {
    await this.ensureSiteProductsTable();
    const [rows] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.address,
                s.user_id as userId,
                s.user_id as customerId,
                s.status,
                s.start_date as startDate,
                s.completion_date as completionDate,
                s.description,
                s.created_at as createdAt,
                s.updated_at as updatedAt,
                c.name as cityName,
                c.id as cityId,
                u.name as customerName,
                COALESCE(COUNT(sp.id), 0) as itemCount
            FROM sites s
            LEFT JOIN cities c ON s.city_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN site_products sp ON s.id = sp.site_id
            GROUP BY s.id
            ORDER BY s.created_at DESC
        `);
    return rows;
  }

  static async getById(id) {
    await this.ensureSiteProductsTable();
    const [rows] = await pool.execute(
      `
            SELECT 
                s.id,
                s.name,
                s.address,
                s.user_id as userId,
                s.user_id as customerId,
                s.status,
                s.start_date as startDate,
                s.completion_date as completionDate,
                s.description,
                s.created_at as createdAt,
                s.updated_at as updatedAt,
                c.name as cityName,
                c.id as cityId,
                u.name as customerName
            FROM sites s
            LEFT JOIN cities c ON s.city_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        `,
      [id],
    );
    const site = rows[0];
    if (!site) return null;
    site.siteProducts = await this.getSiteProducts(id);
    return site;
  }

  static async create(siteData) {
    const {
      name,
      address,
      cityId,
      userId,
      status,
      startDate,
      completionDate,
      description,
    } = siteData;

    const [result] = await pool.execute(
      "INSERT INTO sites (name, address, city_id, user_id, status, start_date, completion_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, address, cityId || null, userId || null, status, startDate, completionDate, description],
    );

    return result.insertId;
  }

  static async update(id, siteData) {
    const {
      name,
      address,
      cityId,
      userId,
      status,
      startDate,
      completionDate,
      description,
    } = siteData;

    const [result] = await pool.execute(
      `
            UPDATE sites 
            SET name = ?, address = ?, city_id = ?, user_id = ?, status = ?, start_date = ?, completion_date = ?, description = ?
            WHERE id = ?
        `,
      [
        name,
        address,
        cityId || null,
        userId || null,
        status,
        startDate,
        completionDate,
        description,
        id,
      ],
    );

    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      "UPDATE sites SET status = ? WHERE id = ?",
      [status, id],
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM sites WHERE id = ?", [id]);

    return result.affectedRows > 0;
  }

  static async getByStatus(status) {
    await this.ensureSiteProductsTable();
    const [rows] = await pool.execute(
      `
            SELECT 
                s.id,
                s.name,
                s.address,
                s.user_id as userId,
                s.user_id as customerId,
                s.status,
                s.start_date as startDate,
                s.completion_date as completionDate,
                c.name as cityName,
                u.name as customerName,
                COALESCE(COUNT(sp.id), 0) as itemCount
            FROM sites s
            LEFT JOIN cities c ON s.city_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN site_products sp ON s.id = sp.site_id
            WHERE s.status = ?
            GROUP BY s.id
            ORDER BY s.created_at DESC
        `,
      [status],
    );
    return rows;
  }

  static async getWithImages() {
    await this.ensureSiteProductsTable();
    const [sites] = await pool.execute(`
            SELECT 
                s.id,
                s.name,
                s.address,
                s.user_id as userId,
                s.user_id as customerId,
                s.status,
                s.start_date as startDate,
                s.completion_date as completionDate,
                s.description,
                c.name as cityName,
                u.name as customerName
            FROM sites s
            LEFT JOIN cities c ON s.city_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `);

    // Get images for each site
    for (let site of sites) {
      const [images] = await pool.execute(
        "SELECT id, image_url as imageUrl, caption, is_primary as isPrimary FROM site_images WHERE site_id = ?",
        [site.id],
      );
      const [items] = await pool.execute(
        `SELECT id, item_type as type, item_name as itemName, description, quantity, unit, price, discount_type as discountType, discount_value as discountValue, vat_percent as vatPercent, delivery_charge as deliveryCharge, total, sort_order as sortOrder
         FROM site_products WHERE site_id = ? ORDER BY sort_order ASC, id ASC`,
        [site.id],
      );
      site.images = images;
      site.siteProducts = items;
    }

    return sites;
  }

  static async getSiteProducts(siteId) {
    await this.ensureSiteProductsTable();
    const [rows] = await pool.execute(
      `SELECT id, item_type as type, item_name as itemName, description, quantity, unit, price, discount_type as discountType, discount_value as discountValue, vat_percent as vatPercent, delivery_charge as deliveryCharge, total, sort_order as sortOrder
       FROM site_products
       WHERE site_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [siteId],
    );
    return rows;
  }

  static async replaceSiteProducts(siteId, items = [], actorUserId = null) {
    await this.ensureSiteProductsTable();
    await pool.execute("DELETE FROM site_products WHERE site_id = ?", [siteId]);

    if (!Array.isArray(items) || items.length === 0) return;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index] || {};
      await pool.execute(
        `INSERT INTO site_products
          (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          siteId,
          (item.type || "PRODUCT").toUpperCase() === "SERVICE" ? "SERVICE" : "PRODUCT",
          item.itemName || "",
          item.description || "",
          Number(item.quantity || 0),
          item.unit || "",
          Number(item.price || 0),
          (item.discountType || "PERCENT").toUpperCase() === "AMOUNT" ? "AMOUNT" : "PERCENT",
          Number(item.discountValue || 0),
          Number(item.vatPercent || 0),
          Number(item.deliveryCharge || 0),
          Number(item.total || 0),
          index,
          actorUserId || null,
          actorUserId || null,
        ],
      );
    }
  }

  static async addImage(siteId, imageUrl, caption = "", isPrimary = false) {
    const [result] = await pool.execute(
      "INSERT INTO site_images (site_id, image_url, caption, is_primary) VALUES (?, ?, ?, ?)",
      [siteId, imageUrl, caption, isPrimary ? 1 : 0],
    );
    return result.insertId;
  }
}

module.exports = Site;
