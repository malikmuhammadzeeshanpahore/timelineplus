import React, { useState, useEffect } from 'react';

const Deposit = () => {
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

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      width: 100%;
      max-width: 600px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .header h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .content {
      padding: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }

    input, select {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: inherit;
      font-size: 1rem;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    .pricing-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }

    .pricing-info p {
      margin: 5px 0;
      color: #666;
    }

    .pricing-info strong {
      color: #333;
    }

    .method-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin: 15px 0;
    }

    .method-option {
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 5px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .method-option:hover {
      border-color: #667eea;
      background: #f8f9fa;
    }

    .method-option.selected {
      border-color: #667eea;
      background: #f0f3ff;
    }

    .method-option input[type="radio"] {
      display: none;
    }

    .method-name {
      font-weight: 600;
      color: #333;
      margin-top: 5px;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .nav-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      border-bottom: 2px solid #eee;
    }

    .nav-tabs button {
      background: none;
      border: none;
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      color: #666;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .nav-tabs button.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .deposit-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .deposit-info {
      flex: 1;
    }

    .deposit-amount {
      font-size: 1.2rem;
      font-weight: bold;
      color: #667eea;
    }

    .deposit-status {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .deposit-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .deposit-status.approved {
      background: #d4edda;
      color: #155724;
    }

    .deposit-status.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .alert {
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .alert.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    @media (max-width: 768px) {
      .method-group {
        grid-template-columns: 1fr;
      }

      .header h1 {
        font-size: 1.5rem;
      }
    }
  
  `;

  // React state for UI
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [methodDetails, setMethodDetails] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      alert('Please login first');
      window.location.href = '/';
    }
  }, [token]);

  // Fetch deposit history when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Helper for API calls
  const fetchAPI = async (endpoint, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API error');
    }
    return response.json();
  };

  // Tab switching
  const handleTab = (tab) => {
    setActiveTab(tab);
    setAlert({ type: '', message: '' });
  };

  // Payment method selection
  const handleMethod = (selectedMethod) => {
    setMethod(selectedMethod);
    let details = null;
    switch (selectedMethod) {
      case 'card':
        details = (
          <div className="form-group">
            <label>Card Details</label>
            <input type="text" placeholder="Full Name" required />
            <input type="text" placeholder="Card Number (4242 4242 4242 4242)" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input type="text" placeholder="MM/YY" required />
              <input type="text" placeholder="CVC" required />
            </div>
          </div>
        );
        break;
      case 'bank':
        details = (
          <div className="form-group">
            <label>Bank Details</label>
            <input type="text" placeholder="Account Holder Name" required />
            <input type="text" placeholder="Bank Account Number" required />
            <input type="text" placeholder="Routing Number" required />
          </div>
        );
        break;
      case 'paypal':
        details = (
          <div className="alert success">
            ✓ You'll be redirected to PayPal to complete the payment securely
          </div>
        );
        break;
      case 'crypto':
        details = (
          <>
            <div className="form-group">
              <label>Cryptocurrency</label>
              <select required>
                <option value="">Select cryptocurrency</option>
                <option value="btc">Bitcoin</option>
                <option value="eth">Ethereum</option>
                <option value="usdc">USDC</option>
                <option value="usdt">USDT</option>
              </select>
            </div>
            <div className="alert success">
              <i class="fas fa-info-circle" style="margin-right: 5px; color: #2196f3;"></i> You'll receive a wallet address to send funds to. Usually confirmed within 10 minutes.
            </div>
          </>
        );
        break;
      default:
        details = null;
    }
    setMethodDetails(details);
  };

  // Deposit form submit
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!method) {
      setAlert({ type: 'error', message: 'Please select a payment method' });
      return;
    }
    try {
      const response = await fetchAPI('/deposits/request', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) * 100, method }),
      });
      setAlert({
        type: 'success',
        message: `✓ Deposit request created! Your deposit of $${response.deposit.amount / 100} is awaiting admin approval.`,
      });
      setAmount('');
      setMethod('');
      setMethodDetails(null);
      setTimeout(() => setActiveTab('history'), 2000);
    } catch (error) {
      setAlert({ type: 'error', message: '✗ Error: ' + error.message });
    }
  };

  // Load deposit history
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchAPI('/deposits/my-deposits');
      setHistory(data.deposits);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error loading history: ' + error.message });
    }
    setLoadingHistory(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container">
        <div className="header">
          <h1><i class="fas fa-credit-card" style="margin-right: 5px;"></i> Add Funds</h1>
          <p>Deposit money to start campaigns</p>
        </div>
        <div className="content">
          <div className="nav-tabs">
            <button
              className={activeTab === 'deposit' ? 'active' : ''}
              type="button"
              onClick={() => handleTab('deposit')}
            >
              Deposit
            </button>
            <button
              className={activeTab === 'history' ? 'active' : ''}
              type="button"
              onClick={() => handleTab('history')}
            >
              History
            </button>
          </div>

          {/* Deposit Tab */}
          <div id="deposit" className={`tab-content${activeTab === 'deposit' ? ' active' : ''}`}>
            {alert.message && (
              <div className={`alert ${alert.type}`}>{alert.message}</div>
            )}
            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label>Amount (USD) *</label>
                <input
                  type="number"
                  required
                  min="10"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Payment Method *</label>
                <div className="method-group">
                  <div
                    className={`method-option${method === 'card' ? ' selected' : ''}`}
                    onClick={() => handleMethod('card')}
                  >
                    <div><i class="fas fa-credit-card" style="margin-right: 5px;"></i></div>
                    <div className="method-name">Card</div>
                  </div>
                  <div
                    className={`method-option${method === 'bank' ? ' selected' : ''}`}
                    onClick={() => handleMethod('bank')}
                  >
                    <div>🏦</div>
                    <div className="method-name">Bank</div>
                  </div>
                  <div
                    className={`method-option${method === 'paypal' ? ' selected' : ''}`}
                    onClick={() => handleMethod('paypal')}
                  >
                    <div>🅿️</div>
                    <div className="method-name">PayPal</div>
                  </div>
                  <div
                    className={`method-option${method === 'crypto' ? ' selected' : ''}`}
                    onClick={() => handleMethod('crypto')}
                  >
                    <div>₿</div>
                    <div className="method-name">Crypto</div>
                  </div>
                </div>
                <input type="hidden" value={method} required readOnly />
              </div>
              <div id="methodDetails">{methodDetails}</div>
              <div className="pricing-info">
                <p>
                  💡 After your deposit is <strong>approved by admin</strong>, your funds will be instantly available to:
                </p>
                <ul style={{ marginLeft: 20, marginTop: 10 }}>
                  <li>Create campaigns for followers/subscribers/likes</li>
                  <li>Pay freelancers (60% goes to Timeline+, 40% to freelancer rewards)</li>
                  <li>Withdraw unused balance (minus fees)</li>
                </ul>
              </div>
              <button type="submit">Request Deposit</button>
            </form>
          </div>

          {/* History Tab */}
          <div id="history" className={`tab-content${activeTab === 'history' ? ' active' : ''}`}>
            {loadingHistory ? (
              <div>Loading...</div>
            ) : (
              <div id="depositHistory">
                {history.length === 0 ? (
                  <p>No deposits yet.</p>
                ) : (
                  history.map(deposit => (
                    <div className="deposit-item" key={deposit._id}>
                      <div className="deposit-info">
                        <div className="deposit-amount">${(deposit.amount / 100).toFixed(2)}</div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          {deposit.method} • {new Date(deposit.createdAt).toLocaleDateString()}
                        </div>
                        {deposit.reason && (
                          <div style={{ color: '#721c24', marginTop: 5 }}>
                            ⚠ {deposit.reason}
                          </div>
                        )}
                      </div>
                      <span className={`deposit-status ${deposit.status.toLowerCase()}`}>
                        {deposit.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Deposit;
