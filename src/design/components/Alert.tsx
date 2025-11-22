import React from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const variants = {
    info: 'bg-status-info/10 text-status-infoDark border-status-info/20',
    success: 'bg-status-success/10 text-status-successDark border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warningDark border-status-warning/20',
    error: 'bg-status-error/10 text-status-errorDark border-status-error/20',
  };

  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <AlertCircle size={20} />,
  };

  return (
    <div className={`
      flex gap-3 p-4 rounded-lg border ${variants[variant]} ${className}
    `} role="alert">
      <div className="shrink-0">
        {icons[variant]}
      </div>
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-bold mb-1">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
