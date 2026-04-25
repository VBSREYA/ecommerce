const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.json());

require("./db"); // ✅ DB connection

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});