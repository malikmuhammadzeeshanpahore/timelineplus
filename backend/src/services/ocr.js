const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// OCR Verification Service (cleaned JS version)

async function extractPageNameFromScreenshot(imagePath, targetPageName) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  try {
    const result = await Tesseract.recognize(imagePath, 'eng');
    const extractedText = result?.data?.text || '';
    const confidence = result?.data?.confidence || 0;

    const cleanText = extractedText
      .toLowerCase()
      .replace(/[^\w\s@]/g, '')
      .trim();

    const pageNames = extractPageNames(cleanText, extractedText);
    const targetNormalized = (targetPageName || '').toLowerCase().replace(/[^\w\s@]/g, '');

    const matches = pageNames.some(name => name.toLowerCase().includes(targetNormalized) || targetNormalized.includes(name.toLowerCase()));
    const matchedName = pageNames.find(name => name.toLowerCase().includes(targetNormalized) || targetNormalized.includes(name.toLowerCase()));

    return { text: cleanText, pageNames, confidence: Math.round(confidence), matches, matchedName };
  } catch (err) {
    console.error('OCR Error:', err);
    throw err;
  }
}

function extractPageNames(cleanText, originalText) {
  const names = new Set();
  const mentions = (originalText.match(/@(\w+)/g) || []);
  mentions.forEach(m => names.add(m.replace('@', '')));

  const capitalized = (originalText.match(/[A-Z][a-z]+/g) || []);
  capitalized.forEach(word => { if (word.length > 2) names.add(word); });

  const urls = (originalText.match(/(facebook|youtube|instagram|twitter|tiktok)[\w.]*\.(com|tv|me)/gi) || []);
  urls.forEach(u => names.add(u));

  const words = (cleanText || '').split(/\s+/);
  words.forEach(w => { if (w.length > 3 && !isCommonWord(w)) names.add(w); });

  return Array.from(names);
}

function isCommonWord(word) {
  const common = ['the','and','that','this','with','from','have','were','their','than','them','been','into','which','more','like','time','will','just','only','some','when','what','where','who','why','how','can','your','about','our'];
  return common.includes(String(word || '').toLowerCase());
}

function verifyFollowerIncrease(followersBefore, followersAfter) {
  return Number(followersAfter) > Number(followersBefore);
}

function calculateTimeElapsed(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
  return Math.round(diff / (1000 * 60));
}

function shouldApplyTimePenalty(timeMinutes) {
  return Number(timeMinutes) < 1;
}

async function saveImageTemporarily(imageData) {
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const filename = `proof_${Date.now()}.png`;
  const filepath = path.join(tempDir, filename);
  if (typeof imageData === 'string') {
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filepath, buffer);
  } else {
    fs.writeFileSync(filepath, imageData);
  }
  return filepath;
}

function deleteTemporaryImage(filepath) {
  try { if (fs.existsSync(filepath)) fs.unlinkSync(filepath); } catch (e) { console.error('Error deleting temp image:', e); }
}

async function performOCRVerification(imagePath, targetPageName, followersBefore, followersAfter, taskStartTime, proofSubmitTime) {
  const ocrResult = await extractPageNameFromScreenshot(imagePath, targetPageName).catch(() => ({ matches: false, matchedName: null }));
  const countIncreased = verifyFollowerIncrease(followersBefore, followersAfter);
  const timeMinutes = calculateTimeElapsed(taskStartTime, proofSubmitTime);
  const timePenalty = shouldApplyTimePenalty(timeMinutes);
  const verified = ocrResult.matches && countIncreased && !timePenalty;
  return { verified, ocrMatches: !!ocrResult.matches, countIncreased, timePenalty, details: { extractedPageName: ocrResult.matchedName, targetPageName, followersBefore, followersAfter, timeMinutes } };
}

async function mockOCRVerification(targetPageName, followersBefore, followersAfter, timeMinutes) {
  const success = Math.random() > 0.15;
  return { verified: success && (followersAfter > followersBefore) && (timeMinutes >= 1), ocrMatches: success, countIncreased: followersAfter > followersBefore, timePenalty: timeMinutes < 1, details: { extractedPageName: success ? targetPageName : undefined, targetPageName, followersBefore, followersAfter, timeMinutes } };
}

module.exports = {
  extractPageNameFromScreenshot,
  extractPageNames,
  isCommonWord,
  verifyFollowerIncrease,
  calculateTimeElapsed,
  shouldApplyTimePenalty,
  saveImageTemporarily,
  deleteTemporaryImage,
  performOCRVerification,
  mockOCRVerification
};

