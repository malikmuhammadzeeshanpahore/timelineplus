const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const prisma = new PrismaClient();
const router = express.Router();

// Verify JWT token middleware
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = auth.slice(7);
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = { id: data.uid };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Verify admin middleware
async function verifyAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  // Return 404 to avoid leaking admin-panel existence to non-admin users
  if (!user?.isAdmin) return res.status(404).json({ error: 'not found' });

  req.user.isAdmin = true;
  next();
}

// Verify admin secret code
function verifyAdminCode(req, res, next) {
  const { code } = req.params;
  if (!code) return res.status(400).json({ error: 'Secret code required' });

  // ensure user is admin; treat non-admin as not found
  if (!req.user || !req.user.id) return res.status(404).json({ error: 'not found' });

  prisma.user.findUnique({ where: { id: req.user.id } })
    .then(u => {
      if (!u || !u.isAdmin) return res.status(404).json({ error: 'not found' });
      req.user = { ...req.user, code };
      next();
    })
    .catch(err => res.status(500).json({ error: err.message }));
}

// ==================== ADMIN REGISTRATION ====================

/**
 * POST /admin-panel/register/:code
 * Register new admin account using secret code
 */
router.post('/register/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { email, password, username } = req.body;

    // Validate secret code
    const secret = await prisma.adminSecret.findUnique({
      where: { code }
    });

    if (!secret || !secret.isActive || secret.purpose !== 'add_admin') {
      return res.status(400).json({ error: 'Invalid or expired secret code' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hash,
        isAdmin: true,
        role: 'admin',
        emailVerified: true
      }
    });

    // Generate JWT token
    const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN PANEL ACCESS ====================

/**
 * GET /admin-panel/verify/:code
 * Verify admin can access panel with secret code
 */
router.get('/verify/:code', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    
    // Verify secret code for panel access
    const secret = await prisma.adminSecret.findUnique({
      where: { code }
    });

    if (!secret || !secret.isActive || secret.purpose !== 'access_panel') {
      return res.status(400).json({ error: 'Invalid secret code for panel access' });
    }

    res.json({ success: true, message: 'Admin panel access granted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

/**
 * GET /admin-panel/dashboard
 * Admin dashboard overview
 */
router.get('/dashboard', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({ where: { isAdmin: true } });
    const bannedUsers = await prisma.user.count({ where: { isBanned: true } });
    const pendingDeposits = await prisma.deposit.count({ where: { status: 'pending' } });
    const pendingWithdrawals = await prisma.withdrawal.count({ where: { status: 'pending' } });
    const activeCampaigns = await prisma.campaign.count({ where: { status: 'active' } });

    res.json({
      stats: {
        totalUsers,
        totalAdmins,
        bannedUsers,
        pendingDeposits,
        pendingWithdrawals,
        activeCampaigns
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin-panel/users?q=email&page=1
 * Search and list users
 */
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const page = Number(req.query.page || 1);
    const limit = 20;

    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { username: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { ipAddress: { contains: q } }
          ]
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        isAdmin: true,
        isBanned: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin-panel/users/:userId
 * Get detailed user information
 */
router.get('/users/:userId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        socialAccounts: true,
        deposits: { take: 5, orderBy: { createdAt: 'desc' } },
        campaigns: { take: 5, orderBy: { createdAt: 'desc' } },
        campaignTasks: { take: 5, orderBy: { createdAt: 'desc' } },
        withdrawals: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate statistics
    const totalEarnings = await prisma.campaignTask.aggregate({
      where: { freelancerId: userId, status: 'paid' },
      _sum: { reward: true }
    });

    const totalWithdrawn = await prisma.withdrawal.aggregate({
      where: { userId, status: 'approved' },
      _sum: { amount: true }
    });

    const totalDeposits = await prisma.deposit.aggregate({
      where: { userId, status: 'approved' },
      _sum: { amount: true }
    });

    res.json({
      user: {
        ...user,
        totalEarnings: totalEarnings._sum.reward || 0,
        totalWithdrawn: totalWithdrawn._sum.amount || 0,
        totalDeposits: totalDeposits._sum.amount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/users/:userId/make-admin
 * Make user an admin
 */
router.post('/users/:userId/make-admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true, role: 'admin' }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'make_admin',
        meta: JSON.stringify({ targetUserId: userId, email: user.email })
      }
    });

    res.json({ success: true, message: 'User is now an admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/users/:userId/ban
 * Ban a user
 */
router.post('/users/:userId/ban', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ error: 'Ban reason required' });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'ban_user',
        meta: JSON.stringify({ userId, email: user.email, reason })
      }
    });

    res.json({ success: true, message: `User ${user.email} h banned` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/users/:userId/unban
 * Unban a user
 */
router.post('/users/:userId/unban', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
        trustScore: 70  // Restore to 70% after unban
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'unban_user',
        meta: JSON.stringify({ userId, email: user.email })
      }
    });

    res.json({ success: true, message: `User ${user.email} h unbanned` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/users/:userId/suspend
 * Suspend user (temporary ban)
 */
router.post('/users/:userId/suspend', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { hours = 24 } = req.body;
    const userId = Number(req.params.userId);
    
    const suspendUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: suspendUntil }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'suspend_user',
        meta: JSON.stringify({ targetUserId: userId, hours })
      }
    });

    res.json({ success: true, user, suspendUntil });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEPOSIT MANAGEMENT ====================

/**
 * GET /admin-panel/deposits?status=pending
 * List deposits
 */
router.get('/deposits', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const page = Number(req.query.page || 1);
    const limit = 20;

    const where = {};
    if (status && status !== '') {
      where.status = String(status);
    }

    const deposits = await prisma.deposit.findMany({
      where,
      include: { user: { select: { id: true, email: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.deposit.count({ where });

    res.json({ deposits, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/deposits/:depositId/approve
 * Approve deposit
 */
router.post('/deposits/:depositId/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const depositId = Number(req.params.depositId);

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true }
    });

    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });

    // Update deposit status
    const updated = await prisma.deposit.update({
      where: { id: depositId },
      data: {
        status: 'approved',
        approvedBy: req.user.id
      }
    });

    // Add funds to wallet
    await prisma.wallet.update({
      where: { userId: deposit.userId },
      data: { balance: { increment: deposit.amount } }
    });

    await prisma.walletTransaction.create({
      data: {
        userId: deposit.userId,
        amount: deposit.amount,
        type: 'deposit',
        meta: `Deposit approved by admin`
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'approve_deposit',
        meta: JSON.stringify({ depositId, userId: deposit.userId, amount: deposit.amount })
      }
    });

    res.json({ success: true, message: 'Deposit approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/deposits/:depositId/reject
 * Reject deposit
 */
router.post('/deposits/:depositId/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const depositId = Number(req.params.depositId);

    if (!reason) return res.status(400).json({ error: 'Rejection reason required' });

    const updated = await prisma.deposit.update({
      where: { id: depositId },
      data: {
        status: 'rejected',
        reason,
        approvedBy: req.user.id
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'reject_deposit',
        meta: JSON.stringify({ depositId, reason })
      }
    });

    res.json({ success: true, message: 'Deposit rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WITHDRAWAL MANAGEMENT ====================

/**
 * GET /admin-panel/withdrawals?status=pending
 * List withdrawal requests
 */
router.get('/withdrawals', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const page = Number(req.query.page || 1);
    const limit = 20;

    const where = {};
    if (status && status !== '') {
      where.status = String(status);
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: { user: { select: { id: true, email: true, username: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.withdrawal.count({ where });

    res.json({ withdrawals, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin-panel/withdrawals/:withdrawalId
 * Get detailed withdrawal information
 */
router.get('/withdrawals/:withdrawalId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.withdrawalId);

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            accountHolderName: true,
            accountType: true,
            accountNumber: true,
            bankName: true,
            iban: true
          }
        }
      }
    });

    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });

    res.json({ withdrawal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/withdrawals/:withdrawalId/approve
 * Approve withdrawal and deduct 20% fee
 */
router.post('/withdrawals/:withdrawalId/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.withdrawalId);
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID required' });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    });

    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    // Calculate fee (20%)
    const fee = Math.round(withdrawal.amount * 0.2);
    const netAmount = withdrawal.amount - fee;

    // Update withdrawal status
    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        transactionId,
        processingFee: fee
      }
    });

    // Deduct from user's wallet
    await prisma.wallet.update({
      where: { userId: withdrawal.userId },
      data: { balance: { decrement: withdrawal.amount } }
    });

    // Record transaction
    await prisma.walletTransaction.create({
      data: {
        userId: withdrawal.userId,
        amount: -withdrawal.amount,
        type: 'withdrawal',
        meta: `Withdrawal approved - Fee: ${fee}, Net: ${netAmount}`
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'approve_withdrawal',
        meta: JSON.stringify({
          withdrawalId,
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          fee,
          netAmount,
          transactionId
        })
      }
    });

    // Referral commission: if the withdrawing user was referred, credit 1% to referrer if referrer is active
    try {
      const referral = await prisma.referral.findFirst({ where: { refereeId: withdrawal.userId } });
      if (referral) {
        const referrer = await prisma.user.findUnique({ where: { id: referral.referrerId }, include: { wallet: true } });
        if (referrer && !referrer.isBanned) {
          const commission = Math.round(withdrawal.amount * 0.01);
          // ensure referrer's wallet exists
          let wallet = await prisma.wallet.findUnique({ where: { userId: referrer.id } });
          if (!wallet) {
            wallet = await prisma.wallet.create({ data: { userId: referrer.id, balance: commission } });
          } else {
            await prisma.wallet.update({ where: { userId: referrer.id }, data: { balance: { increment: commission } } });
          }
          await prisma.walletTransaction.create({ data: { userId: referrer.id, amount: commission, type: 'referral', meta: `1% commission from referral withdrawal (user ${withdrawal.userId})` } });
          await prisma.referral.update({ where: { id: referral.id }, data: { bonus: (referral.bonus || 0) + commission } });
          await prisma.adminLog.create({ data: { adminId: req.user.id, action: 'referral_commission', meta: JSON.stringify({ referrerId: referrer.id, refereeId: withdrawal.userId, commission }) } });
        }
      }
    } catch (err) {
      console.error('Referral commission error:', err);
    }

    res.json({
      success: true,
      message: `Withdrawal approved. Amount: $${(withdrawal.amount / 100).toFixed(2)}, Fee: $${(fee / 100).toFixed(2)}, Net: $${(netAmount / 100).toFixed(2)}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/withdrawals/:withdrawalId/reject
 * Reject withdrawal and refund to wallet
 */
router.post('/withdrawals/:withdrawalId/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.withdrawalId);
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ error: 'Rejection reason required' });

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    });

    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    // Update withdrawal status
    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'rejected',
        reason,
        approvedBy: req.user.id,
        approvedAt: new Date()
      }
    });

    // Refund to wallet
    await prisma.wallet.update({
      where: { userId: withdrawal.userId },
      data: { balance: { increment: withdrawal.amount } }
    });

    // Record transaction
    await prisma.walletTransaction.create({
      data: {
        userId: withdrawal.userId,
        amount: withdrawal.amount,
        type: 'withdrawal_refund',
        meta: `Withdrawal rejected - Reason: ${reason}`
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'reject_withdrawal',
        meta: JSON.stringify({
          withdrawalId,
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          reason
        })
      }
    });

    res.json({
      success: true,
      message: `Withdrawal rejected. $${(withdrawal.amount / 100).toFixed(2)} refunded to user wallet.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CAMPAIGN MANAGEMENT ====================

/**
 * GET /admin-panel/campaigns?status=pending
 * List campaigns awaiting approval
 */
router.get('/campaigns', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const page = Number(req.query.page || 1);
    const limit = 20;

    const where = {};
    if (status && status !== '') {
      where.status = String(status);
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        buyer: { select: { id: true, email: true, username: true } },
        campaignTasks: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.campaign.count({ where });

    res.json({ campaigns, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/campaigns/:campaignId/approve
 * Approve campaign
 */
router.post('/campaigns/:campaignId/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const campaignId = Number(req.params.campaignId);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // Calculate reward per task: 40% of total price / target count
    const rewardPerTask = Math.floor((campaign.price * 0.4) / campaign.targetCount);

    // Update campaign status
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'active',
        approvedBy: req.user.id
      }
    });

    // Create individual tasks for freelancers
    const tasks = [];
    for (let i = 0; i < campaign.targetCount; i++) {
      tasks.push({
        campaignId,
        rewardPerTask,
        status: 'pending'
      });
    }

    await prisma.campaignTask.createMany({ data: tasks });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'approve_campaign',
        meta: JSON.stringify({ campaignId, taskCount: campaign.targetCount })
      }
    });

    // Buyer referral commission: if buyer was referred and referrer is active, credit 10% of campaign.price
    try {
      const referral = await prisma.referral.findFirst({ where: { refereeId: campaign.buyerId } });
      if (referral) {
        const referrer = await prisma.user.findUnique({ where: { id: referral.referrerId } });
        if (referrer && !referrer.isBanned) {
          const bonus = Math.round(campaign.price * 0.10);
          let wallet = await prisma.wallet.findUnique({ where: { userId: referrer.id } });
          if (!wallet) {
            await prisma.wallet.create({ data: { userId: referrer.id, balance: bonus } });
          } else {
            await prisma.wallet.update({ where: { userId: referrer.id }, data: { balance: { increment: bonus } } });
          }
          await prisma.walletTransaction.create({ data: { userId: referrer.id, amount: bonus, type: 'referral_bonus', meta: `10% commission from referred buyer campaign ${campaign.id}` } });
          await prisma.referral.update({ where: { id: referral.id }, data: { bonus: (referral.bonus || 0) + bonus } });
          await prisma.adminLog.create({ data: { adminId: req.user.id, action: 'buyer_referral_bonus', meta: JSON.stringify({ referrerId: referrer.id, buyerId: campaign.buyerId, bonus }) } });
        }
      }
    } catch (err) {
      console.error('Buyer referral bonus error:', err);
    }

    res.json({ success: true, message: `Campaign approved. ${campaign.targetCount} tasks created.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/campaigns/:campaignId/reject
 * Reject campaign
 */
router.post('/campaigns/:campaignId/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const campaignId = Number(req.params.campaignId);

    if (!reason) return res.status(400).json({ error: 'Rejection reason required' });

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        approvedBy: req.user.id
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'reject_campaign',
        meta: JSON.stringify({ campaignId, reason })
      }
    });

    res.json({ success: true, message: 'Campaign rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SECRET CODE MANAGEMENT ====================

/**
 * POST /admin-panel/secrets/:code/generate
 * Generate new secret codes (admin only)
 */
router.post('/secrets/:code/generate', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { purpose, count = 1 } = req.body;

    if (!['add_admin', 'access_panel'].includes(purpose)) {
      return res.status(400).json({ error: 'Invalid purpose' });
    }

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const secret = await prisma.adminSecret.create({
        data: { code, purpose }
      });
      codes.push(secret);
    }

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'generate_secrets',
        meta: JSON.stringify({ purpose, count })
      }
    });

    res.json({ success: true, codes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ACCOUNT MANAGEMENT ====================

/**
 * POST /admin-panel/admin/:code/change-password
 * Admin changes their password
 */
router.post('/admin/:code/change-password', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!admin || !admin.password) {
      return res.status(400).json({ error: 'Admin account not found or h password' });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: newHash }
    });

    // Log action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'change_password',
        meta: JSON.stringify({ timestamp: new Date().toISOString() })
      }
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin-panel/secrets/:code/list
 * List all active secret codes
 */
router.get('/secrets/:code/list', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const secrets = await prisma.adminSecret.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ secrets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/secrets/:code/:secretId/disable
 * Disable a secret code
 */
router.post('/secrets/:code/:secretId/disable', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const secretId = Number(req.params.secretId);

    const disabled = await prisma.adminSecret.update({
      where: { id: secretId },
      data: { isActive: false }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'disable_secret',
        meta: JSON.stringify({ secretId, code: disabled.code })
      }
    });

    res.json({ success: true, message: 'Secret code disabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/secrets/:code/:secretId/reset
 * Reset/change a secret code
 */
router.post('/secrets/:code/:secretId/reset', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const secretId = Number(req.params.secretId);

    const oldSecret = await prisma.adminSecret.findUnique({
      where: { id: secretId }
    });

    if (!oldSecret) {
      return res.status(404).json({ error: 'Secret not found' });
    }

    // Generate new code
    const newCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Update with new code
    const updated = await prisma.adminSecret.update({
      where: { id: secretId },
      data: { code: newCode }
    });

    // Log action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: 'reset_secret',
        meta: JSON.stringify({ secretId, purpose: updated.purpose })
      }
    });

    res.json({
      success: true,
      newCode: updated.code,
      purpose: updated.purpose,
      message: 'Secret code reset successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TRUST SCORE MANAGEMENT ====================

/**
 * POST /admin-panel/users/:userId/trust-score/increase
 * Manually increase user's trust score
 */
router.post('/users/:userId/trust-score/increase', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { increase, reason } = req.body;

    if (!increase || increase <= 0) {
      return res.status(400).json({ error: 'Invalid increase amount' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const newScore = Math.min(100, user.trustScore + increase);

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { trustScore: newScore }
    });

    await prisma.trustScoreLog.create({
      data: {
        userId: parseInt(userId),
        oldScore: user.trustScore,
        newScore,
        change: -increase,
        reason: reason || 'Admin increase',
        adminId: req.user.id
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: `Increased trust score for user ${userId}`,
        meta: JSON.stringify({ oldScore: user.trustScore, newScore, increase, reason })
      }
    });

    res.json({
      success: true,
      oldScore: user.trustScore,
      newScore,
      message: `Trust score increased from ${user.trustScore}% to ${newScore}%`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/users/:userId/trust-score/decrease
 * Manually decrease user's trust score
 */
router.post('/users/:userId/trust-score/decrease', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { decrease, reason } = req.body;

    if (!decrease || decrease <= 0) {
      return res.status(400).json({ error: 'Invalid decrease amount' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const newScore = Math.max(0, user.trustScore - decrease);

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { trustScore: newScore }
    });

    await prisma.trustScoreLog.create({
      data: {
        userId: parseInt(userId),
        oldScore: user.trustScore,
        newScore,
        change: decrease,
        reason: reason || 'Admin decrease',
        adminId: req.user.id
      }
    });

    // Check if should be banned
    if (newScore <= 50 && !user.isBanned) {
      const newBanCount = (user.banCount || 0) + 1;
      let unlockCost = 30000; // 300
      if (newBanCount === 2) unlockCost = 50000;
      else if (newBanCount >= 3) unlockCost = 100000;

      await prisma.banRecord.create({
        data: {
          userId: parseInt(userId),
          banCount: newBanCount,
          reason: 'Admin trust score reduction',
          unlockCost
        }
      });

      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          isBanned: true,
          banCount: newBanCount,
          banReason: `Ban #${newBanCount}: Admin trust score reduction`,
          banUnlockCost: unlockCost
        }
      });
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: `Decreased trust score for user ${userId}`,
        meta: JSON.stringify({ oldScore: user.trustScore, newScore, decrease, reason })
      }
    });

    res.json({
      success: true,
      oldScore: user.trustScore,
      newScore,
      userBanned: newScore <= 50,
      message: newScore <= 50
        ? `Trust score decreased to ${newScore}%. User h banned.`
        : `Trust score decreased from ${user.trustScore}% to ${newScore}%`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin-panel/users/:userId/trust-score/history
 * Get trust score change history for user
 */
router.get('/users/:userId/trust-score/history', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await prisma.trustScoreLog.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, username: true } }
      }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin-panel/ban-records
 * Get all ban records
 */
router.get('/ban-records', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const records = await prisma.banRecord.findMany({
      include: {
        user: { select: { id: true, email: true, username: true, trustScore: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-panel/ban/:banId/unlock
 * Unlock a banned user account (after payment)
 */
router.post('/ban/:banId/unlock', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { banId } = req.params;
    const { confirmed } = req.body;

    if (!confirmed) {
      return res.status(400).json({ error: 'Unlock must be confirmed' });
    }

    const banRecord = await prisma.banRecord.findUnique({
      where: { id: parseInt(banId) },
      include: { user: true }
    });

    if (!banRecord) return res.status(404).json({ error: 'Ban record not found' });

    // Update ban record
    await prisma.banRecord.update({
      where: { id: parseInt(banId) },
      data: {
        paid: true,
        unlockedAt: new Date()
      }
    });

    // Restore account to 70% trust score
    await prisma.user.update({
      where: { id: banRecord.userId },
      data: {
        isBanned: false,
        trustScore: 70,
        banReason: null,
        banUnlockCost: null
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: `Unlocked banned user ${banRecord.userId}`,
        meta: JSON.stringify({ banId, banCount: banRecord.banCount, unlockCost: banRecord.unlockCost })
      }
    });

    res.json({
      success: true,
      message: `User ${banRecord.user.email} h unlocked. Trust score restored to 70%.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

