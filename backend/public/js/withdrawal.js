document.addEventListener('DOMContentLoaded', ()=>{
  const token = ()=>localStorage.getItem('token');
  function authHeaders(){ const t = token(); return t?{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+t }:{ 'Content-Type':'application/json' }; }
  const accHolder = document.getElementById('accHolder');
  const accType = document.getElementById('accType');
  const accNumber = document.getElementById('accNumber');
  const savedMsg = document.getElementById('savedMsg');

  async function load(){
    try{
      const res = await fetch('/api/account/withdrawal-details', { headers: authHeaders() });
      if(res.status===401) return;
      const j = await res.json();
      if(j.details){ accHolder.value = j.details.accountHolder; accType.value = j.details.accountType; accNumber.value = j.details.accountNumber; savedMsg.innerText = 'Loaded saved info'; }
    }catch(err){ console.error(err); }
  }

  document.getElementById('wdForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = { accountHolder: accHolder.value, accountType: accType.value, accountNumber: accNumber.value };
    try{
      const res = await fetch('/api/account/withdrawal-details', { method:'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      if(res.ok){ showToast('Saved'); savedMsg.innerText = 'Saved ' + new Date().toLocaleString(); }
      else { const j = await res.text(); showToast(j || 'Save failed'); }
    }catch(err){ console.error(err); showToast('Network error'); }
  });

  load();
});