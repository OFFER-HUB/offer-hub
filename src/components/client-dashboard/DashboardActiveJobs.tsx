import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Users, Clock, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import Link from 'next/link';

interface JobPost {
  id: string;
  title: string;
  createdAt: string;
  invited: number;
  inProgress: number;
  hired: number;
}

const mockJobs: JobPost[] = [
  {
    id: '1',
    title: 'Market survey research needed for urgent work',
    createdAt: 'Created 5 days ago',
    invited: 15,
    inProgress: 10,
    hired: 0,
  },
  {
    id: '2',
    title: 'Market survey research needed for urgent work',
    createdAt: 'Created 5 days ago',
    invited: 15,
    inProgress: 10,
    hired: 0,
  },
  {
    id: '3',
    title: 'Market survey research needed for urgent work',
    createdAt: 'Created 5 days ago',
    invited: 15,
    inProgress: 10,
    hired: 0,
  },
];

function JobCard({ job }: { job: JobPost }) {
  return (
    <Card className='w-full'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900 flex-1 pr-4'>
            {job.title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>Edit job</DropdownMenuItem>
              <DropdownMenuItem>View applications</DropdownMenuItem>
              <DropdownMenuItem>Pause job</DropdownMenuItem>
              <DropdownMenuItem className='text-red-600'>
                Delete job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Open job post button and created date */}
        <div className='flex items-center justify-between mb-4'>
          <Button className='bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm'>
            Open job post
          </Button>
          <span className='text-sm text-gray-500'>{job.createdAt}</span>
        </div>

        <div className='flex items-center gap-3 mb-4'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm'>
              <Users className='h-3 w-3' />
              <span className='font-medium'>Invited</span>
              <span className='font-semibold'>{job.invited}</span>
            </div>
          </div>

          <div className='flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm'>
            <Clock className='h-3 w-3' />
            <span className='font-medium'>In Progress</span>
            <span className='font-semibold'>{job.inProgress}</span>
          </div>

          <div className='flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm'>
            <UserCheck className='h-3 w-3' />
            <span className='font-medium'>Hired</span>
            <span className='font-semibold'>{job.hired}</span>
          </div>
        </div>

        <Link href='/onboarding/dashboard/job'>
          <Button className='w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-full'>
            Search talents
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function DashboardActiveJobs() {
  return (
    <div className='p-8 space-y-6'>
      {mockJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
