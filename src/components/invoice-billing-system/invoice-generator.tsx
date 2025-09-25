'use client'

import { useState, useCallback } from 'react'
import { Save, Send, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { InvoiceTemplateRenderer } from './invoice-templates'
import { InvoiceTemplateSelector } from './invoice-template-selector'
import { CustomerInfoForm } from './generator/customer-info-form'
import { InvoiceDetailsForm } from './generator/invoice-details-form'
import { InvoiceItemsForm } from './generator/invoice-items-form'
import { InvoiceSummary } from './generator/invoice-summary'
import type { CreateInvoiceRequest, InvoiceItem, InvoiceTemplate, Invoice } from '@/types/invoice.types'
import {
  calculateItemTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateInvoiceTotal,
  validateInvoiceData,
} from '@/utils/invoice-helpers'
import { generateInvoicePDF } from './invoice-pdf-generator'

interface InvoiceGeneratorProps {
  onInvoiceCreated?: (invoice: Invoice) => void
  initialData?: Partial<CreateInvoiceRequest>
}

export default function InvoiceGenerator({ onInvoiceCreated, initialData }: InvoiceGeneratorProps) {
  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: initialData?.customerId || '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
  })

  const [invoiceDetails, setInvoiceDetails] = useState({
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',
    notes: '',
    terms: 'Payment is due within 30 days of invoice date.',
    taxRate: 8.5,
  })

  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'total'>[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ])

  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>({
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design',
    isDefault: true,
    colors: { primary: '#002333', secondary: '#15949C', accent: '#DEEFE7' },
    layout: 'modern',
    includeCompanyLogo: true,
    includePaymentTerms: true,
    includeNotes: true,
  })

  const [showPreview, setShowPreview] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)

  // Calculate totals
  const itemsWithTotals = items.map((item) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    total: calculateItemTotal(item.quantity, item.unitPrice),
  }))

  const subtotal = calculateSubtotal(itemsWithTotals)
  const taxAmount = calculateTaxAmount(subtotal, invoiceDetails.taxRate)
  const total = calculateInvoiceTotal(subtotal, taxAmount)

  // Generate preview invoice
  const generatePreviewInvoice = useCallback((): Invoice => {
    return {
      id: 'preview',
      invoiceNumber: 'PREVIEW-001',
      status: 'draft',
      customer: {
        id: 'preview-customer',
        name: customerInfo.name || 'Legend4tech',
        email: customerInfo.email || 'customer@example.com',
        address: customerInfo.address,
      },
      company: {
        name: 'Offer Hub',
        email: 'billing@offerhub.com',
        address: {
          street: '456 Business Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA',
        },
      },
      items: itemsWithTotals,
      subtotal,
      taxAmount,
      total,
      currency: invoiceDetails.currency,
      dueDate: new Date(invoiceDetails.dueDate),
      issueDate: new Date(),
      notes: invoiceDetails.notes,
      terms: invoiceDetails.terms,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }, [customerInfo, itemsWithTotals, subtotal, taxAmount, total, invoiceDetails])

  // Preview invoice
  const handlePreview = useCallback(() => {
    const preview = generatePreviewInvoice()
    setPreviewInvoice(preview)
    setShowPreview(true)
  }, [generatePreviewInvoice])

  // Save as draft
  const handleSaveDraft = useCallback(async () => {
    try {
      const errors = validateInvoiceData({
        customer: { name: customerInfo.name, email: customerInfo.email },
        items: itemsWithTotals,
        dueDate: new Date(invoiceDetails.dueDate),
      } as any)

      if (errors.length > 0) {
        toast.error('Validation Error', {
          description: errors[0],
        })
        return
      }

      toast.success('Invoice saved as draft successfully')
    } catch (error) {
      toast.error('Failed to save invoice')
    }
  }, [customerInfo, itemsWithTotals, invoiceDetails])

  
// Download PDF handler
  const handleDownloadPDF = useCallback(async (invoice: Invoice) => {
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
}, [])

  if (showPreview && previewInvoice) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-[#002333]'>Invoice Preview</h2>
          <Button onClick={() => setShowPreview(false)} variant='outline'>
            Back to Editor
          </Button>
        </div>
        <InvoiceTemplateRenderer
          invoice={previewInvoice}
          template={selectedTemplate}
          onDownload={() => handleDownloadPDF(previewInvoice)}

        />
      </div>
    )
  }

  return (
    <div className='space-y-6 md:space-y-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <h2 className='text-2xl md:text-3xl font-bold text-[#002333]'>Create Invoice</h2>
        <div className='flex flex-col sm:flex-row gap-2'>
          <Button onClick={handlePreview} variant='outline' className='border-[#15949C] text-[#15949C] bg-transparent w-full sm:w-auto'>
            <Eye className='h-4 w-4 mr-2' />
            Preview
          </Button>
          <Button onClick={handleSaveDraft} variant='outline' className='w-full sm:w-auto'>
            <Save className='h-4 w-4 mr-2' />
            Save Draft
          </Button>
          <Button onClick={handleSaveDraft} className='bg-[#15949C] hover:bg-[#15949C]/90 w-full sm:w-auto'>
            <Send className='h-4 w-4 mr-2' />
            Send Invoice
          </Button>
        </div>
      </div>

      {/* Mobile-first layout - Stack everything on mobile, grid on desktop */}
      <div className='space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8'>
        
        {/* Main Form - Full width on mobile, 2/3 on desktop */}
        <div className='space-y-6 lg:col-span-2'>
          <CustomerInfoForm customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} />
          <InvoiceDetailsForm invoiceDetails={invoiceDetails} setInvoiceDetails={setInvoiceDetails} />
          <InvoiceItemsForm items={items} setItems={setItems} currency={invoiceDetails.currency} />

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle className='text-[#002333]'>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  value={invoiceDetails.notes}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, notes: e.target.value })}
                  placeholder='Any additional notes for the customer'
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor='terms'>Payment Terms</Label>
                <Textarea
                  id='terms'
                  value={invoiceDetails.terms}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, terms: e.target.value })}
                  placeholder='Payment terms and conditions'
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Full width on mobile, 1/3 on desktop with better spacing */}
        <div className='space-y-6 lg:col-span-1'>
          {/* Invoice Summary */}
          <InvoiceSummary
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
            currency={invoiceDetails.currency}
            taxRate={invoiceDetails.taxRate}
          />

          {/* Template Selection - Better mobile spacing */}
          <Card>
            <CardHeader className='pb-4'>
              <CardTitle className='text-[#002333] text-lg'>Invoice Template</CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-4'>
                <InvoiceTemplateSelector 
                  selectedTemplate={selectedTemplate} 
                  onTemplateSelect={setSelectedTemplate} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}