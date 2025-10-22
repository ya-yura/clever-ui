// === 📁 src/hooks/useOfflineStorage.ts ===
// Offline storage hook using IndexedDB via Dexie

import { useEffect, useState, useCallback } from 'react';
import { db, SyncAction } from '@/services/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useOfflineStorage = (module: string) => {
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get pending sync actions
  const pendingSyncActions = useLiveQuery(
    () => db.syncActions
      .where({ module, synced: false })
      .toArray(),
    [module]
  );

  // Add sync action
  const addSyncAction = useCallback(async (action: string, data: any) => {
    try {
      await db.syncActions.add({
        module,
        action,
        data,
        timestamp: Date.now(),
        synced: false,
      });
    } catch (error) {
      console.error('Failed to add sync action:', error);
    }
  }, [module]);

  // Mark action as synced
  const markSynced = useCallback(async (id: number) => {
    try {
      await db.syncActions.update(id, { synced: true });
    } catch (error) {
      console.error('Failed to mark action as synced:', error);
    }
  }, []);

  // Mark action as error
  const markError = useCallback(async (id: number, error: string) => {
    try {
      await db.syncActions.update(id, { error });
      await db.errorLogs.add({
        module,
        error,
        timestamp: Date.now(),
        resolved: false,
      });
    } catch (err) {
      console.error('Failed to mark error:', err);
    }
  }, [module]);

  // Auto-save functionality
  const enableAutoSave = useCallback((callback: () => void, interval = 30000) => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }

    const timer = setInterval(callback, interval);
    setAutoSaveTimer(timer);

    return () => clearInterval(timer);
  }, [autoSaveTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return {
    isOnline,
    pendingSyncActions: pendingSyncActions || [],
    addSyncAction,
    markSynced,
    markError,
    enableAutoSave,
  };
};
