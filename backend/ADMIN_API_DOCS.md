# Admin Panel API Documentation

## Overview
Complete admin management system with user, deposit, withdrawal, and campaign management. All endpoints require JWT Bearer token and admin verification.

## Authentication
```bash
Header: Authorization: Bearer {token}
```

## Base URL
```
/api/admin-panel
```

---

## DASHBOARD

### GET /admin-panel/dashboard
Get dashboard statistics

**Response:**
```json
{
  "stats": {
    "totalUsers": 150,
    "totalAdmins": 5,
    "bannedUsers": 12,
    "pendingDeposits": 8,
    "pendingWithdrawals": 3,
    "activeCampaigns": 25
  }
}
```

---

## USER MANAGEMENT

### GET /admin-panel/users?q=email&page=1
List all users or search

**Query Parameters:**
- `q` - Search by email, username, phone, or IP
- `page` - Page number (default: 1)

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "john_doe",
      "phone": "+923001234567",
      "isAdmin": false,
      "isBanned": false,
      "role": "freelancer",
      "createdAt": "2026-01-19T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

### GET /admin-panel/users/:userId
Get detailed user information

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "fullName": "John Doe",
    "phone": "+923001234567",
    "ipAddress": "192.168.1.1",
    "role": "freelancer",
    "isBanned": false,
    "emailVerified": true,
    "wallet": { "balance": 50000 },
    "trustScore": 85.5,
    "banCount": 0,
    "accountHolderName": "John Doe",
    "accountType": "Savings",
    "accountNumber": "1234567890",
    "bankName": "Bank of Example",
    "iban": "PK36SCBL0000001123456789",
    "totalEarnings": 250000,
    "totalWithdrawn": 150000,
    "totalDeposits": 100000,
    "deposits": [],
    "campaigns": [],
    "campaignTasks": [],
    "withdrawals": []
  }
}
```

### POST /admin-panel/users/:userId/make-admin
Make a user admin

**Response:**
```json
{
  "success": true,
  "message": "User is now an admin"
}
```

### POST /admin-panel/users/:userId/ban
Ban a user

**Request Body:**
```json
{
  "reason": "Suspicious activity detected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User user@example.com has been banned"
}
```

### POST /admin-panel/users/:userId/unban
Unban a user

**Response:**
```json
{
  "success": true,
  "message": "User user@example.com has been unbanned"
}
```

---

## DEPOSIT MANAGEMENT

### GET /admin-panel/deposits?status=pending
List deposits

**Query Parameters:**
- `status` - pending, approved, or rejected

**Response:**
```json
{
  "deposits": [
    {
      "id": 1,
      "userId": 5,
      "amount": 50000,
      "method": "bank_transfer",
      "status": "pending",
      "createdAt": "2026-01-19T10:00:00Z",
      "user": {
        "id": 5,
        "email": "buyer@example.com",
        "username": "buyer_user"
      }
    }
  ],
  "total": 8,
  "page": 1,
  "pages": 1
}
```

### POST /admin-panel/deposits/:depositId/approve
Approve deposit and add funds to wallet

**Response:**
```json
{
  "success": true,
  "message": "Deposit approved"
}
```

### POST /admin-panel/deposits/:depositId/reject
Reject deposit

**Request Body:**
```json
{
  "reason": "Invalid bank details"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit rejected"
}
```

---

## WITHDRAWAL MANAGEMENT (20% Fee)

### GET /admin-panel/withdrawals?status=pending
List withdrawal requests

**Query Parameters:**
- `status` - pending, approved, or rejected

**Response:**
```json
{
  "withdrawals": [
    {
      "id": 1,
      "userId": 3,
      "amount": 100000,
      "status": "pending",
      "createdAt": "2026-01-19T10:00:00Z",
      "user": {
        "id": 3,
        "email": "freelancer@example.com",
        "username": "freelancer_user",
        "phone": "+923001234567"
      }
    }
  ],
  "total": 3,
  "page": 1,
  "pages": 1
}
```

### GET /admin-panel/withdrawals/:withdrawalId
Get detailed withdrawal information

**Response:**
```json
{
  "withdrawal": {
    "id": 1,
    "userId": 3,
    "amount": 100000,
    "status": "pending",
    "processingFee": 20000,
    "createdAt": "2026-01-19T10:00:00Z",
    "user": {
      "id": 3,
      "email": "freelancer@example.com",
      "username": "freelancer_user",
      "phone": "+923001234567",
      "accountHolderName": "Freelancer Name",
      "accountType": "Current",
      "accountNumber": "9876543210",
      "bankName": "Example Bank",
      "iban": "PK36SCBL0000001987654321"
    }
  }
}
```

### POST /admin-panel/withdrawals/:withdrawalId/approve
Approve withdrawal with 20% fee

**Request Body:**
```json
{
  "transactionId": "TXN-2026-01-19-001"
}
```

**Fee Calculation:**
- Requested Amount: $1,000
- Admin Fee (20%): $200
- Net to Transfer: $800

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal approved. Amount: $1000.00, Fee: $200.00, Net: $800.00"
}
```

