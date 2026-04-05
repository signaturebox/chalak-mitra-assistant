// Files Page - Dedicated page for viewing files in division/lobby tabs
var FilesPage = {
  currentTabId: null,
  currentTabName: null,
  currentLobby: null,
  currentDivision: null,

  // Render files page
  async render(tabId, tabName, lobby = null, division = null) {
    this.currentTabId = tabId;
    this.currentTabName = tabName;
    this.currentLobby = lobby;
    this.currentDivision = division;

    // Set current view for real-time sync
    if (window.RealtimeSyncV2) {
      window.RealtimeSyncV2.setCurrentView(tabId, tabName, lobby);
    }

    const user = AuthService.getUser();

    // Fetch latest files from server before rendering
    // (This also returns fresh is_new flags per file from the server)
    await ContentManagementService.fetchAndSyncFiles(tabId);

    // NOTE: We do NOT call markSectionAsViewed() here anymore.
    // Badges/NEW tags are cleared only when a crew member actually opens/views a specific file
    // via markFileAsViewed() (called from the View button in helpers.js generateFileCard).


    const structure = ContentManagementService.getContentStructure();
    const allFiles = structure.files[tabId] || [];

    // Filter files based on lobby if specified
    const files = lobby
      ? allFiles.filter(f => {
        if (f.lobby === lobby) return true;
        if (f.folder && structure.folders[f.folder]?.lobby === lobby) return true;
        return false;
      })
      : allFiles;

    // Separate message cards, HTML content, and other files
    const messageCards = files.filter(f => f.type === 'message');
    const htmlContent = files.filter(f => f.type === 'html');
    const otherFiles = files.filter(f => f.type !== 'message' && f.type !== 'html');

    const folders = Object.values(structure.folders).filter(f => f.targetId === tabId);

    // Check if user can upload/manage files
    const canManageFiles = user.role !== 'crew';

    const container = document.getElementById('mainContent');
    container.innerHTML = `
      <div class="page active" id="filesPage">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div class="page-title">📂 ${tabName}${lobby ? ` - ${lobby}` : ''}</div>
            <div class="muted" style="font-size: 13px; margin-top: 4px;">
              ${files.length} file${files.length !== 1 ? 's' : ''} ${lobby ? 'in this lobby' : 'uploaded'}
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            ${canManageFiles ? `
            <button class="btn-modern btn-primary" onclick="ContentManagementService.showUploadFileModal('${tabId}', 'division_tab'${lobby ? `, '${lobby}'` : ''})">
              <span class="material-icons">upload_file</span>
              <span>Upload New File</span>
            </button>
            ` : ''}
            <button class="btn-sm" onclick="FilesPage.goBack()">← Back</button>
          </div>
        </div>
        
        ${canManageFiles ? `
        <div class="card" style="margin-bottom: 20px;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${!lobby ? `
            <button class="btn-modern" onclick="ContentManagementService.showAddFolderModal('${tabId}', '${tabName}')">
              <span class="material-icons">create_new_folder</span>
              <span>Create Folder</span>
            </button>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        ${folders.length > 0 && !lobby ? `
        <div class="card" style="margin-bottom: 20px;">
          <div class="card-title">📁 Folders</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 12px;">
            ${folders.map((folder, index) => {
      const folderFiles = files.filter(f => f.folder === folder.id);
      return `
                <div style="background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%); border: 2px solid #00acc1; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.3s; position: relative;"
                     onclick="FilesPage.showFolderFiles('${folder.id}', '${folder.name}')"
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
        
        ${messageCards.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <div style="display: grid; gap: 24px;">
            ${messageCards.map((file, index) => {
      return `
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
                    <button class="btn-sm btn-primary" onclick="FilesPage.viewFile('${file.id}')" style="display: flex; align-items: center; gap: 6px;">
                      <span>👁️</span><span>View Full</span>
                    </button>
                    <button class="btn-sm" onclick="FilesPage.deleteFile('${file.id}')" style="background: #dc2626; color: white;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                      <span>🗑️</span><span>Delete</span>
                    </button>
                  </div>
                  ` : ''}
                </div>
              `;
    }).join('')}
          </div>
        </div>
        ` : ''}
        
        ${htmlContent.length > 0 ? `
        <div style="margin-bottom: 24px;">
          ${htmlContent.map((file, idx) => {
      // Get display title - prefer title field, then name
      const displayTitle = file.title || file.name || 'HTML Content';
      const uniqueId = 'files-html-content-' + file.id + '-' + Date.now() + '-' + idx;

      return `
            <div class="html-content-native" style="margin-bottom: 32px; width: 100%;">
              <!-- Full-width HTML Content - Shadow DOM rendering, no scrollbars -->
              <div id="${uniqueId}" class="html-render-container" style="width: 100%; overflow: visible;" 
                   data-css="${encodeURIComponent(file.content?.css || '')}" 
                   data-html="${encodeURIComponent(file.content?.html || '')}" 
                   data-js="${encodeURIComponent(file.content?.js || '')}"
                   data-table="${file.content?.displayAsTable === true ? 'true' : 'false'}">
              </div>
              
              ${canManageFiles ? `
              <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; padding: 12px; margin-top: 16px; background: #f9fafb; border-radius: 8px;">
                <button class="btn-sm" onclick="FilesPage.viewFullHTML('${file.id}', '${tabId}')" style="background: #3b82f6; color: white; display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 13px;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                  <span>👁️</span><span>View Full</span>
                </button>
                <button class="btn-sm" onclick="FilesPage.editHTMLContent && FilesPage.editHTMLContent('${file.id}', '${tabId}')" style="background: #10b981; color: white; display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 13px;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                  <span>✏️</span><span>Edit</span>
                </button>
                <button class="btn-sm" onclick="FilesPage.deleteFile('${file.id}')" style="background: #dc2626; color: white; display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 13px;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                  <span>🗑️</span><span>Delete</span>
                </button>
              </div>
              ` : ''}
            </div>
          `}).join('')}
        </div>
        ` : ''}
        
        ${otherFiles.length > 0 ? `
        <div class="card">
          <div class="card-title">📄 Other Files (${otherFiles.length})</div>
          
          <div style="display: grid; gap: 12px; margin-top: 16px;">
            ${otherFiles.map((file, index) => {
        // NEW badge: use server-computed is_new flag (works for all tabs: main, division, lobby)
        if (window.NotificationServiceV2) {
          // Pass the full file object so isFileNew can use server's is_new flag directly
          file.is_new = NotificationServiceV2.isFileNew(file);
        } else {
          // Fallback: use is_new returned directly from server API
          file.is_new = !!file.is_new;
        }

        // Use the central helper to generate the file card
        return generateFileCard(file, index, {
          canDelete: canManageFiles,
          onView: `FilesPage.viewFile('${file.id}')`,
          onDelete: `FilesPage.deleteFile('${file.id}')`,
          tabId: tabId // Pass tabId if needed for specific actions
        });
      }).join('')}
          </div>
        </div>
        ` : ''}
        
        ${messageCards.length === 0 && htmlContent.length === 0 && otherFiles.length === 0 ? `
        <div class="card">
          <div style="text-align: center; padding: 60px 20px; color: #999;">
            <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No files uploaded yet</div>
            <div style="font-size: 14px;">${canManageFiles ? 'Click "Upload New File" to add your first file' : 'Files will appear here when uploaded'}</div>
          </div>
        </div>
        ` : ''
      }
      </div >
  `;

    // Initialize HTML content rendering
    this.initializeHTMLContainers();

    // Scroll to top of everything
    const contentScroll = document.querySelector('.content-scroll');
    if (contentScroll) contentScroll.scrollTop = 0;
    window.scrollTo(0, 0);

    // Refresh notification badges after rendering
    if (window.NotificationServiceV2) {
      setTimeout(() => NotificationServiceV2.updateUI(), 100);
    }
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

  // Show folder files
  showFolderFiles(folderId, folderName) {
    this.currentFolderId = folderId;
    this.currentFolderName = folderName;

    const structure = ContentManagementService.getContentStructure();
    const allFiles = structure.files[this.currentTabId] || [];
    const files = allFiles.filter(f => f.folder === folderId);

    const user = AuthService.getUser();
    const canManageFiles = user.role !== 'crew';

    const container = document.getElementById('mainContent');
    container.innerHTML = `
      <div class="page active" id="folderFilesPage">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div class="page-title">📂 ${folderName}</div>
            <div class="muted" style="font-size: 13px; margin-top: 4px;">
              ${files.length} file${files.length !== 1 ? 's' : ''} in this folder
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-sm" onclick="FilesPage.render('${this.currentTabId}', '${this.currentTabName}', ${this.currentLobby ? `'${this.currentLobby}'` : 'null'})">← Back to All Files</button>
          </div>
        </div>

        ${canManageFiles ? `
        <div class="card" style="margin-bottom: 20px;">
          <button class="btn-modern btn-primary" onclick="ContentManagementService.showUploadFileModal('${this.currentTabId}', 'division_tab')">
            <span class="material-icons">upload_file</span>
            <span>Upload File to Folder</span>
          </button>
        </div>
        ` : ''}

        <div class="card">
          <div class="card-title">📄 Folder Contents</div>

          ${files.length === 0 ? `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
              <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
              <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No files in this folder</div>
            </div>
          ` : `
            <div style="display: grid; gap: 12px; margin-top: 16px;">
              ${files.map((file, index) => generateFileCard(file, index, {
      canDelete: canManageFiles,
      onView: `ContentManagementService.viewFile('${file.id}')`,
      onDelete: `FilesPage.deleteFile('${file.id}')`,
      tabId: this.currentTabId
    })).join('')}
            </div>
          `}
        </div>
      </div>
      `;
  },

  // Delete file
  async deleteFile(fileId) {
    await ContentManagementService.deleteFile(this.currentTabId, fileId);
    // Auto-refresh is handled by ContentManagementService.deleteFile
  },

  // View file
  viewFile(fileId) {
    // Mark file as viewed to remove "New" badge
    if (window.NotificationServiceV2) {
      NotificationServiceV2.markFileAsViewed(fileId);
    }
    ContentManagementService.viewFile(fileId);
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

    // Create full-screen modal
    const modalHTML = `
      <div class="modal-overlay show" id="htmlViewModal" style="z-index: 10000;">
        <div style="background: white; width: 95vw; height: 95vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 16px 24px; color: white; display: flex; justify-content: flex-end; align-items: center;">
            <button class="btn-close" onclick="document.getElementById('htmlViewModal').remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px;">✖</button>
          </div>
          <div style="flex: 1; overflow: auto; padding: 24px; background: #f8fafc;">
            <div style="background: white; border-radius: 12px; border: 2px solid #e5e7eb; overflow: hidden; min-height: 100%;">
              <div id="htmlFullPreview" style="padding: 24px;"></div>
            </div>
          </div>
        </div>
      </div>
      `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const preview = document.getElementById('htmlFullPreview');
    if (preview) {
      const css = file.content?.css || '';
      const html = file.content?.html || '';
      const js = file.content?.js || '';
      const asTable = file.content?.displayAsTable === true;
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
${asTable ? `thead th, tbody td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; } tbody tr:nth-child(odd) { background: #f9fafb; } th { background: #f3f4f6; font-weight: 600; }` : ''}
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
      iframe.style.cssText = 'width: 100%; height: 600px; border: none; display: block; overflow: hidden;';
      iframe.scrolling = 'no';

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

  // Go back to previous page
  goBack() {
    console.log('[FilesPage] goBack - history.back()');
    history.back();
  }
};
