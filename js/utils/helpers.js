// Helper Utility Functions

// Generate beautiful file card HTML (responsive)
function generateFileCard(file, index, options = {}) {
  const {
    canDelete = false,
    onView = `ContentManagementService.viewFile('${file.id}')`,
    onDelete = `ContentManagementService.deleteFile('${options.tabId}', '${file.id}')`,
    tabId = ''
  } = options;

  const fileIcon = {
    'pdf': '📄',
    'image': '🖼️',
    'excel': '📊',
    'url': '🔗',
    'html': '🌐',
    'message': '💬',
    'notice': '📢'
  }[file.type] || '📁';

  const fileColor = {
    'pdf': '#dc2626',
    'image': '#7c3aed',
    'excel': '#059669',
    'url': '#0891b2',
    'html': '#ea580c',
    'message': '#f59e0b',
    'notice': '#d97706'
  }[file.type] || '#6b7280';

  const date = file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  const dateShort = file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A';

  return `
    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%); border: 2px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px; transition: all 0.3s ease;"
         onmouseover="this.style.borderColor='${fileColor}'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.2)'; this.style.transform='translateY(-2px)';" 
         onmouseout="this.style.borderColor='rgba(59, 130, 246, 0.2)'; this.style.boxShadow='none'; this.style.transform='translateY(0)';">
      
      <!-- Desktop Layout -->
      <div class="file-card-desktop" style="display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: ${fileColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; position: relative;">
            ${fileIcon}
            ${(file.is_new && file.type !== 'html' && file.type !== 'message') ? `
              <span class="new-badge-v2" style="
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ef4444;
                color: white;
                font-size: 8px;
                font-weight: 800;
                padding: 2px 5px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
                border: 1.5px solid white;
                animation: pulse-red 2s infinite;
              ">NEW</span>
            ` : ''}
          </div>
          <div style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; font-weight: 700; font-size: 14px; padding: 4px 12px; border-radius: 6px;">#${index + 1}</div>
        </div>
        
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
            <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary);">${file.name || 'Untitled'}</h4>
            <span style="background: ${fileColor}; color: white; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${file.type || 'file'}</span>
            ${(file.is_new && file.type !== 'html' && file.type !== 'message') ? `<span style="background: #ef4444; color: white; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 10px; text-transform: uppercase; animation: pulse-red 2s infinite;">NEW</span>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            ${file.description ? `<p style="margin: 0; font-size: 13px; color: var(--text-secondary); flex: 1; max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.description.substring(0, 80)}${file.description.length > 80 ? '...' : ''}</p>` : ''}
            <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);">
              <span>📅</span><span>${date}</span>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
          <button class="btn-sm btn-primary" onclick="event.stopPropagation(); if(window.NotificationServiceV2) NotificationServiceV2.markFileAsViewed('${file.server_file_id || file.id.replace('server_', '')}'); ${onView}" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; white-space: nowrap;"><span>👁️</span><span>View</span></button>
          ${canDelete ? `<button class="btn-sm" onclick="event.stopPropagation(); ${onDelete}" style="background: #dc2626; color: white; display: flex; align-items: center; gap: 6px; padding: 8px 16px; white-space: nowrap;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'"><span>🗑️</span><span>Delete</span></button>` : ''}
        </div>
      </div>
      
      <!-- Mobile Layout -->
      <div class="file-card-mobile" style="display: none;">
        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
          <div style="width: 48px; height: 48px; background: ${fileColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">${fileIcon}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 4px;">#${index + 1}</span>
              <span style="background: ${fileColor}; color: white; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${file.type || 'file'}</span>
            </div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${file.name || 'Untitled'}
              ${(file.is_new && file.type !== 'html' && file.type !== 'message') ? `<span style="background: #ef4444; color: white; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 8px; text-transform: uppercase; margin-left: 6px; vertical-align: middle;">NEW</span>` : ''}
            </h4>
          </div>
        </div>
        ${file.description ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${file.description.substring(0, 100)}${file.description.length > 100 ? '...' : ''}</p>` : ''}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(59, 130, 246, 0.1);">
          <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);"><span>📅</span><span>${dateShort}</span></div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-sm btn-primary" onclick="event.stopPropagation(); ${onView}" style="display: flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 13px;"><span>👁️</span><span>View</span></button>
            ${canDelete ? `<button class="btn-sm" onclick="event.stopPropagation(); ${onDelete}" style="background: #dc2626; color: white; padding: 6px 12px; font-size: 13px;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'"><span>🗑️</span></button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Check if mobile device
function isMobile() {
  return window.innerWidth <= 767;
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Copy text to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showNotification('✅ Copied to clipboard!', 'success');
      })
      .catch(() => {
        fallbackCopyToClipboard(text);
      });
  } else {
    fallbackCopyToClipboard(text);
  }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand('copy');
    showNotification('✅ Copied to clipboard!', 'success');
  } catch (err) {
    showNotification('❌ Failed to copy', 'error');
  }

  document.body.removeChild(textArea);
}

