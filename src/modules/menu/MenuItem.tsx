// === 📁 src/modules/menu/MenuItem.tsx ===
// Universal menu item component with support for nested items

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { MenuItem as MenuItemType } from './MenuData';
import { useMenu } from './useMenu';

interface MenuItemProps {
  item: MenuItemType;
  isOnline: boolean;
  onAction: (action: string, value?: string) => void;
  level?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  isOnline, 
  onAction, 
  level = 0 
}) => {
  const { expandedItems, toggleExpand } = useMenu();
  const [isPressed, setIsPressed] = useState(false);
  
  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const isDisabled = item.requiresOnline && !isOnline;
  
  const Icon = item.icon;
  
  const handleClick = () => {
    // Vibrate on touch
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    if (hasChildren) {
      toggleExpand(item.id);
    } else if (!isDisabled && item.action && item.actionValue) {
      onAction(item.action, item.actionValue);
    }
  };

  const paddingLeft = level === 0 ? 'pl-4' : 'pl-12';

  return (
    <>
      <motion.button
        className={`
          w-full flex items-center justify-between
          ${paddingLeft} pr-4 py-4
          text-left text-gray-100
          transition-all duration-150
          ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-700/50 active:bg-gray-700'}
          ${isPressed ? 'bg-gray-700' : ''}
          ${level > 0 ? 'border-l-2 border-gray-600' : ''}
          touch-manipulation
        `}
        onClick={handleClick}
        disabled={isDisabled}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      >
        <div className="flex items-center gap-4 min-h-[40px]">
          <Icon 
            className={`w-6 h-6 flex-shrink-0 ${isDisabled ? 'text-gray-500' : 'text-blue-400'}`} 
          />
          <span className={`text-base font-medium ${isDisabled ? 'text-gray-500' : ''}`}>
            {item.label}
          </span>
        </div>
        
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        )}
      </motion.button>

      {/* Submenu animation */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden bg-gray-800/50"
          >
            {item.children!.map((child) => (
              <MenuItem
                key={child.id}
                item={child}
                isOnline={isOnline}
                onAction={onAction}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MenuItem;

