const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const axios = require('axios');
const { generateAppSecretProof } = require('../utils/facebook');
const { PrismaClient } = require('@prisma/client');
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK_URL,
} = require('../config');

const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google (includes YouTube read-only scope)
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from provider'));

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({ data: { email, username: profile.displayName } });
          }

          await prisma.userSocialAccount.upsert({
            where: { provider_providerUserId: { provider: 'google', providerUserId: profile.id } },
            update: {
              accessToken,
              refreshToken,
              scope: profile._json?.scope || null,
              status: 'linked',
              syncAt: new Date(),
              userId: user.id,
            },
            create: {
              provider: 'google',
              providerUserId: profile.id,
              accessToken,
              refreshToken,
              scope: profile._json?.scope || null,
              status: 'linked',
              syncAt: new Date(),
              userId: user.id,
            },
          });

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth not configured (GOOGLE_CLIENT_ID / SECRET missing)');
}

// Facebook / Instagram (via Facebook provider)
if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'emails'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Some FB apps require appsecret_proof for server -> Graph API calls.
          // Fetch profile directly using Graph API with appsecret_proof to avoid "appsecret_proof" errors.
          const proof = generateAppSecretProof(accessToken);
          const params = { access_token: accessToken, fields: 'id,name,email' };
          if (proof) params.appsecret_proof = proof;
          const resp = await axios.get('https://graph.facebook.com/me', { params });
          const fb = resp.data;
          const providerUserId = fb.id;
          const email = fb.email || `${providerUserId}@facebook.local`;

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({ data: { email, username: fb.name || profile.displayName } });
          }

          await prisma.userSocialAccount.upsert({
            where: { provider_providerUserId: { provider: 'facebook', providerUserId } },
            update: {
              accessToken,
              refreshToken,
              status: 'linked',
              syncAt: new Date(),
              userId: user.id,
            },
            create: {
              provider: 'facebook',
              providerUserId,
              accessToken,
              refreshToken,
              status: 'linked',
              syncAt: new Date(),
              userId: user.id,
            },
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
} else {
  console.warn('Facebook OAuth not configured (FACEBOOK_CLIENT_ID / SECRET missing)');
}

console.log('TikTok OAuth is currently disabled (commented out)');

module.exports = passport;
