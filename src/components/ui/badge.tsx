import React from 'react';

interface BadgeProps {
  variant: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({ variant, className, children, onClick }) => {
  return (
    <span className={`badge ${variant} ${className}`} onClick={onClick}>
      {children}
    </span>
  );
};
