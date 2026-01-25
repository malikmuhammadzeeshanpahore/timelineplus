// localStorage State Monitor - Add to any page to track changes
(function() {
  console.log('🔍 LocalStorage Monitor: Active');
  
  // Store initial state
  let initialState = {};
  for(let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    initialState[key] = localStorage.getItem(key);
  }
  console.log('📸 Initial localStorage state:', initialState);
  
  // Override localStorage.setItem to log all writes
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    const prev = localStorage.getItem(key);
    console.log(`📝 localStorage.setItem("${key}", "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}")`);
    console.log(`   Previous value was: ${prev ? prev.substring(0, 50) : 'NULL'}`);
    
    try {
      originalSetItem.call(this, key, value);
      console.log(`   ✓ Set succeeded`);
      
      // Verify it was actually set
      const verify = localStorage.getItem(key);
      if(verify !== value) {
        console.error(`   ❌ VERIFICATION FAILED! Read back as: ${verify}`);
      }
    } catch(e) {
      console.error(`   ❌ Set FAILED: ${e.message}`);
      throw e;
    }
  };
  
  // Override localStorage.removeItem to log all deletes
  const originalRemoveItem = Storage.prototype.removeItem;
  Storage.prototype.removeItem = function(key) {
    const prev = localStorage.getItem(key);
    console.log(`🗑️  localStorage.removeItem("${key}")`);
    console.log(`   Removed value was: ${prev ? prev.substring(0, 50) : 'NULL'}`);
    
    try {
      originalRemoveItem.call(this, key);
      console.log(`   ✓ Remove succeeded`);
    } catch(e) {
      console.error(`   ❌ Remove FAILED: ${e.message}`);
      throw e;
    }
  };
  
  // Override localStorage.clear to log full clears
  const originalClear = Storage.prototype.clear;
  Storage.prototype.clear = function() {
    console.log('💥 localStorage.clear() called');
    console.log('   Before clear:', Object.fromEntries(
      Array.from({length: localStorage.length}, (_, i) => [
        localStorage.key(i),
        localStorage.getItem(localStorage.key(i)).substring(0, 20)
      ])
    ));
    
    try {
      originalClear.call(this);
      console.log('   ✓ Clear succeeded');
    } catch(e) {
      console.error(`   ❌ Clear FAILED: ${e.message}`);
      throw e;
    }
  };
  
  // Monitor for storage events from other tabs/windows
  window.addEventListener('storage', (e) => {
    console.log('🔄 Storage event (from another tab/window):', {
      key: e.key,
      oldValue: e.oldValue ? e.oldValue.substring(0, 30) : 'NULL',
      newValue: e.newValue ? e.newValue.substring(0, 30) : 'NULL',
      url: e.url
    });
  });
  
  // Periodic state check (every 5 seconds, logs to console if changed)
  setInterval(() => {
    const currentState = {};
    for(let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      currentState[key] = localStorage.getItem(key);
    }
    
    // Check for changes
    const added = Object.keys(currentState).filter(k => !(k in initialState));
    const removed = Object.keys(initialState).filter(k => !(k in currentState));
    const changed = Object.keys(initialState).filter(k => 
      k in currentState && initialState[k] !== currentState[k]
    );
    
    if(added.length > 0 || removed.length > 0 || changed.length > 0) {
      console.log('📊 LocalStorage CHANGE DETECTED:', {
        added: added.length > 0 ? added : 'none',
        removed: removed.length > 0 ? removed : 'none',
        changed: changed.length > 0 ? changed : 'none'
      });
      
      // Update initial state
      initialState = currentState;
    }
  }, 5000);
  
  // Helper function to dump current state
  window.dumpLocalStorage = function() {
    console.log('=== CURRENT LOCALSTORAGE STATE ===');
    console.log('Total keys:', localStorage.length);
    for(let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
    }
  };
  
  console.log('💡 Tip: Run dumpLocalStorage() in console to see full state');
})();
