require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ========================
// 🔵 MIDDLEWARE
// ========================
app.use(express.json());

// ========================
// 🔵 CORS CONFIG
// ========================
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://ecommerce-one-gray-26.vercel.app" // deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// ========================
// 🔵 DB CONNECTION
// ========================
require("./db");

// ========================
// 🔵 ROUTES
// ========================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// ========================
// 🔵 TEST ROUTES
// ========================
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date()
  });
});

// ========================
// 🔵 404 HANDLER
// ========================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ========================
// 🔵 START SERVER
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});