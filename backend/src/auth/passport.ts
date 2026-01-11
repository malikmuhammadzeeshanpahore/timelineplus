import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { PrismaClient } from '@prisma/client';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK_URL,
  TIKTOK_CLIENT_ID,
  TIKTOK_CLIENT_SECRET,
  TIKTOK_CALLBACK_URL,
} from '../config';

const prisma = new PrismaClient();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err as any);
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
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Find or create user
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
          done(err as any);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth not configured (GOOGLE_CLIENT_ID / SECRET missing)');
}

// Facebook / Instagram (via Facebook provider) — request Instagram basic and pages as needed
if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'emails'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.id}@facebook.local`;
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({ data: { email, username: profile.displayName } });
          }

          await prisma.userSocialAccount.upsert({
            where: { provider_providerUserId: { provider: 'facebook', providerUserId: profile.id } },
            update: {
              accessToken,
              refreshToken,
              status: 'linked',
              syncAt: new Date(),
              userId: user.id,
            },
            create: {
              provider: 'facebook',
              providerUserId: profile.id,
              accessToken,
              refreshToken,
              status: 'linked',
              syncAt: new Date(),
              userId: user.id,
            },
          });
          done(null, user);
        } catch (err) {
          done(err as any);
        }
      }
    )
  );
} else {
  console.warn('Facebook OAuth not configured (FACEBOOK_CLIENT_ID / SECRET missing)');
}

// TikTok OAuth temporarily disabled — will integrate later when credentials and access are available
// NOTE: We left the code out intentionally to avoid initialization issues and to keep OAuth stable for Google/Facebook only.
console.log('TikTok OAuth is currently disabled (commented out)');

export default passport;