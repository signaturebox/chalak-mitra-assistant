// Main Application Entry Point
class NWRChalakMitra {
  constructor() {
    this.initialized = false;
  }

  // Initialize the application
  init() {
    if (this.initialized) return;

    console.log(`🚆 Initializing ${APP_CONFIG.appName} v${APP_CONFIG.version}`);

    // Detect if we are in a WebView and add a helper class to the document
    // This is used for special layout adjustments on mobile
    if (window.WebViewBridge && window.WebViewBridge.isInWebView()) {
      document.documentElement.classList.add('is-webview');
      console.log('✓ WebView environment detected');
    }

    // Initialize services in order
    this.initializeServices();

    // Load initial page
    this.loadInitialPage();

    // Mark as initialized
    this.initialized = true;

    console.log('✅ Application initialized successfully');
  }

  // Initialize all services
  initializeServices() {
    try {
      // Navigation service
      NavigationService.init();
      console.log('✓ Navigation service initialized');

      // Auth service (must be early for user data)
      AuthService.init();
      console.log('✓ Auth service initialized');

      // Push notification service
      if (window.PushNotificationService && typeof window.PushNotificationService.init === 'function') {
        window.PushNotificationService.init();
        console.log('✓ Push notification service initialized');
      }

      // Notification service v2 (Consolidated)
      if (window.NotificationServiceV2) {
        // V2 self-initializes on DOMContentLoaded, but we can ensure it's ready
        console.log('✓ Notification Service V2 ready');
      }

      // Real-time Data Sync (Now handled by NotificationServiceV2)
      // DataSyncService.init();
      console.log('✓ DataSyncService disabled (consolidated)');

      // Sync content from server
      if (typeof ContentManagementService !== 'undefined') {
        console.log('📡 Starting server sync...');
        ContentManagementService.syncAllContent().then(() => {
          console.log('✓ Server content synced');
        }).catch(err => {
          console.error('❌ Server sync failed:', err);
        });
      } else {
        console.warn('⚠️ ContentManagementService not available');
      }

      // Update navigation for role
      this.updateNavigationForRole();

      // Admin service (logo preview)
      const logoData = Storage.loadLogo();
      if (logoData) {
        const headerLogo = document.getElementById('headerLogo');
        if (headerLogo) {
          headerLogo.innerHTML = `<img src="${logoData}" style="max-width: 40px; max-height: 40px; border-radius: 8px;" />`;
        }
      }
      console.log('✓ Logo service initialized');

    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }

  // Load initial page
  loadInitialPage() {
    try {
      // On mobile, go directly to mobile home to avoid showing Overview briefly
      const initialView = isMobile() ? 'mobileHome' : 'dashboard';

      // Replace the current history state with the initial view
      // This ensures the back button works correctly
      try {
        const state = { view: initialView, timestamp: Date.now(), isInitial: true };
        window.history.replaceState(state, '', `#${initialView}`);
        NavigationService.viewHistory = [initialView];
      } catch (e) {
        console.warn('[Navigation] Failed to set initial state:', e);
      }

      NavigationService.navigateTo(initialView);
      console.log('✓ Initial page loaded:', initialView);
    } catch (error) {
      console.error('Error loading initial page:', error);
    }
  }

  // Update navigation based on user role
  updateNavigationForRole() {
    const user = AuthService.getUser();
    const isAdmin = user.role !== 'crew';

    // Desktop sidebar - hide/show Admin Panel
    const adminNavItem = document.getElementById('adminNav');
    if (adminNavItem) {
      adminNavItem.style.display = isAdmin ? 'block' : 'none';
    }

    // Mobile bottom nav - show Profile for crew, Admin for admins
    const bottomNavAdmin = document.querySelector('.bottom-nav-item[data-view="adminPanel"]');
    if (bottomNavAdmin) {
      if (isAdmin) {
        bottomNavAdmin.innerHTML = `
          <div style="font-size: 16px;">⚙️</div>
          <div>Admin</div>
        `;
        bottomNavAdmin.dataset.view = 'adminPanel';
      } else {
        bottomNavAdmin.innerHTML = `
          <div style="font-size: 16px;">👤</div>
          <div>Profile</div>
        `;
        bottomNavAdmin.dataset.view = 'profile';
      }
    }
  }
}

// API service is loaded from index.html via script tag
// Use the global Api instance (don't redeclare)
if (!window.Api) {
  console.error('API service not found! Make sure apiService.js is loaded.');
}

// Create a local reference without using const/let/var to avoid redeclaration
// The Api variable is already declared in apiService.js
// We just need to ensure it's available for use in this file

// Load API service function is not needed since it's loaded statically
async function loadApiService() {
  try {
    console.log('✓ API service loaded');

    // Set API reference in services that need it
    if (window.AuthService) {
      window.AuthService.api = window.Api;
      console.log('✓ AuthService connected to API');
    }

    if (window.SearchService) {
      window.SearchService.api = window.Api;
      console.log('✓ SearchService connected to API');
    }

    // Load quiz service
    await import('./services/quiz.js');
    console.log('✓ Quiz service loaded');

    // Initialize quiz service
    if (window.QuizService && typeof QuizService.init === 'function') {
      QuizService.init();
    }

    // Wait for QuizService to be fully initialized
    let attempts = 0;
    while (attempts < 20 && typeof QuizService === 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 150));
      attempts++;
    }

