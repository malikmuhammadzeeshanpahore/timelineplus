# Quick Reference - Admin Role System

## Role Structure

```
Pure Roles:
- 'freelancer'       : Regular freelancer user
- 'buyer'            : Regular buyer user
- 'guest'            : Not logged in

Mixed Roles (Admin):
- 'admin/freelancer' : Admin logged in as freelancer
- 'admin/buyer'      : Admin logged in as buyer
```

## Login Response

When user logs in, backend returns role like this:

```javascript
// If isAdmin = false, role = 'freelancer'
{ role: 'freelancer' }

// If isAdmin = true, role = 'freelancer'  
{ role: 'admin/freelancer' }

// If isAdmin = true, role = 'buyer'
{ role: 'admin/buyer' }
```

## JWT Token Structure

```javascript
{
  uid: 123,           // User ID
  role: 'admin/freelancer',  // Combined role
  isAdmin: true,      // Admin flag for quick checks
  iat: 1674567890,    // Issued at
  exp: 1675172690     // Expires in 7 days
}
```

## Frontend Role Checks

### Check if User is Admin
```javascript
const role = localStorage.getItem('role');
if (role && role.startsWith('admin/')) {
  // User is admin
}
```

### Check if User is Freelancer (including admin/freelancer)
```javascript
const role = localStorage.getItem('role');
if (role === 'freelancer' || role === 'admin/freelancer') {
  // User is freelancer or admin-as-freelancer
}
```

### Check if User is Buyer (including admin/buyer)
```javascript
const role = localStorage.getItem('role');
if (role === 'buyer' || role === 'admin/buyer') {
  // User is buyer or admin-as-buyer
}
```

## Backend Role Checks

### In Express Middleware/Routes
```javascript
// Check if admin
if (req.user.isAdmin) {
  // User is admin (can be admin/freelancer or admin/buyer)
}

// Check if has specific role
if (req.user.role.startsWith('admin/')) {
  // User has mixed admin role
}

// Get base role (removes admin prefix)
const baseRole = req.user.role.replace('admin/', '');
// 'admin/freelancer' -> 'freelancer'
// 'freelancer' -> 'freelancer'
```

## Access Control Matrix

```
Page/Feature          | freelancer | buyer | admin/freelancer | admin/buyer
/dashboard            | ✓          | ✗     | ✓                | ✗
/dashboard-buyer      | ✗          | ✓     | ✗                | ✓
/wallet              | ✓          | ✓     | ✓                | ✓
/withdrawal          | ✓          | ✗     | ✓                | ✗
/admin-panel         | ✗          | ✗     | ✓                | ✓
/admin-panel/users   | ✗          | ✗     | ✓                | ✓
```

## Common Code Patterns

### Pattern 1: Extract Numeric Role
```javascript
function extractBaseRole(role) {
  return role.replace('admin/', '');
  // 'admin/freelancer' -> 'freelancer'
  // 'freelancer' -> 'freelancer'
}
```

### Pattern 2: Check Multiple Roles
```javascript
function hasAnyRole(role, allowedRoles) {
  return allowedRoles.some(allowed => {
    if (allowed === 'freelancer') {
      return role === 'freelancer' || role === 'admin/freelancer';
    }
    if (allowed === 'buyer') {
      return role === 'buyer' || role === 'admin/buyer';
    }
    return role === allowed;
  });
}

// Usage
if (hasAnyRole(userRole, ['freelancer', 'buyer'])) {
  // User is freelancer, buyer, or admin with one of these roles
}
```

### Pattern 3: Redirect Based on Role
```javascript
function getDefaultDashboard(role) {
  if (role && role.startsWith('admin/')) {
    return '/admin-panel/';
  }
  if (role === 'freelancer' || role === 'admin/freelancer') {
    return '/freelancer-dashboard/';
  }
  if (role === 'buyer' || role === 'admin/buyer') {
    return '/dashboard-buyer/';
  }
  return '/login/';
}
```

## Testing Endpoints

### Test Login Flow
```bash
# Login as admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Response should include:
# "role": "admin/freelancer" or "admin/buyer"
```

### Test User Me Endpoint
```bash
# With admin/freelancer token
curl -X GET http://localhost:4000/api/user/me \
  -H "Authorization: Bearer {token}"

# Response user.role should be "admin/freelancer"
```

### Test Admin Panel
```bash
# Access admin panel with admin/freelancer token
curl -X GET http://localhost:4000/api/admin-panel/dashboard \
  -H "Authorization: Bearer {token}"

# Should return 200 (not 401)
```

## Troubleshooting

### Issue: 401 Unauthorized on /api/user/me
**Cause**: Token doesn't have role field
**Fix**: Regenerate token by logging in again

### Issue: Admin can't access admin panel
**Cause**: isAdmin not in token
**Fix**: 
1. Check if user.isAdmin = true in database
2. Re-login to get updated token

### Issue: Role doesn't show in localStorage
**Cause**: Login response not setting localStorage properly
**Check**: Open browser console and run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));
```

### Issue: Admin gets redirected to freelancer dashboard instead of admin panel
**Cause**: Role check in auth.js not updated
**Fix**: Check auth.js has:
```javascript
if (role && role.startsWith('admin/')) {
  window.location.href = '/admin-panel/';
}
```

## Migration Notes

If updating existing system:
1. Old tokens won't have `role` or `isAdmin` fields - users need to re-login
2. Database users can have `isAdmin = true` and `role = 'freelancer'` - system handles this
3. No database migration needed - role field already exists in Prisma schema
4. All changes are backward compatible with existing pure roles
