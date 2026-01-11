const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = require('../config');

if (!SMTP_USER || !SMTP_PASS) {
  console.warn('SMTP_USER or SMTP_PASS not set - emails will not be sent until configured');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

async function sendMail(to, subject, html) {
  const info = await transporter.sendMail({ from: SMTP_USER, to, subject, html });
  return info;
}

module.exports = { transporter, sendMail };
