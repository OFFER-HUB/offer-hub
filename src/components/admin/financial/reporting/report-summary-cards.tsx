'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, BarChart3, TrendingUp, PieChartIcon } from 'lucide-react'

interface ReportSummaryCardsProps {
  metrics: any
  formatCurrency: (amount: number) => string
}

export function ReportSummaryCards({ metrics, formatCurrency }: ReportSummaryCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
      <Card className='border-l-4 border-l-[#15949C]'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-[#002333]'>Total Revenue</CardTitle>
          <DollarSign className='h-4 w-4 text-[#15949C]' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-[#002333]'>{formatCurrency(metrics?.totalRevenue || 0)}</div>
          <div className='flex items-center gap-1 text-xs text-green-600 mt-1'>
            <TrendingUp className='h-3 w-3' />
            <span>+{metrics?.revenueGrowth || 0}% vs last period</span>
          </div>
        </CardContent>
      </Card>

      <Card className='border-l-4 border-l-orange-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-[#002333]'>Total Expenses</CardTitle>
          <BarChart3 className='h-4 w-4 text-orange-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-[#002333]'>{formatCurrency(metrics?.totalExpenses || 0)}</div>
          <div className='flex items-center gap-1 text-xs text-orange-600 mt-1'>
            <TrendingUp className='h-3 w-3' />
            <span>+{metrics?.expenseGrowth || 0}% vs last period</span>
          </div>
        </CardContent>
      </Card>

      <Card className='border-l-4 border-l-green-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-[#002333]'>Net Profit</CardTitle>
          <TrendingUp className='h-4 w-4 text-green-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-[#002333]'>{formatCurrency(metrics?.netProfit || 0)}</div>
          <div className='text-xs text-[#002333]/70 mt-1'>Margin: {metrics?.profitMargin?.toFixed(1) || 0}%</div>
        </CardContent>
      </Card>

      <Card className='border-l-4 border-l-blue-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-[#002333]'>Avg Transaction</CardTitle>
          <PieChartIcon className='h-4 w-4 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-[#002333]'>
            {formatCurrency(metrics?.averageTransactionValue || 0)}
          </div>
          <div className='text-xs text-[#002333]/70 mt-1'>{metrics?.transactionCount || 0} transactions</div>
        </CardContent>
      </Card>
    </div>
  )
}
