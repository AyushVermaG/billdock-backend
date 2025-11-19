const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// 🚀 Load reminder cron job
require("./src/utils/reminderService");

const authRoutes = require("./src/routes/auth");
const billRoutes = require("./src/routes/bills");

const app = express();

// CORS Setup
app.use(
  cors({
    origin: "*", // (You can restrict later when frontend URL is fixed)
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());

// ROUTES (No /api prefix)
app.use("/auth", authRoutes);
app.use("/bills", billRoutes);

// Default Route
app.get("/", (req, res) => {
  res.json({ message: "Backend running..." });
});

// Render gives PORT automatically
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
