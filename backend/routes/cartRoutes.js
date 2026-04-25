const express = require("express");
const router = express.Router();
const db = require("../db");

// ➕ Add to cart (with duplicate handling)
router.post("/add", (req, res) => {
      console.log("BODY:", req.body);
  const { user_email, product_id, quantity } = req.body;

  db.query(
    `INSERT INTO cart (user_email, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
    [user_email, product_id, quantity],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error saving cart");
      }
      res.send("Cart saved");
    }
  );
});

// 📦 Get cart for user
router.get("/:email", (req, res) => {
  const email = req.params.email;

  db.query(
    `SELECT 
      cart.product_id as id,
      cart.quantity,
      products.name,
      products.price,
      products.image
     FROM cart
     LEFT JOIN products ON cart.product_id = products.id
     WHERE cart.user_email = ?`,
    [email],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error fetching cart");
      }
      res.json(result);
    }
  );
});

module.exports = router;