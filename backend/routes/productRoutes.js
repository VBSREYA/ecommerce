const express = require("express");
const router = express.Router();
const db = require("../db");

// ➕ ADD PRODUCT
router.post("/add", (req, res) => {
  const { name, description, price, image } = req.body;

  const sql =
    "INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, description, price, image], (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ message: "Error adding product" });
    }

    res.json({
      message: "Product added successfully",
      id: result.insertId
    });
  });
});

// 📦 GET ALL PRODUCTS
router.get("/", (req, res) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      console.log("FETCH ERROR:", err);
      return res.status(500).json({ message: "Error fetching products" });
    }

    res.json(result);
  });
});

// ✏️ UPDATE PRODUCT
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;

  const sql = `
    UPDATE products 
    SET name=?, description=?, price=?, image=? 
    WHERE id=?
  `;

  db.query(sql, [name, description, price, image, id], (err, result) => {
    if (err) {
      console.log("UPDATE ERROR:", err);
      return res.status(500).json({ message: "Error updating product" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  });
});

module.exports = router;