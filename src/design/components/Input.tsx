import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  className = '', 
  icon, 
  error,
  disabled,
  ...props 
}, ref) => {
  const baseStyles = 'w-full bg-surface-primary text-content-primary rounded-lg border transition-all outline-none placeholder-content-tertiary disabled:opacity-50 disabled:cursor-not-allowed';
  const padding = icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5';
  const border = error 
    ? 'border-error focus:ring-1 focus:ring-error' 
    : 'border-surface-tertiary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary';

  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary pointer-events-none">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`${baseStyles} ${padding} ${border} ${className}`}
        disabled={disabled}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ 
  className = '', 
  error,
  disabled,
  ...props 
}, ref) => {
  const baseStyles = 'w-full bg-surface-primary text-content-primary px-4 py-2.5 rounded-lg border transition-all outline-none placeholder-content-tertiary resize-none disabled:opacity-50 disabled:cursor-not-allowed';
  const border = error 
    ? 'border-error focus:ring-1 focus:ring-error' 
    : 'border-surface-tertiary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary';

  return (
    <textarea
      ref={ref}
      className={`${baseStyles} ${border} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
});

TextArea.displayName = 'TextArea';


