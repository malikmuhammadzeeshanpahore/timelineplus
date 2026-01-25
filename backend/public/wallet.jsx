const Wallet = () => {
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    
    #headerContainer { position: sticky; top: 0; z-index: 1000; }
    .container { max-width: 1000px; margin: 40px auto; padding: 20px; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 30px; }
    .card h2 { color: #667eea; font-size: 22px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
    .card .subtitle { color: #999; font-size: 14px; margin-bottom: 20px; }
    
    .balance-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
    .balance-section .balance-label { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
    .balance-section .balance-amount { font-size: 36px; font-weight: 700; margin-bottom: 20px; }
    .balance-section .balance-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; font-size: 13px; }
    
    .tabs { display: flex; gap: 0; border-bottom: 2px solid #e0e0e0; margin-bottom: 20px; }
    .tab-btn { background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #999; border-bottom: 3px solid transparent; transition: all 0.3s; font-size: 15px; }
    .tab-btn.active { color: #667eea; border-bottom-color: #667eea; }
    .tab-btn:hover { color: #667eea; }
    
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
    
    .fee-calculation { background: #f5f7ff; border: 1px solid #e0e5ff; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; }
    .fee-calculation-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .fee-calculation-row:last-child { margin-bottom: 0; border-top: 1px solid #e0e5ff; padding-top: 10px; font-weight: 600; color: #667eea; }
    
    .btn { padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 14px; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102,126,234,0.4); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .transaction-item { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
    .transaction-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .transaction-header h4 { color: #333; margin: 0; }
    .transaction-header .amount { font-weight: 700; color: #667eea; }
    .transaction-header .type-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #e8eaf6; color: #667eea; }
    .transaction-date { color: #999; font-size: 13px; }
    .transaction-status { color: #999; font-size: 13px; margin-top: 5px; }
    .transaction-status.completed { color: #28a745; }
    .transaction-status.pending { color: #ffc107; }
    
    .alert { padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; }
    .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .alert-error { background: #f8d7da; color: #842029; border: 1px solid #f5c6cb; }
    .alert-info { background: #cfe2ff; color: #084298; border: 1px solid #b6d4fe; }
    
    @media (max-width: 1023px) { .card { padding: 20px; } .balance-amount { font-size: 28px; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div id="headerContainer"></div>
      
      <div className="container">
        <div className="card">
          <h2><i className="fas fa-wallet"></i> Wallet</h2>
          <p className="subtitle">Manage your funds and transactions</p>
          
          <div className="balance-section">
            <div className="balance-label">Total Balance</div>
            <div className="balance-amount">PKR <span id="balanceAmount">0</span></div>
            <div className="balance-info">
              <div><strong id="totalDeposit">0</strong> Total Deposited</div>
              <div><strong id="totalEarned">0</strong> Total Earned</div>
              <div><strong id="totalWithdrawn">0</strong> Withdrawn</div>
            </div>
          </div>
          
          <div className="tabs">
            <button className="tab-btn active" data-tab="history">Transaction History</button>
            <button className="tab-btn" data-tab="deposit" id="depositTab">Deposit Funds</button>
            <button className="tab-btn" data-tab="withdraw" id="withdrawTab">Withdraw Funds</button>
          </div>
          
          <div id="history" className="tab-content active">
            <div id="transactionsMessage"></div>
            <div id="transactionsList"></div>
          </div>
          
          <div id="deposit" className="tab-content">
            <div className="alert alert-info"><i className="fas fa-info-circle"></i> Go to the <strong>Deposit Funds</strong> page to add balance to your wallet.</div>
            <a href="/deposit/" style="text-decoration: none;"><button type="button" className="btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i className="fas fa-plus-circle"></i> Go to Deposit</button></a>
          </div>
          
          <div id="withdraw" className="tab-content">
            <div id="withdrawMessage"></div>
            <form id="withdrawalForm">
              <div className="form-group">
                <label>Withdrawal Amount (PKR) *</label>
                <input type="number" name="amount" placeholder="e.g., 500" min="500" step="100" required />
                <small style="color: #999; font-size: 12px; margin-top: 5px; display: block;">Minimum: PKR 500</small>
              </div>
              
              <div className="form-group">
                <label>Withdrawal Method *</label>
                <select name="method" required>
                  <option value="">Select method</option>
                  <option value="jazz">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Account Number/Phone *</label>
                <input type="text" name="accountNumber" placeholder="e.g., 03001234567 or 12345678901" required />
              </div>
              
              <div className="form-group">
                <label>Account Holder Name *</label>
                <input type="text" name="accountName" placeholder="Your full name" required />
              </div>
              
              <div id="feeCalculation" className="fee-calculation" style="display: none;">
                <div className="fee-calculation-row">
                  <span>Withdrawal Amount</span>
                  <span id="feeAmount">PKR 0</span>
                </div>
                <div className="fee-calculation-row">
                  <span>Platform Fee (20%)</span>
                  <span id="feeValue">PKR 0</span>
                </div>
                <div className="fee-calculation-row">
                  <span>You Will Receive</span>
                  <span id="feeReceive">PKR 0</span>
                </div>
              </div>
              
              <button type="submit" className="btn" id="withdrawBtn">Request Withdrawal</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Wallet;

setTimeout(() => {
  fetch('/header.html').then(r => r.text()).then(html => {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.getElementById('headerContainer').innerHTML = div.querySelector('body').innerHTML;
    const script = document.createElement('script');
    script.src = '/js/header-init.js';
    document.body.appendChild(script);
  });

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Hide withdrawal tab for buyers (but not for admin/buyer)
  if (userRole === 'buyer' && !userRole.startsWith('admin/')) {
    document.getElementById('withdrawTab').style.display = 'none';
  }

  // Delegated tab switching (robust)
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn) {
      e.preventDefault();
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tabBtn.classList.add('active');
      const tabId = tabBtn.getAttribute('data-tab');
      const tabEl = document.getElementById(tabId);
      if (tabEl) tabEl.classList.add('active');
      if (tabId === 'history') loadTransactions();
    }
  });

  // Load wallet data and transactions
  loadWalletData();
  loadTransactions();

  // Fee calculation using delegated input listener
  document.addEventListener('input', (e) => {
    if (!e.target || !e.target.matches('input[name="amount"]')) return;
    const amount = Number(e.target.value);
    if (amount >= 500) {
      const fee = Math.round(amount * 0.2);
      const receive = amount - fee;
      const feeAmountEl = document.getElementById('feeAmount');
      const feeValueEl = document.getElementById('feeValue');
      const feeReceiveEl = document.getElementById('feeReceive');
      if (feeAmountEl) feeAmountEl.textContent = `PKR ${amount.toLocaleString('en-PK')}`;
      if (feeValueEl) feeValueEl.textContent = `PKR ${fee.toLocaleString('en-PK')}`;
      if (feeReceiveEl) feeReceiveEl.textContent = `PKR ${receive.toLocaleString('en-PK')}`;
      const calc = document.getElementById('feeCalculation'); if (calc) calc.style.display = 'block';
    } else {
      const calc = document.getElementById('feeCalculation'); if (calc) calc.style.display = 'none';
    }
  });

  // Withdrawal form submission
  const form = document.getElementById('withdrawalForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('withdrawBtn');
      btn.disabled = true;
      btn.textContent = 'Processing...';
      
      try {
        const formData = new FormData(form);
        const amount = Number(formData.get('amount'));
        
        if (amount < 500) {
          throw new Error('Minimum withdrawal amount is PKR 500');
        }

        const data = {
          amount: amount * 100,
          method: formData.get('method'),
          accountNumber: formData.get('accountNumber'),
          accountName: formData.get('accountName')
        };

        const response = await fetch('/api/withdrawals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          document.getElementById('withdrawMessage').innerHTML = '<div class="alert alert-success"><i className="fas fa-check-circle"></i> Withdrawal request submitted successfully! We will process it within 24-48 hours.</div>';
          form.reset();
          document.getElementById('feeCalculation').style.display = 'none';
          setTimeout(() => loadWalletData(), 1000);
        } else {
          const err = await response.json();
          throw new Error(err.error || 'Failed to process withdrawal');
        }
      } catch (err) {
        document.getElementById('withdrawMessage').innerHTML = `<div class="alert alert-error"><i className="fas fa-exclamation-circle"></i> ${err.message}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Request Withdrawal';
      }
    });
  }

  function loadWalletData() {
    fetch('/api/wallet', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      document.getElementById('balanceAmount').textContent = (data.balance / 100).toLocaleString('en-PK');
      document.getElementById('totalDeposit').textContent = (data.totalDeposited / 100).toLocaleString('en-PK');
      document.getElementById('totalEarned').textContent = (data.totalEarned / 100).toLocaleString('en-PK');
      document.getElementById('totalWithdrawn').textContent = (data.totalWithdrawn / 100).toLocaleString('en-PK');
    }).catch(err => {
      console.error('Wallet data error:', err);
    });
  }

  function loadTransactions() {
    fetch('/api/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      const container = document.getElementById('transactionsList');
      if (data.transactions && data.transactions.length > 0) {
        container.innerHTML = data.transactions.map(t => `
          <div class="transaction-item">
            <div class="transaction-header">
              <h4>${t.type === 'deposit' ? 'Deposit' : t.type === 'withdrawal' ? 'Withdrawal' : 'Earning'}</h4>
              <span class="type-badge">${t.method || t.type}</span>
              <span class="amount">${t.type === 'deposit' || t.type === 'earning' ? '+' : '-'} PKR ${(t.amount / 100).toLocaleString('en-PK')}</span>
            </div>
            <div class="transaction-date">Date: ${new Date(t.createdAt).toLocaleDateString('en-PK')} ${new Date(t.createdAt).toLocaleTimeString('en-PK')}</div>
            <div class="transaction-status ${t.status}">Status: <strong>${t.status.charAt(0).toUpperCase() + t.status.slice(1)}</strong></div>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<div class="alert alert-info"><i className="fas fa-info-circle"></i> No transactions yet.</div>';
      }
    }).catch(err => {
      document.getElementById('transactionsMessage').innerHTML = `<div class="alert alert-error">Error: ${err.message}</div>`;
    });
  }
}, 100);
