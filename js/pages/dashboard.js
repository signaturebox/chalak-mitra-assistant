// Dashboard Page
const DashboardPage = {
  // Auto-refresh timer for notifications
  notificationRefreshTimer: null,

  render(container) {
    const user = AuthService.getUser();
    const roleConfig = APP_CONFIG.roles[user.role];

    const loginInfo = user.name
      ? `Logged in as ${roleConfig.label} — ${user.name} ${user.cms ? '(CMS: ' + user.cms + ')' : ''} • ${user.division.toUpperCase()} ${user.hq ? '• ' + user.hq : ''}`
      : 'Please login to access personalized features and auto-fill quiz.';

    container.innerHTML = `
      <div class="page active">
        <!-- Dashboard Hero Section -->
        <div class="mobile-hero" style="height: 320px; border-radius: 20px; margin-bottom: 24px;">
            <div class="hero-content">
                <div class="hero-logo" style="width: 64px; height: 64px; font-size: 36px;">🚆</div>
                <div class="hero-title-group">
                    <h1 class="hero-title" style="font-size: 36px;">NWR Chalak Mitra</h1>
                    <p class="hero-subtitle" style="font-size: 18px;">North Western Railway — चालक मित्र</p>
                    <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <span style="background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); padding: 5px 15px; border-radius: 20px; font-size: 13px; color: white; border: 1px solid rgba(255,255,255,0.3);">
                            Logged in as <strong>${roleConfig.label}</strong>
                        </span>
                        <span style="background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); padding: 5px 15px; border-radius: 20px; font-size: 13px; color: white; border: 1px solid rgba(255,255,255,0.3);">
                            ${user.name || 'Crew Member'}
                        </span>
                        ${user.division ? `<span style="background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); padding: 5px 15px; border-radius: 20px; font-size: 13px; color: white; border: 1px solid rgba(255,255,255,0.3);">${user.division.toUpperCase()}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>

        <!-- Notification Widget Section -->
        ${user.name ? this.renderNotificationWidget(user) : ''}

        <!-- Chalak Mitra Featured Card -->
        <div class="card" style="background: linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #2196f3 100%); color: white; border: none; cursor: pointer; transition: all 0.3s ease;" onclick="NavigationService.navigateTo('chalakMitra')" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 30px rgba(21, 101, 192, 0.4)';" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none';">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 80px; height: 80px; flex-shrink: 0;">
              <img src="./assets/images/chalak-mitra-logo.png" alt="Chalak Mitra" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=font-size:48px;display:flex;align-items:center;justify-content:center;height:100%>🤖</div>';">
            </div>
            <div>
              <div style="font-size: 22px; font-weight: 700; margin-bottom: 4px;">Chalak Mitra</div>
              <div style="font-size: 14px; opacity: 0.95;">Your AI Locomotive Troubleshooting Assistant</div>
              <div style="font-size: 12px; opacity: 0.85; margin-top: 8px;">💬 Ask in Hindi/English • 🔧 Step-by-step solutions • 📋 55+ fault codes</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
            <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 11px;">DJ/VCB Issues</span>
            <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 11px;">Pantograph Problems</span>
            <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 11px;">Traction Faults</span>
            <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 11px;">Converter Errors</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-title">Quick Access</div>
            <div class="muted">Access GM Messages, PCEE Messages, Division resources, Rule Books, Locomotive documentation, and SPAD Prevention guidelines.</div>
          </div>
          
          <div class="card">
            <div class="card-title">CLI Quiz System</div>
            <div class="muted">Take counseling quizzes, get instant results, and download certificates with QR codes for verification.</div>
          </div>
          
          <div class="card" onclick="NavigationService.navigateTo('search')" style="cursor: pointer;">
            <div class="card-title">Fault Search</div>
            <div class="muted">Search for locomotive faults by code, symptom, or loco type. Get instant troubleshooting steps.</div>
          </div>
          
          <!-- Dynamic Main Tab Cards -->
          ${this.renderDynamicMainTabCards()}
        </div>
      </div>
    `;

    if (user.name) {
      document.removeEventListener('notificationsUpdated', this.onNotificationsUpdated);
      this.onNotificationsUpdated = (e) => {
        console.log('[Dashboard] notificationsUpdated event received:', e?.detail);
        this.loadNotificationsForWidget();
      };
      document.addEventListener('notificationsUpdated', this.onNotificationsUpdated);

      this.onCountersUpdated = () => {
        this.loadNotificationsForWidget();
      };
      document.addEventListener('notificationCountersUpdated', this.onCountersUpdated);

      // Listen for user login to re-render dashboard with notifications
      document.removeEventListener('userLoggedIn', this.onUserLoggedIn);
      this.onUserLoggedIn = () => {
        console.log('[Dashboard] User logged in, re-rendering...');
        const mainContent = document.getElementById('mainContent');
        if (mainContent && document.getElementById('notificationWidgetSection')) {
          this.render(mainContent);
        }
      };
      document.addEventListener('userLoggedIn', this.onUserLoggedIn);

      // Immediate widget render (uses whatever data V2 already has in memory)
      this.loadNotificationsForWidget();

      // Force a fresh fetch so widget populates quickly
      if (window.NotificationServiceV2) {
        NotificationServiceV2.fetchData().then(() => {
          this.loadNotificationsForWidget();
        }).catch(err => console.warn('[Dashboard] Initial fetch failed:', err));
      }
    }
  },

  // Render dynamic main tab cards
  renderDynamicMainTabCards() {
    const structure = ContentManagementService.getContentStructure();
    const mainTabs = structure.mainTabs || [];

    // Filter out tabs that already have static cards (optional, or just render all new ones)
    // For simplicity, let's render cards for tabs that are NOT in the static list if we want to avoid duplicates.
    // The static list includes: GM Message, PCEE Message (in Quick Access), Rule Books (Quick Access), etc.
    // But "Quick Access" is just a text card.
    // The user wants "show like as card of main tab".

    // Let's render cards for all custom main tabs (those not in the default config or just everything).
    // Actually, "Quick Access" links to multiple things.
    // Let's just render a card for each Main Tab found in structure.

    let html = '';

    mainTabs.forEach(tab => {
      // Skip if it's one of the "Tools" which already have cards (Quiz, Fault Search, Chalak Mitra)
      if (['CLI Quiz', 'Fault Search', 'Chalak Mitra', 'Division Resources'].includes(tab.name)) return;

      const viewId = tab.name.toLowerCase().replace(/\s+/g, '');
      const icon = tab.icon || '📁';
      const color = tab.color || '#667eea';

      html += `
        <div class="card" data-section="${tab.name}" onclick="NavigationService.navigateTo('${viewId}')" 
             style="cursor: pointer; border-left: 4px solid ${color}; position: relative; overflow: visible;">
          <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
            <span>${icon}</span> ${tab.name}
          </div>
          <div class="muted">Access ${tab.name} resources and documents.</div>
        </div>
      `;
    });

    return html;
  },

  // Render notification widget section
  renderNotificationWidget(user) {
    let content = '';
    try {
      const svc = window.NotificationServiceV2 || window.NotificationService;
      if (svc && typeof svc.getNotificationsByScope === 'function') {
        const { mainNotices, divisionNotices, lobbyNotices } = svc.getNotificationsByScope();
        content = this.generateWidgetHTML(mainNotices || [], divisionNotices || [], lobbyNotices || [], user);
      } else {
        content = this.generateWidgetHTML([], [], [], user);
      }
    } catch (e) {
      console.warn('[Dashboard] Widget render error:', e);
      content = this.generateWidgetHTML([], [], [], user);
    }

    const pushSupported = PushNotificationService.isSupported ? PushNotificationService.isSupported() : false;
    const pushPermission = PushNotificationService.getPermissionStatus ? PushNotificationService.getPermissionStatus() : 'default';
    const showPushButton = pushSupported && pushPermission !== 'granted';

    return `
      <div id="notificationWidgetSection" class="notification-widget-section" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">🔔</span>
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">Latest Notices</h3>
            <span style="font-size: 10px; background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 10px; border: 1px solid #10b981;">Live</span>
          </div>
          <div style="display: flex; gap: 8px;">
            ${showPushButton ? `
            <button onclick="DashboardPage.enablePushNotifications()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 8px 16px; border-radius: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <span>🔔</span> Enable Notifications
            </button>
            ` : ''}
            <button id="refreshNoticesBtn" onclick="DashboardPage.refreshNotices()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 8px 16px; border-radius: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <span id="refreshIcon">🔄</span> Refresh
            </button>
          </div>
        </div>
        
        <div id="notificationWidgetContent" class="notification-widget-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
          ${content}
        </div>
      </div>
    `;
  },

  // Helper to generate widget HTML
  generateWidgetHTML(mainNotices, divisionNotices, lobbyNotices, user) {
    return `
        <!-- Main Tab Notices -->
        <div class="notice-card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; border: 2px solid #fbbf24;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <span style="font-size: 28px;">📢</span>
            <div>
              <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #92400e;">Main Tab Notices</h4>
              <span style="font-size: 11px; color: #b45309;">For all divisions & lobbies</span>
            </div>
          </div>
          <div class="notice-list" style="max-height: 200px; overflow-y: auto;">
            ${mainNotices.length === 0 ?
        `<div style="color: #92400e; font-size: 13px; padding: 12px; background: rgba(255,255,255,0.5); border-radius: 8px;">No main notices at the moment</div>` :
        mainNotices.slice(0, 3).map(n => this.renderNoticeItem(n, 'main')).join('')
      }
          </div>
          ${mainNotices.length > 3 ? `<div style="text-align: center; margin-top: 12px;"><button onclick="DashboardPage.showAllNotices()" style="background: #92400e; color: white; border: none; padding: 6px 16px; border-radius: 12px; font-size: 11px; cursor: pointer;">🔔 View all ${mainNotices.length} notices</button></div>` : ''}
        </div>
        
        <!-- Division Notices -->
        <div class="notice-card" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 16px; padding: 20px; border: 2px solid #3b82f6;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <span style="font-size: 28px;">🏢</span>
            <div>
              <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #1e40af;">${user.division?.toUpperCase() || ''} Division Notices</h4>
              <span style="font-size: 11px; color: #1d4ed8;">For ${user.division?.charAt(0).toUpperCase() + user.division?.slice(1) || 'your'} division crews</span>
            </div>
          </div>
          <div class="notice-list" style="max-height: 200px; overflow-y: auto;">
            ${divisionNotices.length === 0 ?
        `<div style="color: #1e40af; font-size: 13px; padding: 12px; background: rgba(255,255,255,0.5); border-radius: 8px;">No division notices</div>` :
        divisionNotices.slice(0, 3).map(n => this.renderNoticeItem(n, 'division')).join('')
      }
          </div>
          ${divisionNotices.length > 3 ? `<div style="text-align: center; margin-top: 12px;"><button onclick="DashboardPage.showAllNotices()" style="background: #1e40af; color: white; border: none; padding: 6px 16px; border-radius: 12px; font-size: 11px; cursor: pointer;">🔔 View all ${divisionNotices.length} notices</button></div>` : ''}
        </div>
        
        <!-- Lobby Notices -->
        <div class="notice-card" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 16px; padding: 20px; border: 2px solid #10b981;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <span style="font-size: 28px;">📬</span>
            <div>
              <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #065f46;">${user.hq || 'Lobby'} Notices</h4>
              <span style="font-size: 11px; color: #047857;">For ${user.hq || 'your lobby'} crews only</span>
            </div>
          </div>
          <div class="notice-list" style="max-height: 200px; overflow-y: auto;">
            ${lobbyNotices.length === 0 ?
        `<div style="color: #065f46; font-size: 13px; padding: 12px; background: rgba(255,255,255,0.5); border-radius: 8px;">No lobby notices</div>` :
        lobbyNotices.slice(0, 3).map(n => this.renderNoticeItem(n, 'lobby')).join('')
      }
          </div>
          ${lobbyNotices.length > 3 ? `<div style="text-align: center; margin-top: 12px;"><button onclick="DashboardPage.showAllNotices()" style="background: #065f46; color: white; border: none; padding: 6px 16px; border-radius: 12px; font-size: 11px; cursor: pointer;">🔔 View all ${lobbyNotices.length} notices</button></div>` : ''}
        </div>
      `;
  },

  // Load notifications for dashboard widget
  async loadNotificationsForWidget() {
    const widgetContent = document.getElementById('notificationWidgetContent');
    if (!widgetContent) return;

    const user = AuthService.getUser();
    if (!user) {
      widgetContent.innerHTML = `<div style="text-align: center; padding: 20px; color: #ef4444;">Please log in to view notices.</div>`;
      return;
    }

    try {
      // Use V2 service (which IS NotificationService now)
      const svc = window.NotificationServiceV2 || window.NotificationService;
      if (!svc) return;

      const { mainNotices, divisionNotices, lobbyNotices } = svc.getNotificationsByScope();
      widgetContent.innerHTML = this.generateWidgetHTML(mainNotices, divisionNotices, lobbyNotices, user);
    } catch (error) {
      console.error('Failed to load notifications for widget:', error);
      widgetContent.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #ef4444; grid-column: 1/-1;">
          <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
          Failed to load notices. <button onclick="DashboardPage.refreshNotices()" style="color: #667eea; background: none; border: none; cursor: pointer; text-decoration: underline;">Try again</button>
        </div>
      `;
    }
  },

  // Render individual notice item
  renderNoticeItem(notice, type) {
    const bgColors = {
      main: 'rgba(255,255,255,0.6)',
      division: 'rgba(255,255,255,0.6)',
      lobby: 'rgba(255,255,255,0.6)'
    };
    const textColors = {
      main: '#92400e',
      division: '#1e40af',
      lobby: '#065f46'
    };

    // Use data-attributes to avoid complex JS-in-HTML-string escaping
    const noticeId = (notice.id || '').toString().replace(/"/g, '');
    const fileId = (notice.file_id || '').toString().replace(/"/g, '');
    const tabId = (notice.tab_id || '').toString().replace(/"/g, '');
    const lobbyNm = (notice.lobby_name || '').replace(/"/g, '');
    const divNm = (notice.division_name || '').replace(/"/g, '');
    const isUnread = !notice.is_read && !parseInt(notice.is_read);

    return `
      <div class="dash-notice-item"
           data-notice-id="${noticeId}"
           data-file-id="${fileId}"
           data-tab-id="${tabId}"
           data-lobby="${lobbyNm}"
           data-division="${divNm}"
           onclick="DashboardPage.openNoticeItem(this)"
           style="background: ${bgColors[type]}; padding: 12px; border-radius: 10px; margin-bottom: 10px; cursor: pointer; transition: opacity 0.15s ease;"
           onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 13px; color: ${textColors[type]}; display: flex; align-items: center; gap: 6px;">
              ${isUnread ? `<span style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; flex-shrink: 0;"></span>` : ''}
              ${notice.title || 'New Notice'}
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px; line-height: 1.4;">${(notice.message || '').substring(0, 80)}${(notice.message || '').length > 80 ? '...' : ''}</div>
            <div style="font-size: 10px; color: #9ca3af; margin-top: 6px; display: flex; align-items: center; gap: 8px;">
              <span>🕐 ${NotificationServiceV2.formatTime(notice.created_at || notice.timestamp)}</span>
              ${notice.created_by_name ? `<span>👤 ${notice.created_by_name}</span>` : ''}
              ${fileId ? `<span style="color:#3b82f6; font-weight:600;">📂 Open file →</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Handle click on a notice item in the dashboard widget
  openNoticeItem(el) {
    const noticeId = el.dataset.noticeId;
    const fileId = el.dataset.fileId;
    const tabId = el.dataset.tabId;
    const lobbyName = el.dataset.lobby;
    const divName = el.dataset.division;
    const svc = window.NotificationServiceV2 || window.NotificationService;
    if (fileId && svc) {
      svc.openFileFromNotification(noticeId, fileId, tabId, lobbyName, divName);
    } else if (svc) {
      svc.markAsRead(noticeId);
    }
  },

  // Open the bell notification dropdown (called from "View all" buttons)
  showAllNotices() {
    // Show the bell dropdown
    const svc = window.NotificationServiceV2 || window.NotificationService;
    if (!svc) return;
    // Force-open the dropdown
    let dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) {
      svc.createDropdown();
    } else {
      dropdown.style.display = 'block';
      svc.renderNotifications();
    }
    // Scroll bell into view on mobile
    const bell = document.getElementById('notificationBell');
    if (bell) bell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  // Manual refresh handler
  async refreshNotices() {
    const btn = document.getElementById('refreshNoticesBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>🔄</span> Refreshing...';
    }
    try {
      if (window.NotificationServiceV2) {
        await NotificationServiceV2.fetchData();
      }
      this.loadNotificationsForWidget();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setTimeout(() => {
        if (btn) {
          btn.innerHTML = '<span id="refreshIcon">🔄</span> Refresh';
          btn.disabled = false;
        }
      }, 800);
    }
  },

  // Enable push notifications
  async enablePushNotifications() {
    try {
      console.log('[Dashboard] Enabling push notifications...');

      if (!PushNotificationService.isSupported || !PushNotificationService.isSupported()) {
        showNotification('Push notifications are not supported in this browser', 'error');
        return;
      }

      // Web Push is now integrated into OneSignal
      // if (PushNotificationService.isSupported()) {
      //   PushNotificationService.initWebPush();
      // }

      // Check current permission
      const permission = PushNotificationService.getPermissionStatus();

      if (permission === 'denied') {
        showNotification('⚠️ Notification permission was blocked. Please reset it in your browser settings (click the lock icon next to the URL).', 'error', 8000);
        return;
      }

      const result = await PushNotificationService.initWebPush();

      if (result) {
        showNotification('✅ Push notifications enabled! You will receive notifications even when the app is closed.', 'success');
        // Re-render to hide the button
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
          this.render(mainContent);
        }
      } else {
        showNotification('❌ Failed to enable push notifications. Please check browser permissions.', 'error');
      }
    } catch (error) {
      console.error('[Dashboard] Error enabling push notifications:', error);
      showNotification('❌ Error enabling push notifications', 'error');
    }
  }
};
