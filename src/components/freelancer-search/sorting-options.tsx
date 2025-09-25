'use client'

import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

interface SortingOptionsProps {
  sortOption: string
  setSortOption: (option: string) => void
}

export default function SortingOptions({ sortOption, setSortOption }: SortingOptionsProps) {
  return (
    <div className='flex items-center justify-between gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant='outline' 
            className='flex items-center justify-between border-gray-200 rounded-lg text-gray-700 font-normal px-4 py-2 w-48 h-11 bg-white'
          >
            <span>{sortOption}</span>
            <ChevronDown className='h-5 w-5 ml-2 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-48'>
          <DropdownMenuItem onClick={() => setSortOption('Recommended')}>
            Recommended
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortOption('Most Recent')}>
            Most Recent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortOption('Highest Rated')}>
            Highest Rated
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortOption('Lowest Rate')}>
            Lowest Rate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortOption('Highest Rate')}>
            Highest Rate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button 
        variant='outline' 
        className='border-gray-200 rounded-lg text-gray-700 font-normal px-3 h-11 w-11 bg-white'
      >
        <SlidersHorizontal className='h-5 w-5' />
      </Button>
    </div>
  )
}

