const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'toffan_glass',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get promise-based pool
const promisePool = pool.promise();

// Test connection
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Initialize database tables
const initializeDatabase = async () => {
    try {
        const connection = await promisePool.getConnection();
        
        // Disable foreign key checks temporarily
        await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
        
        // Drop existing tables if they exist
        await connection.execute(`DROP TABLE IF EXISTS site_products`);
        await connection.execute(`DROP TABLE IF EXISTS site_images`);
        await connection.execute(`DROP TABLE IF EXISTS product_images`);
        await connection.execute(`DROP TABLE IF EXISTS payments`);
        await connection.execute(`DROP TABLE IF EXISTS sites`);
        await connection.execute(`DROP TABLE IF EXISTS inquiries`);
        await connection.execute(`DROP TABLE IF EXISTS products`);
        await connection.execute(`DROP TABLE IF EXISTS cities`);
        await connection.execute(`DROP TABLE IF EXISTS users`);
        await connection.execute(`DROP TABLE IF EXISTS roles`);
        await connection.execute(`DROP TABLE IF EXISTS content_pages`);
        
        // Re-enable foreign key checks
        await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
        
        // Create roles table
        await connection.execute(`
            CREATE TABLE roles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create cities table
        await connection.execute(`
            CREATE TABLE cities (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                state VARCHAR(100),
                country VARCHAR(100) DEFAULT 'India',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create users table
        await connection.execute(`
            CREATE TABLE users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role_id INT NOT NULL,
                city_id INT,
                mobile VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id),
                FOREIGN KEY (city_id) REFERENCES cities(id),
                INDEX idx_email (email),
                INDEX idx_role (role_id)
            )
        `);
        
        // Create content_pages table
        await connection.execute(`
            CREATE TABLE content_pages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                page_name VARCHAR(50) NOT NULL UNIQUE,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                meta_description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_page_name (page_name)
            )
        `);
        
        // Create products table
        await connection.execute(`
            CREATE TABLE products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                stock INT DEFAULT 0,
                specifications JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_name (name)
            )
        `);
        
        // Create product_images table
        await connection.execute(`
            CREATE TABLE product_images (
                id INT PRIMARY KEY AUTO_INCREMENT,
                product_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                is_primary BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                INDEX idx_product (product_id)
            )
        `);
        
        // Create inquiries table
        await connection.execute(`
            CREATE TABLE inquiries (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                city_id INT,
                status ENUM('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'NEW',
                assigned_to INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (city_id) REFERENCES cities(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                INDEX idx_status (status),
                INDEX idx_email (email)
            )
        `);
        
        // Create sites table
        await connection.execute(`
            CREATE TABLE sites (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                city_id INT,
                user_id INT,
                status ENUM('COMING_SOON', 'WORKING', 'COMPLETED') DEFAULT 'COMING_SOON',
                start_date DATE,
                completion_date DATE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (city_id) REFERENCES cities(id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_status (status),
                INDEX idx_city (city_id),
                INDEX idx_user (user_id)
            )
        `);
        
        // Create site_images table
        await connection.execute(`
            CREATE TABLE site_images (
                id INT PRIMARY KEY AUTO_INCREMENT,
                site_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                caption VARCHAR(255),
                is_primary BOOLEAN DEFAULT FALSE,
                uploaded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
                FOREIGN KEY (uploaded_by) REFERENCES users(id),
                INDEX idx_site (site_id)
            )
        `);

        // Create site_products table for Section 2: Products & Services
        await connection.execute(`
            CREATE TABLE site_products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                site_id INT NOT NULL,
                item_type ENUM('PRODUCT', 'SERVICE') DEFAULT 'PRODUCT',
                item_name VARCHAR(255) NOT NULL,
                description TEXT,
                quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
                unit VARCHAR(50),
                price DECIMAL(12,2) NOT NULL DEFAULT 0,
                discount_type ENUM('PERCENT', 'AMOUNT') DEFAULT 'PERCENT',
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
        
        // Create payments table
        await connection.execute(`
            CREATE TABLE payments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                site_id INT NOT NULL,
                customer_id INT NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                paid_amount DECIMAL(12,2) DEFAULT 0,
                balance_amount DECIMAL(12,2) DEFAULT 0,
                payment_date DATE,
                status ENUM('PAID', 'UNPAID', 'PARTIALLY_PAID') DEFAULT 'UNPAID',
                payment_method VARCHAR(50),
                transaction_id VARCHAR(100),
                notes TEXT,
                bill_number VARCHAR(50) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_status (status),
                INDEX idx_site (site_id)
            )
        `);
        
        // Insert default roles
        await connection.execute(`
            INSERT INTO roles (name, description) VALUES 
            ('ADMIN', 'Administrator with full access'),
            ('STAFF', 'Staff member with limited access'),
            ('CUSTOMER', 'Customer user')
        `);
        
        // Insert default cities
        await connection.execute(`
            INSERT INTO cities (name, state) VALUES 
            ('Indore', 'Madhya Pradesh'),
            ('Bhopal', 'Madhya Pradesh'),
            ('Ujjain', 'Madhya Pradesh'),
            ('Dewas', 'Madhya Pradesh'),
            ('Mhow', 'Madhya Pradesh')
        `);
        
        // Insert default admin user
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10); // Using a default password
        await connection.execute(
            `INSERT INTO users (name, email, password, role_id, city_id, mobile) VALUES (?, ?, ?, 1, 1, ?)`,
            ['Admin User', 'admin@toffanglass.com', hashedPassword, '9876543210']
        );
        
        // Insert default content pages
        await connection.execute(`
            INSERT INTO content_pages (page_name, title, content, meta_description) VALUES 
            ('about_us', 'About Us', 'Welcome to Toffan Glass & Hardware Solutions. We are a leading provider of glass and hardware solutions in Madhya Pradesh.', 'Learn more about our company and mission'),
            ('contact_us', 'Contact Us', 'Get in touch with us for any inquiries or project consultations.', 'Contact information and inquiry form'),
            ('services', 'Our Services', 'We offer a wide range of glass and hardware solutions including installation, repair, and maintenance services.', 'Details about our services')
        `);
        
        // Create content_page_images table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS content_page_images (
                id INT PRIMARY KEY AUTO_INCREMENT,
                content_page_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                caption VARCHAR(255),
                is_primary BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (content_page_id) REFERENCES content_pages(id) ON DELETE CASCADE,
                INDEX idx_content_page (content_page_id)
            )
        `);
        
        // Create contacts table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                type VARCHAR(50) NOT NULL,
                contact_value TEXT NOT NULL,
                label VARCHAR(100),
                is_primary BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                order_priority INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create services table
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
        
        // Create indexes for better performance
        await connection.execute(`CREATE INDEX idx_users_role_city ON users(role_id, city_id)`);
        await connection.execute(`CREATE INDEX idx_products_category_price ON products(category, price)`);
        await connection.execute(`CREATE INDEX idx_sites_status_city ON sites(status, city_id)`);
        await connection.execute(`CREATE INDEX idx_payments_status_site ON payments(status, site_id)`);
        await connection.execute(`CREATE INDEX idx_inquiries_status_assigned ON inquiries(status, assigned_to)`);
        
        console.log('✅ Database tables created/verified');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
};

module.exports = {
    pool: promisePool,
    testConnection,
    initializeDatabase
};
