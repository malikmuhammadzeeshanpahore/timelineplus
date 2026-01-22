document.addEventListener('DOMContentLoaded', () => {
  // sticky header (transparent until scrolled)
  const header = document.querySelector('.header');
  function onScroll() {
    if (window.scrollY > 20) header.style.background = 'rgba(10,40,98,0.08)';
    else header.style.background = 'transparent';
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  // active nav highlight
  document.querySelectorAll('.header .nav a').forEach(a => {
    if (a.getAttribute('href') && location.pathname.endsWith(a.getAttribute('href'))) a.classList.add('active');
    a.addEventListener('click', () => {
      document.querySelectorAll('.header .nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
    });
  });

  // small helper to show toast
  window.showToast = function(msg, t = 2200) {
    const wrap = document.querySelector('.toast-wrap') || (function() {
      const d = document.createElement('div');
      d.className = 'toast-wrap';
      document.body.appendChild(d);
      return d;
    })();
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerText = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = 0;
      setTimeout(() => el.remove(), 300);
    }, t);
  };

  // Fetch /api/user/me and render header based on role
  async function loadUserAndHeader() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return renderGuestHeader();

      const res = await fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Unauthorized');

      const data = await res.json();
      const user = data.user;
      const role = user.role || 'guest'; // role field from backend
      const username = user.username || user.email || 'User';
      const balance = (data.balance != null) ? data.balance : 0;

      // Store role for other scripts (role-protect.js, etc.)
      localStorage.setItem('role', role);

      renderHeaderByRole(role, username, balance);
      renderNavbar(role);

    } catch (err) {
      console.error('Error loading user:', err);
      renderGuestHeader();
    }
  }

  function renderHeaderByRole(role, name, balance) {
    const panel = document.getElementById('userPanel');
    if (!panel) return;

    panel.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '10px';

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'pill';
    avatar.style.width = '36px';
    avatar.style.height = '36px';
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.innerText = name[0].toUpperCase();

    // Info
    const info = document.createElement('div');
    info.style.textAlign = 'right';
    const balanceDisplay = (balance === 0 ? '0.00' : (Number(balance) / 100).toFixed(2));
    info.innerHTML = `
      <div style="font-weight:700;color:#fff">${name}</div>
      <div class="small">$${balanceDisplay}</div>
    `;

    // Menu
    const menu = document.createElement('div');
    menu.innerHTML = `
      <a href='/profile' class='btn-outline' style='margin-left:8px;padding:6px 10px;'>Profile</a>
      <button id='navLogout' class='btn-outline' style='margin-left:6px;padding:6px 10px;'>Logout</button>
    `;

    wrapper.appendChild(avatar);
    wrapper.appendChild(info);
    wrapper.appendChild(menu);
    panel.appendChild(wrapper);

    document.getElementById('navLogout')?.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      location.href = '/login';
    });
  }

  function renderGuestHeader() {
    const panel = document.getElementById('userPanel');
    if (panel) {
      panel.innerHTML = `
        <a href='/login' class='btn-outline'>Login</a>
        <a href='/register' class='btn-outline' style='margin-left:6px;'>Register</a>
      `;
    }
    renderNavbar('guest');
  }

  function renderNavbar(role) {
    const navbars = document.querySelectorAll('.navbar');
    navbars.forEach(nav => {
      if (role === 'freelancer') {
        nav.innerHTML = `
          <a href="/dashboard"><i class="ri-dashboard-2-line"></i><span class="nav-label">Dashboard</span></a>
          <a href="/profile"><i class="ri-user-line"></i><span class="nav-label">Profile</span></a>
          <a href="/wallet"><i class="ri-wallet-line"></i><span class="nav-label">Wallet</span></a>
          <a href="/dashboard#tasks"><i class="ri-list-check"></i><span class="nav-label">Tasks</span></a>
          <a href="/support"><i class="ri-question-line"></i><span class="nav-label">Support</span></a>
        `;
      } else if (role === 'buyer') {
        nav.innerHTML = `
          <a href="/dashboard"><i class="ri-dashboard-2-line"></i><span class="nav-label">Dashboard</span></a>
          <a href="/services"><i class="ri-briefcase-4-line"></i><span class="nav-label">Services</span></a>
          <a href="/orders"><i class="ri-shopping-cart-line"></i><span class="nav-label">Campaigns</span></a>
          <a href="/wallet"><i class="ri-wallet-line"></i><span class="nav-label">Wallet</span></a>
          <a href="/support"><i class="ri-question-line"></i><span class="nav-label">Support</span></a>
        `;
      } else if (role === 'admin') {
        nav.innerHTML = `
          <strong>Admin</strong>
          <a href="/admin"><i class="ri-admin-line"></i><span class="nav-label">Admin Panel</span></a>
          <a href="/admin/users"><i class="ri-user-settings-line"></i><span class="nav-label">Users</span></a>
          <a href="/admin/jobs"><i class="ri-file-list-line"></i><span class="nav-label">Jobs</span></a>
          <a href="/admin/reports"><i class="ri-bar-chart-line"></i><span class="nav-label">Reports</span></a>
          <a href="/support"><i class="ri-question-line"></i><span class="nav-label">Support</span></a>
        `;
      } else {
        // guest
        nav.innerHTML = `
          <a href="/services"><i class="ri-briefcase-4-line"></i><span class="nav-label">Services</span></a>
          <a href="/support"><i class="ri-question-line"></i><span class="nav-label">Support</span></a>
          <a href="/login"><i class="ri-user-line"></i><span class="nav-label">Login</span></a>
        `;
      }
    });
  }

  // Load user and render header/navbar
  loadUserAndHeader();
});