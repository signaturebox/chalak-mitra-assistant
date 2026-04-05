// Push Notification Service — OneSignal Web SDK v16
const PushNotificationService = {
  _initialized: false,
  _subscriptionState: null,

  init() {
    if (this._initialized) return;
    this._initialized = true;
    this.initOneSignal();
    document.addEventListener('pushTokenReceived', (e) => {
      this.registerFcmToken(e.detail.token);
    });
  },

  async getSDK() {
    return new Promise((resolve) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push((OneSignal) => resolve(OneSignal));
    });
  },

  // Safe read of PushSubscription state — avoids 'tt' Proxy error
  async getSubscriptionState(OneSignal) {
    if (this._subscriptionState !== null) return this._subscriptionState;

    const pushSub = OneSignal.User && OneSignal.User.PushSubscription;
    if (!pushSub) return { optedIn: false, id: null, token: null };

    try {
      const state = {
        optedIn: !!pushSub.optedIn,
        id: pushSub.id || null,
        token: pushSub.token || null
      };
      this._subscriptionState = state;
      return state;
    } catch (e) {
      // 'tt' proxy error — wait for the change event
      console.warn('[OneSignal] PushSubscription proxy not ready, waiting...');
      return new Promise((resolve) => {
        const fallback = setTimeout(() => resolve({ optedIn: false, id: null, token: null }), 5000);
        try {
          pushSub.addEventListener('change', (evt) => {
            clearTimeout(fallback);
            const state = {
              optedIn: !!evt.current?.optedIn,
              id: evt.current?.id || null,
              token: evt.current?.token || null
            };
            this._subscriptionState = state;
            resolve(state);
          }, { once: true });
        } catch (_) { clearTimeout(fallback); resolve({ optedIn: false, id: null, token: null }); }
      });
    }
  },

  async subscribeUserToTags(user) {
    if (!user) return false;
    try {
      const cmsId = user.cms || user.cms_id || user.id || user.email;
      const tags = {
        'division': (user.division || 'unassigned').toLowerCase(),
        'division_id': String(user.division_id || ''),
        'lobby': (user.lobby || user.hq || 'all').toLowerCase(),
        'lobby_id': String(user.lobby_id || ''),
        'role': (user.role || 'crew').toLowerCase(),
        'designation': (user.designation || 'unknown').toLowerCase(),
        'cms_id': String(cmsId)
      };

      // Android WebView: call Android interface DIRECTLY (most reliable — no JSON, no WebViewBridge)
      if (typeof window.Android !== 'undefined' && window.Android !== null) {
        const pingResult = window.Android.ping ? window.Android.ping() : 'no-ping-method';
        console.log('[Bridge] Android interface alive, ping:', pingResult);

        if (window.Android.setDivisionTags) {
          // Direct method call — no postMessage, no JSON parsing needed
          window.Android.setDivisionTags(
            tags['division'], tags['division_id'],
            tags['lobby'], tags['lobby_id'],
            tags['role'], String(cmsId)
          );
          console.log('[Bridge] setDivisionTags() called on Android ✅', tags['division'], cmsId);
          return true;
        } else if (window.Android.postMessage) {
          // Fallback: postMessage if setDivisionTags not yet deployed
          window.Android.postMessage(JSON.stringify({
            type: 'registerPushWithTags',
            payload: { cms_id: String(cmsId), ...tags },
            timestamp: Date.now()
          }));
          console.log('[Bridge] postMessage fallback sent for registerPushWithTags');
          return true;
        }
      } else {
        console.log('[Bridge] window.Android not available — using web SDK fallback');
      }

      // Desktop / web: use OneSignal web SDK (addTags only, login() throws tt in WebView)
      const OneSignal = await this.getSDK();
      if (OneSignal.User && OneSignal.User.addTags) {
        await OneSignal.User.addTags(tags);
        console.log('[OneSignal] Tags synced successfully:', tags);
      } else {
        console.warn('[OneSignal] User.addTags not available');
      }
      return true;
    } catch (e) {
      console.error('[OneSignal] Tag sync error:', e.message);
      return false;
    }
  },


  async forceRegister() {
    try {
      const OneSignal = await this.getSDK();
      console.log('[OneSignal] forceRegister - SDK ready');
      console.log('[OneSignal] Native permission:', typeof Notification !== 'undefined' ? Notification.permission : 'N/A');

      this._subscriptionState = null;
      const user = AuthService.getUser();

      // --- PATH A: Android WebView --- use native bridge (PushManager never works in WebView)
      // Check for Android WebView via user-agent OR via the Android JS interface
      const isAndroid = (window.WebViewBridge && (window.WebViewBridge.isAndroidWebView || window.WebViewBridge.hasAndroidInterface))
        || typeof window.Android !== 'undefined';
      if (isAndroid) {
        console.log('[Bridge] Android WebView detected — using native push bridge');

        if (user) {
          // Send user's division tags to Android so native OneSignal SDK can set them
          window.WebViewBridge.sendMessage('registerPushWithTags', {
            cms_id: String(user.cms || user.cms_id || user.id),
            division: (user.division || 'unassigned').toLowerCase(),
            division_id: String(user.division_id || ''),
            lobby: (user.lobby || user.hq || 'all').toLowerCase(),
            lobby_id: String(user.lobby_id || ''),
            role: (user.role || 'crew').toLowerCase(),
            designation: (user.designation || 'unknown').toLowerCase()
          });
          // Also standard registerPush in case app only handles that event
          window.WebViewBridge.registerPushNotifications();
          console.log('[Bridge] Sent registerPushWithTags to native Android app');

          // Also sync tags through OneSignal web SDK (anonymous user mode)
          await this.subscribeUserToTags(user);

          // Re-register any stored FCM token
          const storedToken = localStorage.getItem('fcm_token');
          if (storedToken) {
            console.log('[Bridge] Re-registering stored FCM token');
            await this.registerFcmToken(storedToken);
          }
        }
        return true;
      }

      // --- PATH B: Desktop / Chrome browser (web push works normally) ---
      const currentPerm = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      if (currentPerm !== 'granted') {
        const permResult = await Promise.race([
          OneSignal.Notifications.requestPermission(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
        ]).catch(e => { console.warn('[OneSignal] Permission error:', e.message); return false; });
        if (!permResult) return false;
      }

      // Fire optIn() non-blocking (hangs in WebView but fine in Chrome)
      const pushSub = OneSignal.User && OneSignal.User.PushSubscription;
      if (pushSub) {
        pushSub.optIn()
          .then(() => { this._subscriptionState = null; })
          .catch(e => console.warn('[OneSignal] optIn() error:', e.message));
      }

      await new Promise(r => setTimeout(r, 3000));
      const state = await this.getSubscriptionState(OneSignal);
      console.log('[OneSignal] Subscription state:', JSON.stringify(state));
      if (user) await this.subscribeUserToTags(user);

      return true;
    } catch (e) {
      console.error('[OneSignal] forceRegister error:', e);
      return false;
    }
  },


  async resetOneSignal() {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          if (reg.active && (reg.active.scriptURL.includes('OneSignal') || reg.active.scriptURL.includes('Worker'))) {
            await reg.unregister();
          }
        }
      }
      for (const db of ['OneSignalSDK', 'OneSignalSDK_v2', 'onesignal-sdk']) {
        indexedDB.deleteDatabase(db);
      }
      try {
        const OneSignal = await Promise.race([
          this.getSDK(),
          new Promise((_, rej) => setTimeout(() => rej(), 2000))
        ]);
        try { if (OneSignal.User?.PushSubscription) await OneSignal.User.PushSubscription.optOut(); } catch (_) { }
        try { await OneSignal.logout(); } catch (_) { }
      } catch (_) { }
      this._subscriptionState = null;
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      console.error('[OneSignal] Reset error:', e);
    }
  },

  async getDebugStatus() {
    try {
      const OneSignal = await this.getSDK();
      const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

      let swStatus = 'Unknown';
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        const hasOS = regs.some(r => r.active && (r.active.scriptURL.includes('OneSignal') || r.active.scriptURL.includes('Worker')));
        swStatus = hasOS ? 'Registered ✅' : 'Not Found ❌';
      }

      const status = {
        appId: APP_CONFIG.onesignal.appId,
        initialized: !!OneSignal.initialized,
        permission,
        swStatus,
        isSubscribed: false,
        externalId: 'None',
        subscriptionId: 'None',
        tags: {}
      };

      if (!OneSignal.User) {
        status.error = 'SDK loaded but User object missing';
        return status;
      }

      // Read externalId
      try { status.externalId = OneSignal.User.externalId || 'None'; } catch (_) { }

      // Safe subscription state read
      const subState = await this.getSubscriptionState(OneSignal);
      status.isSubscribed = subState.optedIn;
      status.subscriptionId = subState.id || 'None';

      // Read tags
      try { status.tags = await OneSignal.User.getTags() || {}; } catch (_) { }

      return status;
    } catch (e) {
      return { error: e.message };
    }
  },

  async initOneSignal() {
    const appId = APP_CONFIG.onesignal.appId;
    if (!appId || appId === 'YOUR_ONESIGNAL_APP_ID') return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        if (!OneSignal.initialized) {
          await OneSignal.init({ appId, allowLocalhostAsSecureOrigin: true });
          console.log('[OneSignal] Initialized');
        }
        // Listen for subscription changes
        try {
          if (OneSignal.User?.PushSubscription) {
            OneSignal.User.PushSubscription.addEventListener('change', (evt) => {
              console.log('[OneSignal] Subscription changed:', evt.current);
              this._subscriptionState = {
                optedIn: !!evt.current?.optedIn,
                id: evt.current?.id || null,
                token: evt.current?.token || null
              };
            });
          }
        } catch (_) { }
        // Tag user after delay
        setTimeout(() => {
          const user = AuthService.getUser();
          if (user) this.subscribeUserToTags(user);
        }, 3000);
      } catch (e) {
        console.error('[OneSignal] Init error:', e);
      }
    });
  },

  async registerFcmToken(token) {
    if (!token) return;
    const user = AuthService.getUser();
    if (!user) return;
    try {
      await fetch('/api/notifications/save_push_subscription.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id || user.cms,
          fcm_token: token,
          division: user.division,
          lobby: user.lobby || user.hq,
          role: user.role
        })
      });
    } catch (_) { }
  }
};

window.PushNotificationService = PushNotificationService;