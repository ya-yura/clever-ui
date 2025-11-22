import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'right' | 'left' | 'bottom';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  title,
  children,
  className = '',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    right: 'top-0 right-0 h-full w-full md:w-96 transform translate-x-0',
    left: 'top-0 left-0 h-full w-full md:w-96 transform translate-x-0',
    bottom: 'bottom-0 left-0 w-full h-auto max-h-[90vh] rounded-t-xl transform translate-y-0',
  };

  const initialPositionClasses = {
    right: 'translate-x-full',
    left: '-translate-x-full',
    bottom: 'translate-y-full',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className={`
        absolute bg-surface-primary shadow-2xl flex flex-col transition-transform duration-300 ease-out
        ${positionClasses[position]}
        ${className}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-surface-tertiary">
          <h2 className="text-lg font-bold text-content-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-surface-secondary text-content-secondary transition-colors"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
