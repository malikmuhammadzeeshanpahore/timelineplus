const dotenv = require('dotenv');
const path = require('path');

// Load creds.env if present
const envPath = path.resolve(process.cwd(), 'creds.env');
dotenv.config({ path: envPath });
// fallback to .env
dotenv.config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-me';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = (process.env.SMTP_SECURE || 'true') === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/google/callback';

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/facebook/callback';

const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID || '';
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const TIKTOK_CALLBACK_URL = process.env.TIKTOK_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/tiktok/callback';

module.exports = {
  PORT,
  JWT_SECRET,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK_URL,
  TIKTOK_CLIENT_ID,
  TIKTOK_CLIENT_SECRET,
  TIKTOK_CALLBACK_URL,
};