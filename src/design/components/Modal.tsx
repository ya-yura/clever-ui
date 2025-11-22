import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

/**
 * Modal Component
 * 
 * Overlay dialog for focused user interactions.
 * Includes accessibility features and animations.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}) => {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleOverlayClick}
      />

      {/* Modal Content */}
      <div
        className={`
          relative
          ${sizes[size]}
          w-full
          bg-surface-secondary
          rounded-2xl
          shadow-2xl
          border border-border-default
          animate-in
          zoom-in-95
          fade-in
          duration-300
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
            {title && (
              <h2 id="modal-title" className="text-xl font-bold text-content-primary">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-content-tertiary hover:text-content-primary hover:bg-surface-tertiary transition-colors"
                aria-label="Закрыть"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal.Footer helper component
 */
const ModalFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

(Modal as any).Footer = ModalFooter;

