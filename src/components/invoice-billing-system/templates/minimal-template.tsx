
import type React from 'react'
import type { Invoice, InvoiceTemplate } from '@/types/invoice.types'
import { formatCurrency, formatDate } from '@/utils/invoice-helpers'

interface TemplateProps {
  invoice: Invoice
  template: InvoiceTemplate
}

export function MinimalTemplate  ({ invoice, template }: TemplateProps) {
  return (
  <div className='bg-white p-8 max-w-4xl mx-auto'>
    {/* Header */}
    <div className='flex justify-between items-center mb-12'>
      <div>
        <h1 className='text-2xl font-light text-[#002333]'>Invoice</h1>
        <p className='text-[#002333]/60 mt-1'>{invoice.invoiceNumber}</p>
      </div>
      <div className='text-right text-sm text-[#002333]/80'>
        <div>{formatDate(invoice.issueDate)}</div>
        <div>Due: {formatDate(invoice.dueDate)}</div>
      </div>
    </div>

    {/* Addresses */}
    <div className='grid grid-cols-2 gap-12 mb-12'>
      <div>
        <div className='text-[#002333] font-medium'>{invoice.company.name}</div>
        <div className='text-[#002333]/60 text-sm mt-1'>
          <div>{invoice.company.address.street}</div>
          <div>
            {invoice.company.address.city}, {invoice.company.address.state}
          </div>
          <div>{invoice.company.email}</div>
        </div>
      </div>
      <div>
        <div className='text-[#002333] font-medium'>{invoice.customer.name}</div>
        <div className='text-[#002333]/60 text-sm mt-1'>
          <div>{invoice.customer.email}</div>
          <div>{invoice.customer.address.street}</div>
          <div>
            {invoice.customer.address.city}, {invoice.customer.address.state}
          </div>
        </div>
      </div>
    </div>

    {/* Items */}
    <div className='mb-12'>
      {invoice.items.map((item, index) => (
        <div
          key={item.id}
          className={`flex justify-between items-center py-3 ${index !== invoice.items.length - 1 ? 'border-b border-[#002333]/10' : ''}`}
        >
          <div className='flex-1'>
            <div className='text-[#002333]'>{item.description}</div>
            <div className='text-[#002333]/60 text-sm'>
              {item.quantity} × {formatCurrency(item.unitPrice, invoice.currency)}
            </div>
          </div>
          <div className='text-[#002333] font-medium'>{formatCurrency(item.total, invoice.currency)}</div>
        </div>
      ))}
    </div>

    {/* Total */}
    <div className='flex justify-end'>
      <div className='w-64'>
        <div className='flex justify-between py-2 text-[#002333]/80'>
          <span>Subtotal</span>
          <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        <div className='flex justify-between py-2 text-[#002333]/80'>
          <span>Tax</span>
          <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
        </div>
        <div className='flex justify-between py-3 border-t border-[#002333]/20 text-lg font-medium text-[#002333]'>
          <span>Total</span>
          <span>{formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      </div>
    </div>

    {/* Notes */}
    {template.includeNotes && invoice.notes && (
      <div className='mt-12 pt-6 border-t border-[#002333]/10'>
        <p className='text-[#002333]/70 text-sm'>{invoice.notes}</p>
      </div>
    )}
  </div>
)
}