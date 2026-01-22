import React, { useState } from 'react';

const Index = () => {
  const [role, setRole] = useState('freelancer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${window.location.origin}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', role);
        if (rememberMe) localStorage.setItem('rememberMe', 'true');
        window.location.href = role === 'freelancer' ? '/freelancer-dashboard/' : '/dashboard-buyer/';
      } else {
        const error = await res.json();
        setError(error.message || 'Login failed');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .header { background: rgba(255,255,255,0.1); }
    .nav { padding: 15px 20px; display: flex; align-items: center; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { height: 40px; }
    .label { font-weight: bold; color: white; }
    .content { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    form { background: white; padding: 40px; border-radius: 10px; max-width: 400px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    form h2 { color: #667eea; margin-bottom: 20px; text-align: center; }
    .role-selector { display: flex; gap: 10px; margin-bottom: 20px; }
    .role-pill { flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 5px; cursor: pointer; text-align: center; font-weight: bold; transition: all 0.3s; }
    .role-pill.active { background: #667eea; color: white; border-color: #667eea; }
    .input-box { position: relative; margin-bottom: 15px; }
    .input-box input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
    .input-box input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .input-box i { position: absolute; right: 12px; top: 12px; cursor: pointer; color: #999; }
    .remember { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 14px; }
    .remember label { cursor: pointer; }
    .remember a { color: #667eea; text-decoration: none; }
    .remember a:hover { text-decoration: underline; }
    button { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; margin-top: 10px; }
    button:hover { background: #5568d3; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .button { margin: 20px 0; text-align: center; }
    .button a { color: #667eea; text-decoration: none; margin: 0 5px; }
    .button a:hover { text-decoration: underline; }
    p { text-align: center; margin-top: 15px; color: #666; }
    p a { color: #667eea; text-decoration: none; }
    p a:hover { text-decoration: underline; }
    .error { color: #d32f2f; background: #ffebee; padding: 12px; border-radius: 5px; margin-bottom: 15px; font-size: 14px; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <header className="header">
        <div className="nav">
          <div className="brand">
            <img src="/logo.png" alt="TimelinePlus" />
            <span className="label">TimelinePlus</span>
          </div>
        </div>
      </header>

      <div className="content">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>

          {error && <div className="error">{error}</div>}

          <div className="role-selector">
            <div
              className={`role-pill ${role === 'freelancer' ? 'active' : ''}`}
              onClick={() => setRole('freelancer')}
            >
              Freelancer
            </div>
            <div
              className={`role-pill ${role === 'buyer' ? 'active' : ''}`}
              onClick={() => setRole('buyer')}
            >
              Buyer
            </div>
          </div>

          <div className="input-box">
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <i className="ri-user-fill"></i>
          </div>
          <div className="input-box">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              className={`ri-${showPassword ? 'eye' : 'eye-off'}-fill`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
          <div className="remember">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {' '}Remember me
            </label>
            <a href="/forgot/">Forgot Password?</a>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="button">
            <a href="/api/auth/oauth/google"><i className="ri-google-fill"></i> Google</a> — <a href="/api/auth/oauth/facebook"><i className="ri-facebook-fill"></i> Facebook</a>
          </div>
          <p>New? <a href="/register/">Create an account</a></p>
        </form>
      </div>

      <script src="/js/site.js"></script>
    </>
  );
};

export default Index;
