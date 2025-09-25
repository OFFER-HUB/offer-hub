'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockRevenueAnalysisData } from '@/data/mock-financial-data'

interface RevenueAnalysisTabProps {
  profitabilityAnalysis: any
  metrics: any
  formatCurrency: (amount: number) => string
}

export function RevenueAnalysisTab({ profitabilityAnalysis, metrics, formatCurrency }: RevenueAnalysisTabProps) {
  const revenueTrendData = useMemo(() => {
    return mockRevenueAnalysisData
  }, [])

  return (
    <div className='space-y-6'>
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className='text-[#002333]'>Revenue Trend Analysis</CardTitle>
          <CardDescription>Monthly revenue growth and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#DEEFE7' />
                <XAxis dataKey='month' stroke='#002333' fontSize={12} />
                <YAxis stroke='#002333' fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #DEEFE7',
                    borderRadius: '8px',
                  }}
                />
                <Area type='monotone' dataKey='revenue' stroke='#15949C' fill='#15949C' fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {profitabilityAnalysis?.byCategory &&
                Object.entries(profitabilityAnalysis.byCategory)
                  .filter(([category, amount]) => category && typeof amount === 'number')
                  .map(([category, amount]) => (
                    <div key={category} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-[#15949C]' />
                        <span className='text-sm font-medium text-[#002333]'>{category}</span>
                      </div>
                      <div className='text-right'>
                        <div className='font-semibold text-[#002333]'>{formatCurrency(amount as number)}</div>
                        <div className='text-xs text-green-600'>+{Math.floor(Math.random() * 20 + 5)}%</div>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Revenue by User Segment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {profitabilityAnalysis?.byUserSegment &&
                Object.entries(profitabilityAnalysis.byUserSegment)
                  .filter(([segment, amount]) => segment && typeof amount === 'number')
                  .map(([segment, amount]) => (
                    <div key={segment} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-[#002333]' />
                        <span className='text-sm font-medium text-[#002333]'>{segment}</span>
                      </div>
                      <div className='text-right'>
                        <div className='font-semibold text-[#002333]'>{formatCurrency(amount as number)}</div>
                        <div className='text-xs text-blue-600'>
                          {(((amount as number) / (metrics?.totalRevenue || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
