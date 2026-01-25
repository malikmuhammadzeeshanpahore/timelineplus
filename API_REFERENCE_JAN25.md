# Working API Endpoints - January 25, 2026

## Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/check-admin` - Detect if user is admin (returns `{isAdmin: boolean}`)

## Deposits (Buyer)
- `POST /api/deposits/request` - Create deposit
  ```json
  {
    "amount": 100000,
    "method": "bank"
  }
  ```
- `GET /api/deposits/history` - Get user's deposits
- `GET /api/deposits/my-deposits` - Same as history

## Deposits (Admin)
- `GET /api/admin-panel/deposits?status=pending` - List pending deposits
- `POST /api/admin-panel/deposits/:id/approve` - Approve deposit
- `POST /api/admin-panel/deposits/:id/reject` - Reject deposit

## Campaigns (Buyer)
- `POST /api/campaigns/create` - Create campaign
  ```json
  {
    "title": "Campaign name",
    "description": "Description",
    "type": "likes",
    "targetCount": 100,
    "price": 25000,
    "targetPage": "https://facebook.com/page"
  }
  ```

## Campaigns (Admin)
- `GET /api/admin-panel/campaigns?status=pending` - List pending campaigns
- `POST /api/admin-panel/campaigns/:id/approve` - Approve campaign
- `POST /api/admin-panel/campaigns/:id/reject` - Reject campaign

## Users (Admin)
- `GET /api/admin-panel/users` - List all users
- `GET /api/admin-panel/users/:userId` - Get user details with stats

## Current Status

✅ **FULLY WORKING:**
1. Buyer Dashboard - No syntax errors, loads properly
2. Deposit creation - Frontend → Backend → Admin Panel
3. Admin user details - No Prisma errors
4. Admin approvals - Deposits and campaigns
5. Wallet management - Auto-create and update
6. Price display - Correct formatting (PKR X.XX)

## Recent Fixes

### Dashboard Syntax Error
- Fixed JSX style attribute quotes in dashboard-buyer.jsx
- Lines: 89, 95, 101, 106

### Admin Panel User Details
- Changed `socialAccounts` → `social`
- Changed `campaigns` → `campaignsAsBuyer`  
- Fixed aggregate field: `reward` → `rewardPerTask`

### Deposits Not Showing in Admin
- Changed endpoint from `/api/wallet/deposit` → `/api/deposits/request`
- Changed history from `/api/wallet/deposits` → `/api/deposits/history`
- Fixed request format to JSON

## Test Endpoints

### Create a test buyer and deposit
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"Test123!","role":"buyer"}'

# Login
BUYER_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' | jq -r '.token')

# Create deposit
curl -X POST http://localhost:4000/api/deposits/request \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":100000,"method":"bank"}'

# Fetch as buyer
curl http://localhost:4000/api/deposits/history \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### Admin approval flow
```bash
# Admin login
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@timelineplus.site","password":"Admin123!","loginAs":"freelancer"}' | jq -r '.token')

# View pending deposits
curl http://localhost:4000/api/admin-panel/deposits?status=pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approve deposit
curl -X POST http://localhost:4000/api/admin-panel/deposits/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# View user details
curl http://localhost:4000/api/admin-panel/users/16 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Known Working Scenarios

### Scenario 1: Buyer Creates and Approves
1. Buyer registers and logs in
2. Buyer creates deposit at /deposit page
3. Deposit appears in admin panel
4. Admin approves deposit
5. Wallet updated, balance increases

### Scenario 2: Admin Views User
1. Admin logs in
2. Goes to admin-panel/users
3. Clicks View on a user
4. User details load without errors
5. Shows deposits, wallet, stats

### Scenario 3: Campaign Approval
1. Buyer creates campaign
2. Admin sees pending campaign
3. Admin clicks approve
4. 100 tasks created (1 per target)
5. Campaign status changes to "active"

## Notes

- All amounts in cents (50000 = PKR 500)
- Dates in ISO format
- Status values: pending, approved, rejected, active
- Admin roles: admin_freelancer or admin_buyer
- Wallet auto-created on first approval