// Show beautiful unauthorized access error popup
function showUnauthorizedPopup(message = "You don't have permission to access this feature.") {
  // Remove any existing popup
  const existingPopup = document.getElementById('unauthorized-popup');
  if (existingPopup) existingPopup.remove();

  const popupHTML = `
    <div id="unauthorized-popup" style="
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      animation: fadeIn 0.3s ease;
      padding: 20px;
    ">
      <div style="
        background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
        border-radius: 24px;
        padding: 40px;
        max-width: 450px;
        width: 90%;
        text-align: center;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3), 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(239, 68, 68, 0.2);
      ">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #ef4444, #f87171);"></div>
        
        <div style="
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2);
          border: 2px solid #fecaca;
        ">
          <span style="font-size: 40px; color: #ef4444;">⚠️</span>
        </div>
        
        <h2 style="
          font-size: 24px;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        ">Access Denied</h2>
        
        <p style="
          font-size: 16px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 32px;
        ">${message}</p>
        
        <div style="display: flex; justify-content: center; gap: 12px;">
          <button onclick="document.getElementById('unauthorized-popup').remove()" style="
            padding: 14px 28px;
            border-radius: 12px;
            border: 2px solid #ef4444;
            background: transparent;
            color: #ef4444;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.background='#ef4444'; this.style.color='white';" 
             onmouseout="this.style.background='transparent'; this.style.color='#ef4444';">Close</button>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes fadeIn { 
        from { opacity: 0; } 
        to { opacity: 1; } 
      }
      
      @keyframes slideUp { 
        from { 
          opacity: 0; 
          transform: translateY(30px) scale(0.95); 
        } 
        to { 
          opacity: 1; 
          transform: translateY(0) scale(1); 
        } 
      }
      
      #unauthorized-popup:hover {
        cursor: pointer;
      }
    </style>
  `;

  document.body.insertAdjacentHTML('beforeend', popupHTML);

  // Close on backdrop click
  document.getElementById('unauthorized-popup').addEventListener('click', (e) => {
    if (e.target.id === 'unauthorized-popup') {
      document.getElementById('unauthorized-popup').remove();
    }
  });

  // Auto close after 5 seconds
  setTimeout(() => {
    const popup = document.getElementById('unauthorized-popup');
    if (popup) {
      popup.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => popup.remove(), 300);
    }
  }, 5000);
}

