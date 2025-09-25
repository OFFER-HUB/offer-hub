import { ReactNode } from 'react';

export function Stack({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;

  space?: string;
}) {
  return <div className={`flex flex-col ${className}`}>{children}</div>;
}
