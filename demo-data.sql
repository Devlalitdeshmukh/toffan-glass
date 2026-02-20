START TRANSACTION;

-- =====================================================
-- DEMO DATA EXPORT (MySQL)
-- Schema-safe: INSERT/UPDATE only, no DROP/CREATE/ALTER
-- Note: This schema does not have separate `categories` or `invoices` tables.
-- Category is stored in products.category.
-- Invoice reference is stored in payments.bill_number.
-- =====================================================

-- -----------------------------
-- 0) Reference data (if missing)
-- -----------------------------
INSERT INTO cities (name, state, country, created_at)
SELECT 'Indore', 'Madhya Pradesh', 'India', NOW()
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Indore');

INSERT INTO cities (name, state, country, created_at)
SELECT 'Bhopal', 'Madhya Pradesh', 'India', NOW()
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Bhopal');

INSERT INTO cities (name, state, country, created_at)
SELECT 'Ujjain', 'Madhya Pradesh', 'India', NOW()
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Ujjain');

INSERT INTO cities (name, state, country, created_at)
SELECT 'Dewas', 'Madhya Pradesh', 'India', NOW()
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Dewas');

INSERT INTO cities (name, state, country, created_at)
SELECT 'Mhow', 'Madhya Pradesh', 'India', NOW()
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Mhow');

-- -----------------------------
-- 1) Users (5)
-- -----------------------------
INSERT INTO users (name, email, password, role_id, city_id, mobile, address, created_at, updated_at)
SELECT
  'Aarav Mehta',
  'aarav.mehta@toffandemo.com',
  '$2b$10$EckRgfPjJerEWghDUxHWr.2X7.41WBrcvK6QgxHozbpyCcSkzMSZe',
  (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1),
  (SELECT id FROM cities WHERE name = 'Indore' LIMIT 1),
  '9826001101',
  'Corporate Demo Profile',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'aarav.mehta@toffandemo.com');

INSERT INTO users (name, email, password, role_id, city_id, mobile, address, created_at, updated_at)
SELECT
  'Ritika Sharma',
  'ritika.sharma@toffandemo.com',
  '$2b$10$HOI.xdziEBXZ50LBBFzy2eqJ1PwLnMARhG3VZHZtYVfIOfpXkFoEe',
  (SELECT id FROM roles WHERE name = 'STAFF' LIMIT 1),
  (SELECT id FROM cities WHERE name = 'Bhopal' LIMIT 1),
  '9826001102',
  'Corporate Demo Profile',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ritika.sharma@toffandemo.com');

INSERT INTO users (name, email, password, role_id, city_id, mobile, address, created_at, updated_at)
SELECT
  'Karan Verma',
  'karan.verma@toffandemo.com',
  '$2b$10$8JKyoRJ.7VBJNCzA1xqUcekjLaj4mh/m1MGHgzzvfaoOd.nLAAEl2',
  (SELECT id FROM roles WHERE name = 'STAFF' LIMIT 1),
  (SELECT id FROM cities WHERE name = 'Ujjain' LIMIT 1),
  '9826001103',
  'Corporate Demo Profile',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'karan.verma@toffandemo.com');

INSERT INTO users (name, email, password, role_id, city_id, mobile, address, created_at, updated_at)
SELECT
  'Neha Kulkarni',
  'neha.kulkarni@toffandemo.com',
  '$2b$10$jdSdu8teUiIxTNiQYkbHe.DGlFOM4WnAldVzBBuS6WrbiqkJN7dsa',
  (SELECT id FROM roles WHERE name = 'CUSTOMER' LIMIT 1),
  (SELECT id FROM cities WHERE name = 'Indore' LIMIT 1),
  '9826001104',
  'Client Demo Profile',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'neha.kulkarni@toffandemo.com');

INSERT INTO users (name, email, password, role_id, city_id, mobile, address, created_at, updated_at)
SELECT
  'Vikram Singh',
  'vikram.singh@toffandemo.com',
  '$2b$10$wdWIHqmJ.6zSwsiyhl7bfuRpaCXa/qgRYk0hLB4iDLaqmpi6Nh/O2',
  (SELECT id FROM roles WHERE name = 'CUSTOMER' LIMIT 1),
  (SELECT id FROM cities WHERE name = 'Dewas' LIMIT 1),
  '9826001105',
  'Client Demo Profile',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'vikram.singh@toffandemo.com');

