require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ecommerce-one-gray-26.vercel.app/"
  ],
  credentials: true
}));
app.use(express.json());

require("./db"); // ✅ DB connection

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});