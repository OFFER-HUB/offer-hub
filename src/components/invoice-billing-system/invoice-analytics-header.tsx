
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { InvoiceAnalytics, Invoice } from '@/types/invoice.types'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { generateAnalyticsPDF } from './invoice-analytics-pdf-generator'

interface InvoiceAnalyticsHeaderProps {
  analytics: InvoiceAnalytics
  invoices: Invoice[]
  statusData: Array<{ name: string; value: number; color: string }>
  topCustomers: Array<{ name: string; revenue: number }>
  timeRange: string
  setTimeRange: (value: string) => void
}

export function InvoiceAnalyticsHeader({
  analytics,
  invoices,
  statusData,
  topCustomers,
  timeRange,
  setTimeRange,
}: InvoiceAnalyticsHeaderProps) {
  const handleExportAnalytics = async (format: 'json' | 'pdf') => {
    try {
      const baseData = {
        summary: {
          totalInvoices: analytics.totalInvoices,
          totalRevenue: analytics.totalRevenue,
          paidInvoices: analytics.paidInvoices,
          pendingInvoices: analytics.pendingInvoices,
          overdueInvoices: analytics.overdueInvoices,
          paymentRate: analytics.paymentRate,
          averagePaymentTime: analytics.averagePaymentTime,
        },
        monthlyRevenue: analytics.monthlyRevenue,
        statusDistribution: statusData,
        topCustomers,
        generatedAt: new Date().toISOString(),
      }

      if (format === 'pdf') {
        const blob = await generateAnalyticsPDF({
          analytics,
          statusData,
          topCustomers,
          timeRange,
        })
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-analytics-${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        
        toast.success('Analytics report exported as PDF successfully')
      } else {
        const blob = new Blob([JSON.stringify(baseData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-analytics-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        toast.success('Analytics data exported as JSON successfully')
      }
    } catch (error) {
      toast.error('Failed to export analytics data')
    }
  }

  return (
    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold text-[#002333]'>Invoice Analytics</h1>
        <p className='text-[#002333]/70 mt-1'>Track performance and insights</p>
      </div>
      <div className='flex flex-col sm:flex-row gap-2'>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className='w-full sm:w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1month'>Last Month</SelectItem>
            <SelectItem value='3months'>Last 3 Months</SelectItem>
            <SelectItem value='6months'>Last 6 Months</SelectItem>
            <SelectItem value='1year'>Last Year</SelectItem>
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='w-full sm:w-auto'>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => handleExportAnalytics('json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportAnalytics('pdf')}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}