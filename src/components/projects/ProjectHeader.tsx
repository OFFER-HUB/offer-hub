'use client'

import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Header() {
  return (
    <div className='flex items-center justify-between px-4 sm:px-6 py-3'>
      <div className='flex items-center gap-3'>
        <div className='h-9 w-9 rounded-full bg-white p-[2px] ring-1 ring-slate-200 shadow-sm'>
          <Image src='/oh-logo.png' alt='Offer Hub logo' width={32} height={32} className='rounded-full' />
        </div>
        <span className='text-slate-800 font-semibold select-none'>Offer Hub</span>
      </div>
      <div className='text-sm font-medium text-slate-600'>Manage Project</div>
      <Avatar>
        <AvatarImage src='/placeholder.svg?height=40&width=40' alt='Usuario' />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  )
}
