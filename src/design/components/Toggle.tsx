import React from 'react';

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  label, 
  description,
  className = '',
  checked,
  disabled,
  onChange,
  ...props 
}) => {
  return (
    <label className={`flex items-center justify-between gap-4 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {(label || description) && (
        <div className="select-none">
          {label && <div className="font-medium text-content-primary text-sm">{label}</div>}
          {description && <div className="text-xs text-content-tertiary mt-0.5">{description}</div>}
        </div>
      )}
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          {...props}
        />
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
          checked ? 'bg-brand-primary' : 'bg-surface-tertiary'
        }`}>
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
      </div>
    </label>
  );
};


