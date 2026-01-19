import React, { useState, useEffect } from 'react';

const WithdrawalDetails = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'buyer');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'buyer';
    setToken(token);
    setRole(role);

    // Load inline scripts from HTML if any
  }, []);

  return (
    <>
      <header className="header">
    <div className="nav container d-flex align-items-center">
      <div className="brand"><img src="/logo.png"/><span className="label">TimelinePlus</span></div>
      <nav className="navbar" aria-label="Main navigation">
        <a href="/services.html"><i className="ri-briefcase-4-line"></i><span className="nav-label">Services</span></a>
        <a href="/orders.html"><i className="ri-shopping-cart-line"></i><span className="nav-label">Active Campaigns</span></a>
        <a href="/support.html"><i className="ri-question-line"></i><span className="nav-label">Support</span></a>
      </nav>
      <div className="right" style="margin-left:auto"><div id="userPanel"></div></div>
    </div>
  </header>

  <main className="site-main">
    <div className="content">
      <div className="card">
        <h3>Withdrawal Account Details</h3>
        <p className="small">Save your payout account details. Supported Account Types: JazzCash, EasyPaisa.</p>
        <form id="wdForm" style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
          <input id="accHolder" placeholder="Account Holder Name" />
          <select id="accType"><option value="jazzcash">JazzCash</option><option value="easypaisa">EasyPaisa</option></select>
          <input id="accNumber" placeholder="Account Number" />
          <button className="btn-primary" type="submit">Save Info</button>
        </form>
        <div id="savedMsg" style="margin-top:8px" className="small"></div>
      </div>
    </div>
  </main>
  <script src="/js/site.js"></script>
  <script src="/js/role-protect.js"></script>
  <script src="/js/withdrawal.js"></script>
    </>
  );
};

export default WithdrawalDetails;
