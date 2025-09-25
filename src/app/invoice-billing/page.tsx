
import InvoiceTabs from '@/components/invoice-billing-system/invoice-tabs';

export default function HomePage() {
  return (
    <div className='min-h-screen bg-[#DEEFE7]/10'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-[#002333] mb-2'>Invoice & Billing System</h1>
          <p className='text-[#002333]/70 text-lg'>
Comprehensive Invoice and Billing System    
      </p>
        </div>

        <InvoiceTabs />
      </div>
    </div>
  )
}
