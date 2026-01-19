import React, { useState, useEffect } from 'react';

const Forgot = () => {
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
      <nav className="navbar" aria-label="Main navigation"><a href="/services.html"><i className="ri-briefcase-4-line"></i><span className="nav-label">Services</span></a><a href="/support.html"><i className="ri-question-line"></i><span className="nav-label">Support</span></a></nav>
      <div className="right" style="margin-left:auto"><div id="userPanel"></div></div>
    </div>
  </header>
  <main className="site-main">
  <div className="content">
    <h2>Reset Password</h2>
    <form id="forgotForm">
      <div className="input-box">
        <input type="email" name="email" placeholder="Your email" required />
        <i className="ri-mail-fill"></i>
      </div>
      <button className="btnn" type="submit">Send Reset Link</button>
    </form>
  </div>
  </main>
  <script src="/js/site.js"></script>
  <script>
    document.getElementById('forgotForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      alert('Forgot password flow not connected yet.');
    });
  </script>
    </>
  );
};

export default Forgot;
