import Image from 'next/image';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecoverySentHeader() {
  return (
    <header className='border-b border-gray-200 bg-white'>
      <div className='mx-auto px-4 py-3 flex items-center justify-between max-w-7xl'>
        <div className='flex items-center'>
          <div className='text-base font-bold text-gray-900 flex items-center'>
            <div className='rounded-full mr-2 flex items-center justify-center overflow-hidden'>
              <Image
                src='/oh-logo.png'
                alt='OH Logo'
                width={60}
                height={50}
                className='object-contain'
              />
            </div>
            PayDinner
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <Button
            variant='default'
            className='!rounded-full bg-[#003049] text-white hover:bg-[#00436a] text-sm px-10'
          >
            Sign up
          </Button>

          <button className='text-gray-700' aria-label='Search'>
            <Search size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
