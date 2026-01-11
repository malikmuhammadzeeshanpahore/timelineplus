// Simple SPA with auth + API connectors
const state = { token: localStorage.getItem('token') || null, user: null };

// route metadata for SEO
const routeMeta = {
  dashboard: { title: 'TimelinePlus - Home', description: 'TimelinePlus provides real social media marketing services including Instagram followers, YouTube subscribers, watch time and promotion tools.' },
  tasks: { title: 'TimelinePlus - Tasks', description: 'Browse available social media tasks and earn credits by completing tasks with valid proof.' },
  profile: { title: 'TimelinePlus - Profile', description: 'Manage your profile, linked social accounts, and referrals.' },
  wallet: { title: 'TimelinePlus - Wallet', description: 'View your wallet balance, history, and request withdrawals.' },
  about: { title: 'About TimelinePlus', description: 'About TimelinePlus - Legal social media marketing services.' },
  terms: { title: 'TimelinePlus - Terms', description: 'Terms of service for TimelinePlus.' },
  privacy: { title: 'TimelinePlus - Privacy', description: 'Privacy policy for TimelinePlus.' },
  contact: { title: 'Contact TimelinePlus', description: 'Contact support@timelineplus.site for assistance.' }
};

function setMeta(route){
  const meta = routeMeta[route] || routeMeta.dashboard;
  document.title = meta.title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', meta.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', meta.description);
}

function api(path, opts={}) {
  opts.headers = opts.headers || {};
  opts.headers['Content-Type'] = 'application/json';
  if (state.token) opts.headers['Authorization'] = 'Bearer ' + state.token;
  return fetch(path, opts).then(async r => {
    const txt = await r.text();
    try { return JSON.parse(txt); } catch (e) { return txt; }
  });
}

// Router
function show(route) {
  const pageEl = document.getElementById('page-' + route);
  if (!pageEl) { console.warn('No page for route', route); return; }
  document.querySelectorAll('[id^="page-"]').forEach(el => el.classList.add('d-none'));
  pageEl.classList.remove('d-none');
  setMeta(route);
  // if page content can be provided by backend, fetch and render it (helps keep legal pages editable)
  const contentPages = ['about','terms','privacy','contact'];
  if (contentPages.includes(route)) {
    fetch('/api/pages/' + route).then(r => r.json()).then(j => {
      if (j && j.body) {
        pageEl.innerHTML = `<h3>${j.title}</h3>${j.body}`;
        routeMeta[route] = routeMeta[route] || {};
        routeMeta[route].title = j.title || routeMeta[route].title;
        routeMeta[route].description = j.description || routeMeta[route].description;
        setMeta(route);
      }
    }).catch(()=>{});
  }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest && e.target.closest('[data-route]');
  if (el) {
    e.preventDefault();
    const route = el.getAttribute('data-route');
    navigateTo(route);
  }
});

function navigateTo(route) {
  if (!route) return;
  show(route);
  try { history.pushState({ route }, '', '#' + route); } catch (e) {}
}

window.addEventListener('popstate', (e) => {
  const route = (e.state && e.state.route) || (location.hash ? location.hash.substr(1) : 'dashboard');
  show(route);
});

// Auth modal - robust handling
let authModal = null;
if (window.bootstrap && typeof window.bootstrap.Modal === 'function' && document.getElementById('authModal')) {
  try { authModal = new bootstrap.Modal(document.getElementById('authModal')); } catch (e) { console.warn('Bootstrap modal init failed', e); }
} else {
  console.warn('Bootstrap Modal not available; using fallback for auth modal');
}
let authMode = 'login';
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');

function showAuth(mode) {
  authMode = mode;
  const titleEl = document.getElementById('authModalTitle');
  const msgEl = document.getElementById('authMsg');
  if (titleEl) titleEl.innerText = (mode === 'login' ? 'Login' : 'Register');
  if (msgEl) msgEl.innerText = '';
  if (authModal && typeof authModal.show === 'function') {
    authModal.show();
  } else {
    // fallback: reveal modal by toggling classes
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('show', 'd-block');
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) { backdrop = document.createElement('div'); backdrop.className = 'modal-backdrop fade show'; document.body.appendChild(backdrop); }
  }
}

function closeAuth() {
  if (authModal && typeof authModal.hide === 'function') {
    authModal.hide();
  } else {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('show', 'd-block');
    const back = document.querySelector('.modal-backdrop');
    if (back) back.remove();
  }
}

if (btnLogin) btnLogin.addEventListener('click', () => showAuth('login'));
if (btnRegister) btnRegister.addEventListener('click', () => showAuth('register'));

// Profile: Link Facebook via button
const linkFbBtn = document.getElementById('link-facebook');
if (linkFbBtn) linkFbBtn.addEventListener('click', () => {
  if (typeof FB === 'undefined') return alert('Facebook SDK not loaded');
  FB.login(function(response) {
    if (response.authResponse) {
      const token = response.authResponse.accessToken;
      if (!state.token) return alert('Please login to your TimelinePlus account first');
      fetch('/api/link/facebook', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + state.token }, body: JSON.stringify({ accessToken: token }) }).then(r => r.json()).then(async () => { await loadProfile(); alert('Facebook linked'); }).catch(e => { console.error(e); alert('Link failed'); });
    } else {
      alert('Facebook login cancelled');
    }
  }, { scope: 'public_profile,email' });
});

