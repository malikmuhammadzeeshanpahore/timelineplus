# 401 Error Fix Guide

## Problem
You're getting 401 errors on:
- `GET /api/user/me`
- `GET /api/admin-panel/dashboard`

## Root Cause
**Old Invalid Token in Browser Storage**

The earlier version of `admin.js` was setting the secret code (`'ADMIN_SECRET_2026'`) as the JWT token in localStorage. This is not a valid JWT, so all API calls fail with 401.

```javascript
// OLD BUG:
localStorage.setItem('token', 'ADMIN_SECRET_2026')  // WRONG!

// NEW FIX:
// Token must be a real JWT from login endpoint
```

## Solution

### Option 1: Clear Browser Storage (Recommended)

**In Browser Console** (F12 → Console tab):
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

Then:
1. Go to login page
2. Login with admin email/password
3. You'll get a valid JWT token
4. Now admin panel will work

### Option 2: Automatic Migration
The new code has automatic detection. Just:
1. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Clear storage when prompted

## What Was Fixed

### Admin.js Changes
**Before:**
```javascript
if (codeParam && codeParam === 'ADMIN_SECRET_2026') {
  localStorage.setItem('token', codeParam);  // BUG!
}
```

**After:**
```javascript
if (codeParam && codeParam === 'ADMIN_SECRET_2026') {
  localStorage.setItem('adminSecret', codeParam);  // Just store secret
  // Token must come from actual login
}

// Migration: Detect and clear bad tokens
if (token === 'ADMIN_SECRET_2026' || token.length < 50) {
  localStorage.removeItem('token');
  alert('Invalid token detected. Please login again.');
  window.location.href = '/';
}
```

### Site.js Changes
Added token validation:
```javascript
const token = localStorage.getItem('token');
if (!token) return renderGuestHeader();

// Check if token is valid JWT (should be long) - migration fix
if (token.length < 50) {
  console.warn('Invalid token detected, clearing localStorage');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  return renderGuestHeader();
}
```

## New Token Flow

### Step 1: Login
```
POST /api/auth/login
{
  email: "admin@timelineplus.site",
  password: "Admin123!"
}

Response:
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // REAL JWT
  user: {
    id: 1,
    email: "admin@timelineplus.site",
    role: "admin/freelancer"  // Important!
  }
}
```

### Step 2: Store Token
```javascript
localStorage.setItem('token', response.token);  // Real JWT
localStorage.setItem('role', response.user.role);
```

### Step 3: Use Token
```javascript
fetch('/api/user/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
// 200 OK ✓
```

### Step 4: Access Admin Panel (with secret code)
```
Visit: /admin-panel?code=ADMIN_SECRET_2026

The admin.js will:
1. Check if you have valid JWT token
2. Store the secret code for verification
3. Both must be present for access
```

## Testing

### Test 1: Check Current Token
```javascript
// In browser console
const token = localStorage.getItem('token');
console.log('Token length:', token.length);
console.log('Token preview:', token.substring(0, 50) + '...');
console.log('Token is valid JWT:', token.length > 50 && token.includes('.'));
```

**Expected:**
- Token length: ~300+
- Contains multiple dots (JWT has 3 parts: `header.payload.signature`)
- NOT `'ADMIN_SECRET_2026'`

### Test 2: Login Fresh
1. Clear storage: `localStorage.clear()`
2. Reload page: `location.reload()`
3. Go to login page and login
4. Check token again with Test 1

### Test 3: Access Admin Panel
1. Login successfully
2. Visit `/admin-panel?code=ADMIN_SECRET_2026`
3. Should see admin panel (not 401 error)

## Files Modified

✅ `/js/admin.js` - Fixed token handling
✅ `/js/site.js` - Added token validation  
✅ `/js/token-migration.js` - New: Auto-migration script
✅ `/header.html` - Added token-migration.js
✅ `src/routes/auth.js` - Login returns role + isAdmin in token
✅ `src/middleware/auth.js` - Extract role from token
✅ `src/routes/admin-panel.js` - Verify using token data

## Common Issues

### Issue: Still Getting 401 After Clearing
**Solution:**
1. Close all tabs with the app
2. Quit browser completely
3. Reopen browser
4. Clear cache: Settings → Clear browsing data
5. Login again

### Issue: "Please login first" message
**This is correct!** 
- You don't have a valid token
- Go to login page and login
- Then try admin panel

### Issue: Can't login (keeps failing)
**Check:**
1. Email is correct: `admin@timelineplus.site`
2. Password is correct: `Admin123!`
3. Server is running: Check `localhost:4000/health`

### Issue: "Invalid secret code" on admin panel
**This is correct!**
- Visit: `/admin-panel?code=ADMIN_SECRET_2026`
- Don't just visit `/admin-panel`
- The `?code=ADMIN_SECRET_2026` parameter is required

## Quick Fix Command (Browser Console)

Copy-paste this:
```javascript
// Complete fix
localStorage.clear();
sessionStorage.clear();
console.log('Storage cleared. Redirecting to login...');
setTimeout(() => {
  location.href = '/login.html';
}, 500);
```

Then login again!

## Server Response Headers

If you still see 401, check these are being sent:

**Request:**
```
Authorization: Bearer eyJhbGc...  (should be 200+ chars)
```

**Response:**
```
200 OK (if token is valid)
401 Unauthorized (if token is invalid/missing)
404 Not Found (if not admin)
```

## Prevention

✅ Always login to get fresh token
✅ Don't manually edit localStorage
✅ Don't copy tokens between browsers
✅ Login again if you clear cookies/storage
✅ Use the migration script when deployed

---

**Still not working?** 
1. Check browser console for specific error message
2. Check server logs for error details
3. Try hard refresh: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
4. Check if server is actually running: `curl localhost:4000/health`
