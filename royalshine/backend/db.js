const mysql = require("mysql2");

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

module.exports = db;
