// Shared styling for locomotive tabs
const LOCO_TAB_STYLE = `
<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Custom Button Styling */
  .loco-tab-btn {
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
     position: relative;
     overflow: hidden;
  }
  
  /* Inactive State (Blue) */
  .loco-tab-btn:not(.active) {
     background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
     color: rgba(255, 255, 255, 0.9);
     box-shadow: 0 4px 6px rgba(30, 58, 138, 0.1);
  }
  
  .loco-tab-btn:hover:not(.active) {
     background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
     color: white;
     transform: translateY(-2px);
     box-shadow: 0 6px 12px rgba(37, 99, 235, 0.25);
  }
  
  /* Active State (Yellow) */
  .loco-tab-btn.active {
     background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
     color: #78350f; /* Dark brown for contrast */
     font-weight: 700;
     box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
     transform: translateY(-1px);
  }
  
  /* Mobile Tabs Styling */
  @media (max-width: 768px) {
    .loco-tab-container {
      background: #ffffff;
      padding: 8px;
      border-radius: 16px;
      gap: 8px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      border: 1px solid #f1f5f9;
    }
    .loco-tab-btn {
      flex: 1;
      padding: 12px 4px !important;
      font-size: 13px !important;
      text-align: center;
      border-radius: 12px !important;
      white-space: normal !important;
      line-height: 1.2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
`;

