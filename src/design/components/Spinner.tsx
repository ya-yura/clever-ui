import React from 'react';
import { tokens } from '../../design/tokens';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const variantClasses = {
    default: 'border-surface-tertiary border-t-content-primary',
    primary: 'border-surface-tertiary border-t-brand-primary',
    secondary: 'border-surface-tertiary border-t-brand-secondary',
    white: 'border-white/30 border-t-white',
  };

  return (
    <div
      className={`
        rounded-full animate-spin
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      role="status"
      aria-label="Загрузка"
    />
  );
};
