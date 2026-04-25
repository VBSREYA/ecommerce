const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Stanley@1106",   // use your password
  database: "ecommerce"
});

db.connect((err) => {
  if (err) {
    console.log("❌ Error connecting to MySQL:", err);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

module.exports = db;