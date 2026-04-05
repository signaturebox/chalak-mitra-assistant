/**
 * Notification Module - Complete Notification System
 * 
 * Features:
 * - Real-time notifications when admin uploads files
 * - Web push notifications (even when app is closed)
 * - Counter badges on tabs and navigation
 * - "New" tags on files
 * - Auto-remove badges when file is viewed
 * - Click notification to go directly to file
 * 
 * Integration: Include this file and call NotificationModule.init()
 */

const NotificationModule = {
  // Configuration
  config: {
    pollingInterval: 3000, // 3 seconds
    apiBaseUrl: '/api',
    vapidPublicKey: 'BF5PeSLhMMa3AY85E8UaSEcTJ9oXphujuCiGSaBT-WFMQi_izNoKi-tLCwwgubMxs4jQh8CAwtKaKFU2PKyCUKI'
  },

  // State
  state: {
    counters: {
      division: { count: 0, name: '', id: null },
      lobby: { count: 0, name: '', id: null },
      tabs: [],
      total_new_files: 0,
      new_file_ids: []
    },
    notifications: [],
    viewedFiles: new Set(),
    lastPollTime: null,
    pollInterval: null,
    pushSubscription: null
  },

  /**
   * Initialize the notification module
   */
  init() {
    console.log('[NotificationModule] Initializing...');
    
    // Load viewed files from localStorage
    this.loadViewedFiles();
    
    // Initialize push notifications
    this.initPushNotifications();
    
    // Start polling for real-time updates
    this.startPolling();
    
    // Listen for file uploads
    this.setupEventListeners();
    
    console.log('[NotificationModule] Initialized successfully');
  },

  /**
   * Load viewed files from localStorage
   */
  loadViewedFiles() {
    try {
      const viewed = localStorage.getItem('notification_viewed_files');
      if (viewed) {
        this.state.viewedFiles = new Set(JSON.parse(viewed));
      }
    } catch (e) {
      console.error('[NotificationModule] Error loading viewed files:', e);
    }
  },

  /**
   * Save viewed files to localStorage
   */
  saveViewedFiles() {
    try {
      localStorage.setItem('notification_viewed_files', 
        JSON.stringify([...this.state.viewedFiles]));
    } catch (e) {
      console.error('[NotificationModule] Error saving viewed files:', e);
    }
  },

  /**
   * Mark file as viewed
   */
  markFileAsViewed(fileId) {
    if (!fileId) return;
    
    this.state.viewedFiles.add(String(fileId));
    this.saveViewedFiles();
    
    // Update UI
    this.updateFileBadges();
    this.updateCounterBadges();
    
    // Send to server
    this.sendViewedToServer(fileId);
  },

  /**
   * Send viewed status to server
   */
  async sendViewedToServer(fileId) {
    const user = this.getCurrentUser();
    if (!user) return;
    
    try {
      await fetch(`${this.config.apiBaseUrl}/notifications/mark_viewed.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id || user.cms,
          file_id: fileId
        })
      });
    } catch (error) {
      console.error('[NotificationModule] Error marking file as viewed:', error);
    }
  },

  /**
   * Check if file is new
   */
  isFileNew(fileId, uploadedAt) {
    // If user has viewed this file, it's not new
    if (this.state.viewedFiles.has(String(fileId))) {
      return false;
    }
    
    // Check if in new_file_ids from server
    if (this.state.counters.new_file_ids && 
        this.state.counters.new_file_ids.includes(parseInt(fileId))) {
      return true;
    }
    
    // Check by timestamp (within 24 hours)
    if (uploadedAt) {
      const uploadTime = new Date(uploadedAt).getTime();
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return uploadTime > oneDayAgo;
    }
    
    return false;
  },

  /**
   * Get current user from your auth system
   * Override this method to integrate with your auth
   */
  getCurrentUser() {
    // Try to get user from common auth patterns
    if (window.AuthService && AuthService.getUser) {
      return AuthService.getUser();
    }
    if (window.currentUser) {
      return window.currentUser;
    }
    // Return from localStorage as fallback
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      return null;
    }
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for file upload events
    document.addEventListener('fileUploaded', (e) => {
      console.log('[NotificationModule] File uploaded:', e.detail);
      this.handleFileUpload(e.detail);
    });
    
    // Listen for user login
    document.addEventListener('userLoggedIn', () => {
      console.log('[NotificationModule] User logged in, refreshing...');
      this.fetchCounters();
    });
  },

  /**
   * Start polling for real-time updates
   */
  startPolling() {
    // Fetch immediately
    this.fetchCounters();
    
    // Then poll every 3 seconds
    this.state.pollInterval = setInterval(() => {
      this.fetchCounters();
    }, this.config.pollingInterval);
    
    console.log('[NotificationModule] Polling started');
  },

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.state.pollInterval) {
      clearInterval(this.state.pollInterval);
      this.state.pollInterval = null;
    }
  },

  /**
   * Fetch counters from server
   */
  async fetchCounters() {
    const user = this.getCurrentUser();
    if (!user) return;
    
    try {
      const params = new URLSearchParams({
        user_id: user.id || user.cms,
        division: user.division || '',
        lobby: user.lobby || user.hq || ''
      });
      
      const url = `${this.config.apiBaseUrl}/notifications/get_counters.php?${params}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.counters) {
        const prevCount = this.state.counters.total_new_files;
        const newCount = data.counters.total_new_files || 0;
        
        this.state.counters = data.counters;
        
        // If new files detected, show notification
        if (newCount > prevCount && prevCount > 0) {
          this.showNewFileNotification(data.hierarchy);
        }
        
        // Update UI
        this.updateCounterBadges();
        this.updateDashboardWidget();
        this.updateFileBadges();
      }
    } catch (error) {
      console.error('[NotificationModule] Error fetching counters:', error);
    }
  },

  /**
   * Handle file upload
   */
  handleFileUpload(fileData) {
    // Refresh counters
    this.fetchCounters();
    
    // Show local notification
    this.showToast(`📁 New file: ${fileData.name || 'File uploaded'}`, 'info');
  },

  /**
   * Show new file notification
   */
  showNewFileNotification(hierarchy) {
    if (!hierarchy) return;
    
    Object.entries(hierarchy).forEach(([lobby, data]) => {
      if (data.tabs) {
        Object.entries(data.tabs).forEach(([tab, count]) => {
          if (count > 0) {
            this.showToast(
              `📁 ${count} new file${count > 1 ? 's' : ''} in ${tab}`,
              'info'
            );
          }
        });
      }
    });
  },

  /**
   * Update counter badges on UI
   */
  updateCounterBadges() {
    const counters = this.state.counters;
    
    // Update divisions counter
    const divisionsBadge = document.getElementById('divisionsCounter');
    if (divisionsBadge) {
      const totalCount = counters.total_new_files || 0;
      if (totalCount > 0) {
        divisionsBadge.textContent = totalCount > 99 ? '99+' : totalCount;
        divisionsBadge.style.display = 'flex';
      } else {
        divisionsBadge.style.display = 'none';
      }
    }
    
    // Update notification bell badge
    const bellBadge = document.getElementById('notificationBadge');
    if (bellBadge) {
      const notifCount = counters.notifications || 0;
      if (notifCount > 0) {
        bellBadge.textContent = notifCount > 99 ? '99+' : notifCount;
        bellBadge.style.display = 'flex';
      } else {
        bellBadge.style.display = 'none';
      }
    }
    
    // Update tab counters
    if (counters.tabs && Array.isArray(counters.tabs)) {
      counters.tabs.forEach(tab => {
        this.updateTabBadge(tab.section, tab.count);
      });
    }
  },

  /**
   * Update tab badge
   */
  updateTabBadge(section, count) {
    // Find tab elements by section name
    const tabElements = document.querySelectorAll(
      `[data-section="${section}"], [data-tab="${section}"], [href*="${section}"]`
    );
    
    tabElements.forEach(el => {
      let badge = el.querySelector('.tab-counter');
      
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'tab-counter';
          badge.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
            color: white;
            font-size: 10px;
            font-weight: 700;
            min-width: 18px;
            height: 18px;
            border-radius: 9px;
            padding: 0 5px;
            margin-left: 8px;
          `;
          el.appendChild(badge);
        }
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'inline-flex';
      } else if (badge) {
        badge.style.display = 'none';
      }
    });
  },

  /**
   * Update file badges ("New" tags)
   */
  updateFileBadges() {
    // Find all file elements
    const fileElements = document.querySelectorAll('[data-file-id]');
    
    fileElements.forEach(el => {
      const fileId = el.dataset.fileId;
      const uploadedAt = el.dataset.uploadedAt;
      
      if (this.isFileNew(fileId, uploadedAt)) {
        // Add "New" badge if not exists
        let badge = el.querySelector('.new-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'new-badge';
          badge.textContent = 'NEW';
          badge.style.cssText = `
            display: inline-flex;
            background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
            margin-left: 8px;
            animation: newBadgePulse 2s infinite;
          `;
          
          // Find title element or append to card
          const titleEl = el.querySelector('.file-title, .file-name, h3, h4');
          if (titleEl) {
            titleEl.appendChild(badge);
          } else {
            el.appendChild(badge);
          }
        }
      } else {
        // Remove "New" badge
        const badge = el.querySelector('.new-badge');
        if (badge) badge.remove();
      }
    });
  },

  /**
   * Update dashboard widget
   */
  updateDashboardWidget() {
    const widget = document.getElementById('notificationWidgetContent');
    if (!widget) return;
    
    const hierarchy = this.state.counters.hierarchy || {};
    let html = '';
    
    // Generate notices from hierarchy
    Object.entries(hierarchy).forEach(([lobby, data]) => {
      if (data.tabs) {
        Object.entries(data.tabs).forEach(([tab, count]) => {
          if (count > 0) {
            html += `
              <div class="notice-item" style="
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 12px;
                border-left: 4px solid #f59e0b;
                cursor: pointer;
              " onclick="NotificationModule.navigateToTab('${tab}')">
                <div style="font-weight: 600; color: #92400e;">
                  📁 ${count} new file${count > 1 ? 's' : ''}
                </div>
                <div style="font-size: 13px; color: #b45309; margin-top: 4px;">
                  ${tab}${lobby !== 'General' ? ' - ' + lobby : ''}
                </div>
              </div>
            `;
          }
        });
      }
    });
    
    if (html) {
      widget.innerHTML = html;
    } else {
      widget.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #9ca3af;">
          <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
          <div>No new notices</div>
        </div>
      `;
    }
  },

  /**
   * Navigate to tab when clicking notification
   */
  navigateToTab(tabName) {
    // Store the target tab
    sessionStorage.setItem('notification_target_tab', tabName);
    
    // Navigate to divisions page
    if (window.NavigationService) {
      NavigationService.navigateTo('divisions');
    } else {
      window.location.href = '/divisions';
    }
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 5000) {
    // Use your app's toast function if available
    if (window.showNotification) {
      showNotification(message, type, duration);
      return;
    }
    
    // Fallback toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 10000;
      font-weight: 500;
      max-width: 400px;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Initialize push notifications
   */
  async initPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('[NotificationModule] Push notifications not supported');
      return;
    }
    
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw-notifications.js');
      console.log('[NotificationModule] Service Worker registered');
      
      // Check for existing subscription
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        this.state.pushSubscription = subscription;
        this.savePushSubscription(subscription);
      }
    } catch (error) {
      console.error('[NotificationModule] Error initializing push:', error);
    }
  },

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush() {
    if (!('serviceWorker' in navigator)) return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return false;
      }
      
      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey)
      });
      
      this.state.pushSubscription = subscription;
      await this.savePushSubscription(subscription);
      
      return true;
    } catch (error) {
      console.error('[NotificationModule] Error subscribing to push:', error);
      return false;
    }
  },

  /**
   * Save push subscription to server
   */
  async savePushSubscription(subscription) {
    const user = this.getCurrentUser();
    if (!user) return;
    
    try {
      await fetch(`${this.config.apiBaseUrl}/notifications/save_subscription.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id || user.cms,
          subscription: subscription.toJSON(),
          division: user.division,
          lobby: user.lobby || user.hq
        })
      });
    } catch (error) {
      console.error('[NotificationModule] Error saving subscription:', error);
    }
  },

  /**
   * Helper: Convert base64 to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  /**
   * Toggle notification bell dropdown
   */
  toggleDropdown() {
    let dropdown = document.getElementById('notificationDropdown');
    
    if (dropdown) {
      dropdown.remove();
      return;
    }
    
    // Create dropdown
    dropdown = document.createElement('div');
    dropdown.id = 'notificationDropdown';
    
    // Position relative to bell
    const bell = document.getElementById('notificationBell');
    const isMobile = window.innerWidth <= 768;
    
    if (bell && !isMobile) {
      const rect = bell.getBoundingClientRect();
      dropdown.style.cssText = `
        position: absolute;
        top: ${rect.bottom + window.scrollY + 5}px;
        right: ${window.innerWidth - rect.right - window.scrollX}px;
        width: 350px;
        max-height: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        overflow: hidden;
      `;
    } else {
      dropdown.style.cssText = `
        position: fixed;
        top: 70px;
        left: 10px;
        right: 10px;
        max-height: 70vh;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        overflow: hidden;
      `;
    }
    
    // Build content
    const hierarchy = this.state.counters.hierarchy || {};
    let content = '<div style="padding: 16px; max-height: 400px; overflow-y: auto;">';
    
    let hasNotifications = false;
    
    Object.entries(hierarchy).forEach(([lobby, data]) => {
      if (data.tabs) {
        Object.entries(data.tabs).forEach(([tab, count]) => {
          if (count > 0) {
            hasNotifications = true;
            content += `
              <div onclick="NotificationModule.navigateToTab('${tab}'); NotificationModule.toggleDropdown();" 
                   style="padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; hover: background: #f3f4f6;">
                <div style="font-weight: 600; color: #1f2937;">📁 ${count} new file${count > 1 ? 's' : ''}</div>
                <div style="font-size: 13px; color: #6b7280;">${tab}${lobby !== 'General' ? ' - ' + lobby : ''}</div>
              </div>
            `;
          }
        });
      }
    });
    
    if (!hasNotifications) {
      content += `
        <div style="text-align: center; padding: 40px; color: #9ca3af;">
          <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
          <div>No notifications</div>
        </div>
      `;
    }
    
    content += '</div>';
    dropdown.innerHTML = content;
    
    document.body.appendChild(dropdown);
    
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && !e.target.closest('#notificationBell')) {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 100);
  }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes newBadgePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NotificationModule.init());
} else {
  NotificationModule.init();
}

// Make globally available
window.NotificationModule = NotificationModule;
