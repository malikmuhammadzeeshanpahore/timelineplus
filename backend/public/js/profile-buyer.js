// Profile buyer page handler - switch role and logout
document.addEventListener('DOMContentLoaded', () => {
  const switchRoleModal = document.createElement('div');
  switchRoleModal.id = 'switchRoleModal';
  switchRoleModal.className = 'modal';
  switchRoleModal.innerHTML = `
    <div class="modal-content" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 500px; width: 90%;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #667eea; font-size: 22px; margin: 0;"><i class="ri-swap-line" style="margin-right: 10px;"></i>Switch Role</h3>
        <button class="modal-close" data-action="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">×</button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <p style="color: #666; margin-bottom: 16px;">Choose your role to continue. You will be logged out and redirected to login.</p>
        <button class="btn-primary" style="width: 100%; justify-content: center; padding: 10px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.3s ease;" data-action="switch-to-freelancer"><i class="ri-briefcase-4-line"></i> Switch to Freelancer</button>
        <div style="display: flex; gap: 10px; margin-top: 16px; justify-content: flex-end;">
          <button type="button" data-action="close-modal" style="padding: 10px 20px; background: #f0f0f0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Cancel</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(switchRoleModal);

  // Add styles for modal
  const style = document.createElement('style');
  style.textContent = `
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 2000; align-items: center; justify-content: center; }
    .modal.active { display: flex; }
  `;
  document.head.appendChild(style);

  // Handle modal close
  switchRoleModal.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchRoleModal.classList.remove('active');
    });
  });

  // Close modal when clicking outside
  switchRoleModal.addEventListener('click', (e) => {
    if (e.target === switchRoleModal) {
      switchRoleModal.classList.remove('active');
    }
  });

  // Switch role button
  document.querySelector('[data-action="switch-role"]')?.addEventListener('click', () => {
    switchRoleModal.classList.add('active');
  });

  // Switch to freelancer
  document.querySelector('[data-action="switch-to-freelancer"]')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.setItem('switchRole', 'freelancer');
    window.location.href = '/register/';
  });

  // Logout button
  document.querySelector('[data-action="logout"]')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  });
});
