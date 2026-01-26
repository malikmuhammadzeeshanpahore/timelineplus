// Admin Panel Handler
(function() {
  const API_URL = '/api';

  // Debug: Log all localStorage contents on admin panel load
  console.log('=== ADMIN PANEL LOADED ===');
  console.log('window.location.pathname:', window.location.pathname);
  console.log('window.location.href:', window.location.href);
  
  // VERY DETAILED DEBUG
  console.log('=== LOCALSTORAGE STATE ===');
  try {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('token from localStorage:', token ? `${token.substring(0, 50)}... (length: ${token.length})` : 'NULL/UNDEFINED');
    console.log('role from localStorage:', role);
    console.log('adminSecret from localStorage:', localStorage.getItem('adminSecret'));
    console.log('Total keys in localStorage:', Object.keys(localStorage).length);
    console.log('All keys:', Object.keys(localStorage));
    Object.keys(localStorage).forEach(key => {
      const val = localStorage.getItem(key);
      console.log(`  [${key}]: ${val ? val.substring(0, 50) + (val.length > 50 ? '...' : '') : '(empty)'}`);
    });
  } catch(e) {
    console.error('Error reading localStorage:', e.message);
  }

  // Accept `code` query parameter to verify admin access via URL
  // Note: User should be logged in first to have a valid token
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam && codeParam === 'ADMIN_SECRET_2026') {
      // Store secret for verification, but NOT as bearer token
      localStorage.setItem('adminSecret', codeParam);
      console.log('Secret code set from URL parameter');
    }
  } catch (e) {
    // ignore URL parsing errors in non-browser contexts
  }

  // read auth values
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const adminSecret = localStorage.getItem('adminSecret');

  console.log('Admin Panel Auth Check:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 30)}...` : 'NONE',
    role: role,
    roleValid: role && role.startsWith('admin/'),
    adminSecret: adminSecret ? 'SET' : 'NOT_SET'
  });

  // Check if token looks like a secret code instead of JWT (migration fix)
  if (token === 'ADMIN_SECRET_2026' || token === 'ADMIN_SECRET' || (token && token.length < 20)) {
    console.warn('Invalid token detected (looks like secret code or too short)');
    console.warn('Token length:', token ? token.length : 0);
    console.warn('NOT clearing localStorage - token might still be valid');
    // Don't clear localStorage here
    // Let user try to access with current token
  }

  // Note: Role verification is handled by role-enforcer-v2.js which checks the database role
  // and redirects unauthorized users to login before this script runs.
  // If we reach here, the user has already been verified as admin by role-enforcer.
  
  if (!token) {
    console.error('ERROR: No token found - role-enforcer should have blocked this');
    window.location.href = '/';
    return;
  }
  
  console.log('✓ Role verification already done by role-enforcer-v2.js');

  // API Helper
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
        console.warn(`Admin API error on ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          token: token ? `${token.substring(0, 20)}...` : 'NO_TOKEN',
          role: role,
          adminSecret: adminSecret ? 'SET' : 'NOT_SET'
        });
        const error = await response.json().catch(() => ({ error: 'API error' }));
        const errorMsg = error.error || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      showAlert(error.message, 'error');
      throw error;
    }
  }

  // Alert Helper
  function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `${type}`;
    alert.classList.add('active');
    setTimeout(() => {
      alert.classList.remove('active');
    }, 5000);
  }

  // Tab Switching
  function setupTabSwitching() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        switchTab(tabName);
      });
    });
  }

  function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'users') loadAllUsers();
    else if (tabName === 'deposits') loadDeposits();
    else if (tabName === 'withdrawals') loadWithdrawals();
    else if (tabName === 'campaigns') loadCampaigns();
    else if (tabName === 'invites') loadInvites();
    else if (tabName === 'teams') loadTeams();
  }

  // Invites
  async function loadInvites() {
    try {
      const data = await fetchAdmin('/admin-panel/invites');
      const invites = data.invites || [];
      let html = '<div class="search-box"><input id="inviteEmail" placeholder="Email to invite" /><button id="sendInviteBtn" class="btn-primary">Send Invite</button></div>';
      if (invites.length === 0) html += '<p style="padding:12px;color:#666">No pending invites</p>';
      else {
        html += '<table><thead><tr><th>Email</th><th>Status</th><th>Sent At</th></tr></thead><tbody>';
        invites.forEach(inv => {
          html += `<tr><td>${inv.email}</td><td>${inv.status}</td><td>${new Date(inv.createdAt).toLocaleString()}</td></tr>`;
        });
        html += '</tbody></table>';
      }
      document.getElementById('invitesTable').innerHTML = html;
      document.getElementById('sendInviteBtn')?.addEventListener('click', sendInvite);
    } catch (e) { console.error(e); }
  }

  async function sendInvite() {
    const email = document.getElementById('inviteEmail').value.trim();
    if (!email) return showAlert('Enter email', 'error');
    try {
      await fetchAdmin('/admin-panel/invites', { method: 'POST', body: JSON.stringify({ email }) });
      showAlert('Invite sent');
      loadInvites();
    } catch (e) { console.error(e); }
  }

  // Teams
  async function loadTeams() {
    try {
      const data = await fetchAdmin('/admin-panel/teams');
      const teams = data.teams || [];
      let html = '<div class="search-box"><input id="teamName" placeholder="New team name" /><button id="createTeamBtn" class="btn-primary">Create Team</button></div>';
      if (teams.length === 0) html += '<p style="padding:12px;color:#666">No teams created</p>';
      else {
        html += '<table><thead><tr><th>Team</th><th>Members</th><th>Actions</th></tr></thead><tbody>';
        teams.forEach(team => {
          html += `<tr><td>${team.name}</td><td>${(team.members || []).length}</td><td><button class="action-btn" data-action="view-team" data-id="${team.id}">View</button></td></tr>`;
        });
        html += '</tbody></table>';
      }
      document.getElementById('teamsTable').innerHTML = html;
      document.getElementById('createTeamBtn')?.addEventListener('click', createTeam);
    } catch (e) { console.error(e); }
  }

  async function createTeam() {
    const name = document.getElementById('teamName').value.trim();
    if (!name) return showAlert('Enter team name', 'error');
    try {
      await fetchAdmin('/admin-panel/teams', { method: 'POST', body: JSON.stringify({ name }) });
      showAlert('Team created');
      loadTeams();
    } catch (e) { console.error(e); }
  }

  // Dashboard
  async function loadDashboard() {
    try {
      const data = await fetchAdmin('/admin-panel/dashboard');
      document.getElementById('statTotalUsers').textContent = data.stats?.totalUsers || 0;
      document.getElementById('statTotalAdmins').textContent = data.stats?.totalAdmins || 0;
      document.getElementById('statBannedUsers').textContent = data.stats?.bannedUsers || 0;
      document.getElementById('statPendingDeposits').textContent = data.stats?.pendingDeposits || 0;
      document.getElementById('statPendingWithdrawals').textContent = data.stats?.pendingWithdrawals || 0;
      document.getElementById('statActiveCampaigns').textContent = data.stats?.activeCampaigns || 0;

      // Load analytics data
      try {
        const analytics = await fetchAdmin('/admin-panel/analytics');
        displayAnalytics(analytics);
      } catch (e) {
        console.warn('Analytics loading failed:', e);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  function displayAnalytics(analytics) {
    // Create analytics section if it doesn't exist
    const dashboardContent = document.getElementById('dashboard');
    let analyticsSection = document.getElementById('analyticsSection');
    
    if (!analyticsSection) {
      analyticsSection = document.createElement('div');
      analyticsSection.id = 'analyticsSection';
      analyticsSection.style.marginTop = '30px';
      dashboardContent?.appendChild(analyticsSection);
    }

    const d = analytics.daily;
    const t = analytics.total;

    analyticsSection.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <h3 style="color: #667eea; margin-bottom: 20px;">📊 Daily Analytics (Today)</h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">
            <div style="font-size: 14px; opacity: 0.9;">Daily Deposits</div>
            <div style="font-size: 28px; font-weight: bold;">PKR ${(d.deposits).toLocaleString('en-PK')}</div>
            <div style="font-size: 12px; opacity: 0.8;">${d.depositCount} deposits</div>
          </div>
          
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(245,87,108,0.3);">
            <div style="font-size: 14px; opacity: 0.9;">Daily Withdrawals</div>
            <div style="font-size: 28px; font-weight: bold;">PKR ${(d.withdrawals).toLocaleString('en-PK')}</div>
          </div>
          
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79,172,254,0.3);">
            <div style="font-size: 14px; opacity: 0.9;">Daily Profit</div>
            <div style="font-size: 28px; font-weight: bold;">PKR ${(d.profit).toLocaleString('en-PK')}</div>
          </div>
          
          <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(67,233,123,0.3);">
            <div style="font-size: 14px; opacity: 0.9;">Daily Tasks</div>
            <div style="font-size: 28px; font-weight: bold;">${d.tasks}</div>
          </div>
        </div>

        <h3 style="color: #667eea; margin-bottom: 20px;">📈 Total Statistics</h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 30px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
            <div style="color: #666; font-size: 14px; margin-bottom: 8px;">Total Deposits</div>
            <div style="font-size: 24px; font-weight: bold; color: #667eea;">PKR ${(t.deposits).toLocaleString('en-PK')}</div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #43e97b;">
            <div style="color: #666; font-size: 14px; margin-bottom: 8px;">User Earnings</div>
            <div style="font-size: 24px; font-weight: bold; color: #43e97b;">PKR ${(t.userEarnings).toLocaleString('en-PK')}</div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #f5576c;">
            <div style="color: #666; font-size: 14px; margin-bottom: 8px;">Admin Profit</div>
            <div style="font-size: 24px; font-weight: bold; color: #f5576c;">PKR ${(t.adminProfit).toLocaleString('en-PK')}</div>
          </div>
        </div>

        <h3 style="color: #667eea; margin-bottom: 20px;">📊 Tasks Summary</h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 30px;">
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #2196f3;">${t.tasks.total}</div>
            <div style="font-size: 12px; color: #666;">Total Tasks</div>
          </div>
          
          <div style="background: #c8e6c9; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${t.tasks.completed}</div>
            <div style="font-size: 12px; color: #666;">Completed</div>
          </div>
          
          <div style="background: #fff9c4; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #fbc02d;">${t.tasks.pending}</div>
            <div style="font-size: 12px; color: #666;">Pending</div>
          </div>
        </div>

        <h3 style="color: #667eea; margin-bottom: 20px;">📅 Last 7 Days Deposits</h3>
        <div id="depositsGraph" style="background: #f8f9fa; padding: 20px; border-radius: 10px; height: 250px; display: flex; align-items: flex-end; gap: 10px; justify-content: space-around;">
          ${generateDepositsGraph(analytics.graphs.last7Days)}
        </div>
      </div>
    `;
  }

  function generateDepositsGraph(last7Days) {
    if (!last7Days || last7Days.length === 0) return '<p>No data available</p>';
    
    const maxDeposits = Math.max(...last7Days.map(d => d.deposits), 1);
    
    return last7Days.map(day => {
      const height = Math.max(30, (day.deposits / maxDeposits) * 200);
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('en-PK', { weekday: 'short' });
      
      return `
        <div style="display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 40px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 8px; min-height: 30px; display: flex; align-items: flex-end; justify-content: center;">
            PKR ${(day.deposits).toLocaleString('en-PK', {maximumFractionDigits: 0})}
          </div>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 100%; height: ${height}px; border-radius: 6px 6px 0 0; box-shadow: 0 4px 12px rgba(102,126,234,0.2); min-height: 20px;"></div>
          <div style="font-size: 11px; color: #666; margin-top: 8px;">${dayName}</div>
        </div>
      `;
    }).join('');
  }

  // Users
  async function loadAllUsers() {
    try {
      const data = await fetchAdmin('/admin-panel/users');
      renderUsersTable(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  function setupUserHandlers() {
    document.getElementById('userSearch')?.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') searchUsers();
    });
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
      document.getElementById('usersTable').innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No users found</p>';
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
        <td>${user.username || '—'}</td>
        <td>${user.phone || '—'}</td>
        <td>${user.role || 'user'}</td>
        <td><span class="status ${status}">${statusText}</span></td>
        <td>
          <button class="action-btn view" data-action="view-user" data-id="${user.id}"><i class="ri-eye-line"></i>View</button>
          ${!user.isAdmin ? `<button class="action-btn admin" data-action="make-admin" data-id="${user.id}"><i class="ri-shield-line"></i>Admin</button>` : ''}
          ${!user.isBanned ? `<button class="action-btn ban" data-action="ban-user" data-id="${user.id}"><i class="ri-forbid-line"></i>Ban</button>` : `<button class="action-btn unban" data-action="unban-user" data-id="${user.id}"><i class="ri-checkbox-circle-line"></i>Unban</button>`}
          <button class="action-btn delete" data-action="delete-user" data-id="${user.id}" data-email="${user.email}"><i class="ri-delete-bin-line"></i>Delete</button>
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('usersTable').innerHTML = html;

    // Attach event listeners to action buttons
    document.querySelectorAll('[data-action="view-user"]').forEach(btn => {
      btn.addEventListener('click', () => viewUserDetails(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="make-admin"]').forEach(btn => {
      btn.addEventListener('click', () => makeAdmin(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="ban-user"]').forEach(btn => {
      btn.addEventListener('click', () => banUser(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="unban-user"]').forEach(btn => {
      btn.addEventListener('click', () => unbanUser(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="delete-user"]').forEach(btn => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.id, btn.dataset.email));
    });
    document.querySelectorAll('[data-action="invite-user"]').forEach(btn => {
      btn.addEventListener('click', () => sendInviteToEmail(btn.dataset.email));
    });
  }

  async function sendInviteToEmail(email) {
    if (!email) return showAlert('No email to invite', 'error');
    try {
      const res = await fetchAdmin('/admin-panel/invites', { method: 'POST', body: JSON.stringify({ email }) });
      if (res && res.invite) {
        showAlert('Invite created');
        loadInvites();
      }
    } catch (e) { console.error(e); }
  }

  async function viewUserDetails(userId) {
    try {
      const data = await fetchAdmin(`/admin-panel/users/${userId}`);
      const user = data.user;

      let html = `
        <div class="info-row"><div class="info-label">Email</div><div class="info-value">${user.email}</div></div>
        <div class="info-row"><div class="info-label">Username</div><div class="info-value">${user.username || '—'}</div></div>
        <div class="info-row"><div class="info-label">Full Name</div><div class="info-value">${user.name || user.fullName || '—'}</div></div>
        <div class="info-row"><div class="info-label">Phone</div><div class="info-value">${user.phone || '—'}</div></div>
        <div class="info-row"><div class="info-label">IP Address</div><div class="info-value">${user.ipAddress || '—'}</div></div>
        <div class="info-row"><div class="info-label">Role</div><div class="info-value"><span class="status active">${user.role}</span></div></div>
        <div class="info-row"><div class="info-label">Status</div><div class="info-value"><span class="status ${user.isBanned ? 'banned' : 'active'}">${user.isBanned ? 'Banned' : 'Active'}</span></div></div>
        <div class="info-row"><div class="info-label">Email Verified</div><div class="info-value">${user.emailVerified ? '<i class="ri-checkbox-circle-line"></i> Yes' : '<i class="ri-close-circle-line"></i> No'}</div></div>
            <div class="info-row"><div class="info-label">Wallet Balance</div><div class="info-value">PKR ${(user.wallet?.balance / 100 || 0).toFixed(2)}</div></div>
        <div class="info-row"><div class="info-label">Trust Score</div><div class="info-value">${(user.trustScore || 100).toFixed(2)}%</div></div>

        <div class="info-section">
          <h3><i class="ri-bank-card-line"></i>Bank Details</h3>
          <div class="info-row"><div class="info-label">Account Holder</div><div class="info-value">${user.accountHolderName || '—'}</div></div>
          <div class="info-row"><div class="info-label">Account Type</div><div class="info-value">${user.accountType || '—'}</div></div>
          <div class="info-row"><div class="info-label">Account Number</div><div class="info-value">${user.accountNumber || '—'}</div></div>
        </div>

        <div class="info-section">
          <h3><i class="ri-bar-chart-line"></i>Statistics</h3>
          <div class="info-row"><div class="info-label">Total Earnings</div><div class="info-value">PKR ${(user.totalEarnings / 100 || 0).toFixed(2)}</div></div>
          <div class="info-row"><div class="info-label">Total Withdrawals</div><div class="info-value">PKR ${(user.totalWithdrawn / 100 || 0).toFixed(2)}</div></div>
        </div>

        <div class="button-group">
          <button class="btn-secondary" data-action="close-modal" data-modal="userModal"><i class="ri-close-line"></i>Close</button>
          ${!user.isBanned ? `<button class="btn-danger" data-action="ban-user-reason" data-id="${user.id}"><i class="ri-forbid-line"></i>Ban User</button>` : `<button class="btn-primary" data-action="unban-user-confirm" data-id="${user.id}"><i class="ri-checkbox-circle-line"></i>Unban</button>`}
        </div>
      `;

      document.getElementById('userModalContent').innerHTML = html;
      document.getElementById('userModal').classList.add('active');

      // Attach event listeners
      document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.modal));
      });
      document.querySelector('[data-action="ban-user-reason"]')?.addEventListener('click', function() {
        banUserWithReason(this.dataset.id);
      });
      document.querySelector('[data-action="unban-user-confirm"]')?.addEventListener('click', function() {
        unbanUserConfirm(this.dataset.id);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function makeAdmin(userId) {
    if (confirm('Make this user an admin?')) {
      try {
        await fetchAdmin(`/admin-panel/users/${userId}/make-admin`, { method: 'POST' });
        showAlert('✓ User is now an admin');
        loadAllUsers();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  async function banUser(userId) {
    banUserWithReason(userId);
  }

  async function banUserWithReason(userId) {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
      await fetchAdmin(`/admin-panel/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      showAlert('✓ User has been banned');
      closeModal('userModal');
      loadAllUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function unbanUser(userId) {
    if (confirm('Unban this user?')) {
      try {
        await fetchAdmin(`/admin-panel/users/${userId}/unban`, { method: 'POST' });
        showAlert('✓ User has been unbanned');
        loadAllUsers();
        closeModal('userModal');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  async function unbanUserConfirm(userId) {
    unbanUser(userId);
  }

  async function deleteUser(userId, userEmail) {
    const confirmed = confirm(`Are you sure you want to delete user ${userEmail}?\n\nThis action cannot be undone!`);
    if (!confirmed) {
      console.log('🚫 [ADMIN] Delete user cancelled');
      return;
    }

    try {
      console.log('🗑️ [ADMIN] Deleting user:', userId);
      showAlert(`Deleting user ${userEmail}...`, 'info');
      
      await fetchAdmin(`/admin-panel/users/${userId}/delete`, { 
        method: 'POST'
      });
      
      console.log('✅ [ADMIN] User deleted successfully:', userId);
      showAlert('✓ User has been deleted successfully', 'success');
      closeModal('userModal');
      loadAllUsers();
    } catch (error) {
      console.error('❌ [ADMIN] Delete error:', error);
      showAlert(`Error deleting user: ${error.message}`, 'error');
    }
  }

  // Deposits
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
      document.getElementById('depositsTable').innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No deposits found</p>';
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
      const amount = deposit.amount || 0;
      html += `<tr>
        <td>${deposit.user?.email}</td>
        <td>PKR ${(amount / 100).toFixed(2)}</td>
        <td><span class="status ${deposit.status}">${deposit.status}</span></td>
        <td>${new Date(deposit.createdAt).toLocaleDateString()}</td>
        <td>
          ${deposit.status === 'pending' ? `
            <button class="action-btn approve" data-action="approve-deposit" data-id="${deposit.id}"><i class="ri-check-line"></i>Approve</button>
            <button class="action-btn reject" data-action="reject-deposit" data-id="${deposit.id}"><i class="ri-close-line"></i>Reject</button>
          ` : ''}
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('depositsTable').innerHTML = html;

    document.querySelectorAll('[data-action="approve-deposit"]').forEach(btn => {
      btn.addEventListener('click', () => approveDeposit(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="reject-deposit"]').forEach(btn => {
      btn.addEventListener('click', () => rejectDeposit(btn.dataset.id));
    });
  }

  async function approveDeposit(depositId) {
    try {
      await fetchAdmin(`/admin-panel/deposits/${depositId}/approve`, { method: 'POST' });
      showAlert('✓ Deposit approved');
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
      showAlert('✓ Deposit rejected');
      loadDeposits();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Withdrawals
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
      document.getElementById('withdrawalsTable').innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No withdrawals found</p>';
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
        <td>PKR ${(withdrawal.amount / 100).toFixed(2)}</td>
        <td>PKR ${(fee / 100).toFixed(2)}</td>
        <td>PKR ${(netAmount / 100).toFixed(2)}</td>
        <td><span class="status ${withdrawal.status}">${withdrawal.status}</span></td>
        <td>
          ${withdrawal.status === 'pending' ? `
            <button class="action-btn view" data-action="view-withdrawal" data-id="${withdrawal.id}"><i class="ri-eye-line"></i>Review</button>
          ` : ''}
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('withdrawalsTable').innerHTML = html;

    document.querySelectorAll('[data-action="view-withdrawal"]').forEach(btn => {
      btn.addEventListener('click', () => viewWithdrawalDetails(btn.dataset.id));
    });
  }

  async function viewWithdrawalDetails(withdrawalId) {
    try {
      const data = await fetchAdmin(`/admin-panel/withdrawals/${withdrawalId}`);
      const w = data.withdrawal;
      const fee = w.amount * 0.2;
      const netAmount = w.amount - fee;

      let html = `
        <div class="info-row"><div class="info-label">User Email</div><div class="info-value">${w.user?.email}</div></div>
        <div class="info-row"><div class="info-label">Username</div><div class="info-value">${w.user?.username || '—'}</div></div>
        <div class="info-row"><div class="info-label">Phone</div><div class="info-value">${w.user?.phone || '—'}</div></div>

        <div class="info-section">
          <h3><i class="ri-bank-card-line"></i>Bank Details</h3>
          <div class="info-row"><div class="info-label">Account Holder</div><div class="info-value">${w.user?.accountHolderName || '—'}</div></div>
          <div class="info-row"><div class="info-label">Account Type</div><div class="info-value">${w.user?.accountType || '—'}</div></div>
          <div class="info-row"><div class="info-label">Account Number</div><div class="info-value">${w.user?.accountNumber || '—'}</div></div>
        </div>

        <div class="info-section">
          <h3><i class="ri-money-dollar-circle-line"></i>Amount Details</h3>
          <div class="info-row"><div class="info-label">Requested Amount</div><div class="info-value">PKR ${(w.amount / 100).toFixed(2)}</div></div>
          <div class="info-row"><div class="info-label">Admin Fee (20%)</div><div class="info-value" style="color: #e74c3c;">-PKR ${(fee / 100).toFixed(2)}</div></div>
          <div class="info-row"><div class="info-label" style="font-weight: bold;">Net to Transfer</div><div class="info-value" style="font-weight: bold; color: #27ae50;">PKR ${(netAmount / 100).toFixed(2)}</div></div>
        </div>

        <div class="button-group">
          <button class="btn-secondary" data-action="close-modal" data-modal="withdrawalModal"><i class="ri-close-line"></i>Close</button>
          <button class="btn-danger" data-action="reject-withdrawal" data-id="${withdrawalId}"><i class="ri-close-line"></i>Reject</button>
          <button class="btn-primary" data-action="approve-withdrawal" data-id="${withdrawalId}"><i class="ri-check-line"></i>Approve</button>
        </div>
      `;

      document.getElementById('withdrawalModalContent').innerHTML = html;
      document.getElementById('withdrawalModal').classList.add('active');

      document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.modal));
      });
      document.querySelector('[data-action="reject-withdrawal"]')?.addEventListener('click', function() {
        rejectWithdrawal(this.dataset.id);
      });
      document.querySelector('[data-action="approve-withdrawal"]')?.addEventListener('click', function() {
        approveWithdrawalForm(this.dataset.id);
      });
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
      showAlert('✓ Withdrawal approved! Money transferred.');
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
      showAlert('✓ Withdrawal rejected');
      closeModal('withdrawalModal');
      loadWithdrawals();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Campaigns
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
      document.getElementById('campaignsTable').innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No campaigns found</p>';
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
      const pricePerTask = campaign.pricePerTask || campaign.price || 0;
      html += `<tr>
        <td>${campaign.title}</td>
        <td>${campaign.type}</td>
        <td>${campaign.targetCount}</td>
        <td>PKR ${(pricePerTask / 100).toFixed(2)}</td>
        <td><span class="status ${campaign.status}">${campaign.status}</span></td>
        <td>
          ${campaign.status === 'pending' ? `
            <button class="action-btn approve" data-action="approve-campaign" data-id="${campaign.id}"><i class="ri-check-line"></i>Approve</button>
            <button class="action-btn reject" data-action="reject-campaign" data-id="${campaign.id}"><i class="ri-close-line"></i>Reject</button>
          ` : ''}
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('campaignsTable').innerHTML = html;

    document.querySelectorAll('[data-action="approve-campaign"]').forEach(btn => {
      btn.addEventListener('click', () => approveCampaign(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="reject-campaign"]').forEach(btn => {
      btn.addEventListener('click', () => rejectCampaign(btn.dataset.id));
    });
  }

  async function approveCampaign(campaignId) {
    try {
      await fetchAdmin(`/admin-panel/campaigns/${campaignId}/approve`, { method: 'POST' });
      showAlert('✓ Campaign approved');
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
      showAlert('✓ Campaign rejected');
      loadCampaigns();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Modals
  function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  // Settings
  async function changePassword(e) {
    e.preventDefault();
    
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
      showAlert('✓ Password changed');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      closeModal('settingsModal');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Tab buttons
    setupTabSwitching();

    // Tab content buttons
    document.addEventListener('click', function(e) {
      if (e.target.matches('[data-action="search-users"]')) {
        searchUsers();
      } else if (e.target.matches('[data-action="load-all-users"]')) {
        loadAllUsers();
      } else if (e.target.matches('[data-action="load-deposits"]')) {
        loadDeposits();
      } else if (e.target.matches('[data-action="load-withdrawals"]')) {
        loadWithdrawals();
      } else if (e.target.matches('[data-action="load-campaigns"]')) {
        loadCampaigns();
      } else if (e.target.matches('[data-action="show-settings"]')) {
        document.getElementById('settingsModal').classList.add('active');
      } else if (e.target.matches('[data-action="close-modal"]')) {
        closeModal(e.target.dataset.modal);
      } else if (e.target.matches('[data-action="logout"]')) {
        if (confirm('Logout?')) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('adminSecret');
          window.location.href = '/';
        }
      }
    });

    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', changePassword);
    }

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          closeModal(this.id);
        }
      });
    });

    // Filter change listeners
    document.getElementById('depositFilter')?.addEventListener('change', loadDeposits);
    document.getElementById('withdrawalFilter')?.addEventListener('change', loadWithdrawals);
    document.getElementById('campaignFilter')?.addEventListener('change', loadCampaigns);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupEventListeners();
      loadDashboard();
    });
  } else {
    setupEventListeners();
    loadDashboard();
  }
})();
