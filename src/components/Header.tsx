// === 📁 src/components/Header.tsx ===
// Header component with navigation and sync status

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useOfflineStorage('app');

  const isHome = location.pathname === '/';

  return (
    <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                aria-label="Назад"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 
              className="text-xl font-bold cursor-pointer"
              onClick={() => navigate('/')}
            >
              Склад-15
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm">{isOnline ? 'Онлайн' : 'Оффлайн'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

