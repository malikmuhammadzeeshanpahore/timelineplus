import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Trust Score Management System
 * 
 * Trust Score Levels:
 * - > 70%: 10 days lock, unlimited withdrawal
 * - 61-70%: 15 days lock, max 700 withdrawal
 * - 51-60%: 15 days lock, max 500 withdrawal
 * - ≤ 50%: BANNED (requires payment to unlock)
 */

export interface TrustScoreConfig {
  penaltyEarlyExit: number;      // -10
  banThreshold: number;           // 50%
  lockDaysHigh: number;           // 10 days (>70%)
  lockDaysMedium: number;         // 15 days (51-70%)
  lockDaysLow: number;            // 20 days (51-60%)
  maxWithdrawHigh: number | null; // null (unlimited) for >70%
  maxWithdrawMedium: number;      // 700 for 61-70%
  maxWithdrawMediumLow: number;   // 500 for 51-60%
  maxWithdrawLow: number;         // 200 for <50% (before ban)
  banUnlockCost1: number;         // 300 (1st ban)
  banUnlockCost2: number;         // 500 (2nd ban)
  banUnlockCost3: number;         // 1000 (3rd ban)
}

const config: TrustScoreConfig = {
  penaltyEarlyExit: 10,
  banThreshold: 50,
  lockDaysHigh: 10,
  lockDaysMedium: 15,
  lockDaysLow: 20,
  maxWithdrawHigh: null,
  maxWithdrawMedium: 700,
  maxWithdrawMediumLow: 500,
  maxWithdrawLow: 200,
  banUnlockCost1: 30000, // cents
  banUnlockCost2: 50000,
  banUnlockCost3: 100000
};

/**
 * Apply early exit penalty (-10 trust score)
 */
export async function applyEarlyExitPenalty(userId: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const newScore = Math.max(0, user.trustScore - config.penaltyEarlyExit);

  await prisma.user.update({
    where: { id: userId },
    data: { trustScore: newScore }
  });

  // Log the change
  await prisma.trustScoreLog.create({
    data: {
      userId,
      oldScore: user.trustScore,
      newScore,
      change: config.penaltyEarlyExit,
      reason: 'early_exit'
    }
  });

  // Check if should be banned
  await checkAndApplyBan(userId);
}

/**
 * Check if trust score <= 50% and apply ban
 */
export async function checkAndApplyBan(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  if (user.trustScore <= config.banThreshold && !user.isBanned) {
    const newBanCount = (user.banCount || 0) + 1;
    let unlockCost = config.banUnlockCost1;

    if (newBanCount === 2) {
      unlockCost = config.banUnlockCost2;
    } else if (newBanCount >= 3) {
      unlockCost = config.banUnlockCost3;
    }

    // Create ban record
    await prisma.banRecord.create({
      data: {
        userId,
        banCount: newBanCount,
        reason: 'Low trust score',
        unlockCost
      }
    });

    // Ban the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banCount: newBanCount,
        banReason: `Ban #${newBanCount}: Trust score below ${config.banThreshold}%`,
        banUnlockCost: unlockCost
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        title: '🚫 Account Banned',
        body: `Your account has been banned due to low trust score. Pay ${unlockCost / 100} to unlock.`
      }
    });

    return true;
  }

  return false;
}

/**
 * Get lock configuration based on trust score
 */
export function getLockConfig(trustScore: number): {
  lockDays: number;
  maxWithdraw: number | null;
  description: string;
} {
  if (trustScore > 70) {
    return {
      lockDays: config.lockDaysHigh,
      maxWithdraw: config.maxWithdrawHigh,
      description: 'High trust (10 days, unlimited withdrawal)'
    };
  } else if (trustScore > 60) {
    return {
      lockDays: config.lockDaysMedium,
      maxWithdraw: config.maxWithdrawMedium,
      description: 'Medium trust (15 days, max $7 withdrawal)'
    };
  } else if (trustScore > 50) {
    return {
      lockDays: config.lockDaysLow,
      maxWithdraw: config.maxWithdrawMediumLow,
      description: 'Low trust (15 days, max $5 withdrawal)'
    };
  } else {
    return {
      lockDays: 0,
      maxWithdraw: 0,
      description: 'Account banned (requires unlock payment)'
    };
  }
}

/**
 * Create earnings lock after task completion
 */
export async function createEarningsLock(
  userId: number,
  amount: number,
  startDate: Date = new Date()
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const lockConfig = getLockConfig(user.trustScore);
  if (lockConfig.lockDays === 0) {
    throw new Error('Account is banned, cannot lock earnings');
  }

  const unlockDate = new Date(startDate);
  unlockDate.setDate(unlockDate.getDate() + lockConfig.lockDays);

  await prisma.earningsLock.create({
    data: {
      userId,
      amount,
      lockDays: lockConfig.lockDays,
      maxWithdraw: lockConfig.maxWithdraw,
      unlockedAt: unlockDate
    }
  });
}

