import { console } from "inspector";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

// Load environment variables
dotenv.config();

// Import database connection
const { pool } = require("./config/db");

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const [rows] = await pool.execute(
      "SELECT r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
      [req.user.userId],
    );
    if (rows.length === 0 || rows[0].name !== "ADMIN") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during authorization" });
  }
};

// Helper to format product
const formatProduct = (product) => {
  const formatted = {
    ...product,
    imageUrls: product.image_urls ? product.image_urls.split(",") : [],
    specifications: product.specifications
      ? typeof product.specifications === "string"
        ? JSON.parse(product.specifications)
        : product.specifications
      : {},
  };
  delete formatted.image_urls;
  return formatted;
};

// ==========================================
// ROUTES
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Toffan Glass Backend is running!" });
});

app.use("/api/services", require("./routes/serviceRoutes"));

// --- AUTH ---

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const [userRows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.password, r.name as role, c.name as city, u.mobile 
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN cities c ON u.city_id = c.id
             WHERE u.email = ?`,
      [email],
    );

    if (userRows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });
    const user = userRows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = generateToken(user.id);
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      mobile: user.mobile,
    };

    res.json({ message: "Login successful", token, user: userData });
  } catch (error) {
    res.status(500).json({ error: "Login failed", message: error.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, city, mobile } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Required fields missing" });

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    const [roleRows] = await pool.execute(
      "SELECT id FROM roles WHERE name = ?",
      ["CUSTOMER"],
    );
    const roleId = roleRows[0]?.id;

    let cityId = null;
    if (city) {
      const [cityRows] = await pool.execute(
        "SELECT id FROM cities WHERE name = ?",
        [city],
      );
      cityId = cityRows[0]?.id || null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role_id, city_id, mobile) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, roleId, cityId, mobile || null],
    );

    const token = generateToken(result.insertId);
    // Return user ...
    res.status(201).json({
      message: "User registered",
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: "CUSTOMER",
        mobile,
        city,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Registration failed", message: error.message });
  }
});

app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, r.name as role, c.name as city, u.mobile 
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN cities c ON u.city_id = c.id
             WHERE u.id = ?`,
      [req.user.userId],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { name, mobile, city } = req.body;
    let cityId = null;
    if (city) {
      const [c] = await pool.execute("SELECT id FROM cities WHERE name = ?", [
        city,
      ]);
      cityId = c[0]?.id;
    }

    // Simple update
    const updates = [];
    const params = [];
    if (name) {
      updates.push("name=?");
      params.push(name);
    }
    if (mobile !== undefined) {
      updates.push("mobile=?");
      params.push(mobile);
    }
    if (cityId) {
      updates.push("city_id=?");
      params.push(cityId);
    }

    if (updates.length > 0) {
      params.push(req.user.userId);
      await pool.execute(
        `UPDATE users SET ${updates.join(",")} WHERE id=?`,
        params,
      );
    }
    // Fetch updated
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, r.name as role, c.name as city, u.mobile 
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN cities c ON u.city_id = c.id
             WHERE u.id = ?`,
      [req.user.userId],
    );
    res.json({ user: rows[0], message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- USERS ---

app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, r.name as role, c.name as city, u.mobile, u.created_at as createdAt
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN cities c ON u.city_id = c.id
             ORDER BY u.created_at DESC`,
    );
    res.json({ users: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", authenticateToken, authorizeAdmin, async (req, res) => {
  // Admin create user logic (simplified duplicate of register but with role)
  try {
    const { name, email, password, role, city, mobile } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [r] = await pool.execute("SELECT id FROM roles WHERE name = ?", [
      role || "CUSTOMER",
    ]);
    const roleId = r[0]?.id;

    let cityId = null;
    if (city) {
      const [c] = await pool.execute("SELECT id FROM cities WHERE name = ?", [
        city,
      ]);
      cityId = c[0]?.id;
    }

    const [resDb] = await pool.execute(
      "INSERT INTO users (name, email, password, role_id, city_id, mobile) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, roleId, cityId, mobile],
    );
    res.status(201).json({ message: "User created", userId: resDb.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { name, email, role, city, mobile } = req.body;

    let roleId = null;
    if (role) {
      const [r] = await pool.execute("SELECT id FROM roles WHERE name = ?", [
        role,
      ]);
      roleId = r[0]?.id;
    }

    let cityId = null;
    if (city) {
      const [c] = await pool.execute("SELECT id FROM cities WHERE name = ?", [
        city,
      ]);
      cityId = c[0]?.id;
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name=?");
      params.push(name);
    }
    if (email !== undefined) {
      updates.push("email=?");
      params.push(email);
    }
    if (roleId !== null) {
      updates.push("role_id=?");
      params.push(roleId);
    }
    if (cityId !== null) {
      updates.push("city_id=?");
      params.push(cityId);
    }
    if (mobile !== undefined) {
      updates.push("mobile=?");
      params.push(mobile);
    }

    if (updates.length > 0) {
      params.push(req.params.id);
      await pool.execute(
        `UPDATE users SET ${updates.join(", ")} WHERE id=?`,
        params,
      );
    }

    res.json({ message: "User updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete(
  "/api/users/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- PRODUCTS ---

const getProductQuery = `
    SELECT p.id, p.name, p.category, p.description, p.price, p.stock, p.specifications, p.created_at as createdAt,
    GROUP_CONCAT(pi.image_url) as image_urls
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
`;

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `${getProductQuery} GROUP BY p.id ORDER BY p.created_at DESC`,
    );
    res.json({ products: rows.map(formatProduct) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `${getProductQuery} WHERE p.id = ? GROUP BY p.id`,
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Product not found" });
    res.json({ product: formatProduct(rows[0]) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/category/:category", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `${getProductQuery} WHERE p.category = ? GROUP BY p.id`,
      [req.params.category],
    );
    res.json({
      products: rows.map(formatProduct),
      category: req.params.category,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const [rows] = await pool.execute(
      `${getProductQuery} WHERE p.name LIKE ? OR p.description LIKE ? GROUP BY p.id`,
      [`%${q}%`, `%${q}%`],
    );
    res.json({ products: rows.map(formatProduct), query: q });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/products",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 5),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { name, category, description, price, stock, specifications } =
        req.body;
      const [result] = await connection.execute(
        "INSERT INTO products (name, category, description, price, stock, specifications) VALUES (?, ?, ?, ?, ?, ?)",
        [
          name,
          category,
          description,
          price,
          stock || 0,
          specifications || "{}",
        ],
      );
      const productId = result.insertId;
      if (req.files) {
        for (const file of req.files) {
          await connection.execute(
            "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
            [productId, `/uploads/${file.filename}`],
          );
        }
      }
      await connection.commit();
      res.status(201).json({ message: "Product created", productId });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  },
);

app.put(
  "/api/products/:id",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 5),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const {
        name,
        category,
        description,
        price,
        stock,
        specifications,
        existingImages,
      } = req.body;

      await connection.execute(
        "UPDATE products SET name=?, category=?, description=?, price=?, stock=?, specifications=? WHERE id=?",
        [
          name,
          category,
          description,
          price,
          stock,
          specifications || "{}",
          req.params.id,
        ],
      );

      // Handle existing images
      if (existingImages !== undefined) {
        let keepImages = [];
        if (typeof existingImages === "string") {
          keepImages = existingImages
            .split(",")
            .filter((img) => img.trim() !== "");
        } else if (Array.isArray(existingImages)) {
          keepImages = existingImages;
        }

        if (keepImages.length > 0) {
          const placeholders = keepImages.map(() => "?").join(",");
          await connection.execute(
            `DELETE FROM product_images WHERE product_id = ? AND image_url NOT IN (${placeholders})`,
            [req.params.id, ...keepImages],
          );
        } else {
          await connection.execute(
            "DELETE FROM product_images WHERE product_id = ?",
            [req.params.id],
          );
        }
      }

      // Add new images
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await connection.execute(
            "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
            [req.params.id, `/uploads/${file.filename}`],
          );
        }
      }

      await connection.commit();
      res.json({ message: "Product updated" });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  },
);

app.delete(
  "/api/products/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("DELETE FROM products WHERE id=?", [req.params.id]);
      res.json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- SITES ---

app.get("/api/sites", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.id, s.name, s.address, s.status, s.start_date as startDate, s.completion_date as completionDate, s.description, c.name as city, s.city_id as cityId, s.created_at as createdAt,
       GROUP_CONCAT(si.image_url) as images
       FROM sites s 
       LEFT JOIN cities c ON s.city_id = c.id 
       LEFT JOIN site_images si ON s.id = si.site_id
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
    );
    const sites = rows.map((site) => ({
      ...site,
      images: site.images ? site.images.split(",") : [],
    }));
    res.json({ sites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/sites/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.id, s.name, s.address, s.status, s.start_date as startDate, s.completion_date as completionDate, s.description, c.name as city, s.city_id as cityId,
       GROUP_CONCAT(si.image_url) as images
       FROM sites s 
       LEFT JOIN cities c ON s.city_id = c.id 
       LEFT JOIN site_images si ON s.id = si.site_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Site not found" });

    const site = {
      ...rows[0],
      images: rows[0].images ? rows[0].images.split(",") : [],
    };
    res.json({ site });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/sites",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const {
        name,
        address,
        cityId,
        status,
        description,
        startDate,
        completionDate,
      } = req.body;
      const [resDb] = await pool.execute(
        "INSERT INTO sites (name, address, city_id, status, description, start_date, completion_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          address,
          cityId,
          status || "COMING_SOON",
          description,
          startDate,
          completionDate,
        ],
      );
      const siteId = resDb.insertId;

      if (req.files) {
        for (const file of req.files) {
          await pool.execute(
            "INSERT INTO site_images (site_id, image_url) VALUES (?, ?)",
            [siteId, `/uploads/${file.filename}`],
          );
        }
      }

      res.status(201).json({
        success: true,
        message: "Site created",
        siteId: siteId,
        site: { id: siteId, ...req.body },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.get("/api/sites/status/:status", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.id, s.name, s.address, s.status, s.start_date as startDate, s.completion_date as completionDate, s.description, c.name as city, s.city_id as cityId, s.created_at as createdAt 
       FROM sites s LEFT JOIN cities c ON s.city_id = c.id WHERE s.status = ? ORDER BY s.created_at DESC`,
      [req.params.status],
    );
    res.json({ success: true, sites: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put(
  "/api/sites/:id",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 10),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const {
        name,
        address,
        cityId,
        status,
        description,
        startDate,
        completionDate,
        existingImages, // Comma-separated or array of remaining images
      } = req.body;
      console.log("Updating site with data:", req.body);
      // Update site info
      await connection.execute(
        "UPDATE sites SET name=?, address=?, city_id=?, status=?, start_date=?, completion_date=?, description=? WHERE id=?",
        [
          name,
          address,
          cityId,
          status,
          startDate,
          completionDate,
          description,
          req.params.id,
        ],
      );

      // Handle existing images - if existingImages is provided, remove others
      if (existingImages !== undefined) {
        let keepImages = [];
        if (typeof existingImages === "string") {
          keepImages = existingImages
            .split(",")
            .filter((img) => img.trim() !== "");
        } else if (Array.isArray(existingImages)) {
          keepImages = existingImages;
        }

        if (keepImages.length > 0) {
          const placeholders = keepImages.map(() => "?").join(",");
          await connection.execute(
            `DELETE FROM site_images WHERE site_id = ? AND image_url NOT IN (${placeholders})`,
            [req.params.id, ...keepImages],
          );
        } else {
          await connection.execute(
            "DELETE FROM site_images WHERE site_id = ?",
            [req.params.id],
          );
        }
      }

      // Add new images
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await connection.execute(
            "INSERT INTO site_images (site_id, image_url) VALUES (?, ?)",
            [req.params.id, `/uploads/${file.filename}`],
          );
        }
      }

      await connection.commit();
      res.json({ message: "Site updated successfully" });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  },
);

app.put(
  "/api/sites/:id/status",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("UPDATE sites SET status=? WHERE id=?", [
        req.body.status,
        req.params.id,
      ]);
      res.json({ message: "Site status updated" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/sites/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete images first if no ON DELETE CASCADE
      await connection.execute("DELETE FROM site_images WHERE site_id = ?", [
        req.params.id,
      ]);

      const [result] = await connection.execute(
        "DELETE FROM sites WHERE id=?",
        [req.params.id],
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Site not found" });
      }

      await connection.commit();
      res.json({ message: "Site and related images deleted successfully" });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  },
);

// --- INQUIRIES ---

app.get(
  "/api/inquiries",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT i.id, i.name, i.email, i.mobile, i.message, i.status, c.name as city, i.created_at as createdAt
             FROM inquiries i LEFT JOIN cities c ON i.city_id = c.id ORDER BY i.created_at DESC`,
      );
      res.json({ inquiries: rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.get(
  "/api/inquiries/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT i.id, i.name, i.email, i.mobile, i.message, i.status, c.name as city, i.created_at as createdAt
             FROM inquiries i LEFT JOIN cities c ON i.city_id = c.id WHERE i.id = ?`,
        [req.params.id],
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Inquiry not found" });
      res.json({ inquiry: rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post("/api/inquiries", async (req, res) => {
  try {
    const { name, email, mobile, message, city } = req.body;
    let cityId = null;
    if (city) {
      const [c] = await pool.execute("SELECT id FROM cities WHERE name=?", [
        city,
      ]);
      cityId = c[0]?.id;
    }
    const [result] = await pool.execute(
      "INSERT INTO inquiries (name, email, mobile, message, city_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, mobile, message, cityId],
    );
    res.status(201).json({
      success: true,
      message: "Inquiry submitted",
      data: { id: result.insertId },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get(
  "/api/inquiries/status/:status",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT i.id, i.name, i.email, i.mobile, i.message, i.status, c.name as city, i.created_at as createdAt
       FROM inquiries i LEFT JOIN cities c ON i.city_id = c.id WHERE i.status = ? ORDER BY i.created_at DESC`,
        [req.params.status],
      );
      res.json({ success: true, inquiries: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.put(
  "/api/inquiries/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { name, email, mobile, message, city, status } = req.body;
      let cityId = null;
      if (city) {
        const [c] = await pool.execute("SELECT id FROM cities WHERE name=?", [
          city,
        ]);
        cityId = c[0]?.id;
      }

      // Build dynamic update query
      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push("name=?");
        params.push(name);
      }
      if (email !== undefined) {
        updates.push("email=?");
        params.push(email);
      }
      if (mobile !== undefined) {
        updates.push("mobile=?");
        params.push(mobile);
      }
      if (message !== undefined) {
        updates.push("message=?");
        params.push(message);
      }
      if (cityId !== null) {
        updates.push("city_id=?");
        params.push(cityId);
      }
      if (status !== undefined) {
        updates.push("status=?");
        params.push(status);
      }

      if (updates.length > 0) {
        params.push(req.params.id);
        await pool.execute(
          `UPDATE inquiries SET ${updates.join(", ")} WHERE id=?`,
          params,
        );
      }

      res.json({ success: true, message: "Inquiry updated" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.put(
  "/api/inquiries/:id/status",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("UPDATE inquiries SET status=? WHERE id=?", [
        req.body.status,
        req.params.id,
      ]);
      res.json({ success: true, message: "Inquiry status updated" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.delete(
  "/api/inquiries/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("DELETE FROM inquiries WHERE id=?", [req.params.id]);
      res.json({ success: true, message: "Inquiry deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// --- CITIES ---

app.get("/api/cities", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM cities ORDER BY name ASC");
    res.json({ cities: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cities", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, state } = req.body;
    if (!name) return res.status(400).json({ error: "City name is required" });

    await pool.execute("INSERT INTO cities (name, state) VALUES (?, ?)", [
      name,
      state || "Madhya Pradesh",
    ]);

    // Return the newly created city
    const [rows] = await pool.execute("SELECT * FROM cities WHERE name = ?", [
      name,
    ]);
    res.status(201).json({ message: "City created", city: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put(
  "/api/cities/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { name, state } = req.body;
      await pool.execute("UPDATE cities SET name=?, state=? WHERE id=?", [
        name,
        state,
        req.params.id,
      ]);
      res.json({ message: "City updated" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/cities/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("DELETE FROM cities WHERE id=?", [req.params.id]);
      res.json({ message: "City deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- PAYMENTS ---

app.get(
  "/api/payments",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(`
            SELECT p.id, p.amount, p.payment_date as paymentDate, p.status, p.payment_method as paymentMethod, 
            p.created_at as createdAt, s.name as siteName, p.site_id as siteId
            FROM payments p
            LEFT JOIN sites s ON p.site_id = s.id
            ORDER BY p.created_at DESC
        `);
      res.json({ success: true, payments: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.get(
  "/api/payments/site/:siteId",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `
          SELECT p.id, p.amount, p.payment_date as paymentDate, p.status, p.payment_method as paymentMethod, 
          p.created_at as createdAt, s.name as siteName, p.site_id as siteId
          FROM payments p
          LEFT JOIN sites s ON p.site_id = s.id
          WHERE p.site_id = ?
          ORDER BY p.created_at DESC
      `,
        [req.params.siteId],
      );
      res.json({ success: true, payments: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.get(
  "/api/payments/status/:status",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `
          SELECT p.id, p.amount, p.payment_date as paymentDate, p.status, p.payment_method as paymentMethod, 
          p.created_at as createdAt, s.name as siteName, p.site_id as siteId
          FROM payments p
          LEFT JOIN sites s ON p.site_id = s.id
          WHERE p.status = ?
          ORDER BY p.created_at DESC
      `,
        [req.params.status],
      );
      res.json({ success: true, payments: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.get(
  "/api/payments-stats",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(`
          SELECT 
            SUM(amount) as totalRevenue,
            COUNT(*) as totalPayments,
            SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) as totalPaid,
            SUM(CASE WHEN status != 'PAID' THEN amount ELSE 0 END) as totalOutstanding
          FROM payments
      `);
      res.json({ success: true, stats: rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.post(
  "/api/payments",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const {
        siteId,
        amount,
        paymentDate,
        status,
        paymentMethod,
        transactionId,
        notes,
      } = req.body;
      if (!siteId || !amount)
        return res
          .status(400)
          .json({ success: false, error: "Site and Amount are required" });

      const [result] = await pool.execute(
        "INSERT INTO payments (site_id, amount, payment_date, status, payment_method, transaction_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          siteId,
          amount,
          paymentDate || new Date(),
          status || "UNPAID",
          paymentMethod,
          transactionId,
          notes,
        ],
      );
      res.status(201).json({
        success: true,
        message: "Payment recorded",
        payment: { id: result.insertId, ...req.body },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.put(
  "/api/payments/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { amount, paymentDate, status, paymentMethod, notes } = req.body;
      await pool.execute(
        "UPDATE payments SET amount=?, payment_date=?, status=?, payment_method=?, notes=? WHERE id=?",
        [amount, paymentDate, status, paymentMethod, notes, req.params.id],
      );
      res.json({ success: true, message: "Payment updated" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

app.delete(
  "/api/payments/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("DELETE FROM payments WHERE id=?", [req.params.id]);
      res.json({ success: true, message: "Payment deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// --- CONTENT PAGES ---

app.get("/api/content-pages", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, page_name as pageName, title, content, meta_description as metaDescription, is_active as isActive, created_at as createdAt, updated_at as updatedAt FROM content_pages ORDER BY page_name ASC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/content-pages/:pageName", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, page_name as pageName, title, content, meta_description as metaDescription, is_active as isActive, created_at as createdAt, updated_at as updatedAt FROM content_pages WHERE page_name = ?",
      [req.params.pageName],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    const page = rows[0];

    // Fetch associated images
    const [images] = await pool.execute(
      "SELECT id, image_url as imageUrl, caption, is_primary as isPrimary FROM content_page_images WHERE content_page_id = ?",
      [page.id],
    );

    page.images = images;

    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post(
  "/api/content-pages",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { pageName, title, content, metaDescription, isActive } = req.body;
      if (!pageName || !title || !content) {
        return res.status(400).json({
          success: false,
          message: "Page name, title, and content are required",
        });
      }

      const [result] = await pool.execute(
        "INSERT INTO content_pages (page_name, title, content, meta_description, is_active) VALUES (?, ?, ?, ?, ?)",
        [pageName, title, content, metaDescription || "", isActive ?? true],
      );

      const contentPageId = result.insertId;

      // Handle image uploads if any
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const imageUrl = `/uploads/${file.filename}`;
          await pool.execute(
            "INSERT INTO content_page_images (content_page_id, image_url) VALUES (?, ?)",
            [contentPageId, imageUrl],
          );
        }
      }

      res.status(201).json({
        success: true,
        message: "Content page created",
        data: { id: contentPageId },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

app.put(
  "/api/content-pages/:pageName",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 5),
  async (req, res) => {
    let connection;
    try {
      const { title, content, metaDescription, isActive } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: "Title and content are required",
        });
      }

      connection = await pool.getConnection();
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE content_pages SET title=?, content=?, meta_description=?, is_active=? WHERE page_name=?",
        [
          title,
          content,
          metaDescription || "",
          isActive === "true" || isActive === true,
          req.params.pageName,
        ],
      );

      // Get the page ID
      const [pages] = await connection.execute(
        "SELECT id FROM content_pages WHERE page_name = ?",
        [req.params.pageName],
      );

      if (pages.length > 0) {
        const contentPageId = pages[0].id;

        // Handle existing images
        const { existingImages } = req.body;
        if (existingImages !== undefined) {
          let keepImages = [];
          if (typeof existingImages === "string") {
            keepImages = existingImages
              .split(",")
              .filter((img) => img.trim() !== "");
          } else if (Array.isArray(existingImages)) {
            keepImages = existingImages;
          }

          if (keepImages.length > 0) {
            const placeholders = keepImages.map(() => "?").join(",");
            await connection.execute(
              `DELETE FROM content_page_images WHERE content_page_id = ? AND image_url NOT IN (${placeholders})`,
              [contentPageId, ...keepImages],
            );
          } else {
            await connection.execute(
              "DELETE FROM content_page_images WHERE content_page_id = ?",
              [contentPageId],
            );
          }
        }

        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            const imageUrl = `/uploads/${file.filename}`;
            await connection.execute(
              "INSERT INTO content_page_images (content_page_id, image_url) VALUES (?, ?)",
              [contentPageId, imageUrl],
            );
          }
        }
      }

      await connection.commit();
      res.json({ success: true, message: "Content page updated" });
    } catch (error) {
      if (connection) await connection.rollback();
      res.status(500).json({ success: false, message: error.message });
    } finally {
      if (connection) connection.release();
    }
  },
);

app.delete(
  "/api/content-pages/:pageName",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("DELETE FROM content_pages WHERE page_name=?", [
        req.params.pageName,
      ]);
      res.json({ success: true, message: "Content page deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// --- CONTACTS ---

app.get("/api/contacts", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, type, contact_value as contactValue, label, is_primary as isPrimary, is_active as isActive, order_priority as orderPriority, created_at as createdAt, updated_at as updatedAt FROM contacts ORDER BY order_priority ASC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/contacts/type/:type", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, type, contact_value as contactValue, label, is_primary as isPrimary, is_active as isActive, order_priority as orderPriority, created_at as createdAt, updated_at as updatedAt FROM contacts WHERE type = ? AND is_active = 1 ORDER BY order_priority ASC",
      [req.params.type],
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post(
  "/api/contacts",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { type, contactValue, label, isPrimary, isActive, orderPriority } =
        req.body;
      if (!type || !contactValue) {
        return res
          .status(400)
          .json({ success: false, message: "Type and value are required" });
      }

      const [result] = await pool.execute(
        "INSERT INTO contacts (type, contact_value, label, is_primary, is_active, order_priority) VALUES (?, ?, ?, ?, ?, ?)",
        [
          type,
          contactValue,
          label || "",
          isPrimary ?? false,
          isActive ?? true,
          orderPriority || 0,
        ],
      );
      res.status(201).json({
        success: true,
        message: "Contact added",
        data: { id: result.insertId },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

app.put(
  "/api/contacts/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { type, contactValue, label, isPrimary, isActive, orderPriority } =
        req.body;
      await pool.execute(
        "UPDATE contacts SET type=?, contact_value=?, label=?, is_primary=?, is_active=?, order_priority=? WHERE id=?",
        [
          type,
          contactValue,
          label || "",
          isPrimary ?? false,
          isActive ?? true,
          orderPriority || 0,
          req.params.id,
        ],
      );
      res.json({ success: true, message: "Contact updated" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

app.delete(
  "/api/contacts/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      await pool.execute("DELETE FROM contacts WHERE id=?", [req.params.id]);
      res.json({ success: true, message: "Contact deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// Error handling and 404
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong!", message: err.message });
});
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Toffan Glass Backend Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:5000/api/health`);
  console.log("📋 FULL CRUD Server ready.");
});

module.exports = app;
