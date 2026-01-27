const Deposit = () => {
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    
    /* Header Styling */
    #headerContainer { position: sticky; top: 0; z-index: 1000; }
    #headerContainer header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    #headerContainer .nav { padding: 16px 20px; display: flex; align-items: center; max-width: 1400px; margin: 0 auto; gap: 20px; }
    #headerContainer .brand { display: flex; align-items: center; gap: 12px; }
    #headerContainer .brand img { height: 40px; }
    #headerContainer .brand .logo-text { font-weight: 700; color: white; font-size: 18px; letter-spacing: 0.5px; }
    #headerContainer .nav-menu { display: flex; gap: 20px; flex: 1; }
    #headerContainer .nav-menu a { color: white; text-decoration: none; font-weight: 500; transition: all 0.3s; padding: 8px 12px; border-radius: 6px; }
    #headerContainer .nav-menu a:hover { background: rgba(255,255,255,0.2); }
    #headerContainer .nav-actions { margin-left: auto; display: flex; gap: 10px; align-items: center; }
    #headerContainer .nav-actions button { padding: 8px 14px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; }
    #headerContainer .nav-actions button:hover { background: rgba(255,255,255,0.3); transform: translateY(-1px); }
    #headerContainer .user-profile { display: flex; align-items: center; gap: 10px; color: white; }
    #headerContainer .user-profile img { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); }
    
    .container { max-width: 900px; margin: 40px auto; padding: 20px; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 30px; }
    .card h2 { color: #667eea; font-size: 22px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
    .card .subtitle { color: #999; font-size: 14px; margin-bottom: 20px; }
    
    .tabs { display: flex; gap: 0; border-bottom: 2px solid #e0e0e0; margin-bottom: 20px; }
    .tab-btn { background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #999; border-bottom: 3px solid transparent; transition: all 0.3s; font-size: 15px; }
    .tab-btn.active { color: #667eea; border-bottom-color: #667eea; }
    .tab-btn:hover { color: #667eea; }
    
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px; }
    .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
    
    .btn { padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 14px; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102,126,234,0.4); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .alert { padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; }
    .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .alert-error { background: #f8d7da; color: #842029; border: 1px solid #f5c6cb; }
    .alert-info { background: #cfe2ff; color: #084298; border: 1px solid #b6d4fe; }
    
    .history-item { padding: 15px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .history-item .amount { font-size: 16px; font-weight: 700; color: #667eea; }
    .history-item .meta { font-size: 12px; color: #999; margin-top: 4px; }
    .history-item .status { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status-pending { background: #fff3cd; color: #664d03; }
    .status-approved { background: #d1e7dd; color: #0f5132; }
    .status-rejected { background: #f8d7da; color: #842029; }
    
    @media (max-width: 1023px) { .card { padding: 20px; } }
    @media (max-width: 768px) { #headerContainer .nav { flex-wrap: wrap; } #headerContainer .nav-menu { flex-direction: column; gap: 0; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div id="headerContainer"></div>
      
      <div className="container">
        <div className="card">
          <h2><i className="fas fa-wallet"></i> Deposit Funds</h2>
          <p className="subtitle">Add balance to your wallet to start campaigns</p>
          
          <div className="tabs">
            <button className="tab-btn active" data-tab="deposit-form">New Deposit</button>
            <button className="tab-btn" data-tab="deposit-history">Deposit History</button>
          </div>
          
          <div id="deposit-form" className="tab-content active">
            <div id="depositMessage"></div>
            <form id="depositForm">
              <div className="form-group">
                <label>Sender Account Name *</label>
                <input type="text" name="senderName" placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Sender Account Number *</label>
                <input type="text" name="senderAccount" placeholder="e.g., 03001234567 or Account #" required />
              </div>
              <div className="form-group">
                <label>Sender Account Type *</label>
                <select name="senderType" required>
                  <option value="">Select payment method</option>
                  <option value="jazzCash">JazzCash</option>
                  <option value="easyPaisa">EasyPaisa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Transaction ID / Reference Number *</label>
                <input type="text" name="transactionId" placeholder="e.g., TXN-123456789" required />
              </div>
              <div className="form-group">
                <label>Amount (PKR) *</label>
                <input type="number" name="amount" placeholder="e.g., 5000" min="100" required />
              </div>
              <div className="form-group">
                <label>Proof Screenshot *</label>
                <input type="file" name="proof" accept="image/*" required />
              </div>
              <button type="submit" className="btn" id="submitBtn">Submit Deposit Request</button>
            </form>
          </div>
          
          <div id="deposit-history" className="tab-content">
            <div id="depositHistoryContainer"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Deposit;

setTimeout(() => {
  fetch('/header.html').then(r => r.text()).then(html => {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.getElementById('headerContainer').innerHTML = div.querySelector('body').innerHTML;
    const script = document.createElement('script');
    script.src = '/js/header-init.js';
    document.body.appendChild(script);
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
      if (tabId === 'deposit-history') loadDepositHistory();
    });
  });

  const form = document.getElementById('depositForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Not authenticated - please login again');
        }
        
        const formData = new FormData(form);
        const amount = Number(formData.get('amount')) * 100; // Convert PKR to cents
        const method = formData.get('senderType') || 'bank';
        
        console.log('📤 [DEPOSIT] Submitting deposit:', { amount, method });
        showInfo('Creating deposit request...');
        
        const response = await fetch('/api/deposits/request', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount, method })
        });
        
        console.log('📥 [DEPOSIT] API Response:', { status: response.status, ok: response.ok });
        const data = await response.json();
        console.log('📋 [DEPOSIT] Response data:', data);
        
        const msgDiv = document.getElementById('depositMessage');
        if (response.ok) {
          console.log('✅ [DEPOSIT] Success:', data);
          showSuccess('✓ Deposit request created! Admin will review it soon.');
          form.reset();
          setTimeout(() => loadDepositHistory(), 500);
        } else {
          const errorMsg = data.error || 'Error submitting deposit';
          console.error('❌ [DEPOSIT] Error:', errorMsg);
          showError(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error('⚠️ [DEPOSIT] Exception:', err.message);
        showError(`Error: ${err.message}`);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Deposit Request';
      }
    });
  }

  function loadDepositHistory() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('depositHistoryContainer');
    
    console.log('📋 [HISTORY] Fetching deposit history...');
    fetch('/api/deposits/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => {
      console.log('📥 [HISTORY] Response status:', r.status);
      return r.json();
    }).then(data => {
      console.log('📊 [HISTORY] Data received:', data);
      const deposits = Array.isArray(data) ? data : data.deposits || [];
      console.log('📝 [HISTORY] Deposits count:', deposits.length);
      
      if (deposits.length > 0) {
        container.innerHTML = deposits.map(d => `
          <div class="history-item">
            <div>
              <div class="amount">PKR ${(d.amount / 100).toFixed(2)}</div>
              <div class="meta">${new Date(d.createdAt).toLocaleDateString('en-PK')} • ${d.method}</div>
            </div>
            <span class="status status-${d.status.toLowerCase()}">${d.status}</span>
          </div>
        `).join('');
        console.log('✅ [HISTORY] Rendered', deposits.length, 'deposits');
      } else {
        container.innerHTML = '<div class="alert alert-info">No deposits yet.</div>';
        console.log('ℹ️ [HISTORY] No deposits found');
      }
    }).catch(err => {
      console.error('❌ [HISTORY] Error:', err);
      container.innerHTML = `<div class="alert alert-error">Error: ${err.message}</div>`;
      showError(`Failed to load history: ${err.message}`);
    });
  }
}, 100);

