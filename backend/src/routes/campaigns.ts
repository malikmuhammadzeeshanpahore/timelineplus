import express, { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { autoVerifyWithRetry } from '../services/verification';
import {
  performOCRVerification,
  mockOCRVerification,
  saveImageTemporarily,
  deleteTemporaryImage,
  calculateTimeElapsed
} from '../services/ocr';
import {
  applyEarlyExitPenalty,
  createEarningsLock,
  getUserEarningsStatus,
  getLockConfig
} from '../services/trust-score';

const prisma = new PrismaClient();
const router = express.Router();

interface AuthRequest extends express.Request {
  user?: any;
}

// Verify JWT
function jwtMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = auth.slice(7);
  try {
    const data: any = jwt.verify(token, JWT_SECRET);
    req.user = { id: data.uid };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ==================== BUYER CAMPAIGN CREATION ====================

/**
 * POST /campaigns/create
 * Create new campaign (buyer)
 */
router.post('/create', jwtMiddleware, async (req, res) => {
  try {
    const { title, type, targetCount, targetPage, price, description } = req.body;

    if (!['followers', 'subscribers', 'likes', 'comments', 'shares', 'watch_time'].includes(type)) {
      return res.status(400).json({ error: 'Invalid campaign type' });
    }

    if (!targetCount || !price) {
      return res.status(400).json({ error: 'targetCount and price required' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        buyerId: req.user.id,
        title,
        type,
        targetCount: Number(targetCount),
        targetPage,
        price: Number(price),
        description,
        status: 'pending'
      },
      include: { buyer: { select: { email: true, username: true } } }
    });

    res.json({
      success: true,
      campaign,
      message: 'Campaign created. Awaiting admin approval.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /campaigns/my-campaigns
 * Get buyer's campaigns with progress
 */
router.get('/my-campaigns', jwtMiddleware, async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { buyerId: req.user.id },
      include: {
        campaignTasks: {
          select: {
            id: true,
            status: true,
            freelancer: { select: { username: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const campaignsWithProgress = campaigns.map(c => ({
      ...c,
      progress: `${c.completedCount}/${c.targetCount}`,
      progressPercent: Math.round((c.completedCount / c.targetCount) * 100),
      taskStatus: {
        pending: c.campaignTasks.filter((t: any) => t.status === 'pending').length,
        assigned: c.campaignTasks.filter((t: any) => t.status === 'assigned').length,
        verified: c.campaignTasks.filter((t: any) => t.status === 'verified').length,
        paid: c.campaignTasks.filter((t: any) => t.status === 'paid').length
      }
    }));

    res.json(campaignsWithProgress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FREELANCER TASK MANAGEMENT ====================

/**
 * GET /campaigns/available-tasks
 * Get available tasks for freelancer
 */
router.get('/available-tasks', jwtMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.campaignTask.findMany({
      where: {
        status: 'pending',
        campaign: { status: 'active' }
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            type: true,
            targetPage: true,
            targetCount: true,
            completedCount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /campaigns/tasks/:taskId/assign
 * Freelancer claims a task
 */
router.post('/tasks/:taskId/assign', jwtMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if user is banned
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user?.isBanned) {
      return res.status(403).json({ error: 'Your account is banned' });
    }

    // Assign task and record task start time
    const task = await prisma.campaignTask.update({
      where: { id: parseInt(taskId) },
      data: {
        freelancerId: req.user.id,
        status: 'assigned'
      },
      include: {
        campaign: { select: { targetPage: true, type: true } }
      }
    });

    // Create CampaignProof record with task start time
    const proof = await prisma.campaignProof.create({
      data: {
        taskId: parseInt(taskId),
        taskStartTime: new Date(), // When task started
        status: 'pending'
      }
    });

    res.json({
      success: true,
      task,
      proof: { id: proof.id, taskStartTime: proof.taskStartTime }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /campaigns/my-tasks
 * Get freelancer's assigned tasks
 */
router.get('/my-tasks', jwtMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.campaignTask.findMany({
      where: { freelancerId: req.user.id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            type: true,
            targetPage: true,
            price: true
          }
        },
        proofs: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== OCR-BASED VERIFICATION WITH TRUST SCORE ====================

/**
 * POST /campaigns/tasks/:taskId/submit-proof
 * 
 * Freelancer submits screenshot for OCR verification
 * Body: {
 *   image: base64 string,
 *   followersBefore: number,
 *   followersAfter: number
 * }
 */
router.post('/tasks/:taskId/submit-proof', jwtMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { image, followersBefore, followersAfter } = req.body;

    if (!image || !followersBefore || !followersAfter) {
      return res.status(400).json({
        error: 'Missing: image, followersBefore, followersAfter'
      });
    }

    // Get task and proof record
    const task = await prisma.campaignTask.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        campaign: { select: { targetPage: true, type: true, price: true, buyerId: true } },
        proofs: { where: { status: 'pending' }, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const proof = task.proofs[0];
    if (!proof) return res.status(404).json({ error: 'No proof record found' });

    // Calculate time elapsed
    const now = new Date();
    const timeMinutes = calculateTimeElapsed(proof.taskStartTime!, now);

    // Check for early exit (< 1 minute)
    if (timeMinutes < 1) {
      // Apply -10 trust score penalty
      await applyEarlyExitPenalty(req.user.id);

      // Update proof
      await prisma.campaignProof.update({
        where: { id: proof.id },
        data: {
          status: 'rejected',
          notes: 'Early exit - minimum 1 minute required',
          timeMinutes,
          earlyExitPenalty: true,
          trustPenaltyApplied: 10,
          proofSubmitTime: now
        }
      });

      // Revert task to pending
      await prisma.campaignTask.update({
        where: { id: parseInt(taskId) },
        data: { status: 'pending', freelancerId: null }
      });

      return res.status(400).json({
        success: false,
        error: 'Task requires minimum 1 minute to complete',
        details: { timeMinutes, penalty: -10 },
        message: 'You exited too early. Trust score -10. Try again later.'
      });
    }

    // Respond immediately
    res.json({
      success: true,
      message: 'Verification in progress',
      status: 'verifying',
      details: { timeMinutes }
    });

    // === BACKGROUND VERIFICATION (Non-blocking) ===
    setImmediate(async () => {
      try {
        // Save image temporarily
        let imagePath = '';
        try {
          imagePath = await saveImageTemporarily(image);

          // Perform OCR verification
          const verificationResult = await performOCRVerification(
            imagePath,
            task.campaign.targetPage || '',
            parseInt(followersBefore),
            parseInt(followersAfter),
            proof.taskStartTime!,
            now
          );

          // Update proof with verification results
          await prisma.campaignProof.update({
            where: { id: proof.id },
            data: {
              ocrPageName: verificationResult.details.extractedPageName,
              ocrMatches: verificationResult.ocrMatches,
              followersBefore: parseInt(followersBefore),
              followersAfter: parseInt(followersAfter),
              countIncreased: verificationResult.countIncreased,
              timeMinutes,
              earlyExitPenalty: false,
              proofSubmitTime: now,
              status: verificationResult.verified ? 'verified' : 'rejected',
              verifiedAt: verificationResult.verified ? now : null,
              notes: verificationResult.verified
                ? 'OCR verified successfully'
                : `Verification failed - OCR match: ${verificationResult.ocrMatches}, Count increased: ${verificationResult.countIncreased}`
            }
          });

          if (verificationResult.verified) {
            // PAYMENT FLOW
            const rewardPerTask = task.rewardPerTask;

            // Update task to paid
            await prisma.campaignTask.update({
              where: { id: parseInt(taskId) },
              data: { status: 'paid', paidAt: now }
            });

            // Add to wallet
            await prisma.walletTransaction.create({
              data: {
                userId: req.user.id,
                amount: rewardPerTask,
                type: 'reward',
                meta: JSON.stringify({
                  taskId,
                  campaignId: task.campaignId,
                  source: 'ocr_verified'
                })
              }
            });

            // Create earnings lock based on trust score
            const user = await prisma.user.findUnique({ where: { id: req.user.id } });
            await createEarningsLock(req.user.id, rewardPerTask);

            // Increment campaign completion count
            await prisma.campaign.update({
              where: { id: task.campaignId },
              data: { completedCount: { increment: 1 } }
            });

            // Create notification for freelancer
            await prisma.notification.create({
              data: {
                userId: req.user.id,
                title: '✅ Task Verified & Paid!',
                body: `Your task was verified. $${rewardPerTask / 100} added (locked based on trust score).`
              }
            });
          } else {
            // Verification failed - revert task
            await prisma.campaignTask.update({
              where: { id: parseInt(taskId) },
              data: { status: 'pending', freelancerId: null }
            });

            // Notify freelancer of failure
            await prisma.notification.create({
              data: {
                userId: req.user.id,
                title: '❌ Verification Failed',
                body: `OCR verification failed. Make sure you completed the action and try again.`
              }
            });
          }
        } finally {
          // Clean up image
          if (imagePath) deleteTemporaryImage(imagePath);
        }
      } catch (error) {
        console.error('Verification error:', error);

        // Revert task on error
        await prisma.campaignTask.update({
          where: { id: parseInt(taskId) },
          data: { status: 'pending', freelancerId: null }
        }).catch(e => console.error('Failed to revert task:', e));

        // Notify freelancer
        await prisma.notification.create({
          data: {
            userId: req.user.id,
            title: '⚠️ Verification Error',
            body: 'An error occurred during verification. Please try again.'
          }
        }).catch(e => console.error('Failed to create notification:', e));
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EARNINGS & WITHDRAWAL ====================

/**
 * GET /campaigns/earnings-status
 * Get freelancer's earnings status (locked/unlocked)
 */
router.get('/earnings-status', jwtMiddleware, async (req, res) => {
  try {
    const status = await getUserEarningsStatus(req.user.id);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /campaigns/trust-score
 * Get freelancer's trust score info
 */
router.get('/trust-score', jwtMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        trustScore: true,
        isBanned: true,
        banCount: true,
        banReason: true,
        banUnlockCost: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const lockConfig = getLockConfig(user.trustScore);

    res.json({
      trustScore: user.trustScore,
      tier: user.trustScore > 70 ? 'High' : user.trustScore > 60 ? 'Medium' : user.trustScore > 50 ? 'Low' : 'Banned',
      isBanned: user.isBanned,
      banCount: user.banCount,
      banReason: user.banReason,
      banUnlockCost: user.banUnlockCost,
      lockDays: lockConfig.lockDays,
      maxWithdraw: lockConfig.maxWithdraw,
      description: lockConfig.description
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
