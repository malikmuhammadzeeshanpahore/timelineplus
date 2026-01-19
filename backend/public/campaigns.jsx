import React, { useState, useEffect } from 'react';

const Campaigns = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'buyer');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'buyer';
    setToken(token);
    setRole(role);

    // Load inline scripts from HTML if any
  }, []);

  const styles = `

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .header h1 {
      color: #667eea;
      margin-bottom: 10px;
    }

    .nav-tabs {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      border-bottom: 2px solid #eee;
    }

    .nav-tabs button {
      background: none;
      border: none;
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      color: #666;
      font-size: 1rem;
    }

    .nav-tabs button.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .card h3 {
      color: #333;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .progress-bar {
      width: 100%;
      height: 20px;
      background: #eee;
      border-radius: 10px;
      overflow: hidden;
      margin: 10px 0;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 15px 0;
    }

    .stat-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #667eea;
    }

    .stat-box .value {
      font-size: 1.8rem;
      font-weight: bold;
      color: #667eea;
    }

    .stat-box .label {
      color: #666;
      font-size: 0.9rem;
    }

    form {
      display: grid;
      gap: 15px;
    }

    input, select, textarea {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: inherit;
      font-size: 1rem;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      transition: transform 0.2s;
    }

    button:hover {
      transform: translateY(-2px);
    }

    .campaign-item {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #667eea;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }

    .campaign-item h4 {
      color: #333;
      margin-bottom: 10px;
    }

    .campaign-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 15px 0;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
    }

    .info-label {
      color: #666;
      font-weight: 500;
    }

    .info-value {
      color: #333;
      font-weight: bold;
    }

    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .badge.approved {
      background: #d4edda;
      color: #155724;
    }

    .badge.active {
      background: #d1ecf1;
      color: #0c5460;
    }

    .badge.completed {
      background: #d4edda;
      color: #155724;
    }

    .task-list {
      display: grid;
      gap: 10px;
      margin-top: 15px;
    }

    .task-item {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media (max-width: 768px) {
      .campaign-info {
        grid-template-columns: 1fr;
      }

      .stats {
        grid-template-columns: 1fr;
      }
    }
  
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container">
  <div className="header">
    <h1>🎯 Campaigns</h1>
    <p>Manage your followers, subscribers, and engagement campaigns</p>

    <div className="nav-tabs">
      <button className="active" onclick="switchTab('my-campaigns')">My Campaigns</button>
      <button onclick="switchTab('create')">Create Campaign</button>
      <button onclick="switchTab('how-it-works')">How It Works</button>
    </div>
  </div>

  <!-- My Campaigns Tab -->
  <div id="my-campaigns" className="tab-content active">
    <div id="campaignsList" className="content"></div>
  </div>

  <!-- Create Campaign Tab -->
  <div id="create" className="tab-content">
    <div className="card">
      <h3>Create New Campaign</h3>
      <form onsubmit="createCampaign(event)">
        <div>
          <label>Campaign Title *</label>
          <input type="text" id="title" required placeholder="e.g., Get 1000 Instagram Followers">
        </div>

        <div>
          <label>Campaign Type *</label>
          <select id="type" required>
            <option value="">Select type</option>
            <option value="followers">Followers</option>
            <option value="subscribers">Subscribers</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
            <option value="shares">Shares</option>
            <option value="watch_time">Watch Time</option>
          </select>
        </div>

        <div>
          <label>Target Count *</label>
          <input type="number" id="targetCount" required min="1" placeholder="e.g., 1000">
        </div>

        <div>
          <label>Total Price (USD) *</label>
          <input type="number" id="price" required min="1" step="0.01" placeholder="e.g., 100">
          <small>You will pay 60% commission ($<span id="commission">0</span>) + your profit is 40%</small>
        </div>

        <div>
          <label>Target Page/Profile Link *</label>
          <input type="url" id="targetPage" required placeholder="https://facebook.com/yourpage">
        </div>

        <div>
          <label>Description</label>
          <textarea id="description" placeholder="Add campaign details and instructions..."></textarea>
        </div>

        <button type="submit">Create Campaign</button>
      </form>
    </div>
  </div>

  <!-- How It Works Tab -->
  <div id="how-it-works" className="tab-content">
    <div className="card">
      <h3>📋 How It Works</h3>
      <div style="line-height: 1.8;">
        <h4 style="margin-top: 20px; color: #667eea;">1️⃣ Create Campaign</h4>
        <p>You create a campaign (e.g., get 1000 followers for your page) and set the price.</p>

        <h4 style="margin-top: 20px; color: #667eea;">2️⃣ Payment Split</h4>
        <ul style="margin-left: 20px;">
          <li><strong>60%</strong> goes to Timeline+ (platform commission)</li>
          <li><strong>40%</strong> becomes tasks for freelancers</li>
        </ul>
        <p>Example: If you pay $1000, $600 is commission and $400 creates 1000 tasks ($0.40 per task)</p>

        <h4 style="margin-top: 20px; color: #667eea;">3️⃣ Freelancers Complete Tasks</h4>
        <p>1000 freelancers each complete 1 task (follow your page, subscribe to channel, etc.)</p>
        <p>Each freelancer earns the reward for completing their task</p>

        <h4 style="margin-top: 20px; color: #667eea;">4️⃣ Admin Verification</h4>
        <p>Admin reviews and verifies each completion with screenshots and API checks</p>
        <p>Once verified, freelancer gets paid automatically</p>

        <h4 style="margin-top: 20px; color: #667eea;">5️⃣ Progress Tracking</h4>
        <p>Your dashboard shows real-time progress (e.g., 45/1000 followers received)</p>

        <h4 style="margin-top: 20px; color: #667eea;">⚠️ Security & Verification</h4>
        <ul style="margin-left: 20px;">
          <li>Screenshots required for proof</li>
          <li>API verification (Facebook, YouTube, etc.)</li>
          <li>Fraud detection system</li>
          <li>Each freelancer can only complete one task per campaign</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<script>
  const API_URL = '/api';
  const token = localStorage.getItem('token');

  async function fetchAPI(endpoint, options = {}) {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API error');
    }

    return response.json();
  }

  function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tabs button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'my-campaigns') {
      loadCampaigns();
    }
  }

  async function loadCampaigns() {
    try {
      const data = await fetchAPI('/campaigns/my-campaigns');
      let html = '';

      if (data.campaigns.length === 0) {
        html = '<div className="card"><p>No campaigns yet. <a href="#" onclick="switchTab(\'create\')">Create one</a></p></div>';
      } else {
        data.campaigns.forEach(campaign => {
          html += `
            <div className="campaign-item">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h4>${campaign.title}</h4>
                  <span className="badge ${campaign.status}">${campaign.status.toUpperCase()}</span>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 1.5rem; font-weight: bold; color: #667eea;">
                    ${campaign.progressPercent || 0}%
                  </div>
                  <div style="color: #666; font-size: 0.9rem;">
                    ${campaign.progress}
                  </div>
                </div>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style="width: ${campaign.progressPercent || 0}%">
                  ${campaign.progressPercent > 5 ? campaign.progressPercent + '%' : ''}
                </div>
              </div>

              <div className="campaign-info">
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">${campaign.type}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Price:</span>
                  <span className="info-value">$${(campaign.price / 100).toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Your Profit (40%):</span>
                  <span className="info-value" style="color: #28a745;">$${(campaign.price * 0.4 / 100).toFixed(2)}</span>
                </div>
              </div>

              <h5 style="margin-top: 15px; color: #333;">Task Status:</h5>
              <div className="stats">
                <div className="stat-box">
                  <div className="value">${campaign.taskStatus.pending}</div>
                  <div className="label">Pending</div>
                </div>
                <div className="stat-box">
                  <div className="value">${campaign.taskStatus.assigned}</div>
                  <div className="label">In Progress</div>
                </div>
                <div className="stat-box">
                  <div className="value">${campaign.taskStatus.verified}</div>
                  <div className="label">Verified</div>
                </div>
                <div className="stat-box">
                  <div className="value">${campaign.taskStatus.paid}</div>
                  <div className="label">Paid Out</div>
                </div>
              </div>
            </div>
          `;
        });
      }

      document.getElementById('campaignsList').innerHTML = html;
    } catch (error) {
      alert('Error loading campaigns: ' + error.message);
    }
  }

  async function createCampaign(event) {
    event.preventDefault();

    try {
      const data = {
        title: document.getElementById('title').value,
        type: document.getElementById('type').value,
        targetCount: Number(document.getElementById('targetCount').value),
        price: Math.floor(Number(document.getElementById('price').value) * 100), // convert to cents
        targetPage: document.getElementById('targetPage').value,
        description: document.getElementById('description').value
      };

      const response = await fetchAPI('/campaigns/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      alert('Campaign created! Awaiting admin approval.');
      event.target.reset();
      switchTab('my-campaigns');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  // Update commission display
  document.getElementById('price')?.addEventListener('input', function() {
    const commission = Number(this.value) * 0.6;
    document.getElementById('commission').textContent = commission.toFixed(2);
  });

  if (!token) {
    alert('Please login first');
    window.location.href = '/';
  }
</script>
    </>
  );
};

export default Campaigns;
