// Admin Service
const AdminService = {
  // Initialize admin features
  init() {
    this.setupLogoUpload();
    this.setupZipDownload();
    this.refreshLogoPreview();
  },
  
  // Setup logo upload
  setupLogoUpload() {
    const uploaderInput = document.getElementById('siteLogoUploader');
    if (!uploaderInput) return;
    
    uploaderInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        showNotification('❌ Please upload an image file (PNG/JPEG).', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        Storage.saveLogo(dataUrl);
        this.refreshLogoPreview();
        this.updateHeaderLogo(dataUrl);
        showNotification('✅ Logo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    });
  },
  
  // Setup ZIP download
  setupZipDownload() {
    // Will be implemented when button is clicked from admin page
  },
  
  // Refresh logo preview
  refreshLogoPreview() {
    const logoData = Storage.loadLogo();
    const logoPreview = document.getElementById('logoPreview');
    
    if (logoPreview) {
      if (logoData) {
        logoPreview.innerHTML = `<img src="${logoData}" alt="Logo" />`;
      } else {
        logoPreview.innerHTML = '<div class="muted">No logo uploaded</div>';
      }
    }
    
    // Update header logo
    if (logoData) {
      this.updateHeaderLogo(logoData);
    }
  },
  
  // Update header logo
  updateHeaderLogo(dataUrl) {
    const headerLogo = document.getElementById('headerLogo');
    if (headerLogo) {
      headerLogo.innerHTML = `<img src="${dataUrl}" style="max-width: 40px; max-height: 40px; border-radius: 8px;" />`;
    }
  },
  
  // Download project as ZIP
  async downloadProjectZip() {
    try {
      const zip = new JSZip();
      
      // Add HTML
      const htmlContent = '<!doctype html>\n' + document.documentElement.outerHTML;
      zip.file('index.html', htmlContent);
      
      // Add logo if exists
      const logoData = Storage.loadLogo();
      if (logoData) {
        const logoBlob = dataURLtoBlob(logoData);
        zip.file('logo.png', logoBlob);
      }
      
      // Add README
      const readme = `NWR Chalak Mitra - Railway Crew Companion

This is a snapshot export from the web application.

Contents:
- index.html: Complete web application
- logo.png: Site logo (if uploaded)

Features:
- User role management (Crew, Admin)
- Quiz system with certificate generation
- Fault search database
- Division-wise content organization
- Responsive design (desktop + mobile)

Developed for North Western Railway
Date: ${new Date().toLocaleDateString()}`;
      
      zip.file('README.txt', readme);
      
      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `nwr_chalak_mitra_${new Date().toISOString().slice(0, 10)}.zip`);
      
      showNotification('✅ Project ZIP downloaded successfully!', 'success');
    } catch (e) {
      console.error('ZIP generation failed:', e);
      showNotification('❌ Failed to generate ZIP file.', 'error');
    }
  },

  // Support Ticket Methods
  async getAllSupportTickets() {
    const api = window.Api || AuthService.getApi();
    try {
        const response = await api.request('/support/get_all_tickets.php');
        return response;
    } catch (e) {
        console.error("API Error: getAllSupportTickets", e);
        return { success: false, error: e.message };
    }
  },

  async getTicketDetails(ticketId, viewerRole = 'admin') {
    const api = window.Api || AuthService.getApi();
    try {
        const response = await api.request(`/support/get_ticket_details.php?ticket_id=${ticketId}&viewer_role=${viewerRole}`);
        return response;
    } catch (e) {
        console.error("API Error: getTicketDetails", e);
        return { success: false, error: e.message };
    }
  },

  async replyToTicket(ticketId, reply, adminName) {
    const api = window.Api || AuthService.getApi();
    try {
        const response = await api.request('/support/reply_ticket.php', {
            method: 'POST',
            body: JSON.stringify({ ticket_id: ticketId, reply: reply, admin_name: adminName })
        });
        return response;
    } catch (e) {
        console.error("API Error: replyToTicket", e);
        return { success: false, error: e.message };
    }
  },

  async updateTicketStatus(ticketId, status) {
    const api = window.Api || AuthService.getApi();
    try {
        const response = await api.request('/support/update_ticket_status.php', {
            method: 'POST',
            body: JSON.stringify({ ticket_id: ticketId, status: status })
        });
        return response;
    } catch (e) {
        console.error("API Error: updateTicketStatus", e);
        return { success: false, error: e.message };
    }
  },

  // Feedback Methods
  async getAllFeedback() {
    const api = window.Api || AuthService.getApi();
    try {
        const response = await api.request('/feedback/get_all_feedback.php');
        return response;
    } catch (e) {
        console.error("API Error: getAllFeedback", e);
        return { success: false, error: e.message };
    }
  }
};

window.AdminService = AdminService;
