const dotenv = require('dotenv');
const path = require('path');

// Load creds.env if present (the user indicated they may keep SMTP creds there)
const envPath = path.resolve(process.cwd(), 'creds.env');
dotenv.config({ path: envPath });
// fallback to .env
dotenv.config();

module.exports.PORT = process.env.PORT || 3000;
module.exports.JWT_SECRET = process.env.JWT_SECRET || 'replace-me';

module.exports.SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
module.exports.SMTP_PORT = Number(process.env.SMTP_PORT || 465);
module.exports.SMTP_SECURE = (process.env.SMTP_SECURE || 'true') === 'true';
module.exports.SMTP_USER = process.env.SMTP_USER;
module.exports.SMTP_PASS = process.env.SMTP_PASS;

module.exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
module.exports.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
module.exports.GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/google/callback';

module.exports.FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
module.exports.FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
module.exports.FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/facebook/callback';

module.exports.TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID || '';
module.exports.TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
module.exports.TIKTOK_CALLBACK_URL = process.env.TIKTOK_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/tiktok/callback';
