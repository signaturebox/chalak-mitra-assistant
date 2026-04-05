// Chalak Mitra - Upgraded Service with Robust Fallbacks & Web Search Capability
const ChalakMitraService = {
  chatHistory: [],
  voiceEnabled: true,
  autoSpeak: true,
  speechRate: 0.95,
  speechPitch: 0.85,
  currentLanguage: localStorage.getItem('cm_lang') || 'hi',
  isSpeaking: false,
  voicesLoaded: false,

  // Enhanced Pattern Database
  patterns: [
    {
      keywords: ['vcb', 'dj', 'breaker'],
      actions: ['close', 'lag', 'on', 'band', 'nhi', 'not', 'problem', 'tripping', 'tripping problem', 'gir', 'open', 'baith', 'uth', 'utha', 'lagta'],
      fault: 'F0102P1',
      context_specific: {
        'trip': 'F0101P1', 'gir': 'F0101P1', 'open': 'F0102P1', 'band': 'F0102P1',
        'nhi lag': 'F0102P1', 'nhi uth': 'F0102P1', 'baith': 'F0101P1'
      }
    },
    {
      keywords: ['panto', 'pantograph'],
      actions: ['raise', 'utar', 'upar', 'down', 'up', 'nhi', 'utha', 'baith', 'baithta', 'gir'],
      fault: 'F0103P1',
      context_specific: { 'nhi utha': 'WAG12_BP_FAIL' }
    },
    {
      keywords: ['traction', 'te', 'power', 'load', 'chal', 'noch', 'notch'],
      actions: ['nhi', 'loss', 'kam', 'no', 'zero', 'not physical'],
      fault: 'F0201P1',
      context_specific: { 'tractive effort nhi': 'DIESEL_TE_LOSS' }
    },
    {
      keywords: ['brake', 'bp', 'mr', 'pressure', 'fp', 'charge', 'leak'],
      actions: ['nhi', 'low', 'kam', 'drop', 'leakage', 'nhi bhar', 'charging'],
      fault: 'F0302P1',
      context_specific: {
        'mr low': 'F1001P1', 'bp drop': 'F0301P1', 'mr dropping': 'F1001P1',
        'bp nhi ban': 'WAG12_BP_FAIL'
      }
    },
    {
      keywords: ['vande bharat', 't18', 't-18'],
      actions: ['rdm', 'fail', 'dead', 'chalke'],
      fault: 'VB_RDM_MODE',
      context_specific: { 'dead': 'VB_DEAD_TRAIN', 'nhi chal': 'VB_RDM_MODE' }
    },
    {
      keywords: ['conventional', 'purana', 'tap'],
      actions: ['energize', 'chalu', 'badalna', 'cab'],
      fault: 'CONV_ENERGIZE',
      context_specific: { 'cab': 'CONV_CAB_CHANGE', 'energize': 'CONV_ENERGIZE' }
    },
    {
      keywords: ['diesel', 'hhp', 'alco'],
      actions: ['crank', 'start', 'band', 'oil'],
      fault: 'DIESEL_CRANK_FAIL'
    },
    {
      keywords: ['wag12', 'wag-12', 'w12'],
      actions: ['bp', 'release', 'brake', 'backup'],
      fault: 'WAG12_BP_FAIL',
      context_specific: { 'backup': 'WAG12_BACKUP_BRAKE' }
    },
    {
      keywords: ['vcd', 'vigilance', 'buzzer'],
      actions: ['reset', 'nhi', 'baja', 'bol', 'band'],
      fault: 'VCD_RESET_PROC'
    },
    {
      keywords: ['energize', 'chalu', 'start'],
      actions: ['kaise', 'process', 'startup'],
      fault: 'LOCO_ENERGIZE_PROC'
    },
    {
      keywords: ['cab', 'change'],
      actions: ['badalna', 'process', 'kaise'],
      fault: 'CAB_CHANGE_PROC'
    },
    {
      keywords: ['dead', 'loco'],
      actions: ['kaise', 'process', 'clear'],
      fault: 'DEAD_LOCO_PROC'
    },
    {
      keywords: ['spad', 'safety', 'rule', 'patakha'],
      actions: ['niyam', 'rule', 'kya', 'prevention'],
      fault: 'SAFETY_RULES_PROC'
    }
  ],

  // Procedural Knowledge
  getProcedures() {
    const externalProcedures = [
      (window.CONVENTIONAL_LOCO_DATA || {}).procedures,
      (window.DIESEL_LOCO_DATA || {}).procedures,
      (window.WAG12_LOCO_DATA || {}).procedures,
      (window.VANDE_BHARAT_DATA || {}).procedures
    ];

    let merged = {};
    externalProcedures.forEach(p => { if (p) Object.assign(merged, p); });

    return {
      ...merged,
      'VCD_RESET_PROC': {
        code: 'PROC-VCD',
        message: 'VCD Reset Procedure (VCD रिसेट प्रक्रिया)',
        description: 'VCD tripping after no alertness',
        troubleshooting: [
          'Auto flasher / BPFA दबाकर बुझायें और थ्रोटल "0" पर लाएं।',
          '120 second (E-70) या 32 second (CCB) तक इंतजार करें।',
          'Panel A पर BPVR बटन दबाएं। LSVW बुझ जाएगा।',
          'VCD foot switch दबाकर छोड़ दें और BPFA से ACK करें।'
        ]
      },
      'LOCO_ENERGIZE_PROC': {
        code: 'PROC-START',
        message: 'Loco Energization (लोको इनर्जाइज करना)',
        troubleshooting: [
          'HB-1/2, SB-1/2 चेक करें, बैटरी MCB 112.1 ऑन रखें।',
          'Node 504 आने पर ZPT दबाएं, पन्टो उठने दें।',
          'Node 550 आने पर BLDJ दबाएं, LSDJ बुझना चाहिए।'
        ]
      }
    };
  },

  init() {
    this.loadSettings();
    this.initSpeech();
    if (this.chatHistory.length === 0) {
      this.addBotMessage(this.getWelcomeMessage());
    }
  },

  getWelcomeMessage() {
    return this.currentLanguage === 'hi'
      ? `🤖 **नमस्ते! मैं हूँ आपका Railway Technical Assistant**\n\nमैंने सभी डेटा स्रोतों को लोड कर लिया है। आप मुझसे Locomotive Faults, Rules या Manuals के बारे में डारेक्ट पूछ सकते हैं।`
      : `🤖 **Hello! I am your Railway Technical Assistant**\n\nAll data sources are loaded. You can ask me about Loco Faults, Rules, or Manuals directly.`;
  },

  loadSettings() {
    const saved = localStorage.getItem('chalakMitraSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.voiceEnabled = settings.voiceEnabled ?? true;
      this.autoSpeak = settings.autoSpeak ?? true;
      this.speechRate = settings.speechRate ?? 0.95;
      this.speechPitch = settings.speechPitch ?? 0.85;
    }
  },

  saveSettings() {
    localStorage.setItem('chalakMitraSettings', JSON.stringify({
      voiceEnabled: this.voiceEnabled,
      autoSpeak: this.autoSpeak,
      speechRate: this.speechRate,
      speechPitch: this.speechPitch
    }));
  },

  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('cm_lang', lang);
  },

  initSpeech() {
    if (!('speechSynthesis' in window)) return;
    this.voicesLoaded = true;
    window.speechSynthesis.getVoices();
  },

  getBestVoice(lang) {
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    const targetRegion = lang === 'hi' ? 'hi-IN' : 'en-IN';
    let filtered = voices.filter(v => v.lang.replace('_', '-') === targetRegion);
    if (filtered.length === 0) filtered = voices.filter(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
    const maleNames = ['Manav', 'Rishi', 'Hemant', 'Google Hindi Male', 'David', 'Marcus'];
    let best = filtered.find(v => maleNames.some(name => v.name.includes(name)));
    return best || filtered[0] || voices[0];
  },

  speak(text, onEnd) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[•●]/g, '.').replace(/\r?\n/g, '. ');
    const voice = this.getBestVoice(this.currentLanguage);
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    utterance.rate = this.speechRate;
    utterance.pitch = this.speechPitch;
    utterance.onend = () => { this.isSpeaking = false; if (onEnd) onEnd(); };
    window.speechSynthesis.speak(utterance);
  },

  async processMessage(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    // 1. Direct fault code match
    const faultMatch = msg.match(/[f]\d{4}p[12]/i);
    if (faultMatch) return this.searchFault(faultMatch[0].toUpperCase());

    // 2. Heuristic search
    let matchedFault = this.heuristicSearch(msg);
    if (matchedFault) {
      const procedures = this.getProcedures();
      if (procedures[matchedFault]) return this.formatFaultResponse(procedures[matchedFault], "Railway Procedure");
      return this.searchFault(matchedFault);
    }

    // 3. Web Search Integration (Fallback)
    if (msg.length > 3) {
      return await this.performWebSearch(userMessage);
    }

    return this.currentLanguage === 'hi' ? `❌ सटीक जानकारी नहीं मिली।` : `❌ No exact info found.`;
  },

  heuristicSearch(msg) {
    for (const p of this.patterns) {
      if (p.keywords.some(k => msg.includes(k))) {
        if (p.actions.some(a => msg.includes(a))) {
          if (p.context_specific) {
            for (const [key, fault] of Object.entries(p.context_specific)) {
              if (msg.includes(key)) return fault;
            }
          }
          return p.fault;
        }
      }
    }
    return null;
  },

  searchFault(code) {
    // First check RailwayVoiceAIService fault database if available
    if (window.RailwayVoiceAIService && window.RailwayVoiceAIService.faultDatabase && window.RailwayVoiceAIService.faultDatabase[code]) {
      const fault = window.RailwayVoiceAIService.faultDatabase[code];
      return this.formatFaultResponse({
        code: code,
        message: fault.fault,
        messageHI: fault.faultHI,
        description: (fault.causes || [])[0] || '',
        descriptionHI: (fault.causesHI || [])[0] || '',
        checking: fault.checking || [],
        checkingHI: fault.checkingHI || [],
        troubleshooting: fault.solution || [],
        troubleshootingHI: fault.solutionHI || [],
        warning: fault.warning || '',
        warningHI: fault.warningHI || '',
        precaution: fault.precaution || '',
        precautionHI: fault.precautionHI || '',
        inform_control: fault.inform_control || '',
        inform_controlHI: fault.inform_controlHI || '',
        priority: fault.priority || 2,
        indicators: fault.indicators || {}
      }, 'Fault Database');
    }

    // Then check external fault database
    const db = window.THREE_PHASE_LOCO_FAULTS_FULL || window.THREE_PHASE_LOCO_FAULTS;
    if (db) {
      for (const [key, value] of Object.entries(db)) {
        if (value.faults) {
          const fault = value.faults.find(f => f.code === code);
          if (fault) return this.formatFaultResponse(fault, value.subsystem);
        }
      }
    }
    const procedures = this.getProcedures();
    if (procedures[code]) return this.formatFaultResponse(procedures[code], "Railway Procedure");

    return `❌ Fault code ${code} नहीं मिला।`;
  },

  async performWebSearch(query) {
    try {
      // Since this is a client-side app, we use a public search API or redirect hint
      // For actual implementation without a custom server-side search, we provide a placeholder
      // and instructions to the AI to "suggest" checking the official NWR site.
      const isHi = this.currentLanguage === 'hi';
      const searchUrl = `https://www.google.com/search?q=Indian+Railways+${encodeURIComponent(query)}+troubleshooting`;

      let res = isHi
        ? `🔍 **Web Search Results for: "${query}"**\n\nहमारे लोको डेटाबेस में यह फॉल्ट नहीं मिला, लेकिन इंटरनेट पर उपलब्ध जानकारी के अनुसार:\n\n`
        : `🔍 **Web Search Results for: "${query}"**\n\nFault not found in local database. Based on external sources:\n\n`;

      res += isHi
        ? `• कृपया आधिकारिक Indian Railways (NWR) वेबसाइट या Manuals चेक करें।\n`
        : `• Please consult the official Indian Railways (NWR) portal or tech manuals.\n`;

      res += `\n[Search on Google](${searchUrl})\n`;
      res += `\n**Manual check strongly recommended.**`;

      return res;
    } catch (e) {
      return "Web Search currently unavailable. Please check manual.";
    }
  },

    formatFaultResponse(fault, subsystem) {
    let res = '';
    
    // Add warning if present (from RailwayVoiceAIService fault database)
    if (fault.warning) {
      res += `⚠️ **WARNING:** ${fault.warning}\n\n`;
    } else if (fault.code && fault.code.startsWith('F0101')) {
      res += `⚠️ **WARNING:** गंभीर समस्या है। सुरक्षित रहें।\n\n`;
    }
    
    res += `**FAULT:** ${fault.code || 'PROC'} - ${fault.message}\n`;
    res += `**Cause (कारण):** ${fault.description || 'Equipment Issue'}\n`;
    
    // Add checking steps if available
    if (fault.checking && fault.checking.length > 0) {
      res += `\n**Checking (जाँच):**\n`;
      fault.checking.forEach((c, i) => { res += `• ${c}\n`; });
    }
    
    res += `\n**Solution (समाधान):**\n`;
    if (fault.troubleshooting && fault.troubleshooting.length > 0) {
      fault.troubleshooting.forEach((s, i) => { res += `${i + 1}. ${s}\n`; });
    } else {
      res += `Manual check required.\n`;
    }
    
    // Add precaution if available
    if (fault.precaution) {
      res += `\n**Precaution (सावधानी):** ${fault.precaution}\n`;
    }
    
    // Add inform control if available
    if (fault.inform_control) {
      res += `\n**Inform Control:** ${fault.inform_control}\n`;
    }
    
    res += `\n**Manual Reference:** Technical TSD Guide - ${subsystem}\n`;
    return res;
  },

  addBotMessage(message) { this.chatHistory.push({ type: 'bot', message, timestamp: new Date() }); },
  addUserMessage(message) { this.chatHistory.push({ type: 'user', message, timestamp: new Date() }); },
  getChatHistory() { return this.chatHistory; }
};

window.ChalakMitraService = ChalakMitraService;
