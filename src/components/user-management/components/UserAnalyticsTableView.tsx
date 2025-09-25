import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from '@/interfaces/user.interface'
import { Copy, MoreHorizontal } from 'lucide-react'

export function UserAnalyticsTableView({ data, onViewAnalytics, onOverflowAction }: {
    data: User[],
    onViewAnalytics: (user: User) => void,
    onOverflowAction: (action: string, userId: number) => void
  }) {
    return (
      <div className='hidden md:block rounded-md overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead className='bg-[#F9FAFB]'>
              <tr className='border-b border-[#f9fbfa] bg-[#F9FAFB] mb-2 p-3'>
                <th className='text-left py-3 px-4 font-medium text-black text-sm'>Customer Name</th>
                <th className='text-left py-3 px-4 font-medium text-black text-sm'>Email</th>
                <th className='text-left py-3 px-4 font-medium text-black text-sm'>Location</th>
                <th className='text-left py-3 px-4 font-medium text-black text-sm'>User ID</th>
                <th className='text-left py-3 px-4 font-medium text-black text-sm'>Date Joined</th>
                <th className='text-left py-3 px-4 font-medium text-black text-sm'>Action</th>
              </tr>
            </thead>
            <tbody className='bg-[#fffefe]'>
              {data.map((user) => (
                <tr key={user.id} className='hover:bg-gray-50'>
                  <td className='py-3 px-4 text-sm'>{user.name}</td>
                  <td className='py-3 px-4 text-sm'>
                    <span className='text-blue-600'>Validated</span>
                  </td>
                  <td className='py-3 px-4 text-sm'>{user.location}</td>
                  <td className='py-3 px-4 text-sm'>
                    <div className='flex items-center gap-2'>
                      <span className='text-blue-600'>{user.id}</span>
                      <button className='text-gray-400 hover:text-gray-600'>
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className='py-3 px-4 text-sm whitespace-nowrap'>
                    {new Date(user.submissionDate).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: '2-digit',
                    })}
                  </td>
                  <td className='py-3 px-4 text-sm'>
                    <div className='flex items-center gap-4'>
                      <button className='text-blue-600 hover:underline' onClick={() => onViewAnalytics(user)}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }