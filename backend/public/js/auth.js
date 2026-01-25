// Minimal auth helpers: password toggle, simple toasts, form handlers
document.addEventListener('DOMContentLoaded', ()=>{
  // Toast helper
  function showToast(msg, timeout=2500){
    let wrap = document.querySelector('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div'); t.className='toast'; t.innerText = msg; wrap.appendChild(t);
    setTimeout(()=>{ t.style.opacity = '0'; setTimeout(()=>t.remove(),300); }, timeout);
  }

  // Password toggle
  const pwd = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');
  if(pwd && toggle){
    toggle.addEventListener('click', ()=>{
      const isPassword = pwd.type === 'password';
      pwd.type = isPassword ? 'text' : 'password';
      toggle.className = isPassword ? 'ri-eye-fill toggle-password' : 'ri-eye-off-fill toggle-password';
    });
  }

  // Role selector (both login & register forms) - add support if present
  function attachRoleSelector(form){
    const picker = form.querySelector('.role-selector');
    if(!picker) return;
    const hidden = form.querySelector('input[name="role"]') || (()=>{ const i=document.createElement('input'); i.type='hidden'; i.name='role'; form.appendChild(i); return i; })();
    
    const userPicker = form.querySelector('#userRoleSelector');
    const adminPicker = form.querySelector('#adminRoleSelector');
    
    const attachToSelector = (sel) => {
      if (!sel) return;
      sel.querySelectorAll('.role-pill').forEach(p=>p.addEventListener('click', ()=>{
        sel.querySelectorAll('.role-pill').forEach(x=>x.classList.remove('active'));
        p.classList.add('active');
        hidden.value = p.dataset.role;
      }));
      const active = sel.querySelector('.role-pill.active');
      if(active) hidden.value = active.dataset.role;
    };
    
    attachToSelector(userPicker);
    attachToSelector(adminPicker);
    
    if(!userPicker && !adminPicker) {
      picker.querySelectorAll('.role-pill').forEach(p=>p.addEventListener('click', ()=>{
        picker.querySelectorAll('.role-pill').forEach(x=>x.classList.remove('active'));
        p.classList.add('active'); hidden.value = p.dataset.role;
      }));
      const active = picker.querySelector('.role-pill.active');
      if(active) hidden.value = active.dataset.role;
    }
  }

  const loginForm = document.getElementById('loginForm');
  if(loginForm){ 
    attachRoleSelector(loginForm);
    
    const userRoleSelector = document.getElementById('userRoleSelector');
    const adminRoleSelector = document.getElementById('adminRoleSelector');
    let isAdminChecked = false;
    let isAdminUser = false;
    
    // When admin role pills are clicked, capture the selection
    if (adminRoleSelector) {
      adminRoleSelector.querySelectorAll('.role-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const hidden = loginForm.querySelector('input[name="role"]');
          if (hidden) {
            hidden.value = pill.dataset.role;
            console.log('Admin role selected:', pill.dataset.role);
          }
        });
      });
    }
    
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const formData = new FormData(loginForm);
      const f = Object.fromEntries(formData);
      
      const email = f.email || f.username;
      const password = f.password;
      
      if (!email || !password) {
        showToast('Email and password are required');
        return;
      }
      
      if (!isAdminChecked) {
        try {
          const checkRes = await fetch('/api/auth/check-admin', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email })
          });
          const checkData = await checkRes.json();
          isAdminUser = checkData.isAdmin;
          isAdminChecked = true;
          
          if (isAdminUser && userRoleSelector && adminRoleSelector) {
            userRoleSelector.style.display = 'none';
            adminRoleSelector.style.display = 'flex';
            // Set default role for admin selector to 'freelancer'
            const hidden = loginForm.querySelector('input[name="role"]');
            if (hidden) {
              hidden.value = 'freelancer';
            }
            showToast('Please select your admin mode');
            return;
          } else if (userRoleSelector && adminRoleSelector) {
            userRoleSelector.style.display = 'flex';
            adminRoleSelector.style.display = 'none';
          }
        } catch (err) {
          console.error('Check admin failed:', err);
        }
      }
      
      const payload = { email, password };
      
      if (isAdminUser) {
        const loginAs = f.role || 'freelancer';
        payload.loginAs = loginAs;
        console.log('Sending login with loginAs:', loginAs);
      }
      
      try{
        const res = await fetch('/api/auth/login', { 
          method:'POST', 
          headers:{'Content-Type':'application/json'}, 
          body: JSON.stringify(payload)
        });
        
        let j;
        try {
          j = await res.json();
        } catch(parseErr) {
          showToast('Server response error');
          return;
        }
        
        if(res.ok && j.token){
          try {
            localStorage.setItem('token', j.token);
            const roleToSave = j.user?.role || f.role || 'freelancer';
            localStorage.setItem('role', roleToSave);
            console.log('Token and role saved. User role:', roleToSave);
          } catch(e) {
            showToast('Cannot save session data');
            return;
          }
          
          showToast('Login successful');
          setTimeout(()=>{
            const role = j.user?.role || f.role || 'freelancer';
            if (role && (role === 'admin_freelancer' || role === 'admin_buyer')) {
              window.location.href = '/admin-panel/';
            } else {
              const dest = (role === 'freelancer') ? '/freelancer-dashboard/' : '/dashboard-buyer/';
              location.href = dest;
            }
          }, 600);
        } else {
          showToast(j.error || 'Login failed');
        }
      }catch(err){ showToast('Network error: ' + err.message); }
    });
  }

  const regForm = document.getElementById('registerForm');
  if(regForm){ attachRoleSelector(regForm);
    regForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const f = Object.fromEntries(new FormData(regForm));
      try{
        const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: f.email, username: f.username, password: f.password, role: f.role || 'freelancer' }) });
        const j = await res.json();
        if(res.ok && (j.success || j.user)){
          showToast('Registered successfully');
          setTimeout(()=>location.href = '/login.html',700);
        } else {
          showToast(j.error || 'Register failed');
        }
      }catch(err){ console.error(err); showToast('Network error'); }
    });
  }

  // Logout buttons
  document.querySelectorAll('[data-action="logout"]').forEach(b=>b.addEventListener('click', (e)=>{ 
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout clicked, clearing localStorage');
    localStorage.removeItem('token'); 
    localStorage.removeItem('role'); 
    localStorage.removeItem('adminSecret');
    sessionStorage.clear();
    location.href='/'; 
  }));
});