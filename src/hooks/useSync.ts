// === 📁 src/hooks/useSync.ts ===
// Synchronization hook for offline-first data sync

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useOfflineStorage } from './useOfflineStorage';
import serverConfig from '@/config/server.json';

interface SyncConfig {
  module: string;
  syncEndpoint: string;
  onSyncComplete?: () => void;
  onSyncError?: (error: string) => void;
}

export const useSync = ({
  module,
  syncEndpoint,
  onSyncComplete,
  onSyncError,
}: SyncConfig) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const {
    isOnline,
    pendingSyncActions,
    markSynced,
    markError,
  } = useOfflineStorage(module);

  // Sync pending actions
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing || pendingSyncActions.length === 0) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Process actions in batches
      for (const action of pendingSyncActions) {
        try {
          const response = await api.post(syncEndpoint, {
            action: action.action,
            data: action.data,
            timestamp: action.timestamp,
          });

          if (response.success) {
            await markSynced(action.id!);
          } else {
            await markError(action.id!, response.error || 'Unknown error');
          }
        } catch (error: any) {
          await markError(action.id!, error.message);
        }
      }

      setLastSyncTime(Date.now());
      onSyncComplete?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Sync failed';
      setSyncError(errorMessage);
      onSyncError?.(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  }, [
    isOnline,
    isSyncing,
    pendingSyncActions,
    syncEndpoint,
    markSynced,
    markError,
    onSyncComplete,
    onSyncError,
  ]);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && pendingSyncActions.length > 0) {
      const timer = setTimeout(sync, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingSyncActions.length, sync]);

  // Periodic sync
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (pendingSyncActions.length > 0) {
        sync();
      }
    }, serverConfig.syncIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isOnline, pendingSyncActions.length, sync]);

  // Force sync
  const forceSync = useCallback(() => {
    if (isOnline) {
      sync();
    }
  }, [isOnline, sync]);

  return {
    isSyncing,
    isOnline,
    lastSyncTime,
    syncError,
    pendingCount: pendingSyncActions.length,
    sync: forceSync,
  };
};
