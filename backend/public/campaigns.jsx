import React, { useState, useEffect } from 'react';

const Campaigns = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'buyer');
  const [activeTab, setActiveTab] = useState('my-campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: '',
    targetCount: '',
    price: '',
    targetPage: '',
    description: ''
  });
  const [commission, setCommission] = useState('0.00');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) {
      alert('Please login first');
      window.location.href = '/';
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'my-campaigns') {
      fetchCampaigns();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchAPI = async (endpoint, options = {}) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });
    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch {
        error = { error: 'API error' };
      }
      throw new Error(error.error || 'API error');
    }
    return response.json();
  };

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const data = await fetchAPI('/campaigns/my-campaigns');
      setCampaigns(data.campaigns || []);
    } catch (error) {
      alert('Error loading campaigns: ' + error.message);
    }
    setLoadingCampaigns(false);
  };

  const handleCreateCampaign = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      const data = {
        title: form.title,
        type: form.type,
        targetCount: Number(form.targetCount),
        price: Math.floor(Number(form.price) * 100),
        targetPage: form.targetPage,
        description: form.description
      };
      await fetchAPI('/campaigns/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      alert('Campaign created! Awaiting admin approval.');
      setForm({
        title: '',
        type: '',
        targetCount: '',
        price: '',
        targetPage: '',
        description: ''
      });
      setCommission('0.00');
      setActiveTab('my-campaigns');
      fetchCampaigns();
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setCreating(false);
  };

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
    <button
      className={activeTab === 'my-campaigns' ? 'active' : ''}
      onClick={() => setActiveTab('my-campaigns')}
    >
      My Campaigns
    </button>
    <button
      className={activeTab === 'create' ? 'active' : ''}
      onClick={() => setActiveTab('create')}
    >
      Create Campaign
    </button>
    <button
      className={activeTab === 'how-it-works' ? 'active' : ''}
      onClick={() => setActiveTab('how-it-works')}
    >
      How It Works
    </button>
  </div>
</div>

{/* My Campaigns Tab */}
<div
  id="my-campaigns"
  className={`tab-content${activeTab === 'my-campaigns' ? ' active' : ''}`}
