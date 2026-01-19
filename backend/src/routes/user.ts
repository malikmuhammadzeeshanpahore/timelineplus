import express from 'express';
import { PrismaClient } from '@prisma/client';
import { jwtMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = express.Router();

// Get current user profile with connected accounts and balance
router.get('/me', jwtMiddleware, async (req: any, res) => {
  const uid = Number(req.user.id);
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: {
      social: true,
      withdrawals: true,
      deposits: { take: 5, orderBy: { createdAt: 'desc' } },
      campaignsAsBuyer: { take: 5, orderBy: { createdAt: 'desc' } },
      campaignTasks: { take: 5, orderBy: { createdAt: 'desc' } }
    }
  });

  if (!user) return res.status(404).send('not found');

  const sum = await prisma.walletTransaction.aggregate({
    _sum: { amount: true },
    where: { userId: uid }
  });

  const balance = sum._sum.amount || 0;

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      photo: user.photo,
      emailVerified: user.emailVerified,
      isBanned: user.isBanned,
      role: user.role,
      isAdmin: user.isAdmin,
      trustScore: user.trustScore,
      banCount: user.banCount
    },
    social: user.social,
    balance,
    recentDeposits: user.deposits,
    recentCampaigns: user.campaignsAsBuyer,
    recentTasks: user.campaignTasks
  });
});

// Get connected accounts
router.get('/social', jwtMiddleware, async (req: any, res) => {
  const uid = Number(req.user.id);
  const social = await prisma.userSocialAccount.findMany({ where: { userId: uid } });
  res.json({ social });
});

// Unlink a provider
router.post('/social/unlink', jwtMiddleware, async (req: any, res) => {
  const uid = Number(req.user.id);
  const { provider } = req.body;
  if (!provider) return res.status(400).send('provider required');
  await prisma.userSocialAccount.updateMany({ where: { userId: uid, provider }, data: { status: 'revoked', syncAt: new Date() } });
  res.json({ success: true });
});

export default router;