# TimelinePlus — Backend (scaffold)

This folder contains a minimal scaffold for the TimelinePlus backend including OAuth provider integrations (Google, Facebook/Instagram, TikTok), SMTP mailer integration via `nodemailer`, and a manual withdraw workflow.

Quickstart

1. Copy `creds.env` (if you have it) to the project root or create a `.env` file using `.env.example`.
2. Install deps: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma migrate dev --name init`
5. Seed the DB: `node prisma/seed.js` (or `ts-node prisma/seed.ts` for dev)
6. Start dev server: `npm run dev`

Notes
- Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASS` env vars to control the admin seed credentials.
- For OAuth, configure provider apps and set callback URLs in your environment variables. For Facebook and Google we support both server-side and client-side SDK linking. Use the `public/oauth_test.html` page to test client-side linking and make sure to set the correct App IDs and JS origins as described below.

Facebook client-side testing
- Place your FB App ID in `public/oauth_test.html` (FB_APP_ID) and set the API version (e.g., v17.0).
- Add the JS origins and redirect URIs in the Facebook App settings (see `.env.example` comments).

Google client-side testing
- Use Google Identity Services (one-tap or button) and set your client id in `public/oauth_test.html`.
- The backend accepts `idToken` from the client and validates it using Google's tokeninfo endpoint.

Frontend SPA
- A simple Bootstrap 5 SPA is available at `public/index.html` and client logic in `public/app.js`.
- Update `{your-facebook-app-id}` and `{your-google-client-id}` placeholders in `public/app.js` and `public/index.html` before testing.
- The SPA uses the backend endpoints: `/api/auth/*`, `/api/user/*`, `/api/tasks`, `/api/link/*`, `/api/wallet/*` (jwt auth required).

Note: TikTok OAuth is currently disabled and will be integrated later when credentials are available.
- SMTP credentials should be stored in `creds.env` or `.env`. Do NOT commit actual passwords.

Notes
- SMTP credentials should be stored in `creds.env` or `.env`. Do NOT commit actual passwords.
- OAuth provider client ids/secrets must be configured in environment variables and callback URLs registered with providers.
- Withdraws with `method: 'manual'` are intended to be paid out by an admin manually; approving a withdraw will create a wallet transaction record.
