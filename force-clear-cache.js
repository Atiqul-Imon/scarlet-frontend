// COMPREHENSIVE CACHE CLEARING SCRIPT
// Run this in browser console to completely reset everything

console.log('🚀 STARTING COMPREHENSIVE CACHE CLEAR...');

// 1. Clear all storage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared localStorage and sessionStorage');

// 2. Clear IndexedDB
if ('indexedDB' in window) {
  try {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        indexedDB.deleteDatabase(db.name);
        console.log(`✅ Deleted IndexedDB: ${db.name}`);
      });
    });
  } catch (e) {
    console.log('⚠️ IndexedDB clearing failed:', e);
  }
}

// 3. Clear all caches
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName);
      console.log(`✅ Deleted cache: ${cacheName}`);
    });
  });
}

// 4. Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('✅ Unregistered service worker');
    });
  });
}

// 5. Clear browser cache (if possible)
if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate().then(estimate => {
    console.log('📊 Storage estimate:', estimate);
  });
}

// 6. Force reload after a delay
setTimeout(() => {
  console.log('🔄 FORCING PAGE RELOAD...');
  window.location.reload(true);
}, 2000);

console.log('🎯 CACHE CLEAR COMPLETE - PAGE WILL RELOAD IN 2 SECONDS');
