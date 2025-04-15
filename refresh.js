// This script prevents caching issues by forcing a refresh when the page is loaded from browser cache
// It's particularly useful during development to ensure the latest changes are displayed

(function() {
  // Check if this is a refresh/reload
  if (window.performance && window.performance.navigation.type === 1) {
    console.log('Page was refreshed');
    
    // Clear any cached data that might cause issues
    localStorage.removeItem('tempFormData');
    
    // You can add additional cache-clearing logic here if needed
  }
  
  // Add event listener for before unload to clean up if needed
  window.addEventListener('beforeunload', function() {
    // Clean up any temporary data before page unload
    // This helps prevent stale data on refresh
    localStorage.removeItem('tempFormData');
  });
  
  console.log('Refresh handler initialized');
})();
