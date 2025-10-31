// === 📁 src/modules/menu/__tests__/menu.test.example.tsx ===
// Example test file for hamburger menu (demonstration purposes)

/**
 * Примеры использования API меню
 * 
 * Этот файл демонстрирует возможности работы с меню.
 * Для реального тестирования используйте Jest/Vitest.
 */

import React from 'react';
import { MenuProvider, useMenu } from '../index';

// ========================================
// Пример 1: Простое использование в компоненте
// ========================================

export const ExampleComponent: React.FC = () => {
  const { isOpen, openMenu, closeMenu, toggleMenu } = useMenu();

  return (
    <div>
      <button onClick={openMenu}>Открыть меню</button>
      <button onClick={closeMenu}>Закрыть меню</button>
      <button onClick={toggleMenu}>Переключить меню</button>
      <p>Статус: {isOpen ? 'Открыто' : 'Закрыто'}</p>
    </div>
  );
};

// ========================================
// Пример 2: Программное управление
// ========================================

export const ProgrammaticControl: React.FC = () => {
  const { openMenu } = useMenu();

  // Открыть меню при монтировании
  React.useEffect(() => {
    const timer = setTimeout(() => {
      openMenu();
    }, 1000);
    return () => clearTimeout(timer);
  }, [openMenu]);

  return <div>Меню откроется автоматически через 1 секунду</div>;
};

// ========================================
// Пример 3: Кастомная кнопка с иконкой
// ========================================

export const CustomMenuButton: React.FC = () => {
  const { toggleMenu, isOpen } = useMenu();

  return (
    <button
      onClick={toggleMenu}
      className={`
        p-3 rounded-full transition-all
        ${isOpen ? 'bg-blue-600 rotate-90' : 'bg-gray-700 rotate-0'}
      `}
      aria-label="Toggle Menu"
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
};

// ========================================
// Пример 4: Интеграция с роутингом
// ========================================

export const MenuWithRouting: React.FC = () => {
  const { openMenu, closeMenu } = useMenu();

  const handleNavigate = (path: string) => {
    closeMenu();
    // Здесь можно использовать navigate() из react-router
    window.location.href = path;
  };

  return (
    <div>
      <button onClick={openMenu}>Открыть меню</button>
      <button onClick={() => handleNavigate('/documents')}>
        Перейти к документам
      </button>
    </div>
  );
};

// ========================================
// Пример 5: Обработка событий клавиатуры
// ========================================

export const KeyboardHandler: React.FC = () => {
  const { toggleMenu, closeMenu } = useMenu();

  React.useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'm' && e.ctrlKey) {
        toggleMenu();
      } else if (e.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [toggleMenu, closeMenu]);

  return <div>Нажмите Ctrl+M для открытия меню</div>;
};

// ========================================
// Пример 6: Интеграция с аналитикой
// ========================================

export const MenuWithAnalytics: React.FC = () => {
  const { openMenu, closeMenu } = useMenu();

  const handleOpenWithTracking = () => {
    // Отправить событие в аналитику
    console.log('Analytics: Menu opened');
    openMenu();
  };

  const handleCloseWithTracking = () => {
    // Отправить событие в аналитику
    console.log('Analytics: Menu closed');
    closeMenu();
  };

  return (
    <div>
      <button onClick={handleOpenWithTracking}>
        Открыть (с трекингом)
      </button>
      <button onClick={handleCloseWithTracking}>
        Закрыть (с трекингом)
      </button>
    </div>
  );
};

// ========================================
// Пример 7: Условный рендеринг
// ========================================

export const ConditionalContent: React.FC = () => {
  const { isOpen } = useMenu();

  return (
    <div>
      {isOpen ? (
        <div className="menu-overlay-content">
          Меню открыто - показываем дополнительный контент
        </div>
      ) : (
        <div className="main-content">
          Основной контент приложения
        </div>
      )}
    </div>
  );
};

// ========================================
// Пример 8: Wrap приложения с Provider
// ========================================

export const App: React.FC = () => {
  return (
    <MenuProvider>
      <div className="app">
        <ExampleComponent />
        <CustomMenuButton />
        {/* Другие компоненты */}
      </div>
    </MenuProvider>
  );
};

// ========================================
// TESTING UTILITIES
// ========================================

/**
 * Утилита для ручного тестирования в консоли браузера
 * 
 * Вставьте в консоль:
 * ```javascript
 * // Открыть меню
 * window.testMenu.open();
 * 
 * // Закрыть меню
 * window.testMenu.close();
 * 
 * // Переключить
 * window.testMenu.toggle();
 * ```
 */

declare global {
  interface Window {
    testMenu: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      status: () => boolean;
    };
  }
}

export const installMenuTestAPI = () => {
  // Эта функция должна быть вызвана внутри компонента с доступом к useMenu
  console.log('Menu Test API: установите в компоненте с useMenu hook');
};

// ========================================
// PERFORMANCE TIPS
// ========================================

/**
 * Оптимизация производительности:
 * 
 * 1. Используйте React.memo для MenuItem
 * 2. Избегайте inline функций в props
 * 3. Используйте useCallback для handlers
 * 4. Lazy load иконок если их много
 * 5. Используйте CSS containment для меню
 */

export const PerformantMenuItem = React.memo(() => {
  const handleClick = React.useCallback(() => {
    console.log('Item clicked');
  }, []);

  return <button onClick={handleClick}>Optimized Item</button>;
});

PerformantMenuItem.displayName = 'PerformantMenuItem';

