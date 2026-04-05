# NWR Chalak Mitra - Running Instructions

## Overview
This document explains how to run the NWR Chalak Mitra application using only the Python HTTP server on port 8080, which serves the complete modular application with all features.

## Application Structure
The main application is located in the `project/` directory and contains:
- Modular JavaScript architecture with separate service files
- Complete feature set including authentication, quizzes, fault search, admin panel, etc.
- Responsive design for desktop and mobile

## Running the Application

### Prerequisites
- Python 3.x installed on your system
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Steps to Run

1. **Navigate to the project directory:**
   ```bash
   cd c:\Users\USER\Desktop\nwr chalak\project
   ```

2. **Start the Python HTTP server:**
   ```bash
   python -m http.server 8080
   ```

3. **Access the application:**
   Open your browser and go to: `http://localhost:8080`

### Alternative Method (if Python http.server doesn't work)
If the above command doesn't work, you can use:
```bash
# If you have Node.js installed, you can use:
npx http-server -p 8080
```

## Features Available
All features mentioned in the README are available in this version:
- User Roles & Authentication (Crew, Super Admin, Division Admin, Lobby Admin)
- Navigation (Desktop: Sidebar, Mobile: Bottom navigation)
- Content Sections (GM Message, PCEE Message, Divisions, Rule Books, etc.)
- Fault Search System
- CLI Quiz System with certificate generation
- Admin Panel
- Profile Management
- Push Notifications
- Complete modular architecture

## Stopping the Server
To stop the server, press `Ctrl + C` in the terminal/command prompt where the server is running.

## Troubleshooting
- If you get a "port already in use" error, check if another process is using port 8080:
  ```bash
  netstat -ano | findstr :8080
  ```
- Make sure you're running the server from the `project` directory, not the root directory
- Ensure all external libraries load properly (jsPDF, QRCode.js, etc.)

## Development Notes
- The application is client-side only with no build process required
- All data is stored in browser's localStorage
- For production use, add server-side authentication and proper database