-- -----------------------------
-- 2) Products (5)
--    SKU/GST/Status stored in products.specifications JSON
-- -----------------------------
INSERT INTO products (name, category, description, price, stock, specifications, created_at, updated_at)
SELECT
  'UltraClear Tempered Office Partition Glass',
  'Glass',
  '12mm ultra-clear tempered glass engineered for premium office partitions with high optical clarity, low distortion, and impact-safe performance for commercial interiors.',
  485.00,
  320,
  JSON_OBJECT('sku_code','TG-OFF-UC-12MM-001','gst_percent',18,'status','ACTIVE','finish','Low-Iron / Tempered','warranty','12 months'),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'UltraClear Tempered Office Partition Glass');

INSERT INTO products (name, category, description, price, stock, specifications, created_at, updated_at)
SELECT
  'Architectural Laminated Safety Glass Panel',
  'Glass',
  'Laminated safety glass panel designed for facade and staircase applications, combining structural integrity, acoustic damping, and enhanced post-breakage retention.',
  640.00,
  210,
  JSON_OBJECT('sku_code','TG-LAM-SAFE-001','gst_percent',18,'status','ACTIVE','finish','Laminated Safety','warranty','12 months'),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Architectural Laminated Safety Glass Panel');

INSERT INTO products (name, category, description, price, stock, specifications, created_at, updated_at)
SELECT
  'Heavy-Duty Hydraulic Floor Spring Kit',
  'Hardware',
  'Commercial-grade floor spring kit for frameless glass doors with adjustable closing speed, high cycle durability, and corrosion-resistant stainless-steel housing.',
  5250.00,
  95,
  JSON_OBJECT('sku_code','HW-FLOOR-SPR-001','gst_percent',18,'status','ACTIVE','material','SS 304','warranty','18 months'),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Heavy-Duty Hydraulic Floor Spring Kit');

INSERT INTO products (name, category, description, price, stock, specifications, created_at, updated_at)
SELECT
  'Stainless Steel Spider Fitting Assembly',
  'Hardware',
  'Precision-machined SS-316 spider fitting assembly for point-fixed glazing systems in malls, airports, and contemporary glass facades.',
  3925.00,
  140,
  JSON_OBJECT('sku_code','HW-SPIDER-ASSY-001','gst_percent',18,'status','ACTIVE','material','SS 316','warranty','18 months'),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Stainless Steel Spider Fitting Assembly');

INSERT INTO products (name, category, description, price, stock, specifications, created_at, updated_at)
SELECT
  'Acoustic Insulated Double-Glazed Unit',
  'Glass',
  'High-performance insulated unit combining thermal efficiency with acoustic control, ideal for boardrooms, hospitals, and high-traffic urban properties.',
  850.00,
  175,
  JSON_OBJECT('sku_code','TG-DGU-ACOUSTIC-001','gst_percent',18,'status','ACTIVE','acoustic_rating','High','warranty','24 months'),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Acoustic Insulated Double-Glazed Unit');

-- -----------------------------
-- 3) Product Images (3-4 each)
-- -----------------------------
INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200', 1, NOW()
FROM products p
WHERE p.name = 'UltraClear Tempered Office Partition Glass'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id
      AND pi.image_url = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200'
  );

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'UltraClear Tempered Office Partition Glass'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'UltraClear Tempered Office Partition Glass'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'UltraClear Tempered Office Partition Glass'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200', 1, NOW()
FROM products p
WHERE p.name = 'Architectural Laminated Safety Glass Panel'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Architectural Laminated Safety Glass Panel'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1595841696677-5f806969542a?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Architectural Laminated Safety Glass Panel'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1595841696677-5f806969542a?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200', 1, NOW()
FROM products p
WHERE p.name = 'Heavy-Duty Hydraulic Floor Spring Kit'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Heavy-Duty Hydraulic Floor Spring Kit'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Heavy-Duty Hydraulic Floor Spring Kit'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Heavy-Duty Hydraulic Floor Spring Kit'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200', 1, NOW()
FROM products p
WHERE p.name = 'Stainless Steel Spider Fitting Assembly'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Stainless Steel Spider Fitting Assembly'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Stainless Steel Spider Fitting Assembly'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1465800872432-7867f60f6c80?auto=format&fit=crop&q=80&w=1200', 1, NOW()
FROM products p
WHERE p.name = 'Acoustic Insulated Double-Glazed Unit'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1465800872432-7867f60f6c80?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Acoustic Insulated Double-Glazed Unit'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Acoustic Insulated Double-Glazed Unit'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200');

