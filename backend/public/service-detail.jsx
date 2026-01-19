import React, { useState, useEffect } from 'react';

const ServiceDetail = () => {
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
    <div className="card">
      <h3 id="svcTitle">Subscribers — 1,000</h3>
      <p className="small">High-quality subscribers from verified profiles that meet platform policies. Manual delivery and tracking provided.</p>
      <div style="margin-top:12px"><p><strong>Price:</strong> $9.99</p><a href="/checkout.html" className="btn-primary">Launch Campaign</a></div>
    </div>

    <div className="card" style="margin-top:12px">
      <h4>Details & Requirements</h4>
      <ul style="color:var(--muted);margin-top:8px;line-height:1.6">
        <li>Provide a valid public profile URL.</li>
        <li>Delivery timeframe: 24 - 72 hours.</li>
        <li>Manual review and support available after purchase.</li>
      </ul>
    </div>

    <div className="card" style="margin-top:12px">
      <h4>Frequently Asked Questions</h4>
      <p className="small">Refunds are handled on a case-by-case basis after proof and logs are reviewed by the admin team.</p>
    </div>

  </main>
  <footer style="text-align:center;padding:20px;color:rgba(255,255,255,0.6);">© TimelinePlus 2026</footer>
  <script src="/js/site.js"></script>
    </>
  );
};

export default ServiceDetail;
