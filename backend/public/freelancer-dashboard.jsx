const FreelancerDashboard = () => {
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

  return (
    <>
      <style>{styles}</style>
      <div id="headerContainer"></div>

      <div className="container">
        <h1><i class="fas fa-chart-bar" style="margin-right: 5px;"></i> Freelancer Dashboard</h1>

        <div className="stats">
          <div className="stat-card">
            <h3><i class="fas fa-money-bill" style="margin-right: 5px; color: #4caf50;"></i> Total Earnings</h3>
            <div className="value" id="totalEarnings">-</div>
          </div>
          <div className="stat-card">
            <h3><i class="fas fa-dollar-sign" style="margin-right: 5px; color: #4caf50;"></i> Available to Withdraw</h3>
            <div className="value" id="availableEarnings">-</div>
          </div>
          <div className="stat-card">
            <h3><i class="fas fa-clock" style="margin-right: 5px;"></i> Locked Earnings</h3>
            <div className="value" id="lockedEarnings">-</div>
          </div>
          <div className="stat-card">
            <h3><i class="fas fa-star" style="margin-right: 5px; color: #ffc107;"></i> Trust Score</h3>
            <div className="value" id="trustScore">-</div>
          </div>
        </div>

        <div className="card">
          <h2><i class="fas fa-list" style="margin-right: 5px;"></i> Recent Tasks</h2>
          <div id="tasksContainer">
            <div className="loading">Loading...</div>
          </div>
        </div>

        <div className="card">
          <h2><i class="fas fa-chart-line" style="margin-right: 5px;"></i> Task Statistics</h2>
          <div className="stat-grid" id="statsGrid">
            <div className="stat-item">
              <strong id="statTotal">0</strong><br />Total Tasks
            </div>
            <div className="stat-item">
              <strong id="statPaid">0</strong><br />Paid
            </div>
            <div className="stat-item info">
              <strong id="statAssigned">0</strong><br />Assigned
            </div>
            <div className="stat-item warning">
              <strong id="statPending">0</strong><br />Pending
            </div>
          </div>
        </div>

        <div className="card">
          <h2><i class="fas fa-credit-card" style="margin-right: 5px;"></i> Recent Withdrawals</h2>
          <div id="withdrawalsContainer">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreelancerDashboard;

// This script runs after the page loads to populate data
setTimeout(() => {
  const scripts = document.querySelectorAll('script[src="/js/freelancer-dashboard.js"]');
  if (scripts.length === 0) {
    const script = document.createElement('script');
    script.src = '/js/freelancer-dashboard.js';
    document.body.appendChild(script);
  }
}, 100);
