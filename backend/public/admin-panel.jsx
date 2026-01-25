import React from 'react';

const AdminPanel = () => {
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.1); position: sticky; top: 0; z-index: 1000; }
    .nav { padding: 16px 20px; display: flex; align-items: center; max-width: 1400px; margin: 0 auto; gap: 20px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { height: 40px; }
    .label { font-weight: 700; color: white; font-size: 20px; letter-spacing: 0.5px; }
    .nav-actions { margin-left: auto; display: flex; gap: 10px; }
    .nav-actions button { padding: 8px 14px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; }
    .nav-actions button:hover { background: rgba(255,255,255,0.3); transform: translateY(-1px); }
    .site-main { padding: 40px 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    #alert { margin-bottom: 20px; padding: 14px; border-radius: 8px; text-align: center; font-weight: 600; display: none; }
    #alert.active { display: block; }
    #alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    #alert.error { background: #f8d7da; color: #842029; border: 1px solid #f5c6cb; }
    .tabs { display: flex; gap: 10px; margin-bottom: 30px; flex-wrap: wrap; }
    .tab-btn { background: white; border: 2px solid #e0e0e0; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; }
    .tab-btn:hover { border-color: #667eea; }
    .tab-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); text-align: center; transition: all 0.3s ease; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
    .stat-label { color: #666; font-size: 14px; margin-bottom: 10px; }
    .stat-value { font-size: 28px; font-weight: 700; color: #667eea; }
    .search-box { background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); display: flex; gap: 10px; flex-wrap: wrap; }
    .search-box input, .search-box select { flex: 1; min-width: 160px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: all 0.3s ease; }
    .search-box input:focus, .search-box select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .search-box button { padding: 10px 18px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; }
    .search-box button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
    table { width: 100%; background: white; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    table th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px; text-align: left; font-weight: 600; }
    table td { padding: 12px 14px; border-bottom: 1px solid #e0e0e0; }
    table tr:hover { background: #f8f9fa; }
    .action-btn { padding: 6px 12px; margin: 2px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 4px; }
    .action-btn.view { background: #3498db; color: white; }
    .action-btn.approve { background: #27ae60; color: white; }
    .action-btn.reject { background: #e74c3c; color: white; }
    .action-btn.ban { background: #e67e22; color: white; }
    .action-btn.unban { background: #27ae60; color: white; }
    .action-btn.admin { background: #9b59b6; color: white; }
    .action-btn.delete { background: #c0392b; color: white; }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .status { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
    .status.active { background: #d4edda; color: #155724; }
    .status.pending { background: #fff3cd; color: #856404; }
    .status.banned { background: #f8d7da; color: #721c24; }
    .status.approved { background: #d4edda; color: #155724; }
    .status.rejected { background: #f8d7da; color: #721c24; }
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; align-items: center; justify-content: center; }
    .modal.active { display: flex; }
    .modal-content { background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0; }
    .modal-header h3 { color: #667eea; margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
    .modal-close:hover { color: #333; }
    .info-row { display: flex; margin: 12px 0; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .info-label { font-weight: 600; color: #666; min-width: 140px; }
    .info-value { color: #333; flex: 1; word-break: break-all; }
    .info-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0; }
    .info-section h3 { color: #667eea; margin-bottom: 15px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
    .form-group { margin: 15px 0; }
    .form-group label { display: block; color: #333; font-weight: 600; margin-bottom: 6px; font-size: 14px; }
    .form-group input { width: 100%; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-family: inherit; font-size: 14px; transition: all 0.3s ease; }
    .form-group input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .button-group { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; flex-wrap: wrap; }
    .button-group button { padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; }
    .button-group .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .button-group .btn-secondary { background: #6c757d; color: white; }
    .button-group .btn-danger { background: #e74c3c; color: white; }
    .button-group button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    @media (max-width: 768px) {
      .nav { flex-wrap: wrap; }
      .nav-actions { flex-wrap: wrap; }
      .tabs { flex-direction: column; }
      .search-box { flex-direction: column; }
      table { font-size: 0.9rem; }
      table th, table td { padding: 10px; }
      .action-btn { padding: 4px 8px; font-size: 12px; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <header className="header">
        <div className="nav">
          <div className="brand">
            <img src="/logo.png" alt="TimelinePlus" />
            <span className="label">TimelinePlus Admin</span>
          </div>
          <div className="nav-actions">
            <button data-action="show-settings"><i className="ri-settings-line"></i>Settings</button>
            <button data-action="logout"><i className="ri-logout-box-line"></i>Logout</button>
          </div>
        </div>
      </header>

      <main className="site-main">
        <div className="container">
          <div id="alert"></div>

          <div className="tabs">
            <button className="tab-btn active" data-tab="dashboard"><i className="ri-bar-chart-line"></i>Dashboard</button>
            <button className="tab-btn" data-tab="users"><i className="ri-team-line"></i>Users</button>
            <button className="tab-btn" data-tab="deposits"><i className="ri-bank-card-line"></i>Deposits</button>
            <button className="tab-btn" data-tab="withdrawals"><i className="ri-wallet-line"></i>Withdrawals</button>
            <button className="tab-btn" data-tab="campaigns"><i className="ri-megaphone-line"></i>Campaigns</button>
            <button className="tab-btn" data-tab="invites"><i className="ri-mail-send-line"></i>Invites</button>
            <button className="tab-btn" data-tab="teams"><i className="ri-organization-chart"></i>Teams</button>
          </div>

          {/* Dashboard Tab */}
          <div id="dashboard" className="tab-content active">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value" id="statTotalUsers">—</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Admins</div>
                <div className="stat-value" id="statTotalAdmins">—</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Banned Users</div>
                <div className="stat-value" id="statBannedUsers">—</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending Deposits</div>
                <div className="stat-value" id="statPendingDeposits">—</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending Withdrawals</div>
                <div className="stat-value" id="statPendingWithdrawals">—</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Campaigns</div>
                <div className="stat-value" id="statActiveCampaigns">—</div>
              </div>
            </div>
          </div>

          {/* Users Tab */}
          <div id="users" className="tab-content">
            <div className="search-box">
              <input type="text" id="userSearch" placeholder="Search by email, username, phone..." />
              <button data-action="search-users"><i className="ri-search-line"></i>Search</button>
              <button data-action="load-all-users"><i className="ri-list-2"></i>All Users</button>
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
              <button data-action="load-deposits"><i className="ri-refresh-line"></i>Load</button>
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
              <button data-action="load-withdrawals"><i className="ri-refresh-line"></i>Load</button>
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
              <button data-action="load-campaigns"><i className="ri-refresh-line"></i>Load</button>
            </div>
            <div id="campaignsTable"></div>
          </div>

          {/* Invites Tab */}
          <div id="invites" className="tab-content">
            <div id="invitesTable"></div>
          </div>

          {/* Teams Tab */}
          <div id="teams" className="tab-content">
            <div id="teamsTable"></div>
          </div>
        </div>
      </main>

      {/* User Details Modal */}
      <div id="userModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3><i className="ri-user-line"></i>User Details</h3>
            <button className="modal-close" data-action="close-modal" data-modal="userModal">×</button>
          </div>
          <div id="userModalContent"></div>
        </div>
      </div>

      {/* Withdrawal Approval Modal */}
      <div id="withdrawalModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3><i className="ri-wallet-line"></i>Withdrawal Request</h3>
            <button className="modal-close" data-action="close-modal" data-modal="withdrawalModal">×</button>
          </div>
          <div id="withdrawalModalContent"></div>
        </div>
      </div>

      {/* Settings Modal */}
      <div id="settingsModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3><i className="ri-settings-line"></i>Admin Settings</h3>
            <button className="modal-close" data-action="close-modal" data-modal="settingsModal">×</button>
          </div>
          <form id="settingsForm">
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" id="currentPassword" placeholder="Current password" required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" id="newPassword" placeholder="New password" required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" id="confirmPassword" placeholder="Confirm password" required />
            </div>
            <div className="button-group">
              <button type="button" className="btn-secondary" data-action="close-modal" data-modal="settingsModal">Cancel</button>
              <button type="submit" className="btn-primary"><i className="ri-check-line"></i>Change Password</button>
            </div>
          </form>
        </div>
      </div>

      <script src="/js/localstorage-monitor.js"></script>
      <script src="/js/admin.js"></script>
      <script src="/js/site.js"></script>
    </>
  );
};

export default AdminPanel;
