// Cache clearing utility for NWR Chalak Mitra application
console.log('Cache clearing utility loaded');

// Clear all localStorage data related to quiz results
function clearQuizRelatedStorage() {
    console.log('Clearing quiz-related storage...');
    
    // Clear main quiz results storage
    if (localStorage.getItem('quizResults')) {
        console.log('Found and clearing quizResults:', localStorage.getItem('quizResults').length, 'characters');
        localStorage.removeItem('quizResults');
    }
    
    // Clear quiz attempts storage
    if (localStorage.getItem('nwr_quiz_attempts')) {
        console.log('Found and clearing nwr_quiz_attempts:', localStorage.getItem('nwr_quiz_attempts').length, 'characters');
        localStorage.removeItem('nwr_quiz_attempts');
    }
    
    // Clear other related storage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('quiz') || key.includes('Quiz'))) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        console.log('Removing storage key:', key);
        localStorage.removeItem(key);
    });
    
    console.log('Quiz-related storage cleared');
}

// Force refresh SW cache for this domain
async function clearServiceWorkerCache() {
    console.log('Checking for service workers...');
    
    if ('serviceWorker' in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('Found', registrations.length, 'service worker registrations');
            
            for (let registration of registrations) {
                console.log('Unregistering service worker:', registration.scope);
                await registration.unregister();
            }
            
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                console.log('Found', cacheNames.length, 'caches to clear');
                
                for (let cacheName of cacheNames) {
                    console.log('Deleting cache:', cacheName);
                    await caches.delete(cacheName);
                }
            }
            
            console.log('Service worker cache cleared');
        } catch (error) {
            console.error('Error clearing service worker:', error);
        }
    }
}

// Clear and refresh everything
function hardResetApp() {
    console.log('Performing hard reset of application...');
    
    // Clear storage
    clearQuizRelatedStorage();
    
    // Clear service worker
    clearServiceWorkerCache();
    
    // Force reload
    setTimeout(() => {
        console.log('Reloading page...');
        window.location.reload(true);
    }, 1000);
}

// Make functions available globally
window.clearQuizRelatedStorage = clearQuizRelatedStorage;
window.clearServiceWorkerCache = clearServiceWorkerCache;
window.hardResetApp = hardResetApp;

console.log('Cache clearing utilities ready. Use:');
console.log('- clearQuizRelatedStorage() to clear quiz storage');
console.log('- clearServiceWorkerCache() to clear SW cache');
console.log('- hardResetApp() to perform complete reset');