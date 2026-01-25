const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(auth(['admin_freelancer', 'admin_buyer']));

router.get('/users', async (req, res) => {
  const q = String(req.query.q || '');
  const users = await prisma.user.findMany({ where: { OR: [{ email: { contains: q } }, { username: { contains: q } }] } });
  res.json({ users });
});

router.post('/users/:id/ban', async (req, res) => {
  const id = Number(req.params.id);
  const adminId = Number(req.body.adminId || 0);
  const u = await prisma.user.update({ where: { id }, data: { isBanned: true } });
  await import('../services/utils').then(m => m.logAdmin(adminId, 'ban_user', { userId: id }));
  res.json({ success: true, user: u });
});

router.post('/users/:id/unban', async (req, res) => {
  const id = Number(req.params.id);
  const adminId = Number(req.body.adminId || 0);
  const u = await prisma.user.update({ where: { id }, data: { isBanned: false } });
  await import('../services/utils').then(m => m.logAdmin(adminId, 'unban_user', { userId: id }));
  res.json({ success: true, user: u });
});

router.post('/users/:id/reset-password', async (req, res) => {
  const id = Number(req.params.id);
  const adminId = Number(req.body.adminId || 0);
  const { password } = req.body;
  if (!password) return res.status(400).send('password required');
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { password: hash } });
  await import('../services/utils').then(m => m.logAdmin(adminId, 'reset_password', { userId: id }));
  res.json({ success: true });
});

router.post('/users/:id/grant', async (req, res) => {
  const id = Number(req.params.id);
  const adminId = Number(req.body.adminId || 0);
  const { amount, reason } = req.body;
  if (!amount) return res.status(400).send('amount required');
  await prisma.walletTransaction.create({ data: { userId: id, amount: Number(amount), type: 'admin_grant', meta: reason } });
  await import('../services/utils').then(m => m.logAdmin(adminId, 'grant_credit', { userId: id, amount }));
  res.json({ success: true });
});

router.get('/withdraws', async (req, res) => {
  const list = await prisma.withdrawRequest.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ list });
});

module.exports = router;