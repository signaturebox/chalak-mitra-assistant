// API Service for NWR Chalak Mitra
class ApiService {
  constructor() {
    this.token = localStorage.getItem('nwr_token') || null;
    // Set initial base URL - determine it immediately to avoid null values
    this.baseUrl = this.getBaseUrl();

    // Request deduplication cache
    this.pendingRequests = new Map();
    this.requestCache = new Map();
    this.cacheMaxAge = 30000; // 30 seconds
  }

  // Get the base URL, determining it dynamically
  getBaseUrl() {
    // For debugging - check what pathname we're getting
    const pathname = window.location.pathname;
    console.log('Current pathname:', pathname);

    // Determine base URL based on the current location
    const pathParts = pathname.split('/').filter(part => part && part !== 'null' && part !== 'undefined');

    console.log('Path parts after filtering:', pathParts);

    // If we're in a subdirectory (more than just the root), use that path
    if (pathParts.length > 0) {
      // Check if the first part might be our app directory
      const firstDir = pathParts[0];

      console.log('First directory candidate:', firstDir);

      // Look for variations of the app directory name
      if (firstDir && firstDir !== 'undefined' && firstDir !== 'null' && firstDir.toLowerCase().includes('nwr') &&
        (firstDir.toLowerCase().includes('chalak') || firstDir.toLowerCase().includes('mitra'))) {
        const baseUrl = `/${firstDir}/api`;
        console.log('Computed baseUrl:', baseUrl);
        return baseUrl;
      } else {
        const baseUrl = '/api';
        console.log('Computed fallback baseUrl:', baseUrl);
        return baseUrl;
      }
    } else {
      const baseUrl = '/api';
      console.log('Computed root baseUrl:', baseUrl);
      return baseUrl;
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

  // Generate cache key for request
  getCacheKey(endpoint, options = {}) {
    return `${endpoint}:${JSON.stringify(options.body || '')}:${this.token || ''}`;
  }

  // Generic API request method with deduplication
  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint, options);

    // Check for pending identical request (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      console.log('[ApiService] Deduplicating request:', endpoint);
      return this.pendingRequests.get(cacheKey);
    }

