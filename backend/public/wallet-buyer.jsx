import React, { useState, useEffect } from 'react';

const WalletBuyer = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'buyer');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'buyer';
    setToken(token);
    setRole(role);
  }, []);

  return (
    <>
      <header id="header-placeholder"></header>
      <main className="site-main container">
        <div className="card">
          <h3>Wallet</h3>
          <p className="small">Balance: <strong>PKR <span id="wallet-balance">--</span></strong></p>
          
          <div style={{marginTop: '20px'}}>
            <div className="tabs" id="wallet-tabs">
              <button className="tab-btn active" data-tab="transaction-history">Transaction History</button>
              <button className="tab-btn" data-tab="deposit-funds">Deposit Funds</button>
              <button className="tab-btn" data-tab="withdraw-funds">Withdraw Funds</button>
            </div>
            
            <div id="transaction-history" className="tab-content active" style={{marginTop: '15px'}}>
              <h4>Transaction History</h4>
              <table id="transaction-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid #ddd'}}>
                    <th style={{textAlign: 'left', padding: '8px'}}>Date</th>
                    <th style={{textAlign: 'left', padding: '8px'}}>Type</th>
                    <th style={{textAlign: 'right', padding: '8px'}}>Amount</th>
                    <th style={{textAlign: 'left', padding: '8px'}}>Details</th>
                  </tr>
                </thead>
                <tbody id="transaction-tbody">
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '10px'}}>Loading...</td></tr>
                </tbody>
              </table>
            </div>

            <div id="deposit-funds" className="tab-content" style={{marginTop: '15px', display: 'none'}}>
              <h4>Top Up Wallet</h4>
              <form id="topup-form">
                <input id="topup-amount" placeholder="Amount (PKR)" type="number" min="1" step="1" style={{padding: '8px', marginRight: '10px', width: '200px'}}/>
                <button className="btn-primary" type="submit">Top Up</button>
              </form>
            </div>

            <div id="withdraw-funds" className="tab-content" style={{marginTop: '15px', display: 'none'}}>
              <h4>Request Withdrawal</h4>
              <p className="small">Withdraw to your linked bank or PayPal account.</p>
              <form id="withdraw-form">
                <div style={{marginBottom: '10px'}}>
                  <input id="withdraw-amount" placeholder="Amount (PKR)" type="number" min="1" step="1" style={{padding: '8px', marginRight: '10px', width: '200px'}}/>
                </div>
                <div style={{marginBottom: '10px'}}>
                  <select id="withdraw-method" style={{padding: '8px', marginRight: '10px'}}>
                    <option value="">Select method</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div style={{marginBottom: '10px'}}>
                  <input id="withdraw-details" placeholder="Bank account or PayPal email" type="text" style={{padding: '8px', marginRight: '10px', width: '300px'}}/>
                </div>
                <button className="btn-outline" type="submit">Request Withdrawal</button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <script src="/js/wallet-buyer.js"></script>
    </>
  );
};

export default WalletBuyer;

