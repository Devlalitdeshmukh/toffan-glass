-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 22, 2026 at 05:06 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `toffan_glass`
--

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'India',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cities`
--

INSERT INTO `cities` (`id`, `name`, `state`, `country`, `created_at`) VALUES
(1, 'Indore', 'Madhya Pradesh', 'India', '2026-02-11 10:21:16'),
(2, 'Bhopal', 'Madhya Pradesh', 'India', '2026-02-11 10:21:16'),
(3, 'Ujjain', 'Madhya Pradesh', 'India', '2026-02-11 10:21:16'),
(4, 'Dewas', 'Madhya Pradesh', 'India', '2026-02-11 10:21:16'),
(5, 'Mhow', 'Madhya Pradesh', 'India', '2026-02-11 10:21:16');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `contact_value` text NOT NULL,
  `label` varchar(100) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `order_priority` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `type`, `contact_value`, `label`, `is_primary`, `is_active`, `order_priority`, `created_at`, `updated_at`) VALUES
(1, 'phone', '+91 98765 43210', 'Office Phone', 0, 1, 1, '2026-02-10 15:01:28', '2026-02-20 09:01:49'),
(2, 'email', 'info@toffanglass.com', 'General Enquiries', 0, 1, 1, '2026-02-11 05:20:45', '2026-02-20 09:01:49'),
(3, 'address', '123 Industrial Area, Vijay Nagar, Indore, MP 452010', 'Head Office', 0, 1, 1, '2026-02-11 05:20:58', '2026-02-20 09:01:49'),
(4, 'other', 'Value', 'Label', 0, 1, 1, '2026-02-11 07:41:37', '2026-02-11 07:41:37'),
(5, 'address', 'Plot 18, Industrial Growth Centre, Vijay Nagar, Indore, Madhya Pradesh 452010', 'Head Office', 1, 1, 1, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(6, 'phone', '+91 731 428 6600', 'Corporate Office', 1, 1, 1, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(7, 'email', 'corporate@toffanglass.com', 'Corporate Email', 1, 1, 1, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(8, 'working_hours', 'Monday to Saturday, 9:30 AM - 7:00 PM', 'Working Hours', 1, 1, 1, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(9, 'map_url', 'https://maps.google.com/?q=Vijay+Nagar+Indore', 'Google Map', 1, 1, 1, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(10, 'social_media', 'https://www.facebook.com/toffanglass', 'Facebook', 0, 1, 2, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(11, 'social_media', 'https://www.linkedin.com/company/toffan-glass-hardware', 'LinkedIn', 0, 1, 3, '2026-02-20 09:01:49', '2026-02-20 09:01:49');

-- --------------------------------------------------------

--
-- Table structure for table `content_pages`
--

CREATE TABLE `content_pages` (
  `id` int(11) NOT NULL,
  `page_name` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `content_pages`
--

INSERT INTO `content_pages` (`id`, `page_name`, `title`, `content`, `meta_description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'about_us', 'About Vishvesh Glasses (Reference Extract)', '\n<p>The venture, \"Vishesh Glasses Private Limited,\" was incorporated in 2006, with roots across three generations of Sitlanis and earlier operations under the name \"Asian Mirrors.\" The company built deep market trust in Ahmedabad through specialization in mirrors before expanding into a broader glass portfolio.</p>\n<p>To meet modern market expectations, Vishvesh Glasses upgraded and modernized operations, and today operates as a producer, supplier, distributor, wholesaler, and trader of a comprehensive range of glass products.</p>\n<p>With in-house production units and spacious warehousing capabilities, the business maintains product quality for extended periods and supports urgent fulfillment requirements for clients across projects.</p>\n<p><strong>Focus Today:</strong> Modernization of manufacturing and delivery, product-level customization, innovation-driven solutions, and quality-first execution within practical customer budgets.</p>\n<p><strong>Vision:</strong> To be one of India’s most innovative and reputed glass processing and distribution companies through internationally aligned systems and continuous expansion.</p>\n<p><strong>Mission:</strong></p>\n<ul>\n  <li>Bring global glass-industry technology benefits to customers.</li>\n  <li>Provide complete glass solutions from concept to realization.</li>\n  <li>Set benchmark service standards for customers.</li>\n  <li>Expand capability in glass engineering and execution quality.</li>\n  <li>Support eco-friendly adoption and responsible material use.</li>\n</ul>\n<p><strong>USP:</strong> Timely delivery with consistent quality irrespective of order size or project value, plus reliable post-installation support and long-term service commitment.</p>\n', 'About section content extracted from vishveshglasses.com for reference demo data.', 1, '2026-02-11 10:21:16', '2026-02-20 10:05:15'),
(2, 'contact_us', 'Contact Toffan Glass & Hardware', '<p>Head Office: Plot 18, Industrial Growth Centre, Vijay Nagar, Indore, Madhya Pradesh 452010.</p><p>Working Hours: Monday to Saturday, 9:30 AM - 7:00 PM.</p><p>Email: corporate@toffanglass.com | Phone: +91 731 428 6600.</p>', 'Contact details and office information for Toffan Glass & Hardware Solutions.', 1, '2026-02-11 10:21:16', '2026-02-20 09:36:12'),
(3, 'services', 'Architectural Glass Services', '<p>Toffan Glass & Hardware Solutions offers a comprehensive suite of professional services tailored for architectural excellence. Our expertise spans from initial design consultation to precision installation and ongoing maintenance. We pride ourselves on delivering solutions that integrate safety, functionality, and modern aesthetics.</p>\r\n      <p>Our commitment to quality is evident in every project we undertake. Whether it is a high-rise commercial facade using structural spider fittings or a luxury residential shower enclosure, we bring the same level of precision and engineering excellence. We utilize state-of-the-art cutting, polishing, and toughening technologies to ensure that every pane of glass meets rigorous safety standards.</p>\r\n      <p>In addition to fabrication and supply, our team of certified installers ensures that every piece of hardware—from hydraulic floor springs to smart glass tracks—is fitted to perfection. We understand the nuances of architectural hardware and provide expert guidance to architects and developers across Madhya Pradesh to choose the right materials for their unique structural requirements.</p>', 'Explore our professional glass installation, facade engineering, and hardware consulting services for high-end projects in MP.', 1, '2026-02-11 10:21:16', '2026-02-20 12:07:00'),
(4, 'privacy_policy', 'Privacy Policy', 'A website’s privacy policy outlines if and how you collect, use, share, or sell your visitors’ personal information and is required under data privacy laws.\r\n\r\nUsing a privacy policy template helps jump-start the process of making one of these essential legal documents for your site.\r\n\r\nBelow, I walk you through how to download and use our free privacy policy template and explain what a privacy policy is and why it’s important for all websites to have one.\r\n\r\nKey Takeaways\r\n\r\nHere’s a summary of how to use a privacy policy template:\r\n\r\nA privacy policy template gives you a head start making a transparent privacy policy for your business\r\nTo use it, fill in the blank sections with details about how you process data.\r\nEnsure to include clauses as required by applicable privacy laws impacting you.', 'Here’s a summary of how to use a privacy policy template:', 1, '2026-02-20 11:25:59', '2026-02-20 11:57:37'),
(5, 'products_page', 'Premium Products', 'Architectural-grade materials for high-end developments across Madhya Pradesh. BIS certified solutions since 2010.', 'Architectural-grade materials for high-end developments across Madhya Pradesh. BIS certified solutions since 2010.', 1, '2026-02-20 12:29:05', '2026-02-20 12:31:19'),
(6, 'home', 'Precision Glass Solutions For Modern Architecture', 'We design, fabricate, and install premium glass and hardware systems for commercial, residential, and industrial projects with uncompromising quality standards.', 'We design, fabricate, and install premium glass and hardware systems for commercial, residential, and industrial projects with uncompromising quality standards.', 1, '2026-02-20 12:45:42', '2026-02-20 12:46:53');

