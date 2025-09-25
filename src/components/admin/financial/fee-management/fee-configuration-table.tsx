'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Edit, Trash2 } from 'lucide-react'
import type { Fee } from '@/types/financial.types'

interface FeeConfigurationTableProps {
  fees: Fee[]
  onUpdateFee: (feeId: string, updates: Partial<Fee>) => Promise<void>
  onEditFee: (fee: Fee) => void
  formatCurrency: (amount: number) => string
  calculateFeeImpact: (fee: Fee, transactionAmount?: number) => number
}

export function FeeConfigurationTable({
  fees,
  onUpdateFee,
  onEditFee,
  formatCurrency,
  calculateFeeImpact,
}: FeeConfigurationTableProps) {
  const getCategoryColor = (category: Fee['category']) => {
    const colors = {
      platform: 'bg-[#15949C]/10 text-[#15949C]',
      payment_processing: 'bg-blue-100 text-blue-800',
      withdrawal: 'bg-orange-100 text-orange-800',
      premium: 'bg-purple-100 text-purple-800',
    }
    return colors[category] || colors.platform
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-[#002333]'>Fee Configuration</CardTitle>
        <CardDescription>Manage all platform fees and their settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-[#DEEFE7]'>
                <th className='text-left py-3 px-4 font-medium text-[#002333]'>Fee Name</th>
                <th className='text-left py-3 px-4 font-medium text-[#002333]'>Type</th>
                <th className='text-left py-3 px-4 font-medium text-[#002333]'>Value</th>
                <th className='text-left py-3 px-4 font-medium text-[#002333]'>Category</th>
                <th className='text-left py-3 px-4 font-medium text-[#002333]'>Status</th>
                <th className='text-left py-3 px-4 font-medium text-[#002333]'>Impact</th>
                <th className='text-left py-3 px-4 font-medium text-[#002333]'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id} className='border-b border-[#DEEFE7]/50 hover:bg-[#DEEFE7]/20'>
                  <td className='py-3 px-4 font-medium text-[#002333]'>{fee.name}</td>
                  <td className='py-3 px-4'>
                    <Badge variant='outline' className='border-[#15949C] text-[#15949C]'>
                      {fee.type}
                    </Badge>
                  </td>
                  <td className='py-3 px-4 text-[#002333]'>
                    {fee.type === 'percentage' ? `${fee.value}%` : formatCurrency(fee.value)}
                  </td>
                  <td className='py-3 px-4'>
                    <Badge className={getCategoryColor(fee.category)}>{fee.category.replace('_', ' ')}</Badge>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-2'>
                      <Switch
                        checked={fee.isActive}
                        onCheckedChange={(checked) => onUpdateFee(fee.id, { isActive: checked })}
                        // size="sm"
                      />
                      <span className={`text-sm ${fee.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {fee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className='py-3 px-4 text-[#002333]'>
                    {formatCurrency(calculateFeeImpact(fee))}
                    <span className='text-xs text-[#002333]/70 block'>per $1,000</span>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => onEditFee(fee)}
                        className='border-[#15949C] text-[#15949C] hover:bg-[#DEEFE7]'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='border-red-300 text-red-600 hover:bg-red-50 bg-transparent'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
