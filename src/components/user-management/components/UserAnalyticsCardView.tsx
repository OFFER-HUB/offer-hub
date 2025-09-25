import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from '@/interfaces/user.interface'
import { Copy, MoreHorizontal } from 'lucide-react'

interface UserAnalyticsCardViewProps {
  data: User[];
  onViewAnalytics: (user: User) => void;
  onOverflowAction: (action: string, userId: number) => void;
}

export function UserAnalyticsCardView({ data, onViewAnalytics, onOverflowAction }: UserAnalyticsCardViewProps) {
    return (
      <div className='md:hidden space-y-4'>
        {data.map((user) => (
          <div key={user.id} className='bg-white rounded-lg shadow p-4 border border-gray-100'>
            <div className='flex justify-between items-start mb-3'>
              <h3 className='font-medium'>{user.name}</h3>
              <span className='text-blue-600 text-sm'>Validated</span>
            </div>
  
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Email:</span>
                <span>{user.email}</span>
              </div>
  
              <div className='flex justify-between'>
                <span className='text-gray-500'>Location:</span>
                <span>{user.location}</span>
              </div>
  
              <div className='flex justify-between'>
                <span className='text-gray-500'>User ID:</span>
                <div className='flex items-center gap-2'>
                  <span className='text-blue-600'>{user.id}</span>
                  <button className='text-gray-400 hover:text-gray-600'>
                    <Copy size={14} />
                  </button>
                </div>
              </div>
  
              <div className='flex justify-between'>
                <span className='text-gray-500'>Date Joined:</span>
                <span>
                  {new Date(user.submissionDate).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: '2-digit',
                  })}
                </span>
              </div>
            </div>
  
            <div className='mt-4 pt-3 border-t border-gray-100 flex justify-between items-center'>
              <button className='text-blue-600 hover:underline text-sm' onClick={() => onViewAnalytics(user)}>
                View Analytics
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='focus:outline-none'>
                    <MoreHorizontal size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onOverflowAction('view', user.id)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onOverflowAction('export', user.id)}>
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onOverflowAction('contact', user.id)}>
                    Contact User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    )
  }