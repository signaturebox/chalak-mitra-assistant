// Content Management Service

// Add CSS animation for instant file rendering
(function addInstantFileStyles() {
  if (document.getElementById('instant-file-styles')) return;

  const style = document.createElement('style');
  style.id = 'instant-file-styles';
  style.textContent = `
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeOutUp {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-30px);
      }
    }
    .file-deleting {
      animation: fadeOutUp 0.3s ease-out forwards !important;
    }
  `;
  document.head.appendChild(style);
})();

const ContentManagementService = {

  // Fetch and sync files from server for a specific tab/section
  async fetchAndSyncFiles(targetId) {
    try {
      const user = AuthService.getUser();
      const division = this.getDivisionNameFromTab(targetId);
      const section = this.getSectionName(targetId);
      const tabName = this.getTabName(targetId);

      const filters = {};
      if (division) filters.division_id = this.getDivisionId(division);
      if (section || tabName) filters.section = section || tabName;
      // Pass user_id so backend can:
      // - compute per-user "is_new" flags using file_views
      // - apply correct visibility rules for admin/crew
      if (user && (user.id || user.cms)) {
        filters.user_id = user.id || user.cms;
      }

      const response = await Api.getFiles(filters);

      if (response.success && response.files) {
        const structure = this.getContentStructure();
        if (!structure.files[targetId]) structure.files[targetId] = [];

        // Get existing files to preserve metadata like category that might not be in server response
        const existingFiles = structure.files[targetId] || [];

        // Mark server files and properly parse/normalize fields
        const serverFiles = response.files.map(f => {
          // Normalize type to app-expected categories
          const rawType = (f.file_type || '').toLowerCase();
          const isImage = ['image', 'img', 'picture', 'photo', 'jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp'].includes(rawType);
          const isExcel = ['excel', 'xls', 'xlsx', 'csv'].includes(rawType);
          const normType =
            rawType === 'pdf' ? 'pdf' :
              rawType === 'url' ? 'url' :
                rawType === 'html' ? 'html' :
                  rawType === 'message' ? 'message' :
                    isImage ? 'image' :
                      isExcel ? 'excel' :
                        rawType || 'file';

          // Determine URL
          let fileUrl = null;
          if (normType === 'url') {
            fileUrl = f.original_name || f.file_path;
          } else if (normType === 'html' || normType === 'message') {
            fileUrl = null;
          } else {
            // Always use web-accessible uploads path; file_path is a disk path
            fileUrl = f.name ? `/uploads/${f.name}` : null;
          }

          // Parse content for HTML/message
          let fileContent = null;
          if (normType === 'html' || normType === 'message') {
            if (f.original_name) {
              try {
                fileContent = JSON.parse(f.original_name);
              } catch (e) {
                fileContent = f.original_name;
              }
            }
          }

          // Try to find existing file to preserve category
          const existing = existingFiles.find(ef => ef.server_file_id === f.id || (ef.name === (f.title || f.original_name || f.name) && ef.uploadedAt === f.uploaded_at));

          return {
            id: 'server_' + f.id,
            name: f.title || f.original_name || f.name,
            original_name: f.original_name,
            title: f.title,
            type: normType,
            description: f.description || '',
            url: fileUrl,
            content: fileContent,
            uploadedBy: f.uploaded_by_name || 'System',
            uploadedAt: f.uploaded_at,
            division: f.division_name,
            lobby: f.lobby_name,
            section: f.section,
            category: f.category || (existing ? existing.category : null), // Preserve category
            server_file_id: f.id,
            isFromServer: true,
            is_new: !!f.is_new
          };
        });

        // Merge with local files, avoiding duplicates
        const localFiles = structure.files[targetId].filter(f => !f.isFromServer);

        // Use a map to track unique files by server ID or name
        const uniqueFiles = [...localFiles];
        serverFiles.forEach(sf => {
          if (!uniqueFiles.find(uf => uf.server_file_id === sf.server_file_id || (uf.name === sf.name && uf.uploadedAt === sf.uploadedAt))) {
            uniqueFiles.push(sf);
          }
        });

        structure.files[targetId] = uniqueFiles;
        this.saveContentStructure(structure);
        return uniqueFiles;
      }
    } catch (e) {
      console.error('Failed to fetch files from server:', e);
    }
    return null;
  },

  // Fetch files for multiple tabs in a single batch request (for better performance)
  async fetchAndSyncFilesBatch(tabIds, division) {
    try {
      const user = AuthService.getUser();
      const structure = this.getContentStructure();

      // Get section names for all tabs
      const sections = tabIds.map(tabId => {
        const tab = structure.divisionTabs[division]?.find(t => t.id === tabId);
        return tab ? (tab.name || this.getSectionName(tabId)) : this.getSectionName(tabId);
      }).filter(Boolean);

      if (sections.length === 0) {
        console.log('[ContentManagement] No sections to fetch');
        return {};
      }

      const divisionId = division ? this.getDivisionId(division) : null;

      const response = await fetch(`${Api.getBaseUrl ? Api.getBaseUrl() : '/api'}/file_api/get_files_batch.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: sections,
          division_id: divisionId,
          user_id: user?.id || user?.cms
        })
      });

      const result = await response.json();

      if (result.success && result.files_by_section) {
        // Map files back to tabIds and update structure
        const filesByTabId = {};

        tabIds.forEach((tabId, index) => {
          const section = sections[index];
          const serverFiles = result.files_by_section[section] || [];

          // Process files same as fetchAndSyncFiles
          const existingFiles = structure.files[tabId] || [];

          const processedFiles = serverFiles.map(f => {
            // Normalize type
            const rawType = (f.file_type || '').toLowerCase();
            const isImage = ['image', 'img', 'picture', 'photo', 'jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp'].includes(rawType);
            const isExcel = ['excel', 'xls', 'xlsx', 'csv'].includes(rawType);
            const normType =
              rawType === 'pdf' ? 'pdf' :
                rawType === 'url' ? 'url' :
                  rawType === 'html' ? 'html' :
                    rawType === 'message' ? 'message' :
                      isImage ? 'image' :
                        isExcel ? 'excel' :
                          rawType || 'file';

            // URL
            let fileUrl = null;
            if (normType === 'url') {
              fileUrl = f.original_name || f.file_path;
            } else if (normType === 'html' || normType === 'message') {
              fileUrl = null;
            } else {
              // Use web-accessible uploads path; ignore disk file_path
              fileUrl = f.name ? `/uploads/${f.name}` : null;
            }

            // Content for HTML/message
            let fileContent = null;
            if (normType === 'html' || normType === 'message') {
              if (f.original_name) {
                try {
                  fileContent = JSON.parse(f.original_name);
                } catch (e) {
                  fileContent = f.original_name;
                }
              }
            }

            const existing = existingFiles.find(ef => ef.server_file_id === f.id);

            return {
              id: 'server_' + f.id,
              name: f.title || f.original_name || f.name,
              original_name: f.original_name,
              title: f.title,
              type: normType,
              description: f.description || '',
              url: fileUrl,
              content: fileContent,
              uploadedBy: f.uploaded_by_name || 'System',
              uploadedAt: f.uploaded_at,
              division: f.division_name,
              lobby: f.lobby_name,
              section: f.section,
              category: f.category || (existing ? existing.category : null),
              server_file_id: f.id,
              isFromServer: true,
              is_new: !!f.is_new
            };
          });

          // Merge with local files
          const localFiles = existingFiles.filter(f => !f.isFromServer);
          const uniqueFiles = [...localFiles];

          processedFiles.forEach(sf => {
            if (!uniqueFiles.find(uf => uf.server_file_id === sf.server_file_id)) {
              uniqueFiles.push(sf);
            }
          });

          structure.files[tabId] = uniqueFiles;
          filesByTabId[tabId] = uniqueFiles;
        });

        this.saveContentStructure(structure);
        console.log(`[ContentManagement] Batch fetched files for ${tabIds.length} tabs`);
        return filesByTabId;
      }
    } catch (e) {
      console.error('[ContentManagement] Batch fetch failed:', e);
    }
    return null;
  },

  // Sync all files from server and map to local structure
  async syncAllContent() {
    try {
      console.log('🔄 Starting syncAllContent...');

      // 1. Sync Tabs first
      try {
        const tabsResponse = await Api.getTabs();
        if (tabsResponse && tabsResponse.success && tabsResponse.data) {
          console.log(`📑 Found ${tabsResponse.data.length} tabs on server`);
          const structure = this.getContentStructure();

          // Process Main Tabs
          const serverMainTabs = tabsResponse.data.filter(t => t.type === 'main').map(t => ({
            id: t.tab_id,
            name: t.name,
            icon: t.icon,
            color: t.color,
            createdBy: t.created_by,
            createdAt: t.created_at,
            orderIndex: t.order_index,
            isFromServer: true
          }));

          // Merge with predefined tabs
          // We prioritize server tabs (which have order_index)
          // Any predefined tab NOT on server is appended at the end
          const predefined = this.initializePredefinedMainTabs();

          // Start with server tabs (already sorted by order_index from API)
          let mergedMainTabs = [...serverMainTabs];

          // Add missing predefined tabs
          predefined.forEach(pt => {
            // Check if this predefined tab exists in server tabs (by name or ID match)
            // Fuzzy name match: remove spaces, lowercase
            const pName = pt.name.toLowerCase().replace(/\s+/g, '');
            const exists = serverMainTabs.find(st => {
              const sName = st.name.toLowerCase().replace(/\s+/g, '');
              return sName === pName || st.id === pt.id;
            });

            if (!exists) {
              // Add to list if not found on server
              mergedMainTabs.push(pt);
            }
          });

          // If server list was empty (first run), we might want to respect predefined order?
          // But predefined list has implicit order.
          // If mixed, server tabs come first (sorted), then new local ones.
          // This allows "reordering" by ensuring all tabs eventually get an order_index on server.

          structure.mainTabs = mergedMainTabs;

          // Process Division Tabs
          const serverDivTabs = tabsResponse.data.filter(t => t.type === 'division');
          const divMap = { 1: 'jaipur', 2: 'ajmer', 3: 'jodhpur', 4: 'bikaner' };

          serverDivTabs.forEach(t => {
            const divName = divMap[t.division_id];
            if (divName) {
              if (!structure.divisionTabs[divName]) structure.divisionTabs[divName] = [];

              // Check if exists
              const existingIndex = structure.divisionTabs[divName].findIndex(dt => dt.id === t.tab_id || dt.name === t.name);

              const tabObj = {
                id: t.tab_id,
                name: t.name,
                division: divName,
                createdBy: t.created_by,
                createdAt: t.created_at,
                isFromServer: true
              };

              if (existingIndex >= 0) {
                // Update existing
                structure.divisionTabs[divName][existingIndex] = {
                  ...structure.divisionTabs[divName][existingIndex],
                  ...tabObj
                };
              } else {
                structure.divisionTabs[divName].push(tabObj);
              }
            }
          });

          // Process Lobby Tabs
          try {
            const lobbiesResponse = await Api.getLobbies();
            const lobbyMap = {}; // ID -> Name

            if (lobbiesResponse.success && lobbiesResponse.data) {
              lobbiesResponse.data.forEach(l => {
                // Map ID to Name
                lobbyMap[l.id] = l.name;
                // Also map Name to Name (for cases where lobby_id is stored as name)
                lobbyMap[l.name] = l.name;
                // Map lowercase name to Name (for fuzzy matching)
                lobbyMap[l.name.toLowerCase()] = l.name;
              });
            } else {
              console.warn('⚠️ Failed to fetch lobbies for mapping, lobby tabs might be hidden');
            }

            const serverLobbyTabs = tabsResponse.data.filter(t => t.type === 'lobby');
            console.log(`📑 Found ${serverLobbyTabs.length} lobby tabs`);

            serverLobbyTabs.forEach(t => {
              // Try to resolve lobby name
              let lobbyName = lobbyMap[t.lobby_id];

              // If not found by ID, try by name (if lobby_id is a string)
              if (!lobbyName && t.lobby_id) {
                if (isNaN(t.lobby_id)) {
                  lobbyName = lobbyMap[t.lobby_id] || lobbyMap[t.lobby_id.toLowerCase()];
                }
              }

              // Fallback: If lobby_id looks like a name (contains letters), use it directly
              if (!lobbyName && t.lobby_id && isNaN(t.lobby_id)) {
                lobbyName = t.lobby_id;
              }

              if (lobbyName) {
                if (!structure.lobbyTabs[lobbyName]) structure.lobbyTabs[lobbyName] = [];

                const existingIndex = structure.lobbyTabs[lobbyName].findIndex(lt => lt.id === t.tab_id || lt.name === t.name);

                const tabObj = {
                  id: t.tab_id,
                  name: t.name,
                  lobby: lobbyName,
                  lobbyId: t.lobby_id,
                  createdBy: t.created_by,
                  createdAt: t.created_at,
                  isFromServer: true
                };

                if (existingIndex >= 0) {
                  structure.lobbyTabs[lobbyName][existingIndex] = {
                    ...structure.lobbyTabs[lobbyName][existingIndex],
                    ...tabObj
                  };
                } else {
                  structure.lobbyTabs[lobbyName].push(tabObj);
                }
              } else {
                console.warn(`⚠️ Could not map lobby tab "${t.name}" (ID: ${t.tab_id}) to a lobby. Lobby ID: ${t.lobby_id}`);
              }
            });
          } catch (e) {
            console.warn('Failed to sync lobby tabs:', e);
          }

          this.saveContentStructure(structure);
        }
      } catch (e) {
        console.error('Failed to sync tabs:', e);
      }

      const response = await Api.getFiles();
      console.log('📥 Server response:', response);

      if (response.success && response.files) {
        console.log(`📁 Found ${response.files.length} files on server`);
        const structure = this.getContentStructure();

        response.files.forEach(f => {
          console.log('📄 Processing file:', f.original_name, 'section:', f.section, 'division:', f.division_name);

          // Determine the targetId for this file
          let targetId = null;

          // Normalize division name for comparison (server returns "Bikaner", frontend uses "bikaner")
          let fileDivision = f.division_name ? f.division_name.toLowerCase() : null;

          // Fallback: use division_id if division_name is missing
          if (!fileDivision && f.division_id) {
            const divMap = { 1: 'jaipur', 2: 'ajmer', 3: 'jodhpur', 4: 'bikaner' };
            fileDivision = divMap[f.division_id] || null;
          }

          // 1. Try to find existing tab matching section AND division
          if (fileDivision && structure.divisionTabs[fileDivision]) {
            // First try exact division match
            const tab = structure.divisionTabs[fileDivision].find(t => t.name === f.section);
            if (tab) {
              targetId = tab.id;
              console.log('✅ Matched to tab:', tab.name, 'id:', tab.id, 'in division:', fileDivision);
            }
          }

          // 2. If no division match, try main tabs
          if (!targetId) {
            const mainTab = structure.mainTabs.find(t => t.name === f.section);
            if (mainTab) {
              targetId = mainTab.id;
              console.log('✅ Matched to main tab:', mainTab.name, 'id:', mainTab.id);
            }
          }

          // 2. If no tab found, it might be a predefined section in index.html
          if (!targetId) {
            // Mapping for sidebar items
            const sidebarMapping = {
              'GM Message': 'gmMessage',
              'PCEE Message': 'pceeMessage',
              'Traffic': 'traffic',
              'OHE': 'ohe',
              'C & W': 'cw',
              'P-Way': 'pway',
              'SPAD Prevention': 'spad'
            };

            if (f.section) {
              targetId = sidebarMapping[f.section] || f.section.toLowerCase().replace(/\s+/g, '');
            } else {
              targetId = 'root';
            }
          }

          if (!structure.files[targetId]) structure.files[targetId] = [];

          console.log('💾 Saving file to targetId:', targetId, 'type:', f.file_type);

          // Determine the correct URL based on file type
          let fileUrl;
          let fileContent = null;

          if (f.file_type === 'url') {
            // For URL type, the original_name or file_path contains the actual URL
            fileUrl = f.original_name || f.file_path;
          } else if (f.file_type === 'html' || f.file_type === 'message') {
            // For HTML/message, file_path might contain a file reference or JSON content
            fileUrl = null;
            // Try to parse JSON content if original_name contains JSON
            if (f.original_name) {
              try {
                fileContent = JSON.parse(f.original_name);
              } catch (e) {
                // Not JSON, use as-is
                fileContent = f.original_name;
              }
            }
          } else {
            // For regular files (pdf, image, excel)
            fileUrl = `./uploads/${f.name}`;
          }

          // Try to find existing file to preserve category
          const existingFiles = structure.files[targetId] || [];
          const existing = existingFiles.find(ef => ef.server_file_id === f.id || (ef.name === (f.title || f.original_name || f.name) && ef.uploadedAt === f.uploaded_at));

          const sf = {
            id: 'server_' + f.id,
            name: f.title || f.original_name || f.name,
            original_name: f.original_name,
            title: f.title,
            type: f.file_type,
            description: f.description || '',
            url: fileUrl,
            content: fileContent,
            uploadedBy: f.uploaded_by_name || 'System',
            uploadedAt: f.uploaded_at,
            division: f.division_name,
            lobby: f.lobby_name,
            section: f.section,
            category: f.category || (existing ? existing.category : null), // Preserve category
            server_file_id: f.id,
            isFromServer: true
          };

          // Avoid duplicates
          if (!structure.files[targetId].find(uf => uf.server_file_id === sf.server_file_id)) {
            structure.files[targetId].push(sf);
          }
        });

        this.saveContentStructure(structure);
      }
    } catch (e) {
      console.error('Failed to sync all content:', e);
    }
  },

  // Helper to get division name from tab ID
  getDivisionNameFromTab(targetId) {
    if (!targetId) return null;

    // 1. Check if it's explicitly in the ID (e.g. div_bikaner_1)
    const divisions = ['bikaner', 'ajmer', 'jodhpur', 'jaipur'];
    for (const div of divisions) {
      if (targetId.toLowerCase().includes(div)) {
        console.log('✅ getDivisionNameFromTab: Found division in ID:', div);
        return div;
      }
    }

    // 2. Search structure.divisionTabs
    const structure = this.getContentStructure();
    for (const div in structure.divisionTabs) {
      if (structure.divisionTabs[div].some(t => String(t.id) === String(targetId))) {
        console.log('✅ getDivisionNameFromTab: Found division in divisionTabs:', div);
        return div;
      }
    }

    // 3. Search structure.lobbyTabs (lobby tabs belong to a division too)
    // We might need to look up which division a lobby belongs to
    for (const lobbyName in structure.lobbyTabs) {
      if (structure.lobbyTabs[lobbyName].some(t => String(t.id) === String(targetId))) {
        console.log('✅ getDivisionNameFromTab: Found targetId in lobbyTabs for:', lobbyName);
        // Look up division for this lobby
        if (window.LobbyManagementService) {
          const lobbiesByDiv = LobbyManagementService.getLobbies();
          for (const div in lobbiesByDiv) {
            if (lobbiesByDiv[div].includes(lobbyName)) {
              console.log('✅ getDivisionNameFromTab: Found division via LobbyManagementService:', div);
              return div.toLowerCase();
            }
          }
        }

        // Fallback: If we can't find the division for the lobby, maybe the user division?
        const user = AuthService.getUser();
        if (user && user.division) return user.division.toLowerCase();
      }
    }

    console.log('⚠️ getDivisionNameFromTab: No division found for targetId:', targetId);
    return null;
  },

  // Cache configuration
  cacheConfig: {
    maxAge: 5 * 60 * 1000, // 5 minutes
    lastSync: null
  },

  // Get content structure from storage with cache validation
  // In-memory cache - no localStorage
  _memoryCache: {
    mainTabs: [],
    divisionTabs: {},
    lobbyTabs: {},
    folders: {},
    files: {}
  },

  getContentStructure() {
    // Always return in-memory cache, never localStorage
    // The files will be fetched fresh from server when needed

    // Initialize default structure if empty
    if (!this._memoryCache.mainTabs || this._memoryCache.mainTabs.length === 0) {
      this._memoryCache.mainTabs = this.initializePredefinedMainTabs();
    }

    // Initialize division tabs if empty
    const divisions = ['bikaner', 'ajmer', 'jodhpur', 'jaipur'];
    divisions.forEach(division => {
      if (!this._memoryCache.divisionTabs[division] || this._memoryCache.divisionTabs[division].length === 0) {
        this._memoryCache.divisionTabs[division] = APP_CONFIG.divisionSections.map((sectionName, index) => ({
          id: `dtab_${division}_${index}`,
          name: sectionName,
          division: division,
          createdBy: 'System',
          createdAt: new Date().toISOString()
        }));
      }
    });

    return this._memoryCache;
  },

  // Initialize predefined main tabs from config
  initializePredefinedMainTabs() {
    if (!APP_CONFIG.predefinedMainTabs) return [];

    return APP_CONFIG.predefinedMainTabs.map((tab, index) => ({
      id: `mtab_predefined_${index}`,
      name: tab.name,
      icon: tab.icon || '',
      color: tab.color || '#667eea',
      createdBy: 'System',
      createdAt: new Date().toISOString(),
      isPredefined: true // Mark as predefined so it can be distinguished
    }));
  },

  // Save content structure - now uses memory only, no localStorage
  saveContentStructure(structure) {
    // Update in-memory cache
    this._memoryCache = { ...this._memoryCache, ...structure };

    // Dispatch event for UI updates
    const event = new CustomEvent('contentStructureUpdated', { detail: this._memoryCache });
    document.dispatchEvent(event);

    // Update sidebar if NavigationService is available
    if (window.NavigationService && typeof NavigationService.renderSidebar === 'function') {
      NavigationService.renderSidebar();
    }
  },

  // Clear cache and force refresh
  clearCache() {
    // Clear in-memory files cache only, keep tabs structure
    this._memoryCache.files = {};
    console.log('[ContentManagement] Cache cleared');
  },

  // Batch file operations for better performance
  batchOperations: {
    pending: [],
    timeout: null,

    add(operation) {
      this.pending.push(operation);
      this.schedule();
    },

    schedule() {
      if (this.timeout) return;

      this.timeout = setTimeout(() => {
        this.execute();
      }, 100); // Batch operations within 100ms
    },

    execute() {
      if (this.pending.length === 0) return;

      const operations = [...this.pending];
      this.pending = [];
      this.timeout = null;

      // Execute all pending operations
      operations.forEach(op => {
        try {
          op();
        } catch (e) {
          console.error('[ContentManagement] Batch operation error:', e);
        }
      });

      // Single save after all operations
      if (window.ContentManagementService) {
        ContentManagementService.saveContentStructure(
          ContentManagementService.getContentStructure()
        );
      }
    }
  },

  // Add Main Tab
  async addMainTab(tabName, iconUrl, user) {
    const structure = this.getContentStructure();

    // Check permission - Only Super Admin
    if (!PermissionsService.canAddMainTab(user)) {
      return { success: false, message: PermissionsService.getPermissionError('add main tabs') };
    }

    // Check if tab already exists
    if (structure.mainTabs.find(t => t.name === tabName)) {
      return { success: false, message: 'Tab already exists' };
    }

    try {
      // Call API
      const result = await Api.createTab({
        name: tabName,
        type: 'main',
        icon: iconUrl,
        user_id: user.id || user.cms_id
      });

      if (result.success) {
        const tabId = result.data.tab_id;
        structure.mainTabs.push({
          id: tabId,
          name: tabName,
          icon: iconUrl,
          createdBy: user.name,
          createdAt: new Date().toISOString(),
          isFromServer: true
        });

        this.saveContentStructure(structure);
        return { success: true, message: 'Main tab added successfully', tabId };
      } else {
        return { success: false, message: result.message || 'Failed to add tab' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Edit Main Tab
  async editMainTab(tabId, tabName, iconUrl, user) {
    const structure = this.getContentStructure();

    if (!PermissionsService.canEditDeleteMainTab(user)) {
      return { success: false, message: PermissionsService.getPermissionError('edit main tabs') };
    }

    const tab = structure.mainTabs.find(t => t.id === tabId);
    if (!tab) {
      return { success: false, message: 'Tab not found' };
    }

    try {
      // Call API
      let result;
      if (tab.isFromServer) {
        result = await Api.updateTab({
          tab_id: tabId,
          name: tabName,
          icon: iconUrl,
          user_id: user.id || user.cms_id
        });
      } else {
        // If not on server, we create it
        result = await Api.createTab({
          tab_id: tabId,
          name: tabName,
          type: 'main',
          icon: iconUrl,
          user_id: user.id || user.cms_id
        });
      }

      if (result.success) {
        tab.name = tabName;
        tab.icon = iconUrl;
        tab.updatedAt = new Date().toISOString();
        tab.isFromServer = true;

        this.saveContentStructure(structure);
        return { success: true, message: 'Main tab updated successfully' };
      } else {
        return { success: false, message: result.message || 'Failed to update tab' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Delete Main Tab
  async deleteMainTab(tabId, user) {
    const structure = this.getContentStructure();

    if (!PermissionsService.canEditDeleteMainTab(user)) {
      return { success: false, message: PermissionsService.getPermissionError('delete main tabs') };
    }

    const index = structure.mainTabs.findIndex(t => t.id === tabId);
    if (index === -1) {
      return { success: false, message: 'Tab not found' };
    }

    try {
      // Call API
      const result = await Api.deleteTab(tabId);

      if (result.success) {
        structure.mainTabs.splice(index, 1);
        this.saveContentStructure(structure);
        return { success: true, message: 'Main tab deleted successfully' };
      } else {
        return { success: false, message: result.message || 'Failed to delete tab' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Move Main Tab (Reorder)
  async moveMainTab(tabId, direction, user) {
    const structure = this.getContentStructure();

    if (!PermissionsService.canEditDeleteMainTab(user)) {
      return { success: false, message: PermissionsService.getPermissionError('reorder main tabs') };
    }

    const index = structure.mainTabs.findIndex(t => t.id === tabId);
    if (index === -1) return { success: false, message: 'Tab not found' };

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= structure.mainTabs.length) {
      return { success: false, message: 'Cannot move further' };
    }

    // Swap in local array
    const temp = structure.mainTabs[index];
    structure.mainTabs[index] = structure.mainTabs[newIndex];
    structure.mainTabs[newIndex] = temp;

    try {
      // Ensure ALL tabs exist on server before updating order
      // This prevents sparse arrays where local tabs have no server presence
      const ensureTabOnServer = async (tab, idx) => {
        if (!tab.isFromServer) {
          console.log(`Creating tab on server for reordering: ${tab.name} at index ${idx}`);
          const result = await Api.createTab({
            name: tab.name,
            type: 'main',
            icon: tab.icon,
            user_id: user.id || user.cms_id,
            tab_id: tab.id // Preserve ID
          });

          if (result.success) {
            tab.isFromServer = true;
          }
        }
      };

      // 1. Ensure all tabs exist on server
      // We use a loop to ensure sequential creation if needed
      for (let i = 0; i < structure.mainTabs.length; i++) {
        await ensureTabOnServer(structure.mainTabs[i], i);
      }

      // 2. Prepare bulk update payload
      const updates = structure.mainTabs.map((tab, idx) => ({
        tab_id: tab.id,
        order_index: idx
      }));

      // 3. Send bulk update
      const result = await Api.bulkUpdateTabs(updates);

      if (result.success) {
        this.saveContentStructure(structure);
        return { success: true, message: 'Tab reordered successfully' };
      } else {
        throw new Error(result.message || 'Bulk update failed');
      }

    } catch (e) {
      console.error('Reorder error:', e);
      // Revert local change
      const temp = structure.mainTabs[index];
      structure.mainTabs[index] = structure.mainTabs[newIndex];
      structure.mainTabs[newIndex] = temp;
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Add Division Tab
  async addDivisionTab(division, tabName, user) {
    const structure = this.getContentStructure();

    // Check permission - Super Admin or Division Admin of own division
    if (!PermissionsService.canAddDivisionTabOwn(user, division)) {
      return { success: false, message: PermissionsService.getPermissionError('add tabs to this division') };
    }

    if (!structure.divisionTabs[division]) {
      structure.divisionTabs[division] = [];
    }

    // Check if tab already exists
    if (structure.divisionTabs[division].find(t => t.name === tabName)) {
      return { success: false, message: 'Tab already exists in this division' };
    }

    try {
      // Call API
      const result = await Api.createTab({
        name: tabName,
        type: 'division',
        division_id: this.getDivisionId(division),
        user_id: user.id || user.cms_id
      });

      if (result.success) {
        const tabId = result.data.tab_id;
        structure.divisionTabs[division].push({
          id: tabId,
          name: tabName,
          division: division,
          createdBy: user.name,
          createdAt: new Date().toISOString(),
          isFromServer: true
        });

        this.saveContentStructure(structure);
        return { success: true, message: 'Division tab added successfully', tabId };
      } else {
        return { success: false, message: result.message || 'Failed to add tab' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Edit Division Tab
  async editDivisionTab(division, tabId, tabName, user) {
    const structure = this.getContentStructure();

    if (!PermissionsService.canEditDeleteDivisionTab(user, division)) {
      return { success: false, message: PermissionsService.getPermissionError('edit tabs in this division') };
    }

    if (!structure.divisionTabs[division]) {
      return { success: false, message: 'Division not found' };
    }

    const tab = structure.divisionTabs[division].find(t => t.id === tabId);
    if (!tab) {
      return { success: false, message: 'Tab not found' };
    }

    try {
      // Call API
      let result;
      if (tab.isFromServer) {
        result = await Api.updateTab({
          tab_id: tabId,
          name: tabName,
          user_id: user.id || user.cms_id
        });
      } else {
        // If not on server, we create it
        result = await Api.createTab({
          tab_id: tabId,
          name: tabName,
          type: 'division',
          division_id: this.getDivisionId(division),
          user_id: user.id || user.cms_id
        });
      }

      if (result.success) {
        tab.name = tabName;
        tab.updatedAt = new Date().toISOString();
        tab.isFromServer = true;

        this.saveContentStructure(structure);
        return { success: true, message: 'Division tab updated successfully' };
      } else {
        return { success: false, message: result.message || 'Failed to update tab' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Delete Division Tab
  async deleteDivisionTab(division, tabId, user) {
    const structure = this.getContentStructure();

    if (!PermissionsService.canEditDeleteDivisionTab(user, division)) {
      return { success: false, message: PermissionsService.getPermissionError('delete tabs in this division') };
    }

    if (!structure.divisionTabs[division]) {
      return { success: false, message: 'Division not found' };
    }

    const index = structure.divisionTabs[division].findIndex(t => t.id === tabId);
    if (index === -1) {
      return { success: false, message: 'Tab not found' };
    }

    try {
      // Call API
      const result = await Api.deleteTab(tabId);

      if (result.success) {
        structure.divisionTabs[division].splice(index, 1);
        this.saveContentStructure(structure);
        return { success: true, message: 'Division tab deleted successfully' };
      } else {
        return { success: false, message: result.message || 'Failed to delete tab' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Add Folder
  addFolder(targetId, folderName, user, lobbyName = null, category = null) {
    const structure = this.getContentStructure();
    const tabDivision = this.getDivisionNameFromTab(targetId);

    // Check permission using PermissionsService
    if (!PermissionsService.canAddFolder(user, tabDivision, lobbyName)) {
      return { success: false, message: PermissionsService.getPermissionError('add folders here') };
    }

    const folderId = 'folder_' + Date.now();
    structure.folders[folderId] = {
      id: folderId,
      name: folderName,
      parentId: null,
      targetId: targetId,
      createdBy: user.name,
      division: user.division,
      lobby: lobbyName || (user.role === 'lobby' ? (user.lobby || user.hq) : null),
      category: category, // Add category support
      createdAt: new Date().toISOString(),
      files: []
    };

    this.saveContentStructure(structure);
    return { success: true, message: 'Folder created successfully', folderId };
  },

  // Edit Folder Name
  editFolder(targetId, folderId, newFolderName, user) {
    const structure = this.getContentStructure();
    const folder = structure.folders[folderId];

    // Check permission - need to be able to manage this folder
    if (!folder) {
      return { success: false, message: 'Folder not found' };
    }

    const tabDivision = this.getDivisionNameFromTab(targetId);
    if (!PermissionsService.canAddFolder(user, tabDivision, folder.lobby)) {
      return { success: false, message: PermissionsService.getPermissionError('edit folders here') };
    }

    // Update folder name
    structure.folders[folderId].name = newFolderName;

    this.saveContentStructure(structure);
    return { success: true, message: 'Folder renamed successfully' };
  },

  // Delete Folder
  deleteFolder(targetId, folderId, user) {
    const structure = this.getContentStructure();
    const folder = structure.folders[folderId];

    // Check if folder exists
    if (!folder) {
      return { success: false, message: 'Folder not found' };
    }

    // Check permission
    const tabDivision = this.getDivisionNameFromTab(targetId);
    if (!PermissionsService.canAddFolder(user, tabDivision, folder.lobby)) {
      return { success: false, message: PermissionsService.getPermissionError('delete folders here') };
    }

    // Check if folder has files
    const filesInFolder = structure.files[targetId]?.filter(f => f.folder === folderId) || [];
    if (filesInFolder.length > 0) {
      return { success: false, message: `Cannot delete folder with ${filesInFolder.length} file(s). Please delete files first.` };
    }

    // Delete folder
    delete structure.folders[folderId];

    this.saveContentStructure(structure);
    return { success: true, message: 'Folder deleted successfully' };
  },

  // Upload File
  async uploadFile(targetId, fileData, user) {
    console.log('📂 uploadFile called with targetId:', targetId);

    // Determine the correct division and lobby from the tab
    const tabDivision = this.getDivisionNameFromTab(targetId);
    const tabLobby = this.getLobbyNameFromTab(targetId);

    // Main tabs should have NULL division so all users can see the files
    const effectiveDivision = tabDivision;
    // Only target a specific lobby if the tab is lobby-specific OR it was explicitly passed
    const effectiveLobby = tabLobby || fileData.lobby;

    console.log('📍 Targeting determination:', { targetId, tabDivision, tabLobby, effectiveDivision, effectiveLobby });

    // Check permission using PermissionsService
    // For main tabs (no division), only Super Admin can upload
    const isMainTab = !effectiveDivision && targetId && (targetId.startsWith('mtab_') || targetId.startsWith('gmMessage') || targetId.startsWith('pceeMessage'));

    if (isMainTab) {
      // Main tabs: only Super Admin can upload
      if (!PermissionsService.isSuperAdmin(user)) {
        return { success: false, message: PermissionsService.getPermissionError('upload files to main tabs') };
      }
    } else if (!PermissionsService.canUploadFile(user, effectiveDivision, effectiveLobby)) {
      return { success: false, message: PermissionsService.getPermissionError('upload files here') };
    }

    try {
      // Handle different file types
      if (fileData.type === 'pdf' || fileData.type === 'image' || fileData.type === 'excel') {
        // For actual file uploads, use the API service
        if (fileData.file instanceof File) {
          const uploadData = {
            file: fileData.file,
            user_id: user.id || user.cms_id || user.cms,
            division_id: this.getDivisionId(effectiveDivision),
            lobby_id: this.getLobbyId(effectiveLobby),
            section: this.getSectionName(targetId),
            category: fileData.category || null,
            title: fileData.name || '',
            description: fileData.description || ''
          };

          console.log('📤 Uploading file with:', { section: uploadData.section, division: effectiveDivision, division_id: uploadData.division_id, category: uploadData.category });

          const result = await Api.uploadFile(uploadData);

          if (result.success) {
            // Also save metadata to localStorage for UI purposes
            this.saveFileMetadata(targetId, {
              id: 'server_' + result.file_id,
              name: fileData.name,
              type: fileData.type,
              description: fileData.description || '',
              content: fileData.content,
              url: `/uploads/${result.file_name}`, // Web path
              downloadable: fileData.downloadable === undefined ? true : fileData.downloadable,
              folder: fileData.folder && fileData.folder !== 'root' ? fileData.folder : null,
              targetId: targetId,
              uploadedBy: user.name,
              division: effectiveDivision,
              lobby: effectiveLobby,
              uploadedAt: new Date().toISOString(),
              category: fileData.category || null,
              server_file_id: result.file_id,
              isFromServer: true
            });

            // Trigger notification for file upload
            const notificationData = {
              ...fileData,
              division: effectiveDivision,
              lobby: effectiveLobby,
              tabId: targetId,
              tabName: this.getTabName(targetId),
              section: this.getSectionName(targetId)
            };

            /*
            // ❌ DISABLED: Prevent redundant local notification/vibration
            // Unified notification is handled by the server (create_notification.php)
            if (window.NotificationServiceV2) {
              NotificationServiceV2.handleFileUpload(notificationData);
            } else if (window.NotificationService) {
              NotificationService.triggerFileNotification(notificationData);
            }
            */

            // Dispatch global event for real-time sync (for other components that might be listening)
            document.dispatchEvent(new CustomEvent('fileUploaded', { detail: notificationData }));

            /* 
            // ❌ DISABLED: This was causing a second local notification (New File Added)
            // The OneSignal push from the server is sufficient for the device.
            const widgetContent = document.getElementById('notificationWidgetContent');
            if (widgetContent && window.DashboardPage) {
              DashboardPage.loadNotificationsForWidget();
            }
            */

            // Create server notification for crew members (this also triggers the OneSignal push)
            await this.createServerNotification(targetId, fileData, user, effectiveDivision, effectiveLobby, result.file_id);

            // Build file object for instant UI update
            const uploadedFile = {
              id: result.file_id,
              name: result.file_name || fileData.name,
              title: fileData.name,
              file_type: fileData.type,
              type: fileData.type,
              description: fileData.description || '',
              url: `/uploads/${result.file_name}`,
              downloadable: fileData.downloadable === undefined ? true : fileData.downloadable,
              uploaded_by_name: user.name,
              uploaded_at: new Date().toISOString(),
              division_id: this.getDivisionId(effectiveDivision),
              division_name: effectiveDivision,
              lobby_id: this.getLobbyId(effectiveLobby),
              lobby_name: effectiveLobby,
              section: this.getSectionName(targetId),
              category: fileData.category || null,
              target_id: targetId,
              target_type: 'tab'
            };

            return { success: true, message: 'File uploaded successfully to server', fileId: result.file_id, file: uploadedFile };
          } else {
            console.error('Server upload failed:', result.error);
            return { success: false, message: result.error || 'Server upload failed' };
          }
        } else if (fileData.url && fileData.url.startsWith('http')) {
          // URL-based PDF/image/excel - send to content API
          return await this.uploadContentToServer(targetId, fileData, user, effectiveDivision, effectiveLobby);
        }
      } else {
        // For other file types (message, html, url), use content API to save to server
        return await this.uploadContentToServer(targetId, fileData, user, effectiveDivision, effectiveLobby);
      }
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, message: 'Upload failed: ' + error.message };
    }
  },

  // Upload content (URL, HTML, message) to server
  async uploadContentToServer(targetId, fileData, user, effectiveDivision, effectiveLobby) {
    try {
      // Ensure effectiveDivision and effectiveLobby are correctly determined for content too
      if (effectiveDivision === undefined) effectiveDivision = this.getDivisionNameFromTab(targetId);
      if (effectiveLobby === undefined) effectiveLobby = this.getLobbyNameFromTab(targetId) || fileData.lobby;
      // Serialize content if it's an object (HTML with CSS/JS, message card, etc.)
      let contentString = '';
      if (fileData.content && typeof fileData.content === 'object') {
        contentString = JSON.stringify(fileData.content);
      } else {
        contentString = fileData.content || '';
      }

      const contentData = {
        user_id: user.id || user.cms_id || user.cms,
        division_id: this.getDivisionId(effectiveDivision),
        lobby_id: this.getLobbyId(effectiveLobby),
        section: this.getSectionName(targetId),
        category: fileData.category || null,
        title: fileData.name || 'Untitled',
        description: fileData.description || '',
        file_type: fileData.type || 'url',
        url: fileData.url || '',
        content: contentString
      };

      console.log('📤 Uploading content to server:', { type: contentData.file_type, section: contentData.section, division: effectiveDivision, category: contentData.category });

      const result = await Api.uploadContent(contentData);

      console.log('📥 Upload result:', result);

      if (result.success) {
        // Save metadata to localStorage for UI purposes
        this.saveFileMetadata(targetId, {
          id: 'server_' + result.file_id,
          name: fileData.name,
          type: fileData.type,
          description: fileData.description || '',
          content: fileData.content,
          url: fileData.url || null,
          downloadable: fileData.downloadable === undefined ? true : fileData.downloadable,
          folder: fileData.folder && fileData.folder !== 'root' ? fileData.folder : null,
          targetId: targetId,
          uploadedBy: user.name,
          division: effectiveDivision,
          lobby: effectiveLobby,
          uploadedAt: new Date().toISOString(),
          category: fileData.category || null,
          server_file_id: result.file_id,
          isFromServer: true
        });

        // Trigger notification
        const notificationData = {
          ...fileData,
          division: effectiveDivision,
          lobby: effectiveLobby,
          tabId: targetId,
          tabName: this.getTabName(targetId),
          section: this.getSectionName(targetId)
        };

        /*
        // ❌ DISABLED: Prevent redundant local notification
        if (window.NotificationServiceV2) {
          NotificationServiceV2.handleFileUpload(notificationData);
        } else if (window.NotificationService) {
          NotificationService.triggerFileNotification(notificationData);
        }
        */

        // Dispatch global event for real-time sync
        document.dispatchEvent(new CustomEvent('fileUploaded', { detail: notificationData }));

        /* 
        // ❌ DISABLED: Prevent redundant local notification/refresh
        const widgetContent = document.getElementById('notificationWidgetContent');
        if (widgetContent && window.DashboardPage) {
          DashboardPage.loadNotificationsForWidget();
        }
        */

        // Create server notification for crew members (this also triggers the OneSignal push)
        await this.createServerNotification(targetId, fileData, user, effectiveDivision, effectiveLobby, result.file_id);

        // Build file object for instant UI update
        const uploadedFile = {
          id: result.file_id,
          name: fileData.name,
          title: fileData.name,
          file_type: fileData.type,
          type: fileData.type,
          description: fileData.description || '',
          content: fileData.content,
          url: fileData.url || null,
          downloadable: fileData.downloadable === undefined ? true : fileData.downloadable,
          uploaded_by_name: user.name,
          uploaded_at: new Date().toISOString(),
          division_id: this.getDivisionId(effectiveDivision),
          division_name: effectiveDivision,
          lobby_id: this.getLobbyId(effectiveLobby),
          lobby_name: effectiveLobby,
          section: this.getSectionName(targetId),
          category: fileData.category || null,
          target_id: targetId,
          target_type: 'tab'
        };

        return { success: true, message: 'Content saved to server successfully', fileId: result.file_id, file: uploadedFile };
      } else {
        // Handle different error formats from API
        const errorMsg = result.error || result.message || 'Server upload failed';
        console.error('Content upload failed:', errorMsg, result);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('Content upload error:', error);
      return { success: false, message: 'Upload failed: ' + (error.message || 'Unknown error') };
    }
  },

  // Get category display name
  getCategoryDisplayName(category) {
    const names = {
      'conventional': 'Conventional Loco',
      'threePhase': '3-Phase Loco',
      'wag12': 'Wag-12 Loco'
    };
    return names[category] || category;
  },

  // Save file metadata to localStorage for UI purposes
  saveFileMetadata(targetId, file) {
    const structure = this.getContentStructure();

    if (!structure.files[targetId]) {
      structure.files[targetId] = [];
    }

    structure.files[targetId].push(file);
    this.saveContentStructure(structure);
  },

  // Create server notification for file/content upload
  // Notification Scope:
  // - Main Tab (Super Admin upload): All divisions and lobbies get notified
  // - Division Tab (Division Admin upload): Only that division's lobbies get notified
  // - Lobby Tab (Lobby Admin upload): Only that specific lobby gets notified
  async createServerNotification(targetId, fileData, user, effectiveDivision, effectiveLobby, fileId) {
    try {
      console.log('🔔 createServerNotification called with:', {
        targetId,
        effectiveDivision,
        effectiveLobby,
        fileId
      });

      // Determine notification scope
      let scope = 'main';
      let notificationType = 'announcement';

      // Check if it's a main tab (no division)
      const isMainTab = !effectiveDivision && targetId &&
        (targetId.startsWith('mtab_') ||
          targetId.startsWith('gmMessage') ||
          targetId.startsWith('pceeMessage') ||
          ['traffic', 'ohe', 'cw', 'pway', 'spad', 'ruleBooks', 'electricLoco', 'dieselLoco', 'vandeBharat'].includes(targetId));

      console.log('📋 Tab detection:', { isMainTab, effectiveDivision, effectiveLobby });

      if (isMainTab) {
        scope = 'main';
        notificationType = 'announcement';
      } else if (effectiveLobby) {
        // Lobby specific upload
        scope = 'lobby';
        notificationType = 'info';
      } else if (effectiveDivision) {
        // Division specific upload
        scope = 'division';
        notificationType = 'info';
      }

      console.log('📢 Notification scope determined:', scope);

      // Determine title and message based on file type
      const typeLabel = (fileData.type || 'file').charAt(0).toUpperCase() + (fileData.type || 'file').slice(1);
      const sectionName = this.getSectionName(targetId) || this.getTabName(targetId);

      // Target Location String
      let location = '';
      if (scope === 'main') {
        location = sectionName || 'Main Section';
      } else if (scope === 'division') {
        location = `${(effectiveDivision || '').toUpperCase()} Division - ${sectionName}`;
      } else if (scope === 'lobby') {
        location = `${effectiveDivision?.toUpperCase() || ''} Division - ${sectionName} - ${effectiveLobby} Lobby`;
      }

      // Format preferred by the user: "New Type: "Title""
      let title = `New ${typeLabel}: "${fileData.name}"`;
      let message = `A new ${fileData.type || 'file'} has been added to ${location}`;

      if (fileData.description && fileData.description.trim()) {
        message += `. ${fileData.description.substring(0, 100)}${fileData.description.length > 100 ? '...' : ''}`;
      }

      // Get division ID - ensure it's correctly mapped
      const divisionId = effectiveDivision ? this.getDivisionId(effectiveDivision.toLowerCase()) : null;

      // Create notification via API
      const notificationData = {
        title: title,
        message: message,
        type: notificationType,
        created_by: user.id || user.cms_id || user.cms,
        scope: scope,
        division_id: divisionId,
        lobby_id: this.getLobbyId(effectiveLobby),
        file_id: fileId,
        tab_id: targetId
      };

      console.log('🔔 Creating server notification with data:', notificationData);

      const result = await Api.createNotification(notificationData);

      console.log('📥 Server notification result:', result);

      if (result.success) {
        console.log('✅ Server notification created:', result.notification_id, 'scope:', result.scope, 'target_division_id:', result.target_division_id);

        // Refresh notifications in the UI
        if (window.NotificationService) {
          setTimeout(() => {
            NotificationService.fetchNotificationsFromServer();
          }, 500);
        }
      } else {
        console.warn('⚠️ Failed to create server notification:', result.error || result);
      }

      return result;
    } catch (error) {
      console.error('❌ Error creating server notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Save local file (non-server files) to localStorage
  saveLocalFile(targetId, fileData, user) {
    const structure = this.getContentStructure();
    const fileId = 'local_' + Date.now();

    const file = {
      id: fileId,
      name: fileData.name,
      type: fileData.type,
      description: fileData.description || '',
      content: fileData.content,
      url: fileData.url || null,
      folder: fileData.folder && fileData.folder !== 'root' ? fileData.folder : null,
      targetId: targetId,
      uploadedBy: user.name,
      division: user.division,
      lobby: fileData.lobby || (user.role === 'lobby' ? (user.lobby || user.hq) : null),
      uploadedAt: new Date().toISOString()
    };

    if (!structure.files[targetId]) {
      structure.files[targetId] = [];
    }

    structure.files[targetId].push(file);
    this.saveContentStructure(structure);

    // Trigger notification for file upload
    if (window.NotificationService) {
      const notificationData = {
        ...fileData,
        division: user.division,
        lobby: fileData.lobby || (user.role === 'lobby' ? (user.lobby || user.hq) : null),
        tabId: targetId,
        tabName: this.getTabName(targetId),
        section: this.getSectionName(targetId)
      };
      NotificationService.triggerFileNotification(notificationData);
    }

    return { success: true, message: 'File saved locally', fileId };
  },

  // Get division ID from division name
  getDivisionId(divisionName) {
    const divisions = {
      'jaipur': 1,
      'ajmer': 2,
      'jodhpur': 3,
      'bikaner': 4
    };
    return divisions[divisionName] || null;
  },

  // Get lobby ID from lobby name (returns name/ID for PHP to look up)
  getLobbyId(lobbyName) {
    if (!lobbyName) return null;
    // Try to get ID from LobbyManagementService map if it exists
    if (window.LobbyManagementService && LobbyManagementService.lobbyMap) {
      return LobbyManagementService.lobbyMap[lobbyName] || lobbyName;
    }
    return lobbyName;
  },

  // Helper to get lobby name from tab ID
  getLobbyNameFromTab(targetId) {
    if (!targetId) return null;

    // 1. Check if it's a dynamic lobby tab ID (format: lobby_division_index)
    if (targetId && String(targetId).startsWith('lobby_')) {
      const parts = String(targetId).split('_');
      if (parts.length >= 3) {
        const division = parts[1];
        const index = parseInt(parts[2], 10);
        if (window.LobbyManagementService) {
          const lobbies = LobbyManagementService.getLobbiesByDivision(division);
          if (lobbies && lobbies[index]) {
            console.log('✅ getLobbyNameFromTab: Found dynamic lobby', lobbies[index], 'for id:', targetId);
            return lobbies[index];
          }
        }
      }
    }

    // 2. Search structure.lobbyTabs (for custom-created lobby tabs)
    const structure = this.getContentStructure();
    if (structure.lobbyTabs) {
      for (const lobbyName in structure.lobbyTabs) {
        if (structure.lobbyTabs[lobbyName].some(t => String(t.id) === String(targetId))) {
          console.log('✅ getLobbyNameFromTab: Found custom lobby', lobbyName, 'for id:', targetId);
          return lobbyName;
        }
      }
    }
    return null;
  },

  // Show Add Main Tab Modal
  showAddMainTabModal() {
    const user = AuthService.getUser();

    if (!PermissionsService.canAddMainTab(user)) {
      showNotification(PermissionsService.getPermissionError('add main tabs'), 'error');
      return;
    }

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">➕ Add Main Tab</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Tab Name *</label>
              <input id="mainTabName" type="text" placeholder="Enter tab name" />
            </div>
            
            <div class="form-group">
              <label>Lottie Icon URL <span style="font-size: 10px; color: #888;">(optional)</span></label>
              <input id="mainTabIcon" type="text" placeholder="https://assets.lottiefiles.com/..." />
            </div>
          </div>
          
          <div id="contentModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitAddMainTab()">💾 Create Tab</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit Add Main Tab
  async submitAddMainTab() {
    const user = AuthService.getUser();
    const tabName = document.getElementById('mainTabName').value.trim();
    const iconUrl = document.getElementById('mainTabIcon').value.trim();
    const errorElem = document.getElementById('contentModalError');

    if (!tabName) {
      errorElem.textContent = 'Please enter tab name';
      return;
    }

    const result = await this.addMainTab(tabName, iconUrl, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeModal();
      // Reload main tabs in Admin Page if applicable
      if (typeof AdminPage !== 'undefined' && AdminPage.loadMainTabManagement) {
        AdminPage.loadMainTabManagement();
      }
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Show Add Division Tab Modal
  showAddDivisionTabModal() {
    const user = AuthService.getUser();

    // Check permission - Super Admin or Division Admin
    if (!PermissionsService.isSuperAdmin(user) && !PermissionsService.isDivisionAdmin(user)) {
      showNotification(PermissionsService.getPermissionError('add division tabs'), 'error');
      return;
    }

    const divisionOptions = PermissionsService.isSuperAdmin(user)
      ? `
        <option value="bikaner">Bikaner</option>
        <option value="ajmer">Ajmer</option>
        <option value="jodhpur">Jodhpur</option>
        <option value="jaipur">Jaipur</option>
      `
      : `<option value="${user.division}">${user.division.charAt(0).toUpperCase() + user.division.slice(1)}</option>`;

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">➕ Add Division Tab</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Division *</label>
              <select id="divTabDivision" ${PermissionsService.isDivisionAdmin(user) ? 'disabled' : ''}>
                ${divisionOptions}
              </select>
            </div>
            
            <div class="form-group">
              <label>Tab Name *</label>
              <input id="divTabName" type="text" placeholder="Enter tab name" />
            </div>
          </div>
          
          <div id="contentModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitAddDivisionTab()">💾 Create Tab</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit Add Division Tab
  async submitAddDivisionTab() {
    const user = AuthService.getUser();
    const division = document.getElementById('divTabDivision').value;
    const tabName = document.getElementById('divTabName').value.trim();
    const errorElem = document.getElementById('contentModalError');

    if (!tabName) {
      errorElem.textContent = 'Please enter tab name';
      return;
    }

    const result = await this.addDivisionTab(division, tabName, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeModal();
      if (typeof AdminPage !== 'undefined' && AdminPage.loadDivisionTabManagement) {
        AdminPage.loadDivisionTabManagement();
      }
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Show Add Folder Modal
  showAddFolderModal(targetId, targetName, lobbyName = null, category = null) {
    const user = AuthService.getUser();

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">📁 Create Folder</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Folder Name *</label>
              <input id="folderName" type="text" placeholder="Enter folder name" />
            </div>
          </div>
          
          <!-- Hidden Inputs -->
          <input type="hidden" id="folderTargetId" value="${targetId || ''}" />
          <input type="hidden" id="folderLobbyName" value="${lobbyName || ''}" />
          <input type="hidden" id="folderCategory" value="${category || ''}" />
          
          <div id="contentModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitAddFolder()">💾 Create Folder</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit Add Folder
  submitAddFolder() {
    const user = AuthService.getUser();
    const folderName = document.getElementById('folderName').value.trim();
    const targetId = document.getElementById('folderTargetId').value || null;
    const lobbyName = document.getElementById('folderLobbyName').value || null;
    const category = document.getElementById('folderCategory').value || null;
    const errorElem = document.getElementById('contentModalError');

    if (!folderName) {
      errorElem.textContent = 'Please enter folder name';
      return;
    }

    const result = this.addFolder(targetId, folderName, user, lobbyName, category);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeModal();

      // Auto-refresh logic
      if (window.DepartmentsPage && targetId) {
        // Refresh current page/tab if applicable
        const pageName = this.getTabName(targetId)?.toLowerCase().replace(/\s+/g, '') || '';
        if (pageName === 'electricloco') {
          const appContent = document.getElementById('appContent');
          if (appContent) DepartmentsPage.render(appContent, 'electricLoco');
        } else if (targetId.startsWith('division_')) {
          // Handle division tabs
        } else {
          // Try generic refresh
          this.autoRefreshFileList(targetId, 'tab');
        }
      }
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Show Upload File Modal
  showUploadFileModal(targetId, targetType, folderIdOrLobbyName = null, category = null) {
    const user = AuthService.getUser();

    // Check if third parameter is a folder ID or lobby name
    const isFolderId = folderIdOrLobbyName && folderIdOrLobbyName.startsWith('folder_');
    const lobbyName = isFolderId ? null : folderIdOrLobbyName;
    const preselectedFolderId = isFolderId ? folderIdOrLobbyName : null;

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card" style="max-width: 950px; width: 95vw; max-height: 90vh; overflow-y: auto;">
          <!-- Modern Header with Gradient -->
          <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; position: relative;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; backdrop-filter: blur(10px);">
                <span class="material-icons" style="font-size: 32px;">cloud_upload</span>
              </div>
              <div>
                <div class="modal-title" style="font-size: 24px; font-weight: 700; margin: 0;">📤 Upload New File</div>
                <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">
                  ${lobbyName ? `📬 ${lobbyName} Lobby` : (category ? `📂 ${this.getCategoryDisplayName(category)}` : 'Add content to your library')}
                </div>
              </div>
            </div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 18px; cursor: pointer; backdrop-filter: blur(10px); transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✖</button>
          </div>
          
          <!-- Upload Form Content -->
          <div style="padding: 28px;">
            <!-- Storage Warning -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 10px; padding: 16px; margin-bottom: 20px; display: flex; align-items: start; gap: 12px;">
              <span style="font-size: 24px;">⚠️</span>
              <div>
                <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">Storage Limit Notice</div>
                <div style="font-size: 13px; color: #b45309; line-height: 1.5;">
                  Browser storage is limited (~5MB). For large files, use <strong>URL type</strong> (Google Drive, Dropbox links) instead of uploading. This prevents "QuotaExceededError" and keeps the app fast.
                </div>
              </div>
            </div>
            
            <!-- File Title -->
            <div class="form-group" style="margin-bottom: 24px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; margin-bottom: 10px; font-size: 14px;">
                <span class="material-icons" style="font-size: 20px; color: #667eea;">title</span>
                File Title *
              </label>
              <input id="fileName" type="text" placeholder="Enter a descriptive title for your file" 
                     style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; transition: all 0.3s; background: #f8fafc;" 
                     onfocus="this.style.borderColor='#667eea'; this.style.background='white'" 
                     onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'" />
            </div>
            
            ${lobbyName ? `<input type="hidden" id="targetLobby" value="${lobbyName}" />` : ''}
            ${category ? `<input type="hidden" id="fileCategory" value="${category}" />` : ''}
            
            <!-- Folder Selection Row -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; margin-bottom: 10px; font-size: 14px;">
                  <span class="material-icons" style="font-size: 20px; color: #f59e0b;">folder</span>
                  Select Folder *
                </label>
                <select id="fileFolder" style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; background: #f8fafc; cursor: pointer; transition: all 0.3s;" 
                        onchange="ContentManagementService.toggleNewFolderField()"
                        onfocus="this.style.borderColor='#f59e0b'; this.style.background='white'" 
                        onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'">
                  <option value="root">📂 Root / Main Folder</option>
                  <option value="new_folder">➕ Create New Folder</option>
                </select>
              </div>
              
              <div class="form-group" id="newFolderField" style="display: none;">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; margin-bottom: 10px; font-size: 14px;">
                  <span class="material-icons" style="font-size: 20px; color: #10b981;">create_new_folder</span>
                  New Folder Name *
                </label>
                <input id="newFolderName" type="text" placeholder="Enter folder name" 
                       style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; background: #f8fafc; transition: all 0.3s;" 
                       onfocus="this.style.borderColor='#10b981'; this.style.background='white'" 
                       onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'" />
              </div>
            </div>
            
            <!-- Content Type Selection -->
            <div class="form-group" style="margin-bottom: 24px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; margin-bottom: 10px; font-size: 14px;">
                <span class="material-icons" style="font-size: 20px; color: #8b5cf6;">category</span>
                Content Type *
              </label>
              <select id="fileType" onchange="ContentManagementService.updateFileTypeFields()" 
                      style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; background: #f8fafc; cursor: pointer; transition: all 0.3s;"
                      onfocus="this.style.borderColor='#8b5cf6'; this.style.background='white'" 
                      onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'">
                <option value="">🔽 Select Content Type</option>
                <option value="pdf">📄 PDF Document</option>
                <option value="image">🖼️ Image / Photo</option>
                <option value="excel">📊 Excel Spreadsheet</option>
                <option value="url">🔗 URL / Web Link</option>
                <option value="message">💬 Message Card</option>
                <option value="html">🌐 HTML+CSS+JS Content</option>
                <option value="notice">📢 Notice / Announcement</option>
              </select>
            </div>
            
            <!-- Description -->
            <div class="form-group" style="margin-bottom: 24px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; margin-bottom: 10px; font-size: 14px;">
                <span class="material-icons" style="font-size: 20px; color: #64748b;">description</span>
                Description (Optional)
              </label>
              <textarea id="fileDescription" rows="3" placeholder="Add a brief description of this file..." 
                        style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; resize: vertical; font-family: inherit; background: #f8fafc; transition: all 0.3s;"
                        onfocus="this.style.borderColor='#64748b'; this.style.background='white'" 
                        onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'"></textarea>
            </div>
          </div>
          
          <!-- Dynamic File Type Specific Fields -->
          <div id="fileUploadFields" style="padding: 0 28px;"></div>
          
          <!-- Error Message -->
          <div id="contentModalError" class="error-message" style="margin: 0 28px; padding: 12px 16px; background: #fee2e2; color: #dc2626; border-radius: 8px; display: none; font-size: 14px;"></div>
          
          <!-- Modern Action Buttons -->
          <div class="modal-actions" style="padding: 28px; background: #f8fafc; border-radius: 0 0 12px 12px; display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()" 
                    style="padding: 12px 28px; border: 2px solid #e2e8f0; background: white; color: #64748b; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s;"
                    onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#cbd5e1'" 
                    onmouseout="this.style.background='white'; this.style.borderColor='#e2e8f0'">
              ✖ Cancel
            </button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitUploadFile('${targetId}', '${targetType}')" 
                    style="padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.3s;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)'" 
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)'">
              <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 4px;">upload_file</span>
              Upload File
            </button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.loadFolderOptions(targetId, preselectedFolderId);
  },

  // Toggle new folder field
  toggleNewFolderField() {
    const folder = document.getElementById('fileFolder').value;
    const newFolderField = document.getElementById('newFolderField');
    newFolderField.style.display = folder === 'new_folder' ? 'block' : 'none';
  },

  // Update file type fields
  updateFileTypeFields() {
    const fileType = document.getElementById('fileType').value;
    const fieldsContainer = document.getElementById('fileUploadFields');

    let fieldsHTML = '';

    switch (fileType) {
      case 'pdf':
      case 'image':
      case 'excel':
        const fileIcon = fileType === 'pdf' ? 'picture_as_pdf' : fileType === 'image' ? 'image' : 'table_chart';
        const fileColor = fileType === 'pdf' ? '#ef4444' : fileType === 'image' ? '#8b5cf6' : '#10b981';
        const acceptType = fileType === 'pdf' ? '.pdf' : fileType === 'image' ? 'image/*' : '.xlsx,.xls';
        const placeholderExt = fileType === 'pdf' ? 'pdf' : fileType === 'image' ? 'jpg' : 'xlsx';

        fieldsHTML = `
          <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 20px; border: 2px dashed #e2e8f0;">
            <div class="form-group" style="margin-bottom: 20px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; margin-bottom: 10px; font-size: 14px;">
                <span class="material-icons" style="font-size: 20px; color: ${fileColor};">${fileIcon}</span>
                Upload ${fileType.toUpperCase()} File
              </label>
              <div style="position: relative;">
                <input id="fileInput" type="file" accept="${acceptType}" 
                       style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: white; cursor: pointer; transition: all 0.3s;"
                       onfocus="this.style.borderColor='${fileColor}'" 
                       onblur="this.style.borderColor='#e2e8f0'" />
              </div>
            </div>
            
            <div style="text-align: center; margin: 16px 0; color: #94a3b8; font-weight: 600; font-size: 13px;">
              <span style="background: #f8fafc; padding: 0 12px; position: relative; z-index: 1;">— OR —</span>
            </div>
            
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; margin-bottom: 10px; font-size: 14px;">
                <span class="material-icons" style="font-size: 20px; color: #3b82f6;">link</span>
                Enter File URL
              </label>
              <input id="fileUrl" type="url" placeholder="https://example.com/file.${placeholderExt}" 
                     style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; background: white; transition: all 0.3s;"
                     onfocus="this.style.borderColor='#3b82f6'; this.style.background='white'" 
                     onblur="this.style.borderColor='#e2e8f0'" />
            </div>
            
            <div class="form-group" style="margin-top: 16px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; font-size: 14px;">
                <span class="material-icons" style="font-size: 18px; color: #10b981;">download</span>
                Downloadable
              </label>
              <div style="display:flex; align-items:center; gap:8px;">
                <input id="fileDownloadable" type="checkbox" checked style="width: 20px; height: 20px; border: 2px solid #e2e8f0; border-radius: 4px; background: white;">
                <span style="font-size: 12px; color: #64748b;">Allow crew to download this file</span>
              </div>
            </div>
          </div>
        `;
        break;

      case 'url':
        fieldsHTML = `
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 24px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #3b82f6;">
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #1e40af; margin-bottom: 10px; font-size: 14px;">
                <span class="material-icons" style="font-size: 20px; color: #3b82f6;">link</span>
                Website URL *
              </label>
              <input id="fileUrl" type="url" placeholder="https://example.com" 
                     style="width: 100%; padding: 14px 16px; border: 2px solid #93c5fd; border-radius: 10px; font-size: 15px; background: white; transition: all 0.3s;"
                     onfocus="this.style.borderColor='#3b82f6'" 
                     onblur="this.style.borderColor='#93c5fd'" />
              <div style="margin-top: 8px; font-size: 12px; color: #1e40af;">
                <span class="material-icons" style="font-size: 14px; vertical-align: middle;">info</span>
                Enter the complete URL including https://
              </div>
            </div>
          </div>
        `;
        break;

      case 'message':
        fieldsHTML = `
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #f59e0b;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: #92400e;">
              <span class="material-icons" style="font-size: 24px;">mail</span>
              <div style="font-weight: 700; font-size: 16px;">Message Card Details</div>
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #78350f; margin-bottom: 8px; font-size: 14px;">
                <span class="material-icons" style="font-size: 18px;">badge</span>
                Position/Designation (Header) *
              </label>
              <input id="messageHeader" type="text" placeholder="e.g. प्रधान मुख्य विद्युत इंजीनियर<br/> उत्तर पश्चिम रेलवे<br/> जयपुर" 
                     style="width: 100%; padding: 12px 14px; border: 2px solid #fbbf24; border-radius: 8px; font-size: 14px; background: white;" />
              <div style="font-size: 11px; color: #78350f; margin-top: 4px;">
                <span class="material-icons" style="font-size: 12px; vertical-align: middle;">info</span>
                Use &lt;br/&gt; for line breaks in Hindi text
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #78350f; margin-bottom: 8px; font-size: 14px;">
                <span class="material-icons" style="font-size: 18px;">message</span>
                Message Content *
              </label>
              <textarea id="fileMessage" rows="6" placeholder="Enter the full message content in Hindi..." 
                        style="width: 100%; padding: 12px 14px; border: 2px solid #fbbf24; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; background: white;"></textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #78350f; margin-bottom: 8px; font-size: 14px;">
                  <span class="material-icons" style="font-size: 18px;">person</span>
                  Signature Name *
                </label>
                <input id="messageSignatureName" type="text" placeholder="e.g. संजय कुमार गुप्ता" 
                       style="width: 100%; padding: 12px 14px; border: 2px solid #fbbf24; border-radius: 8px; font-size: 14px; background: white;" />
              </div>
              
              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #78350f; margin-bottom: 8px; font-size: 14px;">
                  <span class="material-icons" style="font-size: 18px;">photo_camera</span>
                  Official Photo (Optional)
                </label>
                <input id="messagePhoto" type="file" accept="image/*" 
                       style="width: 100%; padding: 12px 14px; border: 2px solid #fbbf24; border-radius: 8px; font-size: 14px; background: white; cursor: pointer;" />
              </div>
            </div>
            
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #78350f; margin-bottom: 8px; font-size: 14px;">
                <span class="material-icons" style="font-size: 18px;">work</span>
                Signature Title *
              </label>
              <input id="messageSignatureTitle" type="text" placeholder="e.g. प्रधान मुख्य विद्युत इंजीनियर<br/> उत्तर पश्चिम रेलवे" 
                     style="width: 100%; padding: 12px 14px; border: 2px solid #fbbf24; border-radius: 8px; font-size: 14px; background: white;" />
              <div style="font-size: 11px; color: #78350f; margin-top: 4px;">
                <span class="material-icons" style="font-size: 12px; vertical-align: middle;">info</span>
                Use &lt;br/&gt; for line breaks
              </div>
            </div>
          </div>
        `;
        break;

      case 'html':
        fieldsHTML = `
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 24px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #10b981;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: #065f46;">
              <span class="material-icons" style="font-size: 24px;">code</span>
              <div style="font-weight: 700; font-size: 16px;">HTML + CSS + JavaScript</div>
            </div>
            
            <div class="form-group" style="margin-bottom: 18px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #065f46; margin-bottom: 8px; font-size: 14px;">
                <span class="material-icons" style="font-size: 18px; color: #f97316;">html</span>
                HTML Content *
              </label>
              <textarea id="fileHtml" rows="8" placeholder="Enter your HTML code here...\n\nExample:\n<div class='container'>\n  <h1>My Content</h1>\n  <p>Description here...</p>\n</div>" 
                        style="width: 100%; padding: 12px 14px; border: 2px solid #86efac; border-radius: 8px; font-size: 13px; font-family: 'Courier New', monospace; resize: vertical; background: white;"></textarea>
              <div style="font-size: 11px; color: #065f46; margin-top: 6px;">
                <span class="material-icons" style="font-size: 12px; vertical-align: middle;">info</span>
                Write your HTML markup here
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 18px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #065f46; margin-bottom: 8px; font-size: 14px;">
                <span class="material-icons" style="font-size: 18px; color: #3b82f6;">style</span>
                CSS Content (Optional)
              </label>
              <textarea id="fileCss" rows="6" placeholder="Enter your CSS styles here...\n\nExample:\n.container {\n  padding: 20px;\n  background: #f5f5f5;\n}" 
                        style="width: 100%; padding: 12px 14px; border: 2px solid #86efac; border-radius: 8px; font-size: 13px; font-family: 'Courier New', monospace; resize: vertical; background: white;"></textarea>
              <div style="font-size: 11px; color: #065f46; margin-top: 6px;">
                <span class="material-icons" style="font-size: 12px; vertical-align: middle;">info</span>
                Write CSS (plain stylesheet)
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 18px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #065f46; margin-bottom: 8px; font-size: 14px;">
                <span class="material-icons" style="font-size: 18px; color: #eab308;">javascript</span>
                JavaScript Content (Optional)
              </label>
              <textarea id="fileJs" rows="6" placeholder="Enter your JavaScript code here...\n\nExample:\ndocument.querySelector('.btn').addEventListener('click', function() {\n  alert('Hello!');\n});" 
                        style="width: 100%; padding: 12px 14px; border: 2px solid #86efac; border-radius: 8px; font-size: 13px; font-family: 'Courier New', monospace; resize: vertical; background: white;"></textarea>
              <div style="font-size: 11px; color: #065f46; margin-top: 6px;">
                <span class="material-icons" style="font-size: 12px; vertical-align: middle;">info</span>
                Write JavaScript code
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 18px;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #065f46; margin-bottom: 8px; font-size: 14px;">
                <span class="material-icons" style="font-size: 18px; color: #10b981;">table_view</span>
                Display as Table
              </label>
              <div style="display:flex; align-items:center; gap:8px;">
                <input id="displayAsTable" type="checkbox" style="width: 20px; height: 20px; border: 2px solid #86efac; border-radius: 4px; background: white;">
                <span style="font-size: 12px; color: #047857;">Apply table styling to HTML</span>
              </div>
            </div>
            
            <div class="form-group" style="background: white; padding: 18px; border-radius: 10px; border: 2px solid #86efac;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #065f46; font-size: 14px; margin: 0;">
                  <span class="material-icons" style="font-size: 18px; color: #10b981;">visibility</span>
                  Live Preview
                </label>
                <button type="button" class="btn-sm" onclick="ContentManagementService.previewHTML()" 
                        style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); transition: all 0.3s;"
                        onmouseover="this.style.background='#059669'" 
                        onmouseout="this.style.background='#10b981'">
                  <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">refresh</span>
                  Refresh Preview
                </button>
              </div>
              <div id="htmlPreview" style="min-height: 120px; background: #f9fafb; padding: 16px; border-radius: 8px; border: 2px dashed #d1d5db; color: #6b7280;">
                <div style="text-align: center; padding: 20px;">
                  <span class="material-icons" style="font-size: 48px; color: #d1d5db;">code_off</span>
                  <div style="margin-top: 8px; font-size: 13px;">HTML preview will appear here...</div>
                  <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Add HTML content and click "Refresh Preview"</div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'notice':
        fieldsHTML = `
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #f59e0b;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: #92400e;">
              <span class="material-icons" style="font-size: 28px;">campaign</span>
              <div style="font-weight: 700; font-size: 16px;">Notice / Announcement</div>
            </div>
            
            <div style="background: white; padding: 16px; border-radius: 10px; border: 2px solid #fbbf24;">
              <div style="display: flex; align-items: start; gap: 12px;">
                <span class="material-icons" style="font-size: 24px; color: #f59e0b;">info</span>
                <div>
                  <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">No File Required</div>
                  <div style="font-size: 13px; color: #b45309; line-height: 1.5;">
                    This notice will be created with just the title and description. Use the Description field above to enter your notice content. No file attachment is needed.
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
    }

    fieldsContainer.innerHTML = fieldsHTML;
  },

  // Preview HTML Content
  previewHTML() {
    const html = document.getElementById('fileHtml')?.value || '';
    const css = document.getElementById('fileCss')?.value || '';
    const js = document.getElementById('fileJs')?.value || '';
    const preview = document.getElementById('htmlPreview');

    if (!preview) return;

    if (!html.trim()) {
      preview.innerHTML = '<div style="color: #999; font-style: italic;">No HTML content to preview</div>';
      return;
    }

    // Build complete HTML document for sandboxed iframe
    const fullContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
/* Reset to prevent interference with parent */
html, body { margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; padding: 10px; }
${css}
</style>
</head>
<body>
${html}
${js ? `<script>${js}<\/script>` : ''}
</body>
</html>`;

    const blob = new Blob([fullContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    preview.innerHTML = `<iframe src="${url}" sandbox="allow-scripts" style="width: 100%; height: 300px; border: 1px solid #e5e7eb; border-radius: 8px;"></iframe>`;
  },

  // Load folder options
  loadFolderOptions(targetId, preselectedFolderId = null) {
    const structure = this.getContentStructure();
    const folderSelect = document.getElementById('fileFolder');
    if (!folderSelect) return;

    let options = '<option value="root">Root / Main Folder</option>';

    // Get folders for this target
    const folders = Object.values(structure.folders).filter(f => f.targetId === targetId || !f.targetId);

    folders.forEach(folder => {
      const selected = folder.id === preselectedFolderId ? ' selected' : '';
      options += `<option value="${folder.id}"${selected}>${folder.name}</option>`;
    });

    options += '<option value="new_folder">+ Create New Folder</option>';

    folderSelect.innerHTML = options;
  },

  // Submit Upload File
  async submitUploadFile(targetId, targetType) {
    const user = AuthService.getUser();
    const fileName = document.getElementById('fileName').value.trim();
    const fileType = document.getElementById('fileType').value;
    let folder = document.getElementById('fileFolder')?.value || 'root';
    const description = document.getElementById('fileDescription')?.value.trim() || '';
    const errorElem = document.getElementById('contentModalError');
    const category = document.getElementById('fileCategory')?.value || null;

    // Clear previous error
    errorElem.style.display = 'none';
    errorElem.textContent = '';

    if (!fileName || !fileType) {
      errorElem.textContent = '⚠️ Please fill all required fields (File Title and Content Type)';
      errorElem.style.display = 'block';
      errorElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Handle new folder creation
    if (folder === 'new_folder') {
      const newFolderName = document.getElementById('newFolderName')?.value.trim();
      if (!newFolderName) {
        errorElem.textContent = 'Please enter new folder name';
        return;
      }
      // Create the folder with lobby info if applicable
      const targetLobby = document.getElementById('targetLobby')?.value;
      const folderResult = this.addFolder(targetId, newFolderName, user, targetLobby);
      if (folderResult.success) {
        folder = folderResult.folderId;
      } else {
        errorElem.textContent = folderResult.message;
        return;
      }
    }

    let fileData = {
      name: fileName,
      type: fileType,
      folder: folder,
      description: description,
      content: null,
      url: null,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.name || user.cms,
      category: category // Add category to file data
    };

    // Add lobby info if uploading to a lobby
    const targetLobby = document.getElementById('targetLobby')?.value;
    if (targetLobby) {
      fileData.lobby = targetLobby;
    }

    // Get content based on type
    switch (fileType) {
      case 'pdf':
      case 'image':
      case 'excel':
        const fileInput = document.getElementById('fileInput');
        const fileUrl = document.getElementById('fileUrl').value.trim();
        const downloadableInput = document.getElementById('fileDownloadable');
        fileData.downloadable = downloadableInput ? downloadableInput.checked : true;

        if (fileInput && fileInput.files[0]) {
          // File upload - pass the actual File object for server upload
          const file = fileInput.files[0];
          fileData.file = file; // Pass the File object for server upload
          fileData.content = file.name;
          fileData.size = file.size;
        } else if (fileUrl) {
          // URL provided
          fileData.url = fileUrl;
        } else {
          errorElem.textContent = 'Please select a file or enter a URL';
          return;
        }
        break;

      case 'url':
        const url = document.getElementById('fileUrl').value.trim();
        if (!url) {
          errorElem.textContent = 'Please enter URL';
          return;
        }
        fileData.url = url;
        break;

      case 'message':
        const messageHeader = document.getElementById('messageHeader')?.value.trim();
        const messageContent = document.getElementById('fileMessage').value.trim();
        const signatureName = document.getElementById('messageSignatureName')?.value.trim();
        const signatureTitle = document.getElementById('messageSignatureTitle')?.value.trim();
        const photoInput = document.getElementById('messagePhoto');

        if (!messageContent) {
          errorElem.textContent = 'Please enter message content';
          errorElem.style.display = 'block';
          return;
        }

        // Handle photo upload if provided
        let photoDataUrl = null;
        if (photoInput && photoInput.files && photoInput.files[0]) {
          try {
            const photoFile = photoInput.files[0];
            const reader = new FileReader();
            photoDataUrl = await new Promise((resolve, reject) => {
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = reject;
              reader.readAsDataURL(photoFile);
            });
          } catch (error) {
            console.warn('Error reading photo:', error);
          }
        }

        fileData.content = {
          header: messageHeader || '',
          message: messageContent,
          signatureName: signatureName || '',
          signatureTitle: signatureTitle || '',
          photo: photoDataUrl
        };
        break;

      case 'html':
        const html = document.getElementById('fileHtml').value.trim();
        if (!html) {
          errorElem.textContent = 'Please enter HTML content';
          return;
        }
        const displayAsTable = document.getElementById('displayAsTable')?.checked || false;
        fileData.content = {
          html: html,
          css: document.getElementById('fileCss').value.trim(),
          js: document.getElementById('fileJs').value.trim(),
          displayAsTable: displayAsTable
        };
        break;

      case 'notice':
        // Notice only requires title and description - no additional content needed
        // The description field (fileDescription) is already captured above
        fileData.content = {};
        break;
    }

    // Get submit button and disable it to prevent double-clicks
    const submitBtn = document.querySelector('#uploadFileForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading...';
    }

    // Close modal immediately to prevent user from clicking again
    this.closeModal();

    // Show uploading notification
    showNotification('📤 Uploading file...', 'info', 1000);

    try {
      const result = await this.uploadFile(targetId || 'root', fileData, user);

      if (result.success) {
        // Show success notification
        showNotification(`✅ ${result.message}`, 'success', 1000);

        // INSTANT UPDATE: Add file to UI immediately
        if (result.file) {
          // Add to local structure first
          this.saveFileMetadata(targetId, {
            id: 'server_' + result.file.id,
            name: result.file.title || result.file.name,
            type: result.file.file_type,
            description: result.file.description || '',
            content: result.file.content,
            url: result.file.url,
            uploadedBy: result.file.uploaded_by_name,
            uploadedAt: result.file.uploaded_at,
            division: result.file.division_name,
            lobby: result.file.lobby_name,
            section: result.file.section,
            category: result.file.category,
            server_file_id: result.file.id,
            isFromServer: true
          });

          // Instantly render the file
          this.instantlyRenderNewFile(targetId, result.file);
        }

        // Background sync
        setTimeout(() => {
          this.fetchAndSyncFiles(targetId);
        }, 1000);
      } else {
        errorElem.textContent = result.message;
        errorElem.style.display = 'block';
        errorElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      errorElem.textContent = 'Upload failed: ' + error.message;
      errorElem.style.display = 'block';
      errorElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  // Instantly render a newly uploaded file to the current view
  instantlyRenderNewFile(targetId, file) {
    console.log('[ContentManagement] Instantly rendering new file:', file);

    // Check if we're on the files page
    const filesPage = document.getElementById('filesPage');
    if (filesPage) {
      // Determine file type and render accordingly
      const fileType = file.file_type || file.type;

      if (fileType === 'message') {
        this.renderInstantMessageCard(filesPage, file);
      } else if (fileType === 'html') {
        this.renderInstantHtmlContent(filesPage, file);
      } else if (fileType === 'notice') {
        this.renderInstantNoticeCard(filesPage, file);
      } else {
        this.renderInstantFileCard(filesPage, file);
      }

      // Update file count
      this.updateInstantFileCount(filesPage);
      return;
    }

    // Check if we're on a main tab page (mainContent with main tab content)
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      // Check if this is a main tab page by looking for main tab specific elements
      // Main tabs have upload buttons for admins and don't have back buttons to division
      const isMainTab = mainContent.querySelector('[data-main-tab="true"]') ||
        mainContent.innerHTML.includes('data-main-tab');
      const hasMainTabUpload = mainContent.querySelector('button[onclick*="showUploadFileModal"]') &&
        !mainContent.querySelector('button[onclick*="loadDivisionDetails"]');

      // Also check if the targetId matches a main tab
      const structure = this.getContentStructure();
      const isTargetMainTab = structure.mainTabs.some(t => t.id === targetId);

      if (isMainTab || hasMainTabUpload || isTargetMainTab) {
        console.log('[ContentManagement] Rendering file on main tab page, targetId:', targetId, 'file:', file);
        try {
          this.renderInstantMainTabFile(mainContent, file);
          console.log('[ContentManagement] File rendered successfully on main tab');
        } catch (err) {
          console.error('[ContentManagement] Error rendering file on main tab:', err);
        }
        return;
      } else {
        console.log('[ContentManagement] Not a main tab page - isMainTab:', isMainTab, 'hasMainTabUpload:', hasMainTabUpload, 'isTargetMainTab:', isTargetMainTab);
      }
    }

    // Check if we're on division/department page (divisionContent)
    const divisionContent = document.getElementById('divisionContent');
    if (divisionContent) {
      this.renderInstantDivisionFile(divisionContent, file);
      return;
    }

    // Check if we're on a division tab page (mainContent with tab files)
    // mainContent is already declared above, reuse it
    if (mainContent) {
      // Check if this is a tab page by looking for tab-specific elements
      const tabTitle = mainContent.querySelector('.card-title');
      const backButton = mainContent.querySelector('button[onclick*="loadDivisionDetails"]');
      if (tabTitle && backButton) {
        console.log('[ContentManagement] Rendering file on division tab page (mainContent)');
        this.renderInstantDivisionFile(mainContent, file);
        return;
      }
    }

    // Check if we're on a division tab page (appContent)
    const appContent = document.getElementById('appContent');
    if (appContent) {
      // Check if this is a tab page by looking for tab-specific elements
      const tabTitle = appContent.querySelector('.card-title');
      const backButton = appContent.querySelector('button[onclick*="loadDivisionDetails"]');
      if (tabTitle && backButton) {
        console.log('[ContentManagement] Rendering file on division tab page (appContent)');
        this.renderInstantDivisionFile(appContent, file);
        return;
      }
    }

    // Check if we're in a modal showing files
    const modalContent = document.querySelector('#contentModal .modal-card');
    if (modalContent && modalContent.textContent.includes('Files')) {
      // Refresh the modal content
      const titleMatch = modalContent.querySelector('.modal-title')?.textContent?.match(/📂 (.+?) - Files/);
      if (titleMatch && window.FilesPage) {
        this.closeModal();
        setTimeout(() => {
          window.FilesPage.render(targetId, titleMatch[1], file.lobby_name);
        }, 100);
      }
      return;
    }

    console.log('[ContentManagement] File uploaded, view updated');
  },

  // Render message card instantly
  renderInstantMessageCard(container, file) {
    let messageContainer = container.querySelector('.message-cards-container');
    if (!messageContainer) {
      // Create container after the header
      const header = container.querySelector('.page-title')?.parentElement?.parentElement;
      messageContainer = document.createElement('div');
      messageContainer.className = 'message-cards-container';
      messageContainer.style.cssText = 'margin-bottom: 24px;';
      if (header && header.nextSibling) {
        container.insertBefore(messageContainer, header.nextSibling);
      } else {
        container.appendChild(messageContainer);
      }
    }

    const content = file.content || {};
    const cardId = `instant_file_${file.id}`;

    const html = `
      <div id="${cardId}" class="message-card-display" data-file-id="server_${file.id}" data-server-file-id="${file.id}"
           style="background: #ffffff; border-radius: 20px; overflow: hidden; position: relative; border-top: 6px solid #003366; 
                  box-shadow: 0 15px 35px rgba(0, 51, 102, 0.15); margin-bottom: 24px; animation: slideInDown 0.4s ease-out;">
        <div class="message-card-header" style="background: #fff; padding: 25px 30px; border-bottom: 1px solid #f0f0f0;">
          ${content.header ? `<div style="font-size: 18px; font-weight: 700; color: #003366; margin-bottom: 10px;">${content.header}</div>` : ''}
          <div style="font-size: 15px; line-height: 1.7; color: #444;">${content.message || ''}</div>
        </div>
        ${content.photo ? `<div style="padding: 20px; text-align: center;"><img src="${content.photo}" style="max-width: 100%; max-height: 300px; border-radius: 8px;"></div>` : ''}
        ${content.signatureName ? `
        <div style="padding: 20px 30px; background: #f8f9fa; border-top: 1px solid #e9ecef;">
          <div style="font-weight: 600; color: #003366;">${content.signatureName}</div>
          ${content.signatureTitle ? `<div style="font-size: 13px; color: #666;">${content.signatureTitle}</div>` : ''}
        </div>` : ''}
        <div style="padding: 10px 30px; background: #e3f2fd; display: flex; justify-content: space-between; align-items: center;">
          <span style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 12px;">NEW</span>
          <span style="font-size: 12px; color: #666;">Just now • ${file.uploaded_by_name || 'Admin'}</span>
        </div>
      </div>
    `;

    messageContainer.insertAdjacentHTML('afterbegin', html);
  },

  // Render HTML content instantly
  renderInstantHtmlContent(container, file) {
    let htmlContainer = container.querySelector('.html-content-container');
    if (!htmlContainer) {
      const header = container.querySelector('.page-title')?.parentElement?.parentElement;
      htmlContainer = document.createElement('div');
      htmlContainer.className = 'html-content-container';
      htmlContainer.style.cssText = 'margin-bottom: 24px;';
      if (header && header.nextSibling) {
        container.insertBefore(htmlContainer, header.nextSibling);
      } else {
        container.appendChild(htmlContainer);
      }
    }

    const content = file.content || {};
    const cardId = `instant_file_${file.id}`;

    // Build complete HTML document for sandboxed iframe
    const css = content.css || '';
    const html = content.html || '<div style="text-align: center; color: #999; padding: 40px;">No HTML content</div>';
    const js = content.js || '';

    const fullContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
/* Reset to prevent interference with parent */
html, body { margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; }
${css}
</style>
</head>
<body>
${html}
${js ? `<script>${js}<\/script>` : ''}
</body>
</html>`;

    const blob = new Blob([fullContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const uniqueId = 'instant-html-' + cardId;
    const cardHTML = `
      <div id="${cardId}" class="html-content-native" data-file-id="server_${file.id}" data-server-file-id="${file.id}" 
           style="margin-bottom: 32px; animation: slideInDown 0.4s ease-out; width: 100%;">
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 12px; padding: 0 8px;">
          <div>
            <span style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 12px; margin-right: 8px;">NEW</span>
            <span style="font-size: 12px; color: #666;">Just now</span>
          </div>
        </div>
        <div id="${uniqueId}" class="html-render-container" style="width: 100%; overflow: visible;"
             data-css="${encodeURIComponent(css)}" 
             data-html="${encodeURIComponent(html)}" 
             data-js="${encodeURIComponent(js)}">
        </div>
      </div>
    `;

    htmlContainer.insertAdjacentHTML('afterbegin', cardHTML);

    // Initialize HTML content using iframe for perfect isolation
    setTimeout(() => {
      const container = document.getElementById(uniqueId);
      if (!container || container.dataset.rendered) return;
      container.dataset.rendered = 'true';

      const uniqueId = 'html-content-' + Math.random().toString(36).substr(2, 9);

      // Build complete HTML document for iframe - NO SCROLLBAR
      const fullContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="${window.location.origin}${window.Api?.getBaseUrl()?.replace('/api', '') || ''}/">
<style>
html, body { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }
body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; padding-bottom: 20px; word-wrap: break-word; }
img, table, video, canvas, iframe { max-width: 100% !important; height: auto !important; }
table { width: 100% !important; border-collapse: collapse; }
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
      iframe.style.cssText = 'width: 100%; min-height: 100px; border: none; display: block;';
      iframe.scrolling = 'no';
      iframe.frameBorder = '0';

      // Use Blob URL
      const blob = new Blob([fullContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframe.src = url;

      const messageHandler = (event) => {
        if (event.data && event.data.type === 'iframe-resize' && event.data.id === uniqueId) {
          const newHeight = event.data.height + 5;
          if (newHeight > 50) {
            iframe.style.height = newHeight + 'px';
          }
        }
      };
      window.addEventListener('message', messageHandler);

      iframe.onload = () => {
        const resize = () => {
          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            const height = doc.body.scrollHeight;
            if (height > 50) {
              iframe.style.height = (height + 5) + 'px';
            }
          } catch (e) { }
        };
        [100, 300, 500, 1000].forEach(delay => setTimeout(resize, delay));
      };

      container.innerHTML = '';
      container.appendChild(iframe);
    }, 0);
  },

  // Render notice card instantly
  renderInstantNoticeCard(container, file) {
    let noticesContainer = container.querySelector('.notices-container');
    if (!noticesContainer) {
      // Try to find the files section or create one
      const existingSection = container.querySelector('.card:last-child') || container;
      noticesContainer = document.createElement('div');
      noticesContainer.className = 'notices-container';
      noticesContainer.style.cssText = 'display: flex; flex-direction: column; gap: 16px; margin-top: 20px;';
      existingSection.appendChild(noticesContainer);
    }

    const cardId = `instant_notice_${file.id}`;

    const html = `
      <div id="${cardId}" class="notice-card" data-file-id="server_${file.id}" data-server-file-id="${file.id}" 
           style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; transition: all 0.3s; animation: slideInDown 0.4s ease-out;">
        <div style="display: flex; align-items: start; gap: 16px;">
          <div style="font-size: 40px; flex-shrink: 0;">📢</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; color: #92400e; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              ${file.title || file.name}
              <span style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">NEW</span>
            </div>
            ${file.description ? `<div style="font-size: 14px; color: #78350f; line-height: 1.6; white-space: pre-wrap; background: rgba(255,255,255,0.5); padding: 12px; border-radius: 8px;">${file.description}</div>` : ''}
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; align-items: center;">
              <span style="font-size: 11px; color: #92400e; background: rgba(255,255,255,0.6); padding: 4px 10px; border-radius: 12px;">
                <span class="material-icons" style="font-size: 12px; vertical-align: middle; margin-right: 4px;">schedule</span>
                Just now
              </span>
              <span style="font-size: 11px; color: #92400e; background: rgba(255,255,255,0.6); padding: 4px 10px; border-radius: 12px;">
                <span class="material-icons" style="font-size: 12px; vertical-align: middle; margin-right: 4px;">campaign</span>
                Notice
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    noticesContainer.insertAdjacentHTML('afterbegin', html);
  },

  // Render file card instantly
  renderInstantFileCard(container, file) {
    let filesContainer = container.querySelector('.files-grid-container');
    if (!filesContainer) {
      // Try to find the files section or create one
      const existingSection = container.querySelector('.card:last-child') || container;
      filesContainer = document.createElement('div');
      filesContainer.className = 'files-grid-container';
      filesContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 20px;';
      existingSection.appendChild(filesContainer);
    }

    const fileType = file.file_type || file.type;
    let icon = '📄';
    if (fileType === 'pdf') icon = '📕';
    else if (fileType === 'image') icon = '🖼️';
    else if (fileType === 'excel') icon = '📊';
    else if (fileType === 'url') icon = '🔗';

    const fileUrl = file.url || (file.name ? `./uploads/${file.name}` : null);
    const cardId = `instant_file_${file.id}`;

    const html = `
      <div id="${cardId}" class="file-card" data-file-id="server_${file.id}" data-server-file-id="${file.id}" 
           style="background: white; border: 2px solid #667eea; border-radius: 12px; padding: 20px; transition: all 0.3s; animation: slideInDown 0.4s ease-out;">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="font-size: 40px;">${icon}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; color: #333; font-size: 14px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
              ${file.title || file.name}
              <span style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">NEW</span>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${file.description || ''}</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${fileUrl ? `<a href="${fileUrl}" target="_blank" class="btn-sm" style="text-decoration: none; background: #667eea; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px;">View</a>` : ''}
              <span style="font-size: 11px; color: #999;">Just now</span>
            </div>
          </div>
        </div>
      </div>
    `;

    filesContainer.insertAdjacentHTML('afterbegin', html);
  },

  // Update file count display instantly
  updateInstantFileCount(container) {
    const countEl = container.querySelector('.muted');
    if (countEl) {
      const allFiles = container.querySelectorAll('[data-file-id]');
      const count = allFiles.length;
      countEl.textContent = `${count} file${count !== 1 ? 's' : ''} uploaded`;
    }
  },

  // Instantly remove file from UI with animation
  instantlyRemoveFileFromUI(fileId) {
    console.log('[ContentManagement] Instantly removing file from UI:', fileId);

    // Try multiple selectors to find the file element
    const selectors = [
      `[data-file-id="${fileId}"]`,
      `[data-server-file-id="${fileId}"]`,
      `[data-file-id="server_${fileId}"]`,
      `#instant_file_${fileId}`,
      `#file_${fileId}`
    ];

    let removed = false;
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Add deletion animation
        el.style.animation = 'fadeOutUp 0.3s ease-out forwards';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-30px)';
        el.style.transition = 'all 0.3s ease-out';

        setTimeout(() => {
          el.remove();
          // Update file count on division page
          this.updateDivisionFileCount();
        }, 300);
        removed = true;
      });
    });

    if (removed) {
      console.log('[ContentManagement] File removed from UI');
    } else {
      console.log('[ContentManagement] File element not found for:', fileId);
    }
  },

  // Update file count on division page
  updateDivisionFileCount() {
    // Try multiple containers
    const containers = [
      document.getElementById('divisionContent'),
      document.getElementById('appContent'),
      document.getElementById('mainContent')
    ].filter(c => c !== null);

    for (const container of containers) {
      // Find all file cards
      const currentFiles = container.querySelectorAll('[data-file-id], [data-server-file-id]');
      const count = currentFiles.length;

      // Update the title - look for h3 with "Files" text
      const titleEl = container.querySelector('h3.card-title, .card-title');
      if (titleEl && titleEl.textContent.includes('Files')) {
        titleEl.textContent = `📄 Files (${count})`;
      }

      // If no files left, show empty message
      if (count === 0) {
        const filesContainer = container.querySelector('.files-list') ||
          container.querySelector('.card > div[style*="display: grid"]') ||
          container.querySelector('.card > div:last-child');
        if (filesContainer) {
          filesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
              <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
              <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No files uploaded yet</div>
              <div style="font-size: 13px;">Upload files to share with your team</div>
            </div>
          `;
        }
      }

      console.log('[ContentManagement] File count updated for', container.id, ':', count);
    }

    // Also try files page
    const filesPage = document.getElementById('filesPage');
    if (filesPage) {
      const currentFiles = filesPage.querySelectorAll('[data-file-id], [data-server-file-id]');
      const count = currentFiles.length;

      const countEl = filesPage.querySelector('.muted');
      if (countEl) {
        countEl.textContent = `${count} file${count !== 1 ? 's' : ''} uploaded`;
      }
    }
  },

  // Track file view to remove "New" tag
  async trackFileView(file) {
    const user = AuthService.getUser();
    if (!user || !file.server_file_id) return;

    try {
      // Remove "New" badge from UI immediately
      this.removeNewBadge(file.id);
      this.removeNewBadge('server_' + file.server_file_id);

      // Send view tracking to server
      // Re‑use the API service base URL detection so this works
      // correctly both on XAMPP and on your hosting
      const baseUrl = (typeof Api !== 'undefined' && typeof Api.getBaseUrl === 'function')
        ? Api.getBaseUrl()
        : '/api';

      const response = await fetch(`${baseUrl}/file_api/view_file.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: file.server_file_id,
          user_id: user.id || user.cms
        })
      });

      const result = await response.json();
      console.log('[ContentManagement] File view tracked:', result);

      // Also update notification counters so "NEW" indicators
      // and file badges stay in sync for this user
      if (window.NotificationService && typeof NotificationService.markFileAsViewed === 'function') {
        NotificationService.markFileAsViewed(file.server_file_id);
      }

    } catch (error) {
      console.error('[ContentManagement] Error tracking file view:', error);
    }
  },

  // Remove "New" badge from file element
  removeNewBadge(fileId) {
    const selectors = [
      `[data-file-id="${fileId}"] .new-badge`,
      `[data-server-file-id="${fileId}"] .new-badge`,
      `#instant_file_${fileId} .new-badge`
    ];

    selectors.forEach(selector => {
      const badges = document.querySelectorAll(selector);
      badges.forEach(badge => {
        badge.style.transition = 'opacity 0.3s ease-out';
        badge.style.opacity = '0';
        setTimeout(() => badge.remove(), 300);
      });
    });
  },

  // Render file instantly on division page
  renderInstantDivisionFile(container, file) {
    console.log('[ContentManagement] Rendering instant file on division page:', file);

    // Check if file is new (uploaded within last 24 hours)
    const isNew = file.is_new !== false;
    const newBadge = isNew ? `<span class="new-badge" style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-left: 8px;">NEW</span>` : '';

    // Find the files section
    let filesSection = container.querySelector('.card');
    let filesContainer = container.querySelector('.card > div[style*="display: grid; gap: 12px"]');

    // If no files container exists, create one
    if (!filesContainer) {
      // Check if there's a "No files" message
      const noFilesMsg = container.querySelector('p');
      if (noFilesMsg && noFilesMsg.textContent.includes('No files')) {
        noFilesMsg.remove();
      }

      // Create the files section
      filesSection = document.createElement('div');
      filesSection.className = 'card';
      filesSection.style.cssText = 'margin-top: 24px;';
      filesSection.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="card-title" style="margin: 0;">📄 Files (1)</h3>
        </div>
        <div class="files-list" style="display: grid; gap: 12px;"></div>
      `;
      container.appendChild(filesSection);
      filesContainer = filesSection.querySelector('.files-list');
    } else {
      // Update the file count in the title
      const titleEl = filesSection?.querySelector('.card-title');
      if (titleEl) {
        const currentCount = parseInt(titleEl.textContent.match(/\d+/)?.[0] || '0');
        titleEl.textContent = `📄 Files (${currentCount + 1})`;
      }
    }

    const fileType = file.file_type || file.type;
    const fileIcon = {
      'pdf': '📄',
      'image': '🖼️',
      'excel': '📊',
      'url': '🔗',
      'html': '🌐'
    }[fileType] || '📁';

    const fileColor = {
      'pdf': '#dc2626',
      'image': '#7c3aed',
      'excel': '#059669',
      'url': '#0891b2',
      'html': '#ea580c'
    }[fileType] || '#6b7280';

    const fileUrl = file.url || (file.name ? `./uploads/${file.name}` : null);
    const cardId = `instant_file_${file.id}`;

    const html = `
      <div id="${cardId}" data-file-id="server_${file.id}" data-server-file-id="${file.id}"
           style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%); 
                  border: 2px solid #667eea; border-radius: 12px; padding: 16px; transition: all 0.3s ease;
                  animation: slideInDown 0.4s ease-out;">
        <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center;">
          <!-- File Icon & Number -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: ${fileColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              ${fileIcon}
            </div>
            <div style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px;">
              NEW
            </div>
          </div>
                  
          <!-- File Info -->
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${file.title || file.name || 'Untitled Document'}
              </h4>
              <span style="background: ${fileColor}; color: white; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                ${fileType || 'file'}
              </span>
            </div>
                              
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
              ${file.description ? `
              <p style="margin: 0; font-size: 13px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; max-width: 500px;">
                ${file.description.substring(0, 80)}${file.description.length > 80 ? '...' : ''}
              </p>
              ` : ''}
                            
              <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);">
                <span>📅</span>
                <span>Just now</span>
              </div>
            </div>
          </div>
                  
          <!-- Actions -->
          <div style="display: flex; gap: 8px;">
            ${fileUrl ? `
            <a href="${fileUrl}" target="_blank" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
              View
            </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    filesContainer.insertAdjacentHTML('afterbegin', html);
  },

  // Render file instantly on main tab page
  renderInstantMainTabFile(container, file) {
    console.log('[ContentManagement] Rendering instant file on main tab page:', file);

    // Check if file is new (uploaded within last 24 hours)
    const isNew = file.is_new !== false;

    // Find the files section or create one
    let filesSection = container.querySelector('.files-section');
    let filesContainer = container.querySelector('.files-list');

    // If no files container exists, look for existing file cards
    if (!filesContainer) {
      // Check if there's a "No files" message
      const noFilesMsg = container.querySelector('p.muted');
      if (noFilesMsg && noFilesMsg.textContent.includes('No files')) {
        noFilesMsg.remove();
      }

      // Create the files section - append to container directly
      filesSection = document.createElement('div');
      filesSection.className = 'files-section card';
      filesSection.style.cssText = 'margin-top: 24px; padding: 20px;';
      filesSection.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="card-title" style="margin: 0;">📄 Files (1)</h3>
        </div>
        <div class="files-list" style="display: grid; gap: 12px;"></div>
      `;

      // Append to the end of container
      container.appendChild(filesSection);
      filesContainer = filesSection.querySelector('.files-list');
      console.log('[ContentManagement] Created new files section for main tab');
    } else {
      // Update the file count in the title
      const titleEl = filesSection?.querySelector('.card-title');
      if (titleEl) {
        const currentCount = parseInt(titleEl.textContent.match(/\d+/)?.[0] || '0');
        titleEl.textContent = `📄 Files (${currentCount + 1})`;
      }
    }

    const fileType = file.file_type || file.type;
    const fileIcon = {
      'pdf': '📄',
      'image': '🖼️',
      'excel': '📊',
      'url': '🔗',
      'html': '🌐'
    }[fileType] || '📁';

    const fileColor = {
      'pdf': '#dc2626',
      'image': '#7c3aed',
      'excel': '#059669',
      'url': '#0891b2',
      'html': '#ea580c'
    }[fileType] || '#6b7280';

    const fileUrl = file.url || (file.name ? `./uploads/${file.name}` : null);
    const cardId = `instant_file_${file.id}`;

    const html = `
      <div id="${cardId}" data-file-id="server_${file.id}" data-server-file-id="${file.id}"
           style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%); 
                  border: 2px solid #667eea; border-radius: 12px; padding: 16px; transition: all 0.3s ease;
                  animation: slideInDown 0.4s ease-out;">
        <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center;">
          <!-- File Icon & NEW Badge -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: ${fileColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              ${fileIcon}
            </div>
            <div style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px;">
              NEW
            </div>
          </div>
                  
          <!-- File Info -->
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${file.title || file.name || 'Untitled Document'}
              </h4>
              <span style="background: ${fileColor}; color: white; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                ${fileType || 'file'}
              </span>
            </div>
                              
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
              ${file.description ? `
              <p style="margin: 0; font-size: 13px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; max-width: 500px;">
                ${file.description.substring(0, 80)}${file.description.length > 80 ? '...' : ''}
              </p>
              ` : ''}
                            
              <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);">
                <span>📅</span>
                <span>Just now</span>
              </div>
            </div>
          </div>
                  
          <!-- Actions -->
          <div style="display: flex; gap: 8px;">
            ${fileUrl ? `
            <a href="${fileUrl}" target="_blank" 
               style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s;">
              <span>👁️</span>
              <span>View</span>
            </a>
            ` : ''}
            ${fileUrl ? `
            <a href="${fileUrl}" download 
               style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s;">
              <span>⬇️</span>
              <span>Download</span>
            </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    filesContainer.insertAdjacentHTML('afterbegin', html);
  },

  // Auto-refresh file list after upload/delete
  async autoRefreshFileList(targetId, targetType) {
    // Force sync from server first
    await this.fetchAndSyncFiles(targetId);

    // Check if we're on the files page
    const filesPage = document.getElementById('filesPage');
    if (filesPage && window.FilesPage && window.FilesPage.currentTabId) {
      await window.FilesPage.render(window.FilesPage.currentTabId, window.FilesPage.currentTabName, window.FilesPage.currentLobby);
      return;
    }

    // Check if we're in a modal viewing files
    const currentModal = document.querySelector('#contentModal .modal-title');
    if (currentModal && currentModal.textContent.includes('Files')) {
      const titleMatch = currentModal.textContent.match(/📂 (.+?) - Files/);
      if (titleMatch) {
        setTimeout(() => this.showFilesList(targetId, titleMatch[1]), 100);
        return;
      }
    }

    // Check if we're in division/departments page
    const divisionContent = document.getElementById('divisionContent');
    if (divisionContent) {
      const user = AuthService.getUser();
      const tabDivision = this.getDivisionNameFromTab(targetId) || user.division;
      if (tabDivision && window.DepartmentsPage) {
        DepartmentsPage.loadDivisionDetails(tabDivision);
        return;
      }
    }

    // Check main content area for departments page
    const mainContent = document.getElementById('mainContent');
    if (mainContent && mainContent.querySelector('.division-card')) {
      // We're on main page, trigger division reload if applicable
      const tabDivision = this.getDivisionNameFromTab(targetId);
      if (tabDivision && window.DepartmentsPage) {
        // This is a division tab, reload that division
        DepartmentsPage.loadDivisionDetails(tabDivision);
      }
    }

    // Check if we are on Departments Page (like Electric Loco)
    const appContent = document.getElementById('appContent');
    if (appContent && window.DepartmentsPage) {
      // Check for Electric Loco
      if (document.getElementById('loco-content-wag12')) {
        DepartmentsPage.render(appContent, 'electricLoco');
        return;
      }
      // Check for other static department pages
      const pageTitle = document.querySelector('.page-title');
      if (pageTitle) {
        const title = pageTitle.textContent;
        const pageMap = {
          'Electric Locomotives': 'electricLoco',
          'Diesel Locomotives': 'dieselLoco',
          'Vande Bharat Express': 'vandeBharat',
          'Traffic Department': 'traffic',
          'Overhead Equipment (OHE)': 'ohe',
          'Carriage & Wagon (C&W)': 'cw',
          'Permanent Way (P-Way)': 'pway',
          'SPAD Prevention': 'spad',
          'Indian Railway Rule Books': 'ruleBooks',
          'GM Messages': 'gmMessage',
          'PCEE Messages': 'pceeMessage'
        };
        if (pageMap[title]) {
          DepartmentsPage.render(appContent, pageMap[title]);
          return;
        }
      }
    }
  },

  // Remove modal
  removeModal() {
    const modal = document.getElementById('contentModal');
    if (modal) {
      modal.remove();
    }
  },

  // Close modal
  closeModal() {
    this.removeModal();
    const viewer = document.getElementById('fileViewerModal');
    if (viewer) {
      viewer.remove();
    }
    if (this._fileViewerPopHandler) {
      window.removeEventListener('popstate', this._fileViewerPopHandler);
      this._fileViewerPopHandler = null;
    }
    // Note: We don't call history.back() here anymore because:
    // 1. If user clicked the close button, we just want to close the modal
    // 2. If user pressed back button, popstate handler will manage the history
    // Calling history.back() here was causing double navigation issues
  },

  // Show Files List
  async showFilesList(targetId, targetName) {
    const user = AuthService.getUser();

    // Sync files from server
    await this.fetchAndSyncFiles(targetId);

    const structure = this.getContentStructure();
    const files = structure.files[targetId] || [];
    const folders = Object.values(structure.folders).filter(f => f.targetId === targetId);

    // Check if user can upload/manage files (based on division)
    const tabDivision = this.getDivisionNameFromTab(targetId);
    const canManageFiles = PermissionsService.canUploadFile(user, tabDivision, null);

    // Push state for back button support
    try {
      history.pushState({ modal: 'contentModal', timestamp: Date.now() }, '');
    } catch (e) { }

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card" style="max-width: 1200px; width: 95vw;">
          <div class="modal-header">
            <div class="modal-title">📂 ${targetName} - Files & Folders</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          ${canManageFiles ? `
          <div style="margin-bottom: 20px;">
            <button class="btn-sm btn-primary" onclick="ContentManagementService.closeModal(); setTimeout(() => ContentManagementService.showUploadFileModal('${targetId}', 'tab'), 100);">📤 Upload New File</button>
            <button class="btn-sm" onclick="ContentManagementService.showAddFolderModal('${targetId}', '${targetName}')" style="margin-left: 8px;">📁 Create Folder</button>
          </div>
          ` : ''}
          
          ${folders.length > 0 ? `
            <div style="margin-bottom: 24px;">
              <h4 style="font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 600;">📁 Folders</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
                ${folders.map((folder, index) => {
      const folderFiles = files.filter(f => f.folder === folder.id);
      return `
                    <div style="background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%); border: 2px solid #00acc1; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.3s;"
                         onclick="ContentManagementService.showFolderFiles('${targetId}', '${folder.id}', '${folder.name}', '${targetName}')"
                         onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 20px rgba(0,172,193,0.3)'"
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                      <div style="font-size: 14px; color: #666; position: absolute; top: 8px; right: 8px; background: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: 600;">${index + 1}</div>
                      <div style="font-size: 48px; margin-bottom: 8px;">📂</div>
                      <div style="font-weight: 600; color: #00838f; font-size: 14px; margin-bottom: 4px;">${folder.name}</div>
                      <div style="font-size: 11px; color: #00695c;">${folderFiles.length} file${folderFiles.length !== 1 ? 's' : ''}</div>
                    </div>
                  `;
    }).join('')}
              </div>
            </div>
          ` : ''}
          
          <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 16px; border-bottom: 2px solid #ddd;">
              <h4 style="margin: 0; font-size: 16px; color: #333; font-weight: 600;">📄 All Files</h4>
            </div>
            
            ${files.length === 0 ? `
              <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No files uploaded yet</div>
                <div style="font-size: 14px;">Click "Upload New File" to add your first file</div>
              </div>
            ` : `
              <div style="padding: 16px; display: grid; gap: 12px;">
                ${files.map((file, index) => generateFileCard(file, index, {
      canDelete: canManageFiles,
      onView: `ContentManagementService.viewFile('${file.id}')`,
      onDelete: `ContentManagementService.deleteFile('${targetId}', '${file.id}')`,
      tabId: targetId
    })).join('')}
              </div>
            `}
          </div>
          
          <div class="modal-actions" style="margin-top: 20px;">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Close</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Show Add Folder Modal
  showAddFolderModal(targetId, targetName) {
    const modalHTML = `
      <div class="modal-overlay show" id="folderModal" onclick="if(event.target === this) { document.getElementById('folderModal').remove(); }">
        <div class="modal-card" style="max-width: 500px;">
          <div class="modal-header">
            <div class="modal-title">📁 Create New Folder</div>
            <button class="btn-close" onclick="document.getElementById('folderModal').remove()">✖</button>
          </div>
          
          <div class="form-group">
            <label>Folder Name *</label>
            <input id="newFolderNameModal" type="text" placeholder="Enter folder name" style="width: 100%;" />
          </div>
          
          <div id="folderModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="document.getElementById('folderModal').remove()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitCreateFolder('${targetId}', '${targetName}')">💾 Create</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit Create Folder
  submitCreateFolder(targetId, targetName) {
    const folderName = document.getElementById('newFolderNameModal')?.value.trim();
    const errorElem = document.getElementById('folderModalError');
    const user = AuthService.getUser();

    if (!folderName) {
      errorElem.textContent = 'Please enter folder name';
      return;
    }

    const result = this.addFolder(targetId, folderName, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      document.getElementById('folderModal')?.remove();

      // Check if this is a main tab (GM Message, Rule Books, etc.)
      const structure = this.getContentStructure();
      const isMainTab = structure.mainTabs.some(t => t.id === targetId);

      if (isMainTab) {
        // Refresh the main tab page
        const mainTab = structure.mainTabs.find(t => t.id === targetId);
        const pageName = mainTab.name.toLowerCase().replace(/\s+/g, '');

        // Find the correct content container
        let contentContainer = document.getElementById('divisionContent');
        if (!contentContainer) {
          contentContainer = document.getElementById('appContent');
        }

        if (contentContainer) {
          DepartmentsPage.render(contentContainer, pageName);
        }
      } else {
        // Show files list modal for division/lobby tabs
        this.showFilesList(targetId, targetName);
      }
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Show Folder Files
  async showFolderFiles(targetId, folderId, folderName, targetName) {
    const user = AuthService.getUser();

    // Sync files from server
    await this.fetchAndSyncFiles(targetId);

    const structure = this.getContentStructure();
    const allFiles = structure.files[targetId] || [];
    const files = allFiles.filter(f => f.folder === folderId);

    // Check if user can upload/manage files (based on division)
    const tabDivision = this.getDivisionNameFromTab(targetId);
    const canManageFiles = PermissionsService.canUploadFile(user, tabDivision, null);

    // Push state for back button support
    try {
      history.pushState({ modal: 'contentModal', timestamp: Date.now() }, '');
    } catch (e) { }

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card" style="max-width: 1200px; width: 95vw;">
          <div class="modal-header">
            <div class="modal-title">📂 ${folderName} - Files</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          <div style="margin-bottom: 20px; display: flex; gap: 8px;">
            <button class="btn-sm" onclick="ContentManagementService.closeModal(); setTimeout(() => ContentManagementService.showFilesList('${targetId}', '${targetName}'), 100);">← Back to All Files</button>
            ${canManageFiles ? `<button class="btn-sm btn-primary" onclick="ContentManagementService.closeModal(); setTimeout(() => ContentManagementService.showUploadFileModal('${targetId}', 'tab'), 100);">📤 Upload File</button>` : ''}
          </div>
          
          <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            ${files.length === 0 ? `
              <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No files in this folder</div>
              </div>
            ` : `
              <div style="padding: 16px; display: grid; gap: 12px;">
                ${files.map((file, index) => generateFileCard(file, index, {
      canDelete: canManageFiles,
      onView: `ContentManagementService.viewFile('${file.id}')`,
      onDelete: `ContentManagementService.deleteFile('${targetId}', '${file.id}')`,
      tabId: targetId
    })).join('')}
              </div>
            `}
          </div>
          
          <div class="modal-actions" style="margin-top: 20px;">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Close</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // View File (placeholder - will open file based on type)
  viewFile(fileId) {
    const structure = this.getContentStructure();
    let file = null;

    // Search for file in all targets
    for (const targetId in structure.files) {
      const found = structure.files[targetId].find(f => f.id === fileId);
      if (found) {
        file = found;
        break;
      }
    }

    if (!file) {
      showNotification('❌ File not found', 'error');
      return;
    }

    // Track file view to remove "New" tag
    this.trackFileView(file);

    // Helper to get usable URL for files (preserve relative ./uploads paths)
    const getAbsoluteUrl = (fileUrl) => {
      if (!fileUrl) return null;
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
      // Normalize uploads paths to site root for reliability
      if (fileUrl.startsWith('./uploads/')) return '/uploads/' + fileUrl.substring(10);
      if (fileUrl.startsWith('uploads/')) return '/' + fileUrl;
      if (fileUrl.startsWith('/')) return fileUrl;
      // Fallback: assume site-root relative
      return '/' + fileUrl;
    };

    const absoluteUrl = getAbsoluteUrl(file.url);

    const urlLower = (absoluteUrl || file.url || '').toLowerCase();
    const extMatchImage = /\.(png|jpg|jpeg|gif|bmp|webp)(\?.*)?$/.test(urlLower);
    const extMatchPdf = /\.(pdf)(\?.*)?$/.test(urlLower);
    const extMatchExcel = /\.(xls|xlsx|csv)(\?.*)?$/.test(urlLower);
    const normalizedType = file.type && file.type !== 'file'
      ? file.type
      : (extMatchPdf ? 'pdf' : (extMatchImage ? 'image' : (extMatchExcel ? 'excel' : (file.type || 'file'))));

    // Create viewer modal based on file type
    let contentHTML = '';

    switch (normalizedType) {
      case 'pdf':
        if (absoluteUrl) {
          const isMobile = window.innerWidth <= 767 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const downloadUrl = absoluteUrl.startsWith('http') ? absoluteUrl : window.location.origin + absoluteUrl;

          if (isMobile) {
            // For mobile and Android WebView: Render PDF directly using Google Docs Viewer
            const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`;

            contentHTML = `
              <div style="width: 100%; height: 100%; overflow: hidden; position: relative; background: #ffffff;">
                <iframe src="${googleViewerUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
              </div>
            `;
          } else {
            // Desktop: Use native iframe for PDF preview
            contentHTML = `
              <iframe src="${absoluteUrl}" style="width: 100%; height: 600px; border: none; border-radius: 8px;"></iframe>
            `;
          }
        } else {
          contentHTML = `<div style="text-align: center; padding: 40px; color: #999;">PDF preview not available. File: ${file.content}</div>`;
        }
        break;

      case 'image':
        if (absoluteUrl) {
          const imgId = 'fileViewerImage_' + (file.id || Date.now());
          contentHTML = `
            <div style="text-align: center; height: 100%; display: flex; align-items: center; justify-content: center; background: #f3f4f6;">
              <img id="${imgId}" src="${absoluteUrl}" style="max-width: 100%; max-height: 85vh; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); object-fit: contain;" />
              <div style="display: none; text-align: center; padding: 40px; color: #999;">Image failed to load. <a href="${absoluteUrl}" target="_blank">Open in new tab</a></div>
            </div>
          `;
          // After modal insertion, set progressive fallback URLs
          setTimeout(() => {
            const imgEl = document.getElementById(imgId);
            if (!imgEl) return;
            const candidates = [];
            const raw = file.url || '';
            const push = (u) => { if (u && !candidates.includes(u)) candidates.push(encodeURI(u)); };
            push(absoluteUrl);
            if (raw.startsWith('./')) push(raw.replace('./', '/'));
            if (raw.startsWith('./uploads/')) push('/uploads/' + raw.substring(10));
            if (raw.startsWith('uploads/')) push('/' + raw);
            if (!raw.startsWith('/') && !raw.startsWith('http')) push('/' + raw);
            let i = 0;
            imgEl.onerror = () => {
              i++;
              if (i < candidates.length) {
                imgEl.src = candidates[i];
              } else {
                imgEl.style.display = 'none';
                const fallback = imgEl.nextElementSibling;
                if (fallback) fallback.style.display = 'block';
              }
            };
          }, 50);
        } else {
          contentHTML = `<div style="text-align: center; padding: 40px; color: #999;">Image preview not available. File: ${file.content}</div>`;
        }
        break;

      case 'url':
        contentHTML = `
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #333;">🔗 External Link</div>
            <a href="${file.url}" target="_blank" class="btn-sm btn-primary" style="font-size: 16px; padding: 12px 24px;">
              🌐 Open Link in New Tab
            </a>
            <div style="margin-top: 16px; font-size: 13px; color: #888; word-break: break-all;">${file.url}</div>
          </div>
        `;
        break;

      case 'message':
        const msg = file.content;
        contentHTML = `
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            ${msg.header ? `<div style="text-align: center; font-size: 14px; color: #666; margin-bottom: 20px; white-space: pre-line;">${msg.header.replace(/<br\/>/g, '\n')}</div>` : ''}
            ${msg.photo ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${msg.photo}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover;" /></div>` : ''}
            <div style="font-size: 15px; line-height: 1.8; color: #333; white-space: pre-line; margin-bottom: 24px;">${msg.message}</div>
            ${msg.signatureName ? `
              <div style="text-align: right; margin-top: 30px;">
                <div style="font-size: 15px; font-weight: 600; color: #333;">${msg.signatureName}</div>
                ${msg.signatureTitle ? `<div style="font-size: 13px; color: #666; margin-top: 4px; white-space: pre-line;">${msg.signatureTitle.replace(/<br\/>/g, '\n')}</div>` : ''}
              </div>
            ` : ''}
            ${msg.pageNumber ? `<div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">Page ${msg.pageNumber}</div>` : ''}
          </div>
        `;
        break;

      case 'excel':
        if (absoluteUrl) {
          contentHTML = `
            <div style="text-align: center; padding: 40px;">
              <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
              <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #333;">Excel File</div>
              <div style="font-size: 14px; color: #666; margin-bottom: 20px;">${file.name || 'Spreadsheet'}</div>
              <a href="${absoluteUrl}" download="${file.name || 'file'}.xlsx" class="btn-sm btn-primary" style="font-size: 16px; padding: 12px 24px; text-decoration: none;">
                ⬇️ Download Excel File
              </a>
              <div style="margin-top: 12px;">
                <a href="${absoluteUrl}" target="_blank" style="font-size: 13px; color: #3b82f6;">🌐 Open in New Tab</a>
              </div>
            </div>
          `;
        } else {
          contentHTML = `<div style="text-align: center; padding: 40px; color: #999;">Excel file: ${file.content}</div>`;
        }
        break;

      case 'notice':
        contentHTML = `
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 40px; border-radius: 16px; min-height: 300px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 64px; margin-bottom: 16px;">📢</div>
              <div style="font-size: 24px; font-weight: 700; color: #92400e;">${file.name || 'Notice'}</div>
            </div>
            ${file.description ? `<div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
              <div style="font-size: 14px; font-weight: 600; color: #b45309; margin-bottom: 8px;">Notice Content</div>
              <div style="font-size: 15px; color: #78350f; line-height: 1.6; white-space: pre-wrap;">${file.description}</div>
            </div>` : ''}
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(245, 158, 11, 0.3);">
              <div style="font-size: 12px; color: #b45309;">
                <span class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">schedule</span>
                Posted on ${file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
              </div>
            </div>
          </div>
        `;
        break;

      case 'html':
        const htmlContent = file.content;
        const viewUniqueId = 'view-html-' + file.id + '-' + Date.now();

        // Use Shadow DOM for rendering - no iframe scrollbars
        const css = htmlContent.css || '';
        const html = htmlContent.html || '';
        const js = htmlContent.js || '';

        contentHTML = `
          <div id="${viewUniqueId}" class="html-render-container" style="width: 100%; overflow: visible;"
               data-css="${encodeURIComponent(css)}" 
               data-html="${encodeURIComponent(html)}" 
               data-js="${encodeURIComponent(js)}">
          </div>
        `;

        // Initialize after modal is shown - use iframe for perfect isolation - NO SCROLLBAR
        setTimeout(() => {
          const container = document.getElementById(viewUniqueId);
          if (!container || container.dataset.rendered) return;
          container.dataset.rendered = 'true';

          // Build complete HTML document for iframe
          const fullContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="${window.location.origin}${window.Api?.getBaseUrl()?.replace('/api', '') || ''}/">
<style>
html, body { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }
body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; padding-bottom: 20px; word-wrap: break-word; }
img, table, video, canvas, iframe { max-width: 100% !important; height: auto !important; }
table { width: 100% !important; border-collapse: collapse; }
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
    try { window.parent.postMessage({ type: 'iframe-resize', height: height, id: '${viewUniqueId}' }, '*'); } catch (e) {}
  }
});
resizeObserver.observe(document.body);
window.addEventListener('load', () => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: 'iframe-resize', height: height, id: '${viewUniqueId}' }, '*');
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
          iframe.style.cssText = 'width: 100%; min-height: 400px; border: none; display: block;';
          iframe.scrolling = 'no';
          iframe.frameBorder = '0';

          // Use Blob URL
          const blob = new Blob([fullContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          iframe.src = url;

          const messageHandler = (event) => {
            if (event.data && event.data.type === 'iframe-resize' && event.data.id === viewUniqueId) {
              const newHeight = event.data.height + 5;
              if (newHeight > 50) {
                iframe.style.height = newHeight + 'px';
              }
            }
          };
          window.addEventListener('message', messageHandler);

          iframe.onload = () => {
            const resize = () => {
              try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const height = doc.body.scrollHeight;
                if (height > 50) {
                  iframe.style.height = (height + 5) + 'px';
                }
              } catch (e) { }
            };
            [100, 300, 500, 1000].forEach(delay => setTimeout(resize, delay));
          };

          container.innerHTML = '';
          container.appendChild(iframe);
        }, 100);
        break;

      default:
        contentHTML = `<div style="text-align: center; padding: 40px; color: #999;">Preview not available for this file type</div>`;
    }

    // Determine download URL for bridge
    const downloadUrl = absoluteUrl && !absoluteUrl.startsWith('http') ? window.location.origin + absoluteUrl : (absoluteUrl || '');
    const isActuallyWebView = window.WebViewBridge && (window.WebViewBridge.isAndroidWebView || window.WebViewBridge.hasAndroidInterface);

    const modalHTML = `
      <div class="modal-overlay show" id="fileViewerModal" style="z-index:10000; background: rgba(0,0,0,0.5);" onclick="if(event.target === this) { history.back(); }">
        <div class="modal-card" style="max-width: 100vw; width: 100vw; max-height: 100vh; height: 100vh; overflow: hidden; border: none; border-radius: 0; background: white; display: flex; flex-direction: column;">
          <div style="display:flex; align-items:center; justify-content: space-between; padding: 12px 16px; background: #111827; color: white;">
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-sm" onclick="history.back()" style="background: rgba(255,255,255,0.12); color: white; border: none; padding: 8px 12px; border-radius: 6px;">← Back</button>
              <div class="modal-title" style="font-weight:700;">${file.name || 'File Viewer'}</div>
            </div>
            <button class="btn-close" onclick="history.back()" style="background: rgba(255,255,255,0.12); color: white; border: none; width: 32px; height: 32px; border-radius: 6px;">✖</button>
          </div>
          
          ${file.description && normalizedType !== 'notice' ? `<div style="padding: 8px 16px; background: #f9fafb; color: #374151; font-size: 13px;">${file.description}</div>` : ''}
          
          <div style="flex:1; overflow:auto; padding: 12px; background: #ffffff;">
            ${contentHTML}
          </div>
          
          <div style="padding: 12px 16px; display:flex; gap:8px; justify-content:center; background: #f9fafb; border-top: 1px solid #e5e7eb; flex-wrap: wrap;">
            ${absoluteUrl && (normalizedType === 'pdf' || normalizedType === 'image' || normalizedType === 'excel') && (file.downloadable !== false) ?
        (isActuallyWebView ?
          `
                <button onclick="window.open('${downloadUrl}', '_blank');" class="btn-sm btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; min-width: 120px; padding: 12px 16px; border-radius: 8px; font-weight: 600;">
                  <span class="material-icons" style="font-size: 18px;">open_in_new</span>
                  <span>Full Screen</span>
                </button>
                <button onclick="window.WebViewBridge.downloadFile('${downloadUrl}', '${(file.original_name || file.name || 'document').replace(/'/g, "\\'")}', 'application/pdf');" class="btn-sm" style="display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; min-width: 120px; padding: 12px 16px; background: #374151; color: white; border: none; border-radius: 8px; font-weight: 600;">
                  <span class="material-icons" style="font-size: 18px;">download</span>
                  <span>Download</span>
                </button>
                ` :
          `<a href="${absoluteUrl}" target="_blank" class="btn-sm btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; min-width: 120px; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  <span class="material-icons" style="font-size: 18px;">open_in_new</span>
                  <span>Full Screen</span>
                </a>
                <a href="${absoluteUrl}" download="${(file.original_name || file.name || 'file')}" class="btn-sm" style="display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; min-width: 120px; padding: 12px 20px; text-decoration: none; background: #374151; color: white; border-radius: 8px; font-weight: 600;">
                  <span class="material-icons" style="font-size: 18px;">download</span>
                  <span>Download</span>
                </a>`
        ) : ''}
            <button class="btn-sm" onclick="history.back()" style="padding: 12px 20px; flex: 1; min-width: 80px; border-radius: 8px;">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Push state for back button support - use a unique identifier
    try {
      history.pushState({ modal: 'fileViewer', timestamp: Date.now() }, '');
    } catch (e) { }

    // Store reference to handle back button from NavigationService
    this._fileViewerPopHandler = (event) => {
      const viewer = document.getElementById('fileViewerModal');
      if (viewer) {
        viewer.remove();
        window.removeEventListener('popstate', this._fileViewerPopHandler);
        this._fileViewerPopHandler = null;
      }
    };
    window.addEventListener('popstate', this._fileViewerPopHandler);
  },

  // Delete File
  async deleteFile(targetId, fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    const structure = this.getContentStructure();
    const files = structure.files[targetId] || [];
    const fileIndex = files.findIndex(f => f.id === fileId);

    if (fileIndex > -1) {
      const file = files[fileIndex];

      // If it's a server file, delete from server too
      if (file.isFromServer || file.id.startsWith('server_')) {
        const serverId = file.server_file_id || file.id.replace('server_', '');
        try {
          const result = await Api.deleteFile(serverId);
          if (!result.success) {
            showNotification('❌ Failed to delete from server: ' + (result.error || 'Unknown error'), 'error');
            return;
          }
        } catch (e) {
          console.error('Server deletion error:', e);
          showNotification('❌ Server error during deletion', 'error');
          return;
        }
      }

      files.splice(fileIndex, 1);
      structure.files[targetId] = files;
      this.saveContentStructure(structure);

      // INSTANT DELETE: Remove from UI immediately
      const serverId = file.server_file_id || file.id.replace('server_', '');

      // Try to find and remove the element directly
      this.instantlyRemoveFileFromUI(serverId);
      this.instantlyRemoveFileFromUI(file.id);

      showNotification('✅ File deleted successfully', 'success');

      // Background sync for consistency
      setTimeout(() => {
        this.autoRefreshFileList(targetId, 'delete');
      }, 300);
    }
  },

  // Show Edit Main Tab Modal
  showEditMainTabModal(tabId) {
    const user = AuthService.getUser();
    const structure = this.getContentStructure();
    const tab = structure.mainTabs.find(t => t.id === tabId);

    if (!tab) {
      showNotification('❌ Tab not found', 'error');
      return;
    }

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">✏️ Edit Main Tab</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Tab Name *</label>
              <input id="mainTabName" type="text" value="${tab.name}" />
            </div>
            
            <div class="form-group">
              <label>Lottie Icon URL <span style="font-size: 10px; color: #888;">(optional)</span></label>
              <input id="mainTabIcon" type="text" value="${tab.icon || ''}" placeholder="https://assets.lottiefiles.com/..." />
            </div>
          </div>
          
          <div id="contentModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitEditMainTab('${tabId}')">💾 Update Tab</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit Edit Main Tab
  async submitEditMainTab(tabId) {
    const user = AuthService.getUser();
    const tabName = document.getElementById('mainTabName').value.trim();
    const iconUrl = document.getElementById('mainTabIcon').value.trim();
    const errorElem = document.getElementById('contentModalError');

    if (!tabName) {
      errorElem.textContent = 'Please enter tab name';
      return;
    }

    const result = await this.editMainTab(tabId, tabName, iconUrl, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeModal();
      // Reload page if needed
      if (typeof AdminPage !== 'undefined' && AdminPage.loadMainTabManagement) {
        AdminPage.loadMainTabManagement();
      }
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Show Delete Main Tab Confirmation
  async showDeleteMainTabConfirm(tabId, tabName) {
    if (!confirm(`🗑️ Are you sure you want to delete "${tabName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    const user = AuthService.getUser();
    const result = await this.deleteMainTab(tabId, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      if (typeof AdminPage !== 'undefined' && AdminPage.loadMainTabManagement) {
        AdminPage.loadMainTabManagement();
      }
    } else {
      showNotification(`❌ ${result.message}`, 'error');
    }
  },

  // Show Edit Division Tab Modal
  showEditDivisionTabModal(division, tabId) {
    const user = AuthService.getUser();
    const structure = this.getContentStructure();
    const tab = structure.divisionTabs[division]?.find(t => t.id === tabId);

    if (!tab) {
      showNotification('❌ Tab not found', 'error');
      return;
    }

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">✏️ Edit Division Tab</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Division</label>
              <input type="text" value="${division.charAt(0).toUpperCase() + division.slice(1)}" disabled />
            </div>
            
            <div class="form-group">
              <label>Tab Name *</label>
              <input id="divTabName" type="text" value="${tab.name}" />
            </div>
          </div>
          
          <div id="contentModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitEditDivisionTab('${division}', '${tabId}')">💾 Update Tab</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit Edit Division Tab
  async submitEditDivisionTab(division, tabId) {
    const user = AuthService.getUser();
    const tabName = document.getElementById('divTabName').value.trim();
    const errorElem = document.getElementById('contentModalError');

    if (!tabName) {
      errorElem.textContent = 'Please enter tab name';
      return;
    }

    const result = await this.editDivisionTab(division, tabId, tabName, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeModal();
      if (typeof AdminPage !== 'undefined' && AdminPage.loadDivisionTabManagement) {
        AdminPage.loadDivisionTabManagement();
      }
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Show Delete Division Tab Confirmation
  async showDeleteDivisionTabConfirm(division, tabId, tabName) {
    if (!confirm(`🗑️ Are you sure you want to delete "${tabName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    const user = AuthService.getUser();
    const result = await this.deleteDivisionTab(division, tabId, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      if (typeof AdminPage !== 'undefined' && AdminPage.loadDivisionTabManagement) {
        AdminPage.loadDivisionTabManagement();
      }
    } else {
      showNotification(`❌ ${result.message}`, 'error');
    }
  },

  // Get tab name from targetId
  getTabName(targetId) {
    const structure = this.getContentStructure();

    // Check if it's a main tab
    const mainTab = structure.mainTabs.find(tab => tab.id === targetId);
    if (mainTab) {
      return mainTab.name;
    }

    // Check if it's a division section tab
    for (const divisionTabId in structure.divisionTabs) {
      const divisionTab = structure.divisionTabs[divisionTabId];
      // divisionTab is an array of tabs
      if (Array.isArray(divisionTab)) {
        const tab = divisionTab.find(t => t.id === targetId);
        if (tab) return tab.name;
      }
    }

    // Check lobby tabs
    if (structure.lobbyTabs) {
      for (const lobbyName in structure.lobbyTabs) {
        const lobbyTabList = structure.lobbyTabs[lobbyName];
        if (Array.isArray(lobbyTabList)) {
          const tab = lobbyTabList.find(t => t.id === targetId);
          if (tab) return tab.name;
        }
      }
    }

    // If not found, try to extract from the ID
    if (targetId.includes('_')) {
      const parts = targetId.split('_');
      if (parts.length > 1) {
        // Convert from ID format to readable name (e.g., "drm_instructions" to "DRM Instructions")
        return parts.map(part =>
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
      }
    }

    return targetId;
  },

  // Get section name from targetId
  getSectionName(targetId) {
    // First, try to find the tab in the content structure and get its actual name
    const structure = this.getContentStructure();

    // Check division tabs
    for (const div in structure.divisionTabs) {
      const tab = structure.divisionTabs[div].find(t => t.id === targetId);
      if (tab) {
        console.log('🎯 getSectionName: Found tab', tab.name, 'for id:', targetId);
        return tab.name; // Return the actual tab name like "Sr DEE"
      }
    }

    // Check main tabs
    const mainTab = structure.mainTabs.find(t => t.id === targetId);
    if (mainTab) {
      return mainTab.name;
    }

    // Check lobby tabs (NEW)
    if (structure.lobbyTabs) {
      for (const lobbyName in structure.lobbyTabs) {
        const tabs = structure.lobbyTabs[lobbyName];
        if (Array.isArray(tabs)) {
          const tab = tabs.find(t => t.id === targetId);
          if (tab) return tab.name;
        }
      }
    }

    // Check lobby tabs (format: lobby_division_index)
    if (targetId && targetId.startsWith('lobby_')) {
      const parts = targetId.split('_');
      if (parts.length >= 3) {
        const division = parts[1];
        const index = parseInt(parts[2], 10);
        // Get lobby name from LobbyManagementService
        if (window.LobbyManagementService) {
          const lobbies = LobbyManagementService.getLobbiesByDivision(division);
          if (lobbies && lobbies[index]) {
            console.log('🎯 getSectionName: Found lobby', lobbies[index], 'for id:', targetId);
            return lobbies[index];
          }
        }
      }
    }

    // Check sidebar mapping (for predefined sections)
    const sidebarMapping = {
      'gmMessage': 'GM Message',
      'pceeMessage': 'PCEE Message',
      'traffic': 'Traffic',
      'ohe': 'OHE',
      'cw': 'C & W',
      'pway': 'P-Way',
      'spad': 'SPAD Prevention'
    };

    if (sidebarMapping[targetId]) {
      return sidebarMapping[targetId];
    }

    // Fallback: return the targetId itself
    console.warn('⚠️ getSectionName: Could not find tab for id:', targetId);
    return targetId;
  },

  // Add Lobby Tab
  async addLobbyTab(lobbyId, lobbyName, tabName, user) {
    const structure = this.getContentStructure();

    if (!structure.lobbyTabs[lobbyName]) {
      structure.lobbyTabs[lobbyName] = [];
    }

    // Check if tab already exists
    if (structure.lobbyTabs[lobbyName].find(t => t.name === tabName)) {
      return { success: false, message: 'Tab already exists in this lobby' };
    }

    try {
      const result = await Api.createTab({
        name: tabName,
        type: 'lobby',
        lobby_id: lobbyId,
        user_id: user.id || user.cms_id
      });

      if (result.success) {
        const tabId = result.data.tab_id;
        structure.lobbyTabs[lobbyName].push({
          id: tabId,
          name: tabName,
          lobby: lobbyName,
          lobbyId: lobbyId,
          createdBy: user.name,
          createdAt: new Date().toISOString(),
          isFromServer: true
        });

        this.saveContentStructure(structure);
        return { success: true, message: 'Lobby tab added successfully', tabId };
      } else {
        return { success: false, message: result.message || 'Failed to add tab' };
      }
    } catch (e) {
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Edit Lobby Tab
  async editLobbyTab(lobbyName, tabId, tabName, user) {
    const structure = this.getContentStructure();

    const tab = structure.lobbyTabs[lobbyName]?.find(t => t.id === tabId);
    if (!tab) {
      return { success: false, message: 'Tab not found' };
    }

    try {
      // Call API
      let result;
      if (tab.isFromServer) {
        result = await Api.updateTab({
          tab_id: tabId,
          name: tabName,
          user_id: user.id || user.cms_id
        });
      } else {
        // If not on server, we create it
        result = await Api.createTab({
          tab_id: tabId,
          name: tabName,
          type: 'lobby',
          lobby_id: lobbyName, // Lobby name can be used as lobby_id for auto-resolution on server
          user_id: user.id || user.cms_id
        });
      }

      if (result.success) {
        tab.name = tabName;
        tab.updatedAt = new Date().toISOString();
        tab.isFromServer = true;

        this.saveContentStructure(structure);
        return { success: true, message: 'Lobby tab updated successfully' };
      } else {
        return { success: false, message: result.message || 'Failed to update tab' };
      }
    } catch (e) {
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Delete Lobby Tab
  async deleteLobbyTab(lobbyName, tabId, user) {
    const structure = this.getContentStructure();

    const index = structure.lobbyTabs[lobbyName]?.findIndex(t => t.id === tabId);
    if (index === -1 || index === undefined) {
      return { success: false, message: 'Tab not found' };
    }

    try {
      const result = await Api.deleteTab(tabId);

      if (result.success) {
        structure.lobbyTabs[lobbyName].splice(index, 1);
        this.saveContentStructure(structure);
        return { success: true, message: 'Lobby tab deleted successfully' };
      } else {
        return { success: false, message: result.message || 'Failed to delete tab' };
      }
    } catch (e) {
      return { success: false, message: 'Server error: ' + e.message };
    }
  },

  // Show Add Lobby Tab Modal
  async showAddLobbyTabModal() {
    const user = AuthService.getUser();

    // Check permission - Super Admin or Division Admin or Lobby Admin
    if (!PermissionsService.isSuperAdmin(user) && !PermissionsService.isDivisionAdmin(user) && user.role !== 'lobby') {
      showNotification(PermissionsService.getPermissionError('add lobby tabs'), 'error');
      return;
    }

    // Fetch lobbies
    let lobbies = [];
    try {
      const divisionId = user.division ? this.getDivisionId(user.division) : null;
      const result = await Api.getLobbies(divisionId);
      if (result.success) {
        lobbies = result.data;
      }
    } catch (e) {
      console.error('Failed to fetch lobbies', e);
    }

    // If lobby admin, restrict to own lobby
    if (user.role === 'lobby') {
      const userLobby = user.lobby || user.hq;
      lobbies = lobbies.filter(l => l.name === userLobby);
    }

    const lobbyOptions = lobbies.map(l => `<option value="${l.id}" data-name="${l.name}">${l.name}</option>`).join('');

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">➕ Add Lobby Tab</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Lobby *</label>
              <select id="lobbyTabLobby">
                ${lobbyOptions}
              </select>
            </div>
            
            <div class="form-group">
              <label>Tab Name *</label>
              <input id="lobbyTabName" type="text" placeholder="Enter tab name" />
            </div>
          </div>
          
          <div id="contentModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitAddLobbyTab()">💾 Create Tab</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit Add Lobby Tab
  async submitAddLobbyTab() {
    const user = AuthService.getUser();
    const lobbySelect = document.getElementById('lobbyTabLobby');
    const lobbyId = lobbySelect.value;
    const lobbyName = lobbySelect.options[lobbySelect.selectedIndex].getAttribute('data-name');
    const tabName = document.getElementById('lobbyTabName').value.trim();
    const errorElem = document.getElementById('contentModalError');

    if (!tabName) {
      errorElem.textContent = 'Please enter tab name';
      return;
    }

    const result = await this.addLobbyTab(lobbyId, lobbyName, tabName, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeModal();
      if (typeof AdminPage !== 'undefined' && AdminPage.loadLobbyTabManagement) {
        AdminPage.loadLobbyTabManagement();
      }
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Show Edit Lobby Tab Modal
  showEditLobbyTabModal(lobbyName, tabId) {
    const structure = this.getContentStructure();
    const tab = structure.lobbyTabs[lobbyName]?.find(t => t.id === tabId);

    if (!tab) {
      showNotification('❌ Tab not found', 'error');
      return;
    }

    const modalHTML = `
      <div class="modal-overlay show" id="contentModal" onclick="if(event.target === this) ContentManagementService.closeModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">✏️ Edit Lobby Tab</div>
            <button class="btn-close" onclick="ContentManagementService.closeModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Lobby</label>
              <input type="text" value="${lobbyName}" disabled />
            </div>
            
            <div class="form-group">
              <label>Tab Name *</label>
              <input id="lobbyTabName" type="text" value="${tab.name}" />
            </div>
          </div>
          
          <div id="contentModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="ContentManagementService.closeModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="ContentManagementService.submitEditLobbyTab('${lobbyName}', '${tabId}')">💾 Update Tab</button>
          </div>
        </div>
      </div>
    `;

    this.removeModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Submit Edit Lobby Tab
  async submitEditLobbyTab(lobbyName, tabId) {
    const user = AuthService.getUser();
    const tabName = document.getElementById('lobbyTabName').value.trim();
    const errorElem = document.getElementById('contentModalError');

    if (!tabName) {
      errorElem.textContent = 'Please enter tab name';
      return;
    }

    const result = await this.editLobbyTab(lobbyName, tabId, tabName, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeModal();
      if (typeof AdminPage !== 'undefined' && AdminPage.loadLobbyTabManagement) {
        AdminPage.loadLobbyTabManagement();
      }
    } else {
      errorElem.textContent = result.message;
    }
  },

  // Show Delete Lobby Tab Confirmation
  async showDeleteLobbyTabConfirm(lobbyName, tabId, tabName) {
    if (!confirm(`🗑️ Are you sure you want to delete "${tabName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    const user = AuthService.getUser();
    const result = await this.deleteLobbyTab(lobbyName, tabId, user);

    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      if (typeof AdminPage !== 'undefined' && AdminPage.loadLobbyTabManagement) {
        AdminPage.loadLobbyTabManagement();
      }
    } else {
      showNotification(`❌ ${result.message}`, 'error');
    }
  },

  // Initialize real-time sync listeners
  initRealtimeSync() {
    if (!window.RealtimeSyncService) {
      console.log('[ContentManagement] RealtimeSyncService not available');
      return;
    }

    console.log('[ContentManagement] Initializing real-time sync listeners');

    // Listen for file uploads
    RealtimeSyncService.on('fileUpload', (data) => {
      console.log('[ContentManagement] File upload detected:', data);
      this.handleRealtimeFileUpdate(data, 'upload');
    });

    // Listen for file deletions
    RealtimeSyncService.on('fileDelete', (data) => {
      console.log('[ContentManagement] File deletion detected:', data);
      this.handleRealtimeFileUpdate(data, 'delete');
    });

    // Listen for file edits
    RealtimeSyncService.on('fileEdit', (data) => {
      console.log('[ContentManagement] File edit detected:', data);
      this.handleRealtimeFileUpdate(data, 'edit');
    });
  },

  // Handle real-time file updates
  handleRealtimeFileUpdate(data, action) {
    const currentView = window.NavigationService?.getCurrentView?.();
    const currentTabId = window.FilesPage?.currentTabId;

    // Determine if this update affects the current view
    const targetSection = data.target_section || data.section;
    const targetDivision = data.division_name || data.target_division_id;
    const targetLobby = data.lobby_name || data.target_lobby_id;

    // Check if we're currently viewing the affected tab/section
    let shouldRefresh = false;

    if (currentView === 'filesPage' && currentTabId) {
      // Check if the file belongs to the current tab
      const structure = this.getContentStructure();
      const tabFiles = structure.files[currentTabId] || [];

      if (action === 'delete') {
        // Remove deleted file from local cache immediately
        const fileIndex = tabFiles.findIndex(f => f.server_file_id === data.file_id || f.id === 'server_' + data.file_id);
        if (fileIndex > -1) {
          tabFiles.splice(fileIndex, 1);
          this.saveContentStructure(structure);
          shouldRefresh = true;
        }
      } else if (action === 'upload') {
        // New file uploaded - refresh to show it
        shouldRefresh = true;
      }
    }

    // Show notification for the update
    const actionText = action === 'upload' ? 'uploaded' : action === 'delete' ? 'deleted' : 'updated';
    const fileName = data.file_name || data.title || 'File';

    // Only show notification if we're not on the affected page (to avoid duplicate info)
    if (!shouldRefresh) {
      showNotification(`📁 "${fileName}" was ${actionText}`, 'info');
    }

    // Refresh the current view if needed
    if (shouldRefresh && window.FilesPage && typeof FilesPage.render === 'function') {
      console.log('[ContentManagement] Auto-refreshing current view');
      // Small delay to allow server to complete processing
      setTimeout(() => {
        FilesPage.render(FilesPage.currentTabId, FilesPage.currentTabName, FilesPage.currentLobby);
      }, 500);
    }

    // Always sync all content in background
    this.syncAllContent();
  },

  /**
   * Refresh current view without UI disruption
   * Used by 10-second polling system
   */
  async refreshCurrentView(viewInfo) {
    if (!viewInfo) return;

    const { tabId, tabName, lobby, division } = viewInfo;

    try {
      // Get fresh data from server
      const sectionName = this.getSectionName(tabId);
      const divisionName = division || this.getDivisionNameFromTab(tabId);
      const lobbyName = lobby;

      const response = await Api.getFiles({
        section: sectionName,
        division: divisionName,
        lobby: lobbyName
      });

      if (response.success && response.files) {
        const structure = this.getContentStructure();
        const currentFiles = structure.files[tabId] || [];
        const newFiles = response.files;

        // Check if there are any differences
        const hasChanges = newFiles.length !== currentFiles.length ||
          newFiles.some((nf, idx) => {
            const cf = currentFiles[idx];
            return !cf || cf.server_file_id !== nf.id;
          });

        if (hasChanges) {
          console.log('[ContentManagement] Detected changes, updating silently');

          // Update files in storage
          structure.files[tabId] = newFiles.map(file => ({
            id: 'server_' + file.id,
            server_file_id: file.id,
            type: file.type,
            title: file.title,
            description: file.description,
            url: file.url,
            fileName: file.file_name,
            uploadedBy: file.uploaded_by,
            uploadedAt: file.uploaded_at,
            target: tabId,
            isFromServer: true,
            is_new: file.is_new // Preserve the NEW badge flag
          }));

          this.saveContentStructure(structure);

          // If we're currently viewing this tab, refresh the display
          if (window.FilesPage && FilesPage.currentTabId === tabId) {
            FilesPage.render(tabId, tabName, lobby, division);
          }

          // Update notification counters
          if (window.NotificationService) {
            NotificationService.updateCounters();
          }
        }
      }
    } catch (error) {
      console.error('[ContentManagement] refreshCurrentView error:', error);
    }
  }
};

// Initialize real-time sync when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.ContentManagementService) {
      ContentManagementService.initRealtimeSync();
    }
  }, 1000);
});
