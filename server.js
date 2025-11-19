const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// 🚀 Load reminder cron job
require("./src/utils/reminderService");

const authRoutes = require("./src/routes/auth");
const billRoutes = require("./src/routes/bills");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/bills", billRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend running..." });
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