INSERT INTO product_images (product_id, image_url, is_primary, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200', 0, NOW()
FROM products p
WHERE p.name = 'Acoustic Insulated Double-Glazed Unit'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.image_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200');

-- -----------------------------
-- 4) Services (5)
-- -----------------------------
INSERT INTO services (title, short_description, description, icon, status, created_at, updated_at)
SELECT
  'Commercial Glass Facade Installation',
  'Category: Installation | Base Price: 125000 | Duration: 18 days',
  'End-to-end commercial facade installation including site survey, structural coordination, glass module fitting, sealing, and quality handover for large-format elevations.',
  'building-2',
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title = 'Commercial Glass Facade Installation');

INSERT INTO services (title, short_description, description, icon, status, created_at, updated_at)
SELECT
  'Frameless Shower Enclosure Solutions',
  'Category: Residential | Base Price: 32000 | Duration: 3 days',
  'Custom frameless shower enclosure solutions with template-based fabrication, precision hardware alignment, anti-leak sealing, and post-installation safety inspection.',
  'shield-check',
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title = 'Frameless Shower Enclosure Solutions');

INSERT INTO services (title, short_description, description, icon, status, created_at, updated_at)
SELECT
  'Structural Glazing Repair & Retrofit',
  'Category: Maintenance | Base Price: 58000 | Duration: 5 days',
  'Repair and retrofit service for aging structural glazing systems, including gasket replacement, sealant renewal, anchor checks, and water-tightness correction.',
  'wrench',
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title = 'Structural Glazing Repair & Retrofit');

INSERT INTO services (title, short_description, description, icon, status, created_at, updated_at)
SELECT
  'Office Glass Partition Turnkey Package',
  'Category: Interior | Base Price: 89000 | Duration: 7 days',
  'Turnkey office partition package covering layout consultation, toughened glass fabrication, patch fitting installation, and acoustic optimization for executive spaces.',
  'layout-grid',
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title = 'Office Glass Partition Turnkey Package');

INSERT INTO services (title, short_description, description, icon, status, created_at, updated_at)
SELECT
  'Annual Glass Safety Audit Program',
  'Category: Audit | Base Price: 45000 | Duration: 2 days per site',
  'Annual preventive maintenance and safety audit program for commercial properties with compliance reporting, replacement recommendations, and risk-priority matrix.',
  'clipboard-check',
  'ACTIVE',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title = 'Annual Glass Safety Audit Program');

-- -----------------------------
-- 5) Service Images
-- -----------------------------
INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&q=80&w=1200', 'Commercial Glass Facade Installation', 1, 0, NOW()
FROM services s
WHERE s.title = 'Commercial Glass Facade Installation'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200', 'Commercial Glass Facade Installation', 0, 1, NOW()
FROM services s
WHERE s.title = 'Commercial Glass Facade Installation'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', 'Commercial Glass Facade Installation', 0, 2, NOW()
FROM services s
WHERE s.title = 'Commercial Glass Facade Installation'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200', 'Frameless Shower Enclosure Solutions', 1, 0, NOW()
FROM services s
WHERE s.title = 'Frameless Shower Enclosure Solutions'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200', 'Frameless Shower Enclosure Solutions', 0, 1, NOW()
FROM services s
WHERE s.title = 'Frameless Shower Enclosure Solutions'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1616594039964-96d0f5feda79?auto=format&fit=crop&q=80&w=1200', 'Frameless Shower Enclosure Solutions', 0, 2, NOW()
FROM services s
WHERE s.title = 'Frameless Shower Enclosure Solutions'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1616594039964-96d0f5feda79?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200', 'Structural Glazing Repair & Retrofit', 1, 0, NOW()
FROM services s
WHERE s.title = 'Structural Glazing Repair & Retrofit'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1581091215367-59ab6dcef8a6?auto=format&fit=crop&q=80&w=1200', 'Structural Glazing Repair & Retrofit', 0, 1, NOW()
FROM services s
WHERE s.title = 'Structural Glazing Repair & Retrofit'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1581091215367-59ab6dcef8a6?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1581091215367-1f85f8f9e5b6?auto=format&fit=crop&q=80&w=1200', 'Structural Glazing Repair & Retrofit', 0, 2, NOW()
FROM services s
WHERE s.title = 'Structural Glazing Repair & Retrofit'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1581091215367-1f85f8f9e5b6?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200', 'Office Glass Partition Turnkey Package', 1, 0, NOW()
FROM services s
WHERE s.title = 'Office Glass Partition Turnkey Package'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', 'Office Glass Partition Turnkey Package', 0, 1, NOW()
FROM services s
WHERE s.title = 'Office Glass Partition Turnkey Package'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200', 'Office Glass Partition Turnkey Package', 0, 2, NOW()
FROM services s
WHERE s.title = 'Office Glass Partition Turnkey Package'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200', 'Annual Glass Safety Audit Program', 1, 0, NOW()
FROM services s
WHERE s.title = 'Annual Glass Safety Audit Program'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200', 'Annual Glass Safety Audit Program', 0, 1, NOW()
FROM services s
WHERE s.title = 'Annual Glass Safety Audit Program'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200');

