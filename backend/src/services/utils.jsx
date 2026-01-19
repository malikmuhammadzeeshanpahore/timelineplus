import { PrismaClient } from '@prisma/client';
import { sendMail } from './mailer';

const prisma = new PrismaClient();

export async function logAdmin(adminId: number, action: string, meta?: object) {
  await prisma.adminLog.create({ data: { adminId, action, meta: meta ? JSON.stringify(meta) : undefined } });
}

export async function notifyUser(userId: number, title: string, body: string, meta?: object) {
  await prisma.notification.create({ data: { userId, title, body, meta: meta ? JSON.stringify(meta) : undefined } });
  // fetch email and send mail as well
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.email) {
    await sendMail(user.email, title, `<p>${body}</p>`).catch(console.error);
  }
}

export async function creditWallet(userId: number, amount: number, type: string, meta?: object) {
  await prisma.walletTransaction.create({ data: { userId, amount, type, meta: meta ? JSON.stringify(meta) : undefined } });
}

export async function getBalance(userId: number) {
  const res = await prisma.walletTransaction.groupBy({ by: ['userId'], where: { userId }, _sum: { amount: true } });
  if (!res || res.length === 0) return 0;
  return res[0]._sum.amount || 0;
}
