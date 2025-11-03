// === 📁 src/components/Header.tsx ===
// Header component with navigation and sync status

import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useMenu } from '@/modules/menu';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';

// Route to title mapping
const getPageTitle = (pathname: string): { title: string; subtitle?: string } => {
  // Remove trailing slash
  const path = pathname.replace(/\/$/, '') || '/';
  
  // Check specific routes
  if (path === '/') return { title: 'Склад 15' };
  if (path.startsWith('/documents')) return { title: 'Документы', subtitle: 'Все документы склада' };
  if (path.startsWith('/receiving')) return { title: 'Приёмка' }; // subtitle from document context
  if (path.startsWith('/placement')) return { title: 'Размещение' }; // subtitle from document context
  if (path.startsWith('/picking')) return { title: 'Подбор' }; // subtitle from document context
  if (path.startsWith('/shipment')) return { title: 'Отгрузка' }; // subtitle from document context
  if (path.startsWith('/return')) return { title: 'Возврат' }; // subtitle from document context
  if (path.startsWith('/inventory')) return { title: 'Инвентаризация' }; // subtitle from document context
  if (path.startsWith('/docs/')) return { title: 'Документы', subtitle: 'Список документов' };
  if (path.startsWith('/settings')) return { title: 'Настройки', subtitle: 'Конфигурация системы' };
  if (path.startsWith('/partner')) return { title: 'Напарник', subtitle: 'Совместная работа' };
  if (path.startsWith('/statistics')) return { title: 'Статистика', subtitle: 'KPI и аналитика' };
  if (path.startsWith('/diagnostics')) return { title: 'Диагностика', subtitle: 'Проверка системы' };
  if (path.startsWith('/about')) return { title: 'О программе' };
  if (path.startsWith('/feedback')) return { title: 'Обратная связь' };
  
  return { title: 'Склад 15' };
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useOfflineStorage('app');
  const { openMenu } = useMenu();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { documentInfo, listInfo } = useDocumentHeader();

  const isHome = location.pathname === '/';
  
  // Get dynamic page title
  const pageInfo = useMemo(() => getPageTitle(location.pathname), [location.pathname]);
  
  // Calculate progress percentage
  const progress = documentInfo && documentInfo.total > 0 
    ? (documentInfo.completed / documentInfo.total) * 100 
    : 0;

  const handleLogout = () => {
    if (confirm('Выйти из системы?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="bg-[#343436] text-[#e3e3dd] shadow-lg sticky top-0 z-50 border-b border-[#474747]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[#474747] rounded-lg transition-colors"
                aria-label="Назад"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {isHome && (
              <button
                onClick={openMenu}
                className="p-2 hover:bg-[#474747] rounded-lg transition-colors touch-manipulation"
                aria-label="Открыть меню"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div 
              className="cursor-pointer flex-1"
              onClick={() => navigate('/')}
            >
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-medium tracking-wide">
                  {listInfo ? listInfo.title : pageInfo.title}
                </h1>
                {documentInfo && (
                  <span className="text-sm text-[#a7a7a7]">
                    {documentInfo.documentId}
                  </span>
                )}
              </div>
              {documentInfo ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 max-w-[200px] bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-[#86e0cb] h-1 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#a7a7a7] min-w-[50px]">
                    {documentInfo.completed}/{documentInfo.total}
                  </span>
                </div>
              ) : listInfo ? (
                <p className="text-xs text-[#a7a7a7] mt-1">
                  Всего: {listInfo.count}
                </p>
              ) : (
                pageInfo.subtitle && (
                  <p className="text-xs text-[#a7a7a7] mt-1">
                    {pageInfo.subtitle}
                  </p>
                )
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Online/Offline status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm hidden sm:inline">{isOnline ? 'Онлайн' : 'Оффлайн'}</span>
            </div>

            {/* Partner quick access (service icon) */}
            <button
              onClick={() => navigate('/partner')}
              className="p-2 hover:bg-[#474747] rounded-lg transition-colors"
              aria-label="Напарник"
              title="Напарник"
            >
              <span className="text-lg" role="img" aria-label="partner">🤝</span>
            </button>

            {/* User menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-[#474747] rounded-lg transition-colors"
                  aria-label="Меню пользователя"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="text-sm hidden md:inline">{user.name}</span>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[#474747] rounded-lg shadow-lg border border-[#555] z-50">
                      <div className="p-4 border-b border-[#555]">
                        <p className="text-sm text-[#e3e3dd] font-medium">{user.name}</p>
                        <p className="text-xs text-[#a7a7a7]">@{user.username}</p>
                        {user.role && (
                          <p className="text-xs text-[#a7a7a7] mt-1">Роль: {user.role}</p>
                        )}
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/settings');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-[#e3e3dd] hover:bg-[#525252] rounded transition-colors"
                        >
                          ⚙️ Настройки
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#525252] rounded transition-colors"
                        >
                          🚪 Выйти
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

