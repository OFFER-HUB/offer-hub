import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-white'>
      <div className='text-center'>
        <Loader2 className='h-12 w-12 animate-spin text-[#15949C] mx-auto mb-4' />
        <h3 className='text-lg font-medium text-[#002333]'>Loading payment information...</h3>
        <p className='text-[#002333]/70'>Please wait while we fetch your financial data</p>
      </div>
    </div>
  )
}

