import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function RevenueSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <Skeleton className='h-8 w-48 mb-2 bg-gray-200' />
          <Skeleton className='h-4 w-72 bg-gray-200' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-32 bg-gray-200' />
          <Skeleton className='h-10 w-40 bg-gray-200' />
          <Skeleton className='h-10 w-24 bg-gray-200' />
        </div>
      </div>

      {/* Revenue Trend Chart Skeleton */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-5 bg-gray-200' />
            <Skeleton className='h-6 w-32 bg-gray-200' />
          </div>
          <Skeleton className='h-4 w-64 bg-gray-200' />
        </CardHeader>
        <CardContent>
          <div className='h-80 flex items-end justify-between gap-2 px-4'>
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} className='w-2 bg-gray-200' style={{ height: `${Math.random() * 200 + 50}px` }} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution and Summary Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-40 bg-gray-200' />
            <Skeleton className='h-4 w-48 bg-gray-200' />
          </CardHeader>
          <CardContent>
            <div className='flex justify-center mb-4'>
              <Skeleton className='h-48 w-48 rounded-full bg-gray-200' />
            </div>
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='w-3 h-3 rounded-full bg-gray-200' />
                    <Skeleton className='h-4 w-24 bg-gray-200' />
                  </div>
                  <Skeleton className='h-4 w-20 bg-gray-200' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-36 bg-gray-200' />
            <Skeleton className='h-4 w-64 bg-gray-200' />
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-4 bg-gray-50 rounded-lg'>
                <Skeleton className='h-8 w-24 mx-auto mb-2 bg-gray-200' />
                <Skeleton className='h-3 w-20 mx-auto bg-gray-200' />
              </div>
              <div className='text-center p-4 bg-gray-50 rounded-lg'>
                <Skeleton className='h-8 w-24 mx-auto mb-2 bg-gray-200' />
                <Skeleton className='h-3 w-20 mx-auto bg-gray-200' />
              </div>
            </div>
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex justify-between items-center'>
                  <Skeleton className='h-4 w-32 bg-gray-200' />
                  <Skeleton className='h-4 w-16 bg-gray-200' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Streams Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-44 bg-gray-200' />
          <Skeleton className='h-4 w-72 bg-gray-200' />
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between p-3 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-4 w-4 rounded bg-gray-200' />
                  <Skeleton className='h-4 w-32 bg-gray-200' />
                </div>
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-4 w-20 bg-gray-200' />
                  <Skeleton className='h-6 w-16 rounded-full bg-gray-200' />
                  <Skeleton className='h-4 w-24 bg-gray-200' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
