// Ensure toast.js is loaded first
if (!window.showSuccess) {
  const toastScript = document.createElement('script');
  toastScript.src = '/js/toast.js';
  document.head.appendChild(toastScript);
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('💼 [WALLET] Initializing unified wallet page...');

  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('🔓 [WALLET] No token found, redirecting to login');
    setTimeout(() => location.href = '/login.html', 1000);
    return;
  }

  // Wait for toast system to be available
  let attempts = 0;
  while (!window.showSuccess && attempts < 20) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  
  if (!window.showSuccess) {
    console.warn('⚠️ [WALLET] Toast system not loaded, using console fallback');
    window.showSuccess = msg => { console.log('✓', msg); alert(msg); };
    window.showError = msg => { console.error('✗', msg); alert('Error: ' + msg); };
    window.showWarning = msg => { console.warn('⚠️', msg); alert('Warning: ' + msg); };
  }

  // Load header
  try {
    const headerHtml = await fetch('/header.html').then(r => r.text());
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
      placeholder.innerHTML = headerHtml;
    }
  } catch (err) {
    console.error('❌ [WALLET] Failed to load header:', err);
  }

  // Auth headers
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Get user role
  let userRole = 'buyer';
  try {
    const res = await fetch('/api/auth/me', { headers: authHeaders() });
    if (res.ok) {
      const user = await res.json();
      userRole = user.role || 'buyer';
      console.log('👤 [WALLET] User role:', userRole);
    }
  } catch (err) {
    console.error('❌ [WALLET] Failed to get user role:', err);
  }

  // Setup role-based tabs
  const tabsContainer = document.getElementById('wallet-tabs');
  if (tabsContainer) {
    let tabsHTML = '';
    
    if (userRole === 'freelancer') {
      // Freelancer tabs: Withdrawal History, Withdraw Funds
      tabsHTML = `
        <button class="tab-btn active" data-tab="withdrawal-history">Withdrawal History</button>
        <button class="tab-btn" data-tab="withdraw-funds">Withdraw Funds</button>
      `;
    } else {
      // Buyer tabs: Transaction History, Deposit Funds, Withdraw Funds
      tabsHTML = `
        <button class="tab-btn active" data-tab="transaction-history">Transaction History</button>
        <button class="tab-btn" data-tab="deposit-funds">Deposit Funds</button>
        <button class="tab-btn" data-tab="withdraw-funds">Withdraw Funds</button>
      `;
    }
    
    tabsContainer.innerHTML = tabsHTML;
  }

  // Show first tab
  const firstTab = document.querySelector('.tab-btn.active');
  if (firstTab) {
    const firstTabName = firstTab.getAttribute('data-tab');
    const firstContent = document.getElementById(firstTabName);
    if (firstContent) {
      firstContent.style.display = 'block';
    }
  }

  // Currency formatter - PKR
  const formatPKR = (cents) => {
    if (!cents && cents !== 0) return 'N/A';
    const pkr = cents / 100;
    return new Intl.NumberFormat('en-PK', { 
      style: 'currency', 
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(pkr);
  };

  // Load balance
  async function loadBalance() {
    try {
      const res = await fetch('/api/wallet/balance/me', { headers: authHeaders() });
      if (res.status === 401) {
        window.showError('Session expired, please login again');
        setTimeout(() => location.href = '/login.html', 1500);
        return;
      }
      const data = await res.json();
      const balance = data.balance || 0;
      document.getElementById('wallet-balance').innerText = formatPKR(balance).replace('PKR ', '');
      console.log('💰 [WALLET] Balance loaded:', formatPKR(balance));
    } catch (err) {
      console.error('❌ [WALLET] Failed to load balance:', err);
      window.showError('Failed to load balance');
    }
  }

  // Load transactions (buyer)
  async function loadTransactions() {
    try {
      console.log('📋 [WALLET] Loading transaction history...');
      
      const [walletRes, depositsRes] = await Promise.all([
        fetch('/api/wallet/history/me', { headers: authHeaders() }),
        fetch('/api/deposits/history', { headers: authHeaders() })
      ]);
      
      if (walletRes.status === 401 || depositsRes.status === 401) {
        window.showError('Session expired');
        return;
      }
      
      const walletData = await walletRes.json();
      const depositsData = await depositsRes.json();
      
      const walletTransactions = (walletData.tx || []).map(tx => ({
        ...tx,
        transactionType: 'wallet'
      }));
      
      const deposits = (Array.isArray(depositsData) ? depositsData : []).map(d => ({
        id: d.id,
        amount: d.amount,
        createdAt: d.createdAt,
        type: 'deposit_' + d.method,
        status: d.status,
        meta: `Deposit - ${d.status}`,
        transactionType: 'deposit'
      }));
      
      const allTransactions = [...walletTransactions, ...deposits].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      const tbody = document.getElementById('transaction-tbody');
      if (!tbody) return;
      
      tbody.innerHTML = '';

      if (allTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colSpan="4" style="textAlign: center; padding: 10px;">No transactions yet</td></tr>';
        return;
      }

      allTransactions.forEach(tx => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #eee';
        const date = new Date(tx.createdAt).toLocaleString('en-PK');
        const amount = formatPKR(tx.amount);
        const type = tx.transactionType === 'wallet' ? tx.type : 'Deposit';
        const status = tx.status || 'completed';
        
        row.innerHTML = `
          <td>${date}</td>
          <td>${type}</td>
          <td>${amount}</td>
          <td>${status}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error('❌ [WALLET] Failed to load transactions:', err);
      const tbody = document.getElementById('transaction-tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colSpan="4" style="textAlign: center; color: red;">Error loading transactions</td></tr>';
      }
    }
  }

  // Load withdrawal history (freelancer)
  async function loadWithdrawalHistory() {
    try {
      console.log('📋 [WALLET] Loading withdrawal history...');
      
      const res = await fetch('/api/wallet/withdrawals', { headers: authHeaders() });
      if (res.status === 401) {
        window.showError('Session expired');
        return;
      }
      
      const data = await res.json();
      const withdrawals = Array.isArray(data) ? data : (data.withdrawals || []);
      
      const tbody = document.getElementById('withdrawal-tbody');
      if (!tbody) return;
      
      tbody.innerHTML = '';

      if (withdrawals.length === 0) {
        tbody.innerHTML = '<tr><td colSpan="4" style="textAlign: center; padding: 10px;">No withdrawals yet</td></tr>';
        return;
      }

      withdrawals.forEach(w => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #eee';
        const date = new Date(w.createdAt).toLocaleString('en-PK');
        const amount = formatPKR(w.amount);
        const method = w.method || 'N/A';
        const status = w.status || 'pending';
        
        row.innerHTML = `
          <td>${date}</td>
          <td>${amount}</td>
          <td>${method}</td>
          <td>${status}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error('❌ [WALLET] Failed to load withdrawal history:', err);
      const tbody = document.getElementById('withdrawal-tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colSpan="4" style="textAlign: center; color: red;">Error loading withdrawals</td></tr>';
      }
    }
  }

  // Check if user has filled withdrawal details
  async function checkWithdrawalDetails() {
    try {
      const res = await fetch('/api/user/withdrawal-details', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.isComplete === true;
      }
    } catch (err) {
      console.error('❌ [WALLET] Failed to check withdrawal details:', err);
    }
    return false;
  }

  // Tab switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Deactivate all tabs and contents
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      
      // Activate selected tab
      tab.classList.add('active');
      const content = document.getElementById(tabName);
      if (content) {
        content.style.display = 'block';
        
        if (tabName === 'transaction-history') {
          loadTransactions();
        } else if (tabName === 'withdrawal-history') {
          loadWithdrawalHistory();
        }
      }
      console.log('📑 [WALLET] Switched to tab:', tabName);
    });
  });

  // Top-up form (buyer)
  const topupForm = document.getElementById('topup-form');
  if (topupForm) {
    topupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('topup-amount').value;
      
      if (!amount || Number(amount) <= 0) {
        window.showError('Please enter a valid amount');
        return;
      }

      try {
        const res = await fetch('/api/wallet/topup', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ amount: Math.round(Number(amount) * 100) })
        });

        if (res.ok) {
          window.showSuccess('Top-up request created');
          topupForm.reset();
          loadBalance();
        } else {
          const error = await res.json();
          window.showError(error.error || 'Failed to create top-up request');
        }
      } catch (err) {
        console.error('❌ [WALLET] Top-up error:', err);
        window.showError('Network error. Please try again.');
      }
    });
  }

  // Withdraw form (both buyer and freelancer)
  const withdrawForm = document.getElementById('withdraw-form');
  if (withdrawForm) {
    withdrawForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const amount = document.getElementById('withdraw-amount').value;
      const method = document.getElementById('withdraw-method').value;
      const accountNumber = document.getElementById('withdraw-phone').value;
      
      // Validation
      if (!amount || Number(amount) < 500) {
        window.showError('Minimum withdrawal amount is PKR 500');
        return;
      }

      if (!method) {
        window.showError('Please select a withdrawal method (Jazz Cash or Easy Paisa)');
        return;
      }

      if (!accountNumber) {
        window.showError('Please enter your phone number');
        return;
      }

      // Check withdrawal details
      const detailsReady = await checkWithdrawalDetails();
      if (!detailsReady) {
        const confirmed = confirm('You need to fill your withdrawal details first. Go to Withdrawal Details page?');
        if (confirmed) {
          location.href = '/withdrawal-details.html';
        }
        return;
      }

      try {
        const res = await fetch('/api/wallet/withdraw', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ 
            amount: Math.round(Number(amount) * 100),
            method,
            accountNumber
          })
        });

        if (res.ok) {
          window.showSuccess('Withdrawal request submitted');
          withdrawForm.reset();
          loadBalance();
          if (userRole === 'freelancer') {
            loadWithdrawalHistory();
          } else {
            loadTransactions();
          }
        } else {
          const error = await res.json();
          window.showError(error.error || 'Failed to submit withdrawal request');
        }
      } catch (err) {
        console.error('❌ [WALLET] Withdrawal error:', err);
        window.showError('Network error. Please try again.');
      }
    });
  }

  // Initial load
  loadBalance();
  
  // Load first tab data
  if (userRole === 'freelancer') {
    loadWithdrawalHistory();
  } else {
    loadTransactions();
  }
});