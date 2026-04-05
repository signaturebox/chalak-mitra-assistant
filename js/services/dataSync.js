// Deprecated: Consolidated into NotificationServiceV2
const DataSyncService = {
  init: () => console.log('DataSyncService (legacy) skipped'),
  triggerUpdate: (module) => {
    if (window.NotificationServiceV2) NotificationServiceV2.fetchData();
  }
};
