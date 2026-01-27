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
      nameEl.innerText = u.fullName || u.username || u.email || 'Account Holder';
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
    const avatar = document.createElement('div'); avatar.className='pill'; avatar.style.width='36px'; avatar.style.height='36px'; avatar.style.display='flex'; avatar.style.alignItems='center'; avatar.style.justifyContent='center'; const displayName = u.fullName || u.username || u.email || 'U'; avatar.innerText = (displayName[0]||'U').toUpperCase();
    const info = document.createElement('div'); info.style.textAlign='right'; info.innerHTML = `<div style="font-weight:700;color:#fff">${displayName}</div><div class="small">PKR ${(rawBalance/100||0).toFixed(2)}</div>`;
    const menu = document.createElement('div'); menu.innerHTML = `<a href='/profile.html' class='btn-outline' style='margin-left:8px;padding:6px 10px;'>Profile</a> <button id='navLogout' class='btn-outline' style='margin-left:6px;padding:6px 10px;'>Logout</button>`;
    wrapper.appendChild(avatar); wrapper.appendChild(info); wrapper.appendChild(menu);
    panel.appendChild(wrapper);
    document.getElementById('navLogout')?.addEventListener('click', ()=>{ localStorage.removeItem('token'); localStorage.removeItem('role'); location.href='/login.html'; });
  }

  // Modal functions
  function openEditModal() {
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    
    // Pre-fill form with current data
    document.getElementById('editName').value = currentUser?.name || '';
    document.getElementById('editEmail').value = currentUser?.email || '';
    document.getElementById('editAge').value = currentUser?.age || '';
    document.getElementById('editGender').value = currentUser?.gender || '';
    document.getElementById('editCity').value = currentUser?.city || '';
    
    modal.classList.add('active');
  }

  function closeEditModal() {
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    modal.classList.remove('active');
  }

  async function handleEditProfileSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const age = document.getElementById('editAge').value;
    const gender = document.getElementById('editGender').value;
    const city = document.getElementById('editCity').value.trim();
    const msgEl = document.getElementById('editMsg');
    const submitBtn = e.target.querySelector('[type="submit"]');
    
    if (!name || !email) {
      showMessage(msgEl, 'Name and Email are required', false);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      const res = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          fullName: name,
          email,
          age: age ? parseInt(age) : null,
          gender: gender || null,
          city: city || null
        })
      });

      const data = await res.json().catch(()=>null);
      if (res.ok) {
        // If server returned updated user, update DOM immediately
        if (data && data.user) {
          currentUser = data.user;
          // Update displayed fields immediately
          document.getElementById('pf-name').innerText = currentUser.fullName || currentUser.username || currentUser.email || 'Account Holder';
          document.getElementById('pf-username').innerText = currentUser.username || '-';
          document.getElementById('pf-email').innerText = currentUser.email || '-';
          document.getElementById('pf-age') && (document.getElementById('pf-age').innerText = currentUser.age!=null? String(currentUser.age) : '-');
          document.getElementById('pf-gender') && (document.getElementById('pf-gender').innerText = currentUser.gender || '-');
          document.getElementById('pf-city') && (document.getElementById('pf-city').innerText = currentUser.city || '-');
        }
        showMessage(msgEl, '✓ Profile updated successfully', true);
        setTimeout(() => {
          closeEditModal();
          load(); // reload to sync any server-side changes
        }, 900);
      } else {
        showMessage(msgEl, '✗ ' + ((data && data.error) || 'Update failed'), false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showMessage(msgEl, '✗ Network error: ' + err.message, false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  }

  function showMessage(el, msg, isSuccess) {
    el.textContent = msg;
    el.className = isSuccess ? 'success' : 'error';
    el.style.display = 'block';
  }

  // Event listeners for edit profile modal
  document.querySelector('[data-action="edit-profile"]')?.addEventListener('click', function(e) {
    e.preventDefault();
    openEditModal();
  });

  // Delegated handling for modal close so both edit and switch modals use it
  document.addEventListener('click', function(e) {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const action = a.getAttribute('data-action');
    if (action === 'close-modal') {
      e.preventDefault();
      closeEditModal();
      const sModal = document.getElementById('switchRoleModal'); if (sModal) sModal.classList.remove('active');
    }
    if (action === 'edit-profile') { e.preventDefault(); openEditModal(); }
    if (action === 'switch-role') { e.preventDefault(); const switchRoleModal = document.getElementById('switchRoleModal'); if (switchRoleModal) switchRoleModal.classList.add('active'); }
    if (action === 'logout') { e.preventDefault(); localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/'; }
    if (action === 'link-google') { e.preventDefault(); window.location.href = '/api/auth/oauth/google'; }
    if (action === 'link-facebook') { e.preventDefault(); window.location.href = '/api/auth/oauth/facebook'; }
    if (action === 'switch-to-buyer') { e.preventDefault(); localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.setItem('switchRole', 'buyer'); window.location.href = '/register/'; }
    if (action === 'switch-to-freelancer') { e.preventDefault(); localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.setItem('switchRole', 'freelancer'); window.location.href = '/register/'; }
    if (action === 'invite-team') {
      e.preventDefault(); openInviteModal(); }
  });

  const editForm = document.getElementById('editProfileForm');
  if (editForm) {
    editForm.addEventListener('submit', handleEditProfileSubmit);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeEditModal();
      }
    });
  }

  // Switch role modal
  const switchRoleModal = document.getElementById('switchRoleModal');
  if (switchRoleModal) {
    switchRoleModal.addEventListener('click', function(e) {
      if (e.target === switchRoleModal) {
        switchRoleModal.classList.remove('active');
      }
    });
  }

  document.querySelector('[data-action="switch-role"]')?.addEventListener('click', function(e) {
    e.preventDefault();
    const switchRoleModal = document.getElementById('switchRoleModal');
    if (switchRoleModal) switchRoleModal.classList.add('active');
  });

  document.querySelector('[data-action="switch-to-buyer"]')?.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.setItem('switchRole', 'buyer');
    window.location.href = '/register/';
  });

  document.querySelector('[data-action="switch-to-freelancer"]')?.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.setItem('switchRole', 'freelancer');
    window.location.href = '/register/';
  });

  document.querySelector('[data-action="logout"]')?.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  });

  document.querySelector('[data-action="link-google"]')?.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = '/api/auth/oauth/google';
  });

  document.querySelector('[data-action="link-facebook"]')?.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = '/api/auth/oauth/facebook';
  });

  load();
  // Invite modal handlers
  function openInviteModal() {
    const modal = document.getElementById('inviteModal');
    if (!modal) return;
    // generate code and link
    const code = generateInviteCode();
    const link = `${window.location.origin}/register/?invite=${code}`;
    document.getElementById('inviteCode').value = code;
    document.getElementById('inviteLink').value = link;
    modal.classList.add('active');
  }

  function closeInviteModal() {
    const modal = document.getElementById('inviteModal'); if (!modal) return; modal.classList.remove('active');
  }

  function generateInviteCode() {
    // simple code: 8 chars uppercase alnum
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i=0;i<8;i++) out += chars.charAt(Math.floor(Math.random()*chars.length));
    return out;
  }

  document.getElementById('copyInviteBtn')?.addEventListener('click', function(e){
    const link = document.getElementById('inviteLink'); if (!link) return; navigator.clipboard?.writeText(link.value).then(()=>{ alert('Invite link copied'); }).catch(()=>{ alert('Copy failed'); });
  });

  document.getElementById('regenInviteBtn')?.addEventListener('click', function(e){
    const code = generateInviteCode(); const link = `${window.location.origin}/register/?invite=${code}`; document.getElementById('inviteCode').value = code; document.getElementById('inviteLink').value = link;
  });

  // close invite modal on clicking close button
  document.querySelector('[data-action="close-invite"]')?.addEventListener('click', function(e){ e.preventDefault(); closeInviteModal(); });
});