INSERT INTO service_images (service_id, image_url, caption, is_primary, sort_order, created_at)
SELECT s.id, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200', 'Annual Glass Safety Audit Program', 0, 2, NOW()
FROM services s
WHERE s.title = 'Annual Glass Safety Audit Program'
  AND NOT EXISTS (SELECT 1 FROM service_images si WHERE si.service_id = s.id AND si.image_url = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200');

-- -----------------------------
-- 6) Sites (5)
-- -----------------------------
INSERT INTO sites (name, address, city_id, user_id, status, start_date, completion_date, description, created_at, updated_at)
SELECT
  'Orion Business Park - Tower A',
  'AB Road, Vijay Nagar Commercial District',
  (SELECT id FROM cities WHERE name = 'Indore' LIMIT 1),
  (SELECT id FROM users WHERE email = 'neha.kulkarni@toffandemo.com' LIMIT 1),
  'WORKING',
  '2026-01-12',
  NULL,
  'Facade enhancement and internal partition retrofit for a Grade-A office tower with phased execution to minimize tenant downtime.',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM sites WHERE name = 'Orion Business Park - Tower A');

INSERT INTO sites (name, address, city_id, user_id, status, start_date, completion_date, description, created_at, updated_at)
SELECT
  'Lakeview Residency Clubhouse',
  'Kolar Road Extension, Residential Sector',
  (SELECT id FROM cities WHERE name = 'Bhopal' LIMIT 1),
  (SELECT id FROM users WHERE email = 'vikram.singh@toffandemo.com' LIMIT 1),
  'WORKING',
  '2026-01-25',
  NULL,
  'Clubhouse glazing modernization including frameless entrance systems, railing glass, and acoustic lounge partitions.',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM sites WHERE name = 'Lakeview Residency Clubhouse');

INSERT INTO sites (name, address, city_id, user_id, status, start_date, completion_date, description, created_at, updated_at)
SELECT
  'Riverview Retail Arcade',
  'Freeganj Main Road, Retail Corridor',
  (SELECT id FROM cities WHERE name = 'Ujjain' LIMIT 1),
  (SELECT id FROM users WHERE email = 'neha.kulkarni@toffandemo.com' LIMIT 1),
  'COMING_SOON',
  '2026-03-01',
  NULL,
  'Upcoming retail arcade project focused on structural glazing storefronts and high-visibility display fronts.',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM sites WHERE name = 'Riverview Retail Arcade');

INSERT INTO sites (name, address, city_id, user_id, status, start_date, completion_date, description, created_at, updated_at)
SELECT
  'Shivansh Healthcare Centre',
  'Station Road Medical Zone',
  (SELECT id FROM cities WHERE name = 'Dewas' LIMIT 1),
  (SELECT id FROM users WHERE email = 'vikram.singh@toffandemo.com' LIMIT 1),
  'WORKING',
  '2025-12-10',
  NULL,
  'Healthcare-grade tempered and laminated glass package for OPD corridors, ICU view panels, and hygienic partition systems.',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM sites WHERE name = 'Shivansh Healthcare Centre');

