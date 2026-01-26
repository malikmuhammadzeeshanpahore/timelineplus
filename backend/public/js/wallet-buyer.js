// Ensure toast.js is loaded first
if (!window.showSuccess) {
  const toastScript = document.createElement('script');
  toastScript.src = '/js/toast.js';
  document.head.appendChild(toastScript);
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('💼 [WALLET] Initializing wallet page...');

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
  
  // Define fallback toast functions if not available
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
      const nav = placeholder.querySelector('nav.navbar');
      if (nav) {
        const walletLink = document.createElement('a');
        walletLink.href = '#';
        walletLink.style.color = '#FF6B35';
        walletLink.innerHTML = '<i className="ri-wallet-3-line"></i><span className="nav-label">Wallet</span>';
        walletLink.onclick = (e) => e.preventDefault();
        nav.appendChild(walletLink);
      }
      // Add back button
      const right = placeholder.querySelector('.right');
      if (right) {
        const backBtn = document.createElement('a');
        backBtn.href = '/';
        backBtn.className = 'action';
        backBtn.innerHTML = '← Back';
        right.insertBefore(backBtn, right.firstChild);
      }
    }
  } catch (err) {
    console.error('❌ [WALLET] Failed to load header:', err);
  }

  // Auth headers
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

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
        showError('Session expired, please login again');
        setTimeout(() => location.href = '/login.html', 1500);
        return;
      }
      const data = await res.json();
      const balance = data.balance || 0;
      document.getElementById('wallet-balance').innerText = formatPKR(balance).replace('PKR ', '');
      console.log('💰 [WALLET] Balance loaded:', formatPKR(balance));
    } catch (err) {
      console.error('❌ [WALLET] Failed to load balance:', err);
      showError('Failed to load balance');
    }
  }

  // Load transactions (wallet + deposits)
  async function loadTransactions() {
    try {
      console.log('📋 [WALLET] Loading transaction history...');
      
      // Fetch both wallet transactions and deposits
      const [walletRes, depositsRes] = await Promise.all([
        fetch('/api/wallet/history/me', { headers: authHeaders() }),
        fetch('/api/deposits/history', { headers: authHeaders() })
      ]);
      
      if (walletRes.status === 401 || depositsRes.status === 401) {
        showError('Session expired');
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
      
      // Combine and sort by date (newest first)
      const allTransactions = [...walletTransactions, ...deposits].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      const tbody = document.getElementById('transaction-tbody');
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
        const type = tx.type.replace(/_/g, ' ').toUpperCase();
        const meta = tx.meta || '-';
        
        row.innerHTML = `
          <td style="padding: 8px">${date}</td>
          <td style="padding: 8px">${type}</td>
          <td style="textAlign: right; padding: 8px; color: ${tx.amount > 0 ? 'green' : 'red'}">${amount}</td>
          <td style="padding: 8px">${meta}</td>
        `;
        tbody.appendChild(row);
      });
      console.log('✓ [WALLET] Loaded', allTransactions.length, 'transactions');
    } catch (err) {
      console.error('❌ [WALLET] Failed to load transactions:', err);
      const tbody = document.getElementById('transaction-tbody');
      tbody.innerHTML = '<tr><td colSpan="4" style="textAlign: center; color: red;">Error loading transactions</td></tr>';
    }
  }

  // Tab switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Deactivate all tabs and contents
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Activate selected tab
      tab.classList.add('active');
      const content = document.getElementById(tabName);
      if (content) {
        content.classList.add('active');
        if (tabName === 'transaction-history') {
          loadTransactions();
        }
      }
      console.log('📑 [WALLET] Switched to tab:', tabName);
    });
  });

  // Top-up form
  const topupForm = document.getElementById('topup-form');
  if (topupForm) {
    topupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('topup-amount').value;
      
      if (!amount || Number(amount) <= 0) {
        showError('Please enter a valid amount');
        return;
      }

      try {
        console.log('💳 [WALLET] Submitting top-up:', amount, 'PKR');
        const cents = Math.round(Number(amount) * 100);
        const res = await fetch('/api/wallet/topup', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ amount: cents })
        });
        const data = await res.json();
        
        if (res.ok) {
          showSuccess('Top-up recorded! Balance updated.');
          document.getElementById('topup-amount').value = '';
          await loadBalance();
          // Switch to transaction history to show new transaction
          setTimeout(() => {
            document.querySelector('[data-tab="transaction-history"]').click();
          }, 500);
        } else {
          showError(data.error || 'Top-up failed');
        }
      } catch (err) {
        console.error('❌ [WALLET] Top-up error:', err);
        showError('Network error during top-up');
      }
    });
  }

  // Withdraw form
  const withdrawForm = document.getElementById('withdraw-form');
  if (withdrawForm) {
    withdrawForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('withdraw-amount').value;
      const method = document.getElementById('withdraw-method').value;
      const details = document.getElementById('withdraw-details').value;

      if (!amount || Number(amount) <= 0) {
        showError('Please enter a valid amount');
        return;
      }
      if (!method) {
        showError('Please select a withdrawal method');
        return;
      }
      if (!details) {
        showError('Please enter withdrawal details (bank account or PayPal email)');
        return;
      }

      try {
        console.log('💸 [WALLET] Requesting withdrawal:', amount, 'PKR via', method);
        const cents = Math.round(Number(amount) * 100);
        const res = await fetch('/api/wallet/withdraw', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ amount: cents, method, details })
        });
        const data = await res.json();

        if (res.ok) {
          showSuccess('Withdrawal request submitted! Pending admin approval.');
          withdrawForm.reset();
          await loadBalance();
          // Switch to history
          setTimeout(() => {
            document.querySelector('[data-tab="transaction-history"]').click();
          }, 500);
        } else {
          showError(data.error || 'Withdrawal request failed');
        }
      } catch (err) {
        console.error('❌ [WALLET] Withdraw error:', err);
        showError('Network error during withdrawal request');
      }
    });
  }

  // Initial load
  await loadBalance();
  await loadTransactions();
  console.log('✅ [WALLET] Wallet page ready');
});
