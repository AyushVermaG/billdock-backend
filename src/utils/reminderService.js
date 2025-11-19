// backend/utils/reminderService.js
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const db = require("../config/db");

// Optional: load dotenv if you run this file directly in dev
// require('dotenv').config();

// Gmail Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password if 2FA enabled
  },
});

// verify transporter at startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Mail transporter verify failed:", err);
  } else {
    console.log("✅ Mail transporter is ready");
  }
});

async function sendReminder(email, name, title, due_date) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Reminder: ${title} is due soon`,
    html: `
      <h3>Hello ${name},</h3>
      <p>Your bill <b>${title}</b> is due on <b>${new Date(due_date).toLocaleDateString()}</b>.</p>
      <p>Please pay it before the due date.</p>
      <br>
      <p>Regards,<br>BillDock Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Reminder sent → ${email} (msgId: ${info.messageId})`);
  } catch (err) {
    console.error("❌ Reminder Error sending to", email, ":", err);
  }
}

async function checkReminders() {
  try {
    const [rows] = await db.query(`
      SELECT u.email, u.name, b.title, b.due_date 
      FROM bills b
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'Pending'
      AND DATEDIFF(b.due_date, CURDATE()) BETWEEN 0 AND 2
    `);

    if (!rows || rows.length === 0) {
      console.log("ℹ️ No reminders to send right now.");
      return;
    }

    // use for..of to allow awaiting each send (and better logging)
    for (const bill of rows) {
      try {
        await sendReminder(bill.email, bill.name, bill.title, bill.due_date);
      } catch (err) {
        console.error("❌ Failed for bill:", bill, err);
      }
    }
  } catch (err) {
    console.error("❌ checkReminders DB/query error:", err);
  }
}

// Schedule: every day at 9:00 AM Asia/Kolkata
cron.schedule(
  "59 10 * * *",
  () => {
    console.log("⏰ Running Reminder Job at 10:59 AM (Asia/Kolkata)");
    checkReminders();
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);


// Export functions so you can call checkReminders() manually from server.js for testing
module.exports = { checkReminders };