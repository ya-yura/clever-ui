import React from 'react';
import logo from '@/assets/logo.svg';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 128, className = '' }) => {
  return (
    <img
      src={logo}
      alt="Cleverence logo"
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      decoding="async"
    />
  );
};

export default Logo;

