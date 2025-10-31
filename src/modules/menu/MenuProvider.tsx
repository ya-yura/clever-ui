// === 📁 src/modules/menu/MenuProvider.tsx ===
// Context provider for menu state

import React from 'react';
import { MenuContext, useMenuState } from './useMenu';

interface MenuProviderProps {
  children: React.ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const menuState = useMenuState();

  return (
    <MenuContext.Provider value={menuState}>
      {children}
    </MenuContext.Provider>
  );
};

export default MenuProvider;

