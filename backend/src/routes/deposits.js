import express, { Response, NextFunction } from 'express';
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

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

// ==================== DEPOSIT MANAGEMENT ====================

/**
 * POST /deposits/request
 * Create new deposit request
 */
router.post('/request', jwtMiddleware, async (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ error: 'amount and method required' });
    }

    if (!['card', 'bank', 'crypto', 'paypal'].includes(method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const deposit = await prisma.deposit.create({
      data: {
        userId: req.user.id,
        amount: Number(amount), // in cents
        method,
        status: 'pending'
      },
      include: { user: { select: { email: true, username: true } } }
    });

    res.json({
      success: true,
      deposit,
      message: 'Deposit request created. Awaiting admin approval.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /deposits/my-deposits
 * Get user's deposits
 */
router.get('/my-deposits', jwtMiddleware, async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ deposits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /deposits/status/:depositId
 * Check deposit status
 */
router.get('/status/:depositId', jwtMiddleware, async (req, res) => {
  try {
    const depositId = Number(req.params.depositId);

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId }
    });

    if (!deposit || deposit.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ deposit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /deposits/:depositId/cancel
 * Cancel pending deposit request
 */
router.post('/:depositId/cancel', jwtMiddleware, async (req, res) => {
  try {
    const depositId = Number(req.params.depositId);

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId }
    });

    if (!deposit || deposit.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel non-pending deposit' });
    }

    const updated = await prisma.deposit.update({
      where: { id: depositId },
      data: { status: 'cancelled' }
    });

    res.json({ success: true, deposit: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