document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(e.target));
  const msgEl = document.getElementById('authMsg');
  msgEl.innerText = '';
  if (authMode === 'login') {
    const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(form) });
    if (res.token) {
      state.token = res.token; localStorage.setItem('token', res.token); closeAuth(); await loadProfile(); show('dashboard'); alert('Logged in');
    } else {
      msgEl.innerText = (res.error || 'Login failed');
    }
  } else {
    const res = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(form) });
    if (res.success) {
      // auto-login after registration
      const loginRes = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) });
      if (loginRes.token) { state.token = loginRes.token; localStorage.setItem('token', loginRes.token); closeAuth(); await loadProfile(); show('dashboard'); alert('Registered and logged in'); }
      else { closeAuth(); alert('Registered. Check email to verify.'); }
    } else {
      msgEl.innerText = (res.error || 'Registration failed');
    }
  }
});

async function loadProfile() {
  if (!state.token) return;
  const res = await api('/api/user/me');
  if (res && res.user) { state.user = res.user; document.getElementById('profile-info').innerHTML = `<p>${res.user.email} ${res.user.username ? '- ' + res.user.username : ''}</p>`; renderConnected(res.social); document.getElementById('wallet-balance').innerText = `Balance: ${res.balance}`; }
}

function renderConnected(social) {
  const el = document.getElementById('connected-accounts');
  el.innerHTML = '';
  const providers = ['facebook','google'];
  providers.forEach(p => {
    const acc = social.find(s => s.provider === p);
    const div = document.createElement('div');
    div.className = 'mb-2 d-flex align-items-center gap-2';
    if (acc) {
      const icon = p === 'facebook' ? 'ri-facebook-circle-line' : 'ri-google-line';
      div.innerHTML = `<i class="${icon} ri-lg text-primary"></i> <strong>${p}</strong> - <small class="text-muted">${acc.providerUserId}</small> <button class="btn btn-sm btn-outline-danger ms-2" data-action="unlink" data-provider="${p}"><i class="ri-close-line"></i></button>`;
    } else {
      const icon = p === 'facebook' ? 'ri-facebook-circle-line' : 'ri-google-line';
      div.innerHTML = `<i class="${icon} ri-lg text-muted"></i> <strong>${p}</strong> - <span class="text-muted">not linked</span>`;
    }
    el.appendChild(div);
  });
}

document.getElementById('connected-accounts').addEventListener('click', async (e) => {
  if (e.target && e.target.getAttribute('data-action') === 'unlink') {
    const provider = e.target.getAttribute('data-provider');
    await api('/api/user/social/unlink', { method: 'POST', body: JSON.stringify({ provider }) });
    await loadProfile();
  }
});

// Tasks
async function loadTasks() {
  const res = await api('/api/tasks');
  const list = document.getElementById('tasks-list');
  list.innerHTML = '';
  (res.tasks || []).forEach(t => {
    const col = document.createElement('div'); col.className='col-12 col-md-6';
    const icon = t.category === 'YouTube' ? 'ri-youtube-line' : (t.category === 'Instagram' ? 'ri-instagram-line' : 'ri-briefcase-line');
    col.innerHTML = `<div class="card p-3"><h5><i class="${icon} ri-lg text-danger me-2"></i> ${t.title}</h5><p>${t.description || ''}</p><p>Price: ${t.price}</p><button class="btn btn-sm btn-primary" data-action="start" data-id="${t.id}">Start</button></div>`;
    list.appendChild(col);
  });
}

document.getElementById('tasks-list').addEventListener('click', async (e) => {
  if (e.target && e.target.getAttribute('data-action') === 'start') {
    const id = e.target.getAttribute('data-id');
    const res = await api(`/api/tasks/${id}/start`, { method: 'POST' });
    if (res.success) alert('Task started');
  }
});

// Withdraw
document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  const res = await api('/api/wallet/withdraw', { method: 'POST', body: JSON.stringify(f) });
  if (res.success) { alert('Withdraw requested'); await loadProfile(); await loadHistory(); }
  else alert('Withdraw failed: ' + JSON.stringify(res));
});

async function loadHistory(){ const res = await api('/api/wallet/history/me'); if (res.tx) { document.getElementById('wallet-history').innerHTML = '<ul>' + res.tx.map(t=>`<li>${t.type} ${t.amount} (${new Date(t.createdAt).toLocaleString()})</li>`).join('') + '</ul>'; }}

// FB SDK & check login state integration (client-side linking)
window.fbAsyncInit = function() {
  FB.init({ appId: '{your-facebook-app-id}', cookie: true, xfbml: true, version: 'v17.0' });
  FB.getLoginStatus(function(response) { statusChangeCallback(response); });
};
(function(d, s, id){ var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) {return;} js = d.createElement(s); js.id = id; js.src = "https://connect.facebook.net/en_US/sdk.js"; fjs.parentNode.insertBefore(js, fjs); }(document, 'script', 'facebook-jssdk'));
function statusChangeCallback(response) {
  if (response.status === 'connected') {
    const token = response.authResponse.accessToken;
    // send to backend for linking
    if (state.token) fetch('/api/link/facebook', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + state.token }, body: JSON.stringify({ accessToken: token }) }).then(()=>loadProfile());
  }
}
function checkLoginState(){ FB.getLoginStatus(function(response){ statusChangeCallback(response); }); }

// Google Identity SDK
function handleCredentialResponse(response) {
  const idToken = response.credential;
  if (state.token) fetch('/api/link/google', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + state.token }, body: JSON.stringify({ idToken }) }).then(()=>loadProfile());
}
(function() {
  const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.onload = () => { window.google?.accounts?.id.initialize({ client_id: '{your-google-client-id}', callback: handleCredentialResponse }); window.google?.accounts?.id.renderButton(document.getElementById('google-btn'), { theme: 'outline', size: 'large' }); };
  document.head.appendChild(s);
})();

// init
const initialRoute = location.hash ? location.hash.substr(1) : 'dashboard';
show(initialRoute);
loadTasks();
if (state.token) loadProfile();
loadHistory();
