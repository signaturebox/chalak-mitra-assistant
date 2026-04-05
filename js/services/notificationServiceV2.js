// Notification Service V2 - Unified notification management
// Handles: real-time updates, counter badges, bell dropdown, "New" tags
var NotificationServiceV2 = {
  serverNotifications: [],
  counters: {},
  hierarchy: {},
  eventSource: null,
  pollInterval: null,

  // --- INIT ---
  init() {
    // Make globally available under both names
    window.NotificationServiceV2 = this;
    window.NotificationService = this;
    console.log('[NotificationServiceV2] Init');

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('notificationDropdown');
      const bell = document.querySelector('.notification-bell');
      if (dropdown && dropdown.style.display === 'block') {
        if (!dropdown.contains(e.target) && !bell?.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      }
    });
  },

  // Called after login
  start() {
    this.fetchData();
    this.startRealtimeSync();
  },

  // --- DATA FETCH ---
  async fetchData() {
    const user = AuthService.getUser();
    if (!user || (!user.id && !user.cms)) return;

    try {
      const baseUrl = this.getBaseUrl();
      const params = new URLSearchParams({
        user_id: user.id || user.cms,
        division: user.division || '',
        lobby: user.lobby || user.hq || ''
      });

      // Fetch counters and notifications in parallel
      const [cRes, nRes] = await Promise.all([
        fetch(`${baseUrl}/notifications/get_counters_v2.php?${params.toString()}`).then(r => r.json()),
        fetch(`${baseUrl}/notifications/get_notifications.php?${params.toString()}`).then(r => r.json())
      ]);

      if (cRes.success) {
        this.counters = cRes.counters;
        this.hierarchy = cRes.hierarchy || {};
        document.dispatchEvent(new CustomEvent('notificationCountersUpdated', { detail: cRes }));
      }

      if (nRes.success) {
        this.serverNotifications = nRes.notifications || [];
        document.dispatchEvent(new CustomEvent('notificationsUpdated', {
          detail: { notifications: this.serverNotifications, unreadCount: this.getUnreadCount() }
        }));
      }

      this.updateUI();
    } catch (error) {
      console.warn('[NotificationServiceV2] Fetch error:', error);
    }
  },

  // --- REAL-TIME SYNC ---
  startRealtimeSync() {
    this.stopRealtimeSync();

    // 1. SSE Connection
    try {
      const user = AuthService.getUser();
      const baseUrl = this.getBaseUrl();

      // Get highest ID we currently have to avoid historical spam
      let maxNotifId = 0;
      if (this.serverNotifications && this.serverNotifications.length > 0) {
        maxNotifId = Math.max(...this.serverNotifications.map(n => parseInt(n.id) || 0));
      }

      const params = new URLSearchParams({
        user_id: user.id || user.cms,
        division: user.division || '',
        lobby: user.lobby || user.hq || '',
        last_notif_id: maxNotifId
      });
      this.eventSource = new EventSource(`${baseUrl}/notifications/realtime_updates.php?${params.toString()}`);

      this.eventSource.addEventListener('new_files', (e) => this.handleUpdate(JSON.parse(e.data)));
      this.eventSource.addEventListener('notification', (e) => this.handleUpdate(JSON.parse(e.data)));
      this.eventSource.onerror = () => this.startPolling(); // Fallback to polling on error
    } catch (e) {
      this.startPolling();
    }

    // 2. Continuous Polling Fallback (every 5s)
    this.startPolling();
  },

  startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => this.fetchData(), 15000);
  },

  stopRealtimeSync() {
    if (this.eventSource) this.eventSource.close();
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.eventSource = null;
    this.pollInterval = null;
  },

  handleUpdate(data) {
    console.log('📢 [NotificationServiceV2] Real-time Update:', data);
    this.fetchData(); // Just refresh everything on any update

    if (data.type === 'notification' && data.notifications) {
      // Find truly NEW notifications (not already in our list by ID)
      const existingIds = new Set(this.serverNotifications.map(n => n.id.toString()));
      const trulyNew = data.notifications.filter(n => !existingIds.has(n.id.toString()));

      if (trulyNew.length > 0) {
        this.serverNotifications = [...trulyNew, ...this.serverNotifications];
        this.updateUI();

        // Show popup for the latest one
        const n = trulyNew[0];
        showNotification(`🔔 ${n.title}`, 'info', 5000);
        this.playNotificationSound();

        /*
        // ❌ DISABLED: Prevent redundant system notification
        // These are already handled by the server sending a OneSignal push to the device
        if (window.WebViewBridge) {
          window.WebViewBridge.sendNotification(`🔔 ${n.title}`, n.message || 'New notification', {
            type: 'notification',
            id: n.id
          });
        }
        */
      }
    } else if (data.type === 'new_files') {
      const fileMsg = data.file_name ? `New file: ${data.file_name}` : `New files uploaded`;
      showNotification(`📁 ${fileMsg}`, 'info', 5000);
      this.playNotificationSound();

      /*
      // ❌ DISABLED: Prevent redundant system notification
      if (window.WebViewBridge) {
        window.WebViewBridge.sendNotification('📁 New File Uploaded', fileMsg, {
          type: 'new_file',
          view: data.section || 'dashboard'
        });
      }
      */

      // Auto-refresh the current view if it's a dynamic department/tab view
      if (window.NavigationService) {
        const view = NavigationService.currentView;
        const fileViews = [
          'gmMessage', 'pceeMessage', 'electricLoco', 'dieselLoco', 'vandeBharat',
          'memu', 'kachav', 'traffic', 'ohe', 'cw', 'pway', 'spad', 'ruleBooks',
          'divisions', 'nwrnotices'
        ];
        if (fileViews.includes(view)) {
          console.log(`[NotificationServiceV2] Auto-refreshing current view: ${view}`);
          NavigationService.navigateTo(view, false); // Reload without adding history
        } else if (view === 'mobileHome' || view === 'dashboard') {
          // If on home page, just refresh UI to show new badges
          this.updateUI();
        }
      }
    }
  },

  // --- UI UPDATES ---
  updateUI() {
    // 1. Clear all dynamic badges first to ensure stale ones disappear
    // We exempt the main divisionsCounter as it is handled specifically
    document.querySelectorAll('.tab-counter, .nav-tab-badge, .nav-badge, .lobby-badge').forEach(el => {
      if (el.id !== 'divisionsCounter') {
        el.style.display = 'none';
      }
    });

    this.updateNavigationBadges();
    this.updateTabBadges();
    this.updateNotificationBell();
    this.updateFaviconBadge();

    // Update Native Android App Icon Badge
    if (window.WebViewBridge) {
      const unreadCount = this.getUnreadCount(); // system notifications
      const fileCount = parseInt(this.counters.division?.count) || 0;
      window.WebViewBridge.setBadgeCount(unreadCount + fileCount);
    }

    // Re-render open dropdown
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown && dropdown.style.display === 'block') this.renderNotifications();
  },

  updateNavigationBadges() {
    const divCount = parseInt(this.counters.division?.count) || 0;

    // Sidebar "Divisions" nav item badge
    const divBadge = document.getElementById('divisionsCounter');
    if (divBadge) {
      divBadge.textContent = divCount > 99 ? '99+' : divCount;
      divBadge.style.display = divCount > 0 ? 'flex' : 'none';
      if (divCount > 0) divBadge.classList.add('counter-pulse');
      else divBadge.classList.remove('counter-pulse');
    }

    // Also update any nav-item or card with data-view="divisions"
    document.querySelectorAll('[data-view="divisions"]').forEach(el => {
      // Check if it's a sidebar/top-nav item (has .nav-item class or similar)
      const isCard = el.classList.contains('section-card') || el.classList.contains('division-card-big') || el.classList.contains('card');

      if (isCard) {
        // Use corner badge logic for cards
        if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
        el.style.overflow = 'visible';

        let b = el.querySelector('.tab-counter');
        if (!b) {
          b = document.createElement('span');
          b.className = 'tab-counter counter-pulse';
          b.style.cssText = 'position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#ff4757,#ff6b81); color:white; font-size:12px; font-weight:800; min-width:24px; height:24px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; padding:0 6px; box-shadow: 0 4px 12px rgba(255,71,87,0.4); border:2.5px solid white; z-index:100;';
          el.appendChild(b);
        }
        if (divCount > 0) {
          b.textContent = divCount > 99 ? '99+' : divCount;
          b.style.display = 'inline-flex';
        } else {
          b.style.display = 'none';
        }
      } else {
        // Sidebar or Bottom Nav item - use nav-badge
        let b = el.querySelector('.nav-badge');
        const isBottomNav = el.classList.contains('bottom-nav-item');

        if (!b) {
          b = document.createElement('span');
          b.className = 'nav-badge counter-pulse';

          if (isBottomNav) {
            // Absolute positioning for bottom nav
            b.style.cssText = 'position: absolute; top: -2px; right: 20%; background: linear-gradient(135deg,#ff4757,#ff6b81); color:white; font-size:9px; font-weight:700; min-width:16px; height:16px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; padding:0 4px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 100;';
          } else {
            // Flex positioning for sidebar
            b.style.cssText = 'background: linear-gradient(135deg,#ff4757,#ff6b81); color:white; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:inline-flex; align-items:center; justify-content:center; margin-left:auto; padding:0 5px; flex-shrink:0;';
          }
          el.appendChild(b);

          if (!isBottomNav) {
            el.style.display = 'flex';
            el.style.alignItems = 'center';
          } else {
            el.style.position = 'relative';
          }
        }
        if (divCount > 0) {
          b.textContent = divCount > 99 ? '99+' : divCount;
          b.style.display = 'inline-flex';
        } else {
          b.style.display = 'none';
        }
      }
    });

    // Lobby cards in division view — match by data-lobby attribute (corner badge)
    const lobbyHierarchy = this.hierarchy || {};
    Object.keys(lobbyHierarchy).forEach(name => {
      const count = lobbyHierarchy[name].count || 0;
      document.querySelectorAll(`[data-lobby="${name}"]`).forEach(el => {
        // Ensure position relative for corner badge
        if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
        el.style.overflow = 'visible';

        let b = el.querySelector('.lobby-badge');
        if (!b) {
          b = document.createElement('span');
          b.className = 'lobby-badge counter-pulse';
          // Corner badge: absolute top-right, premium look
          b.style.cssText = 'position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#ff4757,#ff6b81); color:white; font-size:12px; font-weight:800; min-width:24px; height:24px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; padding:0 6px; box-shadow: 0 4px 12px rgba(255,71,87,0.4); border:2.5px solid white; z-index:100;';
          el.appendChild(b);
        }
        if (count > 0) {
          b.textContent = count > 99 ? '99+' : count;
          b.style.display = 'inline-flex';
        } else {
          b.style.display = 'none';
        }
      });
    });
  },


  updateTabBadges() {
    if (!this.counters.tabs) return;

    // Map section names → main sidebar data-view values
    // The server stores section as a name like "Rule Books", "Electric Loco", etc.
    // The nav items use camelCase data-view like "ruleBooks", "electricLoco".
    const sectionToView = {
      'rule books': 'ruleBooks',
      'rule book': 'ruleBooks',
      'electric loco': 'electricLoco',
      'diesel loco': 'dieselLoco',
      'vande bharat': 'vandeBharat',
      'traffic': 'traffic',
      'ohe': 'ohe',
      'c & w': 'cw', 'c&w': 'cw',
      'p-way': 'pway', 'pway': 'pway',
      'spad prevention': 'spad', 'spad': 'spad',
      'gm message': 'gmMessage',
      'pcee message': 'pceeMessage',
      'memu': 'memu',
      'kachav': 'kachav',
      'kavach': 'kachav',
      'nwr notices': 'nwrnotices',
    };

    this.counters.tabs.forEach(tab => {
      const count = parseInt(tab.count) || 0;
      const sectionName = tab.section;
      const sectionKey = (sectionName || '').toLowerCase().trim();

      // --- A. Cards (Division, Lobby, and Dashboard Main Tab cards) ---
      // We look for any element with data-section or data-tab matching the section name
      document.querySelectorAll(`[data-section="${sectionName}"], [data-tab="${sectionName}"]`).forEach(el => {
        // Ensure position relative for the absolute corner badge
        const curPos = window.getComputedStyle(el).position;
        if (curPos === 'static') el.style.position = 'relative';
        el.style.overflow = 'visible'; // Never clip the badge

        let b = el.querySelector('.tab-counter');
        if (count > 0) {
          if (!b) {
            b = document.createElement('span');
            b.className = 'tab-counter counter-pulse';
            // Corner badge: absolute top-right, perfectly aligned, premium look
            b.style.cssText = 'position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#ff4757,#ff6b81); color:white; font-size:12px; font-weight:800; min-width:24px; height:24px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; padding:0 6px; box-shadow: 0 4px 12px rgba(255,71,87,0.4); border:2.5px solid white; z-index:100;';
            el.appendChild(b);
          }
          b.textContent = count > 99 ? '99+' : count;
          b.style.display = 'inline-flex';
        } else if (b) {
          b.style.display = 'none';
        }
      });

      // --- B. Main sidebar nav-items (data-view) ---
      const viewName = sectionToView[sectionKey];
      if (viewName) {
        document.querySelectorAll(`[data-view="${viewName}"]`).forEach(el => {
          // IMPORTANT: Do not add nav-tab-badge if it's a dashboard card (use isCard check)
          if (el.classList.contains('card') || el.classList.contains('section-card')) return;

          let b = el.querySelector('.nav-tab-badge');
          if (count > 0) {
            if (!b) {
              b = document.createElement('span');
              b.className = 'nav-tab-badge counter-pulse';
              b.style.cssText = 'background:linear-gradient(135deg,#ff4757,#ff6b81); color:white; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:inline-flex; align-items:center; justify-content:center; margin-left:auto; padding:0 5px; flex-shrink:0;';
              el.style.display = 'flex';
              el.style.alignItems = 'center';
              el.appendChild(b);
            }
            b.textContent = count > 99 ? '99+' : count;
            b.style.display = 'inline-flex';
          } else if (b) {
            b.style.display = 'none';
          }
        });
      }
    });

    // --- D. Special Lobby Group Aggregation ---
    // Calculate total sum of all lobby files to show on the parent "Lobby Shed Notice" tab
    let totalLobbyCount = 0;
    if (this.hierarchy) {
      Object.keys(this.hierarchy).forEach(lobbyName => {
        if (lobbyName !== 'General') { // Skip division-level files not assigned to a lobby
          totalLobbyCount += (this.hierarchy[lobbyName].count || 0);
        }
      });
    }

    document.querySelectorAll('[data-special="lobby-group"]').forEach(el => {
      if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.overflow = 'visible';

      let b = el.querySelector('.tab-counter');
      if (totalLobbyCount > 0) {
        if (!b) {
          b = document.createElement('span');
          b.className = 'tab-counter counter-pulse';
          b.style.cssText = 'position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#ff4757,#ff6b81); color:white; font-size:12px; font-weight:800; min-width:24px; height:24px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; padding:0 6px; box-shadow: 0 4px 12px rgba(255,71,87,0.4); border:2.5px solid white; z-index:100;';
          el.appendChild(b);
        }
        b.textContent = totalLobbyCount > 99 ? '99+' : totalLobbyCount;
        b.style.display = 'inline-flex';
      } else if (b) {
        b.style.display = 'none';
      }
    });

    // --- C. Dashboard "Latest Notices" scope markers ---
    if (this.counters.notifications > 0) {
      const bellBadge = document.getElementById('notificationBadge');
      if (bellBadge && parseInt(bellBadge.textContent) === 0) {
        // Force update if badge is out of sync
        this.updateNotificationBell();
      }
    }
  },

  updateNotificationBell() {
    const badge = document.getElementById('notificationBadge');
    const bell = document.getElementById('notificationBell');
    // Total = unread system notifications + pure notifications count from counters API
    const unreadNotifs = this.getUnreadCount();
    const counterNotifs = parseInt(this.counters.notifications) || 0;
    // Use the larger of the two — they count the same things differently
    const count = Math.max(unreadNotifs, counterNotifs);
    if (badge) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
    if (bell) {
      if (count > 0) bell.classList.add('has-notifications');
      else bell.classList.remove('has-notifications');
    }
  },


  updateFaviconBadge() {
    const count = this.getUnreadCount();
    if ('setAppBadge' in navigator) {
      if (count > 0) navigator.setAppBadge(count).catch(() => { });
      else navigator.clearAppBadge().catch(() => { });
    }
  },

  // --- BELL DROPDOWN ---
  toggleNotifications() {
    let dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) this.renderNotifications();
    } else {
      this.createDropdown();
    }
  },

  createDropdown() {
    // Remove old if exists
    const old = document.getElementById('notificationDropdown');
    if (old) old.remove();

    const dropdown = document.createElement('div');
    dropdown.id = 'notificationDropdown';

    const isMobile = window.innerWidth < 768;
    const bellContainer = document.getElementById('notificationBell');

    // Use fixed for mobile to avoid cropping, but absolute for desktop to stay anchored
    if (isMobile || !bellContainer) {
      dropdown.style.cssText = `
        position: fixed;
        top: 70px;
        right: 12px;
        left: 12px;
        width: calc(100vw - 24px);
        max-height: calc(100vh - 100px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 80px rgba(0,0,0,0.3);
        z-index: 1000000;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        animation: fadeIn 0.2s ease;
      `;
      document.body.appendChild(dropdown);
    } else {
      dropdown.style.cssText = `
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        width: 420px;
        max-height: 85vh;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.25), 0 0 1px rgba(0,0,0,0.1);
        z-index: 1000000;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        animation: slideInDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      bellContainer.appendChild(dropdown);
    }
    this.renderNotifications();
  },

  renderNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;

    const all = this.serverNotifications;
    const unreadCount = all.filter(n => !parseInt(n.is_read)).length;

    const isMobile = window.innerWidth < 768;
    let html = `
      <!-- Header -->
      <div style="padding:${isMobile ? '12px 14px' : '16px 18px 12px'}; background: white; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:10;">
        <div style="display:flex; align-items:center; gap:${isMobile ? '8px' : '10px'}; min-width:0;">
          <span style="font-size:${isMobile ? '18px' : '20px'}; flex-shrink:0;">🔔</span>
          <div style="min-width:0;">
            <div style="font-weight:700; font-size:${isMobile ? '14px' : '15px'}; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Notifications</div>
            <div style="font-size:10px; color:#6b7280; white-space:nowrap;">${unreadCount} unread</div>
          </div>
        </div>
        <div style="display:flex; gap:${isMobile ? '4px' : '6px'}; align-items:center; flex-shrink:0;">
          <button onclick="NotificationServiceV2.markAllAsRead()" style="background:#f0f9ff; border:1px solid #bae6fd; color:#0284c7; font-size:${isMobile ? '10px' : '11px'}; font-weight:600; padding:${isMobile ? '5px 8px' : '6px 12px'}; border-radius:8px; cursor:pointer; white-space:nowrap;">✓ All Read</button>
          <button onclick="NotificationServiceV2.clearAllNotifications()" style="background:#fff1f2; border:1px solid #fecdd3; color:#e11d48; font-size:${isMobile ? '10px' : '11px'}; font-weight:600; padding:${isMobile ? '5px 8px' : '6px 12px'}; border-radius:8px; cursor:pointer; white-space:nowrap;">🗑 Clear All</button>
          <button onclick="document.getElementById('notificationDropdown').style.display='none'" style="background:#f9fafb; border:1px solid #e5e7eb; color:#6b7280; font-size:16px; font-weight:700; width:${isMobile ? '26px' : '30px'}; height:${isMobile ? '26px' : '30px'}; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1;">×</button>
        </div>
      </div>
      <!-- List -->
      <div style="overflow-y:auto; max-height:calc(100vh - 180px);">
    `;

    if (all.length === 0) {
      html += `<div style="padding:48px 20px; text-align:center; color:#9ca3af;">
        <div style="font-size:40px; margin-bottom:12px;">📭</div>
        <div style="font-weight:600; font-size:14px;">No notifications yet</div>
        <div style="font-size:12px; margin-top:4px;">New file uploads will appear here</div>
      </div>`;
    } else {
      all.forEach(n => {
        const isRead = parseInt(n.is_read) === 1;
        const icon = n.scope === 'division' ? '🏢' : n.scope === 'lobby' ? '📬' : '📢';
        const scopeColor = n.scope === 'division' ? '#3b82f6' : n.scope === 'lobby' ? '#10b981' : '#f59e0b';
        const scopeLabel = n.scope === 'division' ? 'Division' : n.scope === 'lobby' ? 'Lobby' : 'Main';
        const timeStr = this.formatTime(n.created_at || n.timestamp);

        // Build file-open action if notification has a file reference
        const fileAction = n.file_id
          ? `NotificationServiceV2.openFileFromNotification('${n.id}','${n.file_id}','${(n.tab_id || '').replace(/'/g, "\\'")}','${(n.lobby_name || '').replace(/'/g, "\\'")}','${(n.division_name || '').replace(/'/g, "\\'")}');`
          : `NotificationServiceV2.markAsRead('${n.id}');`;

        html += `
          <div onclick="${fileAction}" style="padding:14px 16px; border-bottom:1px solid #f9fafb; background:${isRead ? 'white' : '#fefce8'}; cursor:pointer; transition:background 0.15s; display:flex; gap:12px; align-items:flex-start;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${isRead ? 'white' : '#fefce8'}'">
            <div style="width:36px; height:36px; background:${scopeColor}15; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">${icon}</div>
            <div style="flex:1; min-width:0;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px; flex-wrap:wrap;">
                ${!isRead ? '<span style="width:7px;height:7px;background:#ef4444;border-radius:50%;flex-shrink:0;display:inline-block;"></span>' : ''}
                <span style="font-weight:${isRead ? '500' : '700'}; font-size:13px; color:#111827; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${n.title || 'New Notification'}</span>
                <span style="font-size:10px; background:${scopeColor}15; color:${scopeColor}; padding:1px 6px; border-radius:4px; font-weight:600; flex-shrink:0;">${scopeLabel}</span>
              </div>
              <div style="font-size:12px; color:#6b7280; line-height:1.4; margin-bottom:4px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${n.message || ''}</div>
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <span style="font-size:10px; color:#9ca3af;">⏰ ${timeStr}${n.created_by_name ? ' • 👤 ' + n.created_by_name : ''}</span>
                ${n.file_id ? '<span style="font-size:11px; color:#3b82f6; font-weight:600;">📂 Open File →</span>' : ''}
              </div>
            </div>
          </div>
        `;
      });
    }

    html += `</div>
      <!-- Footer -->
      <div style="padding:10px 16px; background:#fafafa; border-top:1px solid #f3f4f6; text-align:center; position:sticky; bottom:0;">
        <button onclick="NavigationService.navigateTo('dashboard'); document.getElementById('notificationDropdown').style.display='none';" 
          style="background:linear-gradient(135deg,#667eea,#764ba2); color:white; border:none; padding:8px 20px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; width:100%;">
          View All Notices on Dashboard
        </button>
      </div>
    `;

    dropdown.innerHTML = html;
  },

  async openFileFromNotification(notificationId, fileId, tabId, lobbyName, divisionName) {
    console.log('🔔 Opening from notification:', { notificationId, fileId, tabId, lobbyName, divisionName });

    // Mark as read first
    this.markAsRead(notificationId);

    // Close dropdown
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) dropdown.style.display = 'none';

    if (!tabId && !fileId) return;

    // Check if it's a main tab (tabId is typically the view name like 'electricLoco')
    // Division tabs usually have IDs like '1_tab' or a numeric ID
    const isMainTab = tabId && !tabId.includes('_') && isNaN(parseInt(tabId));

    if (isMainTab && window.NavigationService) {
      console.log('🚀 Navigating to main tab:', tabId);
      await NavigationService.navigateTo(tabId);

      // If there's a specific file, open it after navigation
      if (fileId && window.ContentManagementService) {
        setTimeout(() => ContentManagementService.viewFile(fileId), 500);
      }
      return;
    }

    // Handle Division/Lobby tabs
    if (tabId && window.FilesPage) {
      console.log('🚀 Navigating to division/lobby tab:', { tabId, lobbyName, divisionName });

      // Navigate sidebar to 'divisions' so layout is correct
      if (window.NavigationService) NavigationService.navigateTo('divisions');

      // Small delay to let navigation settle, then render FilesPage
      setTimeout(async () => {
        try {
          // tabId serves as both id and display name (server returns tab name separately
          // but we only have the id here; FilesPage will resolve the name internally)
          if (lobbyName && divisionName) {
            await FilesPage.render(tabId, tabId, lobbyName, divisionName);
          } else if (divisionName) {
            await FilesPage.render(tabId, tabId, null, divisionName);
          } else {
            await FilesPage.render(tabId, tabId);
          }
          // Then highlight/open the specific file
          if (fileId) setTimeout(() => { if (window.FilesPage) FilesPage.viewFile(fileId); }, 350);
        } catch (e) {
          console.warn('[NotificationService] openFileFromNotification error:', e);
          if (window.ContentManagementService) ContentManagementService.viewFile(fileId);
        }
      }, 150);
    } else if (fileId && window.ContentManagementService) {
      // Fallback: just view the file directly
      ContentManagementService.viewFile(fileId);
    }
  },

  // --- ACTIONS ---
  async markAsRead(id) {
    const user = AuthService.getUser();
    await fetch(`${this.getBaseUrl()}/notifications/mark_read.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id || user.cms, notification_id: id })
    });
    this.fetchData();
  },

  async markAllAsRead() {
    const user = AuthService.getUser();
    await fetch(`${this.getBaseUrl()}/notifications/mark_read.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id || user.cms, mark_all: true })
    });
    this.fetchData();
    const d = document.getElementById('notificationDropdown');
    if (d) d.style.display = 'none';
  },

  async clearAllNotifications() {
    if (!confirm('🗑️ Clear all notifications?\n\nThis will permanently remove all notifications from your list.')) return;
    const user = AuthService.getUser();
    try {
      await fetch(`${this.getBaseUrl()}/notifications/mark_read.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id || user.cms, mark_all: true, clear_all: true })
      });
    } catch (e) {
      console.warn('[NotificationService] clearAll server error:', e);
    }
    // Clear local state immediately so UI feels instant
    this.serverNotifications = [];
    this.updateUI();
    this.renderNotifications();
    // Close dropdown after short delay so user sees the empty state
    setTimeout(() => {
      const d = document.getElementById('notificationDropdown');
      if (d) d.style.display = 'none';
    }, 700);
  },


  async markSectionAsViewed(section) {
    const user = AuthService.getUser();

    // 1. Optimistic Update: Clear locally first for instant vanishing
    if (this.counters && this.counters.tabs) {
      const tab = this.counters.tabs.find(t => t.section === section);
      if (tab) {
        const vanishedCount = parseInt(tab.count) || 0;
        tab.count = 0;

        // Also decrement aggregate divisions count if applicable
        if (this.counters.division) {
          this.counters.division.count = Math.max(0, (parseInt(this.counters.division.count) || 0) - vanishedCount);
        }

        // Update UI immediately
        this.updateUI();
      }
    }

    // 2. Performance-safe backend call
    try {
      await fetch(`${this.getBaseUrl()}/notifications/mark_file_viewed.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id || user.cms, mark_all: true, section })
      });
      // 3. Re-sync with server state (corrects any aggregation errors)
      this.fetchData();
    } catch (e) {
      console.error('[NotificationServiceV2] Mark as viewed failed:', e);
    }
  },

  async markFileAsViewed(fileId) {
    if (!fileId) return;
    const user = AuthService.getUser();
    try {
      await fetch(`${this.getBaseUrl()}/notifications/mark_file_viewed.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id || user.cms, file_id: fileId })
      });
      // Remove NEW badge from that file card in DOM
      const el = document.querySelector(`[data-file-id="${fileId}"] .new-badge-v2, [data-server-file-id="${fileId}"] .new-badge-v2`);
      if (el) el.remove();
      const el2 = document.querySelector(`[data-file-id="${fileId}"] [style*="NEW"], [data-server-file-id="${fileId}"] [style*="NEW"]`);
      if (el2) el2.remove();

      // Refresh counters to decrease badge count
      this.fetchData();
    } catch (e) {
      console.warn('[NotificationServiceV2] markFileAsViewed error:', e);
    }
  },

  // Determine if a file is "new" (unread by this user)
  // fileObj can be { id, uploadedAt, is_new } — we accept both old and new call signatures
  isFileNew(fileIdOrObj, uploadedAt) {
    let fileId, serverIsNew;

    if (fileIdOrObj && typeof fileIdOrObj === 'object') {
      // New-style call: pass the whole file object
      fileId = fileIdOrObj.server_file_id || fileIdOrObj.id;
      serverIsNew = fileIdOrObj.is_new;
      uploadedAt = fileIdOrObj.uploadedAt || fileIdOrObj.uploaded_at;
    } else {
      // Old-style call: isFileNew(id, uploadedAt)
      fileId = fileIdOrObj;
      serverIsNew = undefined;
    }

    // Layer 1: Trust server-computed is_new flag (most accurate — uses file_views table per-user)
    if (serverIsNew === true) return true;
    if (serverIsNew === false) return false;

    // Layer 2: Check the new_file_ids list from counters API
    if (this.counters.new_file_ids && fileId !== undefined) {
      const numId = parseInt(String(fileId).replace('server_', ''));
      if (!isNaN(numId) && this.counters.new_file_ids.includes(numId)) return true;
    }

    // Layer 3: Fallback — check upload timestamp vs threshold
    if (uploadedAt && this.counters.new_threshold) {
      return new Date(uploadedAt) > new Date(this.counters.new_threshold);
    }

    return false;
  },


  // --- HELPERS ---
  getUnreadCount() {
    return this.serverNotifications.filter(n => !parseInt(n.is_read)).length;
  },

  formatTime(ts) {
    if (!ts) return 'Just now';
    try {
      const date = new Date(ts);
      if (isNaN(date)) return 'Just now';
      const now = new Date();
      const diff = (now - date) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return date.toLocaleDateString('en-IN');
    } catch (e) { return 'Just now'; }
  },

  // --- LEGACY COMPATIBILITY ---

  updateCounterUI() { this.updateUI(); },
  updateCounters() { this.updateUI(); },
  startPeriodicFetch() { this.startPolling(); },
  async silentRefresh() { return this.fetchData(); },

  addNotification(notification) {
    if (!notification) return;
    const exists = this.serverNotifications.some(n => n.id === notification.id);
    if (!exists) this.serverNotifications.unshift(notification);
  },

  async fetchNotificationsFromServer() { return this.fetchData(); },

  openNotification(id) { this.markAsRead(id); },

  getNotificationsByScope() {
    return {
      mainNotices: this.serverNotifications.filter(n => n.scope === 'main' || n.scope === 'all' || !n.scope),
      divisionNotices: this.serverNotifications.filter(n => n.scope === 'division'),
      lobbyNotices: this.serverNotifications.filter(n => n.scope === 'lobby')
    };
  },

  getBaseUrl() {
    return (window.Api && Api.getBaseUrl) ? Api.getBaseUrl() : '/api';
  },

  playNotificationSound() {
    if (localStorage.getItem('notification_sound') === 'false') return;
    new Audio('assets/sounds/notification.mp3').play().catch(() => { });
  },

  // --- UPLOAD HANDLERS (for local sync) ---
  triggerFileNotification(data) {
    this.handleFileUpload(data);
  },

  handleFileUpload(data) {
    console.log('[NotificationServiceV2] Local upload detected:', data);
    // When a user on this device uploads something, we immediately fetch to update counters
    this.fetchData();

    // Also trigger updateUI which handles badge rendering
    setTimeout(() => this.updateUI(), 1000);
  }
};

// Self-initialize immediately so window.NotificationService is available before any page renders
NotificationServiceV2.init();
