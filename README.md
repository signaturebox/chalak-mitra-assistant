# NWR Chalak Mitra - Railway Crew Companion

A comprehensive web application for North Western Railway loco pilots and crew members, featuring quiz systems, fault search, document management, and certificate generation.

## 📁 Project Structure

```
project/
├── index.html              # Main HTML file
├── css/
│   ├── variables.css       # CSS custom properties
│   ├── reset.css           # CSS reset and base styles
│   ├── layout.css          # Layout and structure
│   ├── components.css      # Reusable components
│   ├── pages.css           # Page-specific styles
│   └── responsive.css      # Responsive breakpoints
├── js/
│   ├── config.js           # Application configuration
│   ├── data/
│   │   ├── faultDatabase.js    # Locomotive fault database
│   │   └── questionBank.js     # Quiz question bank
│   ├── utils/
│   │   ├── helpers.js          # Utility functions
│   │   └── storage.js          # LocalStorage management
│   ├── services/
│   │   ├── navigation.js       # Page navigation
│   │   ├── auth.js             # Authentication/login
│   │   ├── search.js           # Fault search
│   │   ├── quiz.js             # Quiz management
│   │   ├── certificate.js      # PDF certificate generation
│   │   └── admin.js            # Admin features
│   ├── pages/
│   │   ├── dashboard.js        # Dashboard page
│   │   ├── mobileHome.js       # Mobile home page
│   │   ├── departments.js      # Department pages
│   │   ├── searchPage.js       # Search page
│   │   ├── quizPage.js         # Quiz page
│   │   └── adminPage.js        # Admin panel
│   └── app.js              # Main application entry
└── README.md               # This file
```

## 🎯 Features

### 1. User Roles & Authentication
- **Crew**: Standard users with quiz access
- **Super Admin**: Full access to all features
- **Division Admin**: Division-specific admin rights
- **Lobby Admin**: Lobby-level administration

### 2. Navigation
- **Desktop**: Sidebar navigation with categorized sections
- **Mobile**: Bottom navigation bar + animated tile grid
- **Responsive**: Adapts seamlessly to all screen sizes

### 3. Content Sections
- 📢 GM Message & PCEE Message
- 🗂️ Divisions (Jaipur, Ajmer, Jodhpur, Bikaner)
- 📚 Rule Books & Operating Manuals
- 🚆 Locomotive Documentation (Electric, Diesel, Vande Bharat)
- 🚦 Departments (Traffic, OHE, C&W, P-Way)
- 🚫 SPAD Prevention Guidelines

### 4. Fault Search System
- Search by fault code, symptom, or locomotive type
- Filter by Electric/Diesel/Vande Bharat
- Copy troubleshooting steps to clipboard
- Detailed fix procedures

### 5. CLI Quiz System
- 10 randomized questions per quiz
- Multiple categories (Mixed, SPAD, RHS, Loco)
- Auto-fill for logged-in crew members
- Pass threshold: 6/10
- PDF certificate generation with QR code

### 6. Admin Panel
- Site logo upload and management
- Project ZIP export (HTML + logo)
- User management features
- Content upload capabilities

### 7. Certificate Generation
- Professional PDF certificates
- QR code verification
- Custom logo integration
- Digital signature
- Unique certificate ID

## 🚀 Getting Started

### Installation

1. **Clone or download** the project folder
2. **Open** `index.html` in a modern web browser

OR

3. **Serve via HTTP server** (recommended):
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   ```

4. **Access** at `http://localhost:8080`

### No Build Process Required!
This is a **client-side only** application. All files are plain HTML, CSS, and JavaScript - no compilation needed.

## 📱 Usage

### Login
1. Click the 🔐 Login button
2. Select your role (Crew/Admin)
3. Enter credentials (demo - any name/password works)
4. Enjoy personalized features!