INSERT INTO sites (name, address, city_id, user_id, status, start_date, completion_date, description, created_at, updated_at)
SELECT
  'Techline Logistics HQ',
  'Industrial Bypass, Corporate Campus',
  (SELECT id FROM cities WHERE name = 'Mhow' LIMIT 1),
  (SELECT id FROM users WHERE email = 'neha.kulkarni@toffandemo.com' LIMIT 1),
  'COMPLETED',
  '2025-10-15',
  '2026-01-30',
  'Completed corporate headquarters package including atrium glazing, staircase balustrades, and meeting room acoustic modules.',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM sites WHERE name = 'Techline Logistics HQ');

-- -----------------------------
-- 7) Site-Product and Site-Service relations
--    (This schema uses site_products for both item types)
-- -----------------------------
INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,
  'PRODUCT',
  'UltraClear Tempered Office Partition Glass',
  'Product linked for demo billing and project planning',
  120.00,
  'sq.ft',
  485.00,
  'PERCENT',
  5.00,
  18.00,
  3500.00,
  68874.00,
  0,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),
  NOW()
FROM sites s
WHERE s.name = 'Orion Business Park - Tower A'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'PRODUCT' AND sp.item_name = 'UltraClear Tempered Office Partition Glass');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'SERVICE','Commercial Glass Facade Installation','Service linked for demo billing and project planning',1.00,'lot',125000.00,'AMOUNT',5000.00,18.00,0.00,141600.00,1,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Orion Business Park - Tower A'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'SERVICE' AND sp.item_name = 'Commercial Glass Facade Installation');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'PRODUCT','Architectural Laminated Safety Glass Panel','Product linked for demo billing and project planning',90.00,'sq.ft',640.00,'PERCENT',3.00,18.00,2500.00,68525.60,0,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Lakeview Residency Clubhouse'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'PRODUCT' AND sp.item_name = 'Architectural Laminated Safety Glass Panel');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'SERVICE','Frameless Shower Enclosure Solutions','Service linked for demo billing and project planning',1.00,'lot',32000.00,'AMOUNT',0.00,18.00,0.00,37760.00,1,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Lakeview Residency Clubhouse'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'SERVICE' AND sp.item_name = 'Frameless Shower Enclosure Solutions');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'PRODUCT','Stainless Steel Spider Fitting Assembly','Product linked for demo billing and project planning',65.00,'nos',3925.00,'PERCENT',2.50,18.00,1800.00,291539.38,0,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Riverview Retail Arcade'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'PRODUCT' AND sp.item_name = 'Stainless Steel Spider Fitting Assembly');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'SERVICE','Structural Glazing Repair & Retrofit','Service linked for demo billing and project planning',1.00,'lot',58000.00,'AMOUNT',3000.00,18.00,0.00,64900.00,1,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Riverview Retail Arcade'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'SERVICE' AND sp.item_name = 'Structural Glazing Repair & Retrofit');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'PRODUCT','Acoustic Insulated Double-Glazed Unit','Product linked for demo billing and project planning',150.00,'sq.ft',850.00,'PERCENT',4.00,18.00,4500.00,146148.00,0,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Shivansh Healthcare Centre'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'PRODUCT' AND sp.item_name = 'Acoustic Insulated Double-Glazed Unit');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'SERVICE','Office Glass Partition Turnkey Package','Service linked for demo billing and project planning',1.00,'lot',89000.00,'AMOUNT',0.00,18.00,0.00,105020.00,1,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Shivansh Healthcare Centre'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'SERVICE' AND sp.item_name = 'Office Glass Partition Turnkey Package');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'PRODUCT','UltraClear Tempered Office Partition Glass','Product linked for demo billing and project planning',80.00,'sq.ft',485.00,'PERCENT',2.00,18.00,2200.00,46906.40,0,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Techline Logistics HQ'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'PRODUCT' AND sp.item_name = 'UltraClear Tempered Office Partition Glass');

INSERT INTO site_products (site_id, item_type, item_name, description, quantity, unit, price, discount_type, discount_value, vat_percent, delivery_charge, total, sort_order, created_by, updated_by, created_at, updated_at)
SELECT
  s.id,'SERVICE','Annual Glass Safety Audit Program','Service linked for demo billing and project planning',1.00,'lot',45000.00,'AMOUNT',0.00,18.00,0.00,53100.00,1,
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'aarav.mehta@toffandemo.com' LIMIT 1),
  NOW(),NOW()
FROM sites s
WHERE s.name = 'Techline Logistics HQ'
  AND NOT EXISTS (SELECT 1 FROM site_products sp WHERE sp.site_id = s.id AND sp.item_type = 'SERVICE' AND sp.item_name = 'Annual Glass Safety Audit Program');

