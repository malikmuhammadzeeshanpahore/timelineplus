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
    if(!picker) {
      console.log('❌ No role selector found in form');
      return;
    }
    
    // Create or find hidden input
    let hidden = form.querySelector('input[name="role"]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'role';
      form.appendChild(hidden);
      console.log('✅ Created hidden role input');
    }
    
    // Set initial value from active pill
    const initialActive = picker.querySelector('.role-pill.active');
    if (initialActive) {
      hidden.value = initialActive.getAttribute('data-role');
      console.log('📍 Initial role set to:', hidden.value);
    }
    
    // Attach click handlers to all pills
    picker.querySelectorAll('.role-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        // Remove active class from all pills
        picker.querySelectorAll('.role-pill').forEach(p => p.classList.remove('active'));
        // Add active class to clicked pill
        pill.classList.add('active');
        // Update hidden input
        hidden.value = pill.getAttribute('data-role');
        console.log('🔄 Role changed to:', hidden.value);
      });
    });
  }

  const loginForm = document.getElementById('loginForm');
  if(loginForm){
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
      
      console.log('📝 Login attempt:', { email });
      
      const payload = { email, password };
      
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
            console.log('✅ Token saved. Role:', j.user?.role);
            // Do NOT save role to localStorage - verify from backend on each page
          } catch(e) {
            showToast('Cannot save session data');
            return;
          }
          
          showToast('Login successful');
          setTimeout(()=>{
            const role = j.user?.role;
            if (role === 'admin') {
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
  if(regForm){ 
    attachRoleSelector(regForm);
    regForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const f = Object.fromEntries(new FormData(regForm));
      console.log('📝 Register form data:', f);
      
      // Get role value from hidden input or active pill
      let roleValue = f.role;
      if (!roleValue) {
        const activePill = regForm.querySelector('.role-pill.active');
        if (activePill) {
          roleValue = activePill.getAttribute('data-role');
          console.log('⚠️ Role from FormData was empty, using active pill:', roleValue);
        }
      }
      if (!roleValue) {
        roleValue = 'freelancer'; // Default
        console.log('⚠️ Role still empty, defaulting to freelancer');
      }
      
      const payload = { email: f.email, username: f.username, password: f.password, role: roleValue };
      console.log('📤 Sending register payload:', payload);
      try{
        const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        console.log('📨 Register response status:', res.status);
        const j = await res.json();
        console.log('📦 Register response:', j);
        if(res.ok && (j.success || j.user)){
          showToast('Registered successfully');
          // Do NOT save role to localStorage - it will be verified from database on next login
          console.log('✅ Registration complete. Role will be verified from database on login.');
          setTimeout(()=>location.href = '/',700);
        } else {
          showToast(j.error || 'Register failed');
        }
      }catch(err){ console.error('❌ Register error:', err); showToast('Network error'); }
    });
  }

  // Logout buttons
  document.querySelectorAll('[data-action="logout"]').forEach(b=>b.addEventListener('click', (e)=>{ 
    e.preventDefault();
    e.stopPropagation();
    console.log('🚪 Logout clicked, clearing session');
    localStorage.removeItem('token'); 
    localStorage.removeItem('role');  // Remove if exists from old system
    localStorage.removeItem('adminSecret');
    sessionStorage.clear();
    location.href='/'; 
  }));
});