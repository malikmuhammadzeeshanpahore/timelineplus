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
      document.getElementById('totalEarnings').textContent = `PKR ${(userData.balance / 100).toFixed(2)}`;
      document.getElementById('trustScore').textContent = `${(userData.user.trustScore?.toFixed(1) || '100')}%`;
    } else {
      console.error('Failed to load user data:', userRes.status);
    }

    // Load earnings data
    const earningsRes = await fetch(`/api/campaigns/earnings-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (earningsRes.ok) {
      const earningsData = await earningsRes.json();
      document.getElementById('availableEarnings').textContent = `PKR ${(earningsData.unlockedEarnings / 100).toFixed(2)}`;
      document.getElementById('lockedEarnings').textContent = `PKR ${(earningsData.lockedEarnings / 100).toFixed(2)}`;
    } else {
      console.error('Failed to load earnings:', earningsRes.status);
    }

    // Load tasks
    const tasksRes = await fetch(`/api/campaigns/my-tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (tasksRes.ok) {
      const allTasks = await tasksRes.json();
      const recentTasks = allTasks.slice(0, 5);
      
      // Update task stats
      document.getElementById('statTotal').textContent = allTasks.length;
      document.getElementById('statPaid').textContent = allTasks.filter(t => t.status === 'paid').length;
      document.getElementById('statAssigned').textContent = allTasks.filter(t => t.status === 'assigned').length;
      document.getElementById('statPending').textContent = allTasks.filter(t => t.status === 'pending').length;

      // Render tasks table
      if (recentTasks.length > 0) {
        const tasksHtml = `<table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Type</th>
              <th>Reward</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${recentTasks.map(task => {
              const getBadgeClass = (status) => {
                if (status === 'paid' || status === 'approved') return 'badge-success';
                if (status === 'assigned') return 'badge-info';
                if (status === 'pending') return 'badge-warning';
                return 'badge-danger';
              };
              return `<tr>
                <td>${task.campaign?.title || 'N/A'}</td>
                <td>${task.campaign?.type || 'N/A'}</td>
                <td>PKR ${(task.rewardPerTask / 100).toFixed(2)}</td>
                <td><span class="badge ${getBadgeClass(task.status)}">${task.status}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`;
        document.getElementById('tasksContainer').innerHTML = tasksHtml;
      } else {
        document.getElementById('tasksContainer').innerHTML = '<p>No tasks yet</p>';
      }
    } else {
      console.error('Failed to load tasks:', tasksRes.status);
    }

    // Load withdrawals
    const withdrawalsRes = await fetch(`/api/withdrawals/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (withdrawalsRes.ok) {
      const withdrawalsData = await withdrawalsRes.json();
      const withdrawals = Array.isArray(withdrawalsData) ? withdrawalsData.slice(0, 5) : [];
      
      if (withdrawals.length > 0) {
        const withdrawalsHtml = `<table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${withdrawals.map(w => {
              const getBadgeClass = (status) => {
                if (status === 'paid' || status === 'approved') return 'badge-success';
                if (status === 'assigned') return 'badge-info';
                if (status === 'pending') return 'badge-warning';
                return 'badge-danger';
              };
              return `<tr>
                <td>PKR ${(w.amount / 100).toFixed(2)}</td>
                <td>${w.method}</td>
                <td><span class="badge ${getBadgeClass(w.status)}">${w.status}</span></td>
                <td>${new Date(w.createdAt).toLocaleDateString()}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`;
        document.getElementById('withdrawalsContainer').innerHTML = withdrawalsHtml;
      } else {
        document.getElementById('withdrawalsContainer').innerHTML = '<p>No withdrawals yet</p>';
      }
    } else {
      console.error('Failed to load withdrawals:', withdrawalsRes.status);
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
});
