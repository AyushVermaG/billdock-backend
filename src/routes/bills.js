const express = require("express");
const db = require("../config/db.js");
const { authenticateToken } = require("../middleware/auth.js");
const { sendBillAddedEmail } = require("../utils/emailService");


const router = express.Router();

// Add bill
router.post("/add", authenticateToken, (req, res) => {
  const { title, amount, due_date, category } = req.body;
  const userId = req.user.id;

  if (!title || !amount || !due_date) {
    return res.status(400).json({ message: "Missing fields" });
  }

db.query(
  "INSERT INTO bills (user_id, title, amount, due_date, category) VALUES (?, ?, ?, ?, ?)",
  [userId, title, amount, due_date, category || "Other"]
)

    .then(async () => {
  const [user] = await db.query("SELECT name, email FROM users WHERE id = ?", [userId]);

  if (user[0]) {
    sendBillAddedEmail(
      user[0].email,
      user[0].name,
      title,
      amount,
      due_date
    );
  }

  res.json({ message: "Bill added successfully" });
})

    .catch((err) => res.status(500).json(err));
});

// Get bills
router.get("/list", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query("SELECT * FROM bills WHERE user_id = ?", [userId])
    .then(([results]) => res.json({ bills: results }))
    .catch((err) => res.status(500).json(err));
});

// Delete bill
router.delete("/delete/:id", authenticateToken, (req, res) => {
  const billId = req.params.id;
  const userId = req.user.id;

  db.query("DELETE FROM bills WHERE id = ? AND user_id = ?", [billId, userId])
    .then(() => res.json({ message: "Bill deleted" }))
    .catch((err) => res.status(500).json(err));
});

router.put("/update/:id", authenticateToken, async (req, res) => {
   console.log("🔥 UPDATE ROUTE HIT!", req.params.id, req.body);
  try {
    const billId = req.params.id;
    const userId = req.user.id;

    let { status, title, amount, due_date, category } = req.body;

    // 🔥 FIX: Normalize due_date to YYYY-MM-DD only
    if (due_date) {
      due_date = due_date.split("T")[0];
    }

    console.log("Updating bill:", {
      billId,
      userId,
      status,
      title,
      amount,
      due_date,
      category,
    });

    await db.query(
      `UPDATE bills 
       SET status = ?, title = ?, amount = ?, due_date = ?, category = ?
       WHERE id = ? AND user_id = ?`,
      [status, title, amount, due_date, category, billId, userId]
    );

    res.json({ success: true, message: "Bill updated" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update bill" });
  }
});


module.exports = router;
