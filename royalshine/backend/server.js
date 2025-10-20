// backend/server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Routes
const authRoutes = require("./routes/auth");
const collectionsRoutes = require("./routes/collections");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "royalshine_secret"; // use env in production

// ==================== DATABASE ====================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Srini@2005",
  database: "royalshines",
});

db.connect((err) => {
  if (err) console.error("❌ DB connection failed:", err);
  else console.log("✅ MySQL Connected to royalshine DB");
});

// ==================== REGISTER API ====================
app.post("/api/register", async (req, res) => {
  const { fullname, email, phone, password } = req.body;

  if (!fullname || !email || !phone || !password)
    return res.status(400).json({ success: false, message: "All fields required" });

  try {
    // Check if email already exists in register
    const checkSql = "SELECT * FROM register WHERE email=?";
    db.query(checkSql, [email], async (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      if (result.length > 0) return res.json({ success: false, message: "Email already registered" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into register
      const insertRegisterSql = "INSERT INTO register (fullname, email, phone, password) VALUES (?, ?, ?, ?)";
      db.query(insertRegisterSql, [fullname, email, phone, hashedPassword], (err2, result2) => {
        if (err2) return res.status(500).json({ success: false, message: "Database error" });

        const registerId = result2.insertId;

        // Insert into users using register_id
        const insertUserSql = `
          INSERT INTO users (register_id, username, email, password, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertUserSql, [registerId, fullname, email, hashedPassword, "user"], (err3) => {
          if (err3) console.error("❌ DB error inserting into users:", err3);
          res.json({ success: true, message: "Registration successful", userId: registerId });
        });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== LOGIN API ====================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: "All fields required" });

  // Admin login
  if (email === "admin@royal.com" && password === "admin123") {
    return res.json({ success: true, isAdmin: true, message: "Admin login successful" });
  }

  const sql = "SELECT * FROM register WHERE email=?";
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length === 0) return res.json({ success: false, message: "Invalid Email or Password" });

    const registerUser = result[0];

    // Compare password
    const match = await bcrypt.compare(password, registerUser.password);
    if (!match) return res.json({ success: false, message: "Invalid Email or Password" });

    // Get user row from users table
    const getUserSql = "SELECT * FROM users WHERE register_id=?";
    db.query(getUserSql, [registerUser.id], (err2, userResults) => {
      if (err2) return res.status(500).json({ success: false, message: "Database error" });

      let user = userResults[0];

      // If user row doesn't exist, create it
      if (!user) {
        const insertUserSql = `
          INSERT INTO users (register_id, username, email, password, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertUserSql, [registerUser.id, registerUser.fullname, registerUser.email, registerUser.password, "user"], (err3, res3) => {
          if (err3) return res.status(500).json({ success: false, message: "Database error" });
          user = { id: res3.insertId, ...registerUser, role: "user" };
          sendLoginResponse(user, registerUser);
        });
      } else {
        sendLoginResponse(user, registerUser);
      }

      function sendLoginResponse(userRow, registerRow) {
        const token = jwt.sign({ id: userRow.id, email: registerRow.email }, SECRET_KEY, { expiresIn: "2h" });
        res.json({
          success: true,
          token,
          userId: userRow.id,
          user: { id: userRow.id, fullname: registerRow.fullname, email: registerRow.email, phone: registerRow.phone },
          isAdmin: false,
          message: "Login successful",
        });
      }
    });
  });
});

// ==================== ADMIN LOGIN API ====================
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: "All fields required" });

  // Simple hardcoded admin credentials (for demo purposes)
  const adminEmail = "admin@royal.com";
  const adminPassword = "admin123";

  if (email === adminEmail && password === adminPassword) {
    res.json({
      success: true,
      message: "Admin login successful",
      adminToken: "admin_logged_in"
    });
  } else {
    res.json({ success: false, message: "Invalid admin credentials" });
  }
});

