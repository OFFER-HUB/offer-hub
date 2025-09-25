
import { Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { InvoiceStatus } from '@/types/invoice.types'

interface InvoiceFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: InvoiceStatus | 'all'
  onStatusChange: (value: InvoiceStatus | 'all') => void
  onExport: (format: 'csv' | 'json' | 'pdf') => void
}

export function InvoiceFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onExport,
}: InvoiceFiltersProps) {
  return (
    <Card>
      <CardContent className='p-4 sm:p-6'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col sm:flex-row gap-4 items-stretch sm:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#002333]/50' />
              <Input
                placeholder='Search by customer name...'
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className='w-full sm:w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='sent'>Sent</SelectItem>
                <SelectItem value='viewed'>Viewed</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
                <SelectItem value='overdue'>Overdue</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='w-full sm:w-auto bg-transparent'>
                  <Download className='h-4 w-4 mr-2' />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('csv')}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>Export as JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('pdf')}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
