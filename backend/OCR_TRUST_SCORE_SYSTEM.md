# 🔐 OCR + TRUST SCORE VERIFICATION SYSTEM

## 📋 مکمل نظام (Complete System)

یہ system تین بڑے حصوں پر مشتمل ہے:

### 1️⃣ OCR (Optical Character Recognition) Verification
### 2️⃣ Trust Score Management System  
### 3️⃣ Earnings Lock & Withdrawal System

---

## 🎯 سسٹم کیسے کام کرتا ہے؟

### Freelancer کی جانب سے:

```
1. Task کو claim کرتا ہے
   ↓
2. Page/Channel جاتا ہے
   ↓
3. Follow/Subscribe/Like کرتا ہے (minimum 1 minute)
   ↓
4. Screenshot لیتا ہے (followers count دونوں دکھائے ہوں)
   ↓
5. Screenshot upload کرتا ہے
   ↓
6. ⏱️ TIME CHECK: کیا 1 minute سے زیادہ ہے؟
   ├─ ❌ NO (< 1 min): Task rejected, -10 trust score
   └─ ✅ YES (≥ 1 min): OCR verification شروع
     ↓
7. 📸 OCR CHECK: کیا page name screenshot میں visible ہے?
   ├─ ❌ NO: Task rejected
   └─ ✅ YES: Followers count check
     ↓
8. 📊 FOLLOWER COUNT CHECK: کیا followers بڑھے؟
   ├─ ❌ NO: Task rejected
   └─ ✅ YES: Task verified ✅
     ↓
9. 💰 PAYMENT: Reward wallet میں added
   (لیکن LOCKED ہے trust score کی بنیاد پر)
```

---

## 📊 Trust Score Levels اور Earnings Lock

### 🟢 High Trust (> 70%)
```
✅ Lock Duration: 10 days
✅ Max Withdrawal: Unlimited
✅ Benefits: سب کچھ کریں سکتے ہو
```

### 🟡 Medium Trust (61-70%)
```
🟨 Lock Duration: 15 days
🟨 Max Withdrawal: $7 (700 cents) per request
🟨 Limited: بہتری کی ضرورت ہے
```

### 🟠 Low Trust (51-60%)
```
⚠️ Lock Duration: 15 days
⚠️ Max Withdrawal: $5 (500 cents) per request
⚠️ Restricted: بہت محدود
```

### 🔴 Banned (≤ 50%)
```
❌ Account Banned
❌ Earnings Locked (سب locked)
❌ Cannot perform tasks
💸 Unlock Cost:
   - 1st Ban: $3 (300)
   - 2nd Ban: $5 (500)
   - 3rd Ban: $10 (1000)
```

---

## ⏰ Time Penalty System

### اگر 1 minute سے پہلے exit کرو:

```
❌ Early Exit < 1 min
  ↓
📉 Trust Score -10
  ↓
❌ Task rejected
  ↓
🔄 Task واپس pending میں
  ↓
🔁 دوبارہ کوشش کر سکتے ہو
```

---

## 🎯 Trust Score کا اثر

### Trust Score کم ہو رہا ہے؟

```
Trust Score: 100% → 95% → 90% → ... → 70% → 60% → 50% → BAN
                                                      ↓
                                          Pay to unlock
```

### کس چیز سے trust score کم ہوتا ہے:

1. **Early Exit** (-10)
   - 1 minute سے پہلے task سے باہر نکلو

2. **Failed Verification** (-0)
   - Fail ہو تو penalty نہیں، sirf retry

3. **Admin Actions** (custom)
   - Admin manually decrease کر سکتا ہے

---

## 💰 Earnings Lock اور Withdrawal

### کیسے کام کرتا ہے:

```
Task Complete (verified & paid)
  ↓
💵 Reward added to wallet
  ↓
🔒 LOCKED for X days (based on trust score)
  ↓
After X days:
  ├─ Trust > 70%: Unlimited access
  ├─ Trust 61-70%: Max $7 per withdrawal
  ├─ Trust 51-60%: Max $5 per withdrawal
  └─ Trust ≤ 50%: BANNED
```

### Withdrawal Process:

```
1. User: Withdrawal request submit کرتا ہے
   ↓
2. Admin: Admin approve کرتا ہے
   ↓
3. Payment: Bank/PayPal/Crypto میں transfer
   ↓
4. User: Notification ملتی ہے
```

---

## 🖼️ OCR Verification Details

