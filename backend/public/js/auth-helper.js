// Common authentication helper for all pages
// Provides helper functions for checking token and role

window.AuthHelper = {
  // Get current user from backend
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
    return null;
  },

  // Check if user has specific role
  async hasRole(requiredRole) {
    const user = await this.getCurrentUser();
    if (!user) return false;
    
    if (user.isAdmin) {
      return requiredRole === 'admin';
    }
    return user.role === requiredRole;
  },

  // Check if user is admin
  async isAdmin() {
    const user = await this.getCurrentUser();
    return user?.isAdmin || false;
  },

  // Get auth headers for API calls
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Check if logged in
  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
};
