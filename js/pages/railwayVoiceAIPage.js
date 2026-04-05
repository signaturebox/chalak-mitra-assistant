// Railway Voice AI Page Component
// Complete UI for Railway Voice Assistant

const RailwayVoiceAIPage = {
  container: null,
  isInitialized: false,
  
  // State
  state: {
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    lastResponse: null
  },

  // Render the page
  render(container) {
    this.container = container;
    const lang = RailwayVoiceAIService.config.language;
    
    container.innerHTML = `
      <div class="rvai-container">
        <!-- Header -->
        <header class="rvai-header">
          <div class="rvai-header-left">
            <div class="rvai-logo">
              <img src="./assets/images/chalak-mitra-logo.png" alt="Logo" onerror="this.src='https://mcf.indianrailways.gov.in/uploads/IR_logo_Red_1024.png'">
            </div>
            <div class="rvai-title">
              <h1>Railway Voice AI</h1>
              <span class="rvai-subtitle">${lang === 'hi' ? 'लोकोमोटिव फॉल्ट असिस्टेंट' : 'Locomotive Fault Assistant'}</span>
            </div>
          </div>
          <div class="rvai-header-right">
            <div class="rvai-lang-toggle">
              <button class="rvai-lang-btn ${lang === 'hi' ? 'active' : ''}" onclick="RailwayVoiceAIPage.setLanguage('hi')">हिन्दी</button>
              <button class="rvai-lang-btn ${lang === 'en' ? 'active' : ''}" onclick="RailwayVoiceAIPage.setLanguage('en')">EN</button>
            </div>
            <button class="rvai-action-btn" onclick="RailwayVoiceAIPage.toggleVoice()" id="rvaiVoiceToggle" title="Toggle Voice Output">
              ${RailwayVoiceAIService.config.voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button class="rvai-action-btn" onclick="RailwayVoiceAIPage.clearChat()" title="Clear Chat">🗑️</button>
          </div>
        </header>

        <!-- Quick Action Tabs -->
        <div class="rvai-tabs">
          <button class="rvai-tab active" onclick="RailwayVoiceAIPage.showTab('chat')">💬 ${lang === 'hi' ? 'असिस्टेंट' : 'Assistant'}</button>
          <button class="rvai-tab" onclick="RailwayVoiceAIPage.showTab('faults')">🔧 ${lang === 'hi' ? 'फॉल्ट्स' : 'Faults'}</button>
          <button class="rvai-tab" onclick="RailwayVoiceAIPage.showTab('manuals')">📚 ${lang === 'hi' ? 'मैनुअल' : 'Manuals'}</button>
          <button class="rvai-tab" onclick="RailwayVoiceAIPage.showTab('rules')">📋 ${lang === 'hi' ? 'नियम' : 'Rules'}</button>
        </div>

        <!-- Main Content Area -->
        <main class="rvai-main">
          <!-- Chat Tab -->
          <div class="rvai-tab-content active" id="rvaiTabChat">
            <!-- Chat Messages -->
            <div class="rvai-chat-area" id="rvaiChatArea">
              <!-- Messages will be rendered here -->
            </div>

            <!-- Voice Indicator Overlay -->
            <div class="rvai-voice-overlay" id="rvaiVoiceOverlay" style="display: none;">
              <div class="rvai-voice-animation">
                <div class="rvai-voice-wave"></div>
                <div class="rvai-voice-wave"></div>
                <div class="rvai-voice-wave"></div>
              </div>
              <div class="rvai-voice-text">🎤 ${lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'}</div>
              <div class="rvai-voice-interim" id="rvaiVoiceInterim"></div>
              <button class="rvai-voice-cancel" onclick="RailwayVoiceAIPage.stopListening()">
                ${lang === 'hi' ? 'रोकें' : 'Cancel'}
              </button>
            </div>

            <!-- Speaking Indicator -->
            <div class="rvai-speaking-indicator" id="rvaiSpeakingIndicator" style="display: none;">
              <div class="rvai-speaking-animation">
                <span></span><span></span><span></span>
              </div>
              <span>${lang === 'hi' ? 'बोल रहा हूँ...' : 'Speaking...'}</span>
              <button onclick="RailwayVoiceAIPage.stopSpeaking()">⏹</button>
            </div>
          </div>

          <!-- Faults Tab -->
          <div class="rvai-tab-content" id="rvaiTabFaults">
            <div class="rvai-fault-categories">
              <div class="rvai-fault-cat" onclick="RailwayVoiceAIPage.quickSearch('VCB DJ fault')">
                <span class="rvai-cat-icon">🔌</span>
                <span class="rvai-cat-name">${lang === 'hi' ? 'VCB/DJ' : 'VCB/DJ'}</span>
              </div>
              <div class="rvai-fault-cat" onclick="RailwayVoiceAIPage.quickSearch('pantograph fault')">
                <span class="rvai-cat-icon">⚡</span>
                <span class="rvai-cat-name">${lang === 'hi' ? 'पैन्टोग्राफ' : 'Pantograph'}</span>
              </div>
              <div class="rvai-fault-cat" onclick="RailwayVoiceAIPage.quickSearch('traction power fault')">
                <span class="rvai-cat-icon">🚃</span>
                <span class="rvai-cat-name">${lang === 'hi' ? 'ट्रैक्शन' : 'Traction'}</span>
              </div>
              <div class="rvai-fault-cat" onclick="RailwayVoiceAIPage.quickSearch('brake fault')">
                <span class="rvai-cat-icon">🛑</span>
                <span class="rvai-cat-name">${lang === 'hi' ? 'ब्रेक' : 'Brake'}</span>
              </div>
              <div class="rvai-fault-cat" onclick="RailwayVoiceAIPage.quickSearch('compressor MR fault')">
                <span class="rvai-cat-icon">💨</span>
                <span class="rvai-cat-name">${lang === 'hi' ? 'कम्प्रेसर' : 'Compressor'}</span>
              </div>
              <div class="rvai-fault-cat" onclick="RailwayVoiceAIPage.quickSearch('Vande Bharat fault')">
                <span class="rvai-cat-icon">🇮🇳</span>
                <span class="rvai-cat-name">Vande Bharat</span>
              </div>
              <div class="rvai-fault-cat" onclick="RailwayVoiceAIPage.quickSearch('WAG-12 fault')">
                <span class="rvai-cat-icon">🚂</span>
                <span class="rvai-cat-name">WAG-12</span>
              </div>
              <div class="rvai-fault-cat" onclick="RailwayVoiceAIPage.quickSearch('diesel engine fault')">
                <span class="rvai-cat-icon">🛢️</span>
                <span class="rvai-cat-name">${lang === 'hi' ? 'डीजल' : 'Diesel'}</span>
              </div>
            </div>
          </div>

          <!-- Manuals Tab -->
          <div class="rvai-tab-content" id="rvaiTabManuals">
            <div class="rvai-manuals-list" id="rvaiManualsList">
              <!-- Manuals will be listed here -->
              <div class="rvai-loading">${lang === 'hi' ? 'मैनुअल लोड हो रहे हैं...' : 'Loading manuals...'}</div>
            </div>
          </div>

          <!-- Rules Tab -->
          <div class="rvai-tab-content" id="rvaiTabRules">
            <div class="rvai-rules-search">
              <input type="text" id="rvaiRulesSearch" placeholder="${lang === 'hi' ? 'नियम खोजें...' : 'Search rules...'}">
              <button onclick="RailwayVoiceAIPage.searchRules()">🔍</button>
            </div>
            <div class="rvai-rules-results" id="rvaiRulesResults">
              <div class="rvai-rule-item" onclick="RailwayVoiceAIPage.quickSearch('cab change procedure')">
                <h4>Cab Change</h4>
                <p>${lang === 'hi' ? 'कैब बदलने की प्रक्रिया' : 'Cab change procedure'}</p>
              </div>
              <div class="rvai-rule-item" onclick="RailwayVoiceAIPage.quickSearch('VCD vigilance reset')">
                <h4>VCD/Vigilance</h4>
                <p>${lang === 'hi' ? 'VCD रिसेट प्रक्रिया' : 'VCD reset procedure'}</p>
              </div>
              <div class="rvai-rule-item" onclick="RailwayVoiceAIPage.quickSearch('dead loco procedure')">
                <h4>Dead Loco</h4>
                <p>${lang === 'hi' ? 'डेड लोको क्लियरिंग' : 'Dead loco clearing'}</p>
              </div>
              <div class="rvai-rule-item" onclick="RailwayVoiceAIPage.quickSearch('energize loco procedure')">
                <h4>Energize</h4>
                <p>${lang === 'hi' ? 'लोको इनर्जाइज' : 'Loco energize'}</p>
              </div>
              <div class="rvai-rule-item" onclick="RailwayVoiceAIPage.quickSearch('safety rules SPAD')">
                <h4>Safety</h4>
                <p>${lang === 'hi' ? 'सुरक्षा नियम' : 'Safety rules'}</p>
              </div>
            </div>
          </div>
        </main>

        <!-- Input Area -->
        <footer class="rvai-input-area">
          <div class="rvai-input-container">
            <button class="rvai-mic-btn" id="rvaiMicBtn" onclick="RailwayVoiceAIPage.toggleListening()">
              🎤
            </button>
            <input type="text" id="rvaiInput" placeholder="${lang === 'hi' ? 'अपनी समस्या बताएं...' : 'Describe your problem...'}" autocomplete="off">
            <button class="rvai-send-btn" onclick="RailwayVoiceAIPage.sendMessage()">➤</button>
          </div>
          <div class="rvai-input-hints">
            <span onclick="RailwayVoiceAIPage.quickSearch('DJ close nahi ho raha')">DJ close</span>
            <span onclick="RailwayVoiceAIPage.quickSearch('brake nahi ban raha')">Brake</span>
            <span onclick="RailwayVoiceAIPage.quickSearch('panto nahi utta')">Panto</span>
            <span onclick="RailwayVoiceAIPage.quickSearch('loco dead')">Dead loco</span>
            <span onclick="RailwayVoiceAIPage.quickSearch('MR pressure low')">MR low</span>
          </div>
        </footer>

        <!-- Status Bar -->
        <div class="rvai-status-bar">
          <span class="rvai-status" id="rvaiStatus">✅ Ready</span>
          <span class="rvai-mode" id="rvaiMode">${lang === 'hi' ? 'आवाज़ मोड' : 'Voice Mode'}: ${RailwayVoiceAIService.config.voiceEnabled ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      <style>
        ${this.getStyles()}
      </style>
    `;

    this.init();
    this.isInitialized = true;
  },

  // Initialize
  init() {
    RailwayVoiceAIService.init();
    this.setupEventListeners();
    this.renderChatHistory();
    this.loadManuals();
    this.showWelcomeMessage();
  },

  // Setup event listeners
  setupEventListeners() {
    const input = document.getElementById('rvaiInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }

    const rulesSearch = document.getElementById('rvaiRulesSearch');
    if (rulesSearch) {
      rulesSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.searchRules();
      });
    }
  },

  // Show welcome message
  showWelcomeMessage() {
    const lang = RailwayVoiceAIService.config.language;
    const welcomeMsg = lang === 'hi'
      ? `🤖 **नमस्ते! मैं हूँ आपका Railway Voice AI Assistant**

मैं आपकी मदद कर सकता हूँ:
• लोकोमोटिव फॉल्ट ट्रबलशूटिंग
• मैनुअल से जानकारी खोजना
• नियम और प्रक्रियाएं
• आवाज़ से बात करना

**आवाज़ में पूछें:**
"DJ close nahi ho raha"
"Brake nahi ban raha"
"Panto nahi utta"`
      : `🤖 **Hello! I am your Railway Voice AI Assistant**

I can help you with:
• Locomotive fault troubleshooting
• Manual information search
• Rules and procedures
• Voice interaction

**Try asking:**
"DJ close not working"
"Brake not applying"
"Pantograph not raising"`;

    RailwayVoiceAIService.addToHistory('bot', welcomeMsg);
    this.renderChatHistory();
  },

  // Get CSS styles
  getStyles() {
    return `
      .rvai-container {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 60px);
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
        font-family: 'Poppins', 'Noto Sans Devanagari', sans-serif;
      }

      /* Header */
      .rvai-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: linear-gradient(135deg, #0a4f86, #073a63);
        color: white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        flex-shrink: 0;
      }

      .rvai-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .rvai-logo {
        width: 45px;
        height: 45px;
        border-radius: 12px;
        overflow: hidden;
        background: rgba(255,255,255,0.1);
      }

      .rvai-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .rvai-title h1 {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
      }

      .rvai-subtitle {
        font-size: 12px;
        opacity: 0.9;
      }

      .rvai-header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .rvai-lang-toggle {
        display: flex;
        background: rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 4px;
      }

      .rvai-lang-btn {
        border: none;
        padding: 6px 14px;
        border-radius: 16px;
        background: transparent;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .rvai-lang-btn.active {
        background: white;
        color: #0a4f86;
      }

      .rvai-action-btn {
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        color: white;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .rvai-action-btn:hover {
        background: rgba(255,255,255,0.2);
      }

      /* Tabs */
      .rvai-tabs {
        display: flex;
        gap: 4px;
        padding: 8px 12px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        overflow-x: auto;
        flex-shrink: 0;
      }

      .rvai-tab {
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        background: #f0f0f0;
        color: #333;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .rvai-tab.active {
        background: #0a4f86;
        color: white;
      }

      /* Main Content */
      .rvai-main {
        flex: 1;
        overflow: hidden;
        position: relative;
      }

      .rvai-tab-content {
        display: none;
        height: 100%;
        overflow-y: auto;
        padding: 12px;
      }

      .rvai-tab-content.active {
        display: block;
      }

      /* Chat Area */
      .rvai-chat-area {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 20px;
      }

      .rvai-message {
        display: flex;
        gap: 10px;
        max-width: 85%;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .rvai-message.rvai-bot {
        align-self: flex-start;
      }

      .rvai-message.rvai-user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      .rvai-msg-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }

      .rvai-bot .rvai-msg-avatar {
        background: linear-gradient(135deg, #0a4f86, #073a63);
      }

      .rvai-user .rvai-msg-avatar {
        background: #e74c3c;
      }

      .rvai-msg-content {
        background: white;
        border-radius: 16px;
        padding: 12px 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .rvai-user .rvai-msg-content {
        background: #0a4f86;
        color: white;
      }

      .rvai-msg-text {
        line-height: 1.5;
        font-size: 14px;
      }

      .rvai-msg-text strong {
        color: #0a4f86;
      }

      .rvai-user .rvai-msg-text strong {
        color: #ffcc00;
      }

      .rvai-warning-box {
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 8px;
        padding: 10px;
        margin: 8px 0;
      }

      .rvai-section-header {
        font-weight: 700;
        color: #0a4f86;
        margin: 10px 0 5px;
      }

      .rvai-fault-step {
        background: #f8f9fa;
        border-left: 3px solid #0a4f86;
        padding: 8px 12px;
        margin: 6px 0;
        border-radius: 0 8px 8px 0;
      }

      .rvai-msg-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        font-size: 11px;
        opacity: 0.7;
      }

      .rvai-speak-btn {
        background: rgba(10,79,134,0.1);
        border: none;
        padding: 4px 10px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 11px;
      }

      /* Voice Overlay */
      .rvai-voice-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 100;
      }

      .rvai-voice-animation {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
      }

      .rvai-voice-wave {
        width: 8px;
        height: 40px;
        background: linear-gradient(180deg, #0a4f86, #e74c3c);
        border-radius: 4px;
        animation: wave 0.8s ease-in-out infinite;
      }

      .rvai-voice-wave:nth-child(2) { animation-delay: 0.1s; }
      .rvai-voice-wave:nth-child(3) { animation-delay: 0.2s; }

      @keyframes wave {
        0%, 100% { transform: scaleY(0.5); }
        50% { transform: scaleY(1.5); }
      }

      .rvai-voice-text {
        font-size: 24px;
        font-weight: 600;
        color: #333;
      }

      .rvai-voice-interim {
        margin-top: 10px;
        color: #666;
        font-size: 16px;
        max-width: 80%;
        text-align: center;
      }

      .rvai-voice-cancel {
        margin-top: 20px;
        padding: 10px 24px;
        border: 2px solid #e74c3c;
        background: white;
        color: #e74c3c;
        border-radius: 20px;
        font-weight: 600;
        cursor: pointer;
      }

      /* Speaking Indicator */
      .rvai-speaking-indicator {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #0a4f86;
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 50;
      }

      .rvai-speaking-animation {
        display: flex;
        gap: 3px;
      }

      .rvai-speaking-animation span {
        width: 4px;
        height: 12px;
        background: white;
        border-radius: 2px;
        animation: speak 0.5s ease-in-out infinite alternate;
      }

      .rvai-speaking-animation span:nth-child(2) { animation-delay: 0.1s; }
      .rvai-speaking-animation span:nth-child(3) { animation-delay: 0.2s; }

      @keyframes speak {
        from { height: 4px; }
        to { height: 16px; }
      }

      /* Fault Categories */
      .rvai-fault-categories {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 12px;
      }

      .rvai-fault-cat {
        background: white;
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .rvai-fault-cat:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      }

      .rvai-cat-icon {
        font-size: 32px;
        display: block;
        margin-bottom: 8px;
      }

      .rvai-cat-name {
        font-weight: 600;
        color: #333;
      }

      /* Manuals List */
      .rvai-manuals-list {
        padding: 12px;
      }

      .rvai-manual-item {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .rvai-manual-item:hover {
        background: #f0f7ff;
      }

      .rvai-manual-item h4 {
        margin: 0 0 4px;
        color: #0a4f86;
      }

      .rvai-manual-item p {
        margin: 0;
        font-size: 12px;
        color: #666;
      }

      /* Rules */
      .rvai-rules-search {
        display: flex;
        gap: 8px;
        padding: 12px;
      }

      .rvai-rules-search input {
        flex: 1;
        padding: 10px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 20px;
        outline: none;
      }

      .rvai-rules-search button {
        padding: 10px 16px;
        border: none;
        background: #0a4f86;
        color: white;
        border-radius: 20px;
        cursor: pointer;
      }

      .rvai-rules-results {
        padding: 12px;
      }

      .rvai-rule-item {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .rvai-rule-item:hover {
        background: #f0f7ff;
      }

      .rvai-rule-item h4 {
        margin: 0 0 4px;
        color: #0a4f86;
      }

      .rvai-rule-item p {
        margin: 0;
        font-size: 12px;
        color: #666;
      }

      /* Input Area */
      .rvai-input-area {
        background: white;
        padding: 12px 16px;
        border-top: 1px solid #e0e0e0;
        flex-shrink: 0;
      }

      .rvai-input-container {
        display: flex;
        gap: 8px;
        align-items: center;
        background: #f5f5f5;
        border-radius: 30px;
        padding: 6px;
      }

      .rvai-mic-btn {
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: #e74c3c;
        color: white;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .rvai-mic-btn.active {
        background: #27ae60;
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .rvai-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 10px;
        font-size: 15px;
        outline: none;
      }

      .rvai-send-btn {
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: #0a4f86;
        color: white;
        font-size: 18px;
        cursor: pointer;
      }

      .rvai-input-hints {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
      }

      .rvai-input-hints span {
        background: #f0f0f0;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        cursor: pointer;
        color: #666;
      }

      .rvai-input-hints span:hover {
        background: #0a4f86;
        color: white;
      }

      /* Status Bar */
      .rvai-status-bar {
        display: flex;
        justify-content: space-between;
        padding: 6px 16px;
        background: #f0f0f0;
        font-size: 12px;
        color: #666;
      }

      /* Loading */
      .rvai-loading {
        text-align: center;
        padding: 40px;
        color: #666;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .rvai-header {
          padding: 10px 12px;
        }

        .rvai-title h1 {
          font-size: 16px;
        }

        .rvai-tabs {
          padding: 6px 8px;
        }

        .rvai-tab {
          padding: 6px 12px;
          font-size: 13px;
        }

        .rvai-message {
          max-width: 95%;
        }

        .rvai-fault-categories {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
  },

  // Show tab
  showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.rvai-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.textContent.toLowerCase().includes(tabName)) {
        tab.classList.add('active');
      }
    });

    // Update tab content
    document.querySelectorAll('.rvai-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const tabMap = {
      'chat': 'rvaiTabChat',
      'faults': 'rvaiTabFaults',
      'manuals': 'rvaiTabManuals',
      'rules': 'rvaiTabRules'
    };

    const tabElement = document.getElementById(tabMap[tabName]);
    if (tabElement) {
      tabElement.classList.add('active');
    }
  },

  // Set language
  setLanguage(lang) {
    RailwayVoiceAIService.setLanguage(lang);
    this.render(this.container);
  },

  // Toggle voice
  toggleVoice() {
    const enabled = RailwayVoiceAIService.toggleVoice();
    const btn = document.getElementById('rvaiVoiceToggle');
    if (btn) btn.textContent = enabled ? '🔊' : '🔇';
    
    const modeEl = document.getElementById('rvaiMode');
    if (modeEl) {
      modeEl.textContent = `${RailwayVoiceAIService.config.language === 'hi' ? 'आवाज़ मोड' : 'Voice Mode'}: ${enabled ? 'ON' : 'OFF'}`;
    }
  },

  // Toggle listening
  toggleListening() {
    if (this.state.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  },

  // Start listening
  startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.showNotification('Voice recognition not supported', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = RailwayVoiceAIService.config.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = true;

    this.state.isListening = true;
    document.getElementById('rvaiVoiceOverlay').style.display = 'flex';
    document.getElementById('rvaiMicBtn').classList.add('active');
    this.updateStatus('🎤 Listening...');

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      document.getElementById('rvaiVoiceInterim').textContent = transcript;

      if (event.results[0].isFinal) {
        document.getElementById('rvaiInput').value = transcript;
        setTimeout(() => {
          this.stopListening();
          this.sendMessage();
        }, 500);
      }
    };

    recognition.onerror = () => this.stopListening();
    recognition.onend = () => {
      if (this.state.isListening) {
        this.stopListening();
      }
    };

    recognition.start();
    this.recognition = recognition;
  },

  // Stop listening
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.state.isListening = false;
    document.getElementById('rvaiVoiceOverlay').style.display = 'none';
    document.getElementById('rvaiMicBtn').classList.remove('active');
    this.updateStatus('✅ Ready');
  },

  // Stop speaking
  stopSpeaking() {
    RailwayVoiceAIService.stopSpeaking();
    this.state.isSpeaking = false;
    document.getElementById('rvaiSpeakingIndicator').style.display = 'none';
  },

  // Send message
  async sendMessage() {
    const input = document.getElementById('rvaiInput');
    const text = input.value.trim();
    if (!text || this.state.isProcessing) return;

    input.value = '';
    
    // Add user message
    RailwayVoiceAIService.addToHistory('user', text);
    this.renderChatHistory();

    // Show processing
    this.state.isProcessing = true;
    this.updateStatus('⏳ Processing...');

    try {
      // Process input
      const response = await RailwayVoiceAIService.processInput(text);
      
      // Store response
      this.state.lastResponse = response;

      // Format display text
      const displayText = RailwayVoiceAIService.formatDisplayText(response);
      
      // Add bot response
      RailwayVoiceAIService.addToHistory('bot', displayText);
      this.renderChatHistory();

      // Speak response
      if (RailwayVoiceAIService.config.autoSpeak && response.speech) {
        this.speakResponse(response);
      }

      this.updateStatus('✅ Ready');
    } catch (error) {
      console.error('Error processing message:', error);
      this.showNotification('Error processing request', 'error');
      this.updateStatus('❌ Error');
    }

    this.state.isProcessing = false;
    this.scrollToBottom();
  },

  // Quick search
  quickSearch(query) {
    document.getElementById('rvaiInput').value = query;
    this.showTab('chat');
    this.sendMessage();
  },

  // Speak response
  speakResponse(response) {
    this.state.isSpeaking = true;
    document.getElementById('rvaiSpeakingIndicator').style.display = 'flex';

    RailwayVoiceAIService.speak(response.speech, () => {
      this.state.isSpeaking = false;
      document.getElementById('rvaiSpeakingIndicator').style.display = 'none';
    });
  },

  // Render chat history
  renderChatHistory() {
    const area = document.getElementById('rvaiChatArea');
    if (!area) return;

    const history = RailwayVoiceAIService.getHistory();
    
    area.innerHTML = history.map((msg, index) => {
      const isBot = msg.type === 'bot';
      return `
        <div class="rvai-message ${isBot ? 'rvai-bot' : 'rvai-user'}">
          <div class="rvai-msg-avatar">${isBot ? '🤖' : '👨‍✈️'}</div>
          <div class="rvai-msg-content">
            <div class="rvai-msg-text">${this.formatMessageText(msg.message)}</div>
            <div class="rvai-msg-footer">
              <span>${this.formatTime(msg.timestamp)}</span>
              ${isBot ? `<button class="rvai-speak-btn" onclick="RailwayVoiceAIPage.speakMessage(${index})">🔊 Listen</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.scrollToBottom();
  },

  // Format message text
  formatMessageText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/⚠️\s*WARNING:?\s*(.*?)(?=\n|$)/gi, '<div class="rvai-warning-box">⚠️ <strong>WARNING:</strong> $1</div>')
      .replace(/^(FAULT|Causes|Checking|Solution|Precaution|Inform Control|Isolation|Reference).*$/gm, '<div class="rvai-section-header">$&</div>')
      .replace(/^\d+\.\s+(.*?)$/gm, '<div class="rvai-fault-step">$&</div>')
      .replace(/\n/g, '<br>');
  },

  // Format time
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  // Speak specific message
  speakMessage(index) {
    const history = RailwayVoiceAIService.getHistory();
    if (history[index]) {
      RailwayVoiceAIService.speak(history[index].message);
    }
  },

  // Scroll to bottom
  scrollToBottom() {
    const area = document.getElementById('rvaiChatArea');
    if (area) {
      area.scrollTop = area.scrollHeight;
    }
  },

  // Update status
  updateStatus(status) {
    const el = document.getElementById('rvaiStatus');
    if (el) el.textContent = status;
  },

  // Show notification
  showNotification(message, type = 'info') {
    if (typeof showNotification === 'function') {
      showNotification(message, type);
    } else {
      console.log(`[${type}] ${message}`);
    }
  },

  // Clear chat
  clearChat() {
    const lang = RailwayVoiceAIService.config.language;
    if (confirm(lang === 'hi' ? 'चैट मिटाना चाहते हैं?' : 'Clear chat history?')) {
      RailwayVoiceAIService.clearHistory();
      this.showWelcomeMessage();
    }
  },

  // Load manuals
  async loadManuals() {
    const container = document.getElementById('rvaiManualsList');
    const lang = RailwayVoiceAIService.config.language;

    // Try to load PDF knowledge base
    try {
      if (typeof PDFKnowledgeBase !== 'undefined') {
        await PDFKnowledgeBase.init();
        
        // Get loaded documents
        const docs = PDFKnowledgeBase.getLoadedDocuments();
        
        if (docs.length > 0) {
          container.innerHTML = docs.map(doc => `
            <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.searchManual('${doc.name}')">
              <h4>📄 ${doc.name}</h4>
              <p>${doc.pages} pages loaded</p>
            </div>
          `).join('');
          return;
        }
      }
    } catch (e) {
      console.log('PDF Knowledge Base not available');
    }

    // Default manual list
    container.innerHTML = `
      <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.quickSearch('SS01 main power')">
        <h4>📄 SS01 - Main Power</h4>
        <p>${lang === 'hi' ? 'मुख्य पावर सिस्टम' : 'Main Power System'}</p>
      </div>
      <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.quickSearch('SS02 traction bogie')">
        <h4>📄 SS02 - Traction Bogie 1</h4>
        <p>${lang === 'hi' ? 'ट्रैक्शन बोगी 1' : 'Traction Bogie 1'}</p>
      </div>
      <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.quickSearch('SS03 traction bogie 2')">
        <h4>📄 SS03 - Traction Bogie 2</h4>
        <p>${lang === 'hi' ? 'ट्रैक्शन बोगी 2' : 'Traction Bogie 2'}</p>
      </div>
      <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.quickSearch('WAG9 manual')">
        <h4>📄 WAG-9 Manual</h4>
        <p>${lang === 'hi' ? 'WAG-9 टेक्निकल मैनुअल' : 'WAG-9 Technical Manual'}</p>
      </div>
      <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.quickSearch('WAG12 manual')">
        <h4>📄 WAG-12 Manual</h4>
        <p>${lang === 'hi' ? 'WAG-12 टेक्निकल मैनुअल' : 'WAG-12 Technical Manual'}</p>
      </div>
      <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.quickSearch('Vande Bharat manual')">
        <h4>📄 Vande Bharat T-18</h4>
        <p>${lang === 'hi' ? 'वंदे भारत मैनुअल' : 'Vande Bharat Manual'}</p>
      </div>
      <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.quickSearch('troubleshooting guide')">
        <h4>📄 Troubleshooting Guide</h4>
        <p>${lang === 'hi' ? 'ट्रबलशूटिंग गाइड' : 'Troubleshooting Guide'}</p>
      </div>
      <div class="rvai-manual-item" onclick="RailwayVoiceAIPage.quickSearch('traffic rules')">
        <h4>📋 Traffic Book</h4>
        <p>${lang === 'hi' ? 'ट्रैफिक नियम' : 'Traffic Rules'}</p>
      </div>
    `;
  },

  // Search manual
  searchManual(name) {
    this.quickSearch(`${name} guide`);
  },

  // Search rules
  searchRules() {
    const query = document.getElementById('rvaiRulesSearch').value.trim();
    if (query) {
      this.quickSearch(query);
    }
  }
};

// Export
window.RailwayVoiceAIPage = RailwayVoiceAIPage;
