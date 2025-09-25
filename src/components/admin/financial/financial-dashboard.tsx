'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  LucidePieChart,
  BarChart3,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts'
import { useFinancialManagement } from '@/hooks/use-financial-management'
import RevenueTracking from './revenue-tracking'
import FeeManagement from './fee-management'
import FinancialReporting from './financial-reporting'
import { DashboardSkeleton } from './skeletons/dashboard-skeleton'
import { mockRevenueDistributionData } from '@/data/mock-financial-data'

export default function FinancialDashboard() {
  const { metrics, paymentMetrics, profitabilityAnalysis, revenueStreams, loading, error, refreshData, exportData } =
    useFinancialManagement()

  const [activeTab, setActiveTab] = useState('overview')

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Format percentage values
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center gap-2 text-red-600'>
          <AlertCircle className='h-5 w-5' />
          <span>Error: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6 bg-[#DEEFE7]/10 min-h-screen'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-[#002333]'>Financial Management</h1>
          <p className='text-[#002333]/70 mt-1'>Comprehensive financial tracking and analytics for Offer Hub</p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={refreshData}
            variant='outline'
            className='border-[#15949C] text-[#15949C] hover:bg-[#DEEFE7] bg-transparent'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button onClick={() => exportData('csv', metrics)} className='bg-[#15949C] hover:bg-[#15949C]/90 text-white'>
            <Download className='h-4 w-4 mr-2' />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='border-l-4 border-l-[#15949C]'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-[#002333]'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-[#15949C]' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-[#002333]'>{formatCurrency(metrics?.totalRevenue || 0)}</div>
            <div className='flex items-center gap-1 text-xs text-green-600 mt-1'>
              <TrendingUp className='h-3 w-3' />
              <span>+{formatPercentage(metrics?.revenueGrowth || 0)} from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-orange-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-[#002333]'>Total Expenses</CardTitle>
            <CreditCard className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-[#002333]'>{formatCurrency(metrics?.totalExpenses || 0)}</div>
            <div className='flex items-center gap-1 text-xs text-orange-600 mt-1'>
              <TrendingUp className='h-3 w-3' />
              <span>+{formatPercentage(metrics?.expenseGrowth || 0)} from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-[#002333]'>Net Profit</CardTitle>
            <LucidePieChart className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-[#002333]'>{formatCurrency(metrics?.netProfit || 0)}</div>
            <div className='flex items-center gap-1 text-xs text-green-600 mt-1'>
              <span>Margin: {formatPercentage(metrics?.profitMargin || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-[#002333]'>Payment Success Rate</CardTitle>
            <BarChart3 className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-[#002333]'>
              {formatPercentage(paymentMetrics?.successRate || 0)}
            </div>
            <div className='text-xs text-[#002333]/70 mt-1'>
              {paymentMetrics?.successfulPayments || 0} successful payments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-4 bg-white border border-[#15949C]/20 h-auto'>
          <TabsTrigger
            value='overview'
            className='data-[state=active]:bg-[#15949C] data-[state=active]:text-white text-xs sm:text-sm'
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value='revenue'
            className='data-[state=active]:bg-[#15949C] data-[state=active]:text-white text-xs sm:text-sm'
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value='fees'
            className='data-[state=active]:bg-[#15949C] data-[state=active]:text-white text-xs sm:text-sm'
          >
            Fees
          </TabsTrigger>
          <TabsTrigger
            value='reports'
            className='data-[state=active]:bg-[#15949C] data-[state=active]:text-white text-xs sm:text-sm'
          >
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Revenue Breakdown */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-[#002333]'>Revenue Streams</CardTitle>
                <CardDescription>Breakdown of revenue by source</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-4'>
                  {revenueStreams && revenueStreams.length > 0 ? (
                    revenueStreams.map((stream, index) => (
                      <div key={stream.id} className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-3 h-3 rounded-full'
                            style={{ backgroundColor: mockRevenueDistributionData[index]?.fill || '#3B82F6' }}
                          />
                          <span className='text-sm font-medium text-[#002333]'>{stream.name}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-semibold text-[#002333]'>{formatCurrency(stream.amount)}</div>
                          <Badge className='bg-green-100 text-green-800'>{stream.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center text-[#002333]/70 py-8'>Loading revenue streams...</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-[#002333]'>Revenue Distribution</CardTitle>
                <CardDescription>Revenue breakdown by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-64'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <RechartsPieChart>
                      <Pie
                        data={mockRevenueDistributionData}
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey='value'
                      >
                        {mockRevenueDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className='mt-4 space-y-2'>
                  {mockRevenueDistributionData.map((item, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.fill }} />
                        <span className='text-sm text-[#002333]'>{item.name}</span>
                      </div>
                      <span className='font-medium text-[#002333]'>{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Processing */}
          <Card>
            <CardHeader>
              <CardTitle className='text-[#002333]'>Payment Processing</CardTitle>
              <CardDescription>Payment processing performance metrics</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-4 bg-[#DEEFE7]/30 rounded-lg'>
                  <div className='text-2xl font-bold text-[#002333]'>{paymentMetrics?.successfulPayments || 0}</div>
                  <div className='text-sm text-[#002333]/70'>Successful</div>
                </div>
                <div className='text-center p-4 bg-red-50 rounded-lg'>
                  <div className='text-2xl font-bold text-red-600'>{paymentMetrics?.failedPayments || 0}</div>
                  <div className='text-sm text-red-600'>Failed</div>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-[#002333]/70'>Processing Fees</span>
                  <span className='font-medium text-[#002333]'>
                    {formatCurrency(paymentMetrics?.processingFees || 0)}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-[#002333]/70'>Average Processing Time</span>
                  <span className='font-medium text-[#002333]'>{paymentMetrics?.averageProcessingTime || 0}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profitability Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className='text-[#002333]'>Profitability by Category</CardTitle>
              <CardDescription>Revenue breakdown by service categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                {profitabilityAnalysis &&
                  profitabilityAnalysis.byCategory &&
                  Object.entries(profitabilityAnalysis.byCategory).map(([category, amount]) => (
                    <div key={category} className='text-center p-4 bg-[#DEEFE7]/20 rounded-lg'>
                      <div className='text-lg font-bold text-[#002333]'>{formatCurrency(amount as number)}</div>
                      <div className='text-sm text-[#002333]/70 mt-1'>{category}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='revenue'>
          <RevenueTracking />
        </TabsContent>

        <TabsContent value='fees'>
          <FeeManagement />
        </TabsContent>

        <TabsContent value='reports'>
          <FinancialReporting />
        </TabsContent>
      </Tabs>
    </div>
  )
}
