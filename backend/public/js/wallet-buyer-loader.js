// Load header and handle back navigation for Wallet Buyer page
(async () => {
  try {
    console.log('🔄 [WALLET-BUYER] Initializing page...');
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ [WALLET-BUYER] No token found, redirecting to login');
      window.location.href = '/';
      return;
    }

    // Load header
    let headerContainer = document.getElementById('headerContainer');
    let attempts = 0;
    while (!headerContainer && attempts < 20) {
      await new Promise(r => setTimeout(r, 50));
      headerContainer = document.getElementById('headerContainer');
      attempts++;
    }
    
    if (!headerContainer) {
      console.warn('⚠️ [WALLET-BUYER] Header container not found');
      return;
    }

    console.log('🔗 [WALLET-BUYER] Fetching header...');
    const headerRes = await fetch('/header.html');
    if (!headerRes.ok) {
      throw new Error(`Header load failed: ${headerRes.status}`);
    }
    
    const headerHtml = await headerRes.text();
    const parser = new DOMParser();
    const headerDoc = parser.parseFromString(headerHtml, 'text/html');
    
    const header = headerDoc.querySelector('header');
    if (header) {
      headerContainer.appendChild(header.cloneNode(true));
      console.log('✅ [WALLET-BUYER] Header loaded');
    }

    // Inject scripts
    const headerScript = document.createElement('script');
    headerScript.src = '/js/header-init.js';
    document.body.appendChild(headerScript);
    
  } catch (e) {
    console.error('❌ [WALLET-BUYER] Error loading header:', e.message);
  }
})();

// Add back button functionality
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 [WALLET-BUYER] Page DOM loaded');
  
  // Add back button to header
  const header = document.querySelector('header');
  if (header) {
    const backBtn = document.createElement('button');
    backBtn.id = 'backBtn';
    backBtn.innerHTML = '<i className="fas fa-arrow-left"></i> Back';
    backBtn.style.cssText = `
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
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
    `;
    
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('↩️ [WALLET-BUYER] Back button clicked');
      if (document.referrer) {
        window.history.back();
      } else {
        window.location.href = '/dashboard-buyer/';
      }
    });
    
    // Insert after logo
    const nav = header.querySelector('.nav');
    if (nav) {
      nav.style.position = 'relative';
      nav.insertBefore(backBtn, nav.firstChild);
      console.log('✅ [WALLET-BUYER] Back button added');
    }
  }
});
