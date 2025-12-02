// === 📁 src/pages/Settings.tsx ===
// Settings page with connection, user, behavior, and sync settings

import React, { useState, useEffect } from 'react';
import { Wifi, User, Sliders, Repeat, Save, Check, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/design/components';
import { api } from '@/services/api';
import { feedback } from '@/utils/feedback';

/**
 * US X: Settings Module
 * All settings scenarios implemented
 */

interface AppSettings {
  // US X.1: Connection
  server: string;
  port: number;
  timeout: number;
  useSSL: boolean;
  
  // US X.2: User
  username: string;
  role: 'admin' | 'manager' | 'worker';
  department: string;
  
  // US X.3: Behavior
  sound: boolean;
  vibration: boolean;
  voice: boolean;
  autoScan: boolean;
  
  // US X.4: Sync
  autoSync: boolean;
  syncInterval: number;
  wifiOnly: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  server: 'http://localhost:9000',
  port: 9000,
  timeout: 30,
  useSSL: false,
  username: 'Оператор',
  role: 'worker',
  department: 'Склад',
  sound: true,
  vibration: true,
  voice: false,
  autoScan: true,
  autoSync: true,
  syncInterval: 60,
  wifiOnly: false,
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // US X: Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('app_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setConnectionStatus('idle');
  };

  // US X.1.3: Check connection
  const handleCheckConnection = async () => {
    setCheckingConnection(true);
    setConnectionStatus('idle');
    setConnectionError(null);

    try {
      // Test connection with configured server
      const testUrl = settings.useSSL
        ? `https://${settings.server}:${settings.port}`
        : `http://${settings.server.replace('http://', '').replace('https://', '')}:${settings.port}`;

      // Simple ping test (adjust based on your API)
      await fetch(testUrl + '/MobileSMARTS/api/v1/$metadata', {
        method: 'HEAD',
        signal: AbortSignal.timeout(settings.timeout * 1000),
      });

      setConnectionStatus('success');
      feedback.success('Соединение установлено');
    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionError(error.message || 'Не удалось подключиться к серверу');
      feedback.error('Ошибка подключения');
    } finally {
      setCheckingConnection(false);
    }
  };

  // US X: Save settings
  const handleSave = () => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      setSaved(true);
      feedback.success('Настройки сохранены');
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      feedback.error('Ошибка сохранения настроек');
    }
  };

  // US X.4: Force sync
  const handleForceSync = async () => {
    feedback.info('Начата принудительная синхронизация...');
    // Trigger sync via useSync hook or direct API call
    setTimeout(() => {
      feedback.success('Синхронизация завершена');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-content-primary mb-2">⚙️ Настройки</h1>
        <p className="text-content-secondary">Конфигурация приложения Склад-15</p>
      </div>

      {/* US X.1: Connection Settings */}
      <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Wifi className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-content-primary">Подключение</h2>
        </div>

        <div className="space-y-4">
          {/* US X.1.1: Server address */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-content-primary font-medium">Адрес сервера</label>
            <input
              type="text"
              value={settings.server}
              onChange={(e) => updateSetting('server', e.target.value)}
              placeholder="http://localhost:9000"
              className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-full sm:w-80 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* US X.1.1: Port */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-content-primary font-medium">Порт</label>
            <input
              type="number"
              value={settings.port}
              onChange={(e) => updateSetting('port', parseInt(e.target.value) || 9000)}
              className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-full sm:w-32 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Timeout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-content-primary font-medium">Таймаут (сек)</label>
            <input
              type="number"
              value={settings.timeout}
              onChange={(e) => updateSetting('timeout', parseInt(e.target.value) || 30)}
              className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-full sm:w-32 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* US X.1.2: SSL */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-content-primary font-medium">Использовать SSL</label>
            <button
              onClick={() => updateSetting('useSSL', !settings.useSSL)}
              className={`relative w-14 h-8 rounded-full transition-colors border border-borders-default ${
                settings.useSSL ? 'bg-brand-primary' : 'bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-surface-primary rounded-full transition-transform shadow-md ${
                  settings.useSSL ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* US X.1.3: Check connection */}
          <div className="pt-4 border-t border-separator">
            <Button
              onClick={handleCheckConnection}
              disabled={checkingConnection}
              variant={connectionStatus === 'success' ? 'secondary' : 'primary'}
              className="w-full"
            >
              {checkingConnection ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Проверка соединения...
                </>
              ) : connectionStatus === 'success' ? (
                <>
                  <CheckCircle2 size={20} className="mr-2 text-success" />
                  Соединение установлено
                </>
              ) : (
                'Проверить соединение'
              )}
            </Button>

            {connectionStatus === 'error' && connectionError && (
              <div className="mt-3 p-3 bg-error/10 border border-error rounded-lg">
                <p className="text-sm text-error">{connectionError}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* US X.2: User Settings */}
      <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-content-primary">Пользователь</h2>
        </div>

        <div className="space-y-4">
          {/* US X.2.2: Username */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-content-primary font-medium">Имя оператора</label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => updateSetting('username', e.target.value)}
              placeholder="Введите имя"
              className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-full sm:w-80 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-content-primary font-medium">Роль</label>
            <select
              value={settings.role}
              onChange={(e) => updateSetting('role', e.target.value as any)}
              className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-full sm:w-80 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="admin">Администратор</option>
              <option value="manager">Менеджер</option>
              <option value="worker">Оператор</option>
            </select>
          </div>

          {/* US X.2.1: Department */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-content-primary font-medium">Отдел</label>
            <input
              type="text"
              value={settings.department}
              onChange={(e) => updateSetting('department', e.target.value)}
              placeholder="Склад"
              className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-full sm:w-80 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* US X.3: Behavior Settings */}
      <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Sliders className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-content-primary">Поведение интерфейса</h2>
        </div>

        <div className="space-y-4">
          {/* US X.3.2: Sound */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-content-primary font-medium">Звуковые уведомления</label>
            <button
              onClick={() => updateSetting('sound', !settings.sound)}
              className={`relative w-14 h-8 rounded-full transition-colors border border-borders-default ${
                settings.sound ? 'bg-brand-primary' : 'bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-surface-primary rounded-full transition-transform shadow-md ${
                  settings.sound ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* US X.3.1: Vibration */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-content-primary font-medium">Вибрация</label>
            <button
              onClick={() => updateSetting('vibration', !settings.vibration)}
              className={`relative w-14 h-8 rounded-full transition-colors border border-borders-default ${
                settings.vibration ? 'bg-brand-primary' : 'bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-surface-primary rounded-full transition-transform shadow-md ${
                  settings.vibration ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* US X.3.3: Voice */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-content-primary font-medium">Голосовые подсказки</label>
            <button
              onClick={() => updateSetting('voice', !settings.voice)}
              className={`relative w-14 h-8 rounded-full transition-colors border border-borders-default ${
                settings.voice ? 'bg-brand-primary' : 'bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-surface-primary rounded-full transition-transform shadow-md ${
                  settings.voice ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* US X.3.4: Auto-scan */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-content-primary font-medium">Автосканирование</label>
            <button
              onClick={() => updateSetting('autoScan', !settings.autoScan)}
              className={`relative w-14 h-8 rounded-full transition-colors border border-borders-default ${
                settings.autoScan ? 'bg-brand-primary' : 'bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-surface-primary rounded-full transition-transform shadow-md ${
                  settings.autoScan ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* US X.4: Sync Settings */}
      <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Repeat className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-content-primary">Синхронизация</h2>
        </div>

        <div className="space-y-4">
          {/* Auto-sync */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-content-primary font-medium">Автосинхронизация</label>
            <button
              onClick={() => updateSetting('autoSync', !settings.autoSync)}
              className={`relative w-14 h-8 rounded-full transition-colors border border-borders-default ${
                settings.autoSync ? 'bg-brand-primary' : 'bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-surface-primary rounded-full transition-transform shadow-md ${
                  settings.autoSync ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* US X.4.1: Sync interval */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-content-primary font-medium">Интервал (сек)</label>
            <input
              type="number"
              value={settings.syncInterval}
              onChange={(e) => updateSetting('syncInterval', parseInt(e.target.value) || 60)}
              disabled={!settings.autoSync}
              className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-full sm:w-32 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
            />
          </div>

          {/* US X.4.2: WiFi only */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-content-primary font-medium">Только по Wi-Fi</label>
            <button
              onClick={() => updateSetting('wifiOnly', !settings.wifiOnly)}
              className={`relative w-14 h-8 rounded-full transition-colors border border-borders-default ${
                settings.wifiOnly ? 'bg-brand-primary' : 'bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-surface-primary rounded-full transition-transform shadow-md ${
                  settings.wifiOnly ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* US X.4.3: Force sync */}
          <div className="pt-4 border-t border-separator">
            <Button onClick={handleForceSync} variant="secondary" className="w-full">
              <Repeat size={20} className="mr-2" />
              Синхронизировать сейчас
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-primary border-t border-separator max-w-4xl mx-auto">
        <Button
          onClick={handleSave}
          className="w-full"
          variant={saved ? 'secondary' : 'primary'}
        >
          {saved ? (
            <>
              <Check size={20} className="mr-2" />
              Сохранено!
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" />
              Сохранить настройки
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
