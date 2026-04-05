// Quiz Results Page
// Displays quiz results for admins with role-based filtering

function renderQuizResultsPage() {
  const currentUser = AuthService.getUser();
  
  if (!currentUser || currentUser.role === 'crew') {
    return '<div class="error-message">Access denied. Admin privileges required.</div>';
  }

  return `
    <div class="quiz-results-container">
      <div class="results-header">
        <div class="header-left">
          <h1 class="page-title">📊 Quiz Results</h1>
          <p class="subtitle">${getSubtitle(currentUser)}</p>
        </div>
        <div class="header-actions">
          <button class="btn-quiz-action btn-refresh" id="refreshResults" title="Refresh Results">
            <span class="material-icons">refresh</span>
            <span class="btn-text">Refresh</span>
          </button>
          <button class="btn-quiz-action btn-csv" id="exportCSV">
            <span class="material-icons">file_download</span>
            <span class="btn-text">Export CSV</span>
          </button>
          <button class="btn-quiz-action btn-pdf" id="exportPDF">
            <span class="material-icons">picture_as_pdf</span>
            <span class="btn-text">Export PDF</span>
          </button>
          <button class="btn-quiz-action btn-print" id="printResults">
            <span class="material-icons">print</span>
            <span class="btn-text">Print</span>
          </button>
        </div>
      </div>

      <div class="stats-cards" id="statsCards">
        <!-- Statistics will be loaded here -->
      </div>

      <div class="results-filters">
        <div class="filter-group">
          <label for="divisionFilter">Division:</label>
          <select id="divisionFilter" ${currentUser.role === 'lobby' || currentUser.role === 'lobbyadmin' ? 'disabled' : ''}>
            <option value="">All Divisions</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="lobbyFilter">Lobby:</label>
          <select id="lobbyFilter" ${currentUser.role === 'lobby' || currentUser.role === 'lobbyadmin' ? 'disabled' : ''}>
            <option value="">All Lobbies</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="searchCrew">Search Crew:</label>
          <input type="text" id="searchCrew" placeholder="Search by name or CMS ID...">
        </div>
      </div>

      <div class="results-table-container">
        <table class="results-table" id="resultsTable">
          <thead>
            <tr>
              <th>S.No</th>
              <th>CMS ID</th>
              <th>Name</th>
              <th>Division</th>
              <th>Lobby</th>
              <th>Score</th>
              <th>Total</th>
              <th>Percentage</th>
              <th>Date</th>
              <th class="no-print">Actions</th>
            </tr>
          </thead>
          <tbody id="resultsTableBody">
            <!-- Results will be loaded here -->
          </tbody>
        </table>
      </div>

      <div class="pagination" id="pagination">
        <!-- Pagination will be loaded here -->
      </div>
    </div>
  `;
}

function getSubtitle(user) {
  switch(user.role) {
    case 'super':
    case 'superadmin':
      return 'View quiz performance of all crew members';
    case 'division':
    case 'divisionadmin':
      return `View quiz performance of crew in ${user.divisionName || user.division?.toUpperCase() || 'your division'}`;
    case 'lobby':
    case 'lobbyadmin':
      return `View quiz performance of crew in ${user.lobbyName || user.hq || 'your lobby'}`;
    default:
      return 'Quiz Results';
  }
}

async function initQuizResultsPage() {
  await loadResults();
  loadFilters();
  attachEventListeners();
  
  // Start auto-refresh polling (every 5 seconds)
  startAutoRefresh();
}

let refreshInterval = null;

