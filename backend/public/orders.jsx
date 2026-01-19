import React, { useState, useEffect } from 'react';

const Orders = () => {
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
  <main className="site-main"><div className="card"><h3>Orders</h3><p className="small">Your recent orders and their statuses.</p>
  <table className="table"><thead><tr><th>Order</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead>
  <tbody>
    <tr><td>#ORD-1041</td><td>Subscribers (1k)</td><td>$9.99</td><td><span className="status success">Completed</span></td></tr>
    <tr><td>#ORD-1105</td><td>Watch Time (10k)</td><td>$29.99</td><td><span className="status pending">Pending</span></td></tr>
  </tbody></table>
  </div></main>
  <footer style="text-align:center;padding:20px;color:rgba(255,255,255,0.6);">© TimelinePlus 2026</footer>
  <script src="/js/site.js"></script>
  <script src="/js/role-protect.js"></script>
    </>
  );
};

export default Orders;
