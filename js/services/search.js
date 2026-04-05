// Search Service
const SearchService = {
  api: null, // Will be set after ApiService is loaded
  // Search faults
  async searchFaults(query, type = 'all') {
    try {
      const response = await this.api.searchFaults(query, type);
      
      if (response.success) {
        return response.results;
      } else {
        showNotification('❌ Failed to search faults: ' + (response.error || 'Unknown error'), 'error');
        return [];
      }
    } catch (error) {
      console.error('Error searching faults:', error);
      showNotification('❌ Error searching faults: ' + error.message, 'error');
      return [];
    }
  },
  
  // Render search results
  renderResults(results, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = '<div class="muted">No results found. Try different keywords.</div>';
      return;
    }
    
    results.forEach(fault => {
      const resultDiv = document.createElement('div');
      resultDiv.className = 'search-result';
      resultDiv.innerHTML = `
        <div class="search-result-title">
          ${fault.title}
          <span class="search-result-code">${fault.code}</span>
        </div>
        <div class="muted" style="margin: 6px 0;">
          <strong>${fault.loco}</strong> • ${fault.symptom}
        </div>
        <div class="fault-fix-box">
          <strong>Fix:</strong> ${fault.fix}
        </div>
        <div style="margin-top: 8px;">
          <button class="btn-sm" onclick="copyToClipboard(\`${fault.fix.replace(/`/g, '\\`')}\`)">📋 Copy Steps</button>
        </div>
      `;
      container.appendChild(resultDiv);
    });
  }
};
