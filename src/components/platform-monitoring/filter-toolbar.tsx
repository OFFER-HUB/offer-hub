'use client';

import { CalendarIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { format } from 'date-fns';

export default function FilterToolbar() {
  const [userType, setUserType] = useState<'Freelancer' | 'Customer'>(
    'Freelancer'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const handleExport = () => {
    console.log('Exporting report...');
    // Stub for export functionality
    alert('Report export initiated. This feature is currently stubbed.');
  };
  return (
    <div className='flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4 bg-white p-3 rounded border-b mt-2'>
      {/* Left side controls - stack on mobile */}
      <div className='flex flex-col sm:flex-row w-full md:w-auto flex-wrap items-start sm:items-center gap-3 md:gap-4'>
        <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto'>
          <Select
            value={userType}
            onValueChange={(value) =>
              setUserType(value as 'Freelancer' | 'Customer')
            }
          >
            <SelectTrigger className='w-full sm:w-[140px] h-10 border-[#B4B9C9]'>
              <SelectValue placeholder='Select user type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Freelancer'>Freelancer</SelectItem>
              <SelectItem value='Customer'>Customer</SelectItem>
              <SelectItem value='Customer'>user</SelectItem>
            </SelectContent>
          </Select>
          <Button className='bg-[#149A9B] hover:bg-[#108080] text-white h-10 px-4 w-full sm:w-auto'>
            View {userType.toLowerCase()}
          </Button>
        </div>

        {/* Search input */}
        <div className='relative w-full sm:w-[240px]'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B4B9C9]'
            size={16}
          />
          <Input
            placeholder='Search by customer name'
            className='pl-9 h-10 border-[#B4B9C9] focus-visible:ring-offset-0 w-full'
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.currentTarget.value)}
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end mt-3 md:mt-0'>
        {/* Date filter */}
        <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='h-10 px-3 border-[#B4B9C9] text-[#6D758F] hover:bg-gray-50 gap-2 w-full sm:w-auto'
              >
                <CalendarIcon className='h-4 w-4 text-[#6D758F]' />
                {date ? format(date, 'MM/dd/yy') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='end'>
              <Calendar
                mode='single'
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant='outline'
            className='h-10 px-4 border-[#B4B9C9] text-[#6D758F] hover:bg-gray-50 w-full sm:w-auto'
          >
            Filter
          </Button>
        </div>

        {/* Export button */}
        <Button
          className='h-10 px-4 bg-[#002333] hover:bg-[#001a26] text-white rounded-full w-full sm:w-auto'
          onClick={handleExport}
        >
          Export Report
        </Button>
      </div>
    </div>
  );
}
