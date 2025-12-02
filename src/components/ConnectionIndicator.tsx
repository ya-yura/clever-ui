import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';

interface ConnectionIndicatorProps {
  module?: string;
  showDetails?: boolean;
  className?: string;
}

/**
 * US IX.3: Connection Status Indicator
 * - Red indicator when offline
 * - Shows sync queue count
 * - Auto-sync on reconnect
 * - Retry on error
 */
export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  module = 'app',
  showDetails = false,
  className = '',
}) => {
  const { isOnline, pendingSyncActions } = useOfflineStorage(module);
  const { isSyncing, syncError, sync } = useSync({ module });
  const [showDropdown, setShowDropdown] = useState(false);

  // US IX.2.2: Auto-sync when going online
  useEffect(() => {
    if (isOnline && pendingSyncActions.length > 0 && !isSyncing) {
      console.log('📡 Connection restored, auto-syncing...');
      sync();
    }
  }, [isOnline, pendingSyncActions.length, isSyncing, sync]);

  const handleRetry = () => {
    sync();
  };

  const statusColor = isOnline
    ? syncError
      ? 'warning'
      : pendingSyncActions.length > 0
      ? 'info'
      : 'success'
    : 'error';

  const statusIcon = isOnline ? (
    isSyncing ? (
      <RefreshCw size={16} className="animate-spin" />
    ) : syncError ? (
      <AlertCircle size={16} />
    ) : (
      <Wifi size={16} />
    )
  ) : (
    <WifiOff size={16} />
  );

  const statusText = isOnline
    ? isSyncing
      ? 'Синхронизация...'
      : syncError
      ? 'Ошибка синхронизации'
      : pendingSyncActions.length > 0
      ? `В очереди: ${pendingSyncActions.length}`
      : 'Синхронизировано'
    : 'Нет связи';

  if (!showDetails) {
    // Compact mode - just indicator dot
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        title={statusText}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            statusColor === 'success'
              ? 'bg-success'
              : statusColor === 'error'
              ? 'bg-error animate-pulse'
              : statusColor === 'warning'
              ? 'bg-warning animate-pulse'
              : 'bg-brand-primary animate-pulse'
          }`}
        />
      </div>
    );
  }

  // Full mode - with text and dropdown
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          statusColor === 'success'
            ? 'bg-success/10 text-success hover:bg-success/20'
            : statusColor === 'error'
            ? 'bg-error/10 text-error hover:bg-error/20'
            : statusColor === 'warning'
            ? 'bg-warning/10 text-warning hover:bg-warning/20'
            : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'
        }`}
      >
        {statusIcon}
        <span>{statusText}</span>
      </button>

      {/* Dropdown with details */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-72 bg-surface-primary rounded-lg shadow-2xl border border-separator z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-surface-secondary border-b border-separator">
              <div className="flex items-center gap-2 mb-2">
                {statusIcon}
                <h3 className="font-bold">Статус подключения</h3>
              </div>
              <p className="text-sm text-content-secondary">{statusText}</p>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* Online status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-content-tertiary">Сеть:</span>
                <span
                  className={`text-sm font-medium ${
                    isOnline ? 'text-success' : 'text-error'
                  }`}
                >
                  {isOnline ? 'Онлайн' : 'Оффлайн'}
                </span>
              </div>

              {/* Sync queue */}
              {pendingSyncActions.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-content-tertiary">В очереди:</span>
                  <span className="text-sm font-medium text-brand-primary">
                    {pendingSyncActions.length}
                  </span>
                </div>
              )}

              {/* Error message */}
              {syncError && (
                <div className="p-3 bg-error/10 rounded-lg">
                  <p className="text-xs text-error font-medium mb-1">Ошибка:</p>
                  <p className="text-xs text-error-dark">{syncError}</p>
                </div>
              )}

              {/* Status message */}
              {!isOnline && (
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-xs text-warning-dark">
                    Работа продолжается локально. Данные будут синхронизированы при
                    восстановлении связи.
                  </p>
                </div>
              )}

              {/* Actions */}
              {isOnline && pendingSyncActions.length > 0 && !isSyncing && (
                <button
                  onClick={handleRetry}
                  className="w-full py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Синхронизировать сейчас
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};



