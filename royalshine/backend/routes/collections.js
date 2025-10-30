const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Srini@2005",
  database: "royalshines",
});

// Get all collections
router.get("/", (req, res) => {
  const sql = "SELECT * FROM collections ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, collections: results });
  });
});

// Add new collection (admin only)
router.post("/", (req, res) => {
  const { title, img, images, category, price, quantity } = req.body;
  const sql = "INSERT INTO collections (title, img, images, category, price, quantity) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [title, img, JSON.stringify(images || []), category, price, quantity], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to add collection" });
    res.json({ success: true, message: "Collection added successfully" });
  });
});

// Update collection (admin only)
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, img, images, category, price, quantity } = req.body;
  const sql = "UPDATE collections SET title=?, img=?, images=?, category=?, price=?, quantity=? WHERE id=?";
  db.query(sql, [title, img, JSON.stringify(images || []), category, price, quantity, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update collection" });
    res.json({ success: true, message: "Collection updated successfully" });
  });
});

// Delete collection (admin only)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM collections WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete collection" });
    res.json({ success: true, message: "Collection deleted successfully" });
  });
});

module.exports = router;
