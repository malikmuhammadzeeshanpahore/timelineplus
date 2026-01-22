import React, { useState, useEffect } from 'react';

const Header = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'buyer');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'buyer';
    setToken(token);
    setRole(role);

    // Load inline scripts from HTML if any
  }, []);

  const styles = `

    #header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    #header h1 {
      margin: 0;
      font-size: 24px;
    }

    #header nav {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    #header nav a, #header nav button {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 5px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
    }

    #header nav a:hover, #header nav button:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    #header .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #header .user-menu {
      position: relative;
    }

    #header .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      color: #333;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      display: none;
      z-index: 1001;
      margin-top: 5px;
    }

    #header .dropdown.show {
      display: block;
    }

    #header .dropdown a {
      display: block;
      color: #333;
      padding: 10px 15px;
      border: none;
      background: white;
      text-decoration: none;
      border-radius: 0;
      width: 100%;
      text-align: left;
    }

    #header .dropdown a:hover {
      background: #f0f0f0;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 2000;
      justify-content: center;
      align-items: center;
    }

    .modal-overlay.show {
      display: flex;
    }

    .modal {
      background: white;
      border-radius: 10px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
    }

    .modal h2 {
      color: #667eea;
      margin-bottom: 20px;
    }

    .modal button {
      background: #667eea;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 10px 5px 10px 0;
    }

    .modal button:hover {
      background: #764ba2;
    }

    .modal button.secondary {
      background: #6c757d;
    }

    .modal button.secondary:hover {
      background: #5a6268;
    }
  
  `;

useEffect(() => {
  const initializeHeader = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/register/';
      return;
    }

    try {
      const response = await fetch(`${window.location.origin}/api/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        window.location.href = '/register/';
        return;
      }

      const data = await response.json();
      setRole(data.user.role || 'freelancer');
    } catch (error) {
      console.error('Error initializing header:', error);
      localStorage.removeItem('token');
      window.location.href = '/register/';
    }
  };

  initializeHeader();
}, []);

return (
  <header id="header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 1000 }}>
    <style dangerouslySetInnerHTML={{ __html: styles }} />
    <h1>⏱️ TimelinePlus</h1>
    <nav id="navMenu" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}></nav>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span id="userDisplay">Loading...</span>
      <div style={{ position: 'relative' }}>
        <button onClick={() => { const el = document.getElementById('userDropdown'); el && el.classList.toggle('show'); }} style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>👤</button>
        <div id="userDropdown" style={{ position: 'absolute', top: '100%', right: 0, background: 'white', color: '#333', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minWidth: '200px', display: 'none', zIndex: 1001, marginTop: '5px' }}>
          <a href="#profile" style={{ display: 'block', color: '#333', padding: '10px 15px', background: 'white', textDecoration: 'none', width: '100%', textAlign: 'left' }}>Profile</a>
          <a href="#settings" style={{ display: 'block', color: '#333', padding: '10px 15px', background: 'white', textDecoration: 'none', width: '100%', textAlign: 'left' }}>Settings</a>
          <a href="#logout" onClick={logout} style={{ display: 'block', color: '#333', padding: '10px 15px', background: 'white', textDecoration: 'none', width: '100%', textAlign: 'left' }}>Logout</a>
        </div>
      </div>
    </div>
  </header>
);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('adminCode');
  window.location.href = '/register/';
}
};

export default Header;
