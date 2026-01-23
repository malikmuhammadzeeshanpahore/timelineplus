// Wallet page auth - ensure buyer/freelancer can access wallet (no redirect)
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Role enforcer script will handle access control - don't redirect here
  // Both buyer and freelancer can access wallet

  try {
    // Load header
    const headerRes = await fetch('/header.html');
    if (headerRes.ok) {
      const headerHtml = await headerRes.text();
      const headerContainer = document.getElementById('headerContainer');
      if (headerContainer) {
        // Parse the header HTML to extract only the header element and nav
        const parser = new DOMParser();
        const headerDoc = parser.parseFromString(headerHtml, 'text/html');
        
        // Extract header and nav elements
        const header = headerDoc.querySelector('#header');
        const nav = headerDoc.querySelector('#mobileMenu');
        const styles = headerDoc.querySelectorAll('style');
        
        // Insert header and nav into container
        if (header) {
          headerContainer.appendChild(header.cloneNode(true));
        }
        if (nav) {
          document.body.appendChild(nav.cloneNode(true));
        }
        
        // Inject styles into document head
        styles.forEach(style => {
          const newStyle = document.createElement('style');
          newStyle.textContent = style.textContent;
          document.head.appendChild(newStyle);
        });
        
        // Load header initialization script
        const headerScript = document.createElement('script');
        headerScript.src = '/js/header-init.js';
        document.body.appendChild(headerScript);
      }
    }
  } catch (e) {
    console.error('Error loading header:', e.message);
  }
});
