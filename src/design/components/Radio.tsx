import React from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  description,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <label className={`
      flex items-start gap-3 group cursor-pointer select-none
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}>
      <div className="relative flex items-center mt-0.5">
        <input
          type="radio"
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div className={`
          w-5 h-5 rounded-full border-2 transition-all duration-200
          peer-checked:border-brand-primary peer-checked:bg-brand-primary
          bg-surface-primary
          ${props.checked ? 'border-brand-primary' : 'border-surface-tertiary group-hover:border-content-tertiary'}
        `}>
          <div className="w-full h-full rounded-full bg-white scale-0 peer-checked:scale-[0.4] transition-transform" />
        </div>
      </div>
      
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className={`text-sm font-medium text-content-primary`}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-content-secondary mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};
