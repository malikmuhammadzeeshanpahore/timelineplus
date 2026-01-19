import React, { useState, useEffect } from 'react';

const Register = () => {
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
      <nav className="navbar" aria-label="Main navigation"></nav>
      <div className="right">
        <div id="userPanel"></div>
      </div>
    </div>
  </header>
  <div className="content">
    <form id="registerForm">
      <h2>Create Account</h2>

      <div className="role-selector" style="margin-top:12px;">
        <div className="role-pill" data-role="freelancer">Freelancer</div>
        <div className="role-pill" data-role="buyer">Buyer</div>
      </div>

      <div className="input-box">
        <input type="text" name="username" placeholder="Username" required />
        <i className="ri-user-fill"></i>
      </div>
      <div className="input-box">
        <input type="email" name="email" placeholder="Email" required />
        <i className="ri-mail-fill"></i>
      </div>
      <div className="input-box">
        <input type="password" id="passwordReg" name="password" placeholder="Password" required autocomplete="new-password" />
        <i className="ri-eye-off-fill toggle-password" id="togglePassword"></i>
      </div>
      <button type="submit" className="btnn">Register</button>
      <div className="button" style="margin-top:12px"><a href="/api/auth/oauth/google"><i className="ri-google-fill"></i> Google</a> &nbsp;--&nbsp; <a href="/api/auth/oauth/facebook"><i className="ri-facebook-fill"></i> Facebook</a></div>
      <p style="text-align:center;margin-top:18px;color:rgba(255,255,255,0.8)">Already have an account? <a href="/login.html">Login</a></p>
    </form>
  </div>

  <script src="/js/site.js"></script>
  <script src="/js/auth.js"></script>
    </>
  );
};

export default Register;