// ==================== AUTH MIDDLEWARE ====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid token" });
    req.user = user;
    next();
  });
}

// ==================== WISHLIST ====================
app.post("/api/wishlist/add", authenticateToken, (req, res) => {
  const { productId, productName, productImage, productCategory } = req.body;
  const userId = req.user.id;
  if (!productId || !productName) return res.status(400).json({ success: false, message: "Product ID and name required" });

  const checkSql = "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?";
  db.query(checkSql, [userId, productId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (results.length > 0) return res.json({ success: false, message: "Item already in wishlist" });

    const insertSql = `
      INSERT INTO wishlist (user_id, product_id, product_name, product_image, product_category, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    db.query(insertSql, [userId, productId, productName, productImage || null, productCategory || null], (err2, result) => {
      if (err2) return res.status(500).json({ success: false, message: "Failed to add to wishlist" });
      res.json({ success: true, message: "Added to Wishlist", wishlistId: result.insertId });
    });
  });
});

app.get("/api/wishlist", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM wishlist WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, wishlist: results });
  });
});

app.delete("/api/wishlist/remove/:productId", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const sql = "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?";
  db.query(sql, [userId, productId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.affectedRows === 0) return res.json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Removed from wishlist" });
  });
});
// Get wishlist for a specific user
app.get("/api/wishlist/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.execute("SELECT * FROM wishlist WHERE user_id = ?", [userId]);
    res.json({ success: true, wishlist: rows });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ==================== CONTACT ====================
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) return res.status(400).json({ success: false, message: "All fields required" });

  const sql = "INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())";
  db.query(sql, [name, email, subject, message], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, message: "Message sent successfully!" });
  });
});

// ==================== ADMIN ROUTES ====================
app.get("/api/contacts", (req, res) => {
  const sql = "SELECT * FROM contacts ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json(results);
  });
});

app.get("/api/users", (req, res) => {
  const sql = "SELECT id, fullname, email, phone FROM register ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json(results);
  });
});

app.get("/api/admin/orders", (req, res) => {
  const q = `
    SELECT
      o.id AS order_id,
      o.user_id,
      o.product_name,
      o.status AS order_status,
      p.payment_method,
      p.payment_status,
      P.CustomerId
    FROM orders o
    LEFT JOIN payments p ON o.id = p.order_id
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("Error fetching joined data:", err);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
    return res.json(data);
  });
});
// ==================== CART ====================

// Add item to cart
app.post("/api/cart/add", authenticateToken, (req, res) => {
  const { productId, productName, productImage, productCategory, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || !productName) {
    return res.status(400).json({ success: false, message: "Product ID and name required" });
  }

  const checkSql = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
  db.query(checkSql, [userId, productId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (results.length > 0) {
      // Update quantity if already in cart
      const updateSql = "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";
      db.query(updateSql, [quantity || 1, userId, productId], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: "Failed to update cart" });
        res.json({ success: true, message: "Cart updated" });
      });
    } else {
      // Insert new item
      const insertSql = `
        INSERT INTO cart (user_id, product_id, product_name, product_image, product_category, quantity, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      db.query(insertSql, [userId, productId, productName, productImage || null, productCategory || null, quantity || 1], (err3) => {
        if (err3) return res.status(500).json({ success: false, message: "Failed to add to cart" });
        res.json({ success: true, message: "Added to cart" });
      });
    }
  });
});

// Get user cart
app.get("/api/cart", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, cart: results });
  });
});

// Remove item from cart
app.delete("/api/cart/remove/:productId", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const sql = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
  db.query(sql, [userId, productId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.affectedRows === 0) return res.json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Removed from cart" });
  });
});

// Update item quantity
app.put("/api/cart/update", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || quantity < 1) return res.status(400).json({ success: false, message: "Invalid input" });

  const sql = "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";
  db.query(sql, [quantity, userId, productId], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, message: "Quantity updated" });
  });
});



// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/collections", collectionsRoutes);

// ==================== START SERVER ====================
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
