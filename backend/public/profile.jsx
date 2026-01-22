import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [name, setName] = useState('—');
  const [username, setUsername] = useState('—');
  const [email, setEmail] = useState('—');
  const [age, setAge] = useState('—');
  const [gender, setGender] = useState('—');
  const [city, setCity] = useState('—');
  const [balance, setBalance] = useState('—');
  const [socialAccounts, setSocialAccounts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/register/';
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '—');
          setUsername(data.username || '—');
          setEmail(data.email || '—');
          setAge(data.age || '—');
          setGender(data.gender || '—');
          setCity(data.city || '—');
          setBalance((data.balance / 100).toFixed(2));
          setSocialAccounts(data.socialAccounts || []);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const handleEditProfile = () => {
    alert('Edit profile feature coming soon');
  };

  const handleLinkGoogle = () => {
    window.location.href = '/api/auth/oauth/google';
  };

  const handleLinkFacebook = () => {
    window.location.href = '/api/auth/oauth/facebook';
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .nav { padding: 15px 0; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { height: 40px; }
    .label { font-weight: bold; color: #667eea; }
    .navbar { display: flex; gap: 20px; flex: 1; margin-left: 40px; }
    .navbar a { text-decoration: none; color: #333; display: flex; align-items: center; gap: 8px; }
    .navbar a:hover { color: #667eea; }
    .right { margin-left: auto; }
    .site-main { padding: 40px 20px; }
    .content { max-width: 800px; margin: 0 auto; }
    .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .card h3 { color: #667eea; margin-bottom: 10px; }
    .card .small { color: #666; font-size: 14px; margin-bottom: 15px; }
    .card p { margin: 8px 0; }
    .card strong { color: #333; }
    .btn-primary { padding: 10px 16px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary:hover { background: #5568d3; }
    .btn-outline { padding: 10px 16px; background: transparent; color: #667eea; border: 2px solid #667eea; border-radius: 5px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
    .btn-outline:hover { background: #667eea; color: white; }
    footer { text-align: center; padding: 20px; color: rgba(0,0,0,0.6); background: #f5f5f5; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <header className="header">
        <div className="nav" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '15px 20px' }}>
          <div className="brand">
            <img src="/logo.png" alt="TimelinePlus" />
            <span className="label">TimelinePlus</span>
          </div>
          <nav className="navbar" aria-label="Main navigation">
            <a href="/services/"><i className="ri-briefcase-4-line"></i><span className="nav-label">Services</span></a>
            <a href="/orders/"><i className="ri-shopping-cart-line"></i><span className="nav-label">Active Campaigns</span></a>
            <a href="/support/"><i className="ri-question-line"></i><span className="nav-label">Support</span></a>
          </nav>
          <div className="right" style={{ marginLeft: 'auto' }}><div id="userPanel"></div></div>
        </div>
      </header>

      <main className="site-main">
        <div className="content">
          <div className="card">
            <h3>Contributor Profile</h3>
            <p className="small">Account details and settings.</p>
            <div style={{ marginTop: '12px' }}>
              <p><strong>Name:</strong> <span>{name}</span></p>
              <p><strong>Username:</strong> <span>{username}</span></p>
              <p><strong>Email:</strong> <span>{email}</span></p>
              <p><strong>Age:</strong> <span>{age}</span></p>
              <p><strong>Gender:</strong> <span>{gender}</span></p>
              <p><strong>City:</strong> <span>{city}</span></p>
              <p><strong>Current Balance:</strong> ${balance}</p>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <a className="btn-primary" href="/orders/" style={{ textDecoration: 'none' }}><i className="ri-history-line"></i> History</a>
              <a className="btn-primary" href="/withdrawal-details/" style={{ textDecoration: 'none' }}><i className="ri-wallet-line"></i> Withdrawal Details</a>
              <button className="btn-primary" onClick={handleEditProfile}><i className="ri-edit-line"></i> Edit Profile</button>
              <button className="btn-primary" onClick={handleLogout}><i className="ri-logout-box-line"></i> Logout</button>
            </div>
          </div>

          <div className="card">
            <h3>Social Accounts</h3>
            <p className="small">Link your Google and Facebook accounts for quick sign-in.</p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn-outline" onClick={handleLinkGoogle}><i className="ri-google-line"></i> Link Google</button>
              <button className="btn-outline" onClick={handleLinkFacebook}><i className="ri-facebook-line"></i> Link Facebook</button>
            </div>
            {socialAccounts.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                <p>Connected accounts: {socialAccounts.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer>© TimelinePlus 2026</footer>
      <script src="/js/site.js"></script>
    </>
  );
};

export default Profile;
