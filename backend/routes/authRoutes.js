const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if user exists
  const checkSql = "SELECT * FROM users WHERE email = ?";

  db.query(checkSql, [email], async (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

      db.query(
        insertSql,
        [name, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.log("INSERT ERROR:", err);
            return res.status(500).json({ message: "Error registering user" });
          }

          res.json({ message: "User registered successfully" });
        }
      );
    } catch (error) {
      console.log("HASH ERROR:", error);
      res.status(500).json({ message: "Error hashing password" });
    }
  });
});


// ================= LOGIN =================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // 🔐 CREATE TOKEN
      const token = jwt.sign(
        { id: user.id, email: user.email },
        "secretkey", // later move to .env
        { expiresIn: "1h" }
      );

      // ✅ RESPONSE
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });

    } catch (error) {
      console.log("BCRYPT ERROR:", error);
      res.status(500).json({ message: "Password compare error" });
    }
  });
});


// ================= EXPORT =================
module.exports = router;