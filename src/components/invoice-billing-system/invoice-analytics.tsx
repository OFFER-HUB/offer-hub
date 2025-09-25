'use client'

import { useState, useMemo } from 'react'
import { useInvoiceManagement } from '@/hooks/use-invoice-management'
import { InvoiceAnalyticsHeader } from './invoice-analytics-header'
import { InvoiceAnalyticsCards } from './invoice-analytics-cards'
import { InvoiceAnalyticsCharts } from './invoice-analytics-charts'

export default function InvoiceAnalytics() {
  const [timeRange, setTimeRange] = useState('1month')
  const { invoices, getInvoiceAnalytics } = useInvoiceManagement()

  const analytics = useMemo(() => getInvoiceAnalytics(timeRange), [getInvoiceAnalytics, timeRange])

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
      name: status.charAt(0).toUpperCase() + status.slice(1),
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

  return (
    <div className='space-y-8'>
      {/* Header */}
      <InvoiceAnalyticsHeader
        analytics={analytics}
        invoices={invoices}
        statusData={statusData}
        topCustomers={topCustomers}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      {/* Key Metrics */}
      <InvoiceAnalyticsCards analytics={analytics} />

      {/* Charts */}
      <InvoiceAnalyticsCharts analytics={analytics} invoices={invoices} />
    </div>
  )
}
