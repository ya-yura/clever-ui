import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-content-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        disabled={disabled}
        className={`
          px-3 py-2 rounded-lg border bg-surface-primary text-content-primary
          placeholder:text-content-tertiary
          focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
          transition-all duration-200 min-h-[80px]
          ${fullWidth ? 'w-full' : 'w-auto'}
          ${error 
            ? 'border-status-error focus:border-status-error focus:ring-status-error/20' 
            : 'border-surface-tertiary hover:border-content-tertiary'
          }
          ${disabled ? 'bg-surface-secondary opacity-50 cursor-not-allowed' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-status-error">{error}</p>
      )}
    </div>
  );
};