>
  <div id="campaignsList" className="content">
    {loadingCampaigns ? (
      <div className="card"><p>Loading...</p></div>
    ) : campaigns.length === 0 ? (
      <div className="card">
        <p>
          No campaigns yet.{' '}
          <a href="#" onClick={e => { e.preventDefault(); setActiveTab('create'); }}>
            Create one
          </a>
        </p>
      </div>
    ) : (
      campaigns.map(campaign => (
        <div className="campaign-item" key={campaign._id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h4>{campaign.title}</h4>
              <span className={`badge ${campaign.status}`}>{campaign.status.toUpperCase()}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                {campaign.progressPercent || 0}%
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                {campaign.progress}
              </div>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${campaign.progressPercent || 0}%` }}
            >
              {campaign.progressPercent > 5 ? `${campaign.progressPercent}%` : ''}
            </div>
          </div>
          <div className="campaign-info">
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{campaign.type}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Price:</span>
              <span className="info-value">${(campaign.price / 100).toFixed(2)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Your Profit (40%):</span>
              <span className="info-value" style={{ color: '#28a745' }}>
                ${((campaign.price * 0.4) / 100).toFixed(2)}
              </span>
            </div>
          </div>
          <h5 style={{ marginTop: 15, color: '#333' }}>Task Status:</h5>
          <div className="stats">
            <div className="stat-box">
              <div className="value">{campaign.taskStatus.pending}</div>
              <div className="label">Pending</div>
            </div>
            <div className="stat-box">
              <div className="value">{campaign.taskStatus.assigned}</div>
              <div className="label">In Progress</div>
            </div>
            <div className="stat-box">
              <div className="value">{campaign.taskStatus.verified}</div>
              <div className="label">Verified</div>
            </div>
            <div className="stat-box">
              <div className="value">{campaign.taskStatus.paid}</div>
              <div className="label">Paid Out</div>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>

{/* Create Campaign Tab */}
<div
  id="create"
  className={`tab-content${activeTab === 'create' ? ' active' : ''}`}
>
  <div className="card">
    <h3>Create New Campaign</h3>
    <form onSubmit={handleCreateCampaign}>
      <div>
        <label>Campaign Title *</label>
        <input
          type="text"
          id="title"
          required
          placeholder="e.g., Get 1000 Instagram Followers"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label>Campaign Type *</label>
        <select
          id="type"
          required
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
        >
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
        <input
          type="number"
          id="targetCount"
          required
          min="1"
          placeholder="e.g., 1000"
          value={form.targetCount}
          onChange={e => setForm({ ...form, targetCount: e.target.value })}
        />
      </div>
      <div>
        <label>Total Price (USD) *</label>
        <input
          type="number"
          id="price"
          required
          min="1"
          step="0.01"
          placeholder="e.g., 100"
          value={form.price}
          onChange={e => {
            setForm({ ...form, price: e.target.value });
            setCommission((Number(e.target.value) * 0.6).toFixed(2));
          }}
        />
        <small>
          You will pay 60% commission ($
          <span id="commission">{commission}</span>
          ) + your profit is 40%
        </small>
      </div>
      <div>
        <label>Target Page/Profile Link *</label>
        <input
          type="url"
          id="targetPage"
          required
          placeholder="https://facebook.com/yourpage"
          value={form.targetPage}
          onChange={e => setForm({ ...form, targetPage: e.target.value })}
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          id="description"
          placeholder="Add campaign details and instructions..."
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <button type="submit" disabled={creating}>
        {creating ? 'Creating...' : 'Create Campaign'}
      </button>
    </form>
  </div>
</div>

{/* How It Works Tab */}
<div
  id="how-it-works"
  className={`tab-content${activeTab === 'how-it-works' ? ' active' : ''}`}
>
  <div className="card">
    <h3>📋 How It Works</h3>
    <div style={{ lineHeight: 1.8 }}>
      <h4 style={{ marginTop: 20, color: '#667eea' }}>1️⃣ Create Campaign</h4>
      <p>
        You create a campaign (e.g., get 1000 followers for your page) and set the price.
      </p>
      <h4 style={{ marginTop: 20, color: '#667eea' }}>2️⃣ Payment Split</h4>
      <ul style={{ marginLeft: 20 }}>
        <li>
          <strong>60%</strong> goes to Timeline+ (platform commission)
        </li>
        <li>
          <strong>40%</strong> becomes tasks for freelancers
        </li>
      </ul>
      <p>
        Example: If you pay $1000, $600 is commission and $400 creates 1000 tasks ($0.40 per task)
      </p>
      <h4 style={{ marginTop: 20, color: '#667eea' }}>3️⃣ Freelancers Complete Tasks</h4>
      <p>
        1000 freelancers each complete 1 task (follow your page, subscribe to channel, etc.)
      </p>
      <p>Each freelancer earns the reward for completing their task</p>
      <h4 style={{ marginTop: 20, color: '#667eea' }}>4️⃣ Admin Verification</h4>
      <p>Admin reviews and verifies each completion with screenshots and API checks</p>
      <p>Once verified, freelancer gets paid automatically</p>
      <h4 style={{ marginTop: 20, color: '#667eea' }}>5️⃣ Progress Tracking</h4>
      <p>Your dashboard shows real-time progress (e.g., 45/1000 followers received)</p>
      <h4 style={{ marginTop: 20, color: '#667eea' }}>⚠️ Security & Verification</h4>
      <ul style={{ marginLeft: 20 }}>
        <li>Screenshots required for proof</li>
        <li>API verification (Facebook, YouTube, etc.)</li>
        <li>Fraud detection system</li>
        <li>Each freelancer can only complete one task per campaign</li>
      </ul>
    </div>
  </div>
</div>
      </div>
    </>
  );
};

export default Campaigns;
