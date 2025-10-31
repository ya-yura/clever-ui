// === 📁 src/modules/menu/MenuOverlay.tsx ===
// Backdrop overlay for menu with click-to-close functionality

import React from 'react';
import { motion } from 'framer-motion';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      aria-label="Закрыть меню"
    />
  );
};

export default MenuOverlay;

