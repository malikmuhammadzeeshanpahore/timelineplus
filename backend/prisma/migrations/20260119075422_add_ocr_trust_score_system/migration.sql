-- CreateTable
CREATE TABLE "BanRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "banCount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "unlockCost" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BanRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustScoreLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "oldScore" REAL NOT NULL,
    "newScore" REAL NOT NULL,
    "change" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "adminId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrustScoreLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EarningsLock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "lockDays" INTEGER NOT NULL,
    "maxWithdraw" INTEGER,
    "unlockedAt" DATETIME NOT NULL,
    "withdrawn" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EarningsLock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "photo" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'freelancer',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "trustScore" REAL NOT NULL DEFAULT 100.0,
    "banCount" INTEGER NOT NULL DEFAULT 0,
    "banReason" TEXT,
    "banUnlockCost" INTEGER,
    "bannedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "failedLoginAttempts", "id", "isAdmin", "isBanned", "lockedUntil", "password", "photo", "role", "updatedAt", "username") SELECT "createdAt", "email", "emailVerified", "failedLoginAttempts", "id", "isAdmin", "isBanned", "lockedUntil", "password", "photo", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_CampaignProof" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "ocrPageName" TEXT,
    "ocrMatches" BOOLEAN,
    "followersBefore" INTEGER,
    "followersAfter" INTEGER,
    "countIncreased" BOOLEAN,
    "taskStartTime" DATETIME,
    "proofSubmitTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeMinutes" INTEGER,
    "earlyExitPenalty" BOOLEAN,
    "trustPenaltyApplied" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignProof_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CampaignTask" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CampaignProof" ("createdAt", "id", "notes", "proofUrl", "status", "taskId", "verifiedAt") SELECT "createdAt", "id", "notes", "proofUrl", "status", "taskId", "verifiedAt" FROM "CampaignProof";
DROP TABLE "CampaignProof";
ALTER TABLE "new_CampaignProof" RENAME TO "CampaignProof";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
