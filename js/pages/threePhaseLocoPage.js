// 3-Phase Electric Locomotive Fault Troubleshooting System
// Matches structure and styling of FAULTS.html
// Updated to include full header structure and left-aligned details

const ThreePhaseLocoPage = {
  currentLanguage: 'HI', // 'HI' or 'EN'
  currentSubsystemCode: null,
  currentFaultCode: null,
  db: [], // Will hold the fault data

  render(container) {
    // 1. Inject CSS
    const styles = `
      <style>
        :root {
          --primary: #0a4f86;
          --primary2: #073a63;
          --secondary: #ff9c2a;
          --bg: #f3f7fb;
          --card: #ffffff;
          --text: #0f172a;
          --shadow: 0 14px 30px rgba(0,0,0,.10);
          --faultRed: #b71c1c;
          --faultRed2: #7f0f0f;
          --pillDark: #0b1220;
          --pillDark2: #0e1a2f;
        }
        
        /* Scoped styles for the fault search system */
        .fault-system-container {
          font-family: 'Poppins', 'Tiro Devanagari Hindi', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          padding-bottom: 80px; /* Space for bottom nav */
          width: 100%;
        }

        .fault-system-container header {
          padding: 18px 0;
          background: linear-gradient(135deg, var(--primary), var(--primary2));
          color: #fff;
          box-shadow: 0 10px 25px rgba(0,0,0,.25);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.3s ease;
        }
        .fault-system-container header.scrolled {
          padding: 8px 0;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .fault-system-container header.scrolled .rail-badge {
          width: 45px; height: 45px; font-size: 20px;
        }
        .fault-system-container header.scrolled h1 {
          font-size: 22px;
        }
        .fault-system-container header.scrolled .dev {
          display: none;
        }
        .fault-system-container header.scrolled .lang-box {
          padding: 8px 16px;
        }
        .fault-system-container header.scrolled .lang-title {
          margin-bottom: 5px;
          font-size: 11px;
        }
        .fault-system-container header.scrolled .lang-hint {
          display: none;
        }
        .fault-system-container header.scrolled .head-left {
          padding: 10px 16px;
        }
        
        
        .fault-system-container .header-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }
        
        .fault-system-container .head-left {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 24px;
          padding: 16px;
          flex: 1;
          min-width: 280px;
        }
        
        .fault-system-container .rail-badge {
          width: 60px; height: 60px;
          border-radius: 18px;
          background: rgba(255,255,255,.14);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          box-shadow: 0 12px 25px rgba(0,0,0,.25);
          flex-shrink: 0;
        }
        
        .fault-system-container .top-title {
          font-size: 12px;
          letter-spacing: 2px;
          opacity: .92;
          text-transform: uppercase;
          font-weight: 700;
        }
        
        .fault-system-container h1 {
          font-size: 28px;
          margin-top: 6px;
          font-weight: 800;
          line-height: 1.1;
          color: #fff;
        }
        
        .fault-system-container .badge {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          background: var(--secondary);
          color: #1b1b1b;
          font-weight: 900;
          box-shadow: 0 12px 22px rgba(0,0,0,.25);
          width: fit-content;
        }
        
        .fault-system-container .dev {
          margin-top: 10px;
          font-size: 13px;
          opacity: .92;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          font-weight: 600;
        }
        
        .fault-system-container .lang-box {
          min-width: 260px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 14px 26px rgba(0,0,0,.18);
        }
        
        .fault-system-container .lang-title {
          font-weight: 900;
          font-size: 13px;
          opacity: .95;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .fault-system-container .lang-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }
        
        .fault-system-container .lang-btn {
          flex: 1;
          border: none;
          padding: 11px 12px;
          border-radius: 16px;
          cursor: pointer;
          font-weight: 900;
          background: rgba(255,255,255,.16);
          color: #fff;
          transition: .2s;
        }
        .fault-system-container .lang-btn.active {
          background: #fff;
          color: var(--primary);
        }
        
        .fault-system-container .lang-hint {
          font-size: 12px;
          opacity: .92;
          line-height: 1.4;
        }

        .fault-system-container .mobile-header {
          display: none;
          padding: 12px 14px;
          position: sticky;
          top: 0;
          z-index: 110;
          background: linear-gradient(135deg, var(--primary), var(--primary2));
          box-shadow: 0 10px 25px rgba(0,0,0,.25);
          color: #fff;
          transition: all 0.3s ease;
        }
        .fault-system-container .mobile-header.scrolled {
          padding: 8px 14px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .fault-system-container .mobile-header.scrolled .mh-logo {
          width: 36px; height: 36px; font-size: 15px;
        }
        .fault-system-container .mobile-header.scrolled .mh-title .line2 {
          font-size: 13px;
        }
        .fault-system-container .mobile-header.scrolled .mh-dev-credit {
          display: none;
        }
        .fault-system-container .mobile-header.scrolled .mh-lang {
          padding: 4px;
        }
        .fault-system-container .mobile-header.scrolled .mh-lang button {
          padding: 5px 8px;
          font-size: 10px;
        }
        
        .fault-system-container .mh-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .fault-system-container .mh-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .fault-system-container .mh-logo {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: rgba(255,255,255,.14);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 10px 18px rgba(0,0,0,.20);
          flex-shrink: 0;
        }
        .fault-system-container .mh-title {
          display: flex;
          flex-direction: column;
          min-width: 0;
          line-height: 1.1;
        }
        .fault-system-container .mh-title .line1 {
          font-size: 10px;
          opacity: .92;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fault-system-container .mh-title .line2 {
          font-size: 15px;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }
        .fault-system-container .mh-lang {
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 999px;
          display: flex;
          gap: 6px;
          padding: 6px;
          flex-shrink: 0;
        }
        .fault-system-container .mh-lang button {
          border: none;
          padding: 8px 10px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 900;
          font-size: 12px;
          background: transparent;
          color: #fff;
        }
        .fault-system-container .mh-lang button.active {
          background: #fff;
          color: var(--primary);
          box-shadow: 0 10px 16px rgba(0,0,0,.16);
        }

        @media (max-width: 900px) {
          .fault-system-container header { display: none; }
          .fault-system-container .mobile-header { display: block; }
        }

        /* Container */
        .fault-system-container .fs-container {
          max-width: 1200px;
          margin: 18px auto;
          padding: 0 16px;
          padding-bottom: 90px;
        }

        .fault-system-container .search-card {
          background: var(--card);
          border-radius: 24px;
          padding: 16px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0,0,0,.06);
          margin-bottom: 16px;
        }

        .fault-system-container .search-title {
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 12px;
          color: #0f172a;
        }
        @media(max-width: 520px){
          .fault-system-container .search-title { font-size: 20px; }
        }

        .fault-system-container .search-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .fault-system-container .search-row input {
          flex: 1;
          border: 1px solid rgba(0,0,0,.12);
          padding: 14px 14px;
          border-radius: 16px;
          outline: none;
          font-size: 15px;
          background: #f8fbff;
        }
        .fault-system-container .search-row input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(10,79,134,.10);
          background: #fff;
        }

        .fault-system-container .btn {
          border: none;
          padding: 13px 16px;
          border-radius: 16px;
          background: var(--primary);
          color: #fff;
          font-weight: 900;
          cursor: pointer;
          transition: .2s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          white-space: nowrap;
        }
        .fault-system-container .btn.light {
          background: #eef6ff;
          color: var(--primary);
          box-shadow: none;
        }

        /* Pages */
        .fault-page { display: none; }
        .fault-page.active { display: block; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Grid */
        .cards-grid {
          margin-top: 16px;
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media(min-width: 560px){ .cards-grid { grid-template-columns: repeat(3, 1fr); } }
        @media(min-width: 1000px){ .cards-grid { grid-template-columns: repeat(5, 1fr); } }

        .mini-card {
          background: #fff;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 10px 22px rgba(0,0,0,.06);
          border: 1px solid rgba(0,0,0,.06);
          min-height: 118px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .mini-card:active { transform: scale(0.98); }

        .mini-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .ss-code { font-weight: 900; color: #0f172a; font-size: 16px; }
        .ss-name { font-size: 13px; color: #475569; line-height: 1.25; margin-top: 3px; font-weight: 700; }
        .btn-show {
          border: none;
          background: #eef6ff;
          color: var(--primary);
          padding: 10px 12px;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 900;
          align-self: center;
        }

        .fault-card {
          background: #fff;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 10px 22px rgba(0,0,0,.06);
          border: 1px solid rgba(0,0,0,.06);
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .fault-card:active { transform: scale(0.98); }
        .fault-code { color: #e11d48; font-weight: 900; font-size: 16px; }
        .fault-title { font-size: 13px; color: #475569; line-height: 1.25; font-weight: 700; }
        .btn-check {
          align-self: center;
          border: none;
          background: #ffecec;
          color: #e11d48;
          padding: 10px 14px;
          border-radius: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        /* Search Results */
        .search-results { margin-top: 12px; display: grid; gap: 10px; }
        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-radius: 16px;
          background: #f7fbff;
          border: 1px solid rgba(0,0,0,.06);
        }
        .r-code { font-weight: 900; color: var(--primary); }
        .r-sub { font-size: 12px; color: #475569; font-weight: 700; }
        .btn-open {
          border: none;
          padding: 10px 14px;
          border-radius: 14px;
          background: #ffecec;
          color: #e11d48;
          font-weight: 900;
          cursor: pointer;
        }

        /* Page 3 Styles */
        .top-mini-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          margin-bottom: 10px;
          font-weight: 800;
        }
        .tiny-dot {
          width: 6px; height: 6px; border-radius: 999px; background: #ef4444;
          display: inline-block; margin-right: 6px;
        }

        .fault-hero {
          position: relative;
          background: linear-gradient(135deg, var(--faultRed), var(--faultRed2));
          color: #fff;
          border-radius: 28px;
          padding: 18px;
          box-shadow: 0 18px 30px rgba(0,0,0,.18);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .fault-hero-left { min-width: 260px; flex: 1; }
        .fault-code-pill {
          background: #fff;
          color: #111827;
          padding: 10px 16px;
          border-radius: 999px;
          font-weight: 900;
          box-shadow: 0 12px 20px rgba(0,0,0,.18);
          display: inline-block;
        }
        .fault-subname { font-size: 12px; opacity: .9; font-weight: 900; margin-top: 6px; }

        .fault-hero-title { text-align: center; flex: 2; min-width: 260px; }
        .fault-hero-title .small { font-size: 11px; letter-spacing: 2px; opacity: .9; font-weight: 900; }
        .fault-hero-title .main { font-size: 26px; font-weight: 900; margin-top: 6px; line-height: 1.15; }
        @media(max-width: 520px){ .fault-hero-title .main { font-size: 20px; } }

        .priority-pill {
          background: #fbbf24;
          color: #111827;
          border-radius: 999px;
          padding: 10px 14px;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 12px 22px rgba(0,0,0,.18);
          min-width: 130px;
          justify-content: center;
        }

        .fault-info-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 14px;
        }
        @media(max-width: 900px){ .fault-info-grid { grid-template-columns: 1fr; } }

        .soft-box {
          background: #fff;
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 14px 26px rgba(0,0,0,.08);
          border: 1px solid rgba(0,0,0,.06);
        }
        .mini-message {
          background: #fff;
          border-radius: 22px;
          padding: 14px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 10px 20px rgba(0,0,0,.06);
          margin-bottom: 12px;
        }
        .mini-message.gray { background: #f1f7ff; border: 1px solid rgba(10,79,134,.12); }
        .mini-message h3 { font-size: 14px; font-weight: 900; display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .mini-message .msg { font-weight: 900; color: #111827; font-size: 16px; line-height: 1.3; }
        .mini-message .sub { font-size: 12px; color: #475569; font-weight: 900; margin-top: 6px; }

        .indicator-panel {
          background-color: #0d111b; /* User's Dark BG */
          border-radius: 35px;
          padding: 25px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          color: #fff;
          border: none;
          height: auto; /* Changed from 100% to auto to fit content */
          min-height: 100%;
          text-align: left !important;
          display: flex;
          flex-direction: column;
          align-items: flex-start !important;
        }
        .indicator-title { 
          color: #ffffff; 
          font-size: 0.95rem; 
          letter-spacing: 1.5px; 
          margin: 0 0 20px 10px; 
          font-weight: 800;
          text-transform: uppercase; 
          text-align: left !important; width: 100%;
        }
        .indicator-item {
          background-color: #171c28;
          border: 1.5px solid #1e2533;
          border-radius: 22px;
          margin-bottom: 12px;
          padding: 18px 22px;
          display: flex; 
          flex-direction: row; /* Ensure row */
          align-items: center; 
          transition: transform 0.2s ease;
          width: 100%;
          box-sizing: border-box;
          justify-content: flex-start !important;
          text-align: left !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        .indicator-item:hover {
          border-color: #2c3549;
        }

        .lampDot { 
          display: block; /* Fix for span width/height */
          width: 40px; height: 40px; /* User requested 50px */
          border-radius: 50%; 
          margin-right: 20px;
          flex-shrink: 0; 
          box-shadow: none; /* Reset default shadow */
        }
        .lampDot.red { background-color: #ff3b30; box-shadow: 0 0 12px #ff3b30; }
        .lampDot.yellow { background-color: #ffcc00; box-shadow: 0 0 12px #ffcc00; }
        .lampDot.orange { background-color: #ff9500; box-shadow: 0 0 12px #ff9500; }
        .lampDot.gray { background: #94a3b8; opacity: 0.3; }
        
        @keyframes pulse-glow { 
          from { opacity: 1; transform: scale(1); box-shadow: 0 0 15px currentColor; } 
          to { opacity: 0.4; transform: scale(0.95); box-shadow: 0 0 5px currentColor; } 
        }

        .lampName { 
          color: #ffffff;
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.3px;
          text-align: left !important; 
          line-height: 1.3;
        }
        .lampHint { display: none; } /* User example didn't show hint, but we can keep if needed. For now hiding to match design exactness or making it subtle */
        
        /* Re-enabling hint but matching user's label-group style */
        .label-group {
             display: flex; 
             flex-direction: column; 
             line-height: 1.3; 
        }

        .action-card {
          margin-top: 16px;
          background: #fff;
          border-radius: 26px;
          padding: 16px;
          box-shadow: 0 16px 28px rgba(0,0,0,.08);
          border: 1px solid rgba(0,0,0,.06);
          text-align: left !important; /* Enforce container left align */
        }
        /* Left Align Enforced */
        .action-head { 
          display: flex; align-items: center; gap: 12px; font-weight: 900; font-size: 22px; margin-bottom: 12px; 
          justify-content: flex-start !important; /* Enforce left align */
          text-align: left !important;
        }
        .action-icon {
          width: 34px; height: 34px; border-radius: 12px; background: #e9e7ff;
          display: flex; align-items: center; justify-content: center;
          color: #4f46e5; font-size: 14px; font-weight: 900;
        }
        .action-step {
          background: #f8fafc;
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 18px;
          padding: 14px 14px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
          justify-content: flex-start !important; /* Enforce left align */
          text-align: left !important;
          width: 100%;
          box-sizing: border-box;
        }
        .stepNo {
          width: 26px; height: 26px; border-radius: 999px; background: #eef2ff; color: #4f46e5;
          font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;
        }
        .stepText { font-weight: 900; color: #0f172a; font-size: 13px; line-height: 1.35; text-align: left !important; flex: 1; }

        /* Isolation */
        .iso-hero {
          margin-top: 16px;
          background: linear-gradient(135deg, #7f1d1d, #991b1b);
          border-radius: 26px;
          padding: 18px;
          box-shadow: 0 18px 30px rgba(0,0,0,.18);
          color: #fff;
          border: 1px solid rgba(255,255,255,.08);
        }
        .iso-tag {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.10);
          padding: 10px 12px; border-radius: 999px; font-weight: 900; font-size: 12px; margin-bottom: 14px;
        }
        .iso-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media(max-width: 900px){ .iso-grid { grid-template-columns: 1fr; } }
        
        .iso-left h3 { font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; opacity: .85; font-weight: 900; }
        .iso-left .big { font-size: 20px; font-weight: 900; margin-top: 8px; }
        .iso-left .sub { font-size: 13px; opacity: .95; font-weight: 900; margin-top: 6px; }

        .iso-steps h3 { font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; opacity: .85; font-weight: 900; margin-bottom: 10px; }
        .iso-pill-step {
          background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.12);
          padding: 12px 14px; border-radius: 14px; margin-bottom: 10px; font-weight: 900; font-size: 13px;
        }

        .iso-lamp-box {
          margin-top: 14px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
          padding: 14px; border-radius: 18px;
        }
        .iso-lamp-title { font-weight: 900; margin-bottom: 10px; font-size: 13px; display: flex; align-items: center; gap: 10px; }
        .iso-lamp-pill {
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.14); border-radius: 999px;
          padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px;
        }

        /* Responsive Improvements for Mobile */
        @media (max-width: 600px) {
          .fault-system-container .fs-container { margin: 10px auto; padding: 0 12px; padding-bottom: 90px; }
          .fault-system-container .search-card { padding: 12px; border-radius: 20px; }
          .fault-system-container .search-title { font-size: 18px; margin-bottom: 10px; }
          .fault-system-container .search-row { gap: 6px; width: 100%; box-sizing: border-box; }
          .fault-system-container .search-row input { padding: 12px; font-size: 14px; min-width: 0; flex: 1; }
          .fault-system-container .search-row .btn { width: 45px; height: 45px; padding: 0; flex-shrink: 0; justify-content: center; border-radius: 12px; }
          .fault-system-container .search-row .btn span { display: none; }
          .fault-system-container .search-row .btn i { margin: 0; font-size: 16px; }
          .fault-system-container .btn { padding: 10px 16px; font-size: 13px; border-radius: 12px; }
          
          .fault-hero { padding: 15px; border-radius: 22px; padding-bottom: 20px; }
          .fault-hero-left { min-width: 0; margin-bottom: 5px; flex: none; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
          .fault-code-pill { padding: 8px 14px; font-size: 14px; }
          .fault-hero-title { text-align: center; min-width: 0; margin-top: 8px; width: 100%; flex: none; }
          .fault-hero-title .main { font-size: 18px; text-align: center; }
          .fault-hero-title .small { font-size: 9px; text-align: center; }
          .fault-subname { margin-bottom: 5px; }
          
          .priority-pill {
            position: absolute;
            top: 15px;
            right: 15px;
            margin: 0;
            min-width: auto;
            width: auto;
            padding: 8px 12px;
            font-size: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10;
          }
          
          .fault-info-grid { gap: 12px; margin-top: 12px; }
          .soft-box { padding: 12px; border-radius: 20px; }
          .mini-message { padding: 12px; border-radius: 18px; margin-bottom: 10px; }
          .mini-message h3 { font-size: 13px; }
          .mini-message .msg { font-size: 14px; }
          .mini-message .sub { font-size: 11px; }
          
          .indicator-panel { padding: 18px; border-radius: 25px; }
          .indicator-title { font-size: 0.8rem; margin-bottom: 15px; }
          .indicator-item { padding: 12px 15px; border-radius: 18px; margin-bottom: 10px; }
          .lampDot { width: 32px; height: 32px; margin-right: 12px; }
          .lampName { font-size: 0.9rem; }
          
          .action-card { border-radius: 22px; padding: 15px; margin-top: 12px; }
          .action-head { font-size: 19px; }
          .action-step { padding: 12px; gap: 10px; border-radius: 15px; margin-bottom: 8px; }
          .stepNo { width: 24px; height: 24px; font-size: 11px; }
          .stepText { font-size: 12.5px; }
          
          .iso-hero { padding: 15px; border-radius: 22px; }
          .iso-left .big { font-size: 16px; }
          .iso-pill-step { font-size: 12px; padding: 10px; }

          .mini-card { min-height: 100px; padding: 12px; }
          .ss-code { font-size: 15px; }
          .ss-name { font-size: 12px; }
          .btn-show { padding: 8px 10px; font-size: 12px; }
          
          .fault-card { min-height: 120px; padding: 12px; }
          .fault-code { font-size: 15px; }
          .fault-title { font-size: 12px; }
          .btn-check { padding: 8px 12px; font-size: 12px; }
        }
      </style>
    `;

    const html = `
      <div class="fault-system-container">
        
        <!-- ✅ Mobile Header -->
        <div class="mobile-header">
          <div class="mh-row">
            <div class="mh-left">
              <div class="mh-logo">
                <i class="fa-solid fa-train"></i>
              </div>
              <div class="mh-title">
                <div class="line1">Troubleshooting</div>
                <div class="line2">NWR CHALAK MITRA</div>
              </div>
            </div>
            <div class="mh-lang">
              <button class="active" id="mBtnHI">HI</button>
              <button id="mBtnEN">EN</button>
            </div>
          </div>
          <div class="mh-dev-credit" style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.15); padding-top:8px; font-size:11px; font-weight:700; display:flex; align-items:center; gap:6px;">
             <i class="fa-solid fa-user-gear"></i> Design & Developed by: Pradeep Kr Meena (Sr. ALP/HMH)
          </div>
        </div>

        <!-- ✅ Desktop Header -->
        <header>
          <div class="header-wrap">
            <div class="head-left">
              <div class="rail-badge">
                <i class="fa-solid fa-train-subway"></i>
              </div>
              <div>
                <div class="top-title">Troubleshooting System</div>
                <h1>NWR CHALAK MITRA</h1>
                <div class="dev">
                  <i class="fa-solid fa-user-gear"></i> Design & Developed by: Pradeep Kr Meena (Sr. ALP/HMH)
                </div>
              </div>
            </div>
            <div class="lang-box">
              <div class="lang-title"><i class="fa-solid fa-language"></i> Select Language (भाषा चुनें)</div>
              <div class="lang-toggle">
                <button class="lang-btn active" id="btnHI">HINDI</button>
                <button class="lang-btn" id="btnEN">ENGLISH</button>
              </div>
              <div class="lang-hint">
                <i class="fa-regular fa-lightbulb"></i>
                Select your preferred language for troubleshooting steps.
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content Container -->
        <div class="fs-container">

          <!-- ✅ PAGE 1: Subsystems + Search -->
          <section class="fault-page active" id="page1">
            <div class="search-card">
              <div class="search-title">Fault Search (फॉल्ट कोड खोजें)</div>
              <div class="search-row">
                <input id="searchInput" type="text" placeholder="Example: F0102P1 / VCB / मुख्य पावर ..." />
                <button class="btn" id="searchBtn"><i class="fa-solid fa-search"></i> <span>Search</span></button>
                <button class="btn light" id="clearBtn"><i class="fa-solid fa-eraser"></i></button>
              </div>
              <div class="search-results" id="searchResults"></div>
            </div>

            <div style="margin-top:18px;">
              <div class="search-title" style="font-size:20px;">Sub-Systems (SS Wise Faults)</div>
              <div class="cards-grid" id="subsystemGrid"></div>
            </div>
          </section>

          <!-- ✅ PAGE 2: Fault List -->
          <section class="fault-page" id="page2">
            <div class="search-card">
              <div class="search-title">Fault Search (फॉल्ट कोड खोजें)</div>
              <div class="search-row">
                <input id="searchInput2" type="text" placeholder="Example: F0102P1 / VCB / मुख्य पावर ..." />
                <button class="btn" id="searchBtn2"><i class="fa-solid fa-search"></i> <span>Search</span></button>
                <button class="btn light" id="clearBtn2"><i class="fa-solid fa-eraser"></i></button>
              </div>
              <div class="search-results" id="searchResults2"></div>
              <div style="margin-top:12px;">
                <button class="btn light" id="backToSS"><i class="fa-solid fa-arrow-left"></i> Back to Sub-Systems</button>
              </div>
            </div>

            <div class="search-title" style="font-size:20px;margin-top:16px;" id="subsystemTitle">SS01 - Main Power</div>
            <div class="cards-grid" id="faultGrid"></div>
          </section>

          <!-- ✅ PAGE 3: Premium Red Fault Details -->
          <section class="fault-page" id="page3">
            <div class="search-card">
              <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;">
                <button class="btn light" id="backToFaults"><i class="fa-solid fa-arrow-left"></i> लिस्ट पर वापस</button>
                <div style="font-size:12px;font-weight:900;color:#ef4444;">
                  <span class="tiny-dot"></span><span id="miniFaultCode">F0102P1</span>
                </div>
              </div>
            </div>

            <div id="faultDetailsArea"></div>
          </section>

        </div>
      </div>
    `;

    container.innerHTML = styles + html;
    this.init();
  },

  init() {
    this.loadFaultData();
    this.setupEventListeners();
    this.syncLanguageButtons();
  },

  async loadFaultData() {
    try {
      // Use correct path to JSON relative to index.html
      const response = await fetch('3phse loco/MASTER_TSD_SS01_SS19.json');
      if (!response.ok) throw new Error('Failed to load master JSON');
      this.db = await response.json();
      this.renderSubsystems();
    } catch (err) {
      console.error('Error loading fault data:', err);
      // Fallback
      if (typeof THREE_PHASE_LOCO_FAULTS_FULL !== 'undefined') {
        this.db = this.convertToMasterFormat(THREE_PHASE_LOCO_FAULTS_FULL);
        this.renderSubsystems();
      } else {
        const grid = document.getElementById("subsystemGrid");
        if (grid) grid.innerHTML = `<div style="padding:20px;color:red;">Failed to load fault data.</div>`;
      }
    }
  },

  // Fallback converter
  convertToMasterFormat(data) {
    const converted = [];
    Object.keys(data).forEach(subsystemCode => {
      const subsystem = data[subsystemCode];
      const convertedSub = {
        subsystemCode: subsystemCode,
        subsystemNameHI: this.getHindiName(subsystemCode),
        subsystemNameEN: subsystem.subsystem,
        faults: []
      };
      subsystem.faults.forEach(fault => {
        convertedSub.faults.push({
          faultCode: fault.code,
          titleHI: fault.message,
          titleEN: fault.message,
          messageHI: fault.description || fault.message,
          messageEN: fault.description || fault.message,
          effectHI: (fault.effects || []).join(', ') || '',
          effectEN: (fault.effects || []).join(', ') || '',
          lamps: this.extractLampNames(fault.indicators),
          actionHI: fault.troubleshooting || [],
          actionEN: fault.troubleshooting || [],
          isolation: { required: false }
        });
      });
      converted.push(convertedSub);
    });
    return converted;
  },

  getHindiName(code) {
    const map = {
      'SS01': 'मुख्य पावर', 'SS02': 'ट्रैक्शन बोगी 1', 'SS03': 'ट्रैक्शन बोगी 2',
      'SS04': 'हार्मोनिक फ़िल्टर', 'SS05': 'होटल लोड', 'SS06': 'ऑक्स कन्वर्टर 1',
      'SS07': 'ऑक्स कन्वर्टर 2', 'SS08': 'ऑक्स कन्वर्टर 3', 'SS09': 'बैटरी सिस्टम',
      'SS11': 'ऑक्सिलरीज HB-1', 'SS12': 'ऑक्सिलरीज HB-2', 'SS13': 'कैब-1',
      'SS14': 'कैब-2', 'SS15': 'फायर डिटेक्शन यूनिट', 'SS16': 'स्पीडोमीटर',
      'SS17': 'FLG1 / ICP1', 'SS18': 'FLG2 / ICP2', 'SS19': 'ट्रेन बस'
    };
    return map[code] || code;
  },

  extractLampNames(indicators) {
    const lamps = [];
    Object.keys(indicators).forEach(lamp => {
      if (indicators[lamp] === 'ON') lamps.push(`${lamp} जलेगी`);
      else if (indicators[lamp] === 'BLINKING') lamps.push(`${lamp} Blinking होगी`);
      else lamps.push(`${lamp} नहीं जलेगी`);
    });
    return lamps;
  },

  setupEventListeners() {
    // Language (Desktop)
    const btnHI = document.getElementById("btnHI");
    const btnEN = document.getElementById("btnEN");
    if (btnHI) btnHI.onclick = () => this.setLanguage("HI");
    if (btnEN) btnEN.onclick = () => this.setLanguage("EN");

    // Language (Mobile)
    const mBtnHI = document.getElementById("mBtnHI");
    const mBtnEN = document.getElementById("mBtnEN");
    if (mBtnHI) mBtnHI.onclick = () => this.setLanguage("HI");
    if (mBtnEN) mBtnEN.onclick = () => this.setLanguage("EN");

    // Back buttons
    const backToSS = document.getElementById("backToSS");
    const backToFaults = document.getElementById("backToFaults");
    if (backToSS) backToSS.onclick = () => history.back();
    if (backToFaults) backToFaults.onclick = () => history.back();

    // Search
    this.bindSearch("searchInput", "searchBtn", "clearBtn", "searchResults");
    this.bindSearch("searchInput2", "searchBtn2", "clearBtn2", "searchResults2");

    // Scroll effect for header
    window.addEventListener('scroll', () => {
      const container = document.querySelector('.fault-system-container');
      const header = container?.querySelector('header');
      const mHeader = container?.querySelector('.mobile-header');
      const isScrolled = window.scrollY > 40;
      header?.classList.toggle('scrolled', isScrolled);
      mHeader?.classList.toggle('scrolled', isScrolled);
    });
  },

  bindSearch(inputId, btnId, clearId, resultsId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const clear = document.getElementById(clearId);
    const results = document.getElementById(resultsId);

    if (input) input.oninput = () => this.liveSearch(input.value, results);
    if (btn) btn.onclick = () => this.liveSearch(input.value, results);
    if (clear) clear.onclick = () => {
      input.value = "";
      results.innerHTML = "";
    };
  },

  t(hi, en) {
    return this.currentLanguage === "HI" ? (hi || "") : (en || "");
  },

  syncLanguageButtons() {
    const isHI = this.currentLanguage === "HI";

    // Desktop
    const btnHI = document.getElementById("btnHI");
    const btnEN = document.getElementById("btnEN");
    if (btnHI) btnHI.classList.toggle("active", isHI);
    if (btnEN) btnEN.classList.toggle("active", !isHI);

    // Mobile
    const mBtnHI = document.getElementById("mBtnHI");
    const mBtnEN = document.getElementById("mBtnEN");
    if (mBtnHI) mBtnHI.classList.toggle("active", isHI);
    if (mBtnEN) mBtnEN.classList.toggle("active", !isHI);
  },

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.syncLanguageButtons();
    if (this.isPageActive("page1")) this.renderSubsystems();
    if (this.isPageActive("page2")) this.renderFaultsOfSubsystem(this.currentSubsystemCode);
    if (this.isPageActive("page3")) this.openFault(this.currentFaultCode);

    // Refresh search results if active
    const s1 = document.getElementById("searchInput");
    const r1 = document.getElementById("searchResults");
    if (s1 && s1.value) this.liveSearch(s1.value, r1);

    const s2 = document.getElementById("searchInput2");
    const r2 = document.getElementById("searchResults2");
    if (s2 && s2.value) this.liveSearch(s2.value, r2);
  },

  showPage(id, pushHistory = true, subsystemCode = null, faultCode = null) {
    if (pushHistory) {
      try {
        history.pushState({
          view: 'threePhaseLocoFaults',
          subView: 'threePhasePage',
          pageId: id,
          subsystemCode: subsystemCode || this.currentSubsystemCode,
          faultCode: faultCode || this.currentFaultCode,
          timestamp: Date.now()
        }, '', `#faults/${id}`);
      } catch (e) { }
    }

    // Restore state if parameters provided (back navigation)
    if (subsystemCode) this.currentSubsystemCode = subsystemCode;
    if (faultCode) this.currentFaultCode = faultCode;

    if (id === 'page2' && this.currentSubsystemCode) {
      this.renderFaultsOfSubsystem(this.currentSubsystemCode);
    } else if (id === 'page3' && this.currentFaultCode) {
      this.openFault(this.currentFaultCode);
    }

    document.querySelectorAll(".fault-page").forEach(p => p.classList.remove("active"));
    const page = document.getElementById(id);
    if (page) page.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  isPageActive(id) {
    return document.getElementById(id)?.classList.contains("active");
  },

  renderSubsystems() {
    const grid = document.getElementById("subsystemGrid");
    if (!grid) return;
    grid.innerHTML = "";

    this.db.forEach(sub => {
      const card = document.createElement("div");
      card.className = "mini-card";
      card.innerHTML = `
        <div class="mini-top">
          <div>
            <div class="ss-code">${sub.subsystemCode}</div>
            <div class="ss-name">${this.t(sub.subsystemNameHI, sub.subsystemNameEN)}</div>
          </div>
          <button class="btn-show">Show</button>
        </div>
        <div style="margin-top:10px;color:#64748b;font-size:12px;font-weight:900;">
          Total Faults: <b>${(sub.faults || []).length}</b>
        </div>
      `;
      card.onclick = () => this.openSubsystem(sub.subsystemCode);
      grid.appendChild(card);
    });
  },

  openSubsystem(code) {
    this.showPage("page2", true, code);
  },

  renderFaultsOfSubsystem(code) {
    const grid = document.getElementById("faultGrid");
    const title = document.getElementById("subsystemTitle");
    if (!grid || !title) return;

    const sub = this.db.find(x => x.subsystemCode === code);
    if (!sub) return;

    title.innerText = `${sub.subsystemCode} - ${this.t(sub.subsystemNameHI, sub.subsystemNameEN)}`;
    grid.innerHTML = "";

    (sub.faults || []).forEach(f => {
      const div = document.createElement("div");
      div.className = "fault-card";
      div.innerHTML = `
        <div>
          <div class="fault-code">${f.faultCode}</div>
          <div class="fault-title">${this.t(f.titleHI, f.titleEN)}</div>
        </div>
        <button class="btn-check">Check</button>
      `;
      div.onclick = () => {
        this.showPage("page3", true, null, f.faultCode);
      };
      grid.appendChild(div);
    });
  },

  openFault(code) {
    this.currentFaultCode = code;
    const mini = document.getElementById("miniFaultCode");
    if (mini) mini.textContent = code;

    const data = this.getFaultByCode(code);
    const area = document.getElementById("faultDetailsArea");
    if (!area) return;

    if (!data) {
      area.innerHTML = `<div class="search-card"><b>❌ Fault not found:</b> ${code}</div>`;
      return;
    }

    const { sub, f } = data;
    const title = this.t(f.titleHI, f.titleEN);
    const msg = this.t(f.messageHI, f.messageEN);
    const eff = this.t(f.effectHI, f.effectEN);
    const steps = this.currentLanguage === "HI" ? (f.actionHI || []) : (f.actionEN || []);
    const lamps = f.lamps || [];
    const iso = f.isolation;
    const isoRequired = iso && iso.required;

    const pVal = this.getPriorityValue(f);

    area.innerHTML = `

      <div class="fault-hero">
        <div class="fault-hero-left">
          <div>
            <div class="fault-code-pill">${f.faultCode}</div>
            <div class="fault-subname">${sub.subsystemCode} : ${this.t(sub.subsystemNameHI, sub.subsystemNameEN)}</div>
          </div>
        </div>
        <div class="fault-hero-title">
          <div class="small">DETAILED TROUBLESHOOTING</div>
          <div class="main">${title}</div>
        </div>
        <div class="priority-pill">
          <i class="fa-solid fa-triangle-exclamation"></i>
          PRIORITY${pVal}
        </div>
      </div>

      <div class="fault-info-grid">
        <div class="soft-box">
          <div class="mini-message">
            <h3><i class="fa-solid fa-message"></i> ${this.t("फॉल्ट मैसेज", "Fault Message")}</h3>
            <div class="msg">${msg || "-"}</div>
          </div>
          <div class="mini-message gray">
            <h3><i class="fa-solid fa-bolt"></i> ${this.t("प्रभाव", "Effect")}</h3>
            <div class="sub">${eff || "-"}</div>
          </div>
        </div>
        <div class="indicator-panel">
          <div class="indicator-title">INDICATOR STATUS</div>
          ${this.renderLampIndicatorPanel(lamps)}
        </div>
      </div>

      <div class="action-card">
        <div class="action-head">
          <div class="action-icon"><i class="fa-solid fa-gears"></i></div>
          ${this.t("कार्यवाही", "Action")}
        </div>
        ${steps.length ? steps.map((s, i) => `
          <div class="action-step">
            <div class="stepNo">${i + 1}</div>
            <div class="stepText">${s}</div>
          </div>
        `).join("") : `<div style="color:#64748b;font-weight:900;">-</div>`}
      </div>

      ${isoRequired ? this.renderIsolationBlock(iso) : ''}
    `;
  },

  renderIsolationBlock(iso) {
    const title = this.t(iso.titleHI, iso.titleEN);
    const eff = this.t(iso.effectHI, iso.effectEN);
    const steps = this.currentLanguage === "HI" ? (iso.stepsHI || []) : (iso.stepsEN || []);

    return `
      <div class="iso-hero">
        <div class="iso-tag">
          <i class="fa-solid fa-triangle-exclamation"></i> ISOLATION REQUIRED
        </div>
        <div class="iso-grid">
          <div class="iso-left">
            <h3>ISOLATION MESSAGE</h3>
            <div class="big">${title || "MAIN POWER ISOLATED"}</div>
            <div class="sub">${eff || ""}</div>
          </div>
          <div class="iso-steps">
            <h3>STEPS TO FOLLOW</h3>
            ${steps.length ? steps.map(x => `<div class="iso-pill-step">• ${x}</div>`).join("") :
        `<div class="iso-pill-step">• निर्देश उपलब्ध नहीं</div>`}
          </div>
        </div>
        ${this.renderIsolationLampCard(iso)}
      </div>
    `;
  },

  renderIsolationLampCard(iso) {
    const lamps = (iso && iso.lamps) ? iso.lamps : [];
    if (!lamps.length) return `
      <div class="iso-lamp-box">
        <div class="iso-lamp-title"><i class="fa-regular fa-lightbulb"></i> Lamp Status</div>
        <div style="font-weight:900;opacity:.9;">No lamp data</div>
      </div>`;

    // Simple rendering for iso lamps
    return `
      <div class="iso-lamp-box">
        <div class="iso-lamp-title"><i class="fa-regular fa-lightbulb"></i> Lamp Status</div>
        <div style="margin-top:10px;font-weight:900;opacity:.95;">
          ${lamps.map(x => `• ${x}`).join("<br/>")}
        </div>
      </div>
    `;
  },

  getFaultByCode(code) {
    if (!code) return null;
    const q = String(code).trim().toUpperCase();
    for (const sub of this.db) {
      for (const f of (sub.faults || [])) {
        if (String(f.faultCode || "").toUpperCase() === q) return { sub, f };
      }
    }
    return null;
  },

  getPriorityValue(f) {
    const p = f.priority ?? f.Priority ?? f.priorityLevel ?? null;
    if (p === null) return 1;
    if (typeof p === "number") return p;
    if (String(p).includes("1")) return 1;
    if (String(p).includes("2")) return 2;
    if (String(p).includes("3")) return 3;
    return 1;
  },

  // Lamp logic
  lampColorByName(name) {
    const n = String(name || "").toUpperCase();
    if (n === "LSDJ") return "red";
    if (n === "LSFI") return "yellow";
    if (n === "BPFA") return "orange";
    return "gray";
  },

  parseLampAdvanced(line) {
    const raw = String(line || "").trim();
    const up = raw.toUpperCase();
    const names = [];
    if (up.includes("LSDJ")) names.push("LSDJ");
    if (up.includes("LSFI")) names.push("LSFI");
    if (up.includes("BPFA")) names.push("BPFA");
    if (names.length === 0) names.push(raw.split(" ")[0] || "LAMP");

    let state = "on";
    // Check for OFF conditions
    if (up.includes("OFF") || up.includes("NOT") || up.includes("नहीं") || up.includes("बुझेगा")) state = "off";
    // Check for BLINK conditions
    else if (up.includes("BLINK") || up.includes("टिमटिमाना") || up.includes("ब्लिंकिंग")) state = "blink";
    // Check for Buzzer
    else if (up.includes("BUZZER") || up.includes("बजर") || up.includes("BEAP")) state = "buzzer";
    // Check for BOTH (Special case)
    else if (up.includes("BOTH")) state = "bothOn";

    // User Request: Force LSFI to blink if it is ON (not off/buzzer)
    if (names.includes("LSFI") && state === "on") state = "blink";

    return { names, raw, state };
  },

  lampDotHTML(color, state) {
    if (state === "off") return `<span class="lampDot ${color}" style="opacity:.45; filter:grayscale(1);"></span>`;
    if (state === "blink") {
      const c = { red: '#ff3b30', yellow: '#ffcc00', orange: '#ff9500', gray: '#94a3b8' };
      return `<span class="lampDot ${color}" style="color:${c[color] || c.gray}; animation: pulse-glow 1s infinite alternate;"></span>`;
    }
    if (state === "buzzer") return `<i class="fa-solid fa-volume-high" style="color:#ef4444;font-size:32px;margin-right:20px;"></i>`;
    return `<span class="lampDot ${color}"></span>`;
  },

  lampTextLikeImage(name, state) {
    if (name === "LSFI" && state === "blink") return "LSFI Blinking होगी";
    if (state === "off") return `${name} नहीं जलेगी`;
    return `${name} जलेगी`;
  },

  renderLampIndicatorPanel(lampsArray) {
    const lamps = (lampsArray || []).map(l => this.parseLampAdvanced(l));
    if (!lamps.length) return `<div style="opacity:.85;font-weight:900;">No Lamp Data</div>`;

    const rows = [];
    lamps.forEach(l => {
      // Determine dots to show
      let dotsHtml = "";
      if (l.names.length > 0) {
        dotsHtml = l.names.map(n => this.lampDotHTML(this.lampColorByName(n), l.state)).join("");
      } else {
        // Fallback if no specific lamp name found but it's a lamp entry
        dotsHtml = this.lampDotHTML("gray", "on");
      }

      rows.push(`
        <div class="indicator-item">
          ${dotsHtml}
          <div class="label-group">
            <div class="lampName">${l.raw}</div>
          </div>
        </div>
      `);
    });
    return rows.join("");
  },

  lampStateHint(state) {
    if (state === "blink") return "Lamp Blinking (ब्लिंकिंग / टिमटिमाना)";
    if (state === "off") return "Lamp OFF (बुझेगा / नहीं)";
    if (state === "buzzer") return "Buzzer ON (बजर बजेगा)";
    return "Lamp ON (प्रकाशित / जलेगी)";
  },

  liveSearch(text, targetEl) {
    const q = String(text || "").trim().toUpperCase();
    targetEl.innerHTML = "";
    if (q.length < 2) return;

    const out = [];
    this.db.forEach(sub => {
      (sub.faults || []).forEach(f => {
        const code = String(f.faultCode || "").toUpperCase();
        const hi = String(f.titleHI || "").toUpperCase();
        const en = String(f.titleEN || "").toUpperCase();
        if (code.includes(q) || hi.includes(q) || en.includes(q)) out.push({ sub, f });
      });
    });

    if (!out.length) {
      targetEl.innerHTML = `
        <div class="result-row" style="background:#fff5f5;border:1px solid rgba(220,53,69,.25);">
          <div><b style="color:#dc3545;"><i class="fa-solid fa-circle-xmark"></i> No Fault Found</b></div>
        </div>`;
      return;
    }

    targetEl.innerHTML = out.slice(0, 10).map(x => `
      <div class="result-row">
        <div>
          <div class="r-code">${x.f.faultCode}</div>
          <div class="r-sub">${x.sub.subsystemCode} - ${this.t(x.sub.subsystemNameHI, x.sub.subsystemNameEN)}</div>
        </div>
        <button class="btn-open">Open</button>
      </div>
    `).join("");

    targetEl.querySelectorAll(".btn-open").forEach((btn, i) => {
      btn.onclick = () => {
        this.openFault(out[i].f.faultCode);
        this.showPage("page3");
      };
    });
  }
};
