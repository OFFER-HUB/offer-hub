'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { Fee } from '@/types/financial.types'

interface AddFeeDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AddFeeDialog({ isOpen, onClose }: AddFeeDialogProps) {
  const [feeForm, setFeeForm] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    category: 'platform' as Fee['category'],
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!feeForm.name.trim()) {
      newErrors.name = 'Fee name is required'
    }

    if (feeForm.value <= 0) {
      newErrors.value = 'Fee value must be greater than 0'
    }

    if (feeForm.type === 'percentage' && feeForm.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitFee = async () => {
    if (!validateForm()) {
      return
    }

    console.log('Creating new fee:', feeForm)
    onClose()
    setFeeForm({
      name: '',
      type: 'percentage',
      value: 0,
      category: 'platform',
      isActive: true,
    })
    setErrors({})
  }

  const handleCancel = () => {
    setFeeForm({
      name: '',
      type: 'percentage',
      value: 0,
      category: 'platform',
      isActive: true,
    })
    setErrors({})
    onClose()
  }

  const isFormValid =
    feeForm.name.trim() && feeForm.value > 0 && (feeForm.type !== 'percentage' || feeForm.value <= 100)

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className='w-[calc(100vw-2rem)] max-w-md sm:w-full sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-[#002333]'>Add New Fee</DialogTitle>
          <DialogDescription>Create a new fee structure for the platform</DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='fee-name'>Fee Name</Label>
            <Input
              id='fee-name'
              value={feeForm.name}
              onChange={(e) => {
                setFeeForm((prev) => ({ ...prev, name: e.target.value }))
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: '' }))
                }
              }}
              placeholder='Enter fee name'
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor='fee-type'>Fee Type</Label>
            <Select
              value={feeForm.type}
              onValueChange={(value: 'percentage' | 'fixed') => setFeeForm((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='percentage'>Percentage</SelectItem>
                <SelectItem value='fixed'>Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='fee-value'>{feeForm.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}</Label>
            <Input
              id='fee-value'
              type='number'
              min='0'
              max={feeForm.type === 'percentage' ? '100' : undefined}
              step={feeForm.type === 'percentage' ? '0.1' : '0.01'}
              value={feeForm.value === 0 ? '' : feeForm.value}
              onChange={(e) => {
                const inputValue = e.target.value
                const numericValue = inputValue === '' ? 0 : Number.parseFloat(inputValue)
                setFeeForm((prev) => ({ ...prev, value: isNaN(numericValue) ? 0 : numericValue }))
                if (errors.value) {
                  setErrors((prev) => ({ ...prev, value: '' }))
                }
              }}
              placeholder={feeForm.type === 'percentage' ? '5.0' : '2.50'}
              className={errors.value ? 'border-red-500' : ''}
            />
            {errors.value && <p className='text-sm text-red-500 mt-1'>{errors.value}</p>}
          </div>
          <div>
            <Label htmlFor='fee-category'>Category</Label>
            <Select
              value={feeForm.category}
              onValueChange={(value: Fee['category']) => setFeeForm((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='platform'>Platform</SelectItem>
                <SelectItem value='payment_processing'>Payment Processing</SelectItem>
                <SelectItem value='withdrawal'>Withdrawal</SelectItem>
                <SelectItem value='premium'>Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center justify-between p-3 border rounded-lg bg-gray-50'>
            <div className='flex flex-col'>
              <Label htmlFor='fee-active' className='text-sm font-medium text-gray-900'>
                Fee Status
              </Label>
              <p className='text-xs text-gray-500'>
                {feeForm.isActive ? 'This fee is currently active' : 'This fee is currently inactive'}
              </p>
            </div>
            <Switch
              id='fee-active'
              checked={feeForm.isActive}
              onCheckedChange={(checked) => setFeeForm((prev) => ({ ...prev, isActive: checked }))}
              className='data-[state=checked]:bg-[#15949C]'
            />
          </div>
        </div>
        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={handleCancel} className='flex-1 bg-transparent'>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitFee}
            disabled={!isFormValid}
            className='flex-1 bg-[#15949C] hover:bg-[#15949C]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Create Fee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}