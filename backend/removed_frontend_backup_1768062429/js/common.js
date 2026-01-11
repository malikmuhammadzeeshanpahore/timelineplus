// Common helpers used by pages
const API = (path, opts={}) => {
  opts.headers = opts.headers || {};
  if (!opts.headers['Content-Type']) opts.headers['Content-Type'] = 'application/json';
  if (localStorage.getItem('token')) opts.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
  return fetch(path, opts).then(async r => {
    const txt = await r.text();
    try { return JSON.parse(txt); } catch (e) { return txt; }
  });
};

// Simple toast using Bootstrap
function showToast(title, message, delay=3000){
  const cont = document.querySelector('.toast-container') || (()=>{ const d=document.createElement('div'); d.className='toast-container'; document.body.appendChild(d); return d; })();
  const id = 't'+Date.now();
  const html = `<div id="${id}" class="toast align-items-start" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}">
    <div class="d-flex">
      <div class="toast-body"><strong>${title}</strong><div>${message}</div></div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  </div>`;
  cont.insertAdjacentHTML('beforeend', html);
  const el = document.getElementById(id);
  const bs = new bootstrap.Toast(el); bs.show();
  el.addEventListener('hidden.bs.toast', ()=>el.remove());
}

// Gradient background disabled - use a simple static background
(function gradientBG(){
  const el = document.getElementById('gradient');
  if(!el) return;
  el.style.display = 'none';
})();

// Simple toggle handling
function initToggles(){ document.querySelectorAll('.btn-toggle').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('active'))); }

// Basic auth helpers
async function login(email, password){ const res = await API('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) }); if(res.token){ localStorage.setItem('token', res.token); showToast('Success','Logged in'); return true; } showToast('Error',(res.error || 'Login failed')); return false; }
async function register(data){ const res = await API('/api/auth/register', { method:'POST', body: JSON.stringify(data) }); if(res.success){ showToast('Success','Registered'); return true; } showToast('Error',(res.error || 'Register failed')); return false; }

// Initialize login/register forms with role selector (without modifying HTML)
function initAuthForms(){
  const setupForm = (formId, defaultRole, infoText) => {
    const form = document.getElementById(formId);
    if(!form || form.dataset.authInit) return;
    form.dataset.authInit = '1';

    // insert role selector at top of form
    const wrapper = document.createElement('div'); wrapper.className = 'role-selector';
    wrapper.innerHTML = `<div class="role-pill" data-role="freelancer">Freelancer</div><div class="role-pill" data-role="buyer">Buyer</div>`;
    form.insertBefore(wrapper, form.firstElementChild);

    // hidden role input
    let hidden = form.querySelector('input[name="role"]');
    if(!hidden){ hidden = document.createElement('input'); hidden.type='hidden'; hidden.name='role'; hidden.value=defaultRole; form.appendChild(hidden); }

    const pills = wrapper.querySelectorAll('.role-pill');
    const setRole = (r)=>{
      hidden.value = r;
      pills.forEach(p=>p.classList.toggle('active', p.dataset.role === r));
      // update small descriptive text in the company info block if present
      const ci = document.querySelector('.company__info');
      if(ci){
        const h = ci.querySelector('h2'); const p = ci.querySelector('p');
        if(r === 'freelancer'){ if(h) h.textContent = 'Freelancer — Earn by completing tasks'; if(p) p.textContent = infoText.freelancer; }
        else { if(h) h.textContent = 'Buyer — Purchase services for promotion'; if(p) p.textContent = infoText.buyer; }
      }
    };

    pills.forEach(p=>p.addEventListener('click', ()=> setRole(p.dataset.role)));
    setRole(defaultRole);

    // intercept submit (capture phase) and include role in payload
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      const f = Object.fromEntries(new FormData(form));
      const role = f.role || defaultRole;
      if(formId === 'registerForm'){
        const ok = await TP.register({ email: f.email, password: f.password, username: f.username, role });
        if(ok) location.href = '/login.html';
        return;
      }
      if(formId === 'loginForm'){
        const ok = await TP.login(f.email, f.password);
        if(ok){ localStorage.setItem('role', role); location.href = (role === 'buyer') ? '/dashboard.html' : '/tasks.html'; }
      }
    }, true);
  };

  setupForm('registerForm', 'freelancer', { freelancer: 'Complete tasks and get paid after admin review.', buyer: 'Buy services like subscribers and watch time from trusted workers.'});
  setupForm('loginForm', 'freelancer', { freelancer: 'Login to start completing tasks.', buyer: 'Login to manage your campaigns and purchases.'});
}

// Additional UI interactions (left/right area toggles, active navs, sticky header)
function initAppLayout(){
  // active nav links
  document.querySelectorAll('.item-link').forEach(el=>el.addEventListener('click',(e)=>{ e.preventDefault(); document.querySelectorAll('.item-link').forEach(x=>x.classList.remove('active')); el.classList.add('active'); }));

  // show/hide left/right
  const leftArea = document.querySelector('.left-area');
  const rightArea = document.querySelector('.right-area');
  document.querySelectorAll('.btn-show-left-area').forEach(b=>b.addEventListener('click', ()=>{ leftArea && leftArea.classList.add('show'); }));
  document.querySelectorAll('.btn-show-right-area').forEach(b=>b.addEventListener('click', ()=>{ rightArea && rightArea.classList.add('show'); }));
  document.querySelectorAll('.btn-close-left').forEach(b=>b.addEventListener('click', ()=>{ leftArea && leftArea.classList.remove('show'); }));
  document.querySelectorAll('.btn-close-right').forEach(b=>b.addEventListener('click', ()=>{ rightArea && rightArea.classList.remove('show'); }));

  // sticky main header
  const mainArea = document.querySelector('.main-area');
  const mainHeader = document.querySelector('.main-area-header');
  if(mainArea && mainHeader){ mainArea.addEventListener('scroll', ()=>{ if(mainArea.scrollTop >= 88) mainHeader.classList.add('fixed'); else mainHeader.classList.remove('fixed'); }); }

  // close panels with Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      leftArea && leftArea.classList.remove('show');
      rightArea && rightArea.classList.remove('show');
    }
  });

  // click outside to close (on small screens)
  document.addEventListener('click', (e)=>{
    const target = e.target;
    if(leftArea && leftArea.classList.contains('show')){
      if(!leftArea.contains(target) && !target.closest('.btn-show-left-area')) leftArea.classList.remove('show');
    }
    if(rightArea && rightArea.classList.contains('show')){
      if(!rightArea.contains(target) && !target.closest('.btn-show-right-area')) rightArea.classList.remove('show');
    }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { initAppLayout(); initToggles(); initAuthForms(); }); else { initAppLayout(); initToggles(); initAuthForms(); }

// Export small API for pages
window.TP = { API, showToast, initToggles, login, register };
