// Header initialization script - handles user menu and navigation
function initializeHeader() {
  const token = localStorage.getItem('token');
  const userEmailSpan = document.getElementById('userEmail');
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileLink = document.querySelector('a[href="/profile/"]');
  const settingsLink = document.querySelector('a[href="/settings/"]');

  // Load user info
  if (token) {
    fetch('/api/user/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => {
      if (!r.ok) throw new Error('Failed to load user');
      return r.json();
    })
    .then(user => {
      if (userEmailSpan) {
        userEmailSpan.textContent = user.email || user.user?.email || 'User';
      }
    })
    .catch(err => {
      console.error('Error loading user info:', err);
      if (userEmailSpan) userEmailSpan.textContent = 'User';
    });
  } else {
    if (userEmailSpan) userEmailSpan.textContent = 'Not logged in';
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
    const updatedLogoutBtn = document.querySelector('button.logout');
    
    if (updatedLogoutBtn) {
      updatedLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('adminCode');
        localStorage.removeItem('userId');
        sessionStorage.clear();
        window.location.href = '/register/';
      });
    }
  }

  console.log('Header initialized successfully');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeHeader);

// Also initialize immediately if DOM is already ready
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initializeHeader();
}
