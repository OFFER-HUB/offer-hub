'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatDate, getInvoiceStatusColor, getInvoiceStatusLabel } from '@/utils/invoice-helpers'
import type { Invoice, InvoiceAnalytics } from '@/types/invoice.types'

interface InvoiceAnalyticsChartsProps {
  analytics: InvoiceAnalytics
  invoices: Invoice[]
}

export function InvoiceAnalyticsCharts({ analytics, invoices }: InvoiceAnalyticsChartsProps) {
  // Status distribution data for pie chart
  const statusData = useMemo(() => {
    const statusCounts = invoices.reduce(
      (acc, invoice) => {
        acc[invoice.status] = (acc[invoice.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getInvoiceStatusLabel(status as any),
      value: count,
      color: status === 'paid' ? '#15949C' : status === 'overdue' ? '#ef4444' : '#002333',
    }))
  }, [invoices])

  // Top customers data
  const topCustomers = useMemo(() => {
    const customerRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce(
        (acc, invoice) => {
          const customer = invoice.customer.name
          acc[customer] = (acc[customer] || 0) + invoice.total
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(customerRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }))
  }, [invoices])

  // Payment trends data
  const paymentTrends = useMemo(() => {
    const trends = analytics.monthlyRevenue.map((month) => ({
      ...month,
      paymentRate: month.invoiceCount > 0 ? (month.revenue / (month.invoiceCount * 1000)) * 100 : 0,
    }))
    return trends
  }, [analytics.monthlyRevenue])

  return (
    <>
      {/* Charts Row 1 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray='3 3' stroke='#002333' strokeOpacity={0.1} />
                <XAxis dataKey='month' stroke='#002333' strokeOpacity={0.7} />
                <YAxis stroke='#002333' strokeOpacity={0.7} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #DEEFE7',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                />
                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='#15949C'
                  strokeWidth={3}
                  dot={{ fill: '#15949C', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#15949C', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Invoice Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Invoices']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Monthly Invoice Count */}
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Monthly Invoice Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray='3 3' stroke='#002333' strokeOpacity={0.1} />
                <XAxis dataKey='month' stroke='#002333' strokeOpacity={0.7} />
                <YAxis stroke='#002333' strokeOpacity={0.7} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #DEEFE7',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [value, 'Invoices']}
                />
                <Bar dataKey='invoiceCount' fill='#15949C' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Payment Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={paymentTrends}>
                <CartesianGrid strokeDasharray='3 3' stroke='#002333' strokeOpacity={0.1} />
                <XAxis dataKey='month' stroke='#002333' strokeOpacity={0.7} />
                <YAxis stroke='#002333' strokeOpacity={0.7} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #DEEFE7',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'paymentRate' ? `${value.toFixed(1)}%` : value,
                    name === 'paymentRate' ? 'Payment Rate' : 'Revenue',
                  ]}
                />
                <Line
                  type='monotone'
                  dataKey='paymentRate'
                  stroke='#002333'
                  strokeWidth={2}
                  dot={{ fill: '#002333', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Top Customers</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {topCustomers.map((customer, index) => (
              <div key={customer.name} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-[#DEEFE7] rounded-full flex items-center justify-center text-sm font-medium text-[#15949C]'>
                    {index + 1}
                  </div>
                  <div>
                    <div className='font-medium text-[#002333]'>{customer.name}</div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-semibold text-[#002333]'>{formatCurrency(customer.revenue)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-[#15949C] rounded-full'></div>
                  <div>
                    <div className='font-medium text-[#002333] text-sm'>{invoice.invoiceNumber}</div>
                    <div className='text-xs text-[#002333]/70'>{invoice.customer.name}</div>
                  </div>
                </div>
                <div className='text-right'>
                  <Badge className={getInvoiceStatusColor(invoice.status)}>
                    {getInvoiceStatusLabel(invoice.status)}
                  </Badge>
                  <div className='text-xs text-[#002333]/70 mt-1'>{formatDate(invoice.issueDate)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className='text-[#002333]'>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-[#002333]/70'>Collection Rate</span>
                <span className='font-medium text-[#002333]'>{analytics.paymentRate.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.paymentRate} className='h-2' />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-[#002333]/70'>Overdue Rate</span>
                <span className='font-medium text-red-600'>
                  {((analytics.overdueInvoices / analytics.totalInvoices) * 100).toFixed(1)}%
                </span>
              </div>
            <Progress
  value={(analytics.overdueInvoices / analytics.totalInvoices) * 100}
  className='h-2 [&>div]:bg-red-500'
/>
            </div>

            <div className='pt-4 border-t border-[#002333]/10'>
              <div className='text-sm text-[#002333]/70 mb-2'>This Month</div>
              <div className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span>Invoices Sent</span>
                  <span className='font-medium text-[#002333]'>
                    {analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1]?.invoiceCount || 0}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Revenue</span>
                  <span className='font-medium text-[#002333]'>
                    {formatCurrency(analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1]?.revenue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
