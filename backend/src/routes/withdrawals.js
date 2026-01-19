import express, { Response, NextFunction } from 'express';
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { getUserEarningsStatus, getLockConfig } = require('../services/trust-score');

const prisma = new PrismaClient();
const router = express.Router();

interface AuthRequest extends express.Request {
  user?;
}

// Verify JWT
function jwtMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
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

/**
 * GET /withdrawals/status
 * Get withdrawal status and limits
 */
router.get('/status', jwtMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        isBanned: true,
        trustScore: true,
        banReason: true,
        banUnlockCost: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isBanned) {
      return res.json({
        canWithdraw: false,
        reason: 'banned',
        banReason: user.banReason,
        unlockCost: user.banUnlockCost
      });
    }

    const earningsStatus = await getUserEarningsStatus(req.user.id);
    const lockConfig = getLockConfig(user.trustScore);

    res.json({
      canWithdraw: earningsStatus.canWithdraw,
      totalEarnings: earningsStatus.totalEarnings,
      unlockedEarnings: earningsStatus.unlockedEarnings,
      lockedEarnings: earningsStatus.lockedEarnings,
      maxWithdraw: lockConfig.maxWithdraw,
      trustScore: user.trustScore,
      trustTier: user.trustScore > 70 ? 'High' : user.trustScore > 60 ? 'Medium' : 'Low',
      nextUnlockDate: earningsStatus.nextUnlockDate,
      activeLocks: earningsStatus.activeLocks.length,
      reason: !earningsStatus.canWithdraw ? 'earnings_locked' : 'ok'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /withdrawals/request
 * Create withdrawal request
 * Body: { amount, method }
 */
router.post('/request', jwtMiddleware, async (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!['bank', 'paypal', 'crypto', 'card'].includes(method)) {
      return res.status(400).json({ error: 'Invalid withdrawal method' });
    }

    // Check if user is banned
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isBanned) {
      return res.status(403).json({
        error: 'Account banned',
        banReason: user.banReason,
        unlockCost: user.banUnlockCost
      });
    }

    // Get earnings status
    const earningsStatus = await getUserEarningsStatus(req.user.id);

    if (!earningsStatus.canWithdraw || earningsStatus.unlockedEarnings <= 0) {
      return res.status(400).json({
        error: 'No unlocked earnings available',
        nextUnlockDate: earningsStatus.nextUnlockDate
      });
    }

    // Check withdrawal limit based on trust score
    const lockConfig = getLockConfig(user.trustScore);
    const maxAllowed = lockConfig.maxWithdraw || earningsStatus.unlockedEarnings;

    if (amount > maxAllowed) {
      return res.status(400).json({
        error: 'Withdrawal exceeds your limit',
        maxWithdraw: maxAllowed,
        trustTier: user.trustScore > 70 ? 'High' : user.trustScore > 60 ? 'Medium' : 'Low'
      });
    }

    if (amount > earningsStatus.unlockedEarnings) {
      return res.status(400).json({
        error: 'Insufficient unlocked earnings',
        available: earningsStatus.unlockedEarnings,
        requested: amount
      });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawRequest.create({
      data: {
        userId: req.user.id,
        amount,
        method,
        status: 'pending'
      }
    });

    // Update earnings lock - deduct withdrawn amount
    const locks = await prisma.earningsLock.findMany({
      where: { userId: req.user.id, unlockedAt: { gt: new Date() } },
      orderBy: { unlockedAt: 'asc' }
    });

    let remaining = amount;
    for (const lock of locks) {
      if (remaining <= 0) break;

      const deductAmount = Math.min(lock.amount - lock.withdrawn, remaining);
      await prisma.earningsLock.update({
        where: { id: lock.id },
        data: { withdrawn: { increment: deductAmount } }
      });

      remaining -= deductAmount;
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: '💳 Withdrawal Request Created',
        body: `Withdrawal request of $${amount / 100} submitted. Status: pending.`
      }
    });

    res.json({
      success: true,
      withdrawal,
      message: 'Withdrawal request created. Admin will process it soon.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /withdrawals/history
 * Get user's withdrawal history
 */
router.get('/history', jwtMiddleware, async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /withdrawals/:withdrawalId/cancel
 * Cancel pending withdrawal
 */
router.post('/:withdrawalId/cancel', jwtMiddleware, async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await prisma.withdrawRequest.findUnique({
      where: { id: parseInt(withdrawalId) }
    });

    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        error: 'Can only cancel pending withdrawals',
        status: withdrawal.status
      });
    }

    await prisma.withdrawRequest.update({
      where: { id: parseInt(withdrawalId) },
      data: { status: 'cancelled' }
    });

    res.json({
      success: true,
      message: 'Withdrawal cancelled'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * === ADMIN ENDPOINTS ===
 */

function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
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

async function verifyAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });
  
  if (!user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  
  req.user.isAdmin = true;
  next();
}

/**
 * GET /admin-withdrawals/pending
 * Get all pending withdrawal requests
 */
router.get('/admin-withdrawals/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawRequest.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { id: true, email: true, username: true, trustScore: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-withdrawals/:withdrawalId/approve
 * Admin approves withdrawal
 */
router.post('/admin-withdrawals/:withdrawalId/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await prisma.withdrawRequest.update({
      where: { id: parseInt(withdrawalId) },
      data: { status: 'approved' }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        title: '✅ Withdrawal Approved',
        body: `Your withdrawal of $${withdrawal.amount / 100} h approved and will be processed soon.`
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: `Approved withdrawal ${withdrawalId}`,
        meta: JSON.stringify({ amount: withdrawal.amount, method: withdrawal.method })
      }
    });

    res.json({
      success: true,
      message: 'Withdrawal approved'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin-withdrawals/:withdrawalId/reject
 * Admin rejects withdrawal
 */
router.post('/admin-withdrawals/:withdrawalId/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body;

    const withdrawal = await prisma.withdrawRequest.update({
      where: { id: parseInt(withdrawalId) },
      data: { status: 'rejected', reason }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        title: '❌ Withdrawal Rejected',
        body: `Your withdrawal of $${withdrawal.amount / 100} h rejected. Reason: ${reason || 'No reason provided'}`
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action: `Rejected withdrawal ${withdrawalId}`,
        meta: JSON.stringify({ amount: withdrawal.amount, reason })
      }
    });

    res.json({
      success: true,
      message: 'Withdrawal rejected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
