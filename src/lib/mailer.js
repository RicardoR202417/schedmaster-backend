require("dotenv").config();
const nodemailer = require("nodemailer");

// 👇 AQUÍ
console.log("USER:", process.env.MAIL_USER);
console.log("PASS:", process.env.MAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transporter.verify((error) => {
  if (error) console.log("❌ Error Mailer:", error);
  else console.log("✅ Servidor de correo oficial listo");
});

module.exports = transporter;