function startAutoRefresh() {
  // Clear any existing interval
  if (refreshInterval) clearInterval(refreshInterval);
  
  // Set up new interval (5 seconds)
  refreshInterval = setInterval(async () => {
    // Only refresh if the page is visible and we're on the first page
    // This prevents disrupting user if they are paginating or viewing details
    if (document.visibilityState === 'visible' && currentPage === 1) {
      // Don't show loading indicator for background refresh
      // We'll just update the data silently
      const currentUser = AuthService.getUser();
      if (typeof QuizResultsService !== 'undefined') {
        const newResults = await QuizResultsService.getResultsForUser(currentUser.role, currentUser);
        
        // Check if data has changed (simple length check or first item check)
        // Ideally we would do a deep comparison but for now let's just update
        if (newResults && newResults.length !== allResults.length) {
          console.log('New data detected, refreshing view...');
          await loadResults();
        } else if (newResults && newResults.length > 0 && allResults.length > 0) {
            // Check if the most recent result is different
            // Sort new results first to match current sort logic
            newResults.sort((a, b) => {
                const dateA = new Date(a.timestamp || a.date || Date.now());
                const dateB = new Date(b.timestamp || b.date || Date.now());
                return dateB - dateA;
            });
            
            if (newResults[0].id !== allResults[0].id) {
                console.log('New top result detected, refreshing view...');
                await loadResults();
            }
        }
      }
    }
  }, 5000);
  
  // Clean up interval when navigating away
  // Note: This relies on the SPA router handling cleanup, but since we don't have a clear unmount hook exposed here,
  // we'll rely on the fact that initQuizResultsPage is called when the page is loaded.
  // A robust SPA would handle unmounting.
}

// Stop refresh when needed (e.g. manually)
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

let currentPage = 1;
const resultsPerPage = 10;
let allResults = [];
let filteredResults = [];

async function loadResults() {
  const currentUser = AuthService.getUser();
  
  // Ensure QuizResultsService is available
  let attempts = 0;
  while (attempts < 20 && typeof QuizResultsService === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  if (typeof QuizResultsService === 'undefined') {
    console.error('QuizResultsService not available');
    showNotification('❌ Quiz results service not available. Please refresh the page.', 'error');
    return;
  }
  
  // Get results based on user role (now async)
  allResults = await QuizResultsService.getResultsForUser(currentUser.role, currentUser);
  
  // Sort by date (newest first)
  if (Array.isArray(allResults)) {
    allResults.sort((a, b) => {
      // Check if timestamps exist and are valid dates
      const dateA = new Date(a.timestamp || a.date || Date.now());
      const dateB = new Date(b.timestamp || b.date || Date.now());
      
      // If dates are invalid, sort by ID as fallback
      if (isNaN(dateA.getTime())) {
        console.warn('Invalid date for result A:', a);
        return 1;
      }
      if (isNaN(dateB.getTime())) {
        console.warn('Invalid date for result B:', b);
        return -1;
      }
      
      return dateB - dateA;
    });
  } else {
    console.error('allResults is not an array:', allResults);
    allResults = []; // Ensure it's an array
  }
  
  filteredResults = [...allResults];
  
  displayStatistics();
  displayResults();
}

function displayStatistics() {
  if (typeof QuizResultsService === 'undefined' || !QuizResultsService.getStatistics) {
    console.warn('QuizResultsService not available for statistics');
    return;
  }
  
  const stats = QuizResultsService.getStatistics(filteredResults);
  
  const statsHTML = `
    <div class="stat-card">
      <div class="stat-icon">📝</div>
      <div class="stat-content">
        <div class="stat-value">${stats.totalAttempts}</div>
        <div class="stat-label">Total Attempts</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <div class="stat-content">
        <div class="stat-value">${stats.averageScore}%</div>
        <div class="stat-label">Average Score</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-content">
        <div class="stat-value">${stats.highestScore}%</div>
        <div class="stat-label">Highest Score</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">✅</div>
      <div class="stat-content">
        <div class="stat-value">${stats.passRate}%</div>
        <div class="stat-label">Pass Rate</div>
      </div>
    </div>
  `;
  
  document.getElementById('statsCards').innerHTML = statsHTML;
}

function displayResults() {
  const start = (currentPage - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const pageResults = filteredResults.slice(start, end);
  
  const tableBody = document.getElementById('resultsTableBody');
  
  if (pageResults.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" class="no-results">
          No quiz results found
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = pageResults.map((result, index) => `
    <tr>
      <td>${start + index + 1}</td>
      <td>${result.cmsId}</td>
      <td>${result.crewName}</td>
      <td>${result.divisionName || '-'}</td>
      <td>${result.lobbyName || '-'}</td>
      <td>${result.score}</td>
      <td>${result.total}</td>
      <td>
        <span class="percentage-badge ${getPercentageClass(result.percentage)}">
          ${result.percentage}%
        </span>
      </td>
      <td>${result.date}</td>
      <td class="no-print">
        <button class="btn-table-action btn-view" onclick="viewResultDetails('${result.id}')" title="View Details">
          <span class="material-icons">visibility</span>
        </button>
        <button class="btn-table-action btn-delete" onclick="deleteResult('${result.id}')" title="Delete">
          <span class="material-icons">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
  
  displayPagination();
}

function getPercentageClass(percentage) {
  const percent = parseFloat(percentage);
  if (percent >= 80) return 'excellent';
  if (percent >= 60) return 'good';
  if (percent >= 40) return 'average';
  return 'poor';
}

function displayPagination() {
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  
  if (totalPages <= 1) {
    document.getElementById('pagination').innerHTML = '';
    return;
  }
  
  let paginationHTML = '<div class="pagination-controls">';
  
  // Previous button
  paginationHTML += `
    <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
            onclick="changePage(${currentPage - 1})">
      <span class="material-icons">chevron_left</span>
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                onclick="changePage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += '<span class="pagination-dots">...</span>';
    }
  }
  
  // Next button
  paginationHTML += `
    <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
            onclick="changePage(${currentPage + 1})">
      <span class="material-icons">chevron_right</span>
    </button>
  `;
  
  paginationHTML += '</div>';
  document.getElementById('pagination').innerHTML = paginationHTML;
}

function changePage(page) {
  currentPage = page;
  displayResults();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadFilters() {
  const currentUser = AuthService.getUser();
  const divisionFilter = document.getElementById('divisionFilter');
  const lobbyFilter = document.getElementById('lobbyFilter');
  
  if (!divisionFilter || !lobbyFilter) return;
  
  // Load divisions
  if (currentUser.role === 'super' || currentUser.role === 'superadmin') {
    // Get all divisions from config
    const divisions = APP_CONFIG.divisions || ['jaipur', 'ajmer', 'jodhpur', 'bikaner'];
    divisions.forEach(divId => {
      const option = document.createElement('option');
      option.value = divId;
      option.textContent = divId.toUpperCase();
      divisionFilter.appendChild(option);
    });
  } else if (currentUser.role === 'division' || currentUser.role === 'divisionadmin') {
    const userDiv = currentUser.divisionId || currentUser.division;
    const option = document.createElement('option');
    option.value = userDiv;
    option.textContent = userDiv.toUpperCase();
    divisionFilter.appendChild(option);
    divisionFilter.value = userDiv;
    divisionFilter.disabled = true;
  }
  
  // Load lobbies
  loadLobbies();
}

function loadLobbies() {
  const currentUser = AuthService.getUser();
  const divisionFilter = document.getElementById('divisionFilter');
  const lobbyFilter = document.getElementById('lobbyFilter');
  
  if (!divisionFilter || !lobbyFilter) return;
  
  // Clear lobby options
  lobbyFilter.innerHTML = '<option value="">All Lobbies</option>';
  
  const selectedDivision = divisionFilter.value || currentUser.divisionId || currentUser.division;
  
  if (selectedDivision) {
    const lobbies = LobbyManagementService.getLobbiesByDivision(selectedDivision);
    lobbies.forEach(lobbyName => {
      const option = document.createElement('option');
      option.value = lobbyName;
      option.textContent = lobbyName;
      lobbyFilter.appendChild(option);
    });
  }
  
  if (currentUser.role === 'lobby' || currentUser.role === 'lobbyadmin') {
    const userLobby = currentUser.lobbyId || currentUser.hq;
    lobbyFilter.value = userLobby;
    lobbyFilter.disabled = true;
  }
}

function applyFilters() {
  const divisionFilter = document.getElementById('divisionFilter')?.value || '';
  const lobbyFilter = document.getElementById('lobbyFilter')?.value || '';
  const searchCrew = document.getElementById('searchCrew')?.value.toLowerCase() || '';
  
  console.log('Applying filters:', { divisionFilter, lobbyFilter, searchCrew });
  console.log('All results before filter:', allResults);
  
  filteredResults = allResults.filter(result => {
    const matchDivision = !divisionFilter || 
                          result.divisionId === divisionFilter || 
                          result.divisionId?.toLowerCase() === divisionFilter.toLowerCase();
    
    const matchLobby = !lobbyFilter || 
                       result.lobbyId === lobbyFilter || 
                       result.lobbyName === lobbyFilter;
    
    const matchSearch = !searchCrew || 
                       (result.crewName && result.crewName.toLowerCase().includes(searchCrew)) ||
                       (result.cmsId && result.cmsId.toLowerCase().includes(searchCrew));
    
    const matches = matchDivision && matchLobby && matchSearch;
    
    if (!matches) {
      console.log('Filtered out:', result.crewName, {
        divisionMatch: matchDivision,
        lobbyMatch: matchLobby,
        searchMatch: matchSearch,
        resultDiv: result.divisionId,
        resultLobby: result.lobbyId
      });
    }
    
    return matches;
  });
  
  console.log('Filtered results:', filteredResults.length, 'out of', allResults.length);
  
  currentPage = 1;
  displayStatistics();
  displayResults();
}

function attachEventListeners() {
  document.getElementById('refreshResults').addEventListener('click', loadResults);
  document.getElementById('exportCSV').addEventListener('click', exportCSV);
  document.getElementById('exportPDF').addEventListener('click', exportPDF);
  document.getElementById('printResults').addEventListener('click', printResults);
  document.getElementById('divisionFilter').addEventListener('change', () => {
    loadLobbies();
    applyFilters();
  });
  document.getElementById('lobbyFilter').addEventListener('change', applyFilters);
  document.getElementById('searchCrew').addEventListener('input', applyFilters);
}

function exportCSV() {
  if (typeof QuizResultsService === 'undefined' || !QuizResultsService.downloadCSV) {
    showNotification('❌ Export service not available', 'error');
    return;
  }
  
  const filename = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
  QuizResultsService.downloadCSV(filteredResults, filename);
  showNotification('CSV exported successfully', 'success');
}

function exportPDF() {
  if (typeof QuizResultsService === 'undefined' || !QuizResultsService.downloadPDF) {
    showNotification('❌ Export service not available', 'error');
    return;
  }
  
  const filename = `quiz_results_${new Date().toISOString().split('T')[0]}.pdf`;
  const success = QuizResultsService.downloadPDF(filteredResults, filename);
  if (success) {
    showNotification('PDF exported successfully', 'success');
  } else {
    showNotification('Failed to export PDF', 'error');
  }
}

function printResults() {
  window.print();
}

function viewResultDetails(resultId) {
  const result = allResults.find(r => r.id === resultId);
  if (!result) return;
  
  showModal(`
    <h2>Quiz Result Details</h2>
    <div class="result-details">
      <div class="detail-row">
        <span class="detail-label">CMS ID:</span>
        <span class="detail-value">${result.cmsId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Name:</span>
        <span class="detail-value">${result.crewName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Division:</span>
        <span class="detail-value">${result.divisionName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Lobby:</span>
        <span class="detail-value">${result.lobbyName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Score:</span>
        <span class="detail-value">${result.score} / ${result.total}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Percentage:</span>
        <span class="detail-value percentage-badge ${getPercentageClass(result.percentage)}">
          ${result.percentage}%
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${result.date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Category:</span>
        <span class="detail-value">${result.category}</span>
      </div>
    </div>
  `);
}

async function deleteResult(resultId) {
  if (!confirm('Are you sure you want to delete this quiz result?')) return;
  
  if (typeof QuizResultsService === 'undefined' || !QuizResultsService.deleteResult) {
    showNotification('❌ Delete service not available', 'error');
    return;
  }
  
  await QuizResultsService.deleteResult(resultId);
  await loadResults();
  showNotification('Result deleted successfully', 'success');
}

// Expose functions globally
  window.renderQuizResultsPage = renderQuizResultsPage;
  window.initQuizResultsPage = initQuizResultsPage;
  window.changePage = changePage;
  window.viewResultDetails = viewResultDetails;
  window.deleteResult = deleteResult;
  window.refreshQuizResults = loadResults;
