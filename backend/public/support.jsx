import React, { useState, useEffect } from 'react';

const Support = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'buyer');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'buyer';
    setToken(token);
    setRole(role);

    // Attach event listener for ticket form submission
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
      const handler = (e) => {
        e.preventDefault();
        if (typeof showToast === 'function') {
          showToast('Ticket submitted — we will respond soon');
        } else {
          alert('Ticket submitted — we will respond soon');
        }
        e.target.reset();
      };
      ticketForm.addEventListener('submit', handler);
      return () => ticketForm.removeEventListener('submit', handler);
    }
  }, []);

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
    .navbar a:hover { color: white; opacity: 1; }
    .right { margin-left: auto; }
    .site-main { padding: 40px 20px; }
    .grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); transition: all 0.3s ease; }
    .card:hover { box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12); transform: translateY(-2px); }
    .card h3 { color: #667eea; margin-bottom: 12px; font-size: 22px; font-weight: 700; }
    .card h4 { color: #333; margin-bottom: 12px; font-size: 18px; font-weight: 600; }
    .card .small { color: #666; font-size: 14px; margin-bottom: 15px; }
    .input-box { margin-bottom: 12px; }
    .input-box input, textarea { width: 100%; padding: 12px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-family: inherit; transition: all 0.3s ease; background: #f9f9f9; }
    .input-box input:focus, textarea:focus { outline: none; border-color: #667eea; background: white; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    textarea { resize: vertical; height: 120px; }
    .btnn { padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
    .btnn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
    .btnn:active { transform: translateY(0); }
    .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .table tr { border-bottom: 1px solid #f0f0f0; }
    .table tr:hover { background: #f9f9f9; }
    .table td { padding: 14px; font-size: 14px; color: #333; }
    .table td:first-child { font-weight: 600; color: #667eea; }
    .status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status.success { background: #d4edda; color: #155724; }
    .status.pending { background: #fff3cd; color: #856404; }
    .status.open { background: #cfe2ff; color: #084298; }
    ul { list-style: none; }
    ul li { padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
    ul li:last-child { border-bottom: none; }
    ul li:before { content: "• "; color: #667eea; font-weight: bold; margin-right: 8px; }
    footer { text-align: center; padding: 30px 20px; color: rgba(0, 0, 0, 0.6); background: white; border-top: 1px solid #f0f0f0; margin-top: 40px; }
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
      .navbar { gap: 15px; margin-left: 20px; }
      .card { padding: 20px; }
      .nav { flex-direction: column; gap: 10px; }
      aside { order: -1; }
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
            <a href="/campaigns/"><i className="ri-briefcase-4-line"></i><span>Campaigns</span></a>
            <a href="/orders/"><i className="ri-shopping-cart-line"></i><span>Active Campaigns</span></a>
            <a href="/support/"><i className="ri-question-line"></i><span>Support</span></a>
          </nav>
          <div className="right"><div id="userPanel"></div></div>
        </div>
      </header>

      <main className="site-main">
        <div className="grid">
          <div>
            <div className="card">
              <h3><i className="ri-ticket-2-line" style={{ marginRight: '10px', color: '#667eea' }}></i>Support Tickets</h3>
              <p className="small">Open a ticket and our support team will respond within 24-48 hours.</p>
              
              <form id="ticketForm" style={{ marginTop: '20px' }}>
                <div className="input-box">
                  <input 
                    type="text" 
                    name="subject" 
                    placeholder="Subject" 
                    required
                  />
                </div>
                <div className="input-box">
                  <input 
                    type="text" 
                    name="order" 
                    placeholder="Order # (optional)"
                  />
                </div>
                <div style={{ marginTop: '12px' }}>
                  <textarea 
                    name="message" 
                    placeholder="Describe your issue in detail..." 
                    required
                  ></textarea>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button className="btnn" type="submit">
                    <i className="ri-send-plane-2-line" style={{ marginRight: '8px' }}></i>
                    Open Ticket
                  </button>
                </div>
              </form>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h4><i className="ri-history-line" style={{ marginRight: '10px', color: '#667eea' }}></i>Recent Tickets</h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td>#TCK-204</td>
                    <td>Order delay</td>
                    <td><span className="status success">✓ Answered</span></td>
                  </tr>
                  <tr>
                    <td>#TCK-219</td>
                    <td>Refund request</td>
                    <td><span className="status pending">⏱ Open</span></td>
                  </tr>
                  <tr>
                    <td>#TCK-203</td>
                    <td>Payment issue</td>
                    <td><span className="status success">✓ Answered</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <aside>
            <div className="card">
              <h3><i className="ri-question-fill" style={{ marginRight: '8px', color: '#667eea' }}></i>Help Center</h3>
              <p className="small">FAQs and common issues.</p>
              <ul style={{ marginTop: '12px' }}>
                <li>How do refunds work?</li>
                <li>How to submit proof?</li>
                <li>Dispute and chargeback policy</li>
                <li>Payment methods accepted</li>
                <li>Account verification</li>
              </ul>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '16px' }}><i className="ri-mail-line" style={{ marginRight: '8px', color: '#667eea' }}></i>Contact Us</h4>
              <ul style={{ marginTop: '12px' }}>
                <li style={{ borderBottom: 'none' }}>
                  <strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Email:</strong>
                  support@timelineplus.com
                </li>
                <li style={{ borderBottom: 'none', marginTop: '12px' }}>
                  <strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Hours:</strong>
                  24/7 Support
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <footer>© TimelinePlus 2026 • All rights reserved</footer>
      <script src="/js/site.js"></script>
    </>
  );
};

export default Support;
