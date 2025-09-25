'use client';

import { CalendarIcon, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { format } from 'date-fns';

interface ToolbarProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onExport?: () => void;
}

export default function DisputeToolbar({ onSearch, onFilter, onExport }: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<Date | undefined>();
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleExport = () => {
    console.log('Exporting dispute report...');
    onExport?.();
  };

  const handleApplyFilters = () => {
    const filters = { dateRange, status, priority, searchQuery };
    onFilter?.(filters);
  };

  return (
    <div className='flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm'>
      {/* Left side - Search and Filters */}
      <div className='flex flex-col sm:flex-row w-full md:w-auto flex-wrap items-start sm:items-center gap-3 md:gap-4'>
        {/* Search input */}
        <div className='relative w-full sm:w-[280px]'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            size={16}
          />
          <Input
            placeholder='Search by customer name, ticket ID...'
            className='pl-9 h-10 border-gray-300 focus-visible:ring-offset-0 w-full'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className='w-full sm:w-[140px] h-10 border-gray-300 bg-[#149A9B] text-white'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='unassigned'>Unassigned</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='resolved'>Resolved</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className='w-full sm:w-[140px] h-10 border-gray-300'>
            <SelectValue placeholder='Priority' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Priority</SelectItem>
            <SelectItem value='high'>High</SelectItem>
            <SelectItem value='medium'>Medium</SelectItem>
            <SelectItem value='low'>Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right side - Date picker and Actions */}
      <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end'>
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className='h-10 px-3 border-gray-300 text-gray-600 hover:bg-gray-50 gap-2 w-full sm:w-auto'
            >
              <CalendarIcon className='h-4 w-4' />
              {dateRange ? format(dateRange, 'MM/dd/yy') : 'Date range'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='end'>
            <Calendar
              mode='single'
              selected={dateRange}
              onSelect={setDateRange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Apply Filters Button */}
        <Button
          variant='outline'
          className='h-10 px-4 border-gray-300 text-gray-600 hover:bg-gray-50 gap-2 w-full sm:w-auto'
          onClick={handleApplyFilters}
        >
          <Filter className='h-4 w-4' />
          Apply Filters
        </Button>

        {/* Export Button */}
        <Button
          className='h-10 px-4 bg-[#149A9B] hover:bg-[#108080] text-white rounded-lg w-full sm:w-auto'
          onClick={handleExport}
        >
          Export Report
        </Button>
      </div>
    </div>
  );
}
