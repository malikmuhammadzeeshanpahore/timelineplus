import React, { useState, useEffect } from 'react';

const Index = () => {
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
  <div className="content">
    <form id="loginForm">
      <h2>Login</h2>

      <div className="role-selector" style="margin-top:14px;">
        <div className="role-pill" data-role="freelancer">Freelancer</div>
        <div className="role-pill" data-role="buyer">Buyer</div>
      </div>

      <div className="input-box">
        <input type="text" name="username" placeholder="Username or Email" required />
        <i className="ri-user-fill"></i>
      </div>
      <div className="input-box">
        <input type="password" id="password" name="password" placeholder="Password" required autocomplete="new-password" />
        <i className="ri-eye-off-fill toggle-password" id="togglePassword"></i>
      </div>
      <div className="remember">
        <label><input type="checkbox" /> Remember me</label>
        <a href="/forgot.html">Forgot Password?</a>
      </div>
      <button type="submit" className="btnn">Login</button>
      <div className="button">
        <a href="/api/auth/oauth/google"><i className="ri-google-fill"></i> Google</a> &nbsp;--&nbsp; <a href="/api/auth/oauth/facebook"><i className="ri-facebook-fill"></i> Facebook</a>
      </div>
      <p style="text-align:center;margin-top:18px;color:rgba(255,255,255,0.8)">New? <a href="/register.html">Create an account</a></p>
    </form>
  </div>

  <script src="/js/site.js"></script>
  <script src="/js/auth.js"></script>
    </>
  );
};

export default Index;
