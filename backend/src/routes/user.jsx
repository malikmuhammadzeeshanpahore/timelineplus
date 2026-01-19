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

module.exports = router;