-- --------------------------------------------------------

--
-- Table structure for table `content_page_images`
--

CREATE TABLE `content_page_images` (
  `id` int(11) NOT NULL,
  `content_page_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `content_page_images`
--

INSERT INTO `content_page_images` (`id`, `content_page_id`, `image_url`, `caption`, `is_primary`, `created_at`) VALUES
(10, 1, 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=1200', 'Corporate manufacturing and project excellence', 1, '2026-02-20 09:01:49'),
(11, 1, 'https://vishveshglasses.com/wp-content/uploads/2022/05/about02-1.jpg', 'About section image from vishveshglasses.com', 1, '2026-02-20 10:05:15'),
(12, 1, 'https://vishveshglasses.com/wp-content/uploads/2022/05/about01-1-1.jpg', 'About section image from vishveshglasses.com', 0, '2026-02-20 10:05:15'),
(13, 1, 'https://vishveshglasses.com/wp-content/uploads/2022/05/about03-2.jpg', 'About section image from vishveshglasses.com', 0, '2026-02-20 10:05:15'),
(14, 4, '/uploads/content-page-images/1771588657357-445714996.jpeg', '', 0, '2026-02-20 11:57:37'),
(15, 3, '/uploads/content-page-images/1771589220945-965082027.jpeg', '', 0, '2026-02-20 12:07:00'),
(17, 5, '/uploads/content-page-images/1771590679957-365374961.jpeg', '', 0, '2026-02-20 12:31:19'),
(18, 6, '/uploads/content-page-images/1771591542506-228823166.jpeg', '', 0, '2026-02-20 12:45:42');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `city_id` int(11) DEFAULT NULL,
  `status` enum('NEW','IN_PROGRESS','RESOLVED','CLOSED') DEFAULT 'NEW',
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `name`, `email`, `mobile`, `message`, `city_id`, `status`, `assigned_to`, `created_at`, `updated_at`) VALUES
(1, 'Lalit Deshmukh', 'lalit.deshmukh@hgr.in', '6547893214', 'Message', NULL, 'IN_PROGRESS', NULL, '2026-02-11 11:49:19', '2026-02-11 14:02:25'),
(2, 'Rohan Bansal', 'rohan.bansal@orioninfra.in', '9713002101', 'Subject: Glass Partition Quote for 5 Floors\n\nWe are finalizing interiors for five office floors and need a turnkey quotation for frameless partitions, patch fittings, and installation timelines.', 1, 'IN_PROGRESS', 6, '2026-02-20 09:01:49', '2026-02-20 10:51:26'),
(3, 'Pooja Nair', 'pooja.nair@lakeviewresidency.in', '9713002102', 'Subject: Clubhouse Facade Upgrade\n\nPlease share a proposal for replacing existing facade panels with laminated safety glass and a preventive maintenance plan for one year.', 2, 'CLOSED', 6, '2026-02-20 09:01:49', '2026-02-20 10:51:28'),
(4, 'Siddharth Rao', 'siddharth.rao@riverviewretail.in', '9713002103', 'Subject: Storefront Structural Glazing\n\nWe require structural glazing for 18 retail units with staggered handover; please confirm lead time, warranty terms, and project supervision model.', 3, 'RESOLVED', 6, '2026-02-20 09:01:49', '2026-02-20 10:51:31'),
(5, 'Ananya Joshi', 'ananya.joshi@shivanshhealth.org', '9713002104', 'Subject: Healthcare Safety Glass Compliance\n\nKindly advise suitable laminated and tempered solutions for hospital corridors and ICU view panels with IS-standard compliance documents.', 4, 'NEW', 6, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(6, 'Manish Tiwari', 'manish.tiwari@techlineglobal.com', '9713002105', 'Subject: Annual Safety Audit Contract\n\nWe are inviting bids for annual glass and hardware safety audits across our HQ building. Please include scope, SLA, and pricing slabs.', 5, 'NEW', 6, '2026-02-20 09:01:49', '2026-02-20 09:01:49');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) DEFAULT 0.00,
  `balance_amount` decimal(12,2) DEFAULT 0.00,
  `payment_date` date DEFAULT NULL,
  `status` enum('PAID','UNPAID','PARTIALLY_PAID','OUTSTANDING') DEFAULT 'UNPAID',
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `receipt_url` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `bill_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `site_id`, `customer_id`, `product_name`, `amount`, `paid_amount`, `balance_amount`, `payment_date`, `status`, `payment_method`, `transaction_id`, `receipt_url`, `notes`, `bill_number`, `created_at`, `updated_at`) VALUES
(1, 5, 4, 'Multiple Items', 82345.00, 70000.00, 12345.00, '2026-02-20', 'PARTIALLY_PAID', 'ONLINE', '551141111', '/uploads/payment-receipts/receipt-1771506207449-201476758.pdf', '{\"__paymentMeta\":true,\"notes\":\"Notes\",\"lineItems\":[{\"rowKey\":\"pay-row-1771506100407-c86eaa908f4c5\",\"type\":\"PRODUCT\",\"itemName\":\"Frameless Glass Spider Connector\",\"description\":\"Four-way spider fitting for modern glass facades. This fitting allows for point-fixed architectural glazing, creating seamless curtains of glass for malls, hotels, and luxury showrooms. Marine-grade SS 316 ensures it withstands harsh weather conditions.\",\"quantity\":10,\"unit\":\"Nos\",\"price\":5000,\"discountType\":\"AMOUNT\",\"discountValue\":500,\"vatPercent\":10,\"deliveryCharge\":1500,\"total\":55950},{\"rowKey\":\"pay-row-1771506118083-3d4eab88e6b6b8\",\"type\":\"PRODUCT\",\"itemName\":\"Laminated Acoustic Glass\",\"description\":\"Designed for quiet environments, our laminated acoustic glass uses a specialized PVB interlayer to dampen sound vibrations. Perfect for meeting rooms near high-traffic areas or residential homes facing busy streets. Provides safety and silence in one package.\",\"quantity\":10,\"unit\":\"Nos\",\"price\":2500,\"discountType\":\"AMOUNT\",\"discountValue\":100,\"vatPercent\":5,\"deliveryCharge\":250,\"total\":26395}],\"totals\":{\"subtotal\":75000,\"discount\":600,\"vat\":6195,\"delivery\":1750,\"grandTotal\":82345}}', 'BILL-2026-0001', '2026-02-19 13:03:27', '2026-02-19 13:03:27'),
(2, 6, 8, 'Commercial Glass Facade Installation', 420000.00, 420000.00, 0.00, '2026-02-08', 'PAID', 'Bank Transfer', 'UTR9865123001', NULL, 'Milestone-1 completed and fully settled.', 'BILL-2026-D001', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(3, 7, 9, 'Frameless Shower Enclosure Solutions', 180000.00, 95000.00, 85000.00, '2026-02-11', 'PARTIALLY_PAID', 'UPI', 'UPI2402115567', NULL, 'Advance + first execution milestone cleared.', 'BILL-2026-D002', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(4, 8, 8, 'Structural Glazing Repair & Retrofit', 260000.00, 0.00, 260000.00, '2026-02-15', 'UNPAID', 'Cheque', 'CHQ001876', NULL, 'Invoice generated, payment awaited.', 'BILL-2026-D003', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(5, 9, 9, 'Office Glass Partition Turnkey Package', 315000.00, 315000.00, 0.00, '2026-02-06', 'PAID', 'Cash', 'CASH-REC-2241', NULL, 'Full payment received at completion stage.', 'BILL-2026-D004', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(6, 10, 8, 'Annual Glass Safety Audit Program', 120000.00, 45000.00, 75000.00, '2026-02-18', 'PARTIALLY_PAID', 'Bank Transfer', 'UTR9865123099', NULL, 'Retainer received; balance due after quarterly audit.', 'BILL-2026-D005', '2026-02-20 09:01:49', '2026-02-20 09:01:49');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `description`, `price`, `stock`, `specifications`, `created_at`, `updated_at`) VALUES
(3, 'Frameless Glass Spider Connector', 'Hardware', 'Four-way spider fitting for modern glass facades. This fitting allows for point-fixed architectural glazing, creating seamless curtains of glass for malls, hotels, and luxury showrooms. Marine-grade SS 316 ensures it withstands harsh weather conditions.', 3800.00, 45, '{\"Type\": \"4-Way Spider\", \"Finish\": \"Satin/Mirror\", \"Material\": \"SS 316\", \"Application\": \"Structural Facades\", \"Load Bearing\": \"Heavy Duty\"}', '2026-02-11 13:56:01', '2026-02-11 13:56:01'),
(4, 'Laminated Acoustic Glass', 'Glass', 'Designed for quiet environments, our laminated acoustic glass uses a specialized PVB interlayer to dampen sound vibrations. Perfect for meeting rooms near high-traffic areas or residential homes facing busy streets. Provides safety and silence in one package.', 350.00, 600, '{\"Safety\": \"Class A Laminated\", \"Max Size\": \"2440 x 3660 mm\", \"Composition\": \"6mm + 1.52 PVB + 6mm\", \"UV Protection\": \"99%\", \"Sound Reduction\": \"38dB\"}', '2026-02-11 13:56:01', '2026-02-11 13:56:01'),
(5, 'Glass Railing Patch Fitting', 'Hardware', 'Compact and elegant glass-to-glass patch fitting for staircases and balconies. The brushed satin finish provides a sophisticated look while the high-tensile body ensures the safety of your glass railing system. Easy to install and adjust.', 1450.00, 200, '{\"Finish\": \"Satin Nickel\", \"Material\": \"Aluminium/SS\", \"Mounting\": \"Side/Bottom\", \"Application\": \"Staircase Railings\", \"Glass Thickness\": \"10mm - 12mm\"}', '2026-02-11 13:56:01', '2026-02-11 13:56:01'),
(6, 'Reflective Blue Solar Glass', 'Glass', 'Energy-efficient reflective glass that reduces heat gain inside buildings. The stunning blue tint provides privacy during the day while maintaining a clear view from the inside. Highly recommended for commercial facades in hot climates.', 280.00, 800, '{\"SHGC\": \"0.45\", \"U-Value\": \"5.8\", \"Thickness\": \"6mm\", \"Processing\": \"Tempering Optional\", \"Light Transmission\": \"30%\"}', '2026-02-11 13:56:01', '2026-02-11 13:56:01'),
(7, 'Automatic Sliding Door Motor', 'Hardware', 'Intelligent automatic sliding door system for retail and hospitals. Equipped with high-sensitivity motion sensors and an emergency fail-safe mechanism. Compatible with glass doors up to 150kg per leaf.', 45000.00, 12, '{\"Drive\": \"Brushless DC Motor\", \"Speed\": \"Adjustable 10-50 cm/s\", \"Voltage\": \"220V\", \"Noise Level\": \"<55dB\", \"Sensor Range\": \"Up to 3m\"}', '2026-02-11 13:56:01', '2026-02-11 13:56:01'),
(8, 'Frosted Satin Etched Glass', 'Glass', 'Achieve a sophisticated look for partitions and bathroom doors with our satin etched glass. Unlike sandblasted glass, the satin finish is smooth to the touch and resistant to fingerprints. Provides excellent light diffusion and privacy.', 220.00, 500, '{\"Finish\": \"Acid Etched / Satin\", \"Safety\": \"Toughenable\", \"Clarity\": \"Translucent\", \"Thickness\": \"8mm, 10mm, 12mm\", \"Maintenance\": \"Low / Fingerprint Resistant\"}', '2026-02-11 13:56:01', '2026-02-11 13:56:01'),
(11, 'UltraClear Tempered Office Partition Glass', 'Glass', '12mm ultra-clear tempered glass engineered for premium office partitions with high optical clarity, low distortion, and impact-safe performance for commercial interiors.', 485.00, 320, '{\"finish\": \"Low-Iron / Tempered\", \"status\": \"ACTIVE\", \"sku_code\": \"TG-OFF-UC-12MM-001\", \"warranty\": \"12 months\", \"gst_percent\": 18}', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(12, 'Architectural Laminated Safety Glass Panel', 'Glass', 'Laminated safety glass panel designed for facade and staircase applications, combining structural integrity, acoustic damping, and enhanced post-breakage retention.', 640.00, 210, '{\"finish\": \"Low-Iron / Tempered\", \"status\": \"ACTIVE\", \"sku_code\": \"TG-LAM-SAFE-001\", \"warranty\": \"12 months\", \"gst_percent\": 18}', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(13, 'Heavy-Duty Hydraulic Floor Spring Kit', 'Hardware', 'Commercial-grade floor spring kit for frameless glass doors with adjustable closing speed, high cycle durability, and corrosion-resistant stainless-steel housing.', 5250.00, 95, '{\"finish\": \"SS 304 / Powder Coated\", \"status\": \"ACTIVE\", \"sku_code\": \"HW-FLOOR-SPR-001\", \"warranty\": \"12 months\", \"gst_percent\": 18}', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(14, 'Stainless Steel Spider Fitting Assembly', 'Hardware', 'Precision-machined SS-316 spider fitting assembly for point-fixed glazing systems in malls, airports, and contemporary glass facades.', 3925.00, 140, '{\"finish\": \"SS 304 / Powder Coated\", \"status\": \"ACTIVE\", \"sku_code\": \"HW-SPIDER-ASSY-001\", \"warranty\": \"12 months\", \"gst_percent\": 18}', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(15, 'Acoustic Insulated Double-Glazed Unit', 'Glass', 'High-performance insulated unit combining thermal efficiency with acoustic control, ideal for boardrooms, hospitals, and high-traffic urban properties.', 850.00, 175, '{\"finish\": \"Low-Iron / Tempered\", \"status\": \"ACTIVE\", \"sku_code\": \"TG-DGU-ACOUSTIC-001\", \"warranty\": \"12 months\", \"gst_percent\": 18}', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(16, 'Micra I', 'Glass Systems', 'Vishvesh Glasses offers standard single glazed windows and frameless glass partition walls in Ahmedabad, Gujarat. Explore high-quality glass solutions for residential and commercial spaces.', 1250.00, 40, '{\"source_url\": \"https://vishveshglasses.com/products/micra-1/\", \"scraped_from\": \"vishveshglasses.com\"}', '2026-02-20 10:05:15', '2026-02-20 10:05:15'),
(17, 'Micra II', 'Glass Systems', 'Frameless double glazed window partition solution designed for modern architectural and commercial space planning.', 1450.00, 35, '{\"source_url\": \"https://vishveshglasses.com/products/micra-ii/\", \"scraped_from\": \"vishveshglasses.com\"}', '2026-02-20 10:05:15', '2026-02-20 10:05:15'),
(18, 'Omega', 'Partition Systems', 'Wall modular adjustable partition system for flexible workspace and interior configurations.', 1890.00, 28, '{\"source_url\": \"https://vishveshglasses.com/products/omega/\", \"scraped_from\": \"vishveshglasses.com\"}', '2026-02-20 10:05:15', '2026-02-20 10:05:15'),
(19, 'Cronos', 'Wardrobe Systems', 'Sliding custom wardrobe design profile from Vishvesh Glasses catalogue for premium interior applications.', 2100.00, 24, '{\"source_url\": \"https://vishveshglasses.com/products/cronos/\", \"scraped_from\": \"vishveshglasses.com\"}', '2026-02-20 10:05:15', '2026-02-20 10:05:15'),
(20, 'Helios', 'Wardrobe Systems', 'Sliding wardrobe system available in multiple design styles and finishes for residential interiors.', 2050.00, 26, '{\"source_url\": \"https://vishveshglasses.com/products/helios/\", \"scraped_from\": \"vishveshglasses.com\"}', '2026-02-20 10:05:15', '2026-02-20 10:05:15');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `created_at`) VALUES
(11, 3, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800', 1, '2026-02-11 13:56:01'),
(12, 3, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800', 0, '2026-02-11 13:56:01'),
(13, 3, 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800', 0, '2026-02-11 13:56:01'),
(14, 3, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800', 0, '2026-02-11 13:56:01'),
(15, 3, 'https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800', 0, '2026-02-11 13:56:01'),
(18, 4, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800', 0, '2026-02-11 13:56:01'),
(19, 4, 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800', 0, '2026-02-11 13:56:01'),
(21, 5, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800', 1, '2026-02-11 13:56:01'),
(22, 5, 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800', 0, '2026-02-11 13:56:01'),
(23, 5, 'https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800', 0, '2026-02-11 13:56:01'),
(24, 5, 'https://images.unsplash.com/photo-1595844737410-6750059c258d?q=80&w=800', 0, '2026-02-11 13:56:01'),
(25, 5, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800', 0, '2026-02-11 13:56:01'),
(26, 6, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800', 1, '2026-02-11 13:56:01'),
(27, 6, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800', 0, '2026-02-11 13:56:01'),
(28, 6, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800', 0, '2026-02-11 13:56:01'),
(29, 6, 'https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800', 0, '2026-02-11 13:56:01'),
(30, 6, 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800', 0, '2026-02-11 13:56:01'),
(32, 7, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800', 0, '2026-02-11 13:56:01'),
(33, 7, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800', 0, '2026-02-11 13:56:01'),
(34, 7, 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800', 0, '2026-02-11 13:56:01'),
(35, 7, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800', 0, '2026-02-11 13:56:01'),
(39, 8, 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800', 0, '2026-02-11 13:56:01'),
(40, 8, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800', 0, '2026-02-11 13:56:01'),
(51, 3, '/uploads/product-images/images-1771497645621-245301007.jpg', 0, '2026-02-19 10:40:45'),
(52, 3, '/uploads/product-images/images-1771511706025-906278746.jpeg', 0, '2026-02-19 14:35:06'),
(53, 3, '/uploads/product-images/images-1771511706037-792066499.jpeg', 0, '2026-02-19 14:35:06'),
(54, 3, '/uploads/product-images/images-1771511706051-511171415.jpeg', 0, '2026-02-19 14:35:06'),
(55, 11, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200', 1, '2026-02-20 09:01:49'),
(56, 11, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(57, 11, 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(58, 11, 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(59, 12, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200', 1, '2026-02-20 09:01:49'),
(60, 12, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(61, 12, 'https://images.unsplash.com/photo-1595841696677-5f806969542a?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(62, 13, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200', 1, '2026-02-20 09:01:49'),
(63, 13, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(64, 13, 'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(65, 13, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(66, 14, 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200', 1, '2026-02-20 09:01:49'),
(67, 14, 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(68, 14, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(69, 15, 'https://images.unsplash.com/photo-1465800872432-7867f60f6c80?auto=format&fit=crop&q=80&w=1200', 1, '2026-02-20 09:01:49'),
(70, 15, 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(71, 15, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(72, 15, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200', 0, '2026-02-20 09:01:49'),
(73, 16, 'https://vishveshglasses.com/wp-content/uploads/elementor/thumbs/3333-q23ajsc7wel5fq3jre23pwf5r5o2tyb2xjpp9e662w.jpg', 1, '2026-02-20 10:05:15'),
(74, 17, 'https://vishveshglasses.com/wp-content/uploads/elementor/thumbs/main_micra-2-q23ajsc7wel5fq3jre23pwf5r5o2tyb2xjppbnqjyg.jpg', 1, '2026-02-20 10:05:15'),
(75, 18, 'https://vishveshglasses.com/wp-content/uploads/elementor/thumbs/omega-q23ajta238mfrc26lwgqae6mcjjg1net9od6sxp5s8.jpg', 1, '2026-02-20 10:05:15'),
(76, 19, 'https://vishveshglasses.com/wp-content/uploads/2022/06/cronos-1.jpg', 1, '2026-02-20 10:05:15'),
(77, 20, 'https://vishveshglasses.com/wp-content/uploads/2022/06/helios-1.jpg', 1, '2026-02-20 10:05:15');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'ADMIN', 'Administrator with full access', '2026-02-11 10:21:15'),
(2, 'STAFF', 'Staff member with limited access', '2026-02-11 10:21:15'),
(3, 'CUSTOMER', 'Customer user', '2026-02-11 10:21:15');

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `executed_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schema_migrations`
--

INSERT INTO `schema_migrations` (`id`, `filename`, `checksum`, `executed_at`) VALUES
(1, '001_initial_structure.sql', '1145dec6407102244c36230fc6e4f9ee6b8ad9c66c7afc5ed30a99824b226d6a', '2026-02-19 12:21:13');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `title`, `short_description`, `description`, `icon`, `status`, `created_at`, `updated_at`) VALUES
(1, '#1 New Service', 'Toughened (Tuffen) glass services in Ahmedabad offer supply, fabrication, and installation for residential and commercial projects.', 'Toughened (Tuffen) glass services in Ahmedabad offer supply, fabrication, and installation for residential and commercial projects, with prices ranging from ₹170 to ₹3,000+ per sq. ft. depending on thickness and application. Key providers include Vagheswari Engineering, Vishvesh Glasses Pvt Ltd, and Parshwa Marketing. Services include frameless doors, partitions, shower enclosures, and railings. ', 'Service Icon', 'ACTIVE', '2026-02-12 10:07:49', '2026-02-12 10:07:49'),
(2, '#2 Toffan Glass Service', 'Window Glass Manufacturer and Alluminium Window Manufacturer ... ', '> Window Glass Manufacturer\r\n> Alluminium Window Manufacturer\r\n> Toughened Glass Manufacturer\r\n> Alluminium Profile shutter\r\n> Glass glazing\r\n> Glass facades\r\n> Aluminum partitions', 'Service Icon (Optional)', 'ACTIVE', '2026-02-12 10:10:17', '2026-02-12 10:15:10'),
(3, 'Commercial Glass Facade Installation', 'Category: Installation | Base Price: 125000 | Duration: 18 days', 'End-to-end commercial facade installation including site survey, structural coordination, glass module fitting, sealing, and quality handover for large-format elevations.', 'building-2', 'ACTIVE', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(4, 'Frameless Shower Enclosure Solutions', 'Category: Residential | Base Price: 32000 | Duration: 3 days', 'Custom frameless shower enclosure solutions with template-based fabrication, precision hardware alignment, anti-leak sealing, and post-installation safety inspection.', 'shield-check', 'ACTIVE', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(5, 'Structural Glazing Repair & Retrofit', 'Category: Maintenance | Base Price: 58000 | Duration: 5 days', 'Repair and retrofit service for aging structural glazing systems, including gasket replacement, sealant renewal, anchor checks, and water-tightness correction.', 'wrench', 'ACTIVE', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(6, 'Office Glass Partition Turnkey Package', 'Category: Interior | Base Price: 89000 | Duration: 7 days', 'Turnkey office partition package covering layout consultation, toughened glass fabrication, patch fitting installation, and acoustic optimization for executive spaces.', 'layout-grid', 'ACTIVE', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(7, 'Annual Glass Safety Audit Program', 'Category: Audit | Base Price: 45000 | Duration: 2 days per site', 'Annual preventive maintenance and safety audit program for commercial properties with compliance reporting, replacement recommendations, and risk-priority matrix.', 'clipboard-check', 'ACTIVE', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(8, 'Curtain Wall Glazing', 'Scraped from Vishvesh Glasses service catalog', 'Curtain Wall Glazing service data sourced from reference website vishveshglasses.com', 'briefcase', 'ACTIVE', '2026-02-20 10:05:15', '2026-02-20 10:05:15'),
(9, 'Structural Glass Glazing', 'Scraped from Vishvesh Glasses service catalog', 'Structural Glass Glazing service data sourced from reference website vishveshglasses.com', 'briefcase', 'ACTIVE', '2026-02-20 10:05:15', '2026-02-20 10:05:15'),
(10, 'Openable & Sliding Glass Doors & Partitions', 'Scraped from Vishvesh Glasses service catalog', 'Openable & Sliding Glass Doors & Partitions service data sourced from reference website vishveshglasses.com', 'briefcase', 'ACTIVE', '2026-02-20 10:05:15', '2026-02-20 10:05:15'),
(11, 'Aluminium Doors, Windows & Partitions', 'Scraped from Vishvesh Glasses service catalog', 'Aluminium Doors, Windows & Partitions service data sourced from reference website vishveshglasses.com', 'briefcase', 'ACTIVE', '2026-02-20 10:05:15', '2026-02-20 10:05:15'),
(12, 'Openable & Sliding Shower Cubicles', 'Scraped from Vishvesh Glasses service catalog', 'Openable & Sliding Shower Cubicles service data sourced from reference website vishveshglasses.com', 'briefcase', 'ACTIVE', '2026-02-20 10:05:15', '2026-02-20 10:05:15');

-- --------------------------------------------------------

--
-- Table structure for table `service_images`
--

CREATE TABLE `service_images` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_images`
--

INSERT INTO `service_images` (`id`, `service_id`, `image_url`, `caption`, `is_primary`, `sort_order`, `created_at`) VALUES
(2, 1, '/uploads/service-images/images-1770890869110-630986849.jpg', '', 0, 1, '2026-02-12 10:07:49'),
(6, 2, '/uploads/service-images/images-1771496654100-212733115.jpeg', '', 0, 1, '2026-02-19 10:24:14'),
(7, 2, '/uploads/service-images/images-1771496654114-937108527.jpeg', '', 0, 2, '2026-02-19 10:24:14'),
(8, 2, '/uploads/service-images/images-1771496654143-711634330.jpeg', '', 0, 3, '2026-02-19 10:24:14'),
(9, 2, '/uploads/service-images/images-1771496654147-228461312.jpeg', '', 0, 4, '2026-02-19 10:24:14'),
(10, 1, '/uploads/service-images/images-1771496874578-767037239.jpeg', '', 0, 2, '2026-02-19 10:27:54'),
(11, 1, '/uploads/service-images/images-1771496889422-293512831.jpg', '', 0, 3, '2026-02-19 10:28:09'),
(13, 3, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200', 'Commercial Glass Facade Installation', 0, 1, '2026-02-20 09:01:49'),
(14, 3, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', 'Commercial Glass Facade Installation', 0, 2, '2026-02-20 09:01:49'),
(15, 4, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200', 'Frameless Shower Enclosure Solutions', 1, 0, '2026-02-20 09:01:49'),
(16, 4, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200', 'Frameless Shower Enclosure Solutions', 0, 1, '2026-02-20 09:01:49'),
(17, 4, 'https://images.unsplash.com/photo-1616594039964-96d0f5feda79?auto=format&fit=crop&q=80&w=1200', 'Frameless Shower Enclosure Solutions', 0, 2, '2026-02-20 09:01:49'),
(21, 6, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200', 'Office Glass Partition Turnkey Package', 1, 0, '2026-02-20 09:01:49'),
(22, 6, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', 'Office Glass Partition Turnkey Package', 0, 1, '2026-02-20 09:01:49'),
(23, 6, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200', 'Office Glass Partition Turnkey Package', 0, 2, '2026-02-20 09:01:49'),
(24, 7, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200', 'Annual Glass Safety Audit Program', 1, 0, '2026-02-20 09:01:49'),
(25, 7, 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200', 'Annual Glass Safety Audit Program', 0, 1, '2026-02-20 09:01:49'),
(26, 7, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200', 'Annual Glass Safety Audit Program', 0, 2, '2026-02-20 09:01:49'),
(27, 5, '/uploads/service-images/images-1771578910130-164883497.jpeg', '', 0, 1, '2026-02-20 09:15:10'),
(28, 5, '/uploads/service-images/images-1771578910148-572786325.avif', '', 0, 2, '2026-02-20 09:15:10'),
(29, 5, '/uploads/service-images/images-1771578910150-297968740.jpeg', '', 0, 3, '2026-02-20 09:15:10'),
(30, 5, '/uploads/service-images/images-1771578910178-799220928.avif', '', 0, 4, '2026-02-20 09:15:10'),
(31, 5, '/uploads/service-images/images-1771578910179-67669102.jpeg', '', 0, 5, '2026-02-20 09:15:10'),
(32, 5, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200', 'Structural Glazing Repair & Retrofit', 1, 0, '2026-02-20 09:36:12'),
(33, 5, 'https://images.unsplash.com/photo-1581091215367-59ab6dcef8a6?auto=format&fit=crop&q=80&w=1200', 'Structural Glazing Repair & Retrofit', 0, 1, '2026-02-20 09:36:12'),
(34, 5, 'https://images.unsplash.com/photo-1581091215367-1f85f8f9e5b6?auto=format&fit=crop&q=80&w=1200', 'Structural Glazing Repair & Retrofit', 0, 2, '2026-02-20 09:36:12'),
(35, 8, 'https://vishveshglasses.com/wp-content/uploads/2022/05/product-jpeg-500x500-1.jpg', 'Curtain Wall Glazing', 1, 0, '2026-02-20 10:05:15'),
(36, 9, 'https://vishveshglasses.com/wp-content/uploads/2022/05/toughened-glass-partition-500x500-1.jpg', 'Structural Glass Glazing', 1, 0, '2026-02-20 10:05:15'),
(37, 10, 'https://vishveshglasses.com/wp-content/uploads/2022/05/glass-film-500x500-1.jpg', 'Openable & Sliding Glass Doors & Partitions', 1, 0, '2026-02-20 10:05:15'),
(38, 11, 'https://vishveshglasses.com/wp-content/uploads/2022/05/BLUE-GLASS-BRICKS.jpg', 'Aluminium Doors, Windows & Partitions', 1, 0, '2026-02-20 10:05:15'),
(39, 12, 'https://vishveshglasses.com/wp-content/uploads/2022/05/istockphoto-1069527780-170667a.jpg', 'Openable & Sliding Shower Cubicles', 1, 0, '2026-02-20 10:05:15');

-- --------------------------------------------------------

--
-- Table structure for table `sites`
--

CREATE TABLE `sites` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `status` enum('COMING_SOON','WORKING','COMPLETED') DEFAULT 'COMING_SOON',
  `start_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sites`
--

INSERT INTO `sites` (`id`, `name`, `address`, `city_id`, `status`, `start_date`, `completion_date`, `description`, `created_at`, `updated_at`, `user_id`) VALUES
(1, 'Site Name', 'Address 11', 2, 'COMING_SOON', '2026-01-01', '2026-03-31', 'Description 11', '2026-02-11 11:43:24', '2026-02-11 12:36:27', 0),
(2, 'Add New Site', 'Add New Site qwwww', 3, 'COMING_SOON', '2026-02-12', '2026-02-26', 'Description 007', '2026-02-11 12:08:25', '2026-02-19 10:39:19', 3),
(3, 'Add New Site #2', 'Address', 1, 'COMING_SOON', '2026-02-12', '2026-03-05', 'Description1', '2026-02-11 12:36:59', '2026-02-19 10:39:09', 3),
(4, 'Add New Site #3', '#3 Address', 5, 'WORKING', '2025-10-01', '2026-05-30', '#3 Description 111', '2026-02-11 12:42:32', '2026-02-19 10:55:15', 4),
(5, 'Home Front Elevation', 'Vijay Nage, Indore ', 1, 'WORKING', '2026-02-20', '2026-04-30', '{\"__siteFormMeta\":true,\"siteInfo\":{\"clientName\":\"Garvin\",\"contactPerson\":\"Hitesh Mistri\",\"mobileNumber\":\"7896541231\",\"email\":\"garvin@yopmail.com\",\"state\":\"MP\",\"gstNumber\":\"00124500\"},\"lineItems\":[{\"type\":\"PRODUCT\",\"itemName\":\"Frameless Glass Spider Connector\",\"description\":\"Four-way spider fitting for modern glass facades. This fitting allows for point-fixed architectural glazing, creating seamless curtains of glass for malls, hotels, and luxury showrooms. Marine-grade SS 316 ensures it withstands harsh weather conditions.\",\"quantity\":10,\"unit\":\"Nos\",\"price\":5000,\"discountType\":\"AMOUNT\",\"discountValue\":500,\"vatPercent\":10,\"deliveryCharge\":1500,\"total\":55950},{\"type\":\"PRODUCT\",\"itemName\":\"Laminated Acoustic Glass\",\"description\":\"Designed for quiet environments, our laminated acoustic glass uses a specialized PVB interlayer to dampen sound vibrations. Perfect for meeting rooms near high-traffic areas or residential homes facing busy streets. Provides safety and silence in one package.\",\"quantity\":10,\"unit\":\"Nos\",\"price\":2500,\"discountType\":\"AMOUNT\",\"discountValue\":100,\"vatPercent\":5,\"deliveryCharge\":250,\"total\":26395}],\"totals\":{\"subtotal\":75000,\"discount\":600,\"vat\":6195,\"delivery\":1750,\"grandTotal\":82345},\"customerProducts\":[],\"notes\":\"Internal Notes\"}', '2026-02-19 12:29:11', '2026-02-19 12:29:11', 4),
(6, 'Orion Business Park - Tower A', 'AB Road, Vijay Nagar Commercial District', 1, 'WORKING', '2026-01-12', NULL, 'Facade enhancement and internal partition retrofit for a Grade-A office tower with phased execution to minimize tenant downtime.', '2026-02-20 09:01:49', '2026-02-20 09:01:49', 8),
(7, 'Lakeview Residency Clubhouse', 'Kolar Road Extension, Residential Sector', 2, 'WORKING', '2026-01-25', NULL, 'Clubhouse glazing modernization including frameless entrance systems, railing glass, and acoustic lounge partitions.', '2026-02-20 09:01:49', '2026-02-20 09:01:49', 9),
(8, 'Riverview Retail Arcade', 'Freeganj Main Road, Retail Corridor', 3, 'COMING_SOON', '2026-03-01', NULL, 'Upcoming retail arcade project focused on structural glazing storefronts and high-visibility display fronts.', '2026-02-20 09:01:49', '2026-02-20 09:01:49', 8),
(9, 'Shivansh Healthcare Centre', 'Station Road Medical Zone', 4, 'WORKING', '2025-12-10', NULL, 'Healthcare-grade tempered and laminated glass package for OPD corridors, ICU view panels, and hygienic partition systems.', '2026-02-20 09:01:49', '2026-02-20 09:01:49', 9),
(10, 'Techline Logistics HQ', 'Industrial Bypass, Corporate Campus', 5, 'COMPLETED', '2025-10-15', NULL, 'Completed corporate headquarters package including atrium glazing, staircase balustrades, and meeting room acoustic modules.', '2026-02-20 09:01:49', '2026-02-20 09:01:49', 8);

-- --------------------------------------------------------

--
-- Table structure for table `site_images`
--

CREATE TABLE `site_images` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_images`
--

INSERT INTO `site_images` (`id`, `site_id`, `image_url`, `caption`, `is_primary`, `uploaded_by`, `created_at`) VALUES
(1, 4, '/uploads/1770880554706-410957820-images.jpeg', NULL, 0, NULL, '2026-02-12 07:15:54'),
(2, 4, '/uploads/1770880554708-738460468-download (3).jpeg', NULL, 0, NULL, '2026-02-12 07:15:54'),
(3, 4, '/uploads/1770880554709-209927187-download (2).jpeg', NULL, 0, NULL, '2026-02-12 07:15:54'),
(4, 3, '/uploads/1770881277145-227714793-test.png', NULL, 0, NULL, '2026-02-12 07:27:57'),
(5, 3, '/uploads/1770881277146-636493037-09 Friday.jpg', NULL, 0, NULL, '2026-02-12 07:27:57'),
(6, 2, '/uploads/1770881313541-179383243-bhole-baba.png', NULL, 0, NULL, '2026-02-12 07:28:33'),
(7, 2, '/uploads/1770881313570-749761723-shree-ganeshji.jpg', NULL, 0, NULL, '2026-02-12 07:28:33'),
(8, 2, '/uploads/1770881313590-94490950-download.jpeg', NULL, 0, NULL, '2026-02-12 07:28:33'),
(9, 1, '/uploads/1770881330053-159290261-company.png', NULL, 0, NULL, '2026-02-12 07:28:50'),
(10, 1, '/uploads/1770881330053-825038658-hcltech.png', NULL, 0, NULL, '2026-02-12 07:28:50'),
(11, 1, '/uploads/1770881330053-321221908-tvshorse.png', NULL, 0, NULL, '2026-02-12 07:28:50'),
(12, 1, '/uploads/1770881330053-121282770-hb.png', NULL, 0, NULL, '2026-02-12 07:28:50'),
(13, 1, '/uploads/1770881330054-806099714-cnbc.png', NULL, 0, NULL, '2026-02-12 07:28:50'),
(14, 5, '/uploads/site-images/images-1771504151610-735099497.png', '', 0, NULL, '2026-02-19 12:29:11'),
(15, 5, '/uploads/site-images/images-1771504151615-838175652.jpg', '', 0, NULL, '2026-02-19 12:29:11');

-- --------------------------------------------------------

--
-- Table structure for table `site_products`
--

CREATE TABLE `site_products` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `item_type` enum('PRODUCT','SERVICE') DEFAULT 'PRODUCT',
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(50) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_type` enum('PERCENT','AMOUNT') DEFAULT 'PERCENT',
  `discount_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `vat_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `delivery_charge` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_products`
--

INSERT INTO `site_products` (`id`, `site_id`, `item_type`, `item_name`, `description`, `quantity`, `unit`, `price`, `discount_type`, `discount_value`, `vat_percent`, `delivery_charge`, `total`, `sort_order`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 5, 'PRODUCT', 'Frameless Glass Spider Connector', 'Four-way spider fitting for modern glass facades. This fitting allows for point-fixed architectural glazing, creating seamless curtains of glass for malls, hotels, and luxury showrooms. Marine-grade SS 316 ensures it withstands harsh weather conditions.', 10.00, 'Nos', 5000.00, 'AMOUNT', 500.00, 10.00, 1500.00, 55950.00, 0, 1, 1, '2026-02-19 12:29:11', '2026-02-19 12:29:11'),
(2, 5, 'PRODUCT', 'Laminated Acoustic Glass', 'Designed for quiet environments, our laminated acoustic glass uses a specialized PVB interlayer to dampen sound vibrations. Perfect for meeting rooms near high-traffic areas or residential homes facing busy streets. Provides safety and silence in one package.', 10.00, 'Nos', 2500.00, 'AMOUNT', 100.00, 5.00, 250.00, 26395.00, 1, 1, 1, '2026-02-19 12:29:11', '2026-02-19 12:29:11'),
(3, 6, 'PRODUCT', 'Automatic Sliding Door Motor', 'PRODUCT linked for demo billing and project planning', 120.00, 'sq.ft', 485.00, 'PERCENT', 5.00, 18.00, 3500.00, 68742.20, 0, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(4, 6, 'PRODUCT', 'Frameless Glass Spider Connector', 'PRODUCT linked for demo billing and project planning', 90.00, 'sq.ft', 640.00, 'PERCENT', 3.00, 18.00, 2500.00, 68428.96, 1, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(5, 6, 'SERVICE', '#1 New Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 125000.00, 'AMOUNT', 5000.00, 18.00, 0.00, 141600.00, 2, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(6, 6, 'SERVICE', '#2 Toffan Glass Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 32000.00, 'AMOUNT', 0.00, 18.00, 0.00, 37760.00, 3, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(7, 7, 'PRODUCT', 'Automatic Sliding Door Motor', 'PRODUCT linked for demo billing and project planning', 120.00, 'sq.ft', 485.00, 'PERCENT', 5.00, 18.00, 3500.00, 68742.20, 0, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(8, 7, 'PRODUCT', 'Frameless Glass Spider Connector', 'PRODUCT linked for demo billing and project planning', 90.00, 'sq.ft', 640.00, 'PERCENT', 3.00, 18.00, 2500.00, 68428.96, 1, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(9, 7, 'SERVICE', '#1 New Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 125000.00, 'AMOUNT', 5000.00, 18.00, 0.00, 141600.00, 2, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(10, 7, 'SERVICE', '#2 Toffan Glass Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 32000.00, 'AMOUNT', 0.00, 18.00, 0.00, 37760.00, 3, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(11, 8, 'PRODUCT', 'Automatic Sliding Door Motor', 'PRODUCT linked for demo billing and project planning', 120.00, 'sq.ft', 485.00, 'PERCENT', 5.00, 18.00, 3500.00, 68742.20, 0, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(12, 8, 'PRODUCT', 'Frameless Glass Spider Connector', 'PRODUCT linked for demo billing and project planning', 90.00, 'sq.ft', 640.00, 'PERCENT', 3.00, 18.00, 2500.00, 68428.96, 1, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(13, 8, 'SERVICE', '#1 New Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 125000.00, 'AMOUNT', 5000.00, 18.00, 0.00, 141600.00, 2, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(14, 8, 'SERVICE', '#2 Toffan Glass Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 32000.00, 'AMOUNT', 0.00, 18.00, 0.00, 37760.00, 3, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(15, 9, 'PRODUCT', 'Automatic Sliding Door Motor', 'PRODUCT linked for demo billing and project planning', 120.00, 'sq.ft', 485.00, 'PERCENT', 5.00, 18.00, 3500.00, 68742.20, 0, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(16, 9, 'PRODUCT', 'Frameless Glass Spider Connector', 'PRODUCT linked for demo billing and project planning', 90.00, 'sq.ft', 640.00, 'PERCENT', 3.00, 18.00, 2500.00, 68428.96, 1, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(17, 9, 'SERVICE', '#1 New Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 125000.00, 'AMOUNT', 5000.00, 18.00, 0.00, 141600.00, 2, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(18, 9, 'SERVICE', '#2 Toffan Glass Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 32000.00, 'AMOUNT', 0.00, 18.00, 0.00, 37760.00, 3, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(19, 10, 'PRODUCT', 'Automatic Sliding Door Motor', 'PRODUCT linked for demo billing and project planning', 120.00, 'sq.ft', 485.00, 'PERCENT', 5.00, 18.00, 3500.00, 68742.20, 0, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(20, 10, 'PRODUCT', 'Frameless Glass Spider Connector', 'PRODUCT linked for demo billing and project planning', 90.00, 'sq.ft', 640.00, 'PERCENT', 3.00, 18.00, 2500.00, 68428.96, 1, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(21, 10, 'SERVICE', '#1 New Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 125000.00, 'AMOUNT', 5000.00, 18.00, 0.00, 141600.00, 2, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(22, 10, 'SERVICE', '#2 Toffan Glass Service', 'SERVICE linked for demo billing and project planning', 1.00, 'lot', 32000.00, 'AMOUNT', 0.00, 18.00, 0.00, 37760.00, 3, 5, 5, '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(23, 6, 'PRODUCT', 'UltraClear Tempered Office Partition Glass', 'Product linked for demo billing and project planning', 120.00, 'sq.ft', 485.00, 'PERCENT', 5.00, 18.00, 3500.00, 68874.00, 0, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(24, 6, 'SERVICE', 'Commercial Glass Facade Installation', 'Service linked for demo billing and project planning', 1.00, 'lot', 125000.00, 'AMOUNT', 5000.00, 18.00, 0.00, 141600.00, 1, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(25, 7, 'PRODUCT', 'Architectural Laminated Safety Glass Panel', 'Product linked for demo billing and project planning', 90.00, 'sq.ft', 640.00, 'PERCENT', 3.00, 18.00, 2500.00, 68525.60, 0, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(26, 7, 'SERVICE', 'Frameless Shower Enclosure Solutions', 'Service linked for demo billing and project planning', 1.00, 'lot', 32000.00, 'AMOUNT', 0.00, 18.00, 0.00, 37760.00, 1, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(27, 8, 'PRODUCT', 'Stainless Steel Spider Fitting Assembly', 'Product linked for demo billing and project planning', 65.00, 'nos', 3925.00, 'PERCENT', 2.50, 18.00, 1800.00, 291539.38, 0, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(28, 8, 'SERVICE', 'Structural Glazing Repair & Retrofit', 'Service linked for demo billing and project planning', 1.00, 'lot', 58000.00, 'AMOUNT', 3000.00, 18.00, 0.00, 64900.00, 1, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(29, 9, 'PRODUCT', 'Acoustic Insulated Double-Glazed Unit', 'Product linked for demo billing and project planning', 150.00, 'sq.ft', 850.00, 'PERCENT', 4.00, 18.00, 4500.00, 146148.00, 0, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(30, 9, 'SERVICE', 'Office Glass Partition Turnkey Package', 'Service linked for demo billing and project planning', 1.00, 'lot', 89000.00, 'AMOUNT', 0.00, 18.00, 0.00, 105020.00, 1, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(31, 10, 'PRODUCT', 'UltraClear Tempered Office Partition Glass', 'Product linked for demo billing and project planning', 80.00, 'sq.ft', 485.00, 'PERCENT', 2.00, 18.00, 2200.00, 46906.40, 0, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12'),
(32, 10, 'SERVICE', 'Annual Glass Safety Audit Program', 'Service linked for demo billing and project planning', 1.00, 'lot', 45000.00, 'AMOUNT', 0.00, 18.00, 0.00, 53100.00, 1, 5, 5, '2026-02-20 09:36:12', '2026-02-20 09:36:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `city_id` int(11) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `city_id`, `mobile`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@toffanglass.com', '$2b$10$cMDg3SCkvON6RkTIH6cyKe6cPGGXqpKYElVWj9jUib63At3TtsrA.', 1, 1, '9876543210', NULL, '2026-02-11 10:21:16', '2026-02-11 10:21:16'),
(2, 'Test User', 'test@example.com', '$2b$10$GAsCDOJpvYKodcMFs34g2uxpNRjFv6SwYJVR74sYYg6gqys4Hudwu', 3, 2, NULL, NULL, '2026-02-11 10:31:51', '2026-02-19 10:35:24'),
(3, 'New User', 'newuser@example.com', '$2b$10$TwX7HG3NrSjW5KhJ4SOsWuKMLmCyC.bltsZWyETKMVR5di2nGzvl2', 3, 2, '9876543210', NULL, '2026-02-11 10:36:53', '2026-02-19 10:35:28'),
(4, 'Garvin', 'garvin@yopmail.com', '$2b$10$w.h4ZTwYM7Z2DZej76sWq.fjQ4wRJRzfuikxxhQKCl.ro7TvcSCkG', 3, 2, '7896541231', NULL, '2026-02-11 14:44:18', '2026-02-11 14:55:24'),
(5, 'Aarav Mehta', 'aarav.mehta@toffandemo.com', '$2b$10$EckRgfPjJerEWghDUxHWr.2X7.41WBrcvK6QgxHozbpyCcSkzMSZe', 1, 1, '9826001101', 'Demo profile', '2026-02-20 09:01:48', '2026-02-20 09:01:48'),
(6, 'Ritika Sharma', 'ritika.sharma@toffandemo.com', '$2b$10$HOI.xdziEBXZ50LBBFzy2eqJ1PwLnMARhG3VZHZtYVfIOfpXkFoEe', 2, 2, '9826001102', 'Demo profile', '2026-02-20 09:01:48', '2026-02-20 09:01:48'),
(7, 'Karan Verma', 'karan.verma@toffandemo.com', '$2b$10$8JKyoRJ.7VBJNCzA1xqUcekjLaj4mh/m1MGHgzzvfaoOd.nLAAEl2', 2, 3, '9826001103', 'Demo profile', '2026-02-20 09:01:48', '2026-02-20 09:01:48'),
(8, 'Neha Kulkarni', 'neha.kulkarni@toffandemo.com', '$2b$10$jdSdu8teUiIxTNiQYkbHe.DGlFOM4WnAldVzBBuS6WrbiqkJN7dsa', 3, 1, '9826001104', 'Demo profile', '2026-02-20 09:01:49', '2026-02-20 09:01:49'),
(9, 'Vikram Singh', 'vikram.singh@toffandemo.com', '$2b$10$wdWIHqmJ.6zSwsiyhl7bfuRpaCXa/qgRYk0hLB4iDLaqmpi6Nh/O2', 3, 4, '9826001105', 'Demo profile', '2026-02-20 09:01:49', '2026-02-20 09:01:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `content_pages`
--
ALTER TABLE `content_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `page_name` (`page_name`),
  ADD KEY `idx_page_name` (`page_name`);

--
-- Indexes for table `content_page_images`
--
ALTER TABLE `content_page_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_content_page` (`content_page_id`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `city_id` (`city_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_inquiries_status_assigned` (`status`,`assigned_to`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_site` (`site_id`),
  ADD KEY `idx_payments_status_site` (`status`,`site_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_products_category_price` (`category`,`price`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `filename` (`filename`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_images`
--
ALTER TABLE `service_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_service` (`service_id`);

--
-- Indexes for table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_city` (`city_id`),
  ADD KEY `idx_sites_status_city` (`status`,`city_id`);

--
-- Indexes for table `site_images`
--
ALTER TABLE `site_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_site` (`site_id`);

--
-- Indexes for table `site_products`
--
ALTER TABLE `site_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_site_products_site` (`site_id`),
  ADD KEY `idx_site_products_name` (`item_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `city_id` (`city_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role_id`),
  ADD KEY `idx_users_role_city` (`role_id`,`city_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `content_pages`
--
ALTER TABLE `content_pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `content_page_images`
--
ALTER TABLE `content_page_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `service_images`
--
ALTER TABLE `service_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `site_images`
--
ALTER TABLE `site_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `site_products`
--
ALTER TABLE `site_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `content_page_images`
--
ALTER TABLE `content_page_images`
  ADD CONSTRAINT `content_page_images_ibfk_1` FOREIGN KEY (`content_page_id`) REFERENCES `content_pages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `inquiries_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`),
  ADD CONSTRAINT `inquiries_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_images`
--
ALTER TABLE `service_images`
  ADD CONSTRAINT `service_images_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sites`
--
ALTER TABLE `sites`
  ADD CONSTRAINT `sites_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`);

--
-- Constraints for table `site_images`
--
ALTER TABLE `site_images`
  ADD CONSTRAINT `site_images_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `site_images_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `site_products`
--
ALTER TABLE `site_products`
  ADD CONSTRAINT `site_products_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `site_products_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `site_products_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
