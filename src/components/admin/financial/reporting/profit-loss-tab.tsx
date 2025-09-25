'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ProfitLossTabProps {
  formatCurrency: (amount: number) => string
}

export function ProfitLossTab({ formatCurrency }: ProfitLossTabProps) {
  const profitLossData = useMemo(() => {
    return [
      { month: 'Jan 2024', revenue: 89500, expenses: 45200, profit: 44300 },
      { month: 'Feb 2024', revenue: 92100, expenses: 47800, profit: 44300 },
      { month: 'Mar 2024', revenue: 95600, expenses: 48900, profit: 46700 },
      { month: 'Apr 2024', revenue: 98200, expenses: 49500, profit: 48700 },
      { month: 'May 2024', revenue: 101800, expenses: 51200, profit: 50600 },
      { month: 'Jun 2024', revenue: 105400, expenses: 52800, profit: 52600 },
    ]
  }, [])

  return (
    <div className='space-y-6'>
      {/* Profit & Loss Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='text-[#002333]'>Profit & Loss Statement</CardTitle>
          <CardDescription>Monthly profit and loss breakdown over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={profitLossData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#DEEFE7' />
                <XAxis dataKey='month' stroke='#002333' fontSize={12} />
                <YAxis stroke='#002333' fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #DEEFE7',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey='revenue' fill='#15949C' name='Revenue' />
                <Bar dataKey='expenses' fill='#FFA500' name='Expenses' />
                <Bar dataKey='profit' fill='#00C851' name='Profit' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* P&L Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className='text-[#002333]'>Detailed P&L Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-[#DEEFE7]'>
                  <th className='text-left py-3 px-4 font-medium text-[#002333]'>Period</th>
                  <th className='text-right py-3 px-4 font-medium text-[#002333]'>Revenue</th>
                  <th className='text-right py-3 px-4 font-medium text-[#002333]'>Expenses</th>
                  <th className='text-right py-3 px-4 font-medium text-[#002333]'>Net Profit</th>
                  <th className='text-right py-3 px-4 font-medium text-[#002333]'>Margin</th>
                </tr>
              </thead>
              <tbody>
                {profitLossData.map((item, index) => (
                  <tr key={index} className='border-b border-[#DEEFE7]/50'>
                    <td className='py-3 px-4 text-[#002333]'>{item.month}</td>
                    <td className='py-3 px-4 text-right text-[#002333]'>{formatCurrency(item.revenue)}</td>
                    <td className='py-3 px-4 text-right text-[#002333]'>{formatCurrency(item.expenses)}</td>
                    <td className='py-3 px-4 text-right font-medium text-green-600'>{formatCurrency(item.profit)}</td>
                    <td className='py-3 px-4 text-right text-[#002333]'>
                      {((item.profit / item.revenue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
