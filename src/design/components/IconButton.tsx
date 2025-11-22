import React from 'react';
import { Loader2 } from 'lucide-react';

export type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
  badge?: string | number;
}

/**
 * IconButton Component
 * 
 * Button with only an icon, no text label.
 * Perfect for toolbars and compact UIs.
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  className = '',
  variant = 'default',
  size = 'md',
  isLoading = false,
  badge,
  disabled,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variants: Record<IconButtonVariant, string> = {
    default: 'bg-surface-tertiary text-content-primary hover:bg-surface-tertiary/80 focus:ring-surface-tertiary',
    primary: 'bg-brand-primary text-brand-primaryDark hover:brightness-110 focus:ring-brand-primary',
    secondary: 'bg-surface-secondary text-content-primary hover:bg-surface-tertiary focus:ring-surface-secondary',
    ghost: 'bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-tertiary focus:ring-content-secondary',
    danger: 'bg-error/10 text-error hover:bg-error/20 border border-error/30 focus:ring-error',
  };

  const sizes: Record<IconButtonSize, string> = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-2.5',
  };

  const iconSizes: Record<IconButtonSize, number> = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={iconSizes[size]} />
      ) : (
        <>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
                size: iconSizes[size],
              })
            : icon
          }
          
          {badge && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-error text-white rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
};

