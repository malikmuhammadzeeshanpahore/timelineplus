// Role-based access control - prevents buyers from accessing freelancer pages and vice versa
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'guest';
  const path = window.location.pathname;

  // Map of protected pages to allowed roles
  const protectedPages = {
    '/dashboard': ['buyer', 'freelancer'],
    '/dashboard-buyer': ['buyer'],
    '/dashboard-freelancer': ['freelancer'],
    '/profile': ['buyer', 'freelancer'],
    '/profile-buyer': ['buyer'],
    '/wallet': ['buyer', 'freelancer'],
    '/wallet-buyer': ['buyer', 'freelancer'],
    '/withdrawal-details': ['buyer', 'freelancer'],
    '/orders': ['buyer'],
    '/services': ['buyer', 'guest'],
    '/support': ['buyer', 'freelancer', 'guest'],
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
      if (!allowedRoles.includes(role)) {
        alert(`Access denied. This page is only for ${allowedRoles.join(' and ')} users.`);
        if (token && role === 'buyer') {
          window.location.href = '/dashboard';
        } else if (token && role === 'freelancer') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login';
        }
        return;
      }
    }
  }
});
