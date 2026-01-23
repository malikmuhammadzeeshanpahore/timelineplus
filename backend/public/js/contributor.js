document.addEventListener('DOMContentLoaded', ()=>{
  const token = ()=>localStorage.getItem('token');
  function authHeaders(){ const t = token(); return t?{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+t }:{ 'Content-Type':'application/json' }; }
  const tasksList = document.getElementById('tasksList');
  const completed = document.getElementById('completedActivities');
  const perf = document.getElementById('performanceScore');

  async function loadTasks(){
    try{
      const res = await fetch('/api/tasks', { headers: authHeaders() });
      if(!res.ok) return;
      const j = await res.json();
      const tasks = j.tasks || [];
      if(!tasks.length) tasksList.innerHTML = '<div class="small">No available campaign tasks at the moment.</div>';
      else{
        tasksList.innerHTML = '';
        tasks.forEach(t=>{
          const li = document.createElement('li'); li.style.marginBottom = '12px';
          li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${t.title}</strong><div class="small">${t.description||''}</div></div><div style="text-align:right"><div class="small">Reward: PKR ${(t.price/100).toFixed(2)}</div><button class="btn-primary join" data-id="${t.id}" style="margin-top:6px">Join Campaign</button></div></div>`;
          tasksList.appendChild(li);
        });
        // attach join handlers
        tasksList.querySelectorAll('.join').forEach(b=>b.addEventListener('click', async ()=>{
          const id = b.dataset.id;
          try{
            const r = await fetch('/api/tasks/'+id+'/start', { method:'POST', headers: authHeaders() });
            const jr = await r.json();
            if(r.ok){ showJoinModal(jr.task); } else { showToast(jr.error || 'Unable to join'); }
          }catch(err){ console.error(err); showToast('Network error'); }
        }));
      }
    }catch(err){ console.error(err); }
  }

  // show simple modal to submit engagement URL
  function showJoinModal(task){
    const modal = document.createElement('div'); modal.className='modal';
    modal.innerHTML = `<div class="modal-card"><h3>Join Campaign — ${task.title}</h3><p class="small">Submit Engagement URL after completing the Engagement Action.</p><input id="modalProofUrl" placeholder="Verification URL" style="width:100%;margin-top:8px"/><textarea id="modalNotes" placeholder="Notes (optional)" style="width:100%;margin-top:8px"></textarea><div style="text-align:right;margin-top:8px"><button class="btn-outline" id="modalCancel">Cancel</button> <button class="btn-primary" id="modalSubmit">Submit Engagement URL</button></div></div>`;
    document.body.appendChild(modal);
    document.getElementById('modalCancel').addEventListener('click', ()=>modal.remove());
    document.getElementById('modalSubmit').addEventListener('click', async ()=>{
      const url = document.getElementById('modalProofUrl').value;
      const notes = document.getElementById('modalNotes').value;
      if(!url) return showToast('Please enter a Verification URL');
      try{
        const res = await fetch('/api/tasks/'+task.id+'/proof', { method:'POST', headers: authHeaders(), body: JSON.stringify({ proofUrl: url, notes }) });
        const j = await res.json();
        if(res.ok){ showToast('Submission received'); modal.remove(); loadCompleted(); } else showToast(j.error || 'Submit failed');
      }catch(err){ console.error(err); showToast('Network error'); }
    });
  }

  async function loadCompleted(){
    try{
      const res = await fetch('/api/tasks/history/me', { headers: authHeaders() });
      if(!res.ok) return;
      const j = await res.json();
      const proofs = j.proofs || [];
      if(!proofs.length) completed.innerHTML = '<div class="small">No submissions yet.</div>';
      else{
        completed.innerHTML = '';
        proofs.forEach(p=>{
          const d = document.createElement('div'); d.className='small'; d.style.marginBottom='8px';
          const link = p.proofUrl ? ` — <a href="${p.proofUrl}" target="_blank">View Verification</a>` : '';
          d.innerHTML = `Task #${p.taskId} — <strong>${p.status}</strong>${link}`;
          completed.appendChild(d);
        });
      }
    }catch(err){ console.error(err); }
  }

  // small toast helper reused
  function showToast(msg, timeout=2500){
    let wrap = document.querySelector('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div'); t.className='toast'; t.innerText = msg; wrap.appendChild(t);
    setTimeout(()=>{ t.style.opacity = '0'; setTimeout(()=>t.remove(),300); }, timeout);
  }

  // link rewards wallet withdraw form to payments endpoint
  const wForm = document.getElementById('contrib-withdraw-form');
  if(wForm){ wForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const amt = document.getElementById('contrib-withdraw-amount').value;
    const method = document.getElementById('contrib-withdraw-method').value;
    const details = document.getElementById('contrib-withdraw-details').value;
    if(!amt || Number(amt)<=0) return showToast('Enter a valid amount');
    try{
      const cents = Math.round(Number(amt)*100);
      const res = await fetch('/api/wallet/withdraw', { method:'POST', headers: authHeaders(), body: JSON.stringify({ amount: cents, method, details }) });
      const j = await res.json();
      if(res.ok){ showToast('Payout request submitted'); wForm.reset(); fetchBalance(); loadCompleted(); } else showToast(j.error || 'Request failed');
    }catch(err){ console.error(err); showToast('Network error'); }
  }); }

  // fetch and show a simple performance score (placeholder)
  function loadPerformanceScore(){
    // placeholder: compute from completed tasks
    perf.innerText = '—';
    // in future, call /api/users/me/stats
  }

  // reuse wallet balance loader
  async function fetchBalance(){
    try{
      const res = await fetch('/api/wallet/balance/me', { headers: authHeaders() });
      if(res.status===401){ return; }
      const j = await res.json(); const raw = (j.balance!=null)? j.balance : 0; const v = (raw===0)? '0.00': (Number(raw)/100).toFixed(2);
      document.getElementById('contrib-wallet-balance').innerText = v;
    }catch(err){ console.error(err); }
  }

  // initial load
  loadTasks(); loadCompleted(); loadPerformanceScore(); fetchBalance();
});