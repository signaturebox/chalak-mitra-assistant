// Authentication Service
const AuthService = {
  api: null, // Will be set after ApiService is loaded

  // Get API instance from global scope
  getApi: function () {
    // Try to get API from the global Api reference
    if (window.Api) {
      this.api = window.Api;
      return this.api;
    }
    // Try to get from the instance property
    if (this.api) {
      return this.api;
    }
    return null;
  },

  currentUser: {
    role: 'crew',
    name: '',
    cms: '',
    mobile: '',
    division: 'jaipur',
    hq: '',
    designation: '',
    logoDataUrl: null
  },

  // Initialize auth service
  init() {
    this.setupEventListeners();
    this.loadSavedState();
    this.updateUI();

    // Note: Login modal is no longer shown automatically on app start
    // It will only show when user tries to access protected tabs
  },

  // Setup event listeners
  setupEventListeners() {
    const btnLogin = document.getElementById('btnLogin');
    const regDivision = document.getElementById('regDivision');
    const adminRole = document.getElementById('adminRole');
    const adminDivision = document.getElementById('adminDivision');

    // Login button in header
    if (btnLogin) {
      btnLogin.addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('show');
        this.switchToCrewLogin();
      });
    }

    // Registration division change
    if (regDivision) {
      regDivision.addEventListener('change', () => {
        this.updateLobbyDropdown('regLobby', regDivision.value);
      });
    }

    // Admin role change
    if (adminRole) {
      adminRole.addEventListener('change', () => {
        this.updateAdminFormFields();
      });
    }

    // Admin division change
    if (adminDivision) {
      adminDivision.addEventListener('change', () => {
        this.updateLobbyDropdown('adminLobby', adminDivision.value);
      });
    }

    // Add Enter key listeners for login fields
    const loginInputs = [
      { id: 'crewCmsId', action: () => this.handleCrewLogin() },
      { id: 'crewPassword', action: () => this.handleCrewLogin() },
      { id: 'crewMobile', action: () => this.handleCrewLogin() },
      { id: 'crewOtp', action: () => this.handleCrewLogin() },
      { id: 'adminEmail', action: () => this.handleAdminLogin() },
      { id: 'adminPassword', action: () => this.handleAdminLogin() },
      { id: 'adminMobile', action: () => this.handleAdminLogin() },
      { id: 'adminOtp', action: () => this.handleAdminLogin() }
    ];

    loginInputs.forEach(input => {
      const elem = document.getElementById(input.id);
      if (elem) {
        elem.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            input.action();
          }
        });
      }
    });
  },

  // Switch to Crew Login
  switchToCrewLogin() {
    document.getElementById('crewLoginForm').style.display = 'block';
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('crewRoleTab').classList.add('active');
    document.getElementById('adminRoleTab').classList.remove('active');
    this.clearErrors();
  },

  // Switch to Admin Login
  switchToAdminLogin() {
    document.getElementById('crewLoginForm').style.display = 'none';
    document.getElementById('adminLoginForm').style.display = 'block';
    document.getElementById('adminRoleTab').classList.add('active');
    document.getElementById('crewRoleTab').classList.remove('active');
    this.updateAdminFormFields();
    this.clearErrors();
  },

  // Switch crew login method (password/otp)
  switchCrewMethod(method) {
    const pwdMethod = document.getElementById('crewPasswordMethod');
    const otpMethod = document.getElementById('crewOtpMethod');
    const pwdTab = document.getElementById('crewPwdMethodTab');
    const otpTab = document.getElementById('crewOtpMethodTab');

    if (method === 'password') {
      pwdMethod.style.display = 'block';
      otpMethod.style.display = 'none';
      pwdTab.classList.add('active');
      otpTab.classList.remove('active');
    } else {
      pwdMethod.style.display = 'none';
      otpMethod.style.display = 'block';
      otpTab.classList.add('active');
      pwdTab.classList.remove('active');
    }
    this.clearErrors();
  },

  // Switch admin login method (password/otp)
  switchAdminMethod(method) {
    const pwdMethod = document.getElementById('adminPasswordMethod');
    const otpMethod = document.getElementById('adminOtpMethod');
    const pwdTab = document.getElementById('adminPwdMethodTab');
    const otpTab = document.getElementById('adminOtpMethodTab');

    if (method === 'password') {
      pwdMethod.style.display = 'block';
      otpMethod.style.display = 'none';
      pwdTab.classList.add('active');
      otpTab.classList.remove('active');
    } else {
      pwdMethod.style.display = 'none';
      otpMethod.style.display = 'block';
      otpTab.classList.add('active');
      pwdTab.classList.remove('active');
    }
    this.clearErrors();
  },

  // Clear error messages
  clearErrors() {
    const errorElements = ['crewError', 'adminError', 'regError', 'forgotError'];
    errorElements.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) elem.textContent = '';
    });
  },

  // Update admin form fields based on role
  updateAdminFormFields() {
    const role = document.getElementById('adminRole').value;
    const divisionGroup = document.getElementById('adminDivisionGroup');
    const lobbyGroup = document.getElementById('adminLobbyGroup');

    if (role === 'super') {
      divisionGroup.style.display = 'none';
      lobbyGroup.style.display = 'none';
    } else if (role === 'division') {
      divisionGroup.style.display = 'block';
      lobbyGroup.style.display = 'none';
    } else if (role === 'lobby') {
      divisionGroup.style.display = 'block';
      lobbyGroup.style.display = 'block';
      const adminDivision = document.getElementById('adminDivision');
      if (adminDivision) {
        this.updateLobbyDropdown('adminLobby', adminDivision.value);
      }
    }
  },

  // Update lobby dropdown
  updateLobbyDropdown(selectId, division) {
    const lobbySelect = document.getElementById(selectId);
    if (!lobbySelect || !division) return;

    const lobbies = APP_CONFIG.lobbies[division] || [];
    lobbySelect.innerHTML = '<option value="">Select Lobby</option>';
    lobbies.forEach(lobby => {
      const option = document.createElement('option');
      option.value = lobby;
      option.textContent = lobby;
      lobbySelect.appendChild(option);
    });
  },

  // Handle crew login
  async handleCrewLogin() {
    const pwdMethod = document.getElementById('crewPasswordMethod');
    const isPasswordMethod = pwdMethod.style.display !== 'none';

    if (isPasswordMethod) {
      await this.crewLoginWithPassword();
    } else {
      await this.crewLoginWithOtp();
    }
  },

  // Crew login with password
  async crewLoginWithPassword() {
    const cmsId = document.getElementById('crewCmsId').value.trim();
    const password = document.getElementById('crewPassword').value;
    const errorElem = document.getElementById('crewError');

    if (!cmsId) {
      errorElem.textContent = 'Please enter your CMS ID';
      return;
    }

    if (!password || password.length < 6) {
      errorElem.textContent = 'Password must be at least 6 characters';
      return;
    }

    try {
      // Get API instance
      const api = this.getApi();

      // Check if API is available, otherwise fallback to localStorage
      if (api && typeof api.login === 'function') {
        const response = await api.login({
          identifier: cmsId,
          password: password
        });

        // Check if API is actually available (not just the function existing)
        if (response.api_available === false) {
          // API not available, fallback to localStorage
          const registeredCrews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};
          const crew = registeredCrews[cmsId];

          if (crew && crew.password === password) {
            // Check if user is an admin (they shouldn't be logging in via crew login)
            if (crew.role && crew.role !== 'crew') {
              errorElem.textContent = 'Admins must use the admin login window. Please use the Admin Login button.';
              return;
            }

            this.loginSuccess({
              name: crew.name,
              cms: crew.cms_id,
              mobile: crew.mobile,
              division: crew.division,
              hq: crew.lobby,
              designation: crew.designation,
              role: 'crew'
            });
          } else {
            errorElem.textContent = 'Invalid CMS ID or password';
          }
        } else {
          // API is available, process the response normally
          if (response.success) {
            // Check if user is an admin (they shouldn't be logging in via crew login)
            if (response.user.role && response.user.role !== 'crew') {
              errorElem.textContent = 'Admins must use the admin login window. Please use the Admin Login button.';
              return;
            }

            // Map cms_id to cms if needed
            const userData = response.user;
            if (userData.cms_id && !userData.cms) {
              userData.cms = userData.cms_id;
            }

            this.loginSuccess(userData);
          } else {
            errorElem.textContent = response.error || 'Login failed';
          }
        }
      } else {
        // Fallback to localStorage-based login for demo purposes
        const registeredCrews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};
        const crew = registeredCrews[cmsId];

        if (crew && crew.password === password) {
          this.loginSuccess({
            name: crew.name,
            cms: crew.cms_id,
            mobile: crew.mobile,
            division: crew.division,
            hq: crew.lobby,
            designation: crew.designation,
            role: 'crew'
          });
        } else {
          errorElem.textContent = 'Invalid CMS ID or password';
        }
      }
    } catch (error) {
      errorElem.textContent = 'Login failed: ' + error.message;
      console.error('Login error:', error);
    }
  },

  // Crew login with OTP
  async crewLoginWithOtp() {
    const mobile = document.getElementById('crewMobile').value.trim();
    const otp = document.getElementById('crewOtp').value.trim();
    const errorElem = document.getElementById('crewError');

    if (!mobile || mobile.length !== 10) {
      errorElem.textContent = 'Please enter valid 10-digit mobile number';
      return;
    }

    if (!otp || otp.length !== 6) {
      errorElem.textContent = 'Please enter 6-digit OTP';
      return;
    }

    try {
      // Get API instance
      const api = this.getApi();

      // Check if API is available, otherwise fallback to localStorage
      if (api && typeof api.login === 'function') {
        const response = await api.login({
          mobile: mobile,
          otp: otp
        });

        // Check if API is actually available (not just the function existing)
        if (response.api_available === false) {
          // API not available, fallback to localStorage
          const registeredCrews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};
          const crewEntries = Object.values(registeredCrews);
          const crew = crewEntries.find(c => c.mobile === mobile);

          if (crew && otp === '123456') { // Demo OTP
            this.loginSuccess({
              name: crew.name,
              cms: crew.cms_id,
              mobile: crew.mobile,
              division: crew.division,
              hq: crew.lobby,
              designation: crew.designation,
              role: 'crew'
            });
          } else {
            errorElem.textContent = 'Invalid mobile or OTP';
          }
        } else {
          // API is available, process the response normally
          if (response.success) {
            // Map cms_id to cms if needed
            const userData = response.user;
            if (userData.cms_id && !userData.cms) {
              userData.cms = userData.cms_id;
            }

            this.loginSuccess(userData);
          } else {
            errorElem.textContent = response.error || 'Login failed';
          }
        }
      } else {
        // Fallback to localStorage-based login for demo purposes
        const registeredCrews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};
        const crewEntries = Object.values(registeredCrews);
        const crew = crewEntries.find(c => c.mobile === mobile);

        if (crew && otp === '123456') { // Demo OTP
          this.loginSuccess({
            name: crew.name,
            cms: crew.cms_id,
            mobile: crew.mobile,
            division: crew.division,
            hq: crew.lobby,
            designation: crew.designation,
            role: 'crew'
          });
        } else {
          errorElem.textContent = 'Invalid mobile or OTP';
        }
      }
    } catch (error) {
      errorElem.textContent = 'Login failed: ' + error.message;
      console.error('Login error:', error);
    }
  },

  // Handle admin login
  async handleAdminLogin() {
    const pwdMethod = document.getElementById('adminPasswordMethod');
    const isPasswordMethod = pwdMethod.style.display !== 'none';

    if (isPasswordMethod) {
      await this.adminLoginWithPassword();
    } else {
      await this.adminLoginWithOtp();
    }
  },

  // Admin login with password
  async adminLoginWithPassword() {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const role = document.getElementById('adminRole').value;
    const errorElem = document.getElementById('adminError');

    let division = '';
    let lobby = '';

    if (role === 'division' || role === 'lobby') {
      division = document.getElementById('adminDivision').value;
    }

    if (role === 'lobby') {
      lobby = document.getElementById('adminLobby').value;
    }

    if (!email) {
      errorElem.textContent = 'Please enter your email/username';
      return;
    }

    if (!password || password.length < 4) {
      errorElem.textContent = 'Password must be at least 4 characters';
      return;
    }

    try {
      // Get API instance
      const api = this.getApi();

      // Check if API is available
      if (api && typeof api.login === 'function') {
        const response = await api.login({
          identifier: email,
          password: password
        });

        console.log('Admin login API response:', response);

        // Check if API is actually available (not just the function existing)
        if (response.api_available === false) {
          errorElem.textContent = 'Server is not available. Please ensure the server is running and connected.';
          return;
        }

        // API is available, process the response normally
        if (response.success) {
          // Check if user is a crew member (they shouldn't be logging in via admin login)
          if (response.user.role === 'crew') {
            errorElem.textContent = 'Crew members must use the crew login window. Please use the Crew Login button.';
            return;
          }

          // Map the server response to our expected format
          const userData = {
            name: response.user.name,
            email: response.user.email,
            cms: response.user.cms_id,
            mobile: response.user.mobile,
            division: response.user.division,
            hq: response.user.lobby,
            designation: response.user.designation,
            role: response.user.role,
            serverId: response.user.id
          };
          this.loginSuccess(userData);
        } else {
          errorElem.textContent = response.error || 'Login failed';
        }
      } else {
        errorElem.textContent = 'Server is not available. Please ensure the server is running and connected.';
      }
    } catch (error) {
      errorElem.textContent = 'Login failed: ' + error.message;
      console.error('Login error:', error);
    }
  },

  // Helper: Find admin in all localStorage sources
  findAdminInLocalStorage(email, password, role, division, lobby) {
    // This function is kept for backward compatibility but not used anymore
    return null;
  },

  // Admin login with OTP
  adminLoginWithOtp() {
    const mobile = document.getElementById('adminMobile').value.trim();
    const otp = document.getElementById('adminOtp').value.trim();
    const role = document.getElementById('adminRole').value;
    const errorElem = document.getElementById('adminError');

    if (!mobile || mobile.length !== 10) {
      errorElem.textContent = 'Please enter valid 10-digit mobile number';
      return;
    }

    if (!otp || otp.length !== 6) {
      errorElem.textContent = 'Please enter 6-digit OTP';
      return;
    }

    // Validate OTP (demo)
    if (otp !== '123456') {
      errorElem.textContent = 'Invalid OTP. Use 123456 for demo.';
      return;
    }

    errorElem.textContent = '';
    showNotification('Admin OTP login is a demo feature.', 'info');
  },

  // Login success
  loginSuccess(userData) {
    // Ensure we have a valid user data object
    if (!userData || typeof userData !== 'object') {
      console.error('Invalid user data received in loginSuccess:', userData);
      return;
    }

    // Update the current user with the new data
    this.currentUser = { ...this.currentUser, ...userData };

    // Ensure required fields are present
    if (!this.currentUser.cms && this.currentUser.cms_id) {
      this.currentUser.cms = this.currentUser.cms_id;
    }

    if (!this.currentUser.cms && !this.currentUser.email) {
      console.warn('User data missing required fields (cms or email)');
    }

    // Save user state to localStorage
    const saveResult = Storage.saveUserState(this.currentUser);
    if (!saveResult) {
      console.error('Failed to save user state to localStorage');
    }

    this.updateUI();

    // Dispatch user logged in event for real-time sync
    document.dispatchEvent(new CustomEvent('userLoggedIn', {
      detail: { user: this.currentUser }
    }));
    console.log('[Auth] userLoggedIn event dispatched');

    document.getElementById('loginModal').classList.remove('show');

    // Show profile button and user info, hide login button
    const btnLogin = document.getElementById('btnLogin');
    const btnProfile = document.getElementById('btnProfile');
    const btnLogout = document.getElementById('btnLogout');
    const userInfoDisplay = document.getElementById('userInfoDisplay');

    if (btnLogin) btnLogin.style.display = 'none';
    if (btnProfile) btnProfile.style.display = 'block';
    if (btnLogout) btnLogout.style.display = 'block';
    if (userInfoDisplay) {
      userInfoDisplay.style.display = 'block';
      const headerUserName = document.getElementById('headerUserName');
      const headerUserCms = document.getElementById('headerUserCms');
      if (headerUserName) headerUserName.textContent = this.currentUser.name;
      if (headerUserCms) headerUserCms.textContent = this.currentUser.cms || this.currentUser.email;
    }

    // Update navigation for user role
    if (window.app && typeof window.app.updateNavigationForRole === 'function') {
      window.app.updateNavigationForRole();
    }

    NavigationService.navigateTo('dashboard');

    // Refresh notifications immediately after login
    if (window.NotificationService) {
      console.log('🔄 Fetching notifications after login...');
      NotificationService.fetchNotificationsFromServer();
    }

    // Subscribe to push notifications
    if (window.PushNotificationService) {
      PushNotificationService.subscribeUserToTags(this.currentUser);
    }

    // Show beautiful welcome modal
    this.showWelcomeModal();
  },

  // Beautiful login welcome modal
  showWelcomeModal() {
    // Remove any existing modal
    const existingModal = document.getElementById('welcomeModal');
    if (existingModal) existingModal.remove();

    // Get user role display text
    const userRoleText = {
      'crew': 'Crew Member',
      'super': 'Super Admin',
      'division': 'Division Admin',
      'lobby': 'Lobby Admin'
    }[this.currentUser.role] || 'User';

    const modalHTML = `
      <div id="welcomeModal" style="
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.4s ease;
        padding: 20px;
      ">
        <div style="
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 28px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2), 0 10px 30px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          position: relative;
          overflow: hidden;
        ">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);"></div>
          <div style="
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
          ">
            <span style="font-size: 48px; color: white;">\ud83d\udc4b</span>
          </div>
          <h2 style="
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">Welcome Back!</h2>
          <p style="
            font-size: 18px;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 500;
          ">${this.currentUser.name || 'User'}</p>
          <p style="
            font-size: 15px;
            color: #94a3b8;
            margin-bottom: 28px;
            line-height: 1.6;
          ">You're now logged in as <strong style="color: #3b82f6; font-weight: 600;">${userRoleText}</strong><br>Access your dashboard and continue your work.</p>
          <div style="display: flex; justify-content: center; gap: 12px; margin-top: 20px;">
            <button onclick="document.getElementById('welcomeModal').remove()" style="
              padding: 16px 32px;
              border-radius: 14px;
              border: none;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
              transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(59, 130, 246, 0.5)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(59, 130, 246, 0.4)'">Continue to Dashboard</button>
          </div>
        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on backdrop click
    document.getElementById('welcomeModal').addEventListener('click', (e) => {
      if (e.target.id === 'welcomeModal') {
        document.getElementById('welcomeModal').remove();
      }
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      const modal = document.getElementById('welcomeModal');
      if (modal) modal.remove();
    }, 5000);
  },

  // Send crew OTP
  sendCrewOtp() {
    const mobile = document.getElementById('crewMobile').value.trim();
    if (!mobile || mobile.length !== 10) {
      showNotification('Please enter valid 10-digit mobile number', 'error');
      return;
    }
    showNotification(`OTP sent to ${mobile}. Use 123456 for demo.`, 'success');
  },

  // Send admin OTP
  sendAdminOtp() {
    const mobile = document.getElementById('adminMobile').value.trim();
    if (!mobile || mobile.length !== 10) {
      showNotification('Please enter valid 10-digit mobile number', 'error');
      return;
    }
    showNotification(`OTP sent to ${mobile}. Use 123456 for demo.`, 'success');
  },

  // Send forgot password OTP
  sendForgotOtp() {
    const mobile = document.getElementById('forgotMobile').value.trim();
    if (!mobile || mobile.length !== 10) {
      showNotification('Please enter valid 10-digit mobile number', 'error');
      return;
    }
    showNotification(`OTP sent to ${mobile}. Use 123456 for demo.`, 'success');
  },

  // Open registration modal
  openRegistration() {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('registrationModal').classList.add('show');
  },

  // Close registration modal
  closeRegistration() {
    document.getElementById('registrationModal').classList.remove('show');
    document.getElementById('loginModal').classList.add('show');
  },

  // Handle crew registration
  async handleRegistration() {
    const cmsId = document.getElementById('regCmsId').value.trim();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const designation = document.getElementById('regDesignation').value;
    const division = document.getElementById('regDivision').value;
    const lobby = document.getElementById('regLobby').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const errorElem = document.getElementById('regError');

    // Validate fields
    if (!cmsId || !name || !mobile || !designation || !division || !lobby) {
      errorElem.textContent = 'Please fill all required fields';
      return;
    }

    if (email && !email.includes('@')) {
      errorElem.textContent = 'Please enter a valid email address';
      return;
    }

    if (mobile.length !== 10) {
      errorElem.textContent = 'Mobile number must be 10 digits';
      return;
    }

    if (password.length < 6) {
      errorElem.textContent = 'Password must be at least 6 characters';
      return;
    }

    if (password !== confirmPassword) {
      errorElem.textContent = 'Passwords do not match';
      return;
    }

    try {
      // Get API instance
      const api = this.getApi();

      // Check if API is available, otherwise fallback to localStorage
      if (api && typeof api.register === 'function') {
        const response = await api.register({
          cms_id: cmsId,
          name,
          email: email || null,
          mobile,
          designation,
          division,
          lobby,
          password,
          confirm_password: confirmPassword
        });

        // Check if API is actually available (not just the function existing)
        if (response.api_available === false) {
          // API not available, fallback to localStorage
          const registeredCrews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};

          // Check if CMS ID, email, or mobile already exists
          const cmsExists = registeredCrews[cmsId];
          const emailExists = Object.values(registeredCrews).some(crew => crew.email === email);
          const mobileExists = Object.values(registeredCrews).some(crew => crew.mobile === mobile);

          if (cmsExists || emailExists || mobileExists) {
            errorElem.textContent = 'CMS ID, email, or mobile number already registered';
            return;
          }

          // Register new user in localStorage
          registeredCrews[cmsId] = {
            cms_id: cmsId,
            name,
            email: email || null,
            mobile,
            designation,
            division,
            lobby,
            password,
            created_at: new Date().toISOString()
          };

          Storage.save(APP_CONFIG.storage.registeredCrews, registeredCrews);

          errorElem.textContent = '';
          showNotification('Registration successful! You can now login.', 'success');

          // Clear form
          document.getElementById('regCmsId').value = '';
          document.getElementById('regName').value = '';
          document.getElementById('regEmail').value = '';
          document.getElementById('regMobile').value = '';
          document.getElementById('regDesignation').value = '';
          document.getElementById('regDivision').value = '';
          document.getElementById('regLobby').value = '';
          document.getElementById('regPassword').value = '';
          document.getElementById('regConfirmPassword').value = '';

          // Go back to login
          this.closeRegistration();
        } else {
          // API is available, process the response normally
          if (response.success) {
            errorElem.textContent = '';
            showNotification('Registration successful! You can now login.', 'success');

            // Clear form
            document.getElementById('regCmsId').value = '';
            document.getElementById('regName').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regMobile').value = '';
            document.getElementById('regDesignation').value = '';
            document.getElementById('regDivision').value = '';
            document.getElementById('regLobby').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';

            // Go back to login
            this.closeRegistration();
          } else {
            errorElem.textContent = response.error || 'Registration failed';
          }
        }
      } else {
        // Fallback to localStorage-based registration for demo purposes
        const registeredCrews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};

        // Check if CMS ID, email, or mobile already exists
        const cmsExists = registeredCrews[cmsId];
        const emailExists = Object.values(registeredCrews).some(crew => crew.email === email);
        const mobileExists = Object.values(registeredCrews).some(crew => crew.mobile === mobile);

        if (cmsExists || emailExists || mobileExists) {
          errorElem.textContent = 'CMS ID, email, or mobile number already registered';
          return;
        }

        // Register new user in localStorage
        registeredCrews[cmsId] = {
          cms_id: cmsId,
          name,
          email: email || null,
          mobile,
          designation,
          division,
          lobby,
          password,
          created_at: new Date().toISOString()
        };

        Storage.save(APP_CONFIG.storage.registeredCrews, registeredCrews);

        errorElem.textContent = '';
        showNotification('✅ Registration successful! You can now login.', 'success');

        // Clear form
        document.getElementById('regCmsId').value = '';
        document.getElementById('regName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regMobile').value = '';
        document.getElementById('regDesignation').value = '';
        document.getElementById('regDivision').value = '';
        document.getElementById('regLobby').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regConfirmPassword').value = '';

        // Go back to login
        this.closeRegistration();
      }
    } catch (error) {
      errorElem.textContent = 'Registration failed: ' + error.message;
      console.error('Registration error:', error);
    }
  },

  // Open forgot password modal
  openForgotPassword(userType) {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('forgotPasswordModal').classList.add('show');
  },

  // Close forgot password modal
  closeForgotPassword() {
    document.getElementById('forgotPasswordModal').classList.remove('show');
    document.getElementById('loginModal').classList.add('show');
  },

  // Handle password reset
  handlePasswordReset() {
    const mobile = document.getElementById('forgotMobile').value.trim();
    const otp = document.getElementById('forgotOtp').value.trim();
    const newPassword = document.getElementById('forgotNewPassword').value;
    const errorElem = document.getElementById('forgotError');

    if (!mobile || mobile.length !== 10) {
      errorElem.textContent = 'Please enter valid 10-digit mobile number';
      return;
    }

    if (!otp || otp.length !== 6) {
      errorElem.textContent = 'Please enter 6-digit OTP';
      return;
    }

    if (otp !== '123456') {
      errorElem.textContent = 'Invalid OTP. Use 123456 for demo.';
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      errorElem.textContent = 'Password must be at least 6 characters';
      return;
    }

    // Find crew by mobile and update password
    const crews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};
    const crewEntry = Object.entries(crews).find(([_, crew]) => crew.mobile === mobile);

    if (!crewEntry) {
      errorElem.textContent = 'Mobile number not registered';
      return;
    }

    const [cmsId, crew] = crewEntry;
    crews[cmsId].password = newPassword;
    Storage.save(APP_CONFIG.storage.registeredCrews, crews);

    errorElem.textContent = '';
    showNotification('✅ Password reset successful! Please login with new password.', 'success');

    // Clear form
    document.getElementById('forgotMobile').value = '';
    document.getElementById('forgotOtp').value = '';
    document.getElementById('forgotNewPassword').value = '';

    this.closeForgotPassword();
  },

  // Load saved state
  loadSavedState() {
    const savedState = Storage.loadUserState();
    if (savedState) {
      this.currentUser = { ...this.currentUser, ...savedState };

      // Ensure cms is mapped from cms_id if needed (fix for legacy sessions)
      if (this.currentUser.cms_id && !this.currentUser.cms) {
        this.currentUser.cms = this.currentUser.cms_id;
      }

      // If user is logged in, show profile button and user info
      if (savedState.cms || savedState.email) {
        const btnLogin = document.getElementById('btnLogin');
        const btnProfile = document.getElementById('btnProfile');
        const btnLogout = document.getElementById('btnLogout');
        const userInfoDisplay = document.getElementById('userInfoDisplay');
        const notificationBell = document.getElementById('notificationBell');

        if (btnLogin) btnLogin.style.display = 'none';
        if (btnProfile) btnProfile.style.display = 'block';
        if (btnLogout) btnLogout.style.display = 'block';
        if (userInfoDisplay) {
          userInfoDisplay.style.display = 'block';
          document.getElementById('headerUserName').textContent = savedState.name;
          document.getElementById('headerUserCms').textContent = savedState.cms || savedState.email;
        }

        // Show notification bell for logged-in users
        if (notificationBell) {
          notificationBell.style.display = 'flex';
        }

        // Update navigation for user role
        if (window.app && typeof window.app.updateNavigationForRole === 'function') {
          window.app.updateNavigationForRole();
        }

        // Subscribe to push notifications
        if (window.PushNotificationService) {
          PushNotificationService.subscribeUserToTags(this.currentUser);
        }
      }
    }
  },

  // Update UI
  updateUI() {
    const roleConfig = APP_CONFIG.roles[this.currentUser.role];

    // Update avatar
    const avatar = document.getElementById('avatar');
    if (avatar) {
      avatar.textContent = roleConfig.emoji;
    }

    // Update role label
    const roleLabel = document.getElementById('roleLabel');
    if (roleLabel) {
      roleLabel.textContent = roleConfig.label;
    }

    // Update notification bell visibility - show for ALL logged-in users
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) {
      // Show notification bell for all logged-in users (not just crew)
      if (this.currentUser.cms || this.currentUser.email) {
        notificationBell.style.display = 'flex';
        // Initialize notification service if needed
        if (window.NotificationService) {
          NotificationService.updateUI();
        }
      } else {
        notificationBell.style.display = 'none';
      }
    }
  },

  // Check if user can access a view
  canAccessView(viewName) {
    // Admin panel requires admin role
    if (viewName === 'adminPanel') {
      return APP_CONFIG.roles[this.currentUser.role].canAccessAdmin;
    }

    // These tabs require login
    const loginRequiredViews = [
      'nwrnotices', 'nwr notices',
      'divisions', 'divisions notices',
      'quiz', 'chalakmitra', 'chalakMitra',
      'profile'
    ];

    const normalizedView = viewName.toLowerCase().replace(/\s+/g, '');
    const requiresLogin = loginRequiredViews.some(v =>
      v.toLowerCase().replace(/\s+/g, '') === normalizedView
    );

    if (requiresLogin) {
      // Check if user is logged in (has cms or email)
      const isLoggedIn = !!(this.currentUser.cms || this.currentUser.email);
      console.log(`[Auth] canAccessView('${viewName}') -> ${isLoggedIn} (cms: ${this.currentUser.cms}, email: ${this.currentUser.email})`);
      return isLoggedIn;
    }

    return true;
  },

  // Check if a specific view requires login
  isLoginRequired(viewName) {
    const loginRequiredViews = [
      'nwrnotices', 'nwr notices',
      'divisions', 'divisionsnotices', 'divisions notices',
      'quiz', 'chalakmitra', 'chalakMitra',
      'profile'
    ];

    const normalizedView = viewName.toLowerCase().replace(/\s+/g, '');
    const requiresLogin = loginRequiredViews.some(v =>
      v.toLowerCase().replace(/\s+/g, '') === normalizedView
    );

    console.log(`[Auth] isLoginRequired('${viewName}') -> ${requiresLogin} (normalized: ${normalizedView})`);
    return requiresLogin;
  },

  // Get current user
  getUser() {
    return { ...this.currentUser };
  },

  // Logout
  logout() {
    // Show beautiful confirmation dialog
    this.showLogoutConfirmation();
  },

  // Beautiful logout confirmation dialog
  showLogoutConfirmation() {
    // Remove any existing modal
    const existingModal = document.getElementById('logoutConfirmModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="logoutConfirmModal" style="
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.3s ease;
      ">
        <div style="
          background: white;
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        ">
          <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 8px 24px rgba(251, 191, 36, 0.3);
          ">
            <span style="font-size: 40px;">\ud83d\udecf\ufe0f</span>
          </div>
          <h2 style="
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 12px;
          ">Leaving Already?</h2>
          <p style="
            font-size: 15px;
            color: #6b7280;
            margin-bottom: 28px;
            line-height: 1.6;
          ">You're about to sign out from NWR Chalak Mitra. You'll need to login again to access your account.</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button onclick="document.getElementById('logoutConfirmModal').remove()" style="
              padding: 14px 28px;
              border-radius: 12px;
              border: 2px solid #e5e7eb;
              background: white;
              color: #374151;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.background='#f3f4f6'; this.style.borderColor='#d1d5db'" 
               onmouseout="this.style.background='white'; this.style.borderColor='#e5e7eb'">Stay Logged In</button>
            <button onclick="AuthService.confirmLogout()" style="
              padding: 14px 28px;
              border-radius: 12px;
              border: none;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
              transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(239, 68, 68, 0.5)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.4)'">Yes, Logout</button>
          </div>
        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on backdrop click
    document.getElementById('logoutConfirmModal').addEventListener('click', (e) => {
      if (e.target.id === 'logoutConfirmModal') {
        document.getElementById('logoutConfirmModal').remove();
      }
    });
  },

  // Confirm logout action
  confirmLogout() {
    // Remove confirmation modal
    const modal = document.getElementById('logoutConfirmModal');
    if (modal) modal.remove();

    // Save username for goodbye message
    const userName = this.currentUser.name || 'User';

    // Call API to remove token/session
    const api = this.getApi();
    if (api && typeof api.removeToken === 'function') {
      api.removeToken();
    }

    this.currentUser = {
      role: 'crew',
      name: '',
      cms: '',
      mobile: '',
      division: 'jaipur',
      hq: '',
      designation: '',
      logoDataUrl: null
    };
    Storage.saveUserState(this.currentUser);

    // Hide profile button and user info, show login button
    const btnLogin = document.getElementById('btnLogin');
    const btnProfile = document.getElementById('btnProfile');
    const btnLogout = document.getElementById('btnLogout');
    const userInfoDisplay = document.getElementById('userInfoDisplay');

    if (btnLogin) btnLogin.style.display = 'block';
    if (btnProfile) btnProfile.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
    if (userInfoDisplay) userInfoDisplay.style.display = 'none';

    // Hide notification bell on logout
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) notificationBell.style.display = 'none';

    // Update navigation for user role (reset to crew view)
    if (window.app && typeof window.app.updateNavigationForRole === 'function') {
      window.app.updateNavigationForRole();
    }

    this.updateUI();
    NavigationService.navigateTo('dashboard');

    // Show login modal
    document.getElementById('loginModal').classList.add('show');

    showNotification(`Goodbye, ${userName}! You have been logged out successfully. See you soon!`, 'success');
  }
};
