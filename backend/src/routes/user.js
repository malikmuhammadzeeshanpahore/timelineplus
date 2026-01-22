const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { jwtMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/me', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  const user = await prisma.user.findUnique({ where: { id: uid }, include: { social: true, withdrawals: true } });
  if (!user) return res.status(404).send('not found');
  const sum = await prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { userId: uid } });
  const balance = sum._sum.amount || 0;
  res.json({ 
    user: { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      photo: user.photo, 
      emailVerified: user.emailVerified, 
      isBanned: user.isBanned,
      role: user.role || 'guest'  // Include role field
    }, 
    social: user.social, 
    balance 
  });
});

router.get('/social', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  const social = await prisma.userSocialAccount.findMany({ where: { userId: uid } });
  res.json({ social });
});

router.post('/social/unlink', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  const { provider } = req.body;
  if (!provider) return res.status(400).send('provider required');
  await prisma.userSocialAccount.updateMany({ where: { userId: uid, provider }, data: { status: 'revoked', syncAt: new Date() } });
  res.json({ success: true });
});

// Update profile including withdrawal account details
router.post('/profile/update', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  const {
    fullName,
    username,
    accountHolderName,
    accountType,
    accountNumber,
    bankName,
    iban
  } = req.body;

  try {
    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (username !== undefined) data.username = username;
    if (accountHolderName !== undefined) data.accountHolderName = accountHolderName;
    if (accountType !== undefined) data.accountType = accountType;
    if (accountNumber !== undefined) data.accountNumber = accountNumber;
    if (bankName !== undefined) data.bankName = bankName;
    if (iban !== undefined) data.iban = iban;

    const updated = await prisma.user.update({ where: { id: uid }, data });
    res.json({ success: true, user: { id: updated.id, email: updated.email, username: updated.username, fullName: updated.fullName } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get referrals (team) for current user
router.get('/referrals', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  try {
    const referrals = await prisma.referral.findMany({ where: { referrerId: uid }, include: { referee: { select: { id: true, email: true, username: true, isBanned: true, createdAt: true } } } });
    const list = referrals.map(r => ({ id: r.id, referee: r.referee, bonus: r.bonus, createdAt: r.createdAt }));
    res.json({ referrals: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate invite link for current user
router.post('/invite', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  try {
    const url = `${req.protocol}://${req.get('host')}/register?referrerId=${uid}`;
    res.json({ inviteUrl: url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;