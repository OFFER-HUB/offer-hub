
import type React from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CustomerInfo {
  name: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo
  setCustomerInfo: (info: CustomerInfo) => void
}

export function CustomerInfoForm  ({ customerInfo, setCustomerInfo }: CustomerInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-[#002333]'>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='customerName'>Customer Name *</Label>
            <Input
              id='customerName'
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder='Enter customer name'
            />
          </div>
          <div>
            <Label htmlFor='customerEmail'>Email Address *</Label>
            <Input
              id='customerEmail'
              type='email'
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              placeholder='customer@example.com'
            />
          </div>
        </div>

        <div className='space-y-4'>
          <Label>Billing Address</Label>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='md:col-span-2'>
              <Input
                value={customerInfo.address.street}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    address: { ...customerInfo.address, street: e.target.value },
                  })
                }
                placeholder='Street address'
              />
            </div>
            <Input
              value={customerInfo.address.city}
              onChange={(e) =>
                setCustomerInfo({
                  ...customerInfo,
                  address: { ...customerInfo.address, city: e.target.value },
                })
              }
              placeholder='City'
            />
            <Input
              value={customerInfo.address.state}
              onChange={(e) =>
                setCustomerInfo({
                  ...customerInfo,
                  address: { ...customerInfo.address, state: e.target.value },
                })
              }
              placeholder='State'
            />
            <Input
              value={customerInfo.address.zipCode}
              onChange={(e) =>
                setCustomerInfo({
                  ...customerInfo,
                  address: { ...customerInfo.address, zipCode: e.target.value },
                })
              }
              placeholder='ZIP Code'
            />
            <Select
              value={customerInfo.address.country}
              onValueChange={(value) =>
                setCustomerInfo({
                  ...customerInfo,
                  address: { ...customerInfo.address, country: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='USA'>United States</SelectItem>
                <SelectItem value='CAN'>Canada</SelectItem>
                <SelectItem value='GBR'>United Kingdom</SelectItem>
                <SelectItem value='AUS'>Australia</SelectItem>
                <SelectItem value='NGN'>Nigeria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
