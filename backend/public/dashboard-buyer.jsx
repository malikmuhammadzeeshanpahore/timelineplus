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
        <h1><i className="fas fa-chart-bar" style={{marginRight: '5px'}}></i> Buyer Dashboard</h1>

        <div className="stats">
          <div className="stat-card">
            <h3><i className="fas fa-money-bill" style={{marginRight: '5px', color: '#4caf50'}}></i> Balance</h3>
            <div className="value" id="balance">-</div>
          </div>
          <div className="stat-card">
            <h3><i className="fas fa-rocket" style={{marginRight: '5px', color: '#2196f3'}}></i> Active Campaigns</h3>
            <div className="value" id="activeCampaigns">-</div>
          </div>
          <div className="stat-card">
            <h3><i className="fas fa-check-circle" style={{marginRight: '5px', color: '#4caf50'}}></i> Completed Campaigns</h3>
            <div className="value" id="completedCampaigns">-</div>
          </div>
          <div className="stat-card">
            <h3><i className="fas fa-credit-card" style={{marginRight: '5px'}}></i> Total Spent</h3>
            <div className="value" id="totalSpent">-</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', margin: '20px 0' }}>
          <a href="/deposit/" style={{ textDecoration: 'none' }} className="action-card">
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
              <i className="fas fa-plus-circle" style={{fontSize: '32px', display: 'block', marginBottom: '10px'}}></i>
              <strong>Deposit Funds</strong>
              <p style={{ fontSize: '12px', marginTop: '8px', opacity: '0.9' }}>Add balance to wallet</p>
            </div>
          </a>
          <a href="/campaigns/" style={{ textDecoration: 'none' }} className="action-card">
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)' }}>
              <i className="fas fa-rocket" style={{fontSize: '32px', display: 'block', marginBottom: '10px'}}></i>
              <strong>Launch Campaign</strong>
              <p style={{ fontSize: '12px', marginTop: '8px', opacity: '0.9' }}>Create new campaign</p>
            </div>
          </a>
          <a href="/wallet/" style={{ textDecoration: 'none' }} className="action-card">
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)' }}>
              <i className="fas fa-wallet" style={{fontSize: '32px', display: 'block', marginBottom: '10px'}}></i>
              <strong>Manage Wallet</strong>
              <p style={{ fontSize: '12px', marginTop: '8px', opacity: '0.9' }}>View transactions</p>
            </div>
          </a>
            <div style={{ textDecoration: 'none' }} className="action-card">
              <div style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #34d399 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(45, 212, 191, 0.3)' }} data-action="invite-team">
                <i className="fas fa-user-plus" style={{fontSize: '32px', display: 'block', marginBottom: '10px'}}></i>
                <strong>Invite Team</strong>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: '0.9' }}>Invite members via link or code</p>
              </div>
            </div>
        </div>

        <div className="card">
          <h2><i className="fas fa-list" style={{marginRight: '5px'}}></i> My Campaigns</h2>
          <div id="campaignsContainer">
            <div className="loading">Loading...</div>
          </div>
        </div>

        <div className="card">
          <h2><i className="fas fa-credit-card" style={{marginRight: '5px'}}></i> Deposit History</h2>
          <div id="depositsContainer">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardBuyer;

// Load auth and header first
setTimeout(() => {
  const authScript = document.createElement('script');
  authScript.src = '/js/dashboard-buyer-auth.js';
  document.body.appendChild(authScript);
  
  // Then load main dashboard loader (with icon wait logic)
  const mainScript = document.createElement('script');
  mainScript.src = '/js/dashboard-buyer-loader.js';
  document.body.appendChild(mainScript);
}, 100);
