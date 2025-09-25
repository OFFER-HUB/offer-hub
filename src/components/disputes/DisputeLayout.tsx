'use client';

import { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface TalentLayoutProps {
  children: ReactNode;
}

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

export default function DisputeLayout({ children }: TalentLayoutProps) {
  const pathname = usePathname();

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className='w-64 bg-white flex flex-col'>
        {/* Logo */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center gap-2'>
            <img src='/logo.svg' alt='Offer Hub Logo' className='w-8 h-8' />
            <span className='text-xl font-bold text-gray-900'>Offer Hub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 p-4'>
          <ul className='space-y-2'>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-teal-600 bg-teal-50'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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

        {/* Logout */}
        <div className='p-4 border-t border-gray-200'>
          <button className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 w-full transition-colors'>
            <LogOut className='w-5 h-5' />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <header className='bg-white border-b border-gray-200 px-6 py-6'>
          <div className='flex items-center justify-end '>
           
            <div className='flex items-center gap-4'>
              <Avatar className='w-8 h-8'>
                <AvatarImage src='/avatar_olivia.jpg' alt='User' />
                <AvatarFallback className='text-sm'>U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className='flex-1 overflow-y-auto'>
          {children}
        </main>
      </div>
    </div>
  );
}
