// === 📁 src/components/Header.tsx ===
// Header component with navigation and sync status

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useMenu } from '@/modules/menu';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { documentInfo, listInfo } = useDocumentHeader();
  const { theme, toggleTheme } = useTheme();

  const isHome = location.pathname === '/';
  
  // Get dynamic page title
  const pageInfo = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  const parentPath = useMemo(() => {
    const sanitized = location.pathname.replace(/\/$/, '');
    if (!sanitized || sanitized === '/') {
      return '/';
    }

    const segments = sanitized.split('/').filter(Boolean);
    if (segments.length === 0) {
      return '/';
    }

    segments.pop();
    const next = `/${segments.join('/')}`;
    return next === sanitized ? '/' : next || '/';
  }, [location.pathname]);
  
  // Calculate progress percentage
  const progress = documentInfo && documentInfo.total > 0 
    ? (documentInfo.completed / documentInfo.total) * 100 
    : 0;

  return (
    <header className="bg-surface-secondary text-content-secondary shadow-lg sticky top-0 z-50 border-b border-surface-tertiary">
      <div className="container mx-auto px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {!isHome && (
              <button
                onClick={() => navigate(parentPath, { replace: false })}
                className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors text-content-secondary"
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
                className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors touch-manipulation text-content-secondary"
                aria-label="Открыть меню"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div 
              className="cursor-pointer flex-1"
              onClick={() => navigate('/')}
            >
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-medium tracking-wide text-content-primary">
                  {listInfo ? listInfo.title : pageInfo.title}
                </h1>
                {documentInfo && (
                  <span className="text-sm text-content-tertiary">
                    {documentInfo.documentId}
                  </span>
                )}
              </div>
              {documentInfo ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex-1 max-w-[200px] bg-surface-tertiary rounded-full h-1">
                    <div
                      className="bg-brand-secondary h-1 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-content-tertiary min-w-[50px]">
                    {documentInfo.completed}/{documentInfo.total}
                  </span>
                </div>
              ) : listInfo ? (
                <p className="text-[11px] text-content-tertiary mt-0.5">
                  Всего: {listInfo.count}
                </p>
              ) : (
                pageInfo.subtitle && (
                  <p className="text-[11px] text-content-tertiary mt-0.5">
                    {pageInfo.subtitle}
                  </p>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Online/Offline status */}
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-success' : 'bg-error'}`} />
              <span className="text-sm hidden sm:inline text-content-secondary">{isOnline ? 'Онлайн' : 'Оффлайн'}</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors text-content-secondary"
              aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
              title={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
            >
              {theme === 'light' ? (
                // Moon icon for light theme
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                // Sun icon for dark theme
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            {/* Partner quick access (service icon) */}
            <button
              onClick={() => navigate('/partner')}
              className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors text-content-secondary"
              aria-label="Напарник"
              title="Напарник"
            >
              {/* Handshake/Partner icon - two people */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
