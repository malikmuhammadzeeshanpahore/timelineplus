const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { jwtMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Create withdraw request (Jazz Cash and Easy Paisa only, minimum 500 PKR)
router.post('/withdraw', jwtMiddleware, async (req, res) => {
  const userId = Number(req.user.id);
  const { amount, method, accountNumber } = req.body;
  
  if (!amount || !method) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Only allow Jazz Cash and Easy Paisa
  if (!['jazzcash', 'easypaisa'].includes(method)) {
    return res.status(400).json({ error: 'Invalid withdrawal method. Only Jazz Cash and Easy Paisa are supported.' });
  }

  // Minimum 500 PKR (stored as 50000 cents)
  const minAmount = 50000;
  if (Number(amount) < minAmount) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is PKR 500' });
  }

  if (!accountNumber) {
    return res.status(400).json({ error: 'Account number/phone is required' });
  }

  // Check balance
  const sum = await prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { userId } });
  const balance = sum._sum.amount || 0;
  if (Number(amount) > balance) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  // Check if user has completed withdrawal details
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if withdrawal details are filled
  if (!user.bankName || !user.accountNumber || !user.accountHolderName) {
    return res.status(403).json({ 
      error: 'Please complete your withdrawal details first',
      redirect: '/withdrawal-details.html'
    });
  }

  // Create withdraw request
  const wr = await prisma.withdrawal.create({ 
    data: { 
      userId, 
      amount: Number(amount), 
      reason: `${method} - ${accountNumber}`,
      status: 'pending'
    } 
  });

  // Notify user
  await import('../services/utils').then(m => m.notifyUser(userId, 'Withdrawal Requested', `Your withdrawal request of PKR ${amount/100} via ${method} is pending.`)).catch(()=>{});

  res.json({ success: true, withdraw: wr, message: 'Withdrawal request submitted successfully' });
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

// get withdrawal history (current user)
router.get('/withdrawals', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' }
    });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// top-up (record a balance increase)
router.post('/topup', jwtMiddleware, async (req, res) => {
  const userId = Number(req.user.id);
  const { amount, method = 'card', meta } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // create wallet transaction
  const tx = await prisma.walletTransaction.create({ data: { userId, amount: Number(amount), type: 'topup', meta: meta || method } });

  // create a deposit record if the model exists (best-effort)
  try {
    await prisma.deposit.create({ data: { userId, amount: Number(amount), method, status: 'success' } });
  } catch (e) {
    // ignore if deposit model not present
    console.warn('deposit model create failed:', e.message);
  }

  await import('../services/utils').then(m => m.notifyUser(userId, 'Top-up received', `Your account was credited with ${amount}.`)).catch(()=>{});

  res.json({ success: true, tx });
});

// Admin: approve withdraw (simple endpoint)
router.post('/admin/withdraws/:id/approve', async (req, res) => {
  const id = Number(req.params.id);
  const wr = await prisma.withdrawal.update({ where: { id }, data: { status: 'approved' } });
  // Note: actual payment execution is manual/out of band; add wallet transaction record
  await prisma.walletTransaction.create({ data: { userId: wr.userId, amount: -wr.amount, type: 'withdraw', meta: `manual-approved:${wr.id}` } });
  await import('../services/utils').then(m => m.notifyUser(wr.userId, 'Withdraw approved', `Your withdraw request ${wr.id} h approved.`));
  res.json({ success: true, withdraw: wr });
});

// Admin: reject withdraw
router.post('/admin/withdraws/:id/reject', async (req, res) => {
  const id = Number(req.params.id);
  const wr = await prisma.withdrawal.update({ where: { id }, data: { status: 'rejected' } });
  await import('../services/utils').then(m => m.notifyUser(wr.userId, 'Withdraw rejected', `Your withdraw request ${wr.id} h rejected.`));
  res.json({ success: true, withdraw: wr });
});

module.exports = router;