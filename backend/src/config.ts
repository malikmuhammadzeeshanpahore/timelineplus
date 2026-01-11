import dotenv from 'dotenv';
import path from 'path';

// Load creds.env if present (the user indicated they may keep SMTP creds there)
const envPath = path.resolve(process.cwd(), 'creds.env');
dotenv.config({ path: envPath });
// fallback to .env
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'replace-me';

export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
export const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
export const SMTP_SECURE = (process.env.SMTP_SECURE || 'true') === 'true';
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/google/callback';

export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
export const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/facebook/callback';

export const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID || '';
export const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
export const TIKTOK_CALLBACK_URL = process.env.TIKTOK_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/tiktok/callback';
