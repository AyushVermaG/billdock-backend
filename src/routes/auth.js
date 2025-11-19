const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

// ----------------------------------------
// SIGNUP
// ----------------------------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Save user
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------
// LOGIN
// ----------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = rows[0];

    // Compare password
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
