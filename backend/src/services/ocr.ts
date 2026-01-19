import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

/**
 * OCR Verification Service
 * Extracts page/channel name from screenshot using Tesseract
 */

export interface OCRResult {
  text: string;           // Full OCR extracted text
  pageNames: string[];    // Detected page/channel names
  confidence: number;     // OCR confidence (0-100)
  matches: boolean;       // Does any extracted name match target
  matchedName?: string;   // Which name was matched
}

/**
 * Extract page/channel name from screenshot using OCR
 */
export async function extractPageNameFromScreenshot(
  imagePath: string,
  targetPageName: string
): Promise<OCRResult> {
  try {
    // Read image file
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Use Tesseract to extract text
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m: any) => console.log('OCR Progress:', m.progress)
    });

    const extractedText = result.data.text;
    const confidence = result.data.confidence;

    // Clean and normalize text
    const cleanText = extractedText
      .toLowerCase()
      .replace(/[^\w\s@]/g, '') // Remove special chars except @
      .trim();

    // Extract potential page names (usually capitalized or after @)
    const pageNames = extractPageNames(cleanText, extractedText);

    // Check if target page name matches any extracted name
    const targetNormalized = targetPageName.toLowerCase().replace(/[^\w\s@]/g, '');
    const matches = pageNames.some(name => 
      name.toLowerCase().includes(targetNormalized) ||
      targetNormalized.includes(name.toLowerCase())
    );

    const matchedName = pageNames.find(name =>
      name.toLowerCase().includes(targetNormalized) ||
      targetNormalized.includes(name.toLowerCase())
    );

    return {
      text: cleanText,
      pageNames,
      confidence: Math.round(confidence),
      matches,
      matchedName
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
}

/**
 * Extract potential page/channel names from OCR text
 * Looks for @ mentions, URLs, and capitalized words
 */
function extractPageNames(cleanText: string, originalText: string): string[] {
  const names: Set<string> = new Set();

  // Extract @mentions
  const mentions = originalText.match(/@(\w+)/g) || [];
  mentions.forEach(m => {
    names.add(m.replace('@', ''));
  });

  // Extract capitalized words (likely page names)
  const capitalized = originalText.match(/[A-Z][a-z]+/g) || [];
  capitalized.forEach(word => {
    if (word.length > 2) names.add(word);
  });

  // Extract URLs
  const urls = originalText.match(/(facebook|youtube|instagram|twitter|tiktok)[\w.]*\.(com|tv|me)/gi) || [];
  urls.forEach(url => {
    names.add(url);
  });

  // Extract long words (likely page names)
  const words = cleanText.split(/\s+/);
  words.forEach(word => {
    if (word.length > 3 && !isCommonWord(word)) {
      names.add(word);
    }
  });

  return Array.from(names);
}

/**
 * Common words to exclude from page name extraction
 */
function isCommonWord(word: string): boolean {
  const common = [
    'the', 'and', 'that', 'this', 'with', 'from', 'have', 'were',
    'their', 'than', 'them', 'been', 'into', 'which', 'more', 'like',
    'time', 'will', 'just', 'only', 'some', 'when', 'what', 'where',
    'who', 'why', 'how', 'can', 'your', 'about', 'our'
  ];
  return common.includes(word.toLowerCase());
}

/**
 * Compare follower counts - verify increase happened
 */
export function verifyFollowerIncrease(
  followersBefore: number,
  followersAfter: number
): boolean {
  return followersAfter > followersBefore;
}

/**
 * Calculate time elapsed in minutes
 */
export function calculateTimeElapsed(
  startTime: Date,
  endTime: Date
): number {
  const diff = endTime.getTime() - startTime.getTime();
  return Math.round(diff / (1000 * 60)); // Convert to minutes
}

/**
 * Check if time penalty should apply (exited before 1 minute)
 */
export function shouldApplyTimePenalty(timeMinutes: number): boolean {
  return timeMinutes < 1;
}

/**
 * Parse image from base64 or URL
 */
export async function saveImageTemporarily(imageData: string | Buffer): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp');
  
  // Create temp directory if not exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filename = `proof_${Date.now()}.png`;
  const filepath = path.join(tempDir, filename);

  if (typeof imageData === 'string') {
    // Handle base64
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filepath, buffer);
  } else {
    fs.writeFileSync(filepath, imageData);
  }

  return filepath;
}

/**
 * Clean up temporary image file
 */
export function deleteTemporaryImage(filepath: string): void {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error deleting temp image:', error);
  }
}

/**
 * Verification result
 */
export interface VerificationResult {
  verified: boolean;        // Task completed successfully
  ocrMatches: boolean;      // Page name matches
  countIncreased: boolean;  // Followers/subscribers increased
  timePenalty: boolean;     // Early exit penalty
  details: {
    extractedPageName?: string;
    targetPageName: string;
    followersBefore: number;
    followersAfter: number;
    timeMinutes: number;
  };
}

/**
 * Main OCR verification workflow
 */
export async function performOCRVerification(
  imagePath: string,
  targetPageName: string,
  followersBefore: number,
  followersAfter: number,
  taskStartTime: Date,
  proofSubmitTime: Date
): Promise<VerificationResult> {
  try {
    // Extract page name from screenshot
    const ocrResult = await extractPageNameFromScreenshot(imagePath, targetPageName);

    // Verify follower increase
    const countIncreased = verifyFollowerIncrease(followersBefore, followersAfter);

    // Calculate time and check for penalty
    const timeMinutes = calculateTimeElapsed(taskStartTime, proofSubmitTime);
    const timePenalty = shouldApplyTimePenalty(timeMinutes);

    // Task is verified only if:
    // 1. OCR matches the page name
    // 2. Follower count increased
    // 3. Time was >= 1 minute
    const verified = ocrResult.matches && countIncreased && !timePenalty;

    return {
      verified,
      ocrMatches: ocrResult.matches,
      countIncreased,
      timePenalty,
      details: {
        extractedPageName: ocrResult.matchedName,
        targetPageName,
        followersBefore,
        followersAfter,
        timeMinutes
      }
    };
  } catch (error) {
    console.error('OCR Verification Error:', error);
    throw error;
  }
}

/**
 * Mock OCR for development (when Tesseract not available)
 */
export async function mockOCRVerification(
  targetPageName: string,
  followersBefore: number,
  followersAfter: number,
  timeMinutes: number
): Promise<VerificationResult> {
  // 85% success rate for mock
  const success = Math.random() > 0.15;

  return {
    verified: success && (followersAfter > followersBefore) && (timeMinutes >= 1),
    ocrMatches: success,
    countIncreased: followersAfter > followersBefore,
    timePenalty: timeMinutes < 1,
    details: {
      extractedPageName: success ? targetPageName : undefined,
      targetPageName,
      followersBefore,
      followersAfter,
      timeMinutes
    }
  };
}
