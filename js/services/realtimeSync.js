// Deprecated: Consolidated into NotificationServiceV2
const RealtimeSyncService = {
  init: () => console.log('RealtimeSyncService (legacy) skipped'),
  connect: () => { },
  disconnect: () => { },
  setCurrentView: (view) => {
    if (window.NotificationServiceV2) window.NotificationServiceV2.currentView = view;
  }
};
window.RealtimeSyncV2 = RealtimeSyncService; // Legacy alias
