import React, { useState, useEffect } from 'react';

const Services = () => {
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
      <div className="brand"><img src="/logo.png" alt="logo"/><span className="label">TimelinePlus</span></div>
      <nav className="navbar" aria-label="Main navigation">
        <a href="/dashboard"><i className="ri-dashboard-2-line"></i><span className="nav-label">Dashboard</span></a>
        <a href="/services"><i className="ri-briefcase-4-line"></i><span className="nav-label">Services</span></a>
        <a href="/orders"><i className="ri-shopping-cart-line"></i><span className="nav-label">Campaigns</span></a>
        <a href="/wallet"><i className="ri-wallet-line"></i><span className="nav-label">Wallet</span></a>
        <a href="/support"><i className="ri-question-line"></i><span className="nav-label">Support</span></a>
      </nav>
      <div className="right">
        <div id="userPanel"></div>
      </div>
    </div>
  </header>

  <main className="site-main">
    <div className="grid">
      <div>
        <div className="card">
          <h3>Popular Services</h3>
          <p className="small">High-quality manual services delivered by verified freelancers.</p>
          <div className="service-grid">
            <div className="service-item"><h4>Subscribers</h4><p>Real subscriptions from vetted channels.</p><div style="margin-top:12px"><a href="/service-detail.html?slug=subscribers" className="btn-primary">Launch Campaign</a></div></div>
            <div className="service-item"><h4>Watch Time</h4><p>Controlled watch sessions for YouTube campaigns.</p><div style="margin-top:12px"><a href="/service-detail.html?slug=watchtime" className="btn-primary">Launch Campaign</a></div></div>
            <div className="service-item"><h4>Likes</h4><p>Engaged likes from active profiles.</p><div style="margin-top:12px"><a href="/service-detail.html?slug=likes" className="btn-primary">Launch Campaign</a></div></div>
            <div className="service-item"><h4>Followers</h4><p>Instagram followers with profile checks.</p><div style="margin-top:12px"><a href="/service-detail.html?slug=followers" className="btn-primary">Launch Campaign</a></div></div>
            <div className="service-item"><h4>TikTok Views</h4><p>Fast-view campaigns for short-forms.</p><div style="margin-top:12px"><a href="/service-detail.html?slug=tiktok-views" className="btn-primary">Launch Campaign</a></div></div>
            <div className="service-item"><h4>WhatsApp Joins</h4><p>Real joins to your public channels.</p><div style="margin-top:12px"><a href="/service-detail.html?slug=whatsapp-joins" className="btn-primary">Launch Campaign</a></div></div>
          </div>
        </div>

        <div className="card" style="margin-top:14px">
          <h3>Featured Packages</h3>
          <p className="small">Save with bundles curated for different needs.</p>
          <div style="margin-top:12px">
            <div className="card" style="margin-bottom:10px;padding:12px;background:rgba(255,255,255,0.02)"><strong>Starter Pack</strong> — 1k Subscribers + 10k Watch Time — <span className="pill">$29.99</span> <a href="/service-detail.html?slug=starter-pack" className="btn-primary" style="float:right">Launch Campaign</a></div>
            <div className="card" style="margin-bottom:10px;padding:12px;background:rgba(255,255,255,0.02)"><strong>Growth Pack</strong> — 5k Subscribers + 50k Watch Time — <span className="pill">$119.99</span> <a href="/service-detail.html?slug=growth-pack" className="btn-primary" style="float:right">Launch Campaign</a></div>
          </div>
        </div>

      </div>

      <aside>
        <div className="card">
          <h3>Wallet</h3>
          <p className="small">Balance: <strong>$<span className="wallet-balance">--</span></strong></p>
          <div style="margin-top:8px"><a className="btn-primary" href="/invoice.html">Top up</a></div>
        </div>

        <div className="card" style="margin-top:12px">
          <h3>Recent Orders</h3>
          <table className="table"><thead><tr><th>Order</th><th>Status</th></tr></thead><tbody><tr><td>#ORD-1041</td><td><span className="status success">Completed</span></td></tr><tr><td>#ORD-1105</td><td><span className="status pending">Pending</span></td></tr></tbody></table>
        </div>
      </aside>
    </div>
  </main>

  <footer style="text-align:center;padding:20px;color:rgba(255,255,255,0.6);">© TimelinePlus 2026 • <a href="/about.html">About</a> • <a href="/terms.html">Terms</a></footer>

  <script src="/js/site.js"></script>
  <script src="/js/auth.js"></script>
  <script src="/js/wallet.js"></script>
    </>
  );
};

export default Services;
