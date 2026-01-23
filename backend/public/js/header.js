// Header initialization and interactivity
document.addEventListener('DOMContentLoaded', () => {
  const userMenuBtn = document.querySelector('#header .user-menu-btn');
  const userDropdown = document.querySelector('#header .user-dropdown');
  const dropdownItems = document.querySelectorAll('#header .dropdown-item');

  if (!userMenuBtn || !userDropdown) return;

  // Toggle dropdown on button click
  userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking menu items (except logout button)
  dropdownItems.forEach(item => {
    if (item.classList.contains('logout')) {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear all session data
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('adminCode');
        localStorage.removeItem('userId');
        sessionStorage.clear();
        // Redirect to login/register
        window.location.href = '/register/';
      });
    } else {
      item.addEventListener('click', () => {
        userDropdown.classList.add('hidden');
      });
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target) && e.target !== userMenuBtn) {
      userDropdown.classList.add('hidden');
    }
  });

  // Prevent dropdown from closing when clicking inside it
  userDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});
