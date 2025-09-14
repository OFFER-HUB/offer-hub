import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export function DashboardEmptyState() {
  return (
    <div className='flex flex-1 items-center justify-center p-6'>
      <Card className='w-full max-w-2xl'>
        <CardContent className='flex flex-col items-center justify-center py-16 px-8'>
          <div className='text-center space-y-6'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              No job post or contract in progress
            </h2>
            <Button className='bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full'>
              <Plus className='w-4 h-4 mr-2' />
              Post Job
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
