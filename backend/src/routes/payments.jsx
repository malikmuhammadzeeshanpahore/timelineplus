import express from 'express';
import { PrismaClient } from '@prisma/client';
import { jwtMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = express.Router();

// Create withdraw request (manual payment method supported)
router.post('/withdraw', jwtMiddleware, async (req: any, res) => {
  const userId = Number(req.user.id);
  const { amount, method, details } = req.body;
  if (!amount || !method) return res.status(400).send('Missing fields');
  if (method !== 'manual' && method !== 'paypal' && method !== 'bank') {
    return res.status(400).send('Unsupported method');
  }

  // check balance
  const sum = await prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { userId } });
  const balance = sum._sum.amount || 0;
  if (Number(amount) > balance) return res.status(400).send('insufficient balance');

  // Create withdraw request
  const wr = await prisma.withdrawRequest.create({ data: { userId, amount: Number(amount), method, details } });
  // notify user
  await import('../services/utils').then(m => m.notifyUser(userId, 'Withdraw requested', `Your withdraw request of ${amount} was created and is pending.`));

  res.json({ success: true, withdraw: wr });
});

// get balance (current user)
router.get('/balance/me', jwtMiddleware, async (req: any, res) => {
  const uid = Number(req.user.id);
  const sum = await prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { userId: uid } });
  const balance = sum._sum.amount || 0;
  res.json({ balance });
});

// get wallet history (current user)
router.get('/history/me', jwtMiddleware, async (req: any, res) => {
  const uid = Number(req.user.id);
  const tx = await prisma.walletTransaction.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' } });
  res.json({ tx });
});

// Admin: approve withdraw (simple endpoint)
router.post('/admin/withdraws/:id/approve', async (req, res) => {
  const id = Number(req.params.id);
  const wr = await prisma.withdrawRequest.update({ where: { id }, data: { status: 'approved' } });
  // Note: actual payment execution is manual/out of band; add wallet transaction record
  await prisma.walletTransaction.create({ data: { userId: wr.userId, amount: -wr.amount, type: 'withdraw', meta: `manual-approved:${wr.id}` } });
  await import('../services/utils').then(m => m.notifyUser(wr.userId, 'Withdraw approved', `Your withdraw request ${wr.id} has been approved.`));
  res.json({ success: true, withdraw: wr });
});

// Admin: reject withdraw
router.post('/admin/withdraws/:id/reject', async (req, res) => {
  const id = Number(req.params.id);
  const wr = await prisma.withdrawRequest.update({ where: { id }, data: { status: 'rejected' } });
  await import('../services/utils').then(m => m.notifyUser(wr.userId, 'Withdraw rejected', `Your withdraw request ${wr.id} has been rejected.`));
  res.json({ success: true, withdraw: wr });
});

export default router;