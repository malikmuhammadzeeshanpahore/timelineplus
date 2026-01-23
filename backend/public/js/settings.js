// Settings page initialization
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const emailInput = document.getElementById('email');
  const roleInput = document.getElementById('role');
  const notificationsCheckbox = document.getElementById('notifications');
  const twoFactorCheckbox = document.getElementById('twoFactor');
  const settingsForm = document.getElementById('settingsForm');
  const messageDiv = document.getElementById('message');

  // Check authentication
  if (!token) {
    window.location.href = '/register/';
    return;
  }

  // Load user settings
  try {
    const response = await fetch('/api/user/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      window.location.href = '/register/';
      return;
    }

    const user = await response.json();
    emailInput.value = user.email || '';
    roleInput.value = user.role || localStorage.getItem('role') || 'buyer';
  } catch (err) {
    console.error('Error loading user info:', err);
    showMessage('Error loading settings', 'error');
  }

  // Handle form submission
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notifications: notificationsCheckbox.checked,
          twoFactorAuth: twoFactorCheckbox.checked
        })
      });

      if (response.ok) {
        showMessage('Settings saved successfully!', 'success');
      } else {
        showMessage('Failed to save settings', 'error');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      showMessage('Error saving settings', 'error');
    }
  });

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message show ${type}`;
    if (type === 'success') {
      setTimeout(() => {
        messageDiv.classList.remove('show');
      }, 3000);
    }
  }
});
