import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  MoreHorizontal,
  DollarSign,
  Clock,
  CheckCircle,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Milestone, ProjectData } from '@/types';

const mockProjectData: ProjectData = {
  id: '1',
  title: 'Mobile App UI/UX design',
  freelancer: {
    name: 'John Doe',
    avatar: '/profile.jpeg',
    location: 'United states',
    timezone: '10:32 EST',
  },
  totalPayment: '$2,182.56',
  inEscrow: '$2,182.56',
  milestones: [
    {
      id: '1',
      name: 'Prototype',
      amount: '$450',
      status: 'in-escrow',
      icon: <Clock className='h-4 w-4 text-orange-500' />,
    },
    {
      id: '2',
      name: 'Design Mockup',
      amount: '$500',
      status: 'paid',
      icon: <CheckCircle className='h-4 w-4 text-green-500' />,
    },
    {
      id: '3',
      name: 'Concept Model',
      amount: '$600',
      status: 'paid',
      icon: <CheckCircle className='h-4 w-4 text-green-500' />,
    },
    {
      id: '4',
      name: 'Sample Design',
      amount: '$700',
      status: 'paid',
      icon: <CheckCircle className='h-4 w-4 text-green-500' />,
    },
  ],
};

function PaymentCard({
  title,
  amount,
  buttonText,
  buttonVariant,
  icon,
  borderColor,
}: {
  title: string;
  amount: string;
  buttonText: string;
  buttonVariant: 'default' | 'secondary';
  icon: React.ReactNode;
  borderColor: string;
}) {
  return (
    <Card className={`w-full border-l-4 ${borderColor} bg-white`}>
      <CardContent className='p-6'>
        <div className='flex items-center gap-3 mb-4'>
          {icon}
          <div>
            <p className='text-2xl font-bold text-gray-900'>{amount}</p>
            <p className='text-sm text-gray-500'>{title}</p>
          </div>
        </div>
        <Button
          className={`w-full ${
            buttonVariant === 'default'
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-gray-800 hover:bg-gray-900 text-white'
          }`}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className='px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'>
            Paid
          </span>
        );
      case 'in-escrow':
        return (
          <span className='px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700'>
            In Escrow
          </span>
        );
      case 'pending':
        return (
          <span className='px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className='flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0'>
      <div className='flex items-center gap-3'>
        {milestone.icon}
        <span className='text-gray-900 font-medium'>{milestone.name}</span>
      </div>
      <div className='flex items-center gap-4'>
        <span className='text-gray-900 font-medium'>{milestone.amount}</span>
        {getStatusBadge(milestone.status)}
      </div>
    </div>
  );
}

export function ActiveProjectManagement() {
  const project = mockProjectData;

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Project Title */}
      <h1 className='text-2xl font-bold text-gray-900 text-center mb-6'>
        {project.title}
      </h1>

      {/* Main Project Card */}
      <Card className='w-full bg-white shadow-sm'>
        <CardContent className='p-6'>
          {/* Project Header */}
          <div className='flex items-start justify-between mb-6'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
                  <User className='h-5 w-5 text-gray-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {project.freelancer.name}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {project.freelancer.location} {project.freelancer.timezone}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MessageCircle className='h-4 w-4' />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>View project details</DropdownMenuItem>
                  <DropdownMenuItem>Download files</DropdownMenuItem>
                  <DropdownMenuItem>Contact freelancer</DropdownMenuItem>
                  <DropdownMenuItem className='text-red-600'>
                    Cancel project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Payment Management Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
            <PaymentCard
              title='Total payment'
              amount={project.totalPayment}
              buttonText='Make payment to escrow'
              buttonVariant='default'
              icon={<DollarSign className='h-6 w-6 text-teal-600' />}
              borderColor='border-teal-500'
            />
            <PaymentCard
              title='In Escrow'
              amount={project.inEscrow}
              buttonText='Release payment'
              buttonVariant='secondary'
              icon={<Clock className='h-6 w-6 text-orange-500' />}
              borderColor='border-orange-500'
            />
          </div>

          {/* Payment Timeline */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Payment Timeline
            </h3>
            <div className='space-y-1'>
              {project.milestones.map((milestone) => (
                <MilestoneItem key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
