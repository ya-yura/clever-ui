// === 📁 src/pages/SoundTest.tsx ===
// Page to test all sound effects

import { useState } from 'react';
import { playSound } from '@/utils/sound';
import { feedback } from '@/utils/feedback';

export default function SoundTest() {
  const [lastPlayed, setLastPlayed] = useState<string>('');

  const testSound = (type: 'success' | 'error' | 'warning' | 'scan' | 'notification', label: string) => {
    playSound(type);
    setLastPlayed(label);
  };

  const testFeedback = (type: 'success' | 'error' | 'warning' | 'scan' | 'notification', label: string) => {
    switch (type) {
      case 'success':
        feedback.success();
        break;
      case 'error':
        feedback.error();
        break;
      case 'warning':
        feedback.warning();
        break;
      case 'scan':
        feedback.scan();
        break;
      case 'notification':
        feedback.notification();
        break;
    }
    setLastPlayed(label + ' (с вибрацией)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🔊 Тест звуков</h1>
        <p className="text-gray-600 mb-8">
          Нажмите на кнопки для проверки звуковых эффектов
        </p>

        {lastPlayed && (
          <div className="mb-6 p-4 bg-blue-100 text-blue-800 rounded-lg">
            Последний: <strong>{lastPlayed}</strong>
          </div>
        )}

        <div className="space-y-4">
          {/* Успех */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-green-600">
              ✅ Успех
            </h2>
            <p className="text-gray-600 mb-4">
              Короткий позитивный "дзинь" - две ноты вверх (C6 → E6)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => testSound('success', 'Успех (звук)')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                🔊 Только звук
              </button>
              <button
                onClick={() => testFeedback('success', 'Успех')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                🔊📳 Звук + Вибрация
              </button>
            </div>
          </div>

          {/* Ошибка */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              ❌ Ошибка
            </h2>
            <p className="text-gray-600 mb-4">
              Раздражающий низкий буззер с пульсацией (180Hz, 8Hz LFO)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => testSound('error', 'Ошибка (звук)')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                🔊 Только звук
              </button>
              <button
                onClick={() => testFeedback('error', 'Ошибка')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                🔊📳 Звук + Вибрация
              </button>
            </div>
          </div>

          {/* Предупреждение */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-yellow-600">
              ⚠️ Предупреждение
            </h2>
            <p className="text-gray-600 mb-4">
              Тревожный паттерн - две ноты с интервалом (600Hz)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => testSound('warning', 'Предупреждение (звук)')}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                🔊 Только звук
              </button>
              <button
                onClick={() => testFeedback('warning', 'Предупреждение')}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                🔊📳 Звук + Вибрация
              </button>
            </div>
          </div>

          {/* Сканирование */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-blue-600">
              📱 Сканирование
            </h2>
            <p className="text-gray-600 mb-4">
              Короткий острый "бип" как у реального сканера (2800Hz, 50ms)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => testSound('scan', 'Сканирование (звук)')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                🔊 Только звук
              </button>
              <button
                onClick={() => testFeedback('scan', 'Сканирование')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                🔊📳 Звук + Вибрация
              </button>
            </div>
          </div>

          {/* Уведомление */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-purple-600">
              🔔 Уведомление
            </h2>
            <p className="text-gray-600 mb-4">
              Нейтральный "пип" для общих уведомлений (800Hz, 120ms)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => testSound('notification', 'Уведомление (звук)')}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                🔊 Только звук
              </button>
              <button
                onClick={() => testFeedback('notification', 'Уведомление')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                🔊📳 Звук + Вибрация
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">📝 Применение:</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• <strong>Успех</strong> - успешное завершение документа, сохранение</li>
            <li>• <strong>Ошибка</strong> - не найден товар, ошибка сети, валидация</li>
            <li>• <strong>Предупреждение</strong> - превышено количество, проверьте данные</li>
            <li>• <strong>Сканирование</strong> - успешное сканирование штрихкода</li>
            <li>• <strong>Уведомление</strong> - новые документы, синхронизация</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


