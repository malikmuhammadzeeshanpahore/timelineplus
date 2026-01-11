const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { jwtMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/facebook', jwtMiddleware, async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).send('accessToken required');
  try {
    const resp = await axios.get('https://graph.facebook.com/me', { params: { access_token: accessToken, fields: 'id,name,email' } });
    const data = resp.data;
    const providerUserId = data.id;
    const email = data.email || `${providerUserId}@facebook.local`;

    const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
    if (!user) return res.status(404).send('user not found');

    await prisma.userSocialAccount.upsert({
      where: { provider_providerUserId: { provider: 'facebook', providerUserId } },
      update: { accessToken, status: 'linked', syncAt: new Date(), userId: user.id },
      create: { provider: 'facebook', providerUserId, accessToken, status: 'linked', syncAt: new Date(), userId: user.id },
    });

    res.json({ success: true, provider: 'facebook', providerUserId, email });
  } catch (err) {
    console.error('FB link error', (err && err.response && err.response.data) || err.message || err);
    res.status(400).json({ error: 'invalid token or unable to fetch profile' });
  }
});

router.post('/google', jwtMiddleware, async (req, res) => {
  const { idToken, accessToken } = req.body;
  if (!idToken && !accessToken) return res.status(400).send('idToken or accessToken required');
  try {
    let data = null;
    if (idToken) {
      const resp = await axios.get('https://oauth2.googleapis.com/tokeninfo', { params: { id_token: idToken } });
      data = resp.data;
    } else {
      const resp = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
      data = resp.data;
    }
    const providerUserId = data.sub || data.user_id || data.id;
    const email = data.email;

    const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
    if (!user) return res.status(404).send('user not found');

    await prisma.userSocialAccount.upsert({
      where: { provider_providerUserId: { provider: 'google', providerUserId } },
      update: { accessToken: accessToken || null, refreshToken: null, status: 'linked', syncAt: new Date(), userId: user.id },
      create: { provider: 'google', providerUserId, accessToken: accessToken || null, refreshToken: null, status: 'linked', syncAt: new Date(), userId: user.id },
    });

    res.json({ success: true, provider: 'google', providerUserId, email });
  } catch (err) {
    console.error('Google link error', (err && err.response && err.response.data) || err.message || err);
    res.status(400).json({ error: 'invalid token or unable to fetch profile' });
  }
});

module.exports = router;