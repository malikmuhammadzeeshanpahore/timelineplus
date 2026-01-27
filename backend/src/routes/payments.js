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

// get balance (current user) - with and without /me suffix
router.get('/balance', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  const sum = await prisma.walletTransaction.aggregate({ _sum: { amount: true }, where: { userId: uid } });
  const balance = sum._sum.amount || 0;
  res.json({ balance });
});

// Get complete wallet summary (balance + totals for deposits/withdrawals/earnings)
router.get('/', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  try {
    // Get total balance from wallet transactions
    const walletSum = await prisma.walletTransaction.aggregate({
      _sum: { amount: true },
      where: { userId: uid }
    });
    const balance = walletSum._sum.amount || 0;

    // Get total deposits (count all deposits regardless of status)
    const depositSum = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { userId: uid }
    });
    const totalDeposited = depositSum._sum.amount || 0;

    // Get total earned (wallet transactions with type = 'earning')
    const earningSum = await prisma.walletTransaction.aggregate({
      _sum: { amount: true },
      where: { userId: uid, type: 'earning' }
    });
    const totalEarned = earningSum._sum.amount || 0;

    // Get total withdrawn (wallet transactions with type = 'withdraw')
    const withdrawSum = await prisma.walletTransaction.aggregate({
      _sum: { amount: true },
      where: { userId: uid, type: 'withdraw' }
    });
    const totalWithdrawn = Math.abs(withdrawSum._sum.amount || 0);

    res.json({
      balance,
      totalDeposited,
      totalEarned,
      totalWithdrawn
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// Get all transactions for current user (deposits + wallet transactions)
router.get('/transactions', jwtMiddleware, async (req, res) => {
  const uid = Number(req.user.id);
  try {
    // Get deposits
    const deposits = await prisma.deposit.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' }
    });
    
    // Get wallet transactions
    const walletTransactions = await prisma.walletTransaction.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' }
    });
    
    // Combine and format
    const transactions = [
      ...deposits.map(d => ({
        id: `deposit-${d.id}`,
        amount: d.amount,
        type: 'deposit',
        status: d.status,
        method: d.method,
        createdAt: d.createdAt
      })),
      ...walletTransactions.map(tx => ({
        id: `tx-${tx.id}`,
        amount: tx.amount,
        type: tx.type,
        status: 'completed',
        meta: tx.meta,
        createdAt: tx.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ transactions });
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

// Alias: create withdrawal request (same as /withdraw)
router.post('/withdrawals/request', jwtMiddleware, async (req, res) => {
  const userId = Number(req.user.id);
  const { amount, method, accountNumber, accountName } = req.body;
  
  console.log('[WITHDRAWAL DEBUG]', { amount, method, methodType: typeof method, methodLower: method?.toLowerCase() });
  
  if (!amount || !method) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Get user to check profile and withdrawal details
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if user profile is complete
  if (!user.fullName || !user.phone || !user.city) {
    return res.status(403).json({ 
      error: 'Please complete your profile first',
      requiresProfileCompletion: true,
      redirect: '/profile/'
    });
  }

  // Check if withdrawal details are filled
  if (!user.accountHolderName || !user.accountNumber || !user.accountType || !user.bankName) {
    return res.status(403).json({ 
      error: 'Please complete your withdrawal details first',
      requiresWithdrawalDetails: true,
      redirect: '/withdrawal-details/'
    });
  }

  // Only allow Jazz Cash and Easy Paisa
  const methodLower = String(method).toLowerCase();
  if (!['jazzcash', 'easypaisa'].includes(methodLower)) {
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

  // Create withdrawal request
  const wr = await prisma.withdrawal.create({ 
    data: { 
      userId, 
      amount: Number(amount), 
      reason: `${methodLower} - ${accountNumber}`,
      status: 'pending'
    } 
  });

  res.json({ success: true, withdrawal: wr, message: 'Withdrawal request submitted successfully' });
});

module.exports = router;