import React, { useState, useEffect } from 'react';

const Header = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'buyer');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'buyer';
    setToken(token);
    setRole(role);

    // Load inline scripts from HTML if any
  }, []);

  const styles = `

    #header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    #header h1 {
      margin: 0;
      font-size: 24px;
    }

    #header nav {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    #header nav a, #header nav button {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 5px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
    }

    #header nav a:hover, #header nav button:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    #header .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #header .user-menu {
      position: relative;
    }

    #header .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      color: #333;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      display: none;
      z-index: 1001;
      margin-top: 5px;
    }

    #header .dropdown.show {
      display: block;
    }

    #header .dropdown a {
      display: block;
      color: #333;
      padding: 10px 15px;
      border: none;
      background: white;
      text-decoration: none;
      border-radius: 0;
      width: 100%;
      text-align: left;
    }

    #header .dropdown a:hover {
      background: #f0f0f0;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 2000;
      justify-content: center;
      align-items: center;
    }

    .modal-overlay.show {
      display: flex;
    }

    .modal {
      background: white;
      border-radius: 10px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
    }

    .modal h2 {
      color: #667eea;
      margin-bottom: 20px;
    }

    .modal button {
      background: #667eea;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 10px 5px 10px 0;
    }

    .modal button:hover {
      background: #764ba2;
    }

    .modal button.secondary {
      background: #6c757d;
    }

    .modal button.secondary:hover {
      background: #5a6268;
    }
  
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <!-- Dynamic Header Component -->
<header id="header" style="display: none;">
  <style>
    #header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              <button data-action="toggleUserMenu">👤</button>
      top: 0;
                <a href="#" data-action="showProfile">Profile</a>
                <a href="#" data-action="showSettings">Settings</a>
                <a href="#" data-action="logout">Logout</a>
    #header h1 {
      margin: 0;
      font-size: 24px;
    }

    #header nav {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    #header nav a, #header nav button {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 5px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
    }

    #header nav a:hover, #header nav button:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    #header .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #header .user-menu {
      position: relative;
    }

    #header .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      color: #333;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      display: none;
      z-index: 1001;
      margin-top: 5px;
    }

    #header .dropdown.show {
      display: block;
    }

    #header .dropdown a {
      display: block;
      color: #333;
      padding: 10px 15px;
      border: none;
      background: white;
      text-decoration: none;
      border-radius: 0;
      width: 100%;
      text-align: left;
    }

    #header .dropdown a:hover {
      background: #f0f0f0;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 2000;
      justify-content: center;
      align-items: center;
    }

    .modal-overlay.show {
      display: flex;
    }

    .modal {
      background: white;
      border-radius: 10px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
    }

    .modal h2 {
      color: #667eea;
      margin-bottom: 20px;
    }

    .modal button {
      background: #667eea;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 10px 5px 10px 0;
    }

    .modal button:hover {
      background: #764ba2;
    }

    .modal button.secondary {
      background: #6c757d;
    }

    .modal button.secondary:hover {
      background: #5a6268;
    }
  </style>

  <h1>⏱️ TimelinePlus</h1>

  <nav id="navMenu"></nav>

  <div class="user-info">
    <span id="userDisplay">Loading...</span>
    <div class="user-menu">
      <button onclick="toggleUserMenu()">👤</button>
      <div id="userDropdown" className="dropdown">
        <a href="javascript:" onclick="showProfile()">Profile</a>
        <a href="javascript:" onclick="showSettings()">Settings</a>
        <a href="javascript:" onclick="logout()">Logout</a>
      </div>
    </div>
  </div>
</header>

<!-- User Menu Modals -->
<div id="profileModal" class="modal-overlay" onclick="closeModal(event)">
  <div class="modal" onclick="event.stopPropagation()">
    <h2>👤 Your Profile</h2>
    <div id="profileContent"></div>
    <button onclick="closeModal()" class="secondary">Close</button>
  </div>
</div>

<div id="settingsModal" class="modal-overlay" onclick="closeModal(event)">
  <div class="modal" onclick="event.stopPropagation()">
    <h2>⚙️ Settings</h2>
    <div id="settingsContent"></div>
    <button onclick="closeModal()" class="secondary">Close</button>
  </div>
</div>

<script>
  const API_BASE = window.location.origin + '/api';

  // Load header on page load
  document.addEventListener('DOMContentLoaded', initializeHeader);

  async function initializeHeader() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/register/';
      return;
    }

    try {
      // Get current user
      const response = await fetch(`${API_BASE}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        window.location.href = '/register/';
        return;
      }

      const data = await response.json();
      const user = data.user;
      const role = user.role || 'freelancer';

      // Show header
      document.getElementById('header').style.display = 'flex';
      document.getElementById('userDisplay').textContent = `${user.username || user.email}`;

      // Build navigation menu based on role
      let navHTML = '';

      if (user.isAdmin) {
        navHTML = `
          <a href="/admin-panel/?code=${getAdminCode()}">Admin Panel</a>
          <a href="/dashboard-admin/">Dashboard</a>
        `;
      } else if (role === 'buyer') {
        navHTML = `
          <a href="/campaigns/">Campaigns</a>
          <a href="/dashboard-buyer/">Dashboard</a>
          <a href="/deposit/">Deposit</a>
          <a href="/withdrawal-details/">Withdrawals</a>
        `;
      } else if (role === 'freelancer') {
        navHTML = `
          <a href="/ocr-verification/">Tasks</a>
          <a href="/freelancer-dashboard/">Dashboard</a>
          <a href="/withdrawal-details/">Withdrawals</a>
        `;
      }

      document.getElementById('navMenu').innerHTML = navHTML;
    } catch (error) {
      console.error('Error initializing header:', error);
      localStorage.removeItem('token');
      window.location.href = '/register/';
    }
  }

  function toggleUserMenu() {
    document.getElementById('userDropdown').classList.toggle('show');
  }

  function closeUserMenu() {
    document.getElementById('userDropdown').classList.remove('show');
  }

  async function showProfile() {
    closeUserMenu();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const user = data.user;

      document.getElementById('profileContent').innerHTML = `
        <div style="margin-bottom: 15px;">
          <strong>Email:</strong> ${user.email}<br>
          <strong>Username:</strong> ${user.username || 'Not set'}<br>
          <strong>Role:</strong> ${user.role.toUpperCase()}<br>
          <strong>Trust Score:</strong> ${user.trustScore?.toFixed(1) || 'N/A'}%<br>
          <strong>Balance:</strong> $${(data.balance / 100).toFixed(2)}<br>
          <strong>Account Status:</strong> ${user.isBanned ? '🔴 Banned' : '🟢 Active'}
        </div>
      `;
      document.getElementById('profileModal').classList.add('show');
    } catch (error) {
      alert('Error loading profile: ' + error.message);
    }
  }

  async function showSettings() {
    closeUserMenu();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const user = data.user;

      let settingsHTML = `
        <div style="margin-bottom: 15px;">
          <label><strong>Email:</strong> ${user.email}</label><br>
          <label><strong>Username:</strong> <input type="text" id="username" value="${user.username || ''}" placeholder="Enter username"></label><br>
      `;

      if (user.isAdmin) {
        settingsHTML += `
          <hr>
          <h3>Admin Settings</h3>
          <button onclick="changePassword()" style="background: #667eea; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">Change Password</button>
        `;
      }

      settingsHTML += '</div>';

      document.getElementById('settingsContent').innerHTML = settingsHTML;
      document.getElementById('settingsModal').classList.add('show');
    } catch (error) {
      alert('Error loading settings: ' + error.message);
    }
  }

  function changePassword() {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    const adminCode = getAdminCode();
    if (!adminCode) {
      alert('Admin code not found');
      return;
    }

    const token = localStorage.getItem('token');
    const currentPassword = prompt('Enter current password:');
    if (!currentPassword) return;

    fetch(`${API_BASE}/admin-panel/admin/${adminCode}/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        alert('✅ Password changed successfully');
        closeModal();
      } else {
        alert('❌ ' + (data.error || 'Failed to change password'));
      }
    });
  }

  function getAdminCode() {
    const url = new URL(window.location);
    return url.searchParams.get('code') || localStorage.getItem('adminCode');
  }

  function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('profileModal').classList.remove('show');
    document.getElementById('settingsModal').classList.remove('show');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminCode');
    window.location.href = '/register/';
  }

  // Close dropdown when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      closeUserMenu();
    }
  });
</script>
    </>
  );
};

export default Header;
