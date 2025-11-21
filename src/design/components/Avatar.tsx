import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarStatus = 'online' | 'offline' | 'busy';

interface AvatarProps {
  src?: string;
  fallback: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  fallback, 
  size = 'md', 
  status, 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-content-tertiary',
    busy: 'bg-error',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizes[size]} rounded-full bg-surface-tertiary flex items-center justify-center overflow-hidden border border-surface-tertiary text-content-secondary font-bold select-none`}>
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span>{fallback.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      {status && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-secondary ${statusColors[status]}`} />
      )}
    </div>
  );
};
