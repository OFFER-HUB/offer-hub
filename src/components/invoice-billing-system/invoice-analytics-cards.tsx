
import { DollarSign, FileText, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { InvoiceAnalytics } from '@/types/invoice.types'
import { formatCurrency } from '@/utils/invoice-helpers'

interface InvoiceAnalyticsCardsProps {
  analytics: InvoiceAnalytics
}

export function InvoiceAnalyticsCards({ analytics }: InvoiceAnalyticsCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[#002333]/70 text-sm font-medium'>Total Invoices</p>
              <p className='text-2xl font-bold text-[#002333]'>{analytics.totalInvoices}</p>
            </div>
            <div className='w-12 h-12 bg-[#DEEFE7] rounded-lg flex items-center justify-center'>
              <FileText className='h-6 w-6 text-[#15949C]' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[#002333]/70 text-sm font-medium'>Total Revenue</p>
              <p className='text-2xl font-bold text-[#002333]'>{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            <div className='w-12 h-12 bg-[#DEEFE7] rounded-lg flex items-center justify-center'>
              <DollarSign className='h-6 w-6 text-[#15949C]' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[#002333]/70 text-sm font-medium'>Paid Invoices</p>
              <p className='text-2xl font-bold text-[#002333]'>{analytics.paidInvoices}</p>
              <p className='text-sm text-green-600'>{analytics.paymentRate.toFixed(1)}% payment rate</p>
            </div>
            <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
              <DollarSign className='h-6 w-6 text-green-600' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[#002333]/70 text-sm font-medium'>Overdue</p>
              <p className='text-2xl font-bold text-red-600'>{analytics.overdueInvoices}</p>
              <p className='text-sm text-[#002333]/70'>Avg: {analytics.averagePaymentTime.toFixed(0)} days</p>
            </div>
            <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
              <Clock className='h-6 w-6 text-red-600' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
