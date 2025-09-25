import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  return (
    <header className='border-b bg-white py-4 px-6'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 relative'>
            <Image src='/logo.svg' alt='Offer Hub Logo' fill className='object-contain' priority />
          </div>
          <span className='font-semibold text-gray-700 uppercase'>Offer Hub</span>
        </div>
        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
        <a href='#' className='flex items-center text-gray-600 hover:text-gray-900'>
          <ChevronLeft className='h-4 w-4 mr-1' />
          <span>Back to Home</span>
        </a>
      </div>
    </header>
  )
}
