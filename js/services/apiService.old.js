// API Service for NWR Chalak Mitra
class ApiService {
  constructor() {
    this.token = localStorage.getItem('nwr_token') || null;
    // Set initial base URL - determine it immediately to avoid null values
    this.baseUrl = this.getBaseUrl();
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

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
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
    return await this.request(`/quiz/get_history?user_id=${userId}`);
  }

  // File methods
  async uploadFile(fileData) {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('user_id', fileData.user_id);
    formData.append('division_id', fileData.division_id || '');
    formData.append('lobby_id', fileData.lobby_id || '');
    formData.append('section', fileData.section || '');
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

  // Notification methods
  async getNotifications(userId, role, division, limit = 10) {
    const params = new URLSearchParams({ 
      user_id: userId, 
      role, 
      division, 
      limit 
    });
    
    return await this.request(`/notifications/get_notifications?${params.toString()}`);
  }

  // System settings
  async getSystemSettings() {
    return await this.request('/system/get_settings');
  }
}

// Export singleton instance
const Api = new ApiService();
export default Api;