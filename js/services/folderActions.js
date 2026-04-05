// Folder Edit/Delete Modal Functions
// These functions are added to ContentManagementService

// Add to ContentManagementService object:

ContentManagementService.showEditFolderModal = function(targetId, folderId, currentName, targetName) {
  const modalHTML = `
    <div class="modal-overlay show" id="editFolderModal" onclick="if(event.target === this) { document.getElementById('editFolderModal').remove(); }">
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
          <div class="modal-title">✏️ Edit Folder Name</div>
          <button class="btn-close" onclick="document.getElementById('editFolderModal').remove()">✖</button>
        </div>
        
        <div class="form-group">
          <label>Folder Name *</label>
          <input id="editFolderNameInput" type="text" placeholder="Enter new folder name" value="${currentName.replace(/"/g, '&quot;')}" style="width: 100%;" />
        </div>
        
        <div id="editFolderError" class="error-message"></div>
        
        <div class="modal-actions">
          <button class="btn-sm" onclick="document.getElementById('editFolderModal').remove()">Cancel</button>
          <button class="btn-sm btn-primary" onclick="ContentManagementService.submitEditFolder('${targetId}', '${folderId}', '${targetName}')">💾 Save</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('editFolderNameInput')?.focus();
};

ContentManagementService.submitEditFolder = function(targetId, folderId, targetName) {
  const newFolderName = document.getElementById('editFolderNameInput')?.value.trim();
  const errorElem = document.getElementById('editFolderError');
  const user = AuthService.getUser();
  
  if (!newFolderName) {
    errorElem.textContent = 'Please enter folder name';
    return;
  }
  
  const result = this.editFolder(targetId, folderId, newFolderName, user);
  
  if (result.success) {
    showNotification(`✅ ${result.message}`, 'success');
    document.getElementById('editFolderModal')?.remove();
    
    // Refresh page
    const structure = this.getContentStructure();
    const isMainTab = structure.mainTabs.some(t => t.id === targetId);
    
    if (isMainTab) {
      const mainTab = structure.mainTabs.find(t => t.id === targetId);
      const pageName = mainTab.name.toLowerCase().replace(/\s+/g, '');
      let contentContainer = document.getElementById('divisionContent');
      if (!contentContainer) {
        contentContainer = document.getElementById('appContent');
      }
      if (contentContainer) {
        DepartmentsPage.render(contentContainer, pageName);
      }
    } else {
      this.showFilesList(targetId, targetName);
    }
  } else {
    errorElem.textContent = result.message;
  }
};

ContentManagementService.deleteFolderConfirm = function(targetId, folderId, folderName, targetName) {
  if (confirm(`Are you sure you want to delete the folder "${folderName}"?\n\nNote: The folder must be empty (no files inside) to delete it.`)) {
    const user = AuthService.getUser();
    const result = this.deleteFolder(targetId, folderId, user);
    
    if (result.success) {
      showNotification(`✅ ${result.message}`, 'success');
      
      // Refresh page
      const structure = this.getContentStructure();
      const isMainTab = structure.mainTabs.some(t => t.id === targetId);
      
      if (isMainTab) {
        const mainTab = structure.mainTabs.find(t => t.id === targetId);
        const pageName = mainTab.name.toLowerCase().replace(/\s+/g, '');
        let contentContainer = document.getElementById('divisionContent');
        if (!contentContainer) {
          contentContainer = document.getElementById('appContent');
        }
        if (contentContainer) {
          DepartmentsPage.render(contentContainer, pageName);
        }
      } else {
        this.showFilesList(targetId, targetName);
      }
    } else {
      showNotification(`❌ ${result.message}`, 'error');
    }
  }
};
