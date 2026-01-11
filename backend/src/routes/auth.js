const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { JWT_SECRET } = require('../config');
const { sendMail } = require('../services/mailer');

const prisma = new PrismaClient();
const router = express.Router();

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Register
router.post('/register', async (req, res) => {
  const { email, password, username, referrerId } = req.body;
  if (!email || !password) return res.status(400).send('email and password required');
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).send('email already in use');

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash, username } });

  if (referrerId) {
    try {
      await prisma.referral.create({ data: { referrerId: Number(referrerId), refereeId: user.id } });
    } catch (e) {
      console.warn('referral create failed', e);
    }
  }

  const token = signToken({ uid: user.id, type: 'verify' });
  const url = `${req.protocol}://${req.get('host')}/api/auth/verify?token=${token}`;
  await sendMail(user.email, 'Verify your email', `<p>Click to verify: <a href="${url}">${url}</a></p>`).catch(console.error);

  res.json({ success: true, user: { id: user.id, email: user.email } });
});

// Verify email
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('token required');
  try {
    const data = jwt.verify(String(token), JWT_SECRET);
    if (data.type !== 'verify') return res.status(400).send('invalid token');
    await prisma.user.update({ where: { id: Number(data.uid) }, data: { emailVerified: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'invalid token' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('email and password required');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).send('invalid credentials');
  if (user.isBanned) return res.status(403).send('account banned');
  if (user.lockedUntil && new Date() < user.lockedUntil) return res.status(403).send('account locked temporarily');

  const ok = user.password ? await bcrypt.compare(password, user.password) : false;
  if (!ok) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil = attempts >= 5 ? new Date(Date.now() + 60 * 60 * 1000) : null; // 1 hour lock
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts, lockedUntil } });
    return res.status(400).send('invalid credentials');
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });

  const token = signToken({ uid: user.id });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
});

// Request reset
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send('email required');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ success: true });

  const token = signToken({ uid: user.id, type: 'reset' });
  const url = `${req.protocol}://${req.get('host')}/api/auth/reset?token=${token}`;
  await sendMail(user.email, 'Reset your password', `<p>Click to reset: <a href="${url}">${url}</a></p>`).catch(console.error);
  res.json({ success: true });
});

// Reset
router.post('/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).send('token and password required');
  try {
    const data = jwt.verify(String(token), JWT_SECRET);
    if (data.type !== 'reset') return res.status(400).send('invalid token');
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: Number(data.uid) }, data: { password: hash } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'invalid token' });
  }
});

module.exports = router;