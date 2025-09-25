'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator } from 'lucide-react'
import type { Fee } from '@/types/financial.types'

interface FeeImpactCalculatorProps {
  fees: Fee[]
  formatCurrency: (amount: number) => string
  calculateFeeImpact: (fee: Fee, transactionAmount?: number) => number
}

export function FeeImpactCalculator({ fees, formatCurrency, calculateFeeImpact }: FeeImpactCalculatorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-[#002333] flex items-center gap-2'>
          <Calculator className='h-5 w-5 text-[#15949C]' />
          Fee Impact Calculator
        </CardTitle>
        <CardDescription>Calculate the impact of fees on different transaction amounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {[100, 500, 1000, 5000].map((amount) => (
            <div key={amount} className='p-4 bg-[#DEEFE7]/20 rounded-lg'>
              <div className='text-lg font-bold text-[#002333] mb-2'>Transaction: {formatCurrency(amount)}</div>
              <div className='space-y-2'>
                {fees
                  .filter((fee) => fee.isActive)
                  .map((fee) => (
                    <div key={fee.id} className='flex justify-between text-sm'>
                      <span className='text-[#002333]/70'>{fee.name}:</span>
                      <span className='font-medium text-[#002333]'>
                        {formatCurrency(calculateFeeImpact(fee, amount))}
                      </span>
                    </div>
                  ))}
                <div className='border-t border-[#DEEFE7] pt-2 flex justify-between font-medium'>
                  <span className='text-[#002333]'>Total Fees:</span>
                  <span className='text-[#15949C]'>
                    {formatCurrency(
                      fees
                        .filter((fee) => fee.isActive)
                        .reduce((total, fee) => total + calculateFeeImpact(fee, amount), 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
