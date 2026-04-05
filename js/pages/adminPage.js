// Admin Page
const AdminPage = {
  // Make globally available
  init() {
    window.AdminPage = this;
  },
  render(container) {
    const user = AuthService.getUser();
    const userRole = user.role;

    // User Management section (only for super and division admins)
    let userManagementHTML = '';

    if (PermissionsService.canViewUserManagement(user)) {
      const canCreateDivisionAdmin = PermissionsService.canCreateDivisionAdmin(user);
      const canCreateLobbyAdmin = PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user);

      userManagementHTML = `
        <div class="card admin-section collapsible-section">
          <div class="section-header" onclick="AdminPage.toggleSection(this)">
            <div class="section-header-content">
              <span class="material-icons section-icon">group</span>
              <div>
                <div class="section-title">User Management</div>
                <div class="section-subtitle">
                  ${PermissionsService.isSuperAdmin(user) ? 'Create Division Admins and Lobby Admins' : 'Create Lobby Admins for your division'}
                </div>
              </div>
            </div>
            <span class="material-icons toggle-icon">expand_more</span>
          </div>
          
          <div class="section-content">
            ${canCreateDivisionAdmin ? `
            <div class="user-create-card">
              <div class="user-create-header">
                <span class="material-icons">person_add</span>
                <span>Create Division Admin</span>
              </div>
              <div class="user-create-form">
                <input type="email" id="divAdminEmail" placeholder="📧 Email Address" class="modern-input" />
                <input type="password" id="divAdminPassword" placeholder="🔒 Password" class="modern-input" />
                <select id="divAdminDivision" class="modern-select">
                  <option value="jaipur">🚂 JAIPUR</option>
                  <option value="ajmer">🚂 AJMER</option>
                  <option value="jodhpur">🚂 JODHPUR</option>
                  <option value="bikaner">🚂 BIKANER</option>
                </select>
                <button class="btn-modern btn-primary" id="btnCreateDivAdmin">
                  <span class="material-icons">add_circle</span>
                  <span>Create Division Admin</span>
                </button>
              </div>
            </div>
            ` : ''}
            
            ${canCreateLobbyAdmin ? `
            <div class="user-create-card">
              <div class="user-create-header">
                <span class="material-icons">admin_panel_settings</span>
                <span>Create Lobby Admin</span>
              </div>
              <div class="user-create-form">
                <input type="email" id="lobbyAdminEmail" placeholder="📧 Email Address" class="modern-input" />
                <input type="password" id="lobbyAdminPassword" placeholder="🔒 Password" class="modern-input" />
                <select id="lobbyAdminDivision" ${PermissionsService.isDivisionAdmin(user) ? 'disabled' : ''} class="modern-select">
                  <option value="${user.division}">${user.division.toUpperCase()}</option>
                  ${PermissionsService.isSuperAdmin(user) ? `
                    <option value="jaipur">🚂 JAIPUR</option>
                    <option value="ajmer">🚂 AJMER</option>
                    <option value="jodhpur">🚂 JODHPUR</option>
                    <option value="bikaner">🚂 BIKANER</option>
                  ` : ''}
                </select>
                <select id="lobbyAdminLobby" class="modern-select">
                  <option value="">Select Lobby</option>
                </select>
                <button class="btn-modern btn-primary" id="btnCreateLobbyAdmin">
                  <span class="material-icons">add_circle</span>
                  <span>Create Lobby Admin</span>
                </button>
              </div>
            </div>
            ` : ''}
            
            <div id="usersList" class="users-list-container"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = `
      <div class="page active" id="adminPage">
        <!-- Premium Admin Hero Section (gradient only, no photo) -->
        <div class="admin-hero" style="min-height: 180px; border-radius: 24px; margin-bottom: 24px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 160px; height: 160px; background: rgba(255,255,255,0.04); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; right: 60px; width: 100px; height: 100px; background: rgba(255,255,255,0.03); border-radius: 50%;"></div>
            <div class="admin-hero-content" style="padding: 24px; display: flex; align-items: center; position: relative; z-index: 2;">
                <div style="width: 52px; height: 52px; font-size: 26px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">👤</div>
                <div style="margin-left: 16px;">
                    <h1 style="font-size: 20px; font-weight: 800; color: white; margin: 0; letter-spacing: -0.5px;">Admin Control Panel</h1>
                    <p style="font-size: 12px; color: rgba(255,255,255,0.65); margin: 4px 0 12px;">Super / Division / Lobby Admin</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="background: rgba(255,255,255,0.12); backdrop-filter: blur(5px); padding: 4px 12px; border-radius: 20px; font-size: 11px; color: white; border: 1px solid rgba(255,255,255,0.15); font-weight: 700;">
                            ${user.role.toUpperCase()}
                        </span>
                        <span style="background: rgba(255,255,255,0.12); backdrop-filter: blur(5px); padding: 4px 12px; border-radius: 20px; font-size: 11px; color: white; border: 1px solid rgba(255,255,255,0.15); font-weight: 700;">
                            ${user.division?.toUpperCase() || 'NWR'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Admin Navigation Tabs as Premium Cards -->
        <div class="admin-tabs admin-tabs-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 24px; background: transparent; padding: 0;">
          <button class="admin-tab-btn active" data-tab="management" style="height: auto; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; flex-direction: column; gap: 8px;">
            <div class="admin-tab-icon-wrapper" style="width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span class="material-icons" style="font-size: 18px; color: #1e293b;">build</span>
            </div>
            <span style="font-weight: 600; font-size: 12px; color: #64748b;">Management</span>
          </button>
          
          <button class="admin-tab-btn" data-tab="quiz-results" style="height: auto; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; flex-direction: column; gap: 8px;">
            <div class="admin-tab-icon-wrapper" style="width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span class="material-icons" style="font-size: 18px; color: #1e293b;">poll</span>
            </div>
            <span style="font-weight: 600; font-size: 12px; color: #64748b;">Quiz Results</span>
          </button>
          
          ${PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user) ? `
          <button class="admin-tab-btn" data-tab="quiz-questions" style="height: auto; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; flex-direction: column; gap: 8px;">
            <div class="admin-tab-icon-wrapper" style="width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span class="material-icons" style="font-size: 18px; color: #1e293b;">quiz</span>
            </div>
            <span style="font-weight: 600; font-size: 12px; color: #64748b;">Questions</span>
          </button>` : ''}
          
          <button class="admin-tab-btn" data-tab="support-tickets" style="height: auto; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; flex-direction: column; gap: 8px;">
            <div class="admin-tab-icon-wrapper" style="width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span class="material-icons" style="font-size: 18px; color: #1e293b;">support_agent</span>
            </div>
            <span style="font-weight: 600; font-size: 12px; color: #64748b;">Support</span>
          </button>
          
          <button class="admin-tab-btn" data-tab="feedback-review" style="height: auto; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; flex-direction: column; gap: 8px;">
            <div class="admin-tab-icon-wrapper" style="width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span class="material-icons" style="font-size: 18px; color: #1e293b;">rate_review</span>
            </div>
            <span style="font-weight: 600; font-size: 12px; color: #64748b;">Feedback</span>
          </button>
          ${PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user) ? `
          <button class="admin-tab-btn" data-tab="popup-management" style="height: auto; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; flex-direction: column; gap: 8px;">
            <div class="admin-tab-icon-wrapper" style="width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span class="material-icons" style="font-size: 18px; color: #1e293b;">campaign</span>
            </div>
            <span style="font-weight: 600; font-size: 12px; color: #64748b;">Popups</span>
          </button>` : ''}
        </div>

        <div id="adminTabContent">
          <!-- Management Tab Content -->
          <div class="admin-tab-content active" data-content="management">
            ${userManagementHTML}
                  
        ${PermissionsService.canAddMainTab(user) ? `
        <div class="card admin-section collapsible-section">
          <div class="section-header" onclick="AdminPage.toggleSection(this)">
            <div class="section-header-content">
              <span class="material-icons section-icon">tab</span>
              <div>
                <div class="section-title">Main Tab Management</div>
                <div class="section-subtitle">Manage railway department main navigation tabs</div>
              </div>
            </div>
            <span class="material-icons toggle-icon">expand_more</span>
          </div>
          
          <div class="section-content" style="display: none;">
            <button class="btn-modern btn-primary" onclick="AdminPage.showAddMainTabDialog()" style="margin-bottom: 16px;">
              <span class="material-icons">add_circle</span>
              <span>Add New Main Tab</span>
            </button>
            <div id="mainTabListContainer"></div>
          </div>
        </div>
        ` : ''}
        
        ${(PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user)) ? `
        <div class="card admin-section collapsible-section">
          <div class="section-header" onclick="AdminPage.toggleSection(this)">
            <div class="section-header-content">
              <span class="material-icons section-icon">folder_special</span>
              <div>
                <div class="section-title">Division Tab Management</div>
                <div class="section-subtitle">
                  ${PermissionsService.isSuperAdmin(user) ? 'Manage division-specific tabs across all divisions' : 'Manage tabs for your division'}
                </div>
              </div>
            </div>
            <span class="material-icons toggle-icon">expand_more</span>
          </div>
          
          <div class="section-content" style="display: none;">
            <button class="btn-modern btn-primary" onclick="ContentManagementService.showAddDivisionTabModal()" style="margin-bottom: 16px;">
              <span class="material-icons">add_circle</span>
              <span>Add Division Tab</span>
            </button>
            <div id="divisionTabListContainer"></div>
          </div>
        </div>
        ` : ''}
        
        ${(PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user)) ? `
        <div class="card admin-section collapsible-section">
          <div class="section-header" onclick="AdminPage.toggleSection(this)">
            <div class="section-header-content">
              <span class="material-icons section-icon">location_city</span>
              <div>
                <div class="section-title">Lobby Management</div>
                <div class="section-subtitle">
                  ${PermissionsService.isSuperAdmin(user) ? 'Manage lobbies across all divisions' : 'Manage lobbies for your division'}
                </div>
              </div>
            </div>
            <span class="material-icons toggle-icon">expand_more</span>
          </div>
          
          <div class="section-content" style="display: none;">
            <button class="btn-modern btn-primary" onclick="LobbyManagementService.showAddLobbyForm(AuthService.getUser())" style="margin-bottom: 16px;">
              <span class="material-icons">add_circle</span>
              <span>Add New Lobby</span>
            </button>
            <div id="lobbyListContainer">${LobbyManagementService.renderLobbyManagement(user)}</div>
          </div>
        </div>
        ` : ''}

        ${PermissionsService.isSuperAdmin(user) ? `
        <div class="card admin-section collapsible-section">
          <div class="section-header" onclick="AdminPage.toggleSection(this)">
            <div class="section-header-content">
              <span class="material-icons section-icon">image</span>
              <div>
                <div class="section-title">Site Logo Management</div>
                <div class="section-subtitle">Upload site logo (PNG/JPEG). Will appear in header and certificates.</div>
              </div>
            </div>
            <span class="material-icons toggle-icon">expand_more</span>
          </div>
          
          <div class="section-content" style="display: none;">
            <div class="logo-upload-container">
              <div class="file-upload-area">
                <span class="material-icons upload-icon">cloud_upload</span>
                <div class="upload-text">Click or drag logo image here</div>
                <input type="file" id="siteLogoUploader" accept="image/*" class="file-input" />
              </div>
              <div id="logoPreview" class="logo-preview-modern"></div>
            </div>
          </div>
        </div>` : ''}

        ${PermissionsService.isSuperAdmin(user) ? `
        <div class="card admin-section collapsible-section">
          <div class="section-header" onclick="AdminPage.toggleSection(this)">
            <div class="section-header-content">
              <span class="material-icons section-icon">archive</span>
              <div>
                <div class="section-title">Project Export</div>
                <div class="section-subtitle">Download complete project as ZIP (includes HTML and logo).</div>
              </div>
            </div>
            <span class="material-icons toggle-icon">expand_more</span>
          </div>
          
          <div class="section-content" style="display: none;">
            <div class="export-container">
              <div class="export-info">
                <span class="material-icons export-info-icon">info</span>
                <div>
                  <div class="export-info-title">What's included in the ZIP file:</div>
                  <ul class="export-list">
                    <li><span class="material-icons">check_circle</span> All HTML files and pages</li>
                    <li><span class="material-icons">check_circle</span> CSS stylesheets</li>
                    <li><span class="material-icons">check_circle</span> JavaScript files</li>
                    <li><span class="material-icons">check_circle</span> Uploaded site logo</li>
                    <li><span class="material-icons">check_circle</span> Complete project structure</li>
                  </ul>
                </div>
              </div>
              <button id="btnDownloadZip" class="btn-modern btn-primary btn-large">
                <span class="material-icons">download</span>
                <span>Download Project ZIP</span>
              </button>
            </div>
          </div>
        </div>` : ''}

        ${PermissionsService.isSuperAdmin(user) ? `
        <div class="card admin-section collapsible-section">
          <div class="section-header" onclick="AdminPage.toggleSection(this)">
            <div class="section-header-content">
              <span class="material-icons section-icon">cloud_download</span>
              <div>
                <div class="section-title">External Data Integration</div>
                <div class="section-subtitle">Connect to external systems and fetch data</div>
              </div>
            </div>
            <span class="material-icons toggle-icon">expand_more</span>
          </div>
          
          <div class="section-content" style="display: none;">
            <div class="api-integration-container">
              <div class="form-group">
                <label>API Endpoint URL</label>
                <input type="url" id="apiEndpointUrl" placeholder="https://api.example.com/data" class="modern-input" />
              </div>
              <div class="form-group">
                <label>API Key (if required)</label>
                <input type="password" id="apiAuthKey" placeholder="Enter authentication key" class="modern-input" />
              </div>
              <div class="form-group">
                <label>Data Type</label>
                <select id="apiDataType" class="modern-select">
                  <option value="files">Files/Documents</option>
                  <option value="notices">Notices/Announcements</option>
                  <option value="loco_data">Locomotive Data</option>
                  <option value="safety_data">Safety Information</option>
                  <option value="custom">Custom Data</option>
                </select>
              </div>
              <div class="form-group">
                <label>Update Frequency</label>
                <select id="apiUpdateFreq" class="modern-select">
                  <option value="manual">Manual Only</option>
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div class="form-group" style="display: flex; gap: 8px;">
                <button class="btn-modern btn-primary" onclick="AdminPage.testApiConnection()" style="flex: 1;">
                  <span class="material-icons">sync</span>
                  <span>Test Connection</span>
                </button>
                <button class="btn-modern btn-primary" onclick="AdminPage.fetchExternalData()" style="flex: 1;">
                  <span class="material-icons">download</span>
                  <span>Fetch Data</span>
                </button>
                <button class="btn-modern" onclick="AdminPage.previewExternalData()" style="flex: 1;">
                  <span class="material-icons">preview</span>
                  <span>Preview</span>
                </button>
              </div>
              <div id="apiStatus" class="api-status-indicator" style="display: none; padding: 12px; margin-top: 12px; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span id="apiStatusIcon">⏳</span>
                  <span id="apiStatusText">Testing connection...</span>
                </div>
              </div>
            </div>
          </div>
        </div>` : ''}
        
        ${PermissionsService.isSuperAdmin(user) ? `
        <div class="card admin-section collapsible-section">
          <div class="section-header" onclick="AdminPage.toggleSection(this)">
            <div class="section-header-content">
              <span class="material-icons section-icon">settings</span>
              <div>
                <div class="section-title">Admin Actions</div>
                <div class="section-subtitle">Quick access to content management tools</div>
              </div>
            </div>
            <span class="material-icons toggle-icon">expand_more</span>
          </div>
          
          <div class="section-content" style="display: none;">
            <div class="admin-actions-grid">
              ${PermissionsService.getAllowedActions(user).canAddFolder ? `
                <button id="btnAddFolder" class="action-card">
                  <span class="material-icons action-icon">create_new_folder</span>
                  <div class="action-title">Add Folder</div>
                  <div class="action-desc">Create a new folder</div>
                </button>
              ` : ''}
              ${PermissionsService.canAddMainTab(user) ? `
                <button id="btnAddMainTab" class="action-card">
                  <span class="material-icons action-icon">tab</span>
                  <div class="action-title">Add Main Tab</div>
                  <div class="action-desc">Create main navigation tab</div>
                </button>
              ` : ''}
              ${(PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user)) ? `
                <button id="btnAddDivisionTab" class="action-card">
                  <span class="material-icons action-icon">folder_special</span>
                  <div class="action-title">Add Division Tab</div>
                  <div class="action-desc">Create division-specific tab</div>
                </button>
              ` : ''}
              ${PermissionsService.getAllowedActions(user).canUploadFile ? `
                <button id="btnUploadFile" class="action-card">
                  <span class="material-icons action-icon">upload_file</span>
                  <div class="action-title">Upload File</div>
                  <div class="action-desc">Upload content files</div>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
        ` : ''}
          </div>
          
          <!-- Quiz Results Tab Content -->
          <div class="admin-tab-content" data-content="quiz-results">
            <div id="quizResultsContent"></div>
          </div>
          
          <!-- Quiz Questions Tab Content -->
          <div class="admin-tab-content" data-content="quiz-questions">
            <div id="quizQuestionsContent"></div>
          </div>

          <!-- Support Tickets Tab Content -->
          <div class="admin-tab-content" data-content="support-tickets">
            <div class="card admin-section">
                <div class="section-header">
                    <div class="section-title">Support Tickets</div>
                    <button class="btn-sm btn-primary" onclick="AdminPage.loadSupportTickets()">Refresh</button>
                </div>
                <div id="supportTicketsList" class="tickets-list">
                    <div class="loading-spinner">Loading tickets...</div>
                </div>
            </div>
          </div>

          <!-- Feedback Tab Content -->
          <div class="admin-tab-content" data-content="feedback-review">
            <div class="card admin-section">
                <div class="section-header">
                    <div class="section-title">User Feedback</div>
                    <button class="btn-sm btn-primary" onclick="AdminPage.loadFeedback()">Refresh</button>
                </div>
                <div id="feedbackList" class="feedback-list">
                    <div class="loading-spinner">Loading feedback...</div>
                </div>
            </div>
          </div>
          
          <!-- Popup Management Tab Content -->
          <div class="admin-tab-content" data-content="popup-management">
            <div class="card admin-section">
                <div class="section-header">
                    <div class="section-title">📢 Popup Message Management</div>
                    <button class="btn-sm btn-primary" onclick="AdminPage.loadPopupManagement()">Refresh</button>
                </div>
                <div style="padding: 16px;">
                    <button class="btn-modern btn-primary" onclick="AdminPage.showCreatePopupModal()" style="margin-bottom: 16px;">
                        <span class="material-icons">add_circle</span>
                        <span>Create New Popup</span>
                    </button>
                    <div id="popupManagementList">
                        <div class="loading-spinner">Loading popups...</div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize admin features
    setTimeout(() => {
      AdminService.init();
      AdminService.refreshLogoPreview();

      // Admin tabs navigation
      this.initializeAdminTabs();

      // Add click feedback to admin tabs
      setTimeout(() => {
        const tabBtns = document.querySelectorAll('.admin-tab-btn');
        tabBtns.forEach(btn => {
          btn.addEventListener('click', function (e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
              ripple.remove();
            }, 600);
          });
        });
      }, 100);

      // User management handlers
      if (PermissionsService.canViewUserManagement(user)) {
        this.initializeUserManagement(userRole, user);
      }

      // Check permissions for super admin features
      if (!PermissionsService.isSuperAdmin(user)) {
        // Add click handlers to show unauthorized popup for restricted features
        const restrictedSections = [
          'siteLogoUploader',
          'btnDownloadZip',
          'apiEndpointUrl',
          'apiAuthKey',
          'apiDataType',
          'btnTestApi',
          'btnFetchData',
          'btnPreviewData'
        ];

        restrictedSections.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showUnauthorizedPopup('Only Super Admins can access this feature. Division Admins can only access their own division.');
            });
          }
        });
      }

      // Load management sections
      if (PermissionsService.canAddMainTab(user)) {
        this.loadMainTabManagement();
      }
      if (PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user)) {
        this.loadDivisionTabManagement();
      }
      if (PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user) || user.role === 'lobby') {
        this.loadLobbyTabManagement();
      }

      // Download ZIP handler
      const btnZip = document.getElementById('btnDownloadZip');
      if (btnZip) {
        btnZip.addEventListener('click', () => {
          if (PermissionsService.isSuperAdmin(user)) {
            AdminService.downloadProjectZip();
          } else {
            showUnauthorizedPopup('Only Super Admins can export the project.');
          }
        });
      }

      // Content Management action handlers
      const btnAddFolder = document.getElementById('btnAddFolder');
      if (btnAddFolder) {
        btnAddFolder.addEventListener('click', () => {
          ContentManagementService.showAddFolderModal();
        });
      }

      const btnAddTab = document.getElementById('btnAddMainTab');
      if (btnAddTab) {
        btnAddTab.addEventListener('click', () => {
          if (PermissionsService.isSuperAdmin(user)) {
            ContentManagementService.showAddMainTabModal();
          } else {
            showUnauthorizedPopup('Only Super Admins can add main tabs.');
          }
        });
      }

      const btnAddDivTab = document.getElementById('btnAddDivisionTab');
      if (btnAddDivTab) {
        btnAddDivTab.addEventListener('click', () => {
          if (PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user)) {
            ContentManagementService.showAddDivisionTabModal();
          } else {
            showUnauthorizedPopup('Division Admins can only access their own division.');
          }
        });
      }

      const btnUpload = document.getElementById('btnUploadFile');
      if (btnUpload) {
        btnUpload.addEventListener('click', () => {
          ContentManagementService.showUploadFileModal('admin_panel', 'general');
        });
      }
    }, 100);
  },

  // Initialize user management
  initializeUserManagement(userRole, user) {
    // Create Division Admin
    if (PermissionsService.canCreateDivisionAdmin(user)) {
      const btnCreateDivAdmin = document.getElementById('btnCreateDivAdmin');
      if (btnCreateDivAdmin) {
        btnCreateDivAdmin.addEventListener('click', () => {
          this.createDivisionAdmin();
        });
      }
    }

    // Create Lobby Admin
    const btnCreateLobbyAdmin = document.getElementById('btnCreateLobbyAdmin');
    if (btnCreateLobbyAdmin) {
      btnCreateLobbyAdmin.addEventListener('click', () => {
        this.createLobbyAdmin(user);
      });
    }

    // Update lobby dropdown based on division
    const lobbyDivSelect = document.getElementById('lobbyAdminDivision');
    if (lobbyDivSelect) {
      this.updateLobbyAdminDropdown();
      lobbyDivSelect.addEventListener('change', () => {
        this.updateLobbyAdminDropdown();
      });
    }

    // Load existing users
    this.loadUsersList(userRole, user);
  },

  // Update lobby dropdown for lobby admin creation
  updateLobbyAdminDropdown() {
    const division = document.getElementById('lobbyAdminDivision').value;
    const lobbySelect = document.getElementById('lobbyAdminLobby');

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

  // Create Division Admin
  async createDivisionAdmin() {
    const email = document.getElementById('divAdminEmail').value.trim();
    const password = document.getElementById('divAdminPassword').value;
    const division = document.getElementById('divAdminDivision').value;

    if (!email || !password) {
      showNotification('Please enter email and password.', 'error');
      return;
    }

    // Show loading state
    const btn = document.getElementById('btnCreateDivAdmin');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons">hourglass_empty</span><span>Creating...</span>';
    btn.disabled = true;

    try {
      // Try to save to server database only
      const response = await Api.registerAdmin({
        email: email,
        password: password,
        role: 'division',
        division: division,
        name: email.split('@')[0] + ' (Division Admin)'
      });

      console.log('Register Admin API Response:', response);

      // Check if API is available and returned success
      if (response.api_available === false || response.error === 'API_NOT_AVAILABLE') {
        showNotification('❌ Server database is not available. Please ensure the server is running and connected.', 'error');
        return;
      }

      if (response.success) {
        // Clear form
        document.getElementById('divAdminEmail').value = '';
        document.getElementById('divAdminPassword').value = '';

        showNotification(`Division Admin created successfully for ${division.toUpperCase()}! They can now login from any device.`, 'success');

        // Reload the user list to show the new admin
        const currentUser = AuthService.getUser();
        this.loadUsersList(currentUser.role, currentUser);
      } else {
        // API returned error
        showNotification(response.error || response.message || 'Failed to create admin in database.', 'error');
      }
    } catch (error) {
      console.error('Error creating division admin:', error);
      showNotification('❌ Error creating admin: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  // Helper: Save admin to localStorage only (when API is unavailable)
  saveAdminToLocalStorageOnly(type, email, password, division, lobby, btn, originalText) {
    if (type === 'division') {
      const divisionAdmins = Storage.load(APP_CONFIG.storage.divisionAdmins, true) || {};
      const adminKey = `${email}_${division}`;

      if (divisionAdmins[adminKey]) {
        showNotification('Division Admin already exists for this division.', 'error');
      } else {
        divisionAdmins[adminKey] = {
          email,
          password,
          division,
          savedToServer: false,
          createdAt: new Date().toISOString()
        };
        Storage.save(APP_CONFIG.storage.divisionAdmins, divisionAdmins);

        document.getElementById('divAdminEmail').value = '';
        document.getElementById('divAdminPassword').value = '';

        showNotification(`Division Admin saved locally for ${division.toUpperCase()}. Note: Server database not available - admin can only login on this device.`, 'warning');
        this.loadUsersList('super', AuthService.getUser());
      }
    } else {
      const lobbyAdmins = Storage.load(APP_CONFIG.storage.lobbyAdmins, true) || {};
      const adminKey = `${email}_${division}_${lobby}`;

      if (lobbyAdmins[adminKey]) {
        showNotification('Lobby Admin already exists for this lobby.', 'error');
      } else {
        lobbyAdmins[adminKey] = {
          email,
          password,
          division,
          lobby,
          savedToServer: false,
          createdAt: new Date().toISOString()
        };
        Storage.save(APP_CONFIG.storage.lobbyAdmins, lobbyAdmins);

        document.getElementById('lobbyAdminEmail').value = '';
        document.getElementById('lobbyAdminPassword').value = '';
        document.getElementById('lobbyAdminLobby').value = '';

        showNotification(`Lobby Admin saved locally for ${lobby}. Note: Server database not available - admin can only login on this device.`, 'warning');
        this.loadUsersList(AuthService.getUser().role, AuthService.getUser());
      }
    }

    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  // Create Lobby Admin
  async createLobbyAdmin(user) {
    const email = document.getElementById('lobbyAdminEmail').value.trim();
    const password = document.getElementById('lobbyAdminPassword').value;
    const division = document.getElementById('lobbyAdminDivision').value;
    const lobby = document.getElementById('lobbyAdminLobby').value;

    if (!email || !password || !lobby) {
      showNotification('Please fill all fields.', 'error');
      return;
    }

    // Division admin can only create for their division
    if (PermissionsService.isDivisionAdmin(user) && !PermissionsService.canCreateLobbyAdminOwn(user, division)) {
      showNotification(PermissionsService.getPermissionError('create lobby admins for this division'), 'error');
      return;
    }

    // Show loading state
    const btn = document.getElementById('btnCreateLobbyAdmin');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons">hourglass_empty</span><span>Creating...</span>';
    btn.disabled = true;

    try {
      // Try to save to server database only
      const response = await Api.registerAdmin({
        email: email,
        password: password,
        role: 'lobby',
        division: division,
        lobby: lobby,
        name: email.split('@')[0] + ' (Lobby Admin)'
      });

      console.log('Register Lobby Admin API Response:', response);

      // Check if API is available and returned success
      if (response.api_available === false || response.error === 'API_NOT_AVAILABLE') {
        showNotification('❌ Server database is not available. Please ensure the server is running and connected.', 'error');
        return;
      }

      if (response.success) {
        // Clear form
        document.getElementById('lobbyAdminEmail').value = '';
        document.getElementById('lobbyAdminPassword').value = '';
        document.getElementById('lobbyAdminLobby').value = '';

        showNotification(`Lobby Admin created successfully for ${lobby}! They can now login from any device.`, 'success');

        // Reload the user list to show the new admin
        const currentUser = AuthService.getUser();
        this.loadUsersList(currentUser.role, currentUser);
      } else {
        // API returned error
        showNotification(response.error || response.message || 'Failed to create admin in database.', 'error');
      }
    } catch (error) {
      console.error('Error creating lobby admin:', error);
      showNotification('❌ Error creating admin: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  // Load users list from server
  async loadUsersList(userRole, currentUser) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    // Show loading state
    usersList.innerHTML = `
      <div style="text-align: center; padding: 30px;">
        <div class="loading-spinner" style="margin: 0 auto 15px;"></div>
        <div>Loading users...</div>
      </div>
    `;

    try {
      let filters = {};

      // Apply filters based on user role
      if (userRole === 'division') {
        // Division admins can only see lobby admins from their division
        filters = {
          role: 'lobby',
          division: currentUser.division
        };
      } else if (userRole === 'lobby') {
        // Lobby admins can only see users from their lobby
        filters = {
          division: currentUser.division,
          lobby: currentUser.lobby
        };
      }
      // Super admins see all users (no filters)

      const response = await Api.getUsers(filters);

      if (response.success && response.users) {
        this.renderUsersList(response.users, userRole, currentUser, usersList);
      } else {
        usersList.innerHTML = '<div class="error-message">❌ Failed to load users</div>';
      }
    } catch (error) {
      console.error('Error loading users:', error);
      usersList.innerHTML = '<div class="error-message">❌ Error loading users: ' + (error.message || 'Unknown error') + '</div>';
    }
  },

  // Render users list
  renderUsersList(users, userRole, currentUser, container) {
    // Group users by role
    const divisionAdmins = users.filter(u => u.role === 'division');
    const lobbyAdmins = users.filter(u => u.role === 'lobby');

    let html = '<div class="users-list-header" style="font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 10px;"><span style="font-size: 24px;">👥</span> Created Users</div>';

    if (userRole === 'super' || userRole === 'division') {
      // Division Admins section
      html += '<div class="user-type-section" style="margin-bottom: 24px;">';
      html += '<div class="user-type-title" style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; display: flex; align-items: center; gap: 10px; border-left: 4px solid #3b82f6;"><span class="material-icons" style="color: #2563eb;">engineering</span> 🚂 Division Admins</div>';

      if (divisionAdmins.length > 0) {
        divisionAdmins.forEach(admin => {
          const canEdit = PermissionsService.canEditUser(currentUser, admin);
          const canDelete = PermissionsService.canDeleteUser(currentUser, admin);

          html += this.renderUserCard(admin, 'division', canEdit, canDelete);
        });
      } else {
        html += '<div class="no-users" style="text-align: center; padding: 30px; color: #9ca3af; font-size: 14px; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb; margin: 10px 0;">📭 No division admins created yet</div>';
      }
      html += '</div>';

      // Lobby Admins section
      html += '<div class="user-type-section" style="margin-bottom: 24px;">';
      html += '<div class="user-type-title" style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; display: flex; align-items: center; gap: 10px; border-left: 4px solid #10b981;"><span class="material-icons" style="color: #059669;">badge</span> 🏢 Lobby Admins</div>';

      if (lobbyAdmins.length > 0) {
        lobbyAdmins.forEach(admin => {
          const canEdit = PermissionsService.canEditUser(currentUser, admin);
          const canDelete = PermissionsService.canDeleteUser(currentUser, admin);

          html += this.renderUserCard(admin, 'lobby', canEdit, canDelete);
        });
      } else {
        html += '<div class="no-users" style="text-align: center; padding: 30px; color: #9ca3af; font-size: 14px; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb; margin: 10px 0;">📭 No lobby admins created yet</div>';
      }
      html += '</div>';
    } else if (userRole === 'lobby') {
      // Lobby admins only see lobby admins from their division/lobby
      const myLobbyAdmins = users.filter(u => u.division === currentUser.division && u.lobby === currentUser.lobby);

      html += '<div class="user-type-section" style="margin-bottom: 24px;">';
      html += '<div class="user-type-title" style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; display: flex; align-items: center; gap: 10px; border-left: 4px solid #10b981;"><span class="material-icons" style="color: #059669;">badge</span> 🏢 Lobby Admins (Your Lobby)</div>';

      if (myLobbyAdmins.length > 0) {
        myLobbyAdmins.forEach(admin => {
          const canEdit = PermissionsService.canEditUser(currentUser, admin);
          const canDelete = PermissionsService.canDeleteUser(currentUser, admin);

          html += this.renderUserCard(admin, 'lobby', canEdit, canDelete);
        });
      } else {
        html += '<div class="no-users" style="text-align: center; padding: 30px; color: #9ca3af; font-size: 14px; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb; margin: 10px 0;">📭 No lobby admins in your lobby</div>';
      }
      html += '</div>';
    }

    container.innerHTML = html;

    // Add event listeners for edit/delete buttons
    this.addUserActionListeners();
  },

  // Render individual user card
  renderUserCard(user, userType, canEdit, canDelete) {
    const statusBadge = user.is_active == 1 ?
      '<span style="color: #10b981; font-size: 12px; background: rgba(16,185,129,0.1); padding: 4px 10px; border-radius: 20px; display: inline-block; margin-left: 8px; font-weight: 500;">🟢 Active</span>' :
      '<span style="color: #ef4444; font-size: 12px; background: rgba(239,68,68,0.1); padding: 4px 10px; border-radius: 20px; display: inline-block; margin-left: 8px; font-weight: 500;">🔴 Inactive</span>';

    let userInfo = `<div class="user-email" style="font-weight: 600; font-size: 16px; margin-bottom: 6px; color: #1f2937; display: flex; align-items: center; gap: 8px;">`;
    userInfo += `<span style="font-size: 18px; color: #3b82f6;">${user.name || user.email}</span>`;
    userInfo += `</div>`;

    userInfo += `<div class="user-meta" style="font-size: 13px; color: #6b7280; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">`;
    userInfo += `<span style="display: flex; align-items: center; gap: 4px;"><span>🚂</span><span>${user.division.toUpperCase()}</span></span>`;

    if (userType === 'lobby' && user.lobby) {
      userInfo += `<span style="display: flex; align-items: center; gap: 4px;"><span>•</span><span>🏢 ${user.lobby}</span></span>`;
    }

    userInfo += ` ${statusBadge}</div>`;

    let actionButtons = '';
    if (canEdit || canDelete) {
      actionButtons = `
        <div class="user-actions" style="display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          ${canEdit ? `<button class="btn-edit" onclick="event.stopPropagation(); AdminPage.editUser(${user.id}, '${userType}')" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.2)';">✏️ Edit</button>` : ''}
          ${canDelete ? `<button class="btn-delete" onclick="event.stopPropagation(); AdminPage.deleteUser(${user.id}, '${user.name || user.email}')" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(239, 68, 68, 0.2)';">🗑️ Delete</button>` : ''}
        </div>
      `;
    }

    return `
      <div class="user-item" data-user-id="${user.id}" data-user-role="${userType}" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 16px; transition: all 0.3s ease; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div class="user-info" style="display: flex; align-items: flex-start; gap: 16px;">
          <span class="material-icons user-avatar" style="font-size: 40px; color: #6b7280; flex-shrink: 0; margin-top: 2px;">account_circle</span>
          <div style="flex: 1; min-width: 0;">
            ${userInfo}
            <div class="user-details" style="display: none; background: #f9fafb; padding: 16px; border-radius: 12px; margin-top: 14px; border-left: 4px solid #3b82f6;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
                <div style="display: flex; align-items: center; gap: 8px;"><strong style="color: #4b5563;">📧 Email:</strong> <span style="color: #4b5563; word-break: break-word;">${user.email}</span></div>
                <div style="display: flex; align-items: center; gap: 8px;"><strong style="color: #4b5563;">📱 Mobile:</strong> <span style="color: #4b5563;">${user.mobile || 'N/A'}</span></div>
                <div style="display: flex; align-items: center; gap: 8px;"><strong style="color: #4b5563;">💼 Designation:</strong> <span style="color: #4b5563;">${user.designation || 'N/A'}</span></div>
                <div style="display: flex; align-items: center; gap: 8px;"><strong style="color: #4b5563;">📅 Created:</strong> <span style="color: #4b5563;">${new Date(user.created_at).toLocaleDateString()}</span></div>
              </div>
            </div>
          </div>
        </div>
        ${actionButtons}
      </div>
    `;
  },

  // Add event listeners for user actions
  addUserActionListeners() {
    // Add click handlers for user items to expand details
    const userItems = document.querySelectorAll('.user-item:not(.listeners-added)');
    userItems.forEach(item => {
      item.classList.add('listeners-added');
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit') || e.target.classList.contains('btn-delete')) {
          // Don't expand if clicking on action buttons
          return;
        }

        const details = item.querySelector('.user-details');
        if (details) {
          details.style.display = details.style.display === 'none' ? 'block' : 'none';
        }
      });
    });
  },

  // Edit user
  editUser(userId, userType) {
    // Fetch user details
    Api.getUser(userId).then(response => {
      if (response.success && response.user) {
        const user = response.user;

        const modalHTML = `
          <div class="modal-overlay show" id="editUserModal" onclick="if(event.target === this) AdminPage.closeEditUserModal()">
            <div class="modal-card" style="max-width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
              <div class="modal-header" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div class="modal-title" style="display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600;">
                  <span style="font-size: 20px;">✏️</span>
                  <span>Edit ${userType === 'division' ? 'Division' : 'Lobby'} Admin</span>
                </div>
                <button class="btn-close" onclick="AdminPage.closeEditUserModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: background 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✖</button>
              </div>
              
              <div class="form-grid" style="padding: 24px; gap: 16px; background: #f9fafb;">
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Full Name *</label>
                  <input type="text" id="editUserName" value="${user.name || ''}" class="modern-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" onfocus="this.style.border='2px solid #3b82f6'" onblur="this.style.border='2px solid #e5e7eb'" />
                </div>
                
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Email Address *</label>
                  <input type="email" id="editUserEmail" value="${user.email || ''}" class="modern-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" onfocus="this.style.border='2px solid #3b82f6'" onblur="this.style.border='2px solid #e5e7eb'" />
                </div>
                
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Mobile Number</label>
                  <input type="text" id="editUserMobile" value="${user.mobile || ''}" class="modern-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" onfocus="this.style.border='2px solid #3b82f6'" onblur="this.style.border='2px solid #e5e7eb'" />
                </div>
                
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Designation</label>
                  <input type="text" id="editUserDesignation" value="${user.designation || ''}" class="modern-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" onfocus="this.style.border='2px solid #3b82f6'" onblur="this.style.border='2px solid #e5e7eb'" />
                </div>
                
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Account Status</label>
                  <select id="editUserStatus" class="modern-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
                    <option value="1" ${user.is_active == 1 ? 'selected' : ''}>🟢 Active</option>
                    <option value="0" ${user.is_active == 0 ? 'selected' : ''}>🔴 Inactive</option>
                  </select>
                </div>
              </div>
              
              <div id="editUserError" class="error-message" style="padding: 0 24px 16px; text-align: center; min-height: 20px;"></div>
              
              <div class="modal-actions" style="padding: 16px 24px; display: flex; gap: 12px; justify-content: flex-end; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                <button class="btn-sm" onclick="AdminPage.closeEditUserModal()" style="background: #9ca3af; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.3s;" onmouseover="this.style.background='#6b7280'" onmouseout="this.style.background='#9ca3af'">Cancel</button>
                <button class="btn-sm btn-primary" onclick="AdminPage.saveEditedUser(${user.id})" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.3s; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">💾 Save Changes</button>
              </div>
            </div>
          </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
      } else {
        showNotification('❌ Failed to load user details', 'error');
      }
    }).catch(error => {
      console.error('Error loading user details:', error);
      showNotification('❌ Error loading user details', 'error');
    });
  },

  // Save edited user
  async saveEditedUser(userId) {
    const name = document.getElementById('editUserName').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const mobile = document.getElementById('editUserMobile').value.trim();
    const designation = document.getElementById('editUserDesignation').value.trim();
    const status = document.getElementById('editUserStatus').value;
    const errorElem = document.getElementById('editUserError');

    if (!name || !email) {
      errorElem.textContent = 'Name and email are required';
      return;
    }

    try {
      const response = await Api.updateUser(userId, {
        name,
        email,
        mobile,
        designation,
        is_active: status
      });

      if (response.success) {
        showNotification('✅ User updated successfully', 'success');
        AdminPage.closeEditUserModal();

        // Refresh the user list
        const currentUser = AuthService.getUser();
        AdminPage.loadUsersList(currentUser.role, currentUser);
      } else {
        errorElem.textContent = response.error || 'Failed to update user';
      }
    } catch (error) {
      console.error('Error updating user:', error);
      errorElem.textContent = 'Error updating user';
    }
  },

  // Close edit user modal
  closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) {
      modal.remove();
    }
  },

  // Delete user
  async deleteUser(userId, userName) {
    // Create beautiful confirmation modal
    const modalHTML = `
      <div class="modal-overlay show" id="deleteUserModal" onclick="if(event.target === this) AdminPage.closeDeleteUserModal()">
        <div class="modal-card" style="max-width: 450px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalAppear 0.3s ease-out;">
          <div class="modal-header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; display: flex; justify-content: center; align-items: center; flex-direction: column; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <div class="modal-title" style="font-size: 20px; font-weight: 600; margin: 0;">Confirm Deletion</div>
          </div>
          
          <div class="form-grid" style="padding: 24px; gap: 16px; background: #f9fafb; text-align: center;">
            <div style="font-size: 16px; color: #374151; line-height: 1.6;">
              Are you sure you want to delete <strong style="color: #dc2626;">${userName}</strong>?<br/>
              This action cannot be undone and will permanently remove the user.
            </div>
            
            <div style="display: flex; justify-content: center; gap: 8px; margin-top: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; background: #fef2f2; padding: 8px 16px; border-radius: 20px;">
                <span style="color: #dc2626; font-size: 18px;">🗑️</span>
                <span style="color: #dc2626; font-weight: 500;">Irreversible</span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions" style="padding: 16px 24px; display: flex; gap: 12px; justify-content: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
            <button class="btn-sm" onclick="AdminPage.closeDeleteUserModal()" style="background: #9ca3af; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.3s; min-width: 100px;" onmouseover="this.style.background='#6b7280'" onmouseout="this.style.background='#9ca3af'">Cancel</button>
            <button class="btn-sm btn-primary" onclick="AdminPage.confirmDeleteUser(${userId})" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s; min-width: 100px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(239, 68, 68, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)';">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Confirm delete user
  async confirmDeleteUser(userId) {
    try {
      const response = await Api.deleteUser(userId);

      AdminPage.closeDeleteUserModal();

      if (response.success) {
        showNotification('✅ User deleted successfully', 'success');

        // Refresh the user list
        const currentUser = AuthService.getUser();
        AdminPage.loadUsersList(currentUser.role, currentUser);
      } else {
        showNotification(response.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('❌ Error deleting user', 'error');
    }
  },

  // Close delete user modal
  closeDeleteUserModal() {
    const modal = document.getElementById('deleteUserModal');
    if (modal) {
      modal.remove();
    }
  },

  // Toggle collapsible section
  toggleSection(headerElement) {
    const section = headerElement.closest('.collapsible-section');
    const content = section.querySelector('.section-content');
    const toggleIcon = section.querySelector('.toggle-icon');

    if (content.style.display === 'none') {
      content.style.display = 'block';
      toggleIcon.textContent = 'expand_less';
      section.classList.add('expanded');
    } else {
      content.style.display = 'none';
      toggleIcon.textContent = 'expand_more';
      section.classList.remove('expanded');
    }
  },

  // Show Add Main Tab Dialog
  showAddMainTabDialog() {
    const predefined = APP_CONFIG.predefinedMainTabs;
    const options = predefined.map(tab =>
      `<option value="${tab.name}">${tab.icon} ${tab.name}</option>`
    ).join('');

    const modalHTML = `
      <div class="modal-overlay show" id="adminModal" onclick="if(event.target === this) AdminPage.closeAdminModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">➕ Add Main Tab</div>
            <button class="btn-close" onclick="AdminPage.closeAdminModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Select Tab *</label>
              <select id="selectMainTab">
                <option value="">Choose a railway department tab...</option>
                ${options}
                <option value="custom">+ Custom Tab</option>
              </select>
            </div>
            
            <div id="customTabFields" style="display: none;">
              <div class="form-group">
                <label>Custom Tab Name *</label>
                <input id="customTabName" type="text" placeholder="Enter tab name" />
              </div>
              <div class="form-group">
                <label>Lottie Icon URL (optional)</label>
                <input id="customTabIcon" type="text" placeholder="https://assets.lottiefiles.com/..." />
              </div>
            </div>
          </div>
          
          <div id="adminModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="AdminPage.closeAdminModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="AdminPage.submitAddMainTab()">💾 Create Tab</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add event listener
    document.getElementById('selectMainTab').addEventListener('change', (e) => {
      const customFields = document.getElementById('customTabFields');
      customFields.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
  },

  // Submit Add Main Tab
  submitAddMainTab() {
    const select = document.getElementById('selectMainTab').value;
    const errorElem = document.getElementById('adminModalError');
    const user = AuthService.getUser();

    let tabName, iconUrl;

    if (!select) {
      errorElem.textContent = 'Please select a tab';
      return;
    }

    if (select === 'custom') {
      tabName = document.getElementById('customTabName').value.trim();
      iconUrl = document.getElementById('customTabIcon').value.trim();
      if (!tabName) {
        errorElem.textContent = 'Please enter custom tab name';
        return;
      }
    } else {
      const predefined = APP_CONFIG.predefinedMainTabs.find(t => t.name === select);
      tabName = predefined.name;
      iconUrl = predefined.icon;
    }

    const result = ContentManagementService.addMainTab(tabName, iconUrl, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeAdminModal();
      this.loadMainTabManagement();
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Close Admin Modal
  closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.remove();
  },

  // Load Main Tab Management
  loadMainTabManagement() {
    const structure = ContentManagementService.getContentStructure();
    const container = document.getElementById('mainTabListContainer');

    if (!container) return;

    const tabs = structure.mainTabs;

    let html = '<div style="margin-top: 20px;">';

    // Show existing tabs from structure
    if (tabs.length > 0) {
      html += '<h4 style="font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 600;">📋 Existing Main Tabs</h4>';

      tabs.forEach((tab, index) => {
        const predefined = APP_CONFIG.predefinedMainTabs.find(p => p.name === tab.name);
        const color = predefined?.color || tab.color || '#667eea';
        const fileCount = structure.files[tab.id]?.length || 0;

        // Disable Up button for first item, Down for last
        const upDisabled = index === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
        const downDisabled = index === tabs.length - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';

        html += `
          <div style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); border-radius: 12px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <button style="background: rgba(255,255,255,0.2); border: none; border-radius: 4px; cursor: pointer; color: white; font-size: 10px; padding: 2px 6px; line-height: 1;" ${upDisabled} onclick="AdminPage.moveMainTab('${tab.id}', 'up')" title="Move Up">▲</button>
                  <button style="background: rgba(255,255,255,0.2); border: none; border-radius: 4px; cursor: pointer; color: white; font-size: 10px; padding: 2px 6px; line-height: 1;" ${downDisabled} onclick="AdminPage.moveMainTab('${tab.id}', 'down')" title="Move Down">▼</button>
                </div>
                <div>
                  <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
                    ${tab.icon || '📁'} ${tab.name}
                  </div>
                  <div style="font-size: 13px; opacity: 0.9;">
                    ${fileCount} file${fileCount !== 1 ? 's' : ''} uploaded
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
                <button class="btn-sm" style="background: rgba(255,255,255,0.9); color: ${color}; font-weight: 600;" onclick="FilesPage.render('${tab.id}', '${tab.name}')">📂 Files (${fileCount})</button>
                <button class="btn-sm" style="background: rgba(255,255,255,0.9); color: ${color}; font-weight: 600;" onclick="ContentManagementService.showUploadFileModal('${tab.id}', 'main_tab')">📤 Upload</button>
                <button class="btn-sm" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);" onclick="ContentManagementService.showEditMainTabModal('${tab.id}')">✏️ Edit</button>
                <button class="btn-sm" style="background: rgba(255,0,0,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);" onclick="ContentManagementService.showDeleteMainTabConfirm('${tab.id}', '${tab.name}')">🗑️ Delete</button>
              </div>
            </div>
          </div>
        `;
      });
    }

    // Show available predefined tabs that aren't created yet
    const existingTabNames = tabs.map(t => t.name);
    const availableTabs = APP_CONFIG.predefinedMainTabs.filter(p => !existingTabNames.includes(p.name));

    if (availableTabs.length > 0) {
      html += '<h4 style="font-size: 14px; color: #666; margin: 24px 0 12px 0; font-weight: 600; text-align: center;">✨ Available Railway Department Tabs</h4>';
      html += '<div class="available-tabs-grid">';

      availableTabs.forEach(tab => {
        html += `
          <div style="padding: 12px; background: linear-gradient(135deg, ${tab.color}22 0%, ${tab.color}11 100%); border-radius: 10px; border: 2px dashed ${tab.color}55; cursor: pointer; transition: all 0.3s; text-align: center;" 
               onclick="AdminPage.quickAddMainTab('${tab.name}', '${tab.icon}')" 
               onmouseover="this.style.borderColor='${tab.color}'; this.style.transform='scale(1.02)'" 
               onmouseout="this.style.borderColor='${tab.color}55'; this.style.transform='scale(1)'">
            <div style="font-size: 24px; text-align: center; margin-bottom: 6px;">${tab.icon}</div>
            <div style="font-size: 14px; font-weight: 600; text-align: center; color: ${tab.color};">${tab.name}</div>
            <div style="font-size: 11px; text-align: center; color: #888; margin-top: 4px;">Click to add</div>
          </div>
        `;
      });

      html += '</div>';
    }

    if (tabs.length === 0 && availableTabs.length === 0) {
      html += '<div style="text-align: center; padding: 40px; color: #999; font-style: italic;">All railway department tabs have been created!</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  },

  // Move Main Tab
  async moveMainTab(tabId, direction) {
    const user = AuthService.getUser();
    const result = await ContentManagementService.moveMainTab(tabId, direction, user);

    if (result.success) {
      // Reload the list to show new order
      this.loadMainTabManagement();
    } else {
      showNotification(result.message, 'error');
    }
  },

  // Quick add main tab
  quickAddMainTab(tabName, icon) {
    const user = AuthService.getUser();
    const result = ContentManagementService.addMainTab(tabName, icon, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.loadMainTabManagement();
    } else {
      showNotification(`❌ ${result.message}`, 'error');
    }
  },

  // Load Division Tab Management
  loadDivisionTabManagement() {
    const user = AuthService.getUser();
    const structure = ContentManagementService.getContentStructure();
    const container = document.getElementById('divisionTabListContainer');

    if (!container) return;

    const divisions = PermissionsService.isSuperAdmin(user)
      ? ['bikaner', 'ajmer', 'jodhpur', 'jaipur']
      : [user.division];

    let html = '<div style="margin-top: 20px;">';

    divisions.forEach(division => {
      const tabs = structure.divisionTabs[division] || [];
      const divisionName = division.charAt(0).toUpperCase() + division.slice(1);
      const colors = {
        bikaner: '#667eea',
        ajmer: '#f093fb',
        jodhpur: '#4facfe',
        jaipur: '#43e97b'
      };
      const color = colors[division];

      html += `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; color: ${color}; margin-bottom: 12px; font-weight: 600; text-align: center;">${divisionName} Division (${tabs.length} tabs)</h3>
          <div class="division-tabs-grid">
      `;

      tabs.forEach(tab => {
        const fileCount = structure.files[tab.id]?.length || 0;

        html += `
          <div style="padding: 14px; background: linear-gradient(135deg, ${color}22 0%, ${color}11 100%); border-radius: 10px; border: 2px solid ${color}33;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 2px;">📁 ${tab.name}</div>
                <div style="font-size: 12px; color: #888;">${fileCount} file${fileCount !== 1 ? 's' : ''}</div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn-sm" style="font-size: 12px; padding: 6px 12px; background: rgba(255,255,255,0.9); color: ${color}; font-weight: 600; border: 1px solid ${color};" onclick="FilesPage.render('${tab.id}', '${tab.name}')">📂 View Files (${fileCount})</button>
                <button class="btn-sm btn-primary" style="font-size: 12px; padding: 6px 12px;" onclick="ContentManagementService.showUploadFileModal('${tab.id}', 'division_tab')">📤 Upload</button>
                <button class="btn-sm" style="font-size: 12px; padding: 6px 12px;" onclick="ContentManagementService.showEditDivisionTabModal('${division}', '${tab.id}')">✏️ Edit</button>
                <button class="btn-sm" style="font-size: 12px; padding: 6px 12px; background: #ffebee; color: #c62828;" onclick="ContentManagementService.showDeleteDivisionTabConfirm('${division}', '${tab.id}', '${tab.name}')">🗑️</button>
              </div>
            </div>
          </div>
        `;
      });

      if (tabs.length === 0) {
        html += '<div style="text-align: center; padding: 30px; color: #999; font-style: italic; background: #f8f9fa; border-radius: 8px;">No division tabs yet for ' + divisionName + '</div>';
      }

      html += '</div></div>';
    });

    html += '</div>';
    container.innerHTML = html;
  },

  // Load Lobby Tab Management
  loadLobbyTabManagement() {
    const user = AuthService.getUser();
    const structure = ContentManagementService.getContentStructure();
    const container = document.getElementById('lobbyTabListContainer');

    if (!container) return;

    let lobbies = [];

    // Determine which lobbies to show
    if (user.role === 'lobby') {
      const lobbyName = user.lobby || user.hq;
      if (lobbyName) lobbies = [lobbyName];
    } else if (user.role === 'division') {
      // Show all lobbies in division
      if (window.LobbyManagementService) {
        lobbies = LobbyManagementService.getLobbiesByDivision(user.division);
      }
    } else if (user.role === 'super') {
      // Show all lobbies (grouped by division ideally, but for now flat list or just iterate structure)
      // Iterating structure.lobbyTabs keys is safer if LobbyManagementService isn't fully populated
      if (structure.lobbyTabs) {
        lobbies = Object.keys(structure.lobbyTabs);
      }
    }

    // Fallback: use keys from structure.lobbyTabs if available
    if (lobbies.length === 0 && structure.lobbyTabs) {
      lobbies = Object.keys(structure.lobbyTabs);
    }

    let html = '<div style="margin-top: 20px;">';

    lobbies.forEach(lobbyName => {
      const tabs = structure.lobbyTabs[lobbyName] || [];
      const color = '#10b981'; // Green for Lobby

      // Skip if no tabs and user is not super/division admin (cleaner view)
      // But we want to show empty lobbies so they can add tabs?
      // Yes.

      html += `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; color: ${color}; margin-bottom: 12px; font-weight: 600; text-align: center;">${lobbyName} (${tabs.length} tabs)</h3>
          <div class="division-tabs-grid">
      `;

      tabs.forEach(tab => {
        const fileCount = structure.files[tab.id]?.length || 0;

        html += `
          <div style="padding: 14px; background: linear-gradient(135deg, ${color}22 0%, ${color}11 100%); border-radius: 10px; border: 2px solid ${color}33;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 2px;">📁 ${tab.name}</div>
                <div style="font-size: 12px; color: #888;">${fileCount} file${fileCount !== 1 ? 's' : ''}</div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn-sm" style="font-size: 12px; padding: 6px 12px; background: rgba(255,255,255,0.9); color: ${color}; font-weight: 600; border: 1px solid ${color};" onclick="FilesPage.render('${tab.id}', '${tab.name}')">📂 View Files (${fileCount})</button>
                <button class="btn-sm btn-primary" style="font-size: 12px; padding: 6px 12px;" onclick="ContentManagementService.showUploadFileModal('${tab.id}', 'lobby_tab', '${lobbyName}')">📤 Upload</button>
                <button class="btn-sm" style="font-size: 12px; padding: 6px 12px;" onclick="ContentManagementService.showEditLobbyTabModal('${lobbyName}', '${tab.id}')">✏️ Edit</button>
                <button class="btn-sm" style="font-size: 12px; padding: 6px 12px; background: #ffebee; color: #c62828;" onclick="ContentManagementService.showDeleteLobbyTabConfirm('${lobbyName}', '${tab.id}', '${tab.name}')">🗑️</button>
              </div>
            </div>
          </div>
        `;
      });

      if (tabs.length === 0) {
        html += '<div style="text-align: center; padding: 30px; color: #999; font-style: italic; background: #f8f9fa; border-radius: 8px;">No lobby tabs yet for ' + lobbyName + '</div>';
      }

      html += '</div></div>';
    });

    if (lobbies.length === 0) {
      html += '<div style="text-align: center; padding: 30px; color: #999;">No lobbies found. Create a lobby first.</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  },

  // Load Tab Management (keep for compatibility)
  loadTabManagement() {
    // This function is now split into loadMainTabManagement and loadDivisionTabManagement
    const user = AuthService.getUser();
    const structure = ContentManagementService.getContentStructure();
    const container = document.getElementById('tabManagementContainer');

    if (!container) return;

    let html = '';

    // Main Tabs (Super Admin only)
    if (user.role === 'super') {
      html += `
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px; color: var(--primary); margin: 0;">Main Tabs</h3>
            <span style="font-size: 12px; color: #888;">${structure.mainTabs.length} tabs</span>
          </div>
          
          <div style="display: grid; gap: 8px;">
            ${structure.mainTabs.map(tab => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0;">
                <div>
                  <span style="font-weight: 600; color: #333;">${tab.name}</span>
                  ${tab.icon ? '<span style="font-size: 11px; color: #888; margin-left: 8px;">🎨 Custom Icon</span>' : ''}
                </div>
                <div style="display: flex; gap: 6px;">
                  <button class="btn-sm" style="font-size: 11px; padding: 4px 8px;" onclick="ContentManagementService.showUploadFileModal('${tab.id}', 'main_tab')">📤 Upload</button>
                  <button class="btn-sm" style="font-size: 11px; padding: 4px 8px;" onclick="ContentManagementService.showEditMainTabModal('${tab.id}')">✏️ Edit</button>
                  <button class="btn-sm" style="font-size: 11px; padding: 4px 8px; background: #ffebee; color: #c62828;" onclick="ContentManagementService.showDeleteMainTabConfirm('${tab.id}', '${tab.name}')">🗑️ Delete</button>
                </div>
              </div>
            `).join('')}
            ${structure.mainTabs.length === 0 ? '<div style="text-align: center; padding: 20px; color: #999; font-style: italic;">No main tabs created yet</div>' : ''}
          </div>
        </div>
      `;
    }

    // Division Tabs
    const divisions = PermissionsService.isSuperAdmin(user)
      ? ['bikaner', 'ajmer', 'jodhpur', 'jaipur']
      : [user.division];

    divisions.forEach(division => {
      const tabs = structure.divisionTabs[division] || [];
      const divisionName = division.charAt(0).toUpperCase() + division.slice(1);

      html += `
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px; color: var(--primary); margin: 0;">${divisionName} Division Tabs</h3>
            <span style="font-size: 12px; color: #888;">${tabs.length} tabs</span>
          </div>
          
          <div style="display: grid; gap: 8px;">
            ${tabs.map(tab => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0;">
                <div>
                  <span style="font-weight: 600; color: #333;">${tab.name}</span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button class="btn-sm" style="font-size: 11px; padding: 4px 8px;" onclick="ContentManagementService.showUploadFileModal('${tab.id}', 'division_tab')">📤 Upload</button>
                  <button class="btn-sm" style="font-size: 11px; padding: 4px 8px;" onclick="ContentManagementService.showEditDivisionTabModal('${division}', '${tab.id}')">✏️ Edit</button>
                  <button class="btn-sm" style="font-size: 11px; padding: 4px 8px; background: #ffebee; color: #c62828;" onclick="ContentManagementService.showDeleteDivisionTabConfirm('${division}', '${tab.id}', '${tab.name}')">🗑️ Delete</button>
                </div>
              </div>
            `).join('')}
            ${tabs.length === 0 ? '<div style="text-align: center; padding: 20px; color: #999; font-style: italic;">No division tabs created yet</div>' : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // Load Support Tickets - Dashboard View
  async loadSupportTickets() {
    const listContainer = document.getElementById('supportTicketsList');
    if (!listContainer) return;

    // Render the Dashboard Structure
    listContainer.innerHTML = this.renderSupportDashboardStructure();

    try {
      console.log('Fetching support tickets...');
      if (!window.AdminService) {
        throw new Error('AdminService not initialized');
      }

      const response = await AdminService.getAllSupportTickets();

      if (response.success) {
        const tickets = response.tickets || [];
        this.allTickets = tickets; // Store for filtering/stats

        this.updateSupportStats(tickets);
        this.renderTicketList(tickets);
      } else {
        document.getElementById('adminTicketList').innerHTML = `<div class="error-state">Error: ${response.error || 'Unknown error'}</div>`;
      }
    } catch (e) {
      console.error('Load Support Tickets Error:', e);
      document.getElementById('adminTicketList').innerHTML = `<div class="error-state">Failed to load tickets: ${e.message}</div>`;
    }
  },

  // Render Dashboard Skeleton
  renderSupportDashboardStructure() {
    return `
      <div class="support-dashboard">
        <div class="stats-row" id="supportStats">
           <!-- Stats will be injected here -->
           <div class="stat-card"><div class="loading-spinner"></div></div>
        </div>

        <div class="support-content" style="flex-direction: column;">
           <div class="ticket-list-panel" style="width: 100%; border: none; box-shadow: none; background: transparent;">
              <div class="list-header" style="border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                 <div class="search-bar">
                    <span class="material-icons search-icon">search</span>
                    <input type="text" class="search-input" placeholder="Search tickets..." onkeyup="AdminPage.filterTickets(this.value)">
                 </div>
              </div>
              <div class="tickets-list" id="adminTicketList" style="display: flex; flex-direction: column; gap: 12px; padding: 0;">
                 <div class="loading-spinner" style="margin: 20px auto;"></div>
              </div>
           </div>
        </div>
      </div>
    `;
  },

  // Update Stats
  updateSupportStats(tickets) {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const pending = tickets.filter(t => t.status === 'pending').length; // Assuming 'pending' or 'in-progress' logic

    const html = `
        <div class="stat-card">
            <div class="stat-icon" style="background: #fee2e2; color: #dc2626;">
                <span class="material-icons">error_outline</span>
            </div>
            <div class="stat-info">
                <div class="stat-label">Open</div>
                <div class="stat-value">${open}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
                <span class="material-icons">hourglass_empty</span>
            </div>
            <div class="stat-info">
                <div class="stat-label">In Progress</div>
                <div class="stat-value">${pending}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: #dcfce7; color: #166534;">
                <span class="material-icons">check_circle</span>
            </div>
            <div class="stat-info">
                <div class="stat-label">Resolved</div>
                <div class="stat-value">${closed}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: #e0e7ff; color: #4f46e5;">
                <span class="material-icons">all_inbox</span>
            </div>
            <div class="stat-info">
                <div class="stat-label">Total</div>
                <div class="stat-value">${total}</div>
            </div>
        </div>
    `;

    document.getElementById('supportStats').innerHTML = html;
  },

  // Render List
  renderTicketList(tickets) {
    const container = document.getElementById('adminTicketList');

    if (tickets.length === 0) {
      container.innerHTML = '<div class="empty-state">No tickets found</div>';
      return;
    }

    container.innerHTML = tickets.map(ticket => {
      const isUnread = ticket.last_reply_by === 'user' && ticket.is_read_by_admin == 0;
      return `
        <div class="ticket-card-mini" onclick="AdminPage.selectTicket(${ticket.id})" style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; position: relative; overflow: visible; width: 100%;">
            ${isUnread ? '<div style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 20px; box-shadow: 0 2px 4px rgba(239,68,68,0.3); z-index: 10;">NEW REPLY</div>' : ''}
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                    <div class="mini-header" style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                        <span class="status-badge ${ticket.status}" style="font-size: 10px; padding: 2px 8px;">${ticket.status}</span>
                        <div class="mini-subject" style="font-size: 16px; font-weight: 600; color: #1e293b;" title="${ticket.subject}">${ticket.subject}</div>
                    </div>
                    <div class="mini-message" style="font-size: 13px; color: #64748b; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 600px;">
                        ${ticket.message}
                    </div>
                    <div class="mini-user" style="font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
                        <span class="material-icons" style="font-size: 14px;">person</span> 
                        ${ticket.user_name || 'Unknown'} (${ticket.user_cms || 'N/A'}) • ${ticket.division}/${ticket.lobby}
                    </div>
                </div>
                <div class="mini-date" style="font-size: 12px; color: #94a3b8; white-space: nowrap;">
                    ${new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    `}).join('');
  },

  // Filter Tickets
  filterTickets(query) {
    if (!this.allTickets) return;
    const lowerQuery = query.toLowerCase();
    const filtered = this.allTickets.filter(t =>
      t.subject.toLowerCase().includes(lowerQuery) ||
      (t.user_name && t.user_name.toLowerCase().includes(lowerQuery)) ||
      (t.message && t.message.toLowerCase().includes(lowerQuery))
    );
    this.renderTicketList(filtered);
  },

  // Select Ticket & Load Details (Modal View)
  async selectTicket(ticketId) {
    this.selectedTicketId = ticketId;

    // Create modal if not exists
    let modal = document.getElementById('adminTicketModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'adminTicketModal';
      modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 1000; display: flex;
            justify-content: center; align-items: center; backdrop-filter: blur(4px);
        `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 800px; height: 85vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
            <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: white;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">Ticket Details</h3>
                <button onclick="document.getElementById('adminTicketModal').style.display='none'; AdminPage.loadSupportTickets();" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
            </div>
            <div id="adminModalContent" style="flex: 1; overflow-y: auto; padding: 0; background: #f8fafc; display: flex; flex-direction: column;">
                <div class="loading-spinner" style="margin: auto;"></div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';

    try {
      const response = await AdminService.getTicketDetails(ticketId, 'admin');
      if (response.success) {
        this.renderTicketDetailsInModal(response.ticket, response.replies);
      } else {
        document.getElementById('adminModalContent').innerHTML = `<div class="error-state" style="padding: 20px;">Error: ${response.error}</div>`;
      }
    } catch (e) {
      document.getElementById('adminModalContent').innerHTML = `<div class="error-state" style="padding: 20px;">Failed to load details</div>`;
    }
  },

  // Render Details in Modal
  renderTicketDetailsInModal(ticket, replies) {
    const contentContainer = document.getElementById('adminModalContent');

    const messagesHtml = [
      // Original Ticket Message
      {
        sender: ticket.user_name || 'User',
        message: ticket.message,
        time: ticket.created_at,
        type: 'user'
      },
      // Replies
      ...replies.map(r => ({
        sender: r.sender_name,
        message: r.message,
        time: r.created_at,
        type: r.sender_name === (ticket.user_name) ? 'user' : 'admin'
      }))
    ].sort((a, b) => new Date(a.time) - new Date(b.time))
      .map(msg => `
        <div class="message-bubble ${msg.type}" style="padding: 10px 14px; border-radius: 12px; max-width: 75%; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div class="message-header" style="margin-bottom: 4px; font-size: 11px; opacity: 0.8;">
                <span class="sender-name" style="font-weight: 600;">${msg.sender}</span>
                <span class="message-time">${new Date(msg.time).toLocaleString()}</span>
            </div>
            <div class="message-text" style="font-size: 14px; line-height: 1.4;">${msg.message}</div>
        </div>
    `).join('');

    contentContainer.innerHTML = `
        <div class="details-header" style="padding: 24px; background: white; border-bottom: 1px solid #f1f5f9;">
            <div class="details-title-row">
                <div class="details-subject">${ticket.subject} <span style="font-size: 14px; font-weight: normal; color: #888;">#${ticket.id}</span></div>
                <span class="status-badge ${ticket.status}">${ticket.status}</span>
            </div>
            <div class="details-meta-row">
                <div class="meta-item"><span class="material-icons" style="font-size: 16px;">person</span> ${ticket.user_name} (${ticket.user_cms || 'N/A'})</div>
                <div class="meta-item"><span class="material-icons" style="font-size: 16px;">email</span> ${ticket.user_email || 'N/A'}</div>
                <div class="meta-item"><span class="material-icons" style="font-size: 16px;">place</span> ${ticket.division}/${ticket.lobby}</div>
            </div>
        </div>
        
        <div class="chat-area" id="adminChatArea">
            ${messagesHtml}
        </div>
        
        <div class="reply-box">
            <div class="reply-header">Reply to Customer</div>
            <textarea class="reply-input" id="adminReplyInput" placeholder="Type your reply..."></textarea>
            <div class="reply-actions">
                ${ticket.status !== 'closed' ? `<button class="btn-sm btn-success" onclick="AdminPage.resolveTicket(${ticket.id}, true)">Mark as Resolved</button>` : ''}
                <button class="btn-sm btn-primary" onclick="AdminPage.sendReply(${ticket.id})">
                    <span class="material-icons" style="font-size: 16px; margin-right: 4px;">send</span> Send Reply
                </button>
            </div>
        </div>
    `;

    // Scroll to bottom
    const chatArea = document.getElementById('adminChatArea');
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
  },

  // Override sendReply to work with new modal
  async sendReply(ticketId) {
    const input = document.getElementById('adminReplyInput');
    const message = input.value.trim();

    if (!message) {
      showNotification('Please enter a message', 'warning');
      return;
    }

    // Disable button
    input.disabled = true;

    try {
      const response = await AdminService.replyToTicket(ticketId, message, AuthService.getUser().name);

      if (response.success) {
        showNotification('Reply sent', 'success');
        // Refresh details in modal
        const detailsResponse = await AdminService.getTicketDetails(ticketId, 'admin');
        if (detailsResponse.success) {
          this.renderTicketDetailsInModal(detailsResponse.ticket, detailsResponse.replies);
        }
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

  // Resolve Ticket (Updated)
  resolveTicket(ticketId, reloadDetails = false) {
    if (confirm('Mark this ticket as resolved?')) {
      AdminService.updateTicketStatus(ticketId, 'closed')
        .then(res => {
          if (res.success) {
            showNotification('Ticket resolved', 'success');
            if (reloadDetails) {
              this.selectTicket(ticketId); // Reload details view
              this.loadSupportTickets(); // Reload stats/list in background (or simpler: update stats UI manually)
            } else {
              this.loadSupportTickets();
            }
          }
        });
    }
  },

  // Load Feedback
  async loadFeedback() {
    const listContainer = document.getElementById('feedbackList');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="loading-spinner"></div><div>Loading feedback...</div></div>';

    try {
      console.log('Fetching feedback...');
      if (!window.AdminService) {
        throw new Error('AdminService not initialized');
      }

      const response = await AdminService.getAllFeedback();

      if (response.success) {
        const feedbackList = response.feedback || [];

        // Calculate Stats
        const total = feedbackList.length;
        const avgRating = total > 0
          ? (feedbackList.reduce((sum, item) => sum + (parseInt(item.rating) || 0), 0) / total).toFixed(1)
          : 0;

        // Generate Report Header
        let html = `
                <div class="stats-row" style="margin-bottom: 20px;">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #e0e7ff; color: #4f46e5;">
                            <span class="material-icons">reviews</span>
                        </div>
                        <div class="stat-info">
                            <div class="stat-label">Total Feedback</div>
                            <div class="stat-value">${total}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
                            <span class="material-icons">star</span>
                        </div>
                        <div class="stat-info">
                            <div class="stat-label">Average Rating</div>
                            <div class="stat-value">${avgRating} <span style="font-size: 14px; color: #888;">/ 5</span></div>
                        </div>
                    </div>
                </div>
                <div class="feedback-grid" style="display: grid; gap: 16px;">
            `;

        if (feedbackList.length === 0) {
          html += `
                    <div class="empty-state" style="text-align: center; padding: 40px; color: #888; grid-column: 1/-1;">
                        <div style="font-size: 48px; margin-bottom: 10px;">💬</div>
                        <div>No feedback found</div>
                    </div>`;
        } else {
          html += feedbackList.map(item => `
                    <div class="feedback-item" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div class="feedback-header" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="feedback-type badge" style="background: #e3f2fd; color: #1976d2; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${item.type || 'Feedback'}</span>
                                <div style="color: #ffb400; font-size: 14px;">${'⭐'.repeat(item.rating || 0)}${'☆'.repeat(5 - (item.rating || 0))}</div>
                            </div>
                            <div style="font-size: 11px; color: #94a3b8;">${new Date(item.created_at).toLocaleDateString()}</div>
                        </div>
                        <div class="feedback-subject" style="font-weight: 700; font-size: 16px; margin-bottom: 6px; color: #1e293b;">${item.subject || 'No Subject'}</div>
                        <div class="feedback-description" style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 12px;">${item.description || item.feedback || ''}</div>
                        <div class="feedback-meta" style="font-size: 12px; color: #64748b; padding-top: 10px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 6px;">
                            <span class="material-icons" style="font-size: 14px;">person</span>
                            <strong>${item.user_name || 'Unknown'}</strong> (${item.user_cms || 'N/A'})
                        </div>
                    </div>
                `).join('');
        }

        html += '</div>';
        listContainer.innerHTML = html;

      } else {
        listContainer.innerHTML = `<div class="error-state" style="color: red; padding: 20px;">Error: ${response.error || 'Unknown error'}</div>`;
      }
    } catch (e) {
      console.error('Load Feedback Error:', e);
      listContainer.innerHTML = `<div class="error-state" style="color: red; padding: 20px;">Failed to load feedback: ${e.message}</div>`;
    }
  },

  // Initialize admin tabs navigation
  initializeAdminTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  },

  // Switch Admin Tabs with history support
  switchTab(targetTab, pushHistory = true) {
    if (pushHistory) {
      try {
        history.pushState({
          view: 'admin',
          subView: 'adminTab',
          tab: targetTab,
          timestamp: Date.now()
        }, '', `#admin/${targetTab}`);
      } catch (e) { }
    }

    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    // Remove active class from all buttons and contents
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    // Add active class to the correct button
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === targetTab) {
        btn.classList.add('active');
      }
    });

    // Show corresponding content
    const targetContent = document.querySelector(`[data-content="${targetTab}"]`);
    if (targetContent) {
      targetContent.classList.add('active');
    }

    // Load tab-specific data
    if (targetTab === 'quiz-results') {
      this.loadQuizResults();
    } else if (targetTab === 'quiz-questions') {
      this.loadQuizQuestions();
    } else if (targetTab === 'support-tickets') {
      this.loadSupportTickets();
    } else if (targetTab === 'feedback-review') {
      this.loadFeedback();
    } else if (targetTab === 'popup-management') {
      this.loadPopupManagement();
    }
  },

  // Load quiz results page
  loadQuizResults() {
    const container = document.getElementById('quizResultsContent');
    if (!container) return;

    // Check if we can just refresh the data instead of re-rendering
    if (window.refreshQuizResults && document.getElementById('resultsTableBody')) {
      window.refreshQuizResults();
      return;
    }

    container.innerHTML = renderQuizResultsPage();

    // Initialize quiz results page after a brief delay
    setTimeout(async () => {
      if (window.initQuizResultsPage) {
        await initQuizResultsPage();
      }
    }, 100);
  },

  // Test API connection
  async testApiConnection() {
    const apiEndpoint = document.getElementById('apiEndpointUrl').value.trim();
    const apiAuthKey = document.getElementById('apiAuthKey').value;
    const apiStatus = document.getElementById('apiStatus');
    const apiStatusText = document.getElementById('apiStatusText');
    const apiStatusIcon = document.getElementById('apiStatusIcon');

    if (!apiEndpoint) {
      showNotification('❌ Please enter an API endpoint URL', 'error');
      return;
    }

    // Validate URL format
    try {
      new URL(apiEndpoint);
    } catch (e) {
      showNotification('❌ Invalid API endpoint URL format', 'error');
      return;
    }

    // Show loading state
    apiStatus.style.display = 'block';
    apiStatus.style.background = '#e3f2fd';
    apiStatus.style.border = '1px solid #2196f3';
    apiStatusIcon.textContent = '⏳';
    apiStatusText.textContent = 'Testing connection...';

    try {
      // In a real implementation, this would make the actual API call
      // const response = await fetch(apiEndpoint, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': apiAuthKey ? `Bearer ${apiAuthKey}` : '',
      //     'X-API-Key': apiAuthKey || '',
      //   },
      // });

      // For simulation, we'll wait and then return a mock response
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful connection
      apiStatus.style.background = '#e8f5e9';
      apiStatus.style.border = '1px solid #4caf50';
      apiStatusIcon.textContent = '✅';
      apiStatusText.textContent = 'Connection successful! API is accessible.';

      showNotification('✅ API connection test successful!', 'success');
    } catch (error) {
      console.error('API connection test failed:', error);

      apiStatus.style.background = '#ffebee';
      apiStatus.style.border = '1px solid #f44336';
      apiStatusIcon.textContent = '❌';
      apiStatusText.textContent = `Connection failed: ${error.message || 'Network error'}`;

      showNotification('❌ API connection test failed. Please check the URL and credentials.', 'error');
    }
  },

  // Fetch external data from API
  async fetchExternalData() {
    const apiEndpoint = document.getElementById('apiEndpointUrl').value.trim();
    const apiAuthKey = document.getElementById('apiAuthKey').value;
    const apiDataType = document.getElementById('apiDataType').value;
    const apiStatus = document.getElementById('apiStatus');
    const apiStatusText = document.getElementById('apiStatusText');
    const apiStatusIcon = document.getElementById('apiStatusIcon');

    if (!apiEndpoint) {
      showNotification('❌ Please enter an API endpoint URL', 'error');
      return;
    }

    // Show loading state
    apiStatus.style.display = 'block';
    apiStatus.style.background = '#e3f2fd';
    apiStatus.style.border = '1px solid #2196f3';
    apiStatusIcon.textContent = '🔄';
    apiStatusText.textContent = 'Fetching data from external system...';

    try {
      // In a real implementation, this would make the actual API call
      // const response = await fetch(apiEndpoint, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': apiAuthKey ? `Bearer ${apiAuthKey}` : '',
      //     'X-API-Key': apiAuthKey || '',
      //   },
      // });

      // For simulation, we'll wait and then return mock data based on data type
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate different data types
      let mockData = null;

      switch (apiDataType) {
        case 'files':
          mockData = [
            { id: 'ext_file_1', name: 'Safety Manual Update.pdf', type: 'document', size: '2.4 MB', date: new Date().toISOString(), source: 'External System' },
            { id: 'ext_file_2', name: 'Loco Maintenance Schedule.xlsx', type: 'spreadsheet', size: '1.1 MB', date: new Date().toISOString(), source: 'External System' },
            { id: 'ext_file_3', name: 'New Operating Procedures.pdf', type: 'document', size: '3.2 MB', date: new Date().toISOString(), source: 'External System' }
          ];
          break;
        case 'notices':
          mockData = [
            { id: 'ext_notice_1', title: 'New Safety Protocol Effective', content: 'All crew members must follow the new safety protocol starting January 1st', date: new Date().toISOString(), priority: 'high' },
            { id: 'ext_notice_2', title: 'Locomotive Inspection Schedule', content: 'Weekly inspections will now include additional checks', date: new Date().toISOString(), priority: 'medium' },
            { id: 'ext_notice_3', title: 'Holiday Schedule Update', content: 'Revised holiday schedule for next quarter', date: new Date().toISOString(), priority: 'low' }
          ];
          break;
        case 'loco_data':
          mockData = [
            { id: 'ext_loco_1', locoNo: 'WAP7 30451', type: 'WAP7', status: 'active', lastMaint: '2023-11-15', nextMaint: '2024-01-15', division: 'jaipur' },
            { id: 'ext_loco_2', locoNo: 'WAG9 22345', type: 'WAG9', status: 'maintenance', lastMaint: '2023-12-01', nextMaint: '2024-02-01', division: 'jaipur' },
            { id: 'ext_loco_3', locoNo: 'WAP4 20301', type: 'WAP4', status: 'active', lastMaint: '2023-10-20', nextMaint: '2024-01-20', division: 'jaipur' }
          ];
          break;
        case 'safety_data':
          mockData = [
            { id: 'ext_safety_1', incident: 'Near Miss Event', location: 'Jaipur Yard', date: '2023-12-15', severity: 'medium', action: 'Reviewed and reported' },
            { id: 'ext_safety_2', incident: 'Equipment Malfunction', location: 'Ajmer Station', date: '2023-12-10', severity: 'high', action: 'Repaired and documented' },
            { id: 'ext_safety_3', incident: 'Safety Violation', location: 'Jodhpur Yard', date: '2023-12-05', severity: 'low', action: 'Counselled and corrected' }
          ];
          break;
        case 'custom':
        default:
          mockData = [
            { id: 'ext_custom_1', name: 'Custom Data Record 1', value: 'Sample value', timestamp: new Date().toISOString() },
            { id: 'ext_custom_2', name: 'Custom Data Record 2', value: 'Another sample', timestamp: new Date().toISOString() },
            { id: 'ext_custom_3', name: 'Custom Data Record 3', value: 'More sample data', timestamp: new Date().toISOString() }
          ];
          break;
      }

      // Process the fetched data based on type
      await this.processExternalData(mockData, apiDataType);

      apiStatus.style.background = '#e8f5e9';
      apiStatus.style.border = '1px solid #4caf50';
      apiStatusIcon.textContent = '✅';
      apiStatusText.textContent = `Successfully fetched ${mockData.length} records from external system!`;

      showNotification(`✅ Successfully fetched ${mockData.length} ${apiDataType} records from external system!`, 'success');
    } catch (error) {
      console.error('Error fetching external data:', error);

      apiStatus.style.background = '#ffebee';
      apiStatus.style.border = '1px solid #f44336';
      apiStatusIcon.textContent = '❌';
      apiStatusText.textContent = `Error fetching data: ${error.message || 'Network error'}`;

      showNotification('❌ Error fetching data from external system. Please check the API endpoint and credentials.', 'error');
    }
  },

  // Preview external data from API
  async previewExternalData() {
    const apiEndpoint = document.getElementById('apiEndpointUrl').value.trim();
    const apiAuthKey = document.getElementById('apiAuthKey').value;
    const apiDataType = document.getElementById('apiDataType').value;
    const apiStatus = document.getElementById('apiStatus');
    const apiStatusText = document.getElementById('apiStatusText');
    const apiStatusIcon = document.getElementById('apiStatusIcon');

    if (!apiEndpoint) {
      showNotification('❌ Please enter an API endpoint URL', 'error');
      return;
    }

    // Show loading state
    apiStatus.style.display = 'block';
    apiStatus.style.background = '#e3f2fd';
    apiStatus.style.border = '1px solid #2196f3';
    apiStatusIcon.textContent = '🔍';
    apiStatusText.textContent = 'Previewing data from external system...';

    try {
      // In a real implementation, this would make the actual API call
      // const response = await fetch(apiEndpoint, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': apiAuthKey ? `Bearer ${apiAuthKey}` : '',
      //     'X-API-Key': apiAuthKey || '',
      //   },
      // });

      // For simulation, we'll wait and then return mock data based on data type
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate different data types
      let mockData = null;

      switch (apiDataType) {
        case 'files':
          mockData = [
            { id: 'ext_file_1', name: 'Safety Manual Update.pdf', type: 'document', size: '2.4 MB', date: new Date().toISOString(), source: 'External System' },
            { id: 'ext_file_2', name: 'Loco Maintenance Schedule.xlsx', type: 'spreadsheet', size: '1.1 MB', date: new Date().toISOString(), source: 'External System' },
            { id: 'ext_file_3', name: 'New Operating Procedures.pdf', type: 'document', size: '3.2 MB', date: new Date().toISOString(), source: 'External System' }
          ];
          break;
        case 'notices':
          mockData = [
            { id: 'ext_notice_1', title: 'New Safety Protocol Effective', content: 'All crew members must follow the new safety protocol starting January 1st', date: new Date().toISOString(), priority: 'high' },
            { id: 'ext_notice_2', title: 'Locomotive Inspection Schedule', content: 'Weekly inspections will now include additional checks', date: new Date().toISOString(), priority: 'medium' },
            { id: 'ext_notice_3', title: 'Holiday Schedule Update', content: 'Revised holiday schedule for next quarter', date: new Date().toISOString(), priority: 'low' }
          ];
          break;
        case 'loco_data':
          mockData = [
            { id: 'ext_loco_1', locoNo: 'WAP7 30451', type: 'WAP7', status: 'active', lastMaint: '2023-11-15', nextMaint: '2024-01-15', division: 'jaipur' },
            { id: 'ext_loco_2', locoNo: 'WAG9 22345', type: 'WAG9', status: 'maintenance', lastMaint: '2023-12-01', nextMaint: '2024-02-01', division: 'jaipur' },
            { id: 'ext_loco_3', locoNo: 'WAP4 20301', type: 'WAP4', status: 'active', lastMaint: '2023-10-20', nextMaint: '2024-01-20', division: 'jaipur' }
          ];
          break;
        case 'safety_data':
          mockData = [
            { id: 'ext_safety_1', incident: 'Near Miss Event', location: 'Jaipur Yard', date: '2023-12-15', severity: 'medium', action: 'Reviewed and reported' },
            { id: 'ext_safety_2', incident: 'Equipment Malfunction', location: 'Ajmer Station', date: '2023-12-10', severity: 'high', action: 'Repaired and documented' },
            { id: 'ext_safety_3', incident: 'Safety Violation', location: 'Jodhpur Yard', date: '2023-12-05', severity: 'low', action: 'Counselled and corrected' }
          ];
          break;
        case 'custom':
        default:
          mockData = [
            { id: 'ext_custom_1', name: 'Custom Data Record 1', value: 'Sample value', timestamp: new Date().toISOString() },
            { id: 'ext_custom_2', name: 'Custom Data Record 2', value: 'Another sample', timestamp: new Date().toISOString() },
            { id: 'ext_custom_3', name: 'Custom Data Record 3', value: 'More sample data', timestamp: new Date().toISOString() }
          ];
          break;
      }

      // Show preview of the data
      this.showDataPreview(mockData, apiDataType);

      apiStatus.style.background = '#fff3cd';
      apiStatus.style.border = '1px solid #ffc107';
      apiStatusIcon.textContent = '🔍';
      apiStatusText.textContent = `Preview ready: ${mockData.length} ${apiDataType} records available for integration.`;

      showNotification(`🔍 Preview ready: ${mockData.length} ${apiDataType} records available for integration.`, 'info');
    } catch (error) {
      console.error('Error previewing external data:', error);

      apiStatus.style.background = '#ffebee';
      apiStatus.style.border = '1px solid #f44336';
      apiStatusIcon.textContent = '❌';
      apiStatusText.textContent = `Error previewing data: ${error.message || 'Network error'}`;

      showNotification('❌ Error previewing data from external system. Please check the API endpoint and credentials.', 'error');
    }
  },

  // Show data preview in a modal
  showDataPreview(data, dataType) {
    // Create a modal to show the preview
    const modalHTML = `
      <div class="modal-overlay show" id="apiPreviewModal" onclick="if(event.target === this) AdminPage.closePreviewModal()">
        <div class="modal-card" style="max-width: 90vw; max-height: 80vh; overflow: hidden;">
          <div class="modal-header">
            <div class="modal-title">🔍 Data Preview (${dataType})</div>
            <button class="btn-close" onclick="AdminPage.closePreviewModal()">✖</button>
          </div>
          
          <div class="modal-body" style="overflow-y: auto; max-height: calc(80vh - 120px); padding: 0;">
            <div class="preview-container" style="padding: 16px;">
              <div class="preview-stats">
                <div class="stat-card">
                  <div class="stat-value">${data.length}</div>
                  <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${dataType}</div>
                  <div class="stat-label">Data Type</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${new Date().toLocaleDateString()}</div>
                  <div class="stat-label">Preview Date</div>
                </div>
              </div>
              
              <div class="preview-content">
                <h3 style="margin: 20px 0 12px; color: var(--primary); font-size: 16px;">Preview Details</h3>
                <div class="preview-list">
                  ${this.generatePreviewContent(data, dataType)}
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions" style="padding: 16px; border-top: 1px solid #eee; display: flex; gap: 8px;">
            <button class="btn-sm" onclick="AdminPage.closePreviewModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="AdminPage.confirmIntegration()" style="margin-left: auto;">
              <span class="material-icons">done</span>
              <span>Confirm Integration</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Generate preview content based on data type
  generatePreviewContent(data, dataType) {
    switch (dataType) {
      case 'files':
        return data.map(item => `
          <div class="preview-item">
            <div class="preview-header">
              <span class="preview-icon">📄</span>
              <div class="preview-main">
                <div class="preview-title">${item.name}</div>
                <div class="preview-meta">
                  <span class="preview-type">${item.type}</span>
                  <span class="preview-size">${item.size}</span>
                  <span class="preview-date">${new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <button class="btn-xs" onclick="AdminPage.previewFile('${item.id}')">👁️ Preview</button>
              <button class="btn-xs" onclick="AdminPage.downloadFile('${item.id}')">⬇️ Download</button>
            </div>
          </div>
        `).join('');

      case 'notices':
        return data.map(item => `
          <div class="preview-item">
            <div class="preview-header">
              <span class="preview-icon">📢</span>
              <div class="preview-main">
                <div class="preview-title">${item.title}</div>
                <div class="preview-content">${item.content}</div>
                <div class="preview-meta">
                  <span class="preview-priority ${item.priority}">${item.priority.toUpperCase()}</span>
                  <span class="preview-date">${new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <button class="btn-xs" onclick="AdminPage.previewNotice('${item.id}')">👁️ Preview</button>
            </div>
          </div>
        `).join('');

      case 'loco_data':
        return data.map(item => `
          <div class="preview-item">
            <div class="preview-header">
              <span class="preview-icon">🚂</span>
              <div class="preview-main">
                <div class="preview-title">${item.locoNo} (${item.type})</div>
                <div class="preview-meta">
                  <span class="preview-status ${item.status}">${item.status.toUpperCase()}</span>
                  <span class="preview-division">${item.division.toUpperCase()}</span>
                </div>
                <div class="preview-details">
                  <div>Last Maintenance: ${item.lastMaint}</div>
                  <div>Next Maintenance: ${item.nextMaint}</div>
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <button class="btn-xs" onclick="AdminPage.previewLocoData('${item.id}')">👁️ Details</button>
            </div>
          </div>
        `).join('');

      case 'safety_data':
        return data.map(item => `
          <div class="preview-item">
            <div class="preview-header">
              <span class="preview-icon">⚠️</span>
              <div class="preview-main">
                <div class="preview-title">${item.incident}</div>
                <div class="preview-meta">
                  <span class="preview-severity ${item.severity}">${item.severity.toUpperCase()}</span>
                  <span class="preview-location">${item.location}</span>
                  <span class="preview-date">${item.date}</span>
                </div>
                <div class="preview-details">
                  <div>Action Taken: ${item.action}</div>
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <button class="btn-xs" onclick="AdminPage.previewSafetyData('${item.id}')">👁️ Details</button>
            </div>
          </div>
        `).join('');

      default:
        return data.map(item => `
          <div class="preview-item">
            <div class="preview-header">
              <span class="preview-icon">📦</span>
              <div class="preview-main">
                <div class="preview-title">${item.name || item.title || 'Custom Data Record'}</div>
                <div class="preview-meta">
                  <span class="preview-date">${item.timestamp ? new Date(item.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
                <div class="preview-details">
                  <div>${item.value || item.content || JSON.stringify(item)}</div>
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <button class="btn-xs" onclick="AdminPage.previewCustomData('${item.id}')">👁️ Details</button>
            </div>
          </div>
        `).join('');
    }
  },

  // Close preview modal
  closePreviewModal() {
    const modal = document.getElementById('apiPreviewModal');
    if (modal) modal.remove();
  },

  // Confirm integration of data
  confirmIntegration() {
    showNotification('✅ Data integration confirmed. Data will be integrated into the system.', 'success');
    this.closePreviewModal();

    // In a real implementation, this would trigger the actual integration
    // For now, we'll just show a notification
    showNotification('🔄 Data integration process started in the background.', 'info');
  },

  // Placeholder methods for preview actions
  previewFile(id) {
    showNotification(`Previewing file: ${id}`, 'info');
  },

  downloadFile(id) {
    showNotification(`Downloading file: ${id}`, 'info');
  },

  previewNotice(id) {
    showNotification(`Previewing notice: ${id}`, 'info');
  },

  previewLocoData(id) {
    showNotification(`Previewing locomotive data: ${id}`, 'info');
  },

  previewSafetyData(id) {
    showNotification(`Previewing safety data: ${id}`, 'info');
  },

  previewCustomData(id) {
    showNotification(`Previewing custom data: ${id}`, 'info');
  },

  // Process external data based on type
  async processExternalData(data, dataType) {
    // This method would handle the integration of external data into the system
    // For now, we'll just simulate the process

    // In a real implementation, this would:
    // 1. Validate the incoming data
    // 2. Transform it to match the internal data structure
    // 3. Save it to the appropriate storage location
    // 4. Update the UI or notify users

    // For simulation, we'll just wait a bit to show processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log the received data for debugging
    console.log(`Received ${dataType} data from external system:`, data);

    // In a real implementation, we would integrate this data into the system
    // For example, for files, we might save them to the content structure
    // For notices, we might add them to the notification system
    // For loco data, we might update the locomotive database

    // For now, we'll just show a success message
    showNotification(`📊 Processed ${data.length} ${dataType} records from external system`, 'info');
  },

  // Render users list with edit/delete functionality
  renderUsersList(users, userRole, currentUser, container) {
    let html = '<div class="users-list-header" style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 10px;"><span style="font-size: 28px;">👥</span> Created Users</div>';

    if (users.length === 0) {
      html += '<div class="no-users" style="text-align: center; padding: 40px; color: #9ca3af; font-size: 16px; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb; margin: 20px 0;">📭 No users created yet</div>';
      container.innerHTML = html;
      return;
    }

    // Group users by role
    const divisionAdmins = users.filter(u => u.role === 'division');
    const lobbyAdmins = users.filter(u => u.role === 'lobby');

    if (userRole === 'super' && divisionAdmins.length > 0) {
      html += `
        <div class="user-type-section" style="margin-bottom: 24px;">
          <div class="user-type-title" style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; display: flex; align-items: center; gap: 10px; border-left: 4px solid #3b82f6;">
            <span class="material-icons" style="color: #2563eb;">engineering</span> 🚂 Division Admins
            <span class="user-count" style="background: #3b82f6; color: white; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: auto;">${divisionAdmins.length}</span>
          </div>
      `;

      divisionAdmins.forEach(admin => {
        html += this.renderUserCard(admin, 'division', currentUser);
      });

      html += '</div>';
    }

    if ((userRole === 'super' || userRole === 'division') && lobbyAdmins.length > 0) {
      const showLobbyAdmins = userRole === 'super' ||
        (userRole === 'division' && lobbyAdmins.every(a => a.division === currentUser.division));

      if (showLobbyAdmins) {
        html += `
          <div class="user-type-section" style="margin-bottom: 24px;">
            <div class="user-type-title" style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; display: flex; align-items: center; gap: 10px; border-left: 4px solid #10b981;">
              <span class="material-icons" style="color: #059669;">badge</span> 🏢 Lobby Admins
              <span class="user-count" style="background: #10b981; color: white; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: auto;">${lobbyAdmins.length}</span>
            </div>
        `;

        lobbyAdmins.forEach(admin => {
          html += this.renderUserCard(admin, 'lobby', currentUser);
        });

        html += '</div>';
      }
    }

    container.innerHTML = html;

    // Add event listeners for edit and delete buttons
    this.addUserActionListeners();
  },

  // Add event listeners for user actions
  addUserActionListeners() {
    // Add event listeners for edit buttons
    const editButtons = document.querySelectorAll('.edit-user');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const userId = button.getAttribute('data-user-id');
        this.editUser(userId);
      });
    });

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll('.delete-user');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const userId = button.getAttribute('data-user-id');
        this.deleteUser(userId);
      });
    });
  },

  // Edit user function
  async editUser(userId) {
    // Get user details from server
    const response = await Api.getUserProfile(userId);

    if (response.success) {
      const user = response.user;

      // Create beautiful edit modal
      const modalHTML = `
        <div class="modal-overlay show" id="editUserModal" onclick="if(event.target === this) AdminPage.closeEditUserModal()">
          <div class="modal-card" style="max-width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalAppear 0.3s ease-out;">
            <div class="modal-header" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
              <div class="modal-title" style="display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600;">
                <span style="font-size: 20px;">✏️</span>
                <span>Edit User</span>
              </div>
              <button class="btn-close" onclick="AdminPage.closeEditUserModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: background 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✖</button>
            </div>
            
            <div class="form-grid" style="padding: 24px; gap: 16px; background: #f9fafb;">
              <div class="form-group">
                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Full Name *</label>
                <input type="text" id="editUserName" value="${user.name}" class="modern-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" onfocus="this.style.border='2px solid #3b82f6'" onblur="this.style.border='2px solid #e5e7eb'" />
              </div>
                
              <div class="form-group">
                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Email Address *</label>
                <input type="email" id="editUserEmail" value="${user.email || ''}" class="modern-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" onfocus="this.style.border='2px solid #3b82f6'" onblur="this.style.border='2px solid #e5e7eb'" />
              </div>
                
              <div class="form-group">
                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Mobile Number</label>
                <input type="text" id="editUserMobile" value="${user.mobile || ''}" class="modern-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" onfocus="this.style.border='2px solid #3b82f6'" onblur="this.style.border='2px solid #e5e7eb'" />
              </div>
                
              <div class="form-group">
                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Designation</label>
                <input type="text" id="editUserDesignation" value="${user.designation || ''}" class="modern-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" onfocus="this.style.border='2px solid #3b82f6'" onblur="this.style.border='2px solid #e5e7eb'" />
              </div>
                
              <div class="form-group">
                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">Account Status</label>
                <select id="editUserStatus" class="modern-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
                  <option value="1" ${user.is_active ? 'selected' : ''}>🟢 Active</option>
                  <option value="0" ${!user.is_active ? 'selected' : ''}>🔴 Inactive</option>
                </select>
              </div>
                
              <div id="editUserError" class="error-message" style="padding: 0 24px 16px; text-align: center; min-height: 20px;"></div>
            </div>
            
            <div class="modal-actions" style="padding: 16px 24px; display: flex; gap: 12px; justify-content: flex-end; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <button class="btn-sm" onclick="AdminPage.closeEditUserModal()" style="background: #9ca3af; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.3s;" onmouseover="this.style.background='#6b7280'" onmouseout="this.style.background='#9ca3af'">Cancel</button>
              <button class="btn-sm btn-primary" onclick="AdminPage.saveEditedUser(${user.id})" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.3s; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">💾 Save Changes</button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
      showNotification('❌ Error loading user data', 'error');
    }
  },

  // Save edited user
  async saveEditedUser(userId) {
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const mobile = document.getElementById('editUserMobile').value;
    const designation = document.getElementById('editUserDesignation').value;
    const is_active = parseInt(document.getElementById('editUserStatus').value);

    const userData = {
      id: userId,
      name,
      email: email || null,
      mobile: mobile || null,
      designation: designation || null,
      is_active
    };

    try {
      const response = await Api.updateUserProfile(userData);

      if (response.success) {
        showNotification('✅ User updated successfully', 'success');
        AdminPage.closeEditUserModal();

        // Reload the user list
        const currentUser = AuthService.getUser();
        AdminPage.loadUsersList(currentUser.role, currentUser);
      } else {
        document.getElementById('editUserError').textContent = response.error || 'Failed to update user';
      }
    } catch (error) {
      document.getElementById('editUserError').textContent = error.message || 'Error updating user';
    }
  },

  // Delete user function
  async deleteUser(userId) {
    // Create beautiful confirmation modal
    const user = await Api.getUserProfile(userId);
    const userName = user.success ? user.user.name : 'User';

    const modalHTML = `
      <div class="modal-overlay show" id="deleteUserModal" onclick="if(event.target === this) AdminPage.closeDeleteUserModal()">
        <div class="modal-card" style="max-width: 450px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalAppear 0.3s ease-out;">
          <div class="modal-header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; display: flex; justify-content: center; align-items: center; flex-direction: column; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <div class="modal-title" style="font-size: 20px; font-weight: 600; margin: 0;">Confirm Deletion</div>
          </div>
          
          <div class="form-grid" style="padding: 24px; gap: 16px; background: #f9fafb; text-align: center;">
            <div style="font-size: 16px; color: #374151; line-height: 1.6;">
              Are you sure you want to delete <strong style="color: #dc2626;">${userName}</strong>?<br/>
              This action cannot be undone and will permanently remove the user.
            </div>
            
            <div style="display: flex; justify-content: center; gap: 8px; margin-top: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; background: #fef2f2; padding: 8px 16px; border-radius: 20px;">
                <span style="color: #dc2626; font-size: 18px;">🗑️</span>
                <span style="color: #dc2626; font-weight: 500;">Irreversible</span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions" style="padding: 16px 24px; display: flex; gap: 12px; justify-content: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
            <button class="btn-sm" onclick="AdminPage.closeDeleteUserModal()" style="background: #9ca3af; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.3s; min-width: 100px;" onmouseover="this.style.background='#6b7280'" onmouseout="this.style.background='#9ca3af'">Cancel</button>
            <button class="btn-sm btn-primary" onclick="AdminPage.confirmDeleteUser(${userId})" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s; min-width: 100px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(239, 68, 68, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)'">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Close edit user modal
  closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) modal.remove();
  },

  // Confirm delete user
  async confirmDeleteUser(userId) {
    try {
      const response = await Api.request(`/users/profile?id=${userId}`, {
        method: 'DELETE'
      });

      AdminPage.closeDeleteUserModal();

      if (response.success) {
        showNotification('✅ User deleted successfully', 'success');

        // Reload the user list
        const currentUser = AuthService.getUser();
        AdminPage.loadUsersList(currentUser.role, currentUser);
      } else {
        showNotification('❌ Error deleting user: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showNotification('❌ Error deleting user: ' + error.message, 'error');
    }
  },

  // Close delete user modal
  closeDeleteUserModal() {
    const modal = document.getElementById('deleteUserModal');
    if (modal) modal.remove();
  },

  // Render individual user card with edit/delete buttons
  renderUserCard(user, role, currentUser) {
    const canEdit = PermissionsService.canEditUser(currentUser, user);
    const canDelete = PermissionsService.canDeleteUser(currentUser, user);

    const roleBadge = role === 'division' ?
      `<span class="role-badge division-role" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; margin-right: 8px;">🚂 DIVISION ADMIN</span>` :
      `<span class="role-badge lobby-role" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; margin-right: 8px;">🏢 LOBBY ADMIN</span>`;

    const divisionBadge = user.division ?
      `<span class="division-badge" style="background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; display: inline-block; margin-right: 8px;">${user.division.toUpperCase()}</span>` : '';

    const lobbyBadge = user.lobby ?
      `<span class="lobby-badge" style="background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; display: inline-block; margin-right: 8px;">🏠 ${user.lobby}</span>` : '';

    const statusBadge = user.is_active ?
      `<span class="status-badge active" style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block;">🟢 ACTIVE</span>` :
      `<span class="status-badge inactive" style="background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block;">🔴 INACTIVE</span>`;

    return `
      <div class="user-card" data-user-id="${user.id}" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 16px; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); display: flex; align-items: center; gap: 20px;">
        <div class="user-avatar-container" style="flex-shrink: 0;">
          <span class="material-icons user-avatar-lg" style="font-size: 56px; color: #9ca3af;">account_circle</span>
        </div>
        <div class="user-info-main" style="flex: 1; min-width: 0;">
          <div class="user-name" style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            ${user.name}
          </div>
          <div class="user-email-small" style="font-size: 14px; color: #6b7280; margin-bottom: 12px; word-break: break-all;">
            ${user.email}
          </div>
          <div class="user-details" style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
            ${roleBadge}
            ${divisionBadge}
            ${lobbyBadge}
            ${statusBadge}
          </div>
          <div class="user-meta-line" style="display: flex; align-items: center; gap: 16px; color: #6b7280; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="material-icons meta-icon" style="font-size: 16px;">badge</span>
              <span>${user.designation || 'ADMIN'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="material-icons meta-icon" style="font-size: 16px;">calendar_today</span>
              <span>Created: ${new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        ${(canEdit || canDelete) ? `
        <div class="user-actions" style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
          ${canEdit ? `<button class="btn-icon edit-user" data-user-id="${user.id}" title="Edit User" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.3)'">
            <span class="material-icons" style="font-size: 18px;">edit</span>
          </button>` : ''}
          ${canDelete ? `<button class="btn-icon delete-user" data-user-id="${user.id}" title="Delete User" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(239, 68, 68, 0.3)'">
            <span class="material-icons" style="font-size: 18px;">delete</span>
          </button>` : ''}
        </div>
        ` : ''}
      </div>
    `;
  },

  // Load question stats
  async loadQuestionStats() {
    const container = document.getElementById('questionStatsContainer');
    if (!container) return;

    try {
      let stats = await QuizQuestionsService.getStats();

      // Fallback: If stats are not provided or error occurred, calculate from questions list
      if (!stats || Object.keys(stats).length === 0 || Object.values(stats).every(v => v === 0)) {
        console.log('[AdminPanel] Stats are zero or missing, calculating from actual questions...');
        const allQuestions = await QuizQuestionsService.getQuestions();
        if (allQuestions && allQuestions.length > 0) {
          stats = { total: allQuestions.length };
          allQuestions.forEach(q => {
            const cat = q.category || 'mixed';
            stats[cat] = (stats[cat] || 0) + 1;
          });
        }
      }

      if (!stats) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444;">Failed to load statistics</div>';
        return;
      }

      const categories = [
        { id: 'mixed', name: 'Mixed', icon: 'shuffle', color: '#6366f1', bgColor: '#e0e7ff' },
        { id: 'spad', name: 'SPAD', icon: 'warning', color: '#ef4444', bgColor: '#fee2e2' },
        { id: 'rhs', name: 'RHS', icon: 'train', color: '#f59e0b', bgColor: '#fef3c7' },
        { id: 'loco', name: 'Loco', icon: 'directions_railway', color: '#10b981', bgColor: '#d1fae5' },
        { id: 'automatic-signaling', name: 'Auto Sig', icon: 'traffic', color: '#3b82f6', bgColor: '#dbeafe' },
        { id: 'modified-signaling', name: 'Mod Sig', icon: 'edit_road', color: '#8b5cf6', bgColor: '#ede9fe' },
        { id: 'absolute-block', name: 'Absolute', icon: 'security', color: '#64748b', bgColor: '#f1f5f9' }
      ];

      let html = '';
      let totalQuestions = stats.total || 0;

      // Calculate total if not provided explicitly
      if (totalQuestions === 0) {
        Object.values(stats).forEach(v => { if (typeof v === 'number') totalQuestions += v; });
      }

      // Add "Total" card first - using the premium style from profile
      html += `
        <div class="stat-box" style="background: white; border-radius: 20px; padding: 15px; display: flex; flex-direction: column; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
          <div class="stat-icon-circle" style="width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9; color: #1e293b; display: flex; align-items: center; justify-content: center; font-size: 20px;">📊</div>
          <div style="font-size: 22px; font-weight: 800; color: #1e293b;">${totalQuestions}</div>
          <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Total</div>
        </div>
      `;

      categories.forEach(cat => {
        const count = stats[cat.id] || 0;
        html += `
          <div class="stat-box" style="background: white; border-radius: 20px; padding: 15px; display: flex; flex-direction: column; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
            <div class="stat-icon-circle" style="width: 48px; height: 48px; border-radius: 50%; background: ${cat.bgColor}; color: ${cat.color}; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                <span class="material-icons" style="font-size: 22px;">${cat.icon}</span>
            </div>
            <div style="font-size: 22px; font-weight: 800; color: #1e293b;">${count}</div>
            <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">${cat.name}</div>
          </div>
        `;
      });

      container.innerHTML = html;
      container.className = 'admin-stats-grid';
      container.style.display = 'grid';
      container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(130px, 1fr))';
      container.style.padding = '5px';

    } catch (error) {
      console.error('Error loading stats:', error);
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #ef4444;">Error loading statistics: ${error.message}</div>`;
    }
  },

  // Load quiz questions management page
  loadQuizQuestions() {
    const container = document.getElementById('quizQuestionsContent');
    if (!container) return;

    container.innerHTML = this.renderQuizQuestionsPage();

    // Load statistics
    this.loadQuestionStats();

    // Initialize quiz questions page after a brief delay
    setTimeout(() => {
      if (window.initQuizQuestionsPage) {
        initQuizQuestionsPage();
      } else {
        // If init function doesn't exist, manually trigger loading
        setTimeout(async () => {
          await this.loadAllQuestions();
        }, 200);
      }
    }, 100);
  },

  // Render quiz questions management page
  renderQuizQuestionsPage() {
    const user = AuthService.getUser();
    const canManageQuestions = PermissionsService.isSuperAdmin(user) || PermissionsService.isDivisionAdmin(user);

    if (!canManageQuestions) {
      return '<div class="error-message">Access denied. Admin privileges required.</div>';
    }

    return `
      <div class="quiz-questions-container">
        <!-- New Section Header UI -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 15px; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-left: 5px solid #3b82f6;">
            <div style="font-size: 32px;">📝</div>
            <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #1e293b;">Quiz Questions Management</h3>
                <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Add, edit, and manage all quiz modules</p>
            </div>
        </div>
        
        <div class="admin-actions-grid" style="margin-bottom: 20px;">
          <button class="btn-modern btn-primary" onclick="QuizQuestionsService.exportQuestionsTemplate()" style="display: flex; align-items: center; gap: 8px;">
            <span class="material-icons">download</span>
            <span>Download Template</span>
          </button>
          <button class="btn-modern btn-success" onclick="AdminPage.showAddQuestionModal()" style="display: flex; align-items: center; gap: 8px;">
            <span class="material-icons">add</span>
            <span>Add New Question</span>
          </button>
          <button class="btn-modern" onclick="AdminPage.showBulkUploadModal()" style="display: flex; align-items: center; gap: 8px;">
            <span class="material-icons">upload</span>
            <span>Bulk Upload</span>
          </button>
        </div>
        
        <div id="questionStatsContainer" class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <!-- Stats will be loaded here -->
          <div style="grid-column: 1 / -1; text-align: center; color: #6b7280; padding: 20px;">
            <div class="loading-spinner" style="display: inline-block; width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-radius: 50%; border-top-color: #3b82f6; animation: spin 1s ease-in-out infinite;"></div>
            <div style="margin-top: 8px; font-size: 14px;">Loading statistics...</div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label for="categoryFilter">Filter by Category:</label>
          <select id="categoryFilter" class="modern-select" onchange="AdminPage.filterQuestions()">
            <option value="">All Categories</option>
            <option value="mixed">Mixed Topics</option>
            <option value="spad">SPAD</option>
            <option value="rhs">RHS</option>
            <option value="loco">Locomotive</option>
            <option value="automatic-signaling">Automatic Signaling</option>
            <option value="modified-signaling">Modified Signaling</option>
            <option value="absolute-block">Absolute Block</option>
          </select>
        </div>
        
        <div class="card">
          <div class="card-title">Question List</div>
          <div id="questionsList">
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
              <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
              <div style="font-size: 18px; margin-bottom: 8px;">Loading questions...</div>
              <div>Please wait while we fetch the question list</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Show add question modal
  showAddQuestionModal() {
    const modalHTML = `
  <div class="modal-overlay show" id="addQuestionModal" onclick="if(event.target === this) AdminPage.closeAddQuestionModal()" style="backdrop-filter: blur(12px); background: rgba(15, 23, 42, 0.8) !important; z-index: 10001; animation: modalFadeIn 0.3s ease; display: flex !important; align-items: center; justify-content: center;">
    <div class="modal-card" style="width: 95% !important; max-width: 650px !important; border-radius: 24px !important; overflow: hidden !important; border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important; animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important; display: block !important;">
      <div class="modal-header" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div class="modal-title" style="display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">
          <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">➕</div>
          <span>Add New Question</span>
        </div>
        <button class="btn-close" onclick="AdminPage.closeAddQuestionModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='rotate(0deg)'">✖</button>
      </div>

      <div style="padding: 24px; background: white;">
        <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Category *</label>
            <select id="questionCategory" class="modern-select" style="width: 100%; height: 48px; padding: 0 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 15px; background: #f8fafc; transition: all 0.3s;" onfocus="this.style.borderColor='#10b981'; this.style.background='#fff'" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'">
              <option value="">Select Category</option>
              <option value="mixed">Mixed Topics</option>
              <option value="spad">SPAD</option>
              <option value="rhs">RHS</option>
              <option value="loco">Locomotive</option>
              <option value="automatic-signaling">Automatic Signaling</option>
              <option value="modified-signaling">Modified Signaling</option>
              <option value="absolute-block">Absolute Block</option>
            </select>
          </div>

          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Question Text *</label>
            <textarea id="questionText" rows="3" placeholder="Enter your question here" style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 15px; background: #f8fafc; transition: all 0.3s; resize: vertical;" onfocus="this.style.borderColor='#10b981'; this.style.background='#fff'" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'"></textarea>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
            <div class="form-group">
              <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 12px;">OPTION 1 *</label>
              <input type="text" id="option1" placeholder="Option 1" style="width: 100%; height: 44px; padding: 0 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc;" />
            </div>
            <div class="form-group">
              <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 12px;">OPTION 2 *</label>
              <input type="text" id="option2" placeholder="Option 2" style="width: 100%; height: 44px; padding: 0 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc;" />
            </div>
            <div class="form-group">
              <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 12px;">OPTION 3</label>
              <input type="text" id="option3" placeholder="Option 3" style="width: 100%; height: 44px; padding: 0 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc;" />
            </div>
            <div class="form-group">
              <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 12px;">OPTION 4</label>
              <input type="text" id="option4" placeholder="Option 4" style="width: 100%; height: 44px; padding: 0 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase;">Correct Answer *</label>
              <select id="correctAnswer" style="width: 100%; height: 48px; padding: 0 12px; border: 2px solid #e2e8f0; border-radius: 12px; background: #f1f5f9; font-weight: 600;">
                <option value="">Choose Correct</option>
                <option value="0">Option 1</option>
                <option value="1">Option 2</option>
                <option value="2">Option 3</option>
                <option value="3">Option 4</option>
              </select>
            </div>
            <div class="form-group">
              <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase;">Status</label>
              <select id="questionStatus" style="width: 100%; height: 48px; padding: 0 12px; border: 2px solid #e2e8f0; border-radius: 12px; background: #f1f5f9; font-weight: 600;">
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div id="addQuestionError" class="error-message" style="padding: 0 24px 16px; text-align: center; color: #ef4444; font-size: 13px; font-weight: 500;"></div>

      <div class="modal-actions" style="padding: 20px 24px; display: flex; gap: 12px; justify-content: flex-end; background: #f8fafc; border-top: 1px solid #e2e8f0;">
        <button class="btn-modern" onclick="AdminPage.closeAddQuestionModal()" style="background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'; this.style.color='#1e293b'" onmouseout="this.style.background='white'; this.style.color='#64748b'">Cancel</button>
        <button class="btn-modern" onclick="AdminPage.submitAddQuestion()" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.2s; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 15px rgba(16, 185, 129, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'">
          <span class="material-icons" style="font-size: 18px;">save</span>
          <span>Save Question</span>
        </button>
      </div>
    </div>
  </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit add question
  async submitAddQuestion() {
    const category = document.getElementById('questionCategory').value;
    const question = document.getElementById('questionText').value.trim();
    const option1 = document.getElementById('option1').value.trim();
    const option2 = document.getElementById('option2').value.trim();
    const option3 = document.getElementById('option3').value.trim();
    const option4 = document.getElementById('option4').value.trim();
    const correctAnswer = document.getElementById('correctAnswer').value;
    const status = document.getElementById('questionStatus').value;
    const errorElem = document.getElementById('addQuestionError');

    // Validation
    if (!category || !question || !option1 || !option2 || !correctAnswer) {
      errorElem.textContent = 'Please fill in all required fields.';
      return;
    }

    const questionData = {
      category,
      question,
      option_1: option1,
      option_2: option2,
      option_3: option3,
      option_4: option4,
      correct_answer: parseInt(correctAnswer),
      is_active: parseInt(status)
    };

    try {
      const response = await QuizQuestionsService.addQuestion(questionData);

      if (response && response.success) {
        AdminPage.closeAddQuestionModal();
        // Refresh the questions list
        AdminPage.loadQuizQuestions();
      } else {
        errorElem.textContent = response?.error || 'Failed to add question.';
      }
    } catch (error) {
      errorElem.textContent = 'Error adding question: ' + error.message;
    }
  },

  // Close add question modal
  closeAddQuestionModal() {
    const modal = document.getElementById('addQuestionModal');
    if (modal) {
      modal.remove();
    }
  },

  // Show bulk upload modal
  showBulkUploadModal() {
    const modalHTML = `
  <div class="modal-overlay show" id="bulkUploadModal" onclick="if(event.target === this) AdminPage.closeBulkUploadModal()" style="backdrop-filter: blur(12px); background: rgba(15, 23, 42, 0.8) !important; z-index: 10001; animation: modalFadeIn 0.3s ease; display: flex !important; align-items: center; justify-content: center;">
    <div class="modal-card" style="width: 95% !important; max-width: 650px !important; border-radius: 24px !important; overflow: hidden !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important; animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important; display: block !important;">
      <div class="modal-header" style="background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div class="modal-title" style="display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">
          <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">📤</div>
          <span>Bulk Upload Questions</span>
        </div>
        <button class="btn-close" onclick="AdminPage.closeBulkUploadModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='rotate(0deg)'">✖</button>
      </div>

      <div style="padding: 24px; background: white;">
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 10px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase;">Upload JSON File</label>
          <div class="file-upload-area" style="border: 3px dashed #cbd5e1; border-radius: 20px; padding: 40px 20px; text-align: center; background: #f8fafc; transition: all 0.3s; cursor: pointer; position: relative; overflow: hidden;" onclick="document.getElementById('bulkUploadFile').click()" onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#eff6ff'" onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc'">
            <div style="font-size: 56px; margin-bottom: 16px; color: #3b82f6; filter: drop-shadow(0 4px 6px rgba(59, 130, 246, 0.2));">📁</div>
            <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 8px;">Drag & Drop or Click</div>
            <div style="font-size: 14px; color: #64748b; margin-bottom: 16px;">Support JSON files with question schema</div>
            <div style="display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; border-radius: 10px; font-size: 13px; font-weight: 600;">Choose File</div>
            <input type="file" id="bulkUploadFile" accept=".json" style="display: none;" onchange="AdminPage.handleFileSelect(this.files[0])" />
          </div>
        </div>

        <div style="background: #fef3c7; border-radius: 16px; padding: 20px; border: 1px solid #fbbf24; margin-bottom: 20px; display: flex; gap: 16px; align-items: flex-start;">
          <div style="font-size: 24px;">💡</div>
          <div>
            <div style="font-weight: 800; color: #92400e; margin-bottom: 6px; font-size: 15px;">How to upload:</div>
            <p style="font-size: 13px; color: #b45309; line-height: 1.5; margin: 0;">1. Download the question template.<br>2. Fill in your data following the format.<br>3. Upload the resulting JSON file here.</p>
            </div>
          </div>

          <div id="uploadPreview" style="display: none; background: #f1f5f9; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;">
            <div style="font-weight: 700; color: #334155; margin-bottom: 8px; font-size: 13px; display: flex; justify-content: space-between;">
              <span>File Content Preview</span>
              <span id="previewFileCount" style="color: #64748b; font-weight: 600;"></span>
            </div>
            <div id="previewContent" style="font-size: 12px; color: #475569; max-height: 120px; overflow-y: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; line-height: 1.4;"></div>
          </div>
        </div>

        <div id="bulkUploadError" class="error-message" style="padding: 16px 24px; text-align: center; color: #ef4444; font-size: 13px;"></div>

        <div class="modal-actions" style="padding: 20px 24px; display: flex; gap: 12px; justify-content: flex-end; background: #f8fafc; border-top: 1px solid #e2e8f0;">
          <button class="btn-modern" onclick="AdminPage.closeBulkUploadModal()" style="background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
          <button class="btn-modern" onclick="AdminPage.submitBulkUpload()" id="submitBulkUploadBtn" disabled style="background: #94a3b8; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: not-allowed; display: flex; align-items: center; gap: 8px;">
            <span class="material-icons" style="font-size: 18px;">cloud_upload</span>
            <span>Upload Questions</span>
          </button>
        </div>
      </div>
    </div>
`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Handle file selection for bulk upload
  handleFileSelect(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        // Validate JSON structure
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON file must contain an array of questions');
        }

        // Enable submit button
        const submitBtn = document.getElementById('submitBulkUploadBtn');
        submitBtn.disabled = false;
        submitBtn.style.background = '#10b981';
        submitBtn.onmouseover = () => submitBtn.style.background = '#059669';
        submitBtn.onmouseout = () => submitBtn.style.background = '#10b981';

        // Show preview
        const preview = document.getElementById('uploadPreview');
        preview.style.display = 'block';

        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = `Loaded ${jsonData.length} questions.First 3: <br>` +
          jsonData.slice(0, 3).map((q, i) => `<div style="margin-top: 8px;"><strong>Q${i + 1}:</strong> ${q.question || 'No question text'}</div>`).join('');

        // Store the file data for submission
        window.bulkUploadData = jsonData;

      } catch (error) {
        document.getElementById('bulkUploadError').textContent = 'Invalid JSON file: ' + error.message;
      }
    };
    reader.onerror = () => {
      document.getElementById('bulkUploadError').textContent = 'Error reading file';
    };
    reader.readAsText(file);
  },

  // Submit bulk upload
  async submitBulkUpload() {
    if (!window.bulkUploadData) {
      document.getElementById('bulkUploadError').textContent = 'No file selected';
      return;
    }

    try {
      const response = await QuizQuestionsService.bulkUploadQuestions(window.bulkUploadData);

      if (response && response.success) {
        AdminPage.closeBulkUploadModal();
        // Refresh the questions list
        AdminPage.filterQuestions();
      } else {
        document.getElementById('bulkUploadError').textContent = response?.error || 'Failed to upload questions.';
      }
    } catch (error) {
      document.getElementById('bulkUploadError').textContent = 'Error uploading questions: ' + error.message;
    }
  },

  // Close bulk upload modal
  closeBulkUploadModal() {
    const modal = document.getElementById('bulkUploadModal');
    if (modal) {
      modal.remove();
    }
    // Clean up stored data
    delete window.bulkUploadData;
  },

  // Filter questions by category
  async filterQuestions(page = 1) {
    // If no category is selected, default to loading all questions
    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect && !categorySelect.value) {
      // Load all questions when page first loads
      await this.loadAllQuestions(page);
      return;
    }

    const category = document.getElementById('categoryFilter').value;

    try {
      const allQuestions = await QuizQuestionsService.getQuestionsByCategory(category);

      const itemsPerPage = 20;
      const totalPages = Math.ceil(allQuestions.length / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedQuestions = allQuestions.slice(startIndex, startIndex + itemsPerPage);

      const questionsList = document.getElementById('questionsList');
      if (!questionsList) return;

      if (allQuestions.length === 0) {
        questionsList.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #9ca3af;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
            <div style="font-size: 18px; margin-bottom: 8px;">No questions found</div>
            <div>Try changing the filter or add some questions</div>
          </div>
        `;
        return;
      }

      // Render questions list
      let html = '<div class="questions-grid" style="display: grid; gap: 16px;">';
      paginatedQuestions.forEach(q => {
        html += `
          <div class="question-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="background: #e0e7ff; color: #4f46e5; padding: 2px 8px; border-radius: 20px; font-size: 12px; font-weight: 600;">${q.category}</span>
                <span>${q.question}</span>
              </div>
              <div style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">Options: ${q.option_1}, ${q.option_2}${q.option_3 ? ', ' + q.option_3 : ''}${q.option_4 ? ', ' + q.option_4 : ''}</div>
              <div style="color: #10b981; font-weight: 600; font-size: 13px;">Correct Answer: ${['Option 1', 'Option 2', 'Option 3', 'Option 4'][q.correct_answer]}</div>
            </div>
            <div style="display: flex; gap: 8px; flex-shrink: 0;">
              <button class="btn-sm" onclick="AdminPage.editQuestion(${q.id})" style="background: #93c5fd; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: background 0.3s;" onmouseover="this.style.background='#60a5fa'" onmouseout="this.style.background='#93c5fd'">✏️ Edit</button>
              <button class="btn-sm" onclick="AdminPage.deleteQuestion(${q.id})" style="background: #f87171; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: background 0.3s;" onmouseover="this.style.background='#ef4444'" onmouseout="this.style.background='#f87171'">🗑️ Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';

      // Add pagination controls
      html += '<div class="pagination-controls" style="display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 10px;">';

      // Previous button
      if (page > 1) {
        html += `<button class="btn-sm" onclick="AdminPage.filterQuestions(${page - 1})" style="background: #e5e7eb; color: #374151; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.3s;">← Prev</button>`;
      } else {
        html += `<button class="btn-sm" disabled style="background: #e5e7eb; color: #9ca3af; border: none; padding: 8px 12px; border-radius: 6px; cursor: not-allowed;">← Prev</button>`;
      }

      // Page info
      html += `<span style="color: #6b7280; padding: 0 10px;">Page ${page} of ${totalPages}</span>`;

      // Next button
      if (page < totalPages) {
        html += `<button class="btn-sm" onclick="AdminPage.filterQuestions(${page + 1})" style="background: #e5e7eb; color: #374151; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.3s;">Next →</button>`;
      } else {
        html += `<button class="btn-sm" disabled style="background: #e5e7eb; color: #9ca3af; border: none; padding: 8px 12px; border-radius: 6px; cursor: not-allowed;">Next →</button>`;
      }

      html += '</div>';

      questionsList.innerHTML = html;
    } catch (error) {
      questionsList.innerHTML = `<div class="error-message" style="text-align: center; padding: 40px; color: #ef4444;">Error loading questions: ${error.message}</div>`;
    }
  },

  // Load all questions initially
  async loadAllQuestions(page = 1) {
    try {
      // Get all questions first to implement pagination
      const allQuestions = await QuizQuestionsService.getQuestions();

      const itemsPerPage = 20;
      const totalPages = Math.ceil(allQuestions.length / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedQuestions = allQuestions.slice(startIndex, startIndex + itemsPerPage);

      const questionsList = document.getElementById('questionsList');
      if (!questionsList) return;

      if (allQuestions.length === 0) {
        questionsList.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #9ca3af;">
            <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
            <div style="font-size: 18px; margin-bottom: 8px;">No questions found</div>
            <div>Try adding some questions using the "Add New Question" button</div>
          </div>
        `;
        return;
      }

      // Render questions list
      let html = '<div class="questions-grid" style="display: grid; gap: 16px;">';
      paginatedQuestions.forEach(q => {
        html += `
          <div class="question-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="background: #e0e7ff; color: #4f46e5; padding: 2px 8px; border-radius: 20px; font-size: 12px; font-weight: 600;">${q.category}</span>
                <span>${q.question}</span>
              </div>
              <div style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">Options: ${q.option_1}, ${q.option_2}${q.option_3 ? ', ' + q.option_3 : ''}${q.option_4 ? ', ' + q.option_4 : ''}</div>
              <div style="color: #10b981; font-weight: 600; font-size: 13px;">Correct Answer: ${['Option 1', 'Option 2', 'Option 3', 'Option 4'][q.correct_answer]}</div>
            </div>
            <div style="display: flex; gap: 8px; flex-shrink: 0;">
              <button class="btn-sm" onclick="AdminPage.editQuestion(${q.id})" style="background: #93c5fd; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: background 0.3s;" onmouseover="this.style.background='#60a5fa'" onmouseout="this.style.background='#93c5fd'">✏️ Edit</button>
              <button class="btn-sm" onclick="AdminPage.deleteQuestion(${q.id})" style="background: #f87171; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: background 0.3s;" onmouseover="this.style.background='#ef4444'" onmouseout="this.style.background='#f87171'">🗑️ Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';

      // Add pagination controls
      html += '<div class="pagination-controls" style="display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 10px;">';

      // Previous button
      if (page > 1) {
        html += `<button class="btn-sm" onclick="AdminPage.loadAllQuestions(${page - 1})" style="background: #e5e7eb; color: #374151; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.3s;">← Prev</button>`;
      } else {
        html += `<button class="btn-sm" disabled style="background: #e5e7eb; color: #9ca3af; border: none; padding: 8px 12px; border-radius: 6px; cursor: not-allowed;">← Prev</button>`;
      }

      // Page info
      html += `<span style="color: #6b7280; padding: 0 10px;">Page ${page} of ${totalPages}</span>`;

      // Next button
      if (page < totalPages) {
        html += `<button class="btn-sm" onclick="AdminPage.loadAllQuestions(${page + 1})" style="background: #e5e7eb; color: #374151; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.3s;">Next →</button>`;
      } else {
        html += `<button class="btn-sm" disabled style="background: #e5e7eb; color: #9ca3af; border: none; padding: 8px 12px; border-radius: 6px; cursor: not-allowed;">Next →</button>`;
      }

      html += '</div>';

      questionsList.innerHTML = html;
    } catch (error) {
      const questionsList = document.getElementById('questionsList');
      if (questionsList) {
        questionsList.innerHTML = `<div class="error-message" style="text-align: center; padding: 40px; color: #ef4444;">Error loading questions: ${error.message}</div>`;
      }
    }
  },

  // Edit question
  async editQuestion(questionId) {
    try {
      // Get the question to edit
      const allQuestions = await QuizQuestionsService.getQuestions();
      const questionToEdit = allQuestions.find(q => q.id == questionId);

      if (!questionToEdit) {
        showNotification('Question not found', 'error');
        return;
      }

      // Show edit modal
      this.showEditQuestionModal(questionToEdit);
    } catch (error) {
      console.error('Error loading question for editing:', error);
      showNotification('Error loading question for editing: ' + error.message, 'error');
    }
  },

  // Show edit question modal
  showEditQuestionModal(question) {
    const modalHTML = `
  <div class="modal-overlay show" id="editQuestionModal" onclick="if(event.target === this) AdminPage.closeEditQuestionModal()" style="backdrop-filter: blur(12px); background: rgba(15, 23, 42, 0.8) !important; z-index: 10001; animation: modalFadeIn 0.3s ease; display: flex !important; align-items: center; justify-content: center;">
        <div class="modal-card" style="width: 95% !important; max-width: 650px !important; border-radius: 24px !important; overflow: hidden !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important; animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important; display: block !important;">
          <div class="modal-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div class="modal-title" style="display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">
              <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">✏️</div>
              <span>Edit Question</span>
            </div>
            <button class="btn-close" onclick="AdminPage.closeEditQuestionModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(4px);" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='rotate(0deg)'">✖</button>
          </div>

          <div style="padding: 24px; background: white;">
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
              <div class="form-group">
                <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase;">Category *</label>
                <select id="editQuestionCategory" class="modern-select" style="width: 100%; height: 48px; border: 2px solid #e2e8f0; border-radius: 12px; padding: 0 16px; background: #f8fafc;">
                  <option value="mixed" ${question.category === 'mixed' ? 'selected' : ''}>Mixed Topics</option>
                  <option value="spad" ${question.category === 'spad' ? 'selected' : ''}>SPAD</option>
                  <option value="rhs" ${question.category === 'rhs' ? 'selected' : ''}>RHS</option>
                  <option value="loco" ${question.category === 'loco' ? 'selected' : ''}>Locomotive</option>
                  <option value="automatic-signaling" ${question.category === 'automatic-signaling' ? 'selected' : ''}>Automatic Signaling</option>
                  <option value="modified-signaling" ${question.category === 'modified-signaling' ? 'selected' : ''}>Modified Signaling</option>
                  <option value="absolute-block" ${question.category === 'absolute-block' ? 'selected' : ''}>Absolute Block</option>
                </select>
              </div>

              <div class="form-group">
                <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase;">Question Text *</label>
                <textarea id="editQuestionText" rows="3" style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 15px; background: #f8fafc; resize: vertical;">${question.question}</textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 700; color: #1e293b; font-size: 12px;">OPTION 1</label>
                  <input type="text" id="editOption1" value="${question.option_1}" style="width: 100%; height: 44px; padding: 0 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc;" />
                </div>
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 700; color: #1e293b; font-size: 12px;">OPTION 2</label>
                  <input type="text" id="editOption2" value="${question.option_2}" style="width: 100%; height: 44px; padding: 0 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc;" />
                </div>
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 700; color: #1e293b; font-size: 12px;">OPTION 3</label>
                  <input type="text" id="editOption3" value="${question.option_3 || ''}" style="width: 100%; height: 44px; padding: 0 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc;" />
                </div>
                <div class="form-group">
                  <label style="display: block; margin-bottom: 6px; font-weight: 700; color: #1e293b; font-size: 12px;">OPTION 4</label>
                  <input type="text" id="editOption4" value="${question.option_4 || ''}" style="width: 100%; height: 44px; padding: 0 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc;" />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                  <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase;">Correct Answer</label>
                  <select id="editCorrectAnswer" style="width: 100%; height: 48px; border: 2px solid #e2e8f0; border-radius: 12px; padding: 0 12px; background: #f1f5f9; font-weight: 600;">
                    <option value="0" ${question.correct_answer === 0 ? 'selected' : ''}>Option 1</option>
                    <option value="1" ${question.correct_answer === 1 ? 'selected' : ''}>Option 2</option>
                    <option value="2" ${question.correct_answer === 2 ? 'selected' : ''}>Option 3</option>
                    <option value="3" ${question.correct_answer === 3 ? 'selected' : ''}>Option 4</option>
                  </select>
                </div>
                <div class="form-group">
                  <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase;">Status</label>
                  <select id="editQuestionStatus" style="width: 100%; height: 48px; border: 2px solid #e2e8f0; border-radius: 12px; padding: 0 12px; background: #f1f5f9; font-weight: 600;">
                    <option value="1" ${question.is_active === 1 ? 'selected' : ''}>Active</option>
                    <option value="0" ${question.is_active === 0 ? 'selected' : ''}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div id="editQuestionError" class="error-message" style="padding: 0 24px 16px; text-align: center; color: #ef4444; font-size: 13px;"></div>

          <div class="modal-actions" style="padding: 20px 24px; display: flex; gap: 12px; justify-content: flex-end; background: #f8fafc; border-top: 1px solid #e2e8f0;">
            <button class="btn-modern" onclick="AdminPage.closeEditQuestionModal()" style="background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer;">Cancel</button>
            <button class="btn-modern" onclick="AdminPage.submitEditQuestion(${question.id})" style="background: #f59e0b; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); display: flex; align-items: center; gap: 8px;">
              <span class="material-icons" style="font-size: 18px;">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
  </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit edit question
  async submitEditQuestion(questionId) {
    const category = document.getElementById('editQuestionCategory').value;
    const questionText = document.getElementById('editQuestionText').value.trim();
    const option1 = document.getElementById('editOption1').value.trim();
    const option2 = document.getElementById('editOption2').value.trim();
    const option3 = document.getElementById('editOption3').value.trim();
    const option4 = document.getElementById('editOption4').value.trim();
    const correctAnswer = document.getElementById('editCorrectAnswer').value;
    const status = document.getElementById('editQuestionStatus').value;
    const errorElem = document.getElementById('editQuestionError');

    // Validation
    if (!category || !questionText || !option1 || !option2 || !correctAnswer) {
      errorElem.textContent = 'Please fill in all required fields.';
      return;
    }

    const questionData = {
      id: questionId,
      category,
      question: questionText,
      option_1: option1,
      option_2: option2,
      option_3: option3,
      option_4: option4,
      correct_answer: parseInt(correctAnswer),
      is_active: parseInt(status)
    };

    try {
      const response = await QuizQuestionsService.updateQuestion(questionData);

      if (response && response.success) {
        AdminPage.closeEditQuestionModal();
        // Refresh the questions list
        AdminPage.filterQuestions();
        showNotification('Question updated successfully', 'success');
      } else {
        errorElem.textContent = response?.error || 'Failed to update question.';
      }
    } catch (error) {
      errorElem.textContent = 'Error updating question: ' + error.message;
    }
  },

  // Close edit question modal
  closeEditQuestionModal() {
    const modal = document.getElementById('editQuestionModal');
    if (modal) {
      modal.remove();
    }
  },

  // Delete question
  async deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await QuizQuestionsService.deleteQuestion(questionId);
        if (response && response.success) {
          // Refresh the questions list
          AdminPage.filterQuestions();
        }
      } catch (error) {
        showNotification('Error deleting question: ' + error.message, 'error');
      }
    }
  },

  // ==================== POPUP MANAGEMENT ====================

  // Load popup management list
  async loadPopupManagement() {
    const container = document.getElementById('popupManagementList');
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner">Loading popups...</div>';

    try {
      const result = await PopupService.getAllPopups();

      if (!result.success || !result.popups) {
        container.innerHTML = '<div class="error-message">Failed to load popups</div>';
        return;
      }

      const popups = result.popups;

      if (popups.length === 0) {
        container.innerHTML = `
  <div style="text-align: center; padding: 40px; color: #6b7280;">
            <div style="font-size: 48px; margin-bottom: 16px;">📢</div>
            <div style="font-size: 16px; font-weight: 600;">No popup messages yet</div>
            <div style="font-size: 14px; margin-top: 8px;">Create a popup to notify users about important updates</div>
          </div>
  `;
        return;
      }

      const now = new Date();

      container.innerHTML = `
  <div style="display: grid; gap: 16px;">
    ${popups.map(popup => {
        const startDate = new Date(popup.start_datetime);
        const endDate = new Date(popup.end_datetime);
        const isActive = popup.is_active && startDate <= now && endDate >= now;
        const statusColor = isActive ? '#10b981' : popup.is_active ? '#f59e0b' : '#6b7280';
        const statusText = isActive ? 'Active' : popup.is_active ? 'Scheduled' : 'Inactive';
        const hasImage = popup.image_url && popup.image_url.trim() !== '';

        return `
              <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: all 0.3s;" 
                   onmouseover="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.15)';" 
                   onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <div>
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${popup.title}</h3>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <span style="background: ${statusColor}20; color: ${statusColor}; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">${statusText}</span>
                      <span style="background: #f3f4f6; color: #6b7280; font-size: 11px; padding: 4px 10px; border-radius: 20px;">${popup.content_type === 'html' ? '🌐 HTML' : popup.content_type === 'image' ? '🖼️ Image' : '📝 Text'}</span>
                      ${popup.show_once ? '<span style="background: #dbeafe; color: #1e40af; font-size: 11px; padding: 4px 10px; border-radius: 20px;">Show Once</span>' : ''}
                      ${hasImage ? '<span style="background: #fce7f3; color: #be185d; font-size: 11px; padding: 4px 10px; border-radius: 20px;">📷 Has Image</span>' : ''}
                    </div>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button onclick="AdminPage.togglePopupStatus(${popup.id}, ${popup.is_active ? 0 : 1})" 
                            style="background: ${popup.is_active ? '#dc2626' : '#10b981'}; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;"
                            onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                      ${popup.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="AdminPage.deletePopup(${popup.id})" 
                            style="background: #6b7280; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;"
                            onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#6b7280'">
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div style="color: #4b5563; font-size: 14px; margin-bottom: 12px; line-height: 1.5;">
                  ${popup.content_type === 'html' ? '(HTML Content)' : popup.content.substring(0, 150)}${popup.content.length > 150 ? '...' : ''}
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 12px;">
                  <div>
                    📅 ${new Date(popup.start_datetime).toLocaleString('en-IN')} - ${new Date(popup.end_datetime).toLocaleString('en-IN')}
                  </div>
                  <div style="display: flex; gap: 16px;">
                    <span>👥 ${popup.target_role}</span>
                    <span title="Unique Users who saw this">👤 ${popup.unique_view_count || 0} unique</span>
                    <span title="Total times this popup was shown">👁️ ${popup.total_views || 0} total views</span>
                  </div>
                </div>
              </div>
            `;
      }).join('')
        }
  </div>
  `;
    } catch (error) {
      console.error('Error loading popups:', error);
      container.innerHTML = '<div class="error-message">Error loading popups: ' + error.message + '</div>';
    }
  },

  // Show create popup modal
  showCreatePopupModal() {
    const user = AuthService.getUser();
    const isSuperAdmin = user && user.role === 'super';

    // Get lobbies for each division
    const lobbies = LobbyManagementService.getLobbies();
    const divisions = ['jaipur', 'ajmer', 'jodhpur', 'bikaner'];

    const modalHTML = `
  <div class="modal-overlay show" id="createPopupModal" onclick="if(event.target === this) AdminPage.closeCreatePopupModal()" style="animation: modalFadeIn 0.3s ease;">
    <div class="modal-card" style="max-width: 900px; max-height: 95vh; overflow-y: auto; animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);">
      <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; position: relative; overflow: hidden;">
        <!-- Animated background decoration -->
        <div style="position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: rgba(255,255,255,0.1); border-radius: 50%; animation: pulse 3s ease-in-out infinite;"></div>
        <div style="position: absolute; bottom: -30%; left: -10%; width: 200px; height: 200px; background: rgba(255,255,255,0.08); border-radius: 50%; animation: pulse 3s ease-in-out infinite 1s;"></div>
        <div class="modal-title" style="color: white; position: relative; z-index: 1; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px; animation: bounce 2s infinite;">📢</span>
          <span>Create Popup Message</span>
        </div>
        <button class="btn-close" onclick="AdminPage.closeCreatePopupModal()" style="color: white; position: relative; z-index: 1; transition: transform 0.2s;" onmouseover="this.style.transform='rotate(90deg)'" onmouseout="this.style.transform='rotate(0)'">✖</button>
      </div>

      <style>
        @keyframes modalFadeIn {
          from {opacity: 0; }
        to {opacity: 1; }
            }
        @keyframes modalSlideUp {
          from {
          opacity: 0;
        transform: translateY(40px) scale(0.95);
              }
        to {
          opacity: 1;
        transform: translateY(0) scale(1);
              }
            }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
              50% {transform: scale(1.1); opacity: 0.3; }
            }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
              50% {transform: translateY(-5px); }
            }
        .form-group:focus-within label {
          color: #667eea !important;
        transition: color 0.3s ease;
            }
        .form-group:focus-within input,
        .form-group:focus-within textarea,
        .form-group:focus-within select {
          border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        transition: all 0.3s ease;
            }
        #popupContent {
          min-height: 200px !important;
        resize: vertical;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
            }
        @media (max-width: 768px) {
          #popupContent {
          min-height: 150px !important;
              }
            }
      </style>

      <div style="padding: 28px;">
        <!-- Title -->
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span>📝</span> Title *
          </label>
          <input type="text" id="popupTitle" class="modern-input" placeholder="Enter popup title" style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 14px; font-size: 16px; width: 100%; transition: all 0.3s ease;" />
        </div>

        <!-- Content Type -->
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span>🎨</span> Content Type
          </label>
          <select id="popupContentType" class="modern-select" onchange="AdminPage.togglePopupEditor()" style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 12px; font-size: 15px; width: 100%; cursor: pointer; background: white; transition: all 0.3s ease;">
            <option value="text">📝 Plain Text</option>
            <option value="html">🌐 HTML (Rich Content)</option>
            <option value="image">🖼️ Image Only</option>
          </select>
        </div>

        <!-- Content Editor -->
        <div class="form-group" id="popupContentGroup" style="margin-bottom: 20px;">
          <label style="font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span>📄</span> Content *
          </label>
          <textarea id="popupContent" class="modern-input" placeholder="Enter popup content..." style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 16px; width: 100%; transition: all 0.3s ease;"></textarea>
          <div id="popupHtmlEditor" style="display: none; margin-top: 12px; padding: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <p style="font-size: 13px; color: #0369a1; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">💡</span>
              <span><strong>HTML Editor:</strong> You can use HTML tags, inline CSS, and even &lt;script&gt; tags. Content runs in sandboxed iframe for security.</span>
            </p>
          </div>
        </div>

        <!-- Image Upload Section -->
        <div class="form-group" id="popupImageGroup" style="display: none;">
          <label style="font-weight: 600; color: #374151;">Popup Image</label>
          <div style="border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; text-align: center; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);">
            <input type="file" id="popupImageInput" accept="image/*" style="display: none;" onchange="AdminPage.handlePopupImageUpload(this)">
              <div id="popupImagePreviewContainer" style="display: none; margin-bottom: 16px;">
                <img id="popupImagePreview" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              </div>
              <button type="button" class="btn-sm btn-primary" onclick="document.getElementById('popupImageInput').click()" style="padding: 10px 20px;">
                📷 Select Image
              </button>
              <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">or paste image URL below</p>
              <input type="text" id="popupImageUrl" class="modern-input" style="margin-top: 8px; border: 2px solid #e5e7eb; border-radius: 8px;" placeholder="https://example.com/image.jpg">
              </div>

              <div class="form-group" style="margin-top: 12px;">
                <label style="font-weight: 600; color: #374151;">Image Position</label>
                <select id="popupImagePosition" class="modern-select" style="border: 2px solid #e5e7eb; border-radius: 8px;">
                  <option value="top">⬆️ Top (Above content)</option>
                  <option value="bottom">⬇️ Bottom (Below content)</option>
                  <option value="background">🎨 Background (Subtle)</option>
                </select>
              </div>
          </div>

          <!-- Schedule Section -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="font-weight: 600; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              📅 Schedule
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group" style="margin: 0;">
                <label style="font-size: 13px; color: #6b7280;">Start Date/Time *</label>
                <input type="datetime-local" id="popupStartDate" class="modern-input" style="border: 2px solid #e5e7eb; border-radius: 8px;" />
              </div>
              <div class="form-group" style="margin: 0;">
                <label style="font-size: 13px; color: #6b7280;">End Date/Time *</label>
                <input type="datetime-local" id="popupEndDate" class="modern-input" style="border: 2px solid #e5e7eb; border-radius: 8px;" />
              </div>
            </div>
          </div>

          <!-- Targeting Section -->
          <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="font-weight: 600; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              🎯 Target Audience
            </div>

            <div class="form-group">
              <label style="font-size: 13px; color: #6b7280;">Target Role</label>
              <select id="popupTargetRole" class="modern-select" onchange="AdminPage.updatePopupTargeting()" style="border: 2px solid #e5e7eb; border-radius: 8px;">
                <option value="all">🌍 All Users (Including Guests)</option>
                <option value="crew">👷 Crew Members Only</option>
                <option value="lobby">🏢 Lobby Admins Only</option>
                <option value="division">🏛️ Division Admins Only</option>
                <option value="super">👑 Super Admins Only</option>
              </select>
            </div>

            ${isSuperAdmin ? `
              <div id="divisionLobbySection" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                <div class="form-group" style="margin: 0;">
                  <label style="font-size: 13px; color: #6b7280;">Target Division</label>
                  <select id="popupTargetDivision" class="modern-select" onchange="AdminPage.updateLobbyDropdown()" style="border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="">📍 All Divisions</option>
                    ${divisions.map(div => `<option value="${div}">${div.charAt(0).toUpperCase() + div.slice(1)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin: 0;">
                  <label style="font-size: 13px; color: #6b7280;">Target Lobby</label>
                  <select id="popupTargetLobby" class="modern-select" style="border: 2px solid #e5e7eb; border-radius: 8px;" disabled>
                    <option value="">🏢 All Lobbies</option>
                  </select>
                </div>
              </div>
              ` : ''}
          </div>

          <!-- Options -->
          <div style="display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 12px; background: #f3f4f6; border-radius: 8px;">
              <input type="checkbox" id="popupShowOnce" checked style="width: 20px; height: 20px;" />
              <span style="font-size: 14px; color: #374151;">👁️ Show only once per user</span>
            </label>
          </div>

          <!-- Preview Section -->
          <div style="margin-top: 28px; border: 2px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">👁️</span> Preview
              </span>
              <button type="button" class="btn-sm btn-primary" onclick="AdminPage.previewPopup()" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span>🔄</span> Refresh Preview
              </button>
            </div>
            <div id="popupPreviewContainer" style="padding: 24px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); min-height: 250px; display: flex; align-items: center; justify-content: center;">
              <div style="color: #9ca3af; text-align: center; animation: fadeIn 0.5s ease;">
                <div style="font-size: 56px; margin-bottom: 12px; animation: float 3s ease-in-out infinite;">👁️</div>
                <div style="font-size: 15px;">Click "Refresh Preview" to see how your popup will look</div>
              </div>
            </div>
          </div>

          <div id="popupCreateError" class="error-message" style="margin-top: 16px; padding: 12px; border-radius: 8px; background: #fee2e2; color: #dc2626;"></div>
        </div>

        <div class="modal-actions" style="padding: 20px; border-top: 1px solid #e5e7eb; background: #f9fafb; display: flex; justify-content: flex-end; gap: 12px;">
          <button class="btn-sm" onclick="AdminPage.closeCreatePopupModal()" style="padding: 10px 20px;">Cancel</button>
          <button class="btn-sm btn-primary" onclick="AdminPage.submitCreatePopup()" style="padding: 10px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-weight: 600;">🚀 Create Popup</button>
        </div>
      </div>
    </div>
`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Store lobbies data for cascading dropdown
    this._lobbiesData = lobbies;

    // Set default dates
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    document.getElementById('popupStartDate').value = now.toISOString().slice(0, 16);
    document.getElementById('popupEndDate').value = tomorrow.toISOString().slice(0, 16);

    // Initial preview
    setTimeout(() => this.previewPopup(), 100);
  },

  // Update lobby dropdown based on selected division
  updateLobbyDropdown() {
    const divisionSelect = document.getElementById('popupTargetDivision');
    const lobbySelect = document.getElementById('popupTargetLobby');

    if (!divisionSelect || !lobbySelect) return;

    const selectedDivision = divisionSelect.value;
    const lobbies = this._lobbiesData || LobbyManagementService.getLobbies();

    // Clear current options
    lobbySelect.innerHTML = '<option value="">🏢 All Lobbies</option>';

    if (selectedDivision && lobbies[selectedDivision]) {
      lobbySelect.disabled = false;
      lobbies[selectedDivision].forEach(lobby => {
        const option = document.createElement('option');
        option.value = lobby;
        option.textContent = `🏢 ${lobby} `;
        lobbySelect.appendChild(option);
      });
    } else {
      lobbySelect.disabled = true;
    }
  },

  // Update popup targeting UI based on role selection
  updatePopupTargeting() {
    const roleSelect = document.getElementById('popupTargetRole');
    const divisionLobbySection = document.getElementById('divisionLobbySection');

    if (!roleSelect || !divisionLobbySection) return;

    const role = roleSelect.value;

    // Show/hide division/lobby targeting based on role
    if (role === 'all' || role === 'super') {
      divisionLobbySection.style.opacity = '0.5';
      divisionLobbySection.style.pointerEvents = 'none';
    } else {
      divisionLobbySection.style.opacity = '1';
      divisionLobbySection.style.pointerEvents = 'auto';
    }
  },

  // Preview popup in admin panel
  previewPopup() {
    const title = document.getElementById('popupTitle')?.value || 'Preview Title';
    const content = document.getElementById('popupContent')?.value || '';
    const contentType = document.getElementById('popupContentType')?.value || 'text';
    const imageUrl = document.getElementById('popupImageUrl')?.value || '';
    const imagePosition = document.getElementById('popupImagePosition')?.value || 'top';

    const previewContainer = document.getElementById('popupPreviewContainer');
    if (!previewContainer) return;

    // Build preview HTML (similar to actual popup but in preview mode)
    const isHTML = contentType === 'html';
    const hasImage = imageUrl && imageUrl.trim() !== '';

    let imageHTML = '';
    if (hasImage) {
      const imageStyles = imagePosition === 'background'
        ? 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.15; z-index: 0;'
        : 'width: 100%; max-height: 150px; object-fit: cover; display: block; border-radius: 8px;';
      imageHTML = `< img src = "${imageUrl}" style = "${imageStyles}" onerror = "this.style.display='none'" /> `;
    }

    let contentHTML = '';
    if (isHTML) {
      // For HTML content, use iframe for perfect isolation
      const previewId = 'preview-html-' + Date.now();

      // Build complete HTML document - NO SCROLLBAR
      const fullHTML = `< !DOCTYPE html >
  <html>
    <head>
      <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {margin: 0; padding: 0; box-sizing: border-box; }
            html, body {overflow: hidden; }
            body {
              font - family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 10px;
            overflow: visible;
}
            img {max - width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>`;

      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      contentHTML = `
      <iframe
        sandbox="allow-scripts"
        style="width: 100%; min-height: 150px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; overflow: hidden;"
        src="${url}"
        onload="this.style.height = (this.contentWindow.document.body.scrollHeight + 20) + 'px'">
      </iframe>
      `;
    } else if (contentType === 'image') {
      contentHTML = '<div style="color: #9ca3af; font-style: italic; text-align: center; padding: 20px;">🖼️ Image only popup</div>';
    } else {
      contentHTML = `<div style="white-space: pre-wrap; color: #374151; line-height: 1.6; font-size: 15px;">${this.escapeHtml(content)}</div>`;
    }

    previewContainer.innerHTML = `
      <div style="background: white; border-radius: 16px; max-width: 500px; width: 100%; box-shadow: 0 25px 50px rgba(0,0,0,0.15); overflow: hidden; position: relative; animation: previewPop 0.3s ease;">
        <style>
          @keyframes previewPop {
            0 % { transform: scale(0.95); opacity: 0; }
            100% {transform: scale(1); opacity: 1; }
          }
        </style>
        ${imagePosition === 'background' && hasImage ? imageHTML : ''}
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px 20px; color: white; position: relative; z-index: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${this.escapeHtml(title)}</h3>
            <button onclick="this.closest('.popup-overlay')?.remove() || this.closest('.modal-overlay')?.remove() || this.parentElement.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✖</button>
          </div>
        </div>
        ${imagePosition === 'top' && hasImage ? `<div style="padding: 16px 20px 0;">${imageHTML}</div>` : ''}
        <div style="padding: 20px; position: relative; z-index: 1;">
          ${contentHTML}
        </div>
        ${imagePosition === 'bottom' && hasImage ? `<div style="padding: 0 20px 16px;">${imageHTML}</div>` : ''}
        <div style="padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; position: relative; z-index: 1;">
          <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 8px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">Got it</button>
        </div>
      </div>
      `;
  },

  // Helper to escape HTML
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Toggle popup editor based on content type
  togglePopupEditor() {
    const contentType = document.getElementById('popupContentType').value;
    const htmlEditor = document.getElementById('popupHtmlEditor');
    const contentGroup = document.getElementById('popupContentGroup');
    const imageGroup = document.getElementById('popupImageGroup');
    const contentTextarea = document.getElementById('popupContent');

    if (htmlEditor) {
      htmlEditor.style.display = contentType === 'html' ? 'block' : 'none';
    }

    // Show/hide content and image sections based on type
    if (contentGroup) {
      contentGroup.style.display = contentType === 'image' ? 'none' : 'block';
    }
    if (imageGroup) {
      imageGroup.style.display = (contentType === 'image' || contentType === 'html') ? 'block' : 'none';
    }

    // Update required attribute
    if (contentTextarea) {
      contentTextarea.required = contentType !== 'image';
    }
  },

  // Handle popup image upload
  async handlePopupImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('❌ Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('❌ Image size must be less than 5MB', 'error');
      return;
    }

    // Show preview
    const previewContainer = document.getElementById('popupImagePreviewContainer');
    const preview = document.getElementById('popupImagePreview');
    const urlInput = document.getElementById('popupImageUrl');

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      showNotification('📤 Uploading image...', 'info');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'popup');

      const baseUrl = Api.getBaseUrl ? Api.getBaseUrl() : '/api';
      const response = await fetch(`${baseUrl}/file_api/file_upload.php`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        urlInput.value = result.url || `./uploads/${result.filename}`;
        showNotification('✅ Image uploaded successfully', 'success');
      } else {
        showNotification('❌ Failed to upload image: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showNotification('❌ Error uploading image', 'error');
    }
  },

  // Close create popup modal
  closeCreatePopupModal() {
    const modal = document.getElementById('createPopupModal');
    if (modal) {
      modal.remove();
    }
  },

  // Submit create popup
  async submitCreatePopup() {
    const title = document.getElementById('popupTitle').value.trim();
    const content = document.getElementById('popupContent').value.trim();
    const contentType = document.getElementById('popupContentType').value;
    const startDate = document.getElementById('popupStartDate').value;
    const endDate = document.getElementById('popupEndDate').value;
    const targetRole = document.getElementById('popupTargetRole').value;
    const showOnce = document.getElementById('popupShowOnce').checked ? 1 : 0;
    const errorElem = document.getElementById('popupCreateError');

    // Get image data if present
    const imageUrl = document.getElementById('popupImageUrl')?.value?.trim() || null;
    const imagePosition = document.getElementById('popupImagePosition')?.value || 'top';

    // Validation
    if (!title || !startDate || !endDate) {
      errorElem.textContent = 'Please fill in all required fields';
      return;
    }

    // Content is required unless it's an image-only popup
    if (!content && !imageUrl && contentType !== 'image') {
      errorElem.textContent = 'Please enter content or add an image';
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      errorElem.textContent = 'End date must be after start date';
      return;
    }

    const popupData = {
      title,
      content: content || '',
      content_type: contentType,
      start_datetime: startDate,
      end_datetime: endDate,
      target_role: targetRole,
      show_once: showOnce,
      is_active: 1,
      image_url: imageUrl,
      image_position: imagePosition
    };

    // Add optional targets if super admin
    const targetDivision = document.getElementById('popupTargetDivision');
    const targetLobby = document.getElementById('popupTargetLobby');
    if (targetDivision && targetDivision.value) {
      popupData.target_division_id = targetDivision.value;
    }
    if (targetLobby && targetLobby.value) {
      // Send lobby name - backend will resolve to ID
      popupData.target_lobby_name = targetLobby.value;
    }

    try {
      const result = await PopupService.createPopup(popupData);

      if (result.success) {
        showNotification('✅ Popup created successfully', 'success');
        this.closeCreatePopupModal();
        this.loadPopupManagement();
      } else {
        errorElem.textContent = result.message || 'Failed to create popup';
      }
    } catch (error) {
      errorElem.textContent = 'Error: ' + error.message;
    }
  },

  // Toggle popup active status
  async togglePopupStatus(popupId, isActive) {
    try {
      const result = await PopupService.togglePopupStatus(popupId, isActive);

      if (result.success) {
        showNotification(isActive ? '✅ Popup activated' : '✅ Popup deactivated', 'success');
        this.loadPopupManagement();
      } else {
        showNotification('❌ ' + (result.message || 'Failed to update popup'), 'error');
      }
    } catch (error) {
      showNotification('❌ Error: ' + error.message, 'error');
    }
  },

  // Delete popup
  async deletePopup(popupId) {
    if (!confirm('Are you sure you want to delete this popup?')) {
      return;
    }

    try {
      const result = await PopupService.deletePopup(popupId);

      if (result.success) {
        showNotification('✅ Popup deleted', 'success');
        this.loadPopupManagement();
      } else {
        showNotification('❌ ' + (result.message || 'Failed to delete popup'), 'error');
      }
    } catch (error) {
      showNotification('❌ Error: ' + error.message, 'error');
    }
  }
};

// Export to window
window.AdminPage = AdminPage;
AdminPage.init();
