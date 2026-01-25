// Role-based access control - prevents buyers from accessing freelancer pages and vice versa
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'guest';
  const path = window.location.pathname;

  // Skip role protection on admin panel (handled by admin.js)
  if (path.includes('admin-panel') || path === '/admin-panel/') {
    console.log('Admin panel detected, skipping role-protect.js');
    return;
  }

  // Map of protected pages to allowed roles
  const protectedPages = {
    '/dashboard-buyer': ['buyer'],
    '/dashboard-freelancer': ['freelancer'],
    '/profile': ['buyer', 'freelancer', 'admin_buyer', 'admin_freelancer'],  // All authenticated users
    '/profile-buyer': ['buyer', 'admin_buyer'],
    '/wallet': ['buyer', 'freelancer', 'admin_buyer', 'admin_freelancer'],  // All authenticated users
    '/wallet-buyer': ['buyer', 'admin_buyer'],
    '/withdrawal-details': ['buyer', 'freelancer', 'admin_buyer', 'admin_freelancer'],  // All authenticated users
    '/orders': ['buyer', 'admin_buyer'],
    '/services': ['buyer', 'admin_buyer', 'guest'],
    '/support': ['buyer', 'freelancer', 'admin_buyer', 'admin_freelancer', 'guest'],
  };

  // Check if current page requires a specific role
  for (const [page, allowedRoles] of Object.entries(protectedPages)) {
    if (path.includes(page) || path.startsWith(page)) {
      // If page requires login and user not logged in
      if (!['guest', 'services', 'support', 'login', 'register', 'forgot'].some(p => path.includes(p)) && !token) {
        window.location.href = '/login';
        return;
      }

      // If user doesn't have permission to access this page
      const hasAccess = allowedRoles.includes(role);
      if (!hasAccess) {
        // If token exists but role is still 'guest', site.js might still be loading
        // Don't redirect yet, just return and let page load
        if (token && role === 'guest') {
          console.log('Token exists but role is guest, site.js might still be loading. Allowing page load.');
          return;
        }
        
        // Redirect to appropriate dashboard based on role
        if (token && (role === 'buyer' || role === 'admin_buyer')) {
          window.location.href = '/dashboard-buyer.html';
        } else if (token && (role === 'freelancer' || role === 'admin_freelancer')) {
          window.location.href = '/dashboard-freelancer.html';
        } else {
          window.location.href = '/login';
        }
        return;
      }
    }
  }
});
