import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  DollarSign,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';

export default function ViewJobPostingOverview() {
  const skills = ['Writing', 'Design', 'Frontend', 'Backend', 'Research'];

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <Card className='border-0 shadow-sm'>
        <CardHeader className='pb-4'>
          {/* Job Meta Info */}
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-6 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <DollarSign className='w-4 h-4' />
                <span className='font-medium'>$50.00</span>
              </div>
              <div className='flex items-center gap-1'>
                <Calendar className='w-4 h-4' />
                <span>Created 5 days ago</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>Edit posting</DropdownMenuItem>
                <DropdownMenuItem>View analytics</DropdownMenuItem>
                <DropdownMenuItem>Close posting</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Job Title */}
          <h1 className='text-xl font-semibold text-gray-900 mb-4'>
            Market Survey Research Needed in Kaduna
          </h1>
        </CardHeader>

        <CardContent className='pt-0'>
          {/* Job Description */}
          <div className='mb-6'>
            <p className='text-gray-700 leading-relaxed'>
              We are seeking a skilled freelancer based in Kaduna to conduct a
              comprehensive market survey. Your task will involve gathering and
              analyzing data relevant to our target market. The ideal candidate
              should have excellent communication skills, attention to detail,
              experience in market research, and a strong understanding of local
              dynamics. If you are detail-oriented and capable of delivering
              actionable insights, we want to hear from you!
            </p>
          </div>

          {/* Skills and Expertise */}
          <div>
            <h3 className='font-medium text-gray-900 mb-3'>
              Skills and Expertise
            </h3>
            <div className='flex flex-wrap gap-2'>
              {skills.map((skill) => (
                <DropdownMenu key={skill}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 px-3 text-sm bg-gray-50 border-gray-200 hover:bg-gray-100'
                    >
                      {skill}
                      <ChevronDown className='w-3 h-3 ml-1' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View related jobs</DropdownMenuItem>
                    <DropdownMenuItem>Find freelancers</DropdownMenuItem>
                    <DropdownMenuItem>Remove skill</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
