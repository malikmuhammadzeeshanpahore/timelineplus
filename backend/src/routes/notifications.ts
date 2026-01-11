import express from 'express';
import { PrismaClient } from '@prisma/client';
import { jwtMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/me', jwtMiddleware, async (req: any, res) => {
  const notifs = await prisma.notification.findMany({ where: { userId: Number(req.user.id) }, orderBy: { createdAt: 'desc' } });
  res.json({ notifs });
});

router.post('/:id/read', jwtMiddleware, async (req: any, res) => {
  const id = Number(req.params.id);
  const n = await prisma.notification.update({ where: { id }, data: { read: true } });
  res.json({ success: true, n });
});

export default router;