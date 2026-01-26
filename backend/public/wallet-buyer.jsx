import React, { useState, useEffect } from 'react';

const WalletBuyer = () => {
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .card h3 { color: #333; margin-bottom: 15px; font-size: 24px; }
    .small { font-size: 14px; color: #666; }
    .tabs { display: flex; gap: 10px; margin: 20px 0; border-bottom: 2px solid #eee; }
    .tab-btn { padding: 10px 20px; background: none; border: none; cursor: pointer; font-weight: 500; color: #666; border-bottom: 3px solid transparent; transition: all 0.3s; }
    .tab-btn:hover { color: #667eea; }
    .tab-btn.active { color: #667eea; border-bottom-color: #667eea; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f9f9f9; font-weight: 600; }
    tr:hover { background: #f9f9f9; }
    input, select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
    button { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
    button:hover { background: #5568d3; }
    .btn-outline { background: white; color: #667eea; border: 2px solid #667eea; }
    .btn-outline:hover { background: #f0f0ff; }
    form { display: flex; flex-direction: column; gap: 10px; }
    form > div { display: flex; gap: 10px; align-items: center; }
  `;

  return (
    <>
      <header id="header-placeholder"></header>
      <main className="site-main container">
        <div className="card">
          <h3>💼 Wallet</h3>
          <p className="small">Balance: <strong>PKR <span id="wallet-balance">--</span></strong></p>
          
          <div className="tabs" id="wallet-tabs">
            <button className="tab-btn active" data-tab="transaction-history">Transaction History</button>
            <button className="tab-btn" data-tab="deposit-funds">Deposit Funds</button>
            <button className="tab-btn" data-tab="withdraw-funds">Withdraw Funds</button>
          </div>
          
          <div id="transaction-history" className="tab-content active">
            <h4>Transaction History</h4>
            <table id="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody id="transaction-tbody">
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Loading...</td></tr>
              </tbody>
            </table>
          </div>

          <div id="deposit-funds" className="tab-content">
            <h4>💳 Top Up Wallet</h4>
            <form id="topup-form">
              <div>
                <input id="topup-amount" placeholder="Amount (PKR)" type="number" min="1" step="1" required/>
                <button type="submit">Top Up</button>
              </div>
            </form>
          </div>

          <div id="withdraw-funds" className="tab-content">
            <h4>🏦 Request Withdrawal</h4>
            <p className="small">Withdraw to your linked bank or PayPal account.</p>
            <form id="withdraw-form">
              <input id="withdraw-amount" placeholder="Amount (PKR)" type="number" min="1" step="1" required/>
              <select id="withdraw-method" required>
                <option value="">Select withdrawal method</option>
                <option value="bank">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="manual">Manual</option>
              </select>
              <input id="withdraw-details" placeholder="Bank account or PayPal email" type="text" required/>
              <button type="submit">Request Withdrawal</button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};
export default WalletBuyer;

