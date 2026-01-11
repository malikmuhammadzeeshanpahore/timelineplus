const { PrismaClient } = require('@prisma/client');
const { sendMail } = require('./mailer');

const prisma = new PrismaClient();

async function logAdmin(adminId, action, meta) {
  await prisma.adminLog.create({ data: { adminId, action, meta: meta ? JSON.stringify(meta) : undefined } });
}

async function notifyUser(userId, title, body, meta) {
  await prisma.notification.create({ data: { userId, title, body, meta: meta ? JSON.stringify(meta) : undefined } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.email) {
    await sendMail(user.email, title, `<p>${body}</p>`).catch(console.error);
  }
}

async function creditWallet(userId, amount, type, meta) {
  await prisma.walletTransaction.create({ data: { userId, amount, type, meta: meta ? JSON.stringify(meta) : undefined } });
}

async function getBalance(userId) {
  const res = await prisma.walletTransaction.groupBy({ by: ['userId'], where: { userId }, _sum: { amount: true } });
  if (!res || res.length === 0) return 0;
  return res[0]._sum.amount || 0;
}

module.exports = { logAdmin, notifyUser, creditWallet, getBalance };
