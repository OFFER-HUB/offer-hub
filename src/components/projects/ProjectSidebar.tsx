'use client'

import { LayoutDashboard, PlusCircle, Search, FolderCog, Wallet, MessageSquare, LogOut } from 'lucide-react'

const items = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: PlusCircle, label: 'Create project' },
  { icon: Search, label: 'Search Talent' },
  { icon: FolderCog, label: 'Manage project' },
  { icon: Wallet, label: 'Wallet' },
  { icon: MessageSquare, label: 'Messages' },
]

export function Sidebar() {
  return (
    <nav aria-label='Sidebar' className='h-full flex flex-col justify-between'>
      <ul className='p-4 space-y-2'>
        {items.map(({ icon: Icon, label, active }) => (
          <li key={label}>
            <button
              className={[
                'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                active ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className='h-4 w-4' />
              <span className='truncate'>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className='p-4 border-t'>
        <button className='w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50'>
          <LogOut className='h-4 w-4' />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}
