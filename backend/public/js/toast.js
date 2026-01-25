// Global Toast Notification System
window.showToast = function(message, type = 'info', duration = 4000) {
  // Log to console
  const timestamp = new Date().toLocaleTimeString('en-PK');
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  
  // Create toast container if doesn't exist
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  const bgColor = colors[type] || colors.info;
  const icon = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ'
  }[type] || 'ℹ';

  toast.style.cssText = `
    background: white;
    border-left: 5px solid ${bgColor};
    padding: 15px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    color: #333;
    max-width: 100%;
    word-wrap: break-word;
  `;

  toast.innerHTML = `
    <span style="color: ${bgColor}; font-weight: bold; font-size: 18px;">${icon}</span>
    <span>${message}</span>
  `;

  // Add animation styles if not already added
  if (!document.querySelector('style[data-toast-styles]')) {
    const style = document.createElement('style');
    style.setAttribute('data-toast-styles', 'true');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  toastContainer.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// Convenience functions
window.showSuccess = (msg, duration) => window.showToast(msg, 'success', duration);
window.showError = (msg, duration) => window.showToast(msg, 'error', duration);
window.showWarning = (msg, duration) => window.showToast(msg, 'warning', duration);
window.showInfo = (msg, duration) => window.showToast(msg, 'info', duration);

// Log helper function
window.logDebug = function(label, data) {
  console.log(`[DEBUG] ${label}:`, data);
};