-- -----------------------------
-- 8) Inquiries (5)
-- -----------------------------
INSERT INTO inquiries (name, email, mobile, message, city_id, status, assigned_to, created_at, updated_at)
SELECT
  'Rohan Bansal',
  'rohan.bansal@orioninfra.in',
  '9713002101',
  'Subject: Glass Partition Quote for 5 Floors\n\nWe are finalizing interiors for five office floors and need a turnkey quotation for frameless partitions, patch fittings, and installation timelines.',
  (SELECT id FROM cities WHERE name = 'Indore' LIMIT 1),
  'NEW',
  (SELECT id FROM users WHERE email = 'ritika.sharma@toffandemo.com' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM inquiries WHERE email = 'rohan.bansal@orioninfra.in');

INSERT INTO inquiries (name, email, mobile, message, city_id, status, assigned_to, created_at, updated_at)
SELECT
  'Pooja Nair',
  'pooja.nair@lakeviewresidency.in',
  '9713002102',
  'Subject: Clubhouse Facade Upgrade\n\nPlease share a proposal for replacing existing facade panels with laminated safety glass and a preventive maintenance plan for one year.',
  (SELECT id FROM cities WHERE name = 'Bhopal' LIMIT 1),
  'NEW',
  (SELECT id FROM users WHERE email = 'ritika.sharma@toffandemo.com' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM inquiries WHERE email = 'pooja.nair@lakeviewresidency.in');

INSERT INTO inquiries (name, email, mobile, message, city_id, status, assigned_to, created_at, updated_at)
SELECT
  'Siddharth Rao',
  'siddharth.rao@riverviewretail.in',
  '9713002103',
  'Subject: Storefront Structural Glazing\n\nWe require structural glazing for 18 retail units with staggered handover; please confirm lead time, warranty terms, and project supervision model.',
  (SELECT id FROM cities WHERE name = 'Ujjain' LIMIT 1),
  'NEW',
  (SELECT id FROM users WHERE email = 'karan.verma@toffandemo.com' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM inquiries WHERE email = 'siddharth.rao@riverviewretail.in');

INSERT INTO inquiries (name, email, mobile, message, city_id, status, assigned_to, created_at, updated_at)
SELECT
  'Ananya Joshi',
  'ananya.joshi@shivanshhealth.org',
  '9713002104',
  'Subject: Healthcare Safety Glass Compliance\n\nKindly advise suitable laminated and tempered solutions for hospital corridors and ICU view panels with IS-standard compliance documents.',
  (SELECT id FROM cities WHERE name = 'Dewas' LIMIT 1),
  'NEW',
  (SELECT id FROM users WHERE email = 'karan.verma@toffandemo.com' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM inquiries WHERE email = 'ananya.joshi@shivanshhealth.org');

INSERT INTO inquiries (name, email, mobile, message, city_id, status, assigned_to, created_at, updated_at)
SELECT
  'Manish Tiwari',
  'manish.tiwari@techlineglobal.com',
  '9713002105',
  'Subject: Annual Safety Audit Contract\n\nWe are inviting bids for annual glass and hardware safety audits across our HQ building. Please include scope, SLA, and pricing slabs.',
  (SELECT id FROM cities WHERE name = 'Mhow' LIMIT 1),
  'NEW',
  (SELECT id FROM users WHERE email = 'ritika.sharma@toffandemo.com' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM inquiries WHERE email = 'manish.tiwari@techlineglobal.com');

-- -----------------------------
-- 9) Payments (with invoice references)
--    Status mix: PAID / PARTIALLY_PAID / UNPAID
-- -----------------------------
INSERT INTO payments (site_id, customer_id, product_name, amount, paid_amount, balance_amount, payment_date, status, payment_method, transaction_id, notes, bill_number, created_at, updated_at)
SELECT
  (SELECT id FROM sites WHERE name = 'Orion Business Park - Tower A' LIMIT 1),
  (SELECT id FROM users WHERE email = 'neha.kulkarni@toffandemo.com' LIMIT 1),
  'Commercial Glass Facade Installation',
  420000.00,
  420000.00,
  0.00,
  '2026-02-08',
  'PAID',
  'Bank Transfer',
  'UTR9865123001',
  'Milestone-1 completed and fully settled.',
  'BILL-2026-D001',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE bill_number = 'BILL-2026-D001');

