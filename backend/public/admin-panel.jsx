import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
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

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
      padding: 20px;
    }

    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .navbar h1 {
      font-size: 1.8rem;
    }

    .navbar-actions {
      display: flex;
      gap: 10px;
    }

    .navbar button {
      background: rgba(255,255,255,0.2);
      border: 1px solid white;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      transition: 0.3s;
    }

    .navbar button:hover {
      background: rgba(255,255,255,0.3);
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: white;
      border: 2px solid #ddd;
      padding: 12px 20px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .search-box {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .search-box input,
    .search-box select {
      flex: 1;
      min-width: 200px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }

    .search-box button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 5px;
      cursor: pointer;
      transition: 0.3s;
      white-space: nowrap;
    }

    .search-box button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    table {
      width: 100%;
      background: white;
      border-collapse: collapse;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    table th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
    }

    table td {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }

    table tr:hover {
      background: #f8f9fa;
    }

    .action-btn {
      padding: 6px 10px;
      margin: 2px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: 0.3s;
      display: inline-block;
      white-space: nowrap;
    }

    .action-btn.view {
      background: #3498db;
      color: white;
    }

    .action-btn.approve {
      background: #27ae60;
      color: white;
    }

    .action-btn.reject {
      background: #e74c3c;
      color: white;
    }

    .action-btn.ban {
      background: #e67e22;
      color: white;
    }

    .action-btn.unban {
      background: #27ae60;
      color: white;
    }

    .action-btn.admin {
      background: #9b59b6;
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .status {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-block;
    }

    .status.active {
      background: #d4edda;
      color: #155724;
    }

    .status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status.banned {
      background: #f8d7da;
      color: #721c24;
    }

    .status.approved {
      background: #d4edda;
      color: #155724;
    }

    .status.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
    }

    .modal.active {
      display: flex;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 700px;
      width: 90%;
      margin: auto;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #eee;
    }

    .modal-header h2 {
      color: #333;
      margin: 0;
    }

    .modal-header .close {
      font-size: 1.5rem;
      cursor: pointer;
      color: #999;
      transition: 0.3s;
    }

    .modal-header .close:hover {
      color: #333;
    }

    .info-row {
      display: flex;
      margin: 12px 0;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }

    .info-label {
      font-weight: 600;
      color: #666;
      min-width: 150px;
    }

    .info-value {
      color: #333;
      flex: 1;
      word-break: break-all;
    }

    .info-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #eee;
    }

    .info-section h3 {
      color: #667eea;
      margin-bottom: 15px;
    }

    .form-group {
      margin: 15px 0;
    }

    .form-group label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: inherit;
      font-size: 1rem;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .button-group button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: 0.3s;
    }

    .button-group .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .button-group .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .button-group .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .button-group button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .alert {
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 5px;
      display: none;
    }

    .alert.active {
      display: block;
    }

    .alert.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin: 10px 0;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 15px;
        padding: 15px 20px;
      }

      .tabs {
        flex-direction: column;
      }

      .search-box {
        flex-direction: column;
      }

      table {
        font-size: 0.9rem;
      }

      table th, table td {
        padding: 10px;
      }

      .action-btn {
        padding: 4px 8px;
        font-size: 0.75rem;
      }
    }
  
  `;

const handleShowSettings = () => {
  setShowSettings(true);
};

const handleLogout = () => {
  if (confirm('Logout?')) {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
};

return (
  <>
    <style dangerouslySetInnerHTML={{ __html: styles }} />
    {/* Navbar */}
    <div className="navbar">
      <h1>🔐 Admin Dashboard</h1>
      <div className="navbar-actions">
        <button onClick={handleShowSettings}>⚙️ Settings</button>
        <button onClick={handleLogout} style={{background: '#e74c3c'}}>🚪 Logout</button>
      </div>
    </div>

<div className="container">
  {/* Alert */}
  <div id="alert" className="alert"></div>

  {/* Tabs */}
  <div className="tabs">
    <button className="tab-btn active" onclick="switchTab('dashboard')">📊 Dashboard</button>
    <button className="tab-btn" onclick="switchTab('users')">👥 Users</button>
    <button className="tab-btn" onclick="switchTab('deposits')">💰 Deposits</button>
    <button className="tab-btn" onclick="switchTab('withdrawals')">💳 Withdrawals</button>
    <button className="tab-btn" onclick="switchTab('campaigns')">📢 Campaigns</button>
  </div>

  {/* Dashboard Tab */}
  <div id="dashboard" className="tab-content active">
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Total Users</div>
        <div className="stat-value" id="statTotalUsers">-</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Admins</div>
        <div className="stat-value" id="statTotalAdmins">-</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Banned Users</div>
        <div className="stat-value" id="statBannedUsers">-</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Pending Deposits</div>
        <div className="stat-value" id="statPendingDeposits">-</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Pending Withdrawals</div>
        <div className="stat-value" id="statPendingWithdrawals">-</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active Campaigns</div>
        <div className="stat-value" id="statActiveCampaigns">-</div>
      </div>
    </div>
  </div>

  {/* Users Tab */}
  <div id="users" className="tab-content">
    <div className="search-box">
      <input type="text" id="userSearch" placeholder="Search by email, username, phone..." />
      <button onclick="searchUsers()">🔍 Search</button>
      <button onclick="loadAllUsers()" style="background: #6c757d;">📋 All Users</button>
    </div>
    <div id="usersTable"></div>
  </div>

  {/* Deposits Tab */}
  <div id="deposits" className="tab-content">
    <div className="search-box">
      <select id="depositFilter">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <button onclick="loadDeposits()">🔄 Load</button>
    </div>
    <div id="depositsTable"></div>
  </div>

  {/* Withdrawals Tab */}
  <div id="withdrawals" className="tab-content">
    <div className="search-box">
      <select id="withdrawalFilter">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <button onclick="loadWithdrawals()">🔄 Load</button>
    </div>
    <div id="withdrawalsTable"></div>
  </div>

  {/* Campaigns Tab */}
  <div id="campaigns" className="tab-content">
    <div className="search-box">
      <select id="campaignFilter">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      <button onclick="loadCampaigns()">🔄 Load</button>
    </div>
    <div id="campaignsTable"></div>
  </div>
</div>

{/* User Details Modal */}
<div id="userModal" className="modal">
  <div className="modal-content">
    <div className="modal-header">
      <h2>👤 User Details</h2>
      <span className="close" onclick="closeModal('userModal')">✕</span>
    </div>
    <div id="userModalContent"></div>
  </div>
</div>

{/* Withdrawal Approval Modal */}
<div id="withdrawalModal" className="modal">
  <div className="modal-content">
    <div className="modal-header">
      <h2>💳 Withdrawal Request</h2>
      <span className="close" onclick="closeModal('withdrawalModal')">✕</span>
    </div>
    <div id="withdrawalModalContent"></div>
  </div>
</div>

{/* Settings Modal */}
<div id="settingsModal" className="modal">
  <div className="modal-content">
    <div className="modal-header">
      <h2>⚙️ Admin Settings</h2>
      <span className="close" onclick="closeModal('settingsModal')">✕</span>
    </div>
    <div className="form-group">
      <label>Change Password</label>
      <input type="password" id="currentPassword" placeholder="Current Password" />
      <input type="password" id="newPassword" placeholder="New Password" style={{marginTop: '10px'}} />
      <input type="password" id="confirmPassword" placeholder="Confirm Password" style={{marginTop: '10px'}} />
            <button onclick="changePassword()" style={{width: '100%', marginTop: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer'}}>Change Password</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;

{/* Script should run after component mounts */}
{typeof window !== 'undefined' && (
  <script>
  const API_URL = '/api';
  let token = localStorage.getItem('token');

  if (!token) {
    alert('Please login first');
    window.location.href = '/';
  }

  async function fetchAdmin(endpoint, options = {}) {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }
        const error = await response.json();
        throw new Error(error.error || 'API error');
      }

      return await response.json();
    } catch (error) {
      showAlert(error.message, 'error');
      throw error;
    }
  }

  function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert active ${type}`;
    setTimeout(() => {
      alert.classList.remove('active');
    }, 5000);
  }

  function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'users') loadAllUsers();
    else if (tabName === 'deposits') loadDeposits();
    else if (tabName === 'withdrawals') loadWithdrawals();
    else if (tabName === 'campaigns') loadCampaigns();
  }

  async function loadDashboard() {
    try {
      const data = await fetchAdmin('/admin-panel/dashboard');
      document.getElementById('statTotalUsers').textContent = data.stats?.totalUsers || 0;
      document.getElementById('statTotalAdmins').textContent = data.stats?.totalAdmins || 0;
      document.getElementById('statBannedUsers').textContent = data.stats?.bannedUsers || 0;
      document.getElementById('statPendingDeposits').textContent = data.stats?.pendingDeposits || 0;
      document.getElementById('statPendingWithdrawals').textContent = data.stats?.pendingWithdrawals || 0;
      document.getElementById('statActiveCampaigns').textContent = data.stats?.activeCampaigns || 0;
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  async function loadAllUsers() {
    try {
      const data = await fetchAdmin('/admin-panel/users');
      renderUsersTable(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async function searchUsers() {
    const query = document.getElementById('userSearch').value.trim();
    if (!query) {
      showAlert('Enter search query', 'error');
      return;
    }

    try {
      const data = await fetchAdmin(`/admin-panel/users?q=${encodeURIComponent(query)}`);
      renderUsersTable(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }

  function renderUsersTable(users) {
    if (!users || users.length === 0) {
      document.getElementById('usersTable').innerHTML = '<p style="text-align: center; padding: 20px;">No users found</p>';
      return;
    }

    let html = `<table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Username</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    users.forEach(user => {
      const status = user.isBanned ? 'banned' : 'active';
      const statusText = user.isBanned ? 'Banned' : 'Active';
      
      html += `<tr>
        <td>${user.email}</td>
        <td>${user.username || '-'}</td>
        <td>${user.phone || '-'}</td>
        <td>${user.role || 'user'}</td>
        <td><span className="status ${status}">${statusText}</span></td>
        <td>
          <button className="action-btn view" onclick="viewUserDetails(${user.id})">View</button>
          ${!user.isAdmin ? `<button className="action-btn admin" onclick="makeAdmin(${user.id})">Admin</button>` : ''}
          ${!user.isBanned ? `<button className="action-btn ban" onclick="banUser(${user.id})">Ban</button>` : `<button className="action-btn unban" onclick="unbanUser(${user.id})">Unban</button>`}
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('usersTable').innerHTML = html;
  }

  async function viewUserDetails(userId) {
    try {
      const data = await fetchAdmin(`/admin-panel/users/${userId}`);
      const user = data.user;

      let html = `
        <div className="info-row">
          <div className="info-label">Email</div>
          <div className="info-value">${user.email}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Username</div>
          <div className="info-value">${user.username || '-'}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Full Name</div>
          <div className="info-value">${user.fullName || '-'}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Phone</div>
          <div className="info-value">${user.phone || '-'}</div>
        </div>
        <div className="info-row">
          <div className="info-label">IP Address</div>
          <div className="info-value">${user.ipAddress || '-'}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Role</div>
          <div className="info-value"><span className="status active">${user.role}</span></div>
        </div>
        <div className="info-row">
          <div className="info-label">Status</div>
          <div className="info-value"><span className="status ${user.isBanned ? 'banned' : 'active'}">${user.isBanned ? 'Banned' : 'Active'}</span></div>
        </div>
        <div className="info-row">
          <div className="info-label">Email Verified</div>
          <div className="info-value">${user.emailVerified ? '✓ Yes' : '✗ No'}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Wallet Balance</div>
          <div className="info-value">$${(user.wallet?.balance / 100 || 0).toFixed(2)}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Trust Score</div>
          <div className="info-value">${user.trustScore?.toFixed(2) || '100'}%</div>
        </div>

        <div className="info-section">
          <h3>💳 Bank Details</h3>
          <div className="info-row">
            <div className="info-label">Account Holder</div>
            <div className="info-value">${user.accountHolderName || '-'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Account Type</div>
            <div className="info-value">${user.accountType || '-'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Account Number</div>
            <div className="info-value">${user.accountNumber || '-'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Bank Name</div>
            <div className="info-value">${user.bankName || '-'}</div>
          </div>
        </div>

        <div className="info-section">
          <h3>📊 Statistics</h3>
          <div className="info-row">
            <div className="info-label">Total Earnings</div>
            <div className="info-value">$${(user.totalEarnings / 100 || 0).toFixed(2)}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Total Withdrawals</div>
            <div className="info-value">$${(user.totalWithdrawn / 100 || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="button-group">
          <button className="btn-secondary" onclick="closeModal('userModal')">Close</button>
          ${!user.isBanned ? `<button className="btn-danger" onclick="banUserWithReason(${user.id})">Ban User</button>` : `<button className="btn-primary" onclick="unbanUser(${user.id})">Unban User</button>`}
        </div>
      `;

      document.getElementById('userModalContent').innerHTML = html;
      document.getElementById('userModal').classList.add('active');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function makeAdmin(userId) {
    if (confirm('Make this user an admin?')) {
      try {
        await fetchAdmin(`/admin-panel/users/${userId}/make-admin`, { method: 'POST' });
        showAlert('User is now an admin');
        loadAllUsers();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  async function banUserWithReason(userId) {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
      await fetchAdmin(`/admin-panel/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      showAlert('User has been banned');
      closeModal('userModal');
      loadAllUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function banUser(userId) {
    banUserWithReason(userId);
  }

  async function unbanUser(userId) {
    if (confirm('Unban this user?')) {
      try {
        await fetchAdmin(`/admin-panel/users/${userId}/unban`, { method: 'POST' });
        showAlert('User has been unbanned');
        loadAllUsers();
        closeModal('userModal');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  async function loadDeposits() {
    try {
      const filter = document.getElementById('depositFilter').value;
      const endpoint = filter ? `/admin-panel/deposits?status=${filter}` : '/admin-panel/deposits';
      const data = await fetchAdmin(endpoint);
      renderDepositsTable(data.deposits || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function renderDepositsTable(deposits) {
    if (!deposits || deposits.length === 0) {
      document.getElementById('depositsTable').innerHTML = '<p style="text-align: center; padding: 20px;">No deposits found</p>';
      return;
    }

    let html = `<table>
      <thead>
        <tr>
          <th>User</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    deposits.forEach(deposit => {
      html += `<tr>
        <td>${deposit.user?.email}</td>
        <td>$${(deposit.amount / 100).toFixed(2)}</td>
        <td><span className="status ${deposit.status}">${deposit.status}</span></td>
        <td>${new Date(deposit.createdAt).toLocaleDateString()}</td>
        <td>
          ${deposit.status === 'pending' ? `
            <button className="action-btn approve" onclick="approveDeposit(${deposit.id})">Approve</button>
            <button className="action-btn reject" onclick="rejectDeposit(${deposit.id})">Reject</button>
          ` : ''}
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('depositsTable').innerHTML = html;
  }

  async function approveDeposit(depositId) {
    try {
      await fetchAdmin(`/admin-panel/deposits/${depositId}/approve`, { method: 'POST' });
      showAlert('Deposit approved');
      loadDeposits();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function rejectDeposit(depositId) {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      await fetchAdmin(`/admin-panel/deposits/${depositId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      showAlert('Deposit rejected');
      loadDeposits();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function loadWithdrawals() {
    try {
      const filter = document.getElementById('withdrawalFilter').value;
      const endpoint = filter ? `/admin-panel/withdrawals?status=${filter}` : '/admin-panel/withdrawals';
      const data = await fetchAdmin(endpoint);
      renderWithdrawalsTable(data.withdrawals || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function renderWithdrawalsTable(withdrawals) {
    if (!withdrawals || withdrawals.length === 0) {
      document.getElementById('withdrawalsTable').innerHTML = '<p style="text-align: center; padding: 20px;">No withdrawals found</p>';
      return;
    }

    let html = `<table>
      <thead>
        <tr>
          <th>User</th>
          <th>Amount</th>
          <th>Fee (20%)</th>
          <th>Net Amount</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    withdrawals.forEach(withdrawal => {
      const fee = withdrawal.amount * 0.2;
      const netAmount = withdrawal.amount - fee;

      html += `<tr>
        <td>${withdrawal.user?.email}</td>
        <td>$${(withdrawal.amount / 100).toFixed(2)}</td>
        <td>$${(fee / 100).toFixed(2)}</td>
        <td>$${(netAmount / 100).toFixed(2)}</td>
        <td><span className="status ${withdrawal.status}">${withdrawal.status}</span></td>
        <td>
          ${withdrawal.status === 'pending' ? `
            <button className="action-btn view" onclick="viewWithdrawalDetails(${withdrawal.id})">Review</button>
          ` : ''}
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('withdrawalsTable').innerHTML = html;
  }

  async function viewWithdrawalDetails(withdrawalId) {
    try {
      const data = await fetchAdmin(`/admin-panel/withdrawals/${withdrawalId}`);
      const w = data.withdrawal;
      const fee = w.amount * 0.2;
      const netAmount = w.amount - fee;

      let html = `
        <div className="info-row">
          <div className="info-label">User Email</div>
          <div className="info-value">${w.user?.email}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Username</div>
          <div className="info-value">${w.user?.username || '-'}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Phone</div>
          <div className="info-value">${w.user?.phone || '-'}</div>
        </div>

        <div className="info-section">
          <h3>💳 Bank Details</h3>
          <div className="info-row">
            <div className="info-label">Account Holder</div>
            <div className="info-value">${w.user?.accountHolderName || '-'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Account Type</div>
            <div className="info-value">${w.user?.accountType || '-'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Account Number</div>
            <div className="info-value">${w.user?.accountNumber || '-'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Bank Name</div>
            <div className="info-value">${w.user?.bankName || '-'}</div>
          </div>
        </div>

        <div className="info-section">
          <h3>💰 Amount Details</h3>
          <div className="info-row">
            <div className="info-label">Requested Amount</div>
            <div className="info-value">$${(w.amount / 100).toFixed(2)}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Admin Fee (20%)</div>
            <div className="info-value" style="color: #e74c3c;">-$${(fee / 100).toFixed(2)}</div>
          </div>
          <div className="info-row">
            <div className="info-label" style="font-weight: bold;">Net to Transfer</div>
            <div className="info-value" style="font-weight: bold; color: #27ae60;">$${(netAmount / 100).toFixed(2)}</div>
          </div>
        </div>

        <div className="button-group">
          <button className="btn-secondary" onclick="closeModal('withdrawalModal')">Close</button>
          <button className="btn-danger" onclick="rejectWithdrawal(${withdrawalId})">Reject</button>
          <button className="btn-primary" onclick="approveWithdrawalForm(${withdrawalId})">Approve</button>
        </div>
      `;

      document.getElementById('withdrawalModalContent').innerHTML = html;
      document.getElementById('withdrawalModal').classList.add('active');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function approveWithdrawalForm(withdrawalId) {
    const txnId = prompt('Enter Transaction ID (e.g., bank confirmation):');
    if (!txnId) return;

    try {
      await fetchAdmin(`/admin-panel/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ transactionId: txnId })
      });
      showAlert('Withdrawal approved! Money transferred.');
      closeModal('withdrawalModal');
      loadWithdrawals();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function rejectWithdrawal(withdrawalId) {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      await fetchAdmin(`/admin-panel/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      showAlert('Withdrawal rejected');
      closeModal('withdrawalModal');
      loadWithdrawals();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function loadCampaigns() {
    try {
      const filter = document.getElementById('campaignFilter').value;
      const endpoint = filter ? `/admin-panel/campaigns?status=${filter}` : '/admin-panel/campaigns';
      const data = await fetchAdmin(endpoint);
      renderCampaignsTable(data.campaigns || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function renderCampaignsTable(campaigns) {
    if (!campaigns || campaigns.length === 0) {
      document.getElementById('campaignsTable').innerHTML = '<p style="text-align: center; padding: 20px;">No campaigns found</p>';
      return;
    }

    let html = `<table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Target</th>
          <th>Price/Task</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    campaigns.forEach(campaign => {
      html += `<tr>
        <td>${campaign.title}</td>
        <td>${campaign.type}</td>
        <td>${campaign.targetCount}</td>
        <td>$${(campaign.pricePerTask / 100).toFixed(2)}</td>
        <td><span className="status ${campaign.status}">${campaign.status}</span></td>
        <td>
          ${campaign.status === 'pending' ? `
            <button className="action-btn approve" onclick="approveCampaign(${campaign.id})">Approve</button>
            <button className="action-btn reject" onclick="rejectCampaign(${campaign.id})">Reject</button>
          ` : ''}
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('campaignsTable').innerHTML = html;
  }

  async function approveCampaign(campaignId) {
    try {
      await fetchAdmin(`/admin-panel/campaigns/${campaignId}/approve`, { method: 'POST' });
      showAlert('Campaign approved');
      loadCampaigns();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function rejectCampaign(campaignId) {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      await fetchAdmin(`/admin-panel/campaigns/${campaignId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      showAlert('Campaign rejected');
      loadCampaigns();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  function showSettings() {
    document.getElementById('settingsModal').classList.add('active');
  }

  async function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!current || !newPass || !confirm) {
      showAlert('Fill all fields', 'error');
      return;
    }

    if (newPass !== confirm) {
      showAlert('Passwords do not match', 'error');
      return;
    }

    if (newPass.length < 6) {
      showAlert('Password must be 6+ chars', 'error');
      return;
    }

    try {
      await fetchAdmin('/admin-panel/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: current, newPassword: newPass })
      });
      showAlert('Password changed');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      closeModal('settingsModal');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function logout() {
    if (confirm('Logout?')) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }

export default AdminPanel;
