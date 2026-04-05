// Application Configuration
const APP_CONFIG = {
  appName: 'NWR Chalak Mitra',
  version: '1.0.0',
  railway: 'North Western Railway',

  // Quiz settings
  quiz: {
    questionsPerQuiz: 10,
    passingScore: 6
  },

  // Predefined Main Tabs
  predefinedMainTabs: [
    { name: 'GM Message', icon: '👤', color: '#667eea' },
    { name: 'PCEE Message', icon: '⚡', color: '#f093fb' },
    { name: 'Divisions', icon: '🗂️', color: '#4facfe' },
    { name: 'Rule Books', icon: '📚', color: '#43e97b' },
    { name: 'Electric Loco', icon: '⚡🚆', color: '#fa709a' },
    { name: 'Diesel Loco', icon: '🛢️🚆', color: '#feca57' },
    { name: 'Vande Bharat', icon: '🇮🇳', color: '#ee5a6f' },
    { name: 'MEMU', icon: '🚆', color: '#1e3a8a' },
    { name: 'Traffic', icon: '🚦', color: '#c471ed' },
    { name: 'OHE', icon: '⚡🛤️', color: '#12c2e9' },
    { name: 'Kachav', icon: '🛡️', color: '#2ecc71' },
    { name: 'C & W', icon: '🛠️', color: '#f78ca0' },
    { name: 'P-Way', icon: '🛤️', color: '#f9d423' },
    { name: 'SPAD Prevention', icon: '🚫', color: '#ff6b6b' },
    { name: 'About NWR Chalak Mitra', icon: '📄', color: '#003399' }
  ],

  // Storage keys
  storage: {
    logo: 'nwr_logo',
    userState: 'nwr_user_state',
    divisionAdmins: 'nwr_division_admins',
    lobbyAdmins: 'nwr_lobby_admins',
    registeredCrews: 'nwr_registered_crews',
    currentUser: 'nwr_current_user',
    quizAttempts: 'nwr_quiz_attempts',
    logos: 'nwr_logos',
    tickets: 'nwr_tickets',
    lobbies: 'nwr_lobbies',
    contentStructure: 'nwr_content_structure'
  },

  // Super Admin Credentials
  superAdmin: {
    email: 'ritutechno.jpr@gmail.com',
    password: 'Ritu@5011'
  },

  // Divisions
  divisions: ['jaipur', 'ajmer', 'jodhpur', 'bikaner'],

  // Division lobbies/HQ
  lobbies: {
    bikaner: [
      'BKN - Bikaner Jn.',
      'BNW - Bhavani Jn.',
      'CUR - Churu',
      'HSR - Hisar Jn.',
      'HMH - Hanumangarh Jn.',
      'LGH - Lalgarh Jn.',
      'RE - Rewari Jn.',
      'SOG - Suratgarh Jn.',
      'SGNR - Shri Ganganagar'
    ],
    ajmer: [
      'ABR - Abu Road',
      'AII - Ajmer Jn.',
      'MJ - Marwar Jn.',
      'UDZ - Udaipur City'
    ],
    jodhpur: [
      'BGKT - Bhagat Ki Kothi',
      'BME - Barmer',
      'JU - Jodhpur Jn.',
      'JSM - Jaisalmer',
      'MTD - Merta Road',
      'SMR - Samdari',
      'SONU - Sonu'
    ],
    jaipur: [
      'AELN - New Ateli Jn.',
      'BKI - Bandukui Jn.',
      'FL - Phulera Jn.',
      'FLN - New Phulera Jn.',
      'JP - Jaipur Jn.',
      'RE - Rewari JP Jn.'
    ]
  },

  // Division sections/tabs
  divisionSections: [
    'DRM Instructions',
    'Sr DEE',
    'Sr DME',
    'Lobby Letter & Notice',
    'Chalak Patra',
    'Safety Circular',
    'Safety Drive',
    'Operating Instruction',
    'Critical & RHS Signals',
    'Signals on Down Gradient',
    'Station Signal Book',
    'WTT',
    'Yard Diagrams'
  ],

  // OneSignal configuration
  onesignal: {
    appId: '3f4b9882-4b38-4964-8e3f-67f8a5ac15fa', // Match backend App ID
    autoPrompt: false, // We'll handle prompts manually
    allowLocalhostAsSecureOrigin: true
  },

  // Role configuration
  roles: {
    crew: {
      label: 'Crew (Loco Pilot/ALP)',
      emoji: '👷',
      canAccessAdmin: false,
      canCreateUsers: false,
      accessLevel: 1
    },
    lobby: {
      label: 'Lobby Admin',
      emoji: '📬',
      canAccessAdmin: true,
      canCreateUsers: false,
      accessLevel: 2
    },
    division: {
      label: 'Division Admin',
      emoji: '🛠️',
      canAccessAdmin: true,
      canCreateUsers: true, // Can create lobby admins
      accessLevel: 3
    },
    super: {
      label: 'Super Admin',
      emoji: '👑',
      canAccessAdmin: true,
      canCreateUsers: true, // Can create division admins
      accessLevel: 4
    }
  }
};
