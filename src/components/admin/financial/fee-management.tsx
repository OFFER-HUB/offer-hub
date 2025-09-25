'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useFinancialManagement } from '@/hooks/use-financial-management'
import type { Fee } from '@/types/financial.types'
import { FeeOverviewCards } from './fee-management/fee-overview-cards'
import { FeeConfigurationTable } from './fee-management/fee-configuration-table'
import { FeeImpactCalculator } from './fee-management/fee-impact-calculator'
import { AddFeeDialog } from './fee-management/add-fee-dialog'
import { FeePerformanceInsights } from './fee-management/fee-performance-insights'

export default function FeeManagement() {
  const { fees, updateFee, loading } = useFinancialManagement()
  const [editingFee, setEditingFee] = useState<Fee | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const calculateFeeImpact = (fee: Fee, transactionAmount = 1000) => {
    if (fee.type === 'percentage') {
      return (transactionAmount * fee.value) / 100
    }
    return fee.value
  }

  const handleUpdateFee = async (feeId: string, updates: Partial<Fee>) => {
    try {
      await updateFee(feeId, updates)
    } catch (error) {
      console.error('Failed to update fee:', error)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-[#002333]'>Fee Management</h2>
          <p className='text-[#002333]/70'>Configure and manage platform fees and charges</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className='bg-[#15949C] hover:bg-[#15949C]/90 text-white'>
          <Plus className='h-4 w-4 mr-2' />
          Add New Fee
        </Button>
      </div>

      {/* Fee Overview Cards */}
      <FeeOverviewCards fees={fees} />

      {/* Fee Configuration Table */}
      <FeeConfigurationTable
        fees={fees}
        onUpdateFee={handleUpdateFee}
        onEditFee={setEditingFee}
        formatCurrency={formatCurrency}
        calculateFeeImpact={calculateFeeImpact}
      />

      {/* Fee Impact Calculator */}
      <FeeImpactCalculator fees={fees} formatCurrency={formatCurrency} calculateFeeImpact={calculateFeeImpact} />

      {/* Fee Performance Insights */}
      <FeePerformanceInsights fees={fees} formatCurrency={formatCurrency} />

      {/* Add Fee Dialog */}
      <AddFeeDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  )
}
