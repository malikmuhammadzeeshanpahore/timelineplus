// Load header for freelancer dashboard - run immediately, don't wait for DOMContentLoaded
(async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || (role !== 'freelancer' && role !== 'buyer')) {
    console.warn('Auth check failed: no token or invalid role');
    return;
  }

  try {
    // Wait for headerContainer to be available
    let headerContainer = document.getElementById('headerContainer');
    let attempts = 0;
    while (!headerContainer && attempts < 20) {
      await new Promise(r => setTimeout(r, 50));
      headerContainer = document.getElementById('headerContainer');
      attempts++;
    }
    
    if (!headerContainer) {
      console.error('Header container not found after retries');
      return;
    }

    // Load header
    const headerRes = await fetch('/header.html');
    if (!headerRes.ok) {
      console.error('Failed to fetch header:', headerRes.status);
      return;
    }
    
    const headerHtml = await headerRes.text();
    
    // Parse the header HTML to extract only the header element and nav
    const parser = new DOMParser();
    const headerDoc = parser.parseFromString(headerHtml, 'text/html');
    
    // Extract header and nav elements
    const header = headerDoc.querySelector('#header');
    const nav = headerDoc.querySelector('#mobileMenu');
    const styles = headerDoc.querySelectorAll('style');
    
    console.log('Header found:', !!header, 'Nav found:', !!nav);
    
    // Insert header and nav into container
    if (header) {
      headerContainer.appendChild(header.cloneNode(true));
      console.log('Header injected');
    }
    if (nav) {
      document.body.appendChild(nav.cloneNode(true));
      console.log('Mobile menu injected');
    }
    
    // Inject styles into document head
    styles.forEach(style => {
      const newStyle = document.createElement('style');
      newStyle.textContent = style.textContent;
      document.head.appendChild(newStyle);
    });
    console.log('Styles injected:', styles.length);
    
    // Load header initialization script
    const headerScript = document.createElement('script');
    headerScript.src = '/js/header-init.js';
    headerScript.onload = () => console.log('header-init.js loaded');
    headerScript.onerror = () => console.error('header-init.js failed to load');
    document.body.appendChild(headerScript);
  } catch (e) {
    console.error('Error loading header:', e.message);
  }
})();
