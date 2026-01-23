// Withdrawal Details Handler
(function() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/register/';
    return;
  }

  // Load existing withdrawal details
  async function loadWithdrawalDetails() {
    try {
      const res = await fetch(`${window.location.origin}/api/account/withdrawal-details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.details) {
          const holder = document.getElementById('accountHolder');
          const type = document.getElementById('accountType');
          const number = document.getElementById('accountNumber');
          
          if (holder) holder.value = data.details.accountHolder || '';
          if (type) type.value = data.details.accountType || 'jazzcash';
          if (number) number.value = data.details.accountNumber || '';
        }
      }
    } catch (err) {
      console.error('Failed to load withdrawal details:', err);
    }
  }

  // Handle form submission
  function setupFormHandler() {
    const form = document.getElementById('withdrawalForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const accountHolder = document.getElementById('accountHolder').value.trim();
      const accountType = document.getElementById('accountType').value;
      const accountNumber = document.getElementById('accountNumber').value.trim();
      const submitBtn = document.getElementById('submitBtn');
      const savedMsg = document.getElementById('savedMsg');

      if (!accountHolder || !accountNumber) {
        showMessage('Please fill in all fields', false);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      try {
        const res = await fetch(`${window.location.origin}/api/account/withdrawal-details`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accountHolder,
            accountType,
            accountNumber
          })
        });

        if (res.ok) {
          showMessage('✓ Withdrawal details saved successfully', true);
        } else {
          showMessage('✗ Failed to save details', false);
        }
      } catch (err) {
        console.error('Error saving withdrawal details:', err);
        showMessage('✗ Error: ' + err.message, false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Info';
      }
    });
  }

  function showMessage(msg, isSuccess) {
    const savedMsg = document.getElementById('savedMsg');
    if (!savedMsg) return;
    
    savedMsg.textContent = msg;
    savedMsg.className = isSuccess ? 'success' : 'error';
    savedMsg.style.display = 'block';
    
    setTimeout(() => {
      savedMsg.style.display = 'none';
    }, 3000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadWithdrawalDetails();
      setupFormHandler();
    });
  } else {
    loadWithdrawalDetails();
    setupFormHandler();
  }
})();
