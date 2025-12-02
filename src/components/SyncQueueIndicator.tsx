import React, { useEffect, useState } from 'react';
import { db } from '@/services/db';
import { RefreshCw, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useODataSync } from '@/hooks/useODataSync';

/**
 * US VIII.2: Очередь действий
 * US VIII.1: Автосохранение
 * Компонент для отображения статуса синхронизации и очереди действий
 */
export const SyncQueueIndicator: React.FC = () => {
  const { fullSync, syncing: odataSyncing } = useODataSync();
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Подписка на изменения онлайн статуса
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

  // Загрузка очереди действий
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const actions = await db.syncActions.where('synced').equals(0).toArray();
        setPendingActions(actions);
      } catch (error) {
        console.error('Failed to load sync queue:', error);
      }
    };

    loadQueue();

    // Периодическое обновление очереди
    const interval = setInterval(loadQueue, 5000);

    return () => clearInterval(interval);
  }, []);

  // Получаем время последней синхронизации из localStorage
  useEffect(() => {
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setLastSyncTime(parseInt(lastSync, 10));
    }
  }, []);

  // US VIII.2: Ручная синхронизация
  const handleManualSync = async () => {
    if (!isOnline) {
      alert('Нет подключения к интернету');
      return;
    }

    setSyncing(true);
    try {
      // Здесь будет реальная логика синхронизации
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const now = Date.now();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toString());
      
      setPendingActions([]);
      alert('Синхронизация завершена');
    } catch (error) {
      alert('Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  // Форматирование времени
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Никогда';
    
    const diff = Date.now() - lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes === 0) return 'Только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours} ч. назад`;
  };

  if (pendingActions.length === 0 && isOnline) {
    // Компактный режим когда всё синхронизировано
    return (
      <div className="flex items-center gap-2 text-xs text-content-tertiary">
        <CheckCircle size={14} className="text-success" />
        <span>Синхронизировано</span>
      </div>
    );
  }

  return (
    <div className="card p-4 bg-surface-secondary">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            {syncing ? (
              <RefreshCw size={20} className="text-brand-primary animate-spin" />
            ) : isOnline ? (
              <RefreshCw size={20} className="text-success" />
            ) : (
              <AlertCircle size={20} className="text-warning" />
            )}
          </div>
          <div>
            <div className="font-medium text-sm">
              {syncing ? 'Синхронизация...' : isOnline ? 'Онлайн' : 'Оффлайн режим'}
            </div>
            <div className="text-xs text-content-tertiary flex items-center gap-1">
              <Clock size={12} />
              {formatLastSync()}
            </div>
          </div>
        </div>

        {/* US VIII.2: Кнопки синхронизации */}
        <div className="flex gap-2">
          {isOnline && !syncing && !odataSyncing && (
            <>
              <button
                onClick={fullSync}
                title="Загрузить данные с сервера"
                className="px-3 py-1.5 bg-success text-white rounded text-xs font-medium hover:brightness-110 transition-all flex items-center gap-1"
              >
                <Download size={14} />
                С сервера
              </button>
              <button
                onClick={handleManualSync}
                title="Отправить локальные изменения"
                className="px-3 py-1.5 bg-brand-primary text-white rounded text-xs font-medium hover:brightness-110 transition-all"
              >
                Отправить
              </button>
            </>
          )}
        </div>
      </div>

      {/* US VIII.2: Счетчик несинхронизированных действий */}
      {pendingActions.length > 0 && (
        <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded">
          <div className="flex items-center gap-2 text-warning-dark text-sm">
            <AlertCircle size={16} />
            <span>
              <strong>{pendingActions.length}</strong> {pendingActions.length === 1 ? 'действие' : 'действий'} в
              очереди
            </span>
          </div>
          {!isOnline && (
            <div className="text-xs text-content-tertiary mt-2">
              Будут отправлены автоматически при восстановлении подключения
            </div>
          )}
        </div>
      )}

      {/* US VIII.1: Статус автосохранения */}
      <div className="mt-3 text-xs text-content-tertiary flex items-center gap-1">
        <CheckCircle size={12} className="text-success" />
        <span>Автосохранение активно</span>
      </div>
    </div>
  );
};

