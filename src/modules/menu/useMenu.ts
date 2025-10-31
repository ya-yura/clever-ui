// === 📁 src/modules/menu/useMenu.ts ===
// Menu context and state management hook

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface MenuContextType {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  expandedItems: Set<string>;
  toggleExpand: (itemId: string) => void;
}

export const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Hook for accessing menu context
export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};

// Menu provider state management
export const useMenuState = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Open menu with haptic feedback
  const openMenu = useCallback(() => {
    setIsOpen(true);
    
    // Vibrate if supported (for TSD devices)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    // Reset expanded items when menu closes
    setTimeout(() => setExpandedItems(new Set()), 200);
  }, []);

  // Toggle menu
  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  // Toggle expand/collapse of menu item with children
  const toggleExpand = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeMenu]);

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    expandedItems,
    toggleExpand,
  };
};

