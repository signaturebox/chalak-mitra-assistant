// Chalak Mitra - Professional Page UI with Light Styling
const ChalakMitraPage = {
  isTyping: false,
  isListening: false,
  recognition: null,

  render(container) {
    const lang = ChalakMitraService.currentLanguage;

    container.innerHTML = `
      <div class="chalak-mitra-container">
        <!-- Premium Modern Header -->
        <header class="cm-header">
          <div class="cm-header-content" style="display: flex; align-items: center; gap: 15px;">
            <div class="cm-logo-container">
              <img src="./assets/images/chalak-mitra-logo.png" class="cm-logo-img" alt="Logo" onerror="this.src='https://mcf.indianrailways.gov.in/uploads/IR_logo_Red_1024.png'">
            </div>
            <div class="cm-header-info">
              <h1 class="cm-title">Chalak Mitra AI</h1>
              <span class="cm-subtitle">Railway Technical Assistant</span>
            </div>
          </div>
          <div class="cm-header-actions">
            <div class="cm-lang-toggle" style="background: rgba(255,255,255,0.05); border: 1px solid var(--cm-border); border-radius: 20px; padding: 4px; display: flex; gap: 4px;">
              <button class="cm-lang-btn ${lang === 'hi' ? 'active' : ''}" onclick="ChalakMitraPage.switchLanguage('hi')" style="background: ${lang === 'hi' ? 'var(--cm-primary)' : 'transparent'}; color: white; border: none; padding: 4px 12px; border-radius: 15px; font-size: 11px; font-weight: 600; cursor: pointer;">हिन्दी</button>
              <button class="cm-lang-btn ${lang === 'en' ? 'active' : ''}" onclick="ChalakMitraPage.switchLanguage('en')" style="background: ${lang === 'en' ? 'var(--cm-primary)' : 'transparent'}; color: white; border: none; padding: 4px 12px; border-radius: 15px; font-size: 11px; font-weight: 600; cursor: pointer;">EN</button>
            </div>
            <button class="cm-action-btn" onclick="ChalakMitraPage.clearChat()" style="background: rgba(255,255,255,0.05); border: 1px solid var(--cm-border); color: #fca5a5; width: 36px; height: 36px; border-radius: 50%; cursor: pointer;">🗑️</button>
            <button class="cm-action-btn" id="voiceToggleBtn" onclick="ChalakMitraPage.toggleVoice()" style="background: rgba(255,255,255,0.05); border: 1px solid var(--cm-border); color: #94a3b8; width: 36px; height: 36px; border-radius: 50%; cursor: pointer;">${ChalakMitraService.voiceEnabled ? '🔊' : '🔇'}</button>
          </div>
        </header>

        <!-- Quick Interaction Tabs -->
        <div class="cm-tabs">
          <button class="cm-tab active" onclick="ChalakMitraPage.switchTab('chat')">${lang === 'hi' ? '💬 असिस्टेंट' : '💬 Assistant'}</button>
          <button class="cm-tab" onclick="ChalakMitraPage.sendQuickMessage('F0102P1')">🔌 VCB/DJ</button>
          <button class="cm-tab" onclick="ChalakMitraPage.sendQuickMessage('Vande Bharat fault')">🇮🇳 Vande Bharat</button>
          <button class="cm-tab" onclick="ChalakMitraPage.sendQuickMessage('Conventional energize')">⚡ Conventional</button>
          <button class="cm-tab" onclick="ChalakMitraPage.sendQuickMessage('Diesel engine stop')">🛢️ Diesel</button>
        </div>

        <!-- Chat Viewport -->
        <div class="cm-chat-area" id="cmChatArea">
           <!-- Rendered via JS -->
        </div>

        <!-- Premium Voice Indicator Overlay -->
        <div id="cmVoiceOverlay" class="cm-voice-indicator" style="display: none;">
          <div class="cm-voice-waves">
            <div class="cm-wave" style="animation-delay: 0.1s;"></div>
            <div class="cm-wave" style="animation-delay: 0.3s; height: 40px;"></div>
            <div class="cm-wave" style="animation-delay: 0.2s; height: 60px;"></div>
            <div class="cm-wave" style="animation-delay: 0.4s; height: 30px;"></div>
            <div class="cm-wave" style="animation-delay: 0.5s;"></div>
          </div>
          <div style="font-weight: 700; color: white; font-size: 20px; letter-spacing: 1px;">Listening...</div>
          <div style="margin-top: 15px; color: var(--cm-text-soft); font-size: 14px; max-width: 80%; text-align: center; height: 20px;" id="cmVoiceInterim"></div>
          <button class="cm-voice-cancel" onclick="ChalakMitraPage.stopListening()" style="margin-top: 40px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; padding: 10px 30px; border-radius: 20px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>✖</span> <span>Cancel</span>
          </button>
        </div>

        <!-- Input Control -->
        <footer class="cm-input-area">
          <div class="cm-input-container">
            <button class="cm-mic-btn" id="cmMicBtn" onclick="ChalakMitraPage.startListening()">
              <span class="material-icons" style="font-size: 24px;">mic</span>
            </button>
            <input type="text" id="cmChatInput" class="cm-input" placeholder="${lang === 'hi' ? 'अपनी समस्या टाइप करें...' : 'Ask about faults or rules...'}" autocomplete="off">
            <button class="cm-send-btn" onclick="ChalakMitraPage.sendMessage()">
              <span class="material-icons" style="font-size: 20px;">send</span>
            </button>
          </div>
          <div class="cm-input-hint">💡 Example: "DJ close nahi ho raha", "Vande Bharat RDM" or "Safety rules"</div>
        </footer>
      </div>
    `;

    this.init();
  },

  init() {
    ChalakMitraService.init();
    this.renderMessages();
    this.setupListeners();
  },

  setupListeners() {
    const input = document.getElementById('cmChatInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
  },

  switchLanguage(lang) {
    ChalakMitraService.setLanguage(lang);
    this.render(document.getElementById('mainContent'));
  },

  async sendMessage() {
    const input = document.getElementById('cmChatInput');
    const text = input.value.trim();
    if (!text || this.isTyping) return;

    input.value = '';
    ChalakMitraService.addUserMessage(text);
    this.renderMessages();
    this.scrollToBottom();

    // Show bot thinking
    this.isTyping = true;

    // Await the response from the service (now async for future web integration)
    const response = await ChalakMitraService.processMessage(text);

    ChalakMitraService.addBotMessage(response);
    this.isTyping = false;
    this.renderMessages();
    this.scrollToBottom();

    if (ChalakMitraService.autoSpeak) {
      ChalakMitraService.speak(response);
    }
  },

  sendQuickMessage(text) {
    const input = document.getElementById('cmChatInput');
    input.value = text;
    this.sendMessage();
  },

  renderMessages() {
    const area = document.getElementById('cmChatArea');
    if (!area) return;

    const history = ChalakMitraService.getChatHistory();
    area.innerHTML = history.map((msg, i) => {
      const isBot = msg.type === 'bot';
      return `
        <div class="cm-message ${isBot ? 'cm-message-bot' : 'cm-message-user'}">
          <div class="cm-message-avatar">${isBot ? '🤖' : '👨‍✈️'}</div>
          <div class="cm-message-content">
            <div class="cm-message-text">${this.formatText(msg.message)}</div>
            <div class="cm-message-footer">
              <span class="cm-message-time">${this.formatTime(msg.timestamp)}</span>
              ${isBot ? `<button class="cm-speak-msg-btn" onclick="ChalakMitraPage.speakAgain(${i})">🔊 ${ChalakMitraService.currentLanguage === 'hi' ? 'सुनिए' : 'Listen'}</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
    this.scrollToBottom();
  },

  speakAgain(index) {
    const history = ChalakMitraService.getChatHistory();
    if (history[index]) ChalakMitraService.speak(history[index].message);
  },

  formatText(text) {
    if (!text) return '';

    // Convert bold markdown
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle Warning Block (⚠️)
    if (formatted.includes('⚠️')) {
      formatted = formatted.replace(/(⚠️.*?)(?=<br>|\n|$)/g, '<div class="cm-warning-box">$1</div>');
    }

    // Handle Main Headers (FAULT, Cause, Checking, Solution, etc.)
    const headers = [
      'FAULT', 'Cause', 'Checking', 'Step by Step Solution', 'Solution',
      'समाधान', 'Precaution', 'When to Inform Control', 'When Loco should be isolated',
      'When train should not move', 'Manual Reference'
    ];
    headers.forEach(h => {
      // Find both bold and non-bold versions
      const regexBold = new RegExp(`(<strong>${h}(:)?.*?</strong>)`, 'g');
      const regexNormal = new RegExp(`^(${h}(:)?.*?)$`, 'gm');

      formatted = formatted.replace(regexBold, '<div class="cm-section-header">$1</div>');
      formatted = formatted.replace(regexNormal, '<div class="cm-section-header">$1</div>');
    });

    // Handle troubleshooting steps (numbered)
    // Matches "1. Step description"
    formatted = formatted.replace(/^\d+\.\s+(.*?)$/gm, '<div class="cm-fault-step"><div class="cm-step-text">$&</div></div>');

    // Convert bullet points to list items
    formatted = formatted.replace(/^[•●]\s+(.*?)$/gm, '<li class="cm-bullet-item">$1</li>');

    // Convert newlines to line breaks (after structural changes)
    formatted = formatted.replace(/\n/g, '<br>');

    // Clean up excessive br tags
    formatted = formatted.replace(/(<br>){3,}/g, '<br><br>');

    // Convert links markdown [text](url) to <a> tags
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="cm-link">$1</a>');

    return formatted;
  },

  formatTime(date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  scrollToBottom() {
    const area = document.getElementById('cmChatArea');
    if (area) area.scrollTop = area.scrollHeight;
  },

  toggleVoice() {
    ChalakMitraService.voiceEnabled = !ChalakMitraService.voiceEnabled;
    ChalakMitraService.saveSettings();
    showNotification(ChalakMitraService.voiceEnabled ? 'Voice Enabled' : 'Voice Disabled', 'info');
    document.getElementById('voiceToggleBtn').textContent = ChalakMitraService.voiceEnabled ? '🔊' : '🔇';
  },

  updateSpeakingUI(isSpeaking) {
    const btn = document.getElementById('voiceToggleBtn');
    if (btn) {
      btn.style.background = isSpeaking ? 'var(--cm-primary-light)' : '#f8f9fa';
      btn.style.color = isSpeaking ? 'var(--cm-primary)' : '#5f6368';
    }
  },

  // Voice Web API
  startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotification('Voice Search not supported.', 'error');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = ChalakMitraService.currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    this.recognition.interimResults = true;

    document.getElementById('cmVoiceOverlay').style.display = 'flex';
    document.getElementById('cmMicBtn').classList.add('cm-mic-active');

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      document.getElementById('cmVoiceInterim').textContent = transcript;

      if (event.results[0].isFinal) {
        document.getElementById('cmChatInput').value = transcript;
        setTimeout(() => {
          this.stopListening();
          this.sendMessage();
        }, 600);
      }
    };

    this.recognition.onerror = () => this.stopListening();
    this.recognition.onend = () => this.stopListening();
    this.recognition.start();
  },

  stopListening() {
    if (this.recognition) this.recognition.stop();
    document.getElementById('cmVoiceOverlay').style.display = 'none';
    document.getElementById('cmMicBtn').classList.remove('cm-mic-active');
  },

  clearChat() {
    if (confirm(ChalakMitraService.currentLanguage === 'hi' ? 'क्या आप चैट मिटाना चाहते हैं?' : 'Clear chat history?')) {
      ChalakMitraService.clearHistory();
      this.renderMessages();
    }
  },

  switchTab(tab) {
    // Tab switching logic can go here
  }
};

window.ChalakMitraPage = ChalakMitraPage;
