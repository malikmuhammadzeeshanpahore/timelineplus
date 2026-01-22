document.addEventListener('DOMContentLoaded', ()=>{
  const token = ()=>localStorage.getItem('token');
  function authHeaders(){ const t = token(); return t?{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+t }:{ 'Content-Type':'application/json' }; }

  const nameEl = document.getElementById('pf-name');
  const userEl = document.getElementById('pf-username');
  const emailEl = document.getElementById('pf-email');
  const ageEl = document.getElementById('pf-age');
  const genderEl = document.getElementById('pf-gender');
  const cityEl = document.getElementById('pf-city');
  const balEl = document.getElementById('pf-balance');
  const socialList = document.getElementById('socialList');
  let currentUser = null;

  async function load(){
    try{
      const res = await fetch('/api/user/me', { headers: authHeaders() });
      if(res.status===401){ return; }
      const j = await res.json();
      const u = j.user;
      currentUser = u;
      nameEl.innerText = u.username || u.email || 'Account Holder';
      userEl.innerText = u.username || '-';
      emailEl.innerText = u.email;
      ageEl && (ageEl.innerText = (u.age!=null)? String(u.age) : '-');
      genderEl && (genderEl.innerText = u.gender || '-');
      cityEl && (cityEl.innerText = u.city || '-');
      const raw = (j.balance!=null)? j.balance:0; balEl.innerText = (raw===0)? '0.00' : (Number(raw)/100).toFixed(2);
      renderUserPanel(u, raw);
    }catch(err){ console.error(err); }

    await loadSocial();
  }

  async function loadSocial(){
    try{
      const res = await fetch('/api/user/social', { headers: authHeaders() });
      if(!res.ok) return;
      const j = await res.json();
      if(!j.social || !j.social.length) socialList.innerHTML = '<div class="small">No linked social accounts.</div>';
      else socialList.innerHTML = j.social.map(s=>`<div>${s.provider} — ${s.status}</div>`).join('');
    }catch(err){ console.error(err); }
  }

  function renderUserPanel(u, rawBalance){
    const panel = document.getElementById('userPanel');
    if(!panel) return;
    panel.innerHTML = '';
    const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.alignItems='center'; wrapper.style.gap='10px';
    const avatar = document.createElement('div'); avatar.className='pill'; avatar.style.width='36px'; avatar.style.height='36px'; avatar.style.display='flex'; avatar.style.alignItems='center'; avatar.style.justifyContent='center'; avatar.innerText = (u.username||u.email||'U')[0].toUpperCase();
    const info = document.createElement('div'); info.style.textAlign='right'; info.innerHTML = `<div style="font-weight:700;color:#fff">${u.username||u.email}</div><div class="small">$${(rawBalance/100||0).toFixed(2)}</div>`;
    const menu = document.createElement('div'); menu.innerHTML = `<a href='/profile.html' class='btn-outline' style='margin-left:8px;padding:6px 10px;'>Profile</a> <button id='navLogout' class='btn-outline' style='margin-left:6px;padding:6px 10px;'>Logout</button>`;
    wrapper.appendChild(avatar); wrapper.appendChild(info); wrapper.appendChild(menu);
    panel.appendChild(wrapper);
    document.getElementById('navLogout')?.addEventListener('click', ()=>{ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='/login.html'; });
  }

  document.getElementById('btnLogout')?.addEventListener('click', ()=>{ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='/login.html'; });

  document.getElementById('link-google')?.addEventListener('click', ()=>{ window.open('/api/auth/oauth/google','_blank','width=600,height=700'); showToast('A popup will open to complete Google linking.'); });
  document.getElementById('link-facebook')?.addEventListener('click', ()=>{ window.open('/api/auth/oauth/facebook','_blank','width=600,height=700'); showToast('A popup will open to complete Facebook linking.'); });
  document.getElementById('refresh-social')?.addEventListener('click', ()=>loadSocial());

  document.getElementById('btnEditProfile')?.addEventListener('click', async ()=>{
    if(!currentUser) return showToast('Profile not loaded yet');
    const fullName = prompt('Full name', currentUser.fullName || '');
    const age = prompt('Age (leave empty to unset)', currentUser.age!=null?String(currentUser.age):'');
    const gender = prompt('Gender', currentUser.gender || '');
    const city = prompt('City', currentUser.city || '');
    const payload = { fullName, age: age===''?null:age, gender, city };
    try{
      const res = await fetch('/api/user/profile/update', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const j = await res.json();
      if(res.ok){ showToast('Profile updated'); load(); } else { showToast(j.error || 'Update failed'); }
    }catch(err){ console.error(err); showToast('Network error'); }
  });

  load();
});