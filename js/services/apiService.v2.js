// API Service for NWR Chalak Mitra
class ApiService {
  constructor() {
    console.log('✓ API Service v2 initialized');
    this.token = localStorage.getItem('nwr_token') || null;
  }

  getBaseUrl() {
    // For debugging - check what pathname we're getting
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/').filter(part => part && part !== 'null' && part !== 'undefined');

    // If we're in a subdirectory (more than just the root), use that path
    if (pathParts.length > 0) {
      const firstDir = pathParts[0];

      // Look for variations of the app directory name
      if (firstDir && firstDir !== 'undefined' && firstDir !== 'null' && firstDir.toLowerCase().includes('nwr') &&
        (firstDir.toLowerCase().includes('chalak') || firstDir.toLowerCase().includes('mitra'))) {
        return `/${firstDir}/api`;
      } else {
        return '/api';
      }
    } else {
      return '/api';
    }
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('nwr_token', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('nwr_token');
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add token to headers if available
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);

      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON response, return as API unavailable
        return { error: 'API_NOT_AVAILABLE', message: 'PHP API not available', api_available: false };
      }

      // Try to parse JSON, but handle the case where it fails (e.g., 404 HTML page)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, likely received HTML instead of JSON
        return { error: 'API_NOT_AVAILABLE', message: 'PHP API not available', api_available: false };
      }

      // Check if the API endpoint exists (not a 404 error)
      if (response.status === 404) {
        // API endpoint not found, return special indicator
        return { error: 'API_ENDPOINT_NOT_FOUND', message: 'PHP API not available', api_available: false };
      }

      // Log the response for debugging
      console.log('API Response:', data);

      // Process the response regardless of status - the API is available
      // but may return error status codes for business logic reasons
      if (!response.ok) {
        // Return the response data with status info instead of throwing
        // This allows upper layers to handle different status codes appropriately
        return {
          ...data,
          success: false,
          error: data.message || data.error || `API request failed with status ${response.status}`,
          status: response.status
        };
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      // If it's a network error, parsing error, or any other error, the API might not be available
      // Return a safe response to allow the application to continue using localStorage fallback
      return { error: 'API_NOT_AVAILABLE', message: 'PHP API not available', api_available: false };
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success && response.token) {
      this.setToken(response.token);
      // Store user data in localStorage
      localStorage.setItem('nwr_user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Register admin (division admin or lobby admin)
  async registerAdmin(adminData) {
    return await this.request('/auth/register_admin', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
  }

  // Get user by ID
  async getUser(userId) {
    return await this.request(`/users/profile?id=${userId}`);
  }

  // Update user
  async updateUser(userId, userData) {
    return await this.request(`/users/profile?id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Delete user
  async deleteUser(userId) {
    return await this.request(`/users/profile?id=${userId}`, {
      method: 'DELETE'
    });
  }

  // User profile methods
  async getUserProfile(userId) {
    return await this.request(`/users/profile?id=${userId}`);
  }

  async updateUserProfile(userData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Get users for admin panel
  async getUsers(filters = {}) {
    let url = '/users/get_users';
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return await this.request(url);
  }

  // Fault search methods
  async searchFaults(query = '', type = 'all') {
    let url = `/search/fault_search`;
    const params = new URLSearchParams();

    if (query) params.append('q', query);
    if (type && type !== 'all') params.append('type', type);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return await this.request(url);
  }

  // Logbook methods
  async getLogbookEntries(userId) {
    return await this.request(`/logbook/get_entries.php?user_id=${userId}`);
  }

  async saveLogbookEntry(userId, entryData) {
    return await this.request('/logbook/save_entry.php', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        entry_data: entryData
      })
    });
  }

  async deleteLogbookEntry(userId, entryId) {
    return await this.request('/logbook/delete_entry.php', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        id: entryId
      })
    });
  }

  // Quiz methods
  async getQuizQuestions(category = 'mixed', limit = 10) {
    const params = new URLSearchParams({ category, limit });
    return await this.request(`/quiz/get_questions?${params.toString()}`);
  }

  async submitQuiz(quizData) {
    return await this.request('/quiz/submit_quiz', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  }

  async getQuizHistory(userId) {
    return await this.request(`/quiz/get_history?user_id=${userId}`);
  }



  async getAllQuizResults(role, userData) {
    let url = `/quiz/get_all_results?role=${role}`;

    // Add additional filters based on user data
    if (userData.division) {
      url += `&division=${encodeURIComponent(userData.division)}`;
    }
    if (userData.hq || userData.lobby) {
      url += `&lobby=${encodeURIComponent(userData.hq || userData.lobby)}`;
    }

    return await this.request(url);
  }

  // Quiz question management methods
  async getQuizQuestionsList(category = '') {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    return await this.request(`/quiz/manage_questions?${params.toString()}`);
  }

  async getQuizQuestionStats() {
    return await this.request('/quiz/manage_questions?action=stats');
  }

  async addQuizQuestion(questionData) {
    return await this.request('/quiz/manage_questions', {
      method: 'POST',
      body: JSON.stringify({ ...questionData, action: 'add' })
    });
  }

  async updateQuizQuestion(questionData) {
    return await this.request('/quiz/manage_questions', {
      method: 'POST',
      body: JSON.stringify({ ...questionData, action: 'update' })
    });
  }

  async deleteQuizQuestion(questionId) {
    return await this.request('/quiz/manage_questions', {
      method: 'POST',
      body: JSON.stringify({ id: questionId, action: 'delete' })
    });
  }

  async deleteQuizResult(resultId) {
    return await this.request('/quiz/delete_result.php', {
      method: 'POST',
      body: JSON.stringify({ id: resultId })
    });
  }

  async bulkUploadQuizQuestions(questions) {
    return await this.request('/quiz/manage_questions', {
      method: 'POST',
      body: JSON.stringify({ questions, action: 'bulk_upload' })
    });
  }

  // Tab Management methods
  async getTabs() {
    return await this.request('/tabs/manage_tabs.php');
  }

  async createTab(tabData) {
    return await this.request('/tabs/manage_tabs.php', {
      method: 'POST',
      body: JSON.stringify(tabData)
    });
  }

  async updateTab(tabData) {
    return await this.request('/tabs/manage_tabs.php', {
      method: 'PUT',
      body: JSON.stringify(tabData)
    });
  }

  async bulkUpdateTabs(tabs) {
    return await this.request('/tabs/manage_tabs.php', {
      method: 'PUT',
      body: JSON.stringify({
        action: 'bulk_update',
        tabs: tabs
      })
    });
  }

  async deleteTab(tabId) {
    return await this.request(`/tabs/manage_tabs.php?tab_id=${tabId}`, {
      method: 'DELETE'
    });
  }

  // Lobby methods
  async getLobbies(divisionId = null) {
    const params = new URLSearchParams();
    if (divisionId) params.append('division_id', divisionId);
    return await this.request(`/lobbies/get_lobbies.php?${params.toString()}`);
  }

  async createLobby(lobbyData) {
    return await this.request('/lobbies/manage_lobbies.php', {
      method: 'POST',
      body: JSON.stringify(lobbyData)
    });
  }

  async updateLobby(lobbyData) {
    return await this.request('/lobbies/manage_lobbies.php', {
      method: 'PUT',
      body: JSON.stringify(lobbyData)
    });
  }

  async deleteLobby(lobbyId) {
    return await this.request(`/lobbies/manage_lobbies.php?id=${lobbyId}`, {
      method: 'DELETE'
    });
  }

  // File methods
  async uploadFile(fileData) {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('user_id', fileData.user_id);
    formData.append('division_id', fileData.division_id || '');
    formData.append('lobby_id', fileData.lobby_id || '');
    formData.append('section', fileData.section || '');
    formData.append('category', fileData.category || '');
    formData.append('title', fileData.title || '');
    formData.append('description', fileData.description || '');

    const response = await fetch(`${this.getBaseUrl()}/files/file_upload`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header for FormData, let browser set it with boundary
        'Authorization': `Bearer ${this.token}`
      }
    });

    // Check if the response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON response, return as API unavailable
      return { error: 'API_NOT_AVAILABLE', message: 'PHP API not available', api_available: false };
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'File upload failed');
    }

    return data;
  }

  async getFiles(filters = {}) {
    let url = '/files/get_files';
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return await this.request(url);
  }

  async deleteFile(fileId) {
    return await this.request(`/files/delete_file?id=${fileId}`, {
      method: 'DELETE'
    });
  }

  // Upload content (URL, HTML, message) to server
  async uploadContent(contentData) {
    return await this.request('/files/content_upload', {
      method: 'POST',
      body: JSON.stringify({
        user_id: contentData.user_id,
        division_id: contentData.division_id || '',
        lobby_id: contentData.lobby_id || '',
        section: contentData.section || '',
        category: contentData.category || '',
        title: contentData.title || '',
        description: contentData.description || '',
        file_type: contentData.file_type || 'url',
        url: contentData.url || '',
        content: contentData.content || ''
      })
    });
  }

  // Notification methods
  async createNotification(notificationData) {
    return await this.request('/notifications/create_notification', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  async getNotifications(userId, options = {}) {
    const params = new URLSearchParams();
    params.append('user_id', userId);

    // Handle legacy signature or object options
    if (typeof options === 'string') {
      // Legacy: userId, role, division, limit
      params.append('role', options);
      if (arguments[2]) params.append('division', arguments[2]);
      params.append('limit', arguments[3] || 10);
    } else {
      // Options object: { role, division, lobby, limit, unread_only }
      if (options.role) params.append('role', options.role);
      if (options.division) params.append('division', options.division);
      if (options.lobby) params.append('lobby', options.lobby);
      if (options.limit) params.append('limit', options.limit);
      if (options.unread_only) params.append('unread_only', options.unread_only);
      if (options._t) params.append('_t', options._t); // Cache buster
    }

    return await this.request(`/notifications/get_notifications?${params.toString()}`);
  }

  async markNotificationRead(userId, notificationId, markAll = false) {
    return await this.request('/notifications/mark_read', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        notification_id: notificationId,
        mark_all: markAll
      })
    });
  }

  // System settings
  async getSystemSettings() {
    return await this.request('/system/get_settings');
  }

  // Support Ticket methods
  async createSupportTicket(ticketData) {
    return await this.request('/support/create_ticket.php', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  async getSupportTickets(userId) {
    return await this.request(`/support/get_tickets.php?user_id=${userId}`);
  }

  async getTicketDetails(ticketId, viewerRole = 'user') {
    return await this.request(`/support/get_ticket_details.php?ticket_id=${ticketId}&viewer_role=${viewerRole}`);
  }

  async replyToTicket(ticketId, reply, senderName) {
    return await this.request('/support/reply_ticket.php', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId, reply: reply, sender_name: senderName })
    });
  }

  // Feedback methods
  async submitFeedback(feedbackData) {
    return await this.request('/feedback/submit_feedback.php', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  }

  // Settings methods
  async changePassword(userId, currentPassword, newPassword) {
    return await this.request('/users/change_password.php', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword
      })
    });
  }
}

// Export singleton instance
const Api = new ApiService();
console.log('✓ API Service v2 exported');
export default Api;