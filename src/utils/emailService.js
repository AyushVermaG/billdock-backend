const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendBillAddedEmail(to, name, title, amount, due_date) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `New Bill Added: ${title}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>A new bill has been added to your BillDock account.</p>
      <p><b>Bill:</b> ${title}</p>
      <p><b>Amount:</b> INR ${amount}</p>
      <p><b>Due Date:</b> ${due_date}</p>
      <br>
      <p>Regards,</p>
      <p><b>BillDock Team</b></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Bill Added Email Sent →", to);
  } catch (error) {
    console.log("❌ Email Send Error:", error.message);
  }
}

module.exports = { sendBillAddedEmail };
