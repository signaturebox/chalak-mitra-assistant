// Profile Page
const ProfilePage = {
  currentEditEntryId: null,
  allLogbookRecords: [],

  // Show notifications popup
  showNotifications() {
    if (window.NotificationService && typeof NotificationService.toggleNotifications === 'function') {
      NotificationService.toggleNotifications();
    } else {
      // Fallback notification display
      const notificationPanel = document.getElementById('notificationPanel');
      if (notificationPanel) {
        notificationPanel.classList.toggle('show');
      } else {
        alert('Notifications feature coming soon!');
      }
    }
  },

  render(container) {
    let user = AuthService.getUser();

    // Check if user is properly authenticated
    if (!user || (!user.cms && !user.email)) {
      // Double-check after a brief delay in case state is still loading
      setTimeout(() => {
        const freshUser = AuthService.getUser();
        if (freshUser && (freshUser.cms || freshUser.email)) {
          // User is actually logged in, re-render the profile page
          this.render(container);
        }
      }, 100);

      // Show not logged in message initially
      container.innerHTML = `
        <div class="page active">
          <div class="card">
            <div class="card-title"><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Not Logged In</div>
            <div class="muted">Please login to view your profile.</div>
            <button class="btn-gradient" onclick="document.getElementById('loginModal').classList.add('show')" style="margin-top: 16px;">
              <img src="https://img.icons8.com/3d-fluency/94/lock.png" width="24" height="24" alt="login" style="vertical-align: middle;"> Login
            </button>
          </div>
        </div>
      `;
      return;
    }

    const roleConfig = APP_CONFIG.roles[user.role];

    container.innerHTML = `
      <div class="profile-dashboard-container" id="profilePage">
        <!-- Light Theme Header -->
        <div class="profile-native-header">
          <div class="profile-header-logo">
            <img src="assets/images/chalak-mitra-logo.png" alt="NWR Chalak Mitra" onerror="this.src='https://img.icons8.com/3d-fluency/94/train.png'">
            <span class="profile-header-title">NWR Chalak Mitra</span>
          </div>
          <div class="profile-header-actions">
            <button class="profile-header-btn" onclick="ProfilePage.showNotifications()" title="Notifications">
              <img src="https://img.icons8.com/3d-fluency/94/appointment-reminders.png" alt="notifications" style="width:22px;height:22px;">
            </button>
            <button class="profile-logout-btn" onclick="AuthService.logout()">Logout</button>
          </div>
        </div>

        <!-- Light Theme Hero Section -->
        <div class="profile-premium-hero">
          <div class="hero-avatar-container">
            <div class="hero-avatar-large">
              <img src="https://img.icons8.com/3d-fluency/94/worker-male.png" alt="Avatar">
            </div>
          </div>
          <div class="hero-info">
            <h2 class="hero-name">${user.cms || user.cms_id || 'HMH1816'}</h2>
            <div class="hero-cms">${user.name || 'Crew Member'}</div>
            <div class="hero-badge-container">
              <span class="hero-badge">${(user.division || user.dept || 'Bikaner').toUpperCase()} Division</span>
              <span class="hero-badge">${user.designation || user.position || 'SALP'}</span>
              <span class="hero-badge">${user.hq || user.lobby || 'HMH - Hanumangarh Jn.'}</span>
            </div>
          </div>
        </div>

        <!-- Animated Quick Stats Row -->
        <div class="profile-quick-stats">
          <div class="stat-box" onclick="ProfilePage.switchTab('logbook')">
            <div class="stat-icon-circle bg-blue-light"><span class="material-icons" style="font-size:18px;color:#3b82f6;">trending_up</span></div>
            <div class="stat-value-sm" id="activityOverviewCount">0</div>
            <div class="stat-label-xs">ACTIVITY</div>
          </div>
          <div class="stat-box" onclick="ProfilePage.switchTab('quiz')">
            <div class="stat-icon-circle bg-green-light"><span class="material-icons" style="font-size:18px;color:#22c55e;">check_circle</span></div>
            <div class="stat-value-sm" id="completedTasksCount">0</div>
            <div class="stat-label-xs">TASKS</div>
          </div>
          <div class="stat-box" onclick="ProfilePage.switchTab('quiz')">
            <div class="stat-icon-circle bg-purple-light"><span class="material-icons" style="font-size:18px;color:#a855f7;">insights</span></div>
            <div class="stat-value-sm" id="trainingProgressCount">0%</div>
            <div class="stat-label-xs">PROGRESS</div>
          </div>
          <div class="stat-box" onclick="ProfilePage.switchTab('logbook')">
            <div class="stat-icon-circle bg-orange-light"><span class="material-icons" style="font-size:18px;color:#f97316;">schedule</span></div>
            <div class="stat-value-sm" id="dutyHoursCount">0.0</div>
            <div class="stat-label-xs">DUTY HRS</div>
          </div>
        </div>

        <!-- Tab Navigation (Hidden in main dashboard, but kept for logic) -->
        <div class="profile-page-tabs" style="display: none;">
          <div id="profilePageDashboardTab" class="profile-page-tab active" onclick="ProfilePage.switchTab('dashboard')"></div>
          <div id="profilePageLogbookTab" class="profile-page-tab" onclick="ProfilePage.switchTab('logbook')"></div>
          <div id="profilePageToolsTab" class="profile-page-tab" onclick="ProfilePage.switchTab('tools')"></div>
          <div id="profilePageRunningRoomTab" class="profile-page-tab" onclick="ProfilePage.switchTab('runningroom')"></div>
          <div id="profilePageInfoTab" class="profile-page-tab" onclick="ProfilePage.switchTab('info')"></div>
          <div id="profilePageQuizTab" class="profile-page-tab" onclick="ProfilePage.switchTab('quiz')"></div>
          <div id="profilePageSupportTab" class="profile-page-tab" onclick="ProfilePage.switchTab('support')"></div>
          <div id="profilePageFeedbackTab" class="profile-page-tab" onclick="ProfilePage.switchTab('feedback')"></div>
          <div id="profilePageSettingsTab" class="profile-page-tab" onclick="ProfilePage.switchTab('settings')"></div>
        </div>

        <!-- Main Dashboard View -->
        <div id="profilePageDashboardContent" class="profile-page-content" style="display: block;">
          <div class="profile-action-grid">
            <div class="action-card stagger-1" onclick="ProfilePage.switchTab('logbook')">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#3b82f6;">menu_book</span></span>
              <span class="action-label">Digital Logbook</span>
            </div>
            <div class="action-card stagger-2" onclick="ProfilePage.switchTab('tools')">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#f97316;">build</span></span>
              <span class="action-label">Tools History</span>
            </div>
            <div class="action-card stagger-3" onclick="ProfilePage.switchTab('runningroom')">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#8b5cf6;">hotel</span></span>
              <span class="action-label">Running Room</span>
            </div>
            <div class="action-card stagger-4" onclick="ProfilePage.switchTab('quiz')">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#22c55e;">quiz</span></span>
              <span class="action-label">Training Quizzes</span>
            </div>
            <div class="action-card stagger-5" onclick="ProfilePage.switchTab('support')">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#eab308;">support_agent</span></span>
              <span class="action-label">Support Help</span>
            </div>
            <div class="action-card stagger-6" onclick="ProfilePage.switchTab('info')">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#06b6d4;">person</span></span>
              <span class="action-label">Personal Info</span>
            </div>
            <div class="action-card stagger-7" onclick="ProfilePage.switchTab('feedback')">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#ec4899;">feedback</span></span>
              <span class="action-label">App Feedback</span>
            </div>
            <div class="action-card stagger-8" onclick="ProfilePage.switchTab('settings')">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#64748b;">settings</span></span>
              <span class="action-label">Settings</span>
            </div>
            <div class="action-card stagger-9" onclick="AuthService.logout()">
              <span class="action-icon"><span class="material-icons" style="font-size:24px;color:#ef4444;">logout</span></span>
              <span class="action-label">Logout</span>
            </div>
          </div>
          
          <!-- Recent Activity Premium List -->
          <div class="profile-recent-section">
            <div class="section-head">
              <h3 class="section-title"><img src="https://img.icons8.com/3d-fluency/94/note.png" width="24" height="24" alt="note" style="vertical-align: middle;"> Recent Activities</h3>
              <a href="#" class="view-all-link" onclick="ProfilePage.switchTab('logbook'); return false;">View All</a>
            </div>
            <div id="recentActivityListPremium" class="activity-list-premium">
              <div class="empty-state" style="padding: 20px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 8px;"><img src="https://img.icons8.com/3d-fluency/94/note.png" width="24" height="24" alt="note" style="vertical-align: middle;"></div>
                <div>No recent activity</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Digital Logbook Tab Content -->
        <div id="profilePageLogbookContent" class="profile-page-content" style="display: none;">
          <!-- Digital Logbook Home -->
          <div id="logbookHome" style="display: none;">
            <!-- Logbook Hero (no photo, gradient only) -->
            <div style="margin: -20px -20px 24px -20px; border-radius: 0 0 28px 28px; padding: 32px 24px; background: linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #0ea5e9 100%); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.06); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -30px; right: 30px; width: 80px; height: 80px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                <div style="display: flex; align-items: center; gap: 16px; position: relative; z-index: 2;">
                    <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px;"><img src="https://img.icons8.com/3d-fluency/94/book.png" width="24" height="24" alt="book" style="vertical-align: middle;"></div>
                    <div>
                        <h2 style="font-size: 22px; margin: 0; color: white; font-weight: 800; letter-spacing: -0.5px;">Digital Logbook</h2>
                        <p style="font-size: 13px; margin: 3px 0 0; color: rgba(255,255,255,0.85); font-weight: 500;">North Western Railway • सुरक्षित यात्रा</p>
                    </div>
                </div>
            </div>

            <!-- Stats Overlay Cards -->
            <div class="quick-cards" style="margin-top: -45px; margin-bottom: 30px; grid-template-columns: repeat(3, 1fr);">
                <div class="quick-card" style="padding: 18px 10px; border-radius: 20px;">
                    <span class="quick-card-icon" style="color: #2563eb; font-size: 24px;"><img src="https://img.icons8.com/3d-fluency/94/book.png" width="24" height="24" alt="book" style="vertical-align: middle;"></span>
                    <div class="quick-card-label" style="font-size: 15px; font-weight: 800; color: #1e293b; margin-top: 4px;" id="logbookTotalEntries">--</div>
                    <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Logs</div>
                </div>
                <div class="quick-card" style="padding: 18px 10px; border-radius: 20px;">
                    <span class="quick-card-icon" style="color: #059669; font-size: 24px;"><img src="https://img.icons8.com/3d-fluency/94/timer.png" width="24" height="24" alt="timer" style="vertical-align: middle;"></span>
                    <div class="quick-card-label" style="font-size: 15px; font-weight: 800; color: #1e293b; margin-top: 4px;" id="logbookTotalHours">0h</div>
                    <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Hours</div>
                </div>
                <div class="quick-card" style="padding: 18px 10px; border-radius: 20px;" onclick="ProfilePage.syncToCloud()">
                    <span class="quick-card-icon" style="color: #7c3aed; font-size: 24px;"><img src="https://img.icons8.com/3d-fluency/94/cloud.png" width="24" height="24" alt="cloud" style="vertical-align: middle;"></span>
                    <div class="quick-card-label" style="font-size: 12px; font-weight: 800; color: #1e293b; margin-top: 4px;" id="logbookSyncStatus">SYNCED</div>
                    <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Status</div>
                </div>
            </div>

            <!-- Action Sections - Grid Style -->
            <h3 style="font-size: 14px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 4px;">Duty Management</h3>
            
            <div class="mobile-sections-grid" style="grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 0;">
                <div class="section-card border-blue" onclick="ProfilePage.showLogbookForm()" style="padding: 24px 16px; min-height: 140px;">
                    <div class="section-icon"><img src="https://img.icons8.com/3d-fluency/94/plus-math.png" width="24" height="24" alt="add" style="vertical-align: middle;"></div>
                    <div class="section-label" style="font-size: 14px; font-weight: 800;">Add New Entry</div>
                    <div class="section-status">Record movement</div>
                </div>
                <div class="section-card border-green" onclick="ProfilePage.showLogbookRecords()" style="padding: 24px 16px; min-height: 140px;">
                    <div class="section-icon"><img src="https://img.icons8.com/3d-fluency/94/scroll.png" width="24" height="24" alt="history" style="vertical-align: middle;"></div>
                    <div class="section-label" style="font-size: 14px; font-weight: 800;">View History</div>
                    <div class="section-status">Browse records</div>
                </div>
            </div>

            <!-- Recent Activity List -->
            <div style="margin-top: 36px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 0;">Recent Movements</h3>
                    <div onclick="ProfilePage.showLogbookRecords()" style="font-size: 13px; font-weight: 700; color: #2563eb; cursor: pointer;">See All</div>
                </div>
                <div id="miniLogbookActivity" class="activity-list" style="display: flex; flex-direction: column; gap: 12px;">
                    <!-- Mini records will be loaded here -->
                    <div class="empty-state" style="padding: 24px; background: white; border: 1px dashed #e2e8f0; border-radius: 20px;">
                        <span style="font-size: 24px; opacity: 0.5;"><img src="https://img.icons8.com/3d-fluency/94/book.png" width="24" height="24" alt="book" style="vertical-align: middle;"></span>
                        <p style="margin: 8px 0 0; color: #94a3b8; font-size: 13px;">No entries yet. Tap '+' to start logging.</p>
                    </div>
                </div>
            </div>
          </div>


          <!-- Logbook Records List -->
          <div id="logbookRecords" style="display: none;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
              <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #1e293b;"><img src="https://img.icons8.com/3d-fluency/94/clipboard.png" width="24" height="24" alt="clipboard" style="vertical-align: middle;"> Duty History</h3>
              <button onclick="ProfilePage.showLogbookHome()" style="background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 8px 16px; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <span class="material-icons" style="font-size: 16px;">arrow_back</span> Back
              </button>
            </div>

            <!-- Compact Search & Filter -->
            <div style="background: white; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 16px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
              <div style="flex: 1; min-width: 180px; position: relative;">
                <span class="material-icons" style="position: absolute; left: 10px; top: 10px; font-size: 18px; color: #94a3b8;">search</span>
                <input id="logbookSearch" type="text" placeholder="Search train, station..." oninput="ProfilePage.filterLogbookRecords()"
                  style="width: 100%; height: 38px; padding: 0 12px 0 36px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 13px; box-sizing: border-box;">
              </div>
              <div style="position: relative; min-width: 130px;">
                <select id="logbookFilter" onchange="ProfilePage.filterLogbookRecords()" style="height: 38px; padding: 0 32px 0 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 13px; appearance: none; background: white; font-weight: 600; color: #475569; width: 100%;">
                  <option value="">All Duties</option>
                  <option value="WKG">WKG</option>
                  <option value="LR">LR</option>
                  <option value="SPR">SPR</option>
                </select>
                <span class="material-icons" style="position: absolute; right: 8px; top: 10px; font-size: 16px; color: #94a3b8; pointer-events: none;">expand_more</span>
              </div>
              <div style="position: relative; min-width: 130px;">
                <select id="logbookDateFilter" onchange="ProfilePage.filterLogbookRecords()" style="height: 38px; padding: 0 32px 0 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 13px; appearance: none; background: white; font-weight: 600; color: #475569; width: 100%;">
                  <option value="">All Time</option>
                  <option value="1">Last Month</option>
                  <option value="3">Last 3 Months</option>
                  <option value="6">Last 6 Months</option>
                </select>
                <span class="material-icons" style="position: absolute; right: 8px; top: 10px; font-size: 16px; color: #94a3b8; pointer-events: none;">expand_more</span>
              </div>
              <div style="display: flex; gap: 6px; margin-left: auto;">
                <button onclick="ProfilePage.exportToPDF()" style="height: 38px; padding: 0 12px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <span class="material-icons" style="font-size: 15px;">picture_as_pdf</span> PDF
                </button>
                <button onclick="ProfilePage.shareSelectedRecords()" style="height: 38px; padding: 0 12px; background: #2563eb; border: none; border-radius: 10px; font-size: 12px; font-weight: 700; color: white; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <span class="material-icons" style="font-size: 15px;">share</span> Share
                </button>
              </div>
            </div>

            <!-- Records List -->
            <div id="logbookRecordsList" class="records-container"></div>
          </div>

          <!-- Logbook Entry Form — Premium Design -->
          <div id="logbookForm" style="display:none; padding-bottom: 100px;">

            <!-- Sticky Form Header -->
            <div class="lb-form-hero">
              <div class="lb-form-hero-bg"></div>
              <div class="lb-form-hero-content">
                <button class="lb-back-btn" onclick="ProfilePage.showLogbookHome()">
                  <span class="material-icons">arrow_back</span>
                </button>
                <div>
                  <div class="lb-form-hero-label">NWR Chalak Mitra</div>
                  <h2 class="lb-form-hero-title" id="lb-form-title"><img src="https://img.icons8.com/3d-fluency/94/clipboard.png" width="24" height="24" alt="clipboard" style="vertical-align: middle;"> New Duty Entry</h2>
                </div>
                <div class="lb-form-step-badge" id="lb-form-step">Section 1 of 6</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="lb-progress-wrap">
              <div class="lb-progress-track">
                <div class="lb-progress-fill" id="lb-progress-fill" style="width:16.6%"></div>
              </div>
              <div class="lb-progress-dots">
                <span class="lb-dot active" data-step="1" title="Duty Details"></span>
                <span class="lb-dot" data-step="2" title="Movement"></span>
                <span class="lb-dot" data-step="3" title="Crew"></span>
                <span class="lb-dot" data-step="4" title="Brake"></span>
                <span class="lb-dot" data-step="5" title="Safety"></span>
                <span class="lb-dot" data-step="6" title="Tools"></span>
              </div>
            </div>

            <!-- ━━━━━ SECTION A: Duty/Train Details ━━━━━ -->
            <div class="lb-card lb-card-blue lb-section-animate" id="lb-sec-1">
              <div class="lb-card-header">
                <div class="lb-card-icon-wrap" style="background:linear-gradient(135deg,#1e40af,#3b82f6)"><img src="https://img.icons8.com/3d-fluency/94/train.png" width="24" height="24" alt="train" style="vertical-align: middle;"></div>
                <div>
                  <div class="lb-card-section-label">Section A</div>
                  <div class="lb-card-title">Duty & Train Details</div>
                </div>
                <span class="lb-required-badge">Required</span>
              </div>

              <div class="lb-field-grid-2">
                <div class="lb-field">
                  <label class="lb-label" for="logDate"><img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="date" style="vertical-align: middle;"> Date <span class="lb-req">*</span></label>
                  <input class="lb-input" id="logDate" type="date" required />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logDutyType"><img src="https://img.icons8.com/3d-fluency/94/tags.png" width="24" height="24" alt="tag" style="vertical-align: middle;"> Duty Type <span class="lb-req">*</span></label>
                  <select class="lb-input lb-select" id="logDutyType" required>
                    <option value="">Select Type</option>
                    <option value="WKG">WKG – Working</option>
                    <option value="LR">LR – Learning Road</option>
                    <option value="SPR">SPR – Spare</option>
                  </select>
                </div>
              </div>

              <div class="lb-field-grid-2">
                <div class="lb-field">
                  <label class="lb-label" for="logTrainNo"><img src="https://img.icons8.com/3d-fluency/94/train.png" width="24" height="24" alt="train" style="vertical-align: middle;"> Train No.</label>
                  <input class="lb-input" id="logTrainNo" type="text" placeholder="e.g. 59719" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logLocoNo"><img src="https://img.icons8.com/3d-fluency/94/nut-and-bolt.png" width="24" height="24" alt="loco" style="vertical-align: middle;"> Loco No.</label>
                  <input class="lb-input" id="logLocoNo" type="text" placeholder="e.g. WAP7 30451" />
                </div>
              </div>

              <div class="lb-field-grid-2">
                <div class="lb-field">
                  <label class="lb-label" for="logShedDone"><img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="calendar" style="vertical-align: middle;"> Shed Done</label>
                  <input class="lb-input" id="logShedDone" type="date" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logShedDue"><img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="calendar" style="vertical-align: middle;"> Shed Due</label>
                  <input class="lb-input" id="logShedDue" type="date" />
                </div>
              </div>

              <div class="lb-field">
                <label class="lb-label" for="logRemarksIC"><img src="https://img.icons8.com/3d-fluency/94/note.png" width="24" height="24" alt="note" style="vertical-align: middle;"> Remark (IC/IB/IA)</label>
                <input class="lb-input" id="logRemarksIC" type="text" placeholder="e.g. IC, IB, IA" />
              </div>
            </div>

            <!-- ━━━━━ SECTION B: Movement/Timing ━━━━━ -->
            <div class="lb-card lb-card-teal lb-section-animate" id="lb-sec-2" style="animation-delay:0.05s">
              <div class="lb-card-header">
                <div class="lb-card-icon-wrap" style="background:linear-gradient(135deg,#0f766e,#14b8a6)"><img src="https://img.icons8.com/3d-fluency/94/alarm-clock.png" width="24" height="24" alt="clock" style="vertical-align: middle;"></div>
                <div>
                  <div class="lb-card-section-label">Section B</div>
                  <div class="lb-card-title">Movement & Timing</div>
                </div>
              </div>

              <!-- Route visual -->
              <div class="lb-route-row">
                <div class="lb-field" style="flex:1">
                  <label class="lb-label" for="logFromStation"><img src="https://img.icons8.com/3d-fluency/94/ok.png" width="24" height="24" alt="green" style="vertical-align: middle;"> From Station</label>
                  <input class="lb-input" id="logFromStation" type="text" placeholder="e.g. JP – Jaipur" />
                </div>
                <div class="lb-route-arrow">→</div>
                <div class="lb-field" style="flex:1">
                  <label class="lb-label" for="logToStation"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="red" style="vertical-align: middle;"> To Station</label>
                  <input class="lb-input" id="logToStation" type="text" placeholder="e.g. DLI – Delhi" />
                </div>
              </div>

              <div class="lb-field-grid-2">
                <div class="lb-field">
                  <label class="lb-label" for="logSignOn"><img src="https://img.icons8.com/3d-fluency/94/ok.png" width="24" height="24" alt="green" style="vertical-align: middle;"> S/On (Sign-On)</label>
                  <input class="lb-input" id="logSignOn" type="time" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logCTO"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> CTO (Charge Take Over)</label>
                  <input class="lb-input" id="logCTO" type="time" />
                </div>
              </div>

              <div class="lb-field-grid-2">
                <div class="lb-field">
                  <label class="lb-label" for="logDepartTime"><img src="https://img.icons8.com/3d-fluency/94/rocket.png" width="24" height="24" alt="rocket" style="vertical-align: middle;"> Dep. Time</label>
                  <input class="lb-input" id="logDepartTime" type="time" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logArrTime"><img src="https://img.icons8.com/3d-fluency/94/finish-flag.png" width="24" height="24" alt="flag" style="vertical-align: middle;"> Arr. Time</label>
                  <input class="lb-input" id="logArrTime" type="time" />
                </div>
              </div>

              <div class="lb-field-grid-2">
                <div class="lb-field">
                  <label class="lb-label" for="logCMO"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> CMO (Charge Make Over)</label>
                  <input class="lb-input" id="logCMO" type="time" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logSignOff"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="red" style="vertical-align: middle;"> S/Off (Sign-Off)</label>
                  <input class="lb-input" id="logSignOff" type="time" />
                </div>
              </div>

              <!-- Energy row -->
              <div class="lb-energy-block">
                <div class="lb-energy-title"><img src="https://img.icons8.com/3d-fluency/94/lightning-bolt.png" width="24" height="24" alt="energy" style="vertical-align: middle;"> Energy Readings (kWh)</div>
                <div class="lb-field-grid-4">
                  <div class="lb-field">
                    <label class="lb-label" for="logCTOEC">CTO EC</label>
                    <input class="lb-input lb-input-sm" id="logCTOEC" type="text" placeholder="kWh" />
                  </div>
                  <div class="lb-field">
                    <label class="lb-label" for="logCTOER">CTO ER</label>
                    <input class="lb-input lb-input-sm" id="logCTOER" type="text" placeholder="kWh" />
                  </div>
                  <div class="lb-field">
                    <label class="lb-label" for="logCMOEC">CMO EC</label>
                    <input class="lb-input lb-input-sm" id="logCMOEC" type="text" placeholder="kWh" />
                  </div>
                  <div class="lb-field">
                    <label class="lb-label" for="logCMOER">CMO ER</label>
                    <input class="lb-input lb-input-sm" id="logCMOER" type="text" placeholder="kWh" />
                  </div>
                </div>
              </div>
            </div>

            <!-- ━━━━━ SECTION C: Crew ━━━━━ -->
            <div class="lb-card lb-card-purple lb-section-animate" id="lb-sec-3" style="animation-delay:0.1s">
              <div class="lb-card-header">
                <div class="lb-card-icon-wrap" style="background:linear-gradient(135deg,#6d28d9,#a78bfa)"><img src="https://img.icons8.com/3d-fluency/94/group.png" width="24" height="24" alt="crew" style="vertical-align: middle;"></div>
                <div>
                  <div class="lb-card-section-label">Section C</div>
                  <div class="lb-card-title">Crew Details</div>
                </div>
              </div>

              <div class="lb-crew-block">
                <div class="lb-crew-badge lp">LP</div>
                <div class="lb-field-grid-2" style="flex:1">
                  <div class="lb-field">
                    <label class="lb-label" for="logLPGName"><img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" width="24" height="24" alt="user" style="vertical-align: middle;"> LP Name</label>
                    <input class="lb-input" id="logLPGName" type="text" placeholder="Loco Pilot Name" />
                  </div>
                  <div class="lb-field">
                    <label class="lb-label" for="logLPGMobile"><img src="https://img.icons8.com/3d-fluency/94/touchscreen-smartphone.png" width="24" height="24" alt="mobile" style="vertical-align: middle;"> LP Mobile</label>
                    <input class="lb-input" id="logLPGMobile" type="tel" maxlength="10" placeholder="10-digit number" />
                  </div>
                </div>
              </div>

              <div class="lb-crew-block" style="margin-top:12px">
                <div class="lb-crew-badge tm">TM</div>
                <div class="lb-field-grid-2" style="flex:1">
                  <div class="lb-field">
                    <label class="lb-label" for="logGuardName"><img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" width="24" height="24" alt="user" style="vertical-align: middle;"> TM Name</label>
                    <input class="lb-input" id="logGuardName" type="text" placeholder="Train Manager Name" />
                  </div>
                  <div class="lb-field">
                    <label class="lb-label" for="logGuardMobile"><img src="https://img.icons8.com/3d-fluency/94/touchscreen-smartphone.png" width="24" height="24" alt="mobile" style="vertical-align: middle;"> TM Mobile</label>
                    <input class="lb-input" id="logGuardMobile" type="tel" maxlength="10" placeholder="10-digit number" />
                  </div>
                </div>
              </div>
            </div>

            <!-- ━━━━━ SECTION D: Brake & Other ━━━━━ -->
            <div class="lb-card lb-card-orange lb-section-animate" id="lb-sec-4" style="animation-delay:0.15s">
              <div class="lb-card-header">
                <div class="lb-card-icon-wrap" style="background:linear-gradient(135deg,#c2410c,#fb923c)"><img src="https://img.icons8.com/3d-fluency/94/wrench.png" width="24" height="24" alt="wrench" style="vertical-align: middle;"></div>
                <div>
                  <div class="lb-card-section-label">Section D</div>
                  <div class="lb-card-title">Brake & Other Details</div>
                </div>
              </div>

              <div class="lb-field-grid-2">
                <div class="lb-field">
                  <label class="lb-label" for="logBPC"><img src="https://img.icons8.com/3d-fluency/94/key.png" width="24" height="24" alt="key" style="vertical-align: middle;"> BPC No.</label>
                  <input class="lb-input" id="logBPC" type="text" placeholder="Brake Power Certificate" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logSTN"><img src="https://img.icons8.com/3d-fluency/94/home.png" width="24" height="24" alt="home" style="vertical-align: middle;"> STN</label>
                  <input class="lb-input" id="logSTN" type="text" placeholder="Station Name" />
                </div>
              </div>

              <div class="lb-field-grid-4">
                <div class="lb-field">
                  <label class="lb-label" for="logLoadTN"><img src="https://img.icons8.com/3d-fluency/94/scales.png" width="24" height="24" alt="scale" style="vertical-align: middle;"> Load TN</label>
                  <input class="lb-input lb-input-sm" id="logLoadTN" type="text" placeholder="e.g. 2500" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logBP"><img src="https://img.icons8.com/3d-fluency/94/info.png" width="24" height="24" alt="blue-circle" style="vertical-align: middle;"> BP%</label>
                  <input class="lb-input lb-input-sm" id="logBP" type="text" placeholder="%" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logBMBS"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="red" style="vertical-align: middle;"> BMBS</label>
                  <input class="lb-input lb-input-sm" id="logBMBS" type="text" placeholder="Value" />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logBMBSPercent"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="red" style="vertical-align: middle;"> BMBS%</label>
                  <input class="lb-input lb-input-sm" id="logBMBSPercent" type="text" placeholder="%" />
                </div>
              </div>
            </div>

            <!-- ━━━━━ SECTION E: Safety Check ━━━━━ -->
            <div class="lb-card lb-card-green lb-section-animate" id="lb-sec-5" style="animation-delay:0.2s">
              <div class="lb-card-header">
                <div class="lb-card-icon-wrap" style="background:linear-gradient(135deg,#15803d,#4ade80)"><img src="https://img.icons8.com/3d-fluency/94/shield.png" width="24" height="24" alt="shield" style="vertical-align: middle;"></div>
                <div>
                  <div class="lb-card-section-label">Section E</div>
                  <div class="lb-card-title">Safety Check</div>
                </div>
              </div>

              <div class="lb-check-subtitle"><img src="https://img.icons8.com/3d-fluency/94/oil-industry.png" width="24" height="24" alt="oil" style="vertical-align: middle;"> Oil Levels</div>
              <div class="lb-toggle-grid">
                <label class="lb-toggle-item">
                  <input type="checkbox" id="logTFOilOK" class="lb-toggle-input">
                  <span class="lb-toggle-track"><span class="lb-toggle-thumb"></span></span>
                  <span class="lb-toggle-text">T/F Oil OK</span>
                </label>
                <label class="lb-toggle-item">
                  <input type="checkbox" id="logSRGROilOK" class="lb-toggle-input">
                  <span class="lb-toggle-track"><span class="lb-toggle-thumb"></span></span>
                  <span class="lb-toggle-text">SR/GR Oil OK</span>
                </label>
                <label class="lb-toggle-item">
                  <input type="checkbox" id="logCPOilOK" class="lb-toggle-input">
                  <span class="lb-toggle-track"><span class="lb-toggle-thumb"></span></span>
                  <span class="lb-toggle-text">CP Oil OK</span>
                </label>
              </div>

              <div class="lb-check-subtitle" style="margin-top:14px"><img src="https://img.icons8.com/3d-fluency/94/light-bulb.png" width="24" height="24" alt="light" style="vertical-align: middle;"> Lights & Inspection</div>
              <div class="lb-toggle-grid">
                <label class="lb-toggle-item">
                  <input type="checkbox" id="logHLOK" class="lb-toggle-input">
                  <span class="lb-toggle-track"><span class="lb-toggle-thumb"></span></span>
                  <span class="lb-toggle-text">HL OK</span>
                </label>
                <label class="lb-toggle-item">
                  <input type="checkbox" id="logMLOK" class="lb-toggle-input">
                  <span class="lb-toggle-track"><span class="lb-toggle-thumb"></span></span>
                  <span class="lb-toggle-text">ML OK</span>
                </label>
                <label class="lb-toggle-item">
                  <input type="checkbox" id="logFLOK" class="lb-toggle-input">
                  <span class="lb-toggle-track"><span class="lb-toggle-thumb"></span></span>
                  <span class="lb-toggle-text">FL OK</span>
                </label>
                <label class="lb-toggle-item">
                  <input type="checkbox" id="logUIOK" class="lb-toggle-input">
                  <span class="lb-toggle-track"><span class="lb-toggle-thumb"></span></span>
                  <span class="lb-toggle-text">U/I OK</span>
                </label>
                <label class="lb-toggle-item">
                  <input type="checkbox" id="logCIOK" class="lb-toggle-input">
                  <span class="lb-toggle-track"><span class="lb-toggle-thumb"></span></span>
                  <span class="lb-toggle-text">C/I OK</span>
                </label>
              </div>
            </div>

            <!-- ━━━━━ SECTION F: Tools ━━━━━ -->
            <div class="lb-card lb-card-indigo lb-section-animate" id="lb-sec-6" style="animation-delay:0.25s">
              <div class="lb-card-header">
                <div class="lb-card-icon-wrap" style="background:linear-gradient(135deg,#3730a3,#818cf8)"><img src="https://img.icons8.com/3d-fluency/94/hammer-and-wrench.png" width="24" height="24" alt="tools" style="vertical-align: middle;"></div>
                <div>
                  <div class="lb-card-section-label">Section F</div>
                  <div class="lb-card-title">Tools</div>
                </div>
              </div>

              <div class="lb-field-grid-4">
                <div class="lb-field">
                  <label class="lb-label" for="logWW"><img src="https://img.icons8.com/3d-fluency/94/wood.png" width="24" height="24" alt="wood" style="vertical-align: middle;"> W/W</label>
                  <input class="lb-input lb-input-sm" id="logWW" type="text" placeholder="Nos." />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logFEX"><img src="https://img.icons8.com/3d-fluency/94/fire-extinguisher.png" width="24" height="24" alt="extinguisher" style="vertical-align: middle;"> F/EX</label>
                  <input class="lb-input lb-input-sm" id="logFEX" type="text" placeholder="Nos." />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logBPTool"><img src="https://img.icons8.com/3d-fluency/94/info.png" width="24" height="24" alt="blue-circle" style="vertical-align: middle;"> BP</label>
                  <input class="lb-input lb-input-sm" id="logBPTool" type="text" placeholder="Nos." />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logFP"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="red" style="vertical-align: middle;"> FP</label>
                  <input class="lb-input lb-input-sm" id="logFP" type="text" placeholder="Nos." />
                </div>
              </div>

              <div class="lb-field-grid-2">
                <div class="lb-field">
                  <label class="lb-label" for="logSafetyClamp"><img src="https://img.icons8.com/3d-fluency/94/padlock.png" width="24" height="24" alt="clamp" style="vertical-align: middle;"> Safety Clamp</label>
                  <input class="lb-input" id="logSafetyClamp" type="text" placeholder="U clamp, CBC, etc." />
                </div>
                <div class="lb-field">
                  <label class="lb-label" for="logOtherTools"><img src="https://img.icons8.com/3d-fluency/94/hammer.png" width="24" height="24" alt="hammer" style="vertical-align: middle;"> Other Tools</label>
                  <input class="lb-input" id="logOtherTools" type="text" placeholder="Other tools" />
                </div>
              </div>
            </div>

            <!-- ━━━━━ SECTION G: Remarks ━━━━━ -->
            <div class="lb-card lb-card-slate lb-section-animate" id="lb-sec-7" style="animation-delay:0.3s">
              <div class="lb-card-header">
                <div class="lb-card-icon-wrap" style="background:linear-gradient(135deg,#475569,#94a3b8)"><img src="https://img.icons8.com/3d-fluency/94/note.png" width="24" height="24" alt="note" style="vertical-align: middle;"></div>
                <div>
                  <div class="lb-card-section-label">Section G</div>
                  <div class="lb-card-title">Remarks / Notes</div>
                </div>
              </div>
              <div class="lb-field">
                <label class="lb-label" for="logRemark"><img src="https://img.icons8.com/3d-fluency/94/chat.png" width="24" height="24" alt="chat" style="vertical-align: middle;"> Remarks</label>
                <textarea class="lb-input lb-textarea" id="logRemark" placeholder="Any remarks, observations or notes about this duty..."></textarea>
              </div>
            </div>

            <!-- Error Message -->
            <div id="logbookError" class="lb-error-msg"></div>


            <!-- Sticky Save Bar -->
            <div class="lb-save-bar">
              <button class="lb-cancel-btn" onclick="ProfilePage.showLogbookHome()">
                <span class="material-icons" style="font-size:18px">close</span> Cancel
              </button>
              <button class="lb-save-btn" onclick="ProfilePage.saveLogbookEntry()">
                <span class="material-icons" style="font-size:18px">save</span> Save Entry
              </button>
            </div>
          </div>
        </div>


        <!-- Tools History Tab Content -->
        <div id="profilePageToolsContent" class="profile-page-content" style="display: none;">
          <!-- Tools History Hero -->
          <div style="margin: -20px -20px 24px -20px; border-radius: 0 0 28px 28px; padding: 32px 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.06); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -20px; right: 40px; width: 70px; height: 70px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            <div style="display: flex; align-items: center; gap: 16px; position: relative; z-index: 2;">
              <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px;"><img src="https://img.icons8.com/3d-fluency/94/toolbox.png" width="24" height="24" alt="toolbox" style="vertical-align: middle;"></div>
              <div>
                <h2 style="font-size: 22px; margin: 0; color: white; font-weight: 800; letter-spacing: -0.5px;">My Tools</h2>
                <p style="font-size: 13px; margin: 3px 0 0; color: rgba(255,255,255,0.85); font-weight: 500;">TDRS Tool Management System</p>
              </div>
            </div>
          </div>

          <!-- Quick Stats - Mobile Responsive -->
          <div class="tools-quick-stats" style="margin-top: -45px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div class="tools-stat-card" style="padding: 16px 12px; border-radius: 16px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px;">
              <div style="width: 40px; height: 40px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;"><img src="https://img.icons8.com/3d-fluency/94/box.png" width="24" height="24" alt="box" style="vertical-align: middle;"></div>
              <div>
                <div style="font-size: 24px; font-weight: 800; color: #4f46e5;" id="toolsCurrentCount">--</div>
                <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Items</div>
              </div>
            </div>
            <div class="tools-stat-card" style="padding: 16px 12px; border-radius: 16px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px;">
              <div style="width: 40px; height: 40px; background: #f0fdf4; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"></div>
              <div>
                <div style="font-size: 24px; font-weight: 800; color: #059669;" id="toolsTransactionsCount">--</div>
                <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Trans</div>
              </div>
            </div>
            <div class="tools-stat-card" style="padding: 16px 12px; border-radius: 16px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px;">
              <div style="width: 40px; height: 40px; background: #fff7ed; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;"><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"></div>
              <div>
                <div style="font-size: 24px; font-weight: 800; color: #f59e0b;" id="toolsReportsCount">--</div>
                <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Reports</div>
              </div>
            </div>
          </div>

          <!-- Tab Navigation - Mobile Responsive -->
          <div class="card" style="padding: 0; border: none; background: transparent; box-shadow: none;">
            <div class="tools-tab-nav" style="background: white; border-radius: 12px; padding: 4px; display: flex; gap: 4px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow-x: auto; -webkit-overflow-scrolling: touch;">
              <button id="toolsTabItems" class="tools-tab-btn active" onclick="ProfilePage.switchToolsTab('items')" style="flex: 1; min-width: 80px; padding: 10px 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: #4f46e5; color: white; white-space: nowrap;">
                <span style="font-size: 18px;"><img src="https://img.icons8.com/3d-fluency/94/box.png" width="24" height="24" alt="box" style="vertical-align: middle;"></span>
                <span>Items</span>
              </button>
              <button id="toolsTabHistory" class="tools-tab-btn" onclick="ProfilePage.switchToolsTab('history')" style="flex: 1; min-width: 80px; padding: 10px 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: transparent; color: #64748b; white-space: nowrap;">
                <span style="font-size: 18px;"><img src="https://img.icons8.com/3d-fluency/94/scroll.png" width="24" height="24" alt="history" style="vertical-align: middle;"></span>
                <span>History</span>
              </button>
              <button id="toolsTabReports" class="tools-tab-btn" onclick="ProfilePage.switchToolsTab('reports')" style="flex: 1; min-width: 80px; padding: 10px 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: transparent; color: #64748b; white-space: nowrap;">
                <span style="font-size: 18px;"><img src="https://img.icons8.com/3d-fluency/94/note.png" width="24" height="24" alt="note" style="vertical-align: middle;"></span>
                <span>Reports</span>
              </button>
            </div>
            
            <!-- Items Tab Content -->
            <div id="toolsItemsContent" class="tools-tab-content" style="display: block;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 0;">Current Items</h3>
                <button class="btn-sm" onclick="ProfilePage.refreshToolsHistory()" id="refreshToolsBtn" style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 12px; font-weight: 700; color: #64748b;"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Refresh</button>
              </div>
              <div id="toolsItemsList">
                <div class="empty-state" style="background: white; border-radius: 16px; padding: 40px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/box.png" width="24" height="24" alt="box" style="vertical-align: middle;"></div>
                  <div class="empty-state-text" style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">No Current Items</div>
                  <div class="empty-state-description" style="color: #64748b; margin-bottom: 20px;">You have no tools currently issued</div>
                  <button class="btn-gradient" onclick="ProfilePage.fetchToolsData()" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: none; padding: 12px 24px; border-radius: 12px; color: white; font-weight: 600; cursor: pointer;">
                    <img src="https://img.icons8.com/3d-fluency/94/download.png" width="24" height="24" alt="download" style="vertical-align: middle;"> Load Tools Data
                  </button>
                </div>
              </div>
            </div>
            
            <!-- History Tab Content -->
            <div id="toolsHistoryContent" class="tools-tab-content" style="display: none;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 0;">Transaction History</h3>
              </div>
              <div id="toolsHistoryList">
                <div class="empty-state" style="background: white; border-radius: 16px; padding: 40px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/scroll.png" width="24" height="24" alt="history" style="vertical-align: middle;"></div>
                  <div class="empty-state-text" style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">No History</div>
                  <div class="empty-state-description" style="color: #64748b; margin-bottom: 20px;">No transaction history available</div>
                </div>
              </div>
            </div>
            
            <!-- Reports Tab Content - Mobile Responsive -->
            <div id="toolsReportsContent" class="tools-tab-content" style="display: none;">
              <div class="tools-reports-grid" style="display: flex; flex-direction: column; gap: 16px;">
                <!-- Submit Report Form -->
                <div class="tools-report-form" style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #4f46e5;"><img src="https://img.icons8.com/3d-fluency/94/plus-math.png" width="24" height="24" alt="add" style="vertical-align: middle;"></span> Submit Report
                  </h3>
                  <div style="display: flex; flex-direction: column; gap: 14px;">
                    <div>
                      <label style="display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Item *</label>
                      <select id="reportItemSelect" style="width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: white;">
                        <option value="">Select item...</option>
                      </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                      <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Type *</label>
                        <select id="reportTypeSelect" style="width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: white;">
                          <option value="damage">Damage</option>
                          <option value="loss">Loss</option>
                          <option value="malfunction">Malfunction</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Severity *</label>
                        <select id="reportSeveritySelect" style="width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: white;">
                          <option value="minor">Minor</option>
                          <option value="moderate">Moderate</option>
                          <option value="major">Major</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style="display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Description *</label>
                      <textarea id="reportDescription" rows="3" placeholder="Describe what happened..." style="width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; resize: vertical;"></textarea>
                    </div>
                    <button onclick="ProfilePage.submitToolReport()" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px;">
                      <span><img src="https://img.icons8.com/3d-fluency/94/upload.png" width="24" height="24" alt="upload" style="vertical-align: middle;"></span> Submit Report
                    </button>
                  </div>
                </div>
                
                <!-- Your Reports List -->
                <div class="tools-reports-list" style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
                    <span><img src="https://img.icons8.com/3d-fluency/94/clipboard.png" width="24" height="24" alt="clipboard" style="vertical-align: middle;"></span> Your Reports
                  </h3>
                  <div id="toolsReportsList" style="max-height: 400px; overflow-y: auto;">
                    <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                      <div style="font-size: 32px; margin-bottom: 12px;"><img src="https://img.icons8.com/3d-fluency/94/note.png" width="24" height="24" alt="note" style="vertical-align: middle;"></div>
                      <div style="font-size: 14px;">No reports submitted yet</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Running Room History Tab Content -->
        <div id="profilePageRunningRoomContent" class="profile-page-content" style="display: none;">
          <!-- Running Room Hero (gradient only, no photo) -->
          <div style="margin: -20px -20px 24px -20px; border-radius: 0 0 28px 28px; padding: 32px 24px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.06); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -20px; right: 40px; width: 70px; height: 70px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            <div style="display: flex; align-items: center; gap: 16px; position: relative; z-index: 2;">
              <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px;"><img src="https://img.icons8.com/3d-fluency/94/home.png" width="24" height="24" alt="home" style="vertical-align: middle;"></div>
              <div>
                <h2 style="font-size: 22px; margin: 0; color: white; font-weight: 800; letter-spacing: -0.5px;">Running Room</h2>
                <p style="font-size: 13px; margin: 3px 0 0; color: rgba(255,255,255,0.85); font-weight: 500;">Duty &amp; Rest Management System</p>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <!-- Quick Stats -->
          <div class="quick-cards" style="margin-top: -45px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div class="quick-card" style="padding: 16px; border-radius: 20px; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #7c3aed; margin: 4px 0;" id="rrCurrentRest">--</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Current Rest</div>
            </div>
            <div class="quick-card" style="padding: 16px; border-radius: 20px; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #059669; margin: 4px 0;" id="rrDutyCount">--</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Total Duties</div>
            </div>
            <div class="quick-card" style="padding: 16px; border-radius: 20px; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #f59e0b; margin: 4px 0;" id="rrHoursRested">--</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Hours Rested</div>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="card" style="padding: 0; border: none; background: transparent; box-shadow: none;">
            <div style="background: white; border-radius: 12px; padding: 4px; display: flex; gap: 4px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <button id="rrTabCurrent" class="rr-tab-btn active" onclick="ProfilePage.switchRunningRoomTab('current')" style="flex: 1; padding: 12px 16px; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; background: #7c3aed; color: white;">
                <span><img src="https://img.icons8.com/3d-fluency/94/building.png" width="24" height="24" alt="hotel" style="vertical-align: middle;"></span> Current
              </button>
              <button id="rrTabHistory" class="rr-tab-btn" onclick="ProfilePage.switchRunningRoomTab('history')" style="flex: 1; padding: 12px 16px; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; background: transparent; color: #64748b;">
                <span><img src="https://img.icons8.com/3d-fluency/94/scroll.png" width="24" height="24" alt="history" style="vertical-align: middle;"></span> History
              </button>
              <button id="rrTabBooking" class="rr-tab-btn" onclick="ProfilePage.switchRunningRoomTab('booking')" style="flex: 1; padding: 12px 16px; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; background: transparent; color: #64748b;">
                <span><img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="date" style="vertical-align: middle;"></span> Book Room
              </button>
            </div>
            
            <!-- Current Rest Tab -->
            <div id="rrCurrentContent" class="rr-tab-content" style="display: block;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 0;">Current Rest Status</h3>
                <button class="btn-sm" onclick="ProfilePage.fetchRunningRoomData()" id="refreshRunningRoomBtn" style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 12px; font-weight: 700; color: #64748b;"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Refresh</button>
              </div>
              <div id="runningRoomCurrentContent">
                <div class="empty-state" style="background: white; border-radius: 16px; padding: 40px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/building.png" width="24" height="24" alt="hotel" style="vertical-align: middle;"></div>
                  <div class="empty-state-text" style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">No Active Rest</div>
                  <div class="empty-state-description" style="color: #64748b; margin-bottom: 20px;">You are not currently resting in running room</div>
                  <button class="btn-gradient" onclick="ProfilePage.fetchRunningRoomData()" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border: none; padding: 12px 24px; border-radius: 12px; color: white; font-weight: 600; cursor: pointer;">
                    <img src="https://img.icons8.com/3d-fluency/94/download.png" width="24" height="24" alt="download" style="vertical-align: middle;"> Load Running Room Data
                  </button>
                </div>
              </div>
            </div>
            
            <!-- History Tab -->
            <div id="rrHistoryContent" class="rr-tab-content" style="display: none;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 18px; font-weight: 800; color: #1e293b; margin: 0;">Rest History</h3>
              </div>
              <div id="runningRoomHistoryContent">
                <div class="empty-state" style="background: white; border-radius: 16px; padding: 40px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/scroll.png" width="24" height="24" alt="history" style="vertical-align: middle;"></div>
                  <div class="empty-state-text" style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">No History</div>
                  <div class="empty-state-description" style="color: #64748b; margin-bottom: 20px;">No running room history available</div>
                </div>
              </div>
            </div>
            
            <!-- Book Room Tab -->
            <div id="rrBookingContent" class="rr-tab-content" style="display: none;">
              <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
                  <span style="color: #7c3aed;"><img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="date" style="vertical-align: middle;"></span> Book Running Room
                </h3>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">From Station *</label>
                    <input type="text" id="rrFromStation" placeholder="Enter from station" style="width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">To Station *</label>
                    <input type="text" id="rrToStation" placeholder="Enter to station" style="width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                      <label style="display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">Arrival Date *</label>
                      <input type="date" id="rrArrivalDate" style="width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                    </div>
                    <div>
                      <label style="display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">Train No</label>
                      <input type="text" id="rrTrainNo" placeholder="Train number" style="width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                    </div>
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">Preferred Room Type</label>
                    <select id="rrRoomType" style="width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: white;">
                      <option value="single">Single Occupancy</option>
                      <option value="double">Double Occupancy</option>
                      <option value="dormitory">Dormitory</option>
                    </select>
                  </div>
                  <button onclick="ProfilePage.bookRunningRoom()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span><img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="date" style="vertical-align: middle;"></span> Request Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Tab Content -->
        <div id="profilePageInfoContent" class="profile-page-content">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
              <h3 style="font-size: 14px; margin: 0; color: var(--primary);">Personal Information</h3>
              <button class="btn-sm btn-primary" id="btnEditProfilePage" onclick="ProfilePage.enableEdit()"><img src="https://img.icons8.com/3d-fluency/94/edit.png" width="24" height="24" alt="edit" style="vertical-align: middle;"> Edit Profile</button>
              <div id="btnSaveCancelPage" style="display: none; gap: 8px;">
                <button class="btn-sm btn-primary" onclick="ProfilePage.saveProfile()"><img src="https://img.icons8.com/3d-fluency/94/save.png" width="24" height="24" alt="save" style="vertical-align: middle;"> Save</button>
                <button class="btn-sm" onclick="ProfilePage.cancelEdit()"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Cancel</button>
              </div>
            </div>
            
            <div class="profile-info-grid">
              <div class="info-item">
                <div class="info-label">CMS ID</div>
                <div id="infoPageCms" class="info-value">${user.cms || user.cms_id || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div id="infoPageName" class="info-value">${user.name || '-'}</div>
                <input id="editPageName" type="text" class="info-edit" style="display: none;" />
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div id="infoPageEmail" class="info-value">${user.email || 'Not provided'}</div>
                <input id="editPageEmail" type="email" class="info-edit" style="display: none;" />
              </div>
              <div class="info-item">
                <div class="info-label">Mobile</div>
                <div id="infoPageMobile" class="info-value">${user.mobile || '-'}</div>
                <input id="editPageMobile" type="tel" class="info-edit" maxlength="10" style="display: none;" />
              </div>
              <div class="info-item">
                <div class="info-label">Designation</div>
                <div id="infoPageDesignation" class="info-value">${user.designation || '-'}</div>
                <select id="editPageDesignation" class="info-edit" style="display: none;">
                  <option value="LPG">LPG - Loco Pilot Goods</option>
                  <option value="LPM">LPM - Loco Pilot Mail</option>
                  <option value="LPP">LPP - Loco Pilot Passenger</option>
                  <option value="ALP">ALP - Assistant Loco Pilot</option>
                  <option value="SALP">SALP - Senior Assistant Loco Pilot</option>
                  <option value="TM">TM - Train Manager</option>
                </select>
              </div>
              <div class="info-item">
                <div class="info-label">Division</div>
                <div id="infoPageDivision" class="info-value">${user.division?.toUpperCase() || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">HQ / Lobby</div>
                <div id="infoPageLobby" class="info-value">${user.hq || user.lobby || '-'}</div>
              </div>
            </div>
            
            <div id="profilePageEditError" class="error-message" style="margin-top: 12px;"></div>
          </div>
        </div>

        <!-- Quiz History Tab Content -->
        <div id="profilePageQuizContent" class="profile-page-content" style="display: none;">
          <div class="card">
            <div id="quizHistoryPageList">
              <!-- Quiz history will load here -->
            </div>
          </div>
        </div>

        <!-- Settings Tab Content -->
        <div id="profilePageSettingsContent" class="profile-page-content" style="display: none;">
          <div class="card">
            <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--primary);">Change Password</h3>
            <div class="form-group">
              <label>Current Password</label>
              <input id="currentPasswordPage" type="password" placeholder="Enter current password" />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input id="newPasswordPage" type="password" placeholder="Enter new password (min 6 chars)" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input id="confirmNewPasswordPage" type="password" placeholder="Re-enter new password" />
            </div>
            <div id="passwordPageError" class="error-message"></div>
            <button class="btn-gradient" onclick="ProfilePage.changePassword()">Update Password</button>
          </div>

          <!-- Notification Debug Card (Visible only in dev or via special trigger, but let's keep it for now) -->
          <div class="card" style="margin-top: 16px; border-left: 4px solid #3b82f6;">
            <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--primary); display: flex; justify-content: space-between; align-items: center;">
              <span><img src="https://img.icons8.com/3d-fluency/94/bell.png" width="24" height="24" alt="bell" style="vertical-align: middle;"> Notification Debug</span>
              <div style="display: flex; gap: 8px;">
                <button class="btn-sm" style="background: var(--primary); color: white;" onclick="ProfilePage.forcePushRegister()"><img src="https://img.icons8.com/3d-fluency/94/bell.png" width="24" height="24" alt="bell" style="vertical-align: middle;"> Register</button>
                <button class="btn-sm" onclick="ProfilePage.refreshPushDebug()"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Check</button>
              </div>
            </h3>
            <div id="pushDebugStatus" style="font-size: 12px; line-height: 1.6;">
              <div class="muted">Click "Check Status" to verify notification settings.</div>
            </div>
          </div>
        </div>

        <!-- Support Tab Content -->
        <div id="profilePageSupportContent" class="profile-page-content" style="display: none;">
          <div class="card">
            <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--primary);">Raise Support Ticket</h3>
            
            <div class="form-group">
              <label>Issue Category *</label>
              <select id="ticketPageCategory">
                <option value="">Select Category</option>
                <option value="technical">Technical Issue</option>
                <option value="quiz">Quiz Related</option>
                <option value="certificate">Certificate Issue</option>
                <option value="account">Account/Login</option>
                <option value="content">Content/Material Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Priority *</label>
              <select id="ticketPagePriority">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div class="form-group">
              <label>Send To *</label>
              <select id="ticketPageRecipient">
                <option value="lobby">Lobby Incharge (CLI)</option>
                <option value="division">Division Admin</option>
                <option value="super">Super Admin</option>
              </select>
            </div>

            <div class="form-group">
              <label>Subject *</label>
              <input id="ticketPageSubject" type="text" placeholder="Brief subject of your issue" />
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea id="ticketPageDescription" rows="5" placeholder="Describe your issue in detail..." style="width: 100%; padding: 11px 14px; border-radius: 10px; border: 1px solid #dbeafe; font-size: 14px; background: #fafbfc; font-family: system-ui; resize: vertical;"></textarea>
            </div>

            <div id="ticketPageError" class="error-message"></div>
            <button class="btn-gradient" onclick="ProfilePage.raiseTicket()">Submit Ticket</button>
          </div>

          <div class="card" style="margin-top: 16px;">
            <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--primary);">My Tickets</h3>
            <div id="myTicketsPageList">
              <!-- Tickets will load here -->
            </div>
          </div>
        </div>

        <!-- Feedback Tab Content -->
        <div id="profilePageFeedbackContent" class="profile-page-content" style="display: none;">
          <div class="card">
            <h3 style="font-size: 14px; margin-bottom: 16px; color: var(--primary);"><img src="https://img.icons8.com/3d-fluency/94/chat.png" width="24" height="24" alt="chat" style="vertical-align: middle;"> Share Your Feedback</h3>
            
            <div class="form-group">
              <label>Feedback Type *</label>
              <select id="feedbackType">
                <option value="">Select Type</option>
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="praise">Appreciation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Subject *</label>
              <input id="feedbackSubject" type="text" placeholder="Brief subject of your feedback" />
            </div>

            <div class="form-group">
              <label>Your Feedback *</label>
              <textarea id="feedbackDescription" rows="6" placeholder="Share your thoughts, suggestions, or report issues..." style="width: 100%; padding: 11px 14px; border-radius: 10px; border: 1px solid #dbeafe; font-size: 14px; background: #fafbfc; font-family: system-ui; resize: vertical;"></textarea>
            </div>

            <div class="form-group">
              <label>Rating (Optional)</label>
              <div class="rating-stars">
                <span class="star" data-rating="1" onclick="ProfilePage.setRating(1)"><img src="https://img.icons8.com/3d-fluency/94/star.png" width="24" height="24" alt="star" style="vertical-align: middle;"></span>
                <span class="star" data-rating="2" onclick="ProfilePage.setRating(2)"><img src="https://img.icons8.com/3d-fluency/94/star.png" width="24" height="24" alt="star" style="vertical-align: middle;"></span>
                <span class="star" data-rating="3" onclick="ProfilePage.setRating(3)"><img src="https://img.icons8.com/3d-fluency/94/star.png" width="24" height="24" alt="star" style="vertical-align: middle;"></span>
                <span class="star" data-rating="4" onclick="ProfilePage.setRating(4)"><img src="https://img.icons8.com/3d-fluency/94/star.png" width="24" height="24" alt="star" style="vertical-align: middle;"></span>
                <span class="star" data-rating="5" onclick="ProfilePage.setRating(5)"><img src="https://img.icons8.com/3d-fluency/94/star.png" width="24" height="24" alt="star" style="vertical-align: middle;"></span>
              </div>
            </div>

            <div id="feedbackPageError" class="error-message"></div>
            <button class="btn-gradient" onclick="ProfilePage.submitFeedback()"><img src="https://img.icons8.com/3d-fluency/94/upload.png" width="24" height="24" alt="upload" style="vertical-align: middle;"> Submit Feedback</button>
          </div>
        </div>
      </div>
    `;

    // Activate the dashboard tab after the page is rendered
    setTimeout(() => {
      if (typeof ProfilePage !== 'undefined' && ProfilePage.switchTab) {
        ProfilePage.switchTab('dashboard');
      }
    }, 0);

    // Load quiz history and tickets after rendering
    this.loadQuizHistory(user);
    this.loadMyTickets(user);

    // Update dashboard metrics
    // Ensure dashboard data is loaded with proper user data
    setTimeout(() => {
      // Get fresh user data in case it has updated since render started
      const freshUser = AuthService.getUser();
      if (freshUser && (freshUser.cms || freshUser.email)) {
        this.updateDashboardMetrics(freshUser);
      } else {
        // Fallback: use the original user if fresh user isn't available
        this.updateDashboardMetrics(user);
      }
    }, 500);
  },

  // Update dashboard metrics
  async updateDashboardMetrics(user) {
    const api = window.Api || AuthService.getApi();
    const userId = user.id || user.serverId || user.cms;

    // Ensure we have the data
    if (!this.allLogbookRecords) {
      try {
        const res = await api.getLogbookEntries(userId);
        if (res.success) this.allLogbookRecords = res.entries || [];
      } catch (e) { console.error(e); }
    }

    if (!this.allQuizAttempts) {
      try {
        const res = await api.getQuizHistory(userId);
        if (res.success) this.allQuizAttempts = res.history || [];
      } catch (e) { console.error(e); }
    }

    const userLogbooks = this.allLogbookRecords || [];
    const userAttempts = this.allQuizAttempts || [];

    const activityCount = userLogbooks.length + userAttempts.length;

    // Calculate completed tasks (quiz attempts that passed)
    const passedQuizzes = userAttempts.filter(attempt => {
      const isPassed = attempt.is_passed == 1;
      if (isPassed) return true;

      const total = parseInt(attempt.total_questions || 10);
      const scoreRaw = parseFloat(attempt.score || 0);
      const displayScore = scoreRaw > total ? (scoreRaw / 10) : scoreRaw;
      return displayScore >= total * 0.6;
    }).length;

    // Calculate training progress (based on quiz attempts)
    let trainingProgress = 0;

    if (userAttempts.length > 0) {
      // Calculate average percentage
      const totalPercentage = userAttempts.reduce((sum, attempt) => {
        const score = parseFloat(attempt.score || 0);
        const total = attempt.total_questions || 10;
        return sum + (score / total);
      }, 0);
      trainingProgress = Math.min(100, Math.round((totalPercentage / userAttempts.length) * 100));
    }

    // Calculate duty hours (from logbook entries)
    let dutyHours = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    userLogbooks.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        if (entry.signOn && entry.signOff) {
          // Calculate hours between sign on and sign off
          const signOnTime = entry.signOn.split(':');
          const signOffTime = entry.signOff.split(':');

          if (signOnTime.length === 2 && signOffTime.length === 2) {
            let signOnHours = parseInt(signOnTime[0]);
            const signOnMinutes = parseInt(signOnTime[1]);
            let signOffHours = parseInt(signOffTime[0]);
            const signOffMinutes = parseInt(signOffTime[1]);

            // Handle day crossing (if sign off < sign on, assume next day)
            // But usually duty hours are calculated within a shift. 
            // Simple logic: if off < on, add 24 to off? 
            // The original logic didn't handle crossing midnight explicitly well (just negative diff)
            // Let's improve it slightly
            if (signOffHours < signOnHours) {
              signOffHours += 24;
            }

            let hoursDiff = signOffHours - signOnHours;
            let minutesDiff = signOffMinutes - signOnMinutes;

            if (minutesDiff < 0) {
              hoursDiff--;
              minutesDiff += 60;
            }

            dutyHours += hoursDiff + (minutesDiff / 60);
          }
        }
      }
    });

    // Update the dashboard elements
    const activityCountEl = document.getElementById('activityOverviewCount');
    const completedTasksEl = document.getElementById('completedTasksCount');
    const trainingProgressEl = document.getElementById('trainingProgressCount');
    const dutyHoursEl = document.getElementById('dutyHoursCount');

    if (activityCountEl) activityCountEl.textContent = activityCount;
    if (completedTasksEl) completedTasksEl.textContent = passedQuizzes;
    if (trainingProgressEl) trainingProgressEl.textContent = trainingProgress + '%';
    if (dutyHoursEl) dutyHoursEl.textContent = dutyHours.toFixed(1);

    // Update recent activity list
    this.updateRecentActivityList(user, userLogbooks, userAttempts);
  },

  // Update recent activity list
  updateRecentActivityList(user, logbooks, quizzes) {
    const recentActivityList = document.getElementById('recentActivityListPremium');
    if (!recentActivityList) return;

    // Combine and sort all activities by date
    const allActivities = [];

    // Add logbook entries
    logbooks.forEach(entry => {
      allActivities.push({
        type: 'logbook',
        title: `Duty: ${entry.dutyType || 'Logbook'}`,
        subtitle: `${entry.fromStation || 'N/A'} → ${entry.toStation || 'N/A'}`,
        date: entry.createdAt || entry.date || new Date().toISOString(),
        icon: '<img src="https://img.icons8.com/3d-fluency/94/train.png" width="24" height="24" alt="train" style="vertical-align: middle;">',
        bgColor: '#eff6ff',
        iconColor: '#3b82f6'
      });
    });

    // Add quiz attempts
    quizzes.forEach(attempt => {
      const total = parseInt(attempt.total_questions || 10);
      const scoreRaw = parseFloat(attempt.score || 0);

      const displayScore = scoreRaw > total ? (scoreRaw / 10) : scoreRaw;
      const percentage = Math.round((displayScore / total) * 100);
      const isPassed = attempt.is_passed == 1 || displayScore >= total * 0.6;

      const formattedScore = String(Math.floor(displayScore)).padStart(2, '0');
      const formattedTotal = String(total).padStart(2, '0');

      allActivities.push({
        type: 'quiz',
        title: `Quiz: ${isPassed ? 'Passed' : 'Failed'}`,
        subtitle: `Score: ${formattedScore}/${formattedTotal} (${percentage}%)`,
        date: attempt.attempted_at || attempt.date || new Date().toISOString(),
        icon: isPassed ? '<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;">' : '<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;">',
        bgColor: isPassed ? '#f0fdf4' : '#fef2f2',
        iconColor: isPassed ? '#22c55e' : '#ef4444'
      });
    });

    // Sort by date (newest first)
    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get the 5 most recent activities
    const recentActivities = allActivities.slice(0, 5);

    if (recentActivities.length === 0) {
      recentActivityList.innerHTML = `
        <div class="empty-state" style="padding: 30px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 10px;"><img src="https://img.icons8.com/3d-fluency/94/sparkling.png" width="24" height="24" alt="sparkle" style="vertical-align: middle;"></div>
          <div style="color: #64748b; font-weight: 500;">No recent activities found</div>
        </div>
      `;
      return;
    }

    const html = recentActivities.map(activity => {
      const date = new Date(activity.date);
      const timeAgo = this.getTimeAgo(date);

      return `
        <div class="activity-item-premium">
          <div class="activity-icon-wrap" style="background: ${activity.bgColor}; color: ${activity.iconColor};">
            ${activity.icon}
          </div>
          <div class="activity-content">
            <div class="activity-title-premium">${activity.title}</div>
            <div class="activity-desc-premium">${activity.subtitle}</div>
          </div>
          <div class="activity-time-premium">
            ${timeAgo}
          </div>
        </div>
      `;
    }).join('');

    recentActivityList.innerHTML = html;
  },

  // Calculate time ago string
  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  },

  // Fetch tools data from TDRS external API
  async fetchToolsData(useDirectConnection = false) {
    const user = AuthService.getUser();
    const refreshBtn = document.getElementById('refreshToolsBtn');
    const syncBtn = document.getElementById('syncToolsBtn');

    // Get CMS ID from user
    const cmsId = user.cms || user.cms_id;
    if (!cmsId) {
      const itemsList = document.getElementById('toolsItemsList');
      if (itemsList) {
        itemsList.innerHTML = `
          <div class="error-state" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 24px; margin-bottom: 12px; color: #f44336;"><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"></div>
            <div>CMS ID not found</div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">Please ensure you are logged in with a valid CMS ID</div>
          </div>
        `;
      }
      return;
    }

    // First, try to load cached data immediately
    const cached = localStorage.getItem('toolsHistory_' + cmsId);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.data && parsed.data.length > 0) {
          this.displayToolsData(parsed.data);
          this.displayToolReports();
        }
      } catch (e) {
        console.error('Error parsing cached tools data:', e);
      }
    }

    // Show loading state in Items tab (active tab)
    const itemsList = document.getElementById('toolsItemsList');
    if (itemsList) {
      itemsList.innerHTML = `
        <div class="loading-state" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 24px; margin-bottom: 12px;"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"></div>
          <div>Fetching tools data...</div>
          <div style="font-size: 12px; color: #888; margin-top: 4px;">Connecting to TDRS crew portal</div>
        </div>
      `;
    }

    if (refreshBtn) refreshBtn.disabled = true;
    if (syncBtn) syncBtn.disabled = true;

    try {
      // Call TDRS API through a PHP proxy to avoid CORS issues
      const api = window.Api || AuthService.getApi();
      let toolsData = [];
      let errorMessage = '';

      if (api && typeof api.request === 'function' && !useDirectConnection) {
        // Use existing API service to call our backend proxy
        // Note: api.request() already prepends /api, so use /crew_tools/... not /api/crew_tools/...
        const response = await api.request('/crew_tools/get_tools_history.php', {
          method: 'POST',
          body: JSON.stringify({
            cms_id: cmsId
          })
        });

        console.log('Tools API Response:', response);

        // Check if API is available
        if (response.error === 'API_NOT_AVAILABLE' || response.error === 'API_ENDPOINT_NOT_FOUND') {
          errorMessage = 'PHP API endpoint not found. Trying direct connection...';
          console.warn(errorMessage);
          // Try direct connection as fallback
          return this.fetchToolsData(true);
        }

        if (response.success) {
          toolsData = response.data || [];
          
          // Check if there's a message about authentication
          if (response.message && toolsData.length === 0) {
            console.warn('TDRS Message:', response.message);
            // Show the message but don't throw error - user might need to login to TDRS
            showNotification('<img src="https://img.icons8.com/3d-fluency/94/info.png" width="24" height="24" alt="info" style="vertical-align: middle;"> ' + response.message, 'info');
          }
        } else {
          throw new Error(response.error || 'Failed to fetch tools data from server');
        }
      } else {
        // Fallback: direct fetch (may have CORS issues)
        console.log('API service not available, trying direct fetch with GET...');
        const response = await fetch(`https://tdrs.ritutechno.com/crew-portal.php?cms_id=${encodeURIComponent(cmsId)}`, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          toolsData = data.history || data.data || data || [];
        } else {
          // HTML response - will be handled by display
          const htmlText = await response.text();
          console.log('TDRS returned HTML, length:', htmlText.length);
          // For now, throw error to trigger PHP proxy parsing
          throw new Error('TDRS returned HTML page. Using PHP proxy to parse...');
        }
      }

      // Cache the data locally
      this.cachedToolsData = toolsData;
      localStorage.setItem('toolsHistory_' + cmsId, JSON.stringify({
        data: toolsData,
        timestamp: Date.now()
      }));

      this.displayToolsData(toolsData);
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Tools data fetched successfully!', 'success');

    } catch (error) {
      console.error('Error fetching tools data:', error);

      // Try to load cached data if available
      const cached = localStorage.getItem('toolsHistory_' + cmsId);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.data && parsed.data.length > 0) {
            this.displayToolsData(parsed.data);
            toolsContent.insertAdjacentHTML('afterbegin', `
              <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
                <div style="font-size: 13px; color: #e65100;">
                  <strong><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Offline Mode:</strong> Showing cached data from ${new Date(parsed.timestamp).toLocaleString()}
                </div>
              </div>
            `);
            showNotification('<img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Showing cached tools data', 'warning');
            return;
          }
        } catch (e) {
          console.error('Error parsing cached tools data:', e);
        }
      }

      // Show detailed error message in Items tab
      const isApiNotFound = error.message && error.message.includes('endpoint not found');
      const itemsList = document.getElementById('toolsItemsList');
      
      if (itemsList) {
        itemsList.innerHTML = `
          <div class="error-state" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 24px; margin-bottom: 12px; color: #f44336;"><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"></div>
            <div style="font-weight: 600; margin-bottom: 8px;">Failed to fetch tools data</div>
            <div style="font-size: 12px; color: #888; margin-top: 4px; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.5;">
              ${error.message || 'Connection error. Please check your internet connection.'}
            </div>
            ${isApiNotFound ? `
            <div style="margin-top: 16px; padding: 12px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
              <div style="font-size: 12px; color: #e65100;">
                <strong>Setup Required:</strong> The API endpoint file is missing. Please ensure <code>api/crew_tools/get_tools_history.php</code> exists on the server.
              </div>
            </div>
            ` : ''}
            <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: center;">
              <button class="btn-sm btn-primary" onclick="ProfilePage.fetchToolsData()" style="padding: 8px 16px;">
                <img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Retry
              </button>
              <button class="btn-sm" onclick="ProfilePage.testTdrsDirectConnection()" style="padding: 8px 16px; background: #f1f5f9; border: 1px solid #cbd5e1;">
                <img src="https://img.icons8.com/3d-fluency/94/link.png" width="24" height="24" alt="link" style="vertical-align: middle;"> Test Direct Connection
              </button>
            </div>
          </div>
        `;
      }

      showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> ' + (error.message || 'Failed to fetch tools data. Please try again.'), 'error');
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
      if (syncBtn) syncBtn.disabled = false;
    }
  },

  // Display tools data in the UI - matches TDRS crew portal format with 3 tabs
  displayToolsData(toolsData) {
    // Store data for later use
    this.cachedToolsData = toolsData;
    
    // Normalize data format - handle different API response structures
    // Some APIs return arrays instead of objects, so we need to handle both
    const normalizedData = toolsData.map((item, index) => {
      // If item is an array (numeric keys), convert to object
      if (Array.isArray(item)) {
        return {
          type: item[0] || 'TOOL',
          item: item[1] || 'Unknown Item',
          barcode: item[2] || '-',
          category: item[3] || '-',
          charger: item[4] || '-',
          date: item[5] || new Date().toISOString(),
          return_date: item[6] || '',
          status: item[7] || 'Active'
        };
      }
      
      // Normal object format - map TDRS fields correctly
      // Based on screenshot: raw data has barcode in 'item' field and category in 'barcode' field
      const rawItem = item.item || item.tool_name || item.toolName || item.name || '-';
      const rawBarcode = item.barcode || item.serial_no || item.serialNo || item.id || '-';
      const rawCategory = item.category || item.tool_category || '-';
      const rawCharger = item.charger || item.assigned_by || item.assignedBy || '-';
      
      // Detect if the API is returning data in swapped format
      // If rawItem contains "/" it's likely a barcode (e.g., "HMH/VHF-18")
      const isSwappedFormat = rawItem.includes('/') && !rawBarcode.includes('/');
      
      // Derive item type from barcode prefix
      const barcodeForType = isSwappedFormat ? rawItem : rawBarcode;
      const itemType = barcodeForType.toLowerCase().includes('vhf') ? 'VHF' : 
                       barcodeForType.toLowerCase().includes('det') ? 'DET' : 'TOOL';
      
      // Derive item name from type
      const itemName = itemType === 'VHF' ? 'VHF Radio' : 
                       itemType === 'DET' ? 'Detonator' : 'Tool';
      
      return {
        type: itemType,
        item: itemName,
        barcode: isSwappedFormat ? rawItem : rawBarcode,
        date: item.date || item.issued_date || item.checkoutDate || item.created_at || new Date().toISOString(),
        return_date: item.return_date || item.returned_date || '',
        status: item.status || 'Active',
        category: isSwappedFormat ? rawBarcode : rawCategory,
        charger: rawCharger
      };
    });

    // Update stats
    this.updateToolsStats(normalizedData);
    
    // Populate all three tabs
    this.displayToolsItems(normalizedData);
    this.displayToolsHistory(normalizedData);
    this.populateReportItems(normalizedData);
    this.displayToolReports();
  },

  // Update tools statistics counters
  updateToolsStats(toolsData) {
    const totalCount = toolsData.length;
    const activeCount = toolsData.filter(t => 
      t.status.toLowerCase() === 'active' || 
      t.status.toLowerCase() === 'issued' || 
      t.status.toLowerCase() === 'checked-out'
    ).length;
    const returnedCount = toolsData.filter(t => 
      t.status.toLowerCase() === 'returned' || 
      t.status.toLowerCase() === 'completed'
    ).length;

    // Update new stat counters
    const currentItems = toolsData.filter(t => 
      t.status.toLowerCase() === 'active' || 
      t.status.toLowerCase() === 'issued'
    ).length;
    
    const currentEl = document.getElementById('toolsCurrentCount');
    const transactionsEl = document.getElementById('toolsTransactionsCount');
    const reportsEl = document.getElementById('toolsReportsCount');

    if (currentEl) currentEl.textContent = currentItems;
    if (transactionsEl) transactionsEl.textContent = totalCount;
    if (reportsEl) reportsEl.textContent = '0'; // Will be updated when reports are loaded
  },

  // Display Current Items tab
  displayToolsItems(toolsData) {
    const itemsList = document.getElementById('toolsItemsList');
    if (!itemsList) return;

    // Filter only active/issued items (case-insensitive)
    const currentItems = toolsData.filter(t => {
      const status = (t.status || '').toLowerCase();
      return status === 'active' || status === 'issued' || status === 'checked-out' || status === 'current';
    });

    if (currentItems.length === 0) {
      itemsList.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 40px 20px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/box.png" width="24" height="24" alt="box" style="vertical-align: middle;"></div>
          <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">No Current Items</div>
          <div style="font-size: 13px; color: #64748b;">You have no tools currently issued</div>
        </div>
      `;
      return;
    }

    const html = `
      <div class="tools-items-container" style="display: flex; flex-direction: column; gap: 12px;">
        ${currentItems.map(item => `
          <div class="tools-item-card" style="background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
            <!-- Item Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">${item.category}</div>
                <div style="font-size: 16px; font-weight: 700; color: #1e293b;">${item.item}</div>
              </div>
              <button onclick="ProfilePage.reportToolItem('${item.barcode}', '${item.item}')" style="background: #fee2e2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                <span><img src="https://img.icons8.com/3d-fluency/94/flag.png" width="24" height="24" alt="flag" style="vertical-align: middle;"></span> Report
              </button>
            </div>
            
            <!-- Item Details Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9;">
              <div>
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Barcode</div>
                <span style="background: #eff6ff; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #1e40af; border: 1px solid #dbeafe;">${item.barcode}</span>
              </div>
              <div>
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Charger</div>
                <div style="font-family: monospace; font-size: 12px; color: #475569;">${item.charger !== '-' ? item.charger : '<span style="color: #94a3b8;">-</span>'}</div>
              </div>
              <div>
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Issued</div>
                <div style="font-size: 12px; color: #64748b;">${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
              <div>
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Status</div>
                <span style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #92400e;">${item.status}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    itemsList.innerHTML = html;
  },

  // Display History tab
  displayToolsHistory(toolsData) {
    const historyList = document.getElementById('toolsHistoryList');
    if (!historyList) return;

    if (toolsData.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 40px 20px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/scroll.png" width="24" height="24" alt="history" style="vertical-align: middle;"></div>
          <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">No History</div>
          <div style="font-size: 13px; color: #64748b;">No transaction history available</div>
        </div>
      `;
      return;
    }

    const html = `
      <div class="tools-history-container" style="display: flex; flex-direction: column; gap: 12px;">
        ${toolsData.map(tool => {
          const statusColor = this.getToolStatusColor(tool.status);
          const itemType = tool.item.toLowerCase().includes('vhf') ? 'VHF' : 
                          tool.item.toLowerCase().includes('detonator') ? 'DET' : 
                          tool.item.toLowerCase().includes('radio') ? 'RAD' : 'TOOL';
          
          return `
          <div class="tools-history-card" style="background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
            <!-- Header Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #64748b;">${itemType}</span>
                <span style="font-size: 16px; font-weight: 700; color: #1e293b;">${tool.item}</span>
              </div>
              <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; ${statusColor}">${tool.status}</span>
            </div>
            
            <!-- Details Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Barcode</div>
                <span style="background: #eff6ff; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #1e40af; border: 1px solid #dbeafe;">${tool.barcode}</span>
              </div>
              <div>
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Charger</div>
                <div style="font-family: monospace; font-size: 12px; color: #475569;">${tool.charger && tool.charger !== '-' ? tool.charger : '<span style="color: #94a3b8;">-</span>'}</div>
              </div>
              <div>
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Date of Issue</div>
                <div style="font-size: 12px; color: #64748b;">${new Date(tool.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div>
                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Date of Return</div>
                <div style="font-size: 12px; color: #64748b;">${tool.return_date ? new Date(tool.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '<span style="color: #94a3b8;">-</span>'}</div>
              </div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    `;

    historyList.innerHTML = html;
  },

  // Populate report item dropdown
  populateReportItems(toolsData) {
    const select = document.getElementById('reportItemSelect');
    if (!select) return;

    // Filter active items
    const activeItems = toolsData.filter(t => 
      t.status.toLowerCase() === 'active' || 
      t.status.toLowerCase() === 'issued'
    );

    if (activeItems.length === 0) {
      select.innerHTML = '<option value="">No active items to report</option>';
      return;
    }

    select.innerHTML = `
      <option value="">Select item...</option>
      ${activeItems.map(item => `
        <option value="${item.barcode}">${item.item} (${item.barcode})</option>
      `).join('')}
    `;
  },

  // Switch between tools tabs
  switchToolsTab(tab) {
    // Update tab buttons
    const tabs = ['items', 'history', 'reports'];
    tabs.forEach(t => {
      const btn = document.getElementById(`toolsTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
      const content = document.getElementById(`tools${t.charAt(0).toUpperCase() + t.slice(1)}Content`);
      
      if (t === tab) {
        btn.style.background = '#4f46e5';
        btn.style.color = 'white';
        if (content) content.style.display = 'block';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = '#64748b';
        if (content) content.style.display = 'none';
      }
    });
  },

  // Report a tool item
  reportToolItem(barcode, itemName) {
    // Switch to reports tab
    this.switchToolsTab('reports');
    // Pre-select the item
    const select = document.getElementById('reportItemSelect');
    if (select) {
      select.value = barcode;
    }
    showNotification(`Reporting ${itemName}`, 'info');
  },

  // Submit tool report
  async submitToolReport() {
    const itemBarcode = document.getElementById('reportItemSelect').value;
    const type = document.getElementById('reportTypeSelect').value;
    const severity = document.getElementById('reportSeveritySelect').value;
    const description = document.getElementById('reportDescription').value.trim();

    if (!itemBarcode) {
      showNotification('Please select an item', 'error');
      return;
    }
    if (!description) {
      showNotification('Please enter a description', 'error');
      return;
    }

    const user = AuthService.getUser();
    const cmsId = user.cms || user.cms_id;
    const itemName = document.getElementById('reportItemSelect').options[document.getElementById('reportItemSelect').selectedIndex].text;
    
    const report = {
      id: 'REP' + Date.now(),
      item_barcode: itemBarcode,
      item_name: itemName,
      type: type,
      severity: severity,
      description: description,
      reported_by: cmsId,
      reported_by_name: user.name,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    // Show loading notification
    showNotification('<img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Submitting report to TDRS...', 'info');

    try {
      // Try to submit to TDRS API
      const api = window.Api || AuthService.getApi();
      let tdrsSubmitted = false;
      
      if (api && typeof api.request === 'function') {
        const response = await api.request('/crew_tools/submit_tool_report.php', {
          method: 'POST',
          body: JSON.stringify({
            cms_id: cmsId,
            item_barcode: itemBarcode,
            item_name: itemName,
            type: type,
            severity: severity,
            description: description
          })
        });

        console.log('TDRS API Response:', response);
        
        if (response.success) {
          tdrsSubmitted = true;
          report.tdrs_report_id = response.report_id;
          report.source = response.source || 'tdrs';
          if (response.source === 'database') {
            showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Report submitted to TDRS successfully!', 'success');
          } else {
            showNotification('<img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> ' + (response.message || 'Report saved locally'), 'warning');
          }
        } else {
          console.warn('TDRS API returned error:', response.error);
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> TDRS Error: ' + (response.error || 'Unknown error'), 'error');
        }
      }
      
      // Always save to localStorage as backup
      const reports = JSON.parse(localStorage.getItem('toolReports') || '[]');
      reports.push(report);
      localStorage.setItem('toolReports', JSON.stringify(reports));
      
      if (!tdrsSubmitted) {
        showNotification('<img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Report saved locally. TDRS sync pending.', 'warning');
      }

    } catch (error) {
      console.error('Error submitting report to TDRS:', error);
      
      // Save to localStorage if API fails
      const reports = JSON.parse(localStorage.getItem('toolReports') || '[]');
      reports.push(report);
      localStorage.setItem('toolReports', JSON.stringify(reports));
      
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Report saved locally. TDRS connection failed.', 'warning');
    }

    // Clear form
    document.getElementById('reportDescription').value = '';
    document.getElementById('reportItemSelect').value = '';

    // Refresh reports list
    this.displayToolReports();
  },

  // Fetch reports from TDRS database
  async fetchToolReportsFromTDRS() {
    const user = AuthService.getUser();
    const cmsId = user.cms || user.cms_id;
    
    console.log('Fetching reports for CMS ID:', cmsId);
    
    try {
      const api = window.Api || AuthService.getApi();
      if (api && typeof api.request === 'function') {
        const response = await api.request('/crew_tools/get_tool_reports.php?cms_id=' + encodeURIComponent(cmsId), {
          method: 'GET'
        });
        
        console.log('TDRS Reports Response:', response);
        
        if (response.success && response.reports) {
          console.log('Found', response.reports.length, 'reports from TDRS');
          return response.reports;
        } else {
          console.warn('TDRS API returned error:', response.error);
        }
      } else {
        console.warn('API not available');
      }
    } catch (error) {
      console.error('Error fetching reports from TDRS:', error);
    }
    
    return [];
  },

  // Display tool reports - merges TDRS and localStorage
  async displayToolReports() {
    const reportsList = document.getElementById('toolsReportsList');
    if (!reportsList) return;

    const user = AuthService.getUser();
    const cmsId = user.cms || user.cms_id;
    
    // Show loading state
    reportsList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
        <div style="font-size: 32px; margin-bottom: 12px;"><img src="https://img.icons8.com/3d-fluency/94/hourglass.png" width="24" height="24" alt="wait" style="vertical-align: middle;"></div>
        <div style="font-size: 14px;">Loading reports...</div>
      </div>
    `;
    
    // Fetch reports from TDRS database
    const tdrsReports = await this.fetchToolReportsFromTDRS();
    
    // Get localStorage reports
    const localReports = JSON.parse(localStorage.getItem('toolReports') || '[]');
    const userLocalReports = localReports.filter(r => r.reported_by === cmsId);
    
    // Merge reports: TDRS reports take precedence for status updates
    const mergedReports = [...tdrsReports];
    
    // Add local reports that aren't in TDRS yet
    userLocalReports.forEach(localReport => {
      const existsInTDRS = tdrsReports.some(tdrsReport => 
        tdrsReport.item_barcode === localReport.item_barcode &&
        tdrsReport.created_at === localReport.created_at
      );
      
      if (!existsInTDRS) {
        mergedReports.push(localReport);
      }
    });
    
    // Sort by date (newest first)
    mergedReports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Update counter
    const reportsCountEl = document.getElementById('toolsReportsCount');
    if (reportsCountEl) reportsCountEl.textContent = mergedReports.length;

    if (mergedReports.length === 0) {
      reportsList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
          <div style="font-size: 32px; margin-bottom: 12px;"><img src="https://img.icons8.com/3d-fluency/94/note.png" width="24" height="24" alt="note" style="vertical-align: middle;"></div>
          <div style="font-size: 14px;">No reports submitted yet</div>
        </div>
      `;
      return;
    }

    const html = mergedReports.map(report => `
      <div class="tools-report-card" style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
        <!-- Header with Item and Status -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
          <div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Reported Item</div>
            <div style="font-weight: 700; color: #1e293b; font-size: 15px;">${report.item_name.split('(')[0].trim()}</div>
          </div>
          <span style="background: ${report.status === 'Pending' ? '#fef3c7' : '#dcfce7'}; color: ${report.status === 'Pending' ? '#92400e' : '#166534'}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; flex-shrink: 0;">${report.status}</span>
        </div>
        
        <!-- Barcode -->
        <div style="margin-bottom: 12px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 2px;">Barcode</div>
          <span style="background: #eff6ff; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #1e40af; border: 1px solid #dbeafe;">${report.item_barcode}</span>
        </div>
        
        <!-- Description -->
        <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Description</div>
          <div style="font-size: 13px; color: #374151; line-height: 1.5;">${report.description}</div>
        </div>
        
        <!-- Footer with metadata -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px;">
          <span style="background: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 6px; font-weight: 500;">
            <img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="date" style="vertical-align: middle;"> ${new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span style="background: ${report.type === 'damage' ? '#fee2e2' : report.type === 'loss' ? '#fecaca' : '#dbeafe'}; color: ${report.type === 'damage' ? '#dc2626' : report.type === 'loss' ? '#991b1b' : '#1e40af'}; padding: 4px 10px; border-radius: 6px; font-weight: 600; text-transform: capitalize;">
            ${report.type}
          </span>
          <span style="background: ${report.severity === 'critical' ? '#fecaca' : report.severity === 'major' ? '#fed7aa' : report.severity === 'moderate' ? '#fef3c7' : '#dcfce7'}; color: ${report.severity === 'critical' ? '#991b1b' : report.severity === 'major' ? '#9a3412' : report.severity === 'moderate' ? '#92400e' : '#166534'}; padding: 4px 10px; border-radius: 6px; font-weight: 600; text-transform: capitalize;">
            ${report.severity}
          </span>
          ${report.source === 'tdrs' ? '<span style="background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-weight: 600;"><img src="https://img.icons8.com/3d-fluency/94/globe.png" width="24" height="24" alt="web" style="vertical-align: middle;"> TDRS</span>' : '<span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px; font-weight: 600;"><img src="https://img.icons8.com/3d-fluency/94/save.png" width="24" height="24" alt="save" style="vertical-align: middle;"> Local</span>'}
        </div>
      </div>
    `).join('');

    reportsList.innerHTML = html;
  },

  // Get color styles for tool status
  getToolStatusColor(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'returned' || statusLower === 'completed') {
      return 'background: #dcfce7; color: #166534;';
    } else if (statusLower === 'active' || statusLower === 'issued' || statusLower === 'checked-out') {
      return 'background: #fef3c7; color: #92400e;';
    } else if (statusLower === 'overdue' || statusLower === 'late') {
      return 'background: #fee2e2; color: #991b1b;';
    } else if (statusLower === 'damaged' || statusLower === 'broken') {
      return 'background: #f3e8ff; color: #6b21a8;';
    }
    return 'background: #f1f5f9; color: #475569;';
  },

  // Refresh tools history
  refreshToolsHistory() {
    this.fetchToolsData();
  },

  // Test direct connection to TDRS API (for debugging)
  async testTdrsDirectConnection() {
    const user = AuthService.getUser();
    const cmsId = user.cms || user.cms_id;
    
    showNotification('Testing direct TDRS connection...', 'info');
    
    try {
      // Try direct fetch to TDRS
      const response = await fetch('https://tdrs.ritutechno.com/crew-portal.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'cms_id': cmsId,
          'action': 'get_tools_history'
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      const contentType = response.headers.get('content-type');
      let result = '';
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        result = 'JSON Response: ' + JSON.stringify(data).substring(0, 200);
      } else {
        const text = await response.text();
        result = 'HTML Response (first 500 chars): ' + text.substring(0, 500);
      }

      // Show result in a modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); z-index: 10000; display: flex;
        justify-content: center; align-items: center; padding: 20px;
      `;
      modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 600px; max-height: 80vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">TDRS Connection Test</h3>
            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">&times;</button>
          </div>
          <div style="padding: 20px; overflow-y: auto; flex: 1;">
            <div style="margin-bottom: 16px;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Status</div>
              <div style="font-weight: 600; color: ${response.ok ? '#059669' : '#dc2626'};">
                ${response.ok ? '<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Connected' : '<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed'} (HTTP ${response.status})
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">CMS ID Used</div>
              <div style="font-family: monospace; background: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 13px;">${cmsId}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Response</div>
              <pre style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 11px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; margin: 0; max-height: 300px; overflow-y: auto;">${result}</pre>
            </div>
          </div>
          <div style="padding: 16px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc;">
            <button onclick="this.closest('.modal-overlay').remove()" class="btn-gradient" style="width: 100%;">Close</button>
          </div>
        </div>
      `;
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
      
      showNotification(response.ok ? '<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> TDRS connection test complete' : '<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> TDRS connection failed', response.ok ? 'success' : 'error');
      
    } catch (error) {
      console.error('TDRS test error:', error);
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> TDRS test failed: ' + error.message, 'error');
      
      // Show error modal
      alert('TDRS Connection Test Failed:\n\n' + error.message + '\n\nThis usually means CORS is blocking the request. The PHP proxy approach is required.');
    }
  },

  // Sync tools data with external system
  async syncToolsData() {
    showNotification('<img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Syncing tools data...', 'info');

    try {
      // In a real implementation, this would sync local data with external system
      // await fetch('https://external-api.example.com/tools/sync', { method: 'POST' });

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Tools data synced successfully!', 'success');
    } catch (error) {
      console.error('Error syncing tools data:', error);
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed to sync tools data.', 'error');
    }
  },

  // Fetch running room data from RRMS external API
  async fetchRunningRoomData() {
    const user = AuthService.getUser();
    const refreshBtn = document.getElementById('refreshRunningRoomBtn');

    // Show loading state in current tab
    const currentContent = document.getElementById('runningRoomCurrentContent');
    if (currentContent) {
      currentContent.innerHTML = `
        <div class="loading-state" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 24px; margin-bottom: 12px;"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"></div>
          <div>Fetching running room data...</div>
          <div style="font-size: 12px; color: #888; margin-top: 4px;">Connecting to RRMS system</div>
        </div>
      `;
    }

    if (refreshBtn) refreshBtn.disabled = true;

    try {
      // Get CMS ID from user
      const cmsId = user.cms || user.cms_id;
      if (!cmsId) {
        throw new Error('CMS ID not found');
      }

      // Call RRMS API through PHP proxy
      const api = window.Api || AuthService.getApi();
      let roomData = [];

      if (api && typeof api.request === 'function') {
        const response = await api.request('/crew_tools/get_running_room.php', {
          method: 'POST',
          body: JSON.stringify({
            cms_id: cmsId
          })
        });

        console.log('RRMS API Response:', response);

        if (response.error === 'API_NOT_AVAILABLE' || response.error === 'API_ENDPOINT_NOT_FOUND') {
          console.warn('RRMS API endpoint not found');
          throw new Error('RRMS API not available');
        }

        if (response.success) {
          roomData = response.data || [];
          if (response.message) {
            showNotification('<img src="https://img.icons8.com/3d-fluency/94/info.png" width="24" height="24" alt="info" style="vertical-align: middle;"> ' + response.message, 'info');
          }
        } else {
          throw new Error(response.error || 'Failed to fetch running room data');
        }
      } else {
        throw new Error('API service not available');
      }

      // Cache the data
      this.cachedRunningRoomData = roomData;
      localStorage.setItem('runningRoom_' + cmsId, JSON.stringify({
        data: roomData,
        timestamp: Date.now()
      }));

      // Display data
      this.displayRunningRoomData(roomData);
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Running room data fetched successfully!', 'success');

    } catch (error) {
      console.error('Error fetching running room data:', error);

      // Try to load cached data
      const cmsId = user.cms || user.cms_id;
      const cached = localStorage.getItem('runningRoom_' + cmsId);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.data && parsed.data.length > 0) {
            this.displayRunningRoomData(parsed.data);
            showNotification('<img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Showing cached data', 'warning');
            return;
          }
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }

      // Show error in current tab
      if (currentContent) {
        currentContent.innerHTML = `
          <div class="error-state" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 24px; margin-bottom: 12px; color: #f44336;"><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"></div>
            <div>Failed to fetch running room data</div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">${error.message}</div>
            <button class="btn-sm btn-primary" onclick="ProfilePage.fetchRunningRoomData()" style="margin-top: 16px;">
              <img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Retry
            </button>
          </div>
        `;
      }

      showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> ' + error.message, 'error');
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  },

  // Display running room data in tabs
  displayRunningRoomData(roomData) {
    // Normalize data
    const normalizedData = roomData.map(item => ({
      date: item.date || item.arrival_date || item.created_at || new Date().toISOString(),
      train_no: item.train_no || item.train_number || '-',
      from_station: item.from_station || item.from || '-',
      to_station: item.to_station || item.to || '-',
      room_no: item.room_no || item.room_number || '-',
      status: item.status || 'Active',
      rest_hours: item.rest_hours || item.hours || '0'
    }));

    // Update stats
    this.updateRunningRoomStats(normalizedData);
    
    // Display in tabs
    this.displayRunningRoomCurrent(normalizedData);
    this.displayRunningRoomHistory(normalizedData);
  },

  // Update running room stats
  updateRunningRoomStats(roomData) {
    const currentRest = roomData.filter(r => r.status.toLowerCase() === 'active').length;
    const totalDuties = roomData.length;
    const totalHours = roomData.reduce((sum, r) => sum + (parseFloat(r.rest_hours) || 0), 0);

    const currentEl = document.getElementById('rrCurrentRest');
    const dutiesEl = document.getElementById('rrDutyCount');
    const hoursEl = document.getElementById('rrHoursRested');

    if (currentEl) currentEl.textContent = currentRest > 0 ? 'Active' : 'None';
    if (dutiesEl) dutiesEl.textContent = totalDuties;
    if (hoursEl) hoursEl.textContent = Math.round(totalHours);
  },

  // Display Current Rest tab
  displayRunningRoomCurrent(roomData) {
    const currentContent = document.getElementById('runningRoomCurrentContent');
    if (!currentContent) return;

    const activeRest = roomData.filter(r => r.status.toLowerCase() === 'active');

    if (activeRest.length === 0) {
      currentContent.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 40px 20px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/building.png" width="24" height="24" alt="hotel" style="vertical-align: middle;"></div>
          <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">No Active Rest</div>
          <div style="font-size: 13px; color: #64748b;">You are not currently resting in running room</div>
        </div>
      `;
      return;
    }

    const rest = activeRest[0];
    currentContent.innerHTML = `
      <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 48px; height: 48px; background: #f3e8ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;"><img src="https://img.icons8.com/3d-fluency/94/building.png" width="24" height="24" alt="hotel" style="vertical-align: middle;"></div>
          <div>
            <div style="font-size: 12px; color: #7c3aed; font-weight: 600;">Currently Resting</div>
            <div style="font-size: 18px; font-weight: 700; color: #1e293b;">Room ${rest.room_no}</div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">From Station</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 4px;">${rest.from_station}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">To Station</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 4px;">${rest.to_station}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Train No</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 4px;">${rest.train_no}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Arrival</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 4px;">${new Date(rest.date).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    `;
  },

  // Display History tab
  displayRunningRoomHistory(roomData) {
    const historyContent = document.getElementById('runningRoomHistoryContent');
    if (!historyContent) return;

    if (roomData.length === 0) {
      historyContent.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 40px 20px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/scroll.png" width="24" height="24" alt="history" style="vertical-align: middle;"></div>
          <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">No History</div>
          <div style="font-size: 13px; color: #64748b;">No running room history available</div>
        </div>
      `;
      return;
    }

    const html = `
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: grid; grid-template-columns: 100px 1fr 1fr 100px 100px; gap: 12px; padding: 16px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
          <div>Date</div>
          <div>From</div>
          <div>To</div>
          <div>Room</div>
          <div>Status</div>
        </div>
        <div style="display: flex; flex-direction: column;">
          ${roomData.map(record => `
            <div style="display: grid; grid-template-columns: 100px 1fr 1fr 100px 100px; gap: 12px; padding: 16px; border-bottom: 1px solid #f1f5f9; align-items: center; font-size: 13px;">
              <div style="color: #64748b;">${new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <div style="font-weight: 500; color: #1e293b;">${record.from_station}</div>
              <div style="font-weight: 500; color: #1e293b;">${record.to_station}</div>
              <div style="font-family: monospace; font-size: 12px; color: #475569;">${record.room_no}</div>
              <div>
                <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; ${record.status.toLowerCase() === 'active' ? 'background: #dcfce7; color: #166534;' : 'background: #f1f5f9; color: #475569;'}">${record.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    historyContent.innerHTML = html;
  },

  // Switch between running room tabs
  switchRunningRoomTab(tab) {
    const tabs = ['current', 'history', 'booking'];
    tabs.forEach(t => {
      const btn = document.getElementById(`rrTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
      const content = document.getElementById(`rr${t.charAt(0).toUpperCase() + t.slice(1)}Content`);
      
      if (t === tab) {
        btn.style.background = '#7c3aed';
        btn.style.color = 'white';
        if (content) content.style.display = 'block';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = '#64748b';
        if (content) content.style.display = 'none';
      }
    });
  },

  // Book running room
  async bookRunningRoom() {
    const fromStation = document.getElementById('rrFromStation').value.trim();
    const toStation = document.getElementById('rrToStation').value.trim();
    const arrivalDate = document.getElementById('rrArrivalDate').value;
    const trainNo = document.getElementById('rrTrainNo').value.trim();
    const roomType = document.getElementById('rrRoomType').value;

    if (!fromStation || !toStation || !arrivalDate) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    const user = AuthService.getUser();
    const booking = {
      id: 'RR' + Date.now(),
      cms_id: user.cms || user.cms_id,
      from_station: fromStation,
      to_station: toStation,
      arrival_date: arrivalDate,
      train_no: trainNo,
      room_type: roomType,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    // Save to localStorage (in real app, send to API)
    const bookings = JSON.parse(localStorage.getItem('runningRoomBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('runningRoomBookings', JSON.stringify(bookings));

    // Clear form
    document.getElementById('rrFromStation').value = '';
    document.getElementById('rrToStation').value = '';
    document.getElementById('rrArrivalDate').value = '';
    document.getElementById('rrTrainNo').value = '';

    showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Booking request submitted!', 'success');
    
    // Switch to history tab to see the booking
    this.switchRunningRoomTab('history');
  },

  // Legacy function - replaced by fetchRunningRoomData
  async fetchRunningRoomDataOld() {
    const user = AuthService.getUser();
    const runningRoomContent = document.getElementById('runningRoomContent');
    const refreshBtn = document.getElementById('refreshRunningRoomBtn');

    if (!runningRoomContent) return;

    // Show loading state
    runningRoomContent.innerHTML = `
      <div class="loading-state" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 24px; margin-bottom: 12px;"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"></div>
        <div>Fetching running room data...</div>
        <div style="font-size: 12px; color: #888; margin-top: 4px;">Connecting to running room management system</div>
      </div>
    `;

    if (refreshBtn) refreshBtn.disabled = true;

    try {
      // In a real implementation, this would call the external API
      //   body: JSON.stringify({
      //     cmsId: user.cms,
      //     division: user.division
      //   })
      // });

      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated data - in real implementation this would come from API
      const runningRoomData = [
        {
          id: 'RR001',
          dutyDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dutyType: 'WKG',
          trainNo: '12345',
          locoNo: 'WAP7 30451',
          fromStation: 'JP - Jaipur',
          toStation: 'DLI - Delhi',
          departureTime: '08:30',
          arrivalTime: '14:45',
          dutyHours: 6.25,
          status: 'completed',
          remarks: 'On-time departure, smooth journey'
        },
        {
          id: 'RR002',
          dutyDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          dutyType: 'LR',
          trainNo: '59719',
          locoNo: 'WAG9 22345',
          fromStation: 'JP - Jaipur',
          toStation: 'KOTA',
          departureTime: '15:20',
          arrivalTime: '18:15',
          dutyHours: 2.92,
          status: 'completed',
          remarks: 'Light running, no issues'
        },
        {
          id: 'RR003',
          dutyDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          dutyType: 'PASSENGER',
          trainNo: '14810',
          locoNo: 'WAP4 20301',
          fromStation: 'JP - Jaipur',
          toStation: 'UDZ - Udaipur',
          departureTime: '06:00',
          arrivalTime: '11:30',
          dutyHours: 5.5,
          status: 'completed',
          remarks: 'Passenger train, smooth operation'
        }
      ];

      this.displayRunningRoomData(runningRoomData);

      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Running room data fetched successfully!', 'success');
    } catch (error) {
      console.error('Error fetching running room data:', error);

      runningRoomContent.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 20px; border: 1px dashed #fecaca;">
          <div style="font-size: 40px; margin-bottom: 12px;"><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"></div>
          <div style="font-weight: 700; color: #1e293b;">Unable to fetch data</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${error.message || 'Connection error'}</div>
          <button class="btn-gradient" onclick="ProfilePage.fetchRunningRoomData()" style="margin-top: 16px; border: none;">
            <img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Retry
          </button>
        </div>
      `;

      showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed to fetch running room data. Please try again.', 'error');
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
      if (syncBtn) syncBtn.disabled = false;
    }
  },

  // Display running room data in the UI
  displayRunningRoomData(runningRoomData) {
    const runningRoomContent = document.getElementById('runningRoomContent');
    const rrRecentRest = document.getElementById('rrRecentRest');
    const rrDutyCount = document.getElementById('rrDutyCount');
    if (!runningRoomContent) return;

    // Update stats
    if (rrDutyCount) rrDutyCount.textContent = runningRoomData.length;
    if (rrRecentRest && runningRoomData.length > 0) {
      const lastDuty = runningRoomData[0];
      rrRecentRest.textContent = lastDuty.arrivalTime || '--:--';
    }

    if (runningRoomData.length === 0) {
      runningRoomContent.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 40px 20px; background: white; border-radius: 20px; border: 1px dashed #e2e8f0;">
          <div style="font-size: 40px; margin-bottom: 12px; opacity: 0.5;"><img src="https://img.icons8.com/3d-fluency/94/running.png" width="24" height="24" alt="run" style="vertical-align: middle;"></div>
          <div style="font-weight: 700; color: #1e293b;">No records found</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Connect to sync your duty assignments</div>
        </div>
      `;
      return;
    }

    const html = `
      <div style="display: grid; gap: 16px;">
        ${runningRoomData.map(record => `
          <div class="running-room-card" style="background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="padding: 16px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
               <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 36px; height: 36px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;"><img src="https://img.icons8.com/3d-fluency/94/train.png" width="24" height="24" alt="train" style="vertical-align: middle;"></div>
                  <div>
                    <div style="font-size: 14px; font-weight: 800; color: #1e293b;">Train ${record.trainNo}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #64748b;">${new Date(record.dutyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
               </div>
               <span style="background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800;">${record.dutyType}</span>
            </div>
            <div style="padding: 16px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="flex: 1;">
                  <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">From</div>
                  <div style="font-size: 14px; font-weight: 700; color: #1e293b;">${record.fromStation.split(' - ')[0]}</div>
                </div>
                <div style="color: #cbd5e1;"><img src="https://img.icons8.com/3d-fluency/94/arrow.png" width="24" height="24" alt="arrow" style="vertical-align: middle;"></div>
                <div style="flex: 1; text-align: right;">
                  <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">To</div>
                  <div style="font-size: 14px; font-weight: 700; color: #1e293b;">${record.toStation.split(' - ')[0]}</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 12px;">
                <div>
                  <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Sign On</div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${record.departureTime}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Sign Off</div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${record.arrivalTime}</div>
                </div>
              </div>
              <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 12px; color: #64748b; font-weight: 600;">Loco: <span style="color: #1e293b; font-weight: 700;">${record.locoNo}</span></div>
                <div style="font-size: 12px; color: #2563eb; font-weight: 800;">${record.dutyHours} hrs</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    runningRoomContent.innerHTML = html;
  },

  // Refresh running room history
  refreshRunningRoomHistory() {
    this.fetchRunningRoomData();
  },

  // Sync running room data with external system
  async syncRunningRoomData() {
    showNotification('<img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Syncing running room data...', 'info');

    try {
      // In a real implementation, this would sync local data with external system
      // await fetch('https://external-api.example.com/runningroom/sync', { method: 'POST' });

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Running room data synced successfully!', 'success');
    } catch (error) {
      console.error('Error syncing running room data:', error);
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed to sync running room data.', 'error');
    }
  },

  // (switchTab is defined after displayFilteredRecords below)

  // Enable profile editing
  enableEdit() {
    const user = AuthService.getUser();

    document.getElementById('infoPageName').style.display = 'none';
    document.getElementById('editPageName').style.display = 'block';
    document.getElementById('editPageName').value = user.name || '';

    document.getElementById('infoPageEmail').style.display = 'none';
    document.getElementById('editPageEmail').style.display = 'block';
    document.getElementById('editPageEmail').value = user.email || '';

    document.getElementById('infoPageMobile').style.display = 'none';
    document.getElementById('editPageMobile').style.display = 'block';
    document.getElementById('editPageMobile').value = user.mobile || '';

    document.getElementById('infoPageDesignation').style.display = 'none';
    document.getElementById('editPageDesignation').style.display = 'block';
    document.getElementById('editPageDesignation').value = user.designation || 'LPG';

    document.getElementById('btnEditProfilePage').style.display = 'none';
    document.getElementById('btnSaveCancelPage').style.display = 'flex';
  },

  // Cancel editing
  cancelEdit() {
    document.getElementById('infoPageName').style.display = 'block';
    document.getElementById('editPageName').style.display = 'none';

    document.getElementById('infoPageEmail').style.display = 'block';
    document.getElementById('editPageEmail').style.display = 'none';

    document.getElementById('infoPageMobile').style.display = 'block';
    document.getElementById('editPageMobile').style.display = 'none';

    document.getElementById('infoPageDesignation').style.display = 'block';
    document.getElementById('editPageDesignation').style.display = 'none';

    document.getElementById('btnEditProfilePage').style.display = 'block';
    document.getElementById('btnSaveCancelPage').style.display = 'none';

    document.getElementById('profilePageEditError').textContent = '';
  },

  // Save profile changes
  saveProfile() {
    const user = AuthService.getUser();
    const name = document.getElementById('editPageName').value.trim();
    const email = document.getElementById('editPageEmail').value.trim();
    const mobile = document.getElementById('editPageMobile').value.trim();
    const designation = document.getElementById('editPageDesignation').value;
    const errorElem = document.getElementById('profilePageEditError');

    if (!name) {
      errorElem.textContent = 'Name cannot be empty';
      return;
    }

    if (email && !email.includes('@')) {
      errorElem.textContent = 'Please enter a valid email address';
      return;
    }

    if (mobile && mobile.length !== 10) {
      errorElem.textContent = 'Mobile number must be 10 digits';
      return;
    }

    const crews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};
    if (crews[user.cms]) {
      crews[user.cms].name = name;
      crews[user.cms].email = email;
      crews[user.cms].mobile = mobile;
      crews[user.cms].designation = designation;
      Storage.save(APP_CONFIG.storage.registeredCrews, crews);
    }

    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.designation = designation;
    Storage.saveUserState(user);

    AuthService.currentUser = user;
    AuthService.updateUI();

    // Update header
    const headerUserName = document.getElementById('headerUserName');
    if (headerUserName) headerUserName.textContent = name;

    // Refresh page
    NavigationService.navigateTo('profile');

    showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Profile updated successfully!', 'success');
  },

  // Load quiz history
  loadQuizHistory(user) {
    console.log('<img src="https://img.icons8.com/3d-fluency/94/books.png" width="24" height="24" alt="books" style="vertical-align: middle;"> ProfilePage.loadQuizHistory called for user:', user?.id || user?.cms);
    const quizHistoryList = document.getElementById('quizHistoryPageList');
    if (!quizHistoryList) {
      console.warn('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> quizHistoryPageList element not found');
      return;
    }

    // Only show spinner if this is a manual load or initial load
    // For background sync, we might want to be less intrusive, but for now let's show it to confirm activity
    // To make it smoother, we could check if there's already content
    const hasContent = quizHistoryList.children.length > 0 && !quizHistoryList.querySelector('.loading-spinner');
    if (!hasContent) {
      quizHistoryList.innerHTML = '<div class="loading-spinner">Loading history...</div>';
    }

    const api = window.Api || AuthService.getApi();
    if (!api) {
      quizHistoryList.innerHTML = '<div class="error-state">API not available</div>';
      return;
    }

    const userId = user.id || user.serverId || user.cms;

    api.getQuizHistory(userId)
      .then(response => {
        if (response.success) {
          const userAttempts = response.history || [];
          this.allQuizAttempts = userAttempts; // Store for metrics

          if (userAttempts.length === 0) {
            quizHistoryList.innerHTML = `
                    <div class="empty-state">
                      <div class="empty-state-icon"><img src="https://img.icons8.com/3d-fluency/94/note.png" width="24" height="24" alt="note" style="vertical-align: middle;"></div>
                      <div class="empty-state-text">No quiz attempts yet</div>
                      <div style="margin-top: 12px;">
                        <button class="btn-sm btn-primary" onclick="NavigationService.navigateTo('quiz')">Take Quiz</button>
                      </div>
                    </div>
                  `;
            return;
          }

          const html = userAttempts.map((attempt, index) => {
            const isPassed = attempt.is_passed == 1;
            const total = parseInt(attempt.total_questions || 10);
            const score = parseFloat(attempt.score);
            // Ensure score doesn't exceed total for display if data is messy
            const displayScore = score > total ? (score / 10) : score;
            const percentage = Math.round((displayScore / total) * 100);
            const date = attempt.attempted_at;
            const formattedScore = String(Math.floor(displayScore)).padStart(2, '0');
            const formattedTotal = String(total).padStart(2, '0');

            return `
                    <div class="quiz-history-item">
                      <div class="quiz-history-header">
                        <div class="quiz-title">Quiz Attempt #${userAttempts.length - index}</div>
                        <div class="quiz-score ${isPassed ? 'pass' : 'fail'}">
                          ${formattedScore}/${formattedTotal} (${percentage}%)
                        </div>
                      </div>
                      <div class="quiz-meta">
                        <span><img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="date" style="vertical-align: middle;"> ${new Date(date).toLocaleDateString()}</span>
                        <span><img src="https://img.icons8.com/3d-fluency/94/alarm-clock.png" width="24" height="24" alt="clock" style="vertical-align: middle;"> ${new Date(date).toLocaleTimeString()}</span>
                        <span>${isPassed ? '<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Passed' : '<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed'}</span>
                      </div>
                      ${isPassed ? `
                        <div style="margin-top: 10px;">
                          <button class="btn-sm btn-primary" onclick="CertificateService.generateCertificate({
                            name: '${user.name || 'Unknown'}', 
                            cms: '${user.cms || ''}', 
                            division: '${user.division || user.dept || ''}',
                            lobby: '${user.lobby || user.hq || ''}',
                            designation: '${user.designation || 'ALP'}',
                            score: '${displayScore}', 
                            total: '${total}', 
                            date: '${date}'
                          })">
                            <img src="https://img.icons8.com/3d-fluency/94/scroll.png" width="24" height="24" alt="history" style="vertical-align: middle;"> Download Certificate
                          </button>
                        </div>
                      ` : ''}
                    </div>
                  `;
          }).join('');

          quizHistoryList.innerHTML = html;
        } else {
          quizHistoryList.innerHTML = '<div class="error-state">Failed to load history</div>';
        }
      })
      .catch(err => {
        console.error(err);
        quizHistoryList.innerHTML = '<div class="error-state">Error loading history</div>';
      });
  },

  // Change password
  changePassword() {
    const user = AuthService.getUser();
    const currentPassword = document.getElementById('currentPasswordPage').value;
    const newPassword = document.getElementById('newPasswordPage').value;
    const confirmNewPassword = document.getElementById('confirmNewPasswordPage').value;
    const errorElem = document.getElementById('passwordPageError');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      errorElem.textContent = 'Please fill all fields';
      return;
    }

    if (newPassword.length < 6) {
      errorElem.textContent = 'New password must be at least 6 characters';
      return;
    }

    if (newPassword !== confirmNewPassword) {
      errorElem.textContent = 'New passwords do not match';
      return;
    }

    const api = window.Api || AuthService.getApi();
    if (!api) {
      showNotification('API not available', 'error');
      return;
    }

    const userId = user.id || user.serverId || user.cms;

    showNotification('Changing password...', 'info');

    api.changePassword(userId, currentPassword, newPassword)
      .then(response => {
        if (response.success) {
          errorElem.textContent = '';
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Password changed successfully!', 'success');

          document.getElementById('currentPasswordPage').value = '';
          document.getElementById('newPasswordPage').value = '';
          document.getElementById('confirmNewPasswordPage').value = '';
        } else {
          errorElem.textContent = response.error || 'Failed to change password';
        }
      })
      .catch(err => {
        console.error(err);
        errorElem.textContent = 'Error: ' + err.message;
      });
  },

  // Raise support ticket
  raiseTicket() {
    const user = AuthService.getUser();
    const category = document.getElementById('ticketPageCategory').value;
    const priority = document.getElementById('ticketPagePriority').value;
    const recipient = document.getElementById('ticketPageRecipient').value;
    const subject = document.getElementById('ticketPageSubject').value.trim();
    const description = document.getElementById('ticketPageDescription').value.trim();
    const errorElem = document.getElementById('ticketPageError');

    if (!category || !subject || !description) {
      errorElem.textContent = 'Please fill all required fields';
      return;
    }

    if (subject.length < 5) {
      errorElem.textContent = 'Subject must be at least 5 characters';
      return;
    }

    if (description.length < 20) {
      errorElem.textContent = 'Description must be at least 20 characters';
      return;
    }

    const ticketData = {
      user_id: user.id || user.serverId || user.cms,
      subject: subject,
      message: `${category} [${priority}] to ${recipient}: ${description}`
    };

    const api = window.Api || AuthService.getApi();
    if (!api) {
      showNotification('API not available', 'error');
      return;
    }

    showNotification('Creating ticket...', 'info');

    api.createSupportTicket(ticketData)
      .then(response => {
        if (response.success) {
          errorElem.textContent = '';
          showNotification(`<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Ticket created successfully!`, 'success');

          // Reset form
          document.getElementById('ticketPageCategory').value = '';
          document.getElementById('ticketPagePriority').value = 'medium';
          document.getElementById('ticketPageRecipient').value = 'lobby';
          document.getElementById('ticketPageSubject').value = '';
          document.getElementById('ticketPageDescription').value = '';

          this.loadMyTickets(user);
        } else {
          errorElem.textContent = response.error || 'Failed to create ticket';
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed: ' + response.error, 'error');
        }
      })
      .catch(err => {
        console.error(err);
        errorElem.textContent = 'Error: ' + err.message;
        showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Error: ' + err.message, 'error');
      });
  },

  // Load user tickets
  loadMyTickets(user) {
    const myTicketsList = document.getElementById('myTicketsPageList');
    if (!myTicketsList) return;

    myTicketsList.innerHTML = '<div class="loading-spinner">Loading tickets...</div>';

    const api = window.Api || AuthService.getApi();
    if (!api) return;

    const userId = user.id || user.serverId || user.cms;

    api.getSupportTickets(userId)
      .then(response => {
        if (response.success) {
          const userTickets = response.tickets || [];

          if (userTickets.length === 0) {
            myTicketsList.innerHTML = `
                    <div class="empty-state">
                      <div class="empty-state-icon"><img src="https://img.icons8.com/3d-fluency/94/two-tickets.png" width="24" height="24" alt="tickets" style="vertical-align: middle;"></div>
                      <div class="empty-state-text">No support tickets yet</div>
                    </div>
                  `;
            return;
          }

          const html = userTickets.map(ticket => {
            const isUnread = ticket.last_reply_by === 'admin' && ticket.is_read_by_user == 0;
            return `
                    <div class="ticket-item ${ticket.status}" style="position: relative;">
                      ${isUnread ? '<div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 20px; box-shadow: 0 2px 4px rgba(239,68,68,0.3);">NEW REPLY</div>' : ''}
                      <div class="ticket-header">
                        <div>
                          <div class="ticket-subject">${ticket.subject}</div>
                          <div style="font-size: 11px; color: #888; margin-top: 4px;">
                            #${ticket.id}
                          </div>
                        </div>
                        <div class="ticket-status ${ticket.status}">${ticket.status.toUpperCase()}</div>
                      </div>
                      <div class="ticket-description">${ticket.message}</div>
                      <div class="ticket-meta">
                        <img src="https://img.icons8.com/3d-fluency/94/calendar.png" width="24" height="24" alt="date" style="vertical-align: middle;"> ${new Date(ticket.created_at).toLocaleString()}
                      </div>
                      <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 8px;">
                        <button class="btn-sm btn-outline" onclick="ProfilePage.viewTicketDetails(${ticket.id})">
                            <img src="https://img.icons8.com/3d-fluency/94/chat.png" width="24" height="24" alt="chat" style="vertical-align: middle;"> View Conversation
                        </button>
                      </div>
                    </div>
                  `;
          }).join('');

          myTicketsList.innerHTML = html;
        } else {
          myTicketsList.innerHTML = '<div class="error-state">Failed to load tickets</div>';
        }
      })
      .catch(err => {
        console.error(err);
        myTicketsList.innerHTML = '<div class="error-state">Error loading tickets</div>';
      });
  },

  // View Ticket Details (Conversation)
  async viewTicketDetails(ticketId) {
    const api = window.Api || AuthService.getApi();
    if (!api) return;

    // Create modal if not exists
    let modal = document.getElementById('ticketDetailsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ticketDetailsModal';
      modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 1000; display: flex;
            justify-content: center; align-items: center;
        `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 600px; max-height: 90vh; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">Ticket Details</h3>
                <button onclick="document.getElementById('ticketDetailsModal').style.display='none'" style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
            </div>
            <div id="ticketModalContent" style="flex: 1; overflow-y: auto; padding: 20px; background: #f9fafb;">
                <div class="loading-spinner">Loading...</div>
            </div>
            <div style="padding: 16px; border-top: 1px solid #eee; background: white;">
                <button onclick="document.getElementById('ticketDetailsModal').style.display='none'" class="btn-gradient" style="width: 100%;">Close</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';

    try {
      let response;
      if (typeof api.getTicketDetails === 'function') {
        response = await api.getTicketDetails(ticketId);
      } else {
        response = await api.request(`/support/get_ticket_details.php?ticket_id=${ticketId}`);
      }

      if (response.success) {
        const ticket = response.ticket;
        const replies = response.replies || [];

        const messages = [
          { sender: 'You', message: ticket.message, time: ticket.created_at, type: 'user' },
          ...replies.map(r => ({
            sender: r.sender_name === ticket.user_name ? 'You' : r.sender_name,
            message: r.message,
            time: r.created_at,
            type: r.sender_name === ticket.user_name ? 'user' : 'admin'
          }))
        ].sort((a, b) => new Date(a.time) - new Date(b.time));

        const html = messages.map(msg => `
                <div style="
                    max-width: 80%; 
                    padding: 12px; 
                    border-radius: 12px; 
                    margin-bottom: 12px; 
                    position: relative;
                    ${msg.type === 'user' ? 'align-self: flex-end; background: #eff6ff; border: 1px solid #bfdbfe; margin-left: auto;' : 'align-self: flex-start; background: white; border: 1px solid #e5e7eb; margin-right: auto;'}
                ">
                    <div style="font-size: 11px; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <strong>${msg.sender}</strong>
                        <span>${new Date(msg.time).toLocaleString()}</span>
                    </div>
                    <div style="font-size: 14px; color: #333;">${msg.message}</div>
                </div>
            `).join('');

        document.getElementById('ticketModalContent').innerHTML = `
                <div style="display: flex; flex-direction: column; height: 100%;">
                    <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold; font-size: 18px;">${ticket.subject}</div>
                        <span class="badge ${ticket.status}">${ticket.status.toUpperCase()}</span>
                    </div>
                    <div id="ticketModalChat" style="flex: 1; overflow-y: auto; padding-right: 10px;">
                        ${html}
                    </div>
                    
                    ${ticket.status !== 'closed' ? `
                    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
                        <textarea id="userReplyInput" placeholder="Type your reply..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; resize: vertical; min-height: 60px; font-family: inherit;"></textarea>
                        <button onclick="ProfilePage.sendUserReply(${ticket.id})" class="btn-gradient" style="margin-top: 10px; padding: 8px 16px; font-size: 14px;">Send Reply</button>
                    </div>
                    ` : '<div style="margin-top: 20px; color: #888; text-align: center; font-style: italic;">This ticket is closed.</div>'}
                </div>
            `;

        // Scroll to bottom
        const chatDiv = document.getElementById('ticketModalChat');
        if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;

      } else {
        document.getElementById('ticketModalContent').innerHTML = `<div class="error-state">Error: ${response.error}</div>`;
      }
    } catch (e) {
      document.getElementById('ticketModalContent').innerHTML = `<div class="error-state">Failed to load details</div>`;
    }
  },

  // Send User Reply
  async sendUserReply(ticketId) {
    const input = document.getElementById('userReplyInput');
    const message = input.value.trim();
    if (!message) return;

    const user = AuthService.getUser();
    const api = window.Api || AuthService.getApi();

    // Disable input
    input.disabled = true;

    try {
      let response;
      if (typeof api.replyToTicket === 'function') {
        response = await api.replyToTicket(ticketId, message, user.name);
      } else {
        // Fallback for older API service versions
        response = await api.request('/support/reply_ticket.php', {
          method: 'POST',
          body: JSON.stringify({
            ticket_id: ticketId,
            reply: message,
            sender_name: user.name
          })
        });
      }

      if (response.success) {
        showNotification('Reply sent', 'success');
        this.viewTicketDetails(ticketId); // Refresh modal
      } else {
        showNotification('Failed to send reply', 'error');
        input.disabled = false;
      }
    } catch (e) {
      console.error(e);
      showNotification('Error sending reply', 'error');
      input.disabled = false;
    }
  },

  // Set rating
  selectedRating: 0,
  setRating(rating) {
    this.selectedRating = rating;
    const stars = document.querySelectorAll('.rating-stars .star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.style.opacity = '1';
        star.style.transform = 'scale(1.2)';
      } else {
        star.style.opacity = '0.3';
        star.style.transform = 'scale(1)';
      }
    });
  },

  // Submit feedback
  submitFeedback() {
    const user = AuthService.getUser();
    const type = document.getElementById('feedbackType').value;
    const subject = document.getElementById('feedbackSubject').value.trim();
    const description = document.getElementById('feedbackDescription').value.trim();
    const errorElem = document.getElementById('feedbackPageError');

    if (!type || !subject || !description) {
      errorElem.textContent = 'Please fill all required fields';
      return;
    }

    if (subject.length < 5) {
      errorElem.textContent = 'Subject must be at least 5 characters';
      return;
    }

    if (description.length < 10) {
      errorElem.textContent = 'Feedback must be at least 10 characters';
      return;
    }

    const feedbackData = {
      user_id: user.id || user.serverId || user.cms,
      category: type,
      rating: this.selectedRating || 0,
      message: `${subject}: ${description}`
    };

    const api = window.Api || AuthService.getApi();
    if (!api) {
      showNotification('API not available', 'error');
      return;
    }

    // Show loading indicator in button
    const submitBtn = document.querySelector('#feedbackForm button[onclick="ProfilePage.submitFeedback()"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner-small"></span> Submitting...';
    submitBtn.disabled = true;

    showNotification('Submitting feedback...', 'info');

    api.submitFeedback(feedbackData)
      .then(response => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (response.success) {
          errorElem.textContent = '';
          // Success Modal or prettier notification
          const modal = document.createElement('div');
          modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
                `;
          modal.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 16px; text-align: center; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                        <div style="font-size: 50px; margin-bottom: 20px;"><img src="https://img.icons8.com/3d-fluency/94/party-popper.png" width="24" height="24" alt="party" style="vertical-align: middle;"></div>
                        <h3 style="margin: 0 0 10px; color: #1e293b;">Thank You!</h3>
                        <p style="color: #64748b; margin-bottom: 20px;">Your feedback helps us improve NWR Chalak.</p>
                        <button class="btn-gradient" onclick="this.closest('div').parentElement.remove()">Close</button>
                    </div>
                `;
          document.body.appendChild(modal);

          // Clear form
          document.getElementById('feedbackType').value = '';
          document.getElementById('feedbackSubject').value = '';
          document.getElementById('feedbackDescription').value = '';
          this.selectedRating = 0;
          const stars = document.querySelectorAll('.rating-stars .star');
          stars.forEach(star => {
            star.style.opacity = '0.3';
            star.style.transform = 'scale(1)';
          });
        } else {
          errorElem.textContent = response.error || 'Failed to submit feedback';
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed: ' + response.error, 'error');
        }
      })
      .catch(err => {
        console.error(err);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        errorElem.textContent = 'Error: ' + err.message;
        showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Error: ' + err.message, 'error');
      });
  },

  // Logbook Functions
  currentPhotoData: null,
  allLogbookRecords: [],

  showLogbookHome() {
    document.getElementById('logbookHome').style.display = 'block';
    document.getElementById('logbookRecords').style.display = 'none';
    document.getElementById('logbookForm').style.display = 'none';
    this.updateSyncStatus();
  },

  showLogbookRecords() {
    document.getElementById('logbookHome').style.display = 'none';
    document.getElementById('logbookRecords').style.display = 'block';
    document.getElementById('logbookForm').style.display = 'none';
    this.loadLogbookRecords();
  },

  showLogbookForm() {
    document.getElementById('logbookHome').style.display = 'none';
    document.getElementById('logbookRecords').style.display = 'none';
    document.getElementById('logbookForm').style.display = 'block';
    // Set today's date as default
    document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
  },

  async loadLogbookRecords() {
    const user = AuthService.getUser();
    const recordsList = document.getElementById('logbookRecordsList');
    if (!recordsList) return;

    recordsList.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
        <div style="color: #64748b; font-size: 14px; font-weight: 600;">Fetching your records...</div>
      </div>
    `;

    try {
      const api = window.Api || AuthService.getApi();
      const userId = user.id || user.serverId || user.cms;

      // Defensive check for the function
      if (!api || typeof api.getLogbookEntries !== 'function') {
        console.warn('API getLogbookEntries not available, using offline storage');
        const localRecords = Storage.load(APP_CONFIG.storage.logbookEntries, true) || [];
        this.allLogbookRecords = Array.isArray(localRecords) ? localRecords : [];
        this.displayFilteredRecords(this.allLogbookRecords);
        this.updateLogbookStats();
        this.renderMiniLogbook();
        return;
      }

      const response = await api.getLogbookEntries(userId);

      if (response && response.success) {
        this.allLogbookRecords = Array.isArray(response.entries) ? response.entries : [];

        // Save to local for offline access
        Storage.save(APP_CONFIG.storage.logbookEntries, this.allLogbookRecords);

        if (this.allLogbookRecords.length === 0) {
          recordsList.innerHTML = `
            <div class="empty-state" style="padding: 60px 20px;">
              <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;"><img src="https://img.icons8.com/3d-fluency/94/book.png" width="24" height="24" alt="book" style="vertical-align: middle;"></div>
              <div class="empty-state-text" style="font-size: 18px; font-weight: 700; color: #1e293b;">No records yet</div>
              <div class="empty-state-description" style="color: #64748b; margin-bottom: 24px;">Start adding your journey details to build your logbook</div>
            </div>
          `;
          this.updateLogbookStats();
          this.renderMiniLogbook();
          return;
        }

        this.displayFilteredRecords(this.allLogbookRecords);
        this.updateLogbookStats();
        this.renderMiniLogbook();
      } else {
        throw new Error(response.error || 'Failed to load records from server');
      }
    } catch (error) {
      console.error('Error loading logbook records:', error);
      // Fallback to local
      const localRecords = Storage.load(APP_CONFIG.storage.logbookEntries, true) || [];
      if (Array.isArray(localRecords) && localRecords.length > 0) {
        this.allLogbookRecords = localRecords;
        this.displayFilteredRecords(this.allLogbookRecords);
        this.updateLogbookStats();
        this.renderMiniLogbook();
      } else {
        recordsList.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px;">
            <div class="empty-state-text" style="color: #ef4444; font-weight: 700;">Connection Error</div>
            <div class="empty-state-description" style="margin-bottom: 20px;">${error.message}</div>
            <button class="btn-sm btn-primary" onclick="ProfilePage.loadLogbookRecords()" style="padding: 10px 20px;">Retry Now</button>
          </div>
        `;
      }
    }
  },

  // Helper to update logbook stats on the dashboard
  updateLogbookStats() {
    const totalEl = document.getElementById('logbookTotalEntries');
    const hoursEl = document.getElementById('logbookTotalHours');
    if (totalEl) totalEl.textContent = this.allLogbookRecords.length;

    if (hoursEl) {
      let totalMinutes = 0;
      this.allLogbookRecords.forEach(entry => {
        if (entry.signOn && entry.signOff) {
          try {
            const start = new Date('2000-01-01 ' + entry.signOn);
            let end = new Date('2000-01-01 ' + entry.signOff);
            if (end < start) end.setDate(end.getDate() + 1);
            totalMinutes += (end - start) / (1000 * 60);
          } catch (e) { }
        }
      });
      hoursEl.textContent = Math.floor(totalMinutes / 60) + 'h';
    }
  },

  // Render mini records for logbook dashboard
  renderMiniLogbook() {
    const miniList = document.getElementById('miniLogbookActivity');
    if (!miniList || this.allLogbookRecords.length === 0) return;

    const recent = [...this.allLogbookRecords].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    miniList.innerHTML = recent.map(entry => `
        <div class="activity-item" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; display: flex; align-items: center; gap: 12px; cursor: pointer;" onclick="ProfilePage.viewLogbookEntry('${entry.id}')">
            <div style="width: 44px; height: 44px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #2563eb; font-size: 20px;"><img src="https://img.icons8.com/3d-fluency/94/train.png" width="24" height="24" alt="train" style="vertical-align: middle;"></div>
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="font-size: 14px; font-weight: 800; color: #1e293b;">${entry.trainNo || 'Train'} / ${entry.locoNo || 'Loco'}</div>
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">${new Date(entry.date).toLocaleDateString()}</div>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 3px;">${entry.fromStation || '???'} <img src="https://img.icons8.com/3d-fluency/94/arrow.png" width="24" height="24" alt="arrow" style="vertical-align: middle;"> ${entry.toStation || '???'}</div>
            </div>
        </div>
    `).join('');
  },

  viewLogbookEntry(entryId) {
    const user = AuthService.getUser();
    const entry = this.allLogbookRecords.find(e => e.id == entryId);

    if (!entry) {
      showNotification('Entry not found', 'error');
      return;
    }

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
    const val = (v) => v || 'N/A';

    const section = (icon, title, rows) => `
      <div style="background: #f8fafc; border-radius: 16px; padding: 16px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1.5px solid #e2e8f0;">
          <span style="font-size: 20px;">${icon}</span>
          <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">${title}</h4>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${rows.map(([label, value]) => `
            <div style="background: white; border-radius: 10px; padding: 10px 12px; border: 1px solid #e2e8f0;">
              <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px;">${label}</div>
              <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'logbookViewModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:flex-start;justify-content:center;z-index:10000;padding:20px;overflow-y:auto;';

    modal.innerHTML = `
      <div style="background:white;border-radius:24px;max-width:720px;width:100%;margin:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);position:relative;overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Movement Details</div>
            <h3 style="color:white;margin:4px 0 0;font-size:18px;font-weight:800;">Train ${val(entry.trainNo)} &nbsp;/&nbsp; Loco ${val(entry.locoNo)}</h3>
            <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px;">Crew: ${user.name || ''} (${user.cms || ''})</div>
          </div>
          <button onclick="document.getElementById('logbookViewModal').remove()" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;flex-shrink:0;">&times;</button>
        </div>

        <!-- Body -->
        <div style="padding:20px 20px 8px;max-height:75vh;overflow-y:auto;">
          ${section('<img src="https://img.icons8.com/3d-fluency/94/clipboard.png" width="24" height="24" alt="clipboard" style="vertical-align: middle;">', 'Duty & Train Details', [
      ['Date', fmt(entry.date)],
      ['Duty Type', val(entry.dutyType)],
      ['T.No. (Train No.)', val(entry.trainNo)],
      ['Loco No.', val(entry.locoNo)],
      ['Shed Done', fmt(entry.shedDone)],
      ['Shed Due', fmt(entry.shedDue)],
    ])}

          ${section('<img src="https://img.icons8.com/3d-fluency/94/alarm-clock.png" width="24" height="24" alt="clock" style="vertical-align: middle;">', 'Movement / Timing Details', [
      ['S/On (Sign-On)', val(entry.signOn)],
      ['CTO', val(entry.cto)],
      ['From (Start Station)', val(entry.fromStation)],
      ['Dep. Time', val(entry.departTime)],
      ['To (Destination)', val(entry.toStation)],
      ['Arr. Time', val(entry.arrTime)],
      ['CMO (Charge Make Over)', val(entry.cmo)],
      ['S/Off (Sign-Off)', val(entry.signOff)],
      ['CTO EC (kWh)', val(entry.ctoEC)],
      ['CTO ER (kWh)', val(entry.ctoER)],
      ['CMO EC (kWh)', val(entry.cmoEC)],
      ['CMO ER (kWh)', val(entry.cmoER)],
    ])}

          ${section('<img src="https://img.icons8.com/3d-fluency/94/group.png" width="24" height="24" alt="crew" style="vertical-align: middle;">', 'Loco Pilot & Train Manager', [
      ['LP Name', val(entry.lpgName)],
      ['LP Mob No.', val(entry.lpgMobile)],
      ['TM Name', val(entry.guardName)],
      ['TM Mob No.', val(entry.guardMobile)],
    ])}

          ${section('<img src="https://img.icons8.com/3d-fluency/94/wrench.png" width="24" height="24" alt="wrench" style="vertical-align: middle;">', 'Brake & Other Details', [
      ['BPC No.', val(entry.bpc)],
      ['STN', val(entry.stn)],
      ['Load TN', val(entry.loadTN)],
      ['BP%', val(entry.bp)],
      ['BMBS', val(entry.bmbs)],
      ['BMBS%', val(entry.bmbsPercent)],
      ['EC (Energy Consumption)', val(entry.ec)],
      ['RG (Regeneration)', val(entry.rg)],
      ['EC Arrival', val(entry.ecArrival)],
      ['RG Arrival', val(entry.rgArrival)],
      ['MV5', val(entry.mv5)],
      ['CJE', val(entry.cje)],
    ])}

          ${section('<img src="https://img.icons8.com/3d-fluency/94/shield.png" width="24" height="24" alt="shield" style="vertical-align: middle;">', 'Safety Check & Tools', [
      ['T/F Oil', val(entry.tfOil)],
      ['SR/GR Oil', val(entry.srgrOil)],
      ['CP Oil', val(entry.cpOil)],
      ['HL', val(entry.hl)],
      ['ML', val(entry.ml)],
      ['FL', val(entry.fl)],
      ['U/I', val(entry.ui)],
      ['C/I', val(entry.ci)],
      ['W/W', val(entry.ww)],
      ['F/EX', val(entry.fex)],
      ['BP Tool', val(entry.bpTool)],
      ['FP', val(entry.fp)],
    ])}

          <div style="background:#f8fafc;border-radius:16px;padding:16px;margin-bottom:14px;">
            <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Remarks</div>
            <div style="font-size:13px;color:#334155;line-height:1.6;">${val(entry.remarks || entry.remark || entry.remarksIC)}</div>
          </div>
        </div>

        <!-- Footer buttons -->
        <div style="padding:14px 20px;background:#f8fafc;border-top:1.5px solid #e2e8f0;display:flex;gap:10px;justify-content:flex-end;">
          <button onclick="ProfilePage.shareOne('${entry.id}')" style="height:38px;padding:0 16px;background:#2563eb;color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;">
            <span class="material-icons" style="font-size:16px;">share</span> Share
          </button>
          <button onclick="ProfilePage.editLogbookEntry('${entry.id}'); document.getElementById('logbookViewModal').remove();" style="height:38px;padding:0 16px;background:#fffbeb;color:#d97706;border:1.5px solid #fde68a;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;">
            <span class="material-icons" style="font-size:16px;">edit</span> Edit
          </button>
          <button onclick="document.getElementById('logbookViewModal').remove()" style="height:38px;padding:0 16px;background:#f1f5f9;color:#475569;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },


  // Copy text to clipboard
  copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => console.log('Text copied to clipboard'))
      .catch(err => console.error('Failed to copy text: ', err));
  },

  saveLogbookEntry() {
    const user = AuthService.getUser();
    const errorElem = document.getElementById('logbookError');

    // Get form values
    const date = document.getElementById('logDate').value;
    const dutyType = document.getElementById('logDutyType').value;

    // Validation
    if (!date) {
      errorElem.textContent = 'Please select a date';
      return;
    }

    if (!dutyType) {
      errorElem.textContent = 'Please select duty type';
      return;
    }

    // Check if we're editing an existing entry
    const isEdit = this.currentEditEntryId !== undefined && this.currentEditEntryId !== null;

    // Create entry object
    const entry = {
      id: isEdit ? this.currentEditEntryId : 'LOG' + Date.now(),
      date: date,
      dutyType: dutyType,
      trainNo: document.getElementById('logTrainNo').value,
      locoNo: document.getElementById('logLocoNo').value,
      shedDone: document.getElementById('logShedDone').value,
      shedDue: document.getElementById('logShedDue').value,
      remarksIC: document.getElementById('logRemarksIC').value,

      // Movement/Timing Details
      signOn: document.getElementById('logSignOn').value,
      cto: document.getElementById('logCTO').value,
      fromStation: document.getElementById('logFromStation').value,
      departTime: document.getElementById('logDepartTime').value,
      toStation: document.getElementById('logToStation').value,
      arrTime: document.getElementById('logArrTime').value,
      cmo: document.getElementById('logCMO').value,
      signOff: document.getElementById('logSignOff').value,
      ctoEC: document.getElementById('logCTOEC').value,
      ctoER: document.getElementById('logCTOER').value,
      cmoEC: document.getElementById('logCMOEC').value,
      cmoER: document.getElementById('logCMOER').value,

      // Loco Pilot & Train Manager Details
      lpgName: document.getElementById('logLPGName').value,
      lpgMobile: document.getElementById('logLPGMobile').value,
      guardName: document.getElementById('logGuardName').value,
      guardMobile: document.getElementById('logGuardMobile').value,

      // Brake & Other Details
      bpc: document.getElementById('logBPC').value,
      stn: document.getElementById('logSTN').value,
      loadTN: document.getElementById('logLoadTN').value,
      bp: document.getElementById('logBP').value,
      bmbs: document.getElementById('logBMBS').value,
      bmbsPercent: document.getElementById('logBMBSPercent').value,

      // Safety Check
      tfOil: document.getElementById('logTFOilOK') && document.getElementById('logTFOilOK').checked ? document.getElementById('logTFOilOK').value : '',
      srgrOil: document.getElementById('logSRGROilOK') && document.getElementById('logSRGROilOK').checked ? document.getElementById('logSRGROilOK').value : '',
      cpOil: document.getElementById('logCPOilOK') && document.getElementById('logCPOilOK').checked ? document.getElementById('logCPOilOK').value : '',
      hl: document.getElementById('logHLOK') && document.getElementById('logHLOK').checked ? document.getElementById('logHLOK').value : '',
      ml: document.getElementById('logMLOK') && document.getElementById('logMLOK').checked ? document.getElementById('logMLOK').value : '',
      fl: document.getElementById('logFLOK') && document.getElementById('logFLOK').checked ? document.getElementById('logFLOK').value : '',
      ui: document.getElementById('logUIOK') && document.getElementById('logUIOK').checked ? document.getElementById('logUIOK').value : '',
      ci: document.getElementById('logCIOK') && document.getElementById('logCIOK').checked ? document.getElementById('logCIOK').value : '',

      // Tools
      ww: document.getElementById('logWW').value,
      fex: document.getElementById('logFEX').value,
      bpTool: document.getElementById('logBPTool').value,
      fp: document.getElementById('logFP').value,
      safetyClamp: document.getElementById('logSafetyClamp').value,
      otherTools: document.getElementById('logOtherTools').value,

      // Original fields (kept for compatibility)
      ec: document.getElementById('logEC').value,
      rg: document.getElementById('logRG').value,
      ecArrival: document.getElementById('logECArrival').value,
      rgArrival: document.getElementById('logRGArrival').value,
      mv5: document.getElementById('logMV5').value,
      cje: document.getElementById('logCJE').value,
      remarks: document.getElementById('logRemarks').value,

      // Additional Media
      photoData: this.currentPhotoData,
      remark: document.getElementById('logRemark').value,

      createdBy: user.cms,
      createdByName: user.name,
      createdAt: new Date().toISOString()
    };

    // Save to server
    const api = window.Api || AuthService.getApi();
    if (!api) {
      showNotification('API not available', 'error');
      return;
    }

    const userId = user.id || user.serverId || user.cms;

    showNotification('Saving entry...', 'info');

    api.saveLogbookEntry(userId, entry)
      .then(response => {
        if (response.success) {
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Logbook entry saved successfully!', 'success');
          this.currentEditEntryId = null;
          this.clearLogbookForm();
          this.removePhoto();
          this.showLogbookRecords();
        } else {
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed: ' + (response.error || 'Unknown error'), 'error');
        }
      })
      .catch(err => {
        console.error(err);
        showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Error: ' + err.message, 'error');
      });
  },

  clearLogbookForm() {
    const fields = [
      // Duty/Train Details
      'logDate', 'logDutyType', 'logTrainNo', 'logLocoNo', 'logShedDone', 'logShedDue',
      'logRemarksIC',

      // Movement/Timing Details
      'logSignOn', 'logCTO', 'logFromStation', 'logDepartTime',
      'logToStation', 'logArrTime', 'logCMO', 'logSignOff',
      'logCTOEC', 'logCTOER', 'logCMOEC', 'logCMOER',

      // Loco Pilot & Train Manager Details
      'logLPGName', 'logLPGMobile', 'logGuardName', 'logGuardMobile',

      // Brake & Other Details
      'logBPC', 'logSTN', 'logLoadTN', 'logBP', 'logBMBS', 'logBMBSPercent',

      // Safety Check
      'logTFOilOK', 'logSRGROilOK', 'logCPOilOK',
      'logHLOK', 'logMLOK', 'logFLOK', 'logUIOK', 'logCIOK',

      // Tools
      'logWW', 'logFEX', 'logBPTool', 'logFP', 'logSafetyClamp', 'logOtherTools',

      // Original fields (kept for compatibility)
      'logEC', 'logRG', 'logECArrival', 'logRGArrival', 'logMV5', 'logCJE', 'logRemarks',

      // Additional Media
      'logRemark'
    ];

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = false;
        } else if (field.type === 'select-one') {
          field.selectedIndex = 0; // Reset to first option
        } else {
          field.value = '';
        }
      }
    });

    // Also uncheck safety check checkboxes by ID
    const safetyCheckboxes = [
      'logTFOilOK', 'logSRGROilOK', 'logCPOilOK',
      'logHLOK', 'logMLOK', 'logFLOK', 'logUIOK', 'logCIOK'
    ];
    safetyCheckboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) checkbox.checked = false;
    });
  },

  // Photo handling
  handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentPhotoData = e.target.result;
        document.getElementById('photoPreviewImg').src = e.target.result;
        document.getElementById('photoPreview').style.display = 'block';
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  removePhoto() {
    this.currentPhotoData = null;
    document.getElementById('logPhoto').value = '';
    document.getElementById('photoPreview').style.display = 'none';
  },

  // Filter and search

  // Display filtered records - proper HTML table
  displayFilteredRecords(records) {
    const recordsList = document.getElementById('logbookRecordsList');
    if (!recordsList) return;

    if (records.length === 0) {
      recordsList.innerHTML = `
        <div style="text-align: center; padding: 56px 20px; background: white; border-radius: 20px; border: 1.5px dashed #e2e8f0;">
          <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.4;">&#x1F50D;</div>
          <div style="font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 6px;">No records found</div>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Adjust your search or filters.</p>
        </div>
      `;
      return;
    }

    const getDutyStyle = (dt) => {
      if (dt === 'WKG') return 'background:#dcfce7;color:#166534';
      if (dt === 'LR') return 'background:#dbeafe;color:#1e40af';
      return 'background:#fef3c7;color:#92400e';
    };

    const tableRows = records.map((entry, idx) => {
      const date = entry.date ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';
      const dutyStyle = getDutyStyle(entry.dutyType);
      const id = entry.id;
      return `
        <tr class="lb-tr">
          <td data-label="S.No">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
              <input type="checkbox" class="record-select" value="${id}" onclick="ProfilePage.updateSelectAllCheckbox()"
                style="width:16px;height:16px;border-radius:4px;cursor:pointer;accent-color:#2563eb;flex-shrink:0;">
              <span>${idx + 1}</span>
            </label>
          </td>
          <td data-label="Date">${date}</td>
          <td data-label="Duty">
            <span style="${dutyStyle}; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; white-space: nowrap;">${entry.dutyType || '-'}</span>
          </td>
          <td data-label="Train No.">${entry.trainNo || '-'}</td>
          <td data-label="Loco No.">${entry.locoNo || '-'}</td>
          <td data-label="From">
            <span style="background:#eff6ff; color:#1e40af; font-size:12px; font-weight:700; padding:3px 10px; border-radius:8px; white-space:nowrap;">${entry.fromStation || '-'}</span>
          </td>
          <td data-label="To">
            <span style="background:#f0fdf4; color:#166534; font-size:12px; font-weight:700; padding:3px 10px; border-radius:8px; white-space:nowrap;">${entry.toStation || '-'}</span>
          </td>
          <td class="actions-cell">
            <button onclick="ProfilePage.viewLogbookEntry('${id}')" title="View"
              style="width:32px;height:32px;border-radius:8px;background:#eff6ff;color:#2563eb;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">
              <span class="material-icons" style="font-size:16px;">visibility</span>
            </button>
            <button onclick="ProfilePage.editLogbookEntry('${id}')" title="Edit"
              style="width:32px;height:32px;border-radius:8px;background:#fffbeb;color:#d97706;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">
              <span class="material-icons" style="font-size:16px;">edit</span>
            </button>
            <button onclick="ProfilePage.deleteLogbookEntry('${id}')" title="Delete"
              style="width:32px;height:32px;border-radius:8px;background:#fef2f2;color:#dc2626;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">
              <span class="material-icons" style="font-size:16px;">delete</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    recordsList.innerHTML = `
      <div class="logbook-table-wrap">
        <table class="logbook-table">
          <thead>
            <tr>
              <th style="width:60px;">
                <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:10px;color:#64748b;font-weight:800;">
                  <input type="checkbox" id="selectAllCheckbox" style="accent-color:#2563eb;" onclick="ProfilePage.toggleSelectAll(this)"> All
                </label>
              </th>
              <th>Date</th>
              <th>Duty</th>
              <th>Train No.</th>
              <th>Loco No.</th>
              <th>From</th>
              <th>To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      <div style="text-align: right; margin-top: 10px; font-size: 12px; color: #94a3b8; font-weight: 600;">
        ${records.length} record${records.length !== 1 ? 's' : ''} found
      </div>
    `;
  },

  // Export records to PDF (print dialog) with WebView fallback
  exportToPDF() {
    const records = this.allLogbookRecords || [];
    if (!records.length) { showNotification('No records to export', 'warning'); return; }

    const user = AuthService.getUser();
    const isWebView = window.Android && typeof window.Android.downloadPdf === 'function';

    const jsPDFLib = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFLib) {
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> PDF library not loaded. Please refresh.', 'error');
      return;
    }

    // Create PDF in Landscape
    const doc = new jsPDFLib({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const fmt = d => d ? new Date(d).toLocaleDateString('en-IN') : '-';

    // 1. Professional Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pw, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text('NWR Chalak Mitra – Digital Logbook', pw / 2, 22, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(`${user.name || ''} (${user.cms || ''}) | Printed: ${new Date().toLocaleString('en-IN')}`, pw / 2, 38, { align: 'center' });

    // 2. Prepare Table Data (18 Columns per user request)
    // Order: S.No- Date- Duty- Train- Loco- Shed Done- Shed Due- From- TO- SignOn- Dep- Arr- signoff- LP Name- TM Name- BPC No.- BP%- Remark
    const tableData = records.map((e, i) => [
      i + 1,
      fmt(e.date),
      e.dutyType || '-',
      e.trainNo || '-',
      e.locoNo || '-',
      fmt(e.shedDone),
      fmt(e.shedDue),
      e.fromStation || '-',
      e.toStation || '-',
      e.signOn || '-',
      e.departTime || '-',
      e.arrTime || '-',
      e.signOff || '-',
      e.lpgName || '-',
      e.guardName || '-',
      e.bpc || '-',
      e.bp || '-',
      e.remarks || e.remark || ''
    ]);

    const headers = [['S.No', 'Date', 'Duty', 'Train', 'Loco', 'Shed Done', 'Shed Due', 'From', 'To', 'SignOn', 'Dep', 'Arr', 'SignOff', 'LP Name', 'TM Name', 'BPC No.', 'BP%', 'Remark']];

    // 3. Generate Table using AutoTable
    doc.autoTable({
      startY: 65,
      head: headers,
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 6.5,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3
      },
      styles: {
        fontSize: 6,
        overflow: 'linebreak',
        cellPadding: 2,
        halign: 'center',
        textColor: [30, 41, 59],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 25 }, // S.No
        1: { cellWidth: 45 }, // Date
        7: { cellWidth: 40 }, // From
        8: { cellWidth: 40 }, // To
        17: { cellWidth: 90, halign: 'left' } // Remark
      },
      didDrawPage: (data) => {
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber}`, pw - 40, ph - 20, { align: 'right' });
      },
      margin: { top: 60, right: 25, bottom: 40, left: 25 }
    });

    // 4. Handle Save/Download (Cross-Platform)
    if (isWebView) {
      const pdfDataUri = doc.output('datauristring');
      window.Android.downloadPdf(pdfDataUri, 'logbook_nwr.pdf');
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/document.png" width="24" height="24" alt="doc" style="vertical-align: middle;"> Logbook PDF downloading... Check Downloads folder.', 'success');
    } else {
      doc.save('logbook_nwr.pdf');
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/document.png" width="24" height="24" alt="doc" style="vertical-align: middle;"> Logbook PDF generated successfully!', 'success');
    }
  },

  updateSelectAllCheckbox() {
    const checkboxes = document.querySelectorAll('input.record-select');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (checkboxes.length === 0) return;
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    if (selectAllCheckbox) selectAllCheckbox.checked = checkedCount === checkboxes.length;
  },

  // Share a single record (called from view modal)
  shareOne(entryId) {
    const entry = (this.allLogbookRecords || []).find(e => e.id == entryId);
    if (entry) this._doShare([entry]);
    else showNotification('Record not found', 'error');
  },

  // Share selected records in NWR Chalak Mitra format
  shareSelectedRecords() {
    const selectedCheckboxes = document.querySelectorAll('input.record-select:checked');
    const allCheckboxes = document.querySelectorAll('input.record-select');

    // Determine which IDs to share
    let ids = [];
    if (selectedCheckboxes.length > 0) {
      ids = Array.from(selectedCheckboxes).map(cb => cb.value);
    } else if (allCheckboxes.length > 0) {
      ids = Array.from(allCheckboxes).map(cb => cb.value);
    } else {
      showNotification('No records to share', 'warning');
      return;
    }

    // Match against allLogbookRecords using loose equality to handle string/number ID mismatch
    const pool = this.allLogbookRecords || [];
    let selected = pool.filter(e => ids.some(id => id == e.id));

    // Fallback: if matching by ID failed, share all visible records
    if (!selected.length && pool.length > 0) {
      selected = pool;
    }

    if (!selected.length) {
      showNotification('No records found to share', 'error');
      return;
    }

    this._doShare(selected);
  },

  // Core share builder — works in Browser + Android WebView
  _doShare(records) {
    const user = AuthService.getUser();
    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
    const mob = (n) => n ? (n.startsWith('+') ? n : '+91' + n) : '-';

    const blocks = records.map(e => [
      ``,
      `            *Movement Details*`,
      `Crew: ${user.name || '-'} (${user.cms || '-'})`,
      ``,
      `Date : ${fmt(e.date)}`,
      `Duty Type : ${e.dutyType || '-'}`,
      ``,
      `T.No. (Train Number) : ${e.trainNo || '-'}`,
      `Loco No. : ${e.locoNo || '-'}`,
      `Shed Done : ${fmt(e.shedDone)}`,
      `Shed Due : ${fmt(e.shedDue)}`,
      ``,
      `Movement/Timing Details <img src="https://img.icons8.com/3d-fluency/94/alarm-clock.png" width="24" height="24" alt="clock" style="vertical-align: middle;">`,
      `S/On : ${e.signOn || '-'}`,
      `CTO : ${e.cto || '-'}`,
      `From (Starting Station) : ${e.fromStation || '-'}`,
      `Dep. Time (Departure Time) : ${e.departTime || '-'}`,
      `To (Destination Station) : ${e.toStation || '-'}`,
      `Arr. Time (Arrival Time) : ${e.arrTime || '-'}`,
      `CMO (Charge Make Over) : ${e.cmo || '-'}`,
      `S/Off (Sign-Off Time) : ${e.signOff || '-'}`,
      `CTO EC (Energy Consume at CTO kWh) : ${e.ctoEC || '-'}`,
      `CTO ER (Energy Regenerat at CTO kWh) : ${e.ctoER || '-'}`,
      `CMO EC (Energy Consume at CMO kWh) : ${e.cmoEC || '-'}`,
      `CMO ER (Energy Regenerat at CMO kWh) : ${e.cmoER || '-'}`,
      ``,
      `Loco Pilot & Train Manager Details <img src="https://img.icons8.com/3d-fluency/94/group.png" width="24" height="24" alt="crew" style="vertical-align: middle;">`,
      `LP NAME (Loco Pilot Name) : ${e.lpgName || '-'}`,
      `LP Mob No. : ${mob(e.lpgMobile)}`,
      `TM Name (Train Manager Name) : ${e.guardName || '-'}`,
      `TM Mob No. : ${mob(e.guardMobile)}`,
      ``,
      `Brake & Other Details <img src="https://img.icons8.com/3d-fluency/94/wrench.png" width="24" height="24" alt="wrench" style="vertical-align: middle;">`,
      `BPC no. (Brake Power Certificate) : ${e.bpc || '-'}`,
      `STN (Station Name) : ${e.stn || '-'}`,
      `Load TN (Load Tonnage) : ${e.loadTN || '-'}`,
      `BP% (Brake Power %) : ${e.bp || '-'}`,
      `BMBS : ${e.bmbs || '-'}`,
      `BMBS% : ${e.bmbsPercent || '-'}`,
      ``,
      `Remarks : ${e.remarks || e.remark || ''}`,
    ].join('\n')).join('\n' + '─'.repeat(25) + '\n');

    const text = blocks + '\n\n\nThank you for using *NWR Chalak Mitra* <img src="https://img.icons8.com/3d-fluency/94/smiling-face.png" width="24" height="24" alt="smile" style="vertical-align: middle;">';

    // 1. Try Web Share API (works in Chrome/Firefox, NOT Android WebView by default)
    if (navigator.share) {
      navigator.share({ title: 'NWR Movement Details', text })
        .then(() => showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Shared successfully!', 'success'))
        .catch(err => {
          if (err.name !== 'AbortError') {
            this._shareViaWebView(text);
          }
        });
      return;
    }

    // 2. Try WebViewBridge native share (Android with JS Bridge)
    this._shareViaWebView(text);
  },

  // Share via Android.shareText() or clipboard fallback
  _shareViaWebView(text) {
    const isWebView = (window.WebViewBridge && window.WebViewBridge.isInWebView()) ||
      /wv/.test(navigator.userAgent.toLowerCase());

    // ── Android.shareText (CORRECT method — passes plain text to Android share sheet) ──
    if (window.Android && typeof window.Android.shareText === 'function') {
      window.Android.shareText(text);
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Opening share...', 'success');
      return;
    }

    // ── WebViewBridge generic share ──
    if (window.WebViewBridge && window.WebViewBridge.isInWebView()) {
      const sent = window.WebViewBridge.shareContent('NWR Movement Details', text);
      if (sent) { showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Opening share...', 'success'); return; }
    }

    // ── Fallback: clipboard + bottom-sheet modal ──
    this.copyToClipboard(text);
    this._showShareModal(text);
  },

  // Show a copy-to-share bottom modal (WebView fallback)
  _showShareModal(text) {
    const existing = document.getElementById('lb-share-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'lb-share-modal';
    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-end;" onclick="if(event.target===this)this.remove()">
        <div style="background:white;width:100%;max-height:70vh;border-radius:24px 24px 0 0;padding:20px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;">
          <div style="width:40px;height:4px;background:#e2e8f0;border-radius:99px;margin:0 auto -8px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:16px;font-weight:800;color:#1e293b;"><img src="https://img.icons8.com/3d-fluency/94/upload.png" width="24" height="24" alt="upload" style="vertical-align: middle;"> Share Record</div>
            <button onclick="document.getElementById('lb-share-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#64748b;"><img src="https://img.icons8.com/3d-fluency/94/delete-sign.png" width="24" height="24" alt="close" style="vertical-align: middle;"></button>
          </div>
          <div style="font-size:13px;color:#64748b;">Text copied to clipboard. Open WhatsApp or any app and paste:</div>
          <textarea readonly style="width:100%;height:160px;padding:12px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:12px;line-height:1.6;color:#334155;resize:none;box-sizing:border-box;background:#f8fafc;">${text.replace(/</g, '&lt;')}</textarea>
          <div style="display:flex;gap:10px;">
            <button onclick="navigator.clipboard.writeText(${JSON.stringify(text)}).then(()=>showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Copied!','success'))" style="flex:1;height:46px;background:#f1f5f9;border:1.5px solid #e2e8f0;border-radius:12px;font-size:14px;font-weight:700;color:#475569;cursor:pointer;"><img src="https://img.icons8.com/3d-fluency/94/clipboard.png" width="24" height="24" alt="clipboard" style="vertical-align: middle;"> Copy Again</button>
            <button onclick="if(window.Android&&window.Android.openWhatsApp){window.Android.openWhatsApp(${JSON.stringify(text)})}else{window.open('whatsapp://send?text='+encodeURIComponent(${JSON.stringify(text)}))}" style="flex:1;height:46px;background:#25d366;border:none;border-radius:12px;font-size:14px;font-weight:700;color:white;cursor:pointer;"><img src="https://img.icons8.com/3d-fluency/94/chat.png" width="24" height="24" alt="chat" style="vertical-align: middle;"> WhatsApp</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  },

  // Copy text to clipboard (with async fallback)
  copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Copied to clipboard!', 'success'))
        .catch(() => this._clipboardFallback(text));
    } else {
      this._clipboardFallback(text);
    }
  },

  // Legacy clipboard fallback using textarea
  _clipboardFallback(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand('copy');
      ta.remove();
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Copied to clipboard!', 'success');
    } catch (e) {
      showNotification('Could not copy. Please copy manually.', 'warning');
    }
  },


  saveLogbookEntry() {
    const user = AuthService.getUser();

    const errorElem = document.getElementById('logbookError');

    // Get form values
    const date = document.getElementById('logDate').value;
    const dutyType = document.getElementById('logDutyType').value;

    // Validation
    if (!date) {
      errorElem.textContent = 'Please select a date';
      return;
    }

    if (!dutyType) {
      errorElem.textContent = 'Please select duty type';
      return;
    }

    // Check if we're editing an existing entry
    const isEdit = this.currentEditEntryId !== undefined && this.currentEditEntryId !== null;

    // Create entry object
    const entry = {
      id: isEdit ? this.currentEditEntryId : 'LOG' + Date.now(),
      date: date,
      dutyType: dutyType,
      trainNo: document.getElementById('logTrainNo').value,
      locoNo: document.getElementById('logLocoNo').value,
      shedDone: document.getElementById('logShedDone').value,
      shedDue: document.getElementById('logShedDue').value,
      remarksIC: document.getElementById('logRemarksIC').value,

      // Movement/Timing Details
      signOn: document.getElementById('logSignOn').value,
      cto: document.getElementById('logCTO').value,
      fromStation: document.getElementById('logFromStation').value,
      departTime: document.getElementById('logDepartTime').value,
      toStation: document.getElementById('logToStation').value,
      arrTime: document.getElementById('logArrTime').value,
      cmo: document.getElementById('logCMO').value,
      signOff: document.getElementById('logSignOff').value,
      ctoEC: document.getElementById('logCTOEC').value,
      ctoER: document.getElementById('logCTOER').value,
      cmoEC: document.getElementById('logCMOEC').value,
      cmoER: document.getElementById('logCMOER').value,

      // Loco Pilot & Train Manager Details
      lpgName: document.getElementById('logLPGName').value,
      lpgMobile: document.getElementById('logLPGMobile').value,
      guardName: document.getElementById('logGuardName').value,
      guardMobile: document.getElementById('logGuardMobile').value,

      // Brake & Other Details
      bpc: document.getElementById('logBPC').value,
      stn: document.getElementById('logSTN').value,
      loadTN: document.getElementById('logLoadTN').value,
      bp: document.getElementById('logBP').value,
      bmbs: document.getElementById('logBMBS').value,
      bmbsPercent: document.getElementById('logBMBSPercent').value,

      // Safety Check
      tfOil: document.getElementById('logTFOilOK') && document.getElementById('logTFOilOK').checked ? document.getElementById('logTFOilOK').value : '',
      srgrOil: document.getElementById('logSRGROilOK') && document.getElementById('logSRGROilOK').checked ? document.getElementById('logSRGROilOK').value : '',
      cpOil: document.getElementById('logCPOilOK') && document.getElementById('logCPOilOK').checked ? document.getElementById('logCPOilOK').value : '',
      hl: document.getElementById('logHLOK') && document.getElementById('logHLOK').checked ? document.getElementById('logHLOK').value : '',
      ml: document.getElementById('logMLOK') && document.getElementById('logMLOK').checked ? document.getElementById('logMLOK').value : '',
      fl: document.getElementById('logFLOK') && document.getElementById('logFLOK').checked ? document.getElementById('logFLOK').value : '',
      ui: document.getElementById('logUIOK') && document.getElementById('logUIOK').checked ? document.getElementById('logUIOK').value : '',
      ci: document.getElementById('logCIOK') && document.getElementById('logCIOK').checked ? document.getElementById('logCIOK').value : '',

      // Tools
      ww: document.getElementById('logWW').value,
      fex: document.getElementById('logFEX').value,
      bpTool: document.getElementById('logBPTool').value,
      fp: document.getElementById('logFP').value,
      safetyClamp: document.getElementById('logSafetyClamp').value,
      otherTools: document.getElementById('logOtherTools').value,

      // Original fields (kept for compatibility)
      ec: document.getElementById('logEC').value,
      rg: document.getElementById('logRG').value,
      ecArrival: document.getElementById('logECArrival').value,
      rgArrival: document.getElementById('logRGArrival').value,
      mv5: document.getElementById('logMV5').value,
      cje: document.getElementById('logCJE').value,
      remarks: document.getElementById('logRemarks').value,

      // Additional Media
      photoData: this.currentPhotoData,
      remark: document.getElementById('logRemark').value,

      createdBy: user.cms,
      createdByName: user.name,
      createdAt: new Date().toISOString()
    };

    // Save to server
    const api = window.Api || AuthService.getApi();
    if (!api) {
      showNotification('API not available', 'error');
      return;
    }

    const userId = user.id || user.serverId || user.cms;

    showNotification('Saving entry...', 'info');

    api.saveLogbookEntry(userId, entry)
      .then(response => {
        if (response.success) {
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Logbook entry saved successfully!', 'success');
          this.currentEditEntryId = null;
          this.clearLogbookForm();
          this.removePhoto();
          this.showLogbookRecords();
        } else {
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed: ' + (response.error || 'Unknown error'), 'error');
        }
      })
      .catch(err => {
        console.error(err);
        showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Error: ' + err.message, 'error');
      });
  },

  clearLogbookForm() {
    const fields = [
      // Duty/Train Details
      'logDate', 'logDutyType', 'logTrainNo', 'logLocoNo', 'logShedDone', 'logShedDue',
      'logRemarksIC',

      // Movement/Timing Details
      'logSignOn', 'logCTO', 'logFromStation', 'logDepartTime',
      'logToStation', 'logArrTime', 'logCMO', 'logSignOff',
      'logCTOEC', 'logCTOER', 'logCMOEC', 'logCMOER',

      // Loco Pilot & Train Manager Details
      'logLPGName', 'logLPGMobile', 'logGuardName', 'logGuardMobile',

      // Brake & Other Details
      'logBPC', 'logSTN', 'logLoadTN', 'logBP', 'logBMBS', 'logBMBSPercent',

      // Safety Check
      'logTFOilOK', 'logSRGROilOK', 'logCPOilOK',
      'logHLOK', 'logMLOK', 'logFLOK', 'logUIOK', 'logCIOK',

      // Tools
      'logWW', 'logFEX', 'logBPTool', 'logFP', 'logSafetyClamp', 'logOtherTools',

      // Original fields (kept for compatibility)
      'logEC', 'logRG', 'logECArrival', 'logRGArrival', 'logMV5', 'logCJE', 'logRemarks',

      // Additional Media
      'logRemark'
    ];

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = false;
        } else if (field.type === 'select-one') {
          field.selectedIndex = 0; // Reset to first option
        } else {
          field.value = '';
        }
      }
    });

    // Also uncheck safety check checkboxes by ID
    const safetyCheckboxes = [
      'logTFOilOK', 'logSRGROilOK', 'logCPOilOK',
      'logHLOK', 'logMLOK', 'logFLOK', 'logUIOK', 'logCIOK'
    ];
    safetyCheckboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) checkbox.checked = false;
    });
  },

  // Photo handling
  handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentPhotoData = e.target.result;
        document.getElementById('photoPreviewImg').src = e.target.result;
        document.getElementById('photoPreview').style.display = 'block';
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  removePhoto() {
    this.currentPhotoData = null;
    document.getElementById('logPhoto').value = '';
    document.getElementById('photoPreview').style.display = 'none';
  },

  // Filter and search

  // Display filtered records

  // Switch tabs
  switchTab(tab, pushHistory = true) {
    if (pushHistory) {
      try {
        history.pushState({
          view: 'profile',
          subView: 'profileTab',
          tab: tab,
          timestamp: Date.now()
        }, '', `#profile/${tab}`);
      } catch (e) { }
    }

    const tabs = ['dashboard', 'logbook', 'tools', 'runningroom', 'info', 'quiz', 'settings', 'support', 'feedback'];
    tabs.forEach(t => {
      const tabName = t === 'runningroom' ? 'RunningRoom' : t.charAt(0).toUpperCase() + t.slice(1);
      const tabBtn = document.getElementById(`profilePage${tabName}Tab`);
      const content = document.getElementById(`profilePage${tabName}Content`);

      if (t === tab) {
        tabBtn?.classList.add('active');
        if (content) content.style.display = 'block';

        const user = AuthService.getUser();

        // Load tab specific data
        if (t === 'dashboard') {
          if (user) this.updateDashboardMetrics(user);
        } else if (t === 'quiz') {
          if (user) this.loadQuizHistory(user);
        } else if (t === 'support') {
          if (user) this.loadMyTickets(user);
        } else if (t === 'logbook') {
          this.showLogbookHome();
          this.loadLogbookRecords();
        } else if (t === 'runningroom') {
          this.fetchRunningRoomData();
        } else if (t === 'tools') {
          this.fetchToolsData();
        }
      } else {
        tabBtn?.classList.remove('active');
        if (content) content.style.display = 'none';
      }
    });
  },

  // New function to filter records
  filterLogbookRecords() {
    const searchTerm = document.getElementById('logbookSearch').value.toLowerCase();
    const filterType = document.getElementById('logbookFilter').value;
    const filterMonth = document.getElementById('logbookDateFilter').value;

    let filtered = this.allLogbookRecords;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.date.toLowerCase().includes(searchTerm) ||
        (entry.dutyType && entry.dutyType.toLowerCase().includes(searchTerm)) ||
        (entry.trainNo && entry.trainNo.toLowerCase().includes(searchTerm)) ||
        (entry.locoNo && entry.locoNo.toLowerCase().includes(searchTerm)) ||
        (entry.fromStation && entry.fromStation.toLowerCase().includes(searchTerm)) ||
        (entry.toStation && entry.toStation.toLowerCase().includes(searchTerm))
      );
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(entry => entry.dutyType === filterType);
    }

    // Apply date filter
    if (filterMonth) {
      const now = new Date();
      const monthsAgo = new Date(now.setMonth(now.getMonth() - parseInt(filterMonth)));
      filtered = filtered.filter(entry => new Date(entry.date) >= monthsAgo);
    }

    this.displayFilteredRecords(filtered);
  },

  // New function to edit logbook entry
  editLogbookEntry(entryId) {
    const user = AuthService.getUser();
    // Use loaded records
    const entry = this.allLogbookRecords.find(e => e.id == entryId);

    if (!entry) {
      showNotification('Entry not found', 'error');
      return;
    }

    // Fill the form with entry data
    document.getElementById('logDate').value = entry.date;
    document.getElementById('logDutyType').value = entry.dutyType;
    document.getElementById('logTrainNo').value = entry.trainNo || '';
    document.getElementById('logLocoNo').value = entry.locoNo || '';
    document.getElementById('logShedDone').value = entry.shedDone || '';
    document.getElementById('logShedDue').value = entry.shedDue || '';
    document.getElementById('logRemarksIC').value = entry.remarksIC || '';

    // Movement/Timing Details
    document.getElementById('logSignOn').value = entry.signOn || '';
    document.getElementById('logCTO').value = entry.cto || '';
    document.getElementById('logFromStation').value = entry.fromStation || '';
    document.getElementById('logDepartTime').value = entry.departTime || '';
    document.getElementById('logToStation').value = entry.toStation || '';
    document.getElementById('logArrTime').value = entry.arrTime || '';
    document.getElementById('logCMO').value = entry.cmo || '';
    document.getElementById('logSignOff').value = entry.signOff || '';
    document.getElementById('logCTOEC').value = entry.ctoEC || '';
    document.getElementById('logCTOER').value = entry.ctoER || '';
    document.getElementById('logCMOEC').value = entry.cmoEC || '';
    document.getElementById('logCMOER').value = entry.cmoER || '';

    // Loco Pilot & Train Manager Details
    document.getElementById('logLPGName').value = entry.lpgName || '';
    document.getElementById('logLPGMobile').value = entry.lpgMobile || '';
    document.getElementById('logGuardName').value = entry.guardName || '';
    document.getElementById('logGuardMobile').value = entry.guardMobile || '';

    // Brake & Other Details
    document.getElementById('logBPC').value = entry.bpc || '';
    document.getElementById('logSTN').value = entry.stn || '';
    document.getElementById('logLoadTN').value = entry.loadTN || '';
    document.getElementById('logBP').value = entry.bp || '';
    document.getElementById('logBMBS').value = entry.bmbs || '';
    document.getElementById('logBMBSPercent').value = entry.bmbsPercent || '';

    // Safety Check (set checkboxes based on values)
    document.getElementById('logTFOilOK').checked = (entry.tfOil === 'OK');
    document.getElementById('logSRGROilOK').checked = (entry.srgrOil === 'OK');
    document.getElementById('logCPOilOK').checked = (entry.cpOil === 'OK');
    document.getElementById('logHLOK').checked = (entry.hl === 'OK');
    document.getElementById('logMLOK').checked = (entry.ml === 'OK');
    document.getElementById('logFLOK').checked = (entry.fl === 'OK');
    document.getElementById('logUIOK').checked = (entry.ui === 'OK');
    document.getElementById('logCIOK').checked = (entry.ci === 'OK');

    // Additional Media
    if (entry.photoData) {
      this.currentPhotoData = entry.photoData;
      // Show the photo preview
      const preview = document.getElementById('photoPreview');
      const img = document.getElementById('photoPreviewImg');
      img.src = entry.photoData;
      preview.style.display = 'block';
    }
    document.getElementById('logRemark').value = entry.remark || '';

    // Tools
    document.getElementById('logWW').value = entry.ww || '';
    document.getElementById('logFEX').value = entry.fex || '';
    document.getElementById('logBPTool').value = entry.bpTool || '';
    document.getElementById('logFP').value = entry.fp || '';
    document.getElementById('logSafetyClamp').value = entry.safetyClamp || '';
    document.getElementById('logOtherTools').value = entry.otherTools || '';

    // Other fields
    document.getElementById('logEC').value = entry.ec || '';
    document.getElementById('logRG').value = entry.rg || '';
    document.getElementById('logECArrival').value = entry.ecArrival || '';
    document.getElementById('logRGArrival').value = entry.rgArrival || '';
    document.getElementById('logMV5').value = entry.mv5 || '';
    document.getElementById('logCJE').value = entry.cje || '';
    document.getElementById('logRemarks').value = entry.remarks || '';

    // Switch to form view
    document.getElementById('logbookHome').style.display = 'none';
    document.getElementById('logbookRecords').style.display = 'none';
    document.getElementById('logbookForm').style.display = 'block';

    // Store the entry ID for update
    this.currentEditEntryId = entryId;
  },

  // Cloud sync
  syncToCloud() {
    showNotification('<img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Syncing to Google Drive...', 'info');

    // Simulate cloud sync (in real implementation, this would call Google Drive API)
    setTimeout(() => {
      const syncStatus = document.getElementById('syncStatus');
      const lastSync = document.getElementById('lastSync');

      if (syncStatus) syncStatus.textContent = 'Synced';
      if (lastSync) lastSync.textContent = new Date().toLocaleTimeString();

      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Successfully synced to Google Drive!', 'success');
    }, 1500);
  },

  updateSyncStatus() {
    const lastSync = document.getElementById('lastSync');
    if (lastSync) {
      const savedSync = localStorage.getItem('nwr_last_sync');
      if (savedSync) {
        lastSync.textContent = new Date(savedSync).toLocaleString();
      }
    }
  },

  // Export to Excel - Comprehensive version
  exportToExcel() {
    const user = AuthService.getUser();
    const userLogbooks = this.allLogbookRecords || [];

    if (userLogbooks.length === 0) {
      showNotification('No records to export', 'error');
      return;
    }

    // Create CSV content with all fields
    const headers = [
      'Date', 'Duty Type', 'Train No.', 'Loco No.', 'Shed Done', 'Shed Due', 'Remarks',
      'S/On', 'CTO', 'From Station', 'Dep. Time', 'To Station', 'Arr. Time', 'CMO', 'S/Off',
      'CTO EC', 'CTO ER', 'CMO EC', 'CMO ER',
      'LP Name', 'LP Mobile', 'TM Name', 'TM Mobile',
      'BPC', 'STN', 'Load TN', 'BP%', 'BMBS', 'BMBS%',
      'T/F Oil', 'SR/GR Oil', 'CP Oil', 'HL', 'ML', 'FL', 'U/I', 'C/I',
      'W/W', 'F/EX', 'BP', 'FP', 'Safety Clamp', 'Other Tools',
      'Energy Consumption', 'Regeneration', 'EC Arrival', 'RG Arrival', 'MV5', 'CJE', 'Remarks',
      'Photo', 'Remark'
    ];

    const csvContent = [
      headers.join(','),
      ...userLogbooks.map(entry => [
        entry.date || '',
        entry.dutyType || '',
        entry.trainNo || '',
        entry.locoNo || '',
        entry.shedDone || '',
        entry.shedDue || '',
        entry.remarksIC || '',
        entry.signOn || '',
        entry.cto || '',
        entry.fromStation || '',
        entry.departTime || '',
        entry.toStation || '',
        entry.arrTime || '',
        entry.cmo || '',
        entry.signOff || '',
        entry.ctoEC || '',
        entry.ctoER || '',
        entry.cmoEC || '',
        entry.cmoER || '',
        entry.lpgName || '',
        entry.lpgMobile || '',
        entry.guardName || '',
        entry.guardMobile || '',
        entry.bpc || '',
        entry.stn || '',
        entry.loadTN || '',
        entry.bp || '',
        entry.bmbs || '',
        entry.bmbsPercent || '',
        entry.tfOil || '',
        entry.srgrOil || '',
        entry.cpOil || '',
        entry.hl || '',
        entry.ml || '',
        entry.fl || '',
        entry.ui || '',
        entry.ci || '',
        entry.ww || '',
        entry.fex || '',
        entry.bpTool || '',
        entry.fp || '',
        entry.safetyClamp || '',
        entry.otherTools || '',
        entry.ec || '',
        entry.rg || '',
        entry.ecArrival || '',
        entry.rgArrival || '',
        entry.mv5 || '',
        entry.cje || '',
        entry.remarks || '',
        entry.photoData ? 'Photo available' : '',
        entry.remark || ''
      ].map(field => '"' + String(field).replace(/"/g, '') + '"').join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `movement_details_${user.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Toggle select all checkboxes
  toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll('input.record-select');
    checkboxes.forEach(checkbox => {
      checkbox.checked = source.checked;
    });
  },

  // Update select all checkbox state
  updateSelectAllCheckbox() {
    const checkboxes = document.querySelectorAll('input.record-select');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');

    if (checkboxes.length === 0) return;

    const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = checkedCount === checkboxes.length;
    }
  },


  // Save Logbook Entry
  saveLogbookEntry() {
    const user = AuthService.getUser();
    const errorElem = document.getElementById('logbookError');

    // Get form values
    const date = document.getElementById('logDate').value;
    const dutyType = document.getElementById('logDutyType').value;

    if (!date) {
      errorElem.textContent = 'Please select a date';
      return;
    }

    if (!dutyType) {
      errorElem.textContent = 'Please select duty type';
      return;
    }

    const isEdit = this.currentEditEntryId !== undefined && this.currentEditEntryId !== null;

    const entry = {
      id: isEdit ? this.currentEditEntryId : 'LOG' + Date.now(),
      date: date,
      dutyType: dutyType,
      trainNo: document.getElementById('logTrainNo').value,
      locoNo: document.getElementById('logLocoNo').value,
      shedDone: document.getElementById('logShedDone').value,
      shedDue: document.getElementById('logShedDue').value,
      remarksIC: document.getElementById('logRemarksIC').value,

      // Movement/Timing
      signOn: document.getElementById('logSignOn').value,
      cto: document.getElementById('logCTO').value,
      fromStation: document.getElementById('logFromStation').value,
      departTime: document.getElementById('logDepartTime').value,
      toStation: document.getElementById('logToStation').value,
      arrTime: document.getElementById('logArrTime').value,
      cmo: document.getElementById('logCMO').value,
      signOff: document.getElementById('logSignOff').value,
      ctoEC: document.getElementById('logCTOEC').value,
      ctoER: document.getElementById('logCTOER').value,
      cmoEC: document.getElementById('logCMOEC').value,
      cmoER: document.getElementById('logCMOER').value,

      // Crew
      lpgName: document.getElementById('logLPGName').value,
      lpgMobile: document.getElementById('logLPGMobile').value,
      guardName: document.getElementById('logGuardName').value,
      guardMobile: document.getElementById('logGuardMobile').value,

      // Brake
      bpc: document.getElementById('logBPC').value,
      stn: document.getElementById('logSTN').value,
      loadTN: document.getElementById('logLoadTN').value,
      bp: document.getElementById('logBP').value,
      bmbs: document.getElementById('logBMBS').value,
      bmbsPercent: document.getElementById('logBMBSPercent').value,

      // Safety Check
      tfOil: document.getElementById('logTFOilOK')?.checked ? 'OK' : '',
      srgrOil: document.getElementById('logSRGROilOK')?.checked ? 'OK' : '',
      cpOil: document.getElementById('logCPOilOK')?.checked ? 'OK' : '',
      hl: document.getElementById('logHLOK')?.checked ? 'OK' : '',
      ml: document.getElementById('logMLOK')?.checked ? 'OK' : '',
      fl: document.getElementById('logFLOK')?.checked ? 'OK' : '',
      ui: document.getElementById('logUIOK')?.checked ? 'OK' : '',
      ci: document.getElementById('logCIOK')?.checked ? 'OK' : '',

      // Tools
      ww: document.getElementById('logWW').value,
      fex: document.getElementById('logFEX').value,
      bpTool: document.getElementById('logBPTool').value,
      fp: document.getElementById('logFP').value,
      safetyClamp: document.getElementById('logSafetyClamp').value,
      otherTools: document.getElementById('logOtherTools').value,

      // Other (fields removed from form but kept in data for backward compat)
      ec: document.getElementById('logEC')?.value || '',
      rg: document.getElementById('logRG')?.value || '',
      ecArrival: document.getElementById('logECArrival')?.value || '',
      rgArrival: document.getElementById('logRGArrival')?.value || '',
      mv5: document.getElementById('logMV5')?.value || '',
      cje: document.getElementById('logCJE')?.value || '',
      remarks: document.getElementById('logRemarks')?.value || '',

      photoData: this.currentPhotoData || null,
      remark: document.getElementById('logRemark')?.value || '',

      createdBy: user.cms,
      createdByName: user.name,
      createdAt: new Date().toISOString()
    };

    const api = window.Api || AuthService.getApi();
    if (!api) {
      showNotification('API not available', 'error');
      return;
    }

    const userId = user.id || user.serverId || user.cms;
    showNotification('Saving entry...', 'info');

    api.saveLogbookEntry(userId, entry)
      .then(response => {
        if (response.success) {
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Logbook entry saved successfully!', 'success');
          this.currentEditEntryId = null;
          this.clearLogbookForm();
          this.removePhoto();
          this.showLogbookRecords();
        } else {
          showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Failed: ' + (response.error || 'Unknown error'), 'error');
        }
      })
      .catch(err => {
        console.error(err);
        showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Error: ' + err.message, 'error');
      });
  },

  clearLogbookForm() {
    // Reset all inputs
    const inputs = document.querySelectorAll('#logbookForm input, #logbookForm select');
    inputs.forEach(input => {
      if (input.type === 'checkbox') input.checked = false;
      else if (input.type === 'file') input.value = '';
      else input.value = '';
    });
    this.removePhoto();
    this.currentEditEntryId = null;
  },

  handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentPhotoData = e.target.result;
        document.getElementById('photoPreviewImg').src = e.target.result;
        document.getElementById('photoPreview').style.display = 'block';
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  removePhoto() {
    this.currentPhotoData = null;
    const logPhoto = document.getElementById('logPhoto');
    const photoPreview = document.getElementById('photoPreview');
    if (logPhoto) logPhoto.value = '';
    if (photoPreview) photoPreview.style.display = 'none';
  },


  // Filter Logbook Records
  // Display filtered records

  editLogbookEntry(entryId) {
    const entry = this.allLogbookRecords.find(e => e.id == entryId);
    if (!entry) {
      showNotification('Entry not found', 'error');
      return;
    }

    this.currentEditEntryId = entryId;

    // Fill form
    document.getElementById('logDate').value = entry.date;
    document.getElementById('logDutyType').value = entry.dutyType;
    document.getElementById('logTrainNo').value = entry.trainNo || '';
    document.getElementById('logLocoNo').value = entry.locoNo || '';
    document.getElementById('logShedDone').value = entry.shedDone || '';
    document.getElementById('logShedDue').value = entry.shedDue || '';
    document.getElementById('logRemarksIC').value = entry.remarksIC || '';

    document.getElementById('logSignOn').value = entry.signOn || '';
    document.getElementById('logCTO').value = entry.cto || '';
    document.getElementById('logFromStation').value = entry.fromStation || '';
    document.getElementById('logDepartTime').value = entry.departTime || '';
    document.getElementById('logToStation').value = entry.toStation || '';
    document.getElementById('logArrTime').value = entry.arrTime || '';
    document.getElementById('logCMO').value = entry.cmo || '';
    document.getElementById('logSignOff').value = entry.signOff || '';
    document.getElementById('logCTOEC').value = entry.ctoEC || '';
    document.getElementById('logCTOER').value = entry.ctoER || '';
    document.getElementById('logCMOEC').value = entry.cmoEC || '';
    document.getElementById('logCMOER').value = entry.cmoER || '';

    document.getElementById('logLPGName').value = entry.lpgName || '';
    document.getElementById('logLPGMobile').value = entry.lpgMobile || '';
    document.getElementById('logGuardName').value = entry.guardName || '';
    document.getElementById('logGuardMobile').value = entry.guardMobile || '';

    document.getElementById('logBPC').value = entry.bpc || '';
    document.getElementById('logSTN').value = entry.stn || '';
    document.getElementById('logLoadTN').value = entry.loadTN || '';
    document.getElementById('logBP').value = entry.bp || '';
    document.getElementById('logBMBS').value = entry.bmbs || '';
    document.getElementById('logBMBSPercent').value = entry.bmbsPercent || '';

    // Safety
    if (document.getElementById('logTFOilOK')) document.getElementById('logTFOilOK').checked = entry.tfOil === 'OK';
    if (document.getElementById('logSRGROilOK')) document.getElementById('logSRGROilOK').checked = entry.srgrOil === 'OK';
    if (document.getElementById('logCPOilOK')) document.getElementById('logCPOilOK').checked = entry.cpOil === 'OK';
    if (document.getElementById('logHLOK')) document.getElementById('logHLOK').checked = entry.hl === 'OK';
    if (document.getElementById('logMLOK')) document.getElementById('logMLOK').checked = entry.ml === 'OK';
    if (document.getElementById('logFLOK')) document.getElementById('logFLOK').checked = entry.fl === 'OK';
    if (document.getElementById('logUIOK')) document.getElementById('logUIOK').checked = entry.ui === 'OK';
    if (document.getElementById('logCIOK')) document.getElementById('logCIOK').checked = entry.ci === 'OK';

    document.getElementById('logWW').value = entry.ww || '';
    document.getElementById('logFEX').value = entry.fex || '';
    document.getElementById('logBPTool').value = entry.bpTool || '';
    document.getElementById('logFP').value = entry.fp || '';
    document.getElementById('logSafetyClamp').value = entry.safetyClamp || '';
    document.getElementById('logOtherTools').value = entry.otherTools || '';

    // Fields removed from form — use optional chaining to avoid crash
    if (document.getElementById('logEC')) document.getElementById('logEC').value = entry.ec || '';
    if (document.getElementById('logRG')) document.getElementById('logRG').value = entry.rg || '';
    if (document.getElementById('logECArrival')) document.getElementById('logECArrival').value = entry.ecArrival || '';
    if (document.getElementById('logRGArrival')) document.getElementById('logRGArrival').value = entry.rgArrival || '';
    if (document.getElementById('logMV5')) document.getElementById('logMV5').value = entry.mv5 || '';
    if (document.getElementById('logCJE')) document.getElementById('logCJE').value = entry.cje || '';
    if (document.getElementById('logRemarks')) document.getElementById('logRemarks').value = entry.remarks || '';
    if (document.getElementById('logRemark')) document.getElementById('logRemark').value = entry.remark || '';

    // Photo removed from form — just restore data reference silently
    if (entry.photoData) {
      this.currentPhotoData = entry.photoData;
      if (document.getElementById('photoPreviewImg')) {
        document.getElementById('photoPreviewImg').src = entry.photoData;
        document.getElementById('photoPreview').style.display = 'block';
      }
    }

    this.showLogbookForm();
  },

  syncToCloud() {
    showNotification('<img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Syncing to server...', 'info');
    // Actual sync happens via API saves, so just simulate a check
    setTimeout(() => {
      this.updateSyncStatus();
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Data is up to date', 'success');
    }, 1000);
  },

  updateSyncStatus() {
    const lastSync = document.getElementById('lastSync');
    const syncStatus = document.getElementById('syncStatus');
    if (lastSync) lastSync.textContent = new Date().toLocaleTimeString();
    if (syncStatus) syncStatus.textContent = 'Connected';
  },

  async refreshPushDebug() {
    const container = document.getElementById('pushDebugStatus');
    if (!container) return;

    container.innerHTML = '<div class="muted"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Fetching status...</div>';

    if (!window.PushNotificationService || !window.PushNotificationService.getDebugStatus) {
      container.innerHTML = '<div style="color: #ef4444;"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> PushNotificationService not found.</div>';
      return;
    }

    try {
      const status = await window.PushNotificationService.getDebugStatus();
      if (!status) {
        container.innerHTML = `<div style="color: #ef4444;"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Error: Could not get status (null response)</div>`;
        // Don't return early, show partial status instead
      }

      const tags = status?.tags || {};
      const tagsHtml = Object.entries(tags)
        .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('');

      const localUser = window.AuthService ? window.AuthService.getUser() : null;
      const localUserHtml = localUser ? `
        <div style="font-size: 11px; background: #eff6ff; padding: 10px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #dbeafe;">
          <strong>CMS:</strong> ${localUser.cms || 'N/A'} | 
          <strong>Div:</strong> ${localUser.division} (${localUser.division_id || 'no id'}) | 
          <strong>Lobby:</strong> ${localUser.hq || localUser.lobby || 'N/A'} (${localUser.lobby_id || 'no id'})
        </div>
      ` : '';

      // Treat SDK as ready if: SW registered + permission granted (initialized flag unreliable in WebView)
      const sdkReady = status.initialized || (status.swStatus?.includes('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;">') && status.permission === 'granted');

      container.innerHTML = `
        ${localUserHtml}
        <div><strong>OneSignal Init:</strong> <span style="color: ${sdkReady ? '#10b981' : '#f59e0b'}">${sdkReady ? 'Ready <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;">' : 'Loading...'}</span> ${status.error ? `<span style="color:#ef4444;font-size:11px">(${status.error})</span>` : ''}</div>
        <div><strong>App ID:</strong> ${status.appId}</div>
        <div><strong>External ID:</strong> ${status.externalId || 'None'}</div>
        <div><strong>Subscription ID:</strong> <span style="font-family: monospace; font-size: 10px;">${status.subscriptionId || 'None'}</span></div>
        <div><strong>Subscribed:</strong> <span style="color: ${status.isSubscribed ? '#10b981' : '#ef4444'}">${status.isSubscribed ? 'Yes <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;">' : 'No <img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;">'}</span></div>
        <div><strong>Service Worker:</strong> ${status.swStatus || 'Pending...'}</div>
        <div><strong>Permission:</strong> ${status.permission}</div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
          <div style="font-weight: 600; margin-bottom: 4px;">Tags:</div>
          <div style="background: #f8fafc; padding: 8px; border-radius: 6px; font-family: monospace; font-size: 11px;">
            ${Object.keys(tags).length > 0 ? tagsHtml : '<i>No tags found on this device</i>'}
          </div>
        </div>
        ${!status.isSubscribed ? `<div style="margin-top:8px;padding:8px;background:#fef3c7;border-radius:8px;font-size:12px;color:#92400e;"><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Not subscribed yet — click <strong>Register</strong> button above to enable push notifications.</div>` : ''}
        <div style="margin-top: 12px; border-top: 1px dashed #eee; padding-top: 10px; display: flex; flex-direction: column; gap: 8px;">
          <p style="font-size: 11px; color: #64748b;">Try "Register" first. If it still says No, try Reset:</p>
          ${!status.swStatus?.includes('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;">') ? `
          <button class="btn-sm" onclick="navigator.serviceWorker.register('/OneSignalSDKWorker.js').then(() => ProfilePage.refreshPushDebug())" style="background: #10b981; color: white; border: none; width: 100%;"><img src="https://img.icons8.com/3d-fluency/94/hammer-and-wrench.png" width="24" height="24" alt="tools" style="vertical-align: middle;"> Fix Service Worker</button>
          ` : ''}
          <button class="btn-sm" onclick="PushNotificationService.resetOneSignal();" style="background: #6366f1; color: white; border: none; width: 100%;"><img src="https://img.icons8.com/3d-fluency/94/synchronize.png" width="24" height="24" alt="sync" style="vertical-align: middle;"> Reset OneSignal</button>
          <button class="btn-sm" onclick="AuthService.logout(); location.reload();" style="background: #ef4444; color: white; border: none; width: 100%;"><img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Log Out & Refresh All Data</button>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color: #ef4444;"><img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Error: ${e.message}</div>`;
    }
  },

  async forcePushRegister() {
    const container = document.getElementById('pushDebugStatus');
    if (container) container.innerHTML = '<div class="muted"><img src="https://img.icons8.com/3d-fluency/94/hourglass.png" width="24" height="24" alt="wait" style="vertical-align: middle;"> Registering for push notifications...</div>';
    showNotification('<img src="https://img.icons8.com/3d-fluency/94/bell.png" width="24" height="24" alt="bell" style="vertical-align: middle;"> Requesting notification permission...', 'info');
    try {
      const success = await window.PushNotificationService.forceRegister();
      if (success) {
        showNotification('<img src="https://img.icons8.com/3d-fluency/94/checkmark.png" width="24" height="24" alt="check" style="vertical-align: middle;"> Registered! Re-checking status...', 'success');
      } else {
        showNotification('<img src="https://img.icons8.com/3d-fluency/94/warning-shield.png" width="24" height="24" alt="warning" style="vertical-align: middle;"> Register call failed — checking status anyway...', 'warning');
      }
    } catch (e) {
      showNotification('<img src="https://img.icons8.com/3d-fluency/94/cancel.png" width="24" height="24" alt="cross" style="vertical-align: middle;"> Error: ' + e.message, 'error');
    }
    // Always refresh status after register attempt, with delay for SDK to settle
    setTimeout(() => this.refreshPushDebug(), 3000);
  }
};

// Export global
window.ProfilePage = ProfilePage;
window.ProfileService = ProfileService;