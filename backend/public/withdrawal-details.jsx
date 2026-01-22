import React, { useState, useEffect } from 'react';

const WithdrawalDetails = () => {
  const [accountHolder, setAccountHolder] = useState('');
  const [accountType, setAccountType] = useState('jazzcash');
  const [accountNumber, setAccountNumber] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/register/';
      return;
    }

    // Load existing withdrawal details
    const loadWithdrawalDetails = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.withdrawalDetails) {
            setAccountHolder(data.withdrawalDetails.accountHolder || '');
            setAccountType(data.withdrawalDetails.accountType || 'jazzcash');
            setAccountNumber(data.withdrawalDetails.accountNumber || '');
          }
        }
      } catch (err) {
        console.error('Failed to load withdrawal details:', err);
      }
    };

    loadWithdrawalDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!accountHolder.trim() || !accountNumber.trim()) {
      setSavedMessage('Please fill in all fields');
      setTimeout(() => setSavedMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${window.location.origin}/api/user/withdrawal-details`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountHolder,
          accountType,
          accountNumber
        })
      });

      if (res.ok) {
        setSavedMessage('✅ Withdrawal details saved successfully');
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setSavedMessage('❌ Failed to save details');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving withdrawal details:', err);
      setSavedMessage('❌ Error: ' + err.message);
      setTimeout(() => setSavedMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .nav { padding: 15px 0; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { height: 40px; }
    .label { font-weight: bold; color: #667eea; }
    .navbar { display: flex; gap: 20px; flex: 1; margin-left: 40px; }
    .navbar a { text-decoration: none; color: #333; display: flex; align-items: center; gap: 8px; }
    .navbar a:hover { color: #667eea; }
    .right { margin-left: auto; }
    .container { max-width: 1200px; margin: 0 auto; }
    .site-main { padding: 40px 20px; }
    .content { max-width: 600px; margin: 0 auto; }
    .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .card h3 { color: #667eea; margin-bottom: 10px; }
    .card .small { color: #666; font-size: 14px; margin-bottom: 20px; }
    form { display: flex; flex-direction: column; gap: 15px; }
    input, select { padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
    input:focus, select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .btn-primary { padding: 12px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
    .btn-primary:hover { background: #5568d3; }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
    #savedMsg { margin-top: 15px; padding: 12px; border-radius: 5px; text-align: center; }
    #savedMsg.success { background: #d1e7dd; color: #0f5132; }
    #savedMsg.error { background: #f8d7da; color: #842029; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <header className="header">
        <div className="nav container" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="brand">
            <img src="/logo.png" alt="TimelinePlus" />
            <span className="label">TimelinePlus</span>
          </div>
          <nav className="navbar" aria-label="Main navigation">
            <a href="/services/"><i className="ri-briefcase-4-line"></i><span className="nav-label">Services</span></a>
            <a href="/orders/"><i className="ri-shopping-cart-line"></i><span className="nav-label">Active Campaigns</span></a>
            <a href="/support/"><i className="ri-question-line"></i><span className="nav-label">Support</span></a>
          </nav>
          <div className="right"><div id="userPanel"></div></div>
        </div>
      </header>

      <main className="site-main">
        <div className="content">
          <div className="card">
            <h3>Withdrawal Account Details</h3>
            <p className="small">Save your payout account details. Supported Account Types: JazzCash, EasyPaisa.</p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Account Holder Name"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                required
              />
              <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
              </select>
              <input
                type="text"
                placeholder="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Info'}
              </button>
            </form>
            {savedMessage && (
              <div
                id="savedMsg"
                className={savedMessage.includes('✅') ? 'success' : 'error'}
              >
                {savedMessage}
              </div>
            )}
          </div>
        </div>
      </main>

      <script src="/js/site.js"></script>
      <script src="/js/role-protect.js"></script>
    </>
  );
};

export default WithdrawalDetails;
