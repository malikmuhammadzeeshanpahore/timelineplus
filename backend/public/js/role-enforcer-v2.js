// Role enforcer - verifies user role from backend on every page
// This runs BEFORE any page content is used

(async () => {
  const token = localStorage.getItem('token');
  
  // If no token, redirect to login
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    window.location.replace('/');
    return;
  }

  try {
    // Fetch current user role from backend
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      console.log('⚠️ Token invalid or expired, redirecting to login');
      localStorage.removeItem('token');
      window.location.replace('/');
      return;
    }

    const data = await res.json();
    const userRole = data.user?.role;
    const isAdmin = data.user?.isAdmin;

    console.log(`✅ User verified. Role: ${userRole}, IsAdmin: ${isAdmin}`);

    // Get current page name from URL
    const pathname = window.location.pathname;
    const pageName = pathname.split('/').filter(x => x)[0] || 'root';

    // Define which roles can access which pages
    const pageAccessMap = {
      'freelancer-dashboard': ['freelancer'],
      'dashboard-buyer': ['buyer'],
      'wallet': ['buyer'],
      'deposit': ['buyer'],
      'wallet-buyer': ['buyer'],
      'withdrawal-details': ['buyer'],
      'campaigns': ['freelancer'],
      'admin-panel': ['admin'],
      'admin': ['admin'],
      'orders': ['freelancer'],
      'profile': ['freelancer', 'buyer', 'admin'],  // All authenticated users
      'profile-buyer': ['buyer'],
      'support': ['freelancer', 'buyer', 'admin'],
      'service-detail': ['freelancer'],
      'ocr-verification': ['freelancer', 'buyer']
    };

    // Check if current page requires role verification
    const requiredRoles = pageAccessMap[pageName];

    if (requiredRoles) {
      // Determine actual role to check
      let roleToCheck = userRole;
      if (isAdmin) {
        roleToCheck = 'admin';
      }

      // Check if user has access
      if (!requiredRoles.includes(roleToCheck)) {
        console.log(`❌ Access denied. User role "${roleToCheck}" not in allowed roles:`, requiredRoles);
        showAlert(`Access Denied!\n\nYou need ${requiredRoles.join(' or ')} role to access this page.\n\nYour role: ${roleToCheck}`);
        
        // Redirect to appropriate dashboard based on role
        setTimeout(() => {
          if (roleToCheck === 'admin') {
            window.location.replace('/admin-panel/');
          } else if (roleToCheck === 'freelancer') {
            window.location.replace('/freelancer-dashboard/');
          } else if (roleToCheck === 'buyer') {
            window.location.replace('/dashboard-buyer/');
          } else {
            window.location.replace('/');
          }
        }, 2000);
        return;
      }

      console.log(`✅ Access granted for page "${pageName}"`);
    }

  } catch (err) {
    console.error('❌ Role verification error:', err);
    showAlert('Authentication error. Please login again.');
    localStorage.removeItem('token');
    window.location.replace('/');
  }

  function showAlert(msg) {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-size: 16px;
      max-width: 400px;
      text-align: center;
      color: #333;
    `;
    div.textContent = msg;
    document.body.appendChild(div);
  }
})();
