// backend/server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

// Routes
const collectionsRoutes = require("./routes/collections");
const authRoutes = require("./routes/auth");
const wishlistRoutes = require("./routes/wishlist");
const ordersRoutes = require("./orders");
const feedbackRoutes = require("./routes/feedback");

const app = express();
app.use(cors());
app.use(express.json());

// --- GLOBAL CONSTANTS ---
const SECRET_KEY = "royalshine_secret";
// ---
// ==================== DATABASE (Promise-based connection) ====================
const db = mysql.createConnection({
    // host: "localhost",
    // user: "root",
    // password: "Srini@2005",
    // database: "royalshines",

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}).promise(); 

db.connect((err) => {
    if (err) console.error("❌ DB connection failed:", err.stack);
    else console.log("✅ MySQL Connected to royalshine DB");
});

// Middleware to attach global objects to every request
app.use((req, res, next) => {
    req.db = db;
    req.SECRET_KEY = SECRET_KEY;
    next();
});

// ==================== EMAIL CONFIG ====================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "maniselvisrini@gmail.com", 
        pass: "tpnmvoxklvjmedlp", 
    },
});
transporter.verify((error, success) => {
    if (error) console.error("Email transporter error:", error);
    else console.log("✅ Email server ready to send messages");
});


// ==================== REGISTER API (Synchronized to use 'users' table) ====================
app.post("/api/register", async (req, res) => {
    const { fullname, email, phone, password } = req.body;

    if (!fullname || !email || !phone || !password)
        return res.status(400).json({ success: false, message: "All fields required" });

    try {
        const [existing] = await db.query("SELECT id FROM users WHERE email=?", [email]);

        if (existing.length > 0)
            return res.json({ success: false, message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert directly into the 'users' table (FIXED)
        const [result] = await db.query(
            "INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)",
            [fullname, email, phone, hashedPassword]
        );
        const newUserId = result.insertId;
        
        // Send confirmation email (FIXED with placeholder HTML)
        const mailOptions = { 
            from: '"Royal Shine Jewels" <maniselvisrini@gmail.com>',
            to: email,
            subject: "Welcome to Royal Shine Jewels - Registration Confirmation",
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Welcome, ${fullname}!</h2>
                    <p>Your Royal Shine Jewels account has been successfully created.</p>
                </div>
            `,
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error("❌ Error sending email:", error);
            else console.log("✅ Confirmation email sent:", info.response);
        });

        res.json({
            success: true,
            message: "Registration successful! Please check your email for confirmation.",
            userId: newUserId,
        });
    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== LOGIN API (Synchronized to use 'users' table) ====================
app.post("/api/login", async (req, res) => {
    const { name, email, password } = req.body;

    if (!password) return res.status(400).json({ success: false, message: "Password required" });

    // Admin login check
    if (email === "admin@royal.com" && password === "admin123") {
        const adminToken = jwt.sign({ id: 0, email: email, role: 'admin' }, SECRET_KEY, { expiresIn: "2h" });
        return res.json({ success: true, isAdmin: true, token: adminToken, message: "Admin login successful" });
    }

    // User login by name or email
    if (!name && !email) return res.status(400).json({ success: false, message: "Name or Email required" });

    try {
        let query = "SELECT * FROM users WHERE ";
        let params = [];

        if (name) {
            query += "fullname = ?";
            params.push(name);
        } else {
            query += "email = ?";
            params.push(email);
        }

        const [result] = await db.query(query, params);
        if (result.length === 0) return res.json({ success: false, message: "Invalid Name/Email or Password" });

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.json({ success: false, message: "Invalid Name/Email or Password" });

        // Generate token with 'id' from the 'users' table
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "2h" });

        res.json({
            success: true,
            token,
            userId: user.id,
            user: {
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                id: user.id // CRITICAL: Ensure ID is sent to frontend
            },
            isAdmin: false,
            message: "Login successful",
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// ==================== GET USERS (for admin dashboard) ====================
app.get("/api/users", async (req, res) => {
  try {
    const [results] = await db.query("SELECT id, fullname, email, phone FROM users ORDER BY id DESC");
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== GET CONTACTS (for admin dashboard) ====================
app.get("/api/contacts", async (req, res) => {
  try {
    const [results] = await db.query("SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC");
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching contacts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== ADMIN REGISTER USER ====================
app.post("/api/admin/register-user", async (req, res) => {
  const { fullname, email, phone, password } = req.body;

  // Check for authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  // Verify admin token
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized: Admin access required" });
    }
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }

  // Validate inputs
  if (!fullname || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email=?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)",
      [fullname, email, phone, hashedPassword]
    );
    const newUserId = result.insertId;

    // Send confirmation email
    const mailOptions = {
      from: '"Royal Shine Jewels" <maniselvisrini@gmail.com>',
      to: email,
      subject: "Welcome to Royal Shine Jewels - Account Created by Admin",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome, ${fullname}!</h2>
          <p>Your Royal Shine Jewels account has been created by an administrator.</p>
          <p>You can now login with your email and password.</p>
          <p>Best regards,<br>The Royal Shine Jewels Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error("❌ Error sending email:", error);
      else console.log("✅ Confirmation email sent:", info.response);
    });

    res.json({
      success: true,
      message: "User registered successfully! Confirmation email sent.",
      userId: newUserId,
    });
  } catch (err) {
    console.error("❌ Admin register user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== CONTACT API ====================
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Insert contact message into database
    const [result] = await db.query(
      "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message]
    );

    // Send email notification to admin
    const mailOptions = {
      from: '"Royal Shine Jewels Contact" <maniselvisrini@gmail.com>',
      to: "maniselvisrini@gmail.com", // Admin email
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Contact Message from ${name}</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error("❌ Error sending contact email:", error);
      else console.log("✅ Contact email sent:", info.response);
    });

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Contact error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== GOOGLE LOGIN API ====================
app.post("/api/google-login", async (req, res) => {
    const { credential } = req.body;

    if (!credential) return res.status(400).json({ success: false, message: "Credential required" });

    try {
        // Initialize OAuth2Client with Google Client ID
        const client = new OAuth2Client("214862082349-v26rc2j9l4k2lc5ciosmadk8feps8a29.apps.googleusercontent.com");

        // Verify the credential token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: "214862082349-v26rc2j9l4k2lc5ciosmadk8feps8a29.apps.googleusercontent.com", // Same as above
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        if (!email) return res.status(400).json({ success: false, message: "Email not provided by Google" });

        // Check if user exists
        const [existing] = await db.query("SELECT * FROM users WHERE email=?", [email]);

        let user;
        if (existing.length > 0) {
            user = existing[0];
        } else {
            // Create new user for Google login (no password)
            const [result] = await db.query(
                "INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, NULL, NULL)",
                [name, email]
            );
            user = { id: result.insertId, fullname: name, email: email, phone: null };
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "2h" });

        res.json({
            success: true,
            token,
            userId: user.id,
            user: {
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                id: user.id
            },
            isAdmin: false,
            message: "Google login successful",
        });
    } catch (err) {
        console.error("❌ Google login error:", err);
        res.status(500).json({ success: false, message: "Google login failed" });
    }
});

// ==================== CHECK ORDERS API ====================
app.get("/api/check-orders", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM orders");
    res.json({ success: true, orders: results });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== OTHER ROUTES ====================
app.use("/api/collections", collectionsRoutes);
app.use("/api/auth", authRoutes); // Deletion route lives here
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/feedback", feedbackRoutes(transporter, db));

// ==================== START SERVER ====================
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
