import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } from '../config';

if (!SMTP_USER || !SMTP_PASS) {
  console.warn('SMTP_USER or SMTP_PASS not set - emails will not be sent until configured');
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: SMTP_USER,
    to,
    subject,
    html,
  });
  return info;
}
