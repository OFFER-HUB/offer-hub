
import type React from 'react'
import type { Invoice, InvoiceTemplate } from '@/types/invoice.types'
import { formatCurrency, formatDate } from '@/utils/invoice-helpers'
import { Badge } from '@/components/ui/badge'

interface TemplateProps {
  invoice: Invoice
  template: InvoiceTemplate
}

export function ClassicTemplate  ({ invoice, template }: TemplateProps) {
  return (
  <div className='bg-white p-8 max-w-4xl mx-auto shadow-lg border'>
    {/* Header */}
    <div className='text-center mb-8 border-b-2 border-[#002333] pb-4'>
      <h1 className='text-4xl font-bold text-[#002333] mb-2'>INVOICE</h1>
      <p className='text-[#002333]/70'>{invoice.invoiceNumber}</p>
    </div>

    {/* Company and Customer Info */}
    <div className='grid grid-cols-2 gap-8 mb-8'>
      <div>
        <h3 className='text-[#002333] font-bold mb-3 border-b border-[#002333]/20 pb-1'>FROM:</h3>
        <div className='text-[#002333]'>
          <div className='font-semibold text-lg'>{invoice.company.name}</div>
          <div className='mt-2 text-sm'>
            <div>{invoice.company.address.street}</div>
            <div>
              {invoice.company.address.city}, {invoice.company.address.state} {invoice.company.address.zipCode}
            </div>
            <div>{invoice.company.address.country}</div>
            <div className='mt-1'>{invoice.company.email}</div>
          </div>
        </div>
      </div>
      <div>
        <h3 className='text-[#002333] font-bold mb-3 border-b border-[#002333]/20 pb-1'>TO:</h3>
        <div className='text-[#002333]'>
          <div className='font-semibold text-lg'>{invoice.customer.name}</div>
          <div className='mt-2 text-sm'>
            <div>{invoice.customer.email}</div>
            <div className='mt-1'>
              <div>{invoice.customer.address.street}</div>
              <div>
                {invoice.customer.address.city}, {invoice.customer.address.state} {invoice.customer.address.zipCode}
              </div>
              <div>{invoice.customer.address.country}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Invoice Details */}
    <div className='grid grid-cols-3 gap-4 mb-8 bg-[#DEEFE7]/30 p-4 rounded'>
      <div>
        <div className='text-[#002333]/70 text-sm'>Issue Date</div>
        <div className='text-[#002333] font-medium'>{formatDate(invoice.issueDate)}</div>
      </div>
      <div>
        <div className='text-[#002333]/70 text-sm'>Due Date</div>
        <div className='text-[#002333] font-medium'>{formatDate(invoice.dueDate)}</div>
      </div>
      <div>
        <div className='text-[#002333]/70 text-sm'>Status</div>
        <Badge className='bg-[#15949C] text-white'>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      </div>
    </div>

    {/* Items Table */}
    <table className='w-full mb-8 border border-[#002333]/20'>
      <thead>
        <tr className='bg-[#002333] text-white'>
          <th className='text-left p-3 font-semibold'>Description</th>
          <th className='text-center p-3 font-semibold'>Qty</th>
          <th className='text-center p-3 font-semibold'>Unit Price</th>
          <th className='text-right p-3 font-semibold'>Total</th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((item, index) => (
          <tr key={item.id} className={index % 2 === 0 ? 'bg-[#DEEFE7]/20' : 'bg-white'}>
            <td className='p-3 text-[#002333]'>{item.description}</td>
            <td className='p-3 text-center text-[#002333]/80'>{item.quantity}</td>
            <td className='p-3 text-center text-[#002333]/80'>{formatCurrency(item.unitPrice, invoice.currency)}</td>
            <td className='p-3 text-right text-[#002333] font-medium'>
              {formatCurrency(item.total, invoice.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Totals */}
    <div className='flex justify-end mb-8'>
      <div className='w-80 border border-[#002333]/20 p-4'>
        <div className='space-y-2'>
          <div className='flex justify-between text-[#002333]'>
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          <div className='flex justify-between text-[#002333]'>
            <span>Tax:</span>
            <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          <div className='border-t border-[#002333]/20 pt-2 flex justify-between text-lg font-bold text-[#002333]'>
            <span>TOTAL:</span>
            <span>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Notes and Terms */}
    {template.includeNotes && invoice.notes && (
      <div className='mb-6 border-t border-[#002333]/20 pt-4'>
        <h4 className='text-[#002333] font-bold mb-2'>NOTES:</h4>
        <p className='text-[#002333]/80'>{invoice.notes}</p>
      </div>
    )}

    {template.includePaymentTerms && invoice.terms && (
      <div className='mb-6'>
        <h4 className='text-[#002333] font-bold mb-2'>PAYMENT TERMS:</h4>
        <p className='text-[#002333]/80'>{invoice.terms}</p>
      </div>
    )}
  </div>
)
}