import Image from 'next/image';
import { Calendar, FileText, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function ProfileSidebar() {
  return (
    <div className='w-80 border-l'>
      <div className='p-4 border-b flex items-center justify-between'>
        <h2 className='text-base font-medium'>Details</h2>
        <Button variant='ghost' size='icon' className='rounded-full h-6 w-6'>
          <Info className='h-4 w-4' />
        </Button>
      </div>

      <div className='flex flex-col items-center pt-6 pb-4'>
        <div className='relative w-20 h-20 mb-3'>
          <Avatar className='h-20 w-20'>
            <Image
              src='/profile.jpeg'
              alt='Sarah Johnson'
              width={80}
              height={80}
            />
          </Avatar>
        </div>
        <h3 className='text-lg font-medium'>Sarah Johnson</h3>
        <p className='text-sm text-muted-foreground'>Full Stack Developer</p>
        <div className='flex mt-1'>
          {[1, 2, 3, 4].map((star, index) => (
            <svg
              key={index}
              className={cn(
                'w-4 h-4',
                index === 3 ? 'text-muted-foreground/40' : 'text-yellow-400',
              )}
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
          ))}
        </div>
      </div>

      <div className='px-4 py-3'>
        <h4 className='text-sm font-medium mb-2'>Project</h4>
        <div className='bg-muted/30 p-3 rounded-md'>
          <h5 className='font-medium'>E-commerce Platform</h5>
          <p className='text-sm text-muted-foreground'>Active project</p>
        </div>
      </div>

      <div className='px-4 py-3'>
        <h4 className='text-sm font-medium mb-2'>Rate</h4>
        <p className='text-lg font-semibold'>$65/hr</p>
      </div>

      <div className='px-4 py-3'>
        <h4 className='text-sm font-medium mb-3'>Actions</h4>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            className='flex-1 bg-white border-muted-foreground/20'
          >
            <Calendar className='h-4 w-4 mr-2 text-muted-foreground' />
            <span className='text-sm'>Schedule</span>
          </Button>
          <Button
            variant='outline'
            className='flex-1 bg-white border-muted-foreground/20'
          >
            <FileText className='h-4 w-4 mr-2 text-muted-foreground' />
            <span className='text-sm'>Files</span>
          </Button>
        </div>
      </div>

      <div className='px-4 py-3'>
        <h4 className='text-sm font-medium mb-3'>Shared Files</h4>
        <div className='flex items-center gap-3'>
          <div className='bg-muted/30 h-8 w-8 flex items-center justify-center rounded-md'>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium'>homepage-design-preview.jpg</p>
            <p className='text-xs text-muted-foreground'>2.4 MB • Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}
