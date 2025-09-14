import MetricCard from '@/components/admin/components/MetricCard';

import { BarChart3Icon, BoxIcon, UsersIcon } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
    
    <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-3'>
      <MetricCard
        title='Total User'
        value='40,689'
        change={8.5}
        timeframe='from yesterday'
        icon={<UsersIcon className='h-6 w-6' />}
        iconColor='bg-purple-100 text-purple-500'
      />

      <MetricCard
        title='Total Jobs'
        value='10293'
        change={1.3}
        timeframe='from past week'
        icon={<BoxIcon className='h-6 w-6' />}
        iconColor='bg-amber-100 text-amber-500'
      />

      <MetricCard
        title='Total Payments'
        value='$89,000'
        change={-5.3}
        timeframe='from last week'
        icon={<BarChart3Icon className='h-6 w-6' />}
        iconColor='bg-green-100 text-green-500'
      />
    </div>

   
    </>
  );
}
