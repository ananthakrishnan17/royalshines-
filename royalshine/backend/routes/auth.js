const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Srini@2005",
  database: "royalshines",
});

// ✅ Register
router.post("/register", async (req, res) => {
  const { fullname, email, phone, password } = req.body;

  try {
    // check if user already exists
    const [existing] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (existing.length > 0) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // insert into DB
    await db.query(
      "INSERT INTO users (fullname, email, phone, password) VALUES (?,?,?,?)",
      [fullname, email, phone, hashed]
    );

    res.json({ success: true, message: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (user.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user[0].id,
        fullname: user[0].fullname,
        email: user[0].email,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

// ✅ Admin Login
router.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

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

module.exports = router;
