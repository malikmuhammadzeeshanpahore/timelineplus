## 🎯 TimelineP+ - Admin Panel & Campaign System

Complete admin panel, campaign management, and freelancer earning system implemented!

---

## 📋 Features Implemented

### 1. **Admin Panel & User Management**
- ✅ Secret code-based admin registration (`/admin-panel/addadmin/{secret-code}`)
- ✅ Protected admin panel access (`/admin-panel?code={secret-code}`)
- ✅ User search and management
- ✅ Make/Remove admin status
- ✅ Ban/Unban users
- ✅ Suspend users (temporary lock)
- ✅ View admin dashboard with stats

### 2. **Deposit Management (Buyer Payments)**
- ✅ Multiple payment methods (Card, Bank, PayPal, Crypto)
- ✅ Deposit request workflow
- ✅ Admin approval/rejection
- ✅ Automatic wallet funding on approval
- ✅ Deposit history tracking

### 3. **Campaign System (Social Media Growth)**
- ✅ Buyers create campaigns (followers, subscribers, likes, etc.)
- ✅ Price-based task generation (40% of payment becomes freelancer rewards)
- ✅ Admin approval workflow
- ✅ Automatic task distribution
- ✅ Real-time progress tracking
- ✅ Campaign status management

### 4. **Freelancer Earning System**
- ✅ Available tasks dashboard
- ✅ Task assignment (one per freelancer)
- ✅ Proof submission (screenshots)
- ✅ Admin verification system
- ✅ Automatic payment on verification
- ✅ Earnings tracking and history

### 5. **Revenue Model**
- **Buyer pays**: $1000 for 1000 followers
- **Platform takes**: 60% ($600) profit
- **Freelancers share**: 40% ($400) = 1000 tasks × $0.40 per task
- **Each freelancer**: Earns $0.40 for completing their assigned task

---

## 🔑 Admin Access Codes

After running `npm run prisma:seed`, you'll get:

```
📝 Register new admin: /admin-panel/addadmin/ADMIN_REGISTER_XXXXXXXXXXXX
🔐 Access admin panel: /admin-panel?code=ADMIN_PANEL_XXXXXXXXXXXX
```

### Admin Registration
1. Go to: `http://localhost:3000/admin-panel/addadmin/{ADMIN_REGISTER_CODE}`
2. Create new admin account
3. Get JWT token for accessing admin panel

### Access Admin Panel
1. Login with admin account (get JWT token)
2. Go to: `http://localhost:3000/admin-panel.html?code={ADMIN_PANEL_CODE}`
3. Use token from login

---

## 🌐 API Routes

### Admin Panel Routes
```
POST   /api/admin-panel/register/:code              # Register new admin
GET    /api/admin-panel/verify/:code                # Verify admin access
GET    /api/admin-panel/dashboard/:code             # Dashboard stats
GET    /api/admin-panel/users/:code?q=email         # Search users
POST   /api/admin-panel/users/:code/:userId/make-admin
POST   /api/admin-panel/users/:code/:userId/remove-admin
POST   /api/admin-panel/users/:code/:userId/ban
POST   /api/admin-panel/users/:code/:userId/unban
POST   /api/admin-panel/users/:code/:userId/suspend
GET    /api/admin-panel/deposits/:code?status=pending
POST   /api/admin-panel/deposits/:code/:depositId/approve
POST   /api/admin-panel/deposits/:code/:depositId/reject
GET    /api/admin-panel/campaigns/:code?status=pending
POST   /api/admin-panel/campaigns/:code/:campaignId/approve
POST   /api/admin-panel/campaigns/:code/:campaignId/reject
POST   /api/admin-panel/secrets/:code/generate      # Generate new codes
```

### Campaign Routes
```
POST   /api/campaigns/create                        # Create campaign (buyer)
GET    /api/campaigns/my-campaigns                  # Get buyer's campaigns
GET    /api/campaigns/:campaignId/details
GET    /api/campaigns/available-tasks               # Available for freelancers
POST   /api/campaigns/tasks/:taskId/assign          # Claim task
GET    /api/campaigns/my-tasks                      # Get assigned tasks
POST   /api/campaigns/tasks/:taskId/submit-proof    # Submit proof
POST   /api/campaigns/tasks/:taskId/verify          # Verify & pay (admin)
```

