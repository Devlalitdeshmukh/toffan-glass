const { pool } = require("./src/config/db");

async function createServicesTables() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to database...");

    // Disable FK checks
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");

    // Create services table
    console.log("Creating services table...");
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS services (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                short_description VARCHAR(500),
                description TEXT,
                icon VARCHAR(100),
                status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

    // Create service_images table
    console.log("Creating service_images table...");
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS service_images (
                id INT PRIMARY KEY AUTO_INCREMENT,
                service_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                caption VARCHAR(255),
                is_primary BOOLEAN DEFAULT FALSE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
                INDEX idx_service (service_id)
            )
        `);

    // Enable FK checks
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Services tables created successfully");
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  }
}

createServicesTables();
