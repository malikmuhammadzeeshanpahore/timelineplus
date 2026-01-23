import React from 'react';

const WithdrawalDetails = () => {
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.1); position: sticky; top: 0; z-index: 1000; }
    .nav { padding: 16px 20px; display: flex; align-items: center; max-width: 1200px; margin: 0 auto; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { height: 40px; }
    .label { font-weight: 700; color: white; font-size: 20px; letter-spacing: 0.5px; }
    .navbar { display: flex; gap: 30px; flex: 1; margin-left: 40px; }
    .navbar a { text-decoration: none; color: rgba(255, 255, 255, 0.9); display: flex; align-items: center; gap: 8px; font-weight: 500; transition: all 0.3s ease; }
    .navbar a:hover { color: white; }
    .right { margin-left: auto; }
    .site-main { padding: 40px 20px; }
    .content { max-width: 600px; margin: 0 auto; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
    .card h3 { color: #667eea; margin-bottom: 12px; font-size: 22px; font-weight: 700; }
    .card .small { color: #666; font-size: 14px; margin-bottom: 20px; }
    form { display: flex; flex-direction: column; gap: 16px; }
    input, select { padding: 12px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-family: inherit; transition: all 0.3s ease; background: #f9f9f9; }
    input:focus, select:focus { outline: none; border-color: #667eea; background: white; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .btn-primary { padding: 12px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
    #savedMsg { margin-top: 16px; padding: 14px; border-radius: 8px; text-align: center; font-weight: 600; }
    #savedMsg.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    #savedMsg.error { background: #f8d7da; color: #842029; border: 1px solid #f5c6cb; }
    @media (max-width: 768px) {
      .navbar { gap: 15px; margin-left: 20px; }
      .card { padding: 20px; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <header className="header">
        <div className="nav">
          <div className="brand">
            <img src="/logo.png" alt="TimelinePlus" />
            <span className="label">TimelinePlus</span>
          </div>
          <nav className="navbar" aria-label="Main navigation">
            <a href="/campaigns/"><i className="ri-briefcase-4-line"></i><span>Campaigns</span></a>
            <a href="/orders/"><i className="ri-shopping-cart-line"></i><span>Active Campaigns</span></a>
            <a href="/support/"><i className="ri-question-line"></i><span>Support</span></a>
          </nav>
          <div className="right"><div id="userPanel"></div></div>
        </div>
      </header>

      <main className="site-main">
        <div className="content">
          <div className="card">
            <h3><i className="ri-bank-card-line" style={{ marginRight: '10px', color: '#667eea' }}></i>Withdrawal Account Details</h3>
            <p className="small">Save your payout account details. Supported: JazzCash, EasyPaisa.</p>
            <form id="withdrawalForm">
              <input
                id="accountHolder"
                type="text"
                placeholder="Account Holder Name"
                required
              />
              <select id="accountType">
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
              </select>
              <input
                id="accountNumber"
                type="text"
                placeholder="Account Number"
                required
              />
              <button className="btn-primary" type="submit" id="submitBtn">
                Save Info
              </button>
            </form>
            <div id="savedMsg"></div>
          </div>
        </div>
      </main>

      <script src="/js/site.js"></script>
      <script src="/js/withdrawal-details.js"></script>
    </>
  );
};

export default WithdrawalDetails;