### Deposit Routes
```
POST   /api/deposits/request                        # Create deposit request
GET    /api/deposits/my-deposits                    # Get user's deposits
GET    /api/deposits/status/:depositId
POST   /api/deposits/:depositId/cancel
```

---

## 📱 Frontend Pages

### Admin Panel
- **File**: `public/admin-panel.html`
- **URL**: `http://localhost:3000/admin-panel.html?code={ADMIN_CODE}`
- **Features**: User management, deposit approval, campaign approval, stats

### Buyer Dashboard (Campaigns)
- **File**: `public/campaigns.html`
- **URL**: `http://localhost:3000/campaigns.html`
- **Features**: Create campaigns, track progress, manage payments

### Freelancer Dashboard
- **File**: `public/freelancer-dashboard.html`
- **URL**: `http://localhost:3000/freelancer-dashboard.html`
- **Features**: Available tasks, my tasks, earnings, proofs

### Deposit/Wallet
- **File**: `public/deposit.html`
- **URL**: `http://localhost:3000/deposit.html`
- **Features**: Add funds, payment methods, deposit history

---

## 🔐 Security Features

### Authentication
- JWT-based token authentication
- Bearer token in Authorization header
- Token expiry: 30 days

### Admin Protection
- Secret codes required for admin operations
- Middleware verification on all admin routes
- Admin-only operations validated server-side
- Audit logging of all admin actions

### Verification System
- Proof submission with screenshots
- Admin verification before payment
- Status tracking: pending → completed → verified → paid
- Fraud detection ready (can implement API checks)

---

## 💾 Database Schema

### New Models
- `AdminSecret` - Secret codes for admin access
- `Deposit` - Buyer deposit requests
- `Campaign` - Social media growth campaigns
- `CampaignTask` - Individual tasks for campaigns
- `CampaignProof` - Proof submissions for verification

### Updated Models
- `User` - Added relations for campaigns and deposits

---

## 🚀 Setup & Running

### 1. Generate Admin Codes
```bash
npm run prisma:seed
```
This creates:
- Default admin user: `admin@timelineplus.site`
- Secret codes for registration and panel access

### 2. Start Server
```bash
npm run dev
```

### 3. Access Application
- Admin Registration: `/admin-panel/addadmin/{code}`
- Admin Panel: `/admin-panel.html?code={code}`
- Campaigns: `/campaigns.html`
- Freelancer: `/freelancer-dashboard.html`
- Deposits: `/deposit.html`

---

## 📊 Campaign Workflow

### Buyer Side
1. ✅ Create campaign (target: 1000 followers, price: $1000)
2. ⏳ Wait for admin approval
3. ✅ Make deposit payment
4. 📊 Track progress in real-time (0/1000, 45/1000, etc.)

### Freelancer Side
1. 👀 View available tasks
2. 🎯 Claim task (auto-assigned to them)
3. 📸 Go to page and perform action (follow, subscribe, etc.)
4. 📤 Submit proof (screenshot)
5. ⏳ Wait for admin verification
6. 💰 Automatic payment on verification

### Admin Side
1. 📋 Review pending campaigns
2. ✅ Approve (creates 1000 tasks)
3. 💳 Review pending deposits
4. ✅ Approve/Reject
5. 🔍 Verify proofs from freelancers
6. ✅ Mark as verified → Auto payment

---

## 🎯 Next Steps (Future Features)

1. **API Verification**
   - Facebook API to verify followers
   - YouTube API for subscribers
   - Instagram API integration

2. **Payment Integration**
   - Stripe for card payments
   - PayPal API
   - Crypto payments

3. **Analytics**
   - Campaign ROI tracking
   - Freelancer performance metrics
   - Platform earnings analytics

4. **Advanced Security**
   - Fraud detection ML model
   - IP-based verification
   - Behavior analysis

5. **Notification System**
   - Email notifications
   - SMS alerts
   - Push notifications

---

## 💡 Important Notes

- All prices stored in **cents** (multiply USD by 100)
- JWT tokens valid for **30 days**
- Admin codes are **one-time use** (can generate more anytime)
- Deposits require admin approval before activation
- Campaigns require admin approval to start
- Freelancer payments are **automatic** once proof is verified

---

## 📞 Support

For issues or questions, contact the development team.

**Happy Earning! 🚀💰**
