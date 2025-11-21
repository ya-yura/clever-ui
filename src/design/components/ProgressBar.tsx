import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max = 100, 
  variant = 'primary', 
  className = '',
  showLabel = false,
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    primary: 'bg-brand-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-content-secondary mb-1">
          <span>Progress</span>
          <span className={`font-medium ${percentage === 100 ? 'text-success' : ''}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-surface-tertiary rounded-full overflow-hidden`}>
        <div 
          className={`h-full transition-all duration-500 ease-out ${colors[variant]}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};


