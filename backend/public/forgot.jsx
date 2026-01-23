import React, { useState } from 'react';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${window.location.origin}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setMessage('<i class="fas fa-check-circle" style="margin-right: 5px; color: #4caf50;"></i> Password reset link sent to your email');
        setEmail('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .nav { padding: 15px 0; display: flex; align-items: center; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { height: 40px; }
    .label { font-weight: bold; color: #667eea; }
    .navbar { display: flex; gap: 20px; flex: 1; margin-left: 40px; }
    .navbar a { text-decoration: none; color: #333; }
    .navbar a:hover { color: #667eea; }
    .right { margin-left: auto; }
    .site-main { padding: 40px 20px; }
    .content { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h2 { color: #667eea; margin-bottom: 20px; }
    .input-box { position: relative; margin-bottom: 15px; }
    input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
    input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    button { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
    button:hover { background: #5568d3; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .message { padding: 12px; border-radius: 5px; margin-bottom: 15px; }
    .success { background: #d1e7dd; color: #0f5132; }
    .error { background: #f8d7da; color: #842029; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <header className="header">
        <div className="nav" style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px' }}>
          <div className="brand">
            <img src="/logo.png" alt="TimelinePlus" />
            <span className="label">TimelinePlus</span>
          </div>
          <nav className="navbar" aria-label="Main navigation">
            <a href="/services/"><i className="ri-briefcase-4-line"></i> Services</a>
            <a href="/support/"><i className="ri-question-line"></i> Support</a>
          </nav>
          <div className="right" style={{ marginLeft: 'auto' }}><div id="userPanel"></div></div>
        </div>
      </header>
      <main className="site-main">
        <div className="content">
          <h2>Reset Password</h2>
          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <i className="ri-mail-fill"></i>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </main>
      <script src="/js/site.js"></script>
    </>
  );
};

export default Forgot;
