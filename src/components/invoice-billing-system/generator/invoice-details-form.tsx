'use client'

import type React from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface InvoiceDetails {
  dueDate: string
  currency: string
  notes: string
  terms: string
  taxRate: number
}

interface InvoiceDetailsFormProps {
  invoiceDetails: InvoiceDetails
  setInvoiceDetails: (details: InvoiceDetails) => void
}

export function InvoiceDetailsForm  ({ invoiceDetails, setInvoiceDetails }: InvoiceDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-[#002333]'>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <Label htmlFor='dueDate'>Due Date *</Label>
            <Input
              id='dueDate'
              type='date'
              value={invoiceDetails.dueDate}
              onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor='currency'>Currency</Label>
            <Select
              value={invoiceDetails.currency}
              onValueChange={(value) => setInvoiceDetails({ ...invoiceDetails, currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='USD'>USD - US Dollar</SelectItem>
                <SelectItem value='EUR'>EUR - Euro</SelectItem>
                <SelectItem value='GBP'>GBP - British Pound</SelectItem>
                <SelectItem value='CAD'>CAD - Canadian Dollar</SelectItem>
                <SelectItem value='NGN'>NGN - Naira</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='taxRate'>Tax Rate (%)</Label>
            <Input
              id='taxRate'
              type='number'
              step='0.1'
              value={invoiceDetails.taxRate}
              onChange={(e) =>
                setInvoiceDetails({ ...invoiceDetails, taxRate: Number.parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
