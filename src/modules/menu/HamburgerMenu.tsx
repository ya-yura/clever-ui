// === 📁 src/modules/menu/HamburgerMenu.tsx ===
// Main hamburger menu component with swipe support and animations

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, User } from 'lucide-react';
import { useMenu } from './useMenu';
import MenuOverlay from './MenuOverlay';
import MenuItem from './MenuItem';
import { menuItems, appMetadata } from './MenuData';
import { db } from '@/services/db';

interface HamburgerMenuProps {
  onSync?: () => void;
  onUpdateReferences?: () => void;
  onLogout?: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onSync,
  onUpdateReferences,
  onLogout,
}) => {
  const { isOpen, closeMenu } = useMenu();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userName, setUserName] = useState<string>('Пользователь');
  const [showModal, setShowModal] = useState<string | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load user data from IndexedDB
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Try to get user from employees table
        const employees = await db.employees.toArray();
        if (employees.length > 0) {
          setUserName(employees[0].name || 'Пользователь');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isOpen) {
        closeMenu();
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  // Handle menu item actions
  const handleAction = (action: string, value?: string) => {
    switch (action) {
      case 'navigate':
        if (value) {
          navigate(value);
          closeMenu();
        }
        break;

      case 'function':
        if (value === 'triggerSync' && onSync) {
          onSync();
          closeMenu();
          showToast('Синхронизация запущена');
        } else if (value === 'updateReferences' && onUpdateReferences) {
          onUpdateReferences();
          closeMenu();
          showToast('Обновление справочников');
        } else if (value === 'sendFeedback') {
          closeMenu();
          showToast('Отзыв отправлен в локальный лог');
        } else if (value === 'logout' && onLogout) {
          onLogout();
          closeMenu();
        }
        break;

      case 'modal':
        setShowModal(value || null);
        // Don't close menu, just show modal
        break;

      default:
        break;
    }
  };

  // Simple toast notification
  const showToast = (message: string) => {
    // You can implement a proper toast system later
    console.log('Toast:', message);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && <MenuOverlay isOpen={isOpen} onClose={closeMenu} />}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...swipeHandlers}
            className="fixed top-0 left-0 h-full w-[85vw] max-w-[400px] bg-gray-900/95 backdrop-blur-md shadow-2xl shadow-gray-800/50 z-50 flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
          >
            {/* Header with status */}
            <div className="flex-shrink-0 px-4 py-6 border-b border-gray-700/50 bg-gradient-to-b from-gray-800/50 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-100 font-semibold text-base">{userName}</p>
                    <p className="text-gray-400 text-sm">{appMetadata.name}</p>
                  </div>
                </div>
              </div>

              {/* Online/Offline indicator */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Онлайн</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400 font-medium">Оффлайн</span>
                  </>
                )}
              </div>
            </div>

            {/* Menu items - scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <nav className="py-2">
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    isOnline={isOnline}
                    onAction={handleAction}
                  />
                ))}
              </nav>
            </div>

            {/* Footer with app info */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-700/50 bg-gray-800/30">
              <div className="text-center">
                <p className="text-gray-400 text-xs">
                  {appMetadata.vendor} · Версия {appMetadata.version}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Сборка {appMetadata.build}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal placeholder - can be extended later */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setShowModal(null)}
          />
          <div className="relative bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              {showModal}
            </h2>
            <p className="text-gray-300 mb-6">
              Модальное окно для: {showModal}
            </p>
            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => setShowModal(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;

