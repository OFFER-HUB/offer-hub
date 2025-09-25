'use client'

import type React from 'react'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <form onSubmit={handleSubmit} className='relative w-full'>
      <Input
        type='text'
        placeholder='Search for skills, job titles, or keywords...'
        className='w-full py-6 pl-4 pr-12 rounded-md'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button type='submit' className='absolute right-1 top-1 bottom-1 bg-teal-600 hover:bg-teal-700 text-white'>
        <Search className='h-5 w-5 mr-1 text-white' />
        <span>Search</span>
      </Button>
    </form>
  )
}

