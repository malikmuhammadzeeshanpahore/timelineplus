# 🧪 QUICK TESTING GUIDE

## Fast Test (5 minutes)

### 1. Test Header + Back Button (1 min)
```
1. Go to http://localhost:4000/deposit/
2. ✓ Should see header with logo and back button
3. ✓ Click back button → should go to dashboard
```

### 2. Test Deposit Flow (2 min)
```
1. Go to http://localhost:4000/deposit/
2. Fill form:
   - Name: Any name
   - Account: Any number
   - Type: Bank/JazzCash
   - Amount: 5000
   - Upload image
3. Click "Submit Deposit Request"
4. ✓ Green toast appears: "✓ Deposit created!"
5. Open DevTools (F12) → Console
6. ✓ Should see logs with emojis (✅, ✕, 📤, etc.)
```

### 3. Test Admin Delete (2 min)
```
1. Go to http://localhost:4000/admin-panel/
2. Click "Users" tab
3. Find any user row
4. Click red "Delete" button (trash icon)
5. ✓ Confirmation popup appears
6. Click "OK"
7. ✓ User removed from list
8. ✓ Toast shows success message
```

---

## Detailed Console Logs Test

### Expected Logs on Each Page:

**Deposit Page:**
```
🔄 [DEPOSIT] Initializing page...
🔗 [DEPOSIT] Fetching header...
✅ [DEPOSIT] Header loaded
✅ [DEPOSIT] Back button added
📄 [DEPOSIT] Page DOM loaded
```

**After Form Submission:**
```
📤 [DEPOSIT] Submitting deposit: {amount: 500000, method: "bank"}
📥 [DEPOSIT] API Response: {status: 200, ok: true}
📋 [DEPOSIT] Response data: {success: true, deposit: {...}}
✅ [DEPOSIT] Success - Deposit ID: 17
```

**Dashboard Page:**
```
🔄 [DASHBOARD] Starting data load...
📊 [DASHBOARD] Fetching user data...
✅ [DASHBOARD] User data received
💰 [DASHBOARD] Balance updated: PKR 0
📋 [DASHBOARD] Fetching campaigns...
✅ [DASHBOARD] Campaigns received
💳 [DASHBOARD] Fetching deposits...
✅ [DASHBOARD] Deposits received
```

---

## Testing Checklist

### Headers & Back Buttons
- [ ] Deposit page has header
- [ ] Deposit page has back button
- [ ] Campaigns page has header
- [ ] Campaigns page has back button
- [ ] Wallet page has header
- [ ] Wallet page has back button

### Toast Notifications
- [ ] Success toast appears on deposit creation
- [ ] Error toast appears on failed operations
- [ ] Info toast appears on form submission
- [ ] Toast auto-hides after 4 seconds

### Console Logging
- [ ] Deposit page shows 🔄 initialization logs
- [ ] Form submission shows 📤 sending logs
- [ ] Response shows 📥 receiving logs
- [ ] Success shows ✅ confirmation
- [ ] Errors show ❌ error logs

### Deposit Visibility
- [ ] Create deposit as buyer
- [ ] Deposit appears in buyer history
- [ ] Deposit appears in admin panel
- [ ] Admin can approve deposit
- [ ] Wallet updates after approval

### Admin Delete
- [ ] Delete button visible on users
- [ ] Confirmation appears before delete
- [ ] User removed after confirmation
- [ ] Toast confirms deletion
- [ ] Console logs user deletion

### Data Loading
- [ ] Dashboard loads user data
- [ ] Balance displays correctly
- [ ] Campaigns load
- [ ] Deposits load
- [ ] All amounts formatted as PKR

---

## Console Emoji Legend

| Emoji | Meaning |
|-------|---------|
| 🔄 | Loading/Initializing |
| ✅ | Success |
| ❌ | Failed/Error |
| ⚠️ | Warning |
| ℹ️ | Information |
| 📤 | Sending data |
| 📥 | Receiving data |
| 💳 | Deposit/Payment |
| 💰 | Money/Balance |
| 📊 | Data/Stats |
| 📋 | Response data |
| 🔗 | Fetching resource |
| ↩️ | Back/Navigation |
| 🗑️ | Delete operation |

---

## How to Report Issues

If something isn't working:

1. **Open DevTools:** F12
2. **Go to Console tab**
3. **Look for red ❌ messages**
4. **Check the error message**
5. **Note any ✅ or ℹ️ logs before error**
6. **Report what you were trying to do**

Example issue report:
```
"When I try to submit deposit, I see:
📤 [DEPOSIT] Submitting deposit...
❌ [DEPOSIT] Error: Network timeout"
```

---

## Server Status Check

```bash
# Check if server is running
curl http://localhost:4000/api/auth/check-admin

# Should return JSON response (even if error message)
```

---

## Quick Reset

If you want to clear deposits and start fresh:

```bash
# Stop server
pkill -f "node src/index.js"

# Delete database
rm /path/to/database.sqlite

# Restart server
npm start
```

---

## Performance Baseline

Page load times (approximate):
- Deposit page: < 2 seconds
- Campaigns page: < 2 seconds
- Wallet page: < 2 seconds
- Dashboard page: < 3 seconds (with data)
- Admin panel: < 3 seconds (with users)

If pages take longer, check:
1. Network tab (F12) for slow API calls
2. Console for errors
3. Server logs (/tmp/server.log)

---

**All tests should PASS! If not, check the console logs! 🚀**
