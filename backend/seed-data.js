const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const seed = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("🚀 Starting Seeding...");

    // 1. Clear existing products and services images
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE product_images");
    await connection.execute("TRUNCATE TABLE products");
    await connection.execute("TRUNCATE TABLE content_page_images");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Insert Products
    const products = [
      {
        name: "12mm Clear Toughened Glass",
        category: "Glass",
        description:
          "Our 12mm clear toughened glass is the industry standard for frameless installations. It underwent rigorous thermal treatment to ensure it is 5 times stronger than regular glass. Perfect for high-end office partitions, shower enclosures, and glass doors.",
        price: 195.0,
        stock: 1200,
        specifications: JSON.stringify({
          Thickness: "12mm",
          Material: "Toughened Safety Glass",
          Edges: "Flat Polished",
          "Impact Resistance": "High",
          Transparency: "92%",
        }),
        images: [
          "https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800",
          "https://images.unsplash.com/photo-1595844737410-6750059c258d?q=80&w=800",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800",
        ],
      },
      {
        name: "Hydraulic Floor Spring - Ultra Series",
        category: "Hardware",
        description:
          "The Ultra Series Floor Spring is designed for heavy-duty commercial doors. Featuring double-action opening and an adjustable closing speed, it ensures smooth operation for over 500,000 cycles. Built with 304-grade stainless steel for corrosion resistance.",
        price: 5200.0,
        stock: 85,
        specifications: JSON.stringify({
          Capacity: "150kg",
          Cycles: "500,000+",
          Finish: "Brushed Stainless Steel",
          Grade: "SS 304",
          Mounting: "In-floor",
        }),
        images: [
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800",
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800",
          "https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800",
        ],
      },
      {
        name: "Frameless Glass Spider Connector",
        category: "Hardware",
        description:
          "Four-way spider fitting for modern glass facades. This fitting allows for point-fixed architectural glazing, creating seamless curtains of glass for malls, hotels, and luxury showrooms. Marine-grade SS 316 ensures it withstands harsh weather conditions.",
        price: 3800.0,
        stock: 45,
        specifications: JSON.stringify({
          Type: "4-Way Spider",
          Material: "SS 316",
          "Load Bearing": "Heavy Duty",
          Application: "Structural Facades",
          Finish: "Satin/Mirror",
        }),
        images: [
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800",
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800",
          "https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800",
        ],
      },
      {
        name: "Laminated Acoustic Glass",
        category: "Glass",
        description:
          "Designed for quiet environments, our laminated acoustic glass uses a specialized PVB interlayer to dampen sound vibrations. Perfect for meeting rooms near high-traffic areas or residential homes facing busy streets. Provides safety and silence in one package.",
        price: 350.0,
        stock: 600,
        specifications: JSON.stringify({
          Composition: "6mm + 1.52 PVB + 6mm",
          "Sound Reduction": "38dB",
          Safety: "Class A Laminated",
          "UV Protection": "99%",
          "Max Size": "2440 x 3660 mm",
        }),
        images: [
          "https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800",
          "https://images.unsplash.com/photo-1595844737410-6750059c258d?q=80&w=800",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800",
        ],
      },
      {
        name: "Glass Railing Patch Fitting",
        category: "Hardware",
        description:
          "Compact and elegant glass-to-glass patch fitting for staircases and balconies. The brushed satin finish provides a sophisticated look while the high-tensile body ensures the safety of your glass railing system. Easy to install and adjust.",
        price: 1450.0,
        stock: 200,
        specifications: JSON.stringify({
          Material: "Aluminium/SS",
          "Glass Thickness": "10mm - 12mm",
          Mounting: "Side/Bottom",
          Finish: "Satin Nickel",
          Application: "Staircase Railings",
        }),
        images: [
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800",
          "https://images.unsplash.com/photo-1595844737410-6750059c258d?q=80&w=800",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800",
        ],
      },
      {
        name: "Reflective Blue Solar Glass",
        category: "Glass",
        description:
          "Energy-efficient reflective glass that reduces heat gain inside buildings. The stunning blue tint provides privacy during the day while maintaining a clear view from the inside. Highly recommended for commercial facades in hot climates.",
        price: 280.0,
        stock: 800,
        specifications: JSON.stringify({
          Thickness: "6mm",
          "U-Value": "5.8",
          SHGC: "0.45",
          "Light Transmission": "30%",
          Processing: "Tempering Optional",
        }),
        images: [
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800",
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800",
          "https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
        ],
      },
      {
        name: "Automatic Sliding Door Motor",
        category: "Hardware",
        description:
          "Intelligent automatic sliding door system for retail and hospitals. Equipped with high-sensitivity motion sensors and an emergency fail-safe mechanism. Compatible with glass doors up to 150kg per leaf.",
        price: 45000.0,
        stock: 12,
        specifications: JSON.stringify({
          Voltage: "220V",
          Speed: "Adjustable 10-50 cm/s",
          "Sensor Range": "Up to 3m",
          Drive: "Brushless DC Motor",
          "Noise Level": "<55dB",
        }),
        images: [
          "https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800",
        ],
      },
      {
        name: "Frosted Satin Etched Glass",
        category: "Glass",
        description:
          "Achieve a sophisticated look for partitions and bathroom doors with our satin etched glass. Unlike sandblasted glass, the satin finish is smooth to the touch and resistant to fingerprints. Provides excellent light diffusion and privacy.",
        price: 220.0,
        stock: 500,
        specifications: JSON.stringify({
          Finish: "Acid Etched / Satin",
          Thickness: "8mm, 10mm, 12mm",
          Clarity: "Translucent",
          Maintenance: "Low / Fingerprint Resistant",
          Safety: "Toughenable",
        }),
        images: [
          "https://images.unsplash.com/photo-1595844737410-6750059c258d?q=80&w=800",
          "https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800",
          "https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800",
        ],
      },
      {
        name: "Slim Aluminum Magnetic Track",
        category: "Hardware",
        description:
          "Modern track system for sliding glass doors with magnetic soft-closing. This ultra-slim profile is designed for minimal visual impact, making it ideal for contemporary interiors. Supports glass panels up to 100kg.",
        price: 8500.0,
        stock: 30,
        specifications: JSON.stringify({
          Material: "Anodized Aluminum",
          "Profile Height": "45mm",
          "Track Length": "2m / 3m / 4m",
          "Soft Close": "Magnetic Assist",
          "Max Weight": "100kg",
        }),
        images: [
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800",
          "https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800",
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800",
          "https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800",
        ],
      },
      {
        name: "Super Clear Low-Iron Glass",
        category: "Glass",
        description:
          "Low-iron glass provides the ultimate clarity by removing the slight green tint found in regular clear glass. Essential for high-end retail displays, jewelry cases, and premium residential skylights. Experience glass that is virtually invisible.",
        price: 450.0,
        stock: 300,
        specifications: JSON.stringify({
          "Iron Content": "<100 ppm",
          "Light Transmission": ">91%",
          Tint: "None / Extra Clear",
          Thickness: "10mm / 12mm / 15mm",
          Safety: "Toughenable",
        }),
        images: [
          "https://images.unsplash.com/photo-1590732128864-4e470878e17b?q=80&w=800",
          "https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=800",
          "https://images.unsplash.com/photo-1595841696677-5f806969542a?q=80&w=800",
          "https://images.unsplash.com/photo-1595844737410-6750059c258d?q=80&w=800",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800",
        ],
      },
    ];

    for (const p of products) {
      const [result] = await connection.execute(
        "INSERT INTO products (name, category, description, price, stock, specifications) VALUES (?, ?, ?, ?, ?, ?)",
        [p.name, p.category, p.description, p.price, p.stock, p.specifications],
      );
      const productId = result.insertId;
      for (let i = 0; i < p.images.length; i++) {
        await connection.execute(
          "INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)",
          [productId, p.images[i], i === 0],
        );
      }
    }
    console.log("✅ 10 Products Seeded.");

    // 3. Update Services Page Content
    const servicesPageContent = `
      <p>Toffan Glass Solutions offers a comprehensive suite of professional services tailored for architectural excellence. Our expertise spans from initial design consultation to precision installation and ongoing maintenance. We pride ourselves on delivering solutions that integrate safety, functionality, and modern aesthetics.</p>
      <p>Our commitment to quality is evident in every project we undertake. Whether it is a high-rise commercial facade using structural spider fittings or a luxury residential shower enclosure, we bring the same level of precision and engineering excellence. We utilize state-of-the-art cutting, polishing, and toughening technologies to ensure that every pane of glass meets rigorous safety standards.</p>
      <p>In addition to fabrication and supply, our team of certified installers ensures that every piece of hardware—from hydraulic floor springs to smart glass tracks—is fitted to perfection. We understand the nuances of architectural hardware and provide expert guidance to architects and developers across Madhya Pradesh to choose the right materials for their unique structural requirements.</p>
    `;

    await connection.execute(
      "UPDATE content_pages SET title = ?, content = ?, meta_description = ? WHERE page_name = ?",
      [
        "Architectural Glass Services",
        servicesPageContent,
        "Explore our professional glass installation, facade engineering, and hardware consulting services for high-end projects in MP.",
        "services",
      ],
    );

    // Clear existing service images
    const [pages] = await connection.execute(
      'SELECT id FROM content_pages WHERE page_name = "services"',
    );
    const servicesId = pages[0].id;
    await connection.execute(
      "DELETE FROM content_page_images WHERE content_page_id = ?",
      [servicesId],
    );

    const serviceImages = [
      {
        title: "Commercial Partitions",
        desc: "Precision-engineered glass walls with acoustic insulation for modern corporate environments.",
        img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Residential Glazing",
        desc: "Luxury glass solutions including premium shower cubicles, balustrades, and mirrored walls for high-end homes.",
        img: "https://images.unsplash.com/photo-1590732128864-4e470878e17b?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Structural Facades",
        desc: "Specialized facade engineering using spider fittings and curtain wall systems for commercial developments.",
        img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Retail Entrances",
        desc: "Durable and aesthetic storefront systems with automatic sliding doors and heavy-duty locking mechanisms.",
        img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
      },
    ];

    for (const s of serviceImages) {
      await connection.execute(
        "INSERT INTO content_page_images (content_page_id, image_url, caption) VALUES (?, ?, ?)",
        [servicesId, s.img, JSON.stringify({ title: s.title, desc: s.desc })],
      );
    }

    console.log("✅ Services Content Seeded.");
    console.log("✨ Seeding Completed Successfully!");
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
};

seed();
