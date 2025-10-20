// Get admin stats: total orders, total income, total profit
app.get("/api/admin/stats", (req, res) => {
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
app.get("/api/admin/sales-report", (req, res) => {
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
