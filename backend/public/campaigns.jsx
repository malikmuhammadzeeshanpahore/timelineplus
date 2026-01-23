const Campaigns = () => {
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
    
    #headerContainer { position: sticky; top: 0; z-index: 1000; }
    .container { max-width: 1000px; margin: 40px auto; padding: 20px; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 30px; }
    .card h2 { color: #667eea; font-size: 22px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
    .card .subtitle { color: #999; font-size: 14px; margin-bottom: 20px; }
    
    .tabs { display: flex; gap: 0; border-bottom: 2px solid #e0e0e0; margin-bottom: 20px; }
    .tab-btn { background: none; border: none; padding: 12px 20px; cursor: pointer; font-weight: 600; color: #999; border-bottom: 3px solid transparent; transition: all 0.3s; font-size: 15px; }
    .tab-btn.active { color: #667eea; border-bottom-color: #667eea; }
    .tab-btn:hover { color: #667eea; }
    
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
    .form-group textarea { resize: vertical; min-height: 80px; }
    
    .btn { padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 14px; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102,126,234,0.4); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .campaign-item { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
    .campaign-item .campaign-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .campaign-item h4 { color: #333; margin: 0; }
    .campaign-item .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; font-size: 14px; }
    .campaign-item .meta-item { display: flex; flex-direction: column; gap: 4px; }
    .campaign-item .meta-item strong { color: #667eea; }
    .campaign-item .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #e8eaf6; color: #667eea; }
    
    .action-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .action-card { text-decoration: none; }
    .action-card-content { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    .action-card:hover .action-card-content { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102,126,234,0.4); }
    .action-card-content i { font-size: 32px; display: block; margin-bottom: 10px; }
    .action-card-content strong { display: block; margin-bottom: 4px; }
    .action-card-content .label { font-size: 12px; opacity: 0.9; }
    
    .alert { padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; }
    .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .alert-error { background: #f8d7da; color: #842029; border: 1px solid #f5c6cb; }
    .alert-info { background: #cfe2ff; color: #084298; border: 1px solid #b6d4fe; }
    
    @media (max-width: 1023px) { .card { padding: 20px; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div id="headerContainer"></div>
      
      <div className="container">
        <div className="card">
          <h2><i className="fas fa-rocket"></i> Campaigns</h2>
          <p className="subtitle">Manage your campaigns</p>
          
          <div className="action-cards">
            <a href="/deposit/" className="action-card">
              <div className="action-card-content">
                <i className="fas fa-plus-circle"></i>
                <strong>Deposit Funds</strong>
                <div className="label">Add balance to wallet</div>
              </div>
            </a>
            <div className="action-card">
              <div className="action-card-content" style={{background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', cursor: 'pointer'}} data-action="create-tab">
                <i className="fas fa-rocket"></i>
                <strong>Launch Campaign</strong>
                <div className="label">Create new campaign</div>
              </div>
            </div>
            <a href="/wallet/" className="action-card">
              <div className="action-card-content" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <i className="fas fa-wallet"></i>
                <strong>Manage Wallet</strong>
                <div className="label">View transactions</div>
              </div>
            </a>
          </div>
          
          <div className="tabs">
            <button className="tab-btn active" data-tab="my-campaigns">My Campaigns</button>
            <button className="tab-btn" data-tab="create">Create Campaign</button>
          </div>
          
          <div id="my-campaigns" className="tab-content active">
            <div id="campaignsMessage"></div>
            <div id="campaignsList"></div>
          </div>
          
          <div id="create" className="tab-content">
            <form id="campaignForm">
              <div className="form-group">
                <label>Campaign Title *</label>
                <input type="text" name="title" placeholder="e.g., Get 1000 Instagram Followers" required />
              </div>
              
              <div className="form-group">
                <label>Campaign Type *</label>
                <select name="type" required>
                  <option value="">Select type</option>
                  <option value="followers">Instagram Followers</option>
                  <option value="youtube">YouTube Subscribers</option>
                  <option value="likes">Social Media Likes</option>
                  <option value="shares">Social Media Shares</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Target Count *</label>
                <input type="number" name="targetCount" placeholder="e.g., 1000" min="1" required />
              </div>
              
              <div className="form-group">
                <label>Total Budget (PKR) *</label>
                <input type="number" name="price" placeholder="e.g., 5000" min="100" required />
              </div>
              
              <div className="form-group">
                <label>Target Page/Profile Link *</label>
                <input type="url" name="targetPage" placeholder="https://..." required />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" placeholder="Additional details..."></textarea>
              </div>
              
              <button type="submit" className="btn" id="submitBtn">Create Campaign</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Campaigns;

setTimeout(() => {
  fetch('/header.html').then(r => r.text()).then(html => {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.getElementById('headerContainer').innerHTML = div.querySelector('body').innerHTML;
    const script = document.createElement('script');
    script.src = '/js/header-init.js';
    document.body.appendChild(script);
  });

  const token = localStorage.getItem('token');

  // Delegated click handling for tabs and action cards (robust across DOM changes)
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn) {
      e.preventDefault();
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tabBtn.classList.add('active');
      const tabId = tabBtn.getAttribute('data-tab');
      const tabEl = document.getElementById(tabId);
      if (tabEl) tabEl.classList.add('active');
      if (tabId === 'my-campaigns') loadCampaigns();
      return;
    }

    const action = e.target.closest('[data-action]');
    if (action) {
      const act = action.getAttribute('data-action');
      if (act === 'create-tab') {
        e.preventDefault();
        const createTabBtn = document.querySelector('.tab-btn[data-tab="create"]');
        if (createTabBtn) createTabBtn.click();
      }
    }
  });

  // Load campaigns on page load
  loadCampaigns();

  // Form submission
  const form = document.getElementById('campaignForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'Creating...';
      
      try {
        const formData = new FormData(form);
        const data = {
          title: formData.get('title'),
          type: formData.get('type'),
          targetCount: Number(formData.get('targetCount')),
          price: Number(formData.get('price')) * 100,
          targetPage: formData.get('targetPage'),
          description: formData.get('description')
        };

        const response = await fetch('/api/campaigns', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          alert('Campaign created successfully!');
          form.reset();
          document.querySelector('[data-tab="my-campaigns"]').click();
        } else {
          const err = await response.json();
          alert('Error: ' + (err.error || 'Failed to create campaign'));
        }
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Campaign';
      }
    });
  }

  function loadCampaigns() {
    fetch('/api/campaigns', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      const container = document.getElementById('campaignsList');
      if (data.campaigns && data.campaigns.length > 0) {
        container.innerHTML = data.campaigns.map(c => `
          <div class="campaign-item">
            <div class="campaign-header">
              <h4>${c.title}</h4>
              <span class="status">${c.status}</span>
            </div>
            <div class="meta">
              <div class="meta-item">
                <strong>Type</strong>
                <span>${c.type}</span>
              </div>
              <div class="meta-item">
                <strong>Target</strong>
                <span>${c.targetCount} ${c.type}</span>
              </div>
              <div class="meta-item">
                <strong>Budget</strong>
                <span>PKR ${(c.price / 100).toLocaleString('en-PK')}</span>
              </div>
              <div class="meta-item">
                <strong>Progress</strong>
                <span>${c.progress || 0}/${c.targetCount}</span>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<div class="alert alert-info">No campaigns yet. Create one to get started!</div>';
      }
    }).catch(err => {
      document.getElementById('campaignsMessage').innerHTML = `<div class="alert alert-error">Error: ${err.message}</div>`;
    });
  }
}, 100);