    // Check cache for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
        console.log('[ApiService] Cache hit:', endpoint);
        return cached.data;
      }
    }

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

    // Create promise for deduplication
    const requestPromise = (async () => {
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
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error('API Response is not JSON:', text.substring(0, 500)); // Log first 500 chars
            return { error: 'API_NOT_AVAILABLE', message: 'PHP API returned non-JSON response', debug: text.substring(0, 200), api_available: false };
          }
        } catch (parseError) {
          // If text() fails
          return { error: 'API_NOT_AVAILABLE', message: 'PHP API not available', api_available: false };
        }

        // Check if the API endpoint exists (not a 404 error)
        if (response.status === 404) {
          // API endpoint not found, return special indicator
          return { error: 'API_ENDPOINT_NOT_FOUND', message: 'PHP API not available', api_available: false };
        }

        // Log the response for debugging
        console.log('API Response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'API request failed');
        }

        // Cache successful GET requests
        if (options.method === 'GET' || !options.method) {
          this.requestCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
          });

          // Clean old cache entries periodically
          this.cleanCache();
        }

        return data;
      } catch (error) {
        console.error('API Error:', error);
        // If it's a network error, parsing error, or any other error, the API might not be available
        // Return a safe response to allow the application to continue using localStorage fallback
        return { error: 'API_NOT_AVAILABLE', message: 'PHP API not available', api_available: false };
      } finally {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
      }
    })();

    // Store promise for deduplication
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  // Clean old cache entries
  cleanCache() {
    const now = Date.now();
    for (const [key, entry] of this.requestCache.entries()) {
      if (now - entry.timestamp > this.cacheMaxAge * 2) {
        this.requestCache.delete(key);
      }
    }
  }

  // Clear request cache
  clearCache() {
    this.requestCache.clear();
    console.log('[ApiService] Request cache cleared');
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

  // User profile methods
  async getUserProfile(userId) {
    return await this.request(`/users/profile?id=${userId}`);
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

  async updateUserProfile(userData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
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
    return await this.request(`/quiz/get_history?user_id=${userId}&_=${Date.now()}`);
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

  async bulkUploadQuizQuestions(questions) {
    return await this.request('/quiz/manage_questions', {
      method: 'POST',
      body: JSON.stringify({ questions, action: 'bulk_upload' })
    });
  }

  // Submit feedback
  async submitFeedback(feedbackData) {
    return await this.request('/feedback/submit', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    return await this.request('/users/change_password', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword
      })
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
    formData.append('title', fileData.title || '');
    formData.append('description', fileData.description || '');

    const response = await fetch(`${this.getBaseUrl()}/file_api/file_upload`, {
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
    let url = '/file_api/get_files';
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

  // Upload content (URL, HTML, Message cards) to server
  async uploadContent(contentData) {
    return await this.request('/file_api/content_upload', {
      method: 'POST',
      body: JSON.stringify(contentData)
    });
  }

  // Delete file from server
  async deleteFile(fileId) {
    return await this.request(`/file_api/delete_file?id=${fileId}`, {
      method: 'DELETE'
    });
  }

  // Notification methods
  async getNotifications(userId, options = {}) {
    const params = new URLSearchParams({
      user_id: userId,
      limit: options.limit || 20
    });

    if (options.role) params.append('role', options.role);
    if (options.division) params.append('division', options.division);
    if (options.lobby) params.append('lobby', options.lobby);
    if (options.unread_only) params.append('unread_only', 'true');
    if (options.mark_as_read) params.append('mark_as_read', 'true');

    return await this.request(`/notifications/get_notifications?${params.toString()}`);
  }

  // Create notification
  async createNotification(notificationData) {
    return await this.request('/notifications/create_notification', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  // Mark notification as read
  async markNotificationRead(userId, notificationId = null, markAll = false) {
    return await this.request('/notifications/mark_read', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        notification_id: notificationId,
        mark_all: markAll
      })
    });
  }

  // Create support ticket
  async createSupportTicket(ticketData) {
    return await this.request('/support/create_ticket', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  // Get support tickets
  async getSupportTickets(userId) {
    return await this.request(`/support/get_tickets?user_id=${userId}`);
  }

  // Get ticket details (with replies)
  async getTicketDetails(ticketId) {
    return await this.request(`/support/get_ticket_details.php?ticket_id=${ticketId}`);
  }

  // System settings
  async getSystemSettings() {
    return await this.request('/system/get_settings');
  }

  // Get all tabs (main, division, lobby)
  async getTabs() {
    return await this.request('/tabs/manage_tabs.php');
  }

  // Get all lobbies
  async getLobbies() {
    return await this.request('/lobbies/get_lobbies.php');
  }

  // Create a new tab
  async createTab(tabData) {
    return await this.request('/tabs/manage_tabs.php', {
      method: 'POST',
      body: JSON.stringify(tabData)
    });
  }

  // Update an existing tab
  async updateTab(tabData) {
    return await this.request('/tabs/manage_tabs.php', {
      method: 'PUT',
      body: JSON.stringify(tabData)
    });
  }

  // Delete a tab
  async deleteTab(tabId) {
    return await this.request(`/tabs/manage_tabs.php?tab_id=${tabId}`, {
      method: 'DELETE'
    });
  }

  // Bulk update tabs (for reordering)
  async bulkUpdateTabs(tabs) {
    return await this.request('/tabs/manage_tabs.php', {
      method: 'PUT',
      body: JSON.stringify({ action: 'bulk_update', tabs })
    });
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

  // Quiz methods (ensuring they are here)
  async getQuizHistory(userId) {
    return await this.request(`/quiz/get_history.php?user_id=${userId}&_=${Date.now()}`);
  }
}

// Export singleton instance
const Api = new ApiService();
window.Api = Api;