    if (typeof QuizService !== 'undefined') {
      QuizService.api = window.Api;
      console.log('✓ QuizService connected to API');
    } else {
      console.warn('QuizService not available for API connection');
    }

    // Connect QuizResultsService to API
    if (typeof QuizResultsService !== 'undefined') {
      QuizResultsService.api = window.Api;
      console.log('✓ QuizResultsService connected to API');
    }

    // Connect QuizQuestionsService to API if available
    if (typeof QuizQuestionsService !== 'undefined') {
      QuizQuestionsService.api = window.Api;
      console.log('✓ QuizQuestionsService connected to API');
    }

    console.log('✓ API service loaded and connected to services');
  } catch (error) {
    console.error('Failed to load API service:', error);
    // Fallback: try to set the global Api if it's already available
    if (window.Api) {
      console.log('Using fallback API service');
    } else {
      console.error('No API service available');
    }
  }
}

// Hide splash screen
function hideSplashScreen() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    // Add exit animation
    splash.style.animation = 'fadeOutDown 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';

    // Remove from DOM after transition
    setTimeout(() => {
      if (splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
    }, 600);
  }
}

// Add fadeOutDown animation to CSS (we'll inject it)
function injectExitAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(30px);
      }
    }
  `;
  document.head.appendChild(style);
}

// Inject the animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  injectExitAnimation();
});

// Handle window resize for splash screen
function handleSplashResize() {
  const splashImage = document.querySelector('.splash-image');
  if (splashImage) {
    // Force reflow to ensure proper sizing
    splashImage.style.maxWidth = '90vw';
    splashImage.style.maxHeight = '90vh';

    // Adjust for different screen sizes
    if (window.innerWidth >= 1200) {
      splashImage.style.maxWidth = '60vw';
      splashImage.style.maxHeight = '60vh';
    } else if (window.innerWidth >= 768) {
      splashImage.style.maxWidth = '70vw';
      splashImage.style.maxHeight = '70vh';
    }
  }
}

// Add resize listener
window.addEventListener('resize', handleSplashResize);

// Show splash screen for minimum duration
function showSplashScreen(minDuration = 2000) {
  return new Promise(resolve => {
    setTimeout(() => {
      hideSplashScreen();
      resolve();
    }, minDuration);
  });
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('[App] Starting initialization sequence...');
    // Initial resize handling
    handleSplashResize();

    // Show splash screen for at least 2 seconds
    await showSplashScreen(1500);

    // Register service worker for push notifications and offline mode
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/OneSignalSDKWorker.js')
        .then(function (registration) {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch(function (error) {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Load API service first
    console.log('[App] Loading API service...');
    await loadApiService();

    // Initialize lobbies from localStorage if available
    const savedLobbies = Storage.load(APP_CONFIG.storage.lobbies, true);
    if (savedLobbies) {
      APP_CONFIG.lobbies = savedLobbies;
    }

    console.log('[App] Creating main application instance...');
    window.app = new NWRChalakMitra();

    // Initialize services after API is loaded
    console.log('[App] Initializing services...');
    window.app.initializeServices();

    console.log('[App] Loading initial page...');
    window.app.loadInitialPage();

    window.app.initialized = true;
    console.log('🚀 Application started successfully');

  } catch (error) {
    console.error('💥 Critical application error during startup:', error);
    // Even if there's an error, try to hide the splash screen so user doesn't see a stuck loader
    setTimeout(() => {
      hideSplashScreen();
      // If everything is white, at least show an error message
      const mainContent = document.getElementById('mainContent');
      if (mainContent && !mainContent.innerHTML) {
        mainContent.innerHTML = `<div class="card" style="margin:20px; color: #ef4444; border: 1px solid #fee2e2; background: #fffafb;">
                <div class="card-title">Startup Error</div>
                <div class="muted">The application encountered a problem during startup. Please refresh the page.</div>
                <pre style="font-size: 10px; margin-top: 10px; color: #991b1b;">${error.stack || error.message}</pre>
            </div>`;
      }
    }, 1000);
  } finally {
    // Safety check to hide splash
    setTimeout(hideSplashScreen, 3000);
  }
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ Application error:', event.error || event.message);
});

// Load quiz questions service
async function loadQuizQuestionsService() {
  try {
    await import('./services/quizQuestions.js');
    console.log('✓ Quiz Questions service loaded');

    // Initialize quiz questions service
    if (window.QuizQuestionsService && typeof QuizQuestionsService.init === 'function') {
      QuizQuestionsService.init();
    }

    // Wait for both services to be available
    let attempts = 0;
    while (attempts < 20 && (!window.Api || !window.QuizQuestionsService)) {
      await new Promise(resolve => setTimeout(resolve, 150));
      attempts++;
    }

    // Connect API if available
    if (window.Api && window.QuizQuestionsService) {
      QuizQuestionsService.api = window.Api;
      console.log('✓ Quiz Questions service connected to API');
    } else {
      console.warn('Quiz Questions service or API not available for connection');
      console.log('Available services:', { Api: !!window.Api, QuizQuestionsService: !!window.QuizQuestionsService });
    }
  } catch (error) {
    console.error('Failed to load Quiz Questions service:', error);
  }
}

// Load quiz results service
async function loadQuizResultsService() {
  try {
    await import('./services/quizResults.js');
    console.log('✓ Quiz Results service loaded');

    // Initialize quiz results service
    if (window.QuizResultsService && typeof QuizResultsService.init === 'function') {
      QuizResultsService.init();
    }

    // Wait for both services to be available
    let attempts = 0;
    while (attempts < 20 && (!window.Api || !window.QuizResultsService)) {
      await new Promise(resolve => setTimeout(resolve, 150));
      attempts++;
    }

    // Connect API if available
    if (window.Api && window.QuizResultsService) {
      QuizResultsService.api = Api;
      console.log('✓ Quiz Results service connected to API');
    } else {
      console.warn('Quiz Results service or API not available for connection');
      console.log('Available services:', { Api: !!window.Api, QuizResultsService: !!window.QuizResultsService });
    }
  } catch (error) {
    console.error('Failed to load Quiz Results service:', error);
  }
}

// Call the function to load the quiz questions service
loadQuizQuestionsService();

// Call the function to load the quiz results service
loadQuizResultsService();

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
