// ============================================
// CAMPAIGNS PAGE - Complete Handler
// ============================================

console.log('📄 [CAMPAIGNS] Script loaded');

// First, load toast.js if not already loaded
if (typeof window.showToast === 'undefined') {
  const toastScript = document.createElement('script');
  toastScript.src = '/js/toast.js';
  toastScript.onload = () => {
    console.log('✅ [CAMPAIGNS] Toast system loaded');
  };
  document.head.appendChild(toastScript);
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔄 [CAMPAIGNS] Page initializing...');
  
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ [CAMPAIGNS] No token - redirecting to login');
    window.location.href = '/';
    return;
  }
  console.log('✅ [CAMPAIGNS] Authenticated');

  // Load header
  loadHeader();
});

async function loadHeader() {
  try {
    console.log('🔗 [CAMPAIGNS] Loading header...');
    
    const headerContainer = document.getElementById('headerContainer');
    if (!headerContainer) {
      console.warn('⚠️ [CAMPAIGNS] Header container not found');
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
      console.log('✅ [CAMPAIGNS] Header loaded');
      
      // Add back button
      addBackButton();
    } else {
      console.warn('⚠️ [CAMPAIGNS] No header element found');
    }

    // Load header scripts
    const headerScript = document.createElement('script');
    headerScript.src = '/js/header-init.js';
    document.body.appendChild(headerScript);
    
  } catch (err) {
    console.error('❌ [CAMPAIGNS] Header error:', err.message);
  }
}

function addBackButton() {
  try {
    const nav = document.querySelector('.nav');
    if (!nav) {
      console.warn('⚠️ [CAMPAIGNS] Nav not found for back button');
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
      console.log('↩️ [CAMPAIGNS] Back clicked');
      window.history.back();
    });

    const brand = nav.querySelector('.brand');
    if (brand) {
      brand.parentNode.insertBefore(backBtn, brand.nextSibling);
      console.log('✅ [CAMPAIGNS] Back button added');
    }
  } catch (err) {
    console.error('❌ [CAMPAIGNS] Back button error:', err.message);
  }
}

console.log('✅ [CAMPAIGNS] Initialization complete');
