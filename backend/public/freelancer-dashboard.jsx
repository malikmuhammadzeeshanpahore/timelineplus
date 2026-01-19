import React, { useState, useEffect } from 'react';

const FreelancerDashboard = () => {
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
    .loading { text-align: center; color: #667eea; font-weight: bold; }
  
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <!-- Include Dynamic Header -->
  <div id="headerContainer"></div>

  <div className="container">
    <h1>📊 Freelancer Dashboard</h1>

    <!-- Stats -->
    <div className="stats" id="stats">
      <div className="stat-card">
        <h3>💰 Total Earnings</h3>
        <div className="value">$<span id="totalEarnings">0.00</span></div>
      </div>
      <div className="stat-card">
        <h3>💸 Available to Withdraw</h3>
        <div className="value">$<span id="availableEarnings">0.00</span></div>
      </div>
      <div className="stat-card">
        <h3>⏱️ Locked Earnings</h3>
        <div className="value">$<span id="lockedEarnings">0.00</span></div>
      </div>
      <div className="stat-card">
        <h3>⭐ Trust Score</h3>
        <div className="value"><span id="trustScore">100</span>%</div>
      </div>
    </div>

    <!-- Recent Tasks -->
    <div className="card">
      <h2>📋 Recent Tasks</h2>
      <div id="recentTasks" className="loading">Loading...</div>
    </div>

    <!-- Task Statistics -->
    <div className="card">
      <h2>📈 Task Statistics</h2>
      <div id="taskStats" className="loading">Loading...</div>
    </div>

    <!-- Recent Withdrawals -->
    <div className="card">
      <h2>💳 Recent Withdrawals</h2>
      <div id="recentWithdrawals" className="loading">Loading...</div>
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

        document.getElementById('totalEarnings').textContent = (userData.balance / 100).toFixed(2);
        document.getElementById('trustScore').textContent = userData.user.trustScore?.toFixed(1) || '100';

        // Load earnings status
        const earningsResponse = await fetch(`${API_BASE}/campaigns/earnings-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const earningsData = await earningsResponse.json();
        document.getElementById('availableEarnings').textContent = (earningsData.unlockedEarnings / 100).toFixed(2);
        document.getElementById('lockedEarnings').textContent = (earningsData.lockedEarnings / 100).toFixed(2);

        // Load recent tasks
        let tasksHTML = '<table><tr><th>Campaign</th><th>Type</th><th>Reward</th><th>Status</th></tr>';
        if (userData.recentTasks?.length > 0) {
          userData.recentTasks.forEach(task => {
            tasksHTML += `
              <tr>
                <td>${task.campaign.title}</td>
                <td>${task.campaign.type}</td>
                <td>$${(task.rewardPerTask / 100).toFixed(2)}</td>
                <td><span className="badge badge-${task.status === 'paid' ? 'success' : task.status === 'assigned' ? 'info' : 'warning'}">${task.status}</span></td>
              </tr>
            `;
          });
        } else {
          tasksHTML += '<tr><td colspan="4">No tasks yet</td></tr>';
        }
        tasksHTML += '</table>';
        document.getElementById('recentTasks').innerHTML = tasksHTML;

        // Load task statistics
        const allTasksResponse = await fetch(`${API_BASE}/campaigns/my-tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const allTasks = await allTasksResponse.json();

        const stats = {
          total: allTasks.length,
          paid: allTasks.filter(t => t.status === 'paid').length,
          assigned: allTasks.filter(t => t.status === 'assigned').length,
          pending: allTasks.filter(t => t.status === 'pending').length
        };

        document.getElementById('taskStats').innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
            <div style="background: #d1e7dd; padding: 15px; border-radius: 5px; text-align: center;">
              <strong>${stats.total}</strong><br>Total Tasks
            </div>
            <div style="background: #d1e7dd; padding: 15px; border-radius: 5px; text-align: center;">
              <strong>${stats.paid}</strong><br>Paid
            </div>
            <div style="background: #cfe2ff; padding: 15px; border-radius: 5px; text-align: center;">
              <strong>${stats.assigned}</strong><br>Assigned
            </div>
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; text-align: center;">
              <strong>${stats.pending}</strong><br>Pending
            </div>
          </div>
        `;

        // Load withdrawals
        const withdrawalsResponse = await fetch(`${API_BASE}/withdrawals/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const withdrawals = await withdrawalsResponse.json();

        let withdrawalsHTML = '<table><tr><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>';
        if (withdrawals?.length > 0) {
          withdrawals.slice(0, 5).forEach(w => {
            withdrawalsHTML += `
              <tr>
                <td>$${(w.amount / 100).toFixed(2)}</td>
                <td>${w.method}</td>
                <td><span className="badge badge-${w.status === 'approved' ? 'success' : w.status === 'pending' ? 'warning' : 'danger'}">${w.status}</span></td>
                <td>${new Date(w.createdAt).toLocaleDateString()}</td>
              </tr>
            `;
          });
        } else {
          withdrawalsHTML += '<tr><td colspan="4">No withdrawals yet</td></tr>';
        }
        withdrawalsHTML += '</table>';
        document.getElementById('recentWithdrawals').innerHTML = withdrawalsHTML;
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

export default FreelancerDashboard;
