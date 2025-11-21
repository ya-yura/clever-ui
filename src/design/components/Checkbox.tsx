import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  description,
  className = '',
  checked,
  disabled,
  onChange,
  ...props 
}) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          {...props}
        />
        <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
          checked 
            ? 'bg-brand-primary border-brand-primary' 
            : 'bg-surface-primary border-surface-tertiary group-hover:border-content-tertiary'
        }`}>
          <Check 
            size={14} 
            className={`text-brand-dark transition-transform ${checked ? 'scale-100' : 'scale-0'}`} 
            strokeWidth={3}
          />
        </div>
      </div>
      {(label || description) && (
        <div className="select-none">
          {label && <div className="font-medium text-content-primary text-sm">{label}</div>}
          {description && <div className="text-xs text-content-tertiary mt-0.5">{description}</div>}
        </div>
      )}
    </label>
  );
};


