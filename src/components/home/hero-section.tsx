import Image from 'next/image';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { popularTags } from '@/data/landing-data';

export default function HeroSection() {
  return (
    <section className='bg-gradient-to-r from-[#002333] to-[#15949C] text-white py-16 md:py-24'>
      <div className='container mx-auto px-4 max-w-7xl grid md:grid-cols-2 gap-12 items-center'>
        <div className='space-y-6'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
            Find the perfect freelancer for your project
          </h1>
          <p className='text-lg md:text-xl opacity-90'>
            Connect with skilled professionals ready to bring your ideas to life
          </p>
          <div className='bg-white rounded-lg p-2 flex items-center shadow-lg'>
            <Input
              placeholder='What service are you looking for?'
              className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
            />
            <Button className='bg-[#15949C] hover:bg-[#15949C]/90 ml-2'>
              <Search className='h-4 w-4 mr-2' />
              Search
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {popularTags.map((tag, index) => (
              <Badge
                key={index}
                className='bg-white/20 hover:bg-white/30 text-white'
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className='hidden md:block relative'>
          <div className='absolute -top-6 -left-6 w-24 h-24 bg-[#DEEFE7] rounded-full opacity-30'></div>
          <div className='absolute -bottom-10 -right-10 w-32 h-32 bg-[#DEEFE7] rounded-full opacity-30'></div>
          <div className='relative z-10 bg-white p-6 rounded-lg shadow-xl'>
            <Image
              src='/logo.svg'
              alt='Freelancer working'
              width={500}
              height={400}
              className='rounded-lg object-cover'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
