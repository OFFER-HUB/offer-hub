'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useInvoiceManagement } from '@/hooks/use-invoice-management'
import { InvoiceTemplateRenderer } from './invoice-templates'
import { InvoiceAnalyticsCards } from './invoice-analytics-cards'
import { InvoiceFilters } from './invoice-filters'
import { InvoiceTable } from './invoice-table'
import { generateInvoicePDF } from './invoice-pdf-generator'
import { generateInvoiceReportPDF } from './invoice-report-pdf-generator'
import type { Invoice, InvoiceStatus, InvoiceFilters as IInvoiceFilters } from '@/types/invoice.types'
import { exportInvoiceData } from '@/utils/invoice-helpers'

interface InvoiceManagementProps {
  onCreateInvoice?: () => void
}

export default function InvoiceManagement({ onCreateInvoice }: InvoiceManagementProps) {
  const { invoices, loading, updateInvoice, deleteInvoice, getFilteredInvoices, getInvoiceAnalytics } =
    useInvoiceManagement()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list')

  // Filters
  const filters: IInvoiceFilters = useMemo(() => {
    const result: IInvoiceFilters = {}

    if (statusFilter !== 'all') {
      result.status = [statusFilter as InvoiceStatus]
    }

    if (searchTerm) {
      result.customer = searchTerm
    }

    return result
  }, [statusFilter, searchTerm])

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return getFilteredInvoices(filters)
  }, [getFilteredInvoices, filters])

  // Analytics
  const analytics = useMemo(() => {
    return getInvoiceAnalytics()
  }, [getInvoiceAnalytics])

  // Handle invoice actions
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setViewMode('preview')
  }

  const handleEditInvoice = (invoice: Invoice) => {
    toast.info(`Editing invoice ${invoice.invoiceNumber}`)
  }

  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      await deleteInvoice(invoice.id)
      toast.success('Invoice deleted successfully')
    } catch (error) {
      toast.error('Failed to delete invoice')
    }
  }

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: 'sent' })
      toast.success('Invoice sent successfully')
    } catch (error) {
      toast.error('Failed to send invoice')
    }
  }

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, {
        status: 'paid',
        paymentDate: new Date(),
      })
      toast.success('Invoice marked as paid')
    } catch (error) {
      toast.error('Failed to update invoice')
    }
  }

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const blob = await generateInvoicePDF(invoice)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('PDF downloaded successfully')
    } catch (error) {
      toast.error('Failed to generate PDF')
    }
  }

  const handleExportData = async (format: 'csv' | 'json' | 'pdf') => {
    if (format === 'pdf') {
      // Generate a combined PDF report of all filtered invoices
      try {
        const blob = await generateInvoiceReportPDF(filteredInvoices)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-report-${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
        URL.revokeObjectURL(url)

        toast.success('Invoice report PDF exported successfully')
      } catch (error) {
        toast.error('Failed to export PDF report')
      }
    } else {
      const data = exportInvoiceData(filteredInvoices, format)
      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoices.${format}`
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`Invoices exported as ${format.toUpperCase()}`)
    }
  }

  // Show invoice preview
  if (viewMode === 'preview' && selectedInvoice) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Button
            onClick={() => {
              setViewMode('list')
              setSelectedInvoice(null)
            }}
            variant='outline'
          >
            ← Back to List
          </Button>
          <div className='flex gap-2'>
            <Button onClick={() => handleEditInvoice(selectedInvoice)} variant='outline'>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </Button>
            <Button onClick={() => handleSendInvoice(selectedInvoice)} className='bg-[#15949C] hover:bg-[#15949C]/90'>
              <Send className='h-4 w-4 mr-2' />
              Send
            </Button>
          </div>
        </div>
        <InvoiceTemplateRenderer
          invoice={selectedInvoice}
          template={{
            id: 'modern',
            name: 'Modern',
            description: 'Clean and contemporary design',
            isDefault: true,
            colors: { primary: '#002333', secondary: '#15949C', accent: '#DEEFE7' },
            layout: 'modern',
            includeCompanyLogo: true,
            includePaymentTerms: true,
            includeNotes: true,
          }}
          onDownload={() => handleDownloadPDF(selectedInvoice)}
        />
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-[#002333]'>Invoice Management</h1>
          <p className='text-[#002333]/70 mt-1'>Manage and track all your invoices</p>
        </div>
        <Button 
          onClick={onCreateInvoice} 
          className='bg-[#15949C] hover:bg-[#15949C]/90 w-full sm:w-auto'
        >
          <Plus className='h-4 w-4 mr-2' />
          Create Invoice
        </Button>
      </div>

      {/* Analytics Cards */}
      <InvoiceAnalyticsCards analytics={analytics} />

      {/* Filters */}
      <InvoiceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onExport={handleExportData}
      />

      {/* Invoices Table */}
      <InvoiceTable
        invoices={filteredInvoices}
        loading={loading}
        onView={handleViewInvoice}
        onEdit={handleEditInvoice}
        onDelete={handleDeleteInvoice}
        onSend={handleSendInvoice}
        onMarkAsPaid={handleMarkAsPaid}
        onDownload={handleDownloadPDF}
        onCreateNew={onCreateInvoice}
      />
    </div>
  )
}