### Taking a Quiz
1. Navigate to **CLI Quiz** section
2. Fill in crew details (auto-filled for logged-in crew)
3. Select quiz topic
4. Click **Start Quiz**
5. Answer 10 questions
6. Submit to see results
7. Download certificate if passed (≥6/10)

### Searching Faults
1. Go to **Fault Search** page
2. Enter fault code, symptom, or loco name
3. Select type filter (All/Electric/Diesel/Vande Bharat)
4. Click **Search**
5. Copy troubleshooting steps as needed

### Admin Features
1. Login as Admin
2. Navigate to **Admin Panel**
3. Upload site logo (PNG/JPEG)
4. Download project ZIP for backup
5. Manage content and users

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **Vanilla JavaScript**: No frameworks, pure ES6+

### External Libraries
- **jsPDF**: PDF certificate generation
- **QRCode.js**: QR code generation
- **Lottie Player**: Animated icons
- **JSZip**: Project export
- **FileSaver.js**: File downloads

## 📊 Data Storage

### LocalStorage
- User authentication state
- Site logo (base64)
- Preferences

### In-Memory
- Fault database
- Question bank
- Current quiz state

## 🎨 Customization

### Colors
Edit `css/variables.css`:
```css
:root {
  --primary: #1565c0;      /* Main blue color */
  --primary-dark: #0d47a1;  /* Dark blue */
  --primary-light: #1976d2; /* Light blue */
  /* ... */
}
```

### Adding Faults
Edit `js/data/faultDatabase.js`:
```javascript
FAULT_DATABASE.push({
  type: 'electric',  // or 'diesel', 'vb'
  code: 'YOUR_CODE',
  title: 'Fault Title',
  loco: 'Loco Model',
  symptom: 'Symptoms...',
  fix: 'Troubleshooting steps...'
});
```

### Adding Questions
Edit `js/data/questionBank.js`:
```javascript
QUESTION_BANK.push({
  category: 'mixed',  // or 'spad', 'rhs', 'loco'
  question: 'Your question?',
  options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
  answer: 0  // Index of correct answer (0-3)
});
```

## 📱 Responsive Design

### Breakpoints
- **Desktop**: ≥768px (sidebar navigation)
- **Tablet**: 767px - 481px (bottom navigation)
- **Mobile**: ≤480px (optimized mobile view)

### Features by Device
- **Desktop**: Full sidebar + all features
- **Tablet/Mobile**: Bottom nav + tile grid + swipe gestures

## 🔒 Security Note

This is a **demo/prototype application** with client-side only authentication.

For production use:
- ✅ Add server-side authentication
- ✅ Use HTTPS
- ✅ Implement proper database
- ✅ Add API backend
- ✅ Enable real user management

## 🤝 Contributing

To extend this project:

1. **Add new pages**: Create in `js/pages/`
2. **Add new services**: Create in `js/services/`
3. **Add styles**: Update relevant CSS file
4. **Update navigation**: Edit `js/services/navigation.js`

## 📄 Browser Support

### Fully Supported
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Partially Supported
- ⚠️ IE 11 (limited features)

## 🐛 Troubleshooting

### Issue: Certificate not generating
- **Solution**: Check browser console for errors; ensure jsPDF loaded

### Issue: QR code not appearing
- **Solution**: Wait 300ms for generation; check QRCode.js loaded

### Issue: Logo not saving
- **Solution**: Check localStorage quota; try smaller image

### Issue: Mobile view not working
- **Solution**: Check viewport meta tag; test responsive CSS

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify all external libraries are loaded
- Ensure modern browser is used
- Review this README

## 📝 License

This project is developed for North Western Railway internal use.

## 🎖️ Credits

- **Design**: Modern railway UI/UX
- **Icons**: Emoji + Lottie animations
- **Libraries**: jsPDF, QRCode.js, JSZip, FileSaver.js

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Developed for**: North Western Railway (NWR)

🚆 **Safe Journey!** 🚆
