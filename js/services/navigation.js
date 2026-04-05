// Navigation Service
const NavigationService = {
  currentView: 'dashboard',
  viewHistory: [],
  isNavigatingBack: false,
  maxHistoryLength: 20,

  // Initialize navigation
  init() {
    this.renderSidebar();
    this.setupSidebarNav();
    this.setupBottomNav();
    this.setupMobileTiles();
    this.setupResponsive();
    this.setupHistoryHandling();

    // Listen for content updates to refresh view
    document.addEventListener('contentStructureUpdated', () => {
      this.renderSidebar();
      if (this.currentView === 'dashboard') {
        this.loadPage('dashboard');
      }
    });
  },

  // Setup browser history handling for SPA navigation
  setupHistoryHandling() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      this.handlePopState(event);
    });

    // Handle mobile back button via WebViewBridge if available
    document.addEventListener('backButtonPressed', () => {
      this.handleMobileBackButton();
    });
  },

  // Handle popstate event (browser back/forward)
  handlePopState(event) {
    console.log('[Navigation] popstate event:', event.state);

    // Check if this popstate is for a modal - if so, just close the modal and stop
    if (event.state && (event.state.modal === 'fileViewer' || event.state.modal === 'contentModal')) {
      // Close any open modals without navigating
      const fileViewerModal = document.getElementById('fileViewerModal');
      const contentModal = document.getElementById('contentModal');

      if (fileViewerModal) {
        fileViewerModal.remove();
        if (ContentManagementService && ContentManagementService._fileViewerPopHandler) {
          window.removeEventListener('popstate', ContentManagementService._fileViewerPopHandler);
          ContentManagementService._fileViewerPopHandler = null;
        }
      }

      if (contentModal) {
        contentModal.remove();
      }

      // Don't navigate - just return
      return;
    }

    // Check if there's a file viewer modal open (from direct close button click, not back button)
    const fileViewerModal = document.getElementById('fileViewerModal');
    if (fileViewerModal && (!event.state || !event.state.modal)) {
      fileViewerModal.remove();
      if (ContentManagementService && ContentManagementService._fileViewerPopHandler) {
        window.removeEventListener('popstate', ContentManagementService._fileViewerPopHandler);
        ContentManagementService._fileViewerPopHandler = null;
      }
      return;
    }

    // Check if there's a content modal open
    const contentModal = document.getElementById('contentModal');
    if (contentModal && (!event.state || !event.state.modal)) {
      contentModal.remove();
      return;
    }

    // If we have state with a view, navigate to it
    if (event.state && event.state.view) {
      this.isNavigatingBack = true;
      const targetView = event.state.view;
      const state = event.state;

      // Special handling for sub-navigation (Divisions, Lobbies, Folders, etc.)
      const handleSubView = () => {
        if (!state.subView) {
          this.isNavigatingBack = false;
          return;
        }

        if (state.subView === 'divisionDetails' && state.divisionId) {
          DepartmentsPage.loadDivisionDetails(state.divisionId, true);
        } else if (state.subView === 'lobbyDetails' && state.division && state.lobby) {
          DepartmentsPage.loadLobbyDetails(state.division, state.lobby, true);
        } else if (state.subView === 'divisionTab' && state.tabId && state.tabName && state.division) {
          DepartmentsPage.openDivisionTab(state.tabId, state.tabName, state.division, true);
        } else if (state.subView === 'lobbyFiles' && state.tabId && state.lobby && state.tabName) {
          DepartmentsPage.viewLobbyFiles(state.tabId, state.lobby, state.tabName, state.division, true);
        } else if (state.subView === 'mainTabFolder' && state.tabId && state.folderId && state.folderName) {
          DepartmentsPage.openMainTabFolder(state.tabId, state.folderId, state.folderName, true);
        } else if (state.subView === 'profileTab' && state.tab) {
          ProfilePage.switchTab(state.tab, false);
        } else if (state.subView === 'locoTab' && state.tabName) {
          DepartmentsPage.switchLocoTab(state.tabName, true);
        } else if (state.subView === 'adminTab' && state.tab) {
          AdminPage.switchTab(state.tab, false);
        } else if (state.subView === 'threePhasePage' && state.pageId) {
          ThreePhaseLocoPage.showPage(state.pageId, false, state.subsystemCode, state.faultCode);
        }
        this.isNavigatingBack = false;
      };

      if (targetView === this.currentView) {
        // Already on correct page, just handle sub-rendering
        handleSubView();
      } else {
        // Load the parent page first
        this.loadPage(targetView).then(() => {
          this.updateNavStates(targetView);
          this.currentView = targetView;
          this.onViewChange(targetView);

          // Wait for DOM to be ready
          setTimeout(handleSubView, 50);
        });
      }
    } else {
      // No state, check URL hash or go Home
      const hash = window.location.hash.replace('#', '').split('/')[0];
      const defaultView = hash || (isMobile() ? 'mobileHome' : 'dashboard');
      if (this.currentView !== defaultView && !window.location.hash.includes(defaultView)) {
        this.isNavigatingBack = true;
        this.loadPage(defaultView).then(() => {
          this.updateNavStates(defaultView);
          this.currentView = defaultView;
          this.onViewChange(defaultView);
          this.isNavigatingBack = false;
        });
      }
    }
  },

  // Handle mobile back button
  handleMobileBackButton() {
    // First check if there are any open modals
    const fileViewerModal = document.getElementById('fileViewerModal');
    const contentModal = document.getElementById('contentModal');

    if (fileViewerModal) {
      fileViewerModal.remove();
      if (ContentManagementService && ContentManagementService._fileViewerPopHandler) {
        window.removeEventListener('popstate', ContentManagementService._fileViewerPopHandler);
        ContentManagementService._fileViewerPopHandler = null;
      }
      return;
    }

    if (contentModal) {
      contentModal.remove();
      return;
    }

    // Check if we can go back in history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // We're at the start, check if we're on home page
      const homeView = isMobile() ? 'mobileHome' : 'dashboard';
      if (this.currentView !== homeView) {
        this.navigateTo(homeView);
      } else {
        // Already on home page, let the app handle exit
        // This could trigger a confirmation dialog or minimize the app
        console.log('[Navigation] Already at home page, cannot go back further');
      }
    }
  },

  // Render dynamic sidebar
  renderSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    if (!sidebarNav) return;

    const structure = ContentManagementService.getContentStructure();
    const mainTabs = structure.mainTabs || [];
    const user = AuthService.getUser();

    // Helper to find tab by ID or Name
    const findTab = (idOrName) => {
      const normalizedQuery = idOrName.toLowerCase().replace(/\s+/g, '');
      return mainTabs.find(t => {
        const tNorm = t.name.toLowerCase().replace(/\s+/g, '');
        return tNorm === normalizedQuery || t.id === idOrName;
      });
    };

    let html = '';

    // --- Overview (Desktop only) ---
    if (!isMobile()) {
      html += `<div class="nav-item ${this.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">🏢 Overview</div>`;
    }

    // --- GM Message ---
    const gmTab = findTab('GM Message') || { name: 'GM Message', icon: '🧑‍💼' };
    html += `<div class="nav-item ${this.currentView === 'gmMessage' ? 'active' : ''}" data-view="gmMessage">${gmTab.icon || '🧑‍💼'} ${gmTab.name}</div>`;

    // --- PCEE Message ---
    const pceeTab = findTab('PCEE Message') || { name: 'PCEE Message', icon: '🧑🏻‍💼' };
    html += `<div class="nav-item ${this.currentView === 'pceeMessage' ? 'active' : ''}" data-view="pceeMessage">${pceeTab.icon || '🧑🏻‍💼'} ${pceeTab.name}</div>`;

    // --- NWR Notices (New) ---
    // Check if dynamic tab exists, otherwise static placeholder
    const nwrTab = findTab('NWR Notices');
    if (nwrTab) {
      const viewId = nwrTab.name.toLowerCase().replace(/\s+/g, '');
      html += `<div class="nav-item ${this.currentView === viewId ? 'active' : ''}" data-view="${viewId}">${nwrTab.icon || '📑'} ${nwrTab.name}</div>`;
    } else {
      // Static if not found (assuming user wants this structure even if tab not created yet)
      // Or should we create it on the fly? Better to just show it if user asked for it.
      // For now, I'll link it to a view 'nwrNotices' which might be empty or handled by DepartmentsPage
      html += `<div class="nav-item ${this.currentView === 'nwrnotices' ? 'active' : ''}" data-view="nwrnotices">📑 NWR Notices</div>`;
    }

    // --- Divisions Notices (Renamed from Divisions) ---
    const divTab = findTab('Divisions') || { name: 'Divisions Notices', icon: '🗂️' };
    // Map 'divisions' view to this item
    html += `
      <div class="nav-item ${this.currentView === 'divisions' ? 'active' : ''}" data-view="divisions">
        <span class="nav-icon-text">${divTab.icon || '🗂️'}</span>
        <span>Divisions Notices</span>
      </div>
    `;


    // --- Locomotives Group ---
    html += `<div class="sidebar-header">Locomotives</div>`;

    // Electric Loco
    const elTab = findTab('Electric Loco');
    html += `<div class="nav-item ${this.currentView === 'electricLoco' ? 'active' : ''}" data-view="electricLoco">${elTab?.icon || '🚆'} Electric Loco</div>`;

    // Diesel Loco
    const dlTab = findTab('Diesel Loco');
    html += `<div class="nav-item ${this.currentView === 'dieselLoco' ? 'active' : ''}" data-view="dieselLoco">${dlTab?.icon || '🚂'} Diesel Loco</div>`;

    // Vande Bharat
    const vbTab = findTab('Vande Bharat');
    html += `<div class="nav-item ${this.currentView === 'vandeBharat' ? 'active' : ''}" data-view="vandeBharat">${vbTab?.icon || '🚅'} Vande Bharat</div>`;

    // MEMU
    const memuTab = findTab('MEMU');
    html += `<div class="nav-item ${this.currentView === 'memu' ? 'active' : ''}" data-view="memu">${memuTab?.icon || '🚆'} MEMU</div>`;


    // --- Resources Group ---
    html += `<div class="sidebar-header">Resources</div>`;

    // Rule Books
    const rbTab = findTab('Rule Books');
    html += `<div class="nav-item ${this.currentView === 'ruleBooks' ? 'active' : ''}" data-view="ruleBooks">${rbTab?.icon || '📚'} Rule Books</div>`;

    // SPAD Prevention
    const spadTab = findTab('SPAD Prevention');
    html += `<div class="nav-item ${this.currentView === 'spad' ? 'active' : ''}" data-view="spad">${spadTab?.icon || '🚫'} SPAD Prevention</div>`;

    // Kachav
    const kachavTab = findTab('Kachav');
    html += `<div class="nav-item ${this.currentView === 'kachav' ? 'active' : ''}" data-view="kachav">${kachavTab?.icon || '🛡️'} Kachav</div>`;


    // --- Departments Group ---
    html += `<div class="sidebar-header">Departments</div>`;

    // Traffic
    const trTab = findTab('Traffic');
    html += `<div class="nav-item ${this.currentView === 'traffic' ? 'active' : ''}" data-view="traffic">${trTab?.icon || '🚦'} Traffic</div>`;

    // OHE
    const oheTab = findTab('OHE');
    html += `<div class="nav-item ${this.currentView === 'ohe' ? 'active' : ''}" data-view="ohe">${oheTab?.icon || '⚡'} OHE</div>`;

    // C & W
    const cwTab = findTab('C & W');
    html += `<div class="nav-item ${this.currentView === 'cw' ? 'active' : ''}" data-view="cw">${cwTab?.icon || '🛠️'} C & W</div>`;

    // P-Way
    const pwTab = findTab('P-Way');
    html += `<div class="nav-item ${this.currentView === 'pway' ? 'active' : ''}" data-view="pway">${pwTab?.icon || '🛤️'} P-Way</div>`;

    // About NWR Chalak Mirta
    // Check if 'About us' tab exists and rename/use it, or use a new 'About NWR...' tab
    // User requested to remove it from Departments and keep in Other Tabs
    // So we DON'T render it here.


    // --- Render Custom Tabs (excluding those already rendered) ---
    // We need to render any other dynamic tabs the user might have added
    const renderedNames = [
      'overview', 'gm message', 'pcee message', 'nwr notices', 'divisions', 'divisions notices',
      'electric loco', 'diesel loco', 'vande bharat', 'memu',
      'rule books', 'spad prevention', 'kachav',
      'traffic', 'ohe', 'c & w', 'p-way', 'about nwr chalak mitra'
    ];

    const customTabs = mainTabs.filter(t => {
      const tName = t.name.toLowerCase().replace(/\s+/g, ''); // "electricloco"
      const tNameSpaced = t.name.toLowerCase().replace(/\s+/g, ' '); // "electric loco"

      // Check against rendered list (fuzzy)
      const isRendered = renderedNames.some(r => {
        const rNorm = r.replace(/\s+/g, '');
        return rNorm === tName || r === tNameSpaced;
      });

      return !isRendered;
    });

    if (customTabs.length > 0) {
      html += `<div class="sidebar-header">Other Tabs</div>`;
      customTabs.forEach(tab => {
        const viewId = tab.name.toLowerCase().replace(/\s+/g, '');
        html += `<div class="nav-item ${this.currentView === viewId ? 'active' : ''}" data-view="${viewId}">${tab.icon || '📁'} ${tab.name}</div>`;
      });
    }

    // --- About ---
    html += `<div class="sidebar-header">About</div>`;
    const aboutTab = findTab('About NWR Chalak Mitra');
    html += `<div class="nav-item ${this.currentView === 'aboutNwrChalakMitra' ? 'active' : ''}" data-view="aboutNwrChalakMitra">${aboutTab?.icon || '📄'} About NWR Chalak Mitra</div>`;

    // --- Tools (Footer usually, or just end of list) ---
    html += `<div class="sidebar-header">Tools</div>`;
    html += `<div class="nav-item ${this.currentView === 'chalakMitra' ? 'active' : ''}" data-view="chalakMitra"><img src="./assets/images/chalak-mitra-logo.png" alt="" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: middle; margin-right: 6px;" onerror="this.outerHTML='🤖'"> Chalak Mitra</div>`;
    html += `<div class="nav-item ${this.currentView === 'quiz' ? 'active' : ''}" data-view="quiz">📝 CLI Counseling & Quiz</div>`;
    html += `<div class="nav-item ${this.currentView === 'adminPanel' ? 'active' : ''}" data-view="adminPanel" id="adminNav" style="display: ${user.role !== 'crew' ? 'block' : 'none'}">⚙️ Admin Panel</div>`;

    sidebarNav.innerHTML = html;

    // Refresh notification badges after sidebar is rendered
    if (window.NotificationServiceV2) {
      NotificationServiceV2.updateUI();
    }
  },

  // Setup sidebar navigation
  setupSidebarNav() {
    const sidebarNav = document.getElementById('sidebarNav');
    if (!sidebarNav) return;

    sidebarNav.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (!navItem || !navItem.dataset.view) return;

      const view = navItem.dataset.view;
      console.log(`[Navigation] Sidebar clicked: ${view}`);

      // Check if login is required
      const loginRequired = AuthService.isLoginRequired(view);
      const canAccess = AuthService.canAccessView(view);

      console.log(`[Navigation] View: ${view}, Login required: ${loginRequired}, Can access: ${canAccess}`);

      if (loginRequired && !canAccess) {
        console.log(`[Navigation] Blocking sidebar access to '${view}' - login required`);
        showNotification('🔐 Please login to access this section.', 'info');
        document.getElementById('loginModal').classList.add('show');
        return;
      }

      this.navigateTo(view);
    });
  },

  // Setup bottom navigation
  setupBottomNav() {
    const bottomNav = document.getElementById('bottomNav');
    if (!bottomNav) return;

    bottomNav.addEventListener('click', (e) => {
      const navItem = e.target.closest('.bottom-nav-item');
      if (!navItem || !navItem.dataset.view) return;

      const view = navItem.dataset.view;
      console.log(`[Navigation] Bottom nav clicked: ${view}`);

      // Check login requirement
      const loginRequired = AuthService.isLoginRequired(view);
      const canAccess = AuthService.canAccessView(view);

      console.log(`[Navigation] Bottom nav - View: ${view}, Login required: ${loginRequired}, Can access: ${canAccess}`);

      // Handle profile view - navigate to profile page
      if (view === 'profile') {
        // Check if login required
        if (loginRequired && !canAccess) {
          console.log(`[Navigation] Blocking bottom nav access to 'profile' - login required`);
          showNotification('🔐 Please login to access Profile.', 'info');
          document.getElementById('loginModal').classList.add('show');
          return;
        }
        this.navigateTo('profile');
        return;
      }

      // Check if login is required
      if (loginRequired && !canAccess) {
        console.log(`[Navigation] Blocking bottom nav access to '${view}' - login required`);
        showNotification('🔐 Please login to access this section.', 'info');
        document.getElementById('loginModal').classList.add('show');
        return;
      }

      this.navigateTo(view);
    });
  },

  // Setup mobile tiles
  setupMobileTiles() {
    document.addEventListener('click', (e) => {
      const tile = e.target.closest('.mobile-grid .tile');
      if (!tile || !tile.dataset.target) return;

      const view = tile.dataset.target;
      console.log(`[Navigation] Mobile tile clicked: ${view}`);

      // Check login requirement
      const loginRequired = AuthService.isLoginRequired(view);
      const canAccess = AuthService.canAccessView(view);

      console.log(`[Navigation] Mobile tile - View: ${view}, Login required: ${loginRequired}, Can access: ${canAccess}`);

      // Check if login is required
      if (loginRequired && !canAccess) {
        console.log(`[Navigation] Blocking mobile tile access to '${view}' - login required`);
        showNotification('🔐 Please login to access this section.', 'info');
        document.getElementById('loginModal').classList.add('show');
        return;
      }

      this.navigateTo(view);
    });
  },

  // Setup responsive behavior
  setupResponsive() {
    window.addEventListener('resize', () => {
      if (this.currentView === 'dashboard') {
        this.navigateTo('dashboard');
      }
    });
  },

  // Navigate to a view
  async navigateTo(viewName, pushHistory = true) {
    let targetView = viewName;

    console.log(`[Navigation] navigateTo('${viewName}', pushHistory=${pushHistory}) called`);

    // Check if login is required for this view
    const loginRequired = AuthService.isLoginRequired(viewName);
    const canAccess = AuthService.canAccessView(viewName);
    console.log(`[Navigation] loginRequired: ${loginRequired}, canAccess: ${canAccess}`);

    if (loginRequired && !canAccess) {
      console.log(`[Navigation] Blocking access to '${viewName}' - login required`);
      showNotification('🔐 Please login to access this section.', 'info');
      document.getElementById('loginModal').classList.add('show');
      return;
    }

    // Mobile dashboard shows mobile home
    if (viewName === 'dashboard' && isMobile()) {
      targetView = 'mobileHome';
    }

    // Push state to history for back button support (only when not navigating back)
    if (pushHistory && !this.isNavigatingBack && viewName !== this.currentView) {
      try {
        const state = { view: viewName, timestamp: Date.now() };
        const url = `#${viewName}`;
        window.history.pushState(state, '', url);

        // Add to internal history stack
        this.viewHistory.push(viewName);
        // Limit history size
        if (this.viewHistory.length > this.maxHistoryLength) {
          this.viewHistory.shift();
        }
      } catch (e) {
        console.warn('[Navigation] Failed to push state:', e);
      }
    }

    // Load the page content
    await this.loadPage(targetView);

    // Update navigation states
    this.updateNavStates(viewName);

    // Store current view
    this.currentView = viewName;

    // Trigger view change event
    this.onViewChange(viewName);
  },

  // Load page content
  async loadPage(viewName) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    // Ensure top bar is visible by default (unless specific views hide it)
    const topBar = document.querySelector('.top-bar');
    if (topBar) topBar.style.display = '';

    // Clear current content
    mainContent.innerHTML = '';

    // Check if viewName matches a dynamic main tab
    const structure = ContentManagementService.getContentStructure();
    const mainTab = structure.mainTabs.find(t => {
      const tabNameLower = t.name.toLowerCase().replace(/\s+/g, '');
      return tabNameLower === viewName.toLowerCase();
    });

    // Load the appropriate page
    switch (viewName) {
      case 'dashboard':
        DashboardPage.render(mainContent);
        break;
      case 'mobileHome':
        MobileHomePage.render(mainContent);
        break;
      case 'profile':
        if (typeof ProfilePage !== 'undefined') {
          ProfilePage.render(mainContent);
        } else {
          console.error('ProfilePage is not defined');
          mainContent.innerHTML = '<div class="card"><div class="card-title">Error</div><div class="muted">Profile page could not be loaded. Please refresh.</div></div>';
        }
        break;
      case 'gmMessage':
      case 'gmmessage':
      case 'pceeMessage':
      case 'pceemessage':
      case 'divisions':
      case 'ruleBooks':
      case 'rulebooks':
      case 'electricLoco':
      case 'electricloco':
      case 'dieselLoco':
      case 'dieselloco':
      case 'vandeBharat':
      case 'vandebharat':
      case 'memu':
      case 'traffic':
      case 'ohe':
      case 'kachav':
      case 'cw':
      case 'c&w':
      case 'pway':
      case 'p-way':
      case 'spad':
      case 'spadprevention':
        if (typeof DepartmentsPage !== 'undefined' && DepartmentsPage.render) {
          await DepartmentsPage.render(mainContent, viewName);
        } else {
          console.error('DepartmentsPage is not initialized. Retrying in 100ms...');
          mainContent.innerHTML = '<div class="card"><div class="muted" style="text-align: center; padding: 20px;">Initializing page content...</div></div>';
          setTimeout(() => NavigationService.loadPage(viewName), 100);
        }
        break;
      case 'search':
        // Load the ThreePhaseLocoPage which matches the FAULTS.html template
        if (typeof ThreePhaseLocoPage !== 'undefined') {
          // Hide top bar for full immersion
          const topBar = document.querySelector('.top-bar');
          if (topBar) topBar.style.display = 'none';

          ThreePhaseLocoPage.render(mainContent);
        } else {
          console.error('ThreePhaseLocoPage is not defined');
          mainContent.innerHTML = '<div class="card"><div class="card-title">Fault Search</div><div class="muted">Loading fault search interface...</div></div>';
        }
        break;
      case 'chalakMitra':
      case 'chalakmitra':
        if (document.querySelector('.top-bar')) document.querySelector('.top-bar').style.display = '';
        ChalakMitraPage.render(mainContent);
        break;
      case 'threePhaseLocoFaults':
      case 'threephaselocofaults':
        // Load the ThreePhaseLocoPage which matches the FAULTS.html template
        const loadThreePhaseLocoPage = () => {
          if (typeof ThreePhaseLocoPage !== 'undefined') {
            // Hide top bar for full immersion
            const topBar = document.querySelector('.top-bar');
            if (topBar) topBar.style.display = 'none';

            ThreePhaseLocoPage.render(mainContent);
          } else {
            console.error('ThreePhaseLocoPage is not defined');
            mainContent.innerHTML = '<div class="card"><div class="card-title">Fault Search</div><div class="muted">Loading fault search interface...</div></div>';
          }
        };

        // Attempt to load immediately, with fallback timeout
        loadThreePhaseLocoPage();
        break;
      case 'quiz':
        QuizPage.render(mainContent);
        break;
      case 'adminPanel':
        AdminPage.render(mainContent);
        break;
      case 'aboutNwrChalakMitra':
      case 'aboutnwrchalakmitra':
        if (typeof AboutPage !== 'undefined') {
          AboutPage.render(mainContent);
        } else {
          mainContent.innerHTML = '<div class="card"><div class="card-title">About NWR Chalak Mitra</div><div class="muted">Loading about page...</div></div>';
        }
        break;
      default:
        // Check if it's a dynamic main tab
        if (mainTab) {
          await DepartmentsPage.render(mainContent, viewName);
        } else {
          mainContent.innerHTML = '<div class="card"><div class="card-title">Page Not Found</div><div class="muted">The requested page does not exist.</div></div>';
        }
    }
  },

  // Update navigation states
  updateNavStates(viewName) {
    // Update sidebar items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update bottom nav items
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      // Handle mobileHome view - it should highlight the Home (dashboard) button
      if (viewName === 'mobileHome' && item.dataset.view === 'dashboard') {
        item.classList.add('active');
      }
      // Handle profile view matching
      else if (viewName === 'profile' && item.dataset.view === 'profile') {
        item.classList.add('active');
      } else if (item.dataset.view === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  // Handle view change
  onViewChange(viewName) {
    console.log(`[Navigation] onViewChange for '${viewName}'`);

    const contentScroll = document.querySelector('.content-scroll');
    if (contentScroll) {
      // Robust scroll to top for both container and window
      contentScroll.scrollTop = 0;
      window.scrollTo(0, 0);

      /**
       * Synchronize the WebView pull-to-refresh state with our scroll position
       */
      const syncRefreshState = () => {
        if (window.WebViewBridge && window.WebViewBridge.isInWebView()) {
          // Check both the div scroll and the window/body scroll
          // This ensures compatibility with both standard layout and the natural scroll fix
          const divScrollTop = contentScroll.scrollTop;
          const winScrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

          // Only enable refresh if we are at the very top of both containers
          const isAtTop = divScrollTop <= 5 && winScrollTop <= 5;

          // Send message to native app to enable/disable pull-to-refresh
          // type should match what the native Side (SwipeRefreshLayout) is looking for
          window.WebViewBridge.sendMessage('setRefreshEnabled', {
            enabled: isAtTop
          });

          // Also try fallback method if native uses it directly
          if (window.Android && typeof window.Android.setSwipeRefreshEnabled === 'function') {
            try { window.Android.setSwipeRefreshEnabled(isAtTop); } catch (e) { }
          }

          // CSS fallback to prevent propagation
          if (!isAtTop) {
            contentScroll.style.overscrollBehaviorY = 'contain';
            document.body.style.overscrollBehaviorY = 'contain';
          } else {
            contentScroll.style.overscrollBehaviorY = 'auto';
            document.body.style.overscrollBehaviorY = 'auto';
          }
        }
      };

      // Initial sync for the new view content
      syncRefreshState();

      // Add scroll and touch listeners if not already added
      if (!contentScroll._refreshListenerAdded) {
        // Listen on BOTH contentScroll and window/document for maximum reliability
        const events = ['scroll', 'touchstart', 'touchmove'];
        events.forEach(evt => {
          contentScroll.addEventListener(evt, syncRefreshState, { passive: true });
          window.addEventListener(evt, syncRefreshState, { passive: true });
        });

        // Update state on orientation change or resize
        window.addEventListener('resize', syncRefreshState);

        contentScroll._refreshListenerAdded = true;
      }
    }
    // Final safety scroll
    window.scrollTo(0, 0);

    // View-specific actions
    if (viewName === 'quiz') {
      QuizService.autofillCrewDetails();
    }

    // Refresh notification badges whenever view changes
    if (window.NotificationServiceV2) {
      NotificationServiceV2.updateUI();
    }
  }
};
