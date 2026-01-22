import React, { useState, useEffect } from 'react';

const Support = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'buyer');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'buyer';
    setToken(token);
    setRole(role);

    // Attach event listener for ticket form submission
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
      const handler = (e) => {
        e.preventDefault();
        if (typeof showToast === 'function') {
          showToast('Ticket submitted — we will respond soon');
        } else {
          alert('Ticket submitted — we will respond soon');
        }
        e.target.reset();
      };
      ticketForm.addEventListener('submit', handler);
      return () => ticketForm.removeEventListener('submit', handler);
    }
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
<main className="site-main"><div className="grid"><div>
<div className="card"><h3>Support Tickets</h3><p className="small">Open a ticket and our support team will respond within 24-48 hours.</p>
<form id="ticketForm" style="margin-top:12px"><div className="input-box"><input type="text" name="subject" placeholder="Subject" required/></div><div className="input-box"><input type="text" name="order" placeholder="Order # (optional)"/></div><div style="margin-top:8px"><textarea name="message" placeholder="Describe your issue" style="width:100%;height:120px;border-radius:8px;padding:10px;background:rgba(255,255,255,0.03);color:#fff;border:1px solid rgba(255,255,255,0.03)"></textarea></div><div style="margin-top:12px"><button className="btnn" type="submit">Open Ticket</button></div></form></div>
<div className="card" style="margin-top:12px"><h4>Recent Tickets</h4><table className="table"><tbody><tr><td>#TCK-204</td><td>Order delay</td><td><span className="status success">Answered</span></td></tr><tr><td>#TCK-219</td><td>Refund request</td><td><span className="status pending">Open</span></td></tr></tbody></table></div>
</div>
<aside><div className="card"><h3>Help Center</h3><p className="small">FAQs and common issues.</p><ul style="margin-top:8px;color:var(--muted)"><li>How do refunds work?</li><li>How to submit proof?</li><li>Dispute and chargeback policy</li></ul></div></aside></div></main>
<footer style="text-align:center;padding:20px;color:rgba(255,255,255,0.6);">© TimelinePlus 2026</footer>
{/* <script src="/js/site.js"></script> */}
    </>
  );
};

export default Support;