### کیا OCR check کرتا ہے:

1. **Page Name Extraction**
   ```
   Screenshot → Tesseract OCR → "Facebook" text extracted
   ```

2. **Name Matching**
   ```
   Target Page: "facebook.com/mybrand"
   Extracted: "Facebook", "mybrand"
   Match: ✅ YES
   ```

3. **Follower Count Tracking**
   ```
   Before: 1000 followers
   After:  1001 followers (screenshot میں visible)
   Increase: ✅ YES → Verified
   ```

### OCR کیا extract نہیں کر سکتا تو:

```
❌ Page name visible نہیں
❌ Screenshot غلط ہے
❌ OCR fail ہو
  ↓
Task Rejected
Penalty: -10 Trust Score (early exit کی صورت میں)
```

---

## 🔧 Admin Controls

### Admin کو یہ features ہیں:

#### 1. Trust Score Management
```
POST /api/admin-panel/users/:userId/trust-score/increase
POST /api/admin-panel/users/:userId/trust-score/decrease
```

#### 2. Ban Management
```
GET /api/admin-panel/ban-records
POST /api/admin-panel/ban/:banId/unlock
```

#### 3. Withdrawal Approval
```
GET /api/admin-withdrawals/pending
POST /api/admin-withdrawals/:withdrawalId/approve
POST /api/admin-withdrawals/:withdrawalId/reject
```

#### 4. Audit Trail
```
Admin Log میں تمام actions record ہوتے ہیں
```

---

## 📱 API Endpoints

### FREELANCER ENDPOINTS

#### Task Management
```
GET  /api/campaigns/available-tasks
POST /api/campaigns/tasks/:taskId/assign
GET  /api/campaigns/my-tasks
```

#### Verification
```
POST /api/campaigns/tasks/:taskId/submit-proof
Body: {
  image: "base64_string",
  followersBefore: 1000,
  followersAfter: 1001
}
```

#### Earnings & Withdrawals
```
GET  /api/campaigns/earnings-status
GET  /api/campaigns/trust-score
GET  /api/withdrawals/status
POST /api/withdrawals/request
GET  /api/withdrawals/history
POST /api/withdrawals/:withdrawalId/cancel
```

### ADMIN ENDPOINTS

#### Trust Score
```
POST /api/admin-panel/users/:userId/trust-score/increase
POST /api/admin-panel/users/:userId/trust-score/decrease
GET  /api/admin-panel/users/:userId/trust-score/history
```

#### Ban Management
```
GET  /api/admin-panel/ban-records
POST /api/admin-panel/ban/:banId/unlock
```

#### Withdrawals
```
GET  /api/admin-withdrawals/pending
POST /api/admin-withdrawals/:withdrawalId/approve
POST /api/admin-withdrawals/:withdrawalId/reject
```

---

## 📦 Database Schema

### New Tables/Fields

#### User Model (Updated)
```prisma
trustScore Float @default(100.0)  // 0-100%
isBanned Boolean @default(false)
banCount Int @default(0)
banReason String?
banUnlockCost Int?
```

#### CampaignProof Model (Updated)
```prisma
// OCR Fields
ocrPageName String?
ocrMatches Boolean?

// Count Tracking
followersBefore Int?
followersAfter Int?
countIncreased Boolean?

// Time Tracking
taskStartTime DateTime?
proofSubmitTime DateTime @default(now())
timeMinutes Int?
earlyExitPenalty Boolean?
trustPenaltyApplied Int @default(0)
```

#### BanRecord (New)
```prisma
userId Int
banCount Int (1, 2, or 3)
reason String
unlockCost Int (300, 500, or 1000)
paid Boolean
unlockedAt DateTime?
```

#### TrustScoreLog (New)
```prisma
userId Int
oldScore Float
newScore Float
change Float
reason String
adminId Int?
```

#### EarningsLock (New)
```prisma
userId Int
amount Int (in cents)
lockDays Int (10, 15, or 20)
maxWithdraw Int?
unlockedAt DateTime
withdrawn Int @default(0)
```

---

## 🎬 Workflow Examples

### Example 1: Successful Verification

```
1. Freelancer: 1000 followers
2. Task: Follow "TechBrand" page
3. Freelancer: Spends 2 minutes, follow page
4. Freelancer: Takes screenshot (1000 → 1001 followers)
5. System:
   - Time check: 2 min ≥ 1 min ✅
   - OCR: "TechBrand" detected ✅
   - Count: 1001 > 1000 ✅
6. Result: VERIFIED & PAID
   - Reward: $0.40 added
   - Status: Locked for 10 days (trust > 70%)
7. Notification: "✅ Task Verified & Paid"
```

