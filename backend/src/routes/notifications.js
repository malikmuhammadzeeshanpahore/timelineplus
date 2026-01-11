const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { jwtMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/me', jwtMiddleware, async (req, res) => {
  const notifs = await prisma.notification.findMany({ where: { userId: Number(req.user.id) }, orderBy: { createdAt: 'desc' } });
  res.json({ notifs });
});

router.post('/:id/read', jwtMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const n = await prisma.notification.update({ where: { id }, data: { read: true } });
  res.json({ success: true, n });
});

module.exports = router;