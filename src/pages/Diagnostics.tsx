// === 📁 src/pages/Diagnostics.tsx ===
// System diagnostics and health check page

import React, { useEffect, useState } from 'react';
import { Activity, Database, Wifi, Smartphone, HardDrive, RefreshCw } from 'lucide-react';
import { db } from '@/services/db';

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

  useEffect(() => {
    runDiagnostics();
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500/20';
      case 'warning':
        return 'bg-yellow-500/20';
      case 'error':
        return 'bg-red-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#e3e3dd] mb-2">🧠 Диагностика</h1>
          <p className="text-gray-400">Проверка состояния системы</p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={running}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 touch-manipulation"
        >
          <Activity className={`w-5 h-5 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Проверка...' : 'Запустить проверку'}
        </button>
      </div>

      {/* Diagnostic Checks */}
      <div className="space-y-4">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div
              key={check.id}
              className="bg-[#474747] rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className={`${getStatusBg(check.status)} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${getStatusColor(check.status)}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#e3e3dd]">
                      {check.label}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        check.status
                      )} ${getStatusBg(check.status)}`}
                    >
                      {check.status === 'ok'
                        ? '✓ OK'
                        : check.status === 'warning'
                        ? '⚠ Предупреждение'
                        : '✗ Ошибка'}
                    </span>
                  </div>
                  <p className="text-gray-400">{check.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Info */}
      <div className="mt-8 bg-[#474747] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-[#e3e3dd] mb-4">Системная информация</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Браузер:</span>
            <span className="text-[#e3e3dd] ml-2">{navigator.userAgent.split(' ').pop()}</span>
          </div>
          <div>
            <span className="text-gray-400">Язык:</span>
            <span className="text-[#e3e3dd] ml-2">{navigator.language}</span>
          </div>
          <div>
            <span className="text-gray-400">Платформа:</span>
            <span className="text-[#e3e3dd] ml-2">{navigator.platform}</span>
          </div>
          <div>
            <span className="text-gray-400">Онлайн:</span>
            <span className="text-[#e3e3dd] ml-2">{navigator.onLine ? 'Да' : 'Нет'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;

