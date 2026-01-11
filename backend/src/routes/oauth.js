const express = require('express');
const passport = require('../auth/passport');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();

// Initiate OAuth - redirect to provider
router.get('/oauth/:provider', (req, res, next) => {
  const { provider } = req.params;
  if (!['google', 'facebook'].includes(provider)) return res.status(400).send('Unsupported provider');

  const scopes = {
    google: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'],
    facebook: ['email', 'pages_show_list'],
  };

  passport.authenticate(provider, { scope: scopes[provider] })(req, res, next);
});

// Callback
router.get('/oauth/:provider/callback', (req, res, next) => {
  const { provider } = req.params;
  if (!['google', 'facebook'].includes(provider)) return res.status(400).send('Unsupported provider');

  passport.authenticate(provider, { session: true }, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'No user' });
    res.json({ success: true, user: { id: user.id, email: user.email } });
  })(req, res, next);
});

// Revoke / unlink
router.post('/oauth/unlink', async (req, res) => {
  const { userId, provider } = req.body;
  if (!userId || !provider) return res.status(400).send('userId and provider required');
  const prisma = new PrismaClient();
  const acc = await prisma.userSocialAccount.updateMany({ where: { userId: Number(userId), provider }, data: { status: 'revoked', syncAt: new Date() } });
  res.json({ success: true, updated: acc.count });
});

module.exports = router;