// Show notification - Clean White Toast
function showNotification(message, type = 'info', duration = 3500) {
  // Inject styles once
  if (!document.getElementById('toast-styles')) {
    const s = document.createElement('style');
    s.id = 'toast-styles';
    s.textContent = `
      #toast-container { position:fixed; top:72px; right:16px; z-index:999999; display:flex; flex-direction:column; gap:10px; max-width:340px; pointer-events:none; }
      .toast-notification { display:flex; align-items:stretch; pointer-events:auto; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.12),0 1px 6px rgba(0,0,0,0.07); background:#fff; border:1px solid #e5e7eb; transform:translateX(calc(100% + 20px)); opacity:0; transition:transform 0.38s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s ease; position:relative; min-width:260px; }
      .toast-notification.toast-in { transform:translateX(0); opacity:1; }
      .toast-notification.toast-out { transform:translateX(calc(100% + 20px)); opacity:0; transition:transform 0.25s ease,opacity 0.2s ease; }
      .t-bar { width:4px; flex-shrink:0; }
      .t-icon { width:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0; padding:12px 0 12px 10px; }
      .t-icon-b { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; }
      .t-body { flex:1; padding:11px 8px 11px 10px; min-width:0; }
      .t-title { font-size:13px; font-weight:700; color:#111827; margin-bottom:2px; }
      .t-msg { font-size:12px; color:#6b7280; line-height:1.5; word-wrap:break-word; }
      .t-close { background:none; border:none; padding:10px; cursor:pointer; color:#9ca3af; font-size:16px; line-height:1; flex-shrink:0; align-self:flex-start; }
      .t-close:hover { color:#374151; }
      .t-prog { position:absolute; bottom:0; left:4px; right:0; height:2px; border-radius:0 0 12px 0; transform-origin:left; animation:t-shrink linear forwards; }
      @keyframes t-shrink { from{transform:scaleX(1);} to{transform:scaleX(0);} }
      @keyframes t-shake { 0%,100%{transform:translateX(0);} 15%,45%,75%{transform:translateX(-5px);} 30%,60%,90%{transform:translateX(5px);} }
      .toast-notification:hover { box-shadow:0 8px 28px rgba(0,0,0,0.14); }
      @media(max-width:480px){ #toast-container{top:60px;right:10px;left:10px;max-width:none;} .toast-notification{min-width:0;} }
    `;
    document.head.appendChild(s);
  }

  let tc = document.getElementById('toast-container');
  if (!tc) { tc = document.createElement('div'); tc.id = 'toast-container'; document.body.appendChild(tc); }

  const C = {
    success: { c: '#10b981', bg: '#d1fae5', ic: '#059669', i: '✓', t: 'Success' },
    error: { c: '#ef4444', bg: '#fee2e2', ic: '#dc2626', i: '✕', t: 'Error' },
    warning: { c: '#f59e0b', bg: '#fef3c7', ic: '#d97706', i: '⚠', t: 'Warning' },
    info: { c: '#3b82f6', bg: '#dbeafe', ic: '#2563eb', i: 'ℹ', t: 'Info' }
  }[type] || { c: '#3b82f6', bg: '#dbeafe', ic: '#2563eb', i: 'ℹ', t: 'Info' };

  const msg = message.replace(/^[✅❌⚠️ℹ️🚧✓✕🚀🔔📢]+\s*/u, '');

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="t-bar" style="background:${C.c};"></div>
    <div class="t-icon"><div class="t-icon-b" style="background:${C.bg};color:${C.ic};">${C.i}</div></div>
    <div class="t-body">
      <div class="t-title">${C.t}</div>
      <div class="t-msg">${msg}</div>
    </div>
    <button class="t-close" onclick="this.closest('.toast-notification').remove()">×</button>
    <div class="t-prog" style="background:${C.c};animation-duration:${duration}ms;"></div>
  `;

  tc.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-in')));

  if (type === 'error') setTimeout(() => { toast.style.animation = 't-shake 0.5s ease'; }, 420);

  const timer = setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 280);
  }, duration);

  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => {
    setTimeout(() => { toast.classList.add('toast-out'); setTimeout(() => toast.remove(), 280); }, 1500);
  });
}

// Format date
function formatDate(date) {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleString('en-IN', options);
}

// Capitalize first letter
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate unique ID
function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Data URL to Blob conversion
function dataURLtoBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new Blob([u8arr], { type: mime });
}

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Get initials from name
function getInitials(name) {
  if (!name) return '';
  return name
    .split(/\s+/)
    .map(word => word[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 3);
}
