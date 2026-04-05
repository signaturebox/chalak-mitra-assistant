# NWR Chalak Mitra - Deployment Instructions

## Overview
This document provides detailed instructions for deploying the NWR Chalak Mitra application using XAMPP locally and on a web hosting service.

## Table of Contents
1. [Local Deployment with XAMPP](#local-deployment-with-xampp)
2. [Web Hosting Deployment](#web-hosting-deployment)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Security Considerations](#security-considerations)
6. [Troubleshooting](#troubleshooting)

## Local Deployment with XAMPP

### Prerequisites
- XAMPP installed (Apache, MySQL, PHP)
- Modern web browser
- Administrative access to your machine

### Step-by-Step Instructions

#### 1. Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP with default settings
3. Launch XAMPP Control Panel
4. Start Apache and MySQL services

#### 2. Prepare the Application Files
1. Navigate to your XAMPP installation directory (usually `C:\xampp`)
2. Go to the `htdocs` folder (`C:\xampp\htdocs`)
3. Create a new folder named `nwr_chalak_mitra`
4. Copy all files from your project folder to `C:\xampp\htdocs\nwr_chalak_mitra`

#### 3. Database Setup
1. Open your browser and go to `http://localhost/phpmyadmin`
2. Click on "Databases" tab
3. In the "Create database" section, enter:
   - Database name: `nwr_chalak_mitra`
   - Collation: `utf8mb4_unicode_ci`
4. Click "Create"
5. Click on the newly created database
6. Go to the "Import" tab
7. Click "Choose File" and select the `database_schema.sql` file from your project
8. Click "Go" to import the database schema

#### 4. Test the Application
1. Open your browser
2. Go to `http://localhost/nwr_chalak_mitra`
3. The application should load successfully
4. Test all features including login, registration, quiz, and fault search

## Web Hosting Deployment

### Prerequisites
- Web hosting account with PHP and MySQL support
- FTP client (like FileZilla) or hosting control panel access
- Database management access (like phpMyAdmin)

### Step-by-Step Instructions

#### 1. Prepare Files for Upload
1. Create a ZIP file of your entire project directory
2. Ensure all files are included, especially:
   - `project/` directory with all frontend files
   - `api/` directory with all PHP API files
   - `uploads/` directory (if it exists)
   - All configuration files

#### 2. Upload Files to Hosting
1. Connect to your hosting account via FTP or use the file manager in your control panel
2. Upload all project files to your web directory (often `public_html`, `www`, or `htdocs`)
3. Maintain the same directory structure as your local project

#### 3. Database Setup on Hosting
1. Access your hosting control panel (cPanel, Plesk, etc.)
2. Create a new MySQL database:
   - Database name: Choose a name (e.g., `yourusername_nwr`)
   - Record the database name, username, and password
3. Create a database user and assign it to the database with full privileges
4. Access phpMyAdmin through your hosting panel
5. Select your newly created database
6. Go to the "Import" tab
7. Upload and import the `database_schema.sql` file

#### 4. Configure Database Connection
1. Open the `config.php` file in your project root
2. Update the database configuration:
   ```php
   define('DB_HOST', 'localhost'); // Usually 'localhost', check with your host
   define('DB_NAME', 'your_database_name');
   define('DB_USER', 'your_database_username');
   define('DB_PASS', 'your_database_password');
   ```
3. Save the file and upload it to your server if you made changes

#### 5. Update API Base URL
1. In the frontend JavaScript, ensure the API base URL is correct
2. The `apiService.js` file should have the correct path to your API

## Configuration

### Database Configuration
Update the database settings in both locations:
- `config.php` (main configuration)
- `api/config/db_config.php` (API configuration)

### Application Settings
Review and update application settings in `config.php`:
- Upload directory paths
- File size limits
- Quiz settings
- Session settings

### .htaccess Configuration
Ensure the `.htaccess` file in the `api` directory is properly uploaded to handle API routing.

## Security Considerations

### For Production Deployment
1. **Change Default Credentials**:
   - Update the default super admin password in the database
   - Change the default database credentials

2. **Secure File Uploads**:
   - Validate file types more strictly
   - Implement file size limits
   - Store uploaded files outside the web root when possible

3. **Implement HTTPS**:
   - Use SSL certificates for secure data transmission
   - Update configuration to force HTTPS

4. **Session Security**:
   - Implement proper session management
   - Add CSRF protection
   - Implement rate limiting for login attempts

5. **Input Validation**:
   - Add server-side validation for all inputs
   - Implement SQL injection prevention
   - Add XSS protection

### Recommended Security Settings
```php
// In production, set these values:
ini_set('display_errors', 0); // Disable error display
error_reporting(0); // Disable error reporting in production
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Errors
- **Issue**: "Connection failed" or "Access denied"
- **Solution**: Verify database credentials in configuration files

#### 2. API Not Working
- **Issue**: API calls return 404 or CORS errors
- **Solution**: 
  - Check if the `api` directory is properly uploaded
  - Verify `.htaccess` file is present and correctly configured
  - Ensure Apache mod_rewrite is enabled

#### 3. File Upload Issues
- **Issue**: Upload fails or files not found
- **Solution**:
  - Check file permissions (uploads directory should be writable)
  - Verify upload directory path in configuration
  - Check PHP upload limits in php.ini

#### 4. Frontend Not Loading
- **Issue**: JavaScript errors or pages not loading
- **Solution**:
  - Check browser console for errors
  - Verify all JavaScript files are properly uploaded
  - Ensure API endpoints are correctly configured

### Server Requirements
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite enabled (or Nginx with URL rewriting)
- SSL support (recommended for production)
- File upload support enabled

### Debugging Steps
1. Check Apache error logs (`xampp/apache/logs/error.log` for XAMPP)
2. Check MySQL error logs
3. Enable error reporting temporarily in `config.php`
4. Use browser developer tools to check network requests
5. Verify file permissions on the server

## Maintenance

### Regular Maintenance Tasks
1. **Database Backups**: Regularly backup your database
2. **File Backups**: Backup uploaded files and configuration
3. **Security Updates**: Keep PHP, MySQL, and application updated
4. **Log Monitoring**: Monitor error logs for issues
5. **Performance Monitoring**: Check application performance regularly

### Updating the Application
1. Backup current files and database
2. Upload new files via FTP
3. Run any required database migrations
4. Test all functionality after updates

## Support

For additional support:
- Check the application logs
- Verify server requirements are met
- Ensure all files are properly uploaded
- Confirm database connections are working

For technical issues, contact your hosting provider for server-related problems or refer to the application documentation for application-specific issues.