INSERT INTO payments (site_id, customer_id, product_name, amount, paid_amount, balance_amount, payment_date, status, payment_method, transaction_id, notes, bill_number, created_at, updated_at)
SELECT
  (SELECT id FROM sites WHERE name = 'Lakeview Residency Clubhouse' LIMIT 1),
  (SELECT id FROM users WHERE email = 'vikram.singh@toffandemo.com' LIMIT 1),
  'Frameless Shower Enclosure Solutions',
  180000.00,
  95000.00,
  85000.00,
  '2026-02-11',
  'PARTIALLY_PAID',
  'UPI',
  'UPI2402115567',
  'Advance + first execution milestone cleared.',
  'BILL-2026-D002',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE bill_number = 'BILL-2026-D002');

INSERT INTO payments (site_id, customer_id, product_name, amount, paid_amount, balance_amount, payment_date, status, payment_method, transaction_id, notes, bill_number, created_at, updated_at)
SELECT
  (SELECT id FROM sites WHERE name = 'Riverview Retail Arcade' LIMIT 1),
  (SELECT id FROM users WHERE email = 'neha.kulkarni@toffandemo.com' LIMIT 1),
  'Structural Glazing Repair & Retrofit',
  260000.00,
  0.00,
  260000.00,
  '2026-02-15',
  'UNPAID',
  'Cheque',
  'CHQ001876',
  'Invoice generated, payment awaited.',
  'BILL-2026-D003',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE bill_number = 'BILL-2026-D003');

INSERT INTO payments (site_id, customer_id, product_name, amount, paid_amount, balance_amount, payment_date, status, payment_method, transaction_id, notes, bill_number, created_at, updated_at)
SELECT
  (SELECT id FROM sites WHERE name = 'Shivansh Healthcare Centre' LIMIT 1),
  (SELECT id FROM users WHERE email = 'vikram.singh@toffandemo.com' LIMIT 1),
  'Office Glass Partition Turnkey Package',
  315000.00,
  315000.00,
  0.00,
  '2026-02-06',
  'PAID',
  'Cash',
  'CASH-REC-2241',
  'Full payment received at completion stage.',
  'BILL-2026-D004',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE bill_number = 'BILL-2026-D004');

INSERT INTO payments (site_id, customer_id, product_name, amount, paid_amount, balance_amount, payment_date, status, payment_method, transaction_id, notes, bill_number, created_at, updated_at)
SELECT
  (SELECT id FROM sites WHERE name = 'Techline Logistics HQ' LIMIT 1),
  (SELECT id FROM users WHERE email = 'neha.kulkarni@toffandemo.com' LIMIT 1),
  'Annual Glass Safety Audit Program',
  120000.00,
  45000.00,
  75000.00,
  '2026-02-18',
  'PARTIALLY_PAID',
  'Bank Transfer',
  'UTR9865123099',
  'Retainer received; balance due after quarterly audit.',
  'BILL-2026-D005',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE bill_number = 'BILL-2026-D005');

-- -----------------------------
-- 10) About page content
-- -----------------------------
UPDATE content_pages
SET
  title = 'About Toffan Glass Solutions',
  content = '<p>Toffan Glass Solutions delivers engineered glazing and architectural hardware systems for commercial, residential, and institutional projects across Central India.</p><p><strong>Mission:</strong> To provide safe, precise, and durable glass solutions with transparent execution and measurable project accountability.</p><p><strong>Vision:</strong> To become the most trusted regional partner for integrated glass design, fabrication, and lifecycle maintenance services.</p><p><strong>Core Values:</strong> Safety First, Engineering Discipline, Client Transparency, On-Time Delivery, Continuous Innovation.</p>',
  meta_description = 'Corporate profile, mission, vision, and core values of Toffan Glass Solutions.',
  is_active = 1,
  updated_at = NOW()
WHERE page_name = 'about_us';

INSERT INTO content_pages (page_name, title, content, meta_description, is_active, created_at, updated_at)
SELECT
  'about_us',
  'About Toffan Glass Solutions',
  '<p>Toffan Glass Solutions delivers engineered glazing and architectural hardware systems for commercial, residential, and institutional projects across Central India.</p><p><strong>Mission:</strong> To provide safe, precise, and durable glass solutions with transparent execution and measurable project accountability.</p><p><strong>Vision:</strong> To become the most trusted regional partner for integrated glass design, fabrication, and lifecycle maintenance services.</p><p><strong>Core Values:</strong> Safety First, Engineering Discipline, Client Transparency, On-Time Delivery, Continuous Innovation.</p>',
  'Corporate profile, mission, vision, and core values of Toffan Glass Solutions.',
  1,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE page_name = 'about_us');

