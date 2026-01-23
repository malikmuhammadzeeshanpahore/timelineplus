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
      document.getElementById('balance').textContent = `$${(userData.balance / 100).toFixed(2)}`;
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
      document.getElementById('totalSpent').textContent = `$${(totalSpentData / 100).toFixed(2)}`;

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
                <td>$${(campaign.price / 100).toFixed(2)}</td>
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
                <td>$${(d.amount / 100).toFixed(2)}</td>
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
          c.innerHTML = html;
          console.log('Header loaded successfully');
          
          // Execute external scripts that were loaded in the header
          const scripts = c.querySelectorAll('script[src]');
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
          c.innerHTML = '<header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;"><h1><a href="/" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 10px;"><i class="fas fa-clock"></i>TimelinePlus</a></h1><div style="display: flex; align-items: center; gap: 15px;"><span id="userEmail" style="color: white; font-size: 14px;">User</span><button onclick="localStorage.removeItem(\'token\'); window.location.href=\'/register/\';" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 5px;"><i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>Logout</button></div></header>';
        }
      });
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
});
