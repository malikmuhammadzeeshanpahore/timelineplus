const DashboardBuyer = () => {
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
      <style>{styles}</style>
      <div id="headerContainer"></div>

      <div className="container">
        <h1>📊 Buyer Dashboard</h1>

        <div className="stats">
          <div className="stat-card">
            <h3>💰 Balance</h3>
            <div className="value" id="balance">-</div>
          </div>
          <div className="stat-card">
            <h3>🚀 Active Campaigns</h3>
            <div className="value" id="activeCampaigns">-</div>
          </div>
          <div className="stat-card">
            <h3>✅ Completed Campaigns</h3>
            <div className="value" id="completedCampaigns">-</div>
          </div>
          <div className="stat-card">
            <h3>💳 Total Spent</h3>
            <div className="value" id="totalSpent">-</div>
          </div>
        </div>

        <div className="card">
          <h2>📋 My Campaigns</h2>
          <div id="campaignsContainer">
            <div className="loading">Loading...</div>
          </div>
        </div>

        <div className="card">
          <h2>💳 Deposit History</h2>
          <div id="depositsContainer">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardBuyer;

// This script runs after the page loads to populate data
setTimeout(() => {
  const scripts = document.querySelectorAll('script[src="/js/dashboard-buyer.js"]');
  if (scripts.length === 0) {
    const script = document.createElement('script');
    script.src = '/js/dashboard-buyer.js';
    document.body.appendChild(script);
  }
}, 100);
