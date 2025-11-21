import React from 'react';

export type CardVariant = 'base' | 'elevated' | 'interactive';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'base', 
  noPadding = false,
  ...props 
}) => {
  const baseStyles = 'rounded-lg border transition-all duration-200';
  
  const variants = {
    base: 'bg-surface-secondary border-surface-tertiary',
    elevated: 'bg-surface-secondary border-surface-tertiary shadow-soft',
    interactive: 'bg-surface-secondary border-surface-tertiary shadow-soft cursor-pointer hover:border-brand-primary/50 hover:shadow-card active:scale-[0.99]',
  };

  const padding = noPadding ? '' : 'p-4 md:p-6';

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
