# Notification Module - Integration Guide

Complete notification system with real-time updates, push notifications, counter badges, and "New" tags.

## Features

1. **Real-time Notifications** - Crew gets notified when admin uploads files (no refresh needed)
2. **Web Push Notifications** - Notifications even when app is closed
3. **Counter Badges** - Shows count on tabs where files are uploaded
4. **"New" Tags** - Shows "NEW" badge on newly uploaded files
5. **Auto-remove** - Badges disappear when crew views the file
6. **Direct Navigation** - Click notification to go directly to the file

## File Structure

```
notification-module/
├── notification-service.js      # Main JavaScript service
├── sw-notifications.js          # Service Worker for push
├── ui-components.html           # HTML components to copy
├── database.sql                 # Database tables
├── api/
│   ├── get_counters.php         # Get notification counters
│   ├── mark_viewed.php          # Mark file as viewed
│   ├── save_subscription.php    # Save push subscription
│   └── send_push.php            # Send push notification
└── INTEGRATION_GUIDE.md         # This file
```

## Step 1: Database Setup

Run the SQL in `database.sql` to create required tables:

```bash
mysql -u your_username -p your_database < database.sql
```

Or run in phpMyAdmin.

**Tables created:**
- `file_views` - Tracks viewed files
- `push_subscriptions` - Stores push notification subscriptions
- `notifications` - In-app notifications (optional)
- `user_notifications` - Tracks read notifications (optional)

## Step 2: Copy API Files

Copy the PHP files from `api/` folder to your server's API directory:

```
/api/notifications/
├── get_counters.php
├── mark_viewed.php
├── save_subscription.php
└── send_push.php
```

**Note:** Update the `require_once` path in each PHP file to match your `db_config.php` location.

## Step 3: Copy Service Worker

Copy `sw-notifications.js` to your web root directory:

```
/sw-notifications.js
```

## Step 4: Include JavaScript

Add this to your HTML `<head>` or before closing `</body>`:

```html
<!-- Notification Module -->
<script src="/notification-module/notification-service.js"></script>
```

Or copy the contents of `notification-service.js` to your existing JS file.

## Step 5: Add UI Components

### 5.1 Notification Bell (Add to Navbar)

Copy the bell icon HTML from `ui-components.html` section 1:

```html
<div class="notification-bell-wrapper">
  <button id="notificationBell" onclick="NotificationModule.toggleDropdown()">
    <!-- Bell SVG icon -->
    <span id="notificationBadge">0</span>
  </button>
</div>
```

### 5.2 Divisions Counter (Add to Nav)

```html
<a href="/divisions" class="nav-item">
  <span>Divisions</span>
  <span id="divisionsCounter">0</span>
</a>
```

### 5.3 Dashboard Widget (Add to Dashboard)

```html
<div class="dashboard-section">
  <h3>📢 Latest Notices</h3>
  <div id="notificationWidgetContent">
    <!-- Content auto-populated -->
  </div>
</div>
```

### 5.4 File Cards with "New" Badge

Add `data-file-id` and `data-uploaded-at` attributes to your file cards:

```html
<div class="file-card" 
     data-file-id="123" 
     data-uploaded-at="2026-02-20T10:00:00Z"
     onclick="NotificationModule.markFileAsViewed(123)">
  <span class="file-title">File Name.pdf</span>
  <!-- "NEW" badge auto-added by JavaScript -->
</div>
```

### 5.5 Tabs with Counter

Add `data-section` attribute to your tab buttons:

```html
<button data-section="Safety Drive" class="tab-btn">
  Safety Drive
  <!-- Counter badge auto-added -->
</button>
```

## Step 6: Configure Push Notifications (Optional)

### 6.1 Generate VAPID Keys

Install web-push CLI:
```bash
npm install -g web-push
```

Generate keys:
```bash
web-push generate-vapid-keys
```

### 6.2 Update Keys

Update the VAPID keys in:
1. `notification-service.js` - `config.vapidPublicKey`
2. `api/send_push.php` - `$VAPID_PUBLIC_KEY` and `$VAPID_PRIVATE_KEY`

### 6.3 Install Web Push Library (Server)

For proper push notification support, install a PHP web push library:

```bash
composer require minishlink/web-push
```

Then update `send_push.php` to use the library instead of basic curl.

## Step 7: Trigger Push on File Upload

When admin uploads a file, call the send push API:

```php
// After successful file upload
$fileData = [
    'file_id' => $fileId,
    'file_name' => $fileName,
    'section' => $section,
    'division_id' => $divisionId,
    'lobby_id' => $lobbyId,
    'uploader_id' => $userId
];

// Send push notification
$ch = curl_init('https://yoursite.com/api/notifications/send_push.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fileData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_exec($ch);
curl_close($ch);
```

Or in JavaScript after upload:

```javascript
// After file upload success
fetch('/api/notifications/send_push.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file_id: fileId,
    file_name: fileName,
    section: section,
    division_id: divisionId,
    lobby_id: lobbyId,
    uploader_id: userId
  })
});
```

## Step 8: Test the Integration

1. **Clear browser cache** and reload the page
2. **Open browser console** and check for:
   - `[NotificationModule] Initializing...`
   - `[NotificationModule] Polling started`
3. **Upload a file as admin**
4. **Check crew side** - should see:
   - Toast notification
   - Counter badge on bell icon
   - Counter badge on divisions nav
   - "New" badge on file (if within 24 hours)
5. **Click the file** - "New" badge should disappear

## Configuration Options

### JavaScript Config

Edit these in `notification-service.js`:

```javascript
config: {
  pollingInterval: 3000,  // Poll every 3 seconds
  apiBaseUrl: '/api',     // Your API base URL
  vapidPublicKey: '...'   // Your VAPID public key
}
```

### User Integration

The module automatically detects users from:
1. `window.AuthService.getUser()`
2. `window.currentUser`
3. `localStorage.getItem('user')`

To customize, override:

```javascript
NotificationModule.getCurrentUser = function() {
  // Return your user object with: id, division, lobby
  return {
    id: 123,
    division: 'Bikaner',
    lobby: 'Safety Drive'
  };
};
```

## Troubleshooting

### Notifications not showing
- Check browser console for errors
- Verify API endpoints return correct data
- Ensure `user_id` is being passed correctly

### Push notifications not working
- Check if service worker is registered in DevTools > Application > Service Workers
- Verify VAPID keys are correct
- Check if permission is granted (bell icon in address bar)

### Counter badges not updating
- Verify `data-section` attributes match section names in database
- Check if `file_views` table exists
- Ensure files have `uploaded_at` timestamp

### "New" tags not showing
- Add `data-file-id` and `data-uploaded-at` to file cards
- Check if file is within 24 hours of upload
- Verify `markFileAsViewed()` is called on click

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited push notification support
- Mobile Chrome: Full support
- Mobile Safari: Limited support

## Security Notes

1. Always validate `user_id` on server side
2. Use HTTPS for push notifications
3. Store VAPID private key securely
4. Sanitize file names before displaying

## Support

For issues or questions, check:
1. Browser console for JavaScript errors
2. Server logs for PHP errors
3. Network tab for API request failures
