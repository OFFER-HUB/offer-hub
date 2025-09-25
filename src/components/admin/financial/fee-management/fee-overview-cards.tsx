'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Percent, DollarSign } from 'lucide-react'
import type { Fee } from '@/types/financial.types'

interface FeeOverviewCardsProps {
  fees: Fee[]
}

export function FeeOverviewCards({ fees }: FeeOverviewCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      <Card className='border-l-4 border-l-[#15949C]'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-[#002333]'>Active Fees</CardTitle>
          <Settings className='h-4 w-4 text-[#15949C]' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-[#002333]'>{fees.filter((fee) => fee.isActive).length}</div>
          <p className='text-xs text-[#002333]/70'>out of {fees.length} total fees</p>
        </CardContent>
      </Card>

      <Card className='border-l-4 border-l-green-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-[#002333]'>Avg Commission Rate</CardTitle>
          <Percent className='h-4 w-4 text-green-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-[#002333]'>
            {fees.find((f) => f.category === 'platform')?.value || 0}%
          </div>
          <p className='text-xs text-[#002333]/70'>platform commission</p>
        </CardContent>
      </Card>

      <Card className='border-l-4 border-l-blue-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-[#002333]'>Processing Fee</CardTitle>
          <DollarSign className='h-4 w-4 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-[#002333]'>
            {fees.find((f) => f.category === 'payment_processing')?.value || 0}%
          </div>
          <p className='text-xs text-[#002333]/70'>payment processing</p>
        </CardContent>
      </Card>
    </div>
  )
}
