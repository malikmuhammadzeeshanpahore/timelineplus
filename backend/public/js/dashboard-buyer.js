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
      .then(r => r.text())
      .then(html => {
        const c = document.getElementById('headerContainer');
        if (c) c.innerHTML = html;
      })
      .catch(console.error);
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
});
