// LocalStorage Management

const Storage = {
  // Save logo data
  saveLogo(dataUrl) {
    try {
      localStorage.setItem(APP_CONFIG.storage.logo, dataUrl);
      return true;
    } catch (e) {
      console.error('Failed to save logo:', e);
      return false;
    }
  },

  // Load logo data
  loadLogo() {
    try {
      return localStorage.getItem(APP_CONFIG.storage.logo);
    } catch (e) {
      console.error('Failed to load logo:', e);
      return null;
    }
  },

  // Remove logo
  removeLogo() {
    try {
      localStorage.removeItem(APP_CONFIG.storage.logo);
      return true;
    } catch (e) {
      console.error('Failed to remove logo:', e);
      return false;
    }
  },

  // Save user state
  saveUserState(state) {
    try {
      localStorage.setItem(APP_CONFIG.storage.userState, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Failed to save user state:', e);
      return false;
    }
  },

  // Load user state
  loadUserState() {
    try {
      const data = localStorage.getItem(APP_CONFIG.storage.userState);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load user state:', e);
      return null;
    }
  },

  // Clear all app data
  clearAll() {
    try {
      Object.values(APP_CONFIG.storage).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (e) {
      console.error('Failed to clear storage:', e);
      return false;
    }
  },

  // Save generic data
  save(key, value) {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, data);
      return true;
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
      
      // Handle quota exceeded error
      if (e.name === 'QuotaExceededError') {
        console.warn('⚠️ LocalStorage quota exceeded. Attempting cleanup...');
        
        // Try to clean up old data
        this.cleanupOldData(key);
        
        // Try saving again after cleanup
        try {
          localStorage.setItem(key, data);
          console.log('✅ Saved successfully after cleanup');
          return true;
        } catch (retryError) {
          console.error('❌ Still failed after cleanup:', retryError);
          
          // Show user-friendly message
          if (typeof showNotification === 'function') {
            showNotification('⚠️ Storage limit reached. Please delete some old files or use URL links instead of uploading large files.', 'error', 5000);
          }
          return false;
        }
      }
      return false;
    }
  },
  
  // Cleanup old data to free up space
  cleanupOldData(currentKey) {
    try {
      console.log('Starting storage cleanup...');
      
      // Don't delete the current key we're trying to save
      const keysToKeep = [currentKey, APP_CONFIG.storage.users, APP_CONFIG.storage.currentUser];
      
      // Get all localStorage keys
      const allKeys = Object.keys(localStorage);
      
      // Calculate storage usage
      let totalSize = 0;
      const keysSizes = allKeys.map(key => {
        const size = localStorage.getItem(key)?.length || 0;
        totalSize += size;
        return { key, size };
      });
      
      console.log(`Total storage: ${(totalSize / 1024).toFixed(2)} KB`);
      
      // Remove temporary or cache data (but keep important data)
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key) && 
            !key.startsWith('nwr_') && 
            !key.includes('user') && 
            !key.includes('auth')) {
          localStorage.removeItem(key);
          console.log(`Removed: ${key}`);
        }
      });
      
      return true;
    } catch (e) {
      console.error('Cleanup failed:', e);
      return false;
    }
  },

  // Load generic data
  load(key, isJSON = false) {
    try {
      const data = localStorage.getItem(key);
      return isJSON && data ? JSON.parse(data) : data;
    } catch (e) {
      console.error(`Failed to load ${key}:`, e);
      return null;
    }
  },

  // Remove generic data
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Failed to remove ${key}:`, e);
      return false;
    }
  }
};
