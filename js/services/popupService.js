/**
 * Popup Service
 * 
 * Manages scheduled popup messages for users
 * - Fetches active popups from server
 * - Displays popups based on schedule
 * - Tracks viewed popups
 */

const PopupService = {
  popups: [],
  currentPopupIndex: 0,
  isShowing: false,
};

// Make available globally immediately
window.PopupService = PopupService;

// Emergency Global Close - Direct DOM removal
window.EXIT_POPUP_NOW = function() {
  console.log('[Popup] Emergency Exit Triggered');
  
  // 1. Force remove from DOM immediately
  const overlay = document.getElementById('scheduledPopup');
  if (overlay) {
    overlay.remove();
  }
  
  // 2. Remove any other overlays by class just in case
  const extras = document.querySelectorAll('.popup-overlay');
  extras.forEach(e => e.remove());
  
  // 3. Restore scrolling
  document.body.style.overflow = '';
  
  // 4. Update service state if available
  if (window.PopupService) {
    window.PopupService.isShowing = false;
    window.PopupService.currentPopupIndex++;
    
    // Check for next popup after a delay
    setTimeout(() => {
      if (window.PopupService && typeof window.PopupService.showNextPopup === 'function') {
        window.PopupService.showNextPopup();
      }
    }, 800);
  }
};

// Global robust close function as ultimate fallback
window.closeAppPopup = window.EXIT_POPUP_NOW;

