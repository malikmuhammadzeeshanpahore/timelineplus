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
      document.getElementById('totalEarnings').textContent = `$${(userData.balance / 100).toFixed(2)}`;
      document.getElementById('trustScore').textContent = `${(userData.user.trustScore?.toFixed(1) || '100')}%`;
    }

    // Load earnings data
    const earningsRes = await fetch(`/api/campaigns/earnings-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (earningsRes.ok) {
      const earningsData = await earningsRes.json();
      document.getElementById('availableEarnings').textContent = `$${(earningsData.unlockedEarnings / 100).toFixed(2)}`;
      document.getElementById('lockedEarnings').textContent = `$${(earningsData.lockedEarnings / 100).toFixed(2)}`;
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
                <td>$${(task.rewardPerTask / 100).toFixed(2)}</td>
                <td><span class="badge ${getBadgeClass(task.status)}">${task.status}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`;
        document.getElementById('tasksContainer').innerHTML = tasksHtml;
      } else {
        document.getElementById('tasksContainer').innerHTML = '<p>No tasks yet</p>';
      }
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
                <td>$${(w.amount / 100).toFixed(2)}</td>
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
