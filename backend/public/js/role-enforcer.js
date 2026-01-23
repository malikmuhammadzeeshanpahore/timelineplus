// Strict role-based page access enforcement
// Runs on every page to ensure users can only access pages for their role
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const currentPath = window.location.pathname;

  // Page access rules by role
  const accessRules = {
    buyer: {
      allowed: ['/dashboard-buyer', '/profile', '/profile-buyer', '/wallet', '/wallet-buyer', '/orders', '/campaigns', '/deposit', '/support', '/services', '/withdrawal', '/login', '/register', '/forgot'],
      redirectTo: '/dashboard-buyer.html'
    },
    freelancer: {
      allowed: ['/freelancer-dashboard', '/profile', '/withdrawal-details', '/wallet', '/wallet-buyer', '/support', '/services', '/login', '/register', '/forgot', '/tasks'],
      redirectTo: '/freelancer-dashboard.html'
    },
    admin: {
      allowed: ['/admin-panel', '/profile', '/support', '/login', '/register', '/forgot'],
      redirectTo: '/admin-panel.html'
    }
  };

  // Public pages accessible without login
  const publicPages = ['/login', '/register', '/forgot', '/support', '/services', '/index', '/'];

  // Check if current page is public
  const isPublicPage = publicPages.some(page => currentPath.includes(page));

  if (!token && !isPublicPage) {
    // Not logged in and trying to access protected page
    window.location.href = '/login.html';
    return;
  }

  if (!token || !role) {
    // No token/role, redirect to home
    return;
  }

  // Check if user has access to current page
  const userRules = accessRules[role];
  if (!userRules) {
    // Unknown role, logout
    localStorage.clear();
    window.location.href = '/';
    return;
  }

  // Check if current path is allowed for this role
  const hasAccess = userRules.allowed.some(allowedPath => 
    currentPath.includes(allowedPath.replace('/', ''))
  );

  if (!hasAccess && !isPublicPage) {
    // User doesn't have access to this page, redirect to their dashboard
    console.warn(`Access denied to ${currentPath} for role: ${role}. Redirecting to ${userRules.redirectTo}`);
    window.location.replace(userRules.redirectTo);
  }
});
