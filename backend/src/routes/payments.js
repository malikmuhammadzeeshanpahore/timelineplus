const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { jwtMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Create withdraw request (manual payment method supported)
router.post('/withdraw', jwtMiddleware, async (req, res) => {
  const userId = Number(req.user.id);
  const { amount, method, details } = req.body;
  if (!amount || !method) return res.status(400).send('Missing fields');
  if (method !== 'manual' && method !== 'paypal' && method !== 'bank') {
    return res.status(400).send('Unsupported method');
  }

  const sum = await prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { userId } });
  const balance = sum._sum.amount || 0;
  if (Number(amount) > balance) return res.status(400).send('insufficient balance');

  const wr = await prisma.withdrawRequest.create({ data: { userId, amount: Number(amount), method, details } });
  require('../services/utils').notifyUser(userId, 'Withdraw requested', `Your withdraw request of ${amount} was created and is pending.`).catch(console.error);

  res.json({ success: true, withdraw: wr });
});

// top-up wallet (simple manual topup write, real provider integration omitted)
router.post('/topup', jwtMiddleware, async (req, res) => {
  const userId = Number(req.user.id);
  const { amount, method, ref } = req.body;
  if (!amount) return res.status(400).send('Missing amount');
  const tx = await prisma.walletTransaction.create({ data: { userId, amount: Number(amount), type: 'topup', meta: method || ref || 'manual' } });
  require('../services/utils').notifyUser(userId, 'Wallet topped up', `Your wallet was topped up with ${amount}.`).catch(console.error);
  res.json({ success: true, tx });
});

// get balance (current user)
router.get('/balance/me', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  const sum = await prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { userId: uid } });
  const balance = sum._sum.amount || 0;
  res.json({ balance });
});

// get wallet history (current user)
router.get('/history/me', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  const tx = await prisma.walletTransaction.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' } });
  res.json({ tx });
});

// Admin: approve withdraw (simple endpoint)
router.post('/admin/withdraws/:id/approve', async (req, res) => {
  const id = Number(req.params.id);
  const wr = await prisma.withdrawRequest.update({ where: { id }, data: { status: 'approved' } });
  await prisma.walletTransaction.create({ data: { userId: wr.userId, amount: -wr.amount, type: 'withdraw', meta: `manual-approved:${wr.id}` } });
  require('../services/utils').notifyUser(wr.userId, 'Withdraw approved', `Your withdraw request ${wr.id} has been approved.`).catch(console.error);
  res.json({ success: true, withdraw: wr });
});

// Admin: reject withdraw
router.post('/admin/withdraws/:id/reject', async (req, res) => {
  const id = Number(req.params.id);
  const wr = await prisma.withdrawRequest.update({ where: { id }, data: { status: 'rejected' } });
  require('../services/utils').notifyUser(wr.userId, 'Withdraw rejected', `Your withdraw request ${wr.id} has been rejected.`).catch(console.error);
  res.json({ success: true, withdraw: wr });
});

module.exports = router;