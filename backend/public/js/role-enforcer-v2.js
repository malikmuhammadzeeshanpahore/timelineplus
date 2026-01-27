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
      'wallet': ['freelancer', 'buyer'],  // Both can access unified wallet
      'deposit': ['buyer'],
      'wallet-buyer': ['buyer'],
      'withdrawal-details': ['buyer', 'freelancer'],  // Both need to set withdrawal details
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

      // Admin can access ALL pages regardless of role requirements
      if (roleToCheck === 'admin') {
        console.log(`✅ Admin user - full access to all pages`);
      } else if (!requiredRoles.includes(roleToCheck)) {
        // Check if user has access for non-admin users
        console.log(`❌ Access denied. User role "${roleToCheck}" not in allowed roles:`, requiredRoles);
        
        // Clear token to prevent infinite loops - user needs to login again
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        // Redirect to login page
        window.location.replace('/');
        return;
      } else {
        console.log(`✅ Access granted for page "${pageName}"`);
      }
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
