'use client'

import type React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateItemTotal, formatCurrency } from '@/utils/invoice-helpers'
import type { InvoiceItem } from '@/types/invoice.types'

interface InvoiceItemsFormProps {
  items: Omit<InvoiceItem, 'id' | 'total'>[]
  setItems: (items: Omit<InvoiceItem, 'id' | 'total'>[]) => void
  currency: string
}

export function InvoiceItemsForm({ items, setItems, currency }: InvoiceItemsFormProps) {
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof Omit<InvoiceItem, 'id' | 'total'>, value: string | number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const handleQuantityChange = (index: number, value: string) => {
    // Allow empty string temporarily for better UX while typing
    if (value === '') {
      updateItem(index, 'quantity', '')
      return
    }
    const numValue = Number.parseInt(value, 10)
    if (!isNaN(numValue) && numValue > 0) {
      updateItem(index, 'quantity', numValue)
    }
  }

  const handleUnitPriceChange = (index: number, value: string) => {
    // Allow empty string and partial decimal inputs
    if (value === '' || value === '.') {
      updateItem(index, 'unitPrice', 0) 
      return
    }
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      updateItem(index, 'unitPrice', numValue)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-[#002333]'>Invoice Items</CardTitle>
          <Button onClick={addItem} size='sm' className='bg-[#15949C] hover:bg-[#15949C]/90'>
            <Plus className='h-4 w-4 mr-2' />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {items.map((item, index) => (
          <div key={index} className='grid grid-cols-12 gap-4 items-end p-4 bg-[#DEEFE7]/20 rounded-lg'>
            <div className='col-span-12 md:col-span-5'>
              <Label>Description *</Label>
              <Input
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder='Service or product description'
              />
            </div>
            <div className='col-span-4 md:col-span-2'>
              <Label>Quantity</Label>
              <Input
                type='number'
                min='1'
                value={item.quantity}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                placeholder='1'
              />
            </div>
            <div className='col-span-4 md:col-span-2'>
              <Label>Unit Price</Label>
              <Input
                type='number'
                step='0.01'
                min='0'
                value={item.unitPrice === 0 ? '' : item.unitPrice}
                onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                placeholder='0.00'
              />
            </div>
            <div className='col-span-3 md:col-span-2'>
              <Label>Total</Label>
              <div className='text-lg font-semibold text-[#002333] py-2'>
                {formatCurrency(calculateItemTotal(item.quantity, item.unitPrice), currency)}
              </div>
            </div>
            <div className='col-span-1'>
              {items.length > 1 && (
                <Button
                  onClick={() => removeItem(index)}
                  size='sm'
                  variant='outline'
                  className='text-red-600 border-red-200 hover:bg-red-50'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}