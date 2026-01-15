document.addEventListener('DOMContentLoaded', ()=>{
  // sticky header (transparent until scrolled)
  const header = document.querySelector('.header');
  function onScroll(){ if(window.scrollY>20) header.style.background = 'rgba(10,40,98,0.08)'; else header.style.background = 'transparent'; }
  window.addEventListener('scroll', onScroll); onScroll();

  // active nav highlight
  document.querySelectorAll('.header .nav a').forEach(a=>{
    if(a.getAttribute('href') && location.pathname.endsWith(a.getAttribute('href'))) a.classList.add('active');
    a.addEventListener('click', ()=>{ document.querySelectorAll('.header .nav a').forEach(x=>x.classList.remove('active')); a.classList.add('active'); });
  });

  // small helper to show toast
  window.showToast = function(msg, t=2200){ const wrap = document.querySelector('.toast-wrap') || (function(){const d=document.createElement('div');d.className='toast-wrap';document.body.appendChild(d);return d;})(); const el=document.createElement('div'); el.className='toast'; el.innerText=msg; wrap.appendChild(el); setTimeout(()=>{ el.style.opacity=0; setTimeout(()=>el.remove(),300)}, t); };

  // user panel loader (if token present and #userPanel exists)
  (async function loadUserPanel(){
    const panel = document.getElementById('userPanel');
    const token = localStorage.getItem('token');
    if(!panel || !token) return;
    try{
      const res = await fetch('/api/user/me', { headers: { 'Authorization': 'Bearer '+token } });
      if(res.status===401) return;
      const j = await res.json(); const u = j.user; const raw = (j.balance!=null)? j.balance:0;
      panel.innerHTML = '';
      const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.alignItems='center'; wrapper.style.gap='10px';
      const avatar = document.createElement('div'); avatar.className='pill'; avatar.style.width='36px'; avatar.style.height='36px'; avatar.style.display='flex'; avatar.style.alignItems='center'; avatar.style.justifyContent='center'; avatar.innerText = (u.username||u.email||'U')[0].toUpperCase();
      const info = document.createElement('div'); info.style.textAlign='right'; info.innerHTML = `<div style="font-weight:700;color:#fff">${u.username||u.email}</div><div class="small">$${(raw===0?'0.00':(Number(raw)/100).toFixed(2))}</div>`;
      const menu = document.createElement('div'); menu.innerHTML = `<a href='/profile.html' class='btn-outline' style='margin-left:8px;padding:6px 10px;'>Profile</a> <button id='navLogout' class='btn-outline' style='margin-left:6px;padding:6px 10px;'>Logout</button>`;
      wrapper.appendChild(avatar); wrapper.appendChild(info); wrapper.appendChild(menu); panel.appendChild(wrapper);
      document.getElementById('navLogout')?.addEventListener('click', ()=>{ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='/login.html'; });

      // set navigation menus after we know the role
      setNavByRole();
    }catch(err){ console.error(err); }
  })();

  // role-based navbar
  function setNavByRole(){
    const role = localStorage.getItem('role') || 'guest';
    const navbars = document.querySelectorAll('.navbar');
    navbars.forEach(nav=>{
      if(role==='freelancer'){
        nav.innerHTML = `
          <a href="/dashboard"><i class="ri-dashboard-2-line"></i><span class="nav-label">Dashboard</span></a>
          <a href="/profile"><i class="ri-user-line"></i><span class="nav-label">Profile</span></a>
          <a href="/wallet"><i class="ri-wallet-line"></i><span class="nav-label">Wallet</span></a>
          <a href="/dashboard#tasks"><i class="ri-list-check"></i><span class="nav-label">Tasks</span></a>
          <a href="/support"><i class="ri-question-line"></i><span class="nav-label">Support</span></a>
        `;
      } else if(role==='buyer'){
        nav.innerHTML = `
          <a href="/dashboard"><i class="ri-dashboard-2-line"></i><span class="nav-label">Dashboard</span></a>
          <a href="/services"><i class="ri-briefcase-4-line"></i><span class="nav-label">Services</span></a>
          <a href="/orders"><i class="ri-shopping-cart-line"></i><span class="nav-label">Campaigns</span></a>
          <a href="/wallet"><i class="ri-wallet-line"></i><span class="nav-label">Wallet</span></a>
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

  // also call on initial load so guests see correct menu
  setNavByRole();
});
});