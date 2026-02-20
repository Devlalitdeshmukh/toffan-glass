-- Toffan Glass & Hardware Solutions Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS site_images;
DROP TABLE IF EXISTS site_products;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS sites;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Create roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cities table
CREATE TABLE cities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
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
);

-- Create content_pages table
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
);

-- Create products table
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
);

-- Create product_images table
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
);

-- Create inquiries table
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
);

-- Create sites table
CREATE TABLE sites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city_id INT,
    status ENUM('COMING_SOON', 'WORKING', 'COMPLETED') DEFAULT 'COMING_SOON',
    start_date DATE,
    completion_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    INDEX idx_status (status),
    INDEX idx_city (city_id)
);

-- Create site_images table
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
);

-- Create site_products table (Section 2: Products & Services)
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
);

-- Create payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE,
    status ENUM('PAID', 'UNPAID', 'OUTSTANDING') DEFAULT 'UNPAID',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_site (site_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Administrator with full access'),
('STAFF', 'Staff member with limited access'),
('CUSTOMER', 'Customer user');

-- Insert default cities
INSERT INTO cities (name, state) VALUES 
('Indore', 'Madhya Pradesh'),
('Bhopal', 'Madhya Pradesh'),
('Ujjain', 'Madhya Pradesh'),
('Dewas', 'Madhya Pradesh'),
('Mhow', 'Madhya Pradesh');

-- Insert default admin user
INSERT INTO users (name, email, password, role_id, city_id, mobile) VALUES 
('Admin User', 'admin@toffanglass.com', '$2b$10$abcdefghijklmnopqrstuvwxysaltexample', 1, 1, '9876543210');

-- Create contacts table
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL, -- 'phone', 'email', 'address', 'social_media'
    contact_value TEXT NOT NULL,
    label VARCHAR(100), -- 'Office Phone', 'Support Email', 'Head Office', etc.
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    order_priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default content pages
INSERT INTO content_pages (page_name, title, content, meta_description) VALUES 
('about_us', 'About Us', 'Welcome to Toffan Glass & Hardware Solutions. We are a leading provider of glass and hardware solutions in Madhya Pradesh.', 'Learn more about our company and mission'),
('contact_us', 'Contact Us', 'Get in touch with us for any inquiries or project consultations.', 'Contact information and inquiry form'),
('services', 'Our Services', 'We offer a wide range of glass and hardware solutions including installation, repair, and maintenance services.', 'Details about our services');

-- Create content_page_images table
CREATE TABLE content_page_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_page_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_page_id) REFERENCES content_pages(id) ON DELETE CASCADE,
    INDEX idx_content_page (content_page_id)
);

-- Create services table
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(500),
    description TEXT,
    icon VARCHAR(100),
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create service_images table
CREATE TABLE service_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_service (service_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_role_city ON users(role_id, city_id);
CREATE INDEX idx_products_category_price ON products(category, price);
CREATE INDEX idx_sites_status_city ON sites(status, city_id);
CREATE INDEX idx_payments_status_site ON payments(status, site_id);
CREATE INDEX idx_inquiries_status_assigned ON inquiries(status, assigned_to);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_created ON services(created_at);
