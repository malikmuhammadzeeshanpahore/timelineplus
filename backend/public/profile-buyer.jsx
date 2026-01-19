import React, { useState, useEffect } from 'react';

const ProfileBuyer = () => {
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
    <div className="right" style="margin-left:auto"><a href="/orders.html" className="action">Orders</a><a href="/wallet-buyer.html" className="action">Wallet</a></div>
  </div>
</header>
<main className="site-main"><div className="grid"><div>
<div className="card"><h3>Account</h3><p className="small">buyer@example.com • Member since 2024</p>
<p style="margin-top:12px">Name: John Buyer<br/>Country: Pakistan<br/>Balance: <strong>$<span className="wallet-balance">--</span></strong></p></div>
<div className="card" style="margin-top:12px"><h3>Activity</h3><p className="small">Recent activity and quick links.</p><ul style="color:var(--muted);margin-top:8px"><li>Purchased Starter Pack — #ORD-221</li><li>Opened ticket #TCK-204</li></ul></div>
</div>
<aside>
<div className="card"><h3>Security</h3><p className="small">Two-factor: Not enabled</p><div style="margin-top:8px"><a className="btn-primary" href="#">Enable 2FA</a></div></div>
</aside>
</div></main>
<footer style="text-align:center;padding:20px;color:rgba(255,255,255,0.6);">© TimelinePlus 2026</footer>
<script src="/js/site.js"></script>
<script src="/js/wallet.js"></script>
    </>
  );
};

export default ProfileBuyer;
