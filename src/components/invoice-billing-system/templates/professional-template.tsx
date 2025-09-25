import type React from 'react'
import Image from 'next/image'
import type { Invoice, InvoiceTemplate } from '@/types/invoice.types'
import { formatCurrency, formatDate } from '@/utils/invoice-helpers'
import { Badge } from '@/components/ui/badge'

interface TemplateProps {
  invoice: Invoice
  template: InvoiceTemplate
}

export function ProfessionalTemplate  ({ invoice, template }: TemplateProps) {
  return (
  <div className='bg-white max-w-4xl mx-auto'>
    {/* Header with gradient */}
    <div className='bg-gradient-to-r from-[#002333] to-[#15949C] text-white p-8'>
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-4xl font-bold mb-2'>INVOICE</h1>
          <p className='text-white/80 text-lg'>{invoice.invoiceNumber}</p>
        </div>
        {template.includeCompanyLogo && (
        
            
                <Image
                             src='/oh-logo.png'
                             alt='offer-hub logo'
                             width={80}
                             height={80}
                             className='object-contain'
                             priority
                           />
            
          
        )}
      </div>
    </div>

    <div className='p-8'>
      {/* Company and Customer Info */}
      <div className='grid grid-cols-2 gap-8 mb-8'>
        <div>
          <h3 className='text-[#15949C] font-bold mb-3 text-lg'>From</h3>
          <div className='text-[#002333]'>
            <div className='font-bold text-xl'>{invoice.company.name}</div>
            <div className='mt-2 text-[#002333]/80'>
              <div>{invoice.company.address.street}</div>
              <div>
                {invoice.company.address.city}, {invoice.company.address.state} {invoice.company.address.zipCode}
              </div>
              <div>{invoice.company.address.country}</div>
              <div className='mt-2'>{invoice.company.email}</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className='text-[#15949C] font-bold mb-3 text-lg'>To</h3>
          <div className='text-[#002333]'>
            <div className='font-bold text-xl'>{invoice.customer.name}</div>
            <div className='mt-2 text-[#002333]/80'>
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
      <div className='bg-[#DEEFE7]/50 p-6 rounded-lg mb-8'>
        <div className='grid grid-cols-3 gap-6'>
          <div>
            <div className='text-[#002333]/70 text-sm font-medium'>ISSUE DATE</div>
            <div className='text-[#002333] font-bold text-lg'>{formatDate(invoice.issueDate)}</div>
          </div>
          <div>
            <div className='text-[#002333]/70 text-sm font-medium'>DUE DATE</div>
            <div className='text-[#002333] font-bold text-lg'>{formatDate(invoice.dueDate)}</div>
          </div>
          <div>
            <div className='text-[#002333]/70 text-sm font-medium'>STATUS</div>
            <Badge className='bg-[#15949C] text-white font-medium'>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className='mb-8'>
        <div className='bg-[#002333] text-white p-4 rounded-t-lg'>
          <div className='grid grid-cols-12 gap-4 font-bold'>
            <div className='col-span-6'>DESCRIPTION</div>
            <div className='col-span-2 text-center'>QTY</div>
            <div className='col-span-2 text-center'>RATE</div>
            <div className='col-span-2 text-right'>AMOUNT</div>
          </div>
        </div>
        <div className='border-x border-b border-[#002333]/20 rounded-b-lg'>
          {invoice.items.map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-4 p-4 ${index % 2 === 0 ? 'bg-[#DEEFE7]/20' : 'bg-white'}`}
            >
              <div className='col-span-6 text-[#002333] font-medium'>{item.description}</div>
              <div className='col-span-2 text-center text-[#002333]/80'>{item.quantity}</div>
              <div className='col-span-2 text-center text-[#002333]/80'>
                {formatCurrency(item.unitPrice, invoice.currency)}
              </div>
              <div className='col-span-2 text-right text-[#002333] font-bold'>
                {formatCurrency(item.total, invoice.currency)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className='flex justify-end mb-8'>
        <div className='w-80 bg-[#DEEFE7]/30 p-6 rounded-lg'>
          <div className='space-y-3'>
            <div className='flex justify-between text-[#002333]'>
              <span className='font-medium'>Subtotal:</span>
              <span className='font-bold'>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className='flex justify-between text-[#002333]'>
              <span className='font-medium'>Tax:</span>
              <span className='font-bold'>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
            <div className='border-t-2 border-[#15949C] pt-3 flex justify-between text-xl font-bold text-[#002333]'>
              <span>TOTAL:</span>
              <span className='text-[#15949C]'>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {template.includeNotes && invoice.notes && (
        <div className='mb-6 p-4 bg-[#DEEFE7]/20 rounded-lg'>
          <h4 className='text-[#002333] font-bold mb-2'>Notes:</h4>
          <p className='text-[#002333]/80'>{invoice.notes}</p>
        </div>
      )}

      {template.includePaymentTerms && invoice.terms && (
        <div className='mb-6 p-4 bg-[#DEEFE7]/20 rounded-lg'>
          <h4 className='text-[#002333] font-bold mb-2'>Payment Terms:</h4>
          <p className='text-[#002333]/80'>{invoice.terms}</p>
        </div>
      )}

      {/* Footer */}
      <div className='text-center text-[#002333]/60 text-sm border-t border-[#002333]/10 pt-6'>
        <p>Thank you for choosing {invoice.company.name}</p>
      </div>
    </div>
  </div>

)
}