// Extend the object with methods
Object.assign(PopupService, {

  /**
   * Initialize popup service
   */
  init() {
    console.log('[PopupService] Initializing...');
    this.fetchPopups();

    // Check for new popups periodically
    setInterval(() => {
      this.fetchPopups();
    }, 60000); // Check every minute

    // Listen for real-time popup updates
    if (window.RealtimeSyncService) {
      RealtimeSyncService.on('popup', (data) => {
        console.log('[PopupService] Real-time popup received:', data);
        this.handleRealtimePopup(data);
      });
    }
  },

  /**
   * Fetch popups from server
   * Shows popups for all users including non-logged in users
   */
  async fetchPopups() {
    try {
      const baseUrl = Api.getBaseUrl ? Api.getBaseUrl() : '/api';
      const user = AuthService.getUser();

      // Build params - user_id is optional for public popups
      const params = new URLSearchParams();
      if (user) {
        const userId = user.serverId || user.id || user.cms || user.cms_id;
        if (userId) {
          params.append('user_id', userId);
        }
      }

      const response = await fetch(`${baseUrl}/popups/get_popups.php?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.popups) {
        this.popups = data.popups;
        console.log(`[PopupService] Loaded ${this.popups.length} popups`);

        // Show popups if any are available
        if (this.popups.length > 0 && !this.isShowing) {
          this.showNextPopup();
        }
      }
    } catch (error) {
      console.error('[PopupService] Failed to fetch popups:', error);
    }
  },

  /**
   * Handle real-time popup from SSE
   */
  handleRealtimePopup(data) {
    // Add to queue and show
    this.popups.unshift(data);
    if (!this.isShowing) {
      this.showNextPopup();
    }
  },

  /**
   * Show next popup in queue
   */
  showNextPopup() {
    if (this.popups.length === 0 || this.currentPopupIndex >= this.popups.length) {
      this.isShowing = false;
      this.currentPopupIndex = 0;
      return;
    }

    this.isShowing = true;
    const popup = this.popups[this.currentPopupIndex];
    this.displayPopup(popup);
  },

  /**
   * Display a popup
   * Uses Shadow DOM for HTML content to prevent CSS conflicts without scrollbars
   */
  displayPopup(popup) {
    // Remove any existing popup element without side effects
    const existingPopup = document.getElementById('scheduledPopup');
    if (existingPopup) {
      existingPopup.remove();
      document.body.style.overflow = '';
    }

    // Record view in database
    this.recordView(popup.id);

    const isHTML = popup.content_type === 'html';
    const hasImage = popup.image_url && popup.image_url.trim() !== '';
    const imagePosition = popup.image_position || 'top';

    // Build image HTML
    let imageHTML = '';
    if (hasImage) {
      const imageStyles = imagePosition === 'background'
        ? 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.15; z-index: 0;'
        : 'width: 100%; max-height: 250px; object-fit: cover; display: block;';

      imageHTML = `<img src="${this.escapeHtml(popup.image_url)}" alt="Popup Image" style="${imageStyles}" onerror="this.style.display='none'" />`;
    }

    // Build content HTML
    let contentHTML = '';
    if (isHTML) {
      // Use Shadow DOM container for HTML content
      contentHTML = `<div id="popupShadowHost" style="width: 100%;"></div>`;
    } else if (popup.content_type === 'image') {
      contentHTML = '<div style="color: #9ca3af; text-align: center; padding: 20px;">🖼️ Image Popup</div>';
    } else {
      contentHTML = `<div style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; color: #333;">${this.escapeHtml(popup.content || '')}</div>`;
    }

    const popupHTML = `
      <div id="scheduledPopup" class="popup-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: popupFadeIn 0.3s ease;
        overflow-y: auto;
      " onclick="if(event.target === this) { this.remove(); document.body.style.overflow=''; }">
        <div class="popup-content" id="popupContentContainer" style="
          background: white;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          margin: auto;
          overflow: visible;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: popupSlideIn 0.3s ease;
          position: relative;
        ">
          ${imagePosition === 'background' && hasImage ? imageHTML : ''}
          
          <!-- Header -->
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 16px 20px;
            color: white;
            position: relative;
            z-index: 1;
            border-radius: 12px 12px 0 0;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="margin: 0; font-size: 1.1rem; font-weight: 600;">${popup.title}</h2>
            </div>
            ${popup.target_division_name || popup.target_lobby_name ? `
            <div style="font-size: 12px; opacity: 0.9; margin-top: 6px;">
              📍 ${popup.target_division_name || ''} ${popup.target_lobby_name ? '• ' + popup.target_lobby_name : ''}
            </div>
            ` : ''}
          </div>
          
          ${imagePosition === 'top' && hasImage ? `<div style="padding: 16px 20px 0;">${imageHTML}</div>` : ''}
          
          <!-- Content -->
          <div id="popupBodyContent" style="
            padding: 20px;
            overflow: visible;
            position: relative;
            z-index: 1;
          ">
            ${contentHTML}
          </div>
          
          ${imagePosition === 'bottom' && hasImage ? `<div style="padding: 0 20px 16px;">${imageHTML}</div>` : ''}
          
          <!-- Footer -->
          <div style="
            padding: 12px 20px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            position: relative;
            z-index: 1;
            border-radius: 0 0 12px 12px;
          ">
            <button id="popupGotItBtn" 
              onclick="event.stopPropagation(); const p = this.closest('.popup-overlay'); if(p) p.remove(); document.body.style.overflow=''; if(window.PopupService) { window.PopupService.isShowing = false; window.PopupService.currentPopupIndex++; setTimeout(() => { if(window.PopupService) window.PopupService.showNextPopup(); }, 500); }"
              style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 12px 32px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
              pointer-events: auto !important;
              z-index: 100;
              position: relative;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">Got it</button>
          </div>

          <!-- Close Button - Placed last for maximum stacking priority -->
          <div id="popupCloseBtn" 
            onclick="event.stopPropagation(); const p = this.closest('.popup-overlay'); if(p) p.remove(); document.body.style.overflow=''; if(window.PopupService) { window.PopupService.isShowing = false; window.PopupService.currentPopupIndex++; setTimeout(() => { if(window.PopupService) window.PopupService.showNextPopup(); }, 400); }"
            style="
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.3);
            border: 2px solid white;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            z-index: 999999;
            pointer-events: auto !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          " onmouseover="this.style.background='rgba(255, 255, 255, 0.5)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.transform='scale(1)'">
            <span class="material-icons" style="font-size: 20px; pointer-events: none; font-weight: bold;">close</span>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes popupFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popupSlideIn {
          from { 
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (max-width: 768px) {
          .popup-content {
            max-width: 100% !important;
            margin: 8px !important;
            border-radius: 8px !important;
          }
          .popup-content > div:first-child {
            border-radius: 8px 8px 0 0 !important;
          }
          .popup-content > div:last-child {
            border-radius: 0 0 8px 8px !important;
          }
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Final Fallback: Double bind listeners
    setTimeout(() => {
      const closeBtn = document.getElementById('popupCloseBtn');
      const gotItBtn = document.getElementById('popupGotItBtn');
      if (closeBtn) {
        closeBtn.onclick = (e) => { e.stopPropagation(); window.EXIT_POPUP_NOW(); };
        closeBtn.ontouchstart = (e) => { e.stopPropagation(); window.EXIT_POPUP_NOW(); };
      }
      if (gotItBtn) {
        gotItBtn.onclick = (e) => { e.stopPropagation(); window.EXIT_POPUP_NOW(); };
        gotItBtn.ontouchstart = (e) => { e.stopPropagation(); window.EXIT_POPUP_NOW(); };
      }
    }, 200);

    // If HTML content, attach Shadow DOM
    if (isHTML && popup.content) {
      this.attachShadowContent(popup.content);
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  },

  /**
   * Attach HTML content using Shadow DOM for perfect isolation
   */
  attachShadowContent(htmlContent) {
    const host = document.getElementById('popupShadowHost');
    if (!host) return;

    // Create shadow root
    const shadow = host.attachShadow({ mode: 'closed' });

    // Create container with reset styles
    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    // Add reset styles to shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; width: 100%; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      ::slotted(*), * { 
        max-width: 100% !important; 
        overflow: visible !important;
      }
      img { max-width: 100%; height: auto; display: block; }
      table { width: 100%; border-collapse: collapse; }
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);
  },

  /**
   * Close current popup
   */
  closePopup() {
    console.log('[PopupService] Closing popup...');
    const popup = document.getElementById('scheduledPopup');
    if (popup) {
      popup.remove();
      document.body.style.overflow = '';
    }

    // Move to next popup
    this.currentPopupIndex++;

    // Small delay before showing next popup to allow for transitions
    setTimeout(() => {
      this.isShowing = false; // Reset to allow next popup
      this.showNextPopup();
    }, 400);
  },

  /**
   * Record a popup view on the server
   */
  async recordView(popupId) {
    try {
      const user = AuthService.getUser();
      const userId = user ? (user.serverId || user.id || user.cms || user.cms_id) : null;

      const baseUrl = Api.getBaseUrl ? Api.getBaseUrl() : '/api';
      await fetch(`${baseUrl}/popups/record_view.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          popup_id: popupId,
          user_id: userId
        })
      });
      console.log(`[PopupService] View recorded for popup ${popupId}`);
    } catch (error) {
      console.error('[PopupService] Failed to record view:', error);
    }
  },

  /**
   * Escape HTML for safe display
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Format datetime for display
   */
  formatDateTime(datetime) {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // ==================== Admin Functions ====================

  // Helper to get user ID from user object
  getUserId(user) {
    return user.serverId || user.id || user.cms || user.cms_id;
  },

  /**
   * Create a new popup (admin only)
   */
  async createPopup(popupData) {
    const user = AuthService.getUser();
    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }

    const userId = this.getUserId(user);
    if (!userId) {
      return { success: false, message: 'No valid user ID' };
    }

    try {
      const response = await Api.request('/popups/create_popup.php', {
        method: 'POST',
        body: JSON.stringify({
          ...popupData,
          created_by: userId
        })
      });

      return response;
    } catch (error) {
      console.error('[PopupService] Failed to create popup:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Get all popups for admin management
   */
  async getAllPopups() {
    const user = AuthService.getUser();
    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }

    const userId = this.getUserId(user);
    if (!userId) {
      return { success: false, message: 'No valid user ID' };
    }

    try {
      const baseUrl = Api.getBaseUrl ? Api.getBaseUrl() : '/api';
      const params = new URLSearchParams({
        user_id: userId,
        include_all: 'true'
      });

      const response = await fetch(`${baseUrl}/popups/get_popups.php?${params.toString()}`);
      return await response.json();
    } catch (error) {
      console.error('[PopupService] Failed to get popups:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Update a popup (admin only)
   */
  async updatePopup(popupId, updates) {
    const user = AuthService.getUser();
    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }

    const userId = this.getUserId(user);
    if (!userId) {
      return { success: false, message: 'No valid user ID' };
    }

    try {
      const response = await Api.request('/popups/update_popup.php', {
        method: 'POST',
        body: JSON.stringify({
          popup_id: popupId,
          user_id: userId,
          ...updates
        })
      });

      return response;
    } catch (error) {
      console.error('[PopupService] Failed to update popup:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Delete a popup (admin only)
   */
  async deletePopup(popupId) {
    const user = AuthService.getUser();
    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }

    const userId = this.getUserId(user);
    if (!userId) {
      return { success: false, message: 'No valid user ID' };
    }

    try {
      const response = await Api.request('/popups/delete_popup.php', {
        method: 'POST',
        body: JSON.stringify({
          popup_id: popupId,
          user_id: userId
        })
      });

      return response;
    } catch (error) {
      console.error('[PopupService] Failed to delete popup:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Toggle popup active status
   */
  async togglePopupStatus(popupId, isActive) {
    return this.updatePopup(popupId, { is_active: isActive ? 1 : 0 });
  }
});

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Delay to ensure AuthService and other services are ready
  setTimeout(() => {
    PopupService.init();
  }, 1500);
});
