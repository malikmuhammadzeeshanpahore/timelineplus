import React, { useState, useEffect } from 'react';

const FreelancerDashboard = () => {
  const [totalEarnings, setTotalEarnings] = useState('0.00');
  const [availableEarnings, setAvailableEarnings] = useState('0.00');
  const [lockedEarnings, setLockedEarnings] = useState('0.00');
  const [trustScore, setTrustScore] = useState('100');
  const [recentTasks, setRecentTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({ total: 0, paid: 0, assigned: 0, pending: 0 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/register/';
      return;
    }

    const loadData = async () => {
      try {
        const userRes = await fetch(`${window.location.origin}/api/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setTotalEarnings((userData.balance / 100).toFixed(2));
          setTrustScore(userData.user.trustScore?.toFixed(1) || '100');
        }

        const earningsRes = await fetch(`${window.location.origin}/api/campaigns/earnings-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (earningsRes.ok) {
          const earningsData = await earningsRes.json();
          setAvailableEarnings((earningsData.unlockedEarnings / 100).toFixed(2));
          setLockedEarnings((earningsData.lockedEarnings / 100).toFixed(2));
        }

        const tasksRes = await fetch(`${window.location.origin}/api/campaigns/my-tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tasksRes.ok) {
          const allTasks = await tasksRes.json();
          setRecentTasks(allTasks.slice(0, 5));
          setTaskStats({
            total: allTasks.length,
            paid: allTasks.filter(t => t.status === 'paid').length,
            assigned: allTasks.filter(t => t.status === 'assigned').length,
            pending: allTasks.filter(t => t.status === 'pending').length
          });
        }

        const withdrawalsRes = await fetch(`${window.location.origin}/api/withdrawals/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json();
          setWithdrawals(Array.isArray(withdrawalsData) ? withdrawalsData.slice(0, 5) : []);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .stat-item { background: #d1e7dd; padding: 15px; border-radius: 5px; text-align: center; }
    .stat-item.info { background: #cfe2ff; }
    .stat-item.warning { background: #fff3cd; }
  `;

  const getBadgeClass = (status) => {
    if (status === 'paid' || status === 'approved') return 'badge-success';
    if (status === 'assigned') return 'badge-info';
    if (status === 'pending') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div id="headerContainer"></div>

      <div className="container">
        <h1>📊 Freelancer Dashboard</h1>

        <div className="stats">
          <div className="stat-card">
            <h3>💰 Total Earnings</h3>
            <div className="value">${totalEarnings}</div>
          </div>
          <div className="stat-card">
            <h3>💸 Available to Withdraw</h3>
            <div className="value">${availableEarnings}</div>
          </div>
          <div className="stat-card">
            <h3>⏱️ Locked Earnings</h3>
            <div className="value">${lockedEarnings}</div>
          </div>
          <div className="stat-card">
            <h3>⭐ Trust Score</h3>
            <div className="value">{trustScore}%</div>
          </div>
        </div>

        <div className="card">
          <h2>📋 Recent Tasks</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : recentTasks.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>Reward</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task, i) => (
                  <tr key={i}>
                    <td>{task.campaign?.title || 'N/A'}</td>
                    <td>{task.campaign?.type || 'N/A'}</td>
                    <td>${(task.rewardPerTask / 100).toFixed(2)}</td>
                    <td><span className={`badge ${getBadgeClass(task.status)}`}>{task.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No tasks yet</p>
          )}
        </div>

        <div className="card">
          <h2>📈 Task Statistics</h2>
          <div className="stat-grid">
            <div className="stat-item">
              <strong>{taskStats.total}</strong><br />Total Tasks
            </div>
            <div className="stat-item">
              <strong>{taskStats.paid}</strong><br />Paid
            </div>
            <div className="stat-item info">
              <strong>{taskStats.assigned}</strong><br />Assigned
            </div>
            <div className="stat-item warning">
              <strong>{taskStats.pending}</strong><br />Pending
            </div>
          </div>
        </div>

        <div className="card">
          <h2>💳 Recent Withdrawals</h2>
          {withdrawals.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w, i) => (
                  <tr key={i}>
                    <td>${(w.amount / 100).toFixed(2)}</td>
                    <td>{w.method}</td>
                    <td><span className={`badge ${getBadgeClass(w.status)}`}>{w.status}</span></td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No withdrawals yet</p>
          )}
        </div>
      </div>

      <script src="/js/header.js"></script>
      <script>
        {`fetch('/header.html').then(r => r.text()).then(html => {
          const c = document.getElementById('headerContainer');
          if (c) c.innerHTML = html;
        });`}
      </script>
    </>
  );
};

export default FreelancerDashboard;
