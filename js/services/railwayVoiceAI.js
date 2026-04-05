// Railway Voice AI Assistant Service
// Comprehensive locomotive fault diagnosis and guidance system
// Supports voice input/output, PDF search, manual search, rule book search

const RailwayVoiceAIService = {
  // Configuration
  config: {
    language: localStorage.getItem('rvai_lang') || 'hi', // 'hi' or 'en'
    voiceEnabled: true,
    autoSpeak: true,
    speechRate: 0.9,
    speechPitch: 0.85,
    maxSearchResults: 5,
    debugMode: false
  },

  // Knowledge Sources Status
  knowledgeSources: {
    pdfsLoaded: false,
    manualsLoaded: false,
    faultDatabaseLoaded: false,
    ruleBooksLoaded: false
  },

  // PDF Text Storage (extracted text from PDFs)
  pdfTextDatabase: {},

  // Chat History
  chatHistory: [],

  // Speech Recognition
  recognition: null,
  isListening: false,

  // Speech Synthesis
  synthesis: window.speechSynthesis || null,
  isSpeaking: false,
  currentUtterance: null,

  // Voice Pattern Mappings - Convert colloquial terms to technical faults
  voicePatterns: {
    // VCB/DJ Related
    'dj open': { fault: 'F0102P1', keywords: ['vcb', 'dj', 'breaker', 'open', 'nahi', 'band'] },
    'dj close nahi': { fault: 'F0102P1', keywords: ['vcb', 'close', 'nahi', 'lag', 'uta'] },
    'vcb trip': { fault: 'F0101P1', keywords: ['vcb', 'trip', 'gira', 'open'] },
    'dj baith gaya': { fault: 'F0101P1', keywords: ['dj', 'baith', 'gir'] },
    'breaker trip': { fault: 'F0101P1', keywords: ['breaker', 'trip'] },
    
    // Pantograph Related
    'panto nahi utta': { fault: 'F0103P1', keywords: ['panto', 'pantograph', 'utta', 'upar', 'raise'] },
    'pantograph low pressure': { fault: 'F0103P1', keywords: ['panto', 'pressure', 'low', 'kam'] },
    'panto gir gaya': { fault: 'F0103P1', keywords: ['panto', 'gir', 'down', 'baith'] },
    
    // Traction/Power Related
    'traction nahi': { fault: 'F0201P1', keywords: ['traction', 'te', 'power', 'nahi', 'zero'] },
    'te loss': { fault: 'F0201P1', keywords: ['te', 'loss', 'kam', 'power'] },
    'power nahi aa raha': { fault: 'F0201P1', keywords: ['power', 'nahi', 'load'] },
    'loco dead': { fault: 'F0110P1', keywords: ['loco', 'dead', 'band', 'chal', 'nahi'] },
    
    // Brake Related
    'brake nahi ban raha': { fault: 'F0302P1', keywords: ['brake', 'ban', 'nahi', 'apply'] },
    'bp drop': { fault: 'F0301P1', keywords: ['bp', 'drop', 'kam', 'pressure'] },
    'mr pressure low': { fault: 'F1001P1', keywords: ['mr', 'pressure', 'low', 'kam'] },
    'brake leak': { fault: 'F0301P1', keywords: ['brake', 'leak', 'charging'] },
    
    // Compressor Related
    'compressor band': { fault: 'F1001P1', keywords: ['compressor', 'band', 'nahi', 'chal'] },
    'mcpa nahi chal raha': { fault: 'F1001P1', keywords: ['mcpa', 'compressor', 'band'] },
    
    // Converter Related
    'converter fault': { fault: 'F0201P1', keywords: ['converter', 'fault', 'disturb'] },
    'bur fault': { fault: 'F0601P1', keywords: ['bur', 'converter', 'auxiliary'] },
    
    // Temperature Related
    'over temperature': { fault: 'F0101P2', keywords: ['temperature', 'hot', 'garam'] },
    'transformer oil temperature': { fault: 'F0105P1', keywords: ['transformer', 'oil', 'temperature'] },
    
    // Vande Bharat Specific
    'vande bharat dead': { fault: 'VB_DEAD_TRAIN', keywords: ['vande', 'bharat', 'dead', 'fail'] },
    'vande bharat rdm': { fault: 'VB_RDM_MODE', keywords: ['vande', 'rdm', 'rescue'] },
    't18 fault': { fault: 'VB_GENERAL', keywords: ['t18', 'vande', 'bharat'] },
    
    // WAG-12 Specific
    'wag12 bp fail': { fault: 'WAG12_BP_FAIL', keywords: ['wag12', 'bp', 'brake', 'fail'] },
    'wag12 dead': { fault: 'WAG12_DEAD', keywords: ['wag12', 'dead', 'fail'] },
    
    // Diesel Loco
    'diesel crank nahi': { fault: 'DIESEL_CRANK_FAIL', keywords: ['diesel', 'crank', 'start', 'nahi'] },
    'engine band': { fault: 'DIESEL_STOP', keywords: ['engine', 'band', 'stop', 'diesel'] },
    
    // Conventional Loco
    'conventional energize': { fault: 'CONV_ENERGIZE', keywords: ['conventional', 'energize', 'start'] },
    'cab change': { fault: 'CAB_CHANGE_PROC', keywords: ['cab', 'change', 'badal'] },
    
    // Safety/VCD
    'vcd reset': { fault: 'VCD_RESET_PROC', keywords: ['vcd', 'vigilance', 'reset'] },
    'spad': { fault: 'SAFETY_SPAD', keywords: ['spad', 'safety', 'signal'] }
  },

  // Complete Fault Database with Hindi translations
  faultDatabase: {
    // SS01 - Main Power
    'F0101P1': {
      fault: 'VCB STUCK IN ON POSITION',
      faultHI: 'VCB ON position mein atka hua',
      causes: ['VCB mechanism fault', 'Control circuit malfunction', 'Spring mechanism jam'],
      causesHI: ['VCB mechanism mein kharabi', 'Control circuit mein fault', 'Spring mechanism jam'],
      checking: ['Throttle 0 position pe layen', 'BPFA acknowledge karen', 'VCB status check karen'],
      checkingHI: ['Throttle 0 pe layen', 'BPFA press karen', 'VCB status dekhen'],
      solution: [
        'Throttle 0 position pe layen. BPFA acknowledge karen',
        'Blank section clear karen coasting mein',
        'Loco shut down karen',
        'Control electronics OFF then ON karen',
        'Pantograph raise karen, VCB close karen, traction start karen',
        'Agar successful nahi, dusre cab se try karen'
      ],
      solutionHI: [
        'Throttle 0 pe layen, BPFA dabaen',
        'Blank section clear karen',
        'Loco band karen',
        'Control electronics OFF/ON karen',
        'Panto raise karen, VCB close karen',
        'Dusre cab se try karen'
      ],
      precaution: 'VCB trip nahi ho sakta. Careful rahen.',
      precautionHI: 'VCB trip nahi hoga. Savdhaan rahen.',
      inform_control: 'TLC ko inform karen',
      inform_controlHI: 'TLC ko batayen',
      isolate: 'Loco shut down karna padega',
      isolateHI: 'Loco band karna padega',
      warning: '⚠ WARNING: Serious fault. Stop train if needed.',
      warningHI: '⚠ WARNING: Gamhir fault. Train roken agar zarurat ho.',
      priority: 1,
      indicators: { LSDJ: 'ON', BPFA: 'ON', LSFI: 'BLINKING' },
      reference: 'TSD SS01 Page 5-6'
    },
    'F0102P1': {
      fault: 'VCB STUCK IN OFF POSITION',
      faultHI: 'VCB OFF position mein atka hua',
      causes: ['VCB closing coil fault', 'Low air pressure', 'Control supply failure'],
      causesHI: ['VCB closing coil kharab', 'Air pressure kam', 'Control supply fail'],
      checking: ['VCB COC Key open hai check karen', 'BLDJ press karen', 'Air pressure check karen'],
      checkingHI: ['VCB COC Key check karen', 'BLDJ dabaen', 'Air pressure dekhen'],
      solution: [
        'Throttle 0 position pe layen. BPFA acknowledge karen',
        'VCB COC Key open hai ensure karen',
        'BLDJ press karen VCB close ke liye',
        'Agar VCB close ho jaye, traction start karen',
        'Nahi to control electronics OFF/ON karen',
        'Pantograph raise karen, VCB close karen, traction start karen',
        'Agar successful nahi, dusre cab se try karen'
      ],
      solutionHI: [
        'Throttle 0 pe layen, BPFA dabaen',
        'VCB COC Key open check karen',
        'BLDJ dabaen',
        'VCB close hoga to traction start karen',
        'Nahi to control electronics OFF/ON karen',
        'Panto raise, VCB close karen',
        'Dusre cab se try karen'
      ],
      precaution: 'VCB close karne ki koshish zarat karen',
      precautionHI: 'VCB close karne ki koshish karen',
      inform_control: 'TLC ko inform karen agar fault continue ho',
      inform_controlHI: 'TLC ko batayen agar fault rahe',
      isolate: 'Nahi to blank section clear karen',
      isolateHI: 'Blank section clear karen',
      warning: '',
      warningHI: '',
      priority: 1,
      indicators: { LSDJ: 'ON', BPFA: 'ON', LSFI: 'BLINKING' },
      reference: 'TSD SS01 Page 7-8'
    },
    'F0103P1': {
      fault: 'LOW PRESSURE PANTO/FAULTY PANTO',
      faultHI: 'Pantograph pressure kam/faulty',
      causes: ['Isolating cock closed', 'Aux reservoir low pressure', 'MCPA not running', 'Pressure switch fault'],
      causesHI: ['Isolating cock band', 'Aux reservoir pressure kam', 'MCPA nahi chal raha', 'Pressure switch kharab'],
      checking: [
        'Pneumatic panel IG-38 (blue key) check karen',
        'MCPA running hai ya nahi check karen',
        'Aux reservoir pressure 5.2 kg/cm² above check karen',
        'Panto/VCB isolating cock open check karen'
      ],
      checkingHI: [
        'IG-38 key check karen',
        'MCPA chal raha hai check karen',
        'Pressure 5.2 kg/cm² above check karen',
        'Panto/VCB cock open check karen'
      ],
      solution: [
        'Throttle 0 pe layen, BPFA acknowledge karen',
        'IG-38 half position mein check karen',
        'MCB 48.1 (SB-2) check karen, agar trip ho to reset karen',
        'Aux reservoir pressure 5.2 kg/cm² above ensure karen',
        'Panto/VCB isolating cock open karen',
        'Pantograph raise karne ki koshish karen',
        'Agar nahi to dusra pantograph try karen',
        'Agar still nahi to control electronics OFF/ON karen'
      ],
      solutionHI: [
        'Throttle 0, BPFA dabaen',
        'IG-38 half position check karen',
        'MCB 48.1 reset karen agar trip ho',
        'Pressure 5.2+ ensure karen',
        'Cock open karen',
        'Panto raise karen',
        'Dusra panto try karen',
        'Control electronics OFF/ON karen'
      ],
      precaution: 'Pantograph properly touch kar raha hai OHE se check karen',
      precautionHI: 'Panto OHE se touch kar raha hai check karen',
      inform_control: 'TLC ko inform karen agar panto damage ho',
      inform_controlHI: 'TLC ko batayen agar panto kharab ho',
      isolate: '',
      isolateHI: '',
      warning: '',
      warningHI: '',
      priority: 1,
      indicators: { LSDJ: 'ON', BPFA: 'ON', LSFI: 'BLINKING' },
      reference: 'TSD SS01 Page 9-12'
    },
    'F0201P1': {
      fault: 'DISTURBANCE IN CONVERTER 1',
      faultHI: 'Converter 1 mein disturbance',
      causes: ['Converter fault', 'MCB tripped', 'Gate unit fault'],
      causesHI: ['Converter fault', 'MCB trip', 'Gate unit kharab'],
      checking: ['MCB 127.1/1 (SB1) check karen', 'VCB status check karen'],
      checkingHI: ['MCB 127.1/1 check karen', 'VCB status dekhen'],
      solution: [
        'Throttle 0 pe layen, BPFA acknowledge karen',
        'MCB 127.1/1 (SB1) check karen, agar trip ho to control electronics OFF karke reset karen',
        'BLDJ press karen VCB close ke liye',
        'Agar same message aaye to 5 minute baad control electronics OFF/ON karen',
        'Panto raise karen, VCB close karen, traction start karen',
        'Agar still aaye to bogie-1 isolate karen MCB 127.1/1 aur 127.11/1 (SB-1) se',
        'TLC inform karen, log book mein likhen'
      ],
      solutionHI: [
        'Throttle 0, BPFA dabaen',
        'MCB 127.1/1 check karen, reset karen',
        'BLDJ dabaen VCB ke liye',
        '5 min baad control electronics OFF/ON karen',
        'Panto raise, VCB close, traction start',
        'Bogie-1 isolate karen',
        'TLC inform karen'
      ],
      precaution: 'Bogie isolation se traction kam ho jayega',
      precautionHI: 'Bogie isolation se TE kam hoga',
      inform_control: 'TLC ko immediately inform karen',
      inform_controlHI: 'TLC ko turant batayen',
      isolate: 'Bogie-1 ko MCB 127.1/1 aur 127.11/1 se isolate karen',
      isolateHI: 'Bogie-1 isolate karen',
      warning: '',
      warningHI: '',
      priority: 1,
      indicators: { LSDJ: 'ON', BPFA: 'ON', LSFI: 'BLINKING' },
      reference: 'TSD SS02 Page 5-6'
    },
    'F0302P1': {
      fault: 'BRAKE NOT APPLYING PROPERLY',
      faultHI: 'Brake nahi ban raha properly',
      causes: ['Brake system leak', 'BP/FP valve fault', 'MR pressure low'],
      causesHI: ['Brake system leak', 'Valve fault', 'MR pressure kam'],
      checking: ['BP/FP pressure check karen', 'MR gauge check karen', 'Brake cylinder pressure check karen'],
      checkingHI: ['BP/FP pressure dekhen', 'MR gauge dekhen', 'Brake cylinder check karen'],
      solution: [
        'MR pressure check karen - minimum 5 kg/cm² hona chahiye',
        'Agar MR low hai to MCPA check karen',
        'Brake pipe leak check karen - sun ke leak location pata karen',
        'A9 handle emergency position pe try karen',
        'FP gauge check karen - 3-4 kg/cm² hona chahiye',
        'Agar leak hai to isolation cock se related section isolate karen',
        'TLC ko inform karen'
      ],
      solutionHI: [
        'MR pressure 5+ kg/cm² check karen',
        'MR low to MCPA check karen',
        'Leak check karen',
        'A9 handle try karen',
        'FP 3-4 kg/cm² check karen',
        'Leak section isolate karen',
        'TLC inform karen'
      ],
      precaution: 'Emergency brake ready rakhen',
      precautionHI: 'Emergency brake ready rakhen',
      inform_control: 'TLC ko brake problem inform karen',
      inform_controlHI: 'TLC ko brake problem batayen',
      isolate: '',
      isolateHI: '',
      warning: '⚠ WARNING: Brake failure dangerous. Stop if required.',
      warningHI: '⚠ WARNING: Brake fail khatarnaak. Roken agar zaruri ho.',
      priority: 1,
      indicators: { BPFA: 'ON' },
      reference: 'TSD SS10 Brake System'
    },
    'F1001P1': {
      fault: 'MR PRESSURE LOW',
      faultHI: 'MR pressure kam hai',
      causes: ['Compressor not running', 'Air leak in system', 'MR safety valve leaking'],
      causesHI: ['Compressor nahi chal raha', 'Air leak', 'Safety valve leak'],
      checking: ['MCPA running status check karen', 'MR gauge check karen', 'Air leak sound sunen'],
      checkingHI: ['MCPA chal raha hai check karen', 'MR gauge dekhen', 'Leak sunen'],
      solution: [
        'MCB 48.1 (SB-2) check karen - MCPA supply',
        'Compressor running check karen - machine room mein sunen',
        'MR pressure gauge monitor karen',
        'Agar compressor nahi chal raha to manual start try karen',
        'Air leak check karen - soap solution se joints check karen',
        'A9 handle emergency position pe rakhne se MR drop nahi hoga',
        'TLC inform karen, control mein next station pe help len'
      ],
      solutionHI: [
        'MCB 48.1 check karen',
        'Compressor sunen machine room mein',
        'MR gauge monitor karen',
        'Manual start try karen',
        'Leak check karen',
        'A9 emergency position se MR bachega',
        'TLC inform karen'
      ],
      precaution: 'MR 5 kg/cm² se kam nahi hona chahiye',
      precautionHI: 'MR 5 kg/cm² se kam mat rahne den',
      inform_control: 'TLC ko MR problem inform karen',
      inform_controlHI: 'TLC ko MR problem batayen',
      isolate: '',
      isolateHI: '',
      warning: '⚠ WARNING: MR low se brake fail ho sakta hai.',
      warningHI: '⚠ WARNING: MR low se brake fail ho sakta hai.',
      priority: 1,
      indicators: { BPFA: 'ON' },
      reference: 'TSD Compressor System'
    },
    // Vande Bharat Faults
    'VB_DEAD_TRAIN': {
      fault: 'VANDE BHARAT DEAD TRAIN',
      faultHI: 'Vande Bharat dead/train chal nahi raha',
      causes: ['RDM mode required', 'Hotel load converter fault', 'Traction converter fault'],
      causesHI: ['RDM mode chahiye', 'Hotel load fault', 'Traction converter fault'],
      checking: ['DDS message check karen', 'Hotel load status check karen', 'VCB status check karen'],
      checkingHI: ['DDS message dekhen', 'Hotel load check karen', 'VCB status dekhen'],
      solution: [
        'DDS background messages check karen',
        'RDM (Rescue Drive Mode) mode activate karen',
        'Hotel load converter check karen - MCB trip check karen',
        'Traction converter status check karen',
        'VCB close try karen - BLDJ press karen',
        'Agar 1-2 coaches dead to traction ke saath chale jayen',
        'TLC inform karen, maintenance help len'
      ],
      solutionHI: [
        'DDS messages dekhen',
        'RDM mode on karen',
        'Hotel load MCB check karen',
        'Traction converter check karen',
        'VCB close try karen',
        '1-2 coaches se chale jayen',
        'TLC inform karen'
      ],
      precaution: 'Vande Bharat mein backup systems hain - safely proceed karen',
      precautionHI: 'Backup systems hain - safely proceed karen',
      inform_control: 'TLC ko immediately inform karen',
      inform_controlHI: 'TLC ko turant batayen',
      isolate: '',
      isolateHI: '',
      warning: '',
      warningHI: '',
      priority: 1,
      indicators: {},
      reference: 'Vande Bharat T-18 Manual'
    },
    'VB_RDM_MODE': {
      fault: 'VANDE BHARAT RDM MODE',
      faultHI: 'Vande Bharat RDM mode kaise karen',
      causes: ['Normal mode mein fault', 'Traction reduction needed'],
      causesHI: ['Normal mode fault', 'Traction kam chahiye'],
      checking: ['RDM switch location check karen', 'DDS message check karen'],
      checkingHI: ['RDM switch dekhen', 'DDS message dekhen'],
      solution: [
        'Driver desk pe RDM switch dhundhen',
        'RDM switch ON karen',
        'DDS pe RDM mode confirm karen',
        'Traction reduced mein train chala sakte hain',
        'Maximum speed reduced hogi (usually 80 kmph)',
        'TLC inform karen'
      ],
      solutionHI: [
        'RDM switch dhundhen',
        'RDM ON karen',
        'DDS confirm karen',
        'Reduced speed mein chalein',
        'Max 80 kmph',
        'TLC inform karen'
      ],
      precaution: 'RDM mode mein speed limited hai',
      precautionHI: 'RDM mein speed limited hai',
      inform_control: 'TLC ko RDM mode inform karen',
      inform_controlHI: 'TLC ko RDM batayen',
      isolate: '',
      isolateHI: '',
      warning: '',
      warningHI: '',
      priority: 2,
      indicators: {},
      reference: 'Vande Bharat Manual Page 45-50'
    },
    // WAG-12 Faults
    'WAG12_BP_FAIL': {
      fault: 'WAG-12 BRAKE PIPE FAILURE',
      faultHI: 'WAG-12 BP fail/ban nahi raha',
      causes: ['CCB2 brake system fault', 'BP valve fault', 'EOT fault'],
      causesHI: ['CCB2 system fault', 'Valve fault', 'EOT fault'],
      checking: ['BP gauge check karen', 'CCB2 display check karen', 'EOT communication check karen'],
      checkingHI: ['BP gauge dekhen', 'CCB2 display dekhen', 'EOT check karen'],
      solution: [
        'CCB2 display mein fault code check karen',
        'Auto brake handle release position pe rakhen',
        'BP charging try karen',
        'Agar BP nahi bhar to independent brake use karen',
        'EOT valve check karen - rear pe',
        'Backup brake mode activate karen if available',
        'TLC inform karen, emergency help len'
      ],
      solutionHI: [
        'CCB2 fault code dekhen',
        'Auto brake release karen',
        'BP charging try karen',
        'Independent brake use karen',
        'EOT check karen',
        'Backup mode on karen',
        'TLC inform karen'
      ],
      precaution: 'WAG-12 mein advanced brake systems hain - manual backup use karen',
      precautionHI: 'Manual backup use karen',
      inform_control: 'TLC ko immediately brake failure inform karen',
      inform_controlHI: 'TLC ko brake fail batayen',
      isolate: '',
      isolateHI: '',
      warning: '⚠ WARNING: Brake failure serious. Stop train immediately.',
      warningHI: '⚠ WARNING: Brake fail serious. Train turant roken.',
      priority: 1,
      indicators: { BPFA: 'ON' },
      reference: 'WAG-12 Manual Brake System'
    },
    // Diesel Loco Faults
    'DIESEL_CRANK_FAIL': {
      fault: 'DIESEL ENGINE CRANKING FAILURE',
      faultHI: 'Diesel engine crank/start nahi ho raha',
      causes: ['Battery low', 'Starter motor fault', 'Fuel supply issue', 'Engine seized'],
      causesHI: ['Battery low', 'Starter motor kharab', 'Fuel supply issue', 'Engine seized'],
      checking: ['Battery voltage check karen', 'Fuel level check karen', 'Starter motor sound check karen'],
      checkingHI: ['Battery voltage dekhen', 'Fuel level dekhen', 'Starter sunen'],
      solution: [
        'Battery voltage check karen - minimum 64V hona chahiye',
        'Fuel gauge check karen - fuel hai ki nahi',
        'Fuel prime karen - fuel pump manual operation',
        'Starter switch try karen - hold for max 30 seconds',
        'Agar engine crank nahi ho to starting batteries jump karen',
        'Overspeed lever reset check karen',
        'Control switch OFF/ON karen',
        'TLC inform karen'
      ],
      solutionHI: [
        'Battery 64V+ check karen',
        'Fuel check karen',
        'Fuel prime karen',
        'Starter try karen - 30 sec max',
        'Jump start try karen',
        'Overspeed reset check karen',
        'Control OFF/ON karen',
        'TLC batayen'
      ],
      precaution: 'Repeated cranking battery drain karega - 2-3 attempts mein limit karen',
      precautionHI: '2-3 attempts limit karen - battery bacha ke',
      inform_control: 'TLC ko diesel failure inform karen',
      inform_controlHI: 'TLC ko diesel fail batayen',
      isolate: '',
      isolateHI: '',
      warning: '',
      warningHI: '',
      priority: 2,
      indicators: {},
      reference: 'Diesel Loco Manual Starting Procedure'
    },
    // Conventional Loco
    'CONV_ENERGIZE': {
      fault: 'CONVENTIONAL LOCO ENERGIZE PROCEDURE',
      faultHI: 'Conventional loco kaise energize karen',
      causes: ['Startup procedure required'],
      causesHI: ['Startup procedure chahiye'],
      checking: ['Battery switch ON check karen', 'Control switches check karen'],
      checkingHI: ['Battery ON check karen', 'Control switches dekhen'],
      solution: [
        'Battery switch ON karen (rear panel)',
        'Control supply switch ON karen',
        'Flasher button press karen - flasher light on hogi',
        'Panto up button press karen - panto raise hoga',
        'Panto up light on hone ka wait karen',
        'DJ close button press karen',
        'DJ close light on hogi, DJ open light bujhegi',
        'Notch 1 pe throttle layen - traction aa jayega'
      ],
      solutionHI: [
        'Battery switch ON karen',
        'Control supply ON karen',
        'Flasher dabaen',
        'Panto up dabaen',
        'Panto light wait karen',
        'DJ close dabaen',
        'DJ close light on, open light off',
        'Notch 1 pe traction start'
      ],
      precaution: 'Conventional loco mein flasher se panto control hota hai',
      precautionHI: 'Flasher se panto control hota hai',
      inform_control: '',
      inform_controlHI: '',
      isolate: '',
      isolateHI: '',
      warning: '',
      warningHI: '',
      priority: 2,
      indicators: {},
      reference: 'Conventional Loco Operating Manual'
    },
    'CAB_CHANGE_PROC': {
      fault: 'CAB CHANGE PROCEDURE',
      faultHI: 'Cab change kaise karen',
      causes: ['Cab change procedure required'],
      causesHI: ['Cab change karna hai'],
      checking: ['Current cab status check karen', 'BP/MR pressure check karen'],
      checkingHI: ['Current cab check karen', 'BP/MR dekhen'],
      solution: [
        'Train roknen - A9 emergency position',
        'Throttle idle position pe rakhen',
        'Reverser neutral karke nikalen',
        'BPMR cock band karen current cab mein',
        'Control OFF karen current cab mein',
        'Naye cab mein jayen',
        'Control ON karen',
        'BPMR cock open karen',
        'Reverser lagayen',
        'VCB close karen (BLDJ)',
        'BP charge karen',
        'Brake test karen',
        'Traction start karen'
      ],
      solutionHI: [
        'Train roken - A9 emergency',
        'Throttle idle',
        'Reverser neutral nikalen',
        'BPMR cock band',
        'Control OFF',
        'Naye cab jayen',
        'Control ON',
        'BPMR open',
        'Reverser lagayen',
        'VCB close karen',
        'BP charge karen',
        'Brake test karen',
        'Traction start'
      ],
      precaution: 'Cab change ke baad brake test zaruri hai',
      precautionHI: 'Brake test zaruri hai',
      inform_control: '',
      inform_controlHI: '',
      isolate: '',
      isolateHI: '',
      warning: '',
      warningHI: '',
      priority: 2,
      indicators: {},
      reference: 'Locomotive Operating Manual'
    },
    'VCD_RESET_PROC': {
      fault: 'VCD RESET PROCEDURE',
      faultHI: 'VCD kaise reset karen',
      causes: ['VCD tripped due to no alertness', 'Vigilance system activated'],
      causesHI: ['VCD trip - alertness nahi thi', 'Vigilance active'],
      checking: ['VCD status check karen', 'BPFA check karen'],
      checkingHI: ['VCD status dekhen', 'BPFA dekhen'],
      solution: [
        'Auto flasher / BPFA press karen, throttle 0 pe layen',
        '120 second (E-70) ya 32 second (CCB) wait karen',
        'Panel A pe BPVR button press karen - LSVW bujh jayega',
        'VCD foot switch press karke chhod den',
        'BPFA se ACK karen',
        'Normal operation continue karen'
      ],
      solutionHI: [
        'Flasher/BPFA dabaen, throttle 0',
        '120/32 sec wait karen',
        'BPVR press karen',
        'VCD foot switch dabaen',
        'BPFA ACK karen',
        'Normal chalao'
      ],
      precaution: 'VCD ke baad alertness maintain karen',
      precautionHI: 'Alertness maintain karen',
      inform_control: '',
      inform_controlHI: '',
      isolate: '',
      isolateHI: '',
      warning: '',
      warningHI: '',
      priority: 2,
      indicators: { LSVW: 'ON' },
      reference: 'Safety Manual VCD Section'
    },
    'F0110P1': {
      fault: 'FATAL ERROR IN MAIN CIRCUIT',
      faultHI: 'Main circuit mein fatal error',
      causes: ['Multiple subsystem faults', 'Major circuit failure'],
      causesHI: ['Multiple subsystem fault', 'Major circuit fail'],
      checking: ['All MCBs check karen', 'DDS messages check karen'],
      checkingHI: ['MCBs check karen', 'DDS messages dekhen'],
      solution: [
        'Throttle 0 pe layen, BPFA acknowledge karen',
        'MCBs on HB/SB panel check karen, agar trip ho to ek baar reset karen',
        'Control electronics OFF phir ON karen',
        'Panto raise karen, VCB close karen, traction start karen',
        'Agar nahi chala to TLC inform karen, assistance engine maangen'
      ],
      solutionHI: [
        'Throttle 0, BPFA ACK',
        'MCBs reset karen',
        'Control electronics OFF/ON',
        'Panto, VCB, traction try',
        'Nahi to assistance engine maangen'
      ],
      precaution: 'Yeh serious fault hai - 20 minute mein solution na mile to help maangen',
      precautionHI: 'Serious fault - 20 min mein solve nahi to help maangen',
      inform_control: 'TLC ko immediately inform karen',
      inform_controlHI: 'TLC ko turant batayen',
      isolate: 'Loco shut down karna padega',
      isolateHI: 'Loco band karna padega',
      warning: '⚠ WARNING: Fatal error. Multiple subsystems affected. Stop train.',
      warningHI: '⚠ WARNING: Fatal error. Multiple systems fail. Train roken.',
      priority: 1,
      indicators: { LSDJ: 'ON', BPFA: 'ON', LSFI: 'BLINKING' },
      reference: 'TSD SS01 Fatal Error Section'
    }
  },

  // Procedural knowledge for common questions
  proceduralKnowledge: {
    'LOCO_ENERGIZE': {
      fault: 'LOCOMOTIVE ENERGIZE PROCEDURE',
      faultHI: 'Loko energize kaise karen',
      solution: [
        'HB-1/2, SB-1/2 check karen, Battery MCB 112.1 ON rakhen',
        'Node 504 aane pe ZPT dabaen, panto raise karen',
        'Node 550 aane pe BLDJ dabaen, LSDJ bujhna chahiye',
        'VCB close indicator on hona chahiye'
      ],
      solutionHI: [
        'HB/SB check karen, MCB 112.1 ON',
        'Node 504 pe ZPT dabaen',
        'Node 550 pe BLDJ dabaen',
        'VCB close ho jayega'
      ],
      reference: 'Locomotive Operating Manual'
    },
    'DEAD_LOCO_CLEAR': {
      fault: 'DEAD LOCO CLEARING PROCEDURE',
      faultHI: 'Dead loco kaise clear karen',
      solution: [
        'Blank section clear karna hai to coasting mein cross karen',
        'Agar TE nahi to neutral section pe rukhen',
        'TLC ko immediately inform karen',
        'Control electronics OFF/ON try karen',
        'Agar 20 minute mein resolve nahi to assistance engine maangen'
      ],
      solutionHI: [
        'Blank section coasting mein cross karen',
        'Neutral section pe rukhen',
        'TLC inform karen',
        'Control OFF/ON try',
        '20 min mein nahi to help maangen'
      ],
      reference: 'Emergency Procedures Manual'
    }
  },

  // Build bilingual text (Hindi + English mixed)
  buildBilingualLine(hi, en) {
    if (hi && en && hi !== en) return `${hi} / ${en}`;
    return hi || en || '';
  },

  buildBilingualList(hiList, enList) {
    const maxLen = Math.max(hiList?.length || 0, enList?.length || 0);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      const hi = hiList && hiList[i];
      const en = enList && enList[i];
      const line = this.buildBilingualLine(hi, en);
      if (line) result.push(line);
    }
    return result;
  },

  // Initialize the service
  init() {
    this.loadSettings();
    this.initSpeech();
    this.loadKnowledgeBases();
    this.log('Railway Voice AI Service initialized');
  },

  // Load settings from localStorage
  loadSettings() {
    const saved = localStorage.getItem('railwayVoiceAISettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.config = { ...this.config, ...settings };
      } catch (e) {
        this.log('Error loading settings');
      }
    }
  },

  // Save settings to localStorage
  saveSettings() {
    localStorage.setItem('railwayVoiceAISettings', JSON.stringify(this.config));
  },

  // Initialize speech synthesis
  initSpeech() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      // Load voices
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.getVoices();
      }
    }
  },

  // Get available voices
  getVoices() {
    return this.synthesis ? this.synthesis.getVoices() : [];
  },

  // Get best voice for current language
  getBestVoice(lang) {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const targetLang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    let filtered = voices.filter(v => v.lang.includes(targetLang.split('-')[0]));
    
    // Prefer Hindi/English Indian voices
    const preferredNames = ['Manav', 'Rishi', 'Hemant', 'Google', 'Microsoft'];
    let best = filtered.find(v => preferredNames.some(n => v.name.includes(n)));
    
    return best || filtered[0] || voices[0];
  },

  // Speak text aloud
  speak(text, onEnd = null) {
    if (!this.config.voiceEnabled || !this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance();
    
    // Clean text for speech
    utterance.text = this.cleanTextForSpeech(text);
    utterance.lang = this.config.language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = this.config.speechRate;
    utterance.pitch = this.config.speechPitch;

    const voice = this.getBestVoice(this.config.language);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  },

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  },

  // Clean text for speech synthesis
  cleanTextForSpeech(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[•●⚠✅❌🔌🛡️🇮🇳⚡🛢️💡]/g, '')
      .replace(/\r?\n/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  // Generate short speech text from full response
  generateSpeechText(response) {
    const lang = this.config.language;
    const fault = response.fault || '';
    const solutions = response.solution || [];
    
    if (solutions.length === 0) {
      return lang === 'hi' ? `${fault} ke liye manual check karen.` : `For ${fault}, please check manual.`;
    }

    // Get first 2-3 steps for short speech
    const shortSteps = solutions.slice(0, 3).join('. ');
    const speechText = lang === 'hi'
      ? `${fault} hai. ${shortSteps}`
      : `${fault} detected. ${shortSteps}`;

    // Limit to ~150 characters for speech
    return speechText.substring(0, 200) + (speechText.length > 200 ? '...' : '');
  },

  // Load knowledge bases
  async loadKnowledgeBases() {
    // Load fault database from window if available
    if (window.THREE_PHASE_LOCO_FAULTS_FULL || window.THREE_PHASE_LOCO_FAULTS) {
      this.knowledgeSources.faultDatabaseLoaded = true;
      this.log('Fault database loaded from window');
    }

    // Merge with our internal database
    this.mergeExternalDatabases();

    // Mark PDFs as not loaded yet (will be loaded on demand)
    this.knowledgeSources.pdfsLoaded = false;
  },

  // Merge external databases
  mergeExternalDatabases() {
    const externalDB = window.THREE_PHASE_LOCO_FAULTS_FULL || window.THREE_PHASE_LOCO_FAULTS;
    if (externalDB) {
      Object.entries(externalDB).forEach(([key, value]) => {
        if (value.faults && Array.isArray(value.faults)) {
          value.faults.forEach(fault => {
            if (fault.code && !this.faultDatabase[fault.code]) {
              this.faultDatabase[fault.code] = this.convertExternalFault(fault, value.subsystem);
            }
          });
        }
      });
    }
  },

  // Convert external fault format to our format
  convertExternalFault(fault, subsystem) {
    return {
      fault: fault.message || fault.code,
      faultHI: fault.messageHI || fault.message || fault.code,
      causes: fault.causes || [fault.description || 'Equipment issue'],
      causesHI: fault.causesHI || [fault.descriptionHI || 'Equipment issue'],
      checking: fault.checking || [],
      checkingHI: fault.checkingHI || [],
      solution: fault.troubleshooting || [],
      solutionHI: fault.troubleshootingHI || fault.troubleshooting || [],
      precaution: fault.precaution || '',
      precautionHI: fault.precautionHI || '',
      inform_control: fault.inform_control || 'TLC ko inform karen',
      inform_controlHI: fault.inform_controlHI || 'TLC ko batayen',
      isolate: fault.isolate || '',
      isolateHI: fault.isolateHI || '',
      warning: fault.warning || '',
      warningHI: fault.warningHI || '',
      priority: fault.priority || 2,
      indicators: fault.indicators || {},
      reference: `TSD ${subsystem || 'Manual'}`
    };
  },

  // Process voice/text input and return structured response
  async processInput(inputText) {
    this.log('Processing input:', inputText);
    
    const cleanInput = inputText.toLowerCase().trim();
    const lang = this.config.language;

    const isTrainingMode = /(?:explain|training|train|detail|samjha|sikh|teach)/i.test(inputText);

    // 1. Direct fault code match (e.g., F0102P1)
    const faultCodeMatch = cleanInput.match(/f?\d{4}p?[12]/i);
    if (faultCodeMatch) {
      const code = faultCodeMatch[0].toUpperCase();
      if (this.faultDatabase[code]) {
        const resp = this.formatResponse(this.faultDatabase[code]);
        if (isTrainingMode) this.enrichForTraining(resp);
        return resp;
      }
    }

    // 2. Voice pattern matching (colloquial to technical)
    const matchedFault = this.matchVoicePattern(cleanInput);
    if (matchedFault) {
      if (this.faultDatabase[matchedFault]) {
        const resp = this.formatResponse(this.faultDatabase[matchedFault]);
        if (isTrainingMode) this.enrichForTraining(resp);
        return resp;
      }
      if (this.proceduralKnowledge[matchedFault]) {
        const resp = this.formatResponse(this.proceduralKnowledge[matchedFault]);
        if (isTrainingMode) this.enrichForTraining(resp);
        return resp;
      }
    }

    // 3. Keyword-based search in fault database
    const keywordMatch = this.searchByKeywords(cleanInput);
    if (keywordMatch) {
      const resp = this.formatResponse(keywordMatch);
      if (isTrainingMode) this.enrichForTraining(resp);
      return resp;
    }

    // 4. Search in PDF/manual/rules documents (primary knowledge)
    const pdfMatch = await this.searchPDFDatabase(cleanInput);
    if (pdfMatch) {
      const resp = this.formatPDFResponse(pdfMatch);
      if (isTrainingMode) this.enrichForTraining(resp);
      return resp;
    }

    // 5. Fallback response
    const resp = this.getFallbackResponse(cleanInput);
    if (isTrainingMode) this.enrichForTraining(resp);
    return resp;
  },

  // Match voice patterns (colloquial to fault code)
  matchVoicePattern(input) {
    // Check exact voice pattern matches first
    for (const [pattern, data] of Object.entries(this.voicePatterns)) {
      if (input.includes(pattern.replace(/_/g, ' '))) {
        return data.fault;
      }
    }

    // Check keyword combinations
    for (const [pattern, data] of Object.entries(this.voicePatterns)) {
      const keywords = data.keywords || [];
      const matchCount = keywords.filter(kw => input.includes(kw)).length;
      if (matchCount >= 2) {
        return data.fault;
      }
    }

    return null;
  },

  // Search by keywords in fault database
  searchByKeywords(input) {
    const inputWords = input.split(/\s+/);
    let bestMatch = null;
    let bestScore = 0;

    for (const [code, fault] of Object.entries(this.faultDatabase)) {
      let score = 0;
      const faultText = `${fault.fault} ${fault.faultHI} ${(fault.causes || []).join(' ')} ${(fault.solution || []).join(' ')}`.toLowerCase();
      
      for (const word of inputWords) {
        if (word.length > 2 && faultText.includes(word)) {
          score++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = fault;
      }
    }

    return bestScore >= 2 ? bestMatch : null;
  },

  // Search PDF database
  async searchPDFDatabase(query) {
    // Prefer official documents (uploaded PDFs, manuals, rules)
    if (typeof PDFKnowledgeBase === 'undefined') {
      return null;
    }

    try {
      // Ensure some documents are loaded via RailwayManualLoader if available
      if (!this.knowledgeSources.pdfsLoaded && typeof RailwayManualLoader !== 'undefined') {
        await RailwayManualLoader.init();
        const stats = PDFKnowledgeBase.getStats?.();
        if (stats && stats.documents > 0) {
          this.knowledgeSources.pdfsLoaded = true;
        }
      }
    } catch (e) {
      this.log('Error initializing manual loader', e);
    }

    const results = PDFKnowledgeBase.search(query, { maxResults: 10 });
    if (!results || results.length === 0) return null;

    // Try to respect category priority: User uploads > Manuals > TSD > Rules > others
    let best = results[0];

    if (typeof RailwayManualLoader !== 'undefined' && RailwayManualLoader.getCategories) {
      const categories = RailwayManualLoader.getCategories();
      const docToCat = {};
      categories.forEach(c => {
        (c.documents || []).forEach(name => { docToCat[name] = c.name; });
      });

      const pickByCat = (cat) => results.find(r => docToCat[r.docName] === cat);
      best = pickByCat('User') || pickByCat('Manual') || pickByCat('TSD') || pickByCat('Rules') || best;

      return {
        filename: best.docName,
        excerpt: best.excerpt,
        category: docToCat[best.docName] || ''
      };
    }

    return {
      filename: best.docName,
      excerpt: best.excerpt,
      category: ''
    };
  },

  // Format response as JSON
  formatResponse(fault) {
    // Always return Hindi + English mixed railway style
    const response = {
      fault: this.buildBilingualLine(fault.faultHI, fault.fault),
      causes: this.buildBilingualList(fault.causesHI, fault.causes),
      checking: this.buildBilingualList(fault.checkingHI, fault.checking),
      solution: this.buildBilingualList(fault.solutionHI, fault.solution),
      precaution: this.buildBilingualLine(fault.precautionHI, fault.precaution),
      inform_control: this.buildBilingualLine(fault.inform_controlHI, fault.inform_control),
      isolate: this.buildBilingualLine(fault.isolateHI, fault.isolate),
      warning: this.buildBilingualLine(fault.warningHI, fault.warning),
      reference: fault.reference || 'Technical Manual / Official Railway Document',
      priority: fault.priority || 2,
      indicators: fault.indicators || {},
      code: fault.code || ''
    };

    // Add speech text (short Hindi/English mix)
    response.speech = this.generateSpeechText(response);

    return response;
  },

  // Format PDF search response
  formatPDFResponse(pdfResult) {
    return {
      fault: 'PDF Search Result',
      causes: [`Found in: ${pdfResult.filename}`],
      checking: [],
      solution: [pdfResult.excerpt],
      precaution: '',
      inform_control: '',
      isolate: '',
      warning: '',
      reference: pdfResult.filename,
      speech: `Found in ${pdfResult.filename}`,
      priority: 3
    };
  },

  // Get fallback response when nothing found
  getFallbackResponse(input) {
    return {
      fault: 'Exact match nahi mila / No exact match found',
      causes: [],
      checking: [
        'Manual mein procedure check karein / Check procedure in official manual'
      ],
      solution: [
        'Exact procedure document mein nahi mila. Follow standard troubleshooting. / Exact procedure not found in document. Follow standard troubleshooting.'
      ],
      precaution: 'Hamesha safe railway procedure follow karein / Always follow safe railway procedure',
      inform_control: 'TLC / Control ko inform karein / Inform TLC / Control',
      isolate: '',
      warning: '',
      reference: 'Documents + Manual check recommended',
      speech: 'Exact procedure document mein nahi mila. Follow standard troubleshooting.',
      priority: 3
    };
  },

  // Format response as display text
  formatDisplayText(response) {
    const lines = [];

    // Emergency mode header if dangerous fault
    if (this.isEmergency(response)) {
      lines.push('⚠ WARNING');
      lines.push('Do not move train');
      lines.push('Inform control');
      lines.push('Follow safety rule');
      lines.push('');
    }

    lines.push('--------------------------------');
    lines.push('FAULT / PROBLEM:');
    lines.push(response.fault || '');
    lines.push('');

    lines.push('Possible Causes:');
    if (response.causes && response.causes.length > 0) {
      response.causes.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
    } else {
      lines.push('-');
    }
    lines.push('');

    lines.push('Checking:');
    if (response.checking && response.checking.length > 0) {
      response.checking.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
    } else {
      lines.push('-');
    }
    lines.push('');

    lines.push('Step-by-Step Solution:');
    if (response.solution && response.solution.length > 0) {
      response.solution.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    } else {
      lines.push('-');
    }
    lines.push('');

    lines.push('Precaution:');
    lines.push(response.precaution || '-');
    lines.push('');

    lines.push('When inform control:');
    lines.push(response.inform_control || '-');
    lines.push('');

    lines.push('When isolate loco:');
    lines.push(response.isolate || '-');
    lines.push('');

    lines.push('When train should not move:');
    if (this.isEmergency(response)) {
      lines.push('⚠ Train ko move nahi karna. Do not move train until fault cleared / Jab tak fault clear na ho, train bilkul na chalayein.');
    } else {
      lines.push('-');
    }
    lines.push('');

    lines.push('Reference:');
    lines.push(response.reference || '-');
    lines.push('--------------------------------');

    return lines.join('\n');
  },

  // Enrich response for training/teaching mode
  enrichForTraining(response) {
    if (!response) return;
    if (!response.solution) response.solution = [];

    const extra = 'Training mode: Upar diye gaye step-by-step procedure manual ke hisaab se hai. Har step ko dhyan se padhein, gauge indications observe karein, aur safety rules follow karein. / Training mode: Above steps follow official manual procedure. Read each step carefully, observe gauges and indications, and strictly follow safety rules.';
    if (!response.solution.includes(extra)) {
      response.solution.push(extra);
    }
  },

  // Add to chat history
  addToHistory(type, message) {
    this.chatHistory.push({
      type,
      message,
      timestamp: new Date().toISOString()
    });
  },

  // Get chat history
  getHistory() {
    return this.chatHistory;
  },

  // Clear chat history
  clearHistory() {
    this.chatHistory = [];
  },

  // Set language
  setLanguage(lang) {
    this.config.language = lang;
    localStorage.setItem('rvai_lang', lang);
    this.saveSettings();
  },

  // Toggle voice
  toggleVoice() {
    this.config.voiceEnabled = !this.config.voiceEnabled;
    this.saveSettings();
    return this.config.voiceEnabled;
  },

  // Toggle auto speak
  toggleAutoSpeak() {
    this.config.autoSpeak = !this.config.autoSpeak;
    this.saveSettings();
    return this.config.autoSpeak;
  },

  // Load PDF text (for future implementation)
  async loadPDFText(filename, text) {
    this.pdfTextDatabase[filename] = text;
    this.knowledgeSources.pdfsLoaded = true;
  },

  // Check if emergency situation
  isEmergency(response) {
    return response.priority === 1 || response.warning || 
           response.fault.toLowerCase().includes('fatal') ||
           response.fault.toLowerCase().includes('fire') ||
           response.fault.toLowerCase().includes('danger');
  },

  // Get emergency response
  getEmergencyResponse() {
    const lang = this.config.language;
    return {
      fault: lang === 'hi' ? '⚠ EMERGENCY SITUATION' : '⚠ EMERGENCY SITUATION',
      solution: [
        lang === 'hi' ? 'Train turant roken' : 'STOP TRAIN IMMEDIATELY',
        lang === 'hi' ? 'TLC ko turant inform karen' : 'INFORM CONTROL IMMEDIATELY',
        lang === 'hi' ? 'Safety procedure follow karen' : 'FOLLOW SAFETY PROCEDURE',
        lang === 'hi' ? 'Agar fire ho to fire extinguisher use karen' : 'Use fire extinguisher if fire'
      ],
      warning: lang === 'hi' 
        ? '⚠ WARNING: Gamhir situation. Turant action len.'
        : '⚠ WARNING: Serious situation. Take immediate action.',
      speech: lang === 'hi'
        ? 'Emergency. Train roken. Control inform karen.'
        : 'Emergency. Stop train. Inform control.',
      priority: 1
    };
  },

  // Logging
  log(...args) {
    if (this.config.debugMode) {
      console.log('[RailwayVoiceAI]', ...args);
    }
  }
};

// Export for use
window.RailwayVoiceAIService = RailwayVoiceAIService;

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    RailwayVoiceAIService.init();
  });
}
