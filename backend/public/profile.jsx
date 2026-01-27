import React, { useState, useEffect } from 'react';

const Profile = () => {
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.1); position: sticky; top: 0; z-index: 1000; }
    .nav { padding: 16px 20px; display: flex; align-items: center; max-width: 1200px; margin: 0 auto; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { height: 40px; }
    .label { font-weight: 700; color: white; font-size: 20px; letter-spacing: 0.5px; }
    .navbar { display: flex; gap: 30px; flex: 1; margin-left: 40px; }
    .navbar a { text-decoration: none; color: rgba(255, 255, 255, 0.9); display: flex; align-items: center; gap: 8px; font-weight: 500; transition: all 0.3s ease; }
    .navbar a:hover { color: white; }
    .right { margin-left: auto; }
    .site-main { padding: 40px 20px; }
    .content { max-width: 800px; margin: 0 auto; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); transition: all 0.3s ease; }
    .card:hover { box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12); transform: translateY(-2px); }
    .card h3 { color: #667eea; margin-bottom: 12px; font-size: 22px; font-weight: 700; }
    .card .small { color: #666; font-size: 14px; margin-bottom: 15px; }
    .card p { margin: 8px 0; }
    .card strong { color: #333; }
    .card span { color: #555; }
    .btn-primary { padding: 10px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
    .btn-outline { padding: 10px 16px; background: transparent; color: #667eea; border: 2px solid #667eea; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.3s ease; }
    .btn-outline:hover { background: #667eea; color: white; }
    .button-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
    footer { text-align: center; padding: 30px 20px; color: rgba(0, 0, 0, 0.6); background: white; border-top: 1px solid #f0f0f0; margin-top: 40px; }
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 2000; align-items: center; justify-content: center; padding: 16px; overflow-y: auto; }
    .modal.active { display: flex; }
    .modal-content { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; margin: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .modal-header h3 { color: #667eea; font-size: 22px; flex: 1; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 4px 8px; }
    .modal-close:hover { color: #333; }
    .modal-body { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-weight: 600; color: #333; font-size: 14px; }
    .form-group input, .form-group select { padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-family: inherit; width: 100%; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); background: white; }
    .modal-footer { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; flex-wrap: wrap; }
    .btn-secondary { padding: 10px 20px; background: #f0f0f0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-secondary:hover { background: #e0e0e0; }
    #editMsg { margin-top: 12px; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600; }
    #editMsg.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    #editMsg.error { background: #f8d7da; color: #842029; border: 1px solid #f5c6cb; }
    @media (max-width: 768px) {
      .navbar { gap: 15px; margin-left: 20px; }
      .card { padding: 20px; }
      .modal { padding: 12px; }
      .modal-content { width: 100%; padding: 20px; border-radius: 8px; }
      .modal-header { margin-bottom: 16px; }
      .modal-header h3 { font-size: 18px; }
      .modal-footer { justify-content: center; gap: 8px; }
      .btn-secondary, .btn-primary { flex: 1; min-width: 120px; }
    }
    @media (max-width: 480px) {
      .modal-content { padding: 16px; }
      .modal-header h3 { font-size: 16px; }
      .form-group input, .form-group select { font-size: 16px; padding: 12px; }
      .btn-secondary, .btn-primary { padding: 12px 16px; font-size: 14px; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <header className="header">
        <div className="nav">
          <div className="brand">
            <img src="/logo.png" alt="TimelinePlus" />
            <span className="label">TimelinePlus</span>
          </div>
          <nav className="navbar" aria-label="Main navigation">
            <a href="/campaigns/"><i className="ri-briefcase-4-line"></i><span className="nav-label">Campaigns</span></a>
            <a href="/orders/"><i className="ri-shopping-cart-line"></i><span className="nav-label">Active Campaigns</span></a>
            <a href="/support/"><i className="ri-question-line"></i><span className="nav-label">Support</span></a>
          </nav>
          <div className="right" style={{ marginLeft: 'auto' }}><div id="userPanel"></div></div>
        </div>
      </header>

      <main className="site-main">
        <div className="content">
          <div className="card">
            <h3><i className="ri-user-line" style={{ marginRight: '10px', color: '#667eea' }}></i>Contributor Profile</h3>
            <p className="small">Account details and settings.</p>
            <div style={{ marginTop: '12px' }}>
              <p><strong>Name:</strong> <span id="pf-name">—</span></p>
              <p><strong>Username:</strong> <span id="pf-username">—</span></p>
              <p><strong>Email:</strong> <span id="pf-email">—</span></p>
              <p><strong>Age:</strong> <span id="pf-age">—</span></p>
              <p><strong>Gender:</strong> <span id="pf-gender">—</span></p>
              <p><strong>City:</strong> <span id="pf-city">—</span></p>
              <p><strong>Current Balance:</strong> $<span id="pf-balance">0.00</span></p>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <a className="btn-primary" href="/orders/" style={{ textDecoration: 'none' }}><i className="ri-history-line"></i> History</a>
              <a className="btn-primary" href="/withdrawal-details/" style={{ textDecoration: 'none' }}><i className="ri-wallet-line"></i> Withdrawal Details</a>
                <button className="btn-primary" data-action="edit-profile"><i className="ri-edit-line"></i> Edit Profile</button>
              <button className="btn-primary" data-action="switch-role"><i className="ri-swap-line"></i> Switch Role</button>
              <button className="btn-primary" data-action="logout"><i className="ri-logout-box-line"></i> Logout</button>
                <button className="btn-primary" data-action="invite-team"><i className="ri-user-add-line"></i> Invite Team</button>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3><i className="ri-global-line" style={{ marginRight: '10px', color: '#667eea' }}></i>Social Accounts</h3>
            <p className="small">Link your Google and Facebook accounts for quick sign-in.</p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn-outline" data-action="link-google"><i className="ri-google-line"></i> Link Google</button>
              <button className="btn-outline" data-action="link-facebook"><i className="ri-facebook-line"></i> Link Facebook</button>
            </div>
            <div id="socialList" style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}></div>
          </div>
        </div>
      </main>

      {/* Switch Role Modal */}
      <div id="switchRoleModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3><i className="ri-swap-line" style={{ marginRight: '10px', color: '#667eea' }}></i>Switch Role</h3>
            <button className="modal-close" data-action="close-modal">×</button>
          </div>
          <div className="modal-body">
            <p style={{ color: '#666', marginBottom: '16px' }}>Choose your role to continue. You will be logged out and redirected to login.</p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} data-action="switch-to-buyer"><i className="ri-shopping-cart-line"></i> Switch to Buyer</button>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} data-action="switch-to-freelancer"><i className="ri-briefcase-4-line"></i> Switch to Freelancer</button>
            <div className="modal-footer" style={{ marginTop: '16px' }}>
              <button type="button" className="btn-secondary" data-action="close-modal">Cancel</button>
            </div>
          </div>
        </div>

        {/* Invite Team Modal */}
        <div id="inviteModal" className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3><i className="ri-user-add-line" style={{ marginRight: '10px', color: '#667eea' }}></i>Invite Team Member</h3>
              <button className="modal-close" data-action="close-invite">×</button>
            </div>
            <div className="modal-body">
              <p className="small">Share this invite link or code with team members. They can use it to register and join your team.</p>
              <div className="form-group">
                <label>Invite Link</label>
                <input id="inviteLink" type="text" readOnly />
              </div>
              <div className="form-group">
                <label>Invite Code</label>
                <input id="inviteCode" type="text" readOnly />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn-primary" id="copyInviteBtn">Copy Invite Link</button>
                <button className="btn-outline" id="regenInviteBtn">Regenerate</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <div id="editProfileModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3><i className="ri-edit-line" style={{ marginRight: '10px', color: '#667eea' }}></i>Edit Profile</h3>
            <button className="modal-close" data-action="close-modal">×</button>
          </div>
          <form id="editProfileForm" className="modal-body">
            <div className="form-group">
              <label htmlFor="editName">Full Name</label>
              <input id="editName" type="text" placeholder="Your full name" required />
            </div>
            <div className="form-group">
              <label htmlFor="editEmail">Email Address</label>
              <input id="editEmail" type="email" placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="editAge">Age</label>
              <input id="editAge" type="number" placeholder="Age" min="18" max="100" />
            </div>
            <div className="form-group">
              <label htmlFor="editGender">Gender</label>
              <select id="editGender">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="editCity">City</label>
              <input id="editCity" type="text" placeholder="Your city" />
            </div>
            <div id="editMsg"></div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" data-action="close-modal">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      <footer>© TimelinePlus 2026</footer>

      <script src="/js/profile.js"></script>
      <script src="/js/site.js"></script>
    </>
  );
};

export default Profile;
