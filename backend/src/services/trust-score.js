const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const config = {
  penaltyEarlyExit: 10,
  banThreshold: 50,
  lockDaysHigh: 10,
  lockDaysMedium: 15,
  lockDaysLow: 20,
  maxWithdrawHigh: null,
  maxWithdrawMedium: 700,
  maxWithdrawMediumLow: 500,
  maxWithdrawLow: 200,
  banUnlockCost1: 30000,
  banUnlockCost2: 50000,
  banUnlockCost3: 100000
};

async function applyEarlyExitPenalty(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const newScore = Math.max(0, user.trustScore - config.penaltyEarlyExit);
  await prisma.user.update({ where: { id: userId }, data: { trustScore: newScore } });
  await prisma.trustScoreLog.create({ data: { userId, oldScore: user.trustScore, newScore, change: config.penaltyEarlyExit, reason: 'early_exit' } });
  await checkAndApplyBan(userId);
}

async function checkAndApplyBan(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.trustScore <= config.banThreshold && !user.isBanned) {
    const newBanCount = (user.banCount || 0) + 1;
    let unlockCost = config.banUnlockCost1;
    if (newBanCount === 2) unlockCost = config.banUnlockCost2;
    else if (newBanCount >= 3) unlockCost = config.banUnlockCost3;
    await prisma.banRecord.create({ data: { userId, banCount: newBanCount, reason: 'Low trust score', unlockCost } });
    await prisma.user.update({ where: { id: userId }, data: { isBanned: true, banCount: newBanCount, banReason: `Ban #${newBanCount}: Trust score below ${config.banThreshold}%`, banUnlockCost: unlockCost } });
    await prisma.notification.create({ data: { userId, title: '🚫 Account Banned', body: `Your account has been banned due to low trust score. Pay $${unlockCost / 100} to unlock.` } });
    return true;
  }
  return false;
}

function getLockConfig(trustScore) {
  if (trustScore > 70) {
    return { lockDays: config.lockDaysHigh, maxWithdraw: config.maxWithdrawHigh, description: 'High trust (10 days, unlimited withdrawal)' };
  } else if (trustScore > 60) {
    return { lockDays: config.lockDaysMedium, maxWithdraw: config.maxWithdrawMedium, description: 'Medium trust (15 days, max $7 withdrawal)' };
  } else if (trustScore > 50) {
    return { lockDays: config.lockDaysLow, maxWithdraw: config.maxWithdrawMediumLow, description: 'Low trust (15 days, max $5 withdrawal)' };
  } else {
    return { lockDays: 0, maxWithdraw: 0, description: 'Account banned (requires unlock payment)' };
  }
}

async function createEarningsLock(userId, amount, startDate) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const lockConfig = getLockConfig(user.trustScore);
  if (lockConfig.lockDays === 0) throw new Error('Account is banned, cannot lock earnings');
  const unlockDate = new Date(startDate || new Date());
  unlockDate.setDate(unlockDate.getDate() + lockConfig.lockDays);
  await prisma.earningsLock.create({ data: { userId, amount, lockDays: lockConfig.lockDays, maxWithdraw: lockConfig.maxWithdraw, unlockedAt: unlockDate } });
}

async function getUserEarningsStatus(userId) {
  const locks = await prisma.earningsLock.findMany({ where: { userId, unlockedAt: { gt: new Date() } } });
  const wallet = await prisma.walletTransaction.aggregate({ where: { userId, type: 'reward' }, _sum: { amount: true } });
  const totalEarnings = wallet._sum.amount || 0;
  const lockedEarnings = locks.reduce((sum, lock) => sum + lock.amount, 0);
  const unlockedEarnings = totalEarnings - lockedEarnings;
  const nextUnlock = locks.length > 0 ? new Date(Math.min(...locks.map(l => l.unlockedAt.getTime()))) : null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const lockConfig = getLockConfig(user?.trustScore || 0);
  return { totalEarnings, lockedEarnings, unlockedEarnings, activeLocks: locks, nextUnlockDate: nextUnlock, canWithdraw: unlockedEarnings > 0 && !user?.isBanned, maxWithdraw: lockConfig.maxWithdraw };
}

async function adminIncreaseTrustScore(userId, increase, adminId, reason = 'Admin adjustment') {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const newScore = Math.min(100, user.trustScore + increase);
  await prisma.user.update({ where: { id: userId }, data: { trustScore: newScore } });
  await prisma.trustScoreLog.create({ data: { userId, oldScore: user.trustScore, newScore, change: -increase, reason, adminId } });
}

async function adminDecreaseTrustScore(userId, decrease, adminId, reason = 'Admin adjustment') {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const newScore = Math.max(0, user.trustScore - decrease);
  await prisma.user.update({ where: { id: userId }, data: { trustScore: newScore } });
  await prisma.trustScoreLog.create({ data: { userId, oldScore: user.trustScore, newScore, change: decrease, reason, adminId } });
  await checkAndApplyBan(userId);
}

module.exports = {
  config,
  applyEarlyExitPenalty,
  checkAndApplyBan,
  getLockConfig,
  createEarningsLock,
  getUserEarningsStatus,
  adminIncreaseTrustScore,
  adminDecreaseTrustScore
};
