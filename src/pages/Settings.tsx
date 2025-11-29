// === 📁 src/pages/Settings.tsx ===
// Settings page with connection, user, behavior, and sync settings

import React, { useState } from 'react';
import { Wifi, User, Sliders, Repeat, Save, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: SettingsField[];
}

interface SettingsField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'toggle' | 'number';
  value: string | boolean | number;
  options?: string[];
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const [sections] = useState<SettingsSection[]>([
    {
      id: 'connection',
      title: 'Подключение',
      icon: Wifi,
      fields: [
        { id: 'server', label: 'Адрес сервера', type: 'text', value: 'https://api.example.com' },
        { id: 'port', label: 'Порт', type: 'number', value: 443 },
        { id: 'timeout', label: 'Таймаут (сек)', type: 'number', value: 30 },
        { id: 'useSSL', label: 'Использовать SSL', type: 'toggle', value: true },
      ],
    },
    {
      id: 'user',
      title: 'Пользователь',
      icon: User,
      fields: [
        { id: 'username', label: 'Имя пользователя', type: 'text', value: 'Пользователь' },
        { id: 'role', label: 'Роль', type: 'select', value: 'worker', options: ['admin', 'manager', 'worker'] },
        { id: 'department', label: 'Отдел', type: 'text', value: 'Склад' },
      ],
    },
    {
      id: 'behavior',
      title: 'Поведение',
      icon: Sliders,
      fields: [
        { id: 'sound', label: 'Звуковые уведомления', type: 'toggle', value: true },
        { id: 'vibration', label: 'Вибрация', type: 'toggle', value: true },
        { id: 'voice', label: 'Голосовые подсказки', type: 'toggle', value: false },
        { id: 'autoScan', label: 'Автосканирование', type: 'toggle', value: true },
      ],
    },
    {
      id: 'sync',
      title: 'Синхронизация',
      icon: Repeat,
      fields: [
        { id: 'autoSync', label: 'Автосинхронизация', type: 'toggle', value: true },
        { id: 'syncInterval', label: 'Интервал (сек)', type: 'number', value: 60 },
        { id: 'wifiOnly', label: 'Только по Wi-Fi', type: 'toggle', value: false },
      ],
    },
  ]);

  const handleSave = () => {
    // Save settings to localStorage or IndexedDB
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-content-primary mb-2">⚙️ Настройки</h1>
        <p className="text-content-secondary">Конфигурация приложения Склад-15</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6 text-brand-primary" />
                <h2 className="text-xl font-semibold text-content-primary">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <label className="text-content-primary font-medium">
                      {field.label}
                    </label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        defaultValue={field.value as string}
                        className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-64 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        defaultValue={field.value as number}
                        className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-32 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        defaultValue={field.value as string}
                        className="bg-surface-primary text-content-primary px-4 py-2 rounded-lg w-64 border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'toggle' && (
                      <button
                        className={`relative w-14 h-8 rounded-full transition-colors border border-borders-default ${
                          field.value ? 'bg-brand-primary' : 'bg-surface-tertiary'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-surface-primary rounded-full transition-transform ${
                            field.value ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={handleSave}
          className="flex-1 bg-brand-primary hover:brightness-90 text-white px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 touch-manipulation"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Сохранено!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Сохранить настройки
            </>
          )}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-4 bg-surface-tertiary hover:bg-surface-secondary text-content-primary border border-borders-default rounded-xl font-semibold transition-colors touch-manipulation"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default Settings;

