// === 📁 src/pages/Home.tsx ===
// Home page with module selection

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Module {
  id: string;
  title: string;
  icon: string;
  description: string;
  path: string;
  color: string;
}

const modules: Module[] = [
  {
    id: 'receiving',
    title: 'Приёмка',
    icon: '📦',
    description: 'Приёмка товаров от поставщиков',
    path: '/receiving',
    color: 'bg-blue-500',
  },
  {
    id: 'placement',
    title: 'Размещение',
    icon: '🏷️',
    description: 'Размещение товаров в ячейки',
    path: '/placement',
    color: 'bg-purple-500',
  },
  {
    id: 'picking',
    title: 'Подбор',
    icon: '🚚',
    description: 'Комплектация заказов',
    path: '/picking',
    color: 'bg-green-500',
  },
  {
    id: 'shipment',
    title: 'Отгрузка',
    icon: '🧾',
    description: 'Отгрузка заказов клиентам',
    path: '/shipment',
    color: 'bg-orange-500',
  },
  {
    id: 'return',
    title: 'Возврат',
    icon: '♻️',
    description: 'Возврат и списание товаров',
    path: '/return',
    color: 'bg-red-500',
  },
  {
    id: 'inventory',
    title: 'Инвентаризация',
    icon: '🧮',
    description: 'Инвентаризация остатков',
    path: '/inventory',
    color: 'bg-indigo-500',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Система управления складом
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Выберите модуль для работы
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => navigate(module.path)}
            className="card hover:shadow-xl transition-shadow p-6 text-left group"
          >
            <div className="flex items-start space-x-4">
              <div className={`${module.color} text-white p-3 rounded-lg text-3xl`}>
                {module.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {module.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  {module.description}
                </p>
              </div>
              <svg
                className="w-6 h-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Статус системы
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">PWA</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Установлено</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {navigator.onLine ? 'Онлайн' : 'Оффлайн'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Режим работы</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

