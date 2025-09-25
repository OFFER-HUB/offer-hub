// Admin Financial Management Page - Main entry point for financial system
// Integrates all financial management components into a cohesive interface

import FinancialDashboard from '@/components/admin/financial/financial-dashboard'

export default function AdminFinancialPage() {
  return (
    <div className='min-h-screen bg-[#DEEFE7]/10'>
      <FinancialDashboard />
    </div>
  )
}
