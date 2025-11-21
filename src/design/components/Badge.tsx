import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'neutral', 
  className = '',
  icon
}) => {
  const variants = {
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    error: 'bg-error/20 text-error border-error/30',
    info: 'bg-info/20 text-info border-info/30',
    neutral: 'bg-surface-tertiary text-content-secondary border-surface-tertiary',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[variant]} ${className}`}>
      {icon && <span className="w-3 h-3 flex items-center justify-center">{icon}</span>}
      {label}
    </span>
  );
};


