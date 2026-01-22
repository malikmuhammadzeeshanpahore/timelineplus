import React, { useState, useEffect } from 'react';

const DashboardBuyer = () => {
  const [balance, setBalance] = useState('0.00');
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [completedCampaigns, setCompletedCampaigns] = useState(0);
  const [totalSpent, setTotalSpent] = useState('0.00');
  const [campaigns, setCampaigns] = useState([]);
  const [deposits, setDeposits] = useState([]);
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
          setBalance((userData.balance / 100).toFixed(2));
        }

        const campaignsRes = await fetch(`${window.location.origin}/api/campaigns/my-campaigns`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json();
          const activeCampaignsData = campaignsData.filter(c => c.status === 'active');
          const completedCampaignsData = campaignsData.filter(c => c.status === 'completed');
          const totalSpentData = campaignsData.reduce((sum, c) => sum + c.price, 0);
          setActiveCampaigns(activeCampaignsData.length);
          setCompletedCampaigns(completedCampaignsData.length);
          setTotalSpent((totalSpentData / 100).toFixed(2));
          setCampaigns(campaignsData.slice(0, 10));
        }

        const depositsRes = await fetch(`${window.location.origin}/api/deposits/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (depositsRes.ok) {
          const depositsData = await depositsRes.json();
          setDeposits(Array.isArray(depositsData) ? depositsData.slice(0, 5) : []);
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

  const getBadgeClass = (status) => {
    if (status === 'approved' || status === 'success' || status === 'active') return 'badge-success';
    if (status === 'info') return 'badge-info';
    if (status === 'pending' || status === 'warning') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div id="headerContainer"></div>

      <div className="container">
        <h1>📊 Buyer Dashboard</h1>

        <div className="stats">
          <div className="stat-card">
            <h3>💳 Account Balance</h3>
            <div className="value">${balance}</div>
          </div>
          <div className="stat-card">
            <h3>📢 Active Campaigns</h3>
            <div className="value">{activeCampaigns}</div>
          </div>
          <div className="stat-card">
            <h3>✅ Completed Campaigns</h3>
            <div className="value">{completedCampaigns}</div>
          </div>
          <div className="stat-card">
            <h3>💰 Total Spent</h3>
            <div className="value">${totalSpent}</div>
          </div>
        </div>

        <div className="card">
          <h2>📢 Recent Campaigns</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : campaigns.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign, i) => {
                  const progress = Math.round((campaign.completedCount / campaign.targetCount) * 100);
                  return (
                    <tr key={i}>
                      <td><strong>{campaign.title}</strong></td>
                      <td>{campaign.type}</td>
                      <td>
                        <span>{campaign.completedCount}/{campaign.targetCount}</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                      </td>
                      <td><span className={`badge badge-${campaign.status === 'active' ? 'info' : campaign.status === 'completed' ? 'success' : 'pending'}`}>{campaign.status}</span></td>
                      <td>${(campaign.price / 100).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No campaigns yet</p>
          )}
        </div>

        <div className="card">
          <h2>💳 Deposit History</h2>
          {deposits.length > 0 ? (
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
                {deposits.map((deposit, i) => (
                  <tr key={i}>
                    <td>${(deposit.amount / 100).toFixed(2)}</td>
                    <td>{deposit.method}</td>
                    <td><span className={`badge badge-${deposit.status === 'approved' ? 'success' : deposit.status === 'pending' ? 'warning' : 'danger'}`}>{deposit.status}</span></td>
                    <td>{new Date(deposit.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No deposits yet</p>
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

export default DashboardBuyer;
