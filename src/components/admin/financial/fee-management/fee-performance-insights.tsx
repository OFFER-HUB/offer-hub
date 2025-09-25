'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import type { Fee } from '@/types/financial.types'

interface FeePerformanceInsightsProps {
  fees: Fee[]
  formatCurrency: (amount: number) => string
}

export function FeePerformanceInsights({ fees, formatCurrency }: FeePerformanceInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-[#002333] flex items-center gap-2'>
          <TrendingUp className='h-5 w-5 text-[#15949C]' />
          Fee Performance Insights
        </CardTitle>
        <CardDescription>Analysis of fee performance and recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <h4 className='font-medium text-[#002333]'>Revenue by Fee Type</h4>
            {fees.map((fee) => (
              <div key={fee.id} className='flex items-center justify-between p-3 bg-[#DEEFE7]/10 rounded-lg'>
                <div>
                  <div className='font-medium text-[#002333]'>{fee.name}</div>
                  <div className='text-sm text-[#002333]/70'>
                    {fee.type === 'percentage' ? `${fee.value}%` : formatCurrency(fee.value)}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-bold text-[#15949C]'>{formatCurrency(Math.random() * 10000 + 5000)}</div>
                  <div className='text-xs text-green-600'>+12.5%</div>
                </div>
              </div>
            ))}
          </div>

          <div className='space-y-4'>
            <h4 className='font-medium text-[#002333]'>Recommendations</h4>
            <div className='space-y-3'>
              <div className='flex items-start gap-3 p-3 bg-yellow-50 rounded-lg'>
                <AlertTriangle className='h-4 w-4 text-yellow-600 mt-0.5' />
                <div>
                  <div className='font-medium text-yellow-800'>Consider Fee Optimization</div>
                  <div className='text-sm text-yellow-700'>
                    Platform commission is below industry average. Consider increasing to 6%.
                  </div>
                </div>
              </div>
              <div className='flex items-start gap-3 p-3 bg-blue-50 rounded-lg'>
                <TrendingUp className='h-4 w-4 text-blue-600 mt-0.5' />
                <div>
                  <div className='font-medium text-blue-800'>Strong Performance</div>
                  <div className='text-sm text-blue-700'>
                    Payment processing fees are competitive and generating good revenue.
                  </div>
                </div>
              </div>
              <div className='flex items-start gap-3 p-3 bg-green-50 rounded-lg'>
                <DollarSign className='h-4 w-4 text-green-600 mt-0.5' />
                <div>
                  <div className='font-medium text-green-800'>Revenue Opportunity</div>
                  <div className='text-sm text-green-700'>
                    Consider introducing premium listing fees for enhanced visibility.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
