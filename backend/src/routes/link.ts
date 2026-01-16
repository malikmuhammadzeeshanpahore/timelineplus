import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { jwtMiddleware } from '../middleware/auth';
import { FACEBOOK_CLIENT_SECRET } from '../config';
// reuse JS helper
const { generateAppSecretProof } = require('../utils/facebook');

const router = express.Router();
const prisma = new PrismaClient();

// Link a Facebook account using FB access token obtained from client-side SDK
router.post('/facebook', jwtMiddleware, async (req: any, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).send('accessToken required');
  try {
    // validate and fetch profile
    const params: any = { access_token: accessToken, fields: 'id,name,email' };
    const proof = generateAppSecretProof(accessToken);
    if (proof) params.appsecret_proof = proof;
    const resp = await axios.get('https://graph.facebook.com/me', { params });
    const data = resp.data;
    const providerUserId = data.id;
    const email = data.email || `${providerUserId}@facebook.local`;

    // upsert user social account
    const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
    if (!user) return res.status(404).send('user not found');

    await prisma.userSocialAccount.upsert({
      where: { provider_providerUserId: { provider: 'facebook', providerUserId } },
      update: { accessToken, status: 'linked', syncAt: new Date(), userId: user.id },
      create: { provider: 'facebook', providerUserId, accessToken, status: 'linked', syncAt: new Date(), userId: user.id }
    });

    res.json({ success: true, provider: 'facebook', providerUserId, email });
  } catch (err: any) {
    console.error('FB link error', err?.response?.data || err.message || err);
    res.status(400).json({ error: 'invalid token or unable to fetch profile' });
  }
});

// Link a Google account using ID token or access token from client-side
router.post('/google', jwtMiddleware, async (req: any, res) => {
  const { idToken, accessToken } = req.body;
  if (!idToken && !accessToken) return res.status(400).send('idToken or accessToken required');
  try {
    let data: any = null;
    if (idToken) {
      // validate id_token
      const resp = await axios.get('https://oauth2.googleapis.com/tokeninfo', { params: { id_token: idToken } });
      data = resp.data;
    } else {
      const resp = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
      data = resp.data;
    }
    const providerUserId = data.sub || data.sub || data.user_id || data.id;
    const email = data.email;

    const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
    if (!user) return res.status(404).send('user not found');

    await prisma.userSocialAccount.upsert({
      where: { provider_providerUserId: { provider: 'google', providerUserId } },
      update: { accessToken: accessToken || null, refreshToken: null, status: 'linked', syncAt: new Date(), userId: user.id },
      create: { provider: 'google', providerUserId, accessToken: accessToken || null, refreshToken: null, status: 'linked', syncAt: new Date(), userId: user.id }
    });

    res.json({ success: true, provider: 'google', providerUserId, email });
  } catch (err: any) {
    console.error('Google link error', err?.response?.data || err.message || err);
    res.status(400).json({ error: 'invalid token or unable to fetch profile' });
  }
});

export default router;