// Ensure icons are loaded before displaying dashboard content
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  // Wait for Font Awesome and Remixicon to load
  const waitForIcons = () => {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const hasFontAwesome = document.fonts && document.fonts.check && document.fonts.check('1em FontAwesome');
        const hasRemixicon = document.fonts && document.fonts.check && document.fonts.check('1em remixicon');
        
        // Also check if stylesheets are loaded
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        let allLoaded = true;
        
        for (const link of links) {
          if (link.href.includes('font-awesome') || link.href.includes('remixicon')) {
            // Try to verify stylesheet loaded
            try {
              if (!link.sheet) allLoaded = false;
            } catch (e) {
              // CORS might prevent check, assume loaded
            }
          }
        }
        
        // Give enough time for fonts to render (500ms timeout)
        if (allLoaded || Date.now() > startTime + 500) {
          clearInterval(checkInterval);
          // Add small delay to ensure rendering
          setTimeout(resolve, 100);
        }
      }, 50);
      
      const startTime = Date.now();
    });
  };

  await waitForIcons();

  try {
    console.log('🔄 [DASHBOARD] Starting data load...');
    
    // Load user data
    console.log('📊 [DASHBOARD] Fetching user data...');
    const userRes = await fetch(`/api/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      console.log('✅ [DASHBOARD] User data received:', userData);
      const balEl = document.getElementById('balance');
      if (balEl) {
        balEl.textContent = `PKR ${(userData.balance / 100).toFixed(2)}`;
        console.log('💰 [DASHBOARD] Balance updated: PKR', userData.balance / 100);
      }
    } else {
      console.warn('⚠️ [DASHBOARD] Failed to fetch user data:', userRes.status);
    }

    // Load campaigns data
    console.log('📋 [DASHBOARD] Fetching campaigns...');
    const campaignsRes = await fetch(`/api/campaigns/my-campaigns`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (campaignsRes.ok) {
      const campaignsData = await campaignsRes.json();
      console.log('✅ [DASHBOARD] Campaigns received:', campaignsData.length, 'campaigns');
      const activeCampaignsData = campaignsData.filter(c => c.status === 'active');
      const completedCampaignsData = campaignsData.filter(c => c.status === 'completed');
      const totalSpentData = campaignsData.reduce((sum, c) => sum + (c.price || 0), 0);
      
      const actEl = document.getElementById('activeCampaigns');
      const comEl = document.getElementById('completedCampaigns');
      const totEl = document.getElementById('totalSpent');
      
      if (actEl) actEl.textContent = activeCampaignsData.length;
      if (comEl) comEl.textContent = completedCampaignsData.length;
      if (totEl) totEl.textContent = `PKR ${(totalSpentData / 100).toFixed(2)}`;

      // Render campaigns table
      if (campaignsData.length > 0) {
        const campaignsHtml = `<table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Type</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            ${campaignsData.slice(0, 10).map(campaign => {
              const progress = campaign.targetCount ? Math.round(((campaign.completedCount || 0) / campaign.targetCount) * 100) : 0;
              const getBadgeClass = (status) => {
                if (status === 'active') return 'badge-info';
                if (status === 'completed') return 'badge-success';
                return 'badge-warning';
              };
              return `<tr>
                <td><strong>${campaign.title || 'N/A'}</strong></td>
                <td>${campaign.type || 'N/A'}</td>
                <td>
                  <span>${campaign.completedCount || 0}/${campaign.targetCount || 0}</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                  </div>
                </td>
                <td><span class="badge ${getBadgeClass(campaign.status)}">${campaign.status || 'pending'}</span></td>
                <td>PKR ${(campaign.price / 100).toFixed(2)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`;
        const campConEl = document.getElementById('campaignsContainer');
        if (campConEl) campConEl.innerHTML = campaignsHtml;
      } else {
        const campConEl = document.getElementById('campaignsContainer');
        if (campConEl) campConEl.innerHTML = '<p>No campaigns yet</p>';
      }
    }

    // Load deposits
    console.log('💳 [DASHBOARD] Fetching deposits...');
    const depositsRes = await fetch(`/api/deposits/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (depositsRes.ok) {
      const depositsData = await depositsRes.json();
      console.log('✅ [DASHBOARD] Deposits received:', depositsData.length, 'deposits');
      const deposits = Array.isArray(depositsData) ? depositsData.slice(0, 5) : [];
      
      if (deposits.length > 0) {
        const depositsHtml = `<table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${deposits.map(d => {
              const getBadgeClass = (status) => {
                if (status === 'success' || status === 'approved') return 'badge-success';
                if (status === 'pending') return 'badge-warning';
                return 'badge-danger';
              };
              return `<tr>
                <td>PKR ${(d.amount / 100).toFixed(2)}</td>
                <td>${d.method || 'N/A'}</td>
                <td><span class="badge ${getBadgeClass(d.status)}">${d.status || 'pending'}</span></td>
                <td>${new Date(d.createdAt).toLocaleDateString()}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`;
        const depConEl = document.getElementById('depositsContainer');
        if (depConEl) depConEl.innerHTML = depositsHtml;
      } else {
        const depConEl = document.getElementById('depositsContainer');
        if (depConEl) depConEl.innerHTML = '<p>No deposits yet</p>';
      }
    }

    // Load header first - before other data
    console.log('🔄 [DASHBOARD] Loading header...');
    fetch('/header.html')
      .then(r => {
        if (!r.ok) throw new Error(`Header load failed: ${r.status}`);
        return r.text();
      })
      .then(html => {
        console.log('📥 [DASHBOARD] Header HTML received');
        const c = document.getElementById('headerContainer');
        if (!c) {
          console.warn('⚠️ [DASHBOARD] Header container not found!');
          return;
        }
        
        // Parse the header HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        console.log('✅ [DASHBOARD] Header HTML parsed');
        
        // Extract and inject styles from header
        const styles = temp.querySelectorAll('style');
        console.log(`📝 [DASHBOARD] Found ${styles.length} style tags`);
        styles.forEach(style => {
          const newStyle = document.createElement('style');
          newStyle.textContent = style.textContent;
          document.head.appendChild(newStyle);
        });
        
        // Extract and inject Font Awesome links from header
        const links = temp.querySelectorAll('link[rel="stylesheet"]');
        console.log(`🔗 [DASHBOARD] Found ${links.length} stylesheet links`);
        links.forEach(link => {
          if (!document.querySelector(`link[href="${link.href}"]`)) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = link.href;
            if (link.media) newLink.media = link.media;
            document.head.appendChild(newLink);
            console.log(`  ↳ Added link: ${link.href}`);
          }
        });
        
        // Extract the body content (header element)
        const header = temp.querySelector('header');
        if (header) {
          c.innerHTML = '';
          c.appendChild(header.cloneNode(true));
          console.log('✅ [DASHBOARD] Header loaded successfully');
          
          // Load header initialization scripts
          const headerInitScript = document.createElement('script');
          headerInitScript.src = '/js/header-init.js';
          headerInitScript.onload = () => console.log('✅ [DASHBOARD] Header init loaded');
          headerInitScript.onerror = (e) => console.error('❌ [DASHBOARD] Header init failed:', e);
          document.body.appendChild(headerInitScript);
        } else {
          console.warn('⚠️ [DASHBOARD] No header element found in HTML');
          c.innerHTML = html;
        }
        
        // Execute external scripts that were loaded in the header
        const scripts = temp.querySelectorAll('script[src]');
        scripts.forEach(script => {
          if (!script.src.includes('header-init.js')) {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.async = true;
            document.body.appendChild(newScript);
          }
        });
      })
      .catch(err => {
        console.error('❌ [DASHBOARD] Error loading header:', err);
        showError('Header failed to load');
        // Show a fallback header
        const c = document.getElementById('headerContainer');
        if (c) {
          c.innerHTML = '<header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;"><div style="display:flex;align-items:center;gap:12px;"><h1><a href="/" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 10px;"><i class="fas fa-clock"></i>TimelinePlus</a></h1></div><div style="display: flex; align-items: center; gap: 15px;"><span id="userEmail" style="color: white; font-size: 14px;">User</span><button id="fallbackLogout" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 5px;"><i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>Logout</button></div></header>';
          const fb = document.getElementById('fallbackLogout');
          if (fb) fb.addEventListener('click', ()=>{ localStorage.removeItem('token'); window.location.href='/register/'; });
        }
      });
  } catch (err) {
    console.error('❌ [DASHBOARD] Dashboard load error:', err);
    showError(`Dashboard error: ${err.message}`);
  }
});
