'use client';

import {
  LayoutDashboard,
  Plus,
  Search,
  FolderOpen,
  Wallet,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/onboarding/dashboard',
  },
  {
    title: 'Create project',
    icon: Plus,
    href: '/client/create-project',
  },
  {
    title: 'Search Talent',
    icon: Search,
    href: '/onboarding/dashboard/talent',
  },
  {
    title: 'Manage project',
    icon: FolderOpen,
    href: '/dashboard/manage-project',
  },
  {
    title: 'Wallet',
    icon: Wallet,
    href: '/dashboard/wallet',
  },
  {
    title: 'Messages',
    icon: MessageSquare,
    href: '/dashboard/messages',
  },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <div className='w-[252px] bg-white border-r border-gray-200 flex-col h-screen hidden md:flex'>
      <nav className='flex-1 px-4 py-8'>
        <ul className='space-y-4'>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 px-4 py-1 text-base font-medium transition-colors',
                    isActive
                      ? 'text-teal-600'
                      : 'text-gray-700 hover:text-gray-900'
                  )}
                >
                  <item.icon className='w-5 h-5' />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className='px-6 py-8 border-gray-200'>
        <button className='flex items-center gap-4 px-4 py-1 text-base font-medium text-red-600 hover:text-red-700 w-full transition-colors'>
          <LogOut className='w-5 h-5' />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}