// Departments and Content Pages
var DepartmentsPage = {
  // Expose to window for real-time sync access
  init() {
    window.DepartmentsPage = this;
  },
  pages: {
    gmMessage: {
      title: 'GM Messages',
      content: `  
      `
    },
    pceeMessage: {
      title: 'PCEE Messages',
      content: `
      `
    },
    divisions: {
      title: 'Divisions',
      content: '', // Content is dynamically generated in render function
      renderDynamic: function () {
        const user = AuthService.getUser();
        const isLoggedIn = user.cms || user.email;
        const userDivision = user.division?.toLowerCase();

        // Define all divisions
        const allDivisions = [
          { id: 'jaipur', name: 'Jaipur Division', icon: '🚂', color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', hq: 'Jaipur' },
          { id: 'ajmer', name: 'Ajmer Division', icon: '🚆', color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', hq: 'Ajmer' },
          { id: 'jodhpur', name: 'Jodhpur Division', icon: '🛤️', color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', hq: 'Jodhpur' },
          { id: 'bikaner', name: 'Bikaner Division', icon: '🚛', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', hq: 'Bikaner' }
        ];

        // Show only related division for crew, all for admins
        if (isLoggedIn && user.role === 'crew') {
          visibleDivisions = allDivisions.filter(d => d.id === userDivision);
          if (visibleDivisions.length === 0) visibleDivisions = allDivisions; // fallback
        } else {
          visibleDivisions = allDivisions;
        }

        // Generate division cards HTML
        const divisionCards = visibleDivisions.map(div => {
          const icons = { 'jaipur': 'train', 'ajmer': 'directions_railway', 'jodhpur': 'subway', 'bikaner': 'tram' };
          const icon = icons[div.id] || 'train';

          return `
          <div class="division-card-big" data-view="divisions" onclick="DepartmentsPage.loadDivisionDetails('${div.id}')" 
               style="border-top: 4px solid ${div.id === 'jaipur' ? '#3b82f6' : div.id === 'ajmer' ? '#06b6d4' : div.id === 'jodhpur' ? '#8b5cf6' : '#10b981'}; overflow: visible; position: relative;">
            <div class="division-card-icon"><span class="material-icons" style="color: ${div.id === 'jaipur' ? '#3b82f6' : div.id === 'ajmer' ? '#06b6d4' : div.id === 'jodhpur' ? '#8b5cf6' : '#10b981'};">${icon}</span></div>
            <div class="division-card-name">${div.name}</div>
            <div class="division-card-desc">Headquarters: ${div.hq}</div>
          </div>
        `;
        }).join('');

        return `
          <div id="divisionContent" class="clean-page-content">
            <div style="margin: 16px 16px 8px 16px; text-align: center;">
              <h1 style="font-size: 28px; color: #003366; font-weight: 700; margin-bottom: 4px;">North Western Railway</h1>
              <div class="muted" style="font-size: 16px;">Divisions Information & Resources</div>
            </div>
            <div class="division-cards-grid" style="grid-template-columns: repeat(${visibleDivisions.length <= 4 ? visibleDivisions.length : '4'}, 1fr); max-width: none; margin-left: auto; margin-right: auto; padding-top: 16px;">
              ${divisionCards}
            </div>

          </div>
        `;
      }
    },
    ruleBooks: {
      title: 'Indian Railway Rule Books',
      content: `
        <div class="muted">Access complete rule books, operating manuals, and safety guidelines.</div>
        <div style="margin-top: 12px;">
          <ul class="rule-list">
            <li>📖 General & Subsidiary Rules (G&SR)</li>
            <li>📖 Accident Manual</li>
            <li>📖 Operating Manual</li>
            <li>📖 Block Working Rules</li>
            <li>📖 Signalling Manual</li>
          </ul>
        </div>
      `
    },
    electricLoco: {
      title: 'Electric Locomotives',
      content: `
        <!-- Modern Tabs -->
        <div class="loco-tab-container" style="display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">
          <button onclick="DepartmentsPage.switchLocoTab('conventional')" id="tab-btn-conventional" class="loco-tab-btn active" data-tab="conventional" 
                  style="padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-size: 14px; white-space: nowrap; font-weight: 600;">
            Conventional Loco
          </button>
          <button onclick="DepartmentsPage.switchLocoTab('threePhase')" id="tab-btn-threePhase" class="loco-tab-btn" data-tab="threePhase" 
                  style="padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-size: 14px; white-space: nowrap; font-weight: 600;">
            3-Phase Loco
          </button>
          <button onclick="DepartmentsPage.switchLocoTab('wag12')" id="tab-btn-wag12" class="loco-tab-btn" data-tab="wag12" 
                  style="padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-size: 14px; white-space: nowrap; font-weight: 600;">
            Wag-12 Loco
          </button>
        </div>

        <!-- Conventional Content -->
        <div id="loco-content-conventional" style="display: block; animation: fadeIn 0.3s ease-in-out;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px; flex-wrap: wrap; gap: 10px;">
            <div class="loco-tags">
            </div>
            
            <!-- Upload Button Injection Point -->
            {{upload_btn_conventional}}
          </div>
          
          <!-- Files Injection Point -->
          <div id="files-conventional">{{files_conventional}}</div>
        </div>

        <!-- 3-Phase Content -->
        <div id="loco-content-threePhase" style="display: none; animation: fadeIn 0.3s ease-in-out;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px; flex-wrap: wrap; gap: 10px;">
            <div class="loco-tags">
            </div>
            
            <!-- Upload Button Injection Point -->
            {{upload_btn_threePhase}}
          </div>
          
          <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; overflow: hidden; position: relative;">
            <div style="position: absolute; top: 0; right: 0; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30%, -30%);"></div>
            <div class="card-title" style="color: white; display: flex; align-items: center; gap: 12px; z-index: 1; position: relative;">
              <div style="background: rgba(255,255,255,0.2); padding: 8px; border-radius: 10px; backdrop-filter: blur(5px);">
                <span style="font-size: 24px;">⚡</span>
              </div>
              <span>3-Phase Electric Loco TSD</span>
            </div>
            <div style="opacity: 0.9; margin-bottom: 20px; line-height: 1.6; max-width: 80%; z-index: 1; position: relative;">
              
            </div>
            <button class="tsd-open-btn" onclick="NavigationService.navigateTo('threePhaseLocoFaults')" style="z-index: 1; position: relative; background: white; color: #764ba2; border: none; font-weight: 700;">
              <span class="btn-icon">🔍</span>
              <span>Open Fault Troubleshooting System</span>
            </button>
          </div>
          
          <div class="muted" style="margin-top: 12px; margin-bottom: 16px;"></div>
          
          <!-- Inline Manual Injection Point (below Fault System) -->
          {{three_phase_manual}}
          
          <!-- Files Injection Point -->
          <div id="files-threePhase">{{files_threePhase}}</div>
        </div>

        <!-- Wag-12 Content -->
        <div id="loco-content-wag12" style="display: none; animation: fadeIn 0.3s ease-in-out;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px; flex-wrap: wrap; gap: 10px;">
            <div class="loco-tags">
            </div>
            
            <!-- Upload Button Injection Point -->
            {{upload_btn_wag12}}
          </div>
          
          <!-- Files Injection Point -->
          <div id="files-wag12">{{files_wag12}}</div>
        </div>
        
        ${LOCO_TAB_STYLE}
      `
    },
    dieselLoco: {
      title: 'Diesel Locomotives',
      content: `
        <!-- Modern Tabs -->
        <div class="loco-tab-container" style="display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">
          <button onclick="DepartmentsPage.switchLocoTab('wdp4')" id="tab-btn-wdp4" class="loco-tab-btn active" data-tab="wdp4" 
                  style="padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-size: 14px; white-space: nowrap; font-weight: 600;">
            WDP-4
          </button>
          <button onclick="DepartmentsPage.switchLocoTab('wdg4')" id="tab-btn-wdg4" class="loco-tab-btn" data-tab="wdg4" 
                  style="padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-size: 14px; white-space: nowrap; font-weight: 600;">
            WDG-4
          </button>
          <button onclick="DepartmentsPage.switchLocoTab('wdm3')" id="tab-btn-wdm3" class="loco-tab-btn" data-tab="wdm3" 
                  style="padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-size: 14px; white-space: nowrap; font-weight: 600;">
            WDM-3
          </button>
        </div>

        <div id="loco-content-wdp4" style="display: block; animation: fadeIn 0.3s ease-in-out;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div class="loco-tags"></div>
            {{upload_btn_wdp4}}
          </div>
          <div id="files-wdp4">{{files_wdp4}}</div>
        </div>

        <div id="loco-content-wdg4" style="display: none; animation: fadeIn 0.3s ease-in-out;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div class="loco-tags"></div>
            {{upload_btn_wdg4}}
          </div>
          <div id="files-wdg4">{{files_wdg4}}</div>
        </div>

        <div id="loco-content-wdm3" style="display: none; animation: fadeIn 0.3s ease-in-out;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div class="loco-tags"></div>
            {{upload_btn_wdm3}}
          </div>
          <div id="files-wdm3">{{files_wdm3}}</div>
        </div>
        
        ${LOCO_TAB_STYLE}
      `
    },
    vandeBharat: {
      title: 'Vande Bharat Express',
      content: `
        <!-- Modern Tabs -->
        <div class="loco-tab-container" style="display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">
          <button onclick="DepartmentsPage.switchLocoTab('vb1')" id="tab-btn-vb1" class="loco-tab-btn active" data-tab="vb1" 
                  style="padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-size: 14px; white-space: nowrap; font-weight: 600;">
            Vande Bharat VB-01
          </button>
          <button onclick="DepartmentsPage.switchLocoTab('train18')" id="tab-btn-train18" class="loco-tab-btn" data-tab="train18" 
                  style="padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-size: 14px; white-space: nowrap; font-weight: 600;">
            Train-18
          </button>
        </div>

        <div id="loco-content-vb1" style="display: block; animation: fadeIn 0.3s ease-in-out;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div class="loco-tags"></div>
            {{upload_btn_vb1}}
          </div>
          <div id="files-vb1">{{files_vb1}}</div>
        </div>

        <div id="loco-content-train18" style="display: none; animation: fadeIn 0.3s ease-in-out;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div class="loco-tags"></div>
            {{upload_btn_train18}}
          </div>
          <div id="files-train18">{{files_train18}}</div>
        </div>

        ${LOCO_TAB_STYLE}
      `
    },
    memu: {
      title: 'MEMU (Mainline Electric Multiple Unit)',
      content: `
        <div class="card-title">MEMU Operations</div>
        <div class="muted">Information regarding MEMU trains, power cars, and operational guidelines.</div>
        <div id="files-memu">{{files_memu}}</div>
        <div style="margin-top: 10px;">{{upload_btn_memu}}</div>
      `
    },
    traffic: {
      title: 'Traffic Department',
      content: `
        <div class="card-title">Traffic Operations</div>
        <div class="muted">Block working, signaling systems, and traffic management guidelines.</div>
      `
    },
    ohe: {
      title: 'Overhead Equipment (OHE)',
      content: `
        <div class="card-title">OHE Guidelines</div>
        <div class="muted">Overhead electrification systems, pantograph operations, and safety procedures.</div>
      `
    },
    cw: {
      title: '🛠️ C & W',
      content: `
        <div class="card-title">C&W Department</div>
        <div class="muted">Coach maintenance, inspection schedules, and repair guidelines.</div>
      `
    },
    pway: {
      title: '🛤️ P-Way',
      content: `
        <div class="card-title">Track Maintenance</div>
        <div class="muted">Track safety, maintenance schedules, and inspection protocols.</div>
      `
    },
    spad: {
      title: 'SPAD Prevention',
      content: `
        <div class="card-title">Signal Passing At Danger Prevention</div>
        <div class="muted">SPAD prevention guidelines, case studies, and safety protocols to ensure signal compliance.</div>
        <div style="margin-top: 12px;">
          <ul class="warning-list">
            <li>⚠️ Always observe signals properly</li>
            <li>⚠️ Maintain prescribed speed limits</li>
            <li>⚠️ Report any signal defects immediately</li>
            <li>⚠️ Follow block working rules strictly</li>
            <li>⚠️ Use vigilance control device at all times</li>
          </ul>
        </div>
      `
    },
    kachav: {
      title: 'Kachav (Railway Protection System)',
      content: `
        <div class="card-title">Kachav Protection System</div>
        <div class="muted">Technical documentation, operating manuals, and safety guidelines for the Kachav (TCAS) system.</div>
      `
    }
  },

  async render(container, pageName) {
    this.currentPageName = pageName;
    // First check if it's a predefined page
    let pageData = this.pages[pageName];
    let mainTab = null;

    // If not found, check if it's a dynamic main tab
    if (!pageData) {
      const structure = ContentManagementService.getContentStructure();
      mainTab = structure.mainTabs.find(t => {
        const normTab = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normPage = pageName.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Handle common aliases and substrings


        return normTab === normPage ||
          normTab.includes(normPage) ||
          normPage.includes(normTab) ||
          (pageData && t.name.toLowerCase() === pageData.title.toLowerCase());
      });
      if (mainTab) {
        // Create dynamic page data for this tab
        pageData = {
          title: mainTab.name,
          isDynamic: true,
          content: `
            <div class="card-title">${mainTab.name}</div>
            <div class="muted">Content uploaded by admins will appear here.</div>
          `
        };
      }
    }

    // Set current view for real-time sync on main tabs
    if (mainTab && window.RealtimeSyncV2) {
      window.RealtimeSyncV2.setCurrentView(mainTab.id, mainTab.name, null);
    }

    if (!pageData) {
      container.innerHTML = '<div class="card"><div class="card-title">Page Not Found</div></div>';
      return;
    }

    // Special handling for divisions page - don't add file display
    if (pageName === 'divisions') {
      // Fetch fresh lobbies data from server before rendering
      await LobbyManagementService.fetchLobbiesFromServer();

      // Use dynamic content generation for divisions
      const divisionContent = pageData.renderDynamic ? pageData.renderDynamic() : pageData.content;

      container.innerHTML = `
        <div class="page active clean-page-content">
          ${divisionContent}
        </div>
      `;
      return;
    }

    // Get content structure to check for uploaded files
    const structure = ContentManagementService.getContentStructure();

    // If we didn't find mainTab earlier, try to find it now
    if (!mainTab) {
      mainTab = structure.mainTabs.find(t => {
        const normTab = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normPage = pageName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normTab === normPage ||
          normTab.includes(normPage) ||
          normPage.includes(normTab) ||
          (pageData && t.name.toLowerCase() === pageData.title.toLowerCase());
      });
    }

    // If it's a main tab, fetch files from server
    if (mainTab) {
      await ContentManagementService.fetchAndSyncFiles(mainTab.id);
    }

    const user = AuthService.getUser();
    const canManageFiles = user && user.role !== 'crew';

    // Special handling for Electric Loco Tabs
    // Use a local variable to store the content to avoid mutating the original template
    let renderedContent = pageData.content;

    // Special handling for Locomotive Tabs (Electric, Diesel, Vande Bharat, MEMU)
    if (mainTab && (pageName === 'electricLoco' || pageName === 'dieselLoco' || pageName === 'vandeBharat' || pageName === 'memu' || pageName === 'kachav')) {
      const allFiles = structure.files[mainTab.id] || [];
      let categories = [];
      if (pageName === 'electricLoco') categories = ['conventional', 'threePhase', 'wag12'];
      if (pageName === 'dieselLoco') categories = ['wdp4', 'wdg4', 'wdm3'];
      if (pageName === 'vandeBharat') categories = ['vb1', 'train18'];
      if (pageName === 'memu') categories = ['memu'];
      if (pageName === 'kachav') categories = ['kachav'];

      categories.forEach(cat => {
        const catFiles = allFiles.filter(f => f.category === cat);
        const catFolders = structure.folders ? Object.values(structure.folders).filter(f => f.targetId === mainTab.id && f.category === cat) : [];

        // Generate Folders HTML
        let catFoldersHTML = '';
        if (catFolders.length > 0) {
          catFoldersHTML = `
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 14px; font-weight: 600; color: #555; margin-bottom: 10px;">Folders</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                ${catFolders.map(folder => {
            const folderFiles = structure.files[mainTab.id]?.filter(f => f.folder === folder.id) || [];
            return `
                  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 16px; transition: all 0.3s ease; position: relative; cursor: pointer;"
                       onmouseover="this.style.borderColor='#f59e0b'; this.style.transform='translateY(-2px)';" 
                       onmouseout="this.style.borderColor='#fbbf24'; this.style.transform='translateY(0)';"
                       onclick="DepartmentsPage.openMainTabFolder('${mainTab.id}', '${folder.id}', '${folder.name.replace(/'/g, "\\'")}')">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="font-size: 24px;">📁</div>
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #78350f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${folder.name}</div>
                        <div style="font-size: 12px; color: #92400e;">${folderFiles.length} files</div>
                      </div>
                    </div>
                  </div>
                  `;
          }).join('')}
              </div>
            </div>
          `;
        }

        const htmlFiles = catFiles.filter(f => f.type === 'html');
        const otherFiles = catFiles.filter(f => f.type !== 'html');

        // Generate HTML Content
        let catHtmlContentHTML = '';
        if (htmlFiles.length > 0) {
          catHtmlContentHTML = htmlFiles.map((file, idx) => {
            const uniqueId = 'html-content-' + file.id + '-' + Date.now() + '-' + idx;
            return `
              <div style="margin-bottom: 16px; width: 100%; border: none; background: transparent;">
                ${canManageFiles ? `
                <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; padding: 6px 12px; background: #f9fafb; border-radius: 8px;">
                  <div style="display: flex; gap: 8px;">
                    <button class="btn-sm" onclick="ContentManagementService.viewFile('${file.id}')" style="background: #3b82f6; color: white; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer;">👁️ View</button>
                    <button class="btn-sm" onclick="ContentManagementService.deleteFile('${mainTab.id}', '${file.id}')" style="background: #dc2626; color: white; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer;">🗑️ Delete</button>
                  </div>
                </div>
                ` : ''}
                <div id="${uniqueId}" class="html-render-container" style="width: 100%; height: auto; overflow: visible; border: none; margin: 0; padding: 0; background: transparent;" 
                     data-css="${encodeURIComponent(file.content?.css || '')}" 
                     data-html="${encodeURIComponent(file.content?.html || '')}" 
                     data-js="${encodeURIComponent(file.content?.js || '')}"
                     data-table="${file.content?.displayAsTable === true ? 'true' : 'false'}">
                </div>
              </div>
            `;
          }).join('');
        }

        // Generate Other Files HTML
        let catOtherFilesHTML = '';
        if (otherFiles.length > 0) {
          catOtherFilesHTML = `
            <div>
              ${catFolders.length > 0 || htmlFiles.length > 0 ? '<h4 style="font-size: 14px; font-weight: 600; color: #555; margin-bottom: 10px;">Files</h4>' : ''}
              <div style="display: grid; gap: 12px;">
                ${otherFiles.map((file, index) => generateFileCard(file, index, {
            canDelete: canManageFiles,
            onView: `ContentManagementService.viewFile('${file.id}')`,
            onDelete: `ContentManagementService.deleteFile('${mainTab.id}', '${file.id}')`,
            tabId: mainTab.id
          })).join('')}
              </div>
            </div>`;
        }

        let catFilesHTML = (htmlFiles.length > 0 || otherFiles.length > 0) ? catHtmlContentHTML + catOtherFilesHTML : (catFolders.length === 0 ? `<div class="muted" style="text-align: center; padding: 20px; background: rgba(0,0,0,0.02); border-radius: 8px; font-size: 13px;">No content available.</div>` : '');

        let uploadBtnHTML = '';
        if (canManageFiles) {
          const displayNames = {
            'conventional': 'Conventional', 'threePhase': '3-Phase', 'wag12': 'Wag-12',
            'wdp4': 'WDP-4', 'wdg4': 'WDG-4', 'wdm3': 'WDM-3',
            'vb1': 'VB-01', 'train18': 'Train-18'
          };
          const btnLabel = displayNames[cat] || cat;
          uploadBtnHTML = `
            <div style="display: flex; gap: 8px;">
              <button class="btn-sm" onclick="ContentManagementService.showAddFolderModal('${mainTab.id}', '${pageData.title}', null, '${cat}')" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer;">
                <span>📁</span><span>Create Folder</span>
              </button>
              <button class="btn-sm btn-primary" onclick="ContentManagementService.showUploadFileModal('${mainTab.id}', 'tab', null, '${cat}')" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px;">
                <span>📄</span><span>Upload File</span>
              </button>
            </div>
          `;
        }

        renderedContent = renderedContent.replace(`{{files_${cat}}}`, catFoldersHTML + catFilesHTML);
        renderedContent = renderedContent.replace(`{{upload_btn_${cat}}}`, uploadBtnHTML);

        if (cat === 'threePhase' && pageName === 'electricLoco') {
          const manualBlock = `
            <div class="card" style="margin-bottom: 24px; animation: fadeIn 0.3s ease-in-out;">
              <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
                <span>📘</span><span>3-Phase Loco Manual</span>
              </div>
              <div id="three-phase-manual-container" style="width: 100%;">
                <iframe id="three-phase-manual" src="./3phase%20loco.html" style="width: 100%; border: none; display: block; overflow: hidden;" scrolling="no"></iframe>
              </div>
            </div>
            <script>
            (function() {
              var iframe = document.getElementById('three-phase-manual');
              if (!iframe) return;
              iframe.addEventListener('load', function() {
                try {
                  var doc = iframe.contentDocument || iframe.contentWindow.document;
                  var win = iframe.contentWindow;
                  var resize = function() {
                    if (!doc.body) return;
                    iframe.style.height = (doc.body.scrollHeight + 5) + 'px';
                  };
                  setTimeout(resize, 100);
                  if (typeof win.ResizeObserver !== 'undefined') {
                    new win.ResizeObserver(resize).observe(doc.body);
                  }
                  win.addEventListener('resize', resize);
                  [500, 1000, 2000].forEach(delay => setTimeout(resize, delay));
                } catch(e) {}
              });
            })();
            <\/script>
          `;
          renderedContent = renderedContent.replace('{{three_phase_manual}}', manualBlock);
        } else {
          renderedContent = renderedContent.replace('{{three_phase_manual}}', '');
        }
      });
    }

    let uploadButtonHTML = '';
    // Hide generic upload button for Electric Loco
    if (mainTab && canManageFiles && pageName !== 'electricLoco') {
      uploadButtonHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div class="page-title" style="margin-bottom: 4px;">${pageData.title}</div>
            <div class="muted" style="font-size: 13px;">Manage folders and upload files for this section</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-sm" onclick="ContentManagementService.showAddFolderModal('${mainTab.id}', '${pageData.title}')" style="display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #059669; color: white;" onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
              <span>📁</span>
              <span>Create Folder</span>
            </button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.showUploadFileModal('${mainTab.id}', 'tab')" style="display: flex; align-items: center; gap: 6px; padding: 10px 20px;">
              <span>📄</span>
              <span>Upload File</span>
            </button>
          </div>
        </div>
      `;
    }

    // Get folders for this tab
    let foldersHTML = '';
    if (mainTab && structure.folders) {
      // Get all folders that belong to this tab
      const folders = Object.values(structure.folders).filter(f => f.targetId === mainTab.id);

      if (folders.length > 0) {
        foldersHTML = `
        <div style="margin-top: ${uploadButtonHTML ? '0' : '24px'}; margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span>📂</span>
            <span>Folders (${folders.length})</span>
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
            ${folders.map(folder => {
          const folderFiles = structure.files[mainTab.id]?.filter(f => f.folder === folder.id) || [];
          return `
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 16px; padding: 24px; transition: all 0.3s ease; position: relative; box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2); cursor: pointer;"
                     onmouseover="this.style.borderColor='#f59e0b'; this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(245, 158, 11, 0.3)';" 
                     onmouseout="this.style.borderColor='#fbbf24'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(251, 191, 36, 0.2)';"
                     onclick="DepartmentsPage.openMainTabFolder('${mainTab.id}', '${folder.id}', '${folder.name.replace(/'/g, "\\'")}')">
                              
                  <!-- Folder Icon and Info -->
                  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                    <!-- Large Folder Icon with Gradient -->
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);">
                      📁
                    </div>
                                
                    <!-- Folder Name and File Count -->
                    <div style="flex: 1; min-width: 0;">
                      <h3 style="margin: 0 0 8px 0; font-size: 19px; font-weight: 700; color: #78350f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.3px;">
                        ${folder.name}
                      </h3>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="background: rgba(245, 158, 11, 0.2); color: #92400e; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
                          <span style="font-size: 16px;">📄</span>
                          <span>${folderFiles.length} ${folderFiles.length === 1 ? 'file' : 'files'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                              
                  <!-- Click Hint -->
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #92400e; opacity: 0.85; font-weight: 500; margin-top: 8px;">
                    <span style="font-size: 16px;">👁️</span>
                    <span>Click anywhere to open folder</span>
                  </div>
                              
                  ${canManageFiles ? `
                  <!-- Action Buttons - Redesigned Below Content -->
                  <div style="margin-top: 16px; padding-top: 16px; border-top: 2px dashed rgba(245, 158, 11, 0.3); display: flex; gap: 8px; justify-content: center;">
                    <button onclick="event.stopPropagation(); ContentManagementService.showEditFolderModal('${mainTab.id}', '${folder.id}', '${folder.name.replace(/'/g, "\\")}', '${pageData.title}');" 
                            style="background: white !important; border: 2px solid #fbbf24 !important; color: #b45309 !important; padding: 10px 18px !important; border-radius: 10px !important; cursor: pointer !important; font-size: 13px !important; font-weight: 700 !important; transition: all 0.2s !important; box-shadow: 0 2px 6px rgba(251, 191, 36, 0.2) !important; display: inline-flex !important; align-items: center !important; gap: 8px !important; flex: 1;"
                            onmouseover="this.style.background='#fef3c7'; this.style.borderColor='#f59e0b'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(251, 191, 36, 0.4)';" 
                            onmouseout="this.style.background='white'; this.style.borderColor='#fbbf24'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px rgba(251, 191, 36, 0.2)';">
                      <span style="font-size: 16px;">✏️</span>
                      <span>Edit Folder</span>
                    </button>
                    <button onclick="event.stopPropagation(); ContentManagementService.deleteFolderConfirm('${mainTab.id}', '${folder.id}', '${folder.name.replace(/'/g, "\\")}', '${pageData.title}');" 
                            style="background: white !important; border: 2px solid #fca5a5 !important; color: #dc2626 !important; padding: 10px 18px !important; border-radius: 10px !important; cursor: pointer !important; font-size: 13px !important; font-weight: 700 !important; transition: all 0.2s !important; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.15) !important; display: inline-flex !important; align-items: center !important; gap: 8px !important; flex: 1;"
                            onmouseover="this.style.background='#fee2e2'; this.style.borderColor='#dc2626'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(220, 38, 38, 0.3)';" 
                            onmouseout="this.style.background='white'; this.style.borderColor='#fca5a5'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px rgba(220, 38, 38, 0.15)';">
                      <span style="font-size: 16px;">🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                  ` : ''}
                </div>
              `;
        }).join('')}
          </div>
        </div>
      `;
      }
    }

    // Get files that are NOT in folders (root level files)
    let messageCardsHTML = '';
    let htmlContentHTML = '';
    let filesHTML = '';

    // For Electric Loco page, we ONLY want files that are NOT categorized
    // Because categorized files are already shown in the tabs above
    const isElectricLoco = pageName === 'electricLoco';

    if (mainTab && structure.files[mainTab.id]) {
      const allFiles = structure.files[mainTab.id];
      // Filter out files that are in folders OR have a specific category (unless category is null/empty)
      // This ensures files meant for specific tabs (like Electric Loco categories) don't show up in the main list
      let rootFiles = allFiles.filter(f => !f.folder && (!f.category || f.category === 'null'));

      // Strict filtering for Electric Loco page: 
      // If we are on Electric Loco page, we should hide ANY file that matches one of our known categories
      // even if the filter above missed it (e.g. case sensitivity or whitespace)
      if (isElectricLoco) {
        const knownCategories = ['conventional', 'threePhase', 'wag12', 'wag-12', '3-phase'];
        rootFiles = rootFiles.filter(f => {
          const cat = (f.category || '').toLowerCase();
          return !knownCategories.some(kc => cat.includes(kc));
        });

        // Also, if the file title implies it belongs to a category, we might want to hide it from generic list
        // But let's stick to category field for now to avoid hiding legitimate uncategorized files.
      }

      // Separate message cards, HTML content, and other files
      const messageCards = rootFiles.filter(f => f.type === 'message');
      const htmlContent = rootFiles.filter(f => f.type === 'html');
      const otherFiles = rootFiles.filter(f => f.type !== 'message' && f.type !== 'html');

      // Render Message Cards
      if (messageCards.length > 0) {
        messageCardsHTML = this.renderMessageCards(messageCards, canManageFiles, mainTab.id);
      }

      // Render HTML Content Cards
      if (htmlContent.length > 0) {
        htmlContentHTML = this.renderHTMLContentCards(htmlContent, canManageFiles, mainTab.id);
      }

      // Render Other Files
      if (otherFiles.length > 0) {
        filesHTML = `
          <div style="margin-top: ${(uploadButtonHTML || foldersHTML || messageCardsHTML || htmlContentHTML) ? '0' : '24px'};">
            <h3 style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>📄</span>
              <span>Files (${otherFiles.length})</span>
            </h3>
            <div style="display: grid; gap: 12px;">
              ${otherFiles.map((file, index) => generateFileCard(file, index, {
          canDelete: canManageFiles,
          onView: `ContentManagementService.viewFile('${file.id}')`,
          onDelete: `ContentManagementService.deleteFile('${mainTab.id}', '${file.id}')`,
          tabId: mainTab.id
        })).join('')}
            </div>
          </div>
        `;
      }
    }

    // Show empty state only if no folders and no files
    let emptyStateHTML = '';
    if (mainTab && canManageFiles && !foldersHTML && !filesHTML && !messageCardsHTML && !htmlContentHTML) {
      emptyStateHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #999; margin-top: ${uploadButtonHTML ? '0' : '24px'};">
          <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No folders or files yet</div>
          <div style="font-size: 14px;">Create folders to organize files or upload files directly</div>
        </div>
      `;
    }

    // Special handling for Electric Loco - rename "Files" to "Other Files" or hide it
    if (pageName === 'electricLoco') {
      // Force hide the generic list for Electric Loco to prevent duplicates
      // The specific tabs already show the files and folders.
      filesHTML = '';
      foldersHTML = '';
    }

    container.innerHTML = `
      <div class="page active">
        ${uploadButtonHTML ? uploadButtonHTML : `<div class="page-title" style="margin-bottom: 12px;">${pageData.title}</div>`}
        ${htmlContentHTML ? `
        <div style="width: 100%; border: none; margin: 0; padding: 0; background: transparent; box-shadow: none;">
          ${htmlContentHTML}
        </div>
        ` : ''}
        <div class="card" style="${htmlContentHTML ? 'border: none; box-shadow: none; background: transparent;' : ''}">
          ${(!uploadButtonHTML || !pageData.isDynamic) ? (renderedContent || pageData.content) : ''}
          ${messageCardsHTML}
          ${foldersHTML}
          ${filesHTML}
          ${emptyStateHTML}
        </div>
      </div>
    `;

    // Initialize HTML content rendering (main/division/lobby)
    this.initializeHTMLContainers();
  },

  // Switch tabs in Locomotive sections
  switchLocoTab(tabName, isBack = false) {
    // Push state for back button support
    if (!isBack) {
      try {
        history.pushState({
          view: this.currentPageName || 'electricLoco',
          subView: 'locoTab',
          tabName: tabName,
          timestamp: Date.now()
        }, '', `#loco/${tabName}`);
      } catch (e) { }
    }

    // Determine which tabs to toggle based on the tabName
    let tabGroup = [];
    if (['conventional', 'threePhase', 'wag12'].includes(tabName)) tabGroup = ['conventional', 'threePhase', 'wag12'];
    else if (['wdp4', 'wdg4', 'wdm3'].includes(tabName)) tabGroup = ['wdp4', 'wdg4', 'wdm3'];
    else if (['vb1', 'train18'].includes(tabName)) tabGroup = ['vb1', 'train18'];

    tabGroup.forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      const content = document.getElementById(`loco-content-${t}`);
      if (btn && content) {
        if (t === tabName) {
          btn.classList.add('active');
          content.style.display = 'block';
          content.style.animation = 'fadeIn 0.3s ease-in-out';
          // Ensure HTML content inside the switch is initialized
          this.initializeHTMLContainers();
        } else {
          btn.classList.remove('active');
          content.style.display = 'none';
        }
      }
    });
  },

  // Universal HTML container initialization
  initializeHTMLContainers() {
    setTimeout(() => {
      document.querySelectorAll('.html-render-container').forEach(container => {
        if (container.dataset.rendered) return;
        container.dataset.rendered = 'true';

        const css = decodeURIComponent(container.dataset.css || '');
        const html = decodeURIComponent(container.dataset.html || '');
        const js = decodeURIComponent(container.dataset.js || '');
        const asTable = (container.dataset.table === 'true');
        const uniqueId = 'html-render-' + Math.random().toString(36).substr(2, 9);

        const fullContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="${window.location.origin}${window.Api?.getBaseUrl()?.replace('/api', '') || ''}/">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }
body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; padding-bottom: 20px; word-wrap: break-word; }
img, table, video, canvas, iframe { max-width: 100% !important; height: auto !important; }
table { width: 100% !important; border-collapse: collapse; }
/* Universal fix for instant collapse */
.accordion-content { transition: none !important; display: none; }
.accordion-item.active .accordion-content { display: block !important; }
${asTable ? `thead th, tbody td { border: 1px solid #e5e7eb; padding: 8px; } tbody tr:nth-child(odd) { background: #f9fafb; } th { background: #f3f4f6; font-weight: 600; }` : ''}
${css}
</style>
</head>
<body>
${html}
<script>
window.open = function() { return null; };
const resizeObserver = new ResizeObserver(entries => {
  const height = document.body.scrollHeight;
  if (window.parent !== window) {
    try { window.parent.postMessage({ type: 'iframe-resize', height: height, id: '${uniqueId}' }, '*'); } catch (e) {}
  }
});
resizeObserver.observe(document.body);
window.addEventListener('load', () => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: 'iframe-resize', height: height, id: '${uniqueId}' }, '*');
});
document.addEventListener('DOMContentLoaded', function() {
  try { ${js} } catch(e) { console.error('User JS error:', e); }
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  try { ${js} } catch(e) { console.error('User JS error:', e); }
}
<\/script>
</body>
</html>`;

        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts allow-same-origin';
        iframe.style.cssText = 'width: 100%; min-height: 50px; border: none; display: block; overflow: hidden;';
        iframe.scrolling = 'no';

        const blob = new Blob([fullContent], { type: 'text/html' });
        iframe.src = URL.createObjectURL(blob);

        const messageHandler = (event) => {
          if (event.data && event.data.type === 'iframe-resize' && event.data.id === uniqueId) {
            const newHeight = event.data.height + 5;
            if (newHeight > 20) iframe.style.height = newHeight + 'px';
          }
        };
        window.addEventListener('message', messageHandler);

        iframe.onload = () => {
          const resize = () => {
            try {
              const height = iframe.contentDocument.body.scrollHeight;
              if (height > 20) iframe.style.height = (height + 5) + 'px';
            } catch (e) { }
          };
          [100, 300, 500, 1000].forEach(delay => setTimeout(resize, delay));
        };

        container.innerHTML = '';
        container.appendChild(iframe);
      });
    }, 50);
  },

  // Load Lobby Details (Dashboard for a specific lobby)
  loadLobbyDetails(division, lobby, isBack = false) {
    const user = AuthService.getUser();
    const structure = ContentManagementService.getContentStructure();

    // Push state for back button support
    if (!isBack) {
      try {
        history.pushState({
          view: this.currentPageName || 'divisions',
          subView: 'lobbyDetails',
          division: division,
          lobby: lobby,
          timestamp: Date.now()
        }, '', `#division/${division}/${lobby}`);
      } catch (e) { }
    }

    // Set current view for real-time sync
    if (window.RealtimeSyncV2) {
      window.RealtimeSyncV2.setCurrentView(division, division, lobby);
    }

    // Track current lobby to prevent unnecessary re-renders
    if (this.currentLobby === lobby && this.currentDivision === division) {
      console.log('[Departments] Already on lobby, skipping re-render');
      return;
    }
    this.currentLobby = lobby;
    this.currentDivision = division;

    // Check permissions
    if (user.role === 'crew' && (user.division !== division || user.lobby !== lobby)) {
      // Allow if just division matches? Usually crew is tied to lobby.
      // But let's assume if they can see the division page, they can see lobbies.
    }

    // Get custom tabs for this lobby
    const lobbyTabs = structure.lobbyTabs && structure.lobbyTabs[lobby] ? structure.lobbyTabs[lobby] : [];

    // Find the special lobby tab ID from division tabs (using stable ID or original name)
    const divisionTabs = structure.divisionTabs[division] || [];
    const letterTab = divisionTabs.find(t => t.id === `dtab_${division}_3` || t.name === 'Lobby Letter & Notice');

    // If lobby tab exists, show files directly instead of card
    if (letterTab) {
      // Directly render the files page for the lobby tab
      console.log(`[Departments] Directly showing ${letterTab.name} files for:`, lobby);
      this.viewLobbyFiles(letterTab.id, lobby, letterTab.name, division);
      return;
    }

    // If no Lobby Letter & Notice, show custom lobby tabs as cards
    let sectionsHTML = '';

    lobbyTabs.forEach((tab, index) => {
      const tabFiles = structure.files[tab.id] || [];
      const fileCount = tabFiles.length;
      const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e'];
      const borderColor = colors[index % colors.length];

      sectionsHTML += `
          <div class="division-section-card" onclick="DepartmentsPage.viewLobbyFiles('${tab.id}', '${lobby}', '${tab.name}', '${division}')" 
               style="border-top: 4px solid ${borderColor}; cursor: pointer;">
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <span class="material-icons" style="color: ${borderColor};">folder</span>
              <div class="card-title">${tab.name}</div>
              <div class="muted">${fileCount} file${fileCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
        `;
    });

    if (lobbyTabs.length === 0) {
      sectionsHTML = '<div class="muted" style="text-align: center; grid-column: 1/-1;">No tabs available for this lobby.</div>';
    }

    const divisionContent = document.getElementById('divisionContent');
    if (divisionContent) {
      const contentScroll = document.querySelector('.content-scroll');
      if (contentScroll) contentScroll.scrollTop = 0;
      window.scrollTo(0, 0);

      divisionContent.innerHTML = `
        <div class="clean-page-content" style="padding-top: 1px;">
          <div class="card" style="margin: 16px; border: none; box-shadow: none; background: transparent; display: flex; justify-content: space-between; align-items: center; padding: 0;">
            <div>
              <div class="card-title" style="font-size: 20px;">${lobby}</div>
              <div class="muted mobile-hidden">${division} Division • Select Category</div>
            </div>
            <button class="btn-sm" onclick="history.back()" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px;">← Back</button>
          </div>
          
          <div class="division-sections-grid">
            ${sectionsHTML}
          </div>
        </div>
      `;

      // Refresh notification badges after rendering
      if (window.NotificationServiceV2) {
        setTimeout(() => NotificationServiceV2.updateUI(), 100);
      }
    }
  },

  // Load division details with all sections
  async loadDivisionDetails(division, isBack = false) {
    const user = AuthService.getUser();
    const divisionName = division.charAt(0).toUpperCase() + division.slice(1);

    // Push state for back button support
    if (!isBack) {
      try {
        history.pushState({
          view: this.currentPageName || 'divisions',
          subView: 'divisionDetails',
          divisionId: division,
          timestamp: Date.now()
        }, '', `#division/${division}`);
      } catch (e) { }
    }

    // Set current view for real-time sync
    if (window.RealtimeSyncV2) {
      window.RealtimeSyncV2.setCurrentView(division, divisionName, null);
    }

    // Get lobbies from LobbyManagementService (which syncs with server)
    const lobbies = LobbyManagementService.getLobbiesByDivision(division);

    // Check if user has access to this division
    if (user.role === 'crew' && user.division !== division) {
      showNotification('❌ You can only access your own division.', 'error');
      return;
    }

    if (user.role === 'division' && user.division !== division) {
      showUnauthorizedPopup('Division Admin can only access their own division.');
      return;
    }

    let sectionsHTML = '';

    // Get content structure and division tabs
    const structure = ContentManagementService.getContentStructure();
    const divisionTabs = structure.divisionTabs[division] || [];

    // Show loading state immediately
    const divisionContent = document.getElementById('divisionContent');
    if (divisionContent) {
      divisionContent.innerHTML = `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="card-title">${divisionName} Division</div>
            <button class="btn-sm" onclick="history.back()">← Back to Divisions</button>
          </div>
          <div class="muted">Loading sections...</div>
        </div>
        <div class="division-sections-grid">
          ${divisionTabs.map(() => `
            <div class="division-section-card" style="cursor: default;">
              <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div class="card-title" style="margin: 0; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;">⠀</div>
                <div class="muted" style="font-size: 11px; margin-top: 4px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; width: 60%;">⠀</div>
              </div>
            </div>
          `).join('')}
        </div>
        <style>
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        </style>
      `;
    }

    // Fetch fresh files for all tabs from server using BATCH API for better performance
    console.log('[Departments] Fetching fresh files for division:', division);

    // Use batch fetch if available (single API call for all tabs)
    const tabIds = divisionTabs.map(tab => tab.id);
    try {
      await ContentManagementService.fetchAndSyncFilesBatch(tabIds, division);
    } catch (e) {
      console.log('[Departments] Batch fetch failed, falling back to parallel fetch');
      // Fallback to parallel individual fetches
      const fetchPromises = divisionTabs.map(tab =>
        ContentManagementService.fetchAndSyncFiles(tab.id).catch(err => {
          console.error(`[Departments] Failed to fetch files for tab ${tab.id}:`, err);
          return null;
        })
      );
      await Promise.all(fetchPromises);
    }

    divisionTabs.forEach(tab => {
      const tabFiles = structure.files[tab.id] || [];
      const fileCount = tabFiles.length;

      // Check if this is the special lobby tab (using stable ID or original name)
      if (tab.id === `dtab_${division}_3` || tab.name === 'Lobby Letter & Notice') {
        // Create lobby-wise folders (initially hidden)
        let lobbyFolders = lobbies.map(lobby => {
          const canEdit = user.role === 'super' ||
            (user.role === 'division' && user.division === division) ||
            (user.role === 'lobby' && user.division === division && user.hq === lobby);

          // Count files for this lobby in this tab
          const lobbyFileCount = tabFiles.filter(f => f.lobby === lobby || (f.folder && structure.folders[f.folder]?.lobby === lobby)).length;

          // Check for custom lobby tabs
          const customLobbyTabs = structure.lobbyTabs && structure.lobbyTabs[lobby] ? structure.lobbyTabs[lobby] : [];
          const hasCustomTabs = customLobbyTabs.length > 0;

          const editBtn = canEdit ? `<button class="btn-sm" style="margin-left: 8px; font-size: 11px;" onclick="ContentManagementService.showUploadFileModal('${tab.id}', 'division_tab', '${lobby}')">Upload</button>` : '';
          // Changed view button to Enter Lobby if custom tabs exist, or just view files if only standard tab
          const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e'];
          const borderColor = colors[lobbies.indexOf(lobby) % colors.length];

          return `
            <div class="division-section-card" data-lobby="${lobby}" onclick="DepartmentsPage.loadLobbyDetails('${division}', '${lobby}')" 
                 style="border-top: 4px solid ${borderColor}; cursor: pointer; position: relative; overflow: visible;">
              <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                <span class="material-icons" style="color: ${borderColor};">meeting_room</span>
                <div class="card-title">${lobby}</div>
                <div class="muted">
                  ${hasCustomTabs ? `Custom Tabs` : `${lobbyFileCount} files`}
                </div>
              </div>
            </div>
          `;
        }).join('');

        sectionsHTML += `
          <div class="division-section-card" data-section="${tab.name}" data-tab-id="${tab.id}" data-special="lobby-group" style="cursor: pointer;" onclick="DepartmentsPage.toggleLobbySection('${division}')">
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <div class="card-title" style="margin: 0;">📝 ${tab.name}</div>
              <div class="muted" style="font-size: 11px; margin-top: 4px;">${lobbies.length} lobbies</div>
              <div style="font-size: 18px; transition: transform 0.3s; margin-top: 8px;" id="lobby-arrow-${division}">▼</div>
            </div>
          </div>
          <div id="lobby-folders-${division}" style="display: none; grid-column: 1 / -1; margin-top: 12px;">
            <div class="card">
              <div class="lobby-folders-grid">
                ${lobbyFolders}
              </div>
            </div>
          </div>
        `;
      } else {
        // Regular sections - make them clickable to open as page
        const canEdit = user.role === 'super' || (user.role === 'division' && user.division === division);

        // Separate message cards from other files
        const messageCards = tabFiles.filter(f => f.type === 'message');
        const otherFiles = tabFiles.filter(f => f.type !== 'message');
        const totalFileCount = tabFiles.length;

        // Escape special characters for onclick
        const escapedTabId = tab.id.replace(/'/g, "\\'");
        const escapedTabName = tab.name.replace(/'/g, "\\'");
        const escapedDivision = division.replace(/'/g, "\\'");

        const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16', '#a855f7', '#eab308'];
        const borderColor = colors[divisionTabs.indexOf(tab) % colors.length];

        // Match specific icons from the image if possible (using stable IDs or names)
        let icon = 'folder';
        if (tab.id.endsWith('_0') || tab.name.includes('Instructions')) icon = 'folder';
        else if (tab.id.endsWith('_1') || tab.name.includes('Sr DEE')) icon = 'bolt';
        else if (tab.id.endsWith('_2') || tab.name.includes('Sr DME')) icon = 'build';
        else if (tab.id.endsWith('_3') || tab.name.includes('Lobby Letter')) icon = 'assignment';
        else if (tab.id.endsWith('_5') || tab.id.endsWith('_6') || tab.name.includes('Safety')) icon = 'security';
        else if (tab.name.includes('Technical')) icon = 'settings';
        else if (tab.name.includes('Order')) icon = 'fact_check';

        sectionsHTML += `
          <div class="division-section-card" data-section="${tab.name}" onclick="DepartmentsPage.openDivisionTab('${escapedTabId}', '${escapedTabName}', '${escapedDivision}')" 
               style="border-top: 4px solid ${borderColor}; cursor: pointer; position: relative; overflow: visible;">
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <span class="material-icons" style="color: ${borderColor};">${icon}</span>
              <div class="card-title">${tab.name}</div>
              <div class="muted">${totalFileCount} file${totalFileCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
        `;

      }
    });

    // Update the content with actual data (divisionContent already declared above)
    if (divisionContent) {
      divisionContent.innerHTML = `
        <div class="clean-page-content" style="padding-top: 1px;">
          <div class="card" style="margin: 16px; border: none; box-shadow: none; background: transparent; display: flex; justify-content: space-between; align-items: center; padding: 0;">
            <div>
              <div class="card-title" style="font-size: 20px;">${divisionName} Division</div>
            </div>
            <button class="btn-sm" onclick="history.back()" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px;">← Back</button>
          </div>
          
          <div class="division-sections-grid">
            ${sectionsHTML}
          </div>
        </div>
      `;
    }
    if (window.NotificationServiceV2) {
      setTimeout(() => NotificationServiceV2.updateUI(), 100);
    }
  },

  // View files in a tab
  viewTabFiles(tabId, tabName) {
    FilesPage.render(tabId, tabName);
  },

  // View files in a lobby
  viewLobbyFiles(tabId, lobby, tabName, division = null, isBack = false) {
    // Push state for back button support
    if (!isBack) {
      try {
        history.pushState({
          view: this.currentPageName || 'divisions',
          subView: 'lobbyFiles',
          tabId: tabId,
          lobby: lobby,
          tabName: tabName,
          division: division,
          timestamp: Date.now()
        }, '', `#lobbyFiles/${tabId}/${lobby}`);
      } catch (e) { }
    }
    FilesPage.render(tabId, tabName, lobby, division);
  },

  // Upload to section (demo)
  uploadToSection(division, section) {
    showNotification(`📤 Upload to ${division.toUpperCase()} - ${section}\n\nIn production, this would open file upload dialog for PDFs and documents.`, 'info');
  },

  // Upload to lobby (demo)
  uploadToLobby(division, lobby) {
    showNotification(`📤 Upload to ${division.toUpperCase()} - ${lobby} Lobby\n\nIn production, this would open file upload dialog for lobby notices.`, 'info');
  },

  // Toggle lobby section visibility
  toggleLobbySection(division) {
    const lobbyFolders = document.getElementById(`lobby-folders-${division}`);
    const arrow = document.getElementById(`lobby-arrow-${division}`);

    if (!lobbyFolders || !arrow) return;

    if (lobbyFolders.style.display === 'none') {
      lobbyFolders.style.display = 'block';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      lobbyFolders.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  },

  // Delete message card
  deleteMessageCard(tabId, fileId, division) {
    if (!confirm('Are you sure you want to delete this message card?')) return;

    const structure = ContentManagementService.getContentStructure();
    const files = structure.files[tabId] || [];
    const index = files.findIndex(f => f.id === fileId);

    if (index > -1) {
      files.splice(index, 1);
      structure.files[tabId] = files;
      ContentManagementService.saveContentStructure(structure);
      showNotification('✅ Message card deleted successfully', 'success');

      // Reload the division tab page
      this.openDivisionTab(tabId, files[0]?.tabName || 'Files', division);
    }
  },

  // Track current tab to prevent unnecessary re-renders
  currentTabId: null,
  currentDivision: null,
  currentLobby: null,
  currentPageName: null, // Added to store the current page name

  // Cache for tab files to avoid redundant server fetches
  tabFilesCache: {},
  lastFetchTime: {},
  CACHE_DURATION: 30000, // 30 seconds cache

  // Open division tab as dedicated page
  async openDivisionTab(tabId, tabName, division, isBack = false) {
    // Push state for back button support
    if (!isBack) {
      try {
        history.pushState({
          view: this.currentPageName || 'divisions',
          subView: 'divisionTab',
          tabId: tabId,
          tabName: tabName,
          division: division,
          timestamp: Date.now()
        }, '', `#divisionTab/${tabId}`);
      } catch (e) { }
    }
    console.log('Opening division tab:', { tabId, tabName, division });

    // Store current division for real-time sync
    this.currentDivision = division;

    // Set current view for real-time sync
    if (window.RealtimeSyncV2) {
      window.RealtimeSyncV2.setCurrentView(tabId, tabName, null);
    }

    const user = AuthService.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    // Fetch fresh files from server - with caching for performance
    const now = Date.now();
    const lastFetch = this.lastFetchTime[tabId] || 0;
    const cacheAge = now - lastFetch;

    // Only fetch from server if cache is expired or no cache exists
    if (cacheAge > this.CACHE_DURATION || !this.tabFilesCache[tabId]) {
      console.log('[Departments] Fetching fresh files from server...');
      await ContentManagementService.fetchAndSyncFiles(tabId);
      this.lastFetchTime[tabId] = now;
    } else {
      console.log('[Departments] Using cached files for tab:', tabId);
    }

    const structure = ContentManagementService.getContentStructure();
    const tabFiles = structure.files[tabId] || [];

    const messageCards = tabFiles.filter(f => f.type === 'message');
    const htmlContent = tabFiles.filter(f => f.type === 'html');
    const otherFiles = tabFiles.filter(f => f.type !== 'message' && f.type !== 'html');

    console.log('Tab files from server:', tabFiles.length);
    console.log('Message cards:', messageCards.length, 'Other files:', otherFiles.length);

    // Auto-mark as read for message and HTML content as they are visible immediately
    if ((messageCards.length > 0 || htmlContent.length > 0) && window.NotificationServiceV2) {
      NotificationServiceV2.markSectionAsViewed(tabName);
    }

    const canEdit = user.role === 'super' || (user.role === 'division' && user.division === division);
    const canManageFiles = user.role !== 'crew';

    // National Emblem SVG (Lion Capital)
    const nationalEmblemSVG = `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
        <!-- Four Lions Back-to-Back -->
        <g transform="translate(100, 100)">
          <!-- Base Platform -->
          <ellipse cx="0" cy="60" rx="70" ry="12" fill="#8B7355" opacity="0.6"/>
          <rect x="-65" y="48" width="130" height="8" rx="2" fill="#d4af37" stroke="#8B7355" stroke-width="2"/>
          
          <!-- Abacus (Circular base with animals) -->
          <circle cx="0" cy="35" r="48" fill="#d4af37" stroke="#8B7355" stroke-width="2"/>
          
          <!-- Dharma Chakra in center -->
          <g transform="translate(0, 35)">
            <circle cx="0" cy="0" r="18" fill="none" stroke="#1a4d2e" stroke-width="2.5"/>
            <circle cx="0" cy="0" r="3" fill="#1a4d2e"/>
            <!-- 24 spokes -->
            <g stroke="#1a4d2e" stroke-width="1.5">
              ${Array.from({ length: 24 }, (_, i) => {
      const angle = (i * 15 - 90) * Math.PI / 180;
      const x1 = Math.cos(angle) * 5;
      const y1 = Math.sin(angle) * 5;
      const x2 = Math.cos(angle) * 18;
      const y2 = Math.sin(angle) * 18;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }).join('')}
            </g>
          </g>
          
          <!-- Four Lions (simplified representation) -->
          <!-- Front Lion -->
          <g transform="translate(0, -20)">
            <ellipse cx="0" cy="0" rx="20" ry="22" fill="#d4af37" stroke="#8B7355" stroke-width="1.5"/>
            <circle cx="0" cy="-18" r="15" fill="#d4af37" stroke="#8B7355" stroke-width="1.5"/>
            <!-- Mane -->
            <circle cx="0" cy="-18" r="18" fill="none" stroke="#8B7355" stroke-width="2" stroke-dasharray="3,2"/>
            <!-- Eyes -->
            <circle cx="-5" cy="-20" r="2" fill="#000"/>
            <circle cx="5" cy="-20" r="2" fill="#000"/>
            <!-- Mouth -->
            <path d="M -4,-14 Q 0,-12 4,-14" fill="none" stroke="#000" stroke-width="1.5"/>
          </g>
          
          <!-- Left Lion -->
          <g transform="translate(-22, 0) rotate(-20)">
            <ellipse cx="0" cy="0" rx="16" ry="18" fill="#d4af37" stroke="#8B7355" stroke-width="1.2" opacity="0.9"/>
            <circle cx="0" cy="-14" r="12" fill="#d4af37" stroke="#8B7355" stroke-width="1.2" opacity="0.9"/>
          </g>
          
          <!-- Right Lion -->
          <g transform="translate(22, 0) rotate(20)">
            <ellipse cx="0" cy="0" rx="16" ry="18" fill="#d4af37" stroke="#8B7355" stroke-width="1.2" opacity="0.9"/>
            <circle cx="0" cy="-14" r="12" fill="#d4af37" stroke="#8B7355" stroke-width="1.2" opacity="0.9"/>
          </g>
          
          <!-- Back Lion (barely visible) -->
          <g transform="translate(0, 8) scale(0.7)" opacity="0.6">
            <ellipse cx="0" cy="0" rx="14" ry="16" fill="#d4af37" stroke="#8B7355" stroke-width="1"/>
          </g>
        </g>
      </svg>
    `;

    // Find the correct content container
    let contentContainer = document.getElementById('divisionContent');
    if (!contentContainer) {
      contentContainer = document.getElementById('appContent');
    }

    console.log('Content container:', contentContainer ? contentContainer.id : 'NOT FOUND');

    if (contentContainer) {
      // Robust scroll to top of everything
      const contentScroll = document.querySelector('.content-scroll');
      if (contentScroll) contentScroll.scrollTop = 0;
      window.scrollTo(0, 0);

      contentContainer.innerHTML = `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h2 class="card-title">📁 ${tabName}</h2>
              <div class="muted">${division} Division</div>
            </div>
            <div style="display: flex; gap: 8px;">
              ${canEdit ? `<button class="btn-sm" onclick="ContentManagementService.showUploadFileModal('${tabId}', 'division_tab')"><span class="material-icons" style="font-size: 16px; vertical-align: middle;">cloud_upload</span> Upload File</button>` : ''}
              <button class="btn-sm" onclick="history.back()">← Back to Division</button>
            </div>
          </div>
        </div>
        
        <!-- Message Cards Section -->
        ${messageCards.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <div style="display: grid; gap: 24px;">
            ${messageCards.map(file => `
              <div class="message-card-display" style="background: #ffffff; border-radius: 20px; overflow: hidden; position: relative; border-top: 6px solid #003366; box-shadow: 0 15px 35px rgba(0, 51, 102, 0.15);">
                
                <!-- Header Section -->
                <div class="message-card-header" style="background: #fff; padding: 25px 30px; border-bottom: 1px solid #f0f0f0; display: grid; gap: 15px; align-items: center; grid-template-columns: 1fr 1fr; grid-template-areas: 'emblem photo' 'text text';">
                  
                  <!-- Header Text (Left on Desktop) -->
                  <div class="header-text" style="grid-area: text; text-align: center;">
                    ${file.content?.header ? `
                      <div style="color: #003366; font-weight: 700; font-size: 1.2rem; letter-spacing: 0.5px; text-transform: uppercase;">
                        ${file.content.header}
                      </div>
                    ` : ''}
                    ${file.content?.position ? `
                      <div style="color: #003366; font-weight: 700; font-size: 1rem; opacity: 0.9; margin-top: 4px;">
                        ${file.content.position}
                      </div>
                    ` : ''}
                    ${file.content?.location ? `
                      <div style="color: #636e72; font-weight: 500; font-size: 0.95rem; margin-top: 4px;">
                        ${file.content.location}
                      </div>
                    ` : ''}
                  </div>
                  
                  <!-- National Emblem (Center) -->
                  <div class="header-emblem" style="grid-area: emblem; justify-self: start; display: flex; flex-direction: column; align-items: center;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" alt="Emblem" style="width: 70px; height: auto; opacity: 0.95;" />
                    <span style="font-size: 0.7rem; color: #c5a059; font-weight: 700; margin-top: 4px;">सत्यमेव जयते</span>
                  </div>
                  
                  <!-- Profile Photo (Right) -->
                  <div class="header-photo" style="grid-area: photo; justify-self: end;">
                    ${file.content?.photo ? `
                      <img src="${file.content.photo}" alt="Official Photo" style="width: 110px; height: 110px; object-fit: cover; border-radius: 12px; border: 3px solid #c5a059; padding: 2px; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1);" />
                    ` : `
                      <img src="https://via.placeholder.com/150?text=Profile" alt="Official" style="width: 110px; height: 110px; object-fit: cover; border-radius: 12px; border: 3px solid #c5a059; padding: 2px; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1);" />
                    `}
                  </div>
                </div>
                
                
                <!-- Content Body -->
                <div style="padding: 40px;">
                  <!-- Title with Gold Underline -->
                  <h1 style="text-align: center; color: #003366; font-size: 2.2rem; font-weight: 700; margin-bottom: 30px; position: relative; padding-bottom: 15px;">
                    संदेश
                    <span style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 4px; background: #c5a059; border-radius: 2px; display: block;"></span>
                  </h1>
                  
                  <!-- Message Content -->
                  <div style="font-size: 1.05rem; line-height: 1.8; color: #2d3436; text-align: justify;">
                    ${(file.content?.message || file.description || '').split('\n').map(para => para.trim() ? `<p style="margin-bottom: 15px;">${para}</p>` : '').join('')}
                  </div>
                </div>
                
                
                <!-- Footer Section -->
                <div class="message-card-footer" style="background: #f9fbfd; padding: 30px 40px; border-top: 1px solid #eee; display: flex; flex-direction: row; justify-content: space-between; align-items: flex-end; gap: 20px;">
                  <!-- Quote (Left) -->
                  <div style="text-align: left; font-weight: 600; color: #003366; border-left: 4px solid #c5a059; padding-left: 15px;">
                    <div style="font-size: 1em;">जय हिन्द।</div>
                    <div style="font-size: 0.9em; color: #888; margin-top: 4px;">सुरक्षित यात्रा, सफल भारत।</div>
                  </div>
                  
                  <!-- Signature Block (Right) -->
                  <div style="text-align: right;">
                    ${file.content?.signatureName ? `
                      <div style="font-weight: 700; font-size: 1.1rem; color: #2d3436;">${file.content.signatureName}</div>
                    ` : ''}
                    ${file.content?.signatureTitle ? `<div style="font-size: 0.9rem; color: #636e72; margin-top: 4px;">${file.content.signatureTitle.replace(/<br\/>/g, '<br>')}</div>` : ''}
                    ${file.uploadedAt ? `<div style="font-size: 12px; color: #888; margin-top: 12px;">📅 ${new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>` : ''}
                  </div>
                </div>
                
                
                <!-- Admin Actions -->
                ${canManageFiles ? `
                <div style="display: flex; gap: 8px; justify-content: center; padding: 20px; border-top: 1px solid #eee;">
                  <button class="btn-sm btn-primary" onclick="event.stopPropagation(); DepartmentsPage.viewMessageCard('${file.id}')" style="display: flex; align-items: center; gap: 6px;">
                    <span>👁️</span><span>View Full</span>
                  </button>
                  <button class="btn-sm" onclick="event.stopPropagation(); DepartmentsPage.deleteMessageCard('${tabId}', '${file.id}', '${division}')" style="background: #dc2626; color: white;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                    <span>🗑️</span><span>Delete</span>
                  </button>
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- HTML Content Section -->
        ${htmlContent.length > 0 ? `
        <div style="margin-bottom: 24px; margin-top: 24px;">
          ${htmlContent.map((file, idx) => {
        const uniqueId = 'dept-html-content-' + file.id + '-' + Date.now() + '-' + idx;
        return `
            <div class="html-content-display" style="margin-bottom: 20px;">
              <!-- Full-width HTML Content Display - Shadow DOM -->
              <div id="${uniqueId}" class="html-render-container" style="width: 100%; overflow: visible;"
                   data-css="${encodeURIComponent(file.content?.css || '')}" 
                   data-html="${encodeURIComponent(file.content?.html || '')}" 
                   data-js="${encodeURIComponent(file.content?.js || '')}"
                   data-table="${file.content?.displayAsTable === true ? 'true' : 'false'}">
              </div>
              
              <!-- Actions -->
              ${canManageFiles ? `
              <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 20px; border-top: 1px solid #e5e7eb; background: rgba(249, 250, 251, 0.5);">
                <button class="btn-sm btn-primary" onclick="DepartmentsPage.viewHTMLContent('${file.id}', '${tabId}')" style="display: flex; align-items: center; gap: 6px;">
                  <span>👁️</span><span>View Full</span>
                </button>
                <button class="btn-sm" onclick="DepartmentsPage.editHTMLContent('${file.id}', '${tabId}')" style="background: #10b981; color: white; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                  <span>✏️</span><span>Edit</span>
                </button>
                <button class="btn-sm" onclick="ContentManagementService.deleteFile('${tabId}', '${file.id}')" style="background: #dc2626; color: white; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                  <span>🗑️</span><span>Delete</span>
                </button>
              </div>
              ` : ''}
            </div>
          `;
      }).join('')}
        </div>
        ` : ''}
        
        <!-- Other Files Section -->
        ${otherFiles.length > 0 ? `
        <div class="card" style="margin-top: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 class="card-title" style="margin: 0;">📄 Files (${otherFiles.length})</h3>
          </div>
                  
          <div style="display: grid; gap: 12px;">
            ${otherFiles.map((file, index) => {
        const fileIcon = {
          'pdf': '📄',
          'image': '🖼️',
          'excel': '📊',
          'url': '🔗',
          'html': '🌐'
        }[file.type] || '📁';

        const fileColor = {
          'pdf': '#dc2626',
          'image': '#7c3aed',
          'excel': '#059669',
          'url': '#0891b2',
          'html': '#ea580c'
        }[file.type] || '#6b7280';

        // NEW badge logic
        const isNew = window.NotificationServiceV2 ? NotificationServiceV2.isFileNew(file) : !!file.is_new;

        return `
                <div data-file-id="${file.id}" data-server-file-id="${file.server_file_id || file.id.replace('server_', '')}" 
                     style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%); border: 2px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px; transition: all 0.3s ease; position: relative;"
                     onmouseover="this.style.borderColor='${fileColor}'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.2)'; this.style.transform='translateY(-2px)';" 
                     onmouseout="this.style.borderColor='rgba(59, 130, 246, 0.2)'; this.style.boxShadow='none'; this.style.transform='translateY(0)';">
                  
                  <!-- Desktop Layout -->
                  <div class="file-card-desktop" style="display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center;">
                    <!-- File Icon & Number -->
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 40px; height: 40px; background: ${fileColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; position: relative;">
                        ${fileIcon}
                        ${isNew ? `
                          <span class="new-badge-v2" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; font-size: 8px; font-weight: 800; padding: 2px 5px; border-radius: 10px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); border: 1.5px solid white; animation: pulse-red 2s infinite;">NEW</span>
                        ` : ''}
                      </div>
                      <div style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; font-weight: 700; font-size: 14px; padding: 4px 12px; border-radius: 6px;">
                        #${index + 1}
                      </div>
                    </div>
                            
                    <!-- File Info -->
                    <div style="min-width: 0;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          ${file.name || file.title || 'Untitled Document'}
                        </h4>
                        <span style="background: ${fileColor}; color: white; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                          ${file.type || 'file'}
                        </span>
                        ${isNew ? `<span style="background: #ef4444; color: white; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 10px; text-transform: uppercase; animation: pulse-red 2s infinite;">NEW</span>` : ''}
                      </div>
                                          
                      <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                        ${file.description ? `
                        <p style="margin: 0; font-size: 13px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; max-width: 500px;">
                          ${file.description.substring(0, 80)}${file.description.length > 80 ? '...' : ''}
                        </p>
                        ` : ''}
                                            
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);">
                          <span class="material-icons" style="font-size: 16px;">📅</span>
                          <span>${file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A')}</span>
                        </div>
                      </div>
                    </div>
                            
                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
                      <button class="btn-sm btn-primary" onclick="event.stopPropagation(); if(window.NotificationServiceV2) NotificationServiceV2.markFileAsViewed('${file.server_file_id || file.id.replace('server_', '')}'); ContentManagementService.viewFile('${file.id}', '${tabId}')" 
                              style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; white-space: nowrap;">
                        <span class="material-icons" style="font-size: 16px;">👁️</span>
                        <span>View</span>
                      </button>
                      ${canManageFiles ? `
                      <button class="btn-sm" onclick="event.stopPropagation(); ContentManagementService.deleteFile('${tabId}', '${file.id}')" 
                              style="background: #dc2626; color: white; display: flex; align-items: center; gap: 6px; padding: 8px 16px; white-space: nowrap;"
                              onmouseover="this.style.background='#b91c1c'" 
                              onmouseout="this.style.background='#dc2626'">
                        <span class="material-icons" style="font-size: 16px;">🗑️</span>
                        <span>Delete</span>
                      </button>
                      ` : ''}
                    </div>
                  </div>
                  
                  <!-- Mobile Layout -->
                  <div class="file-card-mobile" style="display: none;">
                    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                      <div style="width: 48px; height: 48px; background: ${fileColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; position: relative;">
                        ${isNew ? `
                          <span class="new-badge-v2" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; font-size: 7px; font-weight: 800; padding: 1px 4px; border-radius: 10px; border: 1.5px solid white;">NEW</span>
                        ` : ''}
                      </div>
                      <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                          <span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 4px;">
                            #${index + 1}
                          </span>
                          <span style="background: ${fileColor}; color: white; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                            ${file.type || 'file'}
                          </span>
                        </div>
                        <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          ${file.name || file.title || 'Untitled Document'}
                        </h4>
                      </div>
                    </div>
                    
                    ${file.description ? `
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
                      ${file.description.substring(0, 100)}${file.description.length > 100 ? '...' : ''}
                    </p>
                    ` : ''}
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(59, 130, 246, 0.1);">
                      <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);">
                        <span style="font-size: 14px;">📅</span>
                        <span>${file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : (file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A')}</span>
                      </div>
                      
                      <div style="display: flex; gap: 6px;">
                        <button class="btn-sm btn-primary" onclick="event.stopPropagation(); ContentManagementService.viewFile('${file.id}', '${tabId}')" 
                                style="display: flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 13px;">
                          <span>👁️</span>
                          <span>View</span>
                        </button>
                        ${canManageFiles ? `
                        <button class="btn-sm" onclick="event.stopPropagation(); ContentManagementService.deleteFile('${tabId}', '${file.id}')" 
                                style="background: #dc2626; color: white; display: flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 13px;"
                                onmouseover="this.style.background='#b91c1c'" 
                                onmouseout="this.style.background='#dc2626'">
                          <span>🗑️</span>
                        </button>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              `;
      }).join('')}
          </div>
        </div>
        ` : ''}
        
        ${messageCards.length === 0 && htmlContent.length === 0 && otherFiles.length === 0 ? `
        <div class="card" style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📂</div>
          <h3 style="color: var(--text-secondary); margin-bottom: 8px;">No files uploaded yet</h3>
          <p style="color: var(--text-muted);">${canEdit ? 'Click "Upload File" to add content' : 'No content available'}</p>
        </div>
        ` : ''}
      `;

      // Initialize HTML content rendering
      this.initializeHTMLContainers();

      // Refresh notification badges after rendering
      if (window.NotificationServiceV2) {
        setTimeout(() => NotificationServiceV2.updateUI(), 100);
      }
    }
  },

  // Render Message Cards (Modern Official Format)
  renderMessageCards(messageCards, canManageFiles, tabId) {
    if (!messageCards || messageCards.length === 0) return '';

    return `
      <div style="margin-bottom: 24px; margin-top: 24px;">
        <div style="display: grid; gap: 24px;">
          ${messageCards.map(file => `
            <div class="message-card-display" style="background: #ffffff; border-radius: 20px; overflow: hidden; position: relative; border-top: 6px solid #003366; box-shadow: 0 15px 35px rgba(0, 51, 102, 0.15);">
              
              <!-- Header Section -->
              <div class="message-card-header" style="background: #fff; padding: 25px 30px; border-bottom: 1px solid #f0f0f0; display: grid; gap: 15px; align-items: center; grid-template-columns: 1fr 1fr; grid-template-areas: 'emblem photo' 'text text';">
                
                <!-- Header Text (Left on Desktop) -->
                <div class="header-text" style="grid-area: text; text-align: center;">
                  ${file.content?.header ? `
                    <div style="color: #003366; font-weight: 700; font-size: 1.2rem; letter-spacing: 0.5px; text-transform: uppercase;">
                      ${file.content.header}
                    </div>
                  ` : ''}
                  ${file.content?.position ? `
                    <div style="color: #003366; font-weight: 700; font-size: 1rem; opacity: 0.9; margin-top: 4px;">
                      ${file.content.position}
                    </div>
                  ` : ''}
                  ${file.content?.location ? `
                    <div style="color: #636e72; font-weight: 500; font-size: 0.95rem; margin-top: 4px;">
                      ${file.content.location}
                    </div>
                  ` : ''}
                </div>
                
                <!-- National Emblem (Center) -->
                <div class="header-emblem" style="grid-area: emblem; justify-self: start; display: flex; flex-direction: column; align-items: center;">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" alt="Emblem" style="width: 70px; height: auto; opacity: 0.95;" />
                  <span style="font-size: 0.7rem; color: #c5a059; font-weight: 700; margin-top: 4px;">सत्यमेव जयते</span>
                </div>
                
                <!-- Profile Photo (Right) -->
                <div class="header-photo" style="grid-area: photo; justify-self: end;">
                  ${file.content?.photo ? `
                    <img src="${file.content.photo}" alt="Official Photo" style="width: 110px; height: 110px; object-fit: cover; border-radius: 12px; border: 3px solid #c5a059; padding: 2px; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1);" />
                  ` : `
                    <img src="https://via.placeholder.com/150?text=Profile" alt="Official" style="width: 110px; height: 110px; object-fit: cover; border-radius: 12px; border: 3px solid #c5a059; padding: 2px; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1);" />
                  `}
                </div>
              </div>
              
              <!-- Content Body -->
              <div style="padding: 40px;">
                <!-- Title with Gold Underline -->
                <h1 style="text-align: center; color: #003366; font-size: 2.2rem; font-weight: 700; margin-bottom: 30px; position: relative; padding-bottom: 15px;">
                  संदेश
                  <span style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 4px; background: #c5a059; border-radius: 2px; display: block;"></span>
                </h1>
                
                <!-- Message Content -->
                <div style="font-size: 1.05rem; line-height: 1.8; color: #2d3436; text-align: justify;">
                  ${(file.content?.message || file.description || '').split('\n').map(para => para.trim() ? `<p style="margin-bottom: 15px;">${para}</p>` : '').join('')}
                </div>
              </div>
              
              <!-- Footer Section -->
              <div class="message-card-footer" style="background: #f9fbfd; padding: 30px 40px; border-top: 1px solid #eee; display: flex; flex-direction: row; justify-content: space-between; align-items: flex-end; gap: 20px;">
                <!-- Quote (Left) -->
                <div style="text-align: left; font-weight: 600; color: #003366; border-left: 4px solid #c5a059; padding-left: 15px;">
                  <div style="font-size: 1em;">जय हिन्द।</div>
                  <div style="font-size: 0.9em; color: #888; margin-top: 4px;">सुरक्षित यात्रा, सफल भारत।</div>
                </div>
                
                <!-- Signature Block (Right) -->
                <div style="text-align: right;">
                  ${file.content?.signatureName ? `
                    <div style="font-weight: 700; font-size: 1.1rem; color: #2d3436;">${file.content.signatureName}</div>
                  ` : ''}
                  ${file.content?.signatureTitle ? `<div style="font-size: 0.9rem; color: #636e72; margin-top: 4px;">${file.content.signatureTitle.replace(/<br\/>/g, '<br>')}</div>` : ''}
                  ${file.uploadedAt ? `<div style="font-size: 12px; color: #888; margin-top: 12px;">📅 ${new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>` : ''}
                </div>
              </div>
              
              <!-- Admin Actions -->
              ${canManageFiles ? `
              <div style="display: flex; gap: 8px; justify-content: center; padding: 20px; border-top: 1px solid #eee;">
                <button class="btn-sm btn-primary" onclick="ContentManagementService.viewFile('${file.id}')" style="display: flex; align-items: center; gap: 6px;">
                  <span>👁️</span><span>View Full</span>
                </button>
                <button class="btn-sm" onclick="ContentManagementService.deleteFile('${tabId}', '${file.id}')" style="background: #dc2626; color: white;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                  <span>🗑️</span><span>Delete</span>
                </button>
              </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // Render HTML Content Cards (for HTML+CSS+JS content) - displays inline like message cards
  renderHTMLContentCards(htmlContent, canManageFiles, tabId) {
    if (!htmlContent || htmlContent.length === 0) return '';

    return `
      <div style="margin-bottom: 24px; margin-top: 24px;">
        ${htmlContent.map(file => {
      // Get display title - prefer title field, then name
      const displayTitle = file.title || file.name || 'HTML Content';

      return `
          <div class="html-content-display" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06); margin-bottom: 24px; max-width: 100%;">
            
            <!-- Full-width HTML Content Display - Shadow DOM -->
            <div id="folder-html-${file.id}" class="html-render-container" style="width: 100%; overflow: visible;"
                 data-css="${encodeURIComponent(file.content?.css || '')}" 
                 data-html="${encodeURIComponent(file.content?.html || '')}" 
                 data-js="${encodeURIComponent(file.content?.js || '')}"
                 data-table="${file.content?.displayAsTable === true ? 'true' : 'false'}">
            </div>
            
            <!-- Admin Actions -->
            ${canManageFiles ? `
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 16px; border-top: 1px solid #e5e7eb; background: #f9fafb;">
              <button class="btn-sm" onclick="DepartmentsPage.viewHTMLContent('${file.id}', '${tabId}')" style="background: #3b82f6; color: white; display: flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 14px;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                <span>👁️</span><span>View Full</span>
              </button>
              <button class="btn-sm" onclick="DepartmentsPage.editHTMLContent('${file.id}', '${tabId}')" style="background: #10b981; color: white; display: flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 14px;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                <span>✏️</span><span>Edit Content</span>
              </button>
              <button class="btn-sm" onclick="ContentManagementService.deleteFile('${tabId}', '${file.id}')" style="background: #dc2626; color: white; display: flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 14px;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                <span>🗑️</span><span>Delete</span>
              </button>
            </div>
            ` : ''}
          </div>
        `}).join('')}
      </div>
    `;
  },

  // Open folder in main tab (Rule Books, GM Message, etc.)
  openMainTabFolder(tabId, folderId, folderName, isBack = false) {
    // Push state for back button support
    if (!isBack) {
      try {
        history.pushState({
          view: this.currentPageName || 'ruleBooks',
          subView: 'mainTabFolder',
          tabId: tabId,
          folderId: folderId,
          folderName: folderName,
          timestamp: Date.now()
        }, '', `#folder/${folderId}`);
      } catch (e) { }
    }

    // Prevent rapid multiple calls
    if (this._openingFolder) {
      console.log('Already opening folder, ignoring duplicate call');
      return;
    }
    this._openingFolder = true;

    setTimeout(() => {
      this._openingFolder = false;
    }, 1000);

    console.log('Opening main tab folder:', { tabId, folderId, folderName });

    const user = AuthService.getUser();
    const canManageFiles = user && user.role !== 'crew';

    const structure = ContentManagementService.getContentStructure();
    const allFiles = structure.files[tabId] || [];
    const folderFiles = allFiles.filter(f => f.folder === folderId);

    console.log('Folder files found:', folderFiles.length);

    const mainTab = structure.mainTabs.find(t => t.id === tabId);
    const tabName = mainTab ? mainTab.name : 'Folder';

    console.log('Tab name:', tabName);

    // Find the content container - try multiple selectors
    let contentContainer = document.getElementById('divisionContent');
    if (!contentContainer) {
      contentContainer = document.getElementById('appContent');
    }
    if (!contentContainer) {
      // Try finding the .page.active container
      contentContainer = document.querySelector('.page.active')?.parentElement;
    }
    if (!contentContainer) {
      // Last resort - find main content area
      contentContainer = document.querySelector('main') || document.querySelector('#app');
    }

    console.log('Content container found:', !!contentContainer, contentContainer?.id || contentContainer?.className);

    if (!contentContainer) {
      console.error('No content container found!');
      return;
    }

    window.scrollTo(0, 0);

    console.log('Rendering folder view...');

    contentContainer.innerHTML = `
        <div class="page active">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <button class="btn-sm" onclick="history.back()" style="padding: 6px 12px;">← Back to ${tabName}</button>
              </div>
              <div class="page-title" style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                <span>📁</span>
                <span>${folderName}</span>
              </div>
              <div class="muted" style="font-size: 13px;">${folderFiles.length} file${folderFiles.length !== 1 ? 's' : ''} in this folder</div>
            </div>
            ${canManageFiles ? `
            <div style="display: flex; gap: 8px;">
              <button class="btn-sm btn-primary" onclick="ContentManagementService.showUploadFileModal('${tabId}', 'tab', '${folderId}')" style="display: flex; align-items: center; gap: 6px; padding: 10px 20px;">
                <span>📄</span>
                <span>Upload File to Folder</span>
              </button>
            </div>
            ` : ''}
          </div>
          
          <div class="card">
            ${folderFiles.length === 0 ? `
              <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No files in this folder</div>
                <div style="font-size: 14px;">${canManageFiles ? 'Click "Upload File to Folder" to add files' : 'No content available'}</div>
              </div>
            ` : `
              <div style="display: grid; gap: 12px;">
                ${folderFiles.map((file, index) => {
      if (window.NotificationServiceV2) file.is_new = NotificationServiceV2.isFileNew(file);
      return generateFileCard(file, index, {
        canDelete: canManageFiles,
        onView: `ContentManagementService.viewFile('${file.id}')`,
        onDelete: `ContentManagementService.deleteFile('${tabId}', '${file.id}')`,
        tabId: tabId
      });
    }).join('')}
              </div>
            `}
          </div>
        </div>
      `;

    console.log('✅ Folder view rendered successfully!');
  },

  // View HTML Content in full screen
  viewHTMLContent(fileId, tabId) {
    const structure = ContentManagementService.getContentStructure();
    const files = structure.files[tabId] || [];
    const file = files.find(f => f.id === fileId);

    if (!file || file.type !== 'html') {
      showNotification('❌ HTML content not found', 'error');
      return;
    }

    // Track view immediately
    if (window.NotificationServiceV2) {
      NotificationServiceV2.markFileAsViewed(file.server_file_id || file.id.replace('server_', ''));
    }

    // Create full-screen modal
    const modalHTML = `
      <div class="modal-overlay show" id="htmlViewModal" style="z-index: 10000;">
        <div style="background: white; width: 95vw; height: 95vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 16px 24px; color: white; display: flex; justify-content: flex-end; align-items: center;">
            <button class="btn-close" onclick="document.getElementById('htmlViewModal').remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px;">✖</button>
          </div>
          
          <!-- Content -->
          <div style="flex: 1; overflow: auto; padding: 24px; background: #f8fafc;">
            <div style="background: white; border-radius: 12px; border: 2px solid #e5e7eb; overflow: hidden; min-height: 100%;">
              <div id="htmlFullPreview" style="padding: 24px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Render content using iframe for perfect isolation
    const preview = document.getElementById('htmlFullPreview');
    if (preview) {
      const css = file.content?.css || '';
      const html = file.content?.html || '';
      const js = file.content?.js || '';
      const uniqueIdFull = 'html-full-view-' + file.id;

      const fullContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="${window.location.origin}${window.Api?.getBaseUrl()?.replace('/api', '') || ''}/">
<style>
html, body { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }
body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; line-height: 1.5; word-wrap: break-word; }
img, table, video, canvas, iframe { max-width: 100% !important; height: auto !important; }
table { width: 100% !important; border-collapse: collapse; margin-bottom: 1rem; }
/* Universal fix for instant collapse */
.accordion-content { transition: none !important; display: none; }
.accordion-item.active .accordion-content { display: block !important; }
${css}
</style>
</head>
<body>
${html}
<script>
window.open = function() { console.log('Popup blocked'); return null; };
const resizeObserver = new ResizeObserver(entries => {
  const height = document.body.scrollHeight;
  if (window.parent !== window) {
    try { window.parent.postMessage({ type: 'iframe-resize', height: height, id: '${uniqueIdFull}' }, '*'); } catch (e) {}
  }
});
resizeObserver.observe(document.body);
window.addEventListener('load', () => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: 'iframe-resize', height: height, id: '${uniqueIdFull}' }, '*');
});
document.addEventListener('DOMContentLoaded', function() {
  try { ${js} } catch(e) { console.error('User JS error:', e); }
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  try { ${js} } catch(e) { console.error('User JS error:', e); }
}
<\/script>
</body>
</html>`;

      const blob = new Blob([fullContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.id = 'html-full-iframe';
      iframe.src = url;
      iframe.sandbox = 'allow-scripts allow-same-origin';
      iframe.style.cssText = 'width: 100%; height: 600px; border: none; display: block;';

      const messageHandler = (event) => {
        if (event.data && event.data.type === 'iframe-resize' && event.data.id === uniqueIdFull) {
          iframe.style.height = (event.data.height + 5) + 'px';
        }
      };
      window.addEventListener('message', messageHandler);

      preview.innerHTML = '';
      preview.appendChild(iframe);
    }
  },

  // Edit HTML Content
  editHTMLContent(fileId, tabId) {
    showNotification('🛠️ Edit HTML content feature - Use ContentManagementService.showEditFileModal()', 'info');
    // You can implement edit modal here or reuse ContentManagementService
  },

  // View message card in full or track view
  viewMessageCard(fileId) {
    const structure = ContentManagementService.getContentStructure();
    let file = null;

    // Search for file in all targets
    for (const targetId in structure.files) {
      const found = structure.files[targetId].find(f => f.id === fileId);
      if (found) {
        file = found;
        break;
      }
    }

    if (!file) return;

    // Track view immediately
    if (window.NotificationServiceV2) {
      NotificationServiceV2.markFileAsViewed(file.server_file_id || file.id.replace('server_', ''));
    }

    // Use the core viewFile to open the modal
    ContentManagementService.viewFile(fileId);
  },
};

// Initialize and expose to window
DepartmentsPage.init();
