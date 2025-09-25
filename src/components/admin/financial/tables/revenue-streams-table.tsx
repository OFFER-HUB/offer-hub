'use client'

import { Badge } from '@/components/ui/badge'

interface RevenueStream {
  id: string
  name: string
  type: string
  amount: number
  date: Date
  status: 'completed' | 'pending' | 'failed'
}

interface RevenueStreamsTableProps {
  streams: RevenueStream[]
  formatCurrency: (amount: number) => string
}

export function RevenueStreamsTable({ streams, formatCurrency }: RevenueStreamsTableProps) {
  if (!streams || streams.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-[#002333]/50 text-lg mb-2'>No Revenue Streams Found</div>
        <div className='text-[#002333]/40 text-sm'>Revenue data will appear here once transactions are processed.</div>
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-[#DEEFE7]'>
            <th className='text-left py-3 px-4 font-medium text-[#002333]'>Source</th>
            <th className='text-left py-3 px-4 font-medium text-[#002333]'>Type</th>
            <th className='text-left py-3 px-4 font-medium text-[#002333]'>Amount</th>
            <th className='text-left py-3 px-4 font-medium text-[#002333]'>Date</th>
            <th className='text-left py-3 px-4 font-medium text-[#002333]'>Status</th>
          </tr>
        </thead>
        <tbody>
          {streams.slice(0, 10).map((stream) => (
            <tr key={stream.id} className='border-b border-[#DEEFE7]/50 hover:bg-[#DEEFE7]/20'>
              <td className='py-3 px-4 text-[#002333]'>{stream.name}</td>
              <td className='py-3 px-4'>
                <Badge variant='secondary' className='bg-[#3B82F6]/10 text-[#3B82F6]'>
                  {stream.type.replace('_', ' ')}
                </Badge>
              </td>
              <td className='py-3 px-4 font-medium text-[#002333]'>{formatCurrency(stream.amount)}</td>
              <td className='py-3 px-4 text-[#002333]/70'>{stream.date.toLocaleDateString()}</td>
              <td className='py-3 px-4'>
                <Badge
                  variant={stream.status === 'completed' ? 'default' : 'secondary'}
                  className={
                    stream.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : stream.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }
                >
                  {stream.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