/**
 * Get user earnings status (locked/unlocked)
 */
export async function getUserEarningsStatus(userId: number): Promise<{
  totalEarnings: number;
  lockedEarnings: number;
  unlockedEarnings: number;
  activeLocks: any[];
  nextUnlockDate: Date | null;
  canWithdraw: boolean;
  maxWithdraw: number | null;
}> {
  const locks = await prisma.earningsLock.findMany({
    where: { userId, unlockedAt: { gt: new Date() } }
  });

  const wallet = await prisma.walletTransaction.aggregate({
    where: { userId, type: 'reward' },
    _sum: { amount: true }
  });

  const totalEarnings = wallet._sum.amount || 0;
  const lockedEarnings = locks.reduce((sum, lock) => sum + lock.amount, 0);
  const unlockedEarnings = totalEarnings - lockedEarnings;

  const nextUnlock = locks.length > 0
    ? new Date(Math.min(...locks.map(l => l.unlockedAt.getTime())))
    : null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const lockConfig = getLockConfig(user?.trustScore || 0);

  return {
    totalEarnings,
    lockedEarnings,
    unlockedEarnings,
    activeLocks: locks,
    nextUnlockDate: nextUnlock,
    canWithdraw: unlockedEarnings > 0 && !user?.isBanned,
    maxWithdraw: lockConfig.maxWithdraw
  };
}

/**
 * Manually increase trust score (admin only)
 */
export async function adminIncreaseTrustScore(
  userId: number,
  increase: number,
  adminId: number,
  reason: string = 'Admin adjustment'
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const newScore = Math.min(100, user.trustScore + increase);

  await prisma.user.update({
    where: { id: userId },
    data: { trustScore: newScore }
  });

  await prisma.trustScoreLog.create({
    data: {
      userId,
      oldScore: user.trustScore,
      newScore,
      change: -increase, // negative because it's an increase
      reason,
      adminId
    }
  });
}

/**
 * Manually decrease trust score (admin only)
 */
export async function adminDecreaseTrustScore(
  userId: number,
  decrease: number,
  adminId: number,
  reason: string = 'Admin adjustment'
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const newScore = Math.max(0, user.trustScore - decrease);

  await prisma.user.update({
    where: { id: userId },
    data: { trustScore: newScore }
  });

  await prisma.trustScoreLog.create({
    data: {
      userId,
      oldScore: user.trustScore,
      newScore,
      change: decrease,
      reason,
      adminId
    }
  });

  // Check if should be banned
  await checkAndApplyBan(userId);
}

/**
 * Unlock account by paying ban fee
 */
export async function unlockBannedAccount(userId: number, paymentAmount: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (!user.isBanned) throw new Error('User is not banned');

  const banRecord = await prisma.banRecord.findFirst({
    where: { userId, unlockedAt: null },
    orderBy: { createdAt: 'desc' }
  });

  if (!banRecord) throw new Error('No active ban record found');
  if (paymentAmount < banRecord.unlockCost) {
    throw new Error(`Insufficient payment. Required: ${banRecord.unlockCost / 100}`);
  }

  // Update ban record
  await prisma.banRecord.update({
    where: { id: banRecord.id },
    data: {
      paid: true,
      unlockedAt: new Date()
    }
  });

  // Restore account to 70% trust score
  await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: false,
      trustScore: 70,
      banReason: null,
      banUnlockCost: null
    }
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      title: '✅ Account Unlocked',
      body: 'Your account has been successfully unlocked. Your trust score has been reset to 70%.'
    }
  });

  return true;
}

/**
 * Get trust score statistics for user
 */
export async function getTrustScoreStats(userId: number): Promise<{
  currentScore: number;
  scoreTier: string;
  banCount: number;
  isBanned: boolean;
  banUnlockCost: number | null;
  trustHistory: any[];
  recommendations: string[];
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const history = await prisma.trustScoreLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  let tier = 'High';
  if (user.trustScore <= 50) tier = 'Banned';
  else if (user.trustScore <= 60) tier = 'Low';
  else if (user.trustScore <= 70) tier = 'Medium';

  const recommendations: string[] = [];
  if (user.trustScore < 70) {
    recommendations.push('Complete tasks carefully to improve trust score');
  }
  if (user.trustScore < 60) {
    recommendations.push('Avoid early exits from tasks');
  }
  if (user.trustScore < 50) {
    recommendations.push('Pay ban fee to restore your account');
  }

  return {
    currentScore: user.trustScore,
    scoreTier: tier,
    banCount: user.banCount || 0,
    isBanned: user.isBanned,
    banUnlockCost: user.banUnlockCost,
    trustHistory: history,
    recommendations
  };
}
