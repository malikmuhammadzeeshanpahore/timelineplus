import React, { useState, useEffect } from 'react';

const DashboardBuyer = () => {
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

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #667eea;
    }
    .stat-card h3 { color: #667eea; font-size: 14px; margin-bottom: 10px; }
    .stat-card .value { font-size: 28px; font-weight: bold; color: #333; }
    .card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin: 20px 0;
    }
    .card h2 { color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    table th { background: #f8f9ff; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
    table td { padding: 12px; border-bottom: 1px solid #eee; }
    table tr:hover { background: #f8f9ff; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-success { background: #d1e7dd; color: #0f5132; }
    .badge-warning { background: #fff3cd; color: #664d03; }
    .badge-danger { background: #f8d7da; color: #842029; }
    .badge-info { background: #cfe2ff; color: #084298; }
    .badge-pending { background: #fff3cd; color: #664d03; }
    .loading { text-align: center; color: #667eea; font-weight: bold; }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
      margin: 5px 0;
    }
    .progress-fill { height: 100%; background: #51cf66; }
  
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <!-- Include Dynamic Header -->
  <div id="headerContainer"></div>

  <div className="container">
    <h1>📊 Buyer Dashboard</h1>

    <!-- Stats -->
    <div className="stats">
      <div className="stat-card">
        <h3>💳 Account Balance</h3>
        <div className="value">$<span id="balance">0.00</span></div>
      </div>
      <div className="stat-card">
        <h3>📢 Active Campaigns</h3>
        <div className="value" id="activeCampaigns">0</div>
      </div>
      <div className="stat-card">
        <h3>✅ Completed Campaigns</h3>
        <div className="value" id="completedCampaigns">0</div>
      </div>
      <div className="stat-card">
        <h3>💰 Total Spent</h3>
        <div className="value">$<span id="totalSpent">0.00</span></div>
      </div>
    </div>

    <!-- Recent Campaigns -->
    <div className="card">
      <h2>📢 Recent Campaigns</h2>
      <div id="recentCampaigns" className="loading">Loading...</div>
    </div>

    <!-- Deposit History -->
    <div className="card">
      <h2>💳 Deposit History</h2>
      <div id="depositHistory" className="loading">Loading...</div>
    </div>
  </div>

  <script>
    const API_BASE = window.location.origin + '/api';

    // Load header
    fetch('/header.html')
      .then(r => r.text())
      .then(html => {
        const container = document.getElementById('headerContainer');
        container.innerHTML = html;
        // Execute scripts in loaded HTML
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          newScript.innerHTML = script.innerHTML;
          document.body.appendChild(newScript);
        });
      });

    async function loadDashboard() {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/register.html';
        return;
      }

      try {
        // Load user data
        const userResponse = await fetch(`${API_BASE}/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userResponse.json();

        document.getElementById('balance').textContent = (userData.balance / 100).toFixed(2);

        // Load campaigns
        const campaignsResponse = await fetch(`${API_BASE}/campaigns/my-campaigns`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const campaigns = await campaignsResponse.json();

        const activeCampaigns = campaigns.filter(c => c.status === 'active');
        const completedCampaigns = campaigns.filter(c => c.status === 'completed');
        const totalSpent = campaigns.reduce((sum, c) => sum + c.price, 0);

        document.getElementById('activeCampaigns').textContent = activeCampaigns.length;
        document.getElementById('completedCampaigns').textContent = completedCampaigns.length;
        document.getElementById('totalSpent').textContent = (totalSpent / 100).toFixed(2);

        // Recent campaigns
        let campaignsHTML = '<table><tr><th>Campaign</th><th>Type</th><th>Progress</th><th>Status</th><th>Cost</th></tr>';
        if (userData.recentCampaigns?.length > 0) {
          userData.recentCampaigns.forEach(campaign => {
            const progress = Math.round((campaign.completedCount / campaign.targetCount) * 100);
            campaignsHTML += `
              <tr>
                <td><strong>${campaign.title}</strong></td>
                <td>${campaign.type}</td>
                <td>
                  ${campaign.completedCount}/${campaign.targetCount}
                  <div className="progress-bar">
                    <div className="progress-fill" style="width: ${progress}%"></div>
                  </div>
                </td>
                <td><span className="badge badge-${campaign.status === 'active' ? 'info' : campaign.status === 'completed' ? 'success' : 'pending'}">${campaign.status}</span></td>
                <td>$${(campaign.price / 100).toFixed(2)}</td>
              </tr>
            `;
          });
        } else {
          campaignsHTML += '<tr><td colspan="5">No campaigns yet</td></tr>';
        }
        campaignsHTML += '</table>';
        document.getElementById('recentCampaigns').innerHTML = campaignsHTML;

        // Deposit history
        let depositsHTML = '<table><tr><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>';
        if (userData.recentDeposits?.length > 0) {
          userData.recentDeposits.forEach(deposit => {
            depositsHTML += `
              <tr>
                <td>$${(deposit.amount / 100).toFixed(2)}</td>
                <td>${deposit.method}</td>
                <td><span className="badge badge-${deposit.status === 'approved' ? 'success' : deposit.status === 'pending' ? 'warning' : 'danger'}">${deposit.status}</span></td>
                <td>${new Date(deposit.createdAt).toLocaleDateString()}</td>
              </tr>
            `;
          });
        } else {
          depositsHTML += '<tr><td colspan="4">No deposits yet</td></tr>';
        }
        depositsHTML += '</table>';
        document.getElementById('depositHistory').innerHTML = depositsHTML;
      } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error: ' + error.message);
      }
    }

    window.addEventListener('load', loadDashboard);
  </script>
    </>
  );
};

export default DashboardBuyer;
