// Unified Wallet Page Handler
document.addEventListener('DOMContentLoaded', async () => {
  console.log('💼 [WALLET] Initializing unified wallet...');

  const token = localStorage.getItem('token');
  if (!token) {
    console.log('🔓 [WALLET] No token found, redirecting to login');
    setTimeout(() => window.location.href = '/', 1000);
    return;
  }

  // Load header
  try {
    const headerHtml = await fetch('/header.html').then(r => r.text());
    const headerContainer = document.getElementById('headerContainer');
    if (headerContainer) {
      headerContainer.innerHTML = headerHtml;
    }
  } catch (err) {
    console.error('❌ Failed to load header:', err);
  }

  // API helper
  const api = async (endpoint, options = {}) => {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || 'API error');
    }

    return response.json();
  };

  // Tab switching - only on wallet page
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  // Check if we're on the wallet page (has the unified wallet tabs)
  const isWalletPage = tabBtns.length > 0 && (
    document.getElementById('history') || 
    document.getElementById('deposit') || 
    document.getElementById('withdraw')
  );
  
  if (isWalletPage) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

        // Add active to clicked
        btn.classList.add('active');
        const tabName = btn.textContent.trim().toLowerCase();
        
        if (tabName.includes('history')) {
          const historyEl = document.getElementById('history');
          if (historyEl) {
            historyEl.classList.add('active');
            loadTransactions();
          }
        } else if (tabName.includes('deposit')) {
          const depositEl = document.getElementById('deposit');
          if (depositEl) depositEl.classList.add('active');
        } else if (tabName.includes('withdraw')) {
          const withdrawEl = document.getElementById('withdraw');
          if (withdrawEl) withdrawEl.classList.add('active');
        }
      });
    });
  }

  // Load balance and transactions
  async function loadBalance() {
    try {
      const data = await api('/api/auth/me');
      const user = data.user;
      
      // Try to load wallet balance
      try {
        const walletRes = await api('/api/wallet/balance');
        const balance = walletRes.balance || 0;
        const balanceEl = document.getElementById('balanceAmount');
        if (balanceEl) {
          balanceEl.textContent = (balance / 100).toLocaleString('en-PK');
        }
      } catch (err) {
        console.warn('Could not load wallet balance:', err);
        const balanceEl = document.getElementById('balanceAmount');
        if (balanceEl) {
          balanceEl.textContent = '0';
        }
      }
      
      console.log('✓ Balance loaded');
    } catch (err) {
      console.error('❌ Failed to load balance:', err);
    }
  }

  // Load transactions
  async function loadTransactions() {
    try {
      const list = document.getElementById('transactionsList');
      const msg = document.getElementById('transactionsMessage');
      
      if (!list || !msg) {
        console.warn('Transaction elements not found in DOM');
        return;
      }
      
      msg.textContent = 'Loading transactions...';
      list.innerHTML = '';
      
      // Try to fetch transactions - gracefully handle if endpoint doesn't exist
      let transactions = [];
      try {
        const txRes = await api('/api/wallet/transactions');
        transactions = txRes.transactions || [];
      } catch (err) {
        console.warn('Wallet transactions endpoint not available:', err);
        if (msg) msg.innerHTML = '<p style="color: #999; text-align: center;">Transaction history not available</p>';
        return;
      }
      
      if (transactions.length === 0) {
        if (msg) msg.innerHTML = '<p style="color: #999; text-align: center;">No transactions yet</p>';
        if (list) list.innerHTML = '';
        return;
      }
      
      if (msg) msg.innerHTML = '';
      if (list) {
        list.innerHTML = transactions.map(tx => `
          <div class="transaction-item">
            <div class="transaction-header">
              <div>
                <h4>${tx.type === 'deposit' ? '💰 Deposit' : '💸 Withdrawal'}</h4>
                <div class="transaction-date">${new Date(tx.createdAt).toLocaleDateString('en-PK')}</div>
              </div>
              <div>
                <span class="amount" style="color: ${tx.type === 'deposit' ? '#28a745' : '#dc3545'}">
                  ${tx.type === 'deposit' ? '+' : '-'} PKR ${(Math.abs(tx.amount) / 100).toLocaleString('en-PK')}
                </span>
                <div class="transaction-status ${tx.status}" style="color: ${tx.status === 'completed' ? '#28a745' : tx.status === 'pending' ? '#ffc107' : '#999'}; font-size: 13px; margin-top: 5px;">
                  ${tx.status}
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
      
      console.log('✓ Transactions loaded');
    } catch (err) {
      console.error('❌ Failed to load transactions:', err);
      const msg = document.getElementById('transactionsMessage');
      if (msg) msg.innerHTML = `<p style="color: #dc3545;">Error loading transactions</p>`;
    }
  }

  // Withdrawal form handler
  const withdrawalForm = document.getElementById('withdrawalForm');
  if (withdrawalForm) {
    withdrawalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(withdrawalForm);
      const amount = parseInt(formData.get('amount')) * 100; // Convert to cents
      
      try {
        const response = await fetch('/api/wallet/withdrawals/request', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount,
            method: formData.get('method'),
            accountNumber: formData.get('accountNumber'),
            accountName: formData.get('accountName')
          })
        });

        const data = await response.json();

        if (!response.ok) {
          // Check if redirect needed
          if (data.requiresProfileCompletion) {
            alert('⚠️ Please complete your profile first');
            setTimeout(() => window.location.href = '/profile/', 500);
            return;
          }
          if (data.requiresWithdrawalDetails) {
            alert('⚠️ Please complete your withdrawal details first');
            setTimeout(() => window.location.href = '/withdrawal-details/', 500);
            return;
          }
          throw new Error(data.error || 'Withdrawal failed');
        }
        
        alert('✓ Withdrawal request submitted!\n\nIt will be processed within 24 hours.');
        withdrawalForm.reset();
        const feeCalcEl = document.getElementById('feeCalculation');
        if (feeCalcEl) feeCalcEl.style.display = 'none';
        loadBalance();
      } catch (err) {
        alert(`❌ Error: ${err.message}`);
      }
    });

    // Fee calculation
    const amountInput = withdrawalForm.querySelector('input[name="amount"]');
    if (amountInput) {
      amountInput.addEventListener('change', () => {
        const amount = parseInt(amountInput.value) || 0;
        const feePercent = 20;
        const fee = Math.floor(amount * feePercent / 100);
        const receive = amount - fee;
        
        const feeAmountEl = document.getElementById('feeAmount');
        const feeValueEl = document.getElementById('feeValue');
        const feeReceiveEl = document.getElementById('feeReceive');
        const feeCalcEl = document.getElementById('feeCalculation');
        
        if (feeAmountEl) feeAmountEl.textContent = `PKR ${amount.toLocaleString('en-PK')}`;
        if (feeValueEl) feeValueEl.textContent = `PKR ${fee.toLocaleString('en-PK')}`;
        if (feeReceiveEl) feeReceiveEl.textContent = `PKR ${receive.toLocaleString('en-PK')}`;
        
        if (feeCalcEl) feeCalcEl.style.display = amount > 0 ? 'block' : 'none';
      });
    }
  }

  // Initial load
  console.log('✓ Wallet page initialized');
  loadBalance();
  
  // Only load transactions if on wallet page
  if (document.getElementById('history')) {
    loadTransactions();
  }
});