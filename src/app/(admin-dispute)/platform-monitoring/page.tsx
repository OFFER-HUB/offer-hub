'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformMonitoringTable from '@/components/platform-monitoring/platform-monitoring-page';
import SecurityAlertTable from '@/components/platform-monitoring/security-table';

export default function PlatformMonitoringPage() {
  return (
    <div className='flex flex-col h-full'>
      {/* Tabs header without container constraint for full-width border */}
      <div>
        <Tabs defaultValue='all-transactions' className='w-full'>
          <div className='overflow-x-auto'>
            <TabsList className='w-full justify-start rounded-none bg-white h-auto p-2 md:p-3 min-w-max'>
              <TabsTrigger
                value='all-transactions'
                className='text-black rounded-full px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm border-b-2 border-transparent data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white'
              >
                All transactions
              </TabsTrigger>
              <TabsTrigger
                value='security-alerts'
                className='text-black rounded-full px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm border-b-2 border-transparent data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white'
              >
                Security Alerts
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='w-full px-2 md:container md:mx-auto md:px-4 py-3 md:py-6'>
            <TabsContent value='all-transactions' className='m-0'>
              <PlatformMonitoringTable />
            </TabsContent>

            <TabsContent value='security-alerts' className='m-0'>
              <SecurityAlertTable />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