**What happens:**
1. Amount deducted from user's wallet (full amount)
2. 20% fee calculated and recorded
3. Transaction logged to wallet_transactions
4. Admin action logged for audit
5. User receives money = Amount - (Amount × 20%)

### POST /admin-panel/withdrawals/:withdrawalId/reject
Reject withdrawal and refund to wallet

**Request Body:**
```json
{
  "reason": "Invalid account details"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal rejected. $1000.00 refunded to user wallet."
}
```

---

## CAMPAIGN MANAGEMENT

### GET /admin-panel/campaigns?status=pending
List campaigns

**Query Parameters:**
- `status` - pending, active, or completed

**Response:**
```json
{
  "campaigns": [
    {
      "id": 1,
      "title": "Follow Instagram Account",
      "type": "follow",
      "targetCount": 100,
      "price": 500000,
      "pricePerTask": 2000,
      "status": "pending",
      "createdAt": "2026-01-19T10:00:00Z",
      "buyer": {
        "id": 5,
        "email": "buyer@example.com",
        "username": "buyer_user"
      },
      "campaignTasks": []
    }
  ],
  "total": 12,
  "page": 1,
  "pages": 1
}
```

### POST /admin-panel/campaigns/:campaignId/approve
Approve campaign and create tasks

**Response:**
```json
{
  "success": true,
  "message": "Campaign approved. 100 tasks created."
}
```

### POST /admin-panel/campaigns/:campaignId/reject
Reject campaign

**Request Body:**
```json
{
  "reason": "Suspicious target account"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign rejected"
}
```

---

## ERROR RESPONSES

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `400` - Bad request (missing parameters, invalid data)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (not admin)
- `404` - Not found (user, deposit, withdrawal, etc.)
- `500` - Server error

---

## WITHDRAWAL FEE STRUCTURE

### 20% Admin Fee
All withdrawals incur a 20% processing fee:

| Requested | Fee | Net Transfer |
|-----------|-----|--------------|
| $100      | $20 | $80          |
| $500      | $100| $400         |
| $1,000    | $200| $800         |
| $5,000    | $1,000| $4,000      |

**Fee Deduction:**
- Full requested amount is deducted from user's wallet
- 20% fee is recorded separately
- Remaining 80% is what the user actually receives

---

## AUDIT LOGGING

All admin actions are logged to `AdminLog` table with:
- Admin ID
- Action performed
- Metadata (details specific to action)
- Timestamp

Examples:
- `approve_deposit` - With deposit amount
- `reject_withdrawal` - With reason
- `ban_user` - With ban reason
- `approve_campaign` - With task count
- `make_admin` - With target user ID

---

## FEATURES

✅ Complete user search and filtering
✅ Detailed user profiles with bank information
✅ Ban/unban system with reasons
✅ Admin promotion capability
✅ Deposit approval/rejection workflow
✅ Withdrawal management with 20% fee calculation
✅ Automatic wallet balance updates
✅ Campaign approval with automatic task creation
✅ Complete audit trail
✅ JWT token security
✅ Error handling and validation
