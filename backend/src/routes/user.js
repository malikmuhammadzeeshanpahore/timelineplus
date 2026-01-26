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
  
  // Use role from token (which already includes admin mix), fallback to user.role
  const displayRole = req.user.role || user.role || 'guest';
  
  res.json({ 
    user: { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      fullName: user.fullName,
      age: user.age,
      gender: user.gender,
      city: user.city,
      photo: user.photo, 
      emailVerified: user.emailVerified, 
      isBanned: user.isBanned,
      role: displayRole  // Include role field from token
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
    age,
    gender,
    city,
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
    if (age !== undefined) data.age = (age === null || age === '') ? null : Number(age);
    if (gender !== undefined) data.gender = gender;
    if (city !== undefined) data.city = city;
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

// Check if user has completed withdrawal details
router.get('/withdrawal-details', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: uid },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        accountHolderName: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isComplete = !!(user.bankName && user.accountNumber && user.accountHolderName);

    res.json({
      isComplete,
      bankName: user.bankName || null,
      accountNumber: user.accountNumber || null,
      accountHolderName: user.accountHolderName || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user withdrawal details
router.post('/withdrawal-details', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  const { bankName, accountNumber, accountHolderName } = req.body;

  if (!bankName || !accountNumber || !accountHolderName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: uid },
      data: {
        bankName,
        accountNumber,
        accountHolderName
      }
    });

    res.json({
      success: true,
      message: 'Withdrawal details updated successfully',
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      accountHolderName: user.accountHolderName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;