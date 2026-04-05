// Search Page
const SearchPage = {
  render(container) {
    container.innerHTML = `
      <div class="page active">
        <div class="page-title" style="margin-bottom: 12px;">Fault Search</div>
        
        <!-- Quick Access to 3-Phase Loco Fault System -->
        <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; margin-bottom: 16px;">
          <div class="card-title" style="color: white; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">⚡</span>
            <span></span>
          </div>
          <div style="opacity: 0.9; margin-bottom: 16px; line-height: 1.6;">
            Official Trouble Shooting Directory with 55+ fault codes, step-by-step solutions, and voice guidance in English & Hindi
          </div>
          <button class="tsd-open-btn" onclick="NavigationService.navigateTo('threePhaseLocoFaults')">
            <span class="btn-icon">🔍</span>
            <span>Open 3-Phase Loco Fault System</span>
          </button>
        </div>
        
        <div class="card">
          <div class="card-title">Search Locomotive Faults</div>
          <div class="search-controls">
            <input id="globalSearchQuery" type="text" placeholder="Enter fault code, symptom, or loco type" class="search-input" />
            <select id="globalSearchType">
              <option value="all">All Types</option>
              <option value="electric">Electric</option>
              <option value="diesel">Diesel</option>
              <option value="vb">Vande Bharat</option>
            </select>
            <button id="btnGlobalSearch" class="btn-sm btn-primary">🔍 Search</button>
          </div>
          <div id="globalSearchResults" class="search-results-container"></div>
        </div>
      </div>
    `;
    
    // Attach event listener
    setTimeout(() => {
      const btnSearch = document.getElementById('btnGlobalSearch');
      const searchInput = document.getElementById('globalSearchQuery');
      
      if (btnSearch) {
        btnSearch.addEventListener('click', () => {
          const query = document.getElementById('globalSearchQuery').value;
          const type = document.getElementById('globalSearchType').value;
          const results = SearchService.searchFaults(query, type);
          SearchService.renderResults(results, 'globalSearchResults');
        });
      }
      
      if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const query = document.getElementById('globalSearchQuery').value;
            const type = document.getElementById('globalSearchType').value;
            const results = SearchService.searchFaults(query, type);
            SearchService.renderResults(results, 'globalSearchResults');
          }
        });
      }
    }, 100);
  }
};
