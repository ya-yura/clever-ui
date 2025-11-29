// === 📁 src/pages/Diagnostics.tsx ===
// System diagnostics and health check page

import React, { useEffect, useState } from 'react';
import { Activity, Database, Wifi, Smartphone, HardDrive, RefreshCw, Trash2 } from 'lucide-react';
import { db } from '@/services/db';
import { odataCache } from '@/services/odataCache';
import { configService } from '@/services/configService';

interface DiagnosticCheck {
  id: string;
  label: string;
  status: 'ok' | 'warning' | 'error' | 'checking';
  message: string;
  icon: React.ComponentType<{ className?: string }>;
}

const Diagnostics: React.FC = () => {
  const [checks, setChecks] = useState<DiagnosticCheck[]>([]);
  const [running, setRunning] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const clearAllData = async () => {
    if (!confirm('⚠️ Очистить ВСЕ данные?\n\nБудут удалены:\n- Все документы\n- Все строки\n- Весь кэш\n- Настройки сервера\n- Токен авторизации\n\nПриложение перезагрузится.')) {
      return;
    }

    setClearing(true);

    try {
      console.log('🧹 Clearing all data...');

      // Clear all IndexedDB tables
      await Promise.all([
        db.receivingDocuments.clear(),
        db.receivingLines.clear(),
        db.placementDocuments.clear(),
        db.placementLines.clear(),
        db.pickingDocuments.clear(),
        db.pickingLines.clear(),
        db.shipmentDocuments.clear(),
        db.shipmentLines.clear(),
        db.returnDocuments.clear(),
        db.returnLines.clear(),
        db.inventoryDocuments.clear(),
        db.inventoryLines.clear(),
        db.syncActions.clear(),
        db.errorLogs.clear(),
        db.employees.clear(),
        db.partnerSessions.clear(),
      ]);

      // Clear OData cache
      await odataCache.clearCache();

      // Clear configuration
      configService.resetConfig();

      // Clear all localStorage
      localStorage.clear();

      console.log('✅ All data cleared');

      // Show success message
      alert('✅ Все данные успешно удалены!\n\nПриложение перезагрузится...');

      // Reload app
      setTimeout(() => {
        window.location.href = '/setup';
      }, 500);
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      alert('❌ Ошибка при очистке данных. См. консоль.');
      setClearing(false);
    }
  };

  const runDiagnostics = async () => {
    setRunning(true);

    const results: DiagnosticCheck[] = [];

    // Check 1: Internet Connection
    results.push({
      id: 'internet',
      label: 'Подключение к интернету',
      status: navigator.onLine ? 'ok' : 'error',
      message: navigator.onLine ? 'Онлайн' : 'Нет подключения',
      icon: Wifi,
    });

    // Check 2: IndexedDB
    try {
      await db.open();
      const count = await db.syncActions.count();
      results.push({
        id: 'indexeddb',
        label: 'База данных IndexedDB',
        status: 'ok',
        message: `Работает корректно (${count} записей в очереди)`,
        icon: Database,
      });
    } catch (error) {
      results.push({
        id: 'indexeddb',
        label: 'База данных IndexedDB',
        status: 'error',
        message: 'Ошибка доступа к БД',
        icon: Database,
      });
    }

    // Check 3: Storage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percent = Math.round((used / quota) * 100);
      
      results.push({
        id: 'storage',
        label: 'Хранилище',
        status: percent > 80 ? 'warning' : 'ok',
        message: `Использовано ${percent}% (${(used / 1024 / 1024).toFixed(2)} MB)`,
        icon: HardDrive,
      });
    }

    // Check 4: Service Worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      results.push({
        id: 'sw',
        label: 'Service Worker',
        status: registration ? 'ok' : 'warning',
        message: registration ? 'Зарегистрирован' : 'Не зарегистрирован',
        icon: RefreshCw,
      });
    }

    // Check 5: Device
    results.push({
      id: 'device',
      label: 'Устройство',
      status: 'ok',
      message: `${navigator.userAgent.includes('Mobile') ? 'Мобильное' : 'Десктоп'}`,
      icon: Smartphone,
    });

    setChecks(results);
    setRunning(false);
  };

  const statusStyles = {
    ok: { iconBg: 'bg-success-light', iconText: 'text-success-dark', badgeBg: 'bg-success-light', badgeText: 'text-success-dark' },
    warning: { iconBg: 'bg-warning-light', iconText: 'text-warning-dark', badgeBg: 'bg-warning-light', badgeText: 'text-warning-dark' },
    error: { iconBg: 'bg-error-light', iconText: 'text-error-dark', badgeBg: 'bg-error-light', badgeText: 'text-error-dark' },
    checking: { iconBg: 'bg-info-light', iconText: 'text-info-dark', badgeBg: 'bg-info-light', badgeText: 'text-info-dark' },
    default: { iconBg: 'bg-surface-tertiary', iconText: 'text-content-tertiary', badgeBg: 'bg-surface-tertiary', badgeText: 'text-content-tertiary' },
  } as const;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-content-primary mb-2">🧠 Диагностика</h1>
            <p className="text-content-secondary">Проверка состояния системы</p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={running}
            className="bg-brand-primary hover:brightness-90 disabled:bg-surface-disabled text-brand-dark px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 touch-manipulation"
          >
            <Activity className={`w-5 h-5 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Проверка...' : 'Запустить проверку'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-error-light/40 border border-error-light rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-error mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-error mb-1">Опасная зона</h3>
              <p className="text-xs text-content-secondary mb-3">
                Очистить все данные, настройки и кэш. Используйте для сброса приложения к начальному состоянию.
              </p>
              <button
                onClick={clearAllData}
                disabled={clearing}
                className="bg-error hover:brightness-90 disabled:bg-surface-disabled text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className={`w-4 h-4 ${clearing ? 'animate-pulse' : ''}`} />
                {clearing ? 'Очистка...' : 'Очистить все данные'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Checks */}
      <div className="space-y-4">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div
              key={check.id}
              className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg"
            >
              {(() => {
                const style = statusStyles[check.status as keyof typeof statusStyles] || statusStyles.default;
                return (
              <div className="flex items-start gap-4">
                    <div className={`${style.iconBg} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${style.iconText}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-content-primary">
                          {check.label}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${style.badgeBg} ${style.badgeText}`}
                        >
                          {check.status === 'ok'
                            ? '✓ OK'
                            : check.status === 'warning'
                            ? '⚠ Предупреждение'
                            : check.status === 'error'
                            ? '✗ Ошибка'
                            : 'Проверка'}
                        </span>
                      </div>
                      <p className="text-content-secondary">{check.message}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* System Info */}
      <div className="mt-8 bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-content-primary mb-4">Системная информация</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-content-secondary">Браузер:</span>
            <span className="text-content-primary ml-2">{navigator.userAgent.split(' ').pop()}</span>
          </div>
          <div>
            <span className="text-content-secondary">Язык:</span>
            <span className="text-content-primary ml-2">{navigator.language}</span>
          </div>
          <div>
            <span className="text-content-secondary">Платформа:</span>
            <span className="text-content-primary ml-2">{navigator.platform}</span>
          </div>
          <div>
            <span className="text-content-secondary">Онлайн:</span>
            <span className="text-content-primary ml-2">{navigator.onLine ? 'Да' : 'Нет'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;

