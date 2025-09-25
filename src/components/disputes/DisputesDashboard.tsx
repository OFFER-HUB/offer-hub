import React from 'react';
import withErrorBoundary from '@/components/shared/WithErrorBoundary';
import DisputesList from './DisputesList';
import DisputesEmptyState from './DisputesEmptyState';
import StartDisputeButton from './StartDisputeButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dispute } from '@/types/dispute';


type DisputesDashboardProps = {
  disputes: Dispute[]
}
const DisputesDashboard = ({disputes}: DisputesDashboardProps ) => {
 
  return (
     <main className='size-full flex flex-col gap-9'>
        <header className='bg-white h-16 flex justify-center items-center px-12 py-[10px] text-center font-bold text-base text-primary border-b-[0.2px] border-primary'>
          Manage Project
        </header>
        <main className='w-[714px] h-auto bg-white py-8 px-8 flex flex-col gap-6 rounded-xl mx-auto'>
          <Tabs defaultValue='archived' className='w-full flex flex-col gap-8'>
            <TabsList className='grid w-full grid-cols-4 bg-[#002333] h-[58px] p-1 rounded-lg'>
              <TabsTrigger
                value='all'
                className='text-sm font-medium text-white data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:rounded-md py-2.5'
              >
                Active project
              </TabsTrigger>
              <TabsTrigger
                value='active'
                className='text-sm font-medium text-white data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:rounded-md py-2.5'
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value='closed'
                className='text-sm font-medium text-white data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:rounded-md py-2.5'
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value='archived'
                className='text-sm font-medium text-white data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:rounded-md py-2.5'
              >
                Dispute
              </TabsTrigger>
            </TabsList>
            <TabsContent value='all'>{/* Content for All tab */}</TabsContent>
            <TabsContent value='active'>
              {/* Content for Active tab */}
            </TabsContent>
            <TabsContent value='closed'>
              {/* Content for Closed tab */}
            </TabsContent>
            <TabsContent value='archived'>
              <main className='flex flex-col gap-5'>
                <StartDisputeButton />
                {disputes && disputes.length > 0 ? <DisputesList disputes={disputes} /> : <DisputesEmptyState />}
              </main>
            </TabsContent>
          </Tabs>
        </main>
      </main>
  );
};

export default withErrorBoundary(DisputesDashboard);
