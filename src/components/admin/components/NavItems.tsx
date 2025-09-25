'use client'
import type React from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  className?: string;
  path: string
}

export default function NavItem({
  icon,
  label,
  active,
  className,
  path = '/admin'
}: NavItemProps) {

  const { push } = useRouter()

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100',
        active && 'bg-[#15949C]/10 text-[#15949C] font-semibold',
        className
      )}
      onClick={() => push(path)}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
