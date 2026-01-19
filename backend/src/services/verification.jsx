/**
 * API Verification Service
 * Automatically verify user actions through OAuth connections
 */

import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  verified: boolean;
  details?: string;
  error?: string;
  provider?: string;
  action?: string;
}

/**
 * Verify Facebook follow/like action
 */
export async function verifyFacebookAction(
  freelancerId: number,
  buyerId: number,
  actionType: 'followers' | 'likes' | 'comments' | 'shares',
  targetPageId: string
): Promise<VerificationResult> {
  try {
    // Get freelancer's Facebook account
    const freelancerFb = await prisma.userSocialAccount.findFirst({
      where: {
        userId: freelancerId,
        provider: 'facebook',
        status: 'linked'
      }
    });

    if (!freelancerFb || !freelancerFb.accessToken) {
      return { verified: false, error: 'No Facebook account linked', provider: 'facebook' };
    }

    // Get buyer's Facebook page
    const buyerFb = await prisma.userSocialAccount.findFirst({
      where: {
        userId: buyerId,
        provider: 'facebook'
      }
    });

    if (!buyerFb) {
      return { verified: false, error: 'Buyer has no Facebook account', provider: 'facebook' };
    }

    // Verify action through Facebook Graph API
    // This would require actual Facebook Graph API implementation
    // For now, we mock the verification
    
    const facebookVerified = await mockFacebookVerification(
      freelancerFb.accessToken,
      targetPageId,
      actionType
    );

    if (facebookVerified) {
      return {
        verified: true,
        provider: 'facebook',
        action: actionType,
        details: `User verified to have ${actionType} the page`
      };
    } else {
      return {
        verified: false,
        error: 'Action not detected on Facebook',
        provider: 'facebook'
      };
    }
  } catch (error: any) {
    return {
      verified: false,
      error: `Facebook verification failed: ${error.message}`,
      provider: 'facebook'
    };
  }
}

/**
 * Verify YouTube subscribe/like action
 */
export async function verifyYouTubeAction(
  freelancerId: number,
  channelId: string,
  actionType: 'subscribers' | 'likes' | 'watch_time'
): Promise<VerificationResult> {
  try {
    // Get freelancer's YouTube account
    const freelancerYt = await prisma.userSocialAccount.findFirst({
      where: {
        userId: freelancerId,
        provider: 'youtube',
        status: 'linked'
      }
    });

    if (!freelancerYt || !freelancerYt.accessToken) {
      return { verified: false, error: 'No YouTube account linked', provider: 'youtube' };
    }

    const youtubeVerified = await mockYouTubeVerification(
      freelancerYt.accessToken,
      channelId,
      actionType
    );

    if (youtubeVerified) {
      return {
        verified: true,
        provider: 'youtube',
        action: actionType,
        details: `User verified to have ${actionType} the channel`
      };
    } else {
      return {
        verified: false,
        error: 'Action not detected on YouTube',
        provider: 'youtube'
      };
    }
  } catch (error: any) {
    return {
      verified: false,
      error: `YouTube verification failed: ${error.message}`,
      provider: 'youtube'
    };
  }
}

/**
 * Verify Instagram follow action
 */
export async function verifyInstagramAction(
  freelancerId: number,
  accountId: string,
  actionType: 'followers' | 'likes' | 'comments'
): Promise<VerificationResult> {
  try {
    // Get freelancer's Instagram account
    const freelancerIg = await prisma.userSocialAccount.findFirst({
      where: {
        userId: freelancerId,
        provider: 'instagram',
        status: 'linked'
      }
    });

    if (!freelancerIg || !freelancerIg.accessToken) {
      return { verified: false, error: 'No Instagram account linked', provider: 'instagram' };
    }

    const instagramVerified = await mockInstagramVerification(
      freelancerIg.accessToken,
      accountId,
      actionType
    );

    if (instagramVerified) {
      return {
        verified: true,
        provider: 'instagram',
        action: actionType,
        details: `User verified to have ${actionType} the account`
      };
    } else {
      return {
        verified: false,
        error: 'Action not detected on Instagram',
        provider: 'instagram'
      };
    }
  } catch (error: any) {
    return {
      verified: false,
      error: `Instagram verification failed: ${error.message}`,
      provider: 'instagram'
    };
  }
}

/**
 * Determine which platform to verify based on URL
 */
export async function detectPlatformAndVerify(
  freelancerId: number,
  buyerId: number,
  pageUrl: string,
  actionType: string
): Promise<VerificationResult> {
  if (pageUrl.includes('facebook.com')) {
    const pageId = extractFacebookPageId(pageUrl);
    return verifyFacebookAction(
      freelancerId,
      buyerId,
      actionType as any,
      pageId
    );
  } else if (pageUrl.includes('youtube.com') || pageUrl.includes('youtu.be')) {
    const channelId = extractYouTubeChannelId(pageUrl);
    return verifyYouTubeAction(freelancerId, channelId, actionType as any);
  } else if (pageUrl.includes('instagram.com')) {
    const accountId = extractInstagramAccountId(pageUrl);
    return verifyInstagramAction(freelancerId, accountId, actionType as any);
  } else {
    return { verified: false, error: 'Unsupported platform' };
  }
}

// ==================== MOCK VERIFICATION FUNCTIONS ====================
// In production, these would call actual APIs

async function mockFacebookVerification(
  accessToken: string,
  pageId: string,
  actionType: string
): Promise<boolean> {
  // Mock: 85% success rate
  return Math.random() > 0.15;
}

async function mockYouTubeVerification(
  accessToken: string,
  channelId: string,
  actionType: string
): Promise<boolean> {
  // Mock: 85% success rate
  return Math.random() > 0.15;
}

async function mockInstagramVerification(
  accessToken: string,
  accountId: string,
  actionType: string
): Promise<boolean> {
  // Mock: 85% success rate
  return Math.random() > 0.15;
}

// ==================== HELPER FUNCTIONS ====================

function extractFacebookPageId(url: string): string {
  // Extract from facebook.com/pagename or facebook.com/pages/pagename/pageId
  const match = url.match(/\/(\d+)(?:\?|$)/) || url.match(/\/pages\/[^/]+\/(\d+)/);
  return match ? match[1] : url.split('/').pop() || '';
}

function extractYouTubeChannelId(url: string): string {
  // Extract from youtube.com/@channelname or youtube.com/channel/channelId
  const match = url.match(/\/channel\/([^/?]+)/) || url.match(/\/@([^/?]+)/);
  return match ? match[1] : url.split('/').pop() || '';
}

function extractInstagramAccountId(url: string): string {
  // Extract from instagram.com/username
  const match = url.match(/\/([^/?]+)(?:\?|$|\/)/);
  return match ? match[1] : url.split('/').pop() || '';
}

/**
 * Automated verification with retry logic
 */
export async function autoVerifyWithRetry(
  freelancerId: number,
  buyerId: number,
  pageUrl: string,
  actionType: string,
  maxRetries: number = 3
): Promise<VerificationResult> {
  let lastError: VerificationResult = { verified: false, error: 'Unknown error' };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await detectPlatformAndVerify(
      freelancerId,
      buyerId,
      pageUrl,
      actionType
    );

    if (result.verified) {
      return result;
    }

    lastError = result;

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return lastError;
}

export default {
  verifyFacebookAction,
  verifyYouTubeAction,
  verifyInstagramAction,
  detectPlatformAndVerify,
  autoVerifyWithRetry
};
