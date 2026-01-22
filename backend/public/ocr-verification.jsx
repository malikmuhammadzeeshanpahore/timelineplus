import React, { useState, useEffect } from 'react';

const OcrVerification = () => {
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
      max-width: 900px;
      margin: 0 auto;
    }

    header {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header h1 {
      color: #667eea;
    }

    .trust-score {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .score-badge {
      background: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
    }

    .score-low {
      background: #ff6b6b;
    }

    .score-medium {
      background: #ffa500;
    }

    .score-high {
      background: #51cf66;
    }

    .card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .card h2 {
      color: #667eea;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .info-box {
      background: #f8f9ff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }

    .info-box.warning {
      border-left-color: #ffa500;
      background: #fff8f0;
    }

    .info-box.danger {
      border-left-color: #ff6b6b;
      background: #fff0f0;
    }

    .info-box.success {
      border-left-color: #51cf66;
      background: #f0fff4;
    }

    .upload-area {
      border: 2px dashed #667eea;
      border-radius: 10px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin: 15px 0;
    }

    .upload-area:hover {
      background: #f8f9ff;
      border-color: #764ba2;
    }

    .upload-area.drag-over {
      background: #f8f9ff;
      border-color: #764ba2;
    }

    input[type="file"] {
      display: none;
    }

    .form-group {
      margin: 15px 0;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    button {
      background: #667eea;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s;
      margin: 10px 5px 10px 0;
    }

    button:hover {
      background: #764ba2;
      transform: translateY(-2px);
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #6c757d;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn-danger {
      background: #ff6b6b;
    }

    .btn-danger:hover {
      background: #e63946;
    }

    .btn-success {
      background: #51cf66;
    }

    .btn-success:hover {
      background: #40c057;
    }

    .task-item {
      background: #f8f9ff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .task-status {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-pending {
      background: #fff3bf;
      color: #856404;
    }

    .status-assigned {
      background: #cfe2ff;
      color: #084298;
    }

    .status-verifying {
      background: #d1e7dd;
      color: #0f5132;
    }

    .status-verified {
      background: #d1e7dd;
      color: #0f5132;
    }

    .status-paid {
      background: #d1e7dd;
      color: #0f5132;
    }

    .earnings {
      background: white;
      border: 2px solid #51cf66;
      padding: 20px;
      border-radius: 10px;
      margin: 15px 0;
    }

    .earnings-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }

    .earnings-item:last-child {
      border-bottom: none;
    }

    .earnings-label {
      font-weight: bold;
      color: #333;
    }

    .earnings-value {
      color: #51cf66;
      font-weight: bold;
    }

    .lock-info {
      background: #fff3bf;
      border-left: 4px solid #ffa500;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }

    .preview-image {
      max-width: 100%;
      max-height: 300px;
      margin: 15px 0;
      border-radius: 5px;
      border: 1px solid #ddd;
    }

    .verification-result {
      margin: 20px 0;
      padding: 15px;
      border-radius: 5px;
      display: none;
    }

    .verification-result.show {
      display: block;
    }

    .result-success {
      background: #d1e7dd;
      border: 1px solid #badbcc;
      color: #0f5132;
    }

    .result-failed {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #842029;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading {
      text-align: center;
      color: #667eea;
      font-weight: bold;
    }

    .alert {
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }

    .alert-danger {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #842029;
    }

    .alert-success {
      background: #d1e7dd;
      border: 1px solid #badbcc;
      color: #0f5132;
    }

    .alert-warning {
      background: #fff3cd;
      border: 1px solid #ffecb5;
      color: #664d03;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .grid-2, .form-row {
        grid-template-columns: 1fr;
      }

      header {
        flex-direction: column;
        gap: 15px;
      }
    }

    .penalty-warning {
      background: #fff3cd;
      border: 2px solid #ffc107;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }

    .penalty-warning h3 {
      color: #664d03;
      margin-bottom: 10px;
    }

    .penalty-warning p {
      color: #664d03;
      margin: 5px 0;
    }
  
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
  <div className="container">
    {/* Header */}
    <header>
      <h1>📸 OCR Task Verification</h1>
      <div className="trust-score" id="trustScoreDisplay">
        <span>Trust Score:</span>
        <div className="score-badge" id="scoreBadge">Loading...</div>
      </div>
    </header>

    {/* Trust Score Info */}
    <div className="card" id="trustInfo" style={{ display: 'none' }}>
      <h2>Your Trust Score Info</h2>
      <div id="trustContent"></div>
    </div>

    {/* Ban Warning */}
    <div className="penalty-warning" id="banWarning" style={{ display: 'none' }}>
      <h3>⚠️ Your Account is Banned</h3>
      <p id="banMessage"></p>
      <button className="btn-danger" type="button">Pay to Unlock Account</button>
    </div>

    {/* Earnings Status */}
    <div className="card">
      <h2>💰 Earnings Status</h2>
      <div className="earnings" id="earningsStatus">
        <div className="spinner"></div>
      </div>
    </div>

    {/* Task Verification */}
    <div className="card">
      <h2>📋 Assign & Complete Tasks</h2>
      <div id="tasksContainer">
        <div className="loading">Loading available tasks...</div>
      </div>
      <div id="activeTaskContainer" style={{ display: 'none' }}>
        <h3>Active Task</h3>
        <div id="activeTaskInfo" className="task-item"></div>
        <h3 style={{ marginTop: 20 }}>Submit Screenshot Proof</h3>
        <div className="penalty-warning">
          <h3>⏱️ Time Requirement</h3>
          <p>🔴 You must spend at least <strong>1 minute</strong> on the page/channel</p>
          <p>❌ If you exit before 1 minute: <strong>-10 Trust Score penalty</strong></p>
          <p>✅ After 1 minute: Click "Submit Proof"</p>
        </div>
        {/* OCR Verification Form */}
        <div className="form-group">
          <label>Step 1: Before & After Follower Count</label>
          <div className="form-row">
            <div>
              <label>Followers/Subscribers BEFORE:</label>
              <input type="number" id="followersBefore" placeholder="e.g., 1000" min="0" />
            </div>
            <div>
              <label>Followers/Subscribers AFTER:</label>
              <input type="number" id="followersAfter" placeholder="e.g., 1001" min="0" />
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#666', marginTop: 5 }}>Take screenshot showing both numbers</p>
        </div>
        <div className="form-group">
          <label>Step 2: Upload Screenshot</label>
          <div className="upload-area" id="uploadArea">
            <input type="file" id="imageInput" accept="image/*" />
            <div id="uploadText">
              <p>📷 Drag & drop screenshot here</p>
              <p style={{ fontSize: 12, color: '#666' }}>or click to select</p>
            </div>
            <img id="imagePreview" className="preview-image" style={{ display: 'none' }} alt="Preview" />
          </div>
        </div>
        <div id="verificationResult" className="verification-result"></div>
        <div style={{ marginTop: 20 }}>
          <button id="submitBtn" className="btn-success" type="button">
            ✅ Submit Proof & Verify
          </button>
          <button className="btn-secondary" type="button">
            ❌ Cancel Task
          </button>
        </div>
      </div>
    </div>

    {/* My Completed Tasks */}
    <div className="card">
      <h2>✅ My Completed Tasks</h2>
      <div id="completedTasks" className="loading">Loading...</div>
    </div>

    {/* Withdrawal History */}
    <div className="card">
      <h2>💸 Withdrawal History</h2>
      <div id="withdrawalHistory" className="loading">Loading...</div>
    </div>
  </div>
    </>
  );
};

export default OcrVerification;
