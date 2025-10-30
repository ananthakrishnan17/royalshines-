// backend/orders.js
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Get all orders
router.get("/", (req, res) => {
  try {
    const sql = "SELECT * FROM orders";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Error fetching orders:", err);
        return res.status(500).json({ error: "Failed to fetch orders" });
      }
      res.json(results);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get orders for a specific user
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  // Check for authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  // Verify token
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.id != userId) {
      return res.status(403).json({ success: false, message: "Unauthorized: Access denied" });
    }
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }

  // Query to get orders with items
  const sql = `
    SELECT o.id, o.user_id, o.total_amount, o.payment_method, o.shipping_address, o.status, o.created_at,
           JSON_ARRAYAGG(JSON_OBJECT('product_name', oi.product_name, 'quantity', oi.quantity, 'price', oi.price)) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching orders:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    // Parse the items JSON
    const orders = results.map(order => ({
      ...order,
      items: JSON.parse(order.items) || []
    }));

    res.json(orders);
  });
});

// Get admin stats: total orders, total income, total profit
router.get("/admin/stats", (req, res) => {
  // Total orders
  const totalOrdersSql = "SELECT COUNT(*) AS totalOrders FROM orders";
  db.query(totalOrdersSql, (err, ordersResult) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    const totalOrders = ordersResult[0].totalOrders;

    // Total income (sum of total_amount)
    const totalIncomeSql = "SELECT SUM(total_amount) AS totalIncome FROM orders";
    db.query(totalIncomeSql, (err2, incomeResult) => {
      if (err2) return res.status(500).json({ success: false, message: "Database error" });
      const totalIncome = incomeResult[0].totalIncome || 0;

      // Total profit: assuming cost is 70% of selling price (30% margin)
      // Need to sum over order_items: (price - 0.7*price) * quantity = 0.3 * price * quantity
      const totalProfitSql = "SELECT SUM(price * quantity * 0.3) AS totalProfit FROM order_items";
      db.query(totalProfitSql, (err3, profitResult) => {
        if (err3) return res.status(500).json({ success: false, message: "Database error" });
        const totalProfit = profitResult[0].totalProfit || 0;

        res.json({
          success: true,
          stats: {
            totalOrders,
            totalIncome: parseFloat(totalIncome).toFixed(2),
            totalProfit: parseFloat(totalProfit).toFixed(2)
          }
        });
      });
    });
  });
});

// Get sales report aggregated by period (day, month, year)
router.get("/admin/sales-report", (req, res) => {
  const { period } = req.query; // 'day', 'month', 'year'

  let groupBy;
  if (period === 'day') {
    groupBy = "DATE(created_at)";
  } else if (period === 'month') {
    groupBy = "DATE_FORMAT(created_at, '%Y-%m')";
  } else if (period === 'year') {
    groupBy = "YEAR(created_at)";
  } else {
    return res.status(400).json({ success: false, message: "Invalid period. Use 'day', 'month', or 'year'." });
  }

  const sql = `
    SELECT ${groupBy} AS period, SUM(total_amount) AS total_sales, COUNT(*) AS order_count
    FROM orders
    GROUP BY ${groupBy}
    ORDER BY period DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    res.json({
      success: true,
      period,
      data: results.map(row => ({
        period: row.period,
        total_sales: parseFloat(row.total_sales).toFixed(2),
        order_count: row.order_count
      }))
    });
  });
});

// Get sales report as PDF
router.get("/admin/sales-report/pdf", (req, res) => {
  const { period } = req.query; // 'day', 'month', 'year'

  let whereClause = '';
  if (period === 'day') {
    whereClause = "DATE(o.created_at) = CURDATE()";
  } else if (period === 'month') {
    whereClause = "MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())";
  } else if (period === 'year') {
    whereClause = "YEAR(o.created_at) = YEAR(CURDATE())";
  } else {
    return res.status(400).json({ success: false, message: "Invalid period. Use 'day', 'month', or 'year'." });
  }

  const sql = `
    SELECT o.id as order_id, o.user_id as customer_id, o.product_name as collection_name,
           o.created_at as purchase_date, COALESCE(p.created_at, o.created_at) as payment_date
    FROM orders o
    LEFT JOIN payments p ON o.id = p.order_id
    WHERE ${whereClause}
    ORDER BY o.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${period}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text(`Sales Report (${period.charAt(0).toUpperCase() + period.slice(1)})`, { align: 'center' });
    doc.moveDown();

    // Add table headers
    const tableTop = 150;
    const itemHeight = 20;

    doc.fontSize(12).text('Customer ID', 30, tableTop);
    doc.text('Collection Name', 100, tableTop);
    doc.text('Payment Date', 250, tableTop);
    doc.text('Purchase Date', 350, tableTop);

    // Draw header line
    doc.moveTo(30, tableTop + 15).lineTo(500, tableTop + 15).stroke();

    // Add table rows
    let y = tableTop + itemHeight;
    results.forEach(row => {
      doc.fontSize(10).text(row.customer_id.toString(), 30, y);
      doc.text(row.collection_name, 100, y);
      doc.text(new Date(row.payment_date).toLocaleDateString(), 250, y);
      doc.text(new Date(row.purchase_date).toLocaleDateString(), 350, y);
      y += itemHeight;
    });

    // Finalize the PDF
    doc.end();
  });
});

module.exports = router;
