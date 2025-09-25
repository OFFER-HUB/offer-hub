import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User } from '@/interfaces/user.interface'

interface UserAnalyticsModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

export function UserAnalyticsModal({ user, open, onClose }: UserAnalyticsModalProps) {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }
  
    const formatPercentage = (value: number) => {
      const isPositive = value >= 0
      return (
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? '↗' : '↘'} {Math.abs(value)}% {isPositive ? 'Up from yesterday' : 'Down from last week'}
        </span>
      )
    }
  
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>View Analytics</DialogTitle>
          </DialogHeader>
          {user && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>Total Client</p>
                      <p className='text-2xl font-bold'>{user.analytics.totalClients}</p>
                      <p className='text-xs mt-1'>{formatPercentage(user.analytics.clientsChange)}</p>
                    </div>
                    <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <span className='text-blue-600 text-lg'>👥</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>Completed jobs</p>
                      <p className='text-2xl font-bold'>{user.analytics.completedJobs}</p>
                      <p className='text-xs mt-1'>{formatPercentage(user.analytics.jobsChange)}</p>
                    </div>
                    <div className='w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center'>
                      <span className='text-yellow-600 text-lg'>🏆</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>Total Payments</p>
                      <p className='text-2xl font-bold'>{formatCurrency(user.analytics.totalPayments)}</p>
                      <p className='text-xs mt-1'>{formatPercentage(user.analytics.paymentsChange)}</p>
                    </div>
                    <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                      <span className='text-green-600 text-lg'>💰</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>Profile view</p>
                      <p className='text-2xl font-bold'>{user.analytics.profileViews}</p>
                      <p className='text-xs mt-1'>{formatPercentage(user.analytics.viewsChange)}</p>
                    </div>
                    <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                      <span className='text-purple-600 text-lg'>👁️</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div className='flex justify-end gap-2 mt-6'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button className='bg-[#149A9B] hover:bg-[#108080] text-white'>View profile</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }