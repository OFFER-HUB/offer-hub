import type React from 'react'
import Image from 'next/image'
import type { Invoice, InvoiceTemplate } from '@/types/invoice.types'
import { formatCurrency, formatDate } from '@/utils/invoice-helpers'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TemplateProps {
  invoice: Invoice
  template: InvoiceTemplate
}

export function ModernTemplate  ({ invoice, template }: TemplateProps) {
  return (
  <div className='bg-white p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto shadow-lg min-h-screen'>
    {/* Header */}
    <div className='flex flex-col sm:flex-row justify-between items-start mb-12 gap-6'>
      <div className='flex-1'>
        {template.includeCompanyLogo && (
          <div className='mb-6'>
              <Image
                src='/oh-logo.png'
                alt='offer-hub logo'
                width={80}
                height={80}
                className='object-contain'
                priority
              />
            
          </div>
        )}
        <h1 className='text-4xl sm:text-5xl font-bold text-[#002333] mb-2'>INVOICE</h1>
        <p className='text-[#002333]/70 text-xl'>{invoice.invoiceNumber}</p>
      </div>
      <div className='text-left sm:text-right flex-1'>
        <div className='text-[#002333] font-semibold text-lg mb-2'>{invoice.company.name}</div>
        <div className='text-[#002333]/70 space-y-1'>
          <div>{invoice.company.address.street}</div>
          <div>
            {invoice.company.address.city}, {invoice.company.address.state} {invoice.company.address.zipCode}
          </div>
          <div>{invoice.company.address.country}</div>
          <div className='mt-3 font-medium'>{invoice.company.email}</div>
        </div>
      </div>
    </div>

    {/* Invoice Details */}
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12'>
      <div>
        <h3 className='text-[#002333] font-semibold mb-4 text-lg'>Bill To:</h3>
        <div className='text-[#002333]/80 space-y-2'>
          <div className='font-medium text-lg'>{invoice.customer.name}</div>
          <div className='text-[#15949C]'>{invoice.customer.email}</div>
          <div className='mt-3 space-y-1'>
            <div>{invoice.customer.address.street}</div>
            <div>
              {invoice.customer.address.city}, {invoice.customer.address.state} {invoice.customer.address.zipCode}
            </div>
            <div>{invoice.customer.address.country}</div>
          </div>
        </div>
      </div>
      <div>
        <div className='space-y-4'>
          <div className='flex flex-col sm:flex-row sm:justify-between py-2'>
            <span className='text-[#002333]/70 font-medium'>Issue Date:</span>
            <span className='text-[#002333] font-semibold'>{formatDate(invoice.issueDate)}</span>
          </div>
          <div className='flex flex-col sm:flex-row sm:justify-between py-2'>
            <span className='text-[#002333]/70 font-medium'>Due Date:</span>
            <span className='text-[#002333] font-semibold'>{formatDate(invoice.dueDate)}</span>
          </div>
          <div className='flex flex-col sm:flex-row sm:justify-between py-2'>
            <span className='text-[#002333]/70 font-medium'>Status:</span>
            <Badge className='bg-[#DEEFE7] text-[#15949C] w-fit'>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className='mb-12'>
      {/* Desktop Table */}
      <div className='hidden md:block'>
        <div className='bg-[#DEEFE7] p-6 rounded-t-lg'>
          <div className='grid grid-cols-12 gap-4 font-semibold text-[#002333]'>
            <div className='col-span-6'>Description</div>
            <div className='col-span-2 text-center'>Quantity</div>
            <div className='col-span-2 text-center'>Unit Price</div>
            <div className='col-span-2 text-right'>Total</div>
          </div>
        </div>
        <div className='border border-t-0 rounded-b-lg'>
          {invoice.items.map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-4 p-6 ${index !== invoice.items.length - 1 ? 'border-b' : ''}`}
            >
              <div className='col-span-6 text-[#002333] font-medium'>{item.description}</div>
              <div className='col-span-2 text-center text-[#002333]/80'>{item.quantity}</div>
              <div className='col-span-2 text-center text-[#002333]/80'>
                {formatCurrency(item.unitPrice, invoice.currency)}
              </div>
              <div className='col-span-2 text-right text-[#002333] font-semibold'>
                {formatCurrency(item.total, invoice.currency)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className='md:hidden space-y-4'>
        {invoice.items.map((item) => (
          <div key={item.id} className='border rounded-lg p-4 space-y-3'>
            <div className='font-medium text-[#002333]'>{item.description}</div>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-[#002333]/70'>Qty: </span>
                <span className='text-[#002333]'>{item.quantity}</span>
              </div>
              <div>
                <span className='text-[#002333]/70'>Rate: </span>
                <span className='text-[#002333]'>{formatCurrency(item.unitPrice, invoice.currency)}</span>
              </div>
            </div>
            <div className='text-right'>
              <span className='text-[#002333] font-semibold text-lg'>
                {formatCurrency(item.total, invoice.currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Totals */}
    <div className='flex justify-end mb-12'>
      <div className='w-full sm:w-96'>
        <div className='space-y-4 p-6 bg-gray-50 rounded-lg'>
          <div className='flex justify-between text-[#002333]/80'>
            <span className='font-medium'>Subtotal:</span>
            <span className='font-semibold'>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          <div className='flex justify-between text-[#002333]/80'>
            <span className='font-medium'>Tax:</span>
            <span className='font-semibold'>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          <Separator />
          <div className='flex justify-between text-xl font-bold text-[#002333]'>
            <span>Total:</span>
            <span className='text-[#15949C]'>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Notes and Terms */}
    {template.includeNotes && invoice.notes && (
      <div className='mb-8'>
        <h4 className='text-[#002333] font-semibold mb-3 text-lg'>Notes:</h4>
        <p className='text-[#002333]/80 leading-relaxed'>{invoice.notes}</p>
      </div>
    )}

    {template.includePaymentTerms && invoice.terms && (
      <div className='mb-8'>
        <h4 className='text-[#002333] font-semibold mb-3 text-lg'>Payment Terms:</h4>
        <p className='text-[#002333]/80 leading-relaxed'>{invoice.terms}</p>
      </div>
    )}

    {/* Footer */}
    <div className='text-center text-[#002333]/60 border-t pt-6 mt-8'>
      <p className='text-lg'>Thank you for your business!</p>
    </div>
  </div>
)

}