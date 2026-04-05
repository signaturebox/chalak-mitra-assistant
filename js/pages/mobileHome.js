// Mobile Home V2 - Premium Design
const MobileHomePage = {
  render(container) {
    // We'll use the specific order and icons from the user's image
    const sections = [
      { name: 'GM Message', icon: '👤', target: 'gmMessage', color: 'blue' },
      { name: 'PCEE Message', icon: '⚡', target: 'pceeMessage', color: 'green' },
      { name: 'NWR Notices', icon: '📑', target: 'nwrnotices', color: 'orange' },

      { name: 'Electric Loco', icon: '⚡🚆', target: 'electricLoco', color: 'pink' },
      { name: 'Diesel Loco', icon: '🛢️🚆', target: 'dieselLoco', color: 'yellow' },
      { name: 'Vande Bharat', icon: '🚅', target: 'vandeBharat', color: 'pink' },

      { name: 'MEMU', icon: '🚆', target: 'memu', color: 'blue' },
      { name: 'Kachav', icon: '🛡️', target: 'kachav', color: 'purple' },
      { name: 'Traffic', icon: '🚦', target: 'traffic', color: 'orange' },

      { name: 'SPAD Prevention', icon: '🚫', target: 'spad', color: 'pink' },
      { name: 'Rule Books', icon: '📚', target: 'ruleBooks', color: 'green' },
      { name: 'C & W', icon: '🛠️', target: 'cw', color: 'yellow' },

      { name: 'OHE', icon: '⚡🛤️', target: 'ohe', color: 'pink' },
      { name: 'P-Way', icon: '🛤️', target: 'pway', color: 'blue' },
      { name: 'About NWR', icon: '📄', target: 'aboutNwrChalakMitra', color: 'green' }
    ];

    // Header with Hero Section
    let html = `
      <div class="mobile-home-container">
        <div class="mobile-hero">
            <div class="hero-content">
                <div class="hero-logo">🚆</div>
                <div class="hero-title-group">
                    <h1 class="hero-title">NWR Chalak Mitra</h1>
                    <p class="hero-subtitle">North Western Railway — चालक मित्र</p>
                </div>
            </div>
        </div>

        <div class="quick-cards">
            <div class="quick-card" data-view="search" onclick="NavigationService.navigateTo('search')">
                <span class="quick-card-icon">🔍</span>
                <span class="quick-card-label">Fault Search</span>
            </div>
            <div class="quick-card" data-view="quiz" onclick="NavigationService.navigateTo('quiz')">
                <span class="quick-card-icon">📖</span>
                <span class="quick-card-label">CLI Quiz</span>
            </div>
            <div class="quick-card" data-view="divisions" onclick="NavigationService.navigateTo('divisions')">
                <span class="quick-card-icon">🗂️</span>
                <span class="quick-card-label">Divisions</span>
            </div>
        </div>

        <h2 class="section-header">Welcome to NWR Chalak Mitra</h2>

        <div class="mobile-sections-grid">
    `;

    // Render Grid Sections
    sections.forEach(section => {
      html += `
          <div class="section-card border-${section.color}" data-view="${section.target}" data-section="${section.name}" onclick="NavigationService.navigateTo('${section.target}')">
            <div class="section-icon">${section.icon}</div>
            <div class="section-label">${section.name}</div>
            <div class="section-status"></div>
          </div>
        `;
    });

    html += `
        </div>

        <div class="mobile-footer-info">
            <span>🚢</span>
            <span>NWR Chalak Mitra v${APP_CONFIG.version} — North Western Railway • Safe Journey!</span>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="page active">
        ${html}
      </div>
    `;
  }
};
