const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { jwtMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// List tasks with simple filters
// Only show tasks that have been assigned by an admin (assignedTo != null)
router.get('/', async (req, res) => {
  // Some Prisma client versions/schema differences caused validation errors
  // when using relation/scalar filters here. Fetch tasks and filter in JS
  // to avoid schema-dependent where clauses.
  const all = await prisma.task.findMany();
  const tasks = all.filter(t => t.assignedToId != null);
  res.json({ tasks });
});

// Start task (reserve/claim) — for simplicity just returns info
router.post('/:id/start', jwtMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).send('not found');
  res.json({ success: true, task });
});

// Submit proof (url or uploaded file url)
router.post('/:id/proof', jwtMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { proofUrl, notes } = req.body;
  if (!proofUrl) return res.status(400).send('proofUrl required');
  const tp = await prisma.taskProof.create({ data: { taskId: id, userId: Number(req.user.id), proofUrl, notes } });
  res.json({ success: true, proof: tp });
});

// Get user's task history
router.get('/history/me', jwtMiddleware, async (req, res) => {
  const proofs = await prisma.taskProof.findMany({ where: { userId: Number(req.user.id) } });
  res.json({ proofs });
});

// Admin: review proof (approve/reject)
router.post('/admin/proof/:id/review', async (req, res) => {
  const id = Number(req.params.id);
  const { action, reason } = req.body; // action = 'approve'|'reject'
  const proof = await prisma.taskProof.findUnique({ where: { id } });
  if (!proof) return res.status(404).send('not found');
  if (action === 'approve') {
    // Approve and remove the external verification link to prevent exposing it after completion
    await prisma.taskProof.update({ where: { id }, data: { status: 'approved', reviewedAt: new Date(), proofUrl: '' } });
    const task = await prisma.task.findUnique({ where: { id: proof.taskId } });
    if (task) {
      await prisma.walletTransaction.create({ data: { userId: proof.userId, amount: task.price, type: 'service_reward', meta: `task:${task.id}` } });
      require('../services/utils').notifyUser(proof.userId, 'Task approved', `Your submission for "${task.title}" was approved. A Service Reward of $${(task.price/100).toFixed(2)} has been credited to your Rewards Wallet.`).catch(console.error);
    }
    res.json({ success: true });
  } else {
    await prisma.taskProof.update({ where: { id }, data: { status: 'rejected', reason, reviewedAt: new Date() } });
    require('../services/utils').notifyUser(proof.userId, 'Task rejected', `Your submission was rejected. Reason: ${reason || 'See reviewer notes.'}`).catch(console.error);
    res.json({ success: true });
  }
});

module.exports = router;