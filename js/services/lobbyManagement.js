// Lobby Management Service
const LobbyManagementService = {
  
  // Get lobbies from server
  async fetchLobbiesFromServer() {
    try {
      const response = await Api.getLobbies();
      if (response.success) {
        // Transform array of objects {id, name, division} to structure: { division: [names] }
        const lobbiesByDivision = {};
        response.data.forEach(l => {
          // Normalize division to lowercase to match frontend keys (bikaner, ajmer, etc.)
          const divName = (l.division || '').toLowerCase();
          if (!divName) return;

          if (!lobbiesByDivision[divName]) lobbiesByDivision[divName] = [];
          // Avoid duplicates in the list
          if (!lobbiesByDivision[divName].includes(l.name)) {
              lobbiesByDivision[divName].push(l.name);
          }
        });
        
        // Also cache mapped objects for ID lookup
        this.lobbyMap = {}; // name -> id
        response.data.forEach(l => this.lobbyMap[l.name] = l.id);
        
        this.saveLobbies(lobbiesByDivision);
        return lobbiesByDivision;
      } else {
        console.error('Failed to load lobbies from server:', response.error || 'Unknown error');
      }
    } catch (e) {
      console.error('Failed to load lobbies from server', e);
    }
    
    // Fallback to local storage
    const storedLobbies = Storage.load(APP_CONFIG.storage.lobbies, true);
    if (storedLobbies) {
      return storedLobbies;
    }
    return APP_CONFIG.lobbies || {};
  },

  // Get lobbies from cache (Sync)
  getLobbies() {
    return APP_CONFIG.lobbies || {};
  },
  
  // Save lobbies to storage (Local Cache)
  saveLobbies(lobbies) {
    Storage.save(APP_CONFIG.storage.lobbies, lobbies);
    APP_CONFIG.lobbies = lobbies;
    // Ensure the lobbies object is properly assigned
    if (!APP_CONFIG.lobbies) {
      APP_CONFIG.lobbies = {};
    }
  },
  
  // Add new lobby
  async addLobby(division, lobbyName) {
    console.log('Adding lobby:', { division, lobbyName });
    
    // Optimistic update
    let lobbies = this.getLobbies(); 
    if (!lobbies[division]) lobbies[division] = [];
    
    if (lobbies[division].includes(lobbyName)) {
      console.log('Lobby already exists in local cache:', lobbyName);
      return { success: false, message: 'Lobby already exists in this division' };
    }
    
    // Server Call
    const response = await Api.createLobby({ name: lobbyName, division });
    console.log('Server response:', response);
    
    // Log debug info if available
    if (response.debug && response.debug.length > 0) {
        console.log('Server debug info:', response.debug);
    }
    
    if (response.success) {
         lobbies = await this.fetchLobbiesFromServer(); // Refresh full list
         return { success: true, message: 'Lobby added successfully' };
    } else {
         // Handle duplicate gracefully
         if (response.message && (response.message.includes('already exists') || response.message.toLowerCase().includes('duplicate entry'))) {
             console.log('Server reports duplicate, syncing from server...');
             if (response.debug) {
                 console.log('Debug info for duplicate:', response.debug);
             }
             lobbies = await this.fetchLobbiesFromServer(); // Sync anyway
             return { success: true, message: 'Lobby synced from server (already existed)' };
         }
         return { success: false, message: response.message || 'Failed to add lobby on server' };
    }
  },
  
  // Edit lobby
  async editLobby(division, oldName, newName) {
    // We need the ID to edit on server
    // Refresh map to ensure we have IDs if not loaded
    if (!this.lobbyMap) await this.fetchLobbiesFromServer();
    
    const id = this.lobbyMap ? this.lobbyMap[oldName] : null;
    
    if (!id) return { success: false, message: 'Lobby ID not found. Sync required.' };

    const response = await Api.updateLobby({ id, name: newName, division });
    if (response.success) {
         await this.fetchLobbiesFromServer(); // Refresh
         return { success: true, message: 'Lobby updated successfully' };
    }
    return { success: false, message: response.message };
  },
  
  // Delete lobby
  async deleteLobby(division, lobbyName) {
    if (!this.lobbyMap) await this.fetchLobbiesFromServer();
    const id = this.lobbyMap ? this.lobbyMap[lobbyName] : null;
    
    if (!id) return { success: false, message: 'Lobby ID not found' };

    const response = await Api.deleteLobby(id);
    if (response.success) {
         await this.fetchLobbiesFromServer(); // Refresh
         return { success: true, message: 'Lobby deleted successfully' };
    }
    return { success: false, message: response.message };
  },
  
  // Get lobbies for a specific division
  getLobbiesByDivision(division) {
    const lobbies = this.getLobbies();
    return lobbies[division] || [];
  },
  
  // Render lobby management UI
  renderLobbyManagement(user) {
    // Trigger background fetch to update UI
    this.fetchLobbiesFromServer().then(() => {
        // Only re-render if the container is still present (user didn't navigate away)
        const container = document.getElementById('lobbyListContainer');
        if (container) {
            // We need to call the internal render logic again
            // But renderLobbyManagement returns HTML string.
            // AdminPage calls this. 
            // We can't easily re-inject HTML from here without knowing the container ID for sure,
            // but we know it's usually 'lobbyListContainer' in AdminPage.
            // Let's rely on AdminPage to call render, OR we update the grid content.
            
            // To be safe, we'll just update the cache. The next interaction will show new data.
            // Ideally AdminPage should handle the async loading state.
            // For now, let's force a redraw if we found new data?
            // A simple hack: Re-render the specific grid content if possible.
            
            // Re-render logic duplicated? No, let's just let the user refresh or rely on initial cache.
            // Actually, if cache is empty, user sees 0. Then fetch finishes. User sees 0 still.
            // We must update the UI.
            const newHtml = this._generateLobbyHTML(user);
            container.innerHTML = newHtml;
        }
    });

    return this._generateLobbyHTML(user);
  },

  _generateLobbyHTML(user) {
    const divisions = PermissionsService.isSuperAdmin(user) 
      ? ['bikaner', 'ajmer', 'jodhpur', 'jaipur']
      : [user.division];
    
    let html = '<div style="margin-top: 20px;">';
    
    divisions.forEach(division => {
      const lobbies = this.getLobbiesByDivision(division);
      const divisionName = division.charAt(0).toUpperCase() + division.slice(1);
      
      html += `
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px; color: var(--primary); margin: 0; text-align: center; width: 100%;">${divisionName} Division (${lobbies.length} lobbies)</h3>
          </div>
          
          <div class="lobby-management-grid">
            ${lobbies.map((lobby, index) => {
              const lobbyId = `lobby_${division}_${index}`;
              const encodedLobbyName = encodeURIComponent(lobby);
              return `
              <div style="display: flex; flex-direction: column; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
                <div style="margin-bottom: 8px;">
                  <span style="font-weight: 600; color: #333;">${lobby}</span>
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
                  <button class="btn-sm btn-primary" style="font-size: 11px; padding: 4px 8px;" onclick="ContentManagementService.showUploadFileModal('${lobbyId}', 'lobby', decodeURIComponent('${encodedLobbyName}'))">📤 Upload</button>
                  <button class="btn-sm" style="font-size: 11px; padding: 4px 8px;" onclick="LobbyManagementService.showEditLobbyDialog('${division}', '${lobby}')">✏️ Edit</button>
                  <button class="btn-sm" style="font-size: 11px; padding: 4px 8px; background: #ffebee; color: #c62828;" onclick="LobbyManagementService.showDeleteLobbyDialog('${division}', '${lobby}')">🗑️ Delete</button>
                </div>
              </div>
            `}).join('')}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  },
  
  // Show add lobby form
  showAddLobbyForm(user) {
    // Check permission
    if (!PermissionsService.canAddLobbyOwn(user, user.division)) {
      showNotification(PermissionsService.getPermissionError('add lobbies'), 'error');
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
      <div class="modal-overlay show" id="lobbyModal" onclick="if(event.target === this) LobbyManagementService.closeLobbyModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">➕ Add New Lobby</div>
            <button class="btn-close" onclick="LobbyManagementService.closeLobbyModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Division *</label>
              <select id="modalLobbyDivision" ${PermissionsService.isDivisionAdmin(user) ? 'disabled' : ''}>
                ${divisionOptions}
              </select>
            </div>
            
            <div class="form-group">
              <label>Lobby Name * <span style="font-size: 10px; color: #888;">(e.g., BKN - Bikaner Jn.)</span></label>
              <input id="modalLobbyName" type="text" placeholder="Enter lobby name" value="" autocomplete="off" />
            </div>
          </div>
          
          <div id="lobbyModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="LobbyManagementService.closeLobbyModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="LobbyManagementService.submitAddLobby()">💾 Save Lobby</button>
          </div>
        </div>
      </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('lobbyModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },
  
  // Submit add lobby
  async submitAddLobby() {
    const division = document.getElementById('modalLobbyDivision').value;
    const lobbyNameInput = document.getElementById('modalLobbyName');
    const lobbyName = lobbyNameInput.value.trim();
    const errorElem = document.getElementById('lobbyModalError');
    
    console.log('[DEBUG] submitAddLobby - Raw input value:', lobbyNameInput.value);
    console.log('[DEBUG] submitAddLobby - Trimmed lobby name:', lobbyName);
    console.log('[DEBUG] submitAddLobby - Division:', division);
    
    if (!lobbyName) {
      errorElem.textContent = 'Please enter lobby name';
      return;
    }
    
    const result = await this.addLobby(division, lobbyName);
    
    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeLobbyModal();
      // Small delay to ensure data is properly saved before UI refresh
      setTimeout(() => {
        // Reload lobby list
        const container = document.getElementById('lobbyListContainer');
        if (container) {
          container.innerHTML = this.renderLobbyManagement(AuthService.getUser());
        }
      }, 100);
    } else {
      errorElem.textContent = result.message;
    }
  },
  
  // Show edit lobby dialog
  showEditLobbyDialog(division, oldName) {
    const user = AuthService.getUser();
    
    const modalHTML = `
      <div class="modal-overlay show" id="lobbyModal" onclick="if(event.target === this) LobbyManagementService.closeLobbyModal()">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">✏️ Edit Lobby</div>
            <button class="btn-close" onclick="LobbyManagementService.closeLobbyModal()">✖</button>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Division</label>
              <input type="text" value="${division.charAt(0).toUpperCase() + division.slice(1)}" disabled />
            </div>
            
            <div class="form-group">
              <label>Lobby Name *</label>
              <input id="modalLobbyName" type="text" value="${oldName}" />
            </div>
          </div>
          
          <div id="lobbyModalError" class="error-message"></div>
          
          <div class="modal-actions">
            <button class="btn-sm" onclick="LobbyManagementService.closeLobbyModal()">Cancel</button>
            <button class="btn-sm btn-primary" onclick="LobbyManagementService.submitEditLobby('${division}', '${oldName}')">💾 Update</button>
          </div>
        </div>
      </div>
    `;
    
    const existingModal = document.getElementById('lobbyModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },
  
  // Submit edit lobby
  async submitEditLobby(division, oldName) {
    const newName = document.getElementById('modalLobbyName').value.trim();
    const errorElem = document.getElementById('lobbyModalError');
    
    if (!newName) {
      errorElem.textContent = 'Please enter lobby name';
      return;
    }
    
    const result = await this.editLobby(division, oldName, newName);
    
    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      this.closeLobbyModal();
      const container = document.getElementById('lobbyListContainer');
      if (container) {
        container.innerHTML = this.renderLobbyManagement(AuthService.getUser());
      }
    } else {
      errorElem.textContent = result.message;
    }
  },
  
  // Show delete confirmation dialog
  async showDeleteLobbyDialog(division, lobbyName) {
    if (!confirm(`🗑️ Are you sure you want to delete "${lobbyName}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    const result = await this.deleteLobby(division, lobbyName);
    
    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      const container = document.getElementById('lobbyListContainer');
      if (container) {
        container.innerHTML = this.renderLobbyManagement(AuthService.getUser());
      }
    } else {
      showNotification(`❌ ${result.message}`, 'error');
    }
  },
  
  // Close modal
  closeLobbyModal() {
    const modal = document.getElementById('lobbyModal');
    if (modal) {
      modal.remove();
    }
  }
};
