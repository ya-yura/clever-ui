// === 📁 src/pages/Setup.tsx ===
// Initial setup page for server configuration

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { configService } from '@/services/configService';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();
  const [serverUrl, setServerUrl] = useState('http://localhost:9000/MobileSMARTS/api/v1');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate URL format
    const validation = configService.validateServerUrl(serverUrl);
    if (!validation.valid) {
      setError(validation.error || 'Некорректный URL');
      return;
    }

    setIsValidating(true);

    try {
      // Save configuration
      configService.setServerUrl(serverUrl.trim().replace(/\/+$/, ''));
      
      console.log('✅ Server URL configured:', serverUrl);
      
      // Auto-login as default user and go to home
      loginDemo();
      
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения настроек');
      setIsValidating(false);
    }
  };

  const handleTestConnection = async () => {
    setError('');
    setIsValidating(true);

    try {
      const validation = configService.validateServerUrl(serverUrl);
      if (!validation.valid) {
        setError(validation.error || 'Некорректный URL');
        return;
      }

      // Try to fetch DocTypes from server
      const testUrl = `${serverUrl.trim().replace(/\/+$/, '')}/DocTypes`;
      console.log('🔍 Testing connection to:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server response:', data);
        alert(`✅ Соединение с сервером успешно установлено!\nНайдено типов документов: ${data.value?.length || 0}`);
      } else {
        setError(`Сервер вернул ошибку: ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('❌ Connection test failed:', err);
      setError(`Ошибка подключения: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <Logo size={140} className="mb-6" />
          <h1 className="text-3xl font-bold text-content-primary mb-2">
            Склад 15
          </h1>
          <h2 className="text-xl text-content-secondary mb-2">
            Первоначальная настройка
          </h2>
          <p className="text-sm text-content-secondary">
            Укажите адрес сервера для подключения
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="bg-surface-secondary rounded-lg p-6 space-y-4">
            <div>
              <label
                htmlFor="serverUrl"
                className="block text-sm font-medium text-content-primary mb-2"
              >
                Адрес сервера
              </label>
              <input
                id="serverUrl"
                type="text"
                required
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full px-4 py-3 bg-surface-primary border border-borders-default rounded-lg text-content-primary placeholder-content-tertiary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                placeholder="http://localhost:9000/MobileSMARTS/api/v1"
                disabled={isValidating}
              />
              <p className="mt-2 text-xs text-content-secondary">
                Пример: http://localhost:9000/MobileSMARTS/api/v1
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border border-error rounded-lg p-3">
                <p className="text-sm text-error">⚠️ {error}</p>
              </div>
            )}

            {/* Hint */}
            <div className="bg-surface-tertiary border border-borders-default rounded-lg p-3">
              <p className="text-xs text-content-primary">
                💡 Убедитесь, что сервер Cleverence Mobile SMARTS запущен и доступен по указанному адресу
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isValidating || !serverUrl.trim()}
              className="w-full py-3 px-4 bg-brand-primary text-brand-dark hover:brightness-90 font-semibold rounded-lg transition-all disabled:bg-surface-disabled disabled:text-content-disabled disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isValidating ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Сохранение...
                </>
              ) : (
                'Продолжить →'
              )}
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isValidating || !serverUrl.trim()}
              className="w-full py-3 px-4 bg-surface-secondary hover:bg-surface-tertiary text-content-primary border border-borders-default font-medium rounded-lg transition-colors disabled:bg-surface-disabled disabled:text-content-disabled disabled:cursor-not-allowed"
            >
              Проверить соединение
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-content-tertiary">
          <p>Cleverence Mobile SMARTS</p>
          <p className="mt-1">Версия 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Setup;

