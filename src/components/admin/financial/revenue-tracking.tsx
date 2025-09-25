'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Download } from 'lucide-react'
import { useFinancialManagement } from '@/hooks/use-financial-management'
import { RevenuePieChart } from './charts/revenue-pie-chart'
import { RevenueStreamsTable } from './tables/revenue-streams-table'
import { RevenueSkeleton } from './skeletons/revenue-skeleton'

export default function RevenueTracking() {
  const { revenueStreams, metrics, loading, exportData } = useFinancialManagement()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedType, setSelectedType] = useState('all')

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Generate chart data for revenue trends
  const revenueChartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        transactions: Math.floor(Math.random() * 50) + 10,
      }
    })
    return last30Days
  }, [])

  const revenueByTypeData = useMemo(() => {
    console.log('[v0] Revenue streams for pie chart:', revenueStreams)

    const typeMap = new Map()
    revenueStreams.forEach((stream) => {
      const current = typeMap.get(stream.type) || 0
      typeMap.set(stream.type, current + stream.amount)
    })

    const colors = {
      commission: '#3B82F6', // Beautiful blue
      subscription: '#10B981', // Emerald green
      premium_features: '#F59E0B', // Amber
      advertising: '#8B5CF6', // Purple
      partnership: '#EF4444', // Red
    }

    const result = Array.from(typeMap.entries()).map(([type, amount]) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: amount,
      color: colors[type as keyof typeof colors] || '#3B82F6',
    }))

    console.log('[v0] Pie chart data:', result)
    return result
  }, [revenueStreams])

  // Filter revenue streams
  const filteredStreams = useMemo(() => {
    if (selectedType === 'all') return revenueStreams
    return revenueStreams.filter((stream) => stream.type === selectedType)
  }, [revenueStreams, selectedType])

  if (loading) {
    return <RevenueSkeleton />
  }

  return (
    <div className='space-y-6'>
      {/* Header with Filters */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-[#002333]'>Revenue Tracking</h2>
          <p className='text-[#002333]/70'>Real-time revenue monitoring and analytics</p>
        </div>
        <div className='flex gap-2'>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7d'>Last 7 days</SelectItem>
              <SelectItem value='30d'>Last 30 days</SelectItem>
              <SelectItem value='90d'>Last 90 days</SelectItem>
              <SelectItem value='1y'>Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='commission'>Commission</SelectItem>
              <SelectItem value='subscription'>Subscription</SelectItem>
              <SelectItem value='premium_features'>Premium Features</SelectItem>
              <SelectItem value='advertising'>Advertising</SelectItem>
              <SelectItem value='partnership'>Partnership</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              console.log('[v0] Export button clicked with data:', { revenueStreams: filteredStreams, metrics })
              exportData('csv', { revenueStreams: filteredStreams, metrics })
            }}
            variant='outline'
            className='border-[#3B82F6] text-[#3B82F6] hover:bg-[#DEEFE7]'
          >
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='text-[#002333] flex items-center gap-2'>
            <TrendingUp className='h-5 w-5 text-[#3B82F6]' />
            Revenue Trend
          </CardTitle>
          <CardDescription>Daily revenue over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#DEEFE7' />
                <XAxis
                  dataKey='date'
                  stroke='#002333'
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke='#002333' fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #DEEFE7',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='#3B82F6'
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution and Summary */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Revenue Distribution</CardTitle>
            <CardDescription>Revenue breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenuePieChart data={revenueByTypeData} formatCurrency={formatCurrency} />
            <div className='mt-4 space-y-2'>
              {revenueByTypeData.map((item, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                    <span className='text-sm text-[#002333]'>{item.name}</span>
                  </div>
                  <span className='font-medium text-[#002333]'>{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Revenue Summary</CardTitle>
            <CardDescription>Key revenue metrics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-4 bg-[#DEEFE7]/30 rounded-lg'>
                <div className='text-2xl font-bold text-[#002333]'>{formatCurrency(metrics?.totalRevenue || 0)}</div>
                <div className='text-sm text-[#002333]/70'>Total Revenue</div>
              </div>
              <div className='text-center p-4 bg-[#3B82F6]/10 rounded-lg'>
                <div className='text-2xl font-bold text-[#3B82F6]'>
                  {formatCurrency(metrics?.averageTransactionValue || 0)}
                </div>
                <div className='text-sm text-[#002333]/70'>Avg Transaction</div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-[#002333]/70'>Monthly Recurring Revenue</span>
                <span className='font-medium text-[#002333]'>
                  {formatCurrency(metrics?.monthlyRecurringRevenue || 0)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-[#002333]/70'>Transaction Count</span>
                <span className='font-medium text-[#002333]'>{metrics?.transactionCount || 0}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-[#002333]/70'>Success Rate</span>
                <Badge className='bg-green-100 text-green-800'>{metrics?.successRate || 0}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-[#002333]'>Recent Revenue Streams</CardTitle>
          <CardDescription>Latest revenue transactions and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueStreamsTable streams={filteredStreams} formatCurrency={formatCurrency} />
        </CardContent>
      </Card>
    </div>
  )
}
