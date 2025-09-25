import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className='space-y-6 p-6 bg-[#DEEFE7]/10 min-h-screen'>
      {/* Header Skeleton */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <Skeleton className='h-8 w-64 mb-2 bg-gray-200' />
          <Skeleton className='h-4 w-96 bg-gray-200' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-24 bg-gray-200' />
          <Skeleton className='h-10 w-32 bg-gray-200' />
        </div>
      </div>

      {/* Key Metrics Cards Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='border-l-4 border-l-gray-200'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24 bg-gray-200' />
              <Skeleton className='h-4 w-4 rounded bg-gray-200' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-32 mb-2 bg-gray-200' />
              <Skeleton className='h-3 w-40 bg-gray-200' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className='space-y-6'>
        <Skeleton className='h-10 w-full bg-gray-200' />

        {/* Content Area Skeleton */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32 bg-gray-200' />
              <Skeleton className='h-4 w-48 bg-gray-200' />
            </CardHeader>
            <CardContent className='space-y-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='w-3 h-3 rounded-full bg-gray-200' />
                    <Skeleton className='h-4 w-24 bg-gray-200' />
                  </div>
                  <div className='text-right'>
                    <Skeleton className='h-4 w-20 mb-1 bg-gray-200' />
                    <Skeleton className='h-5 w-16 bg-gray-200' />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40 bg-gray-200' />
              <Skeleton className='h-4 w-56 bg-gray-200' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-4 bg-gray-50 rounded-lg'>
                  <Skeleton className='h-8 w-16 mx-auto mb-2 bg-gray-200' />
                  <Skeleton className='h-3 w-12 mx-auto bg-gray-200' />
                </div>
                <div className='text-center p-4 bg-gray-50 rounded-lg'>
                  <Skeleton className='h-8 w-16 mx-auto mb-2 bg-gray-200' />
                  <Skeleton className='h-3 w-12 mx-auto bg-gray-200' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
