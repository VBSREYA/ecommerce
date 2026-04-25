require("./db");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Stanley@1106", // 👈 put your MySQL password
  database: "ecommerce"
});

db.connect((err) => {
  if (err) {
    console.log("DB error:", err);
  } else {
    console.log("MySQL Connected");
  }
});

module.exports = db;