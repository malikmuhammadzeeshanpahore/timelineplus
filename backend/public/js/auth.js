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
    picker.querySelectorAll('.role-pill').forEach(p=>p.addEventListener('click', ()=>{
      picker.querySelectorAll('.role-pill').forEach(x=>x.classList.remove('active'));
      p.classList.add('active'); hidden.value = p.dataset.role;
    }));
    // default
    const active = picker.querySelector('.role-pill.active');
    if(active) hidden.value = active.dataset.role; else { const first = picker.querySelector('.role-pill'); if(first){first.classList.add('active'); hidden.value = first.dataset.role;} }
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if(loginForm){ attachRoleSelector(loginForm);
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const formData = new FormData(loginForm);
      const f = Object.fromEntries(formData);
      
      // Debug logging
      console.log('Form data extracted:', { email: f.email, username: f.username, password: f.password ? '***' : 'MISSING', role: f.role });
      
      // Ensure email is set
      const email = f.email || f.username;
      const password = f.password;
      
      if (!email || !password) {
        console.error('Missing email or password', { email, password });
        showToast('Email and password are required');
        return;
      }
      
      const payload = { email, password };
      console.log('Sending login request with:', { email: payload.email, password: '***' });
      
      try{
        const res = await fetch('/api/auth/login', { 
          method:'POST', 
          headers:{'Content-Type':'application/json'}, 
          body: JSON.stringify(payload)
        });
        const j = await res.json();
        console.log('Login response:', { status: res.status, ok: res.ok, hasToken: !!j.token, error: j.error });
        
        if(res.ok && j.token){
          localStorage.setItem('token', j.token);
          localStorage.setItem('role', f.role || 'freelancer');
          showToast('Login successful');
          // redirect to role-specific dashboard
          setTimeout(()=>{
            const role = f.role || 'freelancer';
            const dest = (role === 'freelancer') ? '/freelancer-dashboard/' : '/dashboard-buyer/';
            location.href = dest;
          }, 600);
        } else {
          console.error('Login failed:', j.error || 'Unknown error');
          showToast(j.error || 'Login failed');
        }
      }catch(err){ console.error('Login network error:', err); showToast('Network error: ' + err.message); }
    });
  }

  // Register form
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
  document.querySelectorAll('[data-action="logout"]').forEach(b=>b.addEventListener('click', ()=>{ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='/login.html'; }));
});