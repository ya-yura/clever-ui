import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Button Component
 * 
 * Primary interaction element.
 * Uses tokens from design-system.json via Tailwind config.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  disabled,
  ...props
}) => {
  
  // Base styles (structure, focus, transition)
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-[0.98]';
  
  // Variant styles
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-brand-primary text-brand-dark hover:brightness-110 focus:ring-brand-primary shadow-soft',
    secondary: 'bg-surface-tertiary text-content-primary hover:bg-surface-tertiary/80 border border-surface-tertiary focus:ring-surface-tertiary',
    ghost: 'bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-tertiary focus:ring-content-secondary',
    danger: 'bg-error/10 text-error hover:bg-error/20 border border-error/30 focus:ring-error',
  };

  // Size styles
  const sizes: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-5 py-2.5 gap-2 h-10',
    lg: 'text-base px-6 py-3.5 gap-2.5 h-12',
    icon: 'p-2.5 h-10 w-10 rounded-lg', // Square for icons
  };

  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
      )}
      
      {!isLoading && startIcon && (
        <span className="inline-flex shrink-0">{startIcon}</span>
      )}
      
      {children}

      {!isLoading && endIcon && (
        <span className="inline-flex shrink-0">{endIcon}</span>
      )}
    </button>
  );
};
