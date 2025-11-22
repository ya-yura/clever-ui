import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = false, className = '', disabled, ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-content-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={`
              px-3 py-2 rounded-lg border bg-surface-primary text-content-primary
              placeholder:text-content-tertiary
              focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${fullWidth ? 'w-full' : 'w-auto'}
              ${
                error
                  ? 'border-status-error focus:border-status-error focus:ring-status-error/20'
                  : 'border-surface-tertiary hover:border-content-tertiary'
              }
              ${disabled ? 'bg-surface-secondary opacity-50 cursor-not-allowed' : ''}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
