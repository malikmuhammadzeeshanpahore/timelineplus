// Clear Old Tokens - Migration Helper
// Run this in browser console if you get 401 errors:
// localStorage.clear(); location.reload();

(function() {
  // Auto-fix for old invalid tokens
  const token = localStorage.getItem('token');
  
  if (token && (token === 'ADMIN_SECRET_2026' || token.length < 50)) {
    console.warn('[Token Migration] Detected invalid token, clearing localStorage');
    localStorage.clear();
    sessionStorage.clear();
  }
})();
