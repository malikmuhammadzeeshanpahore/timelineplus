import React, { useState, useEffect } from 'react';

const Profile = () => {
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
        <h3>Contributor Profile</h3>
        <p className="small">Account details and settings.</p>
        <div style="margin-top:12px">
          <p><strong>Name:</strong> <span id="pf-name">—</span></p>
          <p><strong>Username:</strong> <span id="pf-username">—</span></p>
          <p><strong>Email:</strong> <span id="pf-email">—</span></p>
          <p><strong>Age:</strong> <span id="pf-age">—</span></p>
          <p><strong>Gender:</strong> <span id="pf-gender">—</span></p>
          <p><strong>City:</strong> <span id="pf-city">—</span></p>
          <p><strong>Current Balance:</strong> $<span id="pf-balance">—</span></p>
        </div>
        <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px">
          <a className="btn-primary" href="/orders.html"><i className="ri-history-line"></i> History</a>
          <a className="btn-primary" href="/withdrawal-details.html"><i className="ri-wallet-line"></i> Withdrawal Account Details</a>
          <a className="btn-primary" href="/profile.html"><i className="ri-user-line"></i> Account Details</a>
          <a className="btn-primary" href="/download.html"><i className="ri-smartphone-line"></i> Download App</a>
          <button className="btn-primary" id="btnLogout"><i className="ri-logout-box-line"></i> Logout</button>
          <button className="btn-outline" id="btnEditProfile" style={{ marginLeft: '6px' }}>Edit Profile</button>
        </div>
      </div>

      <div className="card" style="margin-top:12px">
        <h3>Social Accounts</h3>
        <p className="small">Link your Google and Facebook accounts for quick sign-in and integrations.</p>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <button className="btn-outline" id="link-google"><i className="ri-google-line"></i> Link Google</button>
          <button className="btn-outline" id="link-facebook"><i className="ri-facebook-line"></i> Link Facebook</button>
          <button className="btn-outline" id="refresh-social"><i className="ri-refresh-line"></i> Refresh</button>
        </div>
        <div id="socialList" style="margin-top:10px" className="small"></div>
      </div>
    </div>
  </main>

  <footer style="text-align:center;padding:20px;color:rgba(255,255,255,0.6);">© TimelinePlus 2026</footer>
  <script src="/js/site.js"></script>
  <script src="/js/role-protect.js"></script>
  <script src="/js/profile.js"></script>
    </>
  );
};

export default Profile;
