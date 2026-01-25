// Header initialization script - handles user menu and navigation
function initializeHeader() {
  const token = localStorage.getItem('token');
  const userEmailSpan = document.getElementById('userEmail');
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const backBtn = document.getElementById('backBtn');
  const profileLink = document.querySelector('a[href="/profile/"]');
  const settingsLink = document.querySelector('a[href="/settings/"]');

  // Handle hamburger menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      // Close user dropdown if open
      if (userDropdown && !userDropdown.classList.contains('hidden')) {
        userDropdown.classList.add('hidden');
      }
    });

    // Close hamburger when clicking on mobile menu links
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || (e.target.tagName === 'BUTTON' && e.target.id !== 'mobileLogout')) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
  }

  // Back button handling
  if (backBtn) {
    try {
      const hidePaths = ['/dashboard-buyer', '/freelancer-dashboard', '/admin-panel', '/dashboard'];
      const p = window.location.pathname || '/';
      const shouldHide = p === '/' || p === '/index.html' || hidePaths.some(h => p.startsWith(h));
      if (!shouldHide) backBtn.style.display = 'inline-flex';
    } catch (e) {}

    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try { if (window.history && window.history.length > 1) { window.history.back(); return; } } catch (e) {}
      window.location.href = '/';
    });
  }

  // Close menu when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger && hamburger.classList.contains('active')) {
      hamburger.classList.remove('active');
      if (mobileMenu) mobileMenu.classList.remove('active');
    }
  });

  // Load user info
  if (token) {
    fetch('/api/user/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => {
      if (!r.ok) throw new Error('Failed to load user');
      return r.json();
    })
    .then(data => {
      const user = data.user || data;
      const role = user.role || localStorage.getItem('role');
      const displayName = user.name || user.username || user.email || 'User';
      
      if (userEmailSpan) {
        userEmailSpan.textContent = displayName;
      }

      // Update role in localStorage
      localStorage.setItem('role', role);

      // Populate mobile menu based on role
      if (mobileMenu) {
        populateMobileMenuByRole(role, mobileMenu);
      }
    })
    .catch(err => {
      console.error('Error loading user info:', err);
      if (userEmailSpan) userEmailSpan.textContent = 'User';
    });
  } else {
    if (userEmailSpan) userEmailSpan.textContent = 'Not logged in';
    // Populate guest mobile menu
    if (mobileMenu) {
      populateMobileMenuByRole('guest', mobileMenu);
    }
  }

  // Setup dropdown toggle
  if (userMenuBtn && userDropdown) {
    // Remove any existing listeners first by cloning
    const newBtn = userMenuBtn.cloneNode(true);
    userMenuBtn.parentNode.replaceChild(newBtn, userMenuBtn);
    const updatedBtn = document.getElementById('userMenuBtn');

    // Toggle dropdown on button click
    updatedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
      // Close hamburger if open
      if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
      }
    });

    // Close dropdown when clicking nav links
    if (profileLink) {
      const newProfileLink = profileLink.cloneNode(true);
      profileLink.parentNode.replaceChild(newProfileLink, profileLink);
      const updatedProfileLink = document.querySelector('a[href="/profile/"]');
      if (updatedProfileLink) {
        updatedProfileLink.addEventListener('click', (e) => {
          e.preventDefault();
          userDropdown.classList.add('hidden');
          window.location.href = '/profile/';
        });
      }
    }

    if (settingsLink) {
      const newSettingsLink = settingsLink.cloneNode(true);
      settingsLink.parentNode.replaceChild(newSettingsLink, settingsLink);
      const updatedSettingsLink = document.querySelector('a[href="/settings/"]');
      if (updatedSettingsLink) {
        updatedSettingsLink.addEventListener('click', (e) => {
          e.preventDefault();
          userDropdown.classList.add('hidden');
          window.location.href = '/settings/';
        });
      }
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target) && e.target !== updatedBtn && !updatedBtn.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });

    // Prevent dropdown from closing when clicking inside it
    userDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Logout handler
  if (logoutBtn) {
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    const updatedLogoutBtn = document.querySelector('.user-dropdown .logout');
    
    if (updatedLogoutBtn) {
      updatedLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('adminCode');
        localStorage.removeItem('userId');
        sessionStorage.clear();
        window.location.href = '/login.html';
      });
    }
  }

  console.log('Header initialized successfully');
}

// Populate mobile menu based on role
function populateMobileMenuByRole(role, mobileMenu) {
  if (!mobileMenu) return;

  let menuHTML = '';

  if (role === 'freelancer') {
    menuHTML = `
      <a href="/freelancer-dashboard/"><i class="fas fa-chart-line" style="margin-right: 12px;"></i>Dashboard</a>
      <a href="/profile/"><i class="fas fa-user" style="margin-right: 12px;"></i>Profile</a>
      <a href="/wallet/"><i class="fas fa-wallet" style="margin-right: 12px;"></i>Wallet</a>
      <a href="/support/"><i class="fas fa-question-circle" style="margin-right: 12px;"></i>Support</a>
      <div class="mobile-menu-divider"></div>
      <button class="logout" id="mobileLogout"><i class="fas fa-sign-out-alt" style="margin-right: 12px;"></i>Logout</button>
    `;
  } else if (role === 'buyer') {
    menuHTML = `
      <a href="/dashboard-buyer/"><i class="fas fa-chart-line" style="margin-right: 12px;"></i>Dashboard</a>
      <a href="/services/"><i class="fas fa-briefcase" style="margin-right: 12px;"></i>Services</a>
      <a href="/orders/"><i class="fas fa-shopping-cart" style="margin-right: 12px;"></i>Campaigns</a>
      <a href="/wallet/"><i class="fas fa-wallet" style="margin-right: 12px;"></i>Wallet</a>
      <a href="/support/"><i class="fas fa-question-circle" style="margin-right: 12px;"></i>Support</a>
      <div class="mobile-menu-divider"></div>
      <button class="logout" id="mobileLogout"><i class="fas fa-sign-out-alt" style="margin-right: 12px;"></i>Logout</button>
    `;
  } else if (role && role.startsWith('admin/')) {
    menuHTML = `
      <a href="/admin-panel/"><i class="fas fa-cog" style="margin-right: 12px;"></i>Admin Panel</a>
      <a href="/profile/"><i class="fas fa-user" style="margin-right: 12px;"></i>Profile</a>
      <a href="/support/"><i class="fas fa-question-circle" style="margin-right: 12px;"></i>Support</a>
      <div class="mobile-menu-divider"></div>
      <button class="logout" id="mobileLogout"><i class="fas fa-sign-out-alt" style="margin-right: 12px;"></i>Logout</button>
    `;
  } else {
    // Guest menu
    menuHTML = `
      <a href="/services/"><i class="fas fa-briefcase" style="margin-right: 12px;"></i>Services</a>
      <a href="/support/"><i class="fas fa-question-circle" style="margin-right: 12px;"></i>Support</a>
      <div class="mobile-menu-divider"></div>
      <a href="/login.html"><i class="fas fa-sign-in-alt" style="margin-right: 12px;"></i>Login</a>
      <a href="/register.html"><i class="fas fa-user-plus" style="margin-right: 12px;"></i>Register</a>
    `;
  }

  mobileMenu.innerHTML = menuHTML;

  // Add event listener for mobile logout
  const mobileLogout = mobileMenu.querySelector('#mobileLogout');
  if (mobileLogout) {
    mobileLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('adminCode');
      localStorage.removeItem('userId');
      sessionStorage.clear();
      window.location.href = '/login.html';
    });
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeHeader);

// Also initialize immediately if DOM is already ready
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initializeHeader();
}
