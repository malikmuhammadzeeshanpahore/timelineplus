// Load header immediately (don't wait for DOMContentLoaded)
(async () => {
  try {
    let headerContainer = document.getElementById('headerContainer');
    let attempts = 0;
    while (!headerContainer && attempts < 20) {
      await new Promise(r => setTimeout(r, 50));
      headerContainer = document.getElementById('headerContainer');
      attempts++;
    }
    
    if (!headerContainer) {
      console.warn('Header container not found');
      return;
    }

    const headerRes = await fetch('/header.html');
    if (!headerRes.ok) {
      console.error('Failed to fetch header:', headerRes.status);
      return;
    }
    
    const headerHtml = await headerRes.text();
    const parser = new DOMParser();
    const headerDoc = parser.parseFromString(headerHtml, 'text/html');
    
    const header = headerDoc.querySelector('#header');
    const nav = headerDoc.querySelector('#mobileMenu');
    const styles = headerDoc.querySelectorAll('style');
    
    if (header) {
      headerContainer.appendChild(header.cloneNode(true));
    }
    if (nav) {
      document.body.appendChild(nav.cloneNode(true));
    }
    
    styles.forEach(style => {
      const newStyle = document.createElement('style');
      newStyle.textContent = style.textContent;
      document.head.appendChild(newStyle);
    });
    
    const headerScript = document.createElement('script');
    headerScript.src = '/js/header-init.js';
    document.body.appendChild(headerScript);
  } catch (e) {
    console.error('Error loading header:', e);
  }
})();

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  try {
    // Load user data
    const userRes = await fetch(`/api/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      document.getElementById('balance').textContent = `PKR ${(userData.balance / 100).toFixed(2)}`;
    }

    // Load campaigns data
    const campaignsRes = await fetch(`/api/campaigns/my-campaigns`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (campaignsRes.ok) {
      const campaignsData = await campaignsRes.json();
      const activeCampaignsData = campaignsData.filter(c => c.status === 'active');
      const completedCampaignsData = campaignsData.filter(c => c.status === 'completed');
      const totalSpentData = campaignsData.reduce((sum, c) => sum + (c.price || 0), 0);
      
      document.getElementById('activeCampaigns').textContent = activeCampaignsData.length;
      document.getElementById('completedCampaigns').textContent = completedCampaignsData.length;
      document.getElementById('totalSpent').textContent = `PKR ${(totalSpentData / 100).toFixed(2)}`;

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
        document.getElementById('campaignsContainer').innerHTML = campaignsHtml;
      } else {
        document.getElementById('campaignsContainer').innerHTML = '<p>No campaigns yet</p>';
      }
    }

    // Load deposits
    const depositsRes = await fetch(`/api/deposits/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (depositsRes.ok) {
      const depositsData = await depositsRes.json();
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
        document.getElementById('depositsContainer').innerHTML = depositsHtml;
      } else {
        document.getElementById('depositsContainer').innerHTML = '<p>No deposits yet</p>';
      }
    }

    // Load header
    fetch('/header.html')
      .then(r => {
        if (!r.ok) throw new Error(`Header load failed: ${r.status}`);
        return r.text();
      })
      .then(html => {
        const c = document.getElementById('headerContainer');
        if (c) {
          // Parse the header HTML
          const temp = document.createElement('div');
          temp.innerHTML = html;
          
          // Extract and inject styles from header
          const styles = temp.querySelectorAll('style');
          styles.forEach(style => {
            const newStyle = document.createElement('style');
            newStyle.textContent = style.textContent;
            document.head.appendChild(newStyle);
          });
          
          // Extract and inject Font Awesome links from header
          const links = temp.querySelectorAll('link[rel="stylesheet"]');
          links.forEach(link => {
            if (!document.querySelector(`link[href="${link.href}"]`)) {
              const newLink = document.createElement('link');
              newLink.rel = 'stylesheet';
              newLink.href = link.href;
              if (link.media) newLink.media = link.media;
              if (link.onload) {
                newLink.onload = link.onload;
              }
              document.head.appendChild(newLink);
            }
          });
          
          // Extract the body content (header element)
          const header = temp.querySelector('header');
          if (header) {
            c.innerHTML = '';
            c.appendChild(header.cloneNode(true));
            console.log('Header loaded successfully with styles');
          } else {
            c.innerHTML = html;
          }
          
          // Execute external scripts that were loaded in the header
          const scripts = temp.querySelectorAll('script[src]');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.async = true;
            document.body.appendChild(newScript);
          });
        } else {
          console.warn('Header container not found');
        }
      })
      .catch(err => {
        console.error('Error loading header:', err);
        // Show a fallback header
        const c = document.getElementById('headerContainer');
        if (c) {
          const fallbackHeader = document.createElement('header');
          fallbackHeader.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          fallbackHeader.style.color = 'white';
          fallbackHeader.style.padding = '15px 20px';
          fallbackHeader.style.display = 'flex';
          fallbackHeader.style.justifyContent = 'space-between';
          fallbackHeader.style.alignItems = 'center';
          
          fallbackHeader.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
              <h1><a href="/" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-clock"></i>TimelinePlus
              </a></h1>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span id="userEmail" style="color: white; font-size: 14px;">User</span>
              <button id="fallbackLogout" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 5px;">
                <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>Logout
              </button>
            </div>
          `;
          
          c.appendChild(fallbackHeader);
          
          setTimeout(() => {
            const fb = document.getElementById('fallbackLogout');
            if (fb) {
              fb.addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.href = '/register/';
              });
            }
          }, 50);
        }
      });
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
});
