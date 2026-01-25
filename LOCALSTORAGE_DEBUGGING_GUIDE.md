# LocalStorage Debugging Guide

## Current Issue
User reports that after login:
- localStorage has NO data (both token and role are missing)
- User gets redirected but then auto-logs out
- Admin panel shows "Unauthorized" error

## Enhanced Debugging Steps

Follow these steps to identify exactly where the data flow breaks:

### Step 1: Clear Everything and Start Fresh
1. Open the app in your browser
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Go to **Application** → **Storage** → **Local Storage** → click the site URL and clear all data
5. Refresh the page

### Step 2: Watch the Login Process
1. **Before** clicking login, make sure the Console tab is visible and scrolled to the top
2. Enter credentials (any admin user account)
3. Click Login button
4. **Immediately watch the console** for logs appearing in real-time

### Step 3: Read Console Output in This Order

After you click login, you should see these logs appear (in order):

#### Phase 1: Form Submission
```
Form data extracted: { email: "...", username: "...", password: "***", role: "freelancer" }
Sending login request with: { email: "...", password: "***" }
Sending login request to /api/auth/login
```
**✓ If you see this, form is working**

#### Phase 2: Network Response
```
Response received, status: 200, ok: true
JSON parsed successfully
Login response: { status: 200, ok: true, hasToken: true, error: undefined }
```
**✓ If you see this, server returned success response**

#### Phase 3: LocalStorage Save Attempt
```
=== LOGIN SUCCESS - SAVING TO LOCALSTORAGE ===
Full response: {"token":"eyJ...","user":{"id":123,"email":"...","username":"...","role":"admin/freelancer"}}
Response has user? true
Response user: {id: 123, email: "...", username: "...", role: "admin/freelancer"}
Token length: 387
```
**✓ This confirms response structure is correct**

#### Phase 4: Token Save
```
✓ Token saved to localStorage
```
**❌ If you see error message instead, localStorage saving failed**

#### Phase 5: Role Save
```
Role to save: admin/freelancer
✓ Role saved to localStorage
```
**❌ If you see error message instead, role save failed**

#### Phase 6: Verification
```
=== VERIFICATION - READ BACK FROM LOCALSTORAGE ===
Token stored: eyJ... (length: 387)
Role stored: admin/freelancer
All localStorage keys: (2) ["token", "role"]
  [token]: eyJ...
  [role]: admin/freelancer
```
**✓ If you see this, localStorage is working!**

#### Phase 7: Redirect
```
About to redirect with role: admin/freelancer
Admin role detected, redirecting to admin-panel
```
**✓ If you see this, redirect logic is correct**

### Step 4: Check Admin Panel Load

After redirect, watch for these logs on admin-panel page:

```
=== ADMIN PANEL LOADED ===
window.location.pathname: /admin-panel/
=== LOCALSTORAGE STATE ===
token from localStorage: eyJ... (length: 387)
role from localStorage: admin/freelancer
adminSecret from localStorage: NULL/UNDEFINED
...
Admin Panel Auth Check: {
  hasToken: true,
  tokenLength: 387,
  role: "admin/freelancer",
  roleValid: true,
  adminSecret: "NOT_SET"
}
✓ Authentication passed: token exists, role is valid: admin/freelancer
```

**✓ If you see this, admin panel authentication passed!**

**❌ If you DON'T see "✓ Authentication passed", admin panel authentication failed**

---

## Debugging Scenarios

### Scenario 1: LocalStorage Shows Data After Login
**Signs:**
- Phase 1-6 all show ✓
- localStorage shows token and role
- But still getting "Unauthorized" on admin panel

**Solution:** Token might be invalid or user is not actually an admin. Check:
- Backend logs: look for "Login successful" line and verify `isAdmin: true`
- Check role value: should start with `admin/`

### Scenario 2: "✗ FAILED to save token" or "✗ FAILED to save role"
**Signs:**
- Error message appears during Phase 4 or 5
- Error message: "Error: Cannot save session data"

**Solution:**
- Browser storage might be disabled
- Using private/incognito mode?
- Storage quota exceeded?
- Try in regular (not private) window

### Scenario 3: Verification Phase (Phase 6) Shows NULL/EMPTY
**Signs:**
- Phase 4-5 show ✓ (saved successfully)
- But Phase 6 shows tokens as NULL or empty

**Solution:**
- Something is clearing localStorage between save and read
- Check if any other scripts are calling `localStorage.removeItem()`
- Check browser cache/cookies

### Scenario 4: Form Submission Phase Doesn't Show Any Logs
**Signs:**
- No logs appear in console when clicking login
- Page might just refresh or do nothing

**Solution:**
- Form might not be submitting (JS error preventing submission)
- Check console for any red error messages
- Check that `loginForm` exists: open console and type: `document.getElementById('loginForm')`

### Scenario 5: "Response received" but then "JSON parsing failed"
**Signs:**
- Phase 2 shows error: "JSON parsing failed: SyntaxError"

**Solution:**
- Server returned non-JSON response (HTML error page?)
- Backend might have crashed
- Check browser Network tab for full response
- Check backend server logs

---

## Network Tab Debugging (Alternative Method)

If console logs don't help, use Network tab:

1. Open DevTools → **Network** tab
2. Clear all requests
3. Try to login
4. Look for POST request to `/api/auth/login`
5. Click on it and check:
   - **Status**: Should be `200`
   - **Response**: Should show JSON with `token` and `user` object with `role`
   - **Response Headers**: Check `Content-Type: application/json`

---

## Backend Logs to Check

While frontend is being debugged, check backend console for:

```
Login attempt: { email: "...", hasPassword: true, bodyKeys: [...] }
Login successful: { email: "...", userId: 123, isAdmin: true, finalRole: "admin/freelancer" }
```

**Key things to verify:**
- `isAdmin: true` is present
- `finalRole` shows correct admin/role format (e.g., `admin/freelancer`, not just `freelancer`)

---

## Quick Reference: Expected Values

| Field | Expected Value | Where to Check |
|-------|-----------------|-----------------|
| `j.token` | Long JWT string (200+ chars) | Console Phase 3 |
| `j.user.role` | `admin/freelancer` or `admin/buyer` | Console Phase 3 |
| `localStorage.getItem('token')` | Same as `j.token` | Console Phase 6 |
| `localStorage.getItem('role')` | `admin/freelancer` or `admin/buyer` | Console Phase 6 |
| Redirect URL | `/admin-panel/` | Console Phase 7 |

---

## Next Steps After Debugging

**After you complete these steps, please:**

1. Copy all relevant console logs (from Phase 1 through admin panel load)
2. Note which phase(s) FAILED or showed error messages
3. Check browser Network tab for `/api/auth/login` response
4. Check backend server logs for login attempt
5. Share all this information so I can help fix the specific issue

---

## Commands to Run in Console

If you need to manually test:

```javascript
// Check current localStorage state
console.log('Current localStorage:', {
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role')
});

// Manually set test values
localStorage.setItem('token', 'test_token_12345');
localStorage.setItem('role', 'admin/freelancer');
console.log('After manual set:', localStorage.getItem('role'));

// Clear all
localStorage.clear();
```

