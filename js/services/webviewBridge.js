/**
 * WebView Bridge Service
 * 
 * Provides communication between the web app and Android WebView
 * using postMessage and Android JavaScript Interface.
 * 
 * This enables:
 * - Native Android notifications
 * - Push notification support in WebView
 * - File download handling
 * - Hardware button support
 */

const WebViewBridge = {
  // Detection flags
  isAndroidWebView: false,
  isIOSWebView: false,
  hasAndroidInterface: false,

  // Message queue for buffering before WebView is ready
  messageQueue: [],

  // Callbacks for native events
  callbacks: {},

  /**
   * Initialize the WebView bridge
   */
  init() {
    this.detectWebView();
    this.setupMessageListener();
    this.processMessageQueue();

    console.log('[WebViewBridge] Initialized:', {
      isAndroidWebView: this.isAndroidWebView,
      isIOSWebView: this.isIOSWebView,
      hasAndroidInterface: this.hasAndroidInterface
    });

    // Notify native app that web app is ready
    this.sendMessage('appReady', {
      timestamp: Date.now(),
      version: '1.0.0'
    });
  },

  /**
   * Detect if running in a WebView
   */
  detectWebView() {
    const userAgent = navigator.userAgent.toLowerCase();

    // Check for Android WebView
    // Android WebView contains "wv" or "WebView" in user agent
    this.isAndroidWebView = (
      /wv/.test(userAgent) ||
      /webview/.test(userAgent) ||
      /android/.test(userAgent) && /version\/\d+\.\d+/.test(userAgent)
    );

    // Check for iOS WebView
    this.isIOSWebView = (
      /(iphone|ipod|ipad).*applewebkit(?!.*safari)/i.test(userAgent) ||
      /(iphone|ipod|ipad).*\(.*?mobile safari/.test(userAgent)
    );

    // Check for Android JavaScript Interface
    this.hasAndroidInterface = (
      typeof window.Android !== 'undefined' &&
      window.Android !== null
    );
  },

  /**
   * Setup listener for messages from native app
   */
  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Handle messages from parent (WebView)
      if (event.data && typeof event.data === 'object') {
        this.handleNativeMessage(event.data);
      }
    });

    // For Android WebView with JavaScript Interface
    if (this.hasAndroidInterface) {
      // Expose callback function for Android to call
      window.onNativeMessage = (message) => {
        try {
          const data = typeof message === 'string' ? JSON.parse(message) : message;
          this.handleNativeMessage(data);
        } catch (e) {
          console.error('[WebViewBridge] Error parsing native message:', e);
        }
      };
    }
  },

  /**
   * Handle messages from native app
   */
  handleNativeMessage(data) {
    console.log('[WebViewBridge] Received native message:', data);

    if (!data.type) return;

    switch (data.type) {
      case 'notification':
        // Native notification received
        this.handleNativeNotification(data.payload);
        break;

      case 'backButton':
        // Android back button pressed
        this.handleBackButton();
        break;

      case 'pushToken':
        // FCM push token received
        this.handlePushToken(data.payload);
        break;

      case 'appState':
        // App state change (background/foreground)
        this.handleAppState(data.payload);
        break;

      case 'downloadComplete':
        // File download completed
        this.handleDownloadComplete(data.payload);
        break;

      default:
        // Custom message type
        if (this.callbacks[data.type]) {
          this.callbacks[data.type].forEach(cb => cb(data.payload));
        }
    }
  },

  /**
   * Send message to native app
   */
  sendMessage(type, payload = {}) {
    const message = {
      type,
      payload,
      timestamp: Date.now()
    };

    // If Android interface is available, use it
    if (this.hasAndroidInterface && window.Android.postMessage) {
      try {
        window.Android.postMessage(JSON.stringify(message));
        return true;
      } catch (e) {
        console.error('[WebViewBridge] Error sending to Android:', e);
      }
    }

    // If in iOS WebView, use WKScriptMessageHandler
    if (this.isIOSWebView && window.webkit && window.webkit.messageHandlers) {
      try {
        window.webkit.messageHandlers.app.postMessage(message);
        return true;
      } catch (e) {
        console.error('[WebViewBridge] Error sending to iOS:', e);
      }
    }

    // Fallback: use parent.postMessage (for iframe or WebView)
    if (window.parent !== window) {
      window.parent.postMessage(message, '*');
      return true;
    }

    // Queue message for later if WebView not ready
    this.messageQueue.push(message);
    return false;
  },

  /**
   * Process queued messages
   */
  processMessageQueue() {
    if (this.messageQueue.length > 0) {
      const queue = [...this.messageQueue];
      this.messageQueue = [];

      queue.forEach(message => {
        this.sendMessage(message.type, message.payload);
      });
    }
  },

  /**
   * Send notification to native app
   */
  sendNotification(title, message, data = {}) {
    return this.sendMessage('showNotification', {
      title,
      message,
      data
    });
  },

  /**
   * Set application icon badge count
   */
  setBadgeCount(count) {
    console.log('[WebViewBridge] Setting badge count:', count);
    return this.sendMessage('setBadgeCount', {
      count: parseInt(count) || 0
    });
  },

  /**
   * Send file upload notification to native app
   */
  sendFileNotification(fileData) {
    return this.sendMessage('fileUploaded', {
      fileName: fileData.name || fileData.title,
      fileType: fileData.type,
      division: fileData.division,
      lobby: fileData.lobby,
      section: fileData.section,
      timestamp: Date.now()
    });
  },

  /**
   * Request push notification permission
   */
  requestPushPermission() {
    return this.sendMessage('requestPushPermission', {});
  },

  /**
   * Register for push notifications
   */
  registerPushNotifications() {
    return this.sendMessage('registerPush', {});
  },

  /**
   * Download file using native download manager
   */
  downloadFile(url, filename, mimeType = null) {
    return this.sendMessage('downloadFile', {
      url,
      filename,
      mimeType
    });
  },

  /**
   * Share content using native share sheet
   */
  shareContent(title, text, url = null) {
    return this.sendMessage('share', {
      title,
      text,
      url
    });
  },

  /**
   * Show native toast message
   */
  showToast(message, duration = 'short') {
    return this.sendMessage('showToast', {
      message,
      duration
    });
  },

  /**
   * Vibrate device
   */
  vibrate(pattern = [100]) {
    // Try native vibration first
    if (this.sendMessage('vibrate', { pattern })) {
      return true;
    }

    // Fallback to Web Vibration API
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
      return true;
    }

    return false;
  },

  /**
   * Get device info from native app
   */
  getDeviceInfo() {
    return new Promise((resolve) => {
      const callbackId = 'deviceInfo_' + Date.now();

      this.once(callbackId, (data) => {
        resolve(data);
      });

      this.sendMessage('getDeviceInfo', { callbackId });

      // Timeout after 5 seconds
      setTimeout(() => {
        resolve({
          platform: this.isAndroidWebView ? 'android' : this.isIOSWebView ? 'ios' : 'web',
          isWebView: this.isAndroidWebView || this.isIOSWebView
        });
      }, 5000);
    });
  },

  /**
   * Handle native notification
   */
  handleNativeNotification(payload) {
    console.log('[WebViewBridge] Native notification:', payload);

    // Dispatch event for app to handle
    document.dispatchEvent(new CustomEvent('nativeNotification', {
      detail: payload
    }));

    // Show in-app notification if needed
    if (payload.showInApp && typeof showNotification === 'function') {
      showNotification(payload.message, payload.type || 'info');
    }
  },

  /**
   * Handle back button press
   */
  handleBackButton() {
    console.log('[WebViewBridge] Back button pressed');

    // Dispatch event for app to handle
    document.dispatchEvent(new CustomEvent('backButtonPressed'));

    // Default behavior: go back in history
    if (window.history.length > 1) {
      window.history.back();
    }
  },

  /**
   * Handle push token
   */
  handlePushToken(payload) {
    console.log('[WebViewBridge] Push token received:', payload.token);

    // Store token
    if (payload.token) {
      localStorage.setItem('fcm_token', payload.token);

      // Dispatch event
      document.dispatchEvent(new CustomEvent('pushTokenReceived', {
        detail: payload
      }));
    }
  },

  /**
   * Handle app state change
   */
  handleAppState(payload) {
    console.log('[WebViewBridge] App state:', payload.state);

    document.dispatchEvent(new CustomEvent('appStateChanged', {
      detail: payload
    }));

    // Refresh data when app comes to foreground
    if (payload.state === 'foreground') {
      if (window.NotificationService) {
        NotificationService.fetchNotificationsFromServer();
      }
      if (window.RealtimeSyncService) {
        RealtimeSyncService.triggerManualSync();
      }
    }
  },

  /**
   * Handle download complete
   */
  handleDownloadComplete(payload) {
    console.log('[WebViewBridge] Download complete:', payload);

    document.dispatchEvent(new CustomEvent('downloadComplete', {
      detail: payload
    }));

    if (payload.success) {
      this.showToast(`Downloaded: ${payload.filename}`);
    } else {
      this.showToast(`Download failed: ${payload.error}`);
    }
  },

  /**
   * Register callback for specific message type
   */
  on(type, callback) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }
    this.callbacks[type].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks[type].indexOf(callback);
      if (index > -1) {
        this.callbacks[type].splice(index, 1);
      }
    };
  },

  /**
   * Register one-time callback
   */
  once(type, callback) {
    const unsubscribe = this.on(type, (payload) => {
      unsubscribe();
      callback(payload);
    });
  },

  /**
   * Check if running in WebView
   */
  isInWebView() {
    return this.isAndroidWebView || this.isIOSWebView;
  },

  /**
   * Get WebView info
   */
  getInfo() {
    return {
      isAndroidWebView: this.isAndroidWebView,
      isIOSWebView: this.isIOSWebView,
      hasAndroidInterface: this.hasAndroidInterface,
      isInWebView: this.isInWebView(),
      userAgent: navigator.userAgent
    };
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  WebViewBridge.init();
});

// Make available globally
window.WebViewBridge = WebViewBridge;
