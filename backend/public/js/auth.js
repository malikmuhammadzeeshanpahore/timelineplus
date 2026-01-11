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
      const f = Object.fromEntries(new FormData(loginForm));
      try{
        const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: f.username || f.email, password: f.password }) });
        const j = await res.json();
        if(res.ok && j.token){
          localStorage.setItem('token', j.token);
          localStorage.setItem('role', f.role || 'freelancer');
          showToast('Login successful');
          // redirect based on role
          setTimeout(()=>{ location.href = (localStorage.getItem('role')==='buyer')?'/dashboard-buyer.html':'/dashboard-freelancer.html'; }, 600);
        } else {
          showToast(j.error || 'Login failed');
        }
      }catch(err){ console.error(err); showToast('Network error'); }
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