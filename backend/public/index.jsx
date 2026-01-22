const Index = () => {
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
    #error { color: #d32f2f; background: #ffebee; padding: 12px; border-radius: 5px; margin-bottom: 15px; font-size: 14px; display: none; }
  `;
  return (
    <>
      <style>{styles}</style>

      <script>
        const token = localStorage.getItem('token');
        if(token){
          const role = localStorage.getItem('role')||'buyer';
          const dest = (role==='freelancer')?'/freelancer-dashboard/':'/dashboard-buyer/';
          window.location.replace(dest);
        }
      </script>

      <header className="header">
        <div className="nav">
          <div className="brand">
            <img src="/logo.png" alt="TimelinePlus"/>
            <span className="label">TimelinePlus</span>
          </div>
        </div>
      </header>

      <div className="content">
        <form id="loginForm">
          <h2>Login</h2>

          <div id="error"></div>

          <div className="role-selector">
            <div className="role-pill active" data-role="freelancer">Freelancer</div>
            <div className="role-pill" data-role="buyer">Buyer</div>
          </div>

          <div className="input-box">
            <input type="text" id="username" placeholder="Username or Email" required/>
            <i className="ri-user-fill"></i>
          </div>
          <div className="input-box">
            <input type="password" id="password" placeholder="Password" required/>
            <i className="ri-eye-off-fill toggle-password" id="togglePassword"></i>
          </div>
          <div className="remember">
            <label>
              <input type="checkbox" id="rememberMe"/> Remember me
            </label>
            <a href="/forgot/">Forgot Password?</a>
          </div>
          <button type="submit" id="loginBtn">Login</button>
          <div className="button">
            <a href="/api/auth/oauth/google"><i className="ri-google-fill"></i> Google</a> — <a href="/api/auth/oauth/facebook"><i className="ri-facebook-fill"></i> Facebook</a>
          </div>
          <p>New? <a href="/register/">Create an account</a></p>
        </form>
      </div>

      <script src="/js/site.js"></script>
      <script src="/js/auth.js"></script>
    </>
  );
};
export default Index;