### Example 2: Early Exit Penalty

```
1. Freelancer: Starts task
2. 30 seconds میں: Exit کر دیتا ہے
3. System:
   - Time check: 30 sec < 1 min ❌
4. Result: REJECTED
   - Task: Reverted to pending
   - Trust Score: 100% → 90% (-10)
   - Status: Can retry later
5. Notification: "❌ Task exited early. -10 trust score"
```

### Example 3: OCR Mismatch

```
1. Freelancer: Submit screenshot
2. System:
   - Time check: 2 min ✅
   - OCR: "Wrong Page" extracted ❌
   - Count: Increased ✅
3. Result: REJECTED
   - Task: Reverted
   - Reason: "Page name doesn't match"
   - Penalty: None (wasn't early exit)
4. Notification: "❌ OCR verification failed"
```

### Example 4: Trust Score Drops to Banned

```
Trust Score: 100%
  ↓ (Early exit, -10)
90% [OK]
  ↓ (Admin decrease, -20)
70% [OK - HIGH]
  ↓ (Multiple penalties, -15)
55% [LOW]
  ↓ (Failed verifications, -5)
50% [BANNED ❌]
  
Now:
- Cannot perform tasks
- Earnings fully locked
- Must pay to unlock:
  - If 1st ban: Pay $3
  - If 2nd ban: Pay $5
  - If 3rd ban: Pay $10
```

---

## ⚙️ Configuration

### Trust Score Config (src/services/trust-score.ts)

```typescript
const config = {
  penaltyEarlyExit: 10,         // -10 for < 1 min
  banThreshold: 50,              // Ban at ≤ 50%
  lockDaysHigh: 10,              // > 70% = 10 days
  lockDaysMedium: 15,            // 51-70% = 15 days
  maxWithdrawHigh: null,         // > 70% = unlimited
  maxWithdrawMedium: 700,        // 61-70% = $7
  maxWithdrawMediumLow: 500,     // 51-60% = $5
  banUnlockCost1: 30000,         // 1st = $300
  banUnlockCost2: 50000,         // 2nd = $500
  banUnlockCost3: 100000         // 3rd = $1000
};
```

---

## 📊 Monitoring & Analytics

### Admin Dashboard Stats

```
Total Verifications: 15,234
Success Rate: 87%
Failed: 13%
Average Time: 3.2 minutes
Early Exits: 5%

Users by Trust Score:
- High (>70%): 1,234 users
- Medium (61-70%): 567 users
- Low (51-60%): 234 users
- Banned (≤50%): 89 users
```

---

## 🚀 Deployment Checklist

- [x] Database migration applied
- [x] OCR service created (with Tesseract.js)
- [x] Trust score system implemented
- [x] Earnings lock system implemented
- [x] Withdrawal system implemented
- [x] Admin controls added
- [x] Frontend UI created
- [x] API endpoints tested
- [ ] Production API keys configured (Facebook, YouTube, Instagram)
- [ ] Email notifications setup
- [ ] Monitor fraud patterns
- [ ] Admin training

---

## 🔒 Security Measures

1. **JWT Authentication** - Secure token validation
2. **Time Validation** - Prevent instant click-and-claim
3. **OCR Validation** - Prevent fake screenshots
4. **Trust Score** - Penalize bad behavior
5. **Admin Audit** - All admin actions logged
6. **Rate Limiting** - Prevent spam
7. **Database Constraints** - Foreign key validations

---

## 🎓 Summary of Key Changes

| Feature | Before | After |
|---------|--------|-------|
| Verification | Manual screenshot check | Automated OCR + count verification |
| Time Validation | None | Required 1 minute minimum |
| Penalties | None | -10 for early exit |
| Earnings Lock | None | 10/15/20 days based on trust |
| Withdrawal Limits | Unlimited | Based on trust score |
| Ban System | Simple ban | Progressive ban (3 levels with costs) |
| Admin Control | Limited | Full trust score management |

---

## 📞 Support

For issues or questions:
- Admin Panel: `/api/admin-panel`
- Campaigns: `/api/campaigns`
- Withdrawals: `/api/withdrawals`
- Logs: Check AdminLog table

---

**System Status**: ✅ Ready for deployment

**Last Updated**: January 19, 2026
