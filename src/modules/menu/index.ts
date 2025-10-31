// === 📁 src/modules/menu/index.ts ===
// Module exports for hamburger menu

export { default as HamburgerMenu } from './HamburgerMenu';
export { default as MenuItem } from './MenuItem';
export { default as MenuOverlay } from './MenuOverlay';
export { default as MenuProvider } from './MenuProvider';
export { useMenu, useMenuState, MenuContext } from './useMenu';
export { menuItems, appMetadata } from './MenuData';
export type { MenuItem as MenuItemType } from './MenuData';

