'use client'

import type React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/invoice-helpers'

interface InvoiceSummaryProps {
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  taxRate: number
}

export function InvoiceSummary  ({ subtotal, taxAmount, total, currency, taxRate }: InvoiceSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-[#002333]'>Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex justify-between text-[#002333]/80'>
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className='flex justify-between text-[#002333]/80'>
          <span>Tax ({taxRate}%):</span>
          <span>{formatCurrency(taxAmount, currency)}</span>
        </div>
        <Separator />
        <div className='flex justify-between text-lg font-bold text-[#002333]'>
          <span>Total:</span>
          <span className='text-[#15949C]'>{formatCurrency(total, currency)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
