import React, { useState, useEffect } from 'react';

const WalletBuyer = () => {
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
    <div className="right" style="margin-left:auto"><a href="/orders.html" className="action">Orders</a><a href="/profile-buyer.html" className="action">Profile</a></div>
  </div>
</header>
<main className="site-main container"><div className="card"><h3>Wallet</h3><p className="small">Balance: <strong>$<span id="wallet-balance">--</span></strong></p>
<div style="margin-top:12px"><h4>Top up</h4><form id="topup-form"><input id="topup-amount" placeholder="Amount" type="number" min="1" step="0.01"/><button className="btn-primary">Top up</button></form></div>
<div style="margin-top:12px"><h4>Withdraw</h4><p className="small">Withdraw to your linked bank or Payoneer/PayPal.</p>
<form id="withdraw-form"><input id="withdraw-amount" placeholder="Amount" type="number" min="1" step="0.01"/><select id="withdraw-method"><option value="manual">Manual</option><option value="paypal">PayPal</option><option value="bank">Bank</option></select><input id="withdraw-details" placeholder="Details (bank or PayPal email)" type="text"/><button className="btn-outline">Request Withdraw</button></form></div></div></main>
<script src="/js/wallet.js"></script>
<script src="/js/site.js"></script>
<script src="/js/role-protect.js"></script>
    </>
  );
};

export default WalletBuyer;