INSERT INTO content_page_images (content_page_id, image_url, caption, is_primary, created_at)
SELECT cp.id, 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=1200', 'Corporate manufacturing and project excellence', 1, NOW()
FROM content_pages cp
WHERE cp.page_name = 'about_us'
  AND NOT EXISTS (
    SELECT 1 FROM content_page_images cpi
    WHERE cpi.content_page_id = cp.id
      AND cpi.image_url = 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=1200'
  );

-- -----------------------------
-- 11) Contact page content
-- -----------------------------
UPDATE content_pages
SET
  title = 'Contact Toffan Glass Solutions',
  content = '<p>Head Office: Plot 18, Industrial Growth Centre, Vijay Nagar, Indore, Madhya Pradesh 452010.</p><p>Working Hours: Monday to Saturday, 9:30 AM - 7:00 PM.</p><p>Email: corporate@toffanglass.com | Phone: +91 731 428 6600.</p>',
  meta_description = 'Contact details and office information for Toffan Glass Solutions.',
  is_active = 1,
  updated_at = NOW()
WHERE page_name = 'contact_us';

INSERT INTO content_pages (page_name, title, content, meta_description, is_active, created_at, updated_at)
SELECT
  'contact_us',
  'Contact Toffan Glass Solutions',
  '<p>Head Office: Plot 18, Industrial Growth Centre, Vijay Nagar, Indore, Madhya Pradesh 452010.</p><p>Working Hours: Monday to Saturday, 9:30 AM - 7:00 PM.</p><p>Email: corporate@toffanglass.com | Phone: +91 731 428 6600.</p>',
  'Contact details and office information for Toffan Glass Solutions.',
  1,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE page_name = 'contact_us');

INSERT INTO contacts (type, contact_value, label, is_primary, is_active, order_priority, created_at, updated_at)
SELECT 'address', 'Plot 18, Industrial Growth Centre, Vijay Nagar, Indore, Madhya Pradesh 452010', 'Head Office', 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE type = 'address' AND contact_value = 'Plot 18, Industrial Growth Centre, Vijay Nagar, Indore, Madhya Pradesh 452010');

INSERT INTO contacts (type, contact_value, label, is_primary, is_active, order_priority, created_at, updated_at)
SELECT 'phone', '+91 731 428 6600', 'Corporate Office', 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE type = 'phone' AND contact_value = '+91 731 428 6600');

INSERT INTO contacts (type, contact_value, label, is_primary, is_active, order_priority, created_at, updated_at)
SELECT 'email', 'corporate@toffanglass.com', 'Corporate Email', 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE type = 'email' AND contact_value = 'corporate@toffanglass.com');

INSERT INTO contacts (type, contact_value, label, is_primary, is_active, order_priority, created_at, updated_at)
SELECT 'working_hours', 'Monday to Saturday, 9:30 AM - 7:00 PM', 'Working Hours', 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE type = 'working_hours' AND contact_value = 'Monday to Saturday, 9:30 AM - 7:00 PM');

INSERT INTO contacts (type, contact_value, label, is_primary, is_active, order_priority, created_at, updated_at)
SELECT 'map_url', 'https://maps.google.com/?q=Vijay+Nagar+Indore', 'Google Map', 1, 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE type = 'map_url' AND contact_value = 'https://maps.google.com/?q=Vijay+Nagar+Indore');

INSERT INTO contacts (type, contact_value, label, is_primary, is_active, order_priority, created_at, updated_at)
SELECT 'social_media', 'https://www.facebook.com/toffanglass', 'Facebook', 0, 1, 2, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE type = 'social_media' AND contact_value = 'https://www.facebook.com/toffanglass');

INSERT INTO contacts (type, contact_value, label, is_primary, is_active, order_priority, created_at, updated_at)
SELECT 'social_media', 'https://www.linkedin.com/company/toffan-glass-hardware', 'LinkedIn', 0, 1, 3, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE type = 'social_media' AND contact_value = 'https://www.linkedin.com/company/toffan-glass-hardware');

COMMIT;
