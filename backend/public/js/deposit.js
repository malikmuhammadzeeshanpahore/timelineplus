// ============================================
// DEPOSIT PAGE - Complete Handler
// ============================================

console.log('📄 [DEPOSIT] Script loaded');

// First, load toast.js if not already loaded
if (typeof window.showToast === 'undefined') {
  const toastScript = document.createElement('script');
  toastScript.src = '/js/toast.js';
  toastScript.onload = () => {
    console.log('✅ [DEPOSIT] Toast system loaded');
  };
  document.head.appendChild(toastScript);
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔄 [DEPOSIT] Page initializing...');
  
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ [DEPOSIT] No token - redirecting to login');
    window.location.href = '/';
    return;
  }
  console.log('✅ [DEPOSIT] Authenticated');

  // Load header
  loadHeader();

  // Initialize form
  initializeDepositForm();

  // Load deposit history
  loadDepositHistory();

  // Initialize tabs
  initializeTabs();
});

async function loadHeader() {
  try {
    console.log('🔗 [DEPOSIT] Loading header...');
    
    const headerContainer = document.getElementById('headerContainer');
    if (!headerContainer) {
      console.warn('⚠️ [DEPOSIT] Header container not found');
      return;
    }

    const res = await fetch('/header.html');
    if (!res.ok) {
      throw new Error(`Failed to fetch header: ${res.status}`);
    }

    const html = await res.text();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Extract and add header
    const header = temp.querySelector('header');
    if (header) {
      headerContainer.innerHTML = '';
      headerContainer.appendChild(header.cloneNode(true));
      console.log('✅ [DEPOSIT] Header loaded');
      
      // Add back button
      addBackButton();
    } else {
      console.warn('⚠️ [DEPOSIT] No header element found');
    }

    // Load header scripts
    const headerScript = document.createElement('script');
    headerScript.src = '/js/header-init.js';
    document.body.appendChild(headerScript);
    
  } catch (err) {
    console.error('❌ [DEPOSIT] Header error:', err.message);
  }
}

function addBackButton() {
  try {
    const nav = document.querySelector('.nav');
    if (!nav) {
      console.warn('⚠️ [DEPOSIT] Nav not found for back button');
      return;
    }

    const backBtn = document.createElement('button');
    backBtn.id = 'backBtn';
    backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
    backBtn.style.cssText = `
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      margin-right: 20px;
    `;
    
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('↩️ [DEPOSIT] Back clicked');
      window.history.back();
    });

    const brand = nav.querySelector('.brand');
    if (brand) {
      brand.parentNode.insertBefore(backBtn, brand.nextSibling);
      console.log('✅ [DEPOSIT] Back button added');
    }
  } catch (err) {
    console.error('❌ [DEPOSIT] Back button error:', err.message);
  }
}

function initializeTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      console.log('📋 [DEPOSIT] Switching to tab:', tabName);
      
      // Remove active from all tabs
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active to clicked tab
      btn.classList.add('active');
      const tabContent = document.getElementById(tabName);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
  console.log('✅ [DEPOSIT] Tabs initialized');
}

function initializeDepositForm() {
  console.log('🔍 [DEPOSIT] Looking for form...');
  const form = document.getElementById('depositForm');
  if (!form) {
    console.error('❌ [DEPOSIT] Form #depositForm not found! Available IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    return;
  }
  console.log('✅ [DEPOSIT] Form found!');

  console.log('🔗 [DEPOSIT] Attaching submit listener to form...');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📤 [DEPOSIT] Form submitted!');
    
    const btn = document.getElementById('submitBtn');
    if (!btn) {
      console.error('❌ [DEPOSIT] Submit button not found!');
      return;
    }
    
    btn.disabled = true;
    const origText = btn.textContent;
    btn.textContent = 'Submitting...';

    try {
      // Wait for toast to be available
      let attempts = 0;
      while (typeof window.showToast === 'undefined' && attempts < 10) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      if (typeof window.showToast === 'undefined') {
        console.warn('⚠️ [DEPOSIT] Toast system not available');
        window.showInfo = msg => console.log('ℹ️', msg);
        window.showSuccess = msg => console.log('✅', msg);
        window.showError = msg => console.error('❌', msg);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData(form);
      const amount = Number(formData.get('amount')) * 100; // Convert to cents
      const senderType = formData.get('senderType') || 'bank';
      
      // Map frontend payment method to backend values
      const methodMap = {
        'jazzCash': 'bank',      // JazzCash -> bank
        'easyPaisa': 'bank',     // EasyPaisa -> bank
        'bank': 'bank'           // Bank transfer
      };
      
      const method = methodMap[senderType] || 'bank';

      const payload = {
        amount,
        method,
        senderName: formData.get('senderName'),
        senderAccount: formData.get('senderAccount'),
        transactionId: formData.get('transactionId')
      };

      console.log('📥 [DEPOSIT] Submitting:', payload);
      window.showInfo('Creating deposit request...');

      const response = await fetch('/api/deposits/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📊 [DEPOSIT] Response status:', response.status);
      const data = await response.json();
      console.log('📋 [DEPOSIT] Response data:', data);

      if (response.ok) {
        console.log('✅ [DEPOSIT] Success - ID:', data.deposit?.id);
        window.showSuccess('✓ Deposit request created! Admin will review it soon.');
        form.reset();
        setTimeout(() => {
          loadDepositHistory();
          // Switch to history tab
          document.querySelector('[data-tab="deposit-history"]').click();
        }, 500);
      } else {
        const errorMsg = data.error || 'Error submitting deposit';
        console.error('❌ [DEPOSIT] Failed:', errorMsg);
        window.showError(`Error: ${errorMsg}`);
      }
    } catch (err) {
      console.error('⚠️ [DEPOSIT] Exception:', err.message);
      window.showError(`Error: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  });

  console.log('✅ [DEPOSIT] Form initialized');
}

function loadDepositHistory() {
  const token = localStorage.getItem('token');
  if (!token) return;

  console.log('💳 [DEPOSIT] Loading history...');
  
  const container = document.getElementById('depositHistoryContainer');
  if (!container) {
    console.warn('⚠️ [DEPOSIT] History container not found');
    return;
  }

  container.innerHTML = '<div style="text-align: center; padding: 20px; color: #667eea;">Loading...</div>';

  fetch('/api/deposits/history', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(r => {
      if (!r.ok) throw new Error(`Status ${r.status}`);
      return r.json();
    })
    .then(deposits => {
      console.log('✅ [DEPOSIT] History received:', deposits.length, 'deposits');
      
      if (!Array.isArray(deposits)) {
        console.error('❌ [DEPOSIT] Invalid response format');
        container.innerHTML = '<div class="alert alert-error">Error loading history</div>';
        return;
      }

      if (deposits.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No deposits yet</div>';
        return;
      }

      const html = deposits.map(d => `
        <div class="history-item">
          <div>
            <div class="amount">PKR ${(d.amount / 100).toFixed(2)}</div>
            <div class="meta">${new Date(d.createdAt).toLocaleDateString('en-PK')} • ${d.method}</div>
          </div>
          <span class="status status-${d.status.toLowerCase()}">${d.status}</span>
        </div>
      `).join('');

      container.innerHTML = html;
      console.log('✅ [DEPOSIT] History rendered');
    })
    .catch(err => {
      console.error('❌ [DEPOSIT] History error:', err.message);
      container.innerHTML = `<div class="alert alert-error">Error: ${err.message}</div>`;
    });
}

console.log('✅ [DEPOSIT] All initialization functions defined');
