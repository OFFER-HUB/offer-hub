import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function Component() {
  const jobPostings = [
    {
      id: 1,
      title: 'Mobile App UI/UX design',
      author: 'John Doe',
      date: 'Jan 22, 2024 - present',
      description:
        'Hello! I came across your job posting for a market survey freelance in Kahuna, and I believe I would be a great fit for this role. With my extensive experience in market research and a solid grasp of local market dynamics, I\'m confident in my ability to deliver valuable insights for your project. I\'m genuinely committed to providing actionable insights that can help your business thrive. I would love the opportunity.',
      avatar: '/placeholder.svg?height=40&width=40&text=JD',
    },
    {
      id: 2,
      title: 'Mobile App UI/UX design',
      author: 'John Doe',
      date: 'Jan 22, 2024 - present',
      description:
        'Hello! I came across your job posting for a market survey freelance in Kahuna, and I believe I would be a great fit for this role. With my extensive experience in market research and a solid grasp of local market dynamics, I\'m confident in my ability to deliver valuable insights for your project. I\'m genuinely committed to providing actionable insights that can help your business thrive. I would love the opportunity.',
      avatar: '/placeholder.svg?height=40&width=40&text=JD',
    },
    {
      id: 3,
      title: 'Mobile App UI/UX design',
      author: 'John Doe',
      date: 'Jan 22, 2024 - present',
      description:
        'Hello! I came across your job posting for a market survey freelance in Kahuna, and I believe I would be a great fit for this role. With my extensive experience in market research and a solid grasp of local market dynamics, I\'m confident in my ability to deliver valuable insights for your project. I\'m genuinely committed to providing actionable insights that can help your business thrive. I would love the opportunity.',
      avatar: '/placeholder.svg?height=40&width=40&text=JD',
    },
  ];

  return (
    <div className='max-w-md mx-auto bg-white'>
      {/* Job Postings List */}
      <div className='space-y-4 p-4'>
        {jobPostings.map((job) => (
          <Card key={job.id} className='p-4 shadow-sm border border-gray-200'>
            <div className='flex items-start justify-between mb-3'>
              <h3 className='font-semibold text-gray-900'>{job.title}</h3>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                <MoreHorizontal className='h-4 w-4 text-gray-400' />
              </Button>
            </div>

            <div className='flex items-center gap-3 mb-3'>
              <Avatar className='h-8 w-8'>
                <AvatarImage
                  src={job.avatar || '/placeholder.svg'}
                  alt={job.author}
                />
                <AvatarFallback className='text-xs'>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className='font-medium text-sm text-gray-900'>
                  {job.author}
                </p>
                <p className='text-xs text-gray-500'>{job.date}</p>
              </div>
            </div>

            <p className='text-sm text-gray-600 leading-relaxed mb-4'>
              {job.description}
            </p>

            <Link href='/onboarding/dashboard/view-job'>
              <Button className='w-full bg-slate-700 hover:bg-slate-800 text-white'>
                Hire
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
