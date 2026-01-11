document.addEventListener('DOMContentLoaded', ()=>{
  // small toast helper
  function showToast(msg, timeout=2500){
    let wrap = document.querySelector('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div'); t.className='toast'; t.innerText = msg; wrap.appendChild(t);
    setTimeout(()=>{ t.style.opacity = '0'; setTimeout(()=>t.remove(),300); }, timeout);
  }

  const token = ()=>localStorage.getItem('token');
  function authHeaders(){ const t = token(); return t?{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+t }:{ 'Content-Type':'application/json' }; }

  async function fetchBalance(){
    try{
      const res = await fetch('/api/wallet/balance/me', { headers: authHeaders() });
      if(res.status===401){ showToast('Please login'); setTimeout(()=>location.href='/login.html',600); return; }
      const j = await res.json();
      const raw = (j.balance!=null)? j.balance : 0;
      // amounts stored in DB are in cents -> convert to dollars
      const v = (raw === 0) ? '0.00' : (Number(raw)/100).toFixed(2);
      // update all balance placeholders (buyer & contributor IDs included)
      document.querySelectorAll('#wallet-balance, .wallet-balance, #buyer-wallet-balance, #contrib-wallet-balance').forEach(el=> el.innerText = v);
    }catch(err){ console.error(err); }
  }

  // top-up
  const topupForm = document.getElementById('topup-form');
  if(topupForm){ topupForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const amt = document.getElementById('topup-amount').value;
    if(!amt || Number(amt)<=0) return showToast('Enter a valid amount');
    try{
      // user enters dollars, convert to cents integer
      const cents = Math.round(Number(amt) * 100);
      const res = await fetch('/api/wallet/topup', { method:'POST', headers: authHeaders(), body: JSON.stringify({ amount: cents }) });
      const j = await res.json();
      if(res.ok){ showToast('Top-up recorded'); document.getElementById('topup-amount').value=''; fetchBalance(); }
      else showToast(j.error || (typeof j === 'string' ? j : 'Top-up failed'));
    }catch(err){ console.error(err); showToast('Network error'); }
  }); }

  // withdraw
  const withdrawForm = document.getElementById('withdraw-form');
  if(withdrawForm){ withdrawForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const amt = document.getElementById('withdraw-amount').value;
    const method = document.getElementById('withdraw-method').value;
    const details = document.getElementById('withdraw-details').value;
    if(!amt || Number(amt)<=0) return showToast('Enter a valid amount');
    try{
      // convert dollars to cents
      const cents = Math.round(Number(amt) * 100);
      const res = await fetch('/api/wallet/withdraw', { method:'POST', headers: authHeaders(), body: JSON.stringify({ amount: cents, method, details }) });
      const j = await res.json();
      if(res.ok){ showToast('Withdraw request submitted'); withdrawForm.reset(); fetchBalance(); }
      else showToast(j.error || (typeof j === 'string' ? j : 'Withdraw failed'));
    }catch(err){ console.error(err); showToast('Network error'); }
  }); }

  // initial fetch
